import express from "express";
import OpenAI from "openai";
import { authMiddleware } from "../middleware/auth.js";
import DailyPost from "../models/DailyPost.js";
import { generateImage } from "../utils/generateImage.js";

const router = express.Router();
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ─── Temas rotativos SEO (un tema distinto por día) ─────────── */
const TOPICS = [
  { topic: "Alimentos ultraprocesados y su impacto real en la salud",    img: "ultra-processed food health warning" },
  { topic: "Proteína en la dieta: cuánta necesitás y de dónde obtenerla", img: "protein food sources muscle" },
  { topic: "Azúcar e inflamación crónica: el vínculo que pocos conocen", img: "sugar inflammation health" },
  { topic: "Cómo mejorar tu microbiota intestinal con lo que comés",      img: "gut microbiome healthy food" },
  { topic: "Ayuno intermitente: beneficios reales y mitos comunes",       img: "intermittent fasting healthy lifestyle" },
  { topic: "Hidratación y rendimiento físico: el error que todos cometen",img: "hydration water sports performance" },
  { topic: "Sueño y metabolismo: por qué dormir mal te hace subir de peso",img: "sleep metabolism healthy" },
  { topic: "Carbohidratos: cuáles comer y cuáles evitar",                img: "complex carbohydrates healthy food" },
  { topic: "Grasas saludables que tu corazón necesita",                  img: "healthy fats avocado nuts omega 3" },
  { topic: "Estrés crónico y peso corporal: la conexión directa",        img: "stress cortisol body weight" },
  { topic: "Cómo leer etiquetas nutricionales y no caer en trampas",     img: "food nutrition label reading" },
  { topic: "Antioxidantes: los mejores alimentos para combatir el envejecimiento", img: "antioxidant foods berries vegetables" },
  { topic: "HIIT vs cardio moderado: cuál quema más grasa",              img: "HIIT workout fitness training" },
  { topic: "Colesterol: separando los mitos de la realidad",             img: "cholesterol heart health food" },
  { topic: "Conservantes artificiales: los que debés evitar en tu dieta",img: "artificial preservatives processed food" },
  { topic: "Omega 3: por qué es esencial y cómo incorporarlo",           img: "omega 3 salmon fish healthy" },
  { topic: "Dieta antiinflamatoria: qué comer cada día",                 img: "anti-inflammatory diet colorful vegetables" },
  { topic: "Resistencia a la insulina: señales tempranas y cómo revertirla", img: "insulin resistance healthy diet" },
  { topic: "Cómo empezar a entrenar si nunca lo hiciste",                img: "beginner workout gym fitness" },
  { topic: "Aditivos alimentarios peligrosos que se esconden en la comida", img: "food additives chemicals warning" },
  { topic: "El desayuno ideal según la ciencia",                         img: "healthy breakfast protein nutrition" },
  { topic: "Por qué cocinar en casa cambia tu salud radicalmente",       img: "home cooking healthy meal prep" },
  { topic: "Vitamina D: la deficiencia que afecta al 80% de la población",img: "vitamin D sunlight health" },
  { topic: "Índice glucémico: cómo afecta tu energía y tu peso",        img: "glycemic index food glucose" },
  { topic: "Magnesio: el mineral que más te falta y cómo obtenerlo",     img: "magnesium rich food nuts leafy greens" },
  { topic: "Fibra dietética: beneficios que van más allá de la digestión",img: "fiber rich food vegetables legumes" },
  { topic: "Carnes procesadas: qué dice la ciencia sobre su consumo",    img: "processed meat health risk" },
  { topic: "Colorantes artificiales en alimentos: riesgos reales",       img: "artificial food coloring warning" },
  { topic: "El poder de los fermentados para tu salud intestinal",       img: "fermented food yogurt kefir gut health" },
  { topic: "Mindful eating: comer consciente para perder peso sin dieta",img: "mindful eating healthy relationship food" },
];

