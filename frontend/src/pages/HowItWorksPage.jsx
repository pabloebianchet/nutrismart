import { Box, Typography, Chip, Stack, Paper } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import DocumentScannerRoundedIcon from "@mui/icons-material/DocumentScannerRounded";

const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.10)",
  borderMed: "rgba(11,94,85,0.18)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
};

/* ── Escala NOVA de procesamiento ─────────────────────────────────────────── */
const NOVA = [
  {
    label: "No procesado",
    emoji: "🥦",
    desc: "Alimentos frescos o con mínima manipulación. Frutas, verduras, carnes, huevos, legumbres.",
    color: "#2E7D32",
    bg: "#E8F5E9",
    border: "rgba(46,125,50,0.22)",
    badge: "Ideal",
  },
  {
    label: "Procesado",
    emoji: "🧂",
    desc: "Ingredientes simples añadidos para conservar o realzar sabor. Quesos, conservas, panes artesanales.",
    color: "#E65100",
    bg: "#FFF3E0",
    border: "rgba(230,81,0,0.22)",
    badge: "Moderado",
  },
  {
    label: "Ultraprocesado",
    emoji: "🍟",
    desc: "Formulaciones industriales con aditivos, colorantes, saborizantes artificiales. Snacks, gaseosas, embutidos.",
    color: "#B71C1C",
    bg: "#FFEBEE",
    border: "rgba(183,28,28,0.22)",
    badge: "Limitá su consumo",
  },
];

/* ── Pasos del análisis ───────────────────────────────────────────────────── */
const STEPS = [
  {
    n: "01",
    Icon: PhotoCameraRoundedIcon,
    title: "Fotografiá el envase",
    body: "Capturás la tabla nutricional y la lista de ingredientes. NUI App puede analizar desde una simple foto del celular hasta el código de barras del producto.",
    color: "#0B5E55",
    accent: "rgba(11,94,85,0.12)",
  },
  {
    n: "02",
    Icon: AutoAwesomeRoundedIcon,
    title: "La IA procesa el contenido",
    body: "Nuestro motor de inteligencia artificial identifica cada ingrediente, detecta aditivos y evalúa la información nutricional según criterios científicos reconocidos internacionalmente.",
    color: "#0f7a6e",
    accent: "rgba(15,122,110,0.12)",
  },
  {
    n: "03",
    Icon: InsightsRoundedIcon,
    title: "Recibís tu evaluación",
    body: "Obtenés una clasificación (no procesado / procesado / ultraprocesado), un puntaje del 0 al 100 y recomendaciones concretas sobre cómo impacta ese alimento en tu salud.",
    color: "#138578",
    accent: "rgba(19,133,120,0.12)",
  },
];

/* ── Módulos de la app ────────────────────────────────────────────────────── */
const MODULES = [
  {
    emoji: "🔍",
    title: "Análisis de alimentos",
    color: "#0B5E55",
    bg: "#E6F5F3",
    border: "rgba(11,94,85,0.20)",
    features: [
      "Clasificación ultraprocesado / procesado / no procesado",
      "Puntaje global 0–100 basado en calidad nutricional",
      "Detección de aditivos, colorantes y conservantes",
      "Recomendación personalizada según tu perfil",
    ],
  },
  {
    emoji: "🍽️",
    title: "Recetas YA",
    color: "#6A1B9A",
    bg: "#F3E5F5",
    border: "rgba(106,27,154,0.20)",
    features: [
      "Recetas fit, de hipertrofia, rápidas y desayunos",
      "Adaptadas al momento del día (almuerzo, cena, snack…)",
      "Ingredientes + pasos detallados generados con IA",
      "Guardá y compartí tus recetas favoritas",
    ],
  },
  {
    emoji: "🏋️",
    title: "Entrenamiento",
    color: "#BF360C",
    bg: "#FBE9E7",
    border: "rgba(191,54,12,0.20)",
    features: [
      "Plan personalizado según tu perfil físico con IA",
      "Calistenia, Hipertrofia, Running, Fit y más",
      "Seguimiento de sesiones y progresión de cargas",
      "Tips semanales y fases de progresión",
    ],
  },
];

