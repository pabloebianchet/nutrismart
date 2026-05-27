/**
 * TrialGate
 * ─────────────────────────────────────────────────────────────────────────────
 * Maneja dos escenarios de acceso bloqueado:
 *
 * 1. Trial gratuito vencido (free + expired)
 *    → Overlay de bloqueo total. El usuario debe elegir un plan.
 *
 * 2. Suscripción de pago vencida (silver/gold + expired/cancelled)
 *    → Overlay con opción "Ver mis datos (solo lectura)".
 *    → Modo lectura: banner sticky discreto en lugar del overlay.
 */

import { useState }    from "react";
import { Box, Typography, Button, Stack, IconButton } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import LockRoundedIcon           from "@mui/icons-material/LockRounded";
import DiamondOutlinedIcon        from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import CloseRoundedIcon           from "@mui/icons-material/CloseRounded";
import SaveAltRoundedIcon         from "@mui/icons-material/SaveAltRounded";

/* Rutas que nunca se bloquean */
const FREE_PATHS = [
  "/pricing", "/privacidad", "/terminos", "/legal",
  "/contact", "/forgot-password", "/reset-password",
];

const PLAN_LABEL = { silver: "Silver", gold: "Gold" };

/* ─── Overlay compartido ─────────────────────────────────────────────────── */
const Overlay = ({ children }) => (
  <Box
    sx={{
      position: "fixed", inset: 0, zIndex: 1800,
      display: "flex", alignItems: "center", justifyContent: "center", px: 2,
      backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      background: "rgba(10,40,35,0.72)",
    }}
  >
    <Box
      sx={{
        background: "#fff", borderRadius: 5,
        boxShadow: "0 32px 80px rgba(0,0,0,0.28)",
        p: { xs: 3.5, sm: 5 }, maxWidth: 480, width: "100%",
        textAlign: "center",
        animation: "fadeUp 0.35s ease both",
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {children}
    </Box>
  </Box>
);

/* ─── TRIAL EXPIRADO ─────────────────────────────────────────────────────── */
const TrialExpiredOverlay = () => {
  const navigate = useNavigate();
  return (
    <Overlay>
      <Box sx={{
        width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(11,94,85,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5,
      }}>
        <LockRoundedIcon sx={{ fontSize: 30, color: "#bae0dc" }} />
      </Box>

      <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.5px", mb: 1 }}>
        Tu prueba gratuita venció
      </Typography>
      <Typography sx={{ fontSize: 14.5, color: "#4A6B67", lineHeight: 1.7, mb: 3.5, maxWidth: 360, mx: "auto" }}>
        Elegí un plan para seguir disfrutando de los 3 módulos: análisis de alimentos, recetas y entrenamiento personalizado.
      </Typography>

      <Stack spacing={1.5} mb={3}>
        <Button fullWidth variant="contained"
          startIcon={<WorkspacePremiumOutlinedIcon />}
          onClick={() => navigate("/pricing")}
          sx={{ bgcolor: "#C9952A", borderRadius: 2.5, py: 1.4, textTransform: "none", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(201,149,42,0.35)", "&:hover": { bgcolor: "#b8841f" } }}
        >
          Ver Plan Gold — $5.990/mes
        </Button>
        <Button fullWidth variant="outlined"
          startIcon={<DiamondOutlinedIcon />}
          onClick={() => navigate("/pricing")}
          sx={{ borderColor: "#71879C", color: "#71879C", borderRadius: 2.5, py: 1.4, textTransform: "none", fontWeight: 700, fontSize: 15, "&:hover": { bgcolor: "rgba(113,135,156,0.06)" } }}
        >
          Ver Plan Silver — $2.990/mes
        </Button>
      </Stack>

      <Typography sx={{ fontSize: 12, color: "#8AADAA", lineHeight: 1.6 }}>
        Pago seguro a través de Mercado Pago · Cancelá cuando quieras
      </Typography>
    </Overlay>
  );
};

/* ─── SUSCRIPCIÓN PAGA VENCIDA — overlay inicial ────────────────────────── */
const SubscriptionExpiredOverlay = ({ subPlan, onReadOnly }) => {
  const navigate = useNavigate();
  const planLabel = PLAN_LABEL[subPlan] || "Premium";

  return (
    <Overlay>
      {/* Ícono */}
      <Box sx={{
        width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(180,83,9,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5,
      }}>
        <LockRoundedIcon sx={{ fontSize: 30, color: "#B45309" }} />
      </Box>

      {/* Título */}
      <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.5px", mb: 1 }}>
        Tu suscripción {planLabel} venció
      </Typography>

      {/* Data safety message */}
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: 1,
        bgcolor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
        borderRadius: 3, px: 2, py: 1, mb: 2,
      }}>
        <SaveAltRoundedIcon sx={{ fontSize: 16, color: "#059669" }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>
          Tus datos están guardados y seguros
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 14, color: "#4A6B67", lineHeight: 1.7, mb: 3.5, maxWidth: 360, mx: "auto" }}>
        Tu historial de análisis, plan de entrenamiento y puntos saludables están intactos. Renovar tu suscripción para seguir creando nuevos análisis.
      </Typography>

      <Stack spacing={1.5} mb={2}>
        <Button fullWidth variant="contained"
          onClick={() => navigate("/pricing")}
          sx={{
            bgcolor: "#bae0dc", borderRadius: 2.5, py: 1.4,
            textTransform: "none", fontWeight: 700, fontSize: 15,
            boxShadow: "0 4px 16px rgba(11,94,85,0.30)",
            "&:hover": { bgcolor: "#0f7a6e" },
          }}
        >
          Renovar ahora →
        </Button>

        <Button fullWidth
          onClick={onReadOnly}
          sx={{
            borderRadius: 2.5, py: 1.2, textTransform: "none", fontWeight: 600, fontSize: 14,
            color: "#4A6B67", border: "1px solid rgba(0,0,0,0.12)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          Ver mis datos (solo lectura)
        </Button>
      </Stack>

      <Typography sx={{ fontSize: 12, color: "#8AADAA", lineHeight: 1.6 }}>
        Pago seguro a través de Mercado Pago · Cancelá cuando quieras
      </Typography>
    </Overlay>
  );
};

/* ─── MODO LECTURA — banner sticky ──────────────────────────────────────── */
const ReadOnlyBanner = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <Box sx={{
      position: "fixed",
      top: { xs: 56, md: 64 }, // debajo del AppHeader
      left: 0, right: 0,
      zIndex: 1200,
      bgcolor: "#92400E",
      py: 0.7, px: 2,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5,
    }}>
      <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "#fff", fontWeight: 600, lineHeight: 1.4, textAlign: "center" }}>
        🔒 Modo lectura — tus datos están guardados —
        {" "}
        <Box component="span"
          onClick={() => navigate("/pricing")}
          sx={{ fontWeight: 800, cursor: "pointer", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Renovar ahora
        </Box>
      </Typography>
      <IconButton size="small" onClick={onClose}
        sx={{ color: "rgba(255,255,255,0.65)", "&:hover": { color: "#fff" }, flexShrink: 0 }}
      >
        <CloseRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
};

/* ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────── */
const TrialGate = () => {
  const { user, isTrialExpired, isSubscriptionExpired, subPlan } = useNutrition();
  const location = useLocation();

  const [readOnly, setReadOnly] = useState(
    () => sessionStorage.getItem("nui-readonly") === "1"
  );

  if (!user) return null;

  const isFreePath = FREE_PATHS.some((p) => location.pathname.startsWith(p));

  // ── 1. Trial gratuito vencido: bloqueo total ────────────────────────────
  if (isTrialExpired) {
    if (isFreePath) return null;
    return <TrialExpiredOverlay />;
  }

  // ── 2. Suscripción paga vencida: acceso read-only opcional ─────────────
  if (isSubscriptionExpired) {
    if (isFreePath) return null;

    if (readOnly) {
      return (
        <ReadOnlyBanner
          onClose={() => {
            sessionStorage.removeItem("nui-readonly");
            setReadOnly(false);
          }}
        />
      );
    }

    return (
      <SubscriptionExpiredOverlay
        subPlan={subPlan}
        onReadOnly={() => {
          sessionStorage.setItem("nui-readonly", "1");
          setReadOnly(true);
        }}
      />
    );
  }

  return null;
};

export default TrialGate;
