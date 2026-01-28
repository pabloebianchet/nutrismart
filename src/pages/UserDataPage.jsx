import { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import UserDataFormStyled from "../components/UserDataFormStyled";
import { useNutrition } from "../context/NutritionContext";
import { GoogleLogin } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL;

const UserDataPage = () => {
  const { user, setUser } = useNutrition();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSuccess = async (credential) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        throw new Error("Error autenticando con Google");
      }

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  /* ---------------- SPLASH ---------------- */
  if (showSplash) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "32px",
              bgcolor: "#1b5e4b",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              boxShadow: "0 20px 40px rgba(27, 94, 75, 0.35)",
              animation: "pulseIn 2.2s ease-in-out",
              "@keyframes pulseIn": {
                "0%": { opacity: 0, transform: "scale(0.85)" },
                "60%": { opacity: 1, transform: "scale(1.05)" },
                "100%": { opacity: 1, transform: "scale(1)" },
              },
            }}
          >
            <SpaOutlinedIcon sx={{ fontSize: 48 }} />
          </Box>

          <Typography variant="h4" fontWeight={800}>
            NutriSmart
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Preparando tu experiencia saludable...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* ---------------- LOGIN ---------------- */
  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: { xs: "auto", md: "70vh" },
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 520,
            p: { xs: 3, md: 4 },
            borderRadius: 6,
            boxShadow: "0 20px 50px rgba(15, 59, 47, 0.18)",
            bgcolor: "#ffffff",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography variant="h4" fontWeight={800}>
              Iniciá sesión para continuar
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              Conectate con Google para guardar tu progreso y acceder a futuros
              beneficios.
            </Typography>

            <Box mt={2}>
              <GoogleLogin
                onSuccess={(res) => handleGoogleSuccess(res.credential)}
                onError={() => {
                  console.error("Error en login con Google");
                }}
              />
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  }

  /* ---------------- FORMULARIO ---------------- */
  return <UserDataFormStyled />;
};

export default UserDataPage;
