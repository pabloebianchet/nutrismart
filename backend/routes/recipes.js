import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.js";
import { requireActiveSub } from "../middleware/requireActiveSub.js";
import SavedRecipe from "../models/SavedRecipe.js";
import { logInfo, logWarn, logError } from "../utils/logger.js";

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

const parseJSON = (text) => {
  const clean = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
};

const userCtxStr = (ud) =>
  ud
    ? `El usuario es ${ud.sexo}, ${ud.edad} años, ${ud.peso}kg, ${ud.altura}cm, actividad física ${ud.actividad}.`
    : "";

/* ── 3 sugerencias ─────────────────────────────────── */
router.post("/suggestions", authMiddleware, requireActiveSub, recipesLimiter, async (req, res) => {
  const { modalidad, momento, userData } = req.body;
  if (!modalidad || !momento)
    return res.status(400).json({ error: "Modalidad y momento son requeridos." });

  const desc = MODALIDAD_DESC[modalidad] || modalidad;

  const prompt = `Sos un chef nutricionista argentino. Generá 3 recetas distintas y creativas para ${momento} con enfoque ${modalidad} (${desc}).
${userCtxStr(userData)}

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
        { role: "system", content: "Respondés SOLO con JSON válido. Sin markdown, sin explicaciones." },
        { role: "user",   content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 350,
    });
    const data = parseJSON(completion.choices[0].message.content);
    return res.json(data);
  } catch (err) {
    console.error("Recipes suggestions error:", err.message);
    return res.status(500).json({ error: "No se pudieron generar las recetas. Intentá de nuevo." });
  }
});

/* ── Receta completa ───────────────────────────────── */
router.post("/detail", authMiddleware, requireActiveSub, recipesLimiter, async (req, res) => {
  const { name, emoji, modalidad, momento, userData } = req.body;
  if (!name || !modalidad || !momento)
    return res.status(400).json({ error: "Datos incompletos." });

  const desc = MODALIDAD_DESC[modalidad] || modalidad;

  const prompt = `Sos un chef nutricionista argentino. Dá la receta completa de "${name}" para ${momento} con enfoque ${modalidad} (${desc}).
${userCtxStr(userData)}

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
        { role: "system", content: "Respondés SOLO con JSON válido. Sin markdown, sin explicaciones." },
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
    return res.status(500).json({ error: "No se pudo generar la receta. Intentá de nuevo." });
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

/* ── Generar imagen del plato con DALL-E ─────────────── */
router.post("/image", authMiddleware, requireActiveSub, recipesLimiter, async (req, res) => {
  const { name, emoji, modalidad, ingredients } = req.body;

  if (!name) return res.status(400).json({ error: "Nombre de receta requerido." });

  const safeIngredients = Array.isArray(ingredients)
    ? ingredients.slice(0, 5).join(", ")
    : "";

  const prompt = `Professional food photography of "${name}", ${
    safeIngredients ? `made with ${safeIngredients}, ` : ""
  }beautifully plated on a white ceramic dish, natural light, top-down angle, fresh and appetizing, high resolution, restaurant quality. No text, no watermarks.`;

  try {
    const openai = getOpenAI();

    // Intentar con dall-e-3, fallback a dall-e-2 si no está disponible
    let response;
    try {
      response = await openai.images.generate({
        model:   "dall-e-3",
        prompt,
        n:       1,
        size:    "1024x1024",
        quality: "standard",
      });
    } catch (e3) {
      console.warn("DALL-E 3 falló, intentando con dall-e-2:", e3.message);
      response = await openai.images.generate({
        model: "dall-e-2",
        prompt: prompt.slice(0, 1000), // dall-e-2 tiene límite de 1000 chars
        n:     1,
        size:  "512x512",
      });
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) return res.status(500).json({ error: "No se pudo generar la imagen." });

    return res.json({ imageUrl });
  } catch (err) {
    console.error("DALL-E error completo:", err.status, err.message, err.error);
    return res.status(500).json({
      error: "Error al generar la imagen.",
      debug: { status: err.status, message: err.message, detail: err.error?.message },
    });
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
