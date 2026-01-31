import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { useNutrition } from "../context/NutritionContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const { user } = useNutrition();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.googleId) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/analysis/${user.googleId}`
        );

        setHistory(res.data.history || []);
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.googleId]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4fbf7",
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800}>
          Hola{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </Typography>

        <Typography variant="body1" color="text.secondary" mt={1}>
          Este es tu panel personal de NutriSmart.
        </Typography>
      </Box>

      {/* CTA NUEVO ANÁLISIS */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 12px 30px rgba(15, 59, 47, 0.12)",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Nuevo análisis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analizá un producto escaneando su etiqueta.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineRoundedIcon />}
          sx={{
            bgcolor: "#0f6d63",
            borderRadius: 999,
            px: 3,
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#0c5a52",
            },
          }}
          onClick={() => navigate("/capture")}
        >
          Analizar
        </Button>
      </Paper>

      {/* HISTORIAL */}
      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Tus análisis recientes
        </Typography>

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Cargando historial...
          </Typography>
        ) : history.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: "center",
              bgcolor: "#ffffff",
              boxShadow: "0 10px 25px rgba(15, 59, 47, 0.08)",
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              Todavía no realizaste análisis
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Cuando analices productos, los vas a ver acá durante 30 días.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {history.map((item) => (
              <Paper
                key={item._id}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: "#ffffff",
                  boxShadow: "0 10px 25px rgba(15, 59, 47, 0.08)",
                }}
              >
                <Typography variant="body1" fontWeight={700}>
                  Puntaje: {item.score} / 100
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={1}
                >
                  {item.analysisText}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
