import express        from "express";
import OpenAI          from "openai";
import { authMiddleware } from "../middleware/auth.js";
import DailyLog        from "../models/DailyLog.js";
import TrainingPlan    from "../models/TrainingPlan.js";
import User            from "../models/User.js";

const router   = express.Router();
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const todayDate = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }); // YYYY-MM-DD en zona AR

/* ─── Calcular BMR + TDEE + objetivo (igual que frontend) ────── */
const ACTIVITY_FACTOR = {
  sedentario: 1.2, Nula: 1.2,
  ligero: 1.375,
  moderado: 1.55, Moderada: 1.55,
  activo: 1.725, Intensa: 1.725,
  muy_activo: 1.9, "muy activo": 1.9, Profesional: 1.9,
};
const GOAL_ADJ = { bajar_peso: -500, mantener: 0, ganar_musculo: 300 };

const calcDailyGoalForUser = (u) => {
  if (!u?.peso || !u?.altura || !u?.edad) return null;
  const base = (10 * u.peso) + (6.25 * u.altura) - (5 * u.edad);
  const isMale = u.sexo === "M" || u.sexo === "masculino";
  const bmr    = Math.round(isMale ? base + 5 : base - 161);
  const factor = ACTIVITY_FACTOR[u.actividad] || 1.375;
  const tdee   = Math.round(bmr * factor);
  const adj    = GOAL_ADJ[u.energyGoal] || 0;
  return tdee + adj;
};

/* ─── Evaluar día anterior y otorgar puntos saludables ──────── */
const evaluateYesterday = async (userId, user) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yDate = yesterday.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  const log = await DailyLog.findOne({ user: userId, date: yDate });
  if (!log || log.evaluated) return null; // ya evaluado o sin datos

  const foodEntries = log.entries.filter((e) => e.tipo === "comida");
  if (foodEntries.length === 0) {
    // No registró nada → no evaluar (no penalizar si ni usó el módulo)
    await DailyLog.findByIdAndUpdate(log._id, { $set: { evaluated: true, pointsAwarded: 0 } });
    return null;
  }

  const consumed   = Math.round(foodEntries.reduce((a, e) => a + (e.kcal || 0), 0));
  const dailyGoal  = calcDailyGoalForUser(user);

  if (!dailyGoal) return null;

  // Tolerancia: ±25% del objetivo
  const low  = dailyGoal * 0.75;
  const high = dailyGoal * 1.25;
  const goalMet = consumed >= low && consumed <= high;

  const points = goalMet ? 5 : -2;

  // Actualizar puntos del usuario
  await User.findByIdAndUpdate(userId, { $inc: { healthyPoints: points } });
  await DailyLog.findByIdAndUpdate(log._id, { $set: { evaluated: true, pointsAwarded: points } });

  return {
    date:     yDate,
    consumed,
    dailyGoal,
    goalMet,
    points,
    message:  goalMet
      ? `✅ Objetivo calórico del ${yesterday.toLocaleDateString("es-AR", { day: "numeric", month: "long" })} cumplido — +${points} puntos saludables`
      : `📊 Objetivo del ${yesterday.toLocaleDateString("es-AR", { day: "numeric", month: "long" })} no alcanzado — ${points} puntos`,
  };
};

/* ─── Calorías estimadas por tipo de entrenamiento (kcal/min) ── */
const KCAL_PER_MIN = {
  "Hipertrofia":      7,
  "Calistenia":       6,
  "Running":          9,
  "Fit":              7,
  "Ejercicio en Casa":5,
};

/* ─── PUT /goal ─ guardar objetivo nutricional ──────────────── */
router.put("/goal", authMiddleware, async (req, res) => {
  const { energyGoal } = req.body;
  const valid = ["bajar_peso", "mantener", "ganar_musculo"];
  if (!valid.includes(energyGoal))
    return res.status(400).json({ error: "Objetivo inválido." });
  await User.findByIdAndUpdate(req.user._id, { $set: { energyGoal } });
  return res.json({ ok: true, energyGoal });
});

/* ─── GET /today ─ balance completo del día ─────────────────── */
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const user    = await User.findById(req.user._id).lean();
    const date    = todayDate();

    // Leer log del día (o vacío)
    const log = await DailyLog.findOne({ user: user._id, date }) || { entries: [] };

    // Leer sesiones de hoy del módulo de entrenamiento
    // IMPORTANTE: s.date se guarda en formato es-AR "DD/MM/YYYY", no ISO
    const toISO = (dateStr) => {
      if (!dateStr) return null;
      if (dateStr.includes("/")) {
        // "DD/MM/YYYY" → "YYYY-MM-DD"
        const [d, m, y] = dateStr.split("/");
        return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
      }
      // Ya es ISO o Date object
      return new Date(dateStr).toLocaleDateString("en-CA");
    };

    let trainingKcal = 0;
    const plans = await TrainingPlan.find({ user: user._id }).lean();
    for (const plan of plans) {
      const todaySessions = (plan.sessions || []).filter((s) => {
        const sessionDate = toISO(s.date) || new Date(s.createdAt).toLocaleDateString("en-CA");
        return sessionDate === date;
      });
      if (todaySessions.length > 0 && plan.config?.tipo) {
        const kcalPerMin = KCAL_PER_MIN[plan.config.tipo] || 6;
        trainingKcal += todaySessions.length * kcalPerMin * 45; // 45 min/sesión
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

    // Evaluar día anterior y otorgar/restar puntos (async, no bloquea)
    const dayResult = await evaluateYesterday(user._id, user).catch(() => null);

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
      energyGoal:      user.energyGoal || null,
      dayEvaluation:   dayResult,   // null si no hay nada que evaluar
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

/* ─── GET /monthly ─ resumen diario del mes (solo Gold) ────── */
router.get("/monthly", authMiddleware, async (req, res) => {
  try {
    const nowAR = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
    const [year, month] = nowAR.split("-");
    const start = `${year}-${month}-01`;
    const end   = `${year}-${month}-31`;

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    }).lean();

    // Construir resumen por día
    const daily = logs.map((log) => {
      const comida    = log.entries.filter((e) => e.tipo === "comida");
      const actividad = log.entries.filter((e) => e.tipo === "actividad");
      const agua      = log.entries.filter((e) => e.tipo === "agua");
      return {
        date:       log.date,
        kcal:       Math.round(comida.reduce((a, e) => a + (e.kcal || 0), 0)),
        proteinas:  Math.round(comida.reduce((a, e) => a + (e.proteinas || 0), 0)),
        carbos:     Math.round(comida.reduce((a, e) => a + (e.carbos || 0), 0)),
        grasas:     Math.round(comida.reduce((a, e) => a + (e.grasas || 0), 0)),
        agua_ml:    Math.round(agua.reduce((a, e) => a + (e.agua_ml || 0), 0)),
        actividadKcal: Math.round(actividad.reduce((a, e) => a + (e.kcal || 0), 0)),
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    return res.json({ month: `${year}-${month}`, daily });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener historial mensual." });
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
