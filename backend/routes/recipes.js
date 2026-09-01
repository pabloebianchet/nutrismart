import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.js";
import { requireActiveSub } from "../middleware/requireActiveSub.js";
import SavedRecipe from "../models/SavedRecipe.js";
import { logInfo, logWarn, logError } from "../utils/logger.js";
import { generateImage } from "../utils/generateImage.js";
import RecipeImage from "../models/RecipeImage.js";
import { getLang } from "../utils/lang.js";

const router = express.Router();
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const recipesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Demasiadas solicitudes. Esperá un momento." },
});

const MODALIDAD_DESC = {
  "Fit":         "liviana, baja en grasa, alta en proteína, ingredientes naturales",
  "Hipertrofia": "alta en proteína y calorías, orientada a ganancia muscular",
  "Rápidas":     "máximo 15 minutos de preparación, pocos ingredientes, muy simple",
};

const MODALIDAD_DESC_EN = {
  "Fit":         "light, low fat, high protein, natural ingredients",
  "Hipertrofia": "high protein and calories, geared toward muscle gain",
  "Rápidas":     "15 minutes max prep time, few ingredients, very simple",
};

const parseJSON = (text) => {
  const clean = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
};

const userCtxStr = (ud, isEN) =>
  ud
    ? isEN
      ? `The user is ${ud.sexo}, ${ud.edad} years old, ${ud.peso}kg, ${ud.altura}cm, physical activity: ${ud.actividad}.`
      : `El usuario es ${ud.sexo}, ${ud.edad} años, ${ud.peso}kg, ${ud.altura}cm, actividad física ${ud.actividad}.`
    : "";

/* ── 3 sugerencias ─────────────────────────────────── */
router.post("/suggestions", authMiddleware, requireActiveSub, recipesLimiter, async (req, res) => {
  const { modalidad, momento, userData } = req.body;
  const isEN = getLang(req) === "en";
  if (!modalidad || !momento)
    return res.status(400).json({ error: isEN ? "Style and time of day are required." : "Modalidad y momento son requeridos." });

  const desc = (isEN ? MODALIDAD_DESC_EN : MODALIDAD_DESC)[modalidad] || modalidad;

  const prompt = isEN ? `You are an American nutritionist chef. Generate 3 distinct, creative recipes for ${momento} with a ${modalidad} focus (${desc}).
${userCtxStr(userData, isEN)}

Rules:
- Ingredients easily available in the US
- Appetizing, specific names (not generic)
- One-line description, direct and motivating
- Emoji representing the dish

Respond ONLY with this JSON, no extra text:
{
  "recipes": [
    {"name": "Dish name", "description": "One appetizing line", "emoji": "🍗"},
    {"name": "Dish name", "description": "One appetizing line", "emoji": "🥗"},
    {"name": "Dish name", "description": "One appetizing line", "emoji": "🫙"}
  ]
}` : `Sos un chef nutricionista argentino. Generá 3 recetas distintas y creativas para ${momento} con enfoque ${modalidad} (${desc}).
${userCtxStr(userData, isEN)}

Reglas:
- Ingredientes accesibles en Argentina
- Nombres apetitosos y concretos (no genéricos)
- Descripción de una sola línea, directa y motivadora
- Emoji representativo del plato

Respondé ÚNICAMENTE con este JSON sin texto extra:
{
  "recipes": [
    {"name": "Nombre del plato", "description": "Una línea apetitosa", "emoji": "🍗"},
    {"name": "Nombre del plato", "description": "Una línea apetitosa", "emoji": "🥗"},
    {"name": "Nombre del plato", "description": "Una línea apetitosa", "emoji": "🫙"}
  ]
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: isEN ? "You respond ONLY with valid JSON. No markdown, no explanations." : "Respondés SOLO con JSON válido. Sin markdown, sin explicaciones." },
        { role: "user",   content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 350,
    });
    const data = parseJSON(completion.choices[0].message.content);
    return res.json(data);
  } catch (err) {
    console.error("Recipes suggestions error:", err.message);
    return res.status(500).json({ error: isEN ? "Couldn't generate recipes. Try again." : "No se pudieron generar las recetas. Intentá de nuevo." });
  }
});

/* ── Receta completa ───────────────────────────────── */
router.post("/detail", authMiddleware, requireActiveSub, recipesLimiter, async (req, res) => {
  const { name, emoji, modalidad, momento, userData } = req.body;
  const isEN = getLang(req) === "en";
  if (!name || !modalidad || !momento)
    return res.status(400).json({ error: isEN ? "Incomplete data." : "Datos incompletos." });

  const desc = (isEN ? MODALIDAD_DESC_EN : MODALIDAD_DESC)[modalidad] || modalidad;

  const prompt = isEN ? `You are an American nutritionist chef. Give the complete recipe for "${name}" for ${momento} with a ${modalidad} focus (${desc}).
${userCtxStr(userData, isEN)}

Rules:
- Ingredients with exact quantities, easily available in the US
- Max 7 clear steps, with timing when relevant
- Realistic prep time
- 1 practical tip at the end

Respond ONLY with this JSON, no extra text:
{
  "name": "${name}",
  "emoji": "${emoji || "🍽️"}",
  "time": "20 min",
  "difficulty": "Easy",
  "servings": 1,
  "calories": "420 kcal approx.",
  "ingredients": ["200g chicken breast", "1/2 cup quinoa"],
  "steps": ["Boil the quinoa in broth for 15 minutes.", "Cook the chicken..."],
  "tip": "You can prep the quinoa ahead of time."
}` : `Sos un chef nutricionista argentino. Dá la receta completa de "${name}" para ${momento} con enfoque ${modalidad} (${desc}).
${userCtxStr(userData, isEN)}

Reglas:
- Ingredientes con cantidades exactas, accesibles en Argentina
- Máximo 7 pasos, claros y con tiempos cuando corresponda
- Tiempo de preparación realista
- 1 tip práctico al final

Respondé ÚNICAMENTE con este JSON sin texto extra:
{
  "name": "${name}",
  "emoji": "${emoji || "🍽️"}",
  "time": "20 min",
  "difficulty": "Fácil",
  "servings": 1,
  "calories": "420 kcal aprox.",
  "ingredients": ["200g de pechuga de pollo", "1/2 taza de quinoa"],
  "steps": ["Herví la quinoa en caldo por 15 minutos.", "Cociná el pollo..."],
  "tip": "Podés preparar la quinoa con anticipación."
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: isEN ? "You respond ONLY with valid JSON. No markdown, no explanations." : "Respondés SOLO con JSON válido. Sin markdown, sin explicaciones." },
        { role: "user",   content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 700,
    });
    const data = parseJSON(completion.choices[0].message.content);
    logInfo("recipe", "recipe.generated", `Receta: ${req.user.email}`, { userId: req.user._id, userEmail: req.user.email, meta: { recipeName: data.name } });
    return res.json(data);
  } catch (err) {
    console.error("Recipes detail error:", err.message);
    return res.status(500).json({ error: isEN ? "Couldn't generate the recipe. Try again." : "No se pudo generar la receta. Intentá de nuevo." });
  }
});

