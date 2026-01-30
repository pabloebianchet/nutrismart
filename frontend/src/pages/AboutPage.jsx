import { Box, Typography } from "@mui/material";

const AboutPage = () => {
  return (
    <Box sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 10, sm: 12 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quiénes somos
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Esta sección está lista para presentar el propósito del equipo y la misión
        de la plataforma.
      </Typography>
    </Box>
  );
};

export default AboutPage;
