import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, Stack, Paper, Chip, Button, IconButton,
  CircularProgress, LinearProgress, Divider, TextField,
} from "@mui/material";
import MicRoundedIcon                 from "@mui/icons-material/MicRounded";
import StopRoundedIcon                from "@mui/icons-material/StopRounded";
import CheckRoundedIcon               from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon               from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon       from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon           from "@mui/icons-material/ArrowBackRounded";
import TuneRoundedIcon                from "@mui/icons-material/TuneRounded";
import TrendingDownRoundedIcon        from "@mui/icons-material/TrendingDownRounded";
import TrendingFlatRoundedIcon        from "@mui/icons-material/TrendingFlatRounded";
import TrendingUpRoundedIcon          from "@mui/icons-material/TrendingUpRounded";
import RestaurantRoundedIcon          from "@mui/icons-material/RestaurantRounded";
import DirectionsRunRoundedIcon       from "@mui/icons-material/DirectionsRunRounded";
import OpacityRoundedIcon             from "@mui/icons-material/OpacityRounded";
import { useNavigate }                from "react-router-dom";
import { useNutrition }               from "../context/NutritionContext";
import { API_URL }                    from "../config/api";

/* ─── Tokens ──────────────────────────────────────────────────── */
const C = {
  brand: "#0B5E55", brandLight: "#0f7a6e", brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9", surface: "#FFFFFF", surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.10)", text: "#0F2420", textSec: "#4A6B67",
  textMuted: "#8AADAA", danger: "#E24B4A", gold: "#C9952A",
  green: "#2E7D32", blue: "#1565C0",
};

/* ─── Opciones de objetivo ────────────────────────────────────── */
const GOALS = [
  { id: "bajar_peso",     label: "Bajar peso / perder grasa",    Icon: TrendingDownRoundedIcon, adj: -500, color: "#E24B4A", bg: "#FFF5F5", desc: "Déficit de 500 kcal/día" },
  { id: "mantener",       label: "Mantener peso",                Icon: TrendingFlatRoundedIcon, adj: 0,    color: "#0B5E55", bg: "#E6F5F3", desc: "Equilibrio calórico" },
  { id: "ganar_musculo",  label: "Subir peso / ganar músculo",   Icon: TrendingUpRoundedIcon,   adj: 300,  color: "#C9952A", bg: "#FDF6E3", desc: "Superávit de 300 kcal/día" },
];

/* ─── Factores de actividad (TDEE = BMR × factor) ────────────── */
const ACTIVITY_FACTOR = {
  // valores del perfil
  "sedentario": 1.2, "Nula": 1.2,
  "ligero":     1.375,
  "moderado":   1.55, "Moderada": 1.55,
  "activo":     1.725, "Intensa": 1.725,
  "muy_activo": 1.9, "muy activo": 1.9, "Profesional": 1.9,
};

/* ─── Cálculos calóricos ──────────────────────────────────────── */
const calcBMR = (ud) => {
  if (!ud?.peso || !ud?.altura || !ud?.edad) return null;
  const base = (10 * ud.peso) + (6.25 * ud.altura) - (5 * ud.edad);
  const isMale = ud.sexo === "M" || ud.sexo === "masculino";
  return Math.round(isMale ? base + 5 : base - 161);
};

const calcTDEE = (bmr, actividad) => {
  const factor = ACTIVITY_FACTOR[actividad] || 1.375;
  return Math.round(bmr * factor);
};

