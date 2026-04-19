import dotenv from "dotenv";
dotenv.config(); // ✅ PRIMERO
import express from "express";
import cors from "cors";
import multer from "multer";
import vision from "@google-cloud/vision";
import OpenAI from "openai";
import { OAuth2Client } from "google-auth-library";
import { connectDB } from "./db.js";
import User from "./models/User.js";
import Analysis from "./models/Analysis.js";
import adminRoutes from "./routes/admin.js";

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
    const { userData, productText, googleId } = req.body;

    if (!userData || !productText) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
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

    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({
        error: "User not found. Analysis was not saved.",
      });
    }

    await Analysis.create({
      user: user._id,
      score,
      analysisText: analysis,
      productText,
    });

    return res.json({
      score,
      analysis,
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
    }

    return res.json({ user });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ error: "Invalid Google token" });
  }
});

// =====================
// 👤 UPDATE USER PROFILE
// =====================
app.put("/api/user/profile", async (req, res) => {
  const { googleId, sexo, edad, actividad, peso, altura } = req.body;

  if (!googleId) {
    return res.status(400).json({ error: "Missing googleId" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { googleId },
      {
        sexo,
        edad,
        actividad,
        peso,
        altura,
        profileCompleted: true, // 🔥 CLAVE
      },
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
app.get("/api/user/profile/:googleId", async (req, res) => {
  const { googleId } = req.params;

  try {
    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ error: "Error fetching profile" });
  }
});

// =====================
// 🚀 START SERVER
// =====================
const PORT = process.env.PORT || 3001;

app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});

// =====================
// 📊 USER ANALYSIS HISTORY
// =====================
app.get("/api/user/analysis/:googleId", async (req, res) => {
  const { googleId } = req.params;

  try {
    const user = await User.findOne({ googleId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await Analysis.find({
      user: user._id,
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
app.delete("/api/user/analysis/:analysisId", async (req, res) => {
  const { analysisId } = req.params;

  try {
    const analysis = await Analysis.findByIdAndDelete(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete analysis error:", err);
    return res.status(500).json({ error: "Error deleting analysis" });
  }
});
