import { Box, Typography, CircularProgress, LinearProgress, Paper } from "@mui/material";
import { useNutrition } from "../context/NutritionContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ResultScreen = () => {
  const { userData, ocrText } = useNutrition();
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
          minHeight: "100vh",
          bgcolor: "#d5ede4",
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
  const getColor = (value) => {
    if (value >= 90) return "#2e7d32";
    if (value >= 75) return "#66bb6a";
    if (value >= 60) return "#ffa726";
    if (value >= 45) return "#fb8c00";
    return "#e53935";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#d5ede4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: 500,
          width: "100%",
          bgcolor: "#fff",
          borderRadius: 4,
          p: 4,
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Resultado del análisis
        </Typography>

        {/* Puntaje */}
        <Box sx={{ my: 3 }}>
          <Typography>Puntaje global: {score} / 100</Typography>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 12,
              borderRadius: 6,
              mt: 1,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: getColor(score),
              },
            }}
          />
        </Box>

        {/* Resultado completo */}
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
          {analysis}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ResultScreen;
