import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useNutrition } from "../context/NutritionContext";
import { isInAppBrowser, openInSystemBrowser } from "../utils/inAppBrowser.js";
import { trackInAppBrowserDetected, trackInAppBrowserExitClick } from "../utils/analytics.js";

/**
 * Bloquea toda la app (no solo /login) apenas detecta el navegador embebido
 * de Instagram/Facebook — la mayoría del tráfico pago abandona antes de
 * llegar al login, así que el aviso tiene que aparecer en la entrada misma
 * (home), no al final del funnel.
 */
const InAppBrowserGate = ({ children }) => {
  const { isUS } = useNutrition();
  const [active] = useState(isInAppBrowser);

  useEffect(() => {
    if (active) trackInAppBrowserDetected();
  }, [active]);

  if (!active) return children;

  const handleExitClick = () => {
    trackInAppBrowserExitClick();
    openInSystemBrowser();
  };

  return (
    <Box sx={{
      position: "fixed", inset: 0, zIndex: 9999,
      bgcolor: "#0B5E55",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      px: 4, textAlign: "center",
    }}>
      <Box component="img" src="/img/logo.png" alt="NUI App"
        sx={{ height: 40, mb: 4, filter: "brightness(0) invert(1)" }} />

      <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#fff", mb: 4, maxWidth: 320, lineHeight: 1.5 }}>
        {isUS
          ? "To sign up, open this in your browser."
          : "Para registrarte necesitás abrir esto en tu navegador."}
      </Typography>

      <Button
        onClick={handleExitClick}
        startIcon={<OpenInNewRoundedIcon />}
        sx={{
          borderRadius: 3, py: 1.8, px: 4, fontWeight: 800, fontSize: 16, textTransform: "none",
          color: "#0B5E55", bgcolor: "#fff", "&:hover": { bgcolor: "#eafaf7" },
          boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
        }}
      >
        {isUS ? "Tap here →" : "Tocá aquí →"}
      </Button>
    </Box>
  );
};

export default InAppBrowserGate;