/* ── Componente principal ─────────────────────────────────────────────────── */
const HowItWorksPage = () => (
  <Box
    sx={{
      minHeight: "100vh",
      background:
        "linear-gradient(160deg, #edf8f5 0%, #ffffff 55%, #f4f9f7 100%)",
      position: "relative",
      overflow: "hidden",
      "@keyframes fadeUp": {
        from: { opacity: 0, transform: "translateY(28px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
    }}
  >
    {/* Blobs de fondo */}
    <Box
      sx={{
        position: "absolute",
        top: -100,
        right: -100,
        width: 440,
        height: 440,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(11,94,85,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        bottom: 60,
        left: -120,
        width: 480,
        height: 480,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(11,94,85,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />

    <Box
      sx={{
        px: { xs: 3, sm: 6, md: 10 },
        pt: { xs: 11, sm: 15 },
        pb: 12,
        maxWidth: 1080,
        mx: "auto",
        position: "relative",
      }}
    >
      {/* ══════════ HERO ══════════ */}
      <Box
        textAlign="center"
        sx={{ mb: 10, animation: "fadeUp 0.65s ease both" }}
      >
        <Chip
          icon={
            <DocumentScannerRoundedIcon
              sx={{
                fontSize: "14px !important",
                color: `${C.brand} !important`,
              }}
            />
          }
          label="Cómo funciona"
          sx={{
            mb: 3,
            bgcolor: C.brandSurface,
            color: C.brand,
            fontWeight: 700,
            fontSize: 12,
            border: `1px solid ${C.brandMuted}`,
            px: 0.5,
          }}
        />

        <Typography
          variant="h3"
          fontWeight={900}
          sx={{
            letterSpacing: "-1.5px",
            lineHeight: 1.12,
            mb: 3,
            background: `linear-gradient(135deg, ${C.textPrimary} 30%, ${C.brandLight} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: { xs: 30, sm: 42 },
          }}
        >
          Sabé qué tan procesado
          <br />
          es lo que comés
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 15, sm: 17 },
            color: C.textSecondary,
            maxWidth: 580,
            mx: "auto",
            lineHeight: 1.8,
          }}
        >
          Nui analiza los ingredientes y la información nutricional de cualquier
          alimento envasado para decirte exactamente si es{" "}
          <strong>no procesado</strong>, <strong>procesado</strong> o{" "}
          <strong>ultraprocesado</strong> — y qué tan seguido deberías
          consumirlo.
        </Typography>
      </Box>

      {/* ══════════ EL PROBLEMA: ESCALA DE PROCESAMIENTO ══════════ */}
      <Box sx={{ mb: 10, animation: "fadeUp 0.65s 0.1s ease both" }}>
        <Box textAlign="center" mb={5}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              color: C.brand,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1.5,
            }}
          >
            La escala que importa
          </Typography>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              letterSpacing: "-0.8px",
              color: C.textPrimary,
              mb: 1.5,
              fontSize: { xs: 22, sm: 28 },
            }}
          >
            ¿Por qué importa el nivel de procesamiento?
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              color: C.textSecondary,
              maxWidth: 620,
              mx: "auto",
              lineHeight: 1.75,
            }}
          >
            La evidencia científica muestra que el consumo frecuente de
            alimentos ultraprocesados está asociado con mayor riesgo de
            obesidad, diabetes tipo 2, enfermedades cardiovasculares y algunos
            tipos de cáncer.{" "}
            <strong>
              Conocer el grado de procesamiento es el primer paso para elegir
              mejor.
            </strong>
          </Typography>
        </Box>

        {/* Escala visual */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          {NOVA.map((n, i) => (
            <Box
              key={n.label}
              sx={{ animation: `fadeUp 0.6s ${0.15 + i * 0.12}s ease both` }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  height: "100%",
                  bgcolor: n.bg,
                  border: `1.5px solid ${n.border}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    px: 1.4,
                    py: 0.4,
                    borderRadius: 999,
                    bgcolor: n.color,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {n.badge}
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: 36, mb: 1.2, lineHeight: 1 }}>
                  {n.emoji}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: n.color,
                    mb: 0.8,
                    letterSpacing: "-0.3px",
                  }}
                >
                  {n.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    color: C.textSecondary,
                    lineHeight: 1.65,
                  }}
                >
                  {n.desc}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Barra degradada de la escala */}
        <Box
          sx={{
            mt: 3,
            borderRadius: 999,
            height: 8,
            background:
              "linear-gradient(90deg, #2E7D32 0%, #E65100 50%, #B71C1C 100%)",
            opacity: 0.75,
          }}
        />
        <Stack direction="row" justifyContent="space-between" mt={0.8}>
          {[
            "Ideal para el día a día",
            "Con moderación",
            "Limitá al máximo",
          ].map((t) => (
            <Typography
              key={t}
              sx={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}
            >
              {t}
            </Typography>
          ))}
        </Stack>
      </Box>

      {/* ══════════ CÓMO FUNCIONA EL ANÁLISIS ══════════ */}
      <Box sx={{ mb: 10 }}>
        <Box
          textAlign="center"
          mb={5}
          sx={{ animation: "fadeUp 0.65s 0.15s ease both" }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              color: C.brand,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1.5,
            }}
          >
            El proceso
          </Typography>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              letterSpacing: "-0.8px",
              color: C.textPrimary,
              fontSize: { xs: 22, sm: 28 },
            }}
          >
            Tres pasos, resultado inmediato
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 3,
            position: "relative",
          }}
        >
          {/* Línea conectora desktop */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              position: "absolute",
              top: 52,
              left: "calc(33.3% + 8px)",
              right: "calc(33.3% + 8px)",
              height: 2,
              bgcolor: C.brandMuted,
              zIndex: 0,
              borderRadius: 1,
            }}
          />

          {STEPS.map(({ n, Icon, title, body, color, accent }, i) => (
            <Box
              key={n}
              sx={{
                position: "relative",
                zIndex: 1,
                animation: `fadeUp 0.65s ${0.2 + i * 0.15}s ease both`,
              }}
            >
              <Box
                sx={{
                  bgcolor: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  p: { xs: 3, md: 3.5 },
                  boxShadow: "0 2px 12px rgba(11,94,85,0.06)",
                  transition:
                    "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 20px 48px rgba(11,94,85,0.13)",
                    borderColor: C.brandMuted,
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: `1.5px solid ${color}22`,
                    }}
                  >
                    <Icon sx={{ fontSize: 28, color }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 36,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: `${color}22`,
                      letterSpacing: "-2px",
                      userSelect: "none",
                    }}
                  >
                    {n}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: C.textPrimary,
                    mb: 1.2,
                    letterSpacing: "-0.3px",
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    color: C.textSecondary,
                    lineHeight: 1.7,
                  }}
                >
                  {body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══════════ QUÉ OBTENÉS: PUNTAJE ══════════ */}
      <Box sx={{ mb: 10, animation: "fadeUp 0.65s 0.3s ease both" }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            overflow: "hidden",
            border: `1px solid ${C.borderMed}`,
            boxShadow: "0 4px 24px rgba(11,94,85,0.08)",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {/* Izq: texto */}
          <Box
            sx={{
              p: { xs: 3.5, md: 5 },
              borderRight: { xs: "none", md: `1px solid ${C.border}` },
              borderBottom: { xs: `1px solid ${C.border}`, md: "none" },
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                color: C.brand,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                mb: 1.5,
              }}
            >
              El resultado
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                letterSpacing: "-0.6px",
                color: C.textPrimary,
                mb: 2,
                fontSize: { xs: 20, sm: 24 },
              }}
            >
              Puntaje del 0 al 100 y clasificación de procesamiento
            </Typography>
            <Typography
              sx={{
                fontSize: 14.5,
                color: C.textSecondary,
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              Cada análisis devuelve un puntaje que refleja la calidad
              nutricional general del producto. Cuanto más alto, más natural y
              menos industrial es el alimento. Además se identifica claramente
              si es ultraprocesado, procesado o no procesado.
            </Typography>
            <Stack spacing={1.5}>
              {[
                {
                  rango: "75 – 100",
                  label: "Excelente calidad",
                  color: "#2E7D32",
                  bg: "#E8F5E9",
                },
                {
                  rango: "50 – 74",
                  label: "Calidad aceptable",
                  color: "#E65100",
                  bg: "#FFF3E0",
                },
                {
                  rango: "0 – 49",
                  label: "Evitá o limitá mucho",
                  color: "#B71C1C",
                  bg: "#FFEBEE",
                },
              ].map((row) => (
                <Stack
                  key={row.rango}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      bgcolor: row.bg,
                      border: `1px solid ${row.color}25`,
                      minWidth: 72,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 12.5, fontWeight: 800, color: row.color }}
                    >
                      {row.rango}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13.5, color: C.textSecondary }}>
                    {row.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Der: puntaje saludable */}
          <Box sx={{ p: { xs: 3.5, md: 5 }, bgcolor: C.surfaceAlt }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                color: C.brand,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                mb: 1.5,
              }}
            >
              Puntaje saludable acumulado
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                letterSpacing: "-0.6px",
                color: C.textPrimary,
                mb: 2,
                fontSize: { xs: 20, sm: 24 },
              }}
            >
              Cada hábito suma puntos
            </Typography>
            <Typography
              sx={{
                fontSize: 14.5,
                color: C.textSecondary,
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              Además del análisis por producto, Nui lleva un score global de tus
              hábitos. Cuanto más consistente seas con buenas elecciones de
              comida y entrenamiento, más crece tu mascot 🥜 — y sus brazos
              también.
            </Typography>
            <Stack spacing={1.5}>
              {[
                {
                  icon: "🔍",
                  text: "Análisis con puntaje ≥ 50/100",
                  pts: "+5 pts",
                },
                {
                  icon: "💪",
                  text: "Sesión de entrenamiento registrada",
                  pts: "+5 pts",
                },
                {
                  icon: "🍔",
                  text: "Análisis con puntaje < 50/100",
                  pts: "−3 pts",
                },
              ].map((row) => (
                <Stack
                  key={row.text}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <Typography sx={{ fontSize: 18, flexShrink: 0 }}>
                    {row.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: C.textSecondary,
                      flex: 1,
                      lineHeight: 1.4,
                    }}
                  >
                    {row.text}
                  </Typography>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 999,
                      bgcolor: row.pts.startsWith("+")
                        ? C.brandSurface
                        : "#FFEBEE",
                      border: `1px solid ${row.pts.startsWith("+") ? C.brandMuted : "rgba(183,28,28,0.22)"}`,
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: row.pts.startsWith("+") ? C.brand : "#B71C1C",
                      }}
                    >
                      {row.pts}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* ══════════ MÓDULOS ══════════ */}
      <Box sx={{ mb: 10 }}>
        <Box
          textAlign="center"
          mb={5}
          sx={{ animation: "fadeUp 0.65s 0.35s ease both" }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              color: C.brand,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1.5,
            }}
          >
            Todo en un lugar
          </Typography>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              letterSpacing: "-0.8px",
              color: C.textPrimary,
              fontSize: { xs: 22, sm: 28 },
            }}
          >
            Los tres módulos de Nui
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {MODULES.map((m, i) => (
            <Box
              key={m.title}
              sx={{ animation: `fadeUp 0.65s ${0.4 + i * 0.12}s ease both` }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  height: "100%",
                  bgcolor: m.bg,
                  border: `1.5px solid ${m.border}`,
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 16px 40px ${m.border}`,
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  mb={2.5}
                >
                  <Typography sx={{ fontSize: 32, lineHeight: 1 }}>
                    {m.emoji}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: m.color,
                      letterSpacing: "-0.3px",
                      lineHeight: 1.2,
                    }}
                  >
                    {m.title}
                  </Typography>
                </Stack>
                <Stack spacing={1.2}>
                  {m.features.map((f) => (
                    <Stack
                      key={f}
                      direction="row"
                      spacing={1.2}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          bgcolor: m.color + "22",
                          border: `1px solid ${m.color}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          mt: 0.15,
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 10, color: m.color, fontWeight: 800 }}
                        >
                          ✓
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: C.textSecondary,
                          lineHeight: 1.55,
                        }}
                      >
                        {f}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══════════ DISCLAIMER ══════════ */}
      <Box sx={{ animation: "fadeUp 0.65s 0.55s ease both" }}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            display: "flex",
            gap: 2.5,
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: C.brandSurface,
              border: `1px solid ${C.brandMuted}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 20, color: C.brand }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 14,
                color: C.textPrimary,
                mb: 0.5,
              }}
            >
              Importante
            </Typography>
            <Typography
              sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.75 }}
            >
              Nui no inventa información. El análisis se basa exclusivamente en
              los datos que el fabricante informa en el envase, evaluados según
              criterios nutricionales objetivos y estandarizados. No reemplaza
              la consulta con un profesional de la salud ni un nutricionista.
              Los planes de entrenamiento son orientativos — consultá siempre
              con un especialista antes de comenzar cualquier actividad física.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  </Box>
);

export default HowItWorksPage;
