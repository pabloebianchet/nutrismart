import { Box, Typography } from "@mui/material";

const ContactPage = () => {
  return (
    <Box sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 10, sm: 12 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Contacto
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Este espacio se completará con canales de contacto y soporte de la
        plataforma.
      </Typography>
    </Box>
  );
};

export default ContactPage;
