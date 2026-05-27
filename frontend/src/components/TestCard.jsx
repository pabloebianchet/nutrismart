import { Box, Typography, Chip, Paper } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip } from "chart.js";

Chart.register(ArcElement, Tooltip);

/* ─── Tokens ──────────────────────────────────────────────── */
const C = {
  brand: "#bae0dc",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.10)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
};

const shadow = {
  card: "0 4px 20px rgba(11,94,85,0.08), 0 1px 4px rgba(11,94,85,0.04)",
};

/* ─── Categorías IMC ──────────────────────────────────────── */
const RANGES = [
  { label: "Bajo peso",    min: 0,    max: 18.5, color: "#5BA4F5", text: "#1565C0", risk: "Moderado" },
  { label: "Normal",       min: 18.5, max: 25,   color: "#2ECC71", text: "#1B7A3B", risk: "Bajo"    },
  { label: "Sobrepeso",    min: 25,   max: 30,   color: "#FFB74D", text: "#E65100", risk: "Moderado" },
  { label: "Obesidad I",   min: 30,   max: 35,   color: "#EF5350", text: "#C62828", risk: "Alto"    },
  { label: "Obesidad II+", min: 35,   max: 41,   color: "#AB47BC", text: "#6A1B9A", risk: "Muy alto" },
];
const SCALE_MAX = 41;

/* ─── Helpers ──────────────────────────────────────────────── */
const calcIMC = (peso, alturaCm) => {
  const h = alturaCm / 100;
  if (!peso || !h) return null;
  return +(peso / (h * h)).toFixed(1);
};

const getRange = (imc) =>
  RANGES.find((r) => imc >= r.min && imc < r.max) ?? RANGES[RANGES.length - 1];

const pesoKg = (alturaCm, imcMin, imcMax) => {
  const h = alturaCm / 100;
  return {
    min: +(imcMin * h * h).toFixed(1),
    max: +(imcMax * h * h).toFixed(1),
  };
};

/* ═══════════════════════════════════════════════════════════
   CARD 1 — Gauge bar
═══════════════════════════════════════════════════════════ */
const GaugeCard = ({ imc, altura }) => {
  const range = getRange(imc);
  const pct = Math.min((imc / SCALE_MAX) * 100, 100);
  const ideal = pesoKg(altura, 18.5, 24.9);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${C.border}`,
        bgcolor: C.surface,
        boxShadow: shadow.card,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* Label */}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Tu IMC
      </Typography>

      {/* Score */}
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
        <Typography
          sx={{
            fontSize: 58,
            fontWeight: 900,
            lineHeight: 1,
            color: range.text,
            letterSpacing: "-2px",
          }}
        >
          {imc}
        </Typography>
        <Typography sx={{ fontSize: 14, color: C.textMuted, mb: 0.8, fontWeight: 500 }}>
          kg/m²
        </Typography>
      </Box>

      {/* Badges */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label={range.label}
          size="small"
          sx={{
            bgcolor: `${range.color}22`,
            color: range.text,
            fontWeight: 700,
            fontSize: 12,
            border: `1px solid ${range.color}55`,
          }}
        />
        <Chip
          label={`Riesgo ${range.risk}`}
          size="small"
          sx={{
            bgcolor: C.surfaceAlt,
            color: C.textSecondary,
            fontWeight: 600,
            fontSize: 11,
            border: `1px solid ${C.border}`,
          }}
        />
      </Box>

      {/* Gauge bar */}
      <Box>
        <Box sx={{ position: "relative", height: 14, borderRadius: 7, display: "flex", overflow: "visible", mb: 3 }}>
          {RANGES.map((r, i) => (
            <Box
              key={r.label}
              sx={{
                flex: (r.max - r.min) / SCALE_MAX,
                bgcolor: r.color,
                opacity: r.label === range.label ? 1 : 0.28,
                borderRadius:
                  i === 0 ? "7px 0 0 7px"
                  : i === RANGES.length - 1 ? "0 7px 7px 0"
                  : 0,
              }}
            />
          ))}
          {/* Pointer */}
          <Box
            sx={{
              position: "absolute",
              left: `${pct}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 22,
              height: 22,
              borderRadius: "50%",
              bgcolor: range.color,
              border: "3px solid #fff",
              boxShadow: `0 0 0 2px ${range.color}, 0 4px 10px rgba(0,0,0,0.18)`,
              zIndex: 2,
            }}
          />
        </Box>

        {/* Scale */}
        <Box sx={{ display: "flex", justifyContent: "space-between", px: 0.2 }}>
          {[0, 10, 20, 30, 40].map((v) => (
            <Typography key={v} sx={{ fontSize: 10, color: C.textMuted }}>
              {v}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Ideal weight */}
      <Box
        sx={{
          mt: "auto",
          bgcolor: C.surfaceAlt,
          borderRadius: 2.5,
          p: 1.5,
          border: `1px solid ${C.border}`,
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            mb: 0.3,
          }}
        >
          Peso ideal para {altura} cm
        </Typography>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#2a6e67" }}>
          {ideal.min} – {ideal.max} kg
        </Typography>
      </Box>
    </Paper>
  );
};

