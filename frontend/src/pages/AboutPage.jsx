import { Box, Typography, Chip, Stack, Paper } from "@mui/material";
import usePageMeta from "../hooks/usePageMeta";
import { useNutrition } from "../context/NutritionContext";
import SpaRoundedIcon             from "@mui/icons-material/SpaRounded";
import InsightsRoundedIcon        from "@mui/icons-material/InsightsRounded";
import VerifiedRoundedIcon        from "@mui/icons-material/VerifiedRounded";
import PsychologyRoundedIcon      from "@mui/icons-material/PsychologyRounded";
import AutoAwesomeRoundedIcon     from "@mui/icons-material/AutoAwesomeRounded";
import SearchRoundedIcon          from "@mui/icons-material/SearchRounded";
import RestaurantRoundedIcon      from "@mui/icons-material/RestaurantRounded";
import FitnessCenterRoundedIcon   from "@mui/icons-material/FitnessCenterRounded";
import BoltRoundedIcon            from "@mui/icons-material/BoltRounded";

const C = {
  brand:        "#0B5E55",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F7F9F8",
  border:       "rgba(11,94,85,0.10)",
  borderMed:    "rgba(11,94,85,0.18)",
  textPrimary:  "#0F2420",
  textSecondary:"#4A6B67",
  textMuted:    "#8AADAA",
};

/* ── Módulos ─────────────────────────────────────────────────────────────── */
const MODULES = [
  {
    Icon: SearchRoundedIcon,
    title: "Análisis de alimentos",
    subtitle: "El núcleo de Nui",
    color: "#0B5E55",
    bg:    "#E6F5F3",
    border:"rgba(11,94,85,0.20)",
    body:  "Fotografiás el envase de cualquier alimento y Nui te dice si es natural, procesado o ultraprocesado — con un puntaje del 0 al 100 y recomendaciones claras. El objetivo es simple: ayudarte a reducir los ultraprocesados en tu dieta cotidiana.",
    tags:  ["Ultraprocesados", "Puntaje 0–100", "Aditivos", "Clasificación NOVA"],
  },
  {
    Icon: RestaurantRoundedIcon,
    title: "Recetas YA",
    subtitle: "Comé bien sin complicaciones",
    color: "#6A1B9A",
    bg:    "#F3E5F5",
    border:"rgba(106,27,154,0.20)",
    body:  "Elegís el tipo de plato (fit, hipertrofia, rápido, desayuno) y el momento del día, y la IA genera tres opciones al instante con ingredientes reales y pasos detallados. Podés guardar tus favoritas y compartirlas.",
    tags:  ["Fit", "Hipertrofia", "Rápidas", "Desayunos", "Guardá y compartí"],
  },
  {
    Icon: FitnessCenterRoundedIcon,
    title: "Entrenamiento",
    subtitle: "Moverse también cuenta",
    color: "#BF360C",
    bg:    "#FBE9E7",
    border:"rgba(191,54,12,0.20)",
    body:  "Nui genera un plan de entrenamiento personalizado según tu perfil físico, el tipo de actividad y el lugar donde entrenás. Registrás cada sesión, seguís tu progresión de cargas y cada sesión completada suma puntos saludables y calorías quemadas al balance del día.",
    tags:  ["Hipertrofia", "Fit", "Calistenia", "Seguimiento", "Progresión"],
  },
  {
    Icon: BoltRoundedIcon,
    title: "Balance energético",
    subtitle: "Nutrición de precisión",
    color: "#0B5E55",
    bg:    "#E6F5F3",
    border:"rgba(11,94,85,0.20)",
    body:  "Registrá lo que comés y tu actividad del día usando el micrófono — en lenguaje natural. La IA interpreta porciones, estima calorías y macros, y calcula tu balance energético en tiempo real considerando tu metabolismo basal, nivel de actividad y objetivo (bajar peso, mantener o ganar músculo).",
    tags:  ["Voz", "Calorías", "Macros", "TDEE", "Déficit / Superávit"],
  },
];

