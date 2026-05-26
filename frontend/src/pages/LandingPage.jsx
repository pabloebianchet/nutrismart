/**
 * LandingPage — sin emojis, con logo real y soporte para fotos con overlay
 */

import { useEffect, useState }  from "react";
import { useNavigate, Link }    from "react-router-dom";
import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import BoltRoundedIcon           from "@mui/icons-material/BoltRounded";
import CheckRoundedIcon          from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon   from "@mui/icons-material/ArrowForwardRounded";
import SearchRoundedIcon         from "@mui/icons-material/SearchRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import FitnessCenterRoundedIcon  from "@mui/icons-material/FitnessCenterRounded";
import DiamondOutlinedIcon       from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import RocketLaunchRoundedIcon   from "@mui/icons-material/RocketLaunchRounded";
import PersonAddRoundedIcon      from "@mui/icons-material/PersonAddRounded";
import AccountCircleRoundedIcon  from "@mui/icons-material/AccountCircleRounded";
import TrendingUpRoundedIcon     from "@mui/icons-material/TrendingUpRounded";

/* ─── Colores ────────────────────────────────────────────────────────────── */
const C = {
  heroBg:     "#060F0D",
  heroAccent: "#10B981",
  brand:      "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurf:  "#E6F5F3",
  text:       "#0F2420",
  muted:      "#4A6B67",
};

const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

/* ─── NAV ────────────────────────────────────────────────────────────────── */
const LandingNav = ({ scrolled }) => {
  const navigate = useNavigate();
  return (
    <Box component="nav" sx={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1900,
      px: { xs: 2.5, sm: 5, md: 8 },
      py: scrolled ? 1.2 : 1.8,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(6,15,13,0.90)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.3s ease",
    }}>
      {/* Logo real sin fondo — mix-blend-mode sobre oscuro */}
      <Box component="img" src="/img/logo_landing.png" alt="Nui"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          height: 34, cursor: "pointer",
          opacity: 0.9,
          transition: "opacity 0.2s",
          "&:hover": { opacity: 1 },
        }}
      />

      {/* Links desktop */}
      <Stack direction="row" spacing={4} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
        {[["Características", "#modulos"], ["Cómo funciona", "#como-funciona"], ["Precios", "#precios"]].map(([label, href]) => (
          <Box key={label} component="a" href={href}
            sx={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.65)", textDecoration: "none",
              "&:hover": { color: "#fff" }, transition: "color 0.2s" }}>
            {label}
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button onClick={() => navigate("/login")}
          sx={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "none",
            px: 2, py: 0.9, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.07)", color: "#fff" } }}>
          Iniciar sesión
        </Button>
        <Button onClick={() => navigate("/login")} variant="contained"
          sx={{ fontSize: 13, fontWeight: 800, textTransform: "none", bgcolor: C.heroAccent, color: "#fff",
            px: 2.5, py: 0.9, borderRadius: 2.5, boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
            "&:hover": { bgcolor: "#0ea271" } }}>
          Empezar gratis
        </Button>
      </Stack>
    </Box>
  );
};

/* ─── MOCK CARD (hero) ───────────────────────────────────────────────────── */
const MockCard = ({ children, sx }) => (
  <Box sx={{
    background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.09)", borderRadius: 3, p: 2, minWidth: 220, ...sx,
  }}>
    {children}
  </Box>
);

