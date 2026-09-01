import express from "express";
import OpenAI from "openai";
import { authMiddleware } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import DailyPost from "../models/DailyPost.js";
import { generateImage } from "../utils/generateImage.js";
import { uploadImage } from "../utils/cloudinary.js";
import { logWarn } from "../utils/logger.js";
import { buildPostSlug } from "../utils/slug.js";
import { TOPICS_ES } from "../data/dailyPostTopics.js";
import {
  pickTopic,
  cosineSimilarity,
  cutoffDate,
  MIN_BODY_LENGTH,
  SIMILARITY_THRESHOLD,
  CANNIBALIZATION_WINDOW_DAYS,
  DUPLICATE_CHECK_WINDOW_DAYS,
} from "../utils/dailyPostSelection.js";

const router = express.Router();
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANGS = new Set(["es-AR", "en"]);
const validLang = (req, res, next) => {
  if (!LANGS.has(req.params.lang)) return res.status(400).json({ error: "Idioma no válido." });
  next();
};

// Banco original (30 temas), congelado para no romper el mapeo día-del-año
// que ya usó `topicForDate` en posts existentes / scripts de backfill.
const LEGACY_TOPICS_ES = TOPICS_ES.slice(0, 30);

/** @deprecated usar pickTopic() de dailyPostSelection.js para posts nuevos.
 * Se mantiene solo por compatibilidad con scripts de backfill viejos que
 * reconstruyen el tema de un post ya existente a partir de su fecha. */
export const topicForDate = (dateStr) => {
  const d = new Date(dateStr);
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return LEGACY_TOPICS_ES[dayOfYear % LEGACY_TOPICS_ES.length];
};

const todayDate = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

const PROMPTS = {
  "es-AR": {
    system: "Sos un periodista de salud y nutrición argentino. Escribís con claridad, datos concretos y un tono cercano. Solo respondés con JSON válido.",
    build: (topic) => `Escribí un artículo de salud para la app Nui. Tema: "${topic}".

Requisitos:
- Título: atractivo, directo, optimizado para búsqueda (máx 75 caracteres)
- Excerpt: 1-2 oraciones gancho para el lector (máx 130 caracteres)
- Body: 4 párrafos cortos separados por \\n\\n. Escritura directa, útil, sin relleno. Datos concretos cuando sea posible (un número, estudio o dato específico — no genérico). Último párrafo = consejo accionable.
- Tags: 4-5 palabras clave SEO relevantes en español
- readingMinutes: 2
- hasConcreteData: true SOLO si el body incluye al menos un dato, cifra o estudio concreto (no una afirmación genérica tipo "es importante comer sano")

Solo JSON:
{"title":"...","excerpt":"...","body":"párrafo1\\n\\npárrafo2\\n\\npárrafo3\\n\\nconsejo","tags":["tag1","tag2"],"readingMinutes":2,"hasConcreteData":true}`,
  },
  en: {
    system: "You are a US-based health and nutrition writer. You write with clarity, concrete data, and an approachable tone. You respond ONLY with valid JSON.",
    build: (topic) => `Write a health article for the Nui app. Topic: "${topic}".

Requirements:
- Title: compelling, direct, search-optimized (max 75 characters)
- Excerpt: 1-2 hook sentences for the reader (max 130 characters)
- Body: 4 short paragraphs separated by \\n\\n. Direct, useful writing, no filler. Concrete data where possible (a number, study, or specific fact — not generic). Last paragraph = actionable tip.
- Tags: 4-5 relevant SEO keywords in English
- readingMinutes: 2
- hasConcreteData: true ONLY if the body includes at least one concrete fact, figure, or study (not a generic claim like "eating healthy is important")

JSON only:
{"title":"...","excerpt":"...","body":"paragraph1\\n\\nparagraph2\\n\\nparagraph3\\n\\ntip","tags":["tag1","tag2"],"readingMinutes":2,"hasConcreteData":true}`,
  },
};

