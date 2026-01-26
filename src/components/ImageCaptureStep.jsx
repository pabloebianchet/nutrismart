import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNutrition } from "../context/NutritionContext";

const ImageCaptureStep = ({ onNext }) => {
  const { images, setImages } = useNutrition();

  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (type === "ingredientes") {
      setPreview1(url);
      setImages((prev) => ({ ...prev, ingredientes: file }));
    } else {
      setPreview2(url);
      setImages((prev) => ({ ...prev, tabla: file }));
    }
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setImages((prev) => ({
      ...prev,
      soloUna: checked,
      tabla: checked ? null : prev.tabla,
    }));
    if (checked) setPreview2(null);
  };

  const canContinue =
    (images.ingredientes && images.soloUna) ||
    (images.ingredientes && images.tabla);

  return (
    <Box
      sx={{
        height: "100dvh",
        bgcolor: "#d5ede4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          bgcolor: "#ffffff",
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "#0e6253",
            color: "#fff",
            py: 3,
            px: 3,
            textAlign: "center",
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Subí o capturá las imágenes
          </Typography>
        </Box>

        {/* Body */}
        <Box
          sx={{
            px: 3,
            py: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Ingredientes */}
          <Typography variant="subtitle1" fontWeight="bold">
            Lista de ingredientes
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton onClick={() => inputRef1.current.click()}>
              <PhotoCameraIcon />
            </IconButton>
            <IconButton onClick={() => inputRef1.current.click()}>
              <UploadFileIcon />
            </IconButton>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={inputRef1}
              hidden
              onChange={(e) => handleFileChange(e, "ingredientes")}
            />
          </Box>
          {preview1 && (
            <Box
              component="img"
              src={preview1}
              alt="Ingredientes"
              sx={{ width: "100%", borderRadius: 2 }}
            />
          )}

          {/* Checkbox para imagen única */}
          <FormControlLabel
            control={
              <Checkbox
                checked={images.soloUna}
                onChange={handleCheckboxChange}
              />
            }
            label="Ambas informaciones están en una sola imagen"
          />

          {/* Tabla nutricional (si aplica) */}
          {!images.soloUna && (
            <>
              <Typography variant="subtitle1" fontWeight="bold">
                Tabla nutricional
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <IconButton onClick={() => inputRef2.current.click()}>
                  <PhotoCameraIcon />
                </IconButton>
                <IconButton onClick={() => inputRef2.current.click()}>
                  <UploadFileIcon />
                </IconButton>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={inputRef2}
                  hidden
                  onChange={(e) => handleFileChange(e, "tabla")}
                />
              </Box>
              {preview2 && (
                <Box
                  component="img"
                  src={preview2}
                  alt="Tabla"
                  sx={{ width: "100%", borderRadius: 2 }}
                />
              )}
            </>
          )}

          <Button
            variant="contained"
            fullWidth
            disabled={!canContinue}
            onClick={onNext}
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: "bold",
              borderRadius: 4,
              bgcolor: "#0e6253",
              "&:hover": {
                bgcolor: "#09493e",
              },
            }}
          >
            Siguiente
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageCaptureStep;
