import { useEffect, useState, useRef } from "react";
import { Box, Typography, Stack, Paper, LinearProgress, Button, Chip } from "@mui/material";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import ArrowForwardRoundedIcon        from "@mui/icons-material/ArrowForwardRounded";
import MicRoundedIcon                 from "@mui/icons-material/MicRounded";
import RestaurantRoundedIcon          from "@mui/icons-material/RestaurantRounded";
import FitnessCenterRoundedIcon       from "@mui/icons-material/FitnessCenterRounded";
import WaterDropRoundedIcon           from "@mui/icons-material/WaterDropRounded";
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

const WIDGET_IMG_KEY = "nui_energy_widget_img";

const EnergyWidget = () => {
  const { userData } = useNutrition();
  const navigate     = useNavigate();
  const token        = localStorage.getItem("nutrismartToken");

  const [log,        setLog]       = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [bgImage,    setBgImage]   = useState(() => localStorage.getItem(WIDGET_IMG_KEY) || null);
  const fetchedImg   = useRef(false);

  const bmr          = calcBMR(userData);
  const tdee         = bmr ? Math.round(bmr * (ACTIVITY_FACTOR[userData?.actividad] || 1.375)) : null;

  useEffect(() => {
    if (!token || !bmr) { setLoading(false); return; }
    fetch(`${API_URL}/api/energy/today`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setLog(d))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Cargar imagen de Unsplash una sola vez (cachear en localStorage)
    if (!fetchedImg.current && !bgImage && process.env.NODE_ENV !== "development") {
      fetchedImg.current = true;
      fetch(`${API_URL}/api/recipes/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "fitness nutrition balance gym weights healthy food",
          ingredients: [],
        }),
      })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (d?.imageUrl) {
            setBgImage(d.imageUrl);
            localStorage.setItem(WIDGET_IMG_KEY, d.imageUrl);
          }
        })
        .catch(() => {});
    }
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

      {/* Banner con imagen o gradiente */}
      <Box sx={{ position: "relative", height: { xs: 130, sm: 150 }, overflow: "hidden",
        bgcolor: "#0a2e2a" }}>
        {bgImage ? (
          <Box component="img" src={bgImage} alt="Balance energético"
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
              "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
              animation: "fadeIn 0.8s ease" }} />
        ) : (
          /* Gradiente fallback mientras carga o si no hay imagen */
          <Box sx={{ width: "100%", height: "100%",
            background: "linear-gradient(135deg, #071e1b 0%, #0B5E55 50%, #0d7a6e 100%)" }}>
            <LocalFireDepartmentRoundedIcon sx={{ position: "absolute", fontSize: 80, bottom: -8, right: 16, opacity: 0.18, color: "#fff" }} />
          </Box>
        )}

        {/* Overlay gradiente para legibilidad */}
        <Box sx={{ position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(7,30,27,0.75) 100%)" }} />

        {/* Contenido sobre la imagen */}
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, px: 3, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
            <Box>
              <Stack direction="row" spacing={0.8} alignItems="center" mb={0.3}>
                <LocalFireDepartmentRoundedIcon sx={{ fontSize: 15, color: "rgba(255,255,255,0.80)" }} />
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.75)",
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Balance energético
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1.1 }}>
                {dailyGoal ? `Objetivo: ${dailyGoal.toLocaleString("es-AR")} kcal` : "Configurá tu objetivo"}
              </Typography>
            </Box>
            <Button size="small" startIcon={<MicRoundedIcon sx={{ fontSize: 13 }} />}
              onClick={(e) => { e.stopPropagation(); navigate("/energy"); }}
              sx={{ textTransform: "none", fontSize: 11.5, fontWeight: 700,
                color: "#fff", bgcolor: "rgba(255,255,255,0.18)",
                borderRadius: 999, px: 1.5, py: 0.5,
                border: "1px solid rgba(255,255,255,0.30)",
                backdropFilter: "blur(4px)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
                flexShrink: 0 }}>
              Registrar
            </Button>
          </Stack>
        </Box>
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
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <RestaurantRoundedIcon sx={{ fontSize: 13, color: C.textSec }} />
                <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                  Consumidas: <strong>{consumed.toLocaleString("es-AR")}</strong> kcal
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13, color: C.textSec }} />
                <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                  Extra: <strong>{burnedExtra.toLocaleString("es-AR")}</strong> kcal
                </Typography>
              </Stack>
            </Stack>

            {/* Proteína */}
            <Stack direction="row" justifyContent="space-between" mt={0.5}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <FitnessCenterRoundedIcon sx={{ fontSize: 13, color: C.textSec }} />
                <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                  Proteína: <strong>{Math.round(log?.totalProteinas || 0)}g</strong> / {proteinaObj}g
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <WaterDropRoundedIcon sx={{ fontSize: 13, color: C.textSec }} />
                <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                  <strong>{((log?.totalAgua || 0) / 1000).toFixed(1)}L</strong>
                </Typography>
              </Stack>
            </Stack>

            {/* Sin registros */}
            {!consumed && !burnedExtra && (
              <Box sx={{ mt: 1.5, px: 2, py: 1, borderRadius: 2, bgcolor: C.brandSurface,
                border: `1px dashed ${C.brandMuted}` }}>
                <Typography sx={{ fontSize: 12, color: C.brand, textAlign: "center" }}>
                  ¿Qué comiste hoy? Tocá <strong>Registrar</strong>
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
