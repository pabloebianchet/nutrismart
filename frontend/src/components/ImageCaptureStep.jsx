import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useNutrition } from "../context/NutritionContext";
import { useNavigate } from "react-router-dom";
import heic2any from "heic2any";

import { API_URL } from "../config/api";


const ImageCaptureStep = () => {
  const [tablaImage, setTablaImage] = useState(null);
  const [ingredientesImage, setIngredientesImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { updateOcrText } = useNutrition();
  const navigate = useNavigate();

  const handleFileChange = async (e, setImage) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMessage("");

    try {
      const isHEIC = file.name.toLowerCase().endsWith(".heic");
      let blob = file;

      if (isHEIC) {
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.85,
        });
        blob = converted;
      }

      setImage(blob);
    } catch {
      setErrorMessage("No pudimos procesar la imagen.");
    }
  };

  const handleContinue = async () => {
    if (!tablaImage || !ingredientesImage) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("tabla", tablaImage);
      formData.append("ingredientes", ingredientesImage);

    const res = await fetch(`${API_URL}/api/ocr`, {
  method: "POST",
  body: formData,
});

      const data = await res.json();
      updateOcrText(data.text);
      navigate("/result");
    } catch {
      setErrorMessage("Error al leer las imágenes.");
    } finally {
      setLoading(false);
    }
  };

  const UploadBlock = ({
    icon,
    title,
    description,
    inputId,
    image,
    setImage,
  }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "#f7fcfa",
        borderColor: "rgba(27, 94, 75, 0.2)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "16px",
              bgcolor: "rgba(27, 94, 75, 0.12)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          id={inputId}
          hidden
          onChange={(e) => handleFileChange(e, setImage)}
        />

        <Button
          component="label"
          htmlFor={inputId}
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          sx={{
            alignSelf: "flex-start",
            borderRadius: 999,
            textTransform: "none",
            borderColor: "#1b5e4b",
            color: "#1b5e4b",
          }}
        >
          {image ? "Cambiar foto" : "Tomar o subir foto"}
        </Button>

        {image && (
          <Chip
            label={image.name}
            sx={{
              alignSelf: "flex-start",
              bgcolor: "rgba(67,160,71,0.15)",
              fontWeight: 500,
            }}
          />
        )}
      </Stack>
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 640,
          p: { xs: 3, md: 4 },
          borderRadius: 6,
          boxShadow: "0 20px 50px rgba(15, 59, 47, 0.16)",
        }}
      >
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Subí las fotos del producto
            </Typography>
            <Typography color="text.secondary">
              Tabla nutricional e ingredientes.
            </Typography>
          </Box>

          <UploadBlock
            icon={<CollectionsRoundedIcon color="success" />}
            title="Tabla nutricional"
            description="Calorías, grasas, carbohidratos, sodio."
            inputId="tabla-input"
            image={tablaImage}
            setImage={setTablaImage}
          />

          <UploadBlock
            icon={<AutoAwesomeRoundedIcon color="success" />}
            title="Lista de ingredientes"
            description="Incluí todos los ingredientes y aditivos."
            inputId="ingredientes-input"
            image={ingredientesImage}
            setImage={setIngredientesImage}
          />

          <Divider />

          <Button
            variant="contained"
            disabled={!tablaImage || !ingredientesImage || loading}
            onClick={handleContinue}
            sx={{
              borderRadius: 999,
              py: 1.4,
              fontWeight: 700,
              bgcolor: "#0e6253",
              color: "#fff",
            }}
          >
            {loading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} sx={{ color: "#fff" }} />
                <span>Analizando…</span>
              </Stack>
            ) : (
              "Continuar"
            )}
          </Button>

          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ImageCaptureStep;
