import { useEffect, useState } from "react";
import { Box, Typography, Button, Paper, Stack, Chip, LinearProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DiamondOutlinedIcon              from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon     from "@mui/icons-material/WorkspacePremiumOutlined";
import RocketLaunchOutlinedIcon         from "@mui/icons-material/RocketLaunchOutlined";
import ChevronRightRoundedIcon          from "@mui/icons-material/ChevronRightRounded";
import PauseCircleOutlineRoundedIcon    from "@mui/icons-material/PauseCircleOutlineRounded";
import AccessTimeRoundedIcon            from "@mui/icons-material/AccessTimeRounded";
import { API_URL } from "../config/api";

const C = {
  brand:        "#0B5E55",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F7F9F8",
  border:       "rgba(11,94,85,0.10)",
  textPrimary:  "#0F2420",
  textSecondary:"#4A6B67",
  textMuted:    "#8AADAA",
  danger:       "#E24B4A",
};

const PLAN_META = {
  free:   { name: "Prueba gratuita", Icon: RocketLaunchOutlinedIcon,    color: "#0B5E55", bg: "#E6F5F3", totalDays: 7  },
  silver: { name: "Silver",          Icon: DiamondOutlinedIcon,          color: "#71879C", bg: "#EEF2F5", totalDays: 30 },
  gold:   { name: "Gold",            Icon: WorkspacePremiumOutlinedIcon, color: "#C9952A", bg: "#FDF6E3", totalDays: 30 },
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "long" }) : "—";

