import { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography, Divider } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import UserDataFormStyled from "../components/UserDataFormStyled.jsx";
import Dashboard from "../components/Dashboard.jsx";
import { useNutrition } from "../context/NutritionContext";

const API_URL = import.meta.env.VITE_API_URL;

const UserDataPage = () => {
  const { user, userData, setUser, updateUserData } = useNutrition();
  const [showSplash, setShowSplash] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  /* ---------------- SPLASH ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- PROFILE FETCH ---------------- */
  useEffect(() => {
    if (!user?.googleId) {
      setProfileLoading(false);
      return;
    }

    let isActive = true;
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/user/profile/${user.googleId}`);
        if (!res.ok) {
          if (res.status === 404) {
            if (isActive) {
              updateUserData({ profileCompleted: false });
            }
            return;
          }
          throw new Error("Error cargando perfil");
        }

        const data = await res.json();
        if (isActive) {
          updateUserData(data.user);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        if (isActive) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [user?.googleId, updateUserData]);

  /* ---------------- GOOGLE LOGIN ---------------- */
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

  /* ---------------- SPLASH SCREEN ---------------- */
  if (showSplash) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#dad0b7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src="/img/logo.png"
          alt="NutriSmart"
          sx={{
            width: { xs: 140, sm: 180 },
            animation: "pulse 1.6s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": { opacity: 0.6, transform: "scale(0.96)" },
              "50%": { opacity: 1, transform: "scale(1.05)" },
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
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          bgcolor: "#f4fbf7",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 3, sm: 4 },
            borderRadius: 6,
            boxShadow: "0 20px 60px rgba(15, 59, 47, 0.15)",
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" fontWeight={800} textAlign="center">
              Bienvenido a NutriSmart
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              Iniciá sesión con Google para analizar productos, guardar tu
              historial y recibir recomendaciones nutricionales claras.
            </Typography>

            <Divider flexItem />

            <GoogleLogin
              onSuccess={(res) => handleGoogleSuccess(res.credential)}
              onError={() => console.error("Error en login con Google")}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              No compartimos tu información personal.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  /* ---------------- PROFILE ---------------- */
  if (profileLoading) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          bgcolor: "#f4fbf7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="text.secondary">Cargando tu perfil...</Typography>
      </Box>
    );
  }

  if (!userData?.profileCompleted) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          bgcolor: "#f4fbf7",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          py: { xs: 3, md: 6 },
          px: 2,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 640 }}>
          <UserDataFormStyled />
        </Box>
      </Box>
    );
  }

  /* ---------------- DASHBOARD ---------------- */
  return <Dashboard />;
};

export default UserDataPage;
