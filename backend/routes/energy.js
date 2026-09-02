import express        from "express";
import OpenAI          from "openai";
import rateLimit        from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.js";
import DailyLog        from "../models/DailyLog.js";
import TrainingPlan    from "../models/TrainingPlan.js";
import User            from "../models/User.js";
import Log             from "../models/Log.js";
import { getLang }     from "../utils/lang.js";

const router   = express.Router();
const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Costoso en OpenAI — limitar abuso del endpoint de interpretación por voz/texto
const parseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 15,
  message: { error: "Demasiados registros por minuto. Esperá un momento." },
});

/* ─── Validación de entrada confirmada (POST /log) ──────────── */
const TIPOS_VALIDOS = ["comida", "actividad", "agua"];
const MAX_ITEMS = 20;
const MAX_RESUMEN_LEN = 300;
const MAX_STR_LEN = 120;

const isFiniteNumber = (n) => typeof n === "number" && Number.isFinite(n);

const validateParsedEntry = (parsed) => {
  if (!parsed || typeof parsed !== "object") return "Datos inválidos.";
  if (!TIPOS_VALIDOS.includes(parsed.tipo)) return "Tipo inválido.";
  if (typeof parsed.resumen !== "string" || !parsed.resumen.trim() || parsed.resumen.length > MAX_RESUMEN_LEN)
    return "Resumen inválido.";

  if (parsed.items !== undefined) {
    if (!Array.isArray(parsed.items) || parsed.items.length > MAX_ITEMS)
      return "Items inválidos.";
    for (const item of parsed.items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return "Item inválido.";
      for (const [key, val] of Object.entries(item)) {
        if (typeof val === "string" && val.length > MAX_STR_LEN) return "Item inválido.";
        if (typeof val === "number" && !Number.isFinite(val)) return "Item inválido.";
        if (val !== null && typeof val === "object") return "Item inválido.";
      }
    }
  }

  const totales = parsed.totales || {};
  const kcal = totales.kcal ?? 0;
  const proteinas = totales.proteinas ?? 0;
  const carbos = totales.carbos ?? 0;
  const grasas = totales.grasas ?? 0;
  const agua_ml = parsed.agua_ml ?? 0;

  if (!isFiniteNumber(kcal) || kcal < 0 || kcal > 20000) return "Calorías inválidas.";
  if (!isFiniteNumber(proteinas) || proteinas < 0 || proteinas > 2000) return "Proteínas inválidas.";
  if (!isFiniteNumber(carbos) || carbos < 0 || carbos > 2000) return "Carbohidratos inválidos.";
  if (!isFiniteNumber(grasas) || grasas < 0 || grasas > 2000) return "Grasas inválidas.";
  if (!isFiniteNumber(agua_ml) || agua_ml < 0 || agua_ml > 10000) return "Agua inválida.";

  return null;
};

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
const evaluateYesterday = async (userId, user, isEN = false) => {
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
    message: isEN
      ? goalMet
        ? `✅ Calorie goal met for ${yesterday.toLocaleDateString("en-US", { day: "numeric", month: "long" })} — +${points} healthy points`
        : `📊 Goal missed for ${yesterday.toLocaleDateString("en-US", { day: "numeric", month: "long" })} — ${points} points`
      : goalMet
        ? `✅ Objetivo calórico del ${yesterday.toLocaleDateString("es-AR", { day: "numeric", month: "long" })} cumplido — +${points} puntos saludables`
        : `📊 Objetivo del ${yesterday.toLocaleDateString("es-AR", { day: "numeric", month: "long" })} no alcanzado — ${points} puntos`,
  };
};

/* ─── Calorías estimadas por tipo de entrenamiento (kcal/min) ── */
const KCAL_PER_MIN = {
  "Hipertrofia": 7,
  "Calistenia":  6,
  "Fit":         7,
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
  const isEN = getLang(req) === "en";
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
    const dayResult = await evaluateYesterday(user._id, user, isEN).catch(() => null);

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
    return res.status(500).json({ error: isEN ? "Error fetching balance." : "Error al obtener balance." });
  }
});

