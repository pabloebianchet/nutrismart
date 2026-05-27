import { useState, useEffect } from "react";
import { Avatar, Box, Drawer, IconButton, Typography } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import RamenDiningRoundedIcon    from "@mui/icons-material/RamenDiningRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";

// Items visibles para usuarios con sesión
const NAV = [
  { to: "/",             label: "Inicio",         Icon: HomeRoundedIcon         },
  { to: "/recipes",      label: "Recetas YA",      Icon: RamenDiningRoundedIcon    },
  { to: "/training",    label: "Entrenamiento",   Icon: FitnessCenterRoundedIcon  },
  { to: "/about",        label: "Quiénes somos",  Icon: InfoRoundedIcon         },
  { to: "/how-it-works", label: "Cómo funciona",  Icon: AutoAwesomeRoundedIcon  },
  { to: "/pricing",      label: "Planes",          Icon: DiamondOutlinedIcon     },
  { to: "/contact",      label: "Contacto",        Icon: MailRoundedIcon         },
];

// Items visibles para visitantes sin sesión
const PUBLIC_NAV = [
  { to: "/",             label: "Inicio",         Icon: HomeRoundedIcon         },
  { to: "/about",        label: "Quiénes somos",  Icon: InfoRoundedIcon         },
  { to: "/how-it-works", label: "Cómo funciona",  Icon: AutoAwesomeRoundedIcon  },
  { to: "/pricing",      label: "Planes",          Icon: DiamondOutlinedIcon     },
  { to: "/contact",      label: "Contacto",        Icon: MailRoundedIcon         },
];

const C = {
  brand:       "#bae0dc",
  brandMuted:  "#B2DDD9",
  brandSurface:"#E6F5F3",
  textPrimary: "#0F2420",
  textSecondary:"#4A6B67",
  textMuted:   "#8AADAA",
};

const isActive = (to, pathname) =>
  to === "/" ? pathname === "/" : pathname.startsWith(to);

