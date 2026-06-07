import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.js";
import { requireActiveSub } from "../middleware/requireActiveSub.js";
import User from "../models/User.js";
import TrainingPlan from "../models/TrainingPlan.js";
import { sendNotificationEmail } from "../utils/sendNotificationEmail.js";
import { logInfo, logWarn, logError } from "../utils/logger.js";
import { generateImage }        from "../utils/generateImage.js";
import ExerciseImage       from "../models/ExerciseImage.js";
import ExerciseDescription from "../models/ExerciseDescription.js";
import { uploadImage }     from "../utils/cloudinary.js";
import Exercise            from "../models/Exercise.js";

const router = express.Router();
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Caché en memoria para imágenes de ejercicios (evita repetir llamadas a Unsplash)
const exerciseImageCache = new Map();

const trainingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Demasiadas solicitudes. Esperá un momento." },
});

const parseJSON = (text) => {
  const clean = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
};

/* ── Whitelists ───────────────────────────────────────────────────────────── */
const TIPOS_OK      = new Set(["Calistenia", "Hipertrofia", "Fit"]);
const LUGARES_OK    = new Set(["Gym", "Casa"]);
const DURACIONES_OK = new Set(["1 día", "15 días", "1 mes", "3 meses", "6 meses"]);
const FRECUENCIAS_OK = new Set([1, 2, 3, 4, 5, 6]);
const SEXOS_OK      = new Set(["Femenino", "Masculino", "Otro"]);
const ACTIVIDAD_OK  = new Set(["Nula", "Moderada", "Intensa", "Profesional"]);

