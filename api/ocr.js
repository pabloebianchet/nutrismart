import vision from "@google-cloud/vision";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const client = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Error al parsear formulario:", err);
      return res.status(500).json({ error: "Error al procesar archivos" });
    }

    const tablaFile = files.tabla?.[0] || files.tabla;
    const ingredientesFile = files.ingredientes?.[0] || files.ingredientes;

    console.log("📸 Tabla file:", tablaFile?.filepath);
    console.log("📸 Ingredientes file:", ingredientesFile?.filepath);

    if (!tablaFile || !ingredientesFile) {
      return res.status(400).json({ error: "Faltan archivos" });
    }

    try {
      const [tablaResult] = await client.textDetection(tablaFile.filepath);
      const [ingredientesResult] = await client.textDetection(ingredientesFile.filepath);

      console.log("📄 Resultado OCR tabla:", tablaResult?.textAnnotations?.[0]?.description);
      console.log("📄 Resultado OCR ingredientes:", ingredientesResult?.textAnnotations?.[0]?.description);

      const tablaText = tablaResult.textAnnotations?.[0]?.description || "";
      const ingredientesText = ingredientesResult.textAnnotations?.[0]?.description || "";

      if (!tablaText && !ingredientesText) {
        throw new Error("No se obtuvo texto OCR");
      }

      const fullText = `${tablaText}\n\n${ingredientesText}`;
      return res.status(200).json({ text: fullText });
    } catch (error) {
      console.error("🔥 OCR error:", error);
      return res.status(500).json({ error: "Fallo en el OCR con Google Vision" });
    }
  });
}
