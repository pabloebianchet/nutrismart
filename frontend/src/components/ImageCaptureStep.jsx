import { useState } from "react";
import { Box, Typography, Button, Stack, Paper, Chip } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { useNutrition } from "../context/NutritionContext";
import { useNavigate } from "react-router-dom";
import heic2any from "heic2any";
import AnalyzingLoader from "./AnalyzingLoader";
import { API_URL } from "../config/api";

const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  border: "rgba(11,94,85,0.14)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
};

const TIPS = [
  "Buena iluminación, sin reflejos ni sombras",
  "Enfocá bien el texto, sin cortar bordes",
  "Vale captura o imagen de la galería",
];

/* ── Zona de carga de imagen ──────────────────── */
const UploadZone = ({ label, sublabel, emoji, inputId, image, setImage, onFileChange }) => {
  const hasImage = !!image;
  const previewUrl = hasImage ? URL.createObjectURL(image) : null;

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        id={inputId}
        hidden
        onChange={(e) => onFileChange(e, setImage)}
      />

      <label htmlFor={inputId} style={{ display: "block", cursor: "pointer" }}>
        <Box
          sx={{
            position: "relative",
            borderRadius: 4,
            border: hasImage
              ? `2px solid ${C.brand}`
              : `2px dashed rgba(11,94,85,0.30)`,
            bgcolor: hasImage ? "rgba(11,94,85,0.04)" : C.brandSurface,
            overflow: "hidden",
            height: { xs: 180, sm: 210 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.22s ease",
            "&:hover": {
              borderColor: C.brand,
              bgcolor: "rgba(11,94,85,0.06)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(11,94,85,0.12)",
            },
            "@keyframes zoneIn": {
              from: { opacity: 0, transform: "scale(0.95)" },
              to:   { opacity: 1, transform: "scale(1)" },
            },
            animation: "zoneIn 0.3s ease both",
          }}
        >
          {hasImage ? (
            <>
              {/* Thumbnail */}
              <Box
                component="img"
                src={previewUrl}
                alt={label}
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Overlay */}
              <Box sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(11,94,85,0.75) 0%, transparent 55%)",
              }} />
              {/* Check badge */}
              <Box sx={{
                position: "absolute",
                top: 10, right: 10,
                width: 32, height: 32,
                borderRadius: "50%",
                bgcolor: "#2ECC71",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(46,204,113,0.5)",
              }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 20, color: "#fff" }} />
              </Box>
              {/* Label abajo */}
              <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, px: 2, py: 1.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.70)" }}>Tocá para cambiar</Typography>
              </Box>
            </>
          ) : (
            <Stack alignItems="center" spacing={1.5} sx={{ px: 2, textAlign: "center" }}>
              <Typography sx={{ fontSize: 40, lineHeight: 1 }}>{emoji}</Typography>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.3px" }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: C.textMuted, mt: 0.3 }}>{sublabel}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  px: 1.8, py: 0.7,
                  borderRadius: 999,
                  bgcolor: C.brand,
                  mt: 0.5,
                }}
              >
                <PhotoCameraRoundedIcon sx={{ fontSize: 15, color: "#fff" }} />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Subir foto</Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </label>
    </Box>
  );
};

