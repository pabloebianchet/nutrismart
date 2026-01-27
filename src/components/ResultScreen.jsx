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

const CircularScore = ({ value }) => {
  const getColor = (value) => {
    if (value >= 90) return "#2e7d32";
    if (value >= 75) return "#66bb6a";
    if (value >= 60) return "#ffa726";
    if (value >= 45) return "#fb8c00";
    return "#e53935";
  };

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={130}
        thickness={5}
        sx={{
          color: getColor(value),
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          / 100
        </Typography>
      </Box>
    </Box>
  );
};

const ResultScreen = () => {
  const { userData, ocrText, clearOcrText } = useNutrition();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!ocrText || !userData) {
      navigate("/"); // Redirige si falta info
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userData, productText: ocrText }),
        });

        const result = await response.json();
        setAnalysis(result.analysis);
      } catch (err) {
        console.error("Error al obtener análisis:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [ocrText, userData, navigate]);

  const extractScore = (text) => {
    const match = text.match(/Puntaje global:\s*(\d+)\s*\/\s*100/i);
    return match ? parseInt(match[1], 10) : 0;
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

  const score = extractScore(analysis);
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

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
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
        }}
      >
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
            Nuevo análisis desde imágenes
          </Button>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          mt={4}
        >
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
              <CircularScore value={score} />
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
              Detalle del análisis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {analysis}
            </Typography>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ResultScreen;