/* ── Sanitización de strings libres ─────────────────────────────────────── */
// Elimina caracteres de control y limita longitud.
// No bloquea letras acentuadas ni puntuación normal.
const sanitize = (val, maxLen = 100) => {
  if (typeof val !== "string") return "";
  return val
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // chars de control
    .replace(/`/g, "'")                                  // backticks (riesgo prompt)
    .trim()
    .slice(0, maxLen);
};

const EQUIP = {
  "Gym":        "equipamiento completo: barras olímpicas, mancuernas de todo peso, máquinas de cables y poleas, banco ajustable",
  "Casa":       "peso corporal, mancuernas opcionales, silla, bandas elásticas, sin máquinas",
};

/* ── Generar plan ─────────────────────────────────────────────────────────── */
router.post("/generate", authMiddleware, requireActiveSub, trainingLimiter, async (req, res) => {
  const { tipo, lugar, duracion, frecuencia, userData, prevPlan } = req.body;

  // ── Whitelist: todos los valores enumerables deben estar en la lista ──────
  if (!TIPOS_OK.has(tipo))
    return res.status(400).json({ error: "Tipo de entrenamiento no válido." });
  if (!DURACIONES_OK.has(duracion))
    return res.status(400).json({ error: "Duración no válida." });
  const frecNum = Number(frecuencia);
  if (!FRECUENCIAS_OK.has(frecNum))
    return res.status(400).json({ error: "Frecuencia no válida." });
  const lugarEfectivo = lugar || "Gym";
  if (!LUGARES_OK.has(lugarEfectivo))
    return res.status(400).json({ error: "Lugar no válido." });

  // ── userData: solo campos numéricos y enumerables ─────────────────────────
  const safeUserCtx = userData ? (() => {
    const sexo     = SEXOS_OK.has(userData.sexo)     ? userData.sexo     : "no especificado";
    const actividad= ACTIVIDAD_OK.has(userData.actividad) ? userData.actividad : "Moderada";
    const edad     = Math.min(120, Math.max(1, parseInt(userData.edad)  || 0));
    const peso     = Math.min(350, Math.max(20, parseFloat(userData.peso) || 0));
    const altura   = Math.min(260, Math.max(80, parseFloat(userData.altura) || 0));
    return `El usuario es ${sexo}, ${edad} años, ${peso}kg, ${altura}cm, nivel de actividad: ${actividad}.`;
  })() : "";

  // ── prevPlan: solo título sanitizado, sin más datos del localStorage ──────
  const equipamiento = EQUIP[lugarEfectivo] || "equipamiento básico";
  const prevCtx = prevPlan?.planTitle
    ? `Plan anterior completado: "${sanitize(prevPlan.planTitle, 80)}". Diseñá el nuevo plan con progresividad y mayor carga/volumen que el anterior.`
    : "";
  // Reglas específicas por combinación tipo + lugar
  const getTipoRules = (tipo, lugar) => {
    if (tipo === "Calistenia") {
      if (lugar === "Gym")
        return `CALISTENIA EN GYM: SOLO peso corporal. Usá barra de dominadas, anillas y paralelas. PROHIBIDO mancuernas, barras con carga, máquinas. Distribución: tirón (dominadas/espalda), empuje (flexiones/fondos), piernas y core.`;
      if (lugar === "Casa")
        return `CALISTENIA EN CASA: SOLO peso corporal. Ejercicios: flexiones (variantes), sentadillas, zancadas, plancha, fondos en silla, elevación de piernas, glute bridge, pike push-up, hollow body.`;
    }
    if (tipo === "Hipertrofia") {
      if (lugar === "Gym")
        return `HIPERTROFIA EN GYM: Barras olímpicas, mancuernas, máquinas. Compuestos: press de banca, sentadilla, peso muerto, remo, press militar. Aislamiento: curl, tríceps, laterales, jalón. Series 3-5 × 6-12. Distribución Push/Pull/Legs.`;
      if (lugar === "Casa")
        return `HIPERTROFIA EN CASA: Mancuernas opcionales. Con ellas: curl, press en suelo, remo inclinado, press hombros, goblet, hip thrust. Sin ellas: flexiones variantes, sentadilla una pierna, fondos en silla, remo con mochila.`;
    }
    if (tipo === "Fit") {
      if (lugar === "Gym")
        return `FIT EN GYM: Circuitos funcionales, poco descanso. Kettlebell, battle ropes, TRX, box jump, ergómetro. Formato AMRAP o circuitos 4-6 ejercicios × 3-4 rondas.`;
      if (lugar === "Casa")
        return `FIT EN CASA: HIIT bodyweight. Burpees, jumping jacks, mountain climbers, sentadilla con salto, flexiones rápidas, plancha dinámica. Tabata o circuitos 5-6 ejercicios × 3 rondas.`;
    }
    return "";
  };

  const tipoRules = getTipoRules(tipo, lugarEfectivo);
  const variationSeed = `[Variación #${Math.floor(Math.random() * 9000) + 1000}]`;

  // Obtener ejercicios del catálogo que coincidan con tipo+lugar
  const catalogExercises = await Exercise.find({
    tipos:   tipo,
    lugares: lugarEfectivo,
    seeded:  true,
    imageUrl: { $ne: null },
    active:  true,
  }).select("name muscleGroup").lean();

  const exerciseList = catalogExercises.length > 0
    ? `\nEJERCICIOS DISPONIBLES (usá ÚNICAMENTE estos nombres exactos, sin inventar otros):\n${catalogExercises.map(e => `- ${e.name}`).join("\n")}\n`
    : "";

  const prompt = `Sos un entrenador personal profesional argentino. Generá un plan de entrenamiento personalizado.
${safeUserCtx}
Tipo: ${tipo}. Lugar: ${lugarEfectivo}. Duración: ${duracion}. Frecuencia: ${frecNum} días/semana.${prevCtx ? "\n" + prevCtx : ""}
${variationSeed}
${exerciseList}
${tipoRules}

Distribución inteligente de grupos musculares para ${frecNum} días (push/pull/legs, full body, etc.). weekStructure debe tener EXACTAMENTE ${frecNum} entrada${frecNum > 1 ? "s" : ""}. Máximo 6 ejercicios por sesión con series, reps y descanso.

Respondé ÚNICAMENTE con este JSON sin texto extra:
{
  "planTitle": "Nombre corto del plan",
  "summary": "Descripción del plan en 2 líneas. Objetivo y metodología.",
  "weekStructure": {
    "day1": {
      "name": "Nombre del día (ej: Push / Full Body / Rodaje suave)",
      "focus": "Grupos musculares o descripción breve de la sesión",
      "exercises": [
        { "name": "Nombre del ejercicio o sesión", "sets": 4, "reps": "8-12", "rest": "90 seg", "notes": "Tip técnico breve" }
      ]
    }
  },
  "progression": [
    { "phase": "Semanas 1-2", "focus": "Adaptación", "note": "Descripción de qué ajustar en esta fase" }
  ],
  "weeklyTips": {
    "1": "Tip motivador y útil para la semana 1",
    "2": "Tip para semana 2",
    "3": "Tip para semana 3",
    "4": "Tip para semana 4"
  },
  "equipment": ["Elemento 1", "Elemento 2"],
  "disclaimer": "Este plan es orientativo. Consultá con un profesional de la salud antes de comenzar cualquier actividad física."
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Respondés SOLO con JSON válido. Sin markdown ni texto adicional." },
        { role: "user",   content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });
    const data = parseJSON(completion.choices[0].message.content);
    logInfo("training", "plan.generated", `Plan generado: ${req.user.email}`, { userId: req.user._id, userName: req.user.name, userEmail: req.user.email, meta: { tipo, duracion } });
    return res.json(data);
  } catch (err) {
    console.error("Training generate error:", err.message);
    return res.status(500).json({ error: "No se pudo generar el plan. Intentá de nuevo." });
  }
});

/* ── Tips personalizados ──────────────────────────────────────────────────── */
router.post("/tips", authMiddleware, requireActiveSub, trainingLimiter, async (req, res) => {
  const { tipo, semana, planSummary } = req.body;

  // Whitelist tipo
  if (!TIPOS_OK.has(tipo))
    return res.status(400).json({ error: "Tipo no válido." });

  const semanaNum   = Math.min(52, Math.max(1, parseInt(semana) || 1));
  const safeSummary = sanitize(planSummary, 200) || "plan de entrenamiento personalizado";

  const prompt = `Sos un entrenador personal profesional. Generá 4 tips concretos y motivadores para la semana ${semanaNum} de un plan de ${tipo}.
Contexto: ${safeSummary}.

Respondé ÚNICAMENTE con este JSON:
{
  "tips": [
    { "icon": "💪", "title": "Técnica", "body": "Consejo específico de técnica o ejecución para esta semana..." },
    { "icon": "😴", "title": "Recuperación", "body": "Consejo de descanso y recuperación muscular..." },
    { "icon": "🥗", "title": "Nutrición", "body": "Tip nutricional contextual al tipo de entrenamiento..." },
    { "icon": "📈", "title": "Progresión", "body": "Cuándo y cómo aumentar carga o intensidad esta semana..." }
  ]
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Respondés SOLO con JSON válido." },
        { role: "user",   content: prompt },
      ],
      temperature: 0.75,
      max_tokens: 600,
    });
    const data = parseJSON(completion.choices[0].message.content);
    return res.json(data);
  } catch (err) {
    console.error("Training tips error:", err.message);
    return res.status(500).json({ error: "No se pudieron generar los tips." });
  }
});