/* ─── HERO ───────────────────────────────────────────────────────────────── */
const HeroSection = ({ onCTA }) => (
  <Box sx={{
    background: C.heroBg, minHeight: { xs: "100svh", md: "100vh" },
    display: "flex", alignItems: "center",
    position: "relative", overflow: "hidden",
    px: { xs: 2.5, sm: 5, md: 8, lg: 12 },
    pt: { xs: 10, md: 0 }, pb: { xs: 8, md: 0 },
  }}>
    {/* Foto hero con overlay */}
    <Box aria-hidden sx={{
      position: "absolute", inset: 0,
      backgroundImage: "url(/img/fondoVerde.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      opacity: 0.13, pointerEvents: "none",
    }} />

    {/* Ilustración decorativa */}
    <Box component="img" src="/img/fondoCell.png" alt="" aria-hidden="true" sx={{
      position: "absolute", bottom: 0, right: { xs: "-10%", md: "2%" },
      height: { xs: "55%", md: "70%" }, opacity: 0.04,
      pointerEvents: "none", filter: "invert(1) brightness(2)", mixBlendMode: "screen",
    }} />

    {/* Glows */}
    <Box sx={{ position: "absolute", top: "20%", left: "35%", width: 600, height: 600, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", display: "flex",
      alignItems: "center", gap: { xs: 0, md: 8 }, flexDirection: { xs: "column", md: "row" } }}>

      {/* Texto */}
      <Box sx={{ flex: 1, zIndex: 1 }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.8,
          border: "1px solid rgba(16,185,129,0.28)", borderRadius: 999,
          px: 2, py: 0.6, mb: 3, background: "rgba(16,185,129,0.07)",
          animation: "fadeUp 0.5s ease both",
          "@keyframes fadeUp": { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        }}>
          <BoltRoundedIcon sx={{ fontSize: 14, color: C.heroAccent }} />
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: C.heroAccent, letterSpacing: "0.04em" }}>
            Análisis nutricional con IA
          </Typography>
        </Box>

        <Typography component="h1" sx={{
          fontSize: { xs: 38, sm: 50, md: 56, lg: 66 }, fontWeight: 900,
          color: "#fff", lineHeight: 1.08, letterSpacing: "-2px", mb: 2.5,
          animation: "fadeUp 0.6s 0.1s ease both",
        }}>
          Comé mejor.<br />Entrenás mejor.<br />
          <Box component="span" sx={{ color: C.heroAccent }}>Vivís mejor.</Box>
        </Typography>

        <Typography sx={{
          fontSize: { xs: 15, sm: 16.5 }, color: "rgba(255,255,255,0.58)",
          lineHeight: 1.75, maxWidth: 500, mb: 4, animation: "fadeUp 0.6s 0.2s ease both",
        }}>
          Nui analiza tus alimentos con inteligencia artificial, genera recetas saludables
          adaptadas a vos y crea tu plan de entrenamiento personalizado.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}
          sx={{ mb: 5, animation: "fadeUp 0.6s 0.3s ease both" }}>
          <Button onClick={onCTA} endIcon={<ArrowForwardRoundedIcon />} sx={{
            bgcolor: C.heroAccent, color: "#fff", fontWeight: 800, fontSize: 15.5,
            textTransform: "none", px: 3.5, py: 1.5, borderRadius: 3,
            boxShadow: "0 6px 24px rgba(16,185,129,0.38)",
            "&:hover": { bgcolor: "#0ea271", transform: "translateY(-1px)" }, transition: "all 0.2s",
          }}>
            Empezar gratis — 7 días
          </Button>
          <Button onClick={onCTA} sx={{
            color: "rgba(255,255,255,0.70)", fontWeight: 700, fontSize: 14.5,
            textTransform: "none", px: 3, py: 1.5, borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.12)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "#fff" },
          }}>
            Iniciar sesión
          </Button>
        </Stack>

        <Stack direction="row" spacing={3} sx={{ animation: "fadeUp 0.6s 0.4s ease both" }}>
          {[["3", "módulos IA"], ["7 días", "prueba gratis"], ["100%", "personalizado"]].map(([val, label]) => (
            <Box key={label}>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{val}</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.40)", fontWeight: 600, mt: 0.2 }}>{label}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Mock UI cards */}
      <Box sx={{
        flex: 1, display: { xs: "none", md: "flex" },
        alignItems: "center", justifyContent: "center",
        position: "relative", height: 480, zIndex: 1,
      }}>
        {/* Card análisis */}
        <MockCard sx={{
          position: "absolute", top: 30, right: 60,
          animation: "floatA 4s ease-in-out infinite",
          "@keyframes floatA": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        }}>
          <Stack direction="row" alignItems="center" spacing={1.2} mb={1.5}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: "rgba(16,185,129,0.14)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SearchRoundedIcon sx={{ fontSize: 16, color: C.heroAccent }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Análisis completado</Typography>
              <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.40)" }}>Granola Integral 200g</Typography>
            </Box>
          </Stack>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 1.2 }}>
            <Typography sx={{ fontSize: 32, fontWeight: 900, color: C.heroAccent, lineHeight: 1 }}>84</Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>/100</Typography>
          </Box>
          {[["Proteínas", "78%", C.heroAccent], ["Carbohidratos", "55%", "#F59E0B"], ["Grasas", "35%", "#60A5FA"]].map(([n, w, c]) => (
            <Box key={n} mb={0.7}>
              <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.50)", mb: 0.4 }}>{n}</Typography>
              <Box sx={{ height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.07)" }}>
                <Box sx={{ height: 4, borderRadius: 2, bgcolor: c, width: w }} />
              </Box>
            </Box>
          ))}
        </MockCard>

        {/* Card entrenamiento */}
        <MockCard sx={{
          position: "absolute", bottom: 60, right: 20, minWidth: 200,
          animation: "floatB 4.5s 0.8s ease-in-out infinite",
          "@keyframes floatB": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.2}>
            <FitnessCenterRoundedIcon sx={{ fontSize: 16, color: "#F59E0B" }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Plan activo</Typography>
          </Stack>
          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.50)", mb: 1 }}>Día 3 de 5 · Fuerza</Typography>
          {["Sentadillas 4×12", "Press banca 3×10", "Peso muerto 3×8"].map((e, i) => (
            <Stack key={e} direction="row" alignItems="center" spacing={1} mb={0.5}>
              <CheckRoundedIcon sx={{ fontSize: 12, color: i < 2 ? C.heroAccent : "rgba(255,255,255,0.20)" }} />
              <Typography sx={{ fontSize: 11, color: i < 2 ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.30)" }}>{e}</Typography>
            </Stack>
          ))}
        </MockCard>

        {/* Card receta */}
        <MockCard sx={{
          position: "absolute", top: 150, left: 0, minWidth: 190,
          animation: "floatC 5s 0.4s ease-in-out infinite",
          "@keyframes floatC": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <RestaurantMenuRoundedIcon sx={{ fontSize: 16, color: "#A78BFA" }} />
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Receta generada</Typography>
              <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.40)" }}>Personalizada para vos</Typography>
            </Box>
          </Stack>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: C.heroAccent, mb: 0.5 }}>Bowl de proteínas</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            Pollo · Quinoa · Palta<br />420 kcal · 38g proteína
          </Typography>
        </MockCard>
      </Box>
    </Box>
  </Box>
);

