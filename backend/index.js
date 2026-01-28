import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import vision from "@google-cloud/vision";
import OpenAI from "openai";


function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/[*_#>`~]/g, "")          // elimina markdown básico
    .replace(/-{2,}/g, "")             // elimina separadores tipo ----
    .replace(/\n{3,}/g, "\n\n")        // normaliza saltos de línea
    .replace(/\s+\n/g, "\n")           // espacios antes de saltos
    .trim();
}


dotenv.config();

import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nutrismart-orcin.vercel.app/"
    ],
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "2mb" }));

// =====================
// 🔐 GOOGLE VISION
// =====================
if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
  throw new Error("Falta GOOGLE_CREDENTIALS_BASE64 en .env");
}

const credentials = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_CREDENTIALS_BASE64,
    "base64"
  ).toString("utf8")
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

      const [tablaResult] = await visionClient.textDetection(
        tabla.buffer
      );

      const [ingredientesResult] =
        await visionClient.textDetection(
          ingredientes.buffer
        );

      const tablaText =
        tablaResult.textAnnotations?.[0]?.description || "";

      const ingredientesText =
        ingredientesResult.textAnnotations?.[0]?.description || "";

      return res.json({
        text: `${tablaText}\n\n${ingredientesText}`,
      });
    } catch (err) {
      console.error("OCR error:", err);
      return res.status(500).json({ error: "Error en OCR" });
    }
  }
);

// =====================
// 🤖 ANALYZE ENDPOINT
// =====================
app.post("/api/analyze", async (req, res) => {
  try {
    const { userData, productText } = req.body;

    if (!userData || !productText) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const prompt = `
Rol:
Sos un nutricionista experto en alimentación saludable, con formación basada en guías europeas
(OMS Europa, EFSA, dieta mediterránea).

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

REGLAS OBLIGATORIAS (si no se cumplen, la respuesta es incorrecta):

- NO uses markdown.
- NO uses títulos, subtítulos, listas, viñetas ni numeraciones.
- NO uses asteriscos, símbolos especiales ni emojis.
- NO hagas introducciones largas.
- NO expliques paso a paso.
- NO repitas los datos del usuario.
- NO escribas más de 120 palabras en total.

FORMATO OBLIGATORIO DE LA RESPUESTA:

Primero, una frase corta que indique claramente:
- si el producto es ultraprocesado, procesado o no procesado
- si es o no recomendable para consumo habitual

Luego, en una línea separada, escribí EXACTAMENTE:
Puntaje global: XX / 100

Después, un breve párrafo (máximo 3 líneas) explicando el motivo principal del puntaje.

Por último, una recomendación práctica y concreta para el usuario.

ESTILO:
- natural
- claro
- humano
- directo
- como una nota breve dentro de una app de nutrición
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
const match = analysis.match(
  /Puntaje global:\s*(\d+)\s*\/\s*100/i
);

const score = match ? parseInt(match[1], 10) : 0;

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
// 🚀 START SERVER
// =====================
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});
