import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

const ContactPage = () => {
  return (
    <Box
      sx={{
        px: 2,
        pt: { xs: 9, sm: 12 },
        pb: 8,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        {/* Header */}
        <Stack spacing={1} sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700}>
            Contacto
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ¿Tenés alguna consulta o sugerencia? Escribinos.
          </Typography>
        </Stack>

        {/* Form */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={3}>
            <TextField label="Nombre completo" fullWidth size="medium" />

            <TextField label="Correo electrónico" type="email" fullWidth />

            <TextField label="Asunto" fullWidth />

            <TextField label="Mensaje" multiline rows={4} fullWidth />

            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<SendRoundedIcon />}
              sx={{
                borderRadius: 3,
                py: 1.4,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Enviar mensaje
            </Button>
          </Stack>
        </Paper>

        {/* Nota */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block", textAlign: "center" }}
        >
          Respondemos dentro de 24–48 horas hábiles.
        </Typography>
      </Box>
    </Box>
  );
};

export default ContactPage;