// Devuelve el tema del día según la fecha específica (YYYY-MM-DD)
const topicForDate = (dateStr) => {
  const d = new Date(dateStr);
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return TOPICS[dayOfYear % TOPICS.length];
};

const todayDate = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

/* ─── Generar post del día ───────────────────────────────────── */
const generateDailyPost = async (openai, date) => {
  const { topic, img } = topicForDate(date);

  const gptRes = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Sos un periodista de salud y nutrición argentino. Escribís con claridad, datos concretos y un tono cercano. Solo respondés con JSON válido.",
      },
      {
        role: "user",
        content: `Escribí un artículo de salud para la app Nui. Tema: "${topic}".

Requisitos:
- Título: atractivo, directo, optimizado para búsqueda (máx 75 caracteres)
- Excerpt: 1-2 oraciones gancho para el lector (máx 130 caracteres)
- Body: 4 párrafos cortos separados por \\n\\n. Escritura directa, útil, sin relleno. Datos concretos cuando sea posible. Último párrafo = consejo accionable.
- Tags: 4-5 palabras clave SEO relevantes en español
- readingMinutes: 2

Solo JSON:
{"title":"...","excerpt":"...","body":"párrafo1\\n\\npárrafo2\\n\\npárrafo3\\n\\nconsejo","tags":["tag1","tag2"],"readingMinutes":2}`,
      },
    ],
    max_tokens: 700,
    temperature: 0.75,
  });

  const raw  = gptRes.choices[0].message.content.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  const data = JSON.parse(raw);

  // Generar imagen async (no bloquea — se actualiza después)
  const post = await DailyPost.create({
    date,
    title:          data.title,
    excerpt:        data.excerpt,
    body:           data.body,
    tags:           data.tags || [],
    readingMinutes: data.readingMinutes || 2,
    publishedAt:    new Date(),
    imageUrl:       null,
  });

  // Imagen en background
  generateImage(openai, {
    prompt: `Professional editorial illustration for a health article about "${topic}". Clean, modern wellness aesthetic, pastel green tones, no text, no watermarks.`,
    size:   "1024x1024",
  })
    .then(({ imageUrl }) => DailyPost.findByIdAndUpdate(post._id, { $set: { imageUrl } }))
    .catch(() => {});

  return post;
};

/* ─── GET /today ─────────────────────────────────────────────── */
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const date     = todayDate();
    let   post     = await DailyPost.findOne({ date });
    if (!post) post = await generateDailyPost(getOpenAI(), date);
    return res.json({ post });
  } catch (err) {
    console.error("DailyPost error:", err.message);
    return res.status(500).json({ error: "Error al obtener el post del día." });
  }
});

/* ─── GET /:date/refresh-image — regenerar imagen si faltó ───── */
router.get("/:date/image", authMiddleware, async (req, res) => {
  try {
    const post = await DailyPost.findOne({ date: req.params.date });
    if (!post) return res.status(404).json({ error: "Post no encontrado." });
    if (post.imageUrl) return res.json({ imageUrl: post.imageUrl });

    // Aún no tiene imagen → esperar a que se genere (máx 30s)
    return res.json({ imageUrl: null });
  } catch (err) {
    return res.status(500).json({ error: "Error." });
  }
});

/* ─── GET /recent — últimos 3 posts (público, para landing) ─── */
router.get("/recent", async (req, res) => {
  try {
    const openai = getOpenAI();

    // Generar los 3 días más recientes si no existen
    const dates = [0, 1, 2].map((offset) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return d.toLocaleDateString("en-CA");
    });

    const posts = [];
    for (const date of dates) {
      let post = await DailyPost.findOne({ date });
      if (!post) post = await generateDailyPost(openai, date);
      posts.push(post);
    }

    return res.json({ posts });
  } catch (err) {
    console.error("Recent posts error:", err.message);
    return res.status(500).json({ error: "Error al obtener posts recientes." });
  }
});

export default router;
