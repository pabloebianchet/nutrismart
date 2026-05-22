import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { useNutrition } from "../context/NutritionContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ScoreDonut from "./ScoreDonut";
import PointsCelebration from "./PointsCelebration";
import AnalyzingLoader from "./AnalyzingLoader";

import { API_URL } from "../config/api";

const ResultScreen = () => {
  const { user, userData, ocrText, clearOcrText, updateUserData } = useNutrition();

  const [analysis, setAnalysis] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState(null);
  const [limitError, setLimitError] = useState(null);
  const hasFetched = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if ((!user?._id && !user?.googleId) || !ocrText || !userData) return;
    // Evita doble ejecución en React StrictMode (desarrollo)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            googleId: user.googleId,
            userData,
            productText: ocrText,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === "trial_limit_reached" || data.error === "daily_limit_reached") {
            setLimitError({ type: data.error, message: data.message });
          } else if (response.status === 429) {
            setLimitError({
              type: "rate_limit",
              message: "Demasiadas solicitudes en poco tiempo. Esperá un momento e intentá de nuevo.",
            });
          } else {
            setAnalysis("No se pudo generar el análisis. Intentá nuevamente.");
            setScore(0);
          }
          return;
        }

        const finalScore = typeof data.score === "number" ? data.score : 0;
        setAnalysis(data.analysis);
        setScore(finalScore);

        if (data.pointsEarned > 0 && data.totalPoints != null) {
          setCelebration({ points: data.pointsEarned, totalPoints: data.totalPoints });
          updateUserData({ healthyPoints: data.totalPoints });
        }
      } catch (err) {
        console.error("Error al obtener análisis:", err);
        setAnalysis("No se pudo generar el análisis. Intentá nuevamente.");
        setScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [user, ocrText, userData]);

  const scoreColor =
    score >= 90
      ? "#2e7d32"
      : score >= 75
      ? "#43a047"
      : score >= 60
      ? "#f9a825"
      : score >= 45
      ? "#fb8c00"
      : "#e53935";

  const handleNewAnalysis = () => {
    clearOcrText();
    navigate("/capture");
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
      }}>
        <AnalyzingLoader />
      </Box>
    );
  }

  if (limitError) {
    const meta = {
      trial_limit_reached: { emoji: "🥜", title: "Límite de prueba alcanzado",  cta: "Ver planes",   ctaPath: "/pricing"      },
      daily_limit_reached: { emoji: "⏳", title: "Límite diario alcanzado",      cta: "Ver mi plan",  ctaPath: "/subscription" },
      rate_limit:          { emoji: "🚦", title: "Demasiadas solicitudes",       cta: "Volver",       ctaPath: "/"             },
    };
    const m = meta[limitError.type] || meta.rate_limit;
    return (
      <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)" }}>
        <Paper elevation={0} sx={{ maxWidth: 420, width: "100%", borderRadius: 5, border: "1px solid rgba(11,94,85,0.12)", boxShadow: "0 20px 60px rgba(11,94,85,0.10)", overflow: "hidden", textAlign: "center" }}>
          <Box sx={{ bgcolor: "#0B5E55", px: 4, pt: 4, pb: 3 }}>
            <Typography sx={{ fontSize: 48, mb: 1 }}>{m.emoji}</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{m.title}</Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            <Typography sx={{ fontSize: 14.5, color: "#4A6B67", lineHeight: 1.7, mb: 3 }}>
              {limitError.message}
            </Typography>
            <Button variant="contained" fullWidth onClick={() => navigate(m.ctaPath)}
              sx={{ bgcolor: "#0B5E55", borderRadius: 2.5, py: 1.4, textTransform: "none", fontWeight: 700, fontSize: 14.5, mb: 1.5, "&:hover": { bgcolor: "#0f7a6e" } }}>
              {m.cta}
            </Button>
            <Button fullWidth onClick={() => navigate("/")}
              sx={{ borderRadius: 2.5, py: 1.2, textTransform: "none", fontWeight: 600, fontSize: 13.5, color: "#4A6B67" }}>
              Volver al inicio
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      {celebration && (
        <PointsCelebration
          points={celebration.points}
          totalPoints={celebration.totalPoints}
          onDone={() => setCelebration(null)}
        />
      )}
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 4 },
        boxSizing: "border-box",
      }}
    >
      <Paper
        sx={{
          maxWidth: 860,
          width: "100%",
          bgcolor: "#fff",
          borderRadius: 6,
          p: { xs: 3, md: 4 },
          boxShadow: "0 20px 50px rgba(15, 59, 47, 0.18)",
          my: "auto",
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <InsightsRoundedIcon color="success" />
              <Typography variant="h4" fontWeight={800}>
                Resultado del análisis
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" mt={1}>
              Diagnóstico nutrimental claro y accionable.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleNewAnalysis}
            startIcon={<RefreshRoundedIcon />}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              borderColor: "#1b5e4b",
              color: "#1b5e4b",
            }}
          >
            Nuevo análisis
          </Button>
        </Stack>

        {/* Content */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} mt={4}>
          {/* Score */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 4,
              borderColor: "rgba(27, 94, 75, 0.2)",
              bgcolor: "#f7fcfa",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Puntaje global
            </Typography>

            <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
              {score !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <ScoreDonut score={score} />
                </motion.div>
              )}
            </Box>

            <Chip
              label={`Nivel ${score >= 75 ? "saludable" : "mejorable"}`}
              sx={{
                bgcolor: `${scoreColor}22`,
                color: scoreColor,
                fontWeight: 600,
              }}
            />
          </Paper>

          {/* Analysis */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1.4,
              p: 3,
              borderRadius: 4,
              borderColor: "rgba(27, 94, 75, 0.2)",
              bgcolor: "#ffffff",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Evaluación del producto
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <motion.div
              key={analysis}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  maxWidth: 520,
                }}
              >
                {analysis}
              </Typography>
            </motion.div>
          </Paper>
        </Stack>
      </Paper>
    </Box>
    </>
  );
};

export default ResultScreen;
