import { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { useNutrition } from "../context/NutritionContext";
import { isInAppBrowser } from "../utils/inAppBrowser.js";
import { API_URL } from "../config/api";
import { trackSignUp, trackInAppBrowserDetected, trackInAppBrowserMagicLinkSubmit } from "../utils/analytics.js";

const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  border: "rgba(11,94,85,0.14)",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: "#fafafa",
    "& fieldset":             { borderColor: C.border },
    "&:hover fieldset":       { borderColor: C.brand },
    "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 2 },
  },
};

/**
 * Bloquea toda la app (no solo /login) apenas detecta el navegador embebido
 * de Instagram/Facebook — la mayoría del tráfico pago abandona antes de
 * llegar al login, así que el aviso tiene que aparecer en la entrada misma
 * (home), no al final del funnel.
 *
 * En vez de intentar sacar al usuario del WebView (confirmado que Instagram
 * bloquea los esquemas de escape), se pide solo el mail y se manda un
 * magic link — el único paso que ocurre dentro de Instagram es escribir el
 * mail, sin contraseña ni redirects que puedan ser bloqueados. Mismo
 * lenguaje visual que el resto de las pantallas de auth (UserDataPage,
 * ResetPasswordPage, MagicLoginPage): card blanca centrada sobre gradiente
 * suave, header de marca arriba.
 */
const InAppBrowserGate = ({ children }) => {
  const { isUS } = useNutrition();
  const [active] = useState(isInAppBrowser);
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState("idle"); // idle | loading | sent
  const [error, setError]     = useState("");
  const [isNewUser, setIsNewUser] = useState(true);

  useEffect(() => {
    if (active) trackInAppBrowserDetected();
  }, [active]);

  if (!active) return children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");
    const cleanEmail = email.trim();
    try {
      const res = await fetch(`${API_URL}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, lang: isUS ? "en" : "es" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isUS ? "Something went wrong. Try again." : "Algo salió mal. Intentá de nuevo."));
        setStatus("idle");
        return;
      }
      trackInAppBrowserMagicLinkSubmit();
      if (data.isNewUser) trackSignUp("email_magic_link");
      setEmail(cleanEmail);
      setIsNewUser(!!data.isNewUser);
      setStatus("sent");
    } catch {
      setError(isUS ? "Connection error. Try again." : "Error de conexión. Intentá de nuevo.");
      setStatus("idle");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        px: 2.5,
        background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
        overflowY: "auto",
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%", maxWidth: 400, borderRadius: 5,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 70px rgba(11,94,85,0.14)",
          overflow: "hidden",
          animation: "fadeUp 0.45s ease both",
          my: "auto",
        }}
      >
        {/* Header de marca */}
        <Box sx={{ bgcolor: C.brand, px: 4, pt: 5, pb: 4, textAlign: "center" }}>
          <Box component="img" src="/img/logo.png" alt="NUI App"
            sx={{ height: 52, filter: "brightness(0) invert(1)" }} />
        </Box>

        <Box sx={{ px: { xs: 3.5, sm: 4.5 }, py: 4.5, textAlign: "center" }}>
          {status === "sent" ? (
            <>
              <Box sx={{
                width: 64, height: 64, borderRadius: "50%", mx: "auto", mb: 2.5,
                bgcolor: C.brandSurface, border: `2px solid ${C.brandMuted}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MarkEmailReadRoundedIcon sx={{ fontSize: 32, color: C.brand }} />
              </Box>
              <Typography sx={{ fontSize: 19, fontWeight: 800, color: C.textPrimary, mb: 1 }}>
                {isNewUser
                  ? (isUS ? "Check your email" : "Revisá tu mail")
                  : (isUS ? "Welcome back! 👋" : "¡Hola de nuevo! 👋")}
              </Typography>
              <Typography sx={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.65 }}>
                {isNewUser
                  ? (isUS
                      ? <>We sent a link to <b>{email}</b> — tap it to enter Nui.</>
                      : <>Te mandamos un link a <b>{email}</b> — tocalo para entrar a Nui.</>)
                  : (isUS
                      ? <>Thanks for being part of Nui — we sent your access link to <b>{email}</b>.</>
                      : <>Gracias por ser parte de Nui — te mandamos tu link de acceso a <b>{email}</b>.</>)}
              </Typography>
            </>
          ) : (
            <>
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                bgcolor: C.brandSurface, color: C.brand, borderRadius: 999,
                px: 1.6, py: 0.5, mb: 2.5,
              }}>
                <BoltRoundedIcon sx={{ fontSize: 15 }} />
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.02em" }}>
                  {isUS ? "One tap sign up" : "Registro de un toque"}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 21, fontWeight: 900, fontFamily: '"Baloo 2", "Nunito", system-ui, sans-serif', color: C.textPrimary, letterSpacing: "-0.4px", mb: 1, lineHeight: 1.3 }}>
                {isUS ? "Sign up with your email" : "Registrate con tu mail"}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: C.textSecondary, mb: 3.5, lineHeight: 1.6 }}>
                {isUS ? "No password — we'll email you a link to get in." : "Sin contraseña — te mandamos un link por mail para entrar."}
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13, textAlign: "left" }}>
                    {error}
                  </Alert>
                )}
                <TextField
                  type="email"
                  placeholder={isUS ? "Your email" : "Tu mail"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  sx={{ ...fieldSx, mb: 2 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  disabled={status === "loading"}
                  sx={{
                    borderRadius: 2.5, py: 1.4, fontWeight: 800, fontSize: 15, textTransform: "none",
                    color: "#fff", bgcolor: C.brand,
                    boxShadow: "0 8px 22px rgba(11,94,85,0.30)",
                    transition: "all 0.18s",
                    "&:hover": { bgcolor: C.brandLight, boxShadow: "0 10px 26px rgba(11,94,85,0.38)" },
                    "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.28)", boxShadow: "none" },
                  }}
                >
                  {status === "loading"
                    ? (isUS ? "Sending..." : "Enviando...")
                    : (isUS ? "Send me the link" : "Enviarme el link")}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default InAppBrowserGate;
