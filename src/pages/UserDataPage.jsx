import { useEffect, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import UserDataFormStyled from "../components/UserDataFormStyled";
import { useNutrition } from "../context/NutritionContext";

const UserDataPage = () => {
  const { user, setUser } = useNutrition();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const handleMockGoogleLogin = () => {
    setUser({
      name: "Ana Martínez",
      email: "ana.martinez@gmail.com",
    });
  };

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
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 96,
              height: 96,
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
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={800}>
              Iniciá sesión para continuar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Conectate con Google para guardar tu progreso y acceder a futuros
              beneficios.
            </Typography>
            <Button
              onClick={handleMockGoogleLogin}
              variant="contained"
              startIcon={<GoogleIcon />}
              sx={{
                textTransform: "none",
                bgcolor: "#1b5e4b",
                px: 3,
                py: 1.4,
                borderRadius: 999,
                boxShadow: "0 12px 25px rgba(27, 94, 75, 0.25)",
                "&:hover": { bgcolor: "#154437" },
              }}
            >
              Continuar con Google
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return <UserDataFormStyled />;
};

export default UserDataPage;

