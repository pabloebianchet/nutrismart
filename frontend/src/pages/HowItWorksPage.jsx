import { Box, Typography, Chip } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";

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

const steps = [
  {
    n: "01",
    Icon: PhotoCameraRoundedIcon,
    title: "Tomás dos fotos",
    body: "Capturás la tabla nutricional y la lista de ingredientes del producto. Solo necesitás que la imagen sea clara y legible.",
    color: "#0B5E55",
    accent: "rgba(11,94,85,0.12)",
  },
  {
    n: "02",
    Icon: AutoAwesomeRoundedIcon,
    title: "Procesamos con IA",
    body: "Nuestra tecnología analiza los datos declarados por el fabricante según estándares nutricionales reconocidos, evaluando calidad y nivel de procesamiento.",
    color: "#0f7a6e",
    accent: "rgba(15,122,110,0.12)",
  },
  {
    n: "03",
    Icon: InsightsRoundedIcon,
    title: "Recibís tu evaluación",
    body: "Obtenés una lectura clara del producto y recomendaciones sobre cómo encaja en una alimentación equilibrada y orientada a tus metas.",
    color: "#138578",
    accent: "rgba(19,133,120,0.12)",
  },
];

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
      "@keyframes slideRight": {
        from: { opacity: 0, transform: "translateX(-20px)" },
        to: { opacity: 1, transform: "translateX(0)" },
      },
    }}
  >
    {/* Blobs */}
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
      {/* ── Hero ── */}
      <Box
        textAlign="center"
        sx={{ mb: 10, animation: "fadeUp 0.65s ease both" }}
      >
        <Chip
          icon={
            <FlashOnRoundedIcon
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
            fontSize: { xs: 32, sm: 42 },
          }}
        >
          Tres pasos, resultado
          <br />
          inmediato
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 15, sm: 17 },
            color: C.textSecondary,
            maxWidth: 540,
            mx: "auto",
            lineHeight: 1.75,
          }}
        >
          Analizamos la información nutricional declarada en los envases
          mediante Inteligencia Artificial para brindarte una evaluación clara y
          comprensible.
        </Typography>
      </Box>

      {/* ── Steps ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
          gap: 3,
          position: "relative",
        }}
      >
        {/* Línea conectora — solo desktop */}
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

        {steps.map(({ n, Icon, title, body, color, accent }, i) => (
          <Box
            key={n}
            sx={{
              position: "relative",
              zIndex: 1,
              animation: `fadeUp 0.65s ${0.15 + i * 0.15}s ease both`,
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
              {/* Número + ícono */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
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
                sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.7 }}
              >
                {body}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Disclaimer ── */}
      <Box
        sx={{
          mt: 7,
          bgcolor: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          display: "flex",
          gap: 2.5,
          alignItems: "flex-start",
          animation: "fadeUp 0.65s 0.6s ease both",
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
          <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.7 }}>
            No inventamos información. Nuestro análisis se basa exclusivamente
            en los datos nutricionales que el fabricante informa en el envase,
            aplicando criterios objetivos y estandarizados para su evaluación.
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);

export default HowItWorksPage;
