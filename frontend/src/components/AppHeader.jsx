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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";

const AppHeader = () => {
  const { user, logout } = useNutrition();
  const navigate = useNavigate();

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
    navigate("/");
  };

  return (
    <>
      {/* ---------- HEADER ---------- */}
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box
  component={Link}
  to="/"
  sx={{
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  }}
>
  <Box
    component="img"
    src="/img/logo.png"
    alt="Nutrismart logo"
    sx={{
      height: 36,
      width: "auto",
    }}
  />
</Box>

{/* ---------- DESKTOP NAV ---------- */}
<Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, mr: 2 }}>


<Typography
  component={Link}
  to="/"
  sx={{ textDecoration: "none", color: "inherit", fontWeight: 500 }}
>
  Inicio
</Typography>
  

  <Typography
    component={Link}
    to="/about"
    sx={{ textDecoration: "none", color: "inherit", fontWeight: 500 }}
  >
    Quiénes somos
  </Typography>

  <Typography
    component={Link}
    to="/how-it-works"
    sx={{ textDecoration: "none", color: "inherit", fontWeight: 500 }}
  >
    Cómo funciona
  </Typography>

  <Typography
    component={Link}
    to="/contact"
    sx={{ textDecoration: "none", color: "inherit", fontWeight: 500 }}
  >
    Contacto
  </Typography>


  
</Box>
          {/* RIGHT SIDE */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* ---------- DESKTOP ---------- */}
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton onClick={handleMenuOpen}>
                <Avatar
                  src={user.picture}
                  alt={user.name}
                  sx={{
                    width: 36,
                    height: 36,
                    border: "2px solid #1b5e4b",
                  }}
                />
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
            </Box>

            {/* ---------- MOBILE ---------- */}
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton onClick={handleDrawerOpen}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🔥 Spacer para que no pise contenido */}
      <Toolbar />

      {/* ---------- MOBILE DRAWER ---------- */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 280, p: 2, mt: 10 }}>
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
  <ListItemButton component={Link} to="/" onClick={handleDrawerClose}>
    <ListItemText primary="Inicio" />
  </ListItemButton>

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
