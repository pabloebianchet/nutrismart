import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import vision from "@google-cloud/vision";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
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
Actuá como un nutricionista experto basado en guías europeas.

Usuario:
- Sexo: ${userData.sexo}
- Edad: ${userData.edad}
- Actividad: ${userData.actividad}
- Peso: ${userData.peso} kg
- Altura: ${userData.altura} cm

Producto:
${productText}

Evaluá y devolvé un análisis claro.
Terminá con:
Puntaje global: XX / 100
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: "Sos un nutricionista clínico." },
        { role: "user", content: prompt },
      ],
    });

    const analysis =
      completion.choices?.[0]?.message?.content ??
      "No se pudo generar análisis";

    const match = analysis.match(
      /Puntaje global:\s*(\d+)\s*\/\s*100/i
    );

    const score = match ? parseInt(match[1], 10) : 0;

    return res.json({ score, analysis });
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