/* ─────────────────────────────────────────────────────────
   NAV DE ESCRITORIO  (solo visible en md+)
   Barra fija full-width con glassmorphism. Sin trucos de
   centrado que rompen en distintos tamaños de pantalla.
───────────────────────────────────────────────────────── */
const DesktopHeader = ({ user, pathname, scrolled, onLogout }) => {
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        height: 64,
        alignItems: "center",
        px: 4,
        gap: 1,
        background: scrolled
          ? "rgba(240,250,248,0.92)"
          : "rgba(248,253,251,0.78)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: scrolled
          ? "1px solid rgba(11,94,85,0.12)"
          : "1px solid rgba(255,255,255,0.4)",
        boxShadow: scrolled
          ? "0 4px 24px rgba(11,94,85,0.10)"
          : "none",
        transition: "background 0.3s, box-shadow 0.3s, border-color 0.3s",
      }}
    >
      {/* Logo */}
      <Box
        component={Link}
        to="/"
        sx={{ display: "flex", alignItems: "center", textDecoration: "none", mr: 2, flexShrink: 0 }}
      >
        <Box component="img" src="/img/logo.png" alt="NUI App" sx={{ height: 34, width: "auto" }} />
      </Box>

      {/* Separador */}
      <Box sx={{ width: "1px", height: 22, bgcolor: "rgba(11,94,85,0.14)", flexShrink: 0 }} />

      {/* Links nav */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}>
        {(user ? NAV : PUBLIC_NAV).map(({ to, label, Icon }) => {
          const active = isActive(to, pathname);
          return (
            <Box
              key={to}
              component={Link}
              to={to}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                px: 1.8,
                py: 0.75,
                borderRadius: "999px",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                color: active ? "#0F2420" : C.textSecondary,
                bgcolor: active ? C.brand : "transparent",
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.18s ease",
                boxShadow: active ? "0 3px 10px rgba(186,224,220,0.50)" : "none",
                "&:hover": active ? {} : {
                  bgcolor: "rgba(186,224,220,0.25)",
                  color: "#2d7a72",
                },
              }}
            >
              <Icon sx={{ fontSize: 16 }} />
              {label}
            </Box>
          );
        })}
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Avatar (logueado) o botón Iniciar sesión (visitante) */}
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        {user ? (
          <>
            <Box
              onClick={() => setAvatarOpen((p) => !p)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.2,
                py: 0.5,
                borderRadius: "999px",
                cursor: "pointer",
                border: "1px solid transparent",
                transition: "all 0.18s",
                "&:hover": {
                  bgcolor: "rgba(11,94,85,0.07)",
                  borderColor: C.brandMuted,
                },
              }}
            >
              <Avatar
                src={user.picture}
                alt={user.name}
                sx={{ width: 32, height: 32, border: `2px solid ${C.brandMuted}` }}
              />
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.textPrimary,
                  maxWidth: 110,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name?.split(" ")[0]}
              </Typography>
            </Box>

            {avatarOpen && (
              <>
                <Box
                  onClick={() => setAvatarOpen(false)}
                  sx={{ position: "fixed", inset: 0, zIndex: 1 }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 2,
                    minWidth: 210,
                    borderRadius: 3,
                    background: "rgba(245,252,250,0.97)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(11,94,85,0.12)",
                    boxShadow: "0 12px 40px rgba(11,94,85,0.16)",
                    overflow: "hidden",
                    "@keyframes fadeDown": {
                      from: { opacity: 0, transform: "translateY(-6px)" },
                      to:   { opacity: 1, transform: "translateY(0)"     },
                    },
                    animation: "fadeDown 0.16s ease both",
                  }}
                >
                  <Box sx={{ px: 2, py: 1.8, borderBottom: "1px solid rgba(11,94,85,0.08)" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                      {user.name}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: C.textMuted, mt: 0.2 }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Box
                    onClick={() => { setAvatarOpen(false); onLogout(); }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      px: 2,
                      py: 1.4,
                      cursor: "pointer",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "rgba(226,75,74,0.07)" },
                    }}
                  >
                    <LogoutRoundedIcon sx={{ fontSize: 16, color: "#E24B4A" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#E24B4A" }}>
                      Cerrar sesión
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </>
        ) : (
          /* Visitante sin sesión */
          <Box
            component={Link}
            to="/login"
            sx={{
              display: "flex", alignItems: "center", gap: 0.8,
              px: 2, py: 0.75, borderRadius: 999,
              bgcolor: "#ef8e38", color: "#fff",
              fontSize: 13.5, fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 3px 12px rgba(239,142,56,0.32)",
              transition: "all 0.18s",
              "&:hover": { bgcolor: "#d4781e", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(239,142,56,0.42)" },
            }}
          >
            Iniciar sesión →
          </Box>
        )}
      </Box>
    </Box>
  );
};

