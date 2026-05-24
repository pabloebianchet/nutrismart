import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import vision from "@google-cloud/vision";
import OpenAI from "openai";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { connectDB } from "./db.js";
import User from "./models/User.js";
import Analysis from "./models/Analysis.js";
import adminRoutes from "./routes/admin.js";
import authEmailRoutes from "./routes/authEmail.js";
import paymentsRouter from "./routes/payments.js";
import { authMiddleware } from "./middleware/auth.js";
import Subscription from "./models/Subscription.js";
import { sendWelcomeEmail } from "./utils/sendWelcomeEmail.js";
import { sendContactEmail } from "./utils/sendContactEmail.js";

connectDB();

function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/[*_#>`~]/g, "") // elimina markdown básico
    .replace(/-{2,}/g, "") // elimina separadores tipo ----
    .replace(/\n{3,}/g, "\n\n") // normaliza saltos de línea
    .replace(/\s+\n/g, "\n") // espacios antes de saltos
    .trim();
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Falta GOOGLE_CLIENT_ID en .env");
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();

// ── Seguridad básica de headers ──────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false, // Google Sign-In popup necesita postMessage
}));

// ── Rate limiting global ─────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intentá en 15 minutos." },
});
app.use(globalLimiter);

// Rate limit específico para análisis (costoso en OpenAI)
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,
  message: { error: "Límite de análisis por minuto alcanzado." },
});
app.use("/api/analyze", analyzeLimiter);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nutrismart-orcin.vercel.app",
      "https://nutrismart-lu7u7x32m-pablo-bianchet-martinez-projects.vercel.app",
      "https://nuiapp.com",
      "https://www.nuiapp.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

// =====================
// 🔐 GOOGLE VISION
// =====================
if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
  throw new Error("Falta GOOGLE_CREDENTIALS_BASE64 en .env");
}

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf8"),
);

const visionClient = new vision.ImageAnnotatorClient({ credentials });

// =====================
// 🔐 OPENAI
// =====================
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Falta OPENAI_API_KEY en .env");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =====================
// 📦 MULTER
// =====================
const upload = multer({ storage: multer.memoryStorage() });

