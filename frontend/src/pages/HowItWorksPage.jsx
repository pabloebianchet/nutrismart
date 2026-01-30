import { Box, Typography } from "@mui/material";

const HowItWorksPage = () => {
  return (
    <Box sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 10, sm: 12 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Cómo funciona
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Aquí se detallará el flujo principal de la experiencia y los pasos clave
        para el usuario.
      </Typography>
    </Box>
  );
};

export default HowItWorksPage;
