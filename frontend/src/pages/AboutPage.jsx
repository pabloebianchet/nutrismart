import { Box, Typography, Chip } from "@mui/material";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";

const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  surface: "#FFFFFF",
  border: "rgba(11,94,85,0.10)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
};

const cards = [
  {
    Icon: AnalyticsRoundedIcon,
    title: "Análisis inteligente",
    body: "Procesamos la información nutricional que cada producto declara en su etiqueta: calorías, azúcares, grasas, sodio, proteínas y más. Transformamos esos datos en indicadores comprensibles y comparables.",
    grad: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
  },
  {
    Icon: LocalDiningRoundedIcon,
    title: "Información clara",
    body: "Simplificamos tablas nutricionales complejas para que cualquier persona pueda entender qué está consumiendo realmente y cómo ese alimento impacta en su perfil nutricional.",
    grad: "linear-gradient(135deg, #0f7a6e 0%, #1a9080 100%)",
  },
  {
    Icon: PsychologyRoundedIcon,
    title: "Decisiones conscientes",
    body: "Nuestro objetivo es que cada usuario pueda interpretar mejor la composición de los alimentos y tomar decisiones informadas en función de sus metas personales.",
    grad: "linear-gradient(135deg, #0d6b61 0%, #138578 100%)",
  },
  {
    Icon: VerifiedRoundedIcon,
    title: "Basado en datos reales",
    body: "No inventamos información. Nuestro análisis se basa exclusivamente en los datos nutricionales que el fabricante informa en el envase, aplicando criterios objetivos para su evaluación.",
    grad: "linear-gradient(135deg, #0a5249 0%, #0B5E55 100%)",
  },
];

const AboutPage = () => (
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
      "@keyframes scaleIn": {
        from: { opacity: 0, transform: "scale(0.92)" },
        to: { opacity: 1, transform: "scale(1)" },
      },
    }}
  >
    {/* Blobs decorativos */}
    <Box
      sx={{
        position: "absolute",
        top: -120,
        right: -120,
        width: 480,
        height: 480,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(11,94,85,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: -140,
        width: 520,
        height: 520,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(11,94,85,0.05) 0%, transparent 70%)",
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
      {/* ── Hero ── */}
      <Box
        textAlign="center"
        sx={{ mb: 9, animation: "fadeUp 0.65s ease both" }}
      >
        <Chip
          icon={
            <SpaRoundedIcon
              sx={{ fontSize: "14px !important", color: `${C.brand} !important` }}
            />
          }
          label="Quiénes somos"
          sx={{
            mb: 3,
            bgcolor: C.brandSurface,
            color: C.brand,
            fontWeight: 700,
            fontSize: 12,
            border: `1px solid ${C.brandMuted}`,
            letterSpacing: "0.03em",
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
            fontSize: { xs: 32, sm: 42 },
          }}
        >
          Nutrición basada en<br />datos reales
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 15, sm: 17 },
            color: C.textSecondary,
            maxWidth: 560,
            mx: "auto",
            lineHeight: 1.75,
          }}
        >
          Analizamos la información nutricional declarada en los envases de los
          productos para convertir datos técnicos en decisiones claras y
          conscientes.
        </Typography>
      </Box>

      {/* ── Cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        {cards.map(({ Icon, title, body, grad }, i) => (
          <Box
            key={title}
            sx={{
              bgcolor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              p: { xs: 3, sm: 3.5 },
              display: "flex",
              gap: 2.5,
              alignItems: "flex-start",
              boxShadow: "0 2px 12px rgba(11,94,85,0.06)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              animation: `fadeUp 0.65s ${0.1 + i * 0.1}s ease both`,
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 20px 48px rgba(11,94,85,0.13)",
                borderColor: C.brandMuted,
              },
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                width: 52,
                height: 52,
                borderRadius: 3,
                background: grad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(11,94,85,0.28)",
              }}
            >
              <Icon sx={{ fontSize: 26, color: "#fff" }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 15.5,
                  color: C.textPrimary,
                  mb: 0.8,
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.7 }}
              >
                {body}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Banner misión ── */}
      <Box
        sx={{
          mt: 7,
          borderRadius: 5,
          background: `linear-gradient(135deg, ${C.brand} 0%, #0f7a6e 100%)`,
          p: { xs: 4, md: 6 },
          textAlign: "center",
          boxShadow: "0 16px 48px rgba(11,94,85,0.28)",
          position: "relative",
          overflow: "hidden",
          animation: "scaleIn 0.7s 0.5s ease both",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: -40,
            width: 260,
            height: 260,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            mb: 1.5,
          }}
        >
          Nuestra misión
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 20, md: 26 },
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.4,
            maxWidth: 680,
            mx: "auto",
            letterSpacing: "-0.5px",
          }}
        >
          Ayudamos a que entiendas lo que comés. Todo de manera simple, sin tecnicismos, sin
          confusión. También te ayudamos a preparar platos sanos, sencillos y rápidos, para que la falta de tiempo no te imposibilite comer de manera adecuada. 
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default AboutPage;
