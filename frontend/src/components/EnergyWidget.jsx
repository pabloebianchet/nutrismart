import { useEffect, useState } from "react";
import { Box, Typography, Stack, Paper, LinearProgress, Button } from "@mui/material";
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
  gold: "#C9952A", green: "#2E7D32", danger: "#E24B4A",
};

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

  const bmr = calcBMR(userData);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_URL}/api/energy/today`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setLog(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading || !bmr) return null;

  const quemadas  = Math.round((bmr || 0) + (log?.trainingKcal || 0) + (log?.totalNEAT || 0));
  const consumidas = log?.totalConsumido || 0;
  const balance   = quemadas - consumidas;
  const esDeficit  = balance > 0;
  const pct        = Math.min(100, Math.round((consumidas / quemadas) * 100));

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

      {/* Balance */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted,
              textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.3 }}>
              Balance de hoy
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 900, color: esDeficit ? C.green : C.gold, lineHeight: 1 }}>
              {esDeficit ? "-" : "+"}{Math.abs(balance).toLocaleString("es-AR")}
              <Typography component="span" sx={{ fontSize: 13, color: C.textMuted, fontWeight: 400 }}> kcal</Typography>
            </Typography>
          </Box>
          <Stack direction="row" spacing={3}>
            {[
              { label: "Consumidas", val: consumidas, color: C.gold },
              { label: "Quemadas",   val: quemadas,   color: C.brand },
            ].map(({ label, val, color }) => (
              <Box key={label} sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 16, fontWeight: 900, color }}>{val.toLocaleString("es-AR")}</Typography>
                <Typography sx={{ fontSize: 10, color: C.textMuted }}>{label}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* Barra de progreso consumidas/quemadas */}
        <LinearProgress variant="determinate" value={pct}
          sx={{ height: 7, borderRadius: 999, mb: 1.5,
            bgcolor: "rgba(201,149,42,0.12)",
            "& .MuiLinearProgress-bar": { bgcolor: pct > 100 ? C.danger : C.gold, borderRadius: 999 } }} />

        {/* Proteína */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: 12, color: C.textSec }}>
            💪 Proteína: <strong>{Math.round(log?.totalProteinas || 0)}g</strong> / {proteinaObj}g
          </Typography>
          <Typography sx={{ fontSize: 12, color: C.textSec }}>
            💧 Agua: <strong>{((log?.totalAgua || 0) / 1000).toFixed(1)}L</strong>
          </Typography>
        </Stack>

        {/* Mensaje si no registró nada */}
        {!consumidas && !log?.totalNEAT && (
          <Box sx={{ mt: 1.5, px: 2, py: 1, borderRadius: 2, bgcolor: C.brandSurface,
            border: `1px dashed ${C.brandMuted}` }}>
            <Typography sx={{ fontSize: 12, color: C.brand, textAlign: "center" }}>
              ¿Qué comiste hoy? Tocá <strong>Registrar</strong> para empezar 🎯
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default EnergyWidget;
