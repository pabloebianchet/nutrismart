import { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography, Divider } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard.jsx";
import { useNutrition } from "../context/NutritionContext";

import { API_URL } from "../config/api";
import { useTranslation } from "react-i18next";

const UserDataPage = () => {
  const { user, userData, setUser, loadingUserData } = useNutrition();
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  /* ---------------- SPLASH ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && userData?.profileCompleted === false) {
      navigate("/profile", { replace: true });
    }
  }, [navigate, user, userData?.profileCompleted]);

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
          bgcolor: "background.paper",
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
          bgcolor: "background.default",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 3, sm: 4 },
            borderRadius: 6,
  
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" fontWeight={800} textAlign="center">
              {t("home.welcome")}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              {t("home.loginDescription")}
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
              {t("home.privacy")}
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  /* ---------------- PROFILE ---------------- */
  if (loadingUserData) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          bgcolor: "background.default",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="text.secondary">{t("home.loadingProfile")}</Typography>
      </Box>
    );
  }

  if (!userData?.profileCompleted) {
    return null;
  }

  /* ---------------- DASHBOARD ---------------- */
  return <Dashboard />;
};

export default UserDataPage;
