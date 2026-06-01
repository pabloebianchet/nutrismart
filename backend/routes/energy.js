import express        from "express";
import OpenAI          from "openai";
import { authMiddleware } from "../middleware/auth.js";
import DailyLog        from "../models/DailyLog.js";
import TrainingPlan    from "../models/TrainingPlan.js";

const router   = express.Router();
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const todayDate = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

/* ─── Calorías estimadas por tipo de entrenamiento (kcal/min) ── */
const KCAL_PER_MIN = {
  "Hipertrofia":      7,
  "Calistenia":       6,
  "Running":          9,
  "Fit":              7,
  "Ejercicio en Casa":5,
};

/* ─── GET /today ─ balance completo del día ─────────────────── */
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const user    = req.user;
    const date    = todayDate();

    // Leer log del día (o vacío)
    const log = await DailyLog.findOne({ user: user._id, date }) || { entries: [] };

    // Leer sesión de hoy del módulo de entrenamiento
    let trainingKcal = 0;
    const plans = await TrainingPlan.find({ user: user._id }).lean();
    for (const plan of plans) {
      const todaySessions = (plan.sessions || []).filter((s) => {
        const d = new Date(s.date || s.createdAt);
        return d.toLocaleDateString("en-CA") === date;
      });
      if (todaySessions.length > 0 && plan.config?.tipo) {
        const kcalPerMin = KCAL_PER_MIN[plan.config.tipo] || 6;
        const mins = (plan.config.frecuencia || 1) > 0 ? 45 : 45; // estimado 45 min/sesión
        trainingKcal += todaySessions.length * kcalPerMin * mins;
      }
    }
    trainingKcal = Math.round(trainingKcal);

    // Calcular totales del log
    const comida    = log.entries.filter((e) => e.tipo === "comida");
    const actividad = log.entries.filter((e) => e.tipo === "actividad");
    const agua      = log.entries.filter((e) => e.tipo === "agua");

    const totalConsumido = comida.reduce((a, e) => a + (e.kcal || 0), 0);
    const totalNEAT      = actividad.reduce((a, e) => a + (e.kcal || 0), 0);
    const totalAgua      = agua.reduce((a, e) => a + (e.agua_ml || 0), 0);
    const totalProteinas = comida.reduce((a, e) => a + (e.proteinas || 0), 0);
    const totalCarbos    = comida.reduce((a, e) => a + (e.carbos || 0), 0);
    const totalGrasas    = comida.reduce((a, e) => a + (e.grasas || 0), 0);

    return res.json({
      date,
      entries:         log.entries,
      trainingKcal,
      totalConsumido:  Math.round(totalConsumido),
      totalNEAT:       Math.round(totalNEAT),
      totalAgua:       Math.round(totalAgua),
      totalProteinas:  Math.round(totalProteinas),
      totalCarbos:     Math.round(totalCarbos),
      totalGrasas:     Math.round(totalGrasas),
    });
  } catch (err) {
    console.error("Energy today error:", err.message);
    return res.status(500).json({ error: "Error al obtener balance." });
  }
});

/* ─── POST /parse ─ interpretar texto/voz con GPT ───────────── */
router.post("/parse", authMiddleware, async (req, res) => {
  const { texto, peso = 70, sexo = "M", edad = 30 } = req.body;
  if (!texto?.trim()) return res.status(400).json({ error: "Texto requerido." });

  try {
    const openai = getOpenAI();
    const gpt = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "Sos un nutricionista argentino. Respondés SOLO con JSON válido, sin markdown.",
      }, {
        role: "user",
        content: `El usuario (${peso}kg, ${sexo === "M" || sexo === "masculino" ? "hombre" : "mujer"}, ${edad} años) registró:
"${texto}"

Determiná si es COMIDA, ACTIVIDAD FÍSICA o AGUA y respondé con uno de estos formatos:

COMIDA:
{"tipo":"comida","resumen":"descripción breve","items":[{"nombre":"...","cantidad":"...","kcal":0,"proteinas":0,"carbos":0,"grasas":0}],"totales":{"kcal":0,"proteinas":0,"carbos":0,"grasas":0}}

ACTIVIDAD:
{"tipo":"actividad","resumen":"descripción breve","items":[{"nombre":"...","duracion_min":0,"intensidad":"suave|moderada|intensa","kcal":0}],"totales":{"kcal":0}}

AGUA:
{"tipo":"agua","resumen":"...","agua_ml":0}

REGLAS IMPORTANTES:
- Si no se menciona cantidad, usar porción estándar argentina
- Si dice "un poco" o "algo", usar porción mínima
- SIEMPRE subestimar ante la duda (mejor que el usuario corrija hacia arriba)
- Para actividades, usar MET estándar y el peso del usuario
- Solo JSON, sin texto adicional`,
      }],
      max_tokens: 400,
      temperature: 0.3,
    });

    const raw  = gpt.choices[0].message.content.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(raw);
    return res.json(data);
  } catch (err) {
    console.error("Energy parse error:", err.message);
    return res.status(500).json({ error: "Error al interpretar el texto." });
  }
});

/* ─── POST /log ─ guardar entrada confirmada ────────────────── */
router.post("/log", authMiddleware, async (req, res) => {
  try {
    const { parsed } = req.body; // resultado de /parse ya confirmado por el usuario
    if (!parsed?.tipo) return res.status(400).json({ error: "Datos inválidos." });

    const date  = todayDate();
    const entry = {
      tipo:      parsed.tipo,
      resumen:   parsed.resumen,
      items:     parsed.items || [],
      kcal:      Math.round(parsed.totales?.kcal || parsed.totales?.kcal || 0),
      proteinas: Math.round(parsed.totales?.proteinas || 0),
      carbos:    Math.round(parsed.totales?.carbos || 0),
      grasas:    Math.round(parsed.totales?.grasas || 0),
      agua_ml:   Math.round(parsed.agua_ml || 0),
    };

    const log = await DailyLog.findOneAndUpdate(
      { user: req.user._id, date },
      { $push: { entries: entry } },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, entry: log.entries[log.entries.length - 1] });
  } catch (err) {
    return res.status(500).json({ error: "Error al guardar entrada." });
  }
});

/* ─── DELETE /log/:entryId ─ eliminar entrada ───────────────── */
router.delete("/log/:entryId", authMiddleware, async (req, res) => {
  try {
    const date = todayDate();
    await DailyLog.findOneAndUpdate(
      { user: req.user._id, date },
      { $pull: { entries: { _id: req.params.entryId } } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Error al eliminar entrada." });
  }
});

/* ─── GET /history ─ historial según plan ───────────────────── */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.query;
    const limit = plan === "gold" ? 365 : plan === "silver" ? 30 : 1;
    const logs  = await DailyLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(limit)
      .lean();
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener historial." });
  }
});

export default router;