/* ─────────────────────────────────────────────────────────
   NAV MOBILE  (solo visible en xs/sm)
   Pill flotante arriba + bottom sheet. Ya funcionaba bien,
   se mantiene sin cambios de lógica.
───────────────────────────────────────────────────────── */
const MobileHeader = ({ user, pathname, scrolled, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Pill superior */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          top: 12,
          left: 16,
          right: 16,
          zIndex: 1300,
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.8,
          borderRadius: "999px",
          background: scrolled ? "rgba(240,250,248,0.93)" : "rgba(248,253,251,0.80)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.55)",
          boxShadow: scrolled
            ? "0 8px 28px rgba(11,94,85,0.14)"
            : "0 4px 16px rgba(11,94,85,0.08)",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          component={Link}
          to="/"
          sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          <Box component="img" src="/img/logo.png" alt="NUI App" sx={{ height: 28, width: "auto" }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user && (
            <Avatar
              src={user.picture}
              alt={user.name}
              sx={{ width: 28, height: 28, border: `1.5px solid ${C.brandMuted}` }}
            />
          )}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            size="small"
            sx={{
              width: 34,
              height: 34,
              bgcolor: "rgba(186,224,220,0.25)",
              color: "#2d7a72",
              "&:hover": { bgcolor: C.brand, color: "#0F2420" },
              transition: "all 0.2s",
            }}
          >
            <MenuRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Bottom sheet */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "28px 28px 0 0",
            background: "rgba(245,252,250,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 -12px 48px rgba(11,94,85,0.16)",
            pb: 3,
            maxHeight: "85vh",
          },
        }}
        slotProps={{
          backdrop: { sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(0,0,0,0.15)" } },
        }}
      >
        {/* Handle */}
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: "rgba(11,94,85,0.16)" }} />
        </Box>

        {/* User info (logueado) o acceso (visitante) */}
        {user ? (
          <Box
            sx={{
              mx: 2, mt: 1, mb: 2, p: 2,
              borderRadius: 3,
              bgcolor: C.brandSurface,
              border: `1px solid ${C.brandMuted}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar src={user.picture} alt={user.name} sx={{ width: 44, height: 44, border: `2px solid ${C.brandMuted}` }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.textPrimary }} noWrap>
                {user.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMuted }} noWrap>
                {user.email}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ ml: "auto", color: C.textMuted, flexShrink: 0 }}>
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ mx: 2, mt: 1, mb: 2 }}>
            <Box
              component={Link}
              to="/login"
              onClick={() => setDrawerOpen(false)}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center",
                p: 1.8, borderRadius: 3, textDecoration: "none",
                bgcolor: "#ef8e38", color: "#fff",
                fontWeight: 800, fontSize: 15,
                boxShadow: "0 4px 16px rgba(239,142,56,0.32)",
              }}
            >
              Iniciar sesión →
            </Box>
          </Box>
        )}

        {/* Nav items */}
        <Box sx={{ px: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {(user ? NAV : PUBLIC_NAV).map(({ to, label, Icon }) => {
            const active = isActive(to, pathname);
            return (
              <Box
                key={to}
                component={Link}
                to={to}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.4,
                  borderRadius: 2.5,
                  textDecoration: "none",
                  bgcolor: active ? C.brand : "transparent",
                  transition: "all 0.18s",
                  "&:hover": active ? {} : { bgcolor: "rgba(186,224,220,0.20)" },
                }}
              >
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                    bgcolor: active ? "rgba(0,0,0,0.10)" : C.brandSurface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: active ? "#0F2420" : "#2d7a72" }} />
                </Box>
                <Typography sx={{ fontSize: 15, fontWeight: active ? 700 : 500, color: active ? "#0F2420" : C.textPrimary, flex: 1 }}>
                  {label}
                </Typography>
                <KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: active ? "rgba(0,0,0,0.35)" : C.textMuted }} />
              </Box>
            );
          })}
        </Box>

        {user && (
          <>
            <Box sx={{ mx: 2, my: 1.5, height: 1, bgcolor: "rgba(11,94,85,0.08)" }} />
            {/* Logout */}
            <Box sx={{ px: 2 }}>
              <Box
                onClick={() => { setDrawerOpen(false); onLogout(); }}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.5,
                  px: 2, py: 1.4, borderRadius: 2.5, cursor: "pointer",
                  transition: "background 0.18s",
                  "&:hover": { bgcolor: "rgba(226,75,74,0.07)" },
                }}
              >
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                    bgcolor: "rgba(226,75,74,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <LogoutRoundedIcon sx={{ fontSize: 18, color: "#E24B4A" }} />
                </Box>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#E24B4A" }}>
                  Cerrar sesión
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
};

/* ─────────────────────────────────────────────────────────
   EXPORT
───────────────────────────────────────────────────────── */
const AppHeader = () => {
  const { user, logout, authLoading } = useNutrition();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (authLoading) return null;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <DesktopHeader user={user} pathname={pathname} scrolled={scrolled} onLogout={handleLogout} />
      <MobileHeader  user={user} pathname={pathname} scrolled={scrolled} onLogout={handleLogout} />
      <Box sx={{ height: { xs: 68, md: 64 } }} />
    </>
  );
};

export default AppHeader;