/* ─── TICKER ─────────────────────────────────────────────────────────────── */
const MarqueeTicker = () => {
  const items = ["ANÁLISIS", "RECETAS", "ENTRENAMIENTO", "NUI", "SALUD", "INTELIGENCIA ARTIFICIAL", "NUTRICIÓN", "BIENESTAR"];
  const repeated = [...items, ...items];
  return (
    <Box sx={{ background: C.heroBg, borderTop: "1px solid rgba(255,255,255,0.05)",
      borderBottom: "1px solid rgba(16,185,129,0.12)", py: 1.4, overflow: "hidden" }}>
      <Box sx={{
        display: "flex", gap: 4, width: "max-content",
        animation: "marquee 30s linear infinite",
        "@keyframes marquee": { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      }}>
        {repeated.map((item, i) => (
          <Stack key={i} direction="row" alignItems="center" spacing={2} sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.30)",
              letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
              {item}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: C.heroAccent, opacity: 0.4 }} />
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

/* ─── MÓDULOS ────────────────────────────────────────────────────────────── */
const MODULES = [
  {
    Icon:  SearchRoundedIcon,
    title: "Análisis de alimentos",
    desc:  "Fotografiá cualquier producto o etiqueta y obtené su análisis nutricional completo al instante. Puntaje, macros, alertas y recomendaciones personalizadas.",
    color: C.brand, bg: C.brandSurf,
    tags:  ["Score nutricional", "Macros", "Ingredientes", "Historial"],
    photo: "/img/150096600078176441.jpg",
  },
  {
    Icon:  RestaurantMenuRoundedIcon,
    title: "Recetas con IA",
    desc:  "Recibí recetas saludables adaptadas a tu perfil, objetivos y preferencias. Generadas al instante, fáciles de preparar y con toda la info nutricional.",
    color: "#7C3AED", bg: "#F5F3FF",
    tags:  ["Personalizadas", "Ingredientes reales", "Calorías", "Favoritas"],
    photo: "/img/368521182029510975.jpg",
  },
  {
    Icon:  FitnessCenterRoundedIcon,
    title: "Entrenamiento personalizado",
    desc:  "Tu plan de ejercicios adaptado a tu cuerpo, nivel y metas. Seguí tu progreso sesión a sesión y evolucioná con cada entrenamiento.",
    color: "#D97706", bg: "#FFFBEB",
    tags:  ["Plan a medida", "Seguimiento", "2 planes", "Progreso"],
    photo: "/img/Start%20every%20day%20strong!%20Build%20muscle%2C%20burn%20fat%E2%80%A6.jpg",
  },
];

const ModulesSection = () => (
  <Box id="modulos" sx={{ background: "#fff", py: { xs: 9, md: 14 }, px: { xs: 2.5, sm: 5, md: 8 } }}>
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Box textAlign="center" mb={7}>
        <Chip label="3 módulos integrados"
          icon={<BoltRoundedIcon sx={{ fontSize: "14px !important", color: `${C.brand} !important` }} />}
          sx={{ mb: 2.5, bgcolor: C.brandSurf, color: C.brand, fontWeight: 700, fontSize: 12,
            border: "1px solid rgba(11,94,85,0.18)", px: 0.5 }} />
        <Typography sx={{ fontSize: { xs: 26, sm: 36 }, fontWeight: 900, color: C.text,
          letterSpacing: "-1px", lineHeight: 1.15, mb: 2 }}>
          Todo lo que necesitás<br />
          <Box component="span" sx={{ color: C.brand }}>en un solo lugar</Box>
        </Typography>
        <Typography sx={{ fontSize: 16, color: C.muted, maxWidth: 500, mx: "auto", lineHeight: 1.7 }}>
          Tres herramientas potentes que trabajan juntas para mejorar tu alimentación, recetas y actividad física.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 3 }}>
        {MODULES.map((m) => (
          <Box key={m.title} sx={{
            border: `1.5px solid ${m.color}20`, borderRadius: 4, overflow: "hidden",
            background: "#fff", transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": { transform: "translateY(-6px)", boxShadow: `0 20px 50px ${m.color}15` },
          }}>
            {/* Foto de módulo con overlay — se activa cuando se pase la imagen */}
            {m.photo ? (
              <Box sx={{ position: "relative", height: 180, overflow: "hidden" }}>
                <Box component="img" src={m.photo} alt={m.title} sx={{
                  width: "100%", height: "100%", objectFit: "cover", opacity: 0.45,
                  transition: "transform 0.4s ease, opacity 0.4s ease",
                  ".MuiBox-root:hover &": { transform: "scale(1.04)", opacity: 0.52 },
                }} />
                <Box sx={{ position: "absolute", inset: 0,
                  background: `linear-gradient(160deg, ${m.color}50 0%, ${m.color}10 60%, transparent 100%)` }} />
              </Box>
            ) : (
              <Box sx={{ height: 8, background: `linear-gradient(90deg, ${m.color}30, ${m.color}10)` }} />
            )}

            <Box sx={{ p: 3.5 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: m.bg,
                display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
                <m.Icon sx={{ fontSize: 22, color: m.color }} />
              </Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: C.text, mb: 1, letterSpacing: "-0.3px" }}>
                {m.title}
              </Typography>
              <Typography sx={{ fontSize: 14, color: C.muted, lineHeight: 1.75, mb: 2.5 }}>
                {m.desc}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.8}>
                {m.tags.map(t => (
                  <Box key={t} sx={{ fontSize: 11.5, fontWeight: 700, color: m.color, bgcolor: m.bg,
                    borderRadius: 999, px: 1.4, py: 0.4, border: `1px solid ${m.color}22` }}>
                    {t}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

/* ─── CÓMO FUNCIONA ──────────────────────────────────────────────────────── */
const STEPS = [
  { n: "01", Icon: PersonAddRoundedIcon,     title: "Registrate en segundos",  desc: "Creá tu cuenta gratis con email o Google. Sin tarjeta de crédito, sin compromisos." },
  { n: "02", Icon: AccountCircleRoundedIcon, title: "Completá tu perfil",      desc: "Contanos tu edad, peso, altura, objetivo y nivel de actividad. Nui se adapta a vos." },
  { n: "03", Icon: TrendingUpRoundedIcon,    title: "Empezá a mejorar",        desc: "Analizá alimentos, recibí recetas y entrená con tu plan personalizado desde el día uno." },
];

const HowItWorksSection = () => (
  <Box id="como-funciona" sx={{ background: "#F7FAF9", py: { xs: 9, md: 14 },
    px: { xs: 2.5, sm: 5, md: 8 }, position: "relative", overflow: "hidden" }}>

    {/* Foto de fondo con overlay */}
    <Box aria-hidden sx={{
      position: "absolute", inset: 0,
      backgroundImage: "url(/img/fondoVerde2.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      opacity: 0.10, pointerEvents: "none",
    }} />

    {/* Ilustración decorativa */}
    <Box component="img" src="/img/fondoCell.png" alt="" aria-hidden="true" sx={{
      position: "absolute", top: "50%", left: "-5%",
      transform: "translateY(-50%) scaleX(-1)",
      height: "90%", opacity: 0.05, pointerEvents: "none", filter: "saturate(0)",
    }} />

    <Box sx={{ maxWidth: 900, mx: "auto", position: "relative", zIndex: 1 }}>
      <Box textAlign="center" mb={7}>
        <Typography sx={{ fontSize: { xs: 26, sm: 36 }, fontWeight: 900, color: C.text,
          letterSpacing: "-1px", mb: 2 }}>
          Empezá en <Box component="span" sx={{ color: C.brand }}>3 pasos</Box>
        </Typography>
        <Typography sx={{ fontSize: 16, color: C.muted, lineHeight: 1.7 }}>
          En menos de 2 minutos ya estás usando Nui al 100%.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
        gap: { xs: 3, md: 5 }, position: "relative" }}>
        {/* Línea conectora */}
        <Box sx={{ display: { xs: "none", md: "block" }, position: "absolute",
          top: 36, left: "17%", right: "17%", height: 1,
          background: `linear-gradient(90deg, transparent, ${C.brand}35, transparent)`, zIndex: 0 }} />

        {STEPS.map((s, i) => (
          <Box key={s.n} sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.brand}, ${C.brandLight})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: 2.5, boxShadow: "0 8px 24px rgba(11,94,85,0.22)",
            }}>
              <s.Icon sx={{ fontSize: 28, color: "#fff" }} />
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: C.brand, letterSpacing: "0.1em", mb: 0.8 }}>
              PASO {s.n}
            </Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: C.text, mb: 1, letterSpacing: "-0.3px" }}>
              {s.title}
            </Typography>
            <Typography sx={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
              {s.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

/* ─── PRICING ────────────────────────────────────────────────────────────── */
const PRICING_PLANS = [
  {
    id: "free", name: "Free", Icon: RocketLaunchRoundedIcon,
    price: null, label: "Gratis · 7 días",
    color: C.brand, bg: C.brandSurf, border: "rgba(11,94,85,0.18)",
    highlight: false, badge: null,
    features: ["Todos los módulos sin límite", "Análisis de alimentos ilimitados", "Recetas con IA ilimitadas", "Plan de entrenamiento", "Dashboard completo"],
    cta: "Empezar gratis",
  },
  {
    id: "silver", name: "Silver", Icon: DiamondOutlinedIcon,
    price: 2990, label: "por mes",
    color: "#71879C", bg: "#EEF2F5", border: "rgba(113,135,156,0.22)",
    highlight: false, badge: null,
    features: ["1 análisis por día", "Recetas con IA ilimitadas", "1 plan de entrenamiento", "Historial 30 días", "Dashboard + métricas"],
    cta: "Elegir Silver",
  },
  {
    id: "gold", name: "Gold", Icon: WorkspacePremiumOutlinedIcon,
    price: 5990, label: "por mes",
    color: "#C9952A", bg: "linear-gradient(135deg,#FDF6E3,#FEF9EC)",
    border: "rgba(201,149,42,0.32)",
    highlight: true, badge: "Más popular",
    features: ["Análisis ilimitados por día", "Recetas con IA ilimitadas", "2 planes de entrenamiento", "Historial completo", "Dashboard premium + estadísticas"],
    cta: "Elegir Gold",
  },
];

const PricingSection = ({ onCTA }) => (
  <Box id="precios" sx={{ background: "#fff", py: { xs: 9, md: 14 }, px: { xs: 2.5, sm: 5, md: 8 } }}>
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Box textAlign="center" mb={7}>
        <Typography sx={{ fontSize: { xs: 26, sm: 36 }, fontWeight: 900, color: C.text,
          letterSpacing: "-1px", mb: 2 }}>
          Elegí el plan que<br />
          <Box component="span" sx={{ color: C.brand }}>mejor te quede</Box>
        </Typography>
        <Typography sx={{ fontSize: 16, color: C.muted, lineHeight: 1.7 }}>
          Empezá con 7 días gratis. Cancelá cuando quieras, sin penalidades.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
        gap: 2.5, alignItems: "start" }}>
        {PRICING_PLANS.map((p) => (
          <Box key={p.id} sx={{
            border: `1.5px solid ${p.border}`, borderRadius: 4, background: p.bg, p: 3.5,
            position: "relative",
            transform: p.highlight ? { md: "scale(1.03)" } : "none",
            boxShadow: p.highlight ? `0 20px 60px ${p.color}18` : "0 2px 12px rgba(0,0,0,0.04)",
            transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": {
              transform: p.highlight ? { md: "scale(1.03) translateY(-4px)" } : "translateY(-4px)",
              boxShadow: `0 24px 60px ${p.color}22`,
            },
          }}>
            {p.badge && (
              <Box sx={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                bgcolor: p.color, color: "#fff", fontSize: 11, fontWeight: 800,
                px: 2.5, py: 0.5, borderRadius: 999, whiteSpace: "nowrap",
                boxShadow: `0 4px 12px ${p.color}45` }}>
                {p.badge}
              </Box>
            )}

            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2.5,
                bgcolor: p.id === "gold" ? "rgba(201,149,42,0.12)" : p.id === "silver" ? "rgba(113,135,156,0.12)" : C.brandSurf,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p.Icon sx={{ fontSize: 20, color: p.color }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 900, color: p.color, lineHeight: 1.1 }}>
                  Plan {p.name}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>{p.label}</Typography>
              </Box>
            </Stack>

            <Box mb={2.5}>
              {p.price
                ? <>
                    <Typography component="span" sx={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: "-1px" }}>
                      {formatARS(p.price)}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: 13, color: C.muted, ml: 0.5 }}>/mes</Typography>
                  </>
                : <Typography sx={{ fontSize: 26, fontWeight: 900, color: C.brand }}>Gratis</Typography>
              }
            </Box>

            <Stack spacing={1.1} mb={3}>
              {p.features.map(f => (
                <Stack key={f} direction="row" spacing={1.2} alignItems="flex-start">
                  <CheckRoundedIcon sx={{ fontSize: 15, color: p.color, mt: 0.15, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{f}</Typography>
                </Stack>
              ))}
            </Stack>

            <Button fullWidth onClick={onCTA} variant={p.highlight ? "contained" : "outlined"} sx={{
              textTransform: "none", fontWeight: 800, fontSize: 14,
              borderRadius: 2.5, py: 1.3,
              bgcolor: p.highlight ? p.color : "transparent",
              borderColor: p.color, color: p.highlight ? "#fff" : p.color,
              boxShadow: p.highlight ? `0 4px 16px ${p.color}38` : "none",
              "&:hover": { bgcolor: p.highlight ? "#b8841f" : `${p.color}0E`,
                borderColor: p.color, boxShadow: p.highlight ? `0 6px 20px ${p.color}48` : "none" },
            }}>
              {p.cta}
            </Button>
          </Box>
        ))}
      </Box>

      <Typography sx={{ textAlign: "center", fontSize: 12.5, color: C.muted, mt: 4 }}>
        Pago seguro a través de Mercado Pago · Cancelá cuando quieras
      </Typography>
    </Box>
  </Box>
);

