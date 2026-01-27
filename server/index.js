import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import formidable from "formidable";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const createVisionClient = () => {
  const encodedCredentials = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (!encodedCredentials) {
    throw new Error("Falta GOOGLE_CREDENTIALS_BASE64 en el entorno.");
  }

  const credentials = JSON.parse(
    Buffer.from(encodedCredentials, "base64").toString("utf8")
  );

  return new ImageAnnotatorClient({ credentials });
};

let visionClient;

const getVisionClient = () => {
  if (!visionClient) {
    visionClient = createVisionClient();
  }
  return visionClient;
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });

app.post("/api/ocr", async (req, res) => {
  try {
    const { files } = await parseForm(req);
    const tablaFile = files.tabla?.[0] || files.tabla;
    const ingredientesFile = files.ingredientes?.[0] || files.ingredientes;

    if (!tablaFile || !ingredientesFile) {
      return res.status(400).json({ error: "Faltan archivos" });
    }

    const client = getVisionClient();
    const [tablaResult] = await client.textDetection(tablaFile.filepath);
    const [ingredientesResult] = await client.textDetection(
      ingredientesFile.filepath
    );

    const tablaText = tablaResult.textAnnotations?.[0]?.description || "";
    const ingredientesText =
      ingredientesResult.textAnnotations?.[0]?.description || "";

    const fullText = `${tablaText}\n\n${ingredientesText}`;
    return res.status(200).json({ text: fullText });
  } catch (error) {
    console.error("OCR error:", error);
    return res.status(500).json({ error: "Fallo en el OCR con Google Vision" });
  }
});

app.post("/api/analyze", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const { userData, productText } = req.body;

  if (!userData || !productText) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Falta OPENAI_API_KEY en el entorno" });
  }

  const prompt = `
Rol:

Actuá como un nutricionista experto en alimentación saludable, con formación avanzada y actualización continua basada en evidencia científica y guías nutricionales europeas (EFSA, OMS Europa, dieta mediterránea).

1️⃣ Recolección de datos del usuario:
Sexo: ${userData.sexo}
Edad: ${userData.edad}
Nivel de actividad física: ${userData.actividad}
Peso: ${userData.peso} kg
Altura: ${userData.altura} cm

2️⃣ Producto recibido (ingredientes + tabla nutricional):
${productText}

3️⃣ Metodología de evaluación:
- Nivel de procesamiento (clasificación tipo NOVA)
- Calidad y origen de los ingredientes
- Perfil nutricional: sodio, grasas totales y saturadas, azúcares, proteínas, fibra
- Uso de aditivos, conservantes o aromatizantes
- Adecuación a una dieta equilibrada y al perfil del usuario

4️⃣ Sistema de puntuación (de 0 a 100):
🥗 Calidad de ingredientes: 30%
🏭 Nivel de procesamiento: 20%
📊 Perfil nutricional: 40%
👤 Adecuación al perfil del usuario: 10%

5️⃣ Formato de salida:
A. Clasificación: ¿Ultraprocesado? Sí / No + Categoría
B. Puntaje global: XX / 100
C. Interpretación: frecuencia recomendada y contexto ideal de consumo

6️⃣ Escala:
90–100 → Muy recomendable
75–89 → Recomendable
60–74 → Aceptable
45–59 → Poco recomendable
<45 → No recomendable

✅ Resultado:
Devolvé un análisis objetivo, sin prejuicios ni alarmismo, comprensible para usuarios no expertos. Que pueda mostrarse como barra de progreso, semáforo nutricional o texto.

`;

  try {
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Sos un nutricionista experto." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!completion.ok) {
      const errorText = await completion.text();
      console.error("OpenAI error:", errorText);
      return res
        .status(500)
        .json({ error: "Error al generar análisis" });
    }

    const data = await completion.json();

    const analysis =
      data.choices?.[0]?.message?.content || "No se obtuvo respuesta";

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    return res.status(500).json({ error: "Error al generar análisis" });
  }
});

const distPath = path.resolve(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});
