/**
 * Backfill: traduce el nombre de cada ejercicio sembrado al inglés
 * (nameEn) para que los planes de entrenamiento generados en inglés no
 * sigan mostrando nombres en español — el prompt de /training/generate
 * está obligado a usar SOLO nombres del catálogo tal cual, así que sin
 * esto un plan en inglés terminaba con "Sentadilla", "Press de banca", etc.
 *
 * Uso: node --env-file=.env scripts/translateExerciseCatalog.mjs
 */
import mongoose from "mongoose";
import OpenAI from "openai";
import Exercise from "../models/Exercise.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const normalize = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, "").trim();

await mongoose.connect(process.env.MONGO_URI);

const exercises = await Exercise.find({ nameEn: null }).select("_id name").lean();
console.log(`Encontrados ${exercises.length} ejercicios sin traducir.`);

const BATCH = 25;
let ok = 0;
for (let i = 0; i < exercises.length; i += BATCH) {
  const batch = exercises.slice(i, i + BATCH);
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional fitness translator. Translate Spanish (Argentina) exercise names to their standard US gym English equivalent — the name a US trainer would actually use, not a literal word-for-word translation. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: `Translate each exercise name to its standard US English gym name. Keep the same order.
${JSON.stringify(batch.map((e) => e.name))}

JSON only: {"names": ["English name 1", "English name 2", ...]}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const raw  = completion.choices[0].message.content.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(raw);
    const names = data.names || [];

    if (names.length !== batch.length) {
      console.error(`⚠ Batch ${i}: se esperaban ${batch.length} nombres, llegaron ${names.length} — se omite el batch.`);
      continue;
    }

    for (let j = 0; j < batch.length; j++) {
      const nameEn = names[j];
      await Exercise.updateOne(
        { _id: batch[j]._id },
        { $set: { nameEn, nameNormEn: normalize(nameEn) } }
      );
      console.log(`✅ "${batch[j].name}" -> "${nameEn}"`);
      ok++;
    }
  } catch (err) {
    console.error(`❌ Batch ${i}: ${err.message}`);
  }
}

console.log(`\nCompleto: ${ok}/${exercises.length}.`);
await mongoose.disconnect();