const daysLeft = (endDate) => {
  if (!endDate) return 0;
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const SubscriptionWidget = () => {
  const navigate = useNavigate();
  const [sub, setSub] = useState(undefined);
  const token = localStorage.getItem("nutrismartToken");

  useEffect(() => {
    fetch(`${API_URL}/api/payments/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setSub(d.subscription || null))
      .catch(() => setSub(null));
  }, []); // eslint-disable-line

  if (sub === undefined) return null;

  const isActive    = sub?.status === "active";
  const isCancelled = sub?.status === "cancelled";
  const isExpired   = sub?.status === "expired";
  const remaining   = (isActive || isCancelled) ? daysLeft(sub.endDate) : null;
  const meta        = PLAN_META[sub?.plan] || PLAN_META.silver;
  const totalDays   = meta.totalDays;
  const pct         = remaining !== null ? Math.min(100, (remaining / totalDays) * 100) : 0;
  const isFree      = sub?.plan === "free";

  /* ── Trial expirado ── */
  if (isFree && isExpired) {
    return (
      <Paper elevation={0} sx={{
        p: 3, borderRadius: 4,
        background: `linear-gradient(135deg, ${C.brand} 0%, ${C.brandLight} 100%)`,
        boxShadow: "0 8px 32px rgba(11,94,85,0.22)",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RocketLaunchOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.3px" }}>
                Prueba gratuita vencida
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>
                Elegí un plan para seguir usando Nui
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            onClick={() => navigate("/pricing")}
            endIcon={<ChevronRightRoundedIcon />}
            sx={{ bgcolor: "#fff", color: C.brand, fontWeight: 700, fontSize: 13, borderRadius: 2.5, textTransform: "none", px: 2.5, py: 1.1, whiteSpace: "nowrap", "&:hover": { bgcolor: C.brandSurface } }}
          >
            Ver planes
          </Button>
        </Stack>
      </Paper>
    );
  }

  /* ── Sin suscripción ── */
  if (!sub || (!isActive && !isCancelled)) {
    return (
      <Paper elevation={0} sx={{
        p: 3, borderRadius: 4,
        background: `linear-gradient(135deg, ${C.brand} 0%, ${C.brandLight} 100%)`,
        boxShadow: "0 8px 32px rgba(11,94,85,0.22)",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RocketLaunchOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.3px" }}>
                Sin membresía activa
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>
                Elegí un plan para análisis ilimitados
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            onClick={() => navigate("/pricing")}
            endIcon={<ChevronRightRoundedIcon />}
            sx={{ bgcolor: "#fff", color: C.brand, fontWeight: 700, fontSize: 13, borderRadius: 2.5, textTransform: "none", px: 2.5, py: 1.1, whiteSpace: "nowrap", "&:hover": { bgcolor: C.brandSurface } }}
          >
            Ver planes
          </Button>
        </Stack>
      </Paper>
    );
  }

  /* ── Plan cancelado ── */
  if (isCancelled) {
    return (
      <Paper elevation={0} sx={{
        borderRadius: 4,
        border: `1.5px solid rgba(226,75,74,0.20)`,
        boxShadow: "0 4px 20px rgba(11,94,85,0.08)",
        overflow: "hidden",
      }}>
        <Box sx={{ bgcolor: "#FFF5F5", px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(226,75,74,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PauseCircleOutlineRoundedIcon sx={{ fontSize: 20, color: C.danger }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Membresía</Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.3px" }}>
                Plan {meta.name} · cancelado
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Cancelada" size="small" sx={{ bgcolor: "rgba(226,75,74,0.10)", color: C.danger, fontWeight: 700, fontSize: 11, border: "1px solid rgba(226,75,74,0.25)" }} />
            <Button
              onClick={() => navigate("/subscription")}
              endIcon={<ChevronRightRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: "none", color: C.textSecondary, fontWeight: 600, fontSize: 12.5, borderRadius: 2, px: 1.5, border: `1px solid ${C.border}`, bgcolor: C.surface, "&:hover": { bgcolor: C.brandSurface, color: C.brand } }}
            >
              Ver historial
            </Button>
          </Stack>
        </Box>
        <Box sx={{ px: 3, py: 2.5, bgcolor: C.surface }}>
          {remaining > 0 ? (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography sx={{ fontSize: 12.5, color: C.textSecondary, fontWeight: 600 }}>Acceso activo hasta el vencimiento</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: remaining <= 5 ? C.danger : C.textPrimary }}>
                  {remaining} día{remaining !== 1 ? "s" : ""} · {formatDate(sub.endDate)}
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(226,75,74,0.12)", "& .MuiLinearProgress-bar": { bgcolor: remaining <= 5 ? C.danger : "#F39C12", borderRadius: 3 } }} />
            </>
          ) : (
            <Typography sx={{ fontSize: 13, color: C.textSecondary }}>Tu período venció. Elegí un plan para seguir usando la app.</Typography>
          )}
          <Button onClick={() => navigate("/pricing")} variant="contained" fullWidth sx={{ mt: 2, bgcolor: C.brand, borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13.5, py: 1.1, "&:hover": { bgcolor: C.brandLight } }}>
            Ver planes y renovar
          </Button>
        </Box>
      </Paper>
    );
  }

  /* ── Plan activo (free o pago) ── */
  const urgente = isFree && remaining !== null && remaining <= 2;

  return (
    <Paper elevation={0} sx={{
      borderRadius: 4,
      border: `1.5px solid ${urgente ? "rgba(226,75,74,0.30)" : meta.color + "33"}`,
      boxShadow: "0 4px 20px rgba(11,94,85,0.08)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <Box sx={{ bgcolor: urgente ? "#FFF5F5" : meta.bg, px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: urgente ? "rgba(226,75,74,0.10)" : `${meta.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isFree
              ? <AccessTimeRoundedIcon sx={{ fontSize: 20, color: urgente ? C.danger : meta.color }} />
              : <meta.Icon sx={{ fontSize: 20, color: meta.color }} />
            }
          </Box>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {isFree ? "Período de prueba" : "Membresía"}
            </Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: urgente ? C.danger : C.textPrimary, letterSpacing: "-0.3px" }}>
              {isFree ? (urgente ? "⏰ Vence pronto" : "🎉 Prueba activa") : `Plan ${meta.name}`}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={urgente ? "Vence pronto" : "Activa"}
            size="small"
            sx={{
              bgcolor: urgente ? "rgba(226,75,74,0.10)" : "rgba(46,204,113,0.12)",
              color:   urgente ? C.danger : "#2ECC71",
              fontWeight: 700, fontSize: 11,
              border: `1px solid ${urgente ? "rgba(226,75,74,0.25)" : "rgba(46,204,113,0.25)"}`,
            }}
          />
          {!isFree && (
            <Button
              onClick={() => navigate("/subscription")}
              endIcon={<ChevronRightRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: "none", color: C.textSecondary, fontWeight: 600, fontSize: 12.5, borderRadius: 2, px: 1.5, border: `1px solid ${C.border}`, bgcolor: C.surface, "&:hover": { bgcolor: C.brandSurface, color: C.brand } }}
            >
              Gestionar
            </Button>
          )}
        </Stack>
      </Box>

      {/* Barra de progreso */}
      <Box sx={{ px: 3, py: 2.5, bgcolor: C.surface }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography sx={{ fontSize: 12.5, color: C.textSecondary, fontWeight: 600 }}>
            {isFree ? "Días de prueba restantes" : "Días restantes del período"}
          </Typography>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: (remaining !== null && remaining <= 5) ? C.danger : C.textPrimary }}>
            {remaining !== null ? `${remaining} día${remaining !== 1 ? "s" : ""} · vence ${formatDate(sub.endDate)}` : "—"}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 6, borderRadius: 3,
            bgcolor: urgente ? "rgba(226,75,74,0.12)" : `${meta.color}18`,
            "& .MuiLinearProgress-bar": { bgcolor: urgente ? C.danger : meta.color, borderRadius: 3 },
          }}
        />
        <Typography sx={{ fontSize: 11.5, color: C.textMuted, mt: 1 }}>
          {isFree
            ? "Al vencer tu prueba, elegí el plan que mejor te quede."
            : (sub.autoRenew ? `Renovación automática el ${formatDate(sub.endDate)}` : "Sin renovación automática")}
        </Typography>

        {isFree && (
          <Button
            onClick={() => navigate("/pricing")}
            variant="outlined"
            sx={{ mt: 2, borderColor: C.brand, color: C.brand, borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13, py: 1, px: 3, "&:hover": { bgcolor: C.brandSurface } }}
          >
            Ver planes →
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default SubscriptionWidget;
