import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";

const ContactPage = () => {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 6 },
        pt: { xs: 10, sm: 14 },
        pb: 8,
        maxWidth: "1100px",
        mx: "auto",
      }}
    >
      <Stack spacing={6}>
        {/* Header (igual que las otras páginas) */}
        <Box textAlign="center">
          <Typography
            variant="h4"
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
            ¿Tenés alguna consulta o sugerencia? Escribinos y te respondemos lo
            antes posible.
          </Typography>
        </Box>

        {/* Card */}
        <Box display="flex" justifyContent="center">
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 600,
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.6)", // 👈 transparencia
              backdropFilter: "blur(12px)", // 👈 glass effect
              WebkitBackdropFilter: "blur(12px)",
              overflow: "hidden",
              position: "relative",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
              },
            }}
          >
            {/* Header visual */}
            <Box
              sx={{
                height: 140,
                background: "linear-gradient(135deg, #e0f2ff, #b3e5fc)",
              }}
            />

            {/* Icono flotante */}
            <Box
              sx={{
                position: "absolute",
                top: 110,
                left: 24,
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              }}
            >
              <MailOutlineRoundedIcon color="primary" />
            </Box>

            {/* Form */}
            <Box sx={{ p: { xs: 3, sm: 4 }, pt: 5 }}>
              <br />
              <Stack spacing={3}>
                <TextField
                  label="Nombre completo"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                    },
                  }}
                />

                <TextField
                  label="Correo electrónico"
                  type="email"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                    },
                  }}
                />

                <TextField
                  label="Asunto"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                    },
                  }}
                />

                <TextField
                  label="Mensaje"
                  multiline
                  rows={4}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3, // 👈 mejor UX para textarea
                    },
                  }}
                />

                <Button
                  variant="contained"
                  endIcon={<SendRoundedIcon />}
                  fullWidth
                  sx={{
                    bgcolor: "#0f6d63",
                    borderRadius: 999,
                    py: 1.4,
                    textTransform: "none",
                    fontWeight: 1600,
                    fontFamily: "Nunito, sans-serif",
                    "&:hover": {
                      bgcolor: "#0c574f",
                    },
                  }}
                >
                  Enviar mensaje
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {/* Nota */}
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Respondemos dentro de 24–48 horas hábiles.
        </Typography>
      </Stack>
    </Box>
  );
};

export default ContactPage;
