import { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import CloseRoundedIcon   from "@mui/icons-material/CloseRounded";
import GetAppRoundedIcon  from "@mui/icons-material/GetAppRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";

const DISMISSED_KEY = "nui-pwa-install-dismissed";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible,        setVisible]        = useState(false);
  const [isIOS,          setIsIOS]          = useState(false);

  useEffect(() => {
    // Ya instalada como PWA → no mostrar nada
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Ya descartada por el usuario
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // En iOS no hay beforeinstallprompt — mostrar guía manual
      const timer = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome / Edge — esperar el evento nativo
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(DISMISSED_KEY, "1");
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        position:  "fixed",
        bottom:    { xs: 16, sm: 24 },
        left:      "50%",
        transform: "translateX(-50%)",
        width:     { xs: "calc(100% - 32px)", sm: 420 },
        zIndex:    2000,
        borderRadius: 4,
        overflow:  "hidden",
        background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
        boxShadow: "0 12px 40px rgba(11,94,85,0.40), 0 4px 12px rgba(0,0,0,0.15)",
        // Animación de entrada
        animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        "@keyframes slideUp": {
          from: { opacity: 0, transform: "translateX(-50%) translateY(24px)" },
          to:   { opacity: 1, transform: "translateX(-50%) translateY(0)"    },
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 2 }}>

        {/* Ícono de la app */}
        <Box sx={{
          width: 52, height: 52, borderRadius: 2.5, overflow: "hidden",
          flexShrink: 0,
          border: "1.5px solid rgba(255,255,255,0.25)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
        }}>
          <img
            src="/img/pwa-192x192.png"
            alt="NUI App"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Box>

        {/* Texto */}
        <Box flex={1} minWidth={0}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.2px" }}>
            Instalá NUI App
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.70)", mt: 0.4, lineHeight: 1.45 }}>
            {isIOS
              ? <>Tocá <IosShareRoundedIcon sx={{ fontSize: 13, verticalAlign: "middle", mx: 0.2 }} /> y elegí "Agregar a inicio"</>
              : "Agregala a tu pantalla de inicio · sin tienda"
            }
          </Typography>
        </Box>

        {/* Botones */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          {!isIOS && (
            <Button
              onClick={handleInstall}
              size="small"
              startIcon={<GetAppRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                bgcolor: "#fff",
                color:   "#0B5E55",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 12.5,
                textTransform: "none",
                px: 2, py: 0.75,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.92)" },
              }}
            >
              Instalar
            </Button>
          )}
          <IconButton
            onClick={handleDismiss}
            size="small"
            sx={{ color: "rgba(255,255,255,0.55)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.10)" } }}
          >
            <CloseRoundedIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Barra inferior iOS — guía visual */}
      {isIOS && (
        <Box sx={{
          px: 2.5, pb: 2,
          display: "flex", alignItems: "center", gap: 1,
        }}>
          <Box sx={{
            flex: 1,
            bgcolor: "rgba(255,255,255,0.10)",
            borderRadius: 2,
            px: 2, py: 1,
            display: "flex", alignItems: "center", gap: 1,
          }}>
            <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.80)", lineHeight: 1.5 }}>
              1. Tocá <strong>Compartir</strong> en Safari{" "}
              <IosShareRoundedIcon sx={{ fontSize: 12, verticalAlign: "middle" }} />
              {"  "}2. Elegí <strong>"Agregar a pantalla de inicio"</strong>
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PWAInstallPrompt;
