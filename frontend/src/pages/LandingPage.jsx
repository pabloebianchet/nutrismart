/**
 * LandingPage — Premium v2
 * Diseño dinámico, secciones luz/oscuro alternadas, CTAs rellenas
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
} from "@mui/material";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EggRoundedIcon from "@mui/icons-material/EggRounded";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import GrainRoundedIcon from "@mui/icons-material/GrainRounded";
import OpacityRoundedIcon from "@mui/icons-material/OpacityRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import GrassRoundedIcon from "@mui/icons-material/GrassRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import { Leaf } from "@phosphor-icons/react";
import { API_URL } from "../config/api";

/* ─── Tokens ──────────────────────────────────────────────────────────────── */
const C = {
  heroBg: "#03211F",
  darkBg: "#042A28",
  brand: "#0B5E55",
  brandMid: "#0f7a6e",
  brandSurf: "#E6F5F3",
  brandBorder: "rgba(11,94,85,0.15)",
  emerald: "#10B981",
  emeraldDark: "#059669",
  mint: "#34D399",
  white: "#FFFFFF",
  cream: "#F8FBFA",
  ink: "#0A1A18",
  textSec: "#3A5C58",
  muted: "#6B8C88",
  danger: "#EF4444",
  amber: "#F59E0B",
};

const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

/* ─── NAV ─────────────────────────────────────────────────────────────────── */
const LandingNav = ({ scrolled }) => {
  const navigate = useNavigate();
  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1900,
        px: { xs: 2.5, sm: 5, md: 8 },
        py: scrolled ? 1.2 : 1.8,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(3,33,31,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <Box
        component="img"
        src="/img/logo_landing.png"
        alt="Nui"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          height: 34,
          cursor: "pointer",
          opacity: 0.9,
          transition: "opacity 0.2s",
          "&:hover": { opacity: 1 },
        }}
      />

      <Stack
        direction="row"
        spacing={4}
        sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
      >
        {[
          ["Características", "#modulos"],
          ["Cómo funciona", "#como-funciona"],
          ["Precios", "#precios"],
        ].map(([label, href]) => (
          <Box
            key={label}
            component="a"
            href={href}
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.60)",
              textDecoration: "none",
              "&:hover": { color: "#fff" },
              transition: "color 0.2s",
            }}
          >
            {label}
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          onClick={() => navigate("/login")}
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.60)",
            textTransform: "none",
            px: 2,
            py: 0.9,
            borderRadius: 2,
            "&:hover": { bgcolor: "rgba(255,255,255,0.07)", color: "#fff" },
          }}
        >
          Iniciar sesión
        </Button>
        <Button
          onClick={() => navigate("/login")}
          sx={{
            fontSize: 13,
            fontWeight: 800,
            textTransform: "none",
            color: "#fff",
            px: 2.5,
            py: 0.9,
            borderRadius: 999,
            bgcolor: C.emerald,
            "&:hover": { bgcolor: C.emeraldDark },
            transition: "all 0.2s",
          }}
        >
          Empezar gratis
        </Button>
      </Stack>
    </Box>
  );
};

/* ─── HERO ────────────────────────────────────────────────────────────────── */
const HeroSection = ({ onCTA }) => (
  <Box
    sx={{
      background: C.heroBg,
      minHeight: { xs: "100svh", md: "100vh" },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      px: { xs: 3, sm: 5, md: 8 },
      pt: { xs: 14, md: 8 },
      pb: { xs: 8, md: 6 },
    }}
  >
    {/* Dot grid texture */}
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage:
          "radial-gradient(rgba(16,185,129,0.07) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    />
    {/* Central glow */}
    <Box
      sx={{
        position: "absolute",
        top: "48%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1000,
        height: 1000,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(16,185,129,0.09) 0%, rgba(11,94,85,0.04) 40%, transparent 68%)",
        pointerEvents: "none",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        bottom: "-8%",
        right: "-4%",
        width: 420,
        height: 420,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(11,94,85,0.10) 0%, transparent 65%)",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        top: "15%",
        left: "-4%",
        width: 340,
        height: 340,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 65%)",
      }}
    />

    <Box
      sx={{
        maxWidth: 860,
        mx: "auto",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Badge */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          border: "1px solid rgba(16,185,129,0.28)",
          borderRadius: 999,
          px: 2.5,
          py: 0.7,
          mb: 4,
          background: "rgba(16,185,129,0.07)",
          animation: "fadeUp 0.5s ease both",
          "@keyframes fadeUp": {
            from: { opacity: 0, transform: "translateY(20px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        <Box
          sx={{
            width: 6,
                        height: 6,
            borderRadius: "50%",
            bgcolor: C.emerald,
            animation: "pulse 2s ease infinite",
            "@keyframes pulse": {
              "0%,100%": { opacity: 1 },
              "50%": { opacity: 0.35 },
            },
          }}
        />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: C.emerald,
            letterSpacing: "0.03em",
            }}
        >
          Análisis nutricional con IA · Gratis 7 días
        </Typography>
      </Box>

      {/* H1 */}
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 46, sm: 64, md: 80, lg: 92 },
          fontWeight: 900,
          color: "#fff",
          lineHeight: 1.0,
          letterSpacing: { xs: "-2px", md: "-3.5px" },
          mb: 3.5,
          animation: "fadeUp 0.6s 0.1s ease both",
        }}
      >
        Comé mejor.
        <br />
        Entrenás mejor.
        <br />
        <Box
          component="span"
          sx={{
            background: `linear-gradient(130deg, ${C.emerald} 0%, ${C.mint} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Vivís mejor.
        </Box>
      </Typography>

      {/* Subtitle */}
      <Typography
        sx={{
          fontSize: { xs: 16, sm: 18 },
          color: "rgba(255,255,255,0.48)",
          lineHeight: 1.85,
          maxWidth: 540,
          mx: "auto",
          mb: 5.5,
          animation: "fadeUp 0.6s 0.2s ease both",
        }}
      >
        Nui analiza tus alimentos con inteligencia artificial, genera recetas
        saludables y crea tu plan de entrenamiento — todo adaptado a vos.
      </Typography>

      {/* CTAs */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        sx={{ mb: 8, animation: "fadeUp 0.6s 0.3s ease both" }}
      >
        <Button
          onClick={onCTA}
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            bgcolor: C.emerald,
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            textTransform: "none",
            px: 4.5,
            py: 1.7,
            borderRadius: 999,
            boxShadow: "none",
            "&:hover": {
              bgcolor: C.emeraldDark,
              boxShadow: "none",
              transform: "translateY(-2px)",
            },
            transition: "all 0.25s",
          }}
        >
          Empezar gratis — 7 días
        </Button>
        <Button
          onClick={onCTA}
          sx={{
            color: "rgba(255,255,255,0.65)",
            fontWeight: 600,
            fontSize: 15,
            textTransform: "none",
            px: 4,
            py: 1.7,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.05)",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.22)",
            },
            transition: "all 0.2s",
          }}
        >
          Iniciar sesión
        </Button>
      </Stack>

      {/* Stats */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        divider={
          <Box
            sx={{
              width: "1px",
              height: "28px",
              bgcolor: "rgba(255,255,255,0.10)",
              flexShrink: 0,
            }}
          />
        }
        spacing={{ xs: 3, sm: 5 }}
        sx={{ animation: "fadeUp 0.6s 0.4s ease both" }}
      >
        {[
          ["3", "módulos IA"],
          ["7 días", "prueba gratis"],
          ["100%", "personalizado"],
        ].map(([val, label]) => (
          <Box key={label} textAlign="center">
            <Typography
              sx={{
                fontSize: { xs: 24, sm: 30 },
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {val}
            </Typography>
            <Typography
              sx={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.32)",
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
);

/* ─── TICKER ──────────────────────────────────────────────────────────────── */
const MarqueeTicker = () => {
  const items = [
    "ANÁLISIS NUTRICIONAL",
    "ALIMENTOS ULTRAPROCESADOS",
    "CLASIFICACIÓN NOVA",
    "RUTINA DE HIPERTROFIA",
    "ENTRENAMIENTO RUNNING",
    "PLAN DE CALISTENIA",
    "LISTA DE COMPRAS IA",
    "RECETAS CON IA",
    "NUTRICIONISTA IA",
    "TABLA NUTRICIONAL",
    "NUI",
    "MICROBIOTA",
    "PERSONAL TRAINER",
    "NUTRICIÓN INTELIGENTE",
  ];
  const repeated = [...items, ...items];
  return (
    <Box
      sx={{
        background: C.heroBg,
        borderTop: "1px solid rgba(16,185,129,0.12)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        py: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 4,
          width: "max-content",
          animation: "marquee 30s linear infinite",
          "@keyframes marquee": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(-50%)" },
          },
        }}
      >
        {repeated.map((item, i) => (
          <Stack
            key={i}
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ flexShrink: 0 }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(255,255,255,0.22)",
                letterSpacing: "0.14em",
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </Typography>
            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                bgcolor: C.emerald,
                opacity: 0.5,
              }}
            />
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

/* ─── POR QUÉ IMPORTA — SECCIÓN CLARA ────────────────────────────────────── */
const FACTS = [
  {
    stat: "70%",
    title: "de los productos envasados son ultraprocesados",
    desc: "La mayoría de lo que encontrás en el supermercado está diseñado para maximizar sabor y palatabilidad, no tu salud.",
    color: C.danger,
    bg: "#FFF1F1",
  },
  {
    stat: "+5",
    title: "ingredientes no reconocibles = señal de alerta NOVA",
    desc: "Más de cinco aditivos que no reconocés clasifican el producto como Grupo 4 en la escala NOVA internacional.",
    color: C.brand,
    bg: C.brandSurf,
  },
  {
    stat: "↑3×",
    title: "mayor riesgo de sobrepeso y enfermedades crónicas",
    desc: "El consumo frecuente altera la microbiota intestinal y el metabolismo, generando riesgos a largo plazo.",
    color: C.emerald,
    bg: "#ECFDF5",
  },
];

const WhyMattersSection = ({ onCTA }) => (
  <Box
    sx={{
      background: C.white,
      py: { xs: 9, md: 14 },
      px: { xs: 2.5, sm: 5, md: 8 },
    }}
  >
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Box textAlign="center" mb={8}>
        <Box
          sx={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 800,
            color: C.danger,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            bgcolor: "#FFF1F1",
            border: "1px solid rgba(239,68,68,0.18)",
            borderRadius: 999,
            px: 2,
            py: 0.6,
            mb: 2.5,
          }}
        >
          El problema que no se ve
        </Box>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 30, sm: 46 },
            fontWeight: 900,
            color: C.ink,
            letterSpacing: { xs: "-1px", sm: "-2px" },
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          El 70% de lo que comprás en el supermercado
          <br />
          <Box component="span" sx={{ color: C.danger }}>
            es ultraprocesado
          </Box>
        </Typography>
        <Typography
          sx={{
            fontSize: 17,
            color: C.muted,
            lineHeight: 1.8,
            maxWidth: 560,
            mx: "auto",
          }}
        >
          Estos productos son más dulces, salados y grasos, con menos vitaminas
          y fibra. Identificarlos no siempre es fácil — Nui lo hace por vos al
          instante.
        </Typography>
      </Box>

      {/* Fact cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
          gap: 3,
          mb: 8,
        }}
      >
        {FACTS.map((f) => (
          <Box
            key={f.stat}
            sx={{
              bgcolor: f.bg,
              borderRadius: 5,
              p: 4,
              border: `1.5px solid ${f.color}18`,
              transition: "transform 0.22s, box-shadow 0.22s",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: `0 20px 48px ${f.color}14`,
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 60,
                fontWeight: 900,
                color: f.color,
                lineHeight: 1,
                mb: 1.5,
              }}
            >
              {f.stat}
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 800,
                color: C.ink,
                mb: 1,
                lineHeight: 1.3,
              }}
            >
              {f.title}
            </Typography>
            <Typography
              sx={{ fontSize: 14, color: C.textSec, lineHeight: 1.8 }}
            >
              {f.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* NOVA strip — fondo oscuro dentro de sección clara */}
      <Box
        sx={{
          bgcolor: C.ink,
          borderRadius: 5,
          p: { xs: 3, md: 4.5 },
          mb: 7,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-30%",
            right: "-3%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            pointerEvents: "none",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 65%)",
          }}
        />
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            color: C.emerald,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            mb: 3,
          }}
        >
          Clasificación NOVA — El estándar internacional
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" },
            gap: 1.5,
          }}
        >
          {[
            {
              grupo: "Grupo 1",
              label: "Frescos o mínimamente procesados",
              ej: "Frutas, verduras, huevos, carnes",
              ok: true,
            },
            {
              grupo: "Grupo 2",
              label: "Ingredientes culinarios",
              ej: "Aceites, sal, azúcar, vinagre",
              ok: true,
            },
            {
              grupo: "Grupo 3",
              label: "Alimentos procesados",
              ej: "Conservas, queso, pan, embutidos",
              ok: true,
            },
            {
              grupo: "Grupo 4",
              label: "Ultraprocesados",
              ej: "Snacks, cereales, refrescos, galletas",
              ok: false,
            },
          ].map((g) => (
            <Box
              key={g.grupo}
              sx={{
                borderRadius: 4,
                p: 2.5,
                background: g.ok
                  ? "linear-gradient(145deg, rgba(16,185,129,0.10), rgba(16,185,129,0.04))"
                  : "linear-gradient(145deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))",
                border: `1px solid ${g.ok ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.18)"}`,
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-2px)" },
              }}
            >
              {/* Pill */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  bgcolor: g.ok
                    ? "rgba(16,185,129,0.14)"
                    : "rgba(239,68,68,0.14)",
                  borderRadius: 999,
                  px: 1.2,
                  py: 0.3,
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: g.ok ? C.emerald : C.danger,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: g.ok ? C.emerald : C.danger,
                    letterSpacing: "0.04em",
                  }}
                >
                  {g.grupo}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#fff",
                  mb: 0.6,
                  lineHeight: 1.35,
                }}
              >
                {g.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  lineHeight: 1.65,
                }}
              >
                {g.ej}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box textAlign="center">
        <Button
          onClick={onCTA}
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            bgcolor: C.emerald,
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            textTransform: "none",
            px: 4.5,
            py: 1.5,
            borderRadius: 999,
            boxShadow: "none",
            "&:hover": {
              bgcolor: C.emeraldDark,
              transform: "translateY(-2px)",
              boxShadow: "none",
            },
            transition: "all 0.22s",
          }}
        >
          Analizá tu primer producto gratis
        </Button>
      </Box>
    </Box>
  </Box>
);

