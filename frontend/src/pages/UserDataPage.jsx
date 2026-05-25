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
  const { user, userData, setUser, loadingUserData } = useNutrition();
  const [showSplash, setShowSplash] = useState(true);
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
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) throw new Error("Error autenticando con Google");
      const data = await res.json();
      if (!data.user) throw new Error("Respuesta inválida del servidor");
      // Guardar el JWT propio (7 días) en lugar del credential de Google (1 hora)
      localStorage.setItem("nutrismartToken", data.token || credential);
      setUser(data.user);
    } catch (err) {
      console.error("Google login error:", err);
      setError("Error al iniciar sesión con Google.");
    }
  };

  /* ---------------- EMAIL LOGIN / REGISTER ---------------- */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!form.name.trim()) return setError("El nombre es obligatorio.");
      if (form.password !== form.confirm) return setError("Las contraseñas no coinciden.");
      if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Error al procesar la solicitud.");

      localStorage.setItem("nutrismartToken", data.token);
      setUser(data.user);
    } catch {
      setError("Error de conexión. Verificá que el servidor esté activo.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SPLASH SCREEN ---------------- */
  if (showSplash) {
    const floaters = [
      { emoji: "🍃", top: "6%",  left: "4%",   size: 130, anim: "floatA", dur: "7s",  delay: "0s"   },
      { emoji: "🥦", top: "5%",  right: "5%",  size: 105, anim: "floatB", dur: "8.5s",delay: "1.2s" },
      { emoji: "🥑", top: "38%", left: "2%",   size: 118, anim: "floatC", dur: "9s",  delay: "0.6s" },
      { emoji: "🌿", top: "22%", right: "3%",  size: 124, anim: "floatA", dur: "7.5s",delay: "2s"   },
      { emoji: "🥕", bottom:"18%",left: "6%",  size: 88,  anim: "floatB", dur: "8s",  delay: "1.8s" },
      { emoji: "🍎", bottom:"12%",right: "7%", size: 98,  anim: "floatC", dur: "6.5s",delay: "0.4s" },
      { emoji: "🫑", bottom:"4%", left: "32%", size: 112, anim: "floatA", dur: "9.5s",delay: "3s"   },
      { emoji: "🥝", top: "58%", right: "4%",  size: 82,  anim: "floatB", dur: "7s",  delay: "1s"   },
      { emoji: "🍋", top: "72%", left: "14%",  size: 76,  anim: "floatC", dur: "8s",  delay: "2.5s" },
    ];

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(160deg, #0a4a42 0%, #0B5E55 45%, #0e6b60 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: 9999,

          /* ── Keyframes ── */
          "@keyframes floatA": {
            "0%,100%": { transform: "translateY(0px) rotate(-5deg)" },
            "50%":     { transform: "translateY(-28px) rotate(8deg)" },
          },
          "@keyframes floatB": {
            "0%,100%": { transform: "translateY(8px) rotate(6deg)" },
            "40%":     { transform: "translateY(-22px) rotate(-6deg)" },
            "70%":     { transform: "translateY(-10px) rotate(3deg)" },
          },
          "@keyframes floatC": {
            "0%,100%": { transform: "translateY(0px) translateX(0px) rotate(0deg)" },
            "33%":     { transform: "translateY(-20px) translateX(10px) rotate(12deg)" },
            "66%":     { transform: "translateY(-8px) translateX(-8px) rotate(-8deg)" },
          },
          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to:   { opacity: 1 },
          },
          "@keyframes pulse": {
            "0%,100%": { opacity: 0.85, transform: "scale(0.96)" },
            "50%":     { opacity: 1,    transform: "scale(1.06)" },
          },
        }}
      >
        {/* Elementos flotantes */}
        {floaters.map((f, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top:    f.top    ?? "auto",
              bottom: f.bottom ?? "auto",
              left:   f.left   ?? "auto",
              right:  f.right  ?? "auto",
              fontSize: f.size,
              lineHeight: 1,
              opacity: 0,
              userSelect: "none",
              pointerEvents: "none",
              filter: "brightness(1.1) saturate(0.6)",
              animation: `fadeIn 1s ${f.delay} ease forwards, ${f.anim} ${f.dur} ${f.delay} ease-in-out infinite`,
            }}
          >
            {f.emoji}
          </Box>
        ))}

        {/* Blob de luz central */}
        <Box
          sx={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <Box
          component="img"
          src="/img/logo.png"
          alt="NUI App"
          sx={{
            position: "relative",
            zIndex: 2,
            width: { xs: 150, sm: 190 },
            filter: "brightness(0) invert(1)",
            animation: "pulse 1.8s ease-in-out infinite",
          }}
        />
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
              {mode === "login" ? "Bienvenido de nuevo" : "Crear cuenta"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.65)", mt: 0.5 }}>
              {mode === "login" ? "Ingresá a tu cuenta para continuar" : "Empezá a usar NUI App gratis"}
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
              <Tab label="Email y contraseña" />
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
                  onError={() => setError("Error al iniciar sesión con Google.")}
                />
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  No compartimos tu información personal.
                </Typography>
              </Stack>
            )}

            {/* ── Tab 1: Email ── */}
            {tab === 1 && (
              <Box component="form" onSubmit={handleEmailSubmit}>
                <Stack spacing={2}>
                  {mode === "register" && (
                    <TextField
                      label="Nombre completo"
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
                  />

                  <TextField
                    label="Contraseña"
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={handleField}
                    required
                    fullWidth
                    size="small"
                    sx={fieldSx}
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
                      label="Confirmar contraseña"
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
                        ¿Olvidaste tu contraseña?
                      </Typography>
                    </Box>
                  )}

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
                    {loading ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </Button>

                  <Divider sx={{ my: 0.5 }} />

                  <Typography sx={{ fontSize: 13, textAlign: "center", color: "text.secondary" }}>
                    {mode === "login" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}
                    {" "}
                    <Typography
                      component="span"
                      onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                      sx={{ color: C.brand, fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    >
                      {mode === "login" ? "Registrate" : "Iniciá sesión"}
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
        <Typography color="text.secondary">Cargando tu perfil...</Typography>
      </Box>
    );
  }

  if (!userData?.profileCompleted) {
    return null;
  }

  /* ---------------- DASHBOARD ---------------- */
  return <Dashboard />;
};

export default UserDataPage;