/* ── Registrar sesión completada (+5 puntos saludables) ───────────────────── */
router.post("/session", authMiddleware, async (req, res) => {
  const { dayName, tipoLabel } = req.body;

  // Sanitizar antes de usar en email o logs
  const safeDayName  = sanitize(dayName,   50) || null;
  const safeTipoLabel = TIPOS_OK.has(tipoLabel) ? tipoLabel : null;

  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { healthyPoints: 5 } },
      { returnDocument: "after" }
    );
    if (!updated) return res.status(404).json({ error: "Usuario no encontrado." });

    // Email de notificación (async, no bloquea respuesta)
    if (!updated.notifPrefs?.paused && updated.notifPrefs?.training !== false) {
      sendNotificationEmail("training", {
        name:        updated.name,
        email:       updated.email,
        dayName:     safeDayName,
        tipoLabel:   safeTipoLabel,
        totalPoints: updated.healthyPoints,
      }).catch(() => {});
    }

    return res.json({ pointsEarned: 5, totalPoints: updated.healthyPoints });
  } catch (err) {
    console.error("Training session points error:", err.message);
    return res.status(500).json({ error: "No se pudieron actualizar los puntos." });
  }
});

/* ── GET /plans — devuelve los dos slots del usuario ─────────────────────── */
router.get("/plans", authMiddleware, async (req, res) => {
  try {
    const [mainDoc, quickDoc] = await Promise.all([
      TrainingPlan.findOne({ user: req.user._id, planType: "main" }),
      TrainingPlan.findOne({ user: req.user._id, planType: "quick" }),
    ]);

    const toObj = (doc) =>
      doc
        ? { config: doc.config, plan: doc.plan, startDate: doc.startDate, totalDays: doc.totalDays, sessions: doc.sessions }
        : null;

    return res.json({ main: toObj(mainDoc), quick: toObj(quickDoc) });
  } catch (err) {
    console.error("GET /training/plans error:", err.message);
    return res.status(500).json({ error: "Error al obtener los planes." });
  }
});

