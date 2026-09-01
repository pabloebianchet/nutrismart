import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";

const STORAGE_KEY = "nuiCookieConsent";

const COPY = {
  es: {
    text: "Usamos cookies esenciales para que la app funcione, y cookies de analítica (Google Analytics) solo si las aceptás.",
    link: "Política de cookies",
    linkHref: "/legal",
    accept: "Aceptar",
    reject: "Rechazar",
  },
  en: {
    text: "We use essential cookies to make the app work, and analytics cookies (Google Analytics) only if you accept them.",
    link: "Cookie policy",
    linkHref: "/en/legal",
    accept: "Accept",
    reject: "Reject",
  },
};

const CookieConsentBanner = () => {
  const { isUS } = useNutrition();
  const t = isUS ? COPY.en : COPY.es;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {}
    if (choice === "accepted" && typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Box
      role="dialog"
      aria-label="Cookie consent"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        bgcolor: "#0F2420",
        px: { xs: 2, sm: 3 },
        py: 2,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="center"
        sx={{ maxWidth: 900, mx: "auto" }}
      >
        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, flex: 1 }}>
          {t.text}{" "}
          <Typography
            component={Link}
            to={t.linkHref}
            sx={{ fontSize: 13, color: "#7FD9C7", textDecoration: "underline", "&:hover": { color: "#fff" } }}
          >
            {t.link}
          </Typography>
        </Typography>
        <Stack direction="row" spacing={1.2} flexShrink={0}>
          <Button
            onClick={() => decide("rejected")}
            sx={{
              fontSize: 13, fontWeight: 700, textTransform: "none",
              color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 999, px: 2.5,
              "&:hover": { borderColor: "rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            {t.reject}
          </Button>
          <Button
            onClick={() => decide("accepted")}
            sx={{
              fontSize: 13, fontWeight: 700, textTransform: "none",
              color: "#0F2420", bgcolor: "#7FD9C7", borderRadius: 999, px: 2.5,
              "&:hover": { bgcolor: "#9BE6D6" },
            }}
          >
            {t.accept}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CookieConsentBanner;
