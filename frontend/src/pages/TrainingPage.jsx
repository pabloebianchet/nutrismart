import { useState } from "react";
import {
  Box, Typography, Stack, Chip, Button, Paper,
  CircularProgress, TextField, Snackbar, Alert,
} from "@mui/material";
import ArrowBackRoundedIcon    from "@mui/icons-material/ArrowBackRounded";
import CheckRoundedIcon        from "@mui/icons-material/CheckRounded";
import RefreshRoundedIcon      from "@mui/icons-material/RefreshRounded";
import AutoAwesomeRoundedIcon  from "@mui/icons-material/AutoAwesomeRounded";
import { motion, AnimatePresence } from "framer-motion";
import { useNutrition }        from "../context/NutritionContext";
import { API_URL }             from "../config/api";

// ─── config ─────────────────────────────────────────────────────────────────

const TIPOS = [
  { id: "Calistenia",        emoji: "🤸", desc: "Peso corporal y fuerza funcional",    color: "#1565C0", bg: "#E3F2FD", border: "rgba(21,101,192,0.25)"  },
  { id: "Hipertrofia",       emoji: "💪", desc: "Ganar músculo y aumentar masa",        color: "#BF360C", bg: "#FBE9E7", border: "rgba(191,54,12,0.25)"   },
  { id: "Fit",               emoji: "✨", desc: "Tonificar y mejorar condición física", color: "#6A1B9A", bg: "#F3E5F5", border: "rgba(106,27,154,0.25)"  },
  { id: "Ejercicio en Casa", emoji: "🏠", desc: "Sin equipamiento, desde casa",         color: "#2E7D32", bg: "#E8F5E9", border: "rgba(46,125,50,0.25)"   },
  { id: "Running",           emoji: "🏃", desc: "Plan de carrera con progresión",       color: "#E65100", bg: "#FFF3E0", border: "rgba(230,81,0,0.25)"    },
];

const LUGARES = [
  { id: "Gym",        emoji: "🏋️", desc: "Pesas, máquinas, equipamiento completo", color: "#1565C0", bg: "#E3F2FD", border: "rgba(21,101,192,0.25)"  },
  { id: "Aire libre", emoji: "🌳", desc: "Plaza, parque, barras de calistenia",    color: "#2E7D32", bg: "#E8F5E9", border: "rgba(46,125,50,0.25)"   },
  { id: "Casa",       emoji: "🏠", desc: "Sin equipamiento o con elementos básicos",color: "#6A1B9A", bg: "#F3E5F5", border: "rgba(106,27,154,0.25)"  },
];

const DURACIONES = [
  { id: "1 día",   days: 1   },
  { id: "15 días", days: 15  },
  { id: "1 mes",   days: 30  },
  { id: "3 meses", days: 90  },
  { id: "6 meses", days: 180 },
];

const FRECUENCIAS = [2, 3, 4, 5, 6];

// ─── storage — dos slots independientes ──────────────────────────────────────
// MAIN_KEY: planes multi-semana (15d / 1m / 3m / 6m)
// QUICK_KEY: plan de 1 día — no interfiere con el plan principal

const MAIN_KEY  = "nutrismart_training_main";
const QUICK_KEY = "nutrismart_training_quick";

const loadPlan  = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const savePlan  = (k, d) => localStorage.setItem(k, JSON.stringify(d));
const clearPlan = (k)    => localStorage.removeItem(k);

const getPhaseForData = (data) => {
  if (!data?.plan) return "config";
  const elapsed = Math.floor((Date.now() - new Date(data.startDate)) / 86400000);
  if (elapsed >= data.totalDays && (data.sessions?.length || 0) > 0) return "summary";
  return "plan";
};

// ─── animation variants ──────────────────────────────────────────────────────