/* ── PUT /plan/:planType — upsert completo ────────────────────────────────── */
router.put("/plan/:planType", authMiddleware, async (req, res) => {
  const { planType } = req.params;
  if (!["main", "quick"].includes(planType))
    return res.status(400).json({ error: "Tipo de plan no válido." });

  const { config, plan, startDate, totalDays, sessions } = req.body;

  try {
    const doc = await TrainingPlan.findOneAndUpdate(
      { user: req.user._id, planType },
      { $set: { config, plan, startDate, totalDays, sessions: sessions || [] } },
      { upsert: true, returnDocument: "after", runValidators: false }
    );
    logInfo("training", "session.saved", `Sesión: ${req.user.email}`, { userId: req.user._id, userEmail: req.user.email, meta: { dayKey: null, planType } });
    return res.json({ ok: true, id: doc._id });
  } catch (err) {
    console.error("PUT /training/plan error:", err.message);
    return res.status(500).json({ error: "Error al guardar el plan." });
  }
});

/* ── POST /plan/:planType/session — agrega una sesión ─────────────────────── */
router.post("/plan/:planType/session", authMiddleware, async (req, res) => {
  const { planType } = req.params;
  if (!["main", "quick"].includes(planType))
    return res.status(400).json({ error: "Tipo de plan no válido." });

  const { date, dayKey, dayName, exercises } = req.body;
  if (!date || !dayKey)
    return res.status(400).json({ error: "Faltan datos de la sesión." });

  try {
    const doc = await TrainingPlan.findOneAndUpdate(
      { user: req.user._id, planType },
      { $push: { sessions: { date, dayKey, dayName: dayName || dayKey, exercises: exercises || {} } } },
      { returnDocument: "after" }
    );
    if (!doc) return res.status(404).json({ error: "Plan no encontrado." });
    logInfo("training", "session.saved", `Sesión: ${req.user.email}`, { userId: req.user._id, userEmail: req.user.email, meta: { dayKey, planType } });
    return res.json({ ok: true, sessionsCount: doc.sessions.length });
  } catch (err) {
    console.error("POST /training/plan/session error:", err.message);
    return res.status(500).json({ error: "Error al guardar la sesión." });
  }
});

/* ── DELETE /plan/:planType — borra el slot ───────────────────────────────── */
router.delete("/plan/:planType", authMiddleware, async (req, res) => {
  const { planType } = req.params;
  if (!["main", "quick"].includes(planType))
    return res.status(400).json({ error: "Tipo de plan no válido." });

  try {
    await TrainingPlan.deleteOne({ user: req.user._id, planType });
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /training/plan error:", err.message);
    return res.status(500).json({ error: "Error al eliminar el plan." });
  }
});

