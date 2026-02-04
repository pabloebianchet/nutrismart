import { useState, useEffect } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { Link, useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";

const AppHeader = () => {
  const { user, logout } = useNutrition();
  const navigate = useNavigate();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  if (!user) return null;

  /* ---------- SCROLL EFFECT ---------- */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuAnchor(null);
    setDrawerOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* ---------- HEADER ---------- */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 0 : 1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: scrolled
            ? "rgba(255,255,255,0.75)"
            : "rgba(255,255,255,1)",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* LOGO */}
          <Box
            component={Link}
            to="/"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box
              component="img"
              src="/img/logo.png"
              alt="Nutrismart logo"
              sx={{ height: 36 }}
            />
          </Box>

          {/* ---------- DESKTOP NAV ---------- */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            <NavItem to="/" icon={<HomeRoundedIcon />} label="Home" />
            <NavItem
              to="/about"
              icon={<InfoOutlinedIcon />}
              label="Quiénes somos"
            />
            <NavItem
              to="/how-it-works"
              icon={<AutoAwesomeOutlinedIcon />}
              label="Cómo funciona"
            />
            <NavItem
              to="/contact"
              icon={<ContactMailOutlinedIcon />}
              label="Contacto"
            />
          </Box>

          {/* ---------- RIGHT ---------- */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* DESKTOP AVATAR */}
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <Avatar
                  src={user.picture}
                  alt={user.name}
                  sx={{ width: 36, height: 36, border: "2px solid #1b5e4b" }}
                />
              </IconButton>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutRoundedIcon sx={{ mr: 1 }} />
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </Box>

            {/* MOBILE */}
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer */}
      <Toolbar />

      {/* ---------- MOBILE DRAWER ---------- */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 2, mt: 8 }}>
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
            <DrawerItem to="/" icon={<HomeRoundedIcon />} label="Home" />
            <DrawerItem
              to="/about"
              icon={<InfoOutlinedIcon />}
              label="Quiénes somos"
            />
            <DrawerItem
              to="/how-it-works"
              icon={<AutoAwesomeOutlinedIcon />}
              label="Cómo funciona"
            />
            <DrawerItem
              to="/contact"
              icon={<ContactMailOutlinedIcon />}
              label="Contacto"
            />
          </List>

          <Divider />

          <List>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

/* ---------- COMPONENTES AUX ---------- */
const NavItem = ({ to, icon, label }) => (
  <Box
    component={Link}
    to={to}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.8,
      textDecoration: "none",
      color: "text.primary",
      fontWeight: 500,
      "&:hover": { color: "primary.main" },
    }}
  >
    {icon}
    <Typography variant="body2">{label}</Typography>
  </Box>
);

const DrawerItem = ({ to, icon, label }) => (
  <ListItemButton component={Link} to={to}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={label} />
  </ListItemButton>
);

export default AppHeader;
