import { Box, Typography, Chip, Stack, Paper } from "@mui/material";
import SpaRoundedIcon             from "@mui/icons-material/SpaRounded";
import InsightsRoundedIcon        from "@mui/icons-material/InsightsRounded";
import VerifiedRoundedIcon        from "@mui/icons-material/VerifiedRounded";
import PsychologyRoundedIcon      from "@mui/icons-material/PsychologyRounded";
import AutoAwesomeRoundedIcon     from "@mui/icons-material/AutoAwesomeRounded";

const C = {
  brand:        "#bae0dc",
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
    emoji: "🔍",
    title: "Análisis de alimentos",
    subtitle: "El núcleo de Nui",
    color: "#bae0dc",
    bg:    "#E6F5F3",
    border:"rgba(11,94,85,0.20)",
    body:  "Fotografiás el envase de cualquier alimento y Nui te dice si es natural, procesado o ultraprocesado — con un puntaje del 0 al 100 y recomendaciones claras. El objetivo es simple: ayudarte a reducir los ultraprocesados en tu dieta cotidiana.",
    tags:  ["Ultraprocesados", "Puntaje 0–100", "Aditivos", "Clasificación NOVA"],
  },
  {
    emoji: "🍽️",
    title: "Recetas YA",
    subtitle: "Comé bien sin complicaciones",
    color: "#6A1B9A",
    bg:    "#F3E5F5",
    border:"rgba(106,27,154,0.20)",
    body:  "Elegís el tipo de plato (fit, hipertrofia, rápido, desayuno) y el momento del día, y la IA genera tres opciones al instante con ingredientes reales y pasos detallados. Podés guardar tus favoritas y compartirlas.",
    tags:  ["Fit", "Hipertrofia", "Rápidas", "Desayunos", "Guardá y compartí"],
  },
  {
    emoji: "🏋️",
    title: "Entrenamiento",
    subtitle: "Moverse también cuenta",
    color: "#BF360C",
    bg:    "#FBE9E7",
    border:"rgba(191,54,12,0.20)",
    body:  "Nui genera un plan de entrenamiento personalizado según tu perfil físico, el tipo de actividad y el lugar donde entrenás. Registrás cada sesión, seguís tu progresión de cargas y cada sesión completada suma puntos saludables.",
    tags:  ["Calistenia", "Hipertrofia", "Running", "Seguimiento", "Progresión"],
  },
];

/* ── Principios ──────────────────────────────────────────────────────────── */
const PRINCIPIOS = [
  {
    Icon: VerifiedRoundedIcon,
    title: "Sin inventar nada",
    body:  "El análisis de alimentos se basa exclusivamente en lo que el fabricante declara en el envase. Aplicamos criterios objetivos — no opiniones.",
    grad:  "linear-gradient(135deg, #bae0dc 0%, #0f7a6e 100%)",
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
    title: "Integral: comida y movimiento",
    body:  "Cuidar lo que comés y mantenerse activo son las dos caras de la misma moneda. Nui trabaja los dos hábitos juntos, con puntos saludables que reflejan ambos.",
    grad:  "linear-gradient(135deg, #0a5249 0%, #bae0dc 100%)",
  },
];

