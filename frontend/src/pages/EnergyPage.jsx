import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, Stack, Paper, Chip, Button, IconButton,
  CircularProgress, LinearProgress, Divider, TextField,
  Dialog, DialogContent,
} from "@mui/material";
import MicRoundedIcon            from "@mui/icons-material/MicRounded";
import StopRoundedIcon           from "@mui/icons-material/StopRounded";
import CheckRoundedIcon          from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon          from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon  from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon      from "@mui/icons-material/ArrowBackRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import RestaurantRoundedIcon     from "@mui/icons-material/RestaurantRounded";
import DirectionsRunRoundedIcon  from "@mui/icons-material/DirectionsRunRounded";
import OpacityRoundedIcon        from "@mui/icons-material/OpacityRounded";
import FitnessCenterRoundedIcon  from "@mui/icons-material/FitnessCenterRounded";
import { useNavigate }           from "react-router-dom";
import { useNutrition }          from "../context/NutritionContext";
import { API_URL }               from "../config/api";

const C = {
  brand:        "#0B5E55",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F7F9F8",
  border:       "rgba(11,94,85,0.10)",
  text:         "#0F2420",
  textSec:      "#4A6B67",
  textMuted:    "#8AADAA",
  danger:       "#E24B4A",
  gold:         "#C9952A",
  green:        "#2E7D32",
};

/* ─── BMR Mifflin-St Jeor ───────────────────────────────────── */
const calcBMR = (ud) => {
  if (!ud?.peso || !ud?.altura || !ud?.edad) return null;
  const base = (10 * ud.peso) + (6.25 * ud.altura) - (5 * ud.edad);
  const isMale = ud.sexo === "M" || ud.sexo === "masculino";
  return Math.round(isMale ? base + 5 : base - 161);
};

/* ─── Helpers ────────────────────────────────────────────────── */
const fmtKcal = (n) => Math.round(n || 0).toLocaleString("es-AR");
const pct     = (v, max) => Math.min(100, Math.round(((v || 0) / (max || 1)) * 100));

const TypeIcon = ({ tipo }) => {
  if (tipo === "comida")    return <RestaurantRoundedIcon   sx={{ fontSize: 16 }} />;
  if (tipo === "actividad") return <DirectionsRunRoundedIcon sx={{ fontSize: 16 }} />;
  return <OpacityRoundedIcon sx={{ fontSize: 16 }} />;
};

const typeColor = (tipo) =>
  tipo === "comida" ? "#C9952A" : tipo === "actividad" ? "#0B5E55" : "#1565C0";

