import { useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useNutrition } from "../context/NutritionContext";
import Tesseract from "tesseract.js";
import { useNavigate } from "react-router-dom";

const ImageCaptureStep = () => {
  const { updateOcrText } = useNutrition();
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(URL.createObjectURL(file));
    setLoading(true);

    try {
      const result = await Tesseract.recognize(file, "spa", {
        logger: (m) => console.log(m),
      });

      updateOcrText(result.data.text);
      navigate("/result");
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Error al leer la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} textAlign="center">
      <Typography variant="h6" mb={2}>
        Capturá o subí la imagen del producto
      </Typography>

      <Button
        variant="contained"
        component="label"
        sx={{ mb: 2 }}
      >
        Usar cámara o galería
        <input
          hidden
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
        />
      </Button>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {imageFile && !loading && (
        <Box mt={2}>
          <img src={imageFile} alt="Preview" style={{ maxWidth: "100%" }} />
        </Box>
      )}
    </Box>
  );
};

export default ImageCaptureStep;
