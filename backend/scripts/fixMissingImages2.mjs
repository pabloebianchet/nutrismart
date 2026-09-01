/**
 * Backfill puntual: notas (cualquier idioma) sin imageUrl porque la
 * generación en background (fire-and-forget) nunca terminó — sospecha:
 * el proceso de Render se recicló antes de que termine.
 *
 * Uso: node --env-file=.env scripts/fixMissingImages2.mjs
 */
import mongoose from "mongoose";
import OpenAI from "openai";
import DailyPost from "../models/DailyPost.js";
import { generateImage } from "../utils/generateImage.js";
import { uploadImage } from "../utils/cloudinary.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
await mongoose.connect(process.env.MONGO_URI);

const missing = await DailyPost.find({ $or: [{ imageUrl: null }, { imageUrl: "" }] })
  .select("lang date title tags").lean();
console.log(`Encontrados ${missing.length} posts sin imagen (todos los idiomas).`);

for (const post of missing) {
  try {
    const topic = post.title;
    console.log(`Generando imagen para ${post.lang}/${post.date}: "${topic}"...`);
    const { imageUrl: dataUrl } = await generateImage(openai, {
      prompt: `Professional editorial illustration for a health article about "${topic}". Clean, modern wellness aesthetic, pastel green tones, no text, no watermarks.`,
      size: "1024x1024",
    });
    const imageUrl = await uploadImage(dataUrl, "daily-posts", `post-${post.lang}-${post.date}`);
    await DailyPost.updateOne({ lang: post.lang, date: post.date }, { $set: { imageUrl } });
    console.log(`✅ ${post.lang}/${post.date} -> ${imageUrl}`);
  } catch (err) {
    console.error(`❌ ${post.lang}/${post.date}:`, err);
  }
}
await mongoose.disconnect();