/* ── Descripción del ejercicio con GPT (caché DB) ──────────────── */
router.post("/exercise-description", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido." });

  const cacheKey = name.toLowerCase().trim();

  // 1. Buscar en DB
  const cached = await ExerciseDescription.findOne({ name: cacheKey });
  if (cached) return res.json({ muscles: cached.muscles, execution: cached.execution, mistakes: cached.mistakes });

  // 2. Generar con GPT
  try {
    const openai = getOpenAI();
    const gpt = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "Sos un entrenador personal argentino. Respondés SOLO con JSON válido, sin markdown.",
      }, {
        role: "user",
        content: `Describí el ejercicio "${name}" en español argentino. Sé conciso y directo.
JSON:
{
  "muscles": "músculos principales que trabaja (1 línea, máx 60 chars)",
  "execution": "cómo ejecutarlo correctamente (2-3 oraciones clave)",
  "mistakes": "error más común a evitar (1 oración)"
}`,
      }],
      max_tokens: 200,
      temperature: 0.4,
    });

    const raw  = gpt.choices[0].message.content.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(raw);

    // Guardar en DB
    await ExerciseDescription.findOneAndUpdate(
      { name: cacheKey },
      { $set: { name: cacheKey, ...data } },
      { upsert: true }
    );

    return res.json(data);
  } catch (err) {
    console.error("Exercise description error:", err.message);
    return res.status(500).json({ error: "Error al generar descripción." });
  }
});

/* ── Ejercicio alternativo con GPT ────────────────────────────── */
router.post("/exercise-alternative", authMiddleware, async (req, res) => {
  const { name, tipo, lugar, focus } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido." });

  try {
    const openai = getOpenAI();
    const equip  = EQUIP[lugar] || "equipamiento básico";
    const gpt = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "Sos un entrenador personal argentino. Respondés SOLO con JSON válido.",
      }, {
        role: "user",
        content: `Sugirí UN ejercicio alternativo a "${name}" para un plan de ${tipo || "entrenamiento"} en ${lugar || "gym"} (${equip}).
El ejercicio debe trabajar los mismos músculos principales y tener dificultad similar.
Foco del día: ${focus || "general"}.

Solo JSON:
{"name":"Nombre del ejercicio","sets":4,"reps":"8-12","rest":"90 seg","notes":"Tip técnico breve"}`,
      }],
      max_tokens: 120,
      temperature: 0.7,
    });

    const raw  = gpt.choices[0].message.content.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(raw);
    return res.json(data);
  } catch (err) {
    console.error("Exercise alternative error:", err.message);
    return res.status(500).json({ error: "Error al generar alternativa." });
  }
});

