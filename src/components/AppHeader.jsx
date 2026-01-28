import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  Button,
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user) {
    return null;
  }

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
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" color="textPrimary">
          NutriSmart
        </Typography>
        {isMobile ? (
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleDrawerOpen}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              color="inherit"
              component={Link}
              to="/about"
              sx={{ textTransform: "none" }}
            >
              Quiénes somos
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/how-it-works"
              sx={{ textTransform: "none" }}
            >
              Cómo funciona
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/contact"
              sx={{ textTransform: "none" }}
            >
              Contacto
            </Button>
            <IconButton onClick={handleMenuOpen} aria-label="Abrir menú de usuario">
              <Avatar src={user.picture} alt={user.name} />
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
        )}
      </Toolbar>
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar src={user.picture} alt={user.name} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography variant="subtitle1">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <List>
            <ListItemButton
              component={Link}
              to="/about"
              onClick={handleDrawerClose}
            >
              <ListItemText primary="Quiénes somos" />
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/how-it-works"
              onClick={handleDrawerClose}
            >
              <ListItemText primary="Cómo funciona" />
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/contact"
              onClick={handleDrawerClose}
            >
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
    </AppBar>
  );
};

export default AppHeader;