/* ─── Generar post del día (independiente por idioma) ────────── */
const generateDailyPost = async (openai, lang, date) => {
  // 1) Evitar canibalización de keywords: no repetir tema/keyword de los
  //    últimos 60 días de ESTE idioma.
  const cannibalizationCutoff = cutoffDate(CANNIBALIZATION_WINDOW_DAYS);
  const recentKeywordDocs = await DailyPost.find({ lang, date: { $gte: cannibalizationCutoff } })
    .select("targetKeyword").lean();
  const excludeKeywords = new Set(recentKeywordDocs.map((p) => p.targetKeyword).filter(Boolean));

  const { topic, keyword, img, exhausted } = pickTopic(lang, date, excludeKeywords);
  if (exhausted) {
    logWarn("seo", "note.topic_bank_exhausted", `Banco de temas agotado (${lang}) — se repite keyword`, {
      meta: { lang, date, keyword },
    });
  }

  const { system, build } = PROMPTS[lang];
  const gptRes = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: build(topic) },
    ],
    max_tokens: 700,
    temperature: 0.75,
  });

  const raw  = gptRes.choices[0].message.content.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  const data = JSON.parse(raw);

  const body = data.body || "";
  const slug = buildPostSlug({ date, title: data.title });

  // 2) Embedding del body para chequeo de near-duplicate (solo contra el
  //    mismo idioma — notas ES y EN son contenido independiente, no tiene
  //    sentido compararlas entre sí).
  let embedding = null;
  try {
    const embRes = await openai.embeddings.create({ model: "text-embedding-3-small", input: body });
    embedding = embRes.data[0].embedding;
  } catch (err) {
    console.error(`[generateDailyPost] Embedding falló para ${lang}/${date}: ${err.message}`);
  }

  const dupCutoff = cutoffDate(DUPLICATE_CHECK_WINDOW_DAYS);
  const recentForDup = await DailyPost.find({ lang, date: { $gte: dupCutoff } })
    .select("date slug embedding").select("+embedding").lean();

  let maxSimilarity = 0;
  let mostSimilarPost = null;
  if (embedding) {
    for (const p of recentForDup) {
      if (!p.embedding?.length) continue;
      const sim = cosineSimilarity(embedding, p.embedding);
      if (sim > maxSimilarity) { maxSimilarity = sim; mostSimilarPost = p; }
    }
  }
  const isDuplicate = maxSimilarity > SIMILARITY_THRESHOLD;

  // 3) Gate de indexación — noindex por default, index solo si pasa todo.
  const minLengthOk     = body.length >= MIN_BODY_LENGTH;
  const hasConcreteData = data.hasConcreteData === true;
  const reasons = [];
  if (!minLengthOk)     reasons.push(`body_too_short (${body.length}<${MIN_BODY_LENGTH})`);
  if (isDuplicate)      reasons.push(`near_duplicate:${mostSimilarPost?.slug} (sim=${maxSimilarity.toFixed(3)})`);
  if (!hasConcreteData) reasons.push("no_concrete_data_or_angle");
  const indexStatus = reasons.length === 0 ? "index" : "noindex";

  if (indexStatus === "noindex") {
    logWarn("seo", "note.noindex", `Nota noindex: ${lang}/${date}`, {
      meta: { lang, date, slug, reasons },
    });
  }

  const post = await DailyPost.create({
    lang,
    date,
    slug,
    title:          data.title,
    excerpt:        data.excerpt,
    body,
    tags:           data.tags || [],
    targetKeyword:  keyword,
    readingMinutes: data.readingMinutes || 2,
    publishedAt:    new Date(),
    imageUrl:       null,
    embedding:      embedding || undefined,
    indexStatus,
    indexDecision: {
      minLengthOk,
      hasConcreteData,
      isDuplicate,
      maxSimilarity,
      mostSimilarPost: mostSimilarPost?._id,
      reasons,
      decidedAt: new Date(),
    },
  });

  // Imagen en background — se genera en base64 y se sube a Cloudinary
  // (nunca guardar el data URI en Mongo: infla cada documento a varios MB
  // y ese peso termina horneado en el HTML prerenderizado de la home).
  const generateAndUploadImage = async (attempt = 1) => {
    try {
      const { imageUrl: dataUrl } = await generateImage(openai, {
        prompt: `Professional editorial illustration for a health article about "${topic}". Clean, modern wellness aesthetic, pastel green tones, no text, no watermarks.`,
        size:   "1024x1024",
      });
      const imageUrl = await uploadImage(dataUrl, "daily-posts", `post-${lang}-${date}`);
      await DailyPost.findByIdAndUpdate(post._id, { $set: { imageUrl } });
    } catch (err) {
      console.error(`[generateDailyPost] Imagen falló (intento ${attempt}) para ${lang}/${date}: ${err.message}`);
      if (attempt < 2) return generateAndUploadImage(attempt + 1);
    }
  };
  generateAndUploadImage();

  return post;
};

