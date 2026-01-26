import formidable from "formidable";
import { createWorker } from "tesseract.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Error al leer archivos:", err);
      return res.status(500).json({ error: "Error al leer archivos" });
    }

    console.log("📦 Archivos recibidos:", files);

    const tablaFile = files.tabla?.[0] || files.tabla;
    const ingredientesFile = files.ingredientes?.[0] || files.ingredientes;

    if (!tablaFile || !ingredientesFile) {
      console.error("⚠️ Faltan archivos (tabla o ingredientes)");
      return res.status(400).json({ error: "Faltan archivos" });
    }

    console.log("📄 Procesando archivos:");
    console.log("- Tabla:", tablaFile.filepath);
    console.log("- Ingredientes:", ingredientesFile.filepath);

    const worker = await createWorker("spa");

    try {
      const tablaResult = await worker.recognize(tablaFile.filepath);
      const ingredientesResult = await worker.recognize(ingredientesFile.filepath);

      await worker.terminate();

      const fullText = `${tablaResult.data.text}\n\n${ingredientesResult.data.text}`;

      console.log("✅ Texto OCR combinado:");
      console.log(fullText);

      return res.status(200).json({ text: fullText });
    } catch (error) {
      console.error("❌ Error en el OCR:", error);
      return res.status(500).json({ error: "Fallo en el OCR" });
    }
  });
}
