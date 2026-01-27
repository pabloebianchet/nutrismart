import vision from "@google-cloud/vision";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ Decodifica y parsea el JSON de la variable codificada
const credentialsJSON = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString();
const credentials = JSON.parse(credentialsJSON);

const client = new vision.ImageAnnotatorClient({ credentials });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error al procesar archivos" });

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
}