/* ─── MÓDULOS ─────────────────────────────────────────────────────────────── */
const MODULES = [
  {
    Icon: SearchRoundedIcon,
    title: "Análisis de alimentos",
    desc: "Fotografiá la tabla nutricional y los ingredientes del producto. Obtenés al instante su clasificación NOVA, macros, aditivos y recomendaciones personalizadas.",
    color: C.brand,
    bg: C.brandSurf,
    tags: ["Clasificación NOVA", "Macros", "Aditivos", "Score nutricional"],
    photo: "/img/analisisIA.jpg",
  },
  {
    Icon: RestaurantMenuRoundedIcon,
    title: "Recetas con IA",
    desc: "Generá recetas saludables adaptadas a tu perfil y objetivo. Fit, Hipertrofia o Rápidas — con ingredientes reales, pasos detallados y lista de compras automática.",
    color: "#7C3AED",
    bg: "#F5F3FF",
    tags: [
      "Personalizadas",
      "Ingredientes reales",
      "Lista de compras",
      "Favoritas",
    ],
    photo: "/img/recetasIA.jpg",
  },
  {
    Icon: FitnessCenterRoundedIcon,
    title: "Entrenamiento personalizado",
    desc: "Generá tu plan de entrenamiento: Hipertrofia, Fit o Calistenia, en Gym o en Casa. Seguí tu progreso sesión a sesión con registro completo.",
    color: "#D97706",
    bg: "#FFFBEB",
    tags: ["Hipertrofia", "Fit", "Calistenia", "Gym", "Casa"],
    photo:
      "/img/Start%20every%20day%20strong!%20Build%20muscle%2C%20burn%20fat%E2%80%A6.jpg",
  },
  {
    Icon: TrendingUpRoundedIcon,
    title: "Balance energético",
    desc: "Registrá lo que comés y tu actividad del día por voz. La IA calcula tu objetivo calórico según tu metabolismo, nivel de actividad y meta — bajar peso, mantener o ganar músculo.",
    color: "#0B5E55",
    bg: "#E6F5F3",
    tags: [
      "Por voz",
      "TDEE",
      "Déficit / Superávit",
      "Macros",
      "Historial mensual",
    ],
    photo: "/img/balance.jpg",
  },
];

