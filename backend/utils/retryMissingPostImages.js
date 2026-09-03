/**
 * retryMissingPostImages.js
 * ─────────────────────────────────────────────────────────────
 * Job: reintenta generar la imagen de cualquier DailyPost que se haya
 * quedado con imageUrl null.
 *
 * La generación normal corre en background (fire-and-forget) justo
 * después de crear el post — si el proceso se reinicia en el medio
 * (ej. un deploy de Render) la tarea se pierde sin ningún error
 * registrado, y el post queda sin imagen para siempre. Visto en vivo:
 * 4 posts seguidos (es/en, dos días) sin imagen durante una sesión con
 * muchos deploys seguidos del backend.
 *
 * Se ejecuta al arrancar el servidor y cada 6 horas. Solo reintenta
 * posts de más de 10 minutos (para no pisar una generación que todavía
 * está en curso normalmente).
 * ─────────────────────────────────────────────────────────────
 */

import OpenAI from "openai";
import DailyPost from "../models/DailyPost.js";
import { generateImage } from "./generateImage.js";
import { uploadImage } from "./cloudinary.js";

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const retryMissingPostImages = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const missing = await DailyPost.find({
      imageUrl: null,
      createdAt: { $lt: tenMinutesAgo },
    }).lean();

    if (missing.length === 0) {
      console.log("🖼️  Retry post images: sin pendientes.");
      return;
    }

    console.log(`🖼️  Retry post images: ${missing.length} post(s) sin imagen, reintentando...`);
    const openai = getOpenAI();

    for (const post of missing) {
      try {
        const { imageUrl: dataUrl } = await generateImage(openai, {
          prompt: `Professional editorial illustration for a health article about "${post.title}". Clean, modern wellness aesthetic, pastel green tones, no text, no watermarks.`,
          size: "1024x1024",
        });
        const imageUrl = await uploadImage(dataUrl, "daily-posts", `post-${post.lang}-${post.date}`);
        await DailyPost.findByIdAndUpdate(post._id, { $set: { imageUrl } });
        console.log(`✅ Imagen recuperada: ${post.lang}/${post.date}`);
      } catch (err) {
        console.error(`❌ Retry falló para ${post.lang}/${post.date}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error("❌ Error en retryMissingPostImages:", err.message);
  }
};

/**
 * Inicia el job: lo ejecuta al arrancar y cada 6 horas.
 * Se llama UNA sola vez desde index.js, después de connectDB().
 */
export const startRetryMissingPostImagesJob = () => {
  const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 horas

  setTimeout(() => {
    retryMissingPostImages();
    setInterval(retryMissingPostImages, INTERVAL_MS);
  }, 15000); // delay inicial más largo que el de trial-expiry, no compite por Mongo al arrancar

  console.log("✅ Job de retry de imágenes de posts iniciado (cada 6 h).");
};