/* ─── CTA FINAL ──────────────────────────────────────────────────────────── */
const FinalCTA = ({ onCTA }) => (
  <Box sx={{
    background: "linear-gradient(135deg, #060F0D 0%, #0B2E28 50%, #0f3d35 100%)",
    py: { xs: 9, md: 13 }, px: { xs: 2.5, sm: 5 },
    textAlign: "center", position: "relative", overflow: "hidden",
  }}>
    {/* Foto de fondo con overlay */}
    <Box aria-hidden sx={{
      position: "absolute", inset: 0,
      backgroundImage: "url(/img/fondoNaranja.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      opacity: 0.09, mixBlendMode: "soft-light", pointerEvents: "none",
    }} />

    <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      width: 700, height: 700, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />

    <Box sx={{ maxWidth: 580, mx: "auto", position: "relative", zIndex: 1 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 800, color: C.heroAccent,
        letterSpacing: "0.15em", mb: 2 }}>
        EMPEZÁ HOY
      </Typography>
      <Typography sx={{ fontSize: { xs: 28, sm: 40 }, fontWeight: 900, color: "#fff",
        letterSpacing: "-1px", lineHeight: 1.15, mb: 2.5 }}>
        7 días completamente gratis.<br />
        <Box component="span" sx={{ color: C.heroAccent }}>Sin tarjeta de crédito.</Box>
      </Typography>
      <Typography sx={{ fontSize: 15.5, color: "rgba(255,255,255,0.50)", lineHeight: 1.7, mb: 4 }}>
        Probá los 3 módulos sin límites y descubrí cómo Nui puede transformar tus hábitos.
      </Typography>
      <Button onClick={onCTA} endIcon={<ArrowForwardRoundedIcon />} sx={{
        bgcolor: C.heroAccent, color: "#fff", fontWeight: 800, fontSize: 16,
        textTransform: "none", px: 4.5, py: 1.6, borderRadius: 3,
        boxShadow: "0 8px 28px rgba(16,185,129,0.38)",
        "&:hover": { bgcolor: "#0ea271", transform: "translateY(-2px)", boxShadow: "0 12px 32px rgba(16,185,129,0.48)" },
        transition: "all 0.2s",
      }}>
        Crear cuenta gratis
      </Button>
    </Box>
  </Box>
);

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */
const LandingFooter = () => (
  <Box sx={{ background: "#060F0D", borderTop: "1px solid rgba(255,255,255,0.05)",
    py: 4, px: { xs: 2.5, sm: 5, md: 8 } }}>
    <Box sx={{ maxWidth: 1100, mx: "auto", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
      <Box component="img" src="/img/logo_landing.png" alt="Nui"
        sx={{ height: 28, opacity: 0.65 }} />
      <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center">
        {[["Privacidad", "/privacidad"], ["Términos", "/terminos"], ["Contacto", "/contact"], ["Precios", "/pricing"]].map(([label, path]) => (
          <Box key={label} component={Link} to={path}
            sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", textDecoration: "none",
              "&:hover": { color: "rgba(255,255,255,0.75)" }, transition: "color 0.2s" }}>
            {label}
          </Box>
        ))}
      </Stack>
      <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>
        © {new Date().getFullYear()} Nui
      </Typography>
    </Box>
  </Box>
);

/* ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToApp = () => navigate("/login");

  return (
    <Box sx={{ overflowX: "hidden" }}>
      <LandingNav scrolled={scrolled} />
      <HeroSection onCTA={goToApp} />
      <MarqueeTicker />
      <ModulesSection />
      <HowItWorksSection />
      <PricingSection onCTA={goToApp} />
      <FinalCTA onCTA={goToApp} />
      <LandingFooter />
    </Box>
  );
};

export default LandingPage;
