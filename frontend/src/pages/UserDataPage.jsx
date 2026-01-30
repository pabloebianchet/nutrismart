import { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import UserDataFormStyled from "../components/UserDataFormStyled";
import { useNutrition } from "../context/NutritionContext";
import { GoogleLogin } from "@react-oauth/google";
import Dashboard from "../components/Dashboard";

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
          minHeight: "100vh",
          bgcolor: "#a7dcd2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src="/img/logo.png"
          alt="Nutrismart logo"
          sx={{
            width: 200,
            animation: "pulse 1.6s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": { opacity: 0.6, transform: "scale(0.96)" },
              "50%": { opacity: 1, transform: "scale(1.04)" },
              "100%": { opacity: 0.6, transform: "scale(0.96)" },
            },
          }}
        />
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

  /* -*
