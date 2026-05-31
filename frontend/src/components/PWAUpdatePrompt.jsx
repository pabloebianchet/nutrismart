import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import SystemUpdateAltRoundedIcon from "@mui/icons-material/SystemUpdateAltRounded";

const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "2.1.3";

/**
 * Banner que aparece en la parte superior cuando hay una nueva versión
 * disponible de la app (nuevo service worker esperando activación).
 * El usuario puede actualizar con un tap — no se fuerza el reload.
 */
const PWAUpdatePrompt = () => {
  const {
    needRefresh:      [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (!r) return;
      // Verificar actualizaciones al volver al frente (pageshow, focus, visibilitychange)
      // y también cada 5 minutos — para que el SW viejo se actualice lo antes posible
      const checkUpdate = () => r.update().catch(() => {});
      setInterval(checkUpdate, 5 * 60 * 1000); // cada 5 min

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkUpdate();
      });
      window.addEventListener("pageshow", (e) => {
        if (e.persisted) checkUpdate(); // volvió del bfcache (iOS)
      });
      window.addEventListener("focus", checkUpdate, { once: false });
    },
  });

  // Exportar versión al window para debug
  useEffect(() => { window.__NUI_VERSION__ = APP_VERSION; }, []);

  if (!needRefresh) return null;

  return (
    <Box sx={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
      px: { xs: 2, sm: 3 }, py: 1.5,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 2, boxShadow: "0 4px 20px rgba(11,94,85,0.35)",
    }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <SystemUpdateAltRoundedIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.90)", flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            Nueva versión disponible — v{APP_VERSION}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.70)" }}>
            Actualizá para ver las últimas mejoras
          </Typography>
        </Box>
      </Stack>

      <Button
        onClick={() => updateServiceWorker(true)}
        variant="contained"
        size="small"
        sx={{
          bgcolor: "#fff", color: "#0B5E55", fontWeight: 800, fontSize: 13,
          borderRadius: 999, px: 2.5, py: 0.8, flexShrink: 0, whiteSpace: "nowrap",
          "&:hover": { bgcolor: "rgba(255,255,255,0.90)" },
          boxShadow: "none",
        }}
      >
        Actualizar
      </Button>
    </Box>
  );
};

export default PWAUpdatePrompt;
