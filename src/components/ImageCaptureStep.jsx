import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
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
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={800}>
            Subí las fotos del producto
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Una foto de la tabla nutricional y otra de la lista de ingredientes.
          </Typography>
        </Stack>

        <Stack spacing={3} mt={4}>
          {/* Tabla Nutricional */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: "#f7fcfa",
              borderColor: "rgba(27, 94, 75, 0.2)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                <CollectionsRoundedIcon color="success" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Tabla nutricional
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Mostrá claramente calorías, grasas, carbohidratos y sodio.
                </Typography>
                <input
                  accept="image/*"
                  capture="environment"
                  type="file"
                  style={{ display: "none" }}
                  id="tabla-input"
                  onChange={(e) => handleFileChange(e, setTablaImage)}
                />
                <label htmlFor="tabla-input">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      borderColor: "#1b5e4b",
                      color: "#1b5e4b",
                    }}
                  >
                    {tablaImage ? "Cambiar foto" : "Tomar o subir foto"}
                  </Button>
                </label>
                {tablaImage && (
                  <Chip
                    label={tablaImage.name}
                    size="small"
                    sx={{ mt: 2, bgcolor: "rgba(67, 160, 71, 0.16)" }}
                  />
                )}
              </Box>
            </Stack>
          </Paper>

          {/* Ingredientes */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: "#f7fcfa",
              borderColor: "rgba(27, 94, 75, 0.2)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                <AutoAwesomeRoundedIcon color="success" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Lista de ingredientes
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Capturá los ingredientes completos, incluidos aditivos.
                </Typography>
                <input
                  accept="image/*"
                  capture="environment"
                  type="file"
                  style={{ display: "none" }}
                  id="ingredientes-input"
                  onChange={(e) => handleFileChange(e, setIngredientesImage)}
                />
                <label htmlFor="ingredientes-input">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      borderColor: "#1b5e4b",
                      color: "#1b5e4b",
                    }}
                  >
                    {ingredientesImage ? "Cambiar foto" : "Tomar o subir foto"}
                  </Button>
                </label>
                {ingredientesImage && (
                  <Chip
                    label={ingredientesImage.name}
                    size="small"
                    sx={{ mt: 2, bgcolor: "rgba(67, 160, 71, 0.16)" }}
                  />
                )}
              </Box>
            </Stack>
          </Paper>

          <Divider />

          <Button
            variant="contained"
            disabled={!tablaImage || !ingredientesImage || loading}
            onClick={handleContinue}
            sx={{
              borderRadius: 999,
              mt: 1,
              py: 1.4,
              bgcolor: "#0e6253",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "0 12px 28px rgba(14, 98, 83, 0.22)",
              "&:hover": {
                bgcolor: "#09493e",
              },
            }}
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
