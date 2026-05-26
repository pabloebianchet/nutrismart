import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";
import TrainingPlan from "../models/TrainingPlan.js";
import { sendNotificationEmail } from "../utils/sendNotificationEmail.js";

const router = express.Router();
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
const TIPOS_OK      = new Set(["Calistenia", "Hipertrofia", "Fit", "Ejercicio en Casa", "Running"]);
const LUGARES_OK    = new Set(["Gym", "Aire libre", "Casa"]);
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
  "Aire libre": "peso corporal, barras de calistenia de plaza, bandas elásticas, sin maquinaria",
  "Casa":       "peso corporal, mancuernas opcionales, silla, bandas elásticas, sin máquinas",
};

/* ── Generar plan ─────────────────────────────────────────────────────────── */
router.post("/generate", authMiddleware, trainingLimiter, async (req, res) => {
  const { tipo, lugar, duracion, frecuencia, userData, prevPlan } = req.body;

  // ── Whitelist: todos los valores enumerables deben estar en la lista ──────
  if (!TIPOS_OK.has(tipo))
    return res.status(400).json({ error: "Tipo de entrenamiento no válido." });
  if (!DURACIONES_OK.has(duracion))
    return res.status(400).json({ error: "Duración no válida." });
  const frecNum = Number(frecuencia);
  if (!FRECUENCIAS_OK.has(frecNum))
    return res.status(400).json({ error: "Frecuencia no válida." });
  const lugarEfectivo = tipo === "Ejercicio en Casa" ? "Casa" : (lugar || "Casa");
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
  const isRunning = tipo === "Running";

  const prompt = `Sos un entrenador personal profesional argentino. Generá un plan de entrenamiento personalizado.
${safeUserCtx}
Tipo: ${tipo}. Lugar: ${lugarEfectivo} (${equipamiento}). Duración: ${duracion}. Frecuencia: ${frecNum} días/semana.${prevCtx ? "\n" + prevCtx : ""}

${isRunning
  ? `PLAN DE RUNNING — REGLAS ESTRICTAS:
1. weekStructure debe tener EXACTAMENTE ${frecNum} entrada${frecNum > 1 ? "s" : ""} (día1, día2… día${frecNum}), una por día de entrenamiento semanal. NI MÁS NI MENOS.
2. Cada entrada representa UN día de entrenamiento completo (no una semana, no una fase).
3. Dentro de cada día, el array "exercises" tiene 3 entradas fijas: calentamiento, sesión principal y vuelta a la calma.
4. PROHIBIDO incluir flexiones, abdominales, sentadillas ni ningún ejercicio que no sea correr o trotar.
5. Usá estos campos así:
   - "name": descripción de la parte (ej: "Calentamiento", "Rodaje principal", "Vuelta a la calma")
   - "sets": kilómetros como número entero (ej: 2 para 2km)
   - "reps": ritmo o intensidad (ej: "Suave", "Moderado", "Fuerte", "Intervalos")
   - "rest": tiempo estimado total (ej: "15 min", "35 min")
   - "notes": tip de técnica de carrera o respiración
6. Ejemplo de nombre de día: "Día 1 — Rodaje suave", "Día 2 — Tirada larga".
7. Progresión de volumen: +10% máximo por semana.`
  : `Distribución inteligente de grupos musculares para ${frecNum} días (push/pull/legs, full body, etc.). weekStructure debe tener EXACTAMENTE ${frecNum} entrada${frecNum > 1 ? "s" : ""}. Máximo 6 ejercicios por sesión con series, reps y descanso.`}

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
      temperature: 0.7,
      max_tokens: 2000,
    });
    const data = parseJSON(completion.choices[0].message.content);
    return res.json(data);
  } catch (err) {
    console.error("Training generate error:", err.message);
    return res.status(500).json({ error: "No se pudo generar el plan. Intentá de nuevo." });
  }
});

/* ── Tips personalizados ──────────────────────────────────────────────────── */
router.post("/tips", authMiddleware, trainingLimiter, async (req, res) => {
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
      { new: true }
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
      { upsert: true, new: true, runValidators: false }
    );
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
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Plan no encontrado." });
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

export default router;
