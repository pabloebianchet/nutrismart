const { setGlobalOptions } = require("firebase-functions");
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const formidable = require("formidable");
const fs = require("fs");
require("dotenv").config(); // 👈 Importante para cargar .env

const vision = require("@google-cloud/vision");

setGlobalOptions({ maxInstances: 10 });

// 🔐 Cargar credenciales desde .env (base64)
const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf8")
);

const client = new vision.ImageAnnotatorClient({ credentials });

const app = express();
app.use(cors({ origin: true }));

app.post("/ocr", (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error al procesar archivos:", err);
      return res.status(500).json({ error: "Error al procesar archivos" });
    }

    const tablaFile = files.tabla?.[0] || files.tabla;
    const ingredientesFile = files.ingredientes?.[0] || files.ingredientes;

    if (!tablaFile || !ingredientesFile) {
      return res.status(400).json({ error: "Faltan archivos" });
    }

    try {
      const [tablaResult] = await client.textDetection(tablaFile.filepath);
      const [ingredientesResult] = await client.textDetection(ingredientesFile.filepath);

      const tablaText = tablaResult.textAnnotations?.[0]?.description || "";
      const ingredientesText = ingredientesResult.textAnnotations?.[0]?.description || "";

      const fullText = `${tablaText}\n\n${ingredientesText}`;
      return res.status(200).json({ text: fullText });
    } catch (error) {
      console.error("OCR error:", error);
      return res.status(500).json({ error: "Fallo en el OCR con Google Vision" });
    }
  });
});

// Exportar como función HTTPS (desde /api/...)
exports.api = functions.https.onRequest(app);
