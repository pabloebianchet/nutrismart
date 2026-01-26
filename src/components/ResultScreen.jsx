import { Box, Typography, CircularProgress, LinearProgress, Paper } from "@mui/material";
import { useNutrition } from "../context/NutritionContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";

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
          <Box sx={{ my: 4, display: "flex", justifyContent: "center" }}>
  <CircularScore value={score} />
</Box>
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