/* ─── Componente principal ──────────────────────────────────── */
const EnergyPage = () => {
  const { userData } = useNutrition();
  const navigate     = useNavigate();
  const token        = localStorage.getItem("nutrismartToken");

  const [log,          setLog]         = useState(null);
  const [loading,      setLoading]     = useState(true);
  const [inputText,    setInputText]   = useState("");
  const [listening,    setListening]   = useState(false);
  const [parsing,      setParsing]     = useState(false);
  const [preview,      setPreview]     = useState(null); // resultado GPT antes de confirmar
  const [saving,       setSaving]      = useState(false);
  const [deleteId,     setDeleteId]    = useState(null);

  const recognitionRef = useRef(null);

  const bmr      = calcBMR(userData);
  const objetivo = userData?.objetivo || "mantenimiento";

  // Objetivos diarios por defecto (pueden venir del perfil)
  const proteinaObj = userData?.peso ? Math.round(userData.peso * 1.8) : 120; // 1.8g/kg
  const aguaObj     = userData?.peso ? Math.round(userData.peso * 35)  : 2000; // 35ml/kg

  const fetchLog = useCallback(async () => {
    if (!token) return;
    try {
      const res  = await fetch(`${API_URL}/api/energy/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLog(data);
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  /* ─── Balance calculado ── */
  const quemadas = Math.round((bmr || 0) + (log?.trainingKcal || 0) + (log?.totalNEAT || 0));
  const consumidas = log?.totalConsumido || 0;
  const balance   = quemadas - consumidas;
  const esDeficit  = balance > 0;

  /* ─── Reconocimiento de voz ── */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Tu navegador no soporta reconocimiento de voz. Escribí directamente.");
    const r = new SR();
    r.lang = "es-AR";
    r.interimResults = false;
    r.onresult = (e) => {
      setInputText(e.results[0][0].transcript);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend   = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  /* ─── Parsear texto con GPT ── */
  const handleParse = async () => {
    if (!inputText.trim()) return;
    setParsing(true);
    setPreview(null);
    try {
      const res  = await fetch(`${API_URL}/api/energy/parse`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: inputText,
          peso:  userData?.peso  || 70,
          sexo:  userData?.sexo  || "M",
          edad:  userData?.edad  || 30,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data);
    } catch (err) {
      alert(err.message || "Error al interpretar. Intentá de nuevo.");
    } finally {
      setParsing(false);
    }
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
    } catch { alert("Error al guardar. Intentá de nuevo."); }
    finally { setSaving(false); }
  };

  /* ─── Eliminar entrada ── */
  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await fetch(`${API_URL}/api/energy/log/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLog();
    } catch {}
    finally { setDeleteId(null); }
  };

  if (loading) return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: C.brand }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: C.surfaceAlt, px: { xs: 2, sm: 3 }, pt: { xs: 10, sm: 12 }, pb: 10 }}>
      <Box sx={{ maxWidth: 680, mx: "auto" }}>

        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
          <IconButton onClick={() => navigate("/")} size="small"
            sx={{ color: C.textSec, "&:hover": { bgcolor: C.brandSurface } }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.5px" }}>
              Balance energético
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>
              {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
            </Typography>
          </Box>
        </Stack>

        {/* ── Balance principal ── */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", mb: 3,
          border: `1.5px solid ${esDeficit ? "rgba(46,125,50,0.25)" : "rgba(201,149,42,0.25)"}`,
          boxShadow: "0 4px 20px rgba(11,94,85,0.08)" }}>

          <Box sx={{ px: 3, pt: 3, pb: 2, bgcolor: esDeficit ? "rgba(46,125,50,0.06)" : "rgba(201,149,42,0.06)" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>
                  Balance del día
                </Typography>
                <Typography sx={{ fontSize: 38, fontWeight: 900, lineHeight: 1,
                  color: esDeficit ? C.green : C.gold }}>
                  {esDeficit ? "-" : "+"}{fmtKcal(Math.abs(balance))}
                  <Typography component="span" sx={{ fontSize: 16, fontWeight: 400, color: C.textMuted }}> kcal</Typography>
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: C.textSec, mt: 0.5 }}>
                  {esDeficit
                    ? objetivo === "ganar músculo" ? "⚠️ Déficit — aumentá la ingesta" : "✅ Déficit calórico activo"
                    : objetivo === "perder peso"   ? "⚠️ Superávit — moderá la ingesta" : "📈 Superávit calórico"}
                </Typography>
              </Box>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 44, color: esDeficit ? C.green : C.gold, opacity: 0.6 }} />
            </Stack>
          </Box>

          {/* Desglose quemadas */}
          <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${C.border}` }}>
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Consumidas</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 900, color: C.gold }}>{fmtKcal(consumidas)}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Quemadas</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 900, color: C.brand }}>{fmtKcal(quemadas)}</Typography>
              </Box>
            </Stack>

            {/* Desglose quemadas */}
            <Stack spacing={0.6}>
              {[
                { label: "Metabolismo basal (TMB)", val: bmr || 0, icon: "🔥" },
                { label: "Entrenamiento",  val: log?.trainingKcal || 0, icon: "🏋️" },
                { label: "Actividad extra (NEAT)", val: log?.totalNEAT || 0, icon: "🚶" },
              ].map(({ label, val, icon }) => val > 0 || label.includes("TMB") ? (
                <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: 12, color: C.textSec }}>{icon} {label}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.text }}>{fmtKcal(val)} kcal</Typography>
                </Stack>
              ) : null)}
            </Stack>
          </Box>
        </Paper>

        {/* ── Nutrientes ── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 3 }}>
          {[
            { label: "Proteína",  val: log?.totalProteinas || 0, obj: proteinaObj, unit: "g",  color: "#1565C0" },
            { label: "Carbos",    val: log?.totalCarbos    || 0, obj: 250,         unit: "g",  color: C.gold    },
            { label: "Grasas",    val: log?.totalGrasas    || 0, obj: 65,          unit: "g",  color: C.danger  },
          ].map(({ label, val, obj, unit, color }) => (
            <Paper key={label} elevation={0} sx={{ p: 1.8, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.surface }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 900, color, lineHeight: 1 }}>
                {fmtKcal(val)}<Typography component="span" sx={{ fontSize: 11, color: C.textMuted }}>{unit}</Typography>
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: C.textMuted, mb: 0.8 }}>/ {obj}{unit}</Typography>
              <LinearProgress variant="determinate" value={pct(val, obj)}
                sx={{ height: 4, borderRadius: 999, bgcolor: `${color}18`,
                  "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 999 } }} />
            </Paper>
          ))}
        </Box>

        {/* ── Hidratación ── */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.surface, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <OpacityRoundedIcon sx={{ fontSize: 18, color: "#1565C0" }} />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.text }}>Hidratación</Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1565C0" }}>
              {((log?.totalAgua || 0) / 1000).toFixed(1)} / {(aguaObj / 1000).toFixed(1)} L
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={pct(log?.totalAgua || 0, aguaObj)}
            sx={{ height: 8, borderRadius: 999, bgcolor: "rgba(21,101,192,0.12)",
              "& .MuiLinearProgress-bar": { bgcolor: "#1565C0", borderRadius: 999 } }} />
        </Paper>

        {/* ── Input de voz/texto ── */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1.5px solid ${C.brandMuted}`,
          bgcolor: C.brandSurface, mb: 3 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.brand, mb: 1.5 }}>
            ¿Qué comiste o hiciste hoy?
          </Typography>

          <Stack direction="row" spacing={1} mb={1.5}>
            <TextField
              multiline rows={2}
              placeholder='Ej: "Comí un plato de pasta con pollo" o "Caminé 30 minutos"'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: C.surface, fontSize: 13,
                "& fieldset": { borderColor: C.brandMuted },
                "&.Mui-focused fieldset": { borderColor: C.brand } } }}
            />
            <Stack spacing={1}>
              <IconButton
                onClick={listening ? stopListening : startListening}
                sx={{ bgcolor: listening ? C.danger : C.brand, color: "#fff",
                  width: 44, height: 44, borderRadius: 2.5,
                  "&:hover": { bgcolor: listening ? "#c0392b" : C.brandLight },
                  animation: listening ? "pulse 1s ease-in-out infinite" : "none",
                  "@keyframes pulse": { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.1)" } } }}>
                {listening ? <StopRoundedIcon /> : <MicRoundedIcon />}
              </IconButton>
            </Stack>
          </Stack>

          <Button
            onClick={handleParse}
            disabled={!inputText.trim() || parsing}
            variant="contained" fullWidth
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 14,
              bgcolor: C.brand, "&:hover": { bgcolor: C.brandLight } }}>
            {parsing ? <><CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} />Interpretando…</> : "Interpretar →"}
          </Button>
        </Paper>

        {/* ── Preview: confirmación antes de guardar ── */}
        {preview && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3,
            border: `1.5px solid ${typeColor(preview.tipo)}30`,
            bgcolor: `${typeColor(preview.tipo)}06` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TypeIcon tipo={preview.tipo} />
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                  ¿Esto es lo que registraste?
                </Typography>
              </Stack>
              <IconButton size="small" onClick={() => setPreview(null)} sx={{ color: C.textMuted }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Box sx={{ px: 2, py: 1.5, borderRadius: 2.5, bgcolor: C.surface, mb: 2, border: `1px solid ${C.border}` }}>
              <Typography sx={{ fontSize: 13.5, color: C.text, fontWeight: 600, mb: 0.5 }}>
                {preview.resumen}
              </Typography>
              {preview.tipo === "comida" && (
                <Stack direction="row" spacing={2} mt={1}>
                  {[
                    { label: "Kcal",      val: preview.totales?.kcal      || 0, color: C.gold    },
                    { label: "Proteína",  val: preview.totales?.proteinas  || 0, color: "#1565C0" },
                    { label: "Carbos",    val: preview.totales?.carbos     || 0, color: C.brand   },
                    { label: "Grasas",    val: preview.totales?.grasas     || 0, color: C.danger  },
                  ].map(({ label, val, color }) => (
                    <Box key={label} sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 900, color }}>{Math.round(val)}</Typography>
                      <Typography sx={{ fontSize: 10.5, color: C.textMuted }}>{label}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
              {preview.tipo === "actividad" && (
                <Typography sx={{ fontSize: 14, fontWeight: 900, color: C.brand, mt: 0.5 }}>
                  🔥 {Math.round(preview.totales?.kcal || 0)} kcal quemadas
                </Typography>
              )}
              {preview.tipo === "agua" && (
                <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#1565C0", mt: 0.5 }}>
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
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted,
              textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
              Registrado hoy
            </Typography>
            <Stack spacing={1}>
              {[...(log?.entries || [])].reverse().map((entry) => (
                <Paper key={entry._id} elevation={0} sx={{ px: 2.5, py: 1.8, borderRadius: 3,
                  border: `1px solid ${C.border}`, bgcolor: C.surface,
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
        {!log?.entries?.length && (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography sx={{ fontSize: 36, mb: 1 }}>🍽️</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text, mb: 0.5 }}>
              No registraste nada aún
            </Typography>
            <Typography sx={{ fontSize: 13, color: C.textMuted }}>
              Tu TMB base es <strong>{fmtKcal(bmr)}</strong> kcal — usá el micrófono arriba para registrar tu primera comida o actividad.
            </Typography>
          </Box>
        )}

      </Box>
    </Box>
  );
};

export default EnergyPage;