const ModulesSection = () => (
  <Box
    id="modulos"
    sx={{
      background: C.cream,
      py: { xs: 9, md: 14 },
      px: { xs: 2.5, sm: 5, md: 8 },
    }}
  >
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Box textAlign="center" mb={8}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            fontSize: 11,
            fontWeight: 800,
            color: C.brand,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            bgcolor: C.brandSurf,
            border: `1px solid ${C.brandBorder}`,
            borderRadius: 999,
            px: 2,
            py: 0.6,
            mb: 2.5,
          }}
        >
          <BoltRoundedIcon sx={{ fontSize: 13 }} /> 4 módulos integrados
        </Box>
        <Typography
          sx={{
            fontSize: { xs: 30, sm: 46 },
            fontWeight: 900,
            color: C.ink,
            letterSpacing: { xs: "-1px", sm: "-2px" },
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          Todo lo que necesitás
          <br />
          <Box component="span" sx={{ color: C.brand }}>
            en un solo lugar
          </Box>
        </Typography>
        <Typography
          sx={{
            fontSize: 17,
            color: C.muted,
            maxWidth: 520,
            mx: "auto",
            lineHeight: 1.8,
          }}
        >
          Cuatro herramientas integradas que trabajan juntas: analizás lo que
          comés, cocinás mejor, entrenás con un plan personalizado y controlás
          tu balance calórico en tiempo real.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4,1fr)",
          },
          gap: 3,
        }}
      >
        {MODULES.map((m) => (
          <Box
            key={m.title}
            sx={{
              bgcolor: C.white,
              border: `1.5px solid ${m.color}15`,
              borderRadius: 5,
              overflow: "hidden",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              transition: "transform 0.25s, box-shadow 0.25s",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: `0 28px 60px ${m.color}18`,
              },
            }}
          >
            {(m.photo || m.gradient) && (
              <Box
                sx={{ position: "relative", height: 200, overflow: "hidden" }}
              >
                {m.photo ? (
                  <Box
                    component="img"
                    src={m.photo}
                    alt={m.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                      ".MuiBox-root:hover &": { transform: "scale(1.06)" },
                    }}
                  />
                ) : (
                  /* Gradiente decorativo para módulos sin foto */
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      background: m.gradient,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Emojis decorativos flotantes */}
                    {(m.gradientEmoji || []).map((emoji, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          position: "absolute",
                          fontSize:
                            idx === 0
                              ? 56
                              : idx === 1
                                ? 40
                                : idx === 2
                                  ? 44
                                  : 36,
                          opacity: 0.18,
                          top:
                            idx === 0
                              ? "10%"
                              : idx === 1
                                ? "40%"
                                : idx === 2
                                  ? "15%"
                                  : "55%",
                          left:
                            idx === 0
                              ? "5%"
                              : idx === 1
                                ? "60%"
                                : idx === 2
                                  ? "50%"
                                  : "20%",
                          userSelect: "none",
                          transform: `rotate(${[-8, 12, -5, 8][idx]}deg)`,
                        }}
                      >
                        {emoji}
                      </Typography>
                    ))}
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)",
                      }}
                    />
                  </Box>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.42) 100%)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 14,
                    left: 16,
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: "rgba(255,255,255,0.90)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
                  }}
                >
                  <m.Icon sx={{ fontSize: 20, color: m.color }} />
                </Box>
              </Box>
            )}
            <Box sx={{ p: 3.5 }}>
              <Typography
                sx={{
                  fontSize: 19,
                  fontWeight: 900,
                  color: C.ink,
                  mb: 1,
                  letterSpacing: "-0.4px",
                }}
              >
                {m.title}
              </Typography>
              <Typography
                sx={{ fontSize: 14, color: C.muted, lineHeight: 1.8, mb: 2.5 }}
              >
                {m.desc}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.8}>
                {m.tags.map((t) => (
                  <Box
                    key={t}
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: m.color,
                      bgcolor: m.bg,
                      borderRadius: 999,
                      px: 1.5,
                      py: 0.45,
                      border: `1px solid ${m.color}20`,
                    }}
                  >
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

/* ─── LISTA DE COMPRAS FEATURE ───────────────────────────────────────────── */
const SHOPPING_STEPS = [
  {
    Icon: RestaurantRoundedIcon,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "rgba(124,58,237,0.14)",
    title: "Generás una receta",
    desc: "Elegís el tipo de plato — Fit, Hipertrofia o Rápidas — y la IA genera ingredientes y pasos al instante.",
  },
  {
    Icon: ShoppingCartRoundedIcon,
    color: C.brand,
    bg: C.brandSurf,
    border: C.brandBorder,
    title: "Agregás con un tap",
    desc: '"Agregar a mi lista" suma todos los ingredientes necesarios. Sin copiar, sin escribir nada.',
  },
  {
    Icon: FormatListNumberedRoundedIcon,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "rgba(217,119,6,0.14)",
    title: "Se acumula solo",
    desc: "¿Una receta lleva 3 huevos y otra 2? Nui pone 5 huevos — sin duplicados, sin confusiones.",
  },
  {
    Icon: EditRoundedIcon,
    color: "#0891B2",
    bg: "#F0FDFF",
    border: "rgba(8,145,178,0.14)",
    title: "Agregás lo que quieras",
    desc: "¿Jabón, papel, yogur? Escribilo a mano y se suma a la misma lista. Todo en un lugar.",
  },
];

/* ─── Mock visual de la lista ── */
const MOCK_ITEMS = [
  {
    Icon: EggRoundedIcon,
    label: "5 huevos",
    source: "2 recetas",
    checked: true,
  },
  {
    Icon: LunchDiningRoundedIcon,
    label: "300g pollo",
    source: "Taco de Pollo",
    checked: true,
  },
  {
    Icon: GrainRoundedIcon,
    label: "2 tortillas maíz",
    source: "Taco de Pollo",
    checked: false,
  },
  {
    Icon: OpacityRoundedIcon,
    label: "1 cda aceite oliva",
    source: "Ensalada Fit",
    checked: false,
  },
  {
    Icon: SpaRoundedIcon,
    label: "1 cebolla",
    source: "Manual",
    checked: false,
  },
  {
    Icon: GrassRoundedIcon,
    label: "200g brócoli",
    source: "Salteado Fit",
    checked: false,
  },
];

const ShoppingListFeatureSection = ({ onCTA }) => (
  <Box
    sx={{
      background: C.white,
      py: { xs: 9, md: 14 },
      px: { xs: 2.5, sm: 5, md: 8 },
    }}
  >
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* ── Header ── */}
      <Box textAlign="center" mb={{ xs: 6, md: 9 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            fontSize: 11,
            fontWeight: 800,
            color: C.brand,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            bgcolor: C.brandSurf,
            border: `1px solid ${C.brandBorder}`,
            borderRadius: 999,
            px: 2,
            py: 0.6,
            mb: 2.5,
          }}
        >
          <ShoppingCartRoundedIcon sx={{ fontSize: 13 }} /> Nueva funcionalidad
        </Box>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 30, sm: 46 },
            fontWeight: 900,
            color: C.ink,
            letterSpacing: { xs: "-1px", sm: "-2px" },
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          Tu super, organizado
          <br />
          <Box component="span" sx={{ color: C.brand }}>
            antes de salir de casa
          </Box>
        </Typography>
        <Typography
          sx={{
            fontSize: 17,
            color: C.muted,
            maxWidth: 520,
            mx: "auto",
            lineHeight: 1.8,
          }}
        >
          Generás recetas y Nui arma tu lista de compras automáticamente.
          Acumulativa, sin repetidos, con opción de agregar lo que quieras a
          mano.
        </Typography>
      </Box>

      {/* ── Layout 2 columnas: steps izq + mock der ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 6, md: 8 },
          alignItems: "center",
          mb: { xs: 6, md: 10 },
        }}
      >
        {/* Columna izquierda: pasos */}
        <Box>
          <Stack spacing={3}>
            {SHOPPING_STEPS.map((step, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={2.5}
                alignItems="flex-start"
              >
                {/* Icono */}
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    flexShrink: 0,
                    bgcolor: step.bg,
                    border: `1.5px solid ${step.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <step.Icon sx={{ fontSize: 24, color: step.color }} />
                </Box>
                {/* Texto */}
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={0.4}
                  >
                    <Box
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: step.color,
                        bgcolor: step.bg,
                        border: `1px solid ${step.border}`,
                        borderRadius: 999,
                        px: 1.2,
                        py: 0.2,
                      }}
                    >
                      Paso {i + 1}
                    </Box>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: C.ink,
                      mb: 0.5,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13.5, color: C.muted, lineHeight: 1.75 }}
                  >
                    {step.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          <Button
            onClick={onCTA}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              mt: 5,
              bgcolor: C.emerald,
              color: "#fff",
              fontWeight: 800,
              fontSize: 14.5,
              textTransform: "none",
              px: 4,
              py: 1.4,
              borderRadius: 999,
              boxShadow: "none",
              "&:hover": {
                bgcolor: C.emeraldDark,
                transform: "translateY(-2px)",
                boxShadow: "none",
              },
              transition: "all 0.22s",
            }}
          >
            Probá la lista de compras gratis
          </Button>
        </Box>

        {/* Columna derecha: mock UI */}
        <Box sx={{ position: "relative" }}>
          {/* Glow de fondo */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 460,
              height: 460,
              borderRadius: "50%",
              pointerEvents: "none",
              background:
                "radial-gradient(circle, rgba(11,94,85,0.07) 0%, transparent 65%)",
            }}
          />

          {/* Phone frame */}
          <Box
            sx={{
              position: "relative",
              mx: "auto",
              maxWidth: 340,
              bgcolor: C.white,
              borderRadius: 6,
              border: "1.5px solid rgba(11,94,85,0.12)",
              boxShadow:
                "0 24px 64px rgba(11,94,85,0.12), 0 4px 16px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* App header simulado */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
                px: 2.5,
                py: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={0.4}>
                <ShoppingCartRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Mi lista de compras
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)" }}
              >
                4 pendientes · 2 comprados
              </Typography>
              {/* Progress bar */}
              <Box
                sx={{
                  mt: 1.2,
                  bgcolor: "rgba(255,255,255,0.18)",
                  borderRadius: 999,
                  height: 4,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: "33%",
                    bgcolor: "#34D399",
                    borderRadius: 999,
                  }}
                />
              </Box>
            </Box>

            {/* Items simulados */}
            <Box sx={{ px: 1.5, py: 1.5 }}>
              {MOCK_ITEMS.map((item, i) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  spacing={1.2}
                  sx={{
                    py: 1,
                    px: 0.5,
                    borderRadius: 2,
                    opacity: item.checked ? 0.42 : 1,
                    borderBottom:
                      i < MOCK_ITEMS.length - 1
                        ? "1px solid rgba(11,94,85,0.06)"
                        : "none",
                  }}
                >
                  {/* Checkbox simulado */}
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: `2px solid ${item.checked ? "#0B5E55" : "rgba(11,94,85,0.25)"}`,
                      bgcolor: item.checked ? "#0B5E55" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.checked && (
                      <Typography
                        sx={{ fontSize: 9, color: "#fff", lineHeight: 1 }}
                      >
                        ✓
                      </Typography>
                    )}
                  </Box>
                  <item.Icon
                    sx={{
                      fontSize: 15,
                      lineHeight: 1,
                      color: "#0B5E55",
                      flexShrink: 0,
                    }}
                  />
                  <Box flex={1} minWidth={0}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0F2420",
                        textDecoration: item.checked ? "line-through" : "none",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 10.5, color: "#8AADAA", lineHeight: 1 }}
                    >
                      {item.source}
                    </Typography>
                  </Box>
                </Stack>
              ))}

              {/* Add manual simulado */}
              <Box
                sx={{
                  mt: 1,
                  mx: 0.5,
                  px: 1.8,
                  py: 1.2,
                  borderRadius: 2.5,
                  bgcolor: C.brandSurf,
                  border: `1.5px dashed rgba(11,94,85,0.22)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AddRoundedIcon sx={{ fontSize: 16, color: C.brand }} />
                <Typography
                  sx={{ fontSize: 12.5, color: C.brand, fontWeight: 600 }}
                >
                  Agregar item manualmente…
                </Typography>
              </Box>
            </Box>

            {/* Footer simulado */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderTop: "1px solid rgba(11,94,85,0.07)",
                bgcolor: "#FAFCFB",
              }}
            >
              <Box
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: "rgba(11,94,85,0.07)",
                }}
              >
                <Typography
                  sx={{ fontSize: 12.5, fontWeight: 700, color: C.brand }}
                >
                  Quitar comprados (2)
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Badge flotante "Auto-suma" */}
          <Box
            sx={{
              position: "absolute",
              top: { xs: "auto", md: "18%" },
              bottom: { xs: -20, md: "auto" },
              right: { xs: "8%", md: -24 },
              bgcolor: "#fff",
              borderRadius: 4,
              px: 2,
              py: 1.5,
              boxShadow: "0 8px 28px rgba(11,94,85,0.14)",
              border: "1.5px solid rgba(11,94,85,0.10)",
              minWidth: 160,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <AutorenewRoundedIcon sx={{ fontSize: 16, color: C.emerald }} />
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: C.ink }}>
                Suma automática
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
              3 huevos + 2 huevos
            </Typography>
            <Stack direction="row" spacing={0.8} alignItems="center" mt={0.5}>
              <Typography sx={{ fontSize: 11, color: C.muted }}>= </Typography>
              <Box
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.brand,
                  bgcolor: C.brandSurf,
                  borderRadius: 999,
                  px: 1.2,
                  py: 0.2,
                }}
              >
                5 huevos ✓
              </Box>
            </Stack>
          </Box>

          {/* Badge flotante "Desde recetas" */}
          <Box
            sx={{
              position: "absolute",
              top: { xs: "auto", md: "62%" },
              bottom: { xs: "auto", md: "auto" },
              left: { xs: "auto", md: -32 },
              display: { xs: "none", md: "block" },
              bgcolor: "#fff",
              borderRadius: 4,
              px: 2,
              py: 1.5,
              boxShadow: "0 8px 28px rgba(124,58,237,0.12)",
              border: "1.5px solid rgba(124,58,237,0.12)",
              minWidth: 148,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <RestaurantRoundedIcon sx={{ fontSize: 15, color: "#7C3AED" }} />
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: C.ink }}>
                Desde la receta
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
              1 tap agrega todos los ingredientes
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Strip de beneficios ── */}
      <Box
        sx={{
          bgcolor: C.ink,
          borderRadius: 5,
          p: { xs: 3, md: 4 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 3,
        }}
      >
        {[
          {
            Icon: AutorenewRoundedIcon,
            title: "Sin duplicados",
            desc: "Ingredientes iguales de distintas recetas se suman, no se repiten.",
          },
          {
            Icon: EditRoundedIcon,
            title: "Agregar a mano",
            desc: "Sumá cualquier item manualmente: limpieza, snacks, lo que sea.",
          },
          {
            Icon: CheckRoundedIcon,
            title: "Check al comprar",
            desc: "Marcá cada item mientras comprás. La app recuerda tu progreso.",
          },
          {
            Icon: PhoneIphoneRoundedIcon,
            title: "Siempre en tu cel",
            desc: "Accedé desde el Dashboard o desde cualquier receta generada.",
          },
        ].map((b) => (
          <Box key={b.title}>
            <b.Icon
              sx={{ fontSize: 28, mb: 1.2, lineHeight: 1, color: "#fff" }}
            />

            <Typography
              sx={{ fontSize: 14, fontWeight: 800, color: "#fff", mb: 0.6 }}
            >
              {b.title}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.42)",
                lineHeight: 1.65,
              }}
            >
              {b.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

/* ─── SECCIÓN DE VALOR — FONDO VERDE ─────────────────────────────────────── */
const TRAINING_TYPES = [
  "Rutina de hipertrofia",
  "Plan de calistenia",
  "Entrenamiento Fit",
  "Entrenamiento en casa",
  "Recetas saludables con IA",
  "Lista de compras automática",
  "Análisis NOVA de productos",
];

const CostComparisonSection = ({ onCTA }) => (
  <Box
    sx={{
      background: `linear-gradient(140deg, ${C.brand} 0%, ${C.brandMid} 100%)`,
      py: { xs: 9, md: 13 },
      px: { xs: 2.5, sm: 5, md: 8 },
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        top: "-20%",
        right: "-4%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 60%)",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        bottom: "-15%",
        left: "-4%",
        width: 400,
        height: 400,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 60%)",
      }}
    />

    <Box sx={{ maxWidth: 800, mx: "auto", position: "relative", zIndex: 1 }}>
      <Box textAlign="center" mb={6}>
        <Box
          sx={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 800,
            color: C.mint,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            bgcolor: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            px: 2,
            py: 0.6,
            mb: 2.5,
          }}
        >
          Todo en un solo lugar
        </Box>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 30, sm: 46 },
            fontWeight: 900,
            color: "#fff",
            letterSpacing: { xs: "-1px", sm: "-2px" },
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          Tu asistente de salud
          <br />
          <Box component="span" sx={{ color: C.mint }}>
            siempre disponible
          </Box>
        </Typography>
        <Typography
          sx={{
            fontSize: 17,
            color: "rgba(255,255,255,0.60)",
            maxWidth: 480,
            mx: "auto",
            lineHeight: 1.8,
          }}
        >
          Análisis nutricional, recetas personalizadas y plan de entrenamiento
          adaptado a tus metas, disponibles las 24 hs desde tu celular.
        </Typography>
      </Box>

      {/* Card Nui */}
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.16)",
          borderRadius: 5,
          p: { xs: 3.5, md: 5 },
          mb: 5,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 3.5, sm: 6 }}
          alignItems="flex-start"
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 0.5,
              }}
            >
              Plan Gold
            </Typography>
            <Typography
              sx={{
                fontSize: 54,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
                mb: 0.3,
              }}
            >
              $8.980
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.40)" }}>
              por mes · cancelá cuando quieras
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            {[
              "Análisis nutricional ilimitado",
              "Recetas saludables con IA (Fit, Hipertrofia, Rápidas)",
              "Balance energético diario por voz + historial mensual",
              "2 planes de entrenamiento personalizados",
              "Lista de compras automática desde tus recetas",
            ].map((f) => (
              <Stack
                key={f}
                direction="row"
                spacing={1.5}
                alignItems="center"
                mb={1.3}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    bgcolor: "rgba(16,185,129,0.22)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckRoundedIcon sx={{ fontSize: 13, color: C.emerald }} />
                </Box>
                <Typography
                  sx={{ fontSize: 14.5, color: "rgba(255,255,255,0.85)" }}
                >
                  {f}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Stack>
      </Box>

      {/* Tipos de entrenamiento */}
      <Box textAlign="center" mb={5}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.40)",
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            mb: 2,
          }}
        >
          Objetivos disponibles
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
          {TRAINING_TYPES.map((t) => (
            <Box
              key={t}
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.78)",
                bgcolor: "rgba(255,255,255,0.09)",
                borderRadius: 999,
                px: 2,
                py: 0.7,
                border: "1px solid rgba(255,255,255,0.13)",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)", color: "#fff" },
              }}
            >
              {t}
            </Box>
          ))}
        </Stack>
      </Box>

      <Box textAlign="center">
        <Button
          onClick={onCTA}
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            bgcolor: "#fff",
            color: C.brand,
            fontWeight: 800,
            fontSize: 15,
            textTransform: "none",
            px: 4.5,
            py: 1.5,
            borderRadius: 999,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.92)",
              transform: "translateY(-2px)",
              boxShadow: "none",
            },
            transition: "all 0.22s",
          }}
        >
          Probá gratis 7 días
        </Button>
      </Box>
    </Box>
  </Box>
);

