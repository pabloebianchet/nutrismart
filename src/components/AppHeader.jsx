import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Divider,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";

const AppHeader = () => {
  const { user, logout } = useNutrition();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user) return null;

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    handleDrawerClose();
  };

  return (
    <>
      {/* ---------- HEADER ---------- */}
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>
            NutriSmart
          </Typography>

          {isMobile ? (
            <IconButton onClick={handleDrawerOpen} aria-label="Abrir menú">
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              <IconButton onClick={handleMenuOpen}>
                <Avatar src={user.picture} alt={user.name} />
              </IconButton>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleLogout}>
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* 🔥 Spacer para que no pise contenido */}
      <Toolbar />

      {/* ---------- MOBILE DRAWER ---------- */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Avatar src={user.picture} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography fontWeight={600}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <List>
            <ListItemButton component={Link} to="/about" onClick={handleDrawerClose}>
              <ListItemText primary="Quiénes somos" />
            </ListItemButton>
            <ListItemButton component={Link} to="/how-it-works" onClick={handleDrawerClose}>
              <ListItemText primary="Cómo funciona" />
            </ListItemButton>
            <ListItemButton component={Link} to="/contact" onClick={handleDrawerClose}>
              <ListItemText primary="Contacto" />
            </ListItemButton>
          </List>

          <Divider />

          <List>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default AppHeader;