/* ── Componente principal ─────────────────────── */
const ImageCaptureStep = () => {
  const [tablaImage,       setTablaImage]       = useState(null);
  const [ingredientesImage, setIngredientesImage] = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [errorMessage,     setErrorMessage]     = useState("");
  const { updateOcrText } = useNutrition();
  const navigate = useNavigate();

  const bothReady = !!tablaImage && !!ingredientesImage;

  const handleFileChange = async (e, setImage) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMessage("");
    try {
      if (file.name.toLowerCase().endsWith(".heic")) {
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
        setImage(converted);
      } else {
        setImage(file);
      }
    } catch {
      setErrorMessage("No pudimos procesar la imagen.");
    }
  };

  const handleContinue = async () => {
    if (!bothReady) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("nutrismartToken");
      const formData = new FormData();
      formData.append("tabla", tablaImage);
      formData.append("ingredientes", ingredientesImage);
      const res  = await fetch(`${API_URL}/api/ocr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      updateOcrText(data.text);
      navigate("/result");
    } catch {
      setErrorMessage("Error al leer las imágenes. Intentá de nuevo.");
      setLoading(false);
    }
  };

  /* ── Loader mientras se procesa OCR ── */
  if (loading) {
    return (
      <Box sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
      }}>
        <AnalyzingLoader message="Leyendo las imágenes del producto..." />
      </Box>
    );
  }

  const done = (tablaImage ? 1 : 0) + (ingredientesImage ? 1 : 0);

  return (
    <Box sx={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #edf8f5 0%, #ffffff 55%, #f4f9f7 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: { xs: 2, sm: 3 },
      py: { xs: 4, md: 5 },
      "@keyframes fadeUp": {
        from: { opacity: 0, transform: "translateY(24px)" },
        to:   { opacity: 1, transform: "translateY(0)" },
      },
    }}>
      <Box sx={{ width: "100%", maxWidth: 620 }}>

        {/* Header */}
        <Stack alignItems="center" spacing={1.5} mb={4} sx={{ animation: "fadeUp 0.5s ease both" }}>
          <Box sx={{
            width: 72, height: 72,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${C.brand} 0%, ${C.brandLight} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 28px rgba(11,94,85,0.30)",
            fontSize: 36,
          }}>
            🥜
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.8px", lineHeight: 1.1 }}>
              Analizá tu producto
            </Typography>
            <Typography sx={{ fontSize: 14.5, color: C.textSecondary, mt: 0.8 }}>
              Subí las fotos del packaging y la IA hará el resto
            </Typography>
          </Box>

          {/* Progress indicator */}
          <Stack direction="row" spacing={1} mt={0.5}>
            {["📊 Tabla nutricional", "📋 Ingredientes"].map((label, i) => {
              const isDone = i === 0 ? !!tablaImage : !!ingredientesImage;
              return (
                <Chip
                  key={label}
                  icon={isDone ? <CheckCircleRoundedIcon sx={{ fontSize: "15px !important", color: "#2ECC71 !important" }} /> : undefined}
                  label={label}
                  size="small"
                  sx={{
                    bgcolor: isDone ? "rgba(46,204,113,0.12)" : C.brandSurface,
                    color:   isDone ? "#1a9e58" : C.brand,
                    fontWeight: 700,
                    fontSize: 12,
                    border: `1px solid ${isDone ? "rgba(46,204,113,0.30)" : C.brandMuted}`,
                    transition: "all 0.3s ease",
                  }}
                />
              );
            })}
          </Stack>
        </Stack>

        {/* Zonas de carga */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3} sx={{ animation: "fadeUp 0.5s 0.1s ease both" }}>
          <UploadZone
            label="Tabla nutricional"
            sublabel="Calorías, grasas, sodio..."
            emoji="📊"
            inputId="tabla-input"
            image={tablaImage}
            setImage={setTablaImage}
            onFileChange={handleFileChange}
          />
          <UploadZone
            label="Lista de ingredientes"
            sublabel="Todos los ingredientes"
            emoji="📋"
            inputId="ingredientes-input"
            image={ingredientesImage}
            setImage={setIngredientesImage}
            onFileChange={handleFileChange}
          />
        </Stack>

        {/* Tips */}
        <Paper elevation={0} sx={{
          mb: 3,
          px: 2.5, py: 2,
          borderRadius: 3,
          border: `1px solid ${C.border}`,
          bgcolor: C.brandSurface,
          animation: "fadeUp 0.5s 0.2s ease both",
        }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <LightbulbOutlinedIcon sx={{ fontSize: 16, color: C.brand }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: C.brand, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tips para mejores resultados
            </Typography>
          </Stack>
          <Stack spacing={0.6}>
            {TIPS.map((tip) => (
              <Stack key={tip} direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: C.brandMuted, mt: 0.7, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12.5, color: C.textSecondary, lineHeight: 1.5 }}>{tip}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* Error */}
        {errorMessage && (
          <Typography sx={{ fontSize: 13, color: "#E24B4A", mb: 2, textAlign: "center" }}>
            {errorMessage}
          </Typography>
        )}

        {/* CTA */}
        <Box sx={{ animation: "fadeUp 0.5s 0.25s ease both" }}>
          <Button
            variant="contained"
            fullWidth
            disabled={!bothReady}
            onClick={handleContinue}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              py: 1.8,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-0.3px",
              background: bothReady
                ? `linear-gradient(135deg, ${C.brand} 0%, ${C.brandLight} 100%)`
                : undefined,
              boxShadow: bothReady ? "0 8px 28px rgba(11,94,85,0.32)" : "none",
              transition: "all 0.25s ease",
              "&:not(:disabled):hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 36px rgba(11,94,85,0.38)",
              },
            }}
          >
            {bothReady
              ? "Analizar producto"
              : `Subí ${done === 0 ? "las 2 fotos" : "la foto restante"} para continuar`}
          </Button>

          {/* Contador debajo del botón */}
          <Typography sx={{ textAlign: "center", fontSize: 12.5, color: C.textMuted, mt: 1.5 }}>
            {done}/2 fotos listas
            {bothReady && " · Listo para analizar 🚀"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageCaptureStep;
