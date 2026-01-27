import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNutrition } from "../context/NutritionContext";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  const { user, clearUser } = useNutrition();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearUser();
    handleMenuClose();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#e6f5ef" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(17, 24, 39, 0.08)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "14px",
                bgcolor: "#1b5e4b",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                boxShadow: "0 6px 16px rgba(27, 94, 75, 0.35)",
              }}
            >
              <SpaOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f2f27">
                NutriSmart
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tu análisis nutricional inteligente
              </Typography>
            </Box>
          </Stack>

          {user ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: "#43a047" }}>{user.name[0]}</Avatar>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Typography variant="body2" fontWeight={700}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sesión activa
                </Typography>
              </Box>
              <IconButton onClick={handleMenuOpen}>
                <ExpandMoreIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>{user.email}</MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
              </Menu>
            </Stack>
          ) : (
            <Box sx={{ width: 48 }} />
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
