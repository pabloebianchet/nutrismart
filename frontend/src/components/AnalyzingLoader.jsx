import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const MESSAGES = [
  "Escaneando los ingredientes...",
  "Evaluando valores nutricionales...",
  "Consultando guías europeas de salud...",
  "Midiendo el nivel de procesamiento...",
  "Calculando tu puntaje personalizado...",
  "Preparando el análisis...",
];

const AnalyzingLoader = ({ message }) => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) return;
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((p) => (p + 1) % MESSAGES.length);
        setVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(cycle);
  }, [message]);

  const text = message || MESSAGES[idx];

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        px: 3,
        /* ── Keyframes ── */
        "@keyframes peanutBreath": {
          "0%,100%": { transform: "scale(1) rotate(-4deg)" },
          "50%":     { transform: "scale(1.07) rotate(3deg)" },
        },
        "@keyframes magnifyOrbit": {
          "0%":   { transform: "translate(32px, -38px) rotate(15deg) scale(1)"   },
          "20%":  { transform: "translate(52px,  10px) rotate(-8deg) scale(1.05)" },
          "45%":  { transform: "translate(28px,  44px) rotate(12deg) scale(1)"   },
          "70%":  { transform: "translate(-8px,  20px) rotate(-15deg) scale(1.05)"},
          "100%": { transform: "translate(32px, -38px) rotate(15deg) scale(1)"   },
        },
        "@keyframes scanLine": {
          "0%,100%": { scaleX: 0, opacity: 0 },
          "20%,80%": { scaleX: 1, opacity: 0.6 },
          "50%":     { scaleX: 1, opacity: 1 },
        },
        "@keyframes dotBounce": {
          "0%,100%": { transform: "translateY(0)",    opacity: 0.35 },
          "50%":     { transform: "translateY(-10px)", opacity: 1   },
        },
        "@keyframes ringPulse": {
          "0%,100%": { transform: "scale(1)",    opacity: 0.15 },
          "50%":     { transform: "scale(1.18)", opacity: 0    },
        },
      }}
    >
      {/* Ring de fondo */}
      <Box sx={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Anillo pulsante */}
        {[1, 1.6, 2.1].map((scale, i) => (
          <Box key={i} sx={{
            position: "absolute",
            width: 110, height: 110,
            borderRadius: "50%",
            border: "2px solid rgba(11,94,85,0.18)",
            animation: `ringPulse ${1.6 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
          }} />
        ))}

        {/* Maní */}
        <Box sx={{
          fontSize: 90,
          lineHeight: 1,
          animation: "peanutBreath 2.4s ease-in-out infinite",
          filter: "drop-shadow(0 10px 22px rgba(11,94,85,0.28))",
          userSelect: "none",
          zIndex: 1,
        }}>
          🥜
        </Box>

        {/* Lupa orbitando */}
        <Box sx={{
          position: "absolute",
          fontSize: 46,
          lineHeight: 1,
          animation: "magnifyOrbit 3.2s cubic-bezier(0.45,0.05,0.55,0.95) infinite",
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.22))",
          zIndex: 2,
          userSelect: "none",
        }}>
          🔍
        </Box>
      </Box>

      {/* Texto con fade */}
      <Box sx={{ textAlign: "center", minHeight: 64 }}>
        <Typography sx={{
          fontSize: { xs: 17, sm: 19 },
          fontWeight: 800,
          color: "#0B5E55",
          letterSpacing: "-0.4px",
          mb: 0.5,
          transition: "opacity 0.35s ease, transform 0.35s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
        }}>
          {text}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#8AADAA", fontWeight: 500 }}>
          Esto puede tardar unos segundos
        </Typography>
      </Box>

      {/* Puntos */}
      <Box sx={{ display: "flex", gap: 1.2 }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{
            width: 9, height: 9,
            borderRadius: "50%",
            bgcolor: "#0B5E55",
            animation: "dotBounce 1.1s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }} />
        ))}
      </Box>
    </Box>
  );
};

export default AnalyzingLoader;