// Misma estructura que MODULES (mismos Icon/color/bg/border) — solo texto en
// inglés, se usa cuando isUS. Mantenerla en sync manualmente si se edita MODULES.
const MODULES_EN = [
  {
    Icon: SearchRoundedIcon,
    title: "Food analysis",
    subtitle: "Nui's core feature",
    color: "#0B5E55",
    bg:    "#E6F5F3",
    border:"rgba(11,94,85,0.20)",
    body:  "Snap a photo of any food label and Nui tells you whether it's natural, processed, or ultra-processed — with a 0-to-100 score and clear recommendations. The goal is simple: help you cut back on ultra-processed foods in your everyday diet.",
    tags:  ["Ultra-processed", "0–100 score", "Additives", "NOVA classification"],
  },
  {
    Icon: RestaurantRoundedIcon,
    title: "Recipes NOW",
    subtitle: "Eat well, no hassle",
    color: "#6A1B9A",
    bg:    "#F3E5F5",
    border:"rgba(106,27,154,0.20)",
    body:  "Pick the type of dish (fit, muscle-building, quick, breakfast) and the time of day, and the AI generates three options instantly with real ingredients and detailed steps. Save your favorites and share them.",
    tags:  ["Fit", "Muscle-building", "Quick", "Breakfast", "Save & share"],
  },
  {
    Icon: FitnessCenterRoundedIcon,
    title: "Training",
    subtitle: "Movement counts too",
    color: "#BF360C",
    bg:    "#FBE9E7",
    border:"rgba(191,54,12,0.20)",
    body:  "Nui builds a personalized training plan based on your physical profile, activity type, and where you train. Log each session, track your load progression, and every completed workout adds healthy points and burned calories to your daily balance.",
    tags:  ["Muscle-building", "Fit", "Calisthenics", "Tracking", "Progression"],
  },
  {
    Icon: BoltRoundedIcon,
    title: "Energy balance",
    subtitle: "Precision nutrition",
    color: "#0B5E55",
    bg:    "#E6F5F3",
    border:"rgba(11,94,85,0.20)",
    body:  "Log what you eat and your daily activity using your voice — in natural language. The AI interprets portions, estimates calories and macros, and calculates your energy balance in real time based on your basal metabolism, activity level, and goal (lose weight, maintain, or build muscle).",
    tags:  ["Voice", "Calories", "Macros", "TDEE", "Deficit / Surplus"],
  },
];

/* ── Principios ──────────────────────────────────────────────────────────── */
const PRINCIPIOS = [
  {
    Icon: VerifiedRoundedIcon,
    title: "Sin inventar nada",
    body:  "El análisis de alimentos se basa exclusivamente en lo que el fabricante declara en el envase. Aplicamos criterios objetivos — no opiniones.",
    grad:  "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
  },
  {
    Icon: InsightsRoundedIcon,
    title: "Datos que se entienden",
    body:  "Convertimos tablas nutricionales complejas y listas de ingredientes interminables en información clara, visual y accionable.",
    grad:  "linear-gradient(135deg, #0f7a6e 0%, #138578 100%)",
  },
  {
    Icon: PsychologyRoundedIcon,
    title: "Personalizado a vos",
    body:  "Tu perfil físico (edad, peso, actividad) guía tanto el análisis nutricional como las recetas y los planes de entrenamiento.",
    grad:  "linear-gradient(135deg, #138578 0%, #1a9080 100%)",
  },
  {
    Icon: AutoAwesomeRoundedIcon,
    title: "Integral: comida, movimiento y energía",
    body:  "Cuidar lo que comés, mantenerte activo y conocer tu balance calórico real son las tres claves de una vida saludable. Nui integra los tres hábitos con datos concretos y en tiempo real.",
    grad:  "linear-gradient(135deg, #0a5249 0%, #0B5E55 100%)",
  },
];

// Misma estructura que PRINCIPIOS (mismos Icon/grad) — solo texto en inglés,
// se usa cuando isUS. Mantenerla en sync manualmente si se edita PRINCIPIOS.
const PRINCIPIOS_EN = [
  {
    Icon: VerifiedRoundedIcon,
    title: "Nothing made up",
    body:  "Food analysis is based exclusively on what the manufacturer declares on the label. We apply objective criteria — not opinions.",
    grad:  "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
  },
  {
    Icon: InsightsRoundedIcon,
    title: "Data you can actually understand",
    body:  "We turn complex nutrition tables and endless ingredient lists into information that's clear, visual, and actionable.",
    grad:  "linear-gradient(135deg, #0f7a6e 0%, #138578 100%)",
  },
  {
    Icon: PsychologyRoundedIcon,
    title: "Personalized to you",
    body:  "Your physical profile (age, weight, activity level) guides your food analysis, recipes, and training plans alike.",
    grad:  "linear-gradient(135deg, #138578 0%, #1a9080 100%)",
  },
  {
    Icon: AutoAwesomeRoundedIcon,
    title: "All-in-one: food, movement, and energy",
    body:  "Watching what you eat, staying active, and knowing your real calorie balance are the three keys to a healthy life. Nui brings all three together with real-time, concrete data.",
    grad:  "linear-gradient(135deg, #0a5249 0%, #0B5E55 100%)",
  },
];