// =====================
// 🧠 OCR ENDPOINT
// =====================
app.post(
  "/api/ocr",
  upload.fields([
    { name: "tabla", maxCount: 1 },
    { name: "ingredientes", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const tabla = req.files?.tabla?.[0];
      const ingredientes = req.files?.ingredientes?.[0];

      if (!tabla || !ingredientes) {
        return res.status(400).json({ error: "Faltan imágenes" });
      }

      const [tablaResult] = await visionClient.textDetection(tabla.buffer);

      const [ingredientesResult] = await visionClient.textDetection(
        ingredientes.buffer,
      );

      const tablaText = tablaResult.textAnnotations?.[0]?.description || "";

      const ingredientesText =
        ingredientesResult.textAnnotations?.[0]?.description || "";

      return res.json({
        text: `${tablaText}\n\n${ingredientesText}`,
      });
    } catch (err) {
      console.error("OCR error:", err);
      return res.status(500).json({ error: "Error en OCR" });
    }
  },
);

// =====================
// 🤖 ANALYZE ENDPOINT
// =====================
app.post("/api/analyze", async (req, res) => {
  try {
    const { userData, productText, googleId, userId } = req.body;

    if (!userData || !productText) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // ── Control de límites por plan ──────────────────────────
    const identifier = userId || googleId;
    const isObjId = identifier && /^[a-f\d]{24}$/i.test(identifier);
    const authUser = identifier
      ? isObjId ? await User.findById(identifier) : await User.findOne({ googleId: identifier })
      : null;

    if (authUser) {
      const sub = await Subscription.findOne({ user: authUser._id, status: "active" });

      if (!sub) {
        // Sin suscripción: máximo 3 análisis de prueba en total
        const total = await Analysis.countDocuments({ user: authUser._id });
        if (total >= 3) {
          return res.status(403).json({
            error: "trial_limit_reached",
            message: "Alcanzaste el límite de 3 análisis gratuitos. Elegí un plan para continuar.",
          });
        }
      } else if (sub.plan === "silver") {
        // Silver: 1 análisis por día
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayCount = await Analysis.countDocuments({ user: authUser._id, createdAt: { $gte: today } });
        if (todayCount >= 1) {
          return res.status(403).json({
            error: "daily_limit_reached",
            message: "Alcanzaste el límite diario del Plan Silver (1 análisis por día). Tu límite se renueva mañana.",
          });
        }
      }
      // Gold: sin límite
    }

    const prompt = `
Rol:
Sos un nutricionista con formación en alimentación saludable basada en guías europeas
(OMS Europa, EFSA, dieta mediterránea). Brindás información orientativa, no clínica.

Contexto:
Estás escribiendo el resultado que va a leer un usuario dentro de una app.
No es un informe técnico ni una respuesta de chat.

Datos del usuario:
Sexo: ${userData.sexo}
Edad: ${userData.edad}
Nivel de actividad física: ${userData.actividad}
Peso: ${userData.peso} kg
Altura: ${userData.altura} cm

Producto analizado:
${productText}

IMPORTANTE:
Nunca presentes la respuesta como diagnóstico, tratamiento ni recomendación médica personalizada.
Usá siempre un tono informativo y orientativo, basado en guías generales.

VALIDACIÓN OBLIGATORIA ANTES DE ANALIZAR:

Solo podés analizar el producto si el texto contiene información nutricional verificable.

Esto incluye al menos uno de los siguientes:
- lista de ingredientes
- tabla nutricional (calorías, grasas, azúcares, proteínas, sodio, etc.)

Si el texto NO contiene este tipo de información (por ejemplo: nombres de alimentos sueltos como frutas o verduras, descripciones visuales, objetos, partes del cuerpo, texto ambiguo o generado a partir de imágenes sin datos nutricionales claros):
- No realices análisis nutricional
- No asignes puntaje
- No clasifiques el producto

En ese caso, respondé únicamente con:
No hay información nutricional suficiente para realizar un análisis.

REGLA CRÍTICA:
No infieras ingredientes ni valores nutricionales.
No asumas composición de alimentos.
Si la información no está explícitamente presente en el texto, no debe ser considerada.

CRITERIO NUTRICIONAL OBLIGATORIO (solo si hay datos válidos):

- Evaluá el nivel de procesamiento (no procesado, procesado, ultraprocesado).
- Considerá calidad de ingredientes, presencia de aditivos, azúcares, sodio y perfil general.
- No penalices automáticamente productos sin razón clara basada en los datos disponibles.

REGLAS OBLIGATORIAS (si no se cumplen, la respuesta es incorrecta):
- No uses markdown.
- No uses títulos, subtítulos, listas, viñetas ni numeraciones.
- No uses asteriscos, símbolos especiales ni emojis.
- No hagas introducciones largas.
- No expliques procesos ni pasos.
- No repitas los datos del usuario.
- No escribas más de 120 palabras en total.

FORMATO OBLIGATORIO DE LA RESPUESTA (solo si es un producto válido):

Primero, una frase corta que indique claramente:
- si el producto es ultraprocesado, procesado o no procesado
- si encaja o no dentro de un consumo habitual según guías generales

Luego, en una línea separada, escribí exactamente:
Puntaje global: XX / 100

Después, un breve párrafo (máximo 3 líneas) explicando el motivo principal del puntaje.

Por último, una orientación práctica y general sobre cómo podría encajar este producto dentro de una alimentación equilibrada, sin prescribir ni prohibir.

ESTILO:
Natural, claro, humano y directo, como una nota breve dentro de una app de nutrición.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Respondé SOLO en texto plano. No uses markdown, listas, títulos, asteriscos, emojis ni símbolos especiales.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const rawAnalysis =
      completion.choices?.[0]?.message?.content ??
      "No se pudo generar análisis";

    // 🔥 LIMPIEZA CLAVE
    const analysis = cleanText(rawAnalysis);

    // Extraer puntaje (ya sobre texto limpio)
    const match = analysis.match(/Puntaje global:\s*(\d+)\s*\/\s*100/i);

    const score = match ? parseInt(match[1], 10) : 0;

    if (!authUser) {
      return res.status(404).json({
        error: "User not found. Analysis was not saved.",
      });
    }

    await Analysis.create({
      user: authUser._id,
      score,
      analysisText: analysis,
      productText,
    });

    // Puntos saludables
    let pointsEarned = 0;
    let pointsLost   = 0;
    let totalPoints  = authUser.healthyPoints ?? 0;

    if (score >= 50) {
      // ≥ 50 → suma 5 puntos
      pointsEarned = 5;
      const updated = await User.findByIdAndUpdate(
        authUser._id,
        { $inc: { healthyPoints: 5 } },
        { new: true },
      );
      totalPoints = updated.healthyPoints;
    } else if (score > 0) {
      // < 50 (y análisis válido) → resta 3 puntos, mínimo 0
      const current   = authUser.healthyPoints ?? 0;
      const deduction = Math.min(3, current);
      if (deduction > 0) {
        pointsLost = deduction;
        const updated = await User.findByIdAndUpdate(
          authUser._id,
          { $inc: { healthyPoints: -deduction } },
          { new: true },
        );
        totalPoints = updated.healthyPoints;
      }
    }

    return res.json({
      score,
      analysis,
      pointsEarned,
      pointsLost,
      totalPoints,
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ error: "Error en análisis IA" });
  }
});

// =====================
// 🔐 GOOGLE AUTH
// =====================
app.post("/api/auth/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Missing Google credential" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        picture,
      });
      // Email de bienvenida solo en el primer registro
      sendWelcomeEmail({ name, email }).catch((e) => console.error("Welcome email failed:", e.message));
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ user, token });
  } catch (err) {
    console.error("Google auth error details:", {
      message: err?.message,
      name: err?.name,
      mongoReady: (await import("mongoose").then(m => m.default.connection.readyState)) === 1,
    });
    return res.status(401).json({ error: "Invalid Google token" });
  }
});

// =====================
// 👤 UPDATE USER PROFILE
// =====================
app.put("/api/user/profile", async (req, res) => {
  const { googleId, userId, sexo, edad, actividad, peso, altura } = req.body;

  const identifier = userId || googleId;
  if (!identifier) {
    return res.status(400).json({ error: "Missing user identifier" });
  }

  try {
    const isObjectId = /^[a-f\d]{24}$/i.test(identifier);
    const filter = isObjectId ? { _id: identifier } : { googleId: identifier };

    const user = await User.findOneAndUpdate(
      filter,
      { sexo, edad, actividad, peso, altura, profileCompleted: true },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ error: "Error updating profile" });
  }
});

// =====================
// 👤 GET USER PROFILE
// =====================
app.get("/api/user/profile/:identifier", authMiddleware, async (req, res) => {
  const { identifier } = req.params;

  try {
    const isObjectId = /^[a-f\d]{24}$/i.test(identifier);
    const requestedId = isObjectId ? identifier : null;
    const requestedGoogleId = !isObjectId ? identifier : null;

    // Solo puede ver su propio perfil
    const isSelf =
      (requestedId && req.user._id.toString() === requestedId) ||
      (requestedGoogleId && req.user.googleId === requestedGoogleId);

    if (!isSelf) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await User.findById(req.user._id).select("-password -resetPasswordToken");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ error: "Error fetching profile" });
  }
});

// =====================
// 🏆 LEADERBOARD
// =====================
app.get("/api/leaderboard", authMiddleware, async (req, res) => {
  try {
    const topTen = await User.find({ healthyPoints: { $gt: 0 } })
      .sort({ healthyPoints: -1 })
      .limit(10)
      .select("name picture healthyPoints");

    const userPoints = req.user.healthyPoints ?? 0;
    const betterCount = await User.countDocuments({ healthyPoints: { $gt: userPoints } });
    const userRank = betterCount + 1;

    const mapped = topTen.map((u, i) => ({
      rank: i + 1,
      _id: u._id.toString(),
      name: u.name,
      picture: u.picture || null,
      healthyPoints: u.healthyPoints ?? 0,
      isCurrentUser: u._id.toString() === req.user._id.toString(),
    }));

    const isInTopTen = mapped.some((u) => u.isCurrentUser);

    return res.json({
      topTen: mapped,
      currentUser: isInTopTen
        ? null
        : {
            rank: userRank,
            _id: req.user._id.toString(),
            name: req.user.name,
            picture: req.user.picture || null,
            healthyPoints: userPoints,
            isCurrentUser: true,
          },
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ error: "Error al cargar el ranking" });
  }
});

// =====================
// 🚀 START SERVER
// =====================
const PORT = process.env.PORT || 3001;

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authEmailRoutes);
app.use("/api/payments", paymentsRouter);

// Redirige al frontend después del pago — MP no acepta localhost en back_url
app.get("/payment/return", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendUrl}/subscription/success`);
});

// =====================
// 📬 CONTACT FORM
// =====================
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { error: "Demasiados mensajes enviados. Intentá de nuevo en una hora." },
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "El email no es válido." });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ error: "El mensaje es demasiado corto." });
  }

  try {
    await sendContactEmail({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Contact email error:", err.message);
    return res.status(500).json({ error: "No se pudo enviar el mensaje. Intentá de nuevo más tarde." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});

// =====================
// 📊 USER ANALYSIS HISTORY
// =====================
app.get("/api/user/analysis/:identifier", authMiddleware, async (req, res) => {
  try {
    // Solo puede ver su propio historial
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await Analysis.find({
      user: req.user._id,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: -1 });

    return res.json({ history });
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json({ error: "Error fetching history" });
  }
});

// =====================
// 🗑️ DELETE ANALYSIS
// =====================
app.delete("/api/user/analysis/:analysisId", authMiddleware, async (req, res) => {
  const { analysisId } = req.params;

  try {
    const analysis = await Analysis.findById(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await analysis.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete analysis error:", err);
    return res.status(500).json({ error: "Error deleting analysis" });
  }
});
