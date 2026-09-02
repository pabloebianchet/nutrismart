/**
 * Genera la versión en inglés de las infografías de ejercicios — las
 * imágenes seeded originales tienen texto (Claves técnicas, Errores
 * comunes, etc.) baked-in en los píxeles en español, generado a partir de
 * un imagePrompt en español. No hay forma de "traducir" una imagen ya
 * generada — hay que regenerarla con un prompt en inglés.
 *
 * Guarda en imageUrlEn (no pisa imageUrl) — /exercise-image sirve
 * imageUrlEn cuando el usuario está en inglés, con fallback a imageUrl
 * mientras el lote no esté completo.
 *
 * Uso: node scripts/seedExercisesEN.mjs
 */
import "dotenv/config";
import mongoose from "mongoose";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import Exercise from "../models/Exercise.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const normalize = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, "").trim();

async function generateAndUpload(nameEn) {
  const prompt = `Realistic fitness illustration of a person performing "${nameEn}", correct technique, clean background, educational/didactic view. All text, labels, and captions in the image MUST be in English.`;

  const res = await openai.images.generate({
    model: "gpt-image-2-2026-04-21",
    prompt,
    size: "1024x1024",
  });
  const base64 = res.data[0].b64_json;
  if (!base64) throw new Error("Sin imagen");

  const publicId = `exercises_en/${normalize(nameEn).replace(/\s+/g, "_")}`;
  const uploaded = await cloudinary.uploader.upload(
    `data:image/png;base64,${base64}`,
    { folder: "exercises_en", public_id: publicId, overwrite: true, resource_type: "image" }
  );
  return uploaded.secure_url;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log("✅ MongoDB conectado");

  const pending = await Exercise.find({ seeded: true, active: true, nameEn: { $ne: null }, imageUrlEn: null });
  console.log(`🔄 Generando imágenes en inglés para ${pending.length} ejercicios...\n`);

  let ok = 0, errors = 0;
  for (const ex of pending) {
    process.stdout.write(`  → ${ex.nameEn} ... `);
    try {
      const url = await generateAndUpload(ex.nameEn);
      await Exercise.updateOne({ _id: ex._id }, { $set: { imageUrlEn: url } });
      console.log("✅");
      ok++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
    await sleep(1500);
  }

  console.log(`\n${"═".repeat(40)}`);
  console.log(`✅ OK: ${ok} | ❌ Errores: ${errors}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
