import { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { API_URL } from "../config/api";

const C = {
  brand: "#0B5E55",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  border: "rgba(11,94,85,0.12)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
};

const ForgotPasswordPage = () => {
  const [email, setEmail]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [sent, setSent]             = useState(false);
  const [error, setError]           = useState("");
  const [notRegistered, setNotRegistered] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404) setNotRegistered(true);
        return setError(data.error || "Error al enviar el correo.");
      }
      setSent(true);
    } catch {
      setError("Error de conexión. Verificá que el servidor esté activo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 5,
          border: `1px solid ${C.border}`,
          boxShadow: "0 20px 60px rgba(11,94,85,0.10)",
          overflow: "hidden",
          animation: "fadeUp 0.5s ease both",
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: C.brand, px: 4, pt: 4, pb: 3, textAlign: "center" }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <MailOutlineRoundedIcon sx={{ fontSize: 26, color: "#fff" }} />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
            Recuperar contraseña
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.65)", mt: 0.5 }}>
            Te enviamos un enlace a tu email
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {sent ? (
            /* ── Estado: enviado ── */
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: C.brandSurface,
                  border: `2px solid ${C.brandMuted}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2.5,
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 32, color: C.brand }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 17, color: C.textPrimary, mb: 1 }}>
                Revisá tu correo
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.65, mb: 3 }}>
                Si el email <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                ¿No llegó? Revisá la carpeta de spam.
              </Typography>
            </Box>
          ) : (
            /* ── Formulario ── */
            <Box component="form" onSubmit={handleSubmit}>
              <Typography sx={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.65, mb: 3 }}>
                Ingresá el email de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
              </Typography>

              {error && (
                <Box sx={{ mb: 2 }}>
                  <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13, mb: notRegistered ? 1.5 : 0 }}>
                    {error}
                  </Alert>
                  {notRegistered && (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate("/", { state: { openRegister: true } })}
                      sx={{
                        borderRadius: 2.5,
                        py: 1.2,
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: 14,
                        borderColor: C.brand,
                        color: C.brand,
                        "&:hover": { bgcolor: C.brandSurface, borderColor: C.brand },
                      }}
                    >
                      Crear cuenta nueva
                    </Button>
                  )}
                </Box>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setNotRegistered(false); }}
                required
                fullWidth
                size="small"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    fontSize: 14,
                    "& fieldset": { borderColor: C.border },
                    "&:hover fieldset": { borderColor: C.brandMuted },
                    "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: C.brand },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: C.brand,
                  borderRadius: 2.5,
                  py: 1.3,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14.5,
                  boxShadow: "0 4px 16px rgba(11,94,85,0.28)",
                  "&:hover": { bgcolor: "#0f7a6e" },
                }}
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </Box>
          )}

          {/* Volver */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography
              component={Link}
              to="/"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: 13,
                color: C.textSecondary,
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: C.brand },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              Volver al inicio
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
