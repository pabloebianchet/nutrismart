import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useNutrition } from "../context/NutritionContext";
import { useNavigate } from "react-router-dom";

const ImageCaptureStep = () => {
  const [tablaImage, setTablaImage] = useState(null);
  const [ingredientesImage, setIngredientesImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setOcrText } = useNutrition();
  const navigate = useNavigate();

  const handleFileChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const applyOCR = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.text;
  };

  const handleContinue = async () => {
    if (!tablaImage || !ingredientesImage) return;

    setLoading(true);
    try {
      const tablaText = await applyOCR(tablaImage);
      const ingredientesText = await applyOCR(ingredientesImage);
      const combinedText = `${tablaText}\n\n${ingredientesText}`;
      setOcrText(combinedText);
      navigate("/result");
    } catch (error) {
      console.error("OCR error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#d5ede4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 500,
          p: 4,
          borderRadius: 4,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Subí las imágenes del producto
        </Typography>

        <Stack spacing={3} mt={3}>
          {/* Tabla Nutricional */}
          <Box>
            <Typography variant="subtitle1">Tabla nutricional</Typography>
            <input
              accept="image/*"
              capture="environment"
              type="file"
              style={{ display: "none" }}
              id="tabla-input"
              onChange={(e) => handleFileChange(e, setTablaImage)}
            />
            <label htmlFor="tabla-input">
              <IconButton color="primary" component="span">
                <PhotoCameraIcon />
              </IconButton>
            </label>
            {tablaImage && (
              <Typography variant="body2">{tablaImage.name}</Typography>
            )}
          </Box>

          {/* Ingredientes */}
          <Box>
            <Typography variant="subtitle1">Lista de ingredientes</Typography>
            <input
              accept="image/*"
              capture="environment"
              type="file"
              style={{ display: "none" }}
              id="ingredientes-input"
              onChange={(e) => handleFileChange(e, setIngredientesImage)}
            />
            <label htmlFor="ingredientes-input">
              <IconButton color="primary" component="span">
                <PhotoCameraIcon />
              </IconButton>
            </label>
            {ingredientesImage && (
              <Typography variant="body2">{ingredientesImage.name}</Typography>
            )}
          </Box>

          <Button
            variant="contained"
            color="success"
            disabled={!tablaImage || !ingredientesImage || loading}
            onClick={handleContinue}
            sx={{ borderRadius: 3, mt: 2 }}
          >
            {loading ? "Analizando..." : "Continuar"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ImageCaptureStep;