const slide  = { enter: { opacity: 0, x: 40 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };
const fadeUp = { enter: { opacity: 0, y: 20 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

// ─── sub-components ──────────────────────────────────────────────────────────

const StepDot = ({ n, label }) => (
  <Stack direction="row" spacing={1} alignItems="center" mb={3}>
    <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#0B5E55", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{n}</Typography>
    </Box>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#4A6B67", textTransform: "uppercase", letterSpacing: "0.07em" }}>
      {label}
    </Typography>
  </Stack>
);

const PlanLoader = ({ message }) => (
  <Box sx={{ textAlign: "center", py: 8 }}>
    <Typography sx={{
      fontSize: 60, lineHeight: 1, mb: 3, display: "inline-block",
      "@keyframes lift": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      animation: "lift 1.4s ease-in-out infinite",
    }}>🏋️</Typography>
    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F2420", mb: 0.5 }}>{message}</Typography>
    <Stack direction="row" spacing={0.6} justifyContent="center" mt={1.5}>
      {[0, 1, 2].map((i) => (
        <Box key={i} sx={{
          width: 7, height: 7, borderRadius: "50%", bgcolor: "#0B5E55",
          "@keyframes bounce": { "0%,80%,100%": { transform: "scale(0.8)", opacity: 0.4 }, "40%": { transform: "scale(1.2)", opacity: 1 } },
          animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
    </Stack>
  </Box>
);

const ProgBar = ({ value, color }) => (
  <Box sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(11,94,85,0.12)", overflow: "hidden" }}>
    <Box sx={{ height: "100%", width: `${Math.min(100, Math.max(0, value))}%`, borderRadius: 3, bgcolor: color || "#0B5E55", transition: "width 1s ease" }} />
  </Box>
);

const WeightChart = ({ weights }) => {
  if (weights.length < 2) return null;
  const max = Math.max(...weights, 1);
  return (
    <Stack direction="row" spacing={0.4} alignItems="flex-end" sx={{ height: 40 }}>
      {weights.map((w, i) => (
        <Box key={i} sx={{
          flex: 1, maxWidth: 28,
          height: `${Math.max(10, (w / max) * 100)}%`,
          bgcolor: i === weights.length - 1 ? "#0B5E55" : "rgba(11,94,85,0.28)",
          borderRadius: "2px 2px 0 0",
        }} />
      ))}
    </Stack>
  );
};

// ─── main component ───────────────────────────────────────────────────────────

const TrainingPage = () => {
  const { userData } = useNutrition();
  const token = localStorage.getItem("nutrismartToken");

  // Determinar qué slot mostrar al abrir
  // Preferencia: plan principal si existe; si no, plan rápido; si no, config
  const _mainData  = loadPlan(MAIN_KEY);
  const _quickData = loadPlan(QUICK_KEY);
  const _initType  = _mainData?.plan ? "main" : (_quickData?.plan ? "quick" : "main");
  const _initData  = _initType === "main" ? _mainData : _quickData;

  // ── qué slot está activo ahora
  const [activePlanType, setActivePlanType] = useState(_initType);
  const activeKey = activePlanType === "main" ? MAIN_KEY : QUICK_KEY;

  // ── existencia de planes (para mostrar el toggle)
  const [hasMainPlan,  setHasMainPlan]  = useState(() => !!loadPlan(MAIN_KEY)?.plan);
  const [hasQuickPlan, setHasQuickPlan] = useState(() => !!loadPlan(QUICK_KEY)?.plan);

  // ── flow
  const [phase,       setPhase]       = useState(() => getPhaseForData(_initData));
  const [configStep,  setConfigStep]  = useState(1);
  const [tipo,        setTipo]        = useState(null);
  const [lugar,       setLugar]       = useState(null);
  const [duracion,    setDuracion]    = useState(null);
  const [frecuencia,  setFrecuencia]  = useState(null);

  // ── plan data (del slot activo)
  const [plan,       setPlan]       = useState(_initData?.plan     || null);
  const [config,     setConfig]     = useState(_initData?.config   || null);
  const [sessions,   setSessions]   = useState(_initData?.sessions || []);
  const [startDate,  setStartDate]  = useState(_initData?.startDate || null);
  const [totalDays,  setTotalDays]  = useState(_initData?.totalDays || 0);

  // ── UI
  const [activeTab,    setActiveTab]    = useState("semana");
  const [activeDay,    setActiveDay]    = useState(null);
  const [sessionLog,   setSessionLog]   = useState({});
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [snackMsg,     setSnackMsg]     = useState("");
  const [tipsData,     setTipsData]     = useState(null);
  const [loadingTips,  setLoadingTips]  = useState(false);
  const [expandedSess, setExpandedSess] = useState(null);

  // ── computed
  const elapsed     = startDate ? Math.floor((Date.now() - new Date(startDate)) / 86400000) : 0;
  const currentWeek = Math.max(1, Math.ceil((elapsed + 1) / 7));
  const activeTipo  = TIPOS.find(t => t.id === (config?.tipo || tipo));
  const skipLugar   = tipo === "Ejercicio en Casa" || config?.tipo === "Ejercicio en Casa";
  const isRunning   = tipo === "Running" || config?.tipo === "Running";
  const todayStr    = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const todayDays   = new Set(sessions.filter(s => s.date === todayStr).map(s => s.dayKey));
  const loggedExs   = [...new Set(sessions.flatMap(s => Object.keys(s.exercises)))];

  const getExHistory = (name) =>
    sessions.filter(s => s.exercises[name]).map(s => ({ date: s.date, ...s.exercises[name] }));

  // ── cambiar entre slot principal y rápido
  const switchToPlan = (planType) => {
    const key  = planType === "main" ? MAIN_KEY : QUICK_KEY;
    const data = loadPlan(key);
    setActivePlanType(planType);
    setPlan(data?.plan || null);
    setConfig(data?.config || null);
    setSessions(data?.sessions || []);
    setStartDate(data?.startDate || null);
    setTotalDays(data?.totalDays || 0);
    setPhase(getPhaseForData(data));
    setActiveDay(null); setTipsData(null); setActiveTab("semana");
    setTipo(null); setLugar(null); setDuracion(null); setFrecuencia(null); setConfigStep(1);
    setError(""); setExpandedSess(null);
  };

  // ── generar plan
  const handleGenerate = async () => {
    const isQuick  = duracion === "1 día";
    const planType = isQuick ? "quick" : "main";
    const key      = isQuick ? QUICK_KEY : MAIN_KEY;
    const freq     = isQuick ? 1 : frecuencia;

    setError("");
    setLoading(true);
    setPhase("loading");
    try {
      const res  = await fetch(`${API_URL}/api/training/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tipo, lugar: skipLugar ? "Casa" : lugar, duracion, frecuencia: freq, userData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar el plan");

      const cfg    = { tipo, lugar: skipLugar ? "Casa" : lugar, duracion, frecuencia: freq };
      const durObj = DURACIONES.find(d => d.id === duracion);
      const start  = new Date().toISOString();
      const days   = durObj?.days || 30;

      savePlan(key, { config: cfg, plan: data, startDate: start, totalDays: days, sessions: [] });
      setActivePlanType(planType);
      setPlan(data); setConfig(cfg); setStartDate(start); setTotalDays(days); setSessions([]);
      if (planType === "main") setHasMainPlan(true);
      else                     setHasQuickPlan(true);
      setPhase("plan");
    } catch (err) {
      setError(err.message);
      setPhase("config");
      setConfigStep(3);
    } finally {
      setLoading(false);
    }
  };

  // ── tips IA
  const handleLoadTips = async () => {
    setLoadingTips(true);
    try {
      const res  = await fetch(`${API_URL}/api/training/tips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tipo: config?.tipo, semana: currentWeek, planSummary: plan?.summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTipsData(data.tips || []);
    } catch {
      setSnackMsg("No se pudieron cargar los tips.");
    } finally {
      setLoadingTips(false);
    }
  };

  // ── sesión
  const openSession = (dayKey) => { setActiveDay(dayKey); setSessionLog({}); };

  const saveSession = () => {
    const hasData = Object.values(sessionLog).some(v => v.weight || v.reps);
    if (!hasData) { setSnackMsg("Ingresá al menos un dato antes de guardar."); return; }
    const dayInfo    = plan.weekStructure[activeDay];
    const newSession = { date: todayStr, dayKey: activeDay, dayName: dayInfo?.name || activeDay, exercises: sessionLog };
    const updated    = [...sessions, newSession];
    setSessions(updated);
    const stored = loadPlan(activeKey);
    savePlan(activeKey, { ...stored, sessions: updated });
    setActiveDay(null);
    setSnackMsg("¡Sesión guardada! 💪");
    if (totalDays === 1 || elapsed >= totalDays) setTimeout(() => setPhase("summary"), 800);
  };

  // ── reset — solo borra el slot activo, no toca el otro
  const resetPlan = (keepConfig = false) => {
    const prevCfg  = config;
    const prevPlan = plan;
    const wasQuick = activePlanType === "quick";

    clearPlan(activeKey);
    if (activePlanType === "main") setHasMainPlan(false);
    else                           setHasQuickPlan(false);

    // Si borramos el plan rápido y hay plan principal, volver al principal
    if (wasQuick && hasMainPlan) {
      switchToPlan("main");
      return;
    }

    setPlan(null); setConfig(null); setSessions([]); setStartDate(null);
    setTotalDays(0); setTipsData(null); setActiveDay(null); setSessionLog({}); setError("");

    if (keepConfig && prevCfg) {
      // Continuar con progresividad: regenerar mismo tipo de plan
      setTipo(prevCfg.tipo); setLugar(prevCfg.lugar);
      setDuracion(prevCfg.duracion); setFrecuencia(prevCfg.frecuencia);
      setConfigStep(3);
      setTimeout(async () => {
        const isQuick  = prevCfg.duracion === "1 día";
        const planType = isQuick ? "quick" : "main";
        const key      = isQuick ? QUICK_KEY : MAIN_KEY;
        setPhase("loading");
        try {
          const res = await fetch(`${API_URL}/api/training/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ tipo: prevCfg.tipo, lugar: prevCfg.lugar, duracion: prevCfg.duracion, frecuencia: prevCfg.frecuencia, userData, prevPlan }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          const start = new Date().toISOString();
          const days  = DURACIONES.find(d => d.id === prevCfg.duracion)?.days || 30;
          savePlan(key, { config: prevCfg, plan: data, startDate: start, totalDays: days, sessions: [] });
          setActivePlanType(planType);
          setPlan(data); setConfig(prevCfg); setStartDate(start); setTotalDays(days); setSessions([]);
          if (planType === "main") setHasMainPlan(true);
          else                     setHasQuickPlan(true);
          setPhase("plan");
        } catch {
          setPhase("config"); setConfigStep(3);
        }
      }, 100);
    } else {
      setTipo(null); setLugar(null); setDuracion(null); setFrecuencia(null);
      setConfigStep(1);
      setPhase("config");
    }
  };

  const nextConfigStep = () => {
    if (configStep === 1) setConfigStep(skipLugar ? 3 : 2);
    else if (configStep === 2) setConfigStep(3);
  };
  const prevConfigStep = () => {
    if (configStep === 2) setConfigStep(1);
    else if (configStep === 3) setConfigStep(skipLugar ? 1 : 2);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Box sx={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
      px: { xs: 2, sm: 3 },
      py: { xs: 4, md: 5 },
      display: "flex",
      justifyContent: "center",
    }}>
      <Box sx={{ width: "100%", maxWidth: 700 }}>

        {/* ── Hero header ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={hasMainPlan && hasQuickPlan && phase === "plan" && !activeDay ? 2 : 4}>
            <Box>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Typography sx={{ fontSize: 28 }}>🏋️</Typography>
                <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.8px", lineHeight: 1 }}>
                  Entrenamiento
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 13.5, color: "#4A6B67", mt: 0.5 }}>
                Plan personalizado con IA · seguimiento integrado
              </Typography>
            </Box>
            {phase === "plan" && !activeDay && (
              <Button onClick={() => resetPlan(false)} startIcon={<RefreshRoundedIcon />}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, color: "#0B5E55", borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}>
                {activePlanType === "quick" ? "Nuevo plan rápido" : "Nuevo plan"}
              </Button>
            )}
          </Stack>

          {/* ── Toggle entre plan principal y plan rápido ── */}
          {hasMainPlan && hasQuickPlan && phase === "plan" && !activeDay && (
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={0} sx={{ bgcolor: "rgba(11,94,85,0.06)", borderRadius: 999, p: 0.5, display: "inline-flex" }}>
                {[
                  { type: "main",  label: "Plan principal", emoji: "📋" },
                  { type: "quick", label: "Plan rápido",    emoji: "⚡" },
                ].map((opt) => (
                  <Box
                    key={opt.type}
                    onClick={() => switchToPlan(opt.type)}
                    sx={{
                      px: 2.2, py: 0.8, borderRadius: 999, cursor: "pointer",
                      bgcolor: activePlanType === opt.type ? "#fff" : "transparent",
                      boxShadow: activePlanType === opt.type ? "0 2px 8px rgba(11,94,85,0.12)" : "none",
                      transition: "all 0.2s ease",
                      display: "flex", alignItems: "center", gap: 0.6,
                    }}
                  >
                    <Typography sx={{ fontSize: 14, lineHeight: 1 }}>{opt.emoji}</Typography>
                    <Typography sx={{
                      fontSize: 13.5,
                      fontWeight: activePlanType === opt.type ? 800 : 600,
                      color: activePlanType === opt.type ? "#0B5E55" : "#4A6B67",
                      whiteSpace: "nowrap",
                    }}>
                      {opt.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Botón para iniciar plan rápido cuando hay un plan principal activo y no hay plan rápido */}
          {hasMainPlan && !hasQuickPlan && phase === "plan" && !activeDay && (
            <Box sx={{ mb: 3 }}>
              <Button
                size="small"
                onClick={() => {
                  setActivePlanType("quick");
                  setPlan(null); setConfig(null); setSessions([]); setStartDate(null); setTotalDays(0);
                  setTipo(null); setLugar(null); setDuracion("1 día"); setFrecuencia(1);
                  setConfigStep(1);
                  setPhase("config");
                }}
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: 13, borderRadius: 999,
                  border: "1.5px solid rgba(11,94,85,0.20)", color: "#0B5E55", px: 2, py: 0.7,
                  "&:hover": { bgcolor: "rgba(11,94,85,0.05)", borderColor: "#0B5E55" },
                }}
              >
                ⚡ Agregar plan rápido (1 día)
              </Button>
            </Box>
          )}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ══════════════ CONFIG ══════════════ */}
          {phase === "config" && (
            <motion.div key={`config-${configStep}`} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>

              {/* ── Step 1: Tipo ── */}
              {configStep === 1 && (
                <>
                  {userData && (
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(11,94,85,0.10)", bgcolor: "#f7fcfa", mb: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography sx={{ fontSize: 22 }}>👤</Typography>
                        <Box>
                          <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.2 }}>Tu perfil</Typography>
                          <Typography sx={{ fontSize: 13, color: "#4A6B67" }}>
                            {userData.sexo} · {userData.edad} años · {userData.peso}kg · {userData.altura}cm · Actividad: {userData.actividad}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {/* Aviso plan rápido cuando se viene del botón */}
                  {activePlanType === "quick" && hasMainPlan && (
                    <Paper elevation={0} sx={{ p: 1.8, borderRadius: 3, border: "1px solid rgba(230,81,0,0.20)", bgcolor: "#FFF8F5", mb: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontSize: 16 }}>⚡</Typography>
                        <Typography sx={{ fontSize: 13, color: "#BF360C", lineHeight: 1.5 }}>
                          Estás creando un <strong>plan rápido</strong>. Tu plan principal no se toca.
                        </Typography>
                      </Stack>
                    </Paper>
                  )}

                  <StepDot n="1" label="¿Qué tipo de entrenamiento?" />
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 4 }}>
                    {TIPOS.map((t) => {
                      const active = tipo === t.id;
                      return (
                        <Box key={t.id} onClick={() => setTipo(t.id)} sx={{
                          p: 2.2, borderRadius: 4, cursor: "pointer", position: "relative",
                          border: `2px solid ${active ? t.color : "rgba(11,94,85,0.10)"}`,
                          bgcolor: active ? t.bg : "#fff",
                          transition: "all 0.2s ease",
                          "&:hover": { borderColor: t.color, bgcolor: t.bg, transform: "translateY(-2px)", boxShadow: `0 8px 24px ${t.border}` },
                        }}>
                          {active && (
                            <Box sx={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", bgcolor: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <CheckRoundedIcon sx={{ fontSize: 11, color: "#fff" }} />
                            </Box>
                          )}
                          <Typography sx={{ fontSize: 26, mb: 0.6, lineHeight: 1 }}>{t.emoji}</Typography>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#0F2420", letterSpacing: "-0.2px" }}>{t.id}</Typography>
                          <Typography sx={{ fontSize: 11, color: "#4A6B67", mt: 0.2, lineHeight: 1.4 }}>{t.desc}</Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <AnimatePresence>
                    {tipo && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Button fullWidth variant="contained" onClick={nextConfigStep} sx={{
                          py: 1.8, borderRadius: 3, textTransform: "none", fontWeight: 800, fontSize: 15,
                          background: `linear-gradient(135deg, ${activeTipo?.color || "#0B5E55"} 0%, ${activeTipo?.color || "#0B5E55"}CC 100%)`,
                          boxShadow: `0 8px 28px ${activeTipo?.border || "rgba(11,94,85,0.30)"}`,
                          transition: "all 0.25s ease", "&:hover": { transform: "translateY(-2px)" },
                        }}>
                          {activeTipo?.emoji} Continuar con {tipo}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* ── Step 2: Lugar ── */}
              {configStep === 2 && (
                <>
                  <Button onClick={prevConfigStep} startIcon={<ArrowBackRoundedIcon />} size="small"
                    sx={{ mb: 2.5, textTransform: "none", color: "#4A6B67", fontWeight: 600, borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}>
                    Volver
                  </Button>
                  <StepDot n="2" label="¿Dónde vas a entrenar?" />
                  <Stack spacing={1.5} mb={4}>
                    {LUGARES.map((l) => {
                      const active = lugar === l.id;
                      return (
                        <Box key={l.id} onClick={() => setLugar(l.id)} sx={{
                          p: 2.2, borderRadius: 4, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 2,
                          border: `2px solid ${active ? l.color : "rgba(11,94,85,0.10)"}`,
                          bgcolor: active ? l.bg : "#fff",
                          transition: "all 0.2s ease",
                          "&:hover": { borderColor: l.color, bgcolor: l.bg },
                        }}>
                          <Typography sx={{ fontSize: 28, lineHeight: 1, width: 40, textAlign: "center" }}>{l.emoji}</Typography>
                          <Box flex={1}>
                            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0F2420" }}>{l.id}</Typography>
                            <Typography sx={{ fontSize: 12.5, color: "#4A6B67" }}>{l.desc}</Typography>
                          </Box>
                          {active && <CheckRoundedIcon sx={{ color: l.color, fontSize: 20 }} />}
                        </Box>
                      );
                    })}
                  </Stack>
                  <AnimatePresence>
                    {lugar && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Button fullWidth variant="contained" onClick={nextConfigStep} sx={{
                          py: 1.8, borderRadius: 3, textTransform: "none", fontWeight: 800, fontSize: 15,
                          background: `linear-gradient(135deg, ${activeTipo?.color || "#0B5E55"} 0%, ${activeTipo?.color || "#0B5E55"}CC 100%)`,
                        }}>
                          Continuar →
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* ── Step 3: Duración + Frecuencia ── */}
              {configStep === 3 && (
                <>
                  <Button onClick={prevConfigStep} startIcon={<ArrowBackRoundedIcon />} size="small"
                    sx={{ mb: 2.5, textTransform: "none", color: "#4A6B67", fontWeight: 600, borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}>
                    Volver
                  </Button>

                  <StepDot n={skipLugar ? "2" : "3"} label="¿Cuánto tiempo dura el plan?" />
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={4} useFlexGap>
                    {DURACIONES.map((d) => {
                      const active = duracion === d.id;
                      return (
                        <Box key={d.id} onClick={() => setDuracion(d.id)} sx={{
                          px: 2.4, py: 1.4, borderRadius: 999, cursor: "pointer",
                          border: `2px solid ${active ? (activeTipo?.color || "#0B5E55") : "rgba(11,94,85,0.12)"}`,
                          bgcolor: active ? (activeTipo?.bg || "#E6F5F3") : "#fff",
                          transition: "all 0.18s ease",
                          "&:hover": { borderColor: activeTipo?.color || "#0B5E55" },
                        }}>
                          <Typography sx={{ fontSize: 14, fontWeight: active ? 800 : 600, color: active ? (activeTipo?.color || "#0B5E55") : "#4A6B67" }}>
                            {d.id}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>

                  {/* Frecuencia — oculta para "1 día" */}
                  <AnimatePresence>
                    {duracion && duracion !== "1 día" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}>
                        <StepDot n={skipLugar ? "3" : "4"} label="¿Cuántos días por semana?" />
                        <Stack direction="row" spacing={1.2} mb={4} useFlexGap>
                          {FRECUENCIAS.map((f) => {
                            const active = frecuencia === f;
                            return (
                              <Box key={f} onClick={() => setFrecuencia(f)} sx={{
                                width: 56, height: 56, borderRadius: 3, cursor: "pointer",
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                border: `2px solid ${active ? (activeTipo?.color || "#0B5E55") : "rgba(11,94,85,0.12)"}`,
                                bgcolor: active ? (activeTipo?.bg || "#E6F5F3") : "#fff",
                                transition: "all 0.18s ease",
                                "&:hover": { borderColor: activeTipo?.color || "#0B5E55" },
                              }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 900, color: active ? (activeTipo?.color || "#0B5E55") : "#4A6B67", lineHeight: 1 }}>{f}</Typography>
                                <Typography sx={{ fontSize: 9.5, color: active ? (activeTipo?.color || "#0B5E55") : "#8AADAA", fontWeight: 600 }}>días</Typography>
                              </Box>
                            );
                          })}
                        </Stack>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mensaje "1 día" */}
                  <AnimatePresence>
                    {duracion === "1 día" && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(11,94,85,0.12)", bgcolor: "#f7fcfa", mb: 3 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontSize: 18 }}>🏨</Typography>
                            <Typography sx={{ fontSize: 13, color: "#4A6B67", lineHeight: 1.5 }}>
                              Sesión única — ideal para hotel, viaje o día suelto. Se guarda como plan rápido sin afectar tu plan principal.
                            </Typography>
                          </Stack>
                        </Paper>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && <Typography sx={{ fontSize: 13.5, color: "#E24B4A", mb: 2, textAlign: "center" }}>{error}</Typography>}

                  <AnimatePresence>
                    {duracion && (frecuencia || duracion === "1 día") && (
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                        <Button fullWidth variant="contained" onClick={handleGenerate} sx={{
                          py: 1.9, borderRadius: 3, textTransform: "none", fontWeight: 900, fontSize: 16,
                          background: `linear-gradient(135deg, ${activeTipo?.color || "#0B5E55"} 0%, ${activeTipo?.color || "#0B5E55"}CC 100%)`,
                          boxShadow: `0 8px 28px ${activeTipo?.border || "rgba(11,94,85,0.30)"}`,
                          "&:hover": { transform: "translateY(-2px)" }, transition: "all 0.25s ease",
                        }}>
                          {activeTipo?.emoji} Generar mi plan con IA
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* ══════════════ LOADING ══════════════ */}
          {phase === "loading" && (
            <motion.div key="loading" variants={fadeUp} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Paper elevation={0} sx={{ borderRadius: 5, border: "1px solid rgba(11,94,85,0.10)", p: 4 }}>
                <PlanLoader message="Creando tu plan personalizado…" />
              </Paper>
            </motion.div>
          )}

          {/* ══════════════ PLAN — day list ══════════════ */}
          {phase === "plan" && plan && !activeDay && (
            <motion.div key={`plan-${activePlanType}`} variants={fadeUp} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>

              {/* Plan header */}
              <Paper elevation={0} sx={{ borderRadius: 5, mb: 3, overflow: "hidden", border: "1px solid rgba(11,94,85,0.10)", boxShadow: "0 4px 20px rgba(11,94,85,0.08)" }}>
                <Box sx={{
                  px: 3, pt: 2.5, pb: 2,
                  background: activeTipo ? `linear-gradient(135deg, ${activeTipo.color}18 0%, #fff 100%)` : "linear-gradient(135deg, #edf8f5 0%, #fff 100%)",
                  borderBottom: "1px solid rgba(11,94,85,0.07)",
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1} minWidth={0}>
                      <Typography sx={{ fontSize: 16, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.4px", mb: 0.5 }}>
                        {plan.planTitle}
                      </Typography>
                      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                        {activeTipo && <Chip label={`${activeTipo.emoji} ${config?.tipo}`} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: activeTipo.bg, color: activeTipo.color, border: `1px solid ${activeTipo.border}` }} />}
                        {config?.lugar && <Chip label={config.lugar} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67" }} />}
                        {config?.duracion !== "1 día" && <Chip label={`${config?.frecuencia} días/sem`} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67" }} />}
                        {activePlanType === "quick" && <Chip label="⚡ Plan rápido" size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: "#FFF3E0", color: "#E65100" }} />}
                      </Stack>
                    </Box>
                    {totalDays > 1 && (
                      <Box sx={{ textAlign: "right", flexShrink: 0, ml: 1.5 }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 900, color: activeTipo?.color || "#0B5E55", lineHeight: 1 }}>
                          {Math.min(elapsed, totalDays)}
                        </Typography>
                        <Typography sx={{ fontSize: 10.5, color: "#8AADAA", fontWeight: 600 }}>de {totalDays}d</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
                {totalDays > 1 && (
                  <Box sx={{ px: 3, py: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.8}>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#4A6B67" }}>Semana {currentWeek}</Typography>
                      <Typography sx={{ fontSize: 11.5, color: "#8AADAA" }}>{Math.round(Math.min(100, (elapsed / totalDays) * 100))}% completado</Typography>
                    </Stack>
                    <ProgBar value={(elapsed / totalDays) * 100} color={activeTipo?.color} />
                  </Box>
                )}
              </Paper>

              {/* Tabs */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={0} sx={{ bgcolor: "rgba(11,94,85,0.06)", borderRadius: 999, p: 0.5, display: "inline-flex" }}>
                  {[
                    { id: "semana",   label: totalDays === 1 ? "Sesión" : "Mi semana" },
                    { id: "progreso", label: sessions.length ? `Progreso (${sessions.length})` : "Progreso" },
                    { id: "tips",     label: "Tips" },
                  ].map((tab) => (
                    <Box key={tab.id} onClick={() => setActiveTab(tab.id)} sx={{
                      px: 2, py: 0.8, borderRadius: 999, cursor: "pointer",
                      bgcolor: activeTab === tab.id ? "#fff" : "transparent",
                      boxShadow: activeTab === tab.id ? "0 2px 8px rgba(11,94,85,0.12)" : "none",
                      transition: "all 0.2s ease",
                    }}>
                      <Typography sx={{ fontSize: 13, fontWeight: activeTab === tab.id ? 800 : 600, color: activeTab === tab.id ? "#0B5E55" : "#4A6B67", whiteSpace: "nowrap" }}>
                        {tab.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* ── Tab: SEMANA ── */}
              {activeTab === "semana" && (
                <motion.div key="tab-semana" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Typography sx={{ fontSize: 13.5, color: "#4A6B67", mb: 3, lineHeight: 1.7 }}>{plan.summary}</Typography>
                  <Stack spacing={2}>
                    {Object.entries(plan.weekStructure).map(([dayKey, day], i) => {
                      const doneToday = todayDays.has(dayKey);
                      const sessCount = sessions.filter(s => s.dayKey === dayKey).length;
                      const exs       = day.exercises || [];
                      return (
                        <motion.div key={dayKey} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                          <Paper elevation={0} sx={{
                            borderRadius: 4, overflow: "hidden",
                            border: `1px solid ${doneToday ? (activeTipo?.color || "#0B5E55") + "40" : "rgba(11,94,85,0.10)"}`,
                            boxShadow: "0 2px 12px rgba(11,94,85,0.06)",
                            bgcolor: doneToday ? (activeTipo?.bg || "#E6F5F3") : "#fff",
                          }}>
                            <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Box flex={1}>
                                  <Stack direction="row" spacing={0.8} alignItems="center" mb={0.3}>
                                    {doneToday && <CheckRoundedIcon sx={{ fontSize: 15, color: activeTipo?.color || "#0B5E55" }} />}
                                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0F2420", letterSpacing: "-0.3px" }}>{day.name}</Typography>
                                  </Stack>
                                  <Typography sx={{ fontSize: 12, color: "#4A6B67" }}>{day.focus}</Typography>
                                </Box>
                                <Box sx={{ textAlign: "right", flexShrink: 0, ml: 1 }}>
                                  <Typography sx={{ fontSize: 11, color: "#8AADAA" }}>{exs.length} ejercicios</Typography>
                                  {sessCount > 0 && <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: activeTipo?.color || "#0B5E55" }}>{sessCount} sesión{sessCount > 1 ? "es" : ""}</Typography>}
                                </Box>
                              </Stack>
                              <Stack spacing={0.5} mb={1.5}>
                                {exs.slice(0, 3).map((ex, j) => (
                                  <Stack key={j} direction="row" spacing={1} alignItems="center">
                                    <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: activeTipo?.color || "#0B5E55", flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: 12.5, color: "#4A6B67", flex: 1 }}>{ex.name}</Typography>
                                    <Typography sx={{ fontSize: 11.5, color: "#8AADAA", flexShrink: 0 }}>{ex.sets}×{ex.reps}</Typography>
                                  </Stack>
                                ))}
                                {exs.length > 3 && <Typography sx={{ fontSize: 11.5, color: "#8AADAA" }}>+{exs.length - 3} más…</Typography>}
                              </Stack>
                            </Box>
                            <Box sx={{ px: 2.5, pb: 2 }}>
                              <Button
                                fullWidth onClick={() => openSession(dayKey)}
                                variant={doneToday ? "outlined" : "contained"}
                                sx={{
                                  py: 1.2, borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13.5,
                                  ...(doneToday
                                    ? { border: `1.5px solid ${activeTipo?.color || "#0B5E55"}50`, color: activeTipo?.color || "#0B5E55" }
                                    : {
                                        background: `linear-gradient(135deg, ${activeTipo?.color || "#0B5E55"} 0%, ${activeTipo?.color || "#0B5E55"}CC 100%)`,
                                        boxShadow: `0 4px 16px ${activeTipo?.border || "rgba(11,94,85,0.25)"}`,
                                      }),
                                }}
                              >
                                {doneToday ? "Registrar otra sesión" : "Registrar sesión 💪"}
                              </Button>
                            </Box>
                          </Paper>
                        </motion.div>
                      );
                    })}
                  </Stack>

                  {plan.equipment?.length > 0 && (
                    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(11,94,85,0.10)", p: 2.5, mt: 3 }}>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em", mb: 1 }}>
                        Equipamiento necesario
                      </Typography>
                      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                        {plan.equipment.map((e, i) => (
                          <Chip key={i} label={e} size="small" sx={{ bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67", fontWeight: 600, fontSize: 12 }} />
                        ))}
                      </Stack>
                    </Paper>
                  )}
                </motion.div>
              )}

              {/* ── Tab: PROGRESO ── */}
              {activeTab === "progreso" && (
                <motion.div key="tab-progreso" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  {sessions.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Typography sx={{ fontSize: 44, mb: 2 }}>📋</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F2420", mb: 1 }}>Sin sesiones aún</Typography>
                      <Typography sx={{ fontSize: 13.5, color: "#4A6B67" }}>Registrá tu primera sesión desde "Mi semana"</Typography>
                    </Box>
                  ) : (
                    <>
                      <Stack direction="row" spacing={1.5} mb={3}>
                        {[
                          { label: "Sesiones",  value: sessions.length,  icon: "💪" },
                          { label: "Días",       value: elapsed,          icon: "📅" },
                          { label: "Ejercicios", value: loggedExs.length, icon: "🎯" },
                        ].map((stat) => (
                          <Paper key={stat.label} elevation={0} sx={{ flex: 1, p: 1.8, borderRadius: 3, border: "1px solid rgba(11,94,85,0.10)", textAlign: "center" }}>
                            <Typography sx={{ fontSize: 20, mb: 0.3 }}>{stat.icon}</Typography>
                            <Typography sx={{ fontSize: 20, fontWeight: 900, color: activeTipo?.color || "#0B5E55", lineHeight: 1 }}>{stat.value}</Typography>
                            <Typography sx={{ fontSize: 10.5, color: "#8AADAA", fontWeight: 600 }}>{stat.label}</Typography>
                          </Paper>
                        ))}
                      </Stack>

                      {loggedExs.length > 0 && (
                        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(11,94,85,0.10)", p: 2.5, mb: 3 }}>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em", mb: 2 }}>
                            Progresión por ejercicio
                          </Typography>
                          <Stack spacing={2.5}>
                            {loggedExs.slice(0, 6).map((ex) => {
                              const hist    = getExHistory(ex);
                              const weights = hist.map(h => parseFloat(h.weight)).filter(n => !isNaN(n) && n > 0);
                              const last    = hist[hist.length - 1];
                              return (
                                <Box key={ex} sx={{ pb: 2, borderBottom: "1px solid rgba(11,94,85,0.07)", "&:last-child": { pb: 0, borderBottom: "none" } }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.8}>
                                    <Box flex={1} minWidth={0}>
                                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0F2420", mb: 0.2 }}>{ex}</Typography>
                                      <Typography sx={{ fontSize: 11.5, color: "#8AADAA" }}>{hist.length} sesión{hist.length > 1 ? "es" : ""}</Typography>
                                    </Box>
                                    {weights.length >= 2 && (
                                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: weights[weights.length-1] >= weights[0] ? "#2E7D32" : "#4A6B67", flexShrink: 0, ml: 1 }}>
                                        {weights[0]} → {weights[weights.length-1]}{weights[weights.length-1] > weights[0] ? " ↑" : ""}
                                      </Typography>
                                    )}
                                  </Stack>
                                  {weights.length >= 2 && <WeightChart weights={weights} />}
                                  {last && (
                                    <Typography sx={{ fontSize: 12, color: "#4A6B67", mt: 0.6 }}>
                                      Último: {[last.weight, last.reps].filter(Boolean).join(" · ")} · {last.date}
                                    </Typography>
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>
                        </Paper>
                      )}

                      <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em", mb: 1.5 }}>
                        Historial de sesiones
                      </Typography>
                      <Stack spacing={1.5}>
                        {[...sessions].reverse().map((sess, i) => {
                          const idx    = sessions.length - 1 - i;
                          const isOpen = expandedSess === idx;
                          return (
                            <Paper key={i} elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(11,94,85,0.10)", overflow: "hidden" }}>
                              <Box onClick={() => setExpandedSess(isOpen ? null : idx)}
                                sx={{ px: 2.5, py: 1.8, cursor: "pointer", display: "flex", alignItems: "center", gap: 1.5, "&:hover": { bgcolor: "rgba(11,94,85,0.02)" } }}>
                                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: activeTipo?.bg || "#E6F5F3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <Typography sx={{ fontSize: 16 }}>💪</Typography>
                                </Box>
                                <Box flex={1} minWidth={0}>
                                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0F2420" }}>{sess.dayName}</Typography>
                                  <Typography sx={{ fontSize: 11.5, color: "#8AADAA" }}>{sess.date} · {Object.keys(sess.exercises).length} ejercicios</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 13, color: "#8AADAA" }}>{isOpen ? "▲" : "▼"}</Typography>
                              </Box>
                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                                    <Box sx={{ px: 2.5, pb: 2, borderTop: "1px solid rgba(11,94,85,0.07)" }}>
                                      <Stack spacing={1} mt={1.5}>
                                        {Object.entries(sess.exercises).map(([name, val]) => (
                                          <Stack key={name} direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ fontSize: 13, color: "#4A6B67", flex: 1 }}>{name}</Typography>
                                            <Stack direction="row" spacing={0.8}>
                                              {val.weight && <Chip label={val.weight} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: activeTipo?.bg || "#E6F5F3", color: activeTipo?.color || "#0B5E55" }} />}
                                              {val.reps && <Chip label={val.reps} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67" }} />}
                                            </Stack>
                                          </Stack>
                                        ))}
                                      </Stack>
                                    </Box>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Paper>
                          );
                        })}
                      </Stack>
                    </>
                  )}
                </motion.div>
              )}

              {/* ── Tab: TIPS ── */}
              {activeTab === "tips" && (
                <motion.div key="tab-tips" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  {plan.weeklyTips && (
                    <Paper elevation={0} sx={{
                      borderRadius: 4, border: "1px solid rgba(11,94,85,0.10)", p: 2.5, mb: 3,
                      background: activeTipo ? `linear-gradient(135deg, ${activeTipo.color}10 0%, #fff 100%)` : "#fff",
                    }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Typography sx={{ fontSize: 16 }}>📅</Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: activeTipo?.color || "#0B5E55", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {totalDays === 1 ? "Tips para hoy" : `Semana ${currentWeek}`}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 14, color: "#3D5A57", lineHeight: 1.7 }}>
                        {plan.weeklyTips[String(currentWeek)] || plan.weeklyTips["1"] || "¡Seguí con tu plan, estás haciendo un gran trabajo!"}
                      </Typography>
                    </Paper>
                  )}

                  {plan.progression?.length > 0 && (
                    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(11,94,85,0.10)", p: 2.5, mb: 3 }}>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em", mb: 1.5 }}>
                        Fases de progresión
                      </Typography>
                      <Stack spacing={1.5}>
                        {plan.progression.map((ph, i) => (
                          <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: activeTipo?.color || "#0B5E55", mt: 0.7, flexShrink: 0 }} />
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#0F2420" }}>{ph.phase} — {ph.focus}</Typography>
                              <Typography sx={{ fontSize: 12.5, color: "#4A6B67", lineHeight: 1.5 }}>{ph.note}</Typography>
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {!tipsData ? (
                    <Button fullWidth onClick={handleLoadTips} disabled={loadingTips}
                      startIcon={loadingTips ? <CircularProgress size={16} sx={{ color: "#0B5E55" }} /> : <AutoAwesomeRoundedIcon />}
                      sx={{
                        py: 1.5, borderRadius: 3, textTransform: "none", fontWeight: 700, fontSize: 14, mb: 3,
                        border: "1.5px solid rgba(11,94,85,0.20)", color: "#0B5E55",
                        "&:hover": { bgcolor: "rgba(11,94,85,0.05)", borderColor: "#0B5E55" },
                      }}>
                      {loadingTips ? "Generando tips…" : "Cargar tips personalizados con IA"}
                    </Button>
                  ) : (
                    <Stack spacing={1.5} mb={3}>
                      {tipsData.map((tip, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                          <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(11,94,85,0.10)", p: 2.2 }}>
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <Typography sx={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{tip.icon}</Typography>
                              <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 800, color: activeTipo?.color || "#0B5E55", mb: 0.3 }}>{tip.title}</Typography>
                                <Typography sx={{ fontSize: 13, color: "#4A6B67", lineHeight: 1.65 }}>{tip.body}</Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </motion.div>
                      ))}
                    </Stack>
                  )}

                  <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(230,81,0,0.20)", bgcolor: "#FFF8F5", p: 2 }}>
                    <Stack direction="row" spacing={1.2} alignItems="flex-start">
                      <Typography sx={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>⚠️</Typography>
                      <Typography sx={{ fontSize: 12, color: "#BF360C", lineHeight: 1.65 }}>
                        {plan.disclaimer || "Este plan es orientativo y no reemplaza la guía de un entrenador o profesional de la salud."}
                      </Typography>
                    </Stack>
                  </Paper>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══════════════ SESSION TRACKING ══════════════ */}
          {phase === "plan" && plan && activeDay && (
            <motion.div key="session" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
              <Button onClick={() => setActiveDay(null)} startIcon={<ArrowBackRoundedIcon />} size="small"
                sx={{ mb: 2.5, textTransform: "none", color: "#4A6B67", fontWeight: 600, borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}>
                Volver al plan
              </Button>

              <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.5px", mb: 0.4 }}>
                {plan.weekStructure[activeDay]?.name}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: "#4A6B67", mb: 3 }}>
                {plan.weekStructure[activeDay]?.focus} · Registrá tu sesión de hoy
              </Typography>

              <Stack spacing={2} mb={3}>
                {(plan.weekStructure[activeDay]?.exercises || []).map((ex, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(11,94,85,0.10)", p: 2.5 }}>
                      <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: "#0F2420", mb: 0.5 }}>{ex.name}</Typography>
                      <Stack direction="row" spacing={0.8} mb={1.2}>
                        <Chip label={`${ex.sets} series`} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: activeTipo?.bg || "#E6F5F3", color: activeTipo?.color || "#0B5E55" }} />
                        <Chip label={ex.reps} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67" }} />
                        <Chip label={ex.rest} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67" }} />
                      </Stack>
                      {ex.notes && <Typography sx={{ fontSize: 11.5, color: "#8AADAA", mb: 1.2, fontStyle: "italic" }}>💡 {ex.notes}</Typography>}
                      <Stack direction="row" spacing={1.5}>
                        <TextField size="small"
                          label={isRunning ? "Distancia" : "Peso / Carga"}
                          placeholder={isRunning ? "ej: 5.2 km" : "ej: 60 kg"}
                          value={sessionLog[ex.name]?.weight || ""}
                          onChange={(e) => setSessionLog(p => ({ ...p, [ex.name]: { ...p[ex.name], weight: e.target.value } }))}
                          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                        />
                        <TextField size="small"
                          label={isRunning ? "Tiempo" : "Reps logradas"}
                          placeholder={isRunning ? "ej: 28 min" : "ej: 10/10/8"}
                          value={sessionLog[ex.name]?.reps || ""}
                          onChange={(e) => setSessionLog(p => ({ ...p, [ex.name]: { ...p[ex.name], reps: e.target.value } }))}
                          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                        />
                      </Stack>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>

              <Button fullWidth variant="contained" onClick={saveSession} sx={{
                py: 1.9, borderRadius: 3, textTransform: "none", fontWeight: 900, fontSize: 16,
                background: `linear-gradient(135deg, ${activeTipo?.color || "#0B5E55"} 0%, ${activeTipo?.color || "#0B5E55"}BB 100%)`,
                boxShadow: `0 8px 28px ${activeTipo?.border || "rgba(11,94,85,0.30)"}`,
                "&:hover": { transform: "translateY(-2px)" }, transition: "all 0.25s ease",
              }}>
                Guardar sesión ✓
              </Button>
            </motion.div>
          )}

          {/* ══════════════ SUMMARY ══════════════ */}
          {phase === "summary" && (
            <motion.div key="summary" variants={fadeUp} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography sx={{
                  fontSize: 64, lineHeight: 1, mb: 2, display: "inline-block",
                  "@keyframes trophy": { "0%,100%": { transform: "scale(1) rotate(-5deg)" }, "50%": { transform: "scale(1.12) rotate(5deg)" } },
                  animation: "trophy 2.2s ease-in-out infinite",
                }}>🏆</Typography>
                <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.7px", mb: 0.5 }}>
                  ¡Plan completado!
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#4A6B67" }}>{plan?.planTitle} · {config?.duracion}</Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, mb: 3 }}>
                {[
                  { icon: "💪", label: "Sesiones",  value: sessions.length },
                  { icon: "📅", label: "Días",      value: elapsed },
                  { icon: "🎯", label: "Ejercicios",value: loggedExs.length },
                ].map((stat) => (
                  <Paper key={stat.label} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(11,94,85,0.10)", textAlign: "center" }}>
                    <Typography sx={{ fontSize: 24, mb: 0.5 }}>{stat.icon}</Typography>
                    <Typography sx={{ fontSize: 22, fontWeight: 900, color: activeTipo?.color || "#0B5E55", lineHeight: 1 }}>{stat.value}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#8AADAA", fontWeight: 600 }}>{stat.label}</Typography>
                  </Paper>
                ))}
              </Box>

              {loggedExs.length > 0 && (
                <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(11,94,85,0.10)", p: 2.5, mb: 3 }}>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em", mb: 2 }}>
                    Tu progresión
                  </Typography>
                  <Stack spacing={2.5}>
                    {loggedExs.slice(0, 4).map((ex) => {
                      const weights = getExHistory(ex).map(h => parseFloat(h.weight)).filter(n => !isNaN(n) && n > 0);
                      if (!weights.length) return null;
                      return (
                        <Box key={ex}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F2420" }}>{ex}</Typography>
                            {weights.length >= 2 && (
                              <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: weights[weights.length-1] >= weights[0] ? "#2E7D32" : "#4A6B67" }}>
                                {weights[0]} → {weights[weights.length-1]}{weights[weights.length-1] > weights[0] ? " 📈" : ""}
                              </Typography>
                            )}
                          </Stack>
                          {weights.length >= 2 && <WeightChart weights={weights} />}
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              )}

              <Stack spacing={1.5}>
                <Button fullWidth variant="contained" onClick={() => resetPlan(false)} sx={{
                  py: 1.8, borderRadius: 3, textTransform: "none", fontWeight: 900, fontSize: 16,
                  background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
                  boxShadow: "0 8px 28px rgba(11,94,85,0.30)",
                  "&:hover": { transform: "translateY(-2px)" }, transition: "all 0.25s ease",
                }}>
                  Iniciar nuevo plan 🚀
                </Button>
                <Button fullWidth onClick={() => resetPlan(true)} sx={{
                  py: 1.5, borderRadius: 3, textTransform: "none", fontWeight: 700, fontSize: 14.5,
                  border: "1.5px solid rgba(11,94,85,0.20)", color: "#0B5E55",
                  "&:hover": { bgcolor: "rgba(11,94,85,0.05)", borderColor: "#0B5E55" },
                }}>
                  Continuar con progresividad (mismo tipo)
                </Button>
                {/* Si había plan principal, volver a él */}
                {activePlanType === "quick" && hasMainPlan && (
                  <Button fullWidth onClick={() => switchToPlan("main")} sx={{
                    py: 1.5, borderRadius: 3, textTransform: "none", fontWeight: 700, fontSize: 14.5,
                    border: "1.5px solid rgba(11,94,85,0.20)", color: "#4A6B67",
                    "&:hover": { bgcolor: "rgba(11,94,85,0.04)" },
                  }}>
                    ← Volver a mi plan principal
                  </Button>
                )}
              </Stack>
            </motion.div>
          )}

        </AnimatePresence>
        <Box sx={{ height: 80 }} />
      </Box>

      <Snackbar open={!!snackMsg} autoHideDuration={2800} onClose={() => setSnackMsg("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackMsg("")} severity={snackMsg.includes("pudo") || snackMsg.includes("ingresá") ? "warning" : "success"} variant="filled" sx={{ borderRadius: 3, fontWeight: 700 }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TrainingPage;