/* ─── CÓMO FUNCIONA ───────────────────────────────────────────────────────── */
const STEPS = [
  {
    n: "01",
    Icon: PersonAddRoundedIcon,
    title: "Registrate en segundos",
    desc: "Creá tu cuenta gratis con email o Google. Sin tarjeta de crédito. En 30 segundos ya estás usando Nui al 100% durante 7 días.",
  },
  {
    n: "02",
    Icon: AccountCircleRoundedIcon,
    title: "Configurá tu perfil y objetivo",
    desc: "Ingresá tu edad, peso, altura y nivel de actividad. Elegí si querés bajar de peso, mantenerte o ganar músculo — Nui calcula tu objetivo calórico diario automáticamente.",
  },
  {
    n: "03",
    Icon: TrendingUpRoundedIcon,
    title: "Controlá tu salud en tiempo real",
    desc: "Analizá alimentos con la cámara, registrá comidas y actividad por voz, entrená con tu plan personalizado y seguí tu balance energético día a día — todo integrado.",
  },
];

const HowItWorksSection = () => (
  <Box
    id="como-funciona"
    sx={{
      background: C.white,
      py: { xs: 9, md: 14 },
      px: { xs: 2.5, sm: 5, md: 8 },
    }}
  >
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Box textAlign="center" mb={8}>
        <Box
          sx={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 800,
            color: C.brand,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            bgcolor: C.brandSurf,
            border: `1px solid ${C.brandBorder}`,
            borderRadius: 999,
            px: 2,
            py: 0.6,
            mb: 2.5,
          }}
        >
          Así funciona
        </Box>
        <Typography
          sx={{
            fontSize: { xs: 30, sm: 46 },
            fontWeight: 900,
            color: C.ink,
            letterSpacing: { xs: "-1px", sm: "-2px" },
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          Empezá en{" "}
          <Box component="span" sx={{ color: C.brand }}>
            3 pasos
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 17, color: C.muted, lineHeight: 1.8 }}>
          En menos de 2 minutos ya estás usando Nui al 100%.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
          gap: 3,
        }}
      >
        {STEPS.map((s, i) => (
          <Box
            key={s.n}
            sx={{
              position: "relative",
              bgcolor: i === 1 ? C.brand : C.cream,
              border: `1.5px solid ${i === 1 ? C.brand : "rgba(0,0,0,0.05)"}`,
              borderRadius: 5,
              p: 4,
              boxShadow:
                i === 1
                  ? `0 20px 52px rgba(11,94,85,0.22)`
                  : "0 2px 12px rgba(0,0,0,0.04)",
              transition: "transform 0.25s, box-shadow 0.25s",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow:
                  i === 1
                    ? `0 28px 60px rgba(11,94,85,0.30)`
                    : "0 18px 44px rgba(0,0,0,0.09)",
              },
              overflow: "hidden",
            }}
          >
            {/* Big decorative number */}
            <Typography
              sx={{
                fontSize: 80,
                fontWeight: 900,
                lineHeight: 1,
                color:
                  i === 1 ? "rgba(255,255,255,0.08)" : "rgba(11,94,85,0.07)",
                position: "absolute",
                top: 12,
                right: 16,
                letterSpacing: "-4px",
                pointerEvents: "none",
              }}
            >
              {s.n}
            </Typography>

            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: i === 1 ? "rgba(255,255,255,0.13)" : C.brandSurf,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <s.Icon
                sx={{ fontSize: 24, color: i === 1 ? "#fff" : C.brand }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.10em",
                color: i === 1 ? C.mint : C.emerald,
                textTransform: "uppercase",
                mb: 1,
              }}
            >
              Paso {s.n}
            </Typography>
            <Typography
              sx={{
                fontSize: 19,
                fontWeight: 900,
                color: i === 1 ? "#fff" : C.ink,
                mb: 1.5,
                letterSpacing: "-0.5px",
              }}
            >
              {s.title}
            </Typography>
            <Typography
              sx={{
                fontSize: 14.5,
                color: i === 1 ? "rgba(255,255,255,0.62)" : C.muted,
                lineHeight: 1.8,
              }}
            >
              {s.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

/* ─── PRICING ─────────────────────────────────────────────────────────────── */
const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    Icon: RocketLaunchRoundedIcon,
    price: null,
    sub: "Gratis · 7 días",
    color: C.brand,
    border: C.brandBorder,
    bg: C.white,
    highlight: false,
    badge: null,
    features: [
      "Todos los módulos sin límite durante 7 días",
      "Análisis ilimitados",
      "Recetas con IA ilimitadas",
      "Plan de entrenamiento personalizado",
      "Balance energético diario acumulado (7 días)",
      "Dashboard completo",
    ],
    cta: "Empezar gratis",
  },
  {
    id: "silver",
    name: "Silver",
    Icon: DiamondOutlinedIcon,
    price: 6890,
    sub: "por mes",
    color: "#71879C",
    border: "rgba(113,135,156,0.18)",
    bg: "#F8FAFC",
    highlight: false,
    badge: null,
    features: [
      "1 análisis de alimentos por día",
      "Recetas con IA ilimitadas",
      "1 plan de entrenamiento activo",
      "Balance energético diario por voz",
      "Historial de análisis 30 días",
      "Dashboard + métricas",
    ],
    cta: "Elegir Silver",
  },
  {
    id: "gold",
    name: "Gold",
    Icon: WorkspacePremiumOutlinedIcon,
    price: 8980,
    sub: "por mes",
    color: "#B07D1A",
    border: "rgba(176,125,26,0.28)",
    bg: "linear-gradient(145deg,#FDF8EC,#FEFCF5)",
    highlight: true,
    badge: "Más popular",
    features: [
      "Análisis ilimitados por día",
      "Recetas con IA ilimitadas",
      "2 planes de entrenamiento activos",
      "Balance energético diario por voz",
      "Historial mensual de balance (tabla diaria)",
      "Historial completo sin límite",
      "Dashboard premium + estadísticas detalladas",
    ],
    cta: "Elegir Gold",
  },
];

