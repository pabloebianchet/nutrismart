/**
 * Seed v2 — lee exerciseSeedData.json, genera imágenes con gpt-image-2,
 * sube a Cloudinary y guarda en MongoDB.
 *
 * Uso: node --env-file=.env scripts/seedExercisesV2.js
 */

import mongoose  from "mongoose";
import OpenAI    from "openai";
import { v2 as cloudinary } from "cloudinary";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Exercise from "../models/Exercise.js";

const __dir = dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Corregir encoding UTF-8 interpretado como Latin-1
const fix = (s) => {
  if (!s || typeof s !== "string") return s;
  return s
    .replace(/Ã¡/g,"á").replace(/Ã©/g,"é").replace(/Ã­/g,"í")
    .replace(/Ã³/g,"ó").replace(/Ãº/g,"ú").replace(/Ã±/g,"ñ")
    .replace(/Ã¼/g,"ü").replace(/Ã‰/g,"É").replace(/Ã"/g,"Ó")
    .replace(/Ã/g,"Á").replace(/Ã¨/g,"è");
};

// Mapear valores del JSON al formato de la app
const GOAL_MAP = {
  HIPERTROFIA: "Hipertrofia",
  RUNNING:     "Running",
  CALISTENIA:  "Calistenia",
  CASA:        "Ejercicio en Casa",
  FIT:         "Fit",
};
const PLACE_MAP = {
  GYM:        "Gym",
  CASA:       "Casa",
  AIRE_LIBRE: "Aire libre",
};

const normalize = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9\s]/g,"").trim();

async function generateAndUpload(name, prompt) {
  const res = await openai.images.generate({
    model: "gpt-image-2-2026-04-21",
    prompt: fix(prompt),
    size:   "1024x1024",
  });
  const base64 = res.data[0].b64_json;
  if (!base64) throw new Error("Sin imagen");

  const publicId = `exercises/${normalize(name).replace(/\s+/g,"_")}`;
  const uploaded = await cloudinary.uploader.upload(
    `data:image/png;base64,${base64}`,
    { folder: "exercises", public_id: publicId, overwrite: true, resource_type: "image" }
  );
  return uploaded.secure_url;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB conectado");

  const raw = JSON.parse(readFileSync(join(__dir, "training_exercises_seed_145.json"), "utf8"));
  console.log(`📋 ${raw.length} ejercicios en el archivo\n`);

  let inserted = 0, updated = 0, errors = 0;

  for (const ex of raw) {
    const code     = ex.code;
    const name     = fix(ex.name);
    const nameNorm = normalize(name);
    const tipos    = (ex.compatible_goals  || []).map(g => GOAL_MAP[g]).filter(Boolean);
    const lugares  = (ex.compatible_places || []).map(p => PLACE_MAP[p]).filter(Boolean);

    const doc = {
      code,
      name,
      nameNorm,
      description:    fix(ex.description),
      category:       ex.category,
      muscleGroup:    (ex.primary_muscle_group || "").toLowerCase(),
      secondaryMuscles: (ex.secondary_muscle_groups || []).map(fix),
      movementPattern: ex.movement_pattern,
      equipment:      (ex.equipment || []).map(fix),
      tipos,
      lugares,
      difficulty:     ex.difficulty || "PRINCIPIANTE",
      instructions:   fix(ex.instructions),
      technicalCues:  (ex.technical_cues  || []).map(fix),
      commonMistakes: (ex.common_mistakes || []).map(fix),
      contraindications: fix(ex.contraindications),
      imagePrompt:    fix(ex.image_prompt),
      active:         ex.active !== false,
    };

    const existing = await Exercise.findOne({ code });
    if (!existing) {
      await Exercise.create({ ...doc, seeded: false });
      inserted++;
    } else if (!existing.seeded) {
      await Exercise.updateOne({ code }, { $set: doc });
      updated++;
    }
  }

  console.log(`✅ Insertados: ${inserted} | Actualizados: ${updated}\n`);

  // Generar imágenes para los pendientes
  const pending = await Exercise.find({ seeded: false, active: true });
  console.log(`🔄 Generando imágenes para ${pending.length} ejercicios...\n`);

  for (const ex of pending) {
    process.stdout.write(`  → ${ex.name} ... `);
    try {
      const prompt = ex.imagePrompt ||
        `Professional fitness photo of person doing "${ex.name}" exercise, correct form, clean gym background, no text.`;
      const url = await generateAndUpload(ex.name, prompt);
      await Exercise.updateOne({ _id: ex._id }, { $set: { imageUrl: url, seeded: true } });
      console.log("✅");
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
    await sleep(1500);
  }

  console.log(`\n${"═".repeat(40)}`);
  console.log(`✅ OK | ❌ Errores: ${errors}`);
  console.log(`${"═".repeat(40)}\n`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