/* ── Diagnóstico: modelos disponibles para esta API key ────────── */
router.get("/models-available", authMiddleware, async (req, res) => {
  try {
    const openai  = getOpenAI();
    const models  = await openai.models.list();
    const imageModels = models.data
      .map((m) => m.id)
      .filter((id) => id.includes("image") || id.includes("dall"));
    console.log("Modelos de imagen disponibles:", imageModels);
    return res.json({ imageModels, total: models.data.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── Imagen de ejercicio (caché DB + generación IA) ───────────── */
router.post("/exercise-image", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido." });

  const cacheKey = name.toLowerCase().trim();

  // 1. Caché en memoria
  if (exerciseImageCache.has(cacheKey)) {
    return res.json({ ...exerciseImageCache.get(cacheKey), fromCache: "memory" });
  }

  // 2. Base de ejercicios seeded con Cloudinary — solo match exacto o muy cercano
  try {
    const normKey = cacheKey.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, "").trim();

    // Primero: match exacto por nameNorm
    let seeded = await Exercise.findOne({ nameNorm: normKey, seeded: true, imageUrl: { $ne: null } })
      .select("imageUrl").lean();

    // Segundo: todas las palabras significativas deben estar presentes
    if (!seeded) {
      const words = normKey.split(" ").filter((w) => w.length > 3);
      if (words.length >= 2) {
        const regex = words.map((w) => `(?=.*${w})`).join("");
        seeded = await Exercise.findOne({
          nameNorm: { $regex: regex, $options: "i" },
          seeded: true,
          imageUrl: { $ne: null },
        }).select("imageUrl").lean();
      }
    }

    if (seeded?.imageUrl) {
      const result = { imageUrl: seeded.imageUrl };
      exerciseImageCache.set(cacheKey, result);
      return res.json({ ...result, fromCache: "exercise-db" });
    }
    console.log(`[exercise-image] No encontrado en Exercise DB: "${cacheKey}"`);
  } catch (e) {
    console.warn("[exercise-image] Error buscando en Exercise DB:", e.message);
  }

  // 3. Caché legacy ExerciseImage (base64 o Cloudinary URL)
  try {
    const saved = await ExerciseImage.findOne({ name: cacheKey });
    if (saved) {
      const result = { imageUrl: saved.imageUrl };
      exerciseImageCache.set(cacheKey, result);
      return res.json({ ...result, fromCache: "db" });
    }
  } catch (dbErr) {
    console.warn("DB cache lookup error:", dbErr.message);
  }

  // 3. Generar con IA → guardar en DB y memoria
  const prompt = `Professional fitness photography of a person performing "${name}" exercise with perfect form. Clear gym background, natural lighting, full body shot showing correct technique, athletic person, high quality fitness photography. No text, no watermarks.`;

  try {
    console.log(`[exercise-image] Generando con IA: "${name}"`);
    const { imageUrl: dalleUrl } = await generateImage(getOpenAI(), { prompt, size: "1024x1024" });

    const publicId = `exercises/${cacheKey.replace(/\s+/g, "_").replace(/[^a-z0-9_]/gi, "")}`;
    const imageUrl = await uploadImage(dalleUrl, "exercises", publicId);

    // Guardar URL de Cloudinary en DB (fire-and-forget)
    ExerciseImage.findOneAndUpdate(
      { name: cacheKey },
      { $set: { name: cacheKey, imageUrl } },
      { upsert: true }
    ).catch((e) => console.error("Error guardando imagen en DB:", e.message));

    const result = { imageUrl };
    exerciseImageCache.set(cacheKey, result);
    return res.json({ ...result, fromCache: "none" });
  } catch (err) {
    console.error(`[exercise-image] Error generando IA para "${name}":`, err.message);
    return res.status(500).json({ error: "Error al generar imagen.", detail: err.message });
  }
});

/* ── GET /exercises/search — autocomplete por nombre ────────────── */
router.get("/exercises/search", authMiddleware, async (req, res) => {
  try {
    const { q = "", tipo, lugar } = req.query;
    const norm = q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, "").trim();

    const filter = { seeded: true };
    if (norm) filter.nameNorm = { $regex: norm, $options: "i" };
    if (tipo)  filter.tipos   = tipo;
    if (lugar) filter.lugares = lugar;

    const results = await Exercise.find(filter)
      .select("name muscleGroup imageUrl tipos lugares equipment")
      .limit(20)
      .lean();

    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: "Error en búsqueda." });
  }
});

/* ── GET /exercises/similar — 3 ejercicios similares ────────────── */
router.get("/exercises/similar", authMiddleware, async (req, res) => {
  try {
    const { muscleGroup, exclude, tipo, lugar } = req.query;
    if (!muscleGroup) return res.status(400).json({ error: "muscleGroup requerido." });

    // exclude puede ser un nombre o una lista separada por comas
    const excludeList = exclude ? exclude.split(",").map(n => n.trim()).filter(Boolean) : [];

    const filter = { seeded: true, muscleGroup };
    if (excludeList.length) filter.name = { $nin: excludeList };
    if (tipo)    filter.tipos   = tipo;
    if (lugar)   filter.lugares = lugar;

    let results = await Exercise.find(filter).select("name muscleGroup imageUrl equipment description").lean();

    if (results.length < 3) {
      const fallback = { seeded: true, muscleGroup, ...(excludeList.length && { name: { $nin: excludeList } }) };
      results = await Exercise.find(fallback).select("name muscleGroup imageUrl equipment description").lean();
    }

    // Shuffle y devolver 3
    const shuffled = results.sort(() => Math.random() - 0.5).slice(0, 3);
    return res.json(shuffled);
  } catch (err) {
    return res.status(500).json({ error: "Error al buscar similares." });
  }
});

export default router;