/* ── Guardar receta ────────────────────────────────── */
router.post("/save", authMiddleware, async (req, res) => {
  const { name, emoji, modalidad, momento, time, difficulty, servings, calories, ingredients, steps, tip } = req.body;
  if (!name || !ingredients?.length || !steps?.length)
    return res.status(400).json({ error: "Datos de receta incompletos." });

  try {
    const existing = await SavedRecipe.findOne({ user: req.user._id, name });
    if (existing) return res.status(409).json({ error: "already_saved" });

    const saved = await SavedRecipe.create({
      user: req.user._id, name, emoji, modalidad, momento,
      time, difficulty, servings, calories, ingredients, steps, tip,
    });
    return res.json({ saved });
  } catch (err) {
    return res.status(500).json({ error: "Error al guardar la receta." });
  }
});

/* ── Listar recetas guardadas ──────────────────────── */
router.get("/saved", authMiddleware, async (req, res) => {
  try {
    const recipes = await SavedRecipe.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ recipes });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener recetas." });
  }
});

/* ── Imagen del plato con gpt-image-1 ────────────────── */
router.post("/image", authMiddleware, requireActiveSub, recipesLimiter, async (req, res) => {
  const { name, ingredients } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre de receta requerido." });

  const safeIngredients = Array.isArray(ingredients)
    ? ingredients.slice(0, 4).join(", ")
    : "";

  const prompt = `Professional food photography of "${name}"${safeIngredients ? `, made with ${safeIngredients}` : ""}. Beautifully plated on a white ceramic dish, natural light, top-down angle, fresh and appetizing, high resolution. No text, no watermarks.`;

  const cacheKey = name.toLowerCase().trim();

  // Caché DB
  try {
    const saved = await RecipeImage.findOne({ name: cacheKey });
    if (saved) return res.json({ imageUrl: saved.imageUrl, fromCache: "db" });
  } catch {}

  try {
    const { imageUrl } = await generateImage(getOpenAI(), { prompt, size: "1024x1024" });

    RecipeImage.findOneAndUpdate(
      { name: cacheKey },
      { $set: { name: cacheKey, imageUrl } },
      { upsert: true }
    ).catch((e) => console.error("Error guardando imagen receta:", e.message));

    return res.json({ imageUrl });
  } catch (err) {
    console.error("Recipe image error:", err.message);
    return res.status(500).json({ error: "Error al generar la imagen.", detail: err.message });
  }
});

/* ── Eliminar receta guardada ─────────────────────── */
router.delete("/saved/:id", authMiddleware, async (req, res) => {
  try {
    const recipe = await SavedRecipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Receta no encontrada." });
    if (recipe.user.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Sin permiso." });
    await recipe.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Error al eliminar la receta." });
  }
});

export default router;
