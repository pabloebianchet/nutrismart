/**
 * Seed de ejercicios — genera imágenes con DALL-E y guías con GPT,
 * sube imágenes a Cloudinary, guarda todo en MongoDB.
 *
 * Uso: node --env-file=.env scripts/seedExercises.js
 *
 * Solo procesa ejercicios sin imagen/guía (seguro de re-ejecutar).
 */

import mongoose  from "mongoose";
import OpenAI    from "openai";
import { v2 as cloudinary } from "cloudinary";
import Exercise  from "../models/Exercise.js";
import { EXERCISES } from "./exerciseData.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const normalize = (str) =>
  str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, "").trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── Generar descripción técnica con GPT ── */
async function generateDescription(name) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "system",
      content: "Sos un entrenador personal certificado. Respondé SOLO con JSON válido, sin markdown.",
    }, {
      role: "user",
      content: `Para el ejercicio "${name}" generá una guía técnica en español con este formato exacto:
{"muscles":"músculos principales y secundarios trabajados (1 línea)","execution":"cómo ejecutarlo correctamente paso a paso (2-3 líneas)","mistakes":"errores comunes a evitar (1-2 líneas)"}`,
    }],
    max_tokens: 250,
    temperature: 0.3,
  });

  const raw = res.choices[0].message.content
    .replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  return JSON.parse(raw);
}

/* ── Generar imagen con DALL-E 3 y subir a Cloudinary ── */
async function generateAndUploadImage(name) {
  const prompt = `Professional fitness photography of a person performing "${name}" exercise with perfect form. Gym setting, natural lighting, full body shot showing correct technique, athletic person. Clean background. High quality. No text, no watermarks.`;

  const res = await openai.images.generate({
    model: "gpt-image-2-2026-04-21",
    prompt,
    size:  "1024x1024",
  });

  const base64   = res.data[0].b64_json;
  if (!base64) throw new Error("Sin imagen generada");
  const source   = `data:image/png;base64,${base64}`;
  const publicId = `exercises/${normalize(name).replace(/\s+/g, "_")}`;

  const uploaded = await cloudinary.uploader.upload(source, {
    folder:        "exercises",
    public_id:     publicId,
    overwrite:     true,
    resource_type: "image",
  });

  return uploaded.secure_url;
}

/* ── Main ── */
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB conectado");

  // Insertar ejercicios que no existan aún
  let inserted = 0;
  for (const ex of EXERCISES) {
    const nameNorm = normalize(ex.name);
    const exists = await Exercise.findOne({ nameNorm });
    if (!exists) {
      await Exercise.create({ ...ex, nameNorm, seeded: false });
      inserted++;
    }
  }
  console.log(`📋 ${inserted} ejercicios nuevos insertados (${EXERCISES.length} en total)`);

  // Procesar los que no tienen imagen o descripción
  const pending = await Exercise.find({ seeded: false });
  console.log(`\n🔄 Procesando ${pending.length} ejercicios pendientes...\n`);

  let ok = 0, errors = 0;

  for (const ex of pending) {
    try {
      process.stdout.write(`  → ${ex.name} ... `);

      const [description, imageUrl] = await Promise.all([
        ex.description?.execution ? Promise.resolve(ex.description) : generateDescription(ex.name),
        ex.imageUrl ? Promise.resolve(ex.imageUrl) : generateAndUploadImage(ex.name),
      ]);

      await Exercise.findByIdAndUpdate(ex._id, {
        $set: { imageUrl, description, seeded: true },
      });

      console.log(`✅ OK`);
      ok++;

      // Pausa para no saturar la API (rate limits)
      await sleep(1500);
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      errors++;
      await sleep(2000);
    }
  }

  console.log(`\n═══════════════════════════════`);
  console.log(`✅ Exitosos: ${ok}`);
  console.log(`❌ Errores:  ${errors}`);
  console.log(`═══════════════════════════════\n`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
