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
import heic2any from "heic2any";

const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

const loadImageBitmap = async (blob) => {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(blob);
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo cargar la imagen."));
    };
    image.src = objectUrl;
  });
};

const resizeToJpeg = async (blob, filename) => {
  const bitmap = await loadImageBitmap(blob);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const resizedBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (output) => {
        if (!output) {
          reject(new Error("No se pudo generar la imagen comprimida."));
          return;
        }
        resolve(output);
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });

  if (bitmap.close) {
    bitmap.close();
  }

  return new File([resizedBlob], filename, { type: "image/jpeg" });
};

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

    const isHEIC =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    try {
      let normalizedBlob = file;
      let normalizedName = file.name;

      if (isHEIC) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: JPEG_QUALITY,
        });
        normalizedBlob = Array.isArray(convertedBlob)
          ? convertedBlob[0]
          : convertedBlob;
        normalizedName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
      }

      const resizedFile = await resizeToJpeg(normalizedBlob, normalizedName);
      setImage(resizedFile);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      setErrorMessage(
        "No pudimos preparar la imagen. Probá con otra foto o en formato JPG."
      );
      setImage(null);
    }
  };


  const handleContinue = async () => {
    if (!tablaImage || !ingredientesImage) return;

    setLoading(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("tabla", tablaImage);
      formData.append("ingredientes", ingredientesImage);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al procesar las imágenes");
      }

      const data = await response.json();

      if (!data.text) throw new Error("No se obtuvo texto OCR");

      updateOcrText(data.text);

      navigate("/result");
    } catch (error) {
      console.error("OCR error:", error);
      setErrorMessage(
        "No pudimos leer las imágenes. Intentá con fotos más nítidas o en formato JPG."
      );
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
          {errorMessage && (
            <Typography variant="body2" color="error">
              {errorMessage}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ImageCaptureStep;
