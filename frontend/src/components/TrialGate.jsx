/**
 * TrialGate
 * ─────────────────────────────────────────────────────────────────────────────
 * Cuando el período de prueba gratuito vence, cubre la pantalla con un overlay
 * que bloquea la interacción. Solo /pricing y las páginas legales permanecen
 * accesibles sin restricción.
 */

import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";

/* Rutas que NO se bloquean aunque el trial esté expirado */
const FREE_PATHS = ["/pricing", "/privacidad", "/terminos", "/legal", "/contact", "/forgot-password", "/reset-password"];

const TrialGate = () => {
  const { user, isTrialExpired } = useNutrition();
  const location = useLocation();
  const navigate  = useNavigate();

  // No mostrar si no hay usuario logueado
  if (!user) return null;
  // No mostrar si el trial no expiró
  if (!isTrialExpired) return null;
  // No mostrar en rutas permitidas
  if (FREE_PATHS.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        // Fondo: difumina el contenido de atrás
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        background: "rgba(10,40,35,0.72)",
      }}
    >
      <Box
        sx={{
          background: "#fff",
          borderRadius: 5,
          boxShadow: "0 32px 80px rgba(0,0,0,0.28)",
          p: { xs: 3.5, sm: 5 },
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          animation: "fadeUp 0.35s ease both",
          "@keyframes fadeUp": {
            from: { opacity: 0, transform: "translateY(24px)" },
            to:   { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Ícono */}
        <Box
          sx={{
            width: 64, height: 64, borderRadius: "50%",
            bgcolor: "rgba(11,94,85,0.10)",
            display: "flex", alignItems: "center", justifyContent: "center",
            mx: "auto", mb: 2.5,
          }}
        >
          <LockRoundedIcon sx={{ fontSize: 30, color: "#0B5E55" }} />
        </Box>

        {/* Título */}
        <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.5px", mb: 1 }}>
          Tu prueba gratuita venció
        </Typography>
        <Typography sx={{ fontSize: 14.5, color: "#4A6B67", lineHeight: 1.7, mb: 3.5, maxWidth: 360, mx: "auto" }}>
          Elegí un plan para seguir disfrutando de los 3 módulos: análisis de alimentos, recetas y entrenamiento personalizado.
        </Typography>

        {/* Botones de planes */}
        <Stack spacing={1.5} mb={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<WorkspacePremiumOutlinedIcon />}
            onClick={() => navigate("/pricing")}
            sx={{
              bgcolor: "#C9952A",
              borderRadius: 2.5,
              py: 1.4,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "0 4px 16px rgba(201,149,42,0.35)",
              "&:hover": { bgcolor: "#b8841f" },
            }}
          >
            Ver Plan Gold — $5.990/mes
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<DiamondOutlinedIcon />}
            onClick={() => navigate("/pricing")}
            sx={{
              borderColor: "#71879C",
              color: "#71879C",
              borderRadius: 2.5,
              py: 1.4,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              "&:hover": { bgcolor: "rgba(113,135,156,0.06)", borderColor: "#71879C" },
            }}
          >
            Ver Plan Silver — $2.990/mes
          </Button>
        </Stack>

        <Typography sx={{ fontSize: 12, color: "#8AADAA", lineHeight: 1.6 }}>
          Pago seguro a través de Mercado Pago · Cancelá cuando quieras
        </Typography>
      </Box>
    </Box>
  );
};

export default TrialGate;
