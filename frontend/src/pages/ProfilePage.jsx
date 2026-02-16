import { useEffect } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserDataFormStyled from "../components/UserDataFormStyled.jsx";
import { useNutrition } from "../context/NutritionContext";

const ProfilePage = () => {
  const { user, userData } = useNutrition();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (userData?.profileCompleted) {
      navigate("/", { replace: true });
    }
  }, [navigate, user, userData?.profileCompleted]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
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
};

export default ProfilePage;
