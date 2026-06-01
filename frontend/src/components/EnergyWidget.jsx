import { useEffect, useState } from "react";
import { Box, Typography, Stack, Paper, LinearProgress, Button, Chip } from "@mui/material";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import ArrowForwardRoundedIcon        from "@mui/icons-material/ArrowForwardRounded";
import MicRoundedIcon                 from "@mui/icons-material/MicRounded";
import { useNavigate }  from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import { API_URL }      from "../config/api";

const C = {
  brand: "#0B5E55", brandLight: "#0f7a6e", brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9", surface: "#FFFFFF", border: "rgba(11,94,85,0.10)",
  text: "#0F2420", textSec: "#4A6B67", textMuted: "#8AADAA",
  gold: "#C9952A", green: "#2E7D32", danger: "#E24B4A", blue: "#1565C0",
};

const ACTIVITY_FACTOR = {
  "sedentario": 1.2, "Nula": 1.2,
  "ligero": 1.375,
  "moderado": 1.55, "Moderada": 1.55,
  "activo": 1.725, "Intensa": 1.725,
  "muy_activo": 1.9, "muy activo": 1.9, "Profesional": 1.9,
};

const GOAL_ADJ = { bajar_peso: -500, mantener: 0, ganar_musculo: 300 };

const calcBMR = (ud) => {
  if (!ud?.peso || !ud?.altura || !ud?.edad) return null;
  const base = (10 * ud.peso) + (6.25 * ud.altura) - (5 * ud.edad);
  return Math.round(ud.sexo === "M" || ud.sexo === "masculino" ? base + 5 : base - 161);
};

const EnergyWidget = () => {
  const { userData } = useNutrition();
  const navigate     = useNavigate();
  const token        = localStorage.getItem("nutrismartToken");

  const [log,     setLog]     = useState(null);
  const [loading, setLoading] = useState(true);

  const bmr          = calcBMR(userData);
  const tdee         = bmr ? Math.round(bmr * (ACTIVITY_FACTOR[userData?.actividad] || 1.375)) : null;

  useEffect(() => {
    if (!token || !bmr) { setLoading(false); return; }
    fetch(`${API_URL}/api/energy/today`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setLog(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading || !bmr) return null;

  const energyGoal  = log?.energyGoal;
  const dailyGoal   = tdee ? tdee + (GOAL_ADJ[energyGoal] || 0) : null;
  const consumed    = log?.totalConsumido  || 0;
  const burnedExtra = Math.round((log?.totalNEAT || 0) + (log?.trainingKcal || 0));
  const restantes   = dailyGoal ? Math.round(dailyGoal + burnedExtra - consumed) : null;
  const pct         = dailyGoal ? Math.min(100, Math.round((consumed / (dailyGoal + burnedExtra)) * 100)) : 0;

  const restColor = restantes === null ? C.textMuted
    : restantes < -150 ? C.danger
    : restantes > 150  ? C.blue
    : C.green;

  const proteinaObj = userData?.peso ? Math.round(userData.peso * 1.8) : 120;

  return (
    <Paper elevation={0} onClick={() => navigate("/energy")}
      sx={{ borderRadius: 4, overflow: "hidden", border: `1px solid ${C.border}`,
        boxShadow: "0 4px 20px rgba(11,94,85,0.08)", cursor: "pointer",
        transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 28px rgba(11,94,85,0.14)" } }}>

      {/* Header */}
      <Box sx={{ px: 3, py: 2, bgcolor: C.brandSurface, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18, color: C.brand }} />
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.brand }}>Balance energético</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" startIcon={<MicRoundedIcon sx={{ fontSize: 14 }} />}
            onClick={(e) => { e.stopPropagation(); navigate("/energy"); }}
            sx={{ textTransform: "none", fontSize: 11.5, fontWeight: 700, color: C.brand,
              bgcolor: C.surface, borderRadius: 999, px: 1.5, py: 0.4, border: `1px solid ${C.brandMuted}`,
              "&:hover": { bgcolor: C.brandMuted } }}>
            Registrar
          </Button>
          <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: C.textMuted }} />
        </Stack>
      </Box>

      <Box sx={{ px: 3, py: 2.5 }}>
        {!energyGoal ? (
          /* Sin objetivo configurado */
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Typography sx={{ fontSize: 13.5, color: C.text, fontWeight: 700, mb: 0.5 }}>
              Configurá tu objetivo calórico
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.textMuted }}>
              Tocá para elegir si querés bajar, mantener o subir de peso
            </Typography>
          </Box>
        ) : (
          <>
            {/* Objetivo y restantes */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
              <Box>
                <Typography sx={{ fontSize: 10.5, color: C.textMuted, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.3 }}>
                  Objetivo diario
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 900, color: C.brand, lineHeight: 1 }}>
                  {dailyGoal?.toLocaleString("es-AR") || "—"}
                  <Typography component="span" sx={{ fontSize: 11, color: C.textMuted }}> kcal</Typography>
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: 10.5, color: C.textMuted, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.3 }}>
                  Restantes
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 900, color: restColor, lineHeight: 1 }}>
                  {restantes !== null ? Math.abs(restantes).toLocaleString("es-AR") : "—"}
                  <Typography component="span" sx={{ fontSize: 11, color: C.textMuted }}> kcal</Typography>
                </Typography>
              </Box>
            </Stack>

            {/* Barra */}
            <LinearProgress variant="determinate" value={pct}
              sx={{ height: 6, borderRadius: 999, mb: 1.5,
                bgcolor: "rgba(0,0,0,0.06)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: consumed > (dailyGoal || 0) + burnedExtra ? C.danger : C.gold,
                  borderRadius: 999 } }} />

            {/* Fila de datos */}
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                🍽️ Consumidas: <strong>{consumed.toLocaleString("es-AR")}</strong> kcal
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                🔥 Extra: <strong>{burnedExtra.toLocaleString("es-AR")}</strong> kcal
              </Typography>
            </Stack>

            {/* Proteína */}
            <Stack direction="row" justifyContent="space-between" mt={0.5}>
              <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                💪 Proteína: <strong>{Math.round(log?.totalProteinas || 0)}g</strong> / {proteinaObj}g
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                💧 <strong>{((log?.totalAgua || 0) / 1000).toFixed(1)}L</strong>
              </Typography>
            </Stack>

            {/* Sin registros */}
            {!consumed && !burnedExtra && (
              <Box sx={{ mt: 1.5, px: 2, py: 1, borderRadius: 2, bgcolor: C.brandSurface,
                border: `1px dashed ${C.brandMuted}` }}>
                <Typography sx={{ fontSize: 12, color: C.brand, textAlign: "center" }}>
                  ¿Qué comiste hoy? Tocá <strong>Registrar</strong> 🎯
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default EnergyWidget;