/* ── Componente ──────────────────────────────────────────────────────────── */
const AboutPage = () => {
  const { isUS } = useNutrition();
  usePageMeta(
    isUS
      ? {
          title:       "About Us — Nui App",
          description: "Nui is an AI health assistant. Learn about our modules: food analysis, personalized recipes, training plans and daily energy tracking.",
          canonical:   "/en/about",
          alternates: [
            { hreflang: "es-AR",    href: "/about" },
            { hreflang: "en",       href: "/en/about" },
            { hreflang: "x-default", href: "/about" },
          ],
        }
      : {
          title:       "Quiénes somos — Nui App",
          description: "Nui es un asistente de salud con IA para Argentina. Conocé los módulos: análisis de alimentos, recetas personalizadas, entrenamiento y balance energético diario.",
          canonical:   "/about",
          alternates: [
            { hreflang: "es-AR",    href: "/about" },
            { hreflang: "en",       href: "/en/about" },
            { hreflang: "x-default", href: "/about" },
          ],
        }
  );
  return (
  <Box sx={{
    minHeight: "100vh",
    background: "linear-gradient(160deg, #edf8f5 0%, #ffffff 55%, #f4f9f7 100%)",
    position: "relative",
    overflow: "hidden",
    "@keyframes fadeUp":  { from: { opacity: 0, transform: "translateY(28px)" }, to: { opacity: 1, transform: "translateY(0)" } },
    "@keyframes scaleIn": { from: { opacity: 0, transform: "scale(0.92)"      }, to: { opacity: 1, transform: "scale(1)"      } },
  }}>
    {/* Blobs */}
    <Box sx={{ position: "absolute", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,85,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
    <Box sx={{ position: "absolute", bottom: 0, left: -140, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,85,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

    <Box sx={{ px: { xs: 3, sm: 6, md: 10 }, pt: { xs: 11, sm: 15 }, pb: 12, maxWidth: 1080, mx: "auto", position: "relative" }}>

      {/* ══════════ HERO ══════════ */}
      <Box textAlign="center" sx={{ mb: 10, animation: "fadeUp 0.65s ease both" }}>
        <Chip
          icon={<SpaRoundedIcon sx={{ fontSize: "14px !important", color: `${C.brand} !important` }} />}
          label={isUS ? "Who we are" : "Quiénes somos"}
          sx={{ mb: 3, bgcolor: C.brandSurface, color: C.brand, fontWeight: 700, fontSize: 12, border: `1px solid ${C.brandMuted}`, px: 0.5 }}
        />

        <Typography variant="h3" component="h1" fontWeight={900} sx={{
          letterSpacing: "-1.5px", lineHeight: 1.12, mb: 3,
          background: `linear-gradient(135deg, ${C.textPrimary} 30%, ${C.brandLight} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          fontSize: { xs: 32, sm: 44 },
        }}>
          {isUS ? <>Nui: real healthy<br />habits</> : <>Nui: hábitos saludables<br />de verdad</>}
        </Typography>

        <Typography sx={{ fontSize: { xs: 15, sm: 17 }, color: C.textSecondary, maxWidth: 600, mx: "auto", lineHeight: 1.8 }}>
          {isUS
            ? <>Nui is an app for building healthy habits, concretely. Scan what you eat to find out if it's <strong>ultra-processed</strong>, cook with <strong>AI-generated recipes</strong>, and follow a <strong>personalized training plan</strong> — all from your phone.</>
            : <>Nui es una app para construir hábitos saludables de forma concreta. Analizás lo que comés para entender si es <strong>ultraprocesado</strong>, cocinás con <strong>recetas generadas por IA</strong> y seguís un <strong>plan de entrenamiento personalizado</strong> — todo desde el celular.</>}
        </Typography>

        {/* 3 módulos en píldoras */}
        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap mt={4}>
          {(isUS ? [
            { Icon: SearchRoundedIcon, label: "Analysis",  color: "#0B5E55", bg: "#E6F5F3" },
            { Icon: RestaurantRoundedIcon, label: "Recipes NOW", color: "#6A1B9A", bg: "#F3E5F5" },
            { Icon: FitnessCenterRoundedIcon, label: "Training", color: "#BF360C", bg: "#FBE9E7" },
          ] : [
            { Icon: SearchRoundedIcon, label: "Análisis",      color: "#0B5E55", bg: "#E6F5F3" },
            { Icon: RestaurantRoundedIcon, label: "Recetas YA",    color: "#6A1B9A", bg: "#F3E5F5" },
            { Icon: FitnessCenterRoundedIcon, label: "Entrenamiento", color: "#BF360C", bg: "#FBE9E7" },
          ]).map((p) => (
            <Box key={p.label} sx={{ px: 2.2, py: 0.9, borderRadius: 999, bgcolor: p.bg, border: `1.5px solid ${p.color}25`, display: "inline-flex", alignItems: "center", gap: 0.8 }}>
              <p.Icon sx={{ fontSize: 17, color: p.color }} />
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: p.color }}>{p.label}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ══════════ POR QUÉ EXISTE NUI ══════════ */}
      <Box sx={{ mb: 10, animation: "fadeUp 0.65s 0.1s ease both" }}>
        <Paper elevation={0} sx={{
          borderRadius: 5, overflow: "hidden",
          border: `1px solid ${C.borderMed}`,
          boxShadow: "0 4px 24px rgba(11,94,85,0.07)",
          display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}>
          {/* Izq: el problema */}
          <Box sx={{ p: { xs: 3.5, md: 5 }, borderRight: { xs: "none", md: `1px solid ${C.border}` }, borderBottom: { xs: `1px solid ${C.border}`, md: "none" } }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#B71C1C", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
              {isUS ? "The problem" : "El problema"}
            </Typography>
            <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px", mb: 2, lineHeight: 1.3 }}>
              {isUS ? "Ultra-processed foods disguise themselves as normal food" : "Los ultraprocesados se disfrazan de alimentos normales"}
            </Typography>
            <Typography sx={{ fontSize: 14.5, color: C.textSecondary, lineHeight: 1.8 }}>
              {isUS
                ? "Most products on a supermarket shelf are ultra-processed: they contain dozens of additives, colorings, and artificial preservatives that consumers can't identify at a glance. Frequent consumption is linked to obesity, type 2 diabetes, hypertension, and other chronic health problems."
                : "La mayoría de los productos en un supermercado son ultraprocesados: contienen docenas de aditivos, colorantes y conservantes artificiales que el consumidor no puede identificar a simple vista. Su consumo frecuente está asociado con obesidad, diabetes tipo 2, hipertensión y otros problemas de salud crónicos."}
            </Typography>
          </Box>

          {/* Der: la solución */}
          <Box sx={{ p: { xs: 3.5, md: 5 }, bgcolor: C.surfaceAlt }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: C.brand, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
              {isUS ? "The solution" : "La solución"}
            </Typography>
            <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px", mb: 2, lineHeight: 1.3 }}>
              {isUS ? "Clear information right when you need it" : "Información clara en el momento que la necesitás"}
            </Typography>
            <Typography sx={{ fontSize: 14.5, color: C.textSecondary, lineHeight: 1.8 }}>
              {isUS
                ? "Nui analyzes the label of any packaged food and tells you in seconds whether it's natural, processed, or ultra-processed. It also gives you the context to understand it and alternatives to choose better. Combined with healthy recipes and a workout plan, Nui supports your habit change every step of the way."
                : "Nui analiza el etiquetado de cualquier alimento envasado y te dice en segundos si es natural, procesado o ultraprocesado. Además te da el contexto para entenderlo y alternativas para elegir mejor. Combinado con recetas saludables y un plan de ejercicio, Nui te acompaña en el cambio de hábitos de forma integral."}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ══════════ LOS 3 MÓDULOS ══════════ */}
      <Box sx={{ mb: 10 }}>
        <Box textAlign="center" mb={5} sx={{ animation: "fadeUp 0.65s 0.15s ease both" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: C.brand, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
            {isUS ? "What Nui does" : "Qué hace Nui"}
          </Typography>
          <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.8px", color: C.textPrimary, fontSize: { xs: 22, sm: 28 } }}>
            {isUS ? "Three tools, one goal" : "Tres herramientas, un mismo objetivo"}
          </Typography>
        </Box>

        <Stack spacing={3}>
          {(isUS ? MODULES_EN : MODULES).map((m, i) => (
            <Box key={m.title} sx={{ animation: `fadeUp 0.65s ${0.2 + i * 0.12}s ease both` }}>
              <Paper elevation={0} sx={{
                borderRadius: 5, overflow: "hidden",
                border: `1.5px solid ${m.border}`,
                boxShadow: "0 2px 16px rgba(11,94,85,0.06)",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" },
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: `0 16px 40px ${m.border}` },
              }}>
                {/* Icono lateral */}
                <Box sx={{
                  bgcolor: m.bg,
                  px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 },
                  display: "flex", flexDirection: { xs: "row", sm: "column" },
                  alignItems: "center", justifyContent: "center", gap: 1,
                  borderRight: { xs: "none", sm: `1px solid ${m.border}` },
                  borderBottom: { xs: `1px solid ${m.border}`, sm: "none" },
                }}>
                  <m.Icon sx={{ fontSize: { xs: 32, sm: 44 }, color: m.color }} />
                  <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 900, color: m.color, letterSpacing: "-0.2px", lineHeight: 1.2 }}>{m.title}</Typography>
                    <Typography sx={{ fontSize: 11, color: m.color, opacity: 0.7, fontWeight: 600 }}>{m.subtitle}</Typography>
                  </Box>
                </Box>

                {/* Contenido */}
                <Box sx={{ p: { xs: 3, sm: 3.5 } }}>
                  <Typography sx={{ fontSize: 14.5, color: C.textSecondary, lineHeight: 1.8, mb: 2 }}>
                    {m.body}
                  </Typography>
                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                    {m.tags.map((tag) => (
                      <Box key={tag} sx={{ px: 1.4, py: 0.4, borderRadius: 999, bgcolor: m.bg, border: `1px solid ${m.border}` }}>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: m.color }}>{tag}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ══════════ PRINCIPIOS ══════════ */}
      <Box sx={{ mb: 10 }}>
        <Box textAlign="center" mb={5} sx={{ animation: "fadeUp 0.65s 0.35s ease both" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: C.brand, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
            {isUS ? "How we do it" : "Cómo lo hacemos"}
          </Typography>
          <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.8px", color: C.textPrimary, fontSize: { xs: 22, sm: 28 } }}>
            {isUS ? "Our principles" : "Nuestros principios"}
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          {(isUS ? PRINCIPIOS_EN : PRINCIPIOS).map(({ Icon, title, body, grad }, i) => (
            <Box key={title} sx={{
              bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: 4,
              p: { xs: 3, sm: 3.5 }, display: "flex", gap: 2.5, alignItems: "flex-start",
              boxShadow: "0 2px 12px rgba(11,94,85,0.06)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              animation: `fadeUp 0.65s ${0.4 + i * 0.1}s ease both`,
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 48px rgba(11,94,85,0.12)", borderColor: C.brandMuted },
            }}>
              <Box sx={{ flexShrink: 0, width: 50, height: 50, borderRadius: 3, background: grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(11,94,85,0.28)" }}>
                <Icon sx={{ fontSize: 24, color: "#fff" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary, mb: 0.8 }}>{title}</Typography>
                <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.7 }}>{body}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══════════ MISIÓN BANNER ══════════ */}
      <Box sx={{
        borderRadius: 5,
        background: `linear-gradient(135deg, ${C.brand} 0%, #0f7a6e 100%)`,
        p: { xs: 4, md: 6 },
        textAlign: "center",
        boxShadow: "0 16px 48px rgba(11,94,85,0.28)",
        position: "relative", overflow: "hidden",
        animation: "scaleIn 0.7s 0.55s ease both",
      }}>
        <Box sx={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -40, width: 260, height: 260, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
          {isUS ? "Our mission" : "Nuestra misión"}
        </Typography>
        <Typography sx={{ fontSize: { xs: 20, md: 26 }, fontWeight: 800, color: "#fff", lineHeight: 1.5, maxWidth: 720, mx: "auto", letterSpacing: "-0.5px", mb: 2.5 }}>
          {isUS
            ? "We want anyone to be able to know how processed what they eat really is, cook well without the hassle, and stay active — without needing to be a nutrition or fitness expert."
            : "Queremos que cualquier persona pueda saber qué tan procesado es lo que come, cocinar bien sin complicarse y mantenerse activa — sin necesitar ser experta en nutrición ni en fitness."}
        </Typography>
        <Typography sx={{ fontSize: { xs: 13, md: 14.5 }, color: "rgba(255,255,255,0.60)", maxWidth: 580, mx: "auto", lineHeight: 1.7, fontStyle: "italic" }}>
          {isUS
            ? "Nui doesn't replace the advice of a doctor, dietitian, or professional trainer. It's a tool to help you understand your habits better and make more informed decisions every day."
            : "Nui no reemplaza el consejo de un médico, nutricionista o entrenador profesional. Es una herramienta para entender mejor tus hábitos y tomar decisiones más informadas cada día."}
        </Typography>
      </Box>

    </Box>
  </Box>
  );
};

export default AboutPage;