/* ─── Card de pricing reutilizable ───────────────────────────── */
const PricingCard = ({ p, onCTA, isActive }) => (
  <Box
    sx={{
      border: `1.5px solid ${p.border}`,
      borderRadius: 5,
      background: p.bg,
      p: 3.5,
      position: "relative",
      height: "100%",
      boxShadow: p.highlight
        ? `0 32px 72px ${p.color}30, 0 8px 24px rgba(0,0,0,0.10)`
        : "0 4px 20px rgba(0,0,0,0.08)",
    }}
  >
    {p.badge && isActive && (
      <Box
        sx={{
          position: "absolute",
          top: -14,
          left: "50%",
          transform: "translateX(-50%)",
          bgcolor: p.color,
          color: "#fff",
          fontSize: 11,
          fontWeight: 800,
          px: 2.5,
          py: 0.6,
          borderRadius: 999,
          whiteSpace: "nowrap",
          boxShadow: `0 4px 16px ${p.color}55`,
          zIndex: 1,
        }}
      >
        {p.badge}
      </Box>
    )}
    <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 3,
          bgcolor:
            p.id === "gold"
              ? "rgba(176,125,26,0.10)"
              : p.id === "silver"
                ? "rgba(113,135,156,0.10)"
                : C.brandSurf,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p.Icon sx={{ fontSize: 22, color: p.color }} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 900,
            color: p.color,
            lineHeight: 1.1,
          }}
        >
          Plan {p.name}
        </Typography>
        <Typography sx={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
          {p.sub}
        </Typography>
      </Box>
    </Stack>
    <Box mb={3}>
      {p.price ? (
        <>
          <Typography
            component="span"
            sx={{
              fontSize: 36,
              fontWeight: 900,
              color: C.ink,
              letterSpacing: "-1.5px",
            }}
          >
            {formatARS(p.price)}
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: 13, color: C.muted, ml: 0.5 }}
          >
            /mes
          </Typography>
        </>
      ) : (
        <Typography sx={{ fontSize: 30, fontWeight: 900, color: C.brand }}>
          Gratis
        </Typography>
      )}
    </Box>
    <Stack spacing={1.1} mb={3.5}>
      {p.features.map((f) => (
        <Stack key={f} direction="row" spacing={1.2} alignItems="flex-start">
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              bgcolor: `${p.color}14`,
              flexShrink: 0,
              mt: 0.1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckRoundedIcon sx={{ fontSize: 11, color: p.color }} />
          </Box>
          <Typography sx={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>
            {f}
          </Typography>
        </Stack>
      ))}
    </Stack>
    <Button
      fullWidth
      onClick={onCTA}
      sx={{
        textTransform: "none",
        fontWeight: 800,
        fontSize: 14,
        borderRadius: 2.5,
        py: 1.4,
        bgcolor: p.highlight ? p.color : "transparent",
        border: `1.5px solid ${p.border}`,
        color: p.highlight ? "#fff" : p.color,
        boxShadow: p.highlight ? `0 4px 18px ${p.color}38` : "none",
        "&:hover": { bgcolor: p.highlight ? `${p.color}E0` : `${p.color}0D` },
        transition: "all 0.2s",
      }}
    >
      {p.cta}
    </Button>
  </Box>
);

