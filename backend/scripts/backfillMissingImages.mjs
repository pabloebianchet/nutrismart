/**
 * Regenera la imagen de los DailyPost que quedaron sin imageUrl por la
 * falla silenciosa del 2026-08-30 al 2026-09-01 (background sin logging
 * ni reintento, ya corregido en posts.js).
 *
 * Uso: node --env-file=.env scripts/backfillMissingImages.mjs
 */
import mongoose from "mongoose";
import OpenAI from "openai";
import DailyPost from "../models/DailyPost.js";
import { generateImage } from "../utils/generateImage.js";
import { uploadImage } from "../utils/cloudinary.js";
import { topicForDate } from "../routes/posts.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

await mongoose.connect(process.env.MONGO_URI);

const posts = await DailyPost.find({ $or: [{ imageUrl: null }, { imageUrl: "" }] });
console.log(`Encontrados ${posts.length} posts sin imagen.`);

let ok = 0;
for (const post of posts) {
  try {
    const { topic } = topicForDate(post.date);
    const { imageUrl: dataUrl } = await generateImage(openai, {
      prompt: `Professional editorial illustration for a health article about "${topic}". Clean, modern wellness aesthetic, pastel green tones, no text, no watermarks.`,
      size: "1024x1024",
    });
    const imageUrl = await uploadImage(dataUrl, "daily-posts", `post-${post.date}`);
    await DailyPost.updateOne({ _id: post._id }, { $set: { imageUrl } });
    console.log(`✅ ${post.date} -> ${imageUrl}`);
    ok++;
  } catch (err) {
    console.error(`❌ ${post.date}: ${err.message}`);
  }
}

console.log(`\nCompleto: ${ok}/${posts.length}.`);
await mongoose.disconnect();
