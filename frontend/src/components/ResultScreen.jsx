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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ScoreDonut from "./ScoreDonut";

import { API_URL } from "../config/api";
import { useTranslation } from "react-i18next";

const ResultScreen = () => {
  const { user, userData, ocrText, clearOcrText } = useNutrition();

  const [analysis, setAnalysis] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // 🔒 Guardia absoluta: no ejecutar sin usuario ni datos
    if (!user?.googleId || !ocrText || !userData) {
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: user.googleId,
            userData,
            productText: ocrText,
          }),
        });

        if (!response.ok) {
          throw new Error("Error en análisis");
        }

        const data = await response.json();

        setAnalysis(data.analysis);
        setScore(typeof data.score === "number" ? data.score : 0);
      } catch (err) {
        console.error("Error al obtener análisis:", err);
        setAnalysis(t("result.error"));
        setScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [user, ocrText, userData, t]);

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
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="success" />
      </Box>
    );
  }

  return (
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
                {t("result.title")}
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" mt={1}>
              {t("result.subtitle")}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleNewAnalysis}
            startIcon={<RefreshRoundedIcon />}
            sx={{
              borderRadius: 999,
              textTransform: "none",

            }}
          >
            {t("result.newAnalysis")}
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
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {t("result.globalScore")}
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
              label={`${t("result.level")} ${score >= 75 ? t("result.healthy") : t("result.improvable")}`}
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
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t("result.evalTitle")}
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
  );
};

export default ResultScreen;