const calcDailyGoal = (tdee, goalId) => {
  const goal = GOALS.find((g) => g.id === goalId);
  return tdee + (goal?.adj || 0);
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmt    = (n) => Math.round(n || 0).toLocaleString("es-AR");
const pctVal = (v, max) => Math.min(100, Math.round(((v || 0) / Math.max(max || 1, 1)) * 100));

const TypeIcon = ({ tipo }) => {
  if (tipo === "comida")    return <RestaurantRoundedIcon    sx={{ fontSize: 16 }} />;
  if (tipo === "actividad") return <DirectionsRunRoundedIcon sx={{ fontSize: 16 }} />;
  return <OpacityRoundedIcon sx={{ fontSize: 16 }} />;
};
const typeColor = (tipo) =>
  tipo === "comida" ? C.gold : tipo === "actividad" ? C.brand : C.blue;

/* ─── Pantalla de selección de objetivo ──────────────────────── */
const GoalSelector = ({ onSelect, saving }) => (
  <Box sx={{ minHeight: "100dvh", bgcolor: C.surfaceAlt, px: 2, pt: { xs: 10, sm: 12 }, pb: 8,
    display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Box sx={{ maxWidth: 480, width: "100%" }}>
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography sx={{ fontSize: 32, mb: 1 }}>🎯</Typography>
        <Typography sx={{ fontSize: 22, fontWeight: 900, color: C.text, mb: 1 }}>
          ¿Cuál es tu objetivo nutricional?
        </Typography>
        <Typography sx={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>
          Tu objetivo calórico diario se calcula en base a tu metabolismo basal, nivel de actividad y esta meta.
        </Typography>
      </Box>
      <Stack spacing={2}>
        {GOALS.map(({ id, label, Icon, desc, color, bg }) => (
          <Paper key={id} elevation={0} onClick={() => onSelect(id)}
            sx={{ p: 2.5, borderRadius: 3, border: `1.5px solid ${color}30`, bgcolor: bg,
              cursor: "pointer", transition: "all 0.18s",
              "&:hover": { border: `1.5px solid ${color}`, transform: "translateY(-2px)",
                boxShadow: `0 6px 20px ${color}20` } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: `${color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon sx={{ fontSize: 22, color }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.text }}>{label}</Typography>
                <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>{desc}</Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
      {saving && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <CircularProgress size={20} sx={{ color: C.brand }} />
        </Box>
      )}
    </Box>
  </Box>
);

/* ─── Componente principal ────────────────────────────────────── */
const EnergyPage = () => {
  const { userData, subPlan, subStatus } = useNutrition();
  const navigate     = useNavigate();
  const token        = localStorage.getItem("nutrismartToken");

  const [log,        setLog]       = useState(null);
  const [dayEval,    setDayEval]   = useState(null); // evaluación del día anterior
  const [loading,    setLoading]   = useState(true);
  const [energyGoal, setEnergyGoal]= useState(null); // "bajar_peso" | "mantener" | "ganar_musculo"
  const [savingGoal, setSavingGoal]= useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const [inputText,  setInputText] = useState("");
  const [listening,  setListening] = useState(false);
  const [interim,    setInterim]   = useState(""); // transcripción en tiempo real
  const [parsing,    setParsing]   = useState(false);
  const [preview,    setPreview]   = useState(null);
  const [saving,     setSaving]    = useState(false);
  const [deleteId,   setDeleteId]  = useState(null);
  const [monthly,    setMonthly]   = useState(null); // historial mensual (solo Gold)

  const recognitionRef = useRef(null);

  // Plan efectivo: "gold", "silver", "free"
  const isGold   = subPlan === "gold"   && subStatus === "active";
  const isSilver = subPlan === "silver" && subStatus === "active";
  const isFree   = subPlan === "free"   && subStatus === "active"; // trial 7 días

  /* ─── Cálculos ── */
  const bmr       = calcBMR(userData);
  const tdee      = bmr ? calcTDEE(bmr, userData?.actividad) : null;
  const goalData  = GOALS.find((g) => g.id === energyGoal);
  const dailyGoal = (tdee && energyGoal) ? calcDailyGoal(tdee, energyGoal) : null;

  const consumed     = log?.totalConsumido  || 0;
  const burnedExtra  = Math.round((log?.totalNEAT || 0) + (log?.trainingKcal || 0));
  const restantes    = dailyGoal ? Math.round(dailyGoal + burnedExtra - consumed) : null;

  const proteinaObj = userData?.peso ? Math.round(userData.peso * 1.8) : 120;
  const aguaObj     = userData?.peso ? Math.round(userData.peso * 35)  : 2000;

  /* ─── Balance status ── */
  const balanceStatus = () => {
    if (!dailyGoal) return null;
    if (restantes > 150)  return { label: "Por debajo del objetivo", color: C.blue,  emoji: "📉" };
    if (restantes < -150) return { label: "Por encima del objetivo", color: C.danger, emoji: "⚠️" };
    return { label: "Dentro del objetivo", color: C.green, emoji: "✅" };
  };

  /* ─── Fetch del log ── */
  const fetchLog = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${API_URL}/api/energy/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLog(data);
      if (data.energyGoal) setEnergyGoal(data.energyGoal);
      if (data.dayEvaluation) setDayEval(data.dayEvaluation);
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  // Limpiar micrófono al salir de la página
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetchLog();
    // Solo Gold carga historial mensual
    if (isGold && token) {
      fetch(`${API_URL}/api/energy/monthly`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setMonthly(d))
        .catch(() => {});
    }
  }, [fetchLog, isGold, token]); // eslint-disable-line

  /* ─── Guardar objetivo ── */
  const handleSelectGoal = async (goal) => {
    setSavingGoal(true);
    try {
      await fetch(`${API_URL}/api/energy/goal`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ energyGoal: goal }),
      });
      setEnergyGoal(goal);
      setShowGoalPicker(false);
    } catch {}
    finally { setSavingGoal(false); }
  };

  /* ─── Reconocimiento de voz con interim ── */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Tu navegador no soporta reconocimiento de voz. Escribí directamente."); return; }
    const r = new SR();
    r.lang = "es-AR";
    r.interimResults = true;
    r.continuous     = false;
    r.onresult = (e) => {
      let final = "", inter = "";
      for (const result of e.results) {
        if (result.isFinal) final += result[0].transcript;
        else inter += result[0].transcript;
      }
      if (final) { setInputText((p) => p + (p ? " " : "") + final); setInterim(""); }
      else setInterim(inter);
    };
    r.onerror = () => { setListening(false); setInterim(""); };
    r.onend   = () => { setListening(false); setInterim(""); };
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); setInterim(""); };

  /* ─── Parsear con GPT ── */
  const handleParse = async () => {
    // Detener el micrófono siempre antes de parsear
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterim("");

    const texto = (inputText + " " + interim).trim();
    if (!texto) return;
    setParsing(true);
    setPreview(null);
    try {
      const res = await fetch(`${API_URL}/api/energy/parse`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ texto, peso: userData?.peso || 70, sexo: userData?.sexo || "M", edad: userData?.edad || 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data);
      setInterim("");
    } catch (err) { alert(err.message || "Error al interpretar. Intentá de nuevo."); }
    finally { setParsing(false); }
  };

  /* ─── Confirmar entrada ── */
  const handleConfirm = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/energy/log`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ parsed: preview }),
      });
      if (!res.ok) throw new Error();
      setPreview(null);
      setInputText("");
      fetchLog();
    } catch { alert("Error al guardar."); }
    finally { setSaving(false); }
  };

  /* ─── Eliminar entrada ── */
  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await fetch(`${API_URL}/api/energy/log/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      fetchLog();
    } catch {}
    finally { setDeleteId(null); }
  };

  /* ─── Pantalla de selección de objetivo ── */
  if (!loading && !energyGoal || showGoalPicker) {
    return <GoalSelector onSelect={handleSelectGoal} saving={savingGoal} />;
  }

  if (loading) return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: C.brand }} />
    </Box>
  );

  const status = balanceStatus();

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: C.surfaceAlt, px: { xs: 2, sm: 3 },
      pt: { xs: 10, sm: 12 }, pb: 10 }}>
      <Box sx={{ maxWidth: 680, mx: "auto" }}>

        {/* ── Notificación evaluación día anterior ── */}
        {dayEval && (
          <Box sx={{
            mb: 3, px: 2.5, py: 2, borderRadius: 3,
            bgcolor: dayEval.goalMet ? "rgba(46,125,50,0.10)" : "rgba(226,75,74,0.08)",
            border: `1.5px solid ${dayEval.goalMet ? "rgba(46,125,50,0.30)" : "rgba(226,75,74,0.25)"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
          }}>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 800,
                color: dayEval.goalMet ? C.green : C.danger, mb: 0.3 }}>
                {dayEval.goalMet ? "✅ Objetivo cumplido" : "📊 Objetivo no alcanzado"}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: C.textSec, lineHeight: 1.5 }}>
                {dayEval.message}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", flexShrink: 0,
              px: 2, py: 1, borderRadius: 2,
              bgcolor: dayEval.goalMet ? "rgba(46,125,50,0.15)" : "rgba(226,75,74,0.12)" }}>
              <Typography sx={{ fontSize: 22, fontWeight: 900, lineHeight: 1,
                color: dayEval.goalMet ? C.green : C.danger }}>
                {dayEval.points > 0 ? `+${dayEval.points}` : dayEval.points}
              </Typography>
              <Typography sx={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>
                pts
              </Typography>
            </Box>
          </Box>
        )}

        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={() => navigate("/")} size="small"
              sx={{ color: C.textSec, "&:hover": { bgcolor: C.brandSurface } }}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.5px" }}>
                Balance energético
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setShowGoalPicker(true)} size="small"
            sx={{ color: C.textSec, border: `1px solid ${C.border}`, borderRadius: 2,
              "&:hover": { bgcolor: C.brandSurface, color: C.brand } }}>
            <TuneRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Objetivo activo */}
        {goalData && (
          <Box sx={{ mb: 3, px: 2, py: 1, borderRadius: 2.5, display: "inline-flex",
            alignItems: "center", gap: 1, bgcolor: `${goalData.color}12`,
            border: `1px solid ${goalData.color}30` }}>
            <goalData.Icon sx={{ fontSize: 15, color: goalData.color }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: goalData.color }}>
              {goalData.label}
            </Typography>
          </Box>
        )}

        {/* ── Cards de métricas principales ── */}
        <Stack spacing={1.5} mb={3}>

          {/* Objetivo diario */}
          <Paper elevation={0} sx={{ px: 3, py: 2.5, borderRadius: 3,
            border: `1.5px solid ${C.brand}25`, bgcolor: C.surface }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>Objetivo diario</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 900, color: C.brand, lineHeight: 1.1 }}>
                  {dailyGoal ? fmt(dailyGoal) : "—"}
                  <Typography component="span" sx={{ fontSize: 13, color: C.textMuted, fontWeight: 400 }}> kcal</Typography>
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: 10.5, color: C.textMuted, mb: 0.3 }}>TMB: {fmt(bmr)} kcal</Typography>
                <Typography sx={{ fontSize: 10.5, color: C.textMuted, mb: 0.3 }}>TDEE: {fmt(tdee)} kcal</Typography>
                <Typography sx={{ fontSize: 10.5, color: goalData?.color || C.textMuted, fontWeight: 700 }}>
                  Ajuste: {goalData?.adj >= 0 ? "+" : ""}{goalData?.adj || 0} kcal
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Grid: Consumidas / Quemadas por actividad */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Paper elevation={0} sx={{ px: 2.5, py: 2, borderRadius: 3,
              border: `1px solid rgba(201,149,42,0.25)`, bgcolor: "#FFFBF0" }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted,
                textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
                🍽️ Consumidas
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
                {fmt(consumed)}
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: C.textMuted }}>kcal comidas</Typography>
            </Paper>

            <Paper elevation={0} sx={{ px: 2.5, py: 2, borderRadius: 3,
              border: `1px solid rgba(11,94,85,0.20)`, bgcolor: C.brandSurface }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted,
                textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
                🔥 Quemadas extra
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: C.brand, lineHeight: 1 }}>
                {fmt(burnedExtra)}
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: C.textMuted }}>entrenamiento + actividad</Typography>
            </Paper>
          </Box>

          {/* Restantes */}
          <Paper elevation={0} sx={{ px: 3, py: 2.5, borderRadius: 3,
            border: `1.5px solid ${restantes !== null && restantes < -150 ? C.danger : restantes !== null && restantes > 150 ? C.blue : C.green}30`,
            bgcolor: restantes !== null && restantes < -150 ? "#FFF5F5" : restantes !== null && restantes > 150 ? "#EFF6FF" : "#F0FFF4" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>Restantes</Typography>
                <Typography sx={{ fontSize: 32, fontWeight: 900, lineHeight: 1,
                  color: restantes !== null && restantes < -150 ? C.danger : restantes !== null && restantes > 150 ? C.blue : C.green }}>
                  {restantes !== null ? fmt(Math.abs(restantes)) : "—"}
                  <Typography component="span" sx={{ fontSize: 13, color: C.textMuted, fontWeight: 400 }}> kcal</Typography>
                </Typography>
                <Typography sx={{ fontSize: 12, color: C.textSec, mt: 0.5 }}>
                  = Objetivo ({fmt(dailyGoal)}) + Extra ({fmt(burnedExtra)}) − Consumidas ({fmt(consumed)})
                </Typography>
              </Box>
            </Stack>
            {dailyGoal && (
              <Box sx={{ mt: 1.5 }}>
                <LinearProgress variant="determinate"
                  value={pctVal(consumed, dailyGoal + burnedExtra)}
                  sx={{ height: 8, borderRadius: 999,
                    bgcolor: "rgba(0,0,0,0.06)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: consumed > dailyGoal + burnedExtra ? C.danger : C.green,
                      borderRadius: 999,
                    } }} />
              </Box>
            )}
          </Paper>

          {/* Balance del día */}
          {status && (
            <Box sx={{ px: 2.5, py: 1.5, borderRadius: 2.5,
              bgcolor: `${status.color}10`, border: `1px solid ${status.color}25`,
              display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: 18 }}>{status.emoji}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: status.color }}>
                Balance: {status.label}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* ── Macros y agua ── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, mb: 3 }}>
          {[
            { label: "Proteína",  val: log?.totalProteinas || 0, obj: proteinaObj, unit: "g", color: C.blue   },
            { label: "Carbos",    val: log?.totalCarbos    || 0, obj: 250,         unit: "g", color: C.gold   },
            { label: "Grasas",    val: log?.totalGrasas    || 0, obj: 65,          unit: "g", color: C.danger },
            { label: "Agua",      val: Math.round((log?.totalAgua || 0) / 100) / 10, obj: Math.round(aguaObj / 100) / 10, unit: "L", color: C.brand },
          ].map(({ label, val, obj, unit, color }) => (
            <Paper key={label} elevation={0}
              sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${C.border}`, bgcolor: C.surface, textAlign: "center" }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: C.textMuted,
                textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.3 }}>{label}</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>
                {unit === "L" ? val.toFixed(1) : Math.round(val)}
              </Typography>
              <Typography sx={{ fontSize: 9.5, color: C.textMuted }}>/{obj}{unit}</Typography>
              <LinearProgress variant="determinate" value={pctVal(val, obj)}
                sx={{ mt: 0.8, height: 3, borderRadius: 999, bgcolor: `${color}18`,
                  "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 999 } }} />
            </Paper>
          ))}
        </Box>

        {/* ── Input de voz/texto mejorado ── */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4,
          border: `1.5px solid ${listening ? C.danger : C.brandMuted}`,
          bgcolor: C.brandSurface, mb: 3, transition: "border-color 0.2s" }}>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.brand }}>
              ¿Qué comiste o hiciste hoy?
            </Typography>
            {listening && (
              <Chip label="Escuchando…" size="small" sx={{ bgcolor: "rgba(226,75,74,0.12)",
                color: C.danger, fontWeight: 700, fontSize: 11,
                animation: "pulse 1s ease-in-out infinite",
                "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } } }} />
            )}
          </Stack>

          {/* Área de texto grande y scrolleable */}
          <Box sx={{ position: "relative", mb: 2 }}>
            <TextField
              multiline
              minRows={3}
              maxRows={8}
              placeholder={listening
                ? "Hablá ahora… el texto aparece en tiempo real"
                : 'Ej: "Comí un plato de pasta con pollo" · "Caminé 40 minutos" · "Tomé 2 vasos de agua"'}
              value={listening ? (inputText + (inputText && interim ? " " : "") + interim) : inputText}
              onChange={(e) => { if (!listening) setInputText(e.target.value); }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5, bgcolor: C.surface, fontSize: 14.5,
                  lineHeight: 1.7,
                  "& fieldset": { borderColor: listening ? C.danger : C.brandMuted },
                  "&.Mui-focused fieldset": { borderColor: listening ? C.danger : C.brand, borderWidth: 2 },
                },
                "& textarea": { scrollbarWidth: "thin" },
              }}
            />
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              onClick={listening ? stopListening : startListening}
              variant={listening ? "contained" : "outlined"}
              startIcon={listening ? <StopRoundedIcon /> : <MicRoundedIcon />}
              sx={{
                borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13,
                bgcolor: listening ? C.danger : "transparent",
                borderColor: listening ? C.danger : C.brand,
                color: listening ? "#fff" : C.brand,
                "&:hover": { bgcolor: listening ? "#c0392b" : C.brandSurface },
                minWidth: 130,
              }}>
              {listening ? "Detener" : "Micrófono"}
            </Button>
            <Button
              onClick={handleParse}
              disabled={!inputText.trim() || parsing}
              variant="contained" fullWidth
              sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 14,
                bgcolor: C.brand, "&:hover": { bgcolor: C.brandLight } }}>
              {parsing
                ? <><CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} />Interpretando…</>
                : "Interpretar →"}
            </Button>
          </Stack>
        </Paper>

        {/* ── Preview: confirmación ── */}
        {preview && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3,
            border: `1.5px solid ${typeColor(preview.tipo)}40`,
            bgcolor: `${typeColor(preview.tipo)}06` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                ¿Registrar esto?
              </Typography>
              <IconButton size="small" onClick={() => setPreview(null)} sx={{ color: C.textMuted }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Box sx={{ px: 2, py: 1.8, borderRadius: 2.5, bgcolor: C.surface, mb: 2, border: `1px solid ${C.border}` }}>
              <Typography sx={{ fontSize: 14, color: C.text, fontWeight: 600, mb: 1 }}>
                {preview.resumen}
              </Typography>
              {preview.tipo === "comida" && (
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {[
                    { label: "Kcal",     val: preview.totales?.kcal,     color: C.gold   },
                    { label: "Proteína", val: preview.totales?.proteinas, color: C.blue   },
                    { label: "Carbos",   val: preview.totales?.carbos,    color: C.brand  },
                    { label: "Grasas",   val: preview.totales?.grasas,    color: C.danger },
                  ].map(({ label, val, color }) => (
                    <Box key={label}>
                      <Typography sx={{ fontSize: 18, fontWeight: 900, color }}>{Math.round(val || 0)}</Typography>
                      <Typography sx={{ fontSize: 11, color: C.textMuted }}>{label}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
              {preview.tipo === "actividad" && (
                <Typography sx={{ fontSize: 16, fontWeight: 900, color: C.brand }}>
                  🔥 {Math.round(preview.totales?.kcal || 0)} kcal quemadas
                </Typography>
              )}
              {preview.tipo === "agua" && (
                <Typography sx={{ fontSize: 16, fontWeight: 900, color: C.blue }}>
                  💧 {((preview.agua_ml || 0) / 1000).toFixed(2)} litros
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button onClick={() => setPreview(null)} fullWidth
                sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600, color: C.textSec,
                  border: `1px solid ${C.border}` }}>
                Corregir
              </Button>
              <Button onClick={handleConfirm} disabled={saving} variant="contained" fullWidth
                startIcon={saving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <CheckRoundedIcon />}
                sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700,
                  bgcolor: typeColor(preview.tipo), "&:hover": { filter: "brightness(0.9)" } }}>
                {saving ? "Guardando…" : "Confirmar"}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* ── Log del día ── */}
        {(log?.entries?.length || 0) > 0 && (
          <>
            <Divider sx={{ mb: 2, borderColor: C.border }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted,
              textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
              Registrado hoy
            </Typography>
            <Stack spacing={1}>
              {[...(log?.entries || [])].reverse().map((entry) => (
                <Paper key={entry._id} elevation={0}
                  sx={{ px: 2.5, py: 1.8, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.surface,
                    display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, flexShrink: 0,
                      bgcolor: `${typeColor(entry.tipo)}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: typeColor(entry.tipo) }}>
                      <TypeIcon tipo={entry.tipo} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.text }} noWrap>
                        {entry.resumen}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: C.textMuted }}>
                        {entry.tipo === "comida"    ? `${Math.round(entry.kcal || 0)} kcal · ${Math.round(entry.proteinas || 0)}g prot` :
                         entry.tipo === "actividad" ? `${Math.round(entry.kcal || 0)} kcal quemadas` :
                         `${((entry.agua_ml || 0) / 1000).toFixed(2)} L`}
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton size="small" disabled={deleteId === entry._id}
                    onClick={() => handleDelete(entry._id)}
                    sx={{ color: C.textMuted, ml: 1, flexShrink: 0,
                      "&:hover": { color: C.danger, bgcolor: "rgba(226,75,74,0.07)" } }}>
                    {deleteId === entry._id
                      ? <CircularProgress size={14} sx={{ color: C.textMuted }} />
                      : <DeleteOutlineRoundedIcon fontSize="small" />}
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          </>
        )}

        {/* ── Estado vacío ── */}
        {!log?.entries?.length && !preview && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              Tu TMB es <strong style={{ color: C.text }}>{fmt(bmr)} kcal</strong> · TDEE estimado <strong style={{ color: C.text }}>{fmt(tdee)} kcal</strong><br />
              Usá el micrófono para registrar tu primera comida o actividad del día.
            </Typography>
          </Box>
        )}

        {/* ── Badge de plan + restricciones ── */}
        {!isGold && (
          <Box sx={{ mt: 3, px: 2.5, py: 2, borderRadius: 3,
            bgcolor: isGold ? C.goldSurf || "#FDF6E3" : C.surfaceAlt,
            border: `1px solid ${C.border}`, textAlign: "center" }}>
            <Typography sx={{ fontSize: 12.5, color: C.textSec, lineHeight: 1.6 }}>
              {isFree && "🎁 Plan Free — acceso completo durante 7 días de prueba, incluyendo historial acumulado."}
              {isSilver && "💎 Plan Silver — balance diario activo. El historial mensual está disponible en Plan Gold."}
              {!isFree && !isSilver && !isGold && "Suscribite para guardar tu historial de balance."}
            </Typography>
            {isSilver && (
              <Button size="small" onClick={() => window.location.href = "/pricing"}
                sx={{ mt: 1, textTransform: "none", fontWeight: 700, fontSize: 12,
                  color: C.gold || "#C9952A", border: `1px solid rgba(201,149,42,0.30)`,
                  borderRadius: 999, px: 2 }}>
                Ver Plan Gold →
              </Button>
            )}
          </Box>
        )}

        {/* ── Tabla mensual (solo Gold) ── */}
        {isGold && monthly?.daily?.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3, borderColor: C.border }} />
            <Typography sx={{ fontSize: 15, fontWeight: 900, color: C.text, mb: 0.5 }}>
              Historial del mes
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.textMuted, mb: 2.5 }}>
              {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })} · {monthly.daily.length} días registrados
            </Typography>

            {/* Tabla — scroll horizontal en mobile */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <Box sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              {/* Header */}
              <Box sx={{ display: "grid", gridTemplateColumns: "80px 70px 72px 72px 62px 56px",
                minWidth: 420, px: 2, py: 1.2, bgcolor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                {["Día", "Kcal", "Proteína", "Carbos", "Agua", "Act."].map((h) => (
                  <Typography key={h} sx={{ fontSize: 10, fontWeight: 700, color: C.textMuted,
                    textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</Typography>
                ))}
              </Box>
              {/* Filas */}
              {monthly.daily.map((d, i) => {
                const [y, m, day] = d.date.split("-");
                return (
                  <Box key={d.date} sx={{
                    display: "grid", gridTemplateColumns: "80px 70px 72px 72px 62px 56px",
                    minWidth: 420, px: 2, py: 1.4, alignItems: "center",
                    borderBottom: i < monthly.daily.length - 1 ? `1px solid ${C.border}` : "none",
                    bgcolor: d.date === log?.date ? `${C.brand}08` : "transparent",
                    "&:hover": { bgcolor: C.brandSurface },
                  }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>
                      {parseInt(day)} {new Date(d.date).toLocaleDateString("es-AR", { weekday: "short" })}
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: d.kcal > 0 ? 700 : 400,
                      color: d.kcal > 0 ? C.gold : C.textMuted }}>
                      {d.kcal > 0 ? `${d.kcal.toLocaleString("es-AR")}` : "—"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: d.proteinas > 0 ? C.blue : C.textMuted }}>
                      {d.proteinas > 0 ? `${d.proteinas}g` : "—"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: d.carbos > 0 ? C.text : C.textMuted }}>
                      {d.carbos > 0 ? `${d.carbos}g` : "—"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: d.agua_ml > 0 ? C.blue : C.textMuted }}>
                      {d.agua_ml > 0 ? `${(d.agua_ml / 1000).toFixed(1)}L` : "—"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: d.actividadKcal > 0 ? C.brand : C.textMuted }}>
                      {d.actividadKcal > 0 ? `${d.actividadKcal}` : "—"}
                    </Typography>
                  </Box>
                );
              })}
              </Box>{/* cierre overflowX */}
            </Paper>
          </Box>
        )}

      </Box>
    </Box>
  );
};

export default EnergyPage;
