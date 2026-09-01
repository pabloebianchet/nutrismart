/**
 * LandingPage — Premium v2
 * Diseño dinámico, secciones luz/oscuro alternadas, CTAs rellenas
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import usePageMeta from "../hooks/usePageMeta";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Skeleton,
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
import { buildPostSlug } from "../utils/blogSlug";

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
  const { isUS } = useNutrition();
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
        {(isUS
          ? [
              ["Features", "#modulos"],
              ["How it works", "#como-funciona"],
              ["Pricing", "#precios"],
            ]
          : [
              ["Características", "#modulos"],
              ["Cómo funciona", "#como-funciona"],
              ["Precios", "#precios"],
            ]
        ).map(([label, href]) => (
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
          {isUS ? "Log in" : "Iniciar sesión"}
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
          {isUS ? "Start free" : "Empezar gratis"}
        </Button>
      </Stack>
    </Box>
  );
};

/* ─── HERO ────────────────────────────────────────────────────────────────── */
const HeroSection = ({ onCTA }) => {
  const { isUS } = useNutrition();
  return (
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
      pt: { xs: 14, md: 14 },
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
          {isUS
            ? "AI-powered nutrition analysis · Free for 7 days"
            : "Análisis nutricional con IA · Gratis 7 días"}
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
        {isUS ? (
          <>
            Eat better.
            <br />
            Train better.
            <br />
          </>
        ) : (
          <>
            Comé mejor.
            <br />
            Entrenás mejor.
            <br />
          </>
        )}
        <Box
          component="span"
          sx={{
            background: `linear-gradient(130deg, ${C.emerald} 0%, ${C.mint} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {isUS ? "Live better." : "Vivís mejor."}
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
        {isUS
          ? "Nui analyzes your food with artificial intelligence, generates healthy recipes, and builds your training plan — all tailored to you."
          : "Nui analiza tus alimentos con inteligencia artificial, genera recetas saludables y crea tu plan de entrenamiento — todo adaptado a vos."}
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
          {isUS ? "Start free — 7 days" : "Empezar gratis — 7 días"}
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
          {isUS ? "Log in" : "Iniciar sesión"}
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
        {(isUS
          ? [
              ["3", "AI modules"],
              ["7 days", "free trial"],
              ["100%", "personalized"],
            ]
          : [
              ["3", "módulos IA"],
              ["7 días", "prueba gratis"],
              ["100%", "personalizado"],
            ]
        ).map(([val, label]) => (
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
};

/* ─── TICKER ──────────────────────────────────────────────────────────────── */
const MarqueeTicker = () => {
  const { isUS } = useNutrition();
  const items = isUS
    ? [
        "NUTRITION ANALYSIS",
        "ULTRA-PROCESSED FOODS",
        "NOVA CLASSIFICATION",
        "HYPERTROPHY ROUTINE",
        "RUNNING TRAINING",
        "CALISTHENICS PLAN",
        "AI SHOPPING LIST",
        "AI-GENERATED RECIPES",
        "AI NUTRITIONIST",
        "NUTRITION FACTS",
        "NUI",
        "GUT MICROBIOME",
        "PERSONAL TRAINER",
        "SMART NUTRITION",
      ]
    : [
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
const getFacts = (isUS) =>
  isUS
    ? [
        {
          stat: "70%",
          title: "of packaged products are ultra-processed",
          desc: "Most of what you find at the supermarket is designed to maximize taste and palatability, not your health.",
          color: C.danger,
          bg: "#FFF1F1",
        },
        {
          stat: "+5",
          title: "unrecognizable ingredients = a NOVA warning sign",
          desc: "More than five additives you don't recognize classify the product as Group 4 on the international NOVA scale.",
          color: C.brand,
          bg: C.brandSurf,
        },
        {
          stat: "↑3×",
          title: "higher risk of overweight and chronic disease",
          desc: "Frequent consumption alters gut microbiota and metabolism, creating long-term risks.",
          color: C.emerald,
          bg: "#ECFDF5",
        },
      ]
    : [
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

const WhyMattersSection = ({ onCTA }) => {
  const { isUS } = useNutrition();
  const FACTS = getFacts(isUS);
  return (
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
          {isUS ? "The problem you don't see" : "El problema que no se ve"}
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
          {isUS ? (
            <>
              70% of what you buy at the supermarket
              <br />
              <Box component="span" sx={{ color: C.danger }}>
                is ultra-processed
              </Box>
            </>
          ) : (
            <>
              El 70% de lo que comprás en el supermercado
              <br />
              <Box component="span" sx={{ color: C.danger }}>
                es ultraprocesado
              </Box>
            </>
          )}
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
          {isUS
            ? "These products are sweeter, saltier, and fattier, with less vitamins and fiber. Spotting them isn't always easy — Nui does it for you instantly."
            : "Estos productos son más dulces, salados y grasos, con menos vitaminas y fibra. Identificarlos no siempre es fácil — Nui lo hace por vos al instante."}
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
          {isUS
            ? "NOVA classification — The international standard"
            : "Clasificación NOVA — El estándar internacional"}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" },
            gap: 1.5,
          }}
        >
          {(isUS
            ? [
                {
                  grupo: "Group 1",
                  label: "Fresh or minimally processed",
                  ej: "Fruit, vegetables, eggs, meat",
                  ok: true,
                },
                {
                  grupo: "Group 2",
                  label: "Culinary ingredients",
                  ej: "Oils, salt, sugar, vinegar",
                  ok: true,
                },
                {
                  grupo: "Group 3",
                  label: "Processed foods",
                  ej: "Canned goods, cheese, bread, cured meats",
                  ok: true,
                },
                {
                  grupo: "Group 4",
                  label: "Ultra-processed",
                  ej: "Snacks, cereal, soda, cookies",
                  ok: false,
                },
              ]
            : [
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
              ]
          ).map((g) => (
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
          {isUS
            ? "Analyze your first product for free"
            : "Analizá tu primer producto gratis"}
        </Button>
      </Box>
    </Box>
  </Box>
  );
};

/* ─── MÓDULOS ─────────────────────────────────────────────────────────────── */
const getModules = (isUS) =>
  isUS
    ? [
        {
          Icon: SearchRoundedIcon,
          title: "Food analysis",
          desc: "Photograph the nutrition facts and ingredients of a product. Instantly get its NOVA classification, macros, additives, and personalized recommendations.",
          color: C.brand,
          bg: C.brandSurf,
          tags: ["NOVA classification", "Macros", "Additives", "Health score"],
          photo: "/img/analisisIA.jpg",
        },
        {
          Icon: RestaurantMenuRoundedIcon,
          title: "AI recipes",
          desc: "Generate healthy recipes tailored to your profile and goal. Fit, Hypertrophy, or Quick — with real ingredients, detailed steps, and an automatic shopping list.",
          color: "#7C3AED",
          bg: "#F5F3FF",
          tags: [
            "Personalized",
            "Real ingredients",
            "Shopping list",
            "Favorites",
          ],
          photo: "/img/recetasIA.jpg",
        },
        {
          Icon: FitnessCenterRoundedIcon,
          title: "Personalized training",
          desc: "Generate your training plan: Hypertrophy, Fit, or Calisthenics, at the Gym or at Home. Track your progress session by session with a full log.",
          color: "#D97706",
          bg: "#FFFBEB",
          tags: ["Hypertrophy", "Fit", "Calisthenics", "Gym", "Home"],
          photo:
            "/img/Start%20every%20day%20strong!%20Build%20muscle%2C%20burn%20fat%E2%80%A6.jpg",
        },
        {
          Icon: TrendingUpRoundedIcon,
          title: "Energy balance",
          desc: "Log what you eat and your daily activity by voice. The AI calculates your calorie target based on your metabolism, activity level, and goal — lose weight, maintain, or build muscle.",
          color: "#0B5E55",
          bg: "#E6F5F3",
          tags: [
            "By voice",
            "TDEE",
            "Deficit / Surplus",
            "Macros",
            "Monthly history",
          ],
          photo: "/img/balance.jpg",
        },
      ]
    : [
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

const ModulesSection = () => {
  const { isUS } = useNutrition();
  const MODULES = getModules(isUS);
  return (
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
          <BoltRoundedIcon sx={{ fontSize: 13 }} />{" "}
          {isUS ? "4 built-in modules" : "4 módulos integrados"}
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
          {isUS ? (
            <>
              Everything you need
              <br />
              <Box component="span" sx={{ color: C.brand }}>
                in one place
              </Box>
            </>
          ) : (
            <>
              Todo lo que necesitás
              <br />
              <Box component="span" sx={{ color: C.brand }}>
                en un solo lugar
              </Box>
            </>
          )}
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
          {isUS
            ? "Four integrated tools that work together: analyze what you eat, cook better, train with a personalized plan, and track your calorie balance in real time."
            : "Cuatro herramientas integradas que trabajan juntas: analizás lo que comés, cocinás mejor, entrenás con un plan personalizado y controlás tu balance calórico en tiempo real."}
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
};

/* ─── LISTA DE COMPRAS FEATURE ───────────────────────────────────────────── */
const getShoppingSteps = (isUS) =>
  isUS
    ? [
        {
          Icon: RestaurantRoundedIcon,
          color: "#7C3AED",
          bg: "#F5F3FF",
          border: "rgba(124,58,237,0.14)",
          title: "You generate a recipe",
          desc: "Pick the type of dish — Fit, Hypertrophy, or Quick — and the AI generates ingredients and steps instantly.",
        },
        {
          Icon: ShoppingCartRoundedIcon,
          color: C.brand,
          bg: C.brandSurf,
          border: C.brandBorder,
          title: "Add it with a tap",
          desc: '"Add to my list" adds every ingredient you need. No copying, no typing.',
        },
        {
          Icon: FormatListNumberedRoundedIcon,
          color: "#D97706",
          bg: "#FFFBEB",
          border: "rgba(217,119,6,0.14)",
          title: "It adds itself up",
          desc: "One recipe needs 3 eggs, another needs 2? Nui shows 5 eggs — no duplicates, no confusion.",
        },
        {
          Icon: EditRoundedIcon,
          color: "#0891B2",
          bg: "#F0FDFF",
          border: "rgba(8,145,178,0.14)",
          title: "Add whatever you want",
          desc: "Soap, paper towels, yogurt? Type it in and it joins the same list. Everything in one place.",
        },
      ]
    : [
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
const getMockItems = (isUS) =>
  isUS
    ? [
        {
          Icon: EggRoundedIcon,
          label: "5 eggs",
          source: "2 recipes",
          checked: true,
        },
        {
          Icon: LunchDiningRoundedIcon,
          label: "300g chicken",
          source: "Chicken Taco",
          checked: true,
        },
        {
          Icon: GrainRoundedIcon,
          label: "2 corn tortillas",
          source: "Chicken Taco",
          checked: false,
        },
        {
          Icon: OpacityRoundedIcon,
          label: "1 tbsp olive oil",
          source: "Fit Salad",
          checked: false,
        },
        {
          Icon: SpaRoundedIcon,
          label: "1 onion",
          source: "Manual",
          checked: false,
        },
        {
          Icon: GrassRoundedIcon,
          label: "200g broccoli",
          source: "Fit Stir-fry",
          checked: false,
        },
      ]
    : [
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

const ShoppingListFeatureSection = ({ onCTA }) => {
  const { isUS } = useNutrition();
  const SHOPPING_STEPS = getShoppingSteps(isUS);
  const MOCK_ITEMS = getMockItems(isUS);
  return (
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
          <ShoppingCartRoundedIcon sx={{ fontSize: 13 }} />{" "}
          {isUS ? "New feature" : "Nueva funcionalidad"}
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
          {isUS ? (
            <>
              Your grocery run, organized
              <br />
              <Box component="span" sx={{ color: C.brand }}>
                before you leave the house
              </Box>
            </>
          ) : (
            <>
              Tu super, organizado
              <br />
              <Box component="span" sx={{ color: C.brand }}>
                antes de salir de casa
              </Box>
            </>
          )}
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
          {isUS
            ? "Generate recipes and Nui builds your shopping list automatically. Cumulative, no duplicates, with the option to add whatever you want by hand."
            : "Generás recetas y Nui arma tu lista de compras automáticamente. Acumulativa, sin repetidos, con opción de agregar lo que quieras a mano."}
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
                      {isUS ? `Step ${i + 1}` : `Paso ${i + 1}`}
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
            {isUS
              ? "Try the shopping list for free"
              : "Probá la lista de compras gratis"}
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
                  {isUS ? "My shopping list" : "Mi lista de compras"}
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)" }}
              >
                {isUS ? "4 pending · 2 bought" : "4 pendientes · 2 comprados"}
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
                  {isUS ? "Add an item manually…" : "Agregar item manualmente…"}
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
                  {isUS ? "Remove bought items (2)" : "Quitar comprados (2)"}
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
                {isUS ? "Auto-added up" : "Suma automática"}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
              {isUS ? "3 eggs + 2 eggs" : "3 huevos + 2 huevos"}
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
                {isUS ? "5 eggs ✓" : "5 huevos ✓"}
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
                {isUS ? "From the recipe" : "Desde la receta"}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
              {isUS
                ? "1 tap adds every ingredient"
                : "1 tap agrega todos los ingredientes"}
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
        {(isUS
          ? [
              {
                Icon: AutorenewRoundedIcon,
                title: "No duplicates",
                desc: "Matching ingredients from different recipes add up instead of repeating.",
              },
              {
                Icon: EditRoundedIcon,
                title: "Add by hand",
                desc: "Add any item manually: cleaning supplies, snacks, whatever you need.",
              },
              {
                Icon: CheckRoundedIcon,
                title: "Check off as you shop",
                desc: "Check each item while you shop. The app remembers your progress.",
              },
              {
                Icon: PhoneIphoneRoundedIcon,
                title: "Always on your phone",
                desc: "Access it from the Dashboard or from any generated recipe.",
              },
            ]
          : [
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
            ]
        ).map((b) => (
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
};

/* ─── SECCIÓN DE VALOR — FONDO VERDE ─────────────────────────────────────── */
const getTrainingTypes = (isUS) =>
  isUS
    ? [
        "Hypertrophy routine",
        "Calisthenics plan",
        "Fit training",
        "Home workouts",
        "AI healthy recipes",
        "Automatic shopping list",
        "NOVA product analysis",
      ]
    : [
        "Rutina de hipertrofia",
        "Plan de calistenia",
        "Entrenamiento Fit",
        "Entrenamiento en casa",
        "Recetas saludables con IA",
        "Lista de compras automática",
        "Análisis NOVA de productos",
      ];

const CostComparisonSection = ({ onCTA }) => {
  const { isUS } = useNutrition();
  const TRAINING_TYPES = getTrainingTypes(isUS);
  return (
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
          {isUS ? "Everything in one place" : "Todo en un solo lugar"}
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
          {isUS ? (
            <>
              Your health assistant
              <br />
              <Box component="span" sx={{ color: C.mint }}>
                always available
              </Box>
            </>
          ) : (
            <>
              Tu asistente de salud
              <br />
              <Box component="span" sx={{ color: C.mint }}>
                siempre disponible
              </Box>
            </>
          )}
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
          {isUS
            ? "Nutrition analysis, personalized recipes, and a training plan tailored to your goals — available 24/7 from your phone."
            : "Análisis nutricional, recetas personalizadas y plan de entrenamiento adaptado a tus metas, disponibles las 24 hs desde tu celular."}
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
              {isUS ? "Gold Plan" : "Plan Gold"}
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
              {isUS ? "$12.99" : "$8.980"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.40)" }}>
              {isUS ? "per month · cancel anytime" : "por mes · cancelá cuando quieras"}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            {(isUS
              ? [
                  "Unlimited nutrition analysis",
                  "AI healthy recipes (Fit, Hypertrophy, Quick)",
                  "Daily energy balance by voice + monthly history",
                  "2 personalized training plans",
                  "Automatic shopping list from your recipes",
                ]
              : [
                  "Análisis nutricional ilimitado",
                  "Recetas saludables con IA (Fit, Hipertrofia, Rápidas)",
                  "Balance energético diario por voz + historial mensual",
                  "2 planes de entrenamiento personalizados",
                  "Lista de compras automática desde tus recetas",
                ]
            ).map((f) => (
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
          {isUS ? "Available goals" : "Objetivos disponibles"}
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
          {isUS ? "Try free for 7 days" : "Probá gratis 7 días"}
        </Button>
      </Box>
    </Box>
  </Box>
  );
};

/* ─── CÓMO FUNCIONA ───────────────────────────────────────────────────────── */
const getSteps = (isUS) =>
  isUS
    ? [
        {
          n: "01",
          Icon: PersonAddRoundedIcon,
          title: "Sign up in seconds",
          desc: "Create your free account with email or Google. No credit card. In 30 seconds you're using Nui at 100% for 7 days.",
        },
        {
          n: "02",
          Icon: AccountCircleRoundedIcon,
          title: "Set up your profile and goal",
          desc: "Enter your age, weight, height, and activity level. Choose whether you want to lose weight, maintain, or build muscle — Nui calculates your daily calorie target automatically.",
        },
        {
          n: "03",
          Icon: TrendingUpRoundedIcon,
          title: "Track your health in real time",
          desc: "Analyze food with the camera, log meals and activity by voice, train with your personalized plan, and follow your energy balance day by day — all integrated.",
        },
      ]
    : [
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

const HowItWorksSection = () => {
  const { isUS } = useNutrition();
  const STEPS = getSteps(isUS);
  return (
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
          {isUS ? "How it works" : "Así funciona"}
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
          {isUS ? "Get started in" : "Empezá en"}{" "}
          <Box component="span" sx={{ color: C.brand }}>
            {isUS ? "3 steps" : "3 pasos"}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 17, color: C.muted, lineHeight: 1.8 }}>
          {isUS
            ? "In under 2 minutes you're using Nui at 100%."
            : "En menos de 2 minutos ya estás usando Nui al 100%."}
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
              {isUS ? `Step ${s.n}` : `Paso ${s.n}`}
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
};

/* ─── PRICING ─────────────────────────────────────────────────────────────── */
const getPricingPlans = (isUS) =>
  isUS
    ? [
        {
          id: "free",
          name: "Free",
          Icon: RocketLaunchRoundedIcon,
          price: null,
          sub: "Free · 7 days",
          color: C.brand,
          border: C.brandBorder,
          bg: C.white,
          highlight: false,
          badge: null,
          features: [
            "Every module with no limits for 7 days",
            "Unlimited analysis",
            "Unlimited AI recipes",
            "Personalized training plan",
            "Accumulated daily energy balance (7 days)",
            "Full dashboard",
          ],
          cta: "Start free",
        },
        {
          id: "silver",
          name: "Silver",
          Icon: DiamondOutlinedIcon,
          price: 6.99,
          sub: "per month",
          color: "#71879C",
          border: "rgba(113,135,156,0.18)",
          bg: "#F8FAFC",
          highlight: false,
          badge: null,
          features: [
            "1 food analysis per day",
            "Unlimited AI recipes",
            "1 active training plan",
            "Daily energy balance by voice",
            "30-day analysis history",
            "Dashboard + metrics",
          ],
          cta: "Choose Silver",
        },
        {
          id: "gold",
          name: "Gold",
          Icon: WorkspacePremiumOutlinedIcon,
          price: 12.99,
          sub: "per month",
          color: "#B07D1A",
          border: "rgba(176,125,26,0.28)",
          bg: "linear-gradient(145deg,#FDF8EC,#FEFCF5)",
          highlight: true,
          badge: "Most popular",
          features: [
            "Unlimited daily analysis",
            "Unlimited AI recipes",
            "2 active training plans",
            "Daily energy balance by voice",
            "Monthly balance history (daily table)",
            "Unlimited full history",
            "Premium dashboard + detailed stats",
          ],
          cta: "Choose Gold",
        },
      ]
    : [
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

const formatUSDLanding = (n) => `$${n.toFixed(2)}`;

/* ─── Card de pricing reutilizable ───────────────────────────── */
const PricingCard = ({ p, onCTA, isActive }) => {
  const { isUS } = useNutrition();
  return (
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
          {isUS ? `${p.name} Plan` : `Plan ${p.name}`}
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
            {isUS ? formatUSDLanding(p.price) : formatARS(p.price)}
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: 13, color: C.muted, ml: 0.5 }}
          >
            {isUS ? "/mo" : "/mes"}
          </Typography>
        </>
      ) : (
        <Typography sx={{ fontSize: 30, fontWeight: 900, color: C.brand }}>
          {isUS ? "Free" : "Gratis"}
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
};

const PricingSection = ({ onCTA }) => {
  const { isUS } = useNutrition();
  const PRICING_PLANS = getPricingPlans(isUS);
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
            {isUS ? "Pricing" : "Precios"}
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
            {isUS ? (
              <>
                Choose the plan that
                <br />
                <Box component="span" sx={{ color: C.brand }}>
                  fits you best
                </Box>
              </>
            ) : (
              <>
                Elegí el plan que
                <br />
                <Box component="span" sx={{ color: C.brand }}>
                  mejor te quede
                </Box>
              </>
            )}
          </Typography>
          <Typography sx={{ fontSize: 17, color: C.muted, lineHeight: 1.8 }}>
            {isUS
              ? "Start with a 7-day free trial. Cancel anytime, no penalties."
              : "Empezá con 7 días gratis. Cancelá cuando quieras, sin penalidades."}
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
              {isUS ? "Secure payment processed by Stripe" : "Pago seguro a través de"}
            </Typography>
            {!isUS && (
              <Box
                component="img"
                src="/img/Logo Mp.svg"
                alt="Mercado Pago"
                sx={{ height: 28, opacity: 0.85 }}
              />
            )}
            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#2ECC71" }} />
            <Typography sx={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
              {isUS ? "Cancel anytime" : "Cancelá cuando quieras"}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

/* ─── CTA FINAL ───────────────────────────────────────────────────────────── */
const FinalCTA = ({ onCTA }) => {
  const { isUS } = useNutrition();
  return (
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
        {isUS ? "Start today" : "Empezá hoy"}
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
        {isUS ? "7 days completely" : "7 días completamente"}
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
          {isUS ? "free." : "gratis."}
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
        {isUS ? (
          <>
            No credit card. No commitments.
            <br />
            Try all 3 modules with no limits.
          </>
        ) : (
          <>
            Sin tarjeta de crédito. Sin compromisos.
            <br />
            Probá los 3 módulos sin límites.
          </>
        )}
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
        {isUS ? "Create free account" : "Crear cuenta gratis"}
      </Button>
    </Box>
  </Box>
  );
};

/* ─── EDITORIAL: post destacado + archivo ─────────────────────────────────── */

const fmtDateLanding = (d) =>
  new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "long" });

const LandingPostsSection = () => {
  const [featured, setFeatured] = useState(null);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = async (p, isFirst = false) => {
    if (isFirst) setLoading(true);
    else setArchiveLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/landing?page=${p}`);
      const data = await res.json();
      if (p === 1 && data.featured) setFeatured(data.featured);
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
              component={Link}
              to={`/blog/${buildPostSlug(featured)}`}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                bgcolor: "#fff",
                mb: 5,
                border: "1px solid rgba(11,94,85,0.10)",
                boxShadow: "0 4px 24px rgba(11,94,85,0.10)",
                cursor: "pointer",
                textDecoration: "none",
                color: "inherit",
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
                    component={Link}
                    to={`/blog/${buildPostSlug(p)}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.2,
                      px: 1.5,
                      cursor: "pointer",
                      borderRadius: 2,
                      textDecoration: "none",
                      color: "inherit",
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

    </Box>
  );
};

/* ─── FOOTER ──────────────────────────────────────────────────────────────── */
const LandingFooter = () => {
  const { isUS } = useNutrition();
  return (
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
          {(isUS
            ? [
                ["Privacy", "/privacidad"],
                ["Terms", "/terminos"],
                ["Contact", "/contact"],
                ["Pricing", "/pricing"],
              ]
            : [
                ["Privacidad", "/privacidad"],
                ["Términos", "/terminos"],
                ["Contacto", "/contact"],
                ["Precios", "/pricing"],
              ]
          ).map(([label, path]) => (
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
              {isUS
                ? "Secure payment processed by Stripe"
                : "Pago seguro procesado por"}
            </Typography>
            {!isUS && (
              <Box
                component="img"
                src="/img/Logo Mp Blanco.png"
                alt="Mercado Pago"
                sx={{
                  height: 48,
                  opacity: 0.9,
                }}
              />
            )}
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
              {isUS
                ? "SSL encrypted transaction · PCI DSS compliant"
                : "Transacción cifrada SSL · PCI DSS compliant"}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Cumplimiento normativo ARCA + Defensa del Consumidor (solo Argentina) */}
      {!isUS && (
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
      )}

      {/* Datos legales */}
      <Typography
        sx={{
          textAlign: "center",
          fontSize: 10.5,
          color: "rgba(255,255,255,0.18)",
          lineHeight: 1.7,
        }}
      >
        {isUS ? (
          <>
            Nui is a health and nutrition app. It does not replace
            professional medical advice.
            <br />
            Nutritional analysis is provided for guidance only. Consult a
            healthcare professional if you have questions.
          </>
        ) : (
          <>
            Nui es una aplicación de salud y nutrición. No reemplaza el consejo
            médico profesional.
            <br />
            Los análisis nutricionales son orientativos. Consultá con un
            profesional de la salud ante dudas.
          </>
        )}
      </Typography>
    </Box>
  </Box>
  );
};

/* ─── MAIN ────────────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const { isUS } = useNutrition();
  // La versión español replica EXACTO lo que ya trae index.html estático
  // (título/descripción/OG originales) — no cambia nada del comportamiento
  // por defecto. La versión inglés es la única con contenido/canonical
  // realmente propios, para /en como URL indexable en inglés.
  usePageMeta(
    isUS
      ? {
          title:         "Nui — Your AI Health Assistant | Nutrition, Recipes & Training",
          description:   "Nui is your AI health assistant. Scan food labels for instant analysis, generate personalized healthy recipes, get a training plan and track your daily energy balance by voice. Free for 7 days.",
          ogTitle:       "Nui — Your AI Health Assistant",
          ogDescription: "Analyze food, generate healthy recipes, train with AI and track your daily calorie balance by voice. All in one app. Free 7 days.",
          canonical:     "/en",
          alternates: [
            { hreflang: "es-AR",    href: "/" },
            { hreflang: "en",       href: "/en" },
            { hreflang: "x-default", href: "/" },
          ],
        }
      : {
          title:         "Nui — Tu asistente de salud con IA | Nutrición, Recetas y Entrenamiento",
          description:   "Nui es tu asistente de salud con IA. Analizá alimentos escaneando etiquetas, generá recetas saludables personalizadas, entrenamiento y seguí tu balance energético diario por voz. Gratis por 7 días.",
          ogTitle:       "Nui — Tu asistente de salud con IA",
          ogDescription: "Analizá alimentos, generá recetas saludables, entrená con IA y controlá tu balance calórico diario por voz. Todo en una sola app. Gratis 7 días.",
          canonical:     "/",
          alternates: [
            { hreflang: "es-AR",    href: "/" },
            { hreflang: "en",       href: "/en" },
            { hreflang: "x-default", href: "/" },
          ],
        }
  );
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