/* ═══════════════════════════════════════════════════════════
   CARD 2 — Donut clasificación
═══════════════════════════════════════════════════════════ */
const DonutCard = ({ imc }) => {
  const idx = RANGES.findIndex((r) => imc >= r.min && imc < r.max);
  const safeIdx = idx === -1 ? RANGES.length - 1 : idx;
  const current = RANGES[safeIdx];

  const donutData = {
    labels: RANGES.map((r) => r.label),
    datasets: [
      {
        data: RANGES.map(() => 1), // equal segments — más limpio visualmente
        backgroundColor: RANGES.map((r, i) =>
          i === safeIdx ? r.color : `${r.color}45`
        ),
        borderWidth: RANGES.map((_, i) => (i === safeIdx ? 3 : 1)),
        borderColor: RANGES.map((r, i) =>
          i === safeIdx ? r.color : `${r.color}22`
        ),
        offset: RANGES.map((_, i) => (i === safeIdx ? 16 : 0)),
        hoverOffset: 8,
      },
    ],
  };

  const donutOptions = {
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const r = RANGES[ctx.dataIndex];
            return ` IMC ${r.min} – ${r.max === 41 ? "40+" : r.max}`;
          },
        },
      },
    },
    animation: { animateRotate: true, duration: 900 },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${C.border}`,
        bgcolor: C.surface,
        boxShadow: shadow.card,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            mb: 0.3,
          }}
        >
          Clasificación
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>
          Categorías IMC
        </Typography>
      </Box>

      {/* Donut */}
      <Box sx={{ position: "relative", width: "100%", maxWidth: 190, mx: "auto" }}>
        <Doughnut data={donutData} options={donutOptions} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: current.text,
              textAlign: "center",
              lineHeight: 1.25,
              px: 3,
            }}
          >
            {current.label}
          </Typography>
          <Typography sx={{ fontSize: 11, color: C.textMuted, mt: 0.3 }}>
            {imc} kg/m²
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
        {RANGES.map((r, i) => (
          <Box
            key={r.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.4,
              borderRadius: 1.5,
              bgcolor: i === safeIdx ? `${r.color}12` : "transparent",
              transition: "background 0.2s",
            }}
          >
            <Box
              sx={{
                width: i === safeIdx ? 10 : 8,
                height: i === safeIdx ? 10 : 8,
                borderRadius: "50%",
                bgcolor: r.color,
                flexShrink: 0,
                boxShadow: i === safeIdx ? `0 0 0 2px ${r.color}44` : "none",
              }}
            />
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: i === safeIdx ? 700 : 400,
                color: i === safeIdx ? C.textPrimary : C.textSecondary,
                flex: 1,
              }}
            >
              {r.label}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textMuted }}>
              {r.min}–{r.max === 41 ? "40+" : r.max}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

/* ═══════════════════════════════════════════════════════════
   CARD 3 — Tabla referencia por altura
═══════════════════════════════════════════════════════════ */
const ReferenceCard = ({ imc, altura, peso, sexo }) => {
  const current = getRange(imc);
  const normalPeso = pesoKg(altura, 18.5, 24.9);

  const diff =
    imc >= 25
      ? +(peso - normalPeso.max).toFixed(1)
      : imc < 18.5
      ? +(normalPeso.min - peso).toFixed(1)
      : 0;

  // Hamwi — peso ideal por sexo/altura
  const hamwi = (() => {
    if (!sexo || !altura) return null;
    const isMale =
      sexo?.toLowerCase().includes("mas") ||
      sexo?.toLowerCase() === "m" ||
      sexo?.toLowerCase() === "hombre";
    const over = Math.max(0, altura - 152.4);
    const base = isMale ? 48.1 : 45.4;
    return +(base + (over / 2.54) * 2.72).toFixed(1);
  })();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${C.border}`,
        bgcolor: C.surface,
        boxShadow: shadow.card,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            mb: 0.3,
          }}
        >
          Referencia
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>
          Peso por categoría
        </Typography>
        <Typography sx={{ fontSize: 12, color: C.textMuted }}>
          Para {altura} cm de altura
        </Typography>
      </Box>

      {/* Table rows */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {RANGES.map((r) => {
          const p = pesoKg(altura, r.min, r.max);
          const isUser = r.label === current.label;
          return (
            <Box
              key={r.label}
              sx={{
                display: "grid",
                gridTemplateColumns: "8px 1fr auto",
                alignItems: "center",
                gap: 1.2,
                px: 1.5,
                py: 0.9,
                borderRadius: 2,
                bgcolor: isUser ? `${r.color}15` : "transparent",
                border: `1px solid ${isUser ? r.color + "50" : "transparent"}`,
                transition: "all 0.2s",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: r.color,
                  boxShadow: isUser ? `0 0 0 2px ${r.color}44` : "none",
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 12.5,
                    fontWeight: isUser ? 700 : 400,
                    color: isUser ? C.textPrimary : C.textSecondary,
                  }}
                >
                  {r.label}
                </Typography>
                {isUser && (
                  <Chip
                    label="Vos"
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: `${r.color}30`,
                      color: r.text,
                      "& .MuiChip-label": { px: 0.7 },
                    }}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: isUser ? 700 : 400,
                  color: isUser ? r.text : C.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                {p.min}–{p.max} kg
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Gap to normal */}
      {diff > 0 && (
        <Box
          sx={{
            bgcolor: C.surfaceAlt,
            borderRadius: 2.5,
            p: 1.5,
            border: `1px solid ${C.border}`,
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: C.textSecondary, lineHeight: 1.55 }}>
            {imc >= 25
              ? "Para alcanzar zona normal, reducir"
              : "Para alcanzar zona normal, ganar"}
            {" "}
            <Typography component="span" sx={{ fontWeight: 800, color: "#2a6e67", fontSize: 13.5 }}>
              {diff} kg
            </Typography>
          </Typography>
        </Box>
      )}

      {/* Hamwi ideal */}
      {hamwi && (
        <Box
          sx={{
            bgcolor: C.brandSurface,
            borderRadius: 2.5,
            p: 1.5,
            border: `1px solid ${C.brandMuted}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: "#2a6e67",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              mb: 0.3,
            }}
          >
            Peso ideal Hamwi ({sexo})
          </Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#2a6e67" }}>
            {hamwi} kg
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

/* ═══════════════════════════════════════════════════════════
   EXPORT PRINCIPAL
═══════════════════════════════════════════════════════════ */
const ImcCard = ({ peso, altura, sexo, edad }) => {
  const imc = calcIMC(peso, altura);
  if (!imc) return null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            mb: 0.5,
          }}
        >
          Métricas corporales
        </Typography>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            color: C.textPrimary,
            letterSpacing: "-0.4px",
          }}
        >
          Índice de Masa Corporal
        </Typography>
      </Box>

      {/* Grid 3 cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        <GaugeCard imc={imc} altura={altura} />
        <DonutCard imc={imc} />
        <ReferenceCard imc={imc} altura={altura} peso={peso} sexo={sexo} />
      </Box>
    </Box>
  );
};

export default ImcCard;