/* ─── GET /:lang/today ───────────────────────────────────────── */
router.get("/:lang/today", validLang, authMiddleware, async (req, res) => {
  try {
    const { lang } = req.params;
    const date     = todayDate();
    let   post     = await DailyPost.findOne({ lang, date });
    if (!post) post = await generateDailyPost(getOpenAI(), lang, date);
    return res.json({ post });
  } catch (err) {
    console.error("DailyPost error:", err.message);
    return res.status(500).json({ error: "Error al obtener el post del día." });
  }
});

/* ─── GET /:lang/:date/image — regenerar imagen si faltó ─────── */
router.get("/:lang/:date/image", validLang, authMiddleware, async (req, res) => {
  try {
    const { lang, date } = req.params;
    const post = await DailyPost.findOne({ lang, date });
    if (!post) return res.status(404).json({ error: "Post no encontrado." });
    if (post.imageUrl) return res.json({ imageUrl: post.imageUrl });
    return res.json({ imageUrl: null });
  } catch (err) {
    return res.status(500).json({ error: "Error." });
  }
});

/* ─── DELETE /admin/reset — borrar posts recientes de ambos idiomas ── */
router.delete("/admin/reset", authMiddleware, isAdmin, async (req, res) => {
  try {
    const dates = [0, 1, 2].map((offset) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return d.toLocaleDateString("en-CA");
    });
    const result = await DailyPost.deleteMany({ date: { $in: dates } });
    return res.json({ deleted: result.deletedCount, message: "Posts eliminados (ambos idiomas). Se regenerarán con temas distintos." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─── GET /:lang/landing — post de hoy + archivo paginado (público) ── */
router.get("/:lang/landing", validLang, async (req, res) => {
  try {
    const { lang } = req.params;
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 5;
    const skip  = (page - 1) * limit;
    const today = todayDate();

    let featured = null;
    if (page === 1) {
      featured = await DailyPost.findOne({ lang, date: today });
      if (!featured) featured = await generateDailyPost(getOpenAI(), lang, today);
    }

    const totalArchive = await DailyPost.countDocuments({ lang, date: { $ne: today } });
    const archive      = await DailyPost.find({ lang, date: { $ne: today } })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .select("date slug title excerpt tags publishedAt readingMinutes imageUrl indexStatus")
      .lean();

    return res.json({
      featured,
      archive,
      page,
      totalPages: Math.ceil(totalArchive / limit),
      totalArchive,
    });
  } catch (err) {
    console.error("Landing posts error:", err.message);
    return res.status(500).json({ error: "Error al obtener posts." });
  }
});

/* ─── GET /:lang/all — lista completa (para sitemap.xml y prerender) ── */
router.get("/:lang/all", validLang, async (req, res) => {
  try {
    const { lang } = req.params;
    const posts = await DailyPost.find({ lang })
      .sort({ date: 1 })
      .select("date slug title publishedAt updatedAt imageUrl tags indexStatus")
      .lean();
    return res.json({ posts });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener la lista de posts." });
  }
});

/* ─── GET /:lang/:date — catch-all, SIEMPRE al final ─────────── */
router.get("/:lang/:date", validLang, async (req, res) => {
  try {
    const { lang, date } = req.params;
    const post = await DailyPost.findOne({ lang, date });
    if (!post) return res.status(404).json({ error: "Post no encontrado." });
    return res.json({ post });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener el post." });
  }
});

export default router;
