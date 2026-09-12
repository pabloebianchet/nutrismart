import { useEffect, useState } from "react";
import {
  Box, Paper, Stack, Typography, Divider,
  TextField, Button, IconButton, InputAdornment, Tab, Tabs, Alert,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import Dashboard from "../components/Dashboard.jsx";
import { useNutrition } from "../context/NutritionContext";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import { API_URL } from "../config/api";
import { isPlatformAuthenticatorAvailable, isBiometricRegistered, registerBiometric } from "../utils/biometric.js";
import { trackSignUp } from "../utils/analytics.js";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

const C = {
  brand: "#0B5E55",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  border: "rgba(11,94,85,0.12)",
  textMuted: "#8AADAA",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    fontSize: 14,
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: C.brandMuted },
    "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: C.brand },
};

const UserDataPage = () => {
  const { user, userData, setUser, loadingUserData, isUS } = useNutrition();
  const [showSplash,       setShowSplash]       = useState(true);
  const [showBiometricAsk,  setShowBiometricAsk]  = useState(false);
  const [pendingUser,       setPendingUser]        = useState(null);
  const [biometricError,    setBiometricError]     = useState("");
  const [biometricLoading,  setBiometricLoading]   = useState(false);
  const navigate = useNavigate();

  // Tabs: 0 = Google, 1 = Email
  const [tab, setTab]               = useState(0);
  const [mode, setMode]             = useState("login"); // "login" | "register"
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [form, setForm]             = useState({ name: "", email: "", password: "", confirm: "" });

  /* ---------------- SPLASH ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && userData?.profileCompleted === false) {
      navigate("/profile", { replace: true });
    }
  }, [navigate, user, userData?.profileCompleted]);

  const handleField = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleSuccess = async (credential) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, lang: isUS ? "en" : "es" }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Propagar el mensaje exacto del backend (ej: cuenta con contraseña existente)
        setError(data.error || (isUS ? "Error signing in with Google." : "Error al iniciar sesión con Google."));
        return;
      }
      if (!data.user) throw new Error("Respuesta inválida del servidor");
      // Guardar el JWT propio (7 días) en lugar del credential de Google (1 hora)
      localStorage.setItem("nutrismartToken", data.token || credential);
      // Conversión GA4 — solo en alta de cuenta nueva, no en cada login
      if (data.isNewUser) trackSignUp("google");
      // Ofrecer Face ID solo si el dispositivo tiene biometría real y no está registrado
      if (!isBiometricRegistered()) {
        const hasBiometric = await isPlatformAuthenticatorAvailable();
        if (hasBiometric) {
          setPendingUser(data.user);
          setShowBiometricAsk(true);
          return;
        }
      }
      setUser(data.user);
    } catch (err) {
      console.error("Google login error:", err);
      setError(isUS ? "Error signing in with Google. Please try again." : "Error al iniciar sesión con Google. Intentá de nuevo.");
    }
  };

  const handleActivateBiometric = async () => {
    setBiometricLoading(true);
    setBiometricError("");
    const result = await registerBiometric(isUS ? "en" : "es");
    setBiometricLoading(false);
    if (result.error === "cancelled") {
      setBiometricError(isUS ? "Cancelled. You can activate it later from your profile." : "Cancelado. Podés activarlo más tarde desde tu perfil.");
      return;
    }
    if (!result.ok) {
      setBiometricError(isUS ? `Couldn't activate Face ID: ${result.error}` : `No se pudo activar Face ID: ${result.error}`);
      return;
    }
    // Verificar que realmente se guardó
    if (!isBiometricRegistered()) {
      setBiometricError(isUS ? "Error saving the credential. Please try again." : "Error al guardar la credencial. Intentá de nuevo.");
      return;
    }
    setShowBiometricAsk(false);
    setUser(pendingUser);
  };

  const handleSkipBiometric = () => {
    setShowBiometricAsk(false);
    setUser(pendingUser);
  };

  /* ---------------- EMAIL LOGIN / REGISTER ---------------- */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!form.name.trim()) return setError(isUS ? "Name is required." : "El nombre es obligatorio.");
      if (form.password !== form.confirm) return setError(isUS ? "Passwords don't match." : "Las contraseñas no coinciden.");
      if (form.password.length < 6) return setError(isUS ? "Password must be at least 6 characters." : "La contraseña debe tener al menos 6 caracteres.");
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, lang: isUS ? "en" : "es" };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || (isUS ? "Error processing the request." : "Error al procesar la solicitud."));

      localStorage.setItem("nutrismartToken", data.token);
      // Conversión GA4 — solo en alta de cuenta nueva, no en cada login
      if (mode === "register") trackSignUp("email");

      // Ofrecer Face ID solo si el dispositivo tiene biometría real y no está registrado
      if (!isBiometricRegistered()) {
        const hasBiometric = await isPlatformAuthenticatorAvailable();
        if (hasBiometric) {
          setPendingUser(data.user);
          setShowBiometricAsk(true);
          return;
        }
      }
      setUser(data.user);
    } catch {
      setError(isUS ? "Connection error. Please check that the server is running." : "Error de conexión. Verificá que el servidor esté activo.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SPLASH SCREEN ---------------- */
  if (showSplash) {
    return (
      <Box
        data-testid="app-splash"
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "#0B5E55",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: 9999,

          /* ── Keyframes ── */
          "@keyframes splashFadeIn": {
            from: { opacity: 0, transform: "scale(0.94)" },
            to:   { opacity: 1, transform: "scale(1)" },
          },
          "@keyframes logoPulse": {
            "0%,100%": { opacity: 0.88, transform: "scale(0.97)" },
            "50%":     { opacity: 1,    transform: "scale(1.03)" },
          },
          "@keyframes dotBlink": {
            "0%,100%": { opacity: 0.25, transform: "scale(0.75)" },
            "50%":     { opacity: 1,    transform: "scale(1)" },
          },
        }}
      >
        {/* ── Contenido central ── */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            animation: "splashFadeIn 0.5s ease both",
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src="/img/logo.png"
            alt="NUI App"
            sx={{
              width: { xs: 145, sm: 180 },
              filter: "brightness(0) invert(1)",
              animation: "logoPulse 2.2s ease-in-out infinite",
            }}
          />

          {/* Tres puntos animados */}
          <Box sx={{ display: "flex", gap: 1.2 }}>
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{
                width: 6, height: 6,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.50)",
                animation: `dotBlink 1.5s ease-in-out ${i * 0.28}s infinite`,
              }} />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  /* ---------------- FACE ID ACTIVATION PROMPT ---------------- */
  if (showBiometricAsk) {
    return (
      <Box sx={{
        // position:fixed + inset:0 en vez de minHeight:100dvh — en mobile el
        // 100dvh a veces no cubre todo el viewport visual y queda un resto
        // del fondo gris de <body> asomando abajo. Mismo fix que en
        // BiometricGate.jsx.
        position: "fixed", inset: 0, zIndex: 2000, overflowY: "auto",
        background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", px: 3, py: 4,
        "@keyframes pulseRing": {
          "0%":   { transform: "scale(1)",   opacity: 0.5 },
          "70%":  { transform: "scale(1.55)", opacity: 0 },
          "100%": { transform: "scale(1.55)", opacity: 0 },
        },
      }}>
        <Paper elevation={0} sx={{
          width: "100%", maxWidth: 380, borderRadius: 5,
          border: "1px solid rgba(11,94,85,0.10)",
          boxShadow: "0 12px 32px rgba(11,94,85,0.11), 0 4px 8px rgba(11,94,85,0.06)",
          px: { xs: 3, sm: 4.5 }, py: { xs: 4.5, sm: 5.5 },
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          {/* Icono con anillo pulsante */}
          <Box sx={{ position: "relative", width: 84, height: 84, mb: 3,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid rgba(11,94,85,0.35)", animation: "pulseRing 2.4s ease-out infinite" }} />
            <Box sx={{
              width: 68, height: 68, borderRadius: "50%",
              bgcolor: "#E6F5F3", border: "1.5px solid rgba(11,94,85,0.20)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FingerprintRoundedIcon sx={{ fontSize: 36, color: "#0B5E55" }} />
            </Box>
          </Box>

          <Typography sx={{ fontSize: 22, fontWeight: 900, fontFamily: '"Baloo 2", "Nunito", system-ui, sans-serif', color: "#0F2420", mb: 1, textAlign: "center", letterSpacing: "-0.01em" }}>
            {isUS ? "Sign in faster" : "Ingresá más rápido"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#4A6B67", mb: 3, textAlign: "center", lineHeight: 1.65, maxWidth: 300 }}>
            {isUS ? "Activate Face ID or fingerprint to log into Nui without typing your password every time." : "Activá Face ID o huella para entrar a Nui sin escribir tu contraseña cada vez."}
          </Typography>

          {/* Aviso: el sistema muestra su propio cartel ("llave de acceso") */}
          <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start",
            bgcolor: "#E6F5F3", border: "1px solid rgba(11,94,85,0.15)",
            borderRadius: 3, px: 2, py: 1.4, mb: 3.5 }}>
            <InfoRoundedIcon sx={{ fontSize: 18, color: "#0B5E55", mt: "1px", flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12.5, color: "#4A6B67", lineHeight: 1.55 }}>
              {isUS
                ? <>Your phone may show its own prompt to <b>"add a passkey"</b> — it's the same step, just confirm and scan your fingerprint or face.</>
                : <>Tu celular puede mostrar un cartel para <b>"agregar llave de acceso"</b> — es el mismo paso, solo confirmá y escaneá tu huella o cara.</>}
            </Typography>
          </Box>

          {/* Beneficios */}
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5, mb: 4 }}>
            {(isUS
              ? [
                  { Icon: BoltRoundedIcon,         text: "Instant access, no extra steps" },
                  { Icon: VerifiedUserRoundedIcon, text: "Your fingerprint or face never leaves your device" },
                ]
              : [
                  { Icon: BoltRoundedIcon,         text: "Acceso instantáneo, sin pasos extra" },
                  { Icon: VerifiedUserRoundedIcon, text: "Tu huella o cara nunca salen del dispositivo" },
                ]
            ).map(({ Icon, text }, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5,
                bgcolor: "#F7F9F8", border: "1px solid rgba(11,94,85,0.08)",
                borderRadius: 3, px: 2, py: 1.4 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  bgcolor: "#E6F5F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon sx={{ fontSize: 17, color: "#0B5E55" }} />
                </Box>
                <Typography sx={{ fontSize: 13, color: "#4A6B67", fontWeight: 500, lineHeight: 1.4 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button onClick={handleActivateBiometric} disabled={biometricLoading} fullWidth
            startIcon={!biometricLoading && <FingerprintRoundedIcon sx={{ fontSize: 20 }} />}
            sx={{
              borderRadius: 3, py: 1.6, fontWeight: 800, fontSize: 15, textTransform: "none",
              color: "#fff",
              background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
              "&:hover": { background: "linear-gradient(135deg, #0d6c61 0%, #128a7c 100%)" },
              "&.Mui-disabled": { color: "rgba(255,255,255,0.6)", background: "rgba(11,94,85,0.4)" },
              mb: 1.5, boxShadow: "0 8px 24px rgba(11,94,85,0.25)",
            }}>
            {biometricLoading ? (isUS ? "Activating..." : "Activando...") : (isUS ? "Activate Face ID / fingerprint" : "Activar Face ID / huella")}
          </Button>

          {biometricError && (
            <Typography sx={{ fontSize: 12.5, color: "#E24B4A", mb: 1.5, textAlign: "center" }}>
              {biometricError}
            </Typography>
          )}

          <Button onClick={handleSkipBiometric} fullWidth
            sx={{ borderRadius: 3, py: 1.2, fontWeight: 600, fontSize: 14, textTransform: "none",
              color: "#8AADAA", "&:hover": { color: "#4A6B67", bgcolor: "transparent" } }}>
            {isUS ? "Not now" : "Ahora no"}
          </Button>
        </Paper>
      </Box>
    );
  }

  /* ---------------- LOGIN ---------------- */
  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
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
          }}
        >
          {/* Header verde */}
          <Box
            sx={{
              bgcolor: C.brand,
              px: 4,
              pt: 4,
              pb: 3,
              textAlign: "center",
            }}
          >
            <Box
              component="img"
              src="/img/logo.png"
              alt="NUI App"
              sx={{ height: 40, mb: 2, filter: "brightness(0) invert(1)" }}
            />
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>
              {mode === "login"
                ? (isUS ? "Welcome back" : "Bienvenido de nuevo")
                : (isUS ? "Create account" : "Crear cuenta")}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.65)", mt: 0.5 }}>
              {mode === "login"
                ? (isUS ? "Log in to your account to continue" : "Ingresá a tu cuenta para continuar")
                : (isUS ? "Start using NUI App for free" : "Empezá a usar NUI App gratis")}
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={(_, v) => { setTab(v); setError(""); }}
              variant="fullWidth"
              sx={{
                mb: 3,
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13.5 },
                "& .MuiTabs-indicator": { bgcolor: C.brand },
                "& .Mui-selected": { color: `${C.brand} !important` },
              }}
            >
              <Tab label="Google" />
              <Tab label={isUS ? "Email & password" : "Email y contraseña"} data-testid="login-email-tab" />
            </Tabs>

            {/* Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
                {error}
              </Alert>
            )}

            {/* ── Tab 0: Google ── */}
            {tab === 0 && (
              <Stack spacing={2} alignItems="center">
                <GoogleLogin
                  onSuccess={(res) => handleGoogleSuccess(res.credential)}
                  onError={() => setError(isUS ? "Error signing in with Google." : "Error al iniciar sesión con Google.")}
                />
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  {isUS ? "We don't share your personal information." : "No compartimos tu información personal."}
                </Typography>
              </Stack>
            )}

            {/* ── Tab 1: Email ── */}
            {tab === 1 && (
              <Box component="form" onSubmit={handleEmailSubmit}>
                <Stack spacing={2}>
                  {mode === "register" && (
                    <TextField
                      label={isUS ? "Full name" : "Nombre completo"}
                      name="name"
                      value={form.name}
                      onChange={handleField}
                      required
                      fullWidth
                      size="small"
                      sx={fieldSx}
                    />
                  )}

                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleField}
                    required
                    fullWidth
                    size="small"
                    sx={fieldSx}
                    inputProps={{ "data-testid": "login-email-input" }}
                  />

                  <TextField
                    label={isUS ? "Password" : "Contraseña"}
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={handleField}
                    required
                    fullWidth
                    size="small"
                    sx={fieldSx}
                    inputProps={{ "data-testid": "login-password-input" }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPass((p) => !p)} edge="end">
                              {showPass
                                ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                                : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  {mode === "register" && (
                    <TextField
                      label={isUS ? "Confirm password" : "Confirmar contraseña"}
                      name="confirm"
                      type={showPass ? "text" : "password"}
                      value={form.confirm}
                      onChange={handleField}
                      required
                      fullWidth
                      size="small"
                      sx={fieldSx}
                    />
                  )}

                  {mode === "login" && (
                    <Box sx={{ textAlign: "right", mt: -0.5 }}>
                      <Typography
                        component={Link}
                        to="/forgot-password"
                        sx={{ fontSize: 12.5, color: C.brand, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        {isUS ? "Forgot your password?" : "¿Olvidaste tu contraseña?"}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    data-testid="login-submit-button"
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
                    {loading
                      ? (isUS ? "Processing..." : "Procesando...")
                      : mode === "login"
                        ? (isUS ? "Log in" : "Iniciar sesión")
                        : (isUS ? "Create account" : "Crear cuenta")}
                  </Button>

                  <Divider sx={{ my: 0.5 }} />

                  <Typography sx={{ fontSize: 13, textAlign: "center", color: "text.secondary" }}>
                    {mode === "login"
                      ? (isUS ? "Don't have an account?" : "¿No tenés cuenta?")
                      : (isUS ? "Already have an account?" : "¿Ya tenés cuenta?")}
                    {" "}
                    <Typography
                      component="span"
                      onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                      sx={{ color: C.brand, fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    >
                      {mode === "login" ? (isUS ? "Sign up" : "Registrate") : (isUS ? "Log in" : "Iniciá sesión")}
                    </Typography>
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  /* ---------------- PROFILE ---------------- */
  if (loadingUserData) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          bgcolor: "#f4fbf7",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="text.secondary">{isUS ? "Loading your profile..." : "Cargando tu perfil..."}</Typography>
      </Box>
    );
  }

  if (!userData?.profileCompleted) {
    return null;
  }

  /* ---------------- DASHBOARD ---------------- */
  // Modal: activar Face ID tras login exitoso
  return <Dashboard />;
};

export default UserDataPage;