/* ─── POST /parse ─ interpretar texto/voz con GPT ───────────── */
router.post("/parse", authMiddleware, parseLimiter, async (req, res) => {
  const { texto, peso = 70, sexo = "M", edad = 30 } = req.body;
  const isEN = getLang(req) === "en";
  if (!texto?.trim()) return res.status(400).json({ error: isEN ? "Text required." : "Texto requerido." });
  if (texto.length > 500) return res.status(400).json({ error: isEN ? "Text too long." : "Texto demasiado largo." });

  try {
    const openai = getOpenAI();
    const gpt = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: isEN
          ? "You are a nutritionist. You respond ONLY with valid JSON, no markdown."
          : "Sos un nutricionista argentino. Respondés SOLO con JSON válido, sin markdown.",
      }, {
        role: "user",
        content: isEN ? `The user (${peso}kg, ${sexo === "M" || sexo === "masculino" ? "male" : "female"}, ${edad} years old) logged:
"${texto}"

The text may describe just ONE thing, or SEVERAL distinct things (e.g. a meal AND a workout AND water, all in the same message). Identify EVERY distinct FOOD, PHYSICAL ACTIVITY, or WATER entry mentioned — do not discard any of them — and respond with a JSON ARRAY containing one object per entry, using the formats below. Write all text values (resumen, nombre, etc.) in English. The "tipo" field must be exactly the literal value "comida", "actividad", or "agua" (do not translate this field, it's an internal code):

FOOD:
{"tipo":"comida","resumen":"brief description","items":[{"nombre":"...","cantidad":"...","kcal":0,"proteinas":0,"carbos":0,"grasas":0}],"totales":{"kcal":0,"proteinas":0,"carbos":0,"grasas":0}}

ACTIVITY:
{"tipo":"actividad","resumen":"brief description","items":[{"nombre":"...","duracion_min":0,"intensidad":"suave|moderada|intensa","kcal":0}],"totales":{"kcal":0}}

WATER:
{"tipo":"agua","resumen":"...","agua_ml":0}

IMPORTANT RULES:
- ALWAYS respond with a JSON array, even if there's only one entry: [{...}]
- If no quantity is mentioned, use a standard US portion
- If it says "a little" or "some", use the minimum portion
- ALWAYS underestimate when in doubt (better for the user to correct upward)
- For activities, use standard MET values and the user's weight
- JSON only, no extra text` : `El usuario (${peso}kg, ${sexo === "M" || sexo === "masculino" ? "hombre" : "mujer"}, ${edad} años) registró:
"${texto}"

El texto puede describir UNA sola cosa, o VARIAS cosas distintas (ej: una comida Y un entrenamiento Y agua, todo en el mismo mensaje). Identificá TODAS las entradas distintas de COMIDA, ACTIVIDAD FÍSICA o AGUA mencionadas — no descartes ninguna — y respondé con un ARRAY JSON con un objeto por cada entrada, usando estos formatos:

COMIDA:
{"tipo":"comida","resumen":"descripción breve","items":[{"nombre":"...","cantidad":"...","kcal":0,"proteinas":0,"carbos":0,"grasas":0}],"totales":{"kcal":0,"proteinas":0,"carbos":0,"grasas":0}}

ACTIVIDAD:
{"tipo":"actividad","resumen":"descripción breve","items":[{"nombre":"...","duracion_min":0,"intensidad":"suave|moderada|intensa","kcal":0}],"totales":{"kcal":0}}

AGUA:
{"tipo":"agua","resumen":"...","agua_ml":0}

REGLAS IMPORTANTES:
- Respondé SIEMPRE con un array JSON, incluso si hay una sola entrada: [{...}]
- Si no se menciona cantidad, usar porción estándar argentina
- Si dice "un poco" o "algo", usar porción mínima
- SIEMPRE subestimar ante la duda (mejor que el usuario corrija hacia arriba)
- Para actividades, usar MET estándar y el peso del usuario
- Solo JSON, sin texto adicional`,
      }],
      max_tokens: 700,
      temperature: 0.3,
    });

    const raw  = gpt.choices[0].message.content.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const parsedRaw = JSON.parse(raw);
    const list = Array.isArray(parsedRaw) ? parsedRaw : [parsedRaw];
    return res.json(list);
  } catch (err) {
    console.error("Energy parse error:", err.message);
    return res.status(500).json({ error: isEN ? "Error interpreting the text." : "Error al interpretar el texto." });
  }
});

/* ─── POST /log ─ guardar entrada confirmada ────────────────── */
router.post("/log", authMiddleware, async (req, res) => {
  try {
    const { parsed } = req.body; // resultado de /parse ya confirmado por el usuario
    const validationError = validateParsedEntry(parsed);
    if (validationError) return res.status(400).json({ error: validationError });

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

    const savedEntry = log.entries[log.entries.length - 1];

    // Registrar en logs del admin
    const msgMap = {
      comida:    `🍽️ ${entry.resumen} — ${entry.kcal} kcal`,
      actividad: `🏃 ${entry.resumen} — ${entry.kcal} kcal quemadas`,
      agua:      `💧 ${entry.resumen} — ${(entry.agua_ml / 1000).toFixed(2)} L`,
    };
    Log.create({
      level:     "info",
      category:  "energy",
      action:    `energy.${entry.tipo}`,
      message:   msgMap[entry.tipo] || entry.resumen,
      userId:    req.user._id,
      userName:  req.user.name || null,
      userEmail: req.user.email || null,
      meta: {
        tipo:      entry.tipo,
        resumen:   entry.resumen,
        kcal:      entry.kcal,
        proteinas: entry.proteinas,
        carbos:    entry.carbos,
        grasas:    entry.grasas,
        agua_ml:   entry.agua_ml,
        date,
      },
    }).catch(() => {});

    return res.json({ ok: true, entry: savedEntry });
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
