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
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";

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
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, mr: 2 }}>
            <NavLink to="/" icon={<HomeRoundedIcon />} label="Home" />

            <NavLink
              to="/about"
              icon={<InfoOutlinedIcon />}
              label="Quiénes somos"
            />

            <NavLink
              to="/how-it-works"
              icon={<AutoAwesomeOutlinedIcon />}
              label="Cómo funciona"
            />

            <NavLink
              to="/contact"
              icon={<ContactMailOutlinedIcon />}
              label="Contacto"
            />
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
                <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
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
            <DrawerNavItem
              to="/"
              icon={<HomeRoundedIcon />}
              label="Home"
              onClick={handleDrawerClose}
            />

            <DrawerNavItem
              to="/about"
              icon={<InfoOutlinedIcon />}
              label="Quiénes somos"
              onClick={handleDrawerClose}
            />

            <DrawerNavItem
              to="/how-it-works"
              icon={<AutoAwesomeOutlinedIcon />}
              label="Cómo funciona"
              onClick={handleDrawerClose}
            />

            <DrawerNavItem
              to="/contact"
              icon={<ContactMailOutlinedIcon />}
              label="Contacto"
              onClick={handleDrawerClose}
            />
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

const NavLink = ({ to, icon, label }) => (
  <Box
    component={Link}
    to={to}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.6,
      textDecoration: "none",
      color: "text.primary",
      fontWeight: 500,
      px: 1,
      py: 0.5,
      borderRadius: 2,
      transition: "all 0.2s ease",
      "&:hover": {
        color: "primary.main",
        bgcolor: "rgba(15,109,99,0.08)",
      },
    }}
  >
    {icon}
    <Typography variant="body2">{label}</Typography>
  </Box>
);

const DrawerNavItem = ({ to, icon, label, onClick }) => (
  <ListItemButton
    component={Link}
    to={to}
    onClick={onClick}
    sx={{
      borderRadius: 2,
      mb: 0.5,
      "&:hover": {
        bgcolor: "rgba(15,109,99,0.08)",
      },
    }}
  >
    <ListItemIcon sx={{ color: "#0f6d63", minWidth: 36 }}>{icon}</ListItemIcon>
    <ListItemText
      primary={label}
      primaryTypographyProps={{ fontWeight: 500 }}
    />
  </ListItemButton>
);

export default AppHeader;
