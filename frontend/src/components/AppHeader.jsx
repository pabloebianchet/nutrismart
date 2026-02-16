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
  ListItemIcon,
  Switch,
  FormControl,
  Select,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import { useTranslation } from "react-i18next";
import { useUiPreferences } from "../context/UiPreferencesContext";

const AppHeader = () => {
  const { user, logout, authLoading } = useNutrition();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode, toggleMode, language, setLanguage } = useUiPreferences();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (authLoading || !user) return null;

  const handleLogout = () => {
    logout();
    setMenuAnchor(null);
    setDrawerOpen(false);
    navigate("/");
  };

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Box component="img" src="/img/logo.png" alt="Nutrismart logo" sx={{ height: 36, width: "auto" }} />
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, mr: 2 }}>
            <NavLink to="/" icon={<HomeRoundedIcon />} label={t("nav.home")} />
            <NavLink to="/about" icon={<InfoOutlinedIcon />} label={t("nav.about")} />
            <NavLink to="/how-it-works" icon={<AutoAwesomeOutlinedIcon />} label={t("nav.howItWorks")} />
            <NavLink to="/contact" icon={<ContactMailOutlinedIcon />} label={t("nav.contact")} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)}>
                <Avatar src={user.picture} alt={user.name} sx={{ width: 36, height: 36, border: "2px solid", borderColor: "primary.main" }} />
              </IconButton>

              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                <Typography sx={{ px: 2, pt: 1, pb: 0.5 }} variant="caption">{t("menu.settings")}</Typography>
                <MenuItem sx={{ display: "block" }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TranslateRoundedIcon fontSize="small" />
                      <Typography variant="body2">{t("menu.language")}</Typography>
                    </Stack>
                    <FormControl fullWidth size="small">
                      <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <MenuItem value="es">{t("menu.spanish")}</MenuItem>
                        <MenuItem value="en">{t("menu.english")}</MenuItem>
                        <MenuItem value="it">{t("menu.italian")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </MenuItem>

                <MenuItem onClick={toggleMode}>
                  <ListItemIcon><DarkModeRoundedIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t("menu.theme")} secondary={mode === "light" ? t("menu.light") : t("menu.dark")} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>{t("menu.logout")}</MenuItem>
              </Menu>
            </Box>

            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, p: 2, mt: 10 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Avatar src={user.picture} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography fontWeight={600}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            </Box>
          </Box>

          <Divider />
          <List>
            <DrawerNavItem to="/" icon={<HomeRoundedIcon />} label={t("nav.home")} onClick={() => setDrawerOpen(false)} />
            <DrawerNavItem to="/about" icon={<InfoOutlinedIcon />} label={t("nav.about")} onClick={() => setDrawerOpen(false)} />
            <DrawerNavItem to="/how-it-works" icon={<AutoAwesomeOutlinedIcon />} label={t("nav.howItWorks")} onClick={() => setDrawerOpen(false)} />
            <DrawerNavItem to="/contact" icon={<ContactMailOutlinedIcon />} label={t("nav.contact")} onClick={() => setDrawerOpen(false)} />
          </List>

          <Divider />
          <List>
            <ListItemButton>
              <ListItemIcon sx={{ color: "primary.main", minWidth: 36 }}><TranslateRoundedIcon /></ListItemIcon>
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>{t("menu.language")}</Typography>
                <FormControl fullWidth size="small">
                  <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <MenuItem value="es">{t("menu.spanish")}</MenuItem>
                    <MenuItem value="en">{t("menu.english")}</MenuItem>
                    <MenuItem value="it">{t("menu.italian")}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </ListItemButton>

            <ListItemButton onClick={toggleMode}>
              <ListItemIcon sx={{ color: "primary.main", minWidth: 36 }}><DarkModeRoundedIcon /></ListItemIcon>
              <ListItemText primary={t("menu.theme")} secondary={mode === "light" ? t("menu.light") : t("menu.dark")} />
              <Switch checked={mode === "dark"} edge="end" />
            </ListItemButton>

            <ListItemButton onClick={handleLogout}><ListItemText primary={t("menu.logout")} /></ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

const NavLink = ({ to, icon, label }) => (
  <Box component={Link} to={to} sx={{ display: "flex", alignItems: "center", gap: 0.6, textDecoration: "none", color: "text.primary", fontWeight: 500, px: 1, py: 0.5, borderRadius: 2, transition: "all 0.2s ease", "&:hover": { color: "primary.main", bgcolor: "rgba(15,109,99,0.08)" } }}>
    {icon}
    <Typography variant="body2">{label}</Typography>
  </Box>
);

const DrawerNavItem = ({ to, icon, label, onClick }) => (
  <ListItemButton component={Link} to={to} onClick={onClick} sx={{ borderRadius: 2, mb: 0.5, "&:hover": { bgcolor: "rgba(15,109,99,0.08)" } }}>
    <ListItemIcon sx={{ color: "primary.main", minWidth: 36 }}>{icon}</ListItemIcon>
    <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 500 }} />
  </ListItemButton>
);

export default AppHeader;
