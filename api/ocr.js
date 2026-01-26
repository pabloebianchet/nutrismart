import formidable from "formidable";
import { createWorker } from "tesseract.js";

export const config = {
  api: {
    bodyParser: false, // necesario para archivos
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error al leer archivos" });

    const tablaFile = files.tabla?.[0] || files.tabla;
    const ingredientesFile = files.ingredientes?.[0] || files.ingredientes;

    if (!tablaFile || !ingredientesFile) {
      return res.status(400).json({ error: "Faltan archivos" });
    }

    const worker = await createWorker("spa");

    try {
      const tablaResult = await worker.recognize(tablaFile.filepath);
      const ingredientesResult = await worker.recognize(ingredientesFile.filepath);
      await worker.terminate();

      const fullText = `${tablaResult.data.text}\n\n${ingredientesResult.data.text}`;
      return res.status(200).json({ text: fullText });
    } catch (error) {
      console.error("OCR error:", error);
      return res.status(500).json({ error: "Fallo en el OCR" });
    }
  });
}