const PricingSection = ({ onCTA }) => {
  const [active, setActive] = useState(2); // Gold al frente por defecto
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % 3), 4500);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  // Posición relativa al activo: 0=frente, 1=derecha, 2=izquierda
  const getPos = (i) => (((i - active) % 3) + 3) % 3;

  // Enfoque coverflow: translateX + scale + leve rotateY (más compatible)
  const getCardStyle = (i) => {
    const pos = getPos(i);
    const t = "all 0.65s cubic-bezier(0.4, 0, 0.2, 1)";
    if (pos === 0)
      return {
        transform: "translateX(0) scale(1.08) rotateY(0deg)",
        opacity: 1,
        zIndex: 3,
        transition: t,
        cursor: "default",
        filter: "none",
        boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
      };
    if (pos === 1)
      return {
        transform: "translateX(72%) scale(0.82) rotateY(-10deg)",
        opacity: 0.72,
        zIndex: 2,
        transition: t,
        cursor: "pointer",
        filter: "brightness(0.80)",
        boxShadow: "none",
      };
    return {
      transform: "translateX(-72%) scale(0.82) rotateY(10deg)",
      opacity: 0.72,
      zIndex: 2,
      transition: t,
      cursor: "pointer",
      filter: "brightness(0.80)",
      boxShadow: "none",
    };
  };

  const handleClick = (i) => {
    if (getPos(i) !== 0) {
      setActive(i);
      resetTimer();
    }
  };

  return (
    <Box
      id="precios"
      sx={{
        background: C.cream,
        py: { xs: 9, md: 14 },
        px: { xs: 2.5, sm: 5, md: 8 },
        overflow: "hidden",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Box textAlign="center" mb={8}>
          <Box
            sx={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 800,
              color: C.brand,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              bgcolor: C.brandSurf,
              border: `1px solid ${C.brandBorder}`,
              borderRadius: 999,
              px: 2,
              py: 0.6,
              mb: 2.5,
            }}
          >
            Precios
          </Box>
          <Typography
            sx={{
              fontSize: { xs: 30, sm: 46 },
              fontWeight: 900,
              color: C.ink,
              letterSpacing: { xs: "-1px", sm: "-2px" },
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            Elegí el plan que
            <br />
            <Box component="span" sx={{ color: C.brand }}>
              mejor te quede
            </Box>
          </Typography>
          <Typography sx={{ fontSize: 17, color: C.muted, lineHeight: 1.8 }}>
            Empezá con 7 días gratis. Cancelá cuando quieras, sin penalidades.
          </Typography>
        </Box>

        {/* ── Carrusel coverflow — desktop ── */}
        <Box sx={{ display: { xs: "none", md: "block" }, mb: 5 }}>
          <Box
            sx={{
              perspective: "1200px",
              position: "relative",
              height: "640px",
              overflow: "visible",
            }}
          >
            {PRICING_PLANS.map((p, i) => (
              <Box
                key={p.id}
                onClick={() => handleClick(i)}
                sx={{
                  position: "absolute",
                  width: "340px",
                  left: "50%",
                  top: "20px",
                  ml: "-170px",
                  transformOrigin: "center center",
                  willChange: "transform",
                  ...getCardStyle(i),
                }}
              >
                <PricingCard p={p} onCTA={onCTA} isActive={getPos(i) === 0} />
              </Box>
            ))}
          </Box>

          {/* Dots */}
          <Stack direction="row" justifyContent="center" spacing={1.5} mt={2}>
            {PRICING_PLANS.map((p, i) => (
              <Box
                key={p.id}
                onClick={() => {
                  setActive(i);
                  resetTimer();
                }}
                sx={{
                  width: active === i ? 28 : 8,
                  height: 8,
                  borderRadius: 999,
                  bgcolor: active === i ? p.color : "rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  transition: "all 0.4s ease",
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* ── Grid simple — mobile ── */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            gap: 3,
          }}
        >
          {PRICING_PLANS.map((p) => (
            <PricingCard key={p.id} p={p} onCTA={onCTA} isActive />
          ))}
        </Box>

        {/* Pago seguro — logo MP */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1.5}
            flexWrap="wrap"
            useFlexGap
          >
            <Typography sx={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
              Pago seguro a través de
            </Typography>
            <Box
              component="img"
              src="/img/Logo Mp.svg"
              alt="Mercado Pago"
              sx={{ height: 28, opacity: 0.85 }}
            />
            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#2ECC71" }} />
            <Typography sx={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
              Cancelá cuando quieras
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

/* ─── CTA FINAL ───────────────────────────────────────────────────────────── */
const FinalCTA = ({ onCTA }) => (
  <Box
    sx={{
      background: `linear-gradient(140deg, ${C.heroBg} 0%, #053D38 50%, ${C.darkBg} 100%)`,
      py: { xs: 10, md: 16 },
      px: { xs: 2.5, sm: 5 },
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage:
          "radial-gradient(rgba(16,185,129,0.06) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        width: 800,
        height: 800,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)",
      }}
    />

    <Box sx={{ maxWidth: 640, mx: "auto", position: "relative", zIndex: 1 }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 800,
          color: C.emerald,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          mb: 2.5,
        }}
      >
        Empezá hoy
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: 34, sm: 54 },
          fontWeight: 900,
          color: "#fff",
          letterSpacing: { xs: "-1.5px", sm: "-2.5px" },
          lineHeight: 1.08,
          mb: 3,
        }}
      >
        7 días completamente
        <br />
        <Box
          component="span"
          sx={{
            background: `linear-gradient(130deg, ${C.emerald}, ${C.mint})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          gratis.
        </Box>
      </Typography>
      <Typography
        sx={{
          fontSize: 17,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.85,
          mb: 5.5,
        }}
      >
        Sin tarjeta de crédito. Sin compromisos.
        <br />
        Probá los 3 módulos sin límites.
      </Typography>
      <Button
        onClick={onCTA}
        endIcon={<ArrowForwardRoundedIcon />}
        sx={{
          bgcolor: C.emerald,
          color: "#fff",
          fontWeight: 800,
          fontSize: 17,
          textTransform: "none",
          px: 5.5,
          py: 1.9,
          borderRadius: 999,
          boxShadow: "none",
          "&:hover": {
            bgcolor: C.emeraldDark,
            boxShadow: "none",
            transform: "translateY(-2px)",
          },
          transition: "all 0.25s",
        }}
      >
        Crear cuenta gratis
      </Button>
    </Box>
  </Box>
);

/* ─── EDITORIAL: post destacado + archivo ─────────────────────────────────── */

const fmtDateLanding = (d) =>
  new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "long" });

const buildShareText = (post) =>
  `${post.title}\n\n${post.body?.replace(/\n\n/g, "\n")}\n\n— Nui App`;

/* Modal reutilizable */
const PostModalLanding = ({ post, open, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!post) return null;
  const paragraphs = post.body?.split("\n\n").filter(Boolean) || [];
  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildShareText(post)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
          pt: { xs: "72px", sm: "8vh" },
          pb: { xs: 2, sm: "8vh" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          mx: { xs: 1.5, sm: 2 },
          maxHeight: { xs: "calc(100dvh - 90px)", sm: "84vh" },
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header fijo */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2.5,
            py: 1.5,
            borderBottom: "1px solid rgba(11,94,85,0.10)",
            flexShrink: 0,
            bgcolor: "#fff",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label="Nui Editorial"
              size="small"
              sx={{
                bgcolor: "#E6F5F3",
                color: "#0B5E55",
                fontWeight: 700,
                fontSize: 10.5,
              }}
            />
            <Typography sx={{ fontSize: 11, color: "#8AADAA" }}>
              {post.readingMinutes} min
            </Typography>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#8AADAA",
              "&:hover": { bgcolor: "#E6F5F3", color: "#0B5E55" },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
        {/* Imagen */}
        {post.imageUrl && (
          <Box
            sx={{
              width: "100%",
              height: { xs: 150, sm: 200 },
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={post.imageUrl}
              alt={post.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        )}
        {/* Contenido */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, pt: 2.5, pb: 3 }}>
          <Typography
            sx={{
              fontSize: { xs: 19, sm: 22 },
              fontWeight: 900,
              color: "#0F2420",
              letterSpacing: "-0.5px",
              lineHeight: 1.25,
              mb: 1,
            }}
          >
            {post.title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#8AADAA", mb: 2.5 }}>
            Publicado por <strong style={{ color: "#0B5E55" }}>Nui</strong> ·{" "}
            {fmtDateLanding(post.publishedAt)}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />
          <Typography
            sx={{
              fontSize: 15,
              fontStyle: "italic",
              color: "#4A6B67",
              borderLeft: "3px solid #0B5E55",
              pl: 2,
              mb: 2.5,
              lineHeight: 1.6,
            }}
          >
            {post.excerpt}
          </Typography>
          <Stack spacing={2} mb={3}>
            {paragraphs.map((p, i) => (
              <Typography
                key={i}
                sx={{ fontSize: 14.5, color: "#0F2420", lineHeight: 1.75 }}
              >
                {p}
              </Typography>
            ))}
          </Stack>
          {post.tags?.length > 0 && (
            <Stack
              direction="row"
              spacing={0.8}
              flexWrap="wrap"
              useFlexGap
              mb={3}
            >
              {post.tags.map((t) => (
                <Chip
                  key={t}
                  label={`#${t}`}
                  size="small"
                  sx={{
                    bgcolor: "#E6F5F3",
                    color: "#0B5E55",
                    fontWeight: 600,
                    fontSize: 11,
                    height: 22,
                  }}
                />
              ))}
            </Stack>
          )}
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              sx={{ fontSize: 12, color: "#8AADAA", fontWeight: 600 }}
            >
              Compartir:
            </Typography>
            <IconButton
              size="small"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(buildShareText(post))}`,
                  "_blank",
                  "noopener",
                )
              }
              sx={{
                color: "#25D366",
                "&:hover": { bgcolor: "rgba(37,211,102,0.10)" },
              }}
            >
              <WhatsAppIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                color: copied ? "#0B5E55" : "#8AADAA",
                "&:hover": { bgcolor: "#E6F5F3" },
              }}
            >
              <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Schema.org Article para posts (Rich Results en Google) ──── */
const injectArticleSchema = (post) => {
  const id = "nui-article-schema";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    keywords: (post.tags || []).join(", "),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "Nui", url: "https://nuiapp.com" },
    publisher: {
      "@type": "Organization",
      name: "Nui App",
      logo: { "@type": "ImageObject", url: "https://nuiapp.com/img/logo.png" },
    },
    image: post.imageUrl || "https://nuiapp.com/img/og-image.png",
    url: "https://nuiapp.com/",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://nuiapp.com/" },
    inLanguage: "es-AR",
    about: { "@type": "Thing", name: "Salud y Nutrición" },
  });
};

const LandingPostsSection = () => {
  const [featured, setFeatured] = useState(null);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [fetchingPost, setFetchingPost] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = async (p, isFirst = false) => {
    if (isFirst) setLoading(true);
    else setArchiveLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/landing?page=${p}`);
      const data = await res.json();
      if (p === 1 && data.featured) {
        setFeatured(data.featured);
        injectArticleSchema(data.featured); // Schema.org para Google
      }
      setArchive(data.archive || []);
      setPage(data.page || p);
      setTotalPages(data.totalPages || 1);
    } catch {
    } finally {
      if (isFirst) setLoading(false);
      else setArchiveLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1, true);
  }, []); // eslint-disable-line

  const openPost = async (post) => {
    // Si ya tiene body e imageUrl (post destacado), abrirlo directo
    if (post.body) {
      setSelected(post);
      return;
    }
    // Si es del archivo (sin body), fetchear el completo
    setFetchingPost(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/${post.date}`);
      const data = await res.json();
      if (data.post) setSelected(data.post);
    } catch {
    } finally {
      setFetchingPost(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#F7F9F8",
        py: { xs: 7, md: 10 },
        px: { xs: 2.5, sm: 5, md: 8 },
      }}
    >
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {/* Header */}
        <Box mb={5}>
          <Chip
            label="Nui Editorial"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "#E6F5F3",
              color: "#0B5E55",
              fontWeight: 700,
              fontSize: 12,
              border: "1px solid #B2DDD9",
            }}
          />
          <Typography
            sx={{
              fontSize: { xs: 24, sm: 32 },
              fontWeight: 900,
              color: "#0F2420",
              letterSpacing: "-0.8px",
              lineHeight: 1.2,
            }}
          >
            Salud, nutrición y bienestar — hoy
          </Typography>
        </Box>

        {/* Card principal — igual que en la app */}
        {loading ? (
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              bgcolor: "#fff",
              mb: 5,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              border: "1px solid rgba(11,94,85,0.10)",
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                width: { xs: "100%", sm: 300 },
                height: { xs: 180, sm: "auto" },
              }}
            />
            <Box sx={{ p: 3, flex: 1 }}>
              <Skeleton height={16} width="40%" sx={{ mb: 1.5 }} />
              <Skeleton height={28} width="90%" sx={{ mb: 0.5 }} />
              <Skeleton height={28} width="70%" sx={{ mb: 2 }} />
              <Skeleton height={16} width="80%" />
            </Box>
          </Box>
        ) : (
          featured && (
            <Box
              onClick={() => openPost(featured)}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                bgcolor: "#fff",
                mb: 5,
                border: "1px solid rgba(11,94,85,0.10)",
                boxShadow: "0 4px 24px rgba(11,94,85,0.10)",
                cursor: "pointer",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 32px rgba(11,94,85,0.16)",
                },
              }}
            >
              {/* Imagen */}
              <Box
                sx={{
                  position: "relative",
                  flexShrink: 0,
                  bgcolor: "#E6F5F3",
                  overflow: "hidden",
                  width: { xs: "100%", sm: 300 },
                  height: { xs: 180, sm: "auto" },
                  minHeight: { sm: 200 },
                }}
              >
                {featured.imageUrl ? (
                  <Box
                    component="img"
                    src={featured.imageUrl}
                    alt={featured.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      "@keyframes fadeIn": {
                        from: { opacity: 0 },
                        to: { opacity: 1 },
                      },
                      animation: "fadeIn 0.6s ease",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        "@keyframes pulse": {
                          "0%,100%": { opacity: 0.4 },
                          "50%": { opacity: 1 },
                        },
                        animation: "pulse 1.4s ease-in-out infinite",
                      }}
                    >
                      <Leaf size={28} weight="fill" color="#0B5E55" />
                    </Box>
                    <Typography sx={{ fontSize: 11, color: "#8AADAA" }}>
                      Preparando…
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    bgcolor: "#0B5E55",
                    color: "#fff",
                    px: 1.3,
                    py: 0.3,
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                  }}
                >
                  HOY
                </Box>
              </Box>
              {/* Contenido */}
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography sx={{ fontSize: 11, color: "#8AADAA" }}>
                      <strong style={{ color: "#0B5E55" }}>Nui</strong> ·{" "}
                      {fmtDateLanding(featured.publishedAt)}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AccessTimeOutlinedIcon
                        sx={{ fontSize: 12, color: "#8AADAA" }}
                      />
                      <Typography sx={{ fontSize: 11, color: "#8AADAA" }}>
                        {featured.readingMinutes} min
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: { xs: 18, sm: 21 },
                      fontWeight: 900,
                      color: "#0F2420",
                      letterSpacing: "-0.4px",
                      lineHeight: 1.3,
                      mb: 1.2,
                    }}
                  >
                    {featured.title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13.5, color: "#4A6B67", lineHeight: 1.6 }}
                  >
                    {featured.excerpt}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2.5}
                >
                  <Stack
                    direction="row"
                    spacing={0.7}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {featured.tags?.slice(0, 3).map((t) => (
                      <Chip
                        key={t}
                        label={`#${t}`}
                        size="small"
                        sx={{
                          bgcolor: "#E6F5F3",
                          color: "#0B5E55",
                          fontWeight: 600,
                          fontSize: 10.5,
                          height: 20,
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography
                    sx={{ fontSize: 13, color: "#0B5E55", fontWeight: 700 }}
                  >
                    Leer artículo →
                  </Typography>
                </Stack>
              </Box>
            </Box>
          )
        )}

        {/* Archivo — posts anteriores */}
        {(archive.length > 0 || archiveLoading) && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#8AADAA",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Artículos anteriores
              </Typography>
              {totalPages > 1 && (
                <Typography sx={{ fontSize: 11, color: "#8AADAA" }}>
                  Página {page} de {totalPages}
                </Typography>
              )}
            </Stack>

            {archiveLoading ? (
              <Stack spacing={0}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      gap: 2,
                      py: 1.4,
                      px: 1.5,
                      alignItems: "center",
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width={52}
                      height={52}
                      sx={{ borderRadius: 1.5, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton height={16} width="80%" />
                      <Skeleton height={13} width="40%" sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack spacing={0}>
                {archive.map((p, i) => (
                  <Box
                    key={p._id}
                    onClick={() => openPost(p)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.2,
                      px: 1.5,
                      cursor: "pointer",
                      borderRadius: 2,
                      borderBottom:
                        i < archive.length - 1
                          ? "1px solid rgba(11,94,85,0.08)"
                          : "none",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "#E6F5F3" },
                    }}
                  >
                    {/* Miniatura */}
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        flexShrink: 0,
                        bgcolor: "#E6F5F3",
                      }}
                    >
                      {p.imageUrl ? (
                        <Box
                          component="img"
                          src={p.imageUrl}
                          alt={p.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Leaf size={20} weight="fill" color="#0B5E55" />
                        </Box>
                      )}
                    </Box>
                    {/* Texto */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "#0F2420",
                          lineHeight: 1.3,
                          mb: 0.3,
                        }}
                        noWrap
                      >
                        {p.title}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontSize: 11, color: "#8AADAA" }}>
                          {fmtDateLanding(p.publishedAt)}
                        </Typography>
                        {p.tags?.[0] && (
                          <Chip
                            label={`#${p.tags[0]}`}
                            size="small"
                            sx={{
                              bgcolor: "#E6F5F3",
                              color: "#0B5E55",
                              fontWeight: 600,
                              fontSize: 10,
                              height: 17,
                              display: { xs: "none", sm: "flex" },
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Paginador */}
            {totalPages > 1 && (
              <Stack direction="row" justifyContent="center" spacing={1} mt={3}>
                <Button
                  size="small"
                  disabled={page === 1 || archiveLoading}
                  onClick={() => fetchPage(page - 1)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#0B5E55",
                    borderRadius: 999,
                    border: "1px solid rgba(11,94,85,0.20)",
                    px: 2,
                    "&:hover": { bgcolor: "#E6F5F3" },
                    "&:disabled": { opacity: 0.4 },
                  }}
                >
                  ← Anterior
                </Button>
                <Button
                  size="small"
                  disabled={page === totalPages || archiveLoading}
                  onClick={() => fetchPage(page + 1)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#0B5E55",
                    borderRadius: 999,
                    border: "1px solid rgba(11,94,85,0.20)",
                    px: 2,
                    "&:hover": { bgcolor: "#E6F5F3" },
                    "&:disabled": { opacity: 0.4 },
                  }}
                >
                  Siguiente →
                </Button>
              </Stack>
            )}
          </>
        )}
      </Box>

      <PostModalLanding
        post={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

      {/* Overlay cargando post completo */}
      {fetchingPost && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            bgcolor: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 4,
              px: 4,
              py: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                mb: 1,
                display: "inline-flex",
                "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                animation: "spin 1s linear infinite",
              }}
            >
              <Leaf size={28} weight="fill" color="#0B5E55" />
            </Box>
            <Typography
              sx={{ fontSize: 13, color: "#4A6B67", fontWeight: 600 }}
            >
              Cargando artículo…
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

/* ─── FOOTER ──────────────────────────────────────────────────────────────── */
const LandingFooter = () => (
  <Box
    sx={{
      background: C.heroBg,
      borderTop: "1px solid rgba(255,255,255,0.05)",
      py: 5,
      px: { xs: 2.5, sm: 5, md: 8 },
    }}
  >
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* Fila principal */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          mb: 4,
        }}
      >
        <Box
          component="img"
          src="/img/logo_landing.png"
          alt="Nui"
          sx={{ height: 28, opacity: 0.55 }}
        />
        <Stack
          direction="row"
          spacing={4}
          flexWrap="wrap"
          justifyContent="center"
        >
          {[
            ["Privacidad", "/privacidad"],
            ["Términos", "/terminos"],
            ["Contacto", "/contact"],
            ["Precios", "/pricing"],
          ].map(([label, path]) => (
            <Box
              key={label}
              component={Link}
              to={path}
              sx={{
                fontSize: 13,
                color: "rgba(255,255,255,0.32)",
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { color: "rgba(255,255,255,0.70)" },
                transition: "color 0.2s",
              }}
            >
              {label}
            </Box>
          ))}
        </Stack>
        <Typography
          sx={{
            fontSize: 12,
            color: "rgba(255,255,255,0.20)",
            fontWeight: 500,
          }}
        >
          © {new Date().getFullYear()} Nui
        </Typography>
      </Box>

      {/* Pago seguro — logo Mercado Pago */}
      <Box
        sx={{
          py: 3,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="center"
          spacing={{ xs: 2, sm: 4 }}
          flexWrap="wrap"
          useFlexGap
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              sx={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.40)",
                fontWeight: 600,
              }}
            >
              Pago seguro procesado por
            </Typography>
            <Box
              component="img"
              src="/img/Logo Mp Blanco.png"
              alt="Mercado Pago"
              sx={{
                height: 48,
                opacity: 0.9,
              }}
            />
          </Stack>
          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.20)" }}>
            ·
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LockRoundedIcon
              sx={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}
            />
            <Typography
              sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}
            >
              Transacción cifrada SSL · PCI DSS compliant
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Cumplimiento normativo ARCA + Defensa del Consumidor */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1.5, sm: 2.5 },
          mb: 2,
        }}
      >
        {/* ARCA */}
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountBalanceRoundedIcon
              sx={{ fontSize: 11, color: "rgba(255,255,255,0.60)" }}
            />
          </Box>
          <Box
            component="a"
            href="https://www.argentina.gob.ar/arca"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
              "&:hover": { color: "rgba(255,255,255,0.70)" },
              transition: "color 0.2s",
            }}
          >
            ARCA — Agencia de Recaudación
          </Box>
        </Stack>
        <Typography
          sx={{
            fontSize: 11,
            color: "rgba(255,255,255,0.12)",
            userSelect: "none",
          }}
        >
          ·
        </Typography>
        {/* Defensa del Consumidor */}
        <Box
          component="a"
          href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
            "&:hover": { color: "rgba(255,255,255,0.70)" },
            transition: "color 0.2s",
          }}
        >
          <GppGoodRoundedIcon sx={{ fontSize: 13 }} /> Defensa del Consumidor
        </Box>
        <Typography
          sx={{
            fontSize: 11,
            color: "rgba(255,255,255,0.12)",
            userSelect: "none",
          }}
        >
          ·
        </Typography>
        <Box
          component="a"
          href="tel:08006661518"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
            "&:hover": { color: "rgba(255,255,255,0.70)" },
            transition: "color 0.2s",
          }}
        >
          <PhoneRoundedIcon sx={{ fontSize: 13 }} /> 0800-666-1518
        </Box>
        <Typography
          sx={{
            fontSize: 11,
            color: "rgba(255,255,255,0.12)",
            userSelect: "none",
          }}
        >
          ·
        </Typography>
        <Box
          component="a"
          href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
            "&:hover": { color: "rgba(255,255,255,0.70)" },
            transition: "color 0.2s",
          }}
        >
          <UndoRoundedIcon sx={{ fontSize: 13 }} /> Botón de arrepentimiento
        </Box>
      </Box>

      {/* Datos legales */}
      <Typography
        sx={{
          textAlign: "center",
          fontSize: 10.5,
          color: "rgba(255,255,255,0.18)",
          lineHeight: 1.7,
        }}
      >
        Nui es una aplicación de salud y nutrición. No reemplaza el consejo
        médico profesional.
        <br />
        Los análisis nutricionales son orientativos. Consultá con un profesional
        de la salud ante dudas.
      </Typography>
    </Box>
  </Box>
);

/* ─── MAIN ────────────────────────────────────────────────────────────────── */
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
      <WhyMattersSection onCTA={goToApp} />
      <ModulesSection />
      <ShoppingListFeatureSection onCTA={goToApp} />
      <CostComparisonSection onCTA={goToApp} />
      <HowItWorksSection />
      <PricingSection onCTA={goToApp} />
      <FinalCTA onCTA={goToApp} />
      <LandingPostsSection />
      <LandingFooter />
    </Box>
  );
};

export default LandingPage;
