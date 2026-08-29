/**
 * Migración única: los DailyPost creados antes del fix de posts.js
 * guardaron imageUrl como data URI base64 directo en Mongo (varios MB
 * por documento). Este script sube esas imágenes a Cloudinary y
 * reemplaza el campo por la URL real. Seguro de re-ejecutar: solo
 * toca documentos cuyo imageUrl empieza con "data:".
 *
 * Uso: node --env-file=.env scripts/backfillDailyPostImages.mjs
 */
import mongoose from "mongoose";
import DailyPost from "../models/DailyPost.js";
import { uploadImage } from "../utils/cloudinary.js";

await mongoose.connect(process.env.MONGO_URI);

const posts = await DailyPost.find({ imageUrl: { $regex: "^data:" } });
console.log(`Encontrados ${posts.length} posts con base64 sin migrar.`);

let ok = 0;
for (const post of posts) {
  try {
    const imageUrl = await uploadImage(post.imageUrl, "daily-posts", `post-${post.date}`);
    await DailyPost.updateOne({ _id: post._id }, { $set: { imageUrl } });
    console.log(`✅ ${post.date} -> ${imageUrl}`);
    ok++;
  } catch (err) {
    console.error(`❌ ${post.date}: ${err.message}`);
  }
}

console.log(`\nMigración completa: ${ok}/${posts.length}.`);
await mongoose.disconnect();
