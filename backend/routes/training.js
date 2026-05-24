import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.js";

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

const EQUIP = {
  "Gym":        "equipamiento completo: barras olímpicas, mancuernas de todo peso, máquinas de cables y poleas, banco ajustable",
  "Aire libre": "peso corporal, barras de calistenia de plaza, bandas elásticas, sin maquinaria",
  "Casa":       "peso corporal, mancuernas opcionales, silla, bandas elásticas, sin máquinas",
};

/* ── Generar plan ─────────────────────────────────────────────────────────── */
router.post("/generate", authMiddleware, trainingLimiter, async (req, res) => {
  const { tipo, lugar, duracion, frecuencia, userData, prevPlan } = req.body;
  if (!tipo || !duracion || !frecuencia)
    return res.status(400).json({ error: "Datos incompletos." });

  const userCtx = userData
    ? `El usuario es ${userData.sexo}, ${userData.edad} años, ${userData.peso}kg, ${userData.altura}cm, nivel de actividad: ${userData.actividad}.`
    : "";
  const lugarEfectivo = tipo === "Ejercicio en Casa" ? "Casa" : (lugar || "Casa");
  const equipamiento  = EQUIP[lugarEfectivo] || "equipamiento básico";
  const prevCtx       = prevPlan
    ? `Plan anterior completado: "${prevPlan.planTitle}". Diseñá el nuevo plan con progresividad y mayor carga/volumen que el anterior.`
    : "";
  const isRunning = tipo === "Running";

  const prompt = `Sos un entrenador personal profesional argentino. Generá un plan de entrenamiento personalizado.
${userCtx}
Tipo: ${tipo}. Lugar: ${lugarEfectivo} (${equipamiento}). Duración: ${duracion}. Frecuencia: ${frecuencia} días/semana.${prevCtx ? "\n" + prevCtx : ""}

${isRunning
  ? `Para Running: cada entrada en weekStructure es una sesión. Incluí km objetivo, tiempo estimado y ritmo (suave/moderado/fuerte). Progresión gradual de volumen semanal.`
  : `Distribución inteligente de grupos musculares para ${frecuencia} días (push/pull/legs, full body, etc.). Máximo 6 ejercicios por sesión con series, reps y descanso.`}

Respondé ÚNICAMENTE con este JSON sin texto extra:
{
  "planTitle": "Nombre corto del plan",
  "summary": "Descripción del plan en 2 líneas. Objetivo y metodología.",
  "weekStructure": {
    "day1": {
      "name": "Nombre del día (ej: Push / Full Body / Sesión 1)",
      "focus": "Grupos musculares o descripción breve",
      "exercises": [
        { "name": "Nombre del ejercicio", "sets": 4, "reps": "8-12", "rest": "90 seg", "notes": "Tip técnico breve" }
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
  if (!tipo) return res.status(400).json({ error: "Datos incompletos." });

  const prompt = `Sos un entrenador personal profesional. Generá 4 tips concretos y motivadores para la semana ${semana || 1} de un plan de ${tipo}.
Contexto: ${planSummary || "plan de entrenamiento personalizado"}.

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

export default router;
