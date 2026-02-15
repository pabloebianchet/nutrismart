import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

const ContactPage = () => {
  return (
    <Box
      sx={{
        px: { xs: 3, sm: 6 },
        pt: { xs: 10, sm: 14 },
        pb: 8,
        maxWidth: "1100px",
        mx: "auto",
      }}
    >
      <Stack spacing={6}>
        {/* Header */}
        <Box textAlign="center">
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            gutterBottom
            sx={{ letterSpacing: "-0.5px" }}
          >
            Contacto
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 650, mx: "auto" }}
          >
            Si tenés consultas, sugerencias o necesitás soporte, podés
            escribirnos. Nuestro equipo revisa cada mensaje y responde a la
            brevedad.
          </Typography>
        </Box>

        {/* Contenido */}
        <Grid container spacing={4}>
          {/* Información lateral */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailOutlinedIcon color="primary" />
                  <Box>
                    <Typography fontWeight={600}>Correo electrónico</Typography>
                    <Typography variant="body2" color="text.secondary">
                      soporte@tudominio.com
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <SupportAgentRoundedIcon color="primary" />
                  <Box>
                    <Typography fontWeight={600}>Soporte</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Respondemos dentro de 24-48 hs hábiles.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Formulario */}
          <Grid item xs={12} md={8}>
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
                <TextField
                  label="Nombre completo"
                  fullWidth
                  variant="outlined"
                />

                <TextField label="Correo electrónico" type="email" fullWidth />

                <TextField label="Asunto" fullWidth />

                <TextField label="Mensaje" multiline rows={4} fullWidth />

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<SendRoundedIcon />}
                  sx={{
                    alignSelf: "flex-start",
                    px: 4,
                    py: 1.2,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Enviar mensaje
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default ContactPage;
