import { useEffect } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserDataFormStyled from "../components/UserDataFormStyled.jsx";
import { useNutrition } from "../context/NutritionContext";

const ProfilePage = () => {
  const { user } = useNutrition();
  const navigate = useNavigate();

  // Ojo: a propósito NO redirige afuera cuando el perfil ya está completo —
  // esta pantalla también sirve para editar nombre/foto/datos después del
  // onboarding inicial (ver "Mi perfil" en el menú de AppHeader).
  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [navigate, user]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg, #edf8f5 0%, #ffffff 55%, #f4f9f7 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: { xs: 10, md: 12 },
        pb: { xs: 6, md: 10 },
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 540 }}>
        <UserDataFormStyled />
      </Box>
    </Box>
  );
};

export default ProfilePage;
