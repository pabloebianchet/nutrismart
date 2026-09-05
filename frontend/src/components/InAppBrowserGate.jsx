import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { useNutrition } from "../context/NutritionContext";
import { isInAppBrowser } from "../utils/inAppBrowser.js";
import { API_URL } from "../config/api";
import { trackSignUp, trackInAppBrowserDetected, trackInAppBrowserMagicLinkSubmit } from "../utils/analytics.js";

/**
 * Bloquea toda la app (no solo /login) apenas detecta el navegador embebido
 * de Instagram/Facebook — la mayoría del tráfico pago abandona antes de
 * llegar al login, así que el aviso tiene que aparecer en la entrada misma
 * (home), no al final del funnel.
 *
 * En vez de intentar sacar al usuario del WebView (confirmado que Instagram
 * bloquea los esquemas de escape), se pide solo el mail y se manda un
 * magic link — el único paso que ocurre dentro de Instagram es escribir el
 * mail, sin contraseña ni redirects que puedan ser bloqueados.
 */
const InAppBrowserGate = ({ children }) => {
  const { isUS } = useNutrition();
  const [active] = useState(isInAppBrowser);
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState("idle"); // idle | loading | sent
  const [error, setError]     = useState("");

  useEffect(() => {
    if (active) trackInAppBrowserDetected();
  }, [active]);

  if (!active) return children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang: isUS ? "en" : "es" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isUS ? "Something went wrong. Try again." : "Algo salió mal. Intentá de nuevo."));
        setStatus("idle");
        return;
      }
      trackInAppBrowserMagicLinkSubmit();
      if (data.isNewUser) trackSignUp("email_magic_link");
      setStatus("sent");
    } catch {
      setError(isUS ? "Connection error. Try again." : "Error de conexión. Intentá de nuevo.");
      setStatus("idle");
    }
  };

  return (
    <Box sx={{
      position: "fixed", inset: 0, zIndex: 9999,
      bgcolor: "#0B5E55",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      px: 4, textAlign: "center",
    }}>
      <Box component="img" src="/img/logo.png" alt="NUI App"
        sx={{ height: 40, mb: 4, filter: "brightness(0) invert(1)" }} />

      {status === "sent" ? (
        <>
          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#fff", mb: 1.5, maxWidth: 320, lineHeight: 1.5 }}>
            {isUS ? "Check your email" : "Revisá tu mail"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.75)", maxWidth: 300, lineHeight: 1.6 }}>
            {isUS
              ? `We sent a link to ${email} — tap it to enter Nui.`
              : `Te mandamos un link a ${email} — tocalo para entrar a Nui.`}
          </Typography>
        </>
      ) : (
        <>
          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#fff", mb: 1, maxWidth: 320, lineHeight: 1.5 }}>
            {isUS ? "Sign up with your email in one second" : "Registrate con tu mail en un segundo"}
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", mb: 3.5, maxWidth: 300 }}>
            {isUS ? "No password — we'll email you a link to get in." : "Sin contraseña — te mandamos un link por mail para entrar."}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 320 }}>
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
              sx={{
                mb: 1.5, bgcolor: "#fff", borderRadius: 2.5,
                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
              }}
            />
            <Button
              type="submit"
              fullWidth
              disabled={status === "loading"}
              sx={{
                borderRadius: 3, py: 1.5, fontWeight: 800, fontSize: 15, textTransform: "none",
                color: "#0B5E55", bgcolor: "#fff", "&:hover": { bgcolor: "#eafaf7" },
                boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.7)" },
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
  );
};

export default InAppBrowserGate;