/* ── Componente ──────────────────────────────────────────────────────────── */
const AboutPage = () => (
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
          label="Quiénes somos"
          sx={{ mb: 3, bgcolor: C.brandSurface, color: "#2a6e67", fontWeight: 700, fontSize: 12, border: `1px solid ${C.brandMuted}`, px: 0.5 }}
        />

        <Typography variant="h3" fontWeight={900} sx={{
          letterSpacing: "-1.5px", lineHeight: 1.12, mb: 3,
          background: `linear-gradient(135deg, ${C.textPrimary} 30%, ${C.brandLight} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          fontSize: { xs: 32, sm: 44 },
        }}>
          Nui: hábitos saludables<br />de verdad
        </Typography>

        <Typography sx={{ fontSize: { xs: 15, sm: 17 }, color: C.textSecondary, maxWidth: 600, mx: "auto", lineHeight: 1.8 }}>
          Nui es una app para construir hábitos saludables de forma concreta. Analizás lo que comés para entender si es <strong>ultraprocesado</strong>, cocinás con <strong>recetas generadas por IA</strong> y seguís un <strong>plan de entrenamiento personalizado</strong> — todo desde el celular.
        </Typography>

        {/* 3 módulos en píldoras */}
        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap mt={4}>
          {[
            { emoji: "🔍", label: "Análisis",      color: "#bae0dc", bg: "#E6F5F3" },
            { emoji: "🍽️", label: "Recetas YA",    color: "#6A1B9A", bg: "#F3E5F5" },
            { emoji: "🏋️", label: "Entrenamiento", color: "#BF360C", bg: "#FBE9E7" },
          ].map((p) => (
            <Box key={p.label} sx={{ px: 2.2, py: 0.9, borderRadius: 999, bgcolor: p.bg, border: `1.5px solid ${p.color}25`, display: "inline-flex", alignItems: "center", gap: 0.8 }}>
              <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{p.emoji}</Typography>
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
              El problema
            </Typography>
            <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px", mb: 2, lineHeight: 1.3 }}>
              Los ultraprocesados se disfrazan de alimentos normales
            </Typography>
            <Typography sx={{ fontSize: 14.5, color: C.textSecondary, lineHeight: 1.8 }}>
              La mayoría de los productos en un supermercado son ultraprocesados: contienen docenas de aditivos, colorantes y conservantes artificiales que el consumidor no puede identificar a simple vista. Su consumo frecuente está asociado con obesidad, diabetes tipo 2, hipertensión y otros problemas de salud crónicos.
            </Typography>
          </Box>

          {/* Der: la solución */}
          <Box sx={{ p: { xs: 3.5, md: 5 }, bgcolor: C.surfaceAlt }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#2a6e67", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
              La solución
            </Typography>
            <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px", mb: 2, lineHeight: 1.3 }}>
              Información clara en el momento que la necesitás
            </Typography>
            <Typography sx={{ fontSize: 14.5, color: C.textSecondary, lineHeight: 1.8 }}>
              Nui analiza el etiquetado de cualquier alimento envasado y te dice en segundos si es natural, procesado o ultraprocesado. Además te da el contexto para entenderlo y alternativas para elegir mejor. Combinado con recetas saludables y un plan de ejercicio, Nui te acompaña en el cambio de hábitos de forma integral.
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ══════════ LOS 3 MÓDULOS ══════════ */}
      <Box sx={{ mb: 10 }}>
        <Box textAlign="center" mb={5} sx={{ animation: "fadeUp 0.65s 0.15s ease both" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#2a6e67", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
            Qué hace Nui
          </Typography>
          <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.8px", color: C.textPrimary, fontSize: { xs: 22, sm: 28 } }}>
            Tres herramientas, un mismo objetivo
          </Typography>
        </Box>

        <Stack spacing={3}>
          {MODULES.map((m, i) => (
            <Box key={m.title} sx={{ animation: `fadeUp 0.65s ${0.2 + i * 0.12}s ease both` }}>
              <Paper elevation={0} sx={{
                borderRadius: 5, overflow: "hidden",
                border: `1.5px solid ${m.border}`,
                boxShadow: "0 2px 16px rgba(11,94,85,0.06)",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
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
                  minWidth: { sm: 120 },
                }}>
                  <Typography sx={{ fontSize: { xs: 32, sm: 44 }, lineHeight: 1 }}>{m.emoji}</Typography>
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
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#2a6e67", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
            Cómo lo hacemos
          </Typography>
          <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.8px", color: C.textPrimary, fontSize: { xs: 22, sm: 28 } }}>
            Nuestros principios
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          {PRINCIPIOS.map(({ Icon, title, body, grad }, i) => (
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
          Nuestra misión
        </Typography>
        <Typography sx={{ fontSize: { xs: 20, md: 26 }, fontWeight: 800, color: "#fff", lineHeight: 1.5, maxWidth: 720, mx: "auto", letterSpacing: "-0.5px", mb: 2.5 }}>
          Queremos que cualquier persona pueda saber qué tan procesado es lo que come, cocinar bien sin complicarse y mantenerse activa — sin necesitar ser experta en nutrición ni en fitness.
        </Typography>
        <Typography sx={{ fontSize: { xs: 13, md: 14.5 }, color: "rgba(255,255,255,0.60)", maxWidth: 580, mx: "auto", lineHeight: 1.7, fontStyle: "italic" }}>
          Nui no reemplaza el consejo de un médico, nutricionista o entrenador profesional. Es una herramienta para entender mejor tus hábitos y tomar decisiones más informadas cada día.
        </Typography>
      </Box>

    </Box>
  </Box>
);

export default AboutPage;
