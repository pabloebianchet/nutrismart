import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";

const HIDDEN_PATHS = ["/capture", "/result", "/admin", "/recipes", "/training"];

const FloatingAnalyzeButton = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useNutrition();
  const [hovered, setHovered] = useState(false);

  if (!user?._id && !user?.googleId) return null;
  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 24, sm: 32 },
        right:  { xs: 20, sm: 28 },
        zIndex: 1300,

        // Pulse ring
        "@keyframes pulse": {
          "0%":   { transform: "scale(1)",   opacity: 0.55 },
          "70%":  { transform: "scale(1.55)", opacity: 0    },
          "100%": { transform: "scale(1.55)", opacity: 0    },
        },
        "@keyframes floatUp": {
          "0%,100%": { transform: "translateY(0)"   },
          "50%":     { transform: "translateY(-4px)" },
        },
      }}
    >
      {/* Pulse ring detrás */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          bgcolor: "rgba(11,94,85,0.22)",
          animation: "pulse 2.4s ease-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Botón principal */}
      <Box
        onClick={() => navigate("/capture")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          borderRadius: 999,
          height: 54,
          pl: 1.8,
          pr: { xs: 2.2, sm: hovered ? 2.8 : 2.2 },
          gap: 1.2,
          background: hovered
            ? "rgba(11,94,85,0.82)"
            : "rgba(11,94,85,0.68)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: hovered
            ? "0 12px 40px rgba(11,94,85,0.45), 0 4px 12px rgba(0,0,0,0.12)"
            : "0 6px 24px rgba(11,94,85,0.30), 0 2px 8px rgba(0,0,0,0.08)",
          animation: "floatUp 3.5s ease-in-out infinite",
          transition: "box-shadow 0.25s ease, padding-right 0.3s ease",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          "&:active": { transform: "scale(0.96)" },
        }}
      >
        {/* Ícono emoji */}
        <Box
          sx={{
            fontSize: { xs: 24, sm: 26 },
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            transition: "transform 0.25s ease",
            transform: hovered ? "rotate(-8deg) scale(1.15)" : "none",
          }}
        >
          🥜
        </Box>

        {/* Lupa */}
        <Box
          sx={{
            fontSize: { xs: 17, sm: 18 },
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            opacity: 0.9,
          }}
        >
          🔍
        </Box>

        {/* Label — siempre visible */}
        <Typography
          sx={{
            fontSize: { xs: 13.5, sm: 14.5 },
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.2px",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          Analizar producto
        </Typography>
      </Box>
    </Box>
  );
};

export default FloatingAnalyzeButton;
