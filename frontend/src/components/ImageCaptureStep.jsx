import { useState } from "react";
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
import { useTranslation } from "react-i18next";

const ImageCaptureStep = () => {
  const { t } = useTranslation();
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
      setErrorMessage(t("capture.imageProcessError"));
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
      setErrorMessage(t("capture.readError"));
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
        bgcolor: "background.default",
        borderColor: "divider",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "16px",
              bgcolor: "action.hover",
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
            borderColor: "primary.main",
            color: "primary.main",
          }}
        >
          {image ? t("capture.changePhoto") : t("capture.uploadPhoto")}
        </Button>

        {image && (
          <Chip
            label={image.name}
            sx={{
              alignSelf: "flex-start",
              bgcolor: "success.light",
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
              {t("capture.title")}
            </Typography>
            <Typography color="text.secondary">
              {t("capture.subtitle")}
            </Typography>
          </Box>

          <UploadBlock
            icon={<CollectionsRoundedIcon color="success" />}
            title={t("capture.nutritionTitle")}
            description={t("capture.nutritionDesc")}
            inputId="tabla-input"
            image={tablaImage}
            setImage={setTablaImage}
          />

          <UploadBlock
            icon={<AutoAwesomeRoundedIcon color="success" />}
            title={t("capture.ingredientsTitle")}
            description={t("capture.ingredientsDesc")}
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

            }}
          >
            {loading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} color="inherit" />
                <span>{t("capture.analyzing")}</span>
              </Stack>
            ) : (
              t("capture.continue")
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
