import { useState } from "react";
import { Box, Typography, Chip, TextField, Button, Stack, CircularProgress } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { API_URL } from "../config/api";

const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.10)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    fontSize: 14,
    bgcolor: "#fafefd",
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: C.brandMuted },
    "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: C.brand },
};

const ContactPage = () => {
  const [sent,     setSent]     = useState(false);
  const [sending,  setSending]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "No se pudo enviar el mensaje. Intentá de nuevo.");
        return;
      }
      setSent(true);
    } catch {
      setApiError("Error de red. Verificá tu conexión e intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #edf8f5 0%, #ffffff 55%, #f4f9f7 100%)",
        position: "relative",
        overflow: "hidden",
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(28px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes popIn": {
          from: { opacity: 0, transform: "scale(0.88)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
      }}
    >
      {/* Blobs */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 440,
          height: 440,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(11,94,85,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: -120,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(11,94,85,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          px: { xs: 3, sm: 6, md: 10 },
          pt: { xs: 11, sm: 15 },
          pb: 12,
          maxWidth: 1080,
          mx: "auto",
          position: "relative",
        }}
      >
        {/* ── Hero ── */}
        <Box
          textAlign="center"
          sx={{ mb: 9, animation: "fadeUp 0.65s ease both" }}
        >
          <Chip
            icon={
              <ChatBubbleOutlineRoundedIcon
                sx={{
                  fontSize: "14px !important",
                  color: `${C.brand} !important`,
                }}
              />
            }
            label="Contacto"
            sx={{
              mb: 3,
              bgcolor: C.brandSurface,
              color: C.brand,
              fontWeight: 700,
              fontSize: 12,
              border: `1px solid ${C.brandMuted}`,
              px: 0.5,
            }}
          />

          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              letterSpacing: "-1.5px",
              lineHeight: 1.12,
              mb: 3,
              background: `linear-gradient(135deg, ${C.textPrimary} 30%, ${C.brandLight} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: { xs: 32, sm: 42 },
            }}
          >
            ¿En qué podemos
            <br />
            ayudarte?
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 15, sm: 17 },
              color: C.textSecondary,
              maxWidth: 520,
              mx: "auto",
              lineHeight: 1.75,
            }}
          >
            ¿Tenés alguna consulta o sugerencia? Escribinos y te respondemos a
            la brevedad.
          </Typography>
        </Box>

        {/* ── Layout split ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1.6fr" },
            gap: 3,
            alignItems: "start",
            animation: "fadeUp 0.65s 0.1s ease both",
          }}
        >
          {/* Panel izquierdo — info */}
          <Box
            sx={{
              borderRadius: 5,
              background: `linear-gradient(160deg, ${C.brand} 0%, #0f7a6e 100%)`,
              p: { xs: 4, md: 5 },
              boxShadow: "0 16px 48px rgba(11,94,85,0.28)",
              position: "relative",
              overflow: "hidden",
              color: "#fff",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 180,
                height: 180,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -70,
                left: -30,
                width: 220,
                height: 220,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.04)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <MailOutlineRoundedIcon sx={{ fontSize: 24, color: "#fff" }} />
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 22,
                lineHeight: 1.3,
                mb: 1.5,
                letterSpacing: "-0.5px",
              }}
            >
              Hablemos
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.7,
                mb: 4,
              }}
            >
              Estamos para ayudarte. Contanos tu consulta y nuestro equipo se
              pondrá en contacto a la brevedad.
            </Typography>

            <Stack spacing={2.5}>
              {[
                {
                  Icon: MailOutlineRoundedIcon,
                  label: "Email",
                  value: "info@nuiapp.com",
                },
                {
                  Icon: AccessTimeRoundedIcon,
                  label: "Tiempo de respuesta",
                  value: "24 – 48 horas hábiles",
                },
              ].map(({ Icon, label, value }) => (
                <Box
                  key={label}
                  sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                >
                  <Box
                    sx={{
                      mt: 0.2,
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 16, color: "#fff" }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.5)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 14, color: "#fff", fontWeight: 500 }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Panel derecho — form */}
          <Box
            sx={{
              bgcolor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 5,
              p: { xs: 3.5, md: 5 },
              boxShadow: "0 4px 24px rgba(11,94,85,0.07)",
            }}
          >
            {sent ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  animation: "popIn 0.4s ease both",
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    bgcolor: C.brandSurface,
                    border: `2px solid ${C.brandMuted}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 36, color: C.brand }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 22,
                    color: C.textPrimary,
                    mb: 1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  ¡Mensaje enviado!
                </Typography>
                <Typography sx={{ fontSize: 14, color: C.textSecondary }}>
                  Te respondemos dentro de las próximas 24–48 horas hábiles.
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 20,
                    color: C.textPrimary,
                    mb: 0.5,
                    letterSpacing: "-0.4px",
                  }}
                >
                  Envianos un mensaje
                </Typography>
                <Typography
                  sx={{ fontSize: 13.5, color: C.textMuted, mb: 4 }}
                >
                  Completá el formulario y te contactamos pronto.
                </Typography>

                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2.5,
                    }}
                  >
                    <TextField
                      label="Nombre completo"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      fullWidth
                      sx={fieldSx}
                    />
                    <TextField
                      label="Correo electrónico"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      fullWidth
                      sx={fieldSx}
                    />
                  </Box>

                  <TextField
                    label="Asunto"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={fieldSx}
                  />

                  <TextField
                    label="Mensaje"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    multiline
                    rows={5}
                    fullWidth
                    sx={{
                      ...fieldSx,
                      "& .MuiOutlinedInput-root": {
                        ...fieldSx["& .MuiOutlinedInput-root"],
                        borderRadius: 2.5,
                      },
                    }}
                  />

                  {apiError && (
                    <Typography sx={{ fontSize: 13.5, color: "#E24B4A", textAlign: "center", mt: -0.5 }}>
                      {apiError}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={sending}
                    endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
                    fullWidth
                    sx={{
                      mt: 0.5,
                      bgcolor: C.brand,
                      borderRadius: 2.5,
                      py: 1.6,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: "0.01em",
                      boxShadow: "0 6px 20px rgba(11,94,85,0.30)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: C.brandLight,
                        boxShadow: "0 10px 28px rgba(11,94,85,0.38)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {sending ? "Enviando..." : "Enviar mensaje"}
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ContactPage;
