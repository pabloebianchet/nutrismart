import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Stack,
  TextField, LinearProgress, InputAdornment,
} from "@mui/material";
import ArrowBackRoundedIcon      from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon   from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";

import { useNutrition } from "../context/NutritionContext";
import { useNavigate }  from "react-router-dom";
import { API_URL }      from "../config/api";

/* ── Paleta ─────────────────────────────────────────────────── */
const C = {
  brand:        "#bae0dc",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  textPrimary:  "#0F2420",
  textSecondary:"#4A6B67",
  textMuted:    "#8AADAA",
  border:       "rgba(11,94,85,0.14)",
};

const GENEROS = [
  { value: "Femenino",  emoji: "👩", label: "Femenino"  },
  { value: "Masculino", emoji: "👨", label: "Masculino" },
  { value: "Otro",      emoji: "🧑", label: "Otro"      },
];

const ACTIVIDADES = [
  { value: "Nula",        emoji: "🛋️", label: "Sin actividad",  desc: "Trabajo sedentario, casi nada de movimiento" },
  { value: "Moderada",    emoji: "🚶", label: "Moderada",       desc: "Ejercicio 2–3 veces por semana" },
  { value: "Intensa",     emoji: "🏃", label: "Intensa",        desc: "Ejercicio 4–5 veces por semana" },
  { value: "Profesional", emoji: "🏆", label: "Profesional",    desc: "Entrenamiento intensivo todos los días" },
];

const TOTAL = 3;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    "& fieldset":             { borderColor: C.border },
    "&:hover fieldset":       { borderColor: "#2a6e67" },
    "&.Mui-focused fieldset": { bordercolor: "#2a6e67", borderWidth: 2 },
  },
};

const STEPS_META = [
  { title: null, sub: "Necesitamos algunos datos para personalizar tu experiencia." },
  { title: "Tus medidas 📏",         sub: "Con tu peso y altura calculamos tu IMC y mejoramos tus recomendaciones." },
  { title: "¿Cuánto te movés? 🏃",   sub: "Tu nivel de actividad determina cuántas calorías necesitás por día." },
];

/* ════════════════════════════════════════════════════════════ */
const UserDataFormStyled = () => {
  const [step,   setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [form,   setForm]   = useState({
    sexo: "", edad: "", peso: "", altura: "", actividad: "",
  });

  const { updateUserData, user } = useNutrition();
  const navigate = useNavigate();

  /* Cargar perfil existente */
  useEffect(() => {
    const id = user?._id || user?.googleId;
    if (!id) return;
    const token = localStorage.getItem("nutrismartToken");
    fetch(`${API_URL}/api/user/profile/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.user) return;
        setForm(p => ({
          ...p,
          sexo:      d.user.sexo      || "",
          edad:      d.user.edad      || "",
          peso:      d.user.peso      || "",
          altura:    d.user.altura    || "",
          actividad: d.user.actividad || "",
        }));
        updateUserData(d.user);
      })
      .catch(() => {});
  }, [user]); // eslint-disable-line

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const canNext = () => {
    if (step === 0) {
      const edad = Number(form.edad);
      return !!form.sexo && edad >= 5 && edad <= 120;
    }
    if (step === 1) {
      const peso = Number(form.peso), alt = Number(form.altura);
      return peso >= 20 && peso <= 350 && alt >= 80 && alt <= 260;
    }
    if (step === 2) return !!form.actividad;
    return false;
  };

  const handleNext = () => {
    setError("");
    if (step < TOTAL - 1) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("nutrismartToken");
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, googleId: user.googleId, ...form }),
      });
      const data = await res.json();
      updateUserData(data.user ?? { ...form, profileCompleted: true });
      navigate("/");
    } catch {
      setError("Error al guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "ahí";
  const pct       = ((step + 1) / TOTAL) * 100;
  const meta      = STEPS_META[step];

  return (
    <Box sx={{ width: "100%", maxWidth: 520, mx: "auto" }}>

      {/* ── Progreso ── */}
      <Box sx={{ mb: 3, px: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Paso {step + 1} de {TOTAL}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: C.textMuted }}>
            {TOTAL - step - 1 === 0
              ? "¡Último paso!"
              : `Falta${TOTAL - step - 1 !== 1 ? "n" : ""} ${TOTAL - step - 1} paso${TOTAL - step - 1 !== 1 ? "s" : ""}`}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 5, borderRadius: 99,
            bgcolor: C.brandSurface,
            "& .MuiLinearProgress-bar": { bgcolor: "#2a6e67", borderRadius: 99 },
          }}
        />

        <Stack direction="row" spacing={0.75} mt={1.5} justifyContent="center">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === step ? 22 : 7, height: 7,
                borderRadius: 99,
                bgcolor: "#2a6e67",
                opacity: i < step ? 0.3 : i === step ? 1 : 0.12,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* ── Card ── */}
      <Box
        key={step}
        sx={{
          background: "#fff",
          borderRadius: 5,
          boxShadow: "0 8px 40px rgba(11,94,85,0.10), 0 1px 4px rgba(0,0,0,0.04)",
          border: `1.5px solid ${C.border}`,
          overflow: "hidden",
          animation: "fadeSlide 0.28s ease both",
          "@keyframes fadeSlide": {
            from: { opacity: 0, transform: "translateY(12px)" },
            to:   { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: 4, pb: 2.5 }}>
          <Typography sx={{ fontSize: { xs: 20, sm: 23 }, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px", mb: 0.75 }}>
            {step === 0 ? `¡Hola, ${firstName}! 👋` : meta.title}
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.65 }}>
            {meta.sub}
          </Typography>
        </Box>

        <Box sx={{ height: "1px", bgcolor: C.border, mx: { xs: 3, sm: 4 } }} />

        {/* Body */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 4 }}>

          {/* ══ PASO 0: Género + Edad ══ */}
          {step === 0 && (
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                  Género
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  {GENEROS.map(({ value, emoji, label }) => {
                    const sel = form.sexo === value;
                    return (
                      <Box
                        key={value}
                        onClick={() => set("sexo", value)}
                        sx={{
                          flex: 1, py: 2, borderRadius: 3,
                          border: `2px solid ${sel ? C.brand : C.border}`,
                          bgcolor: sel ? C.brandSurface : "#fafafa",
                          cursor: "pointer", textAlign: "center",
                          transition: "all 0.18s ease",
                          "&:hover": { bordercolor: "#2a6e67", bgcolor: C.brandSurface },
                          userSelect: "none",
                        }}
                      >
                        <Typography sx={{ fontSize: 26, mb: 0.4, lineHeight: 1 }}>{emoji}</Typography>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: sel ? C.brand : C.textSecondary }}>
                          {label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                  Edad
                </Typography>
                <TextField
                  type="number"
                  value={form.edad}
                  onChange={e => set("edad", e.target.value)}
                  placeholder="ej: 28"
                  fullWidth
                  inputProps={{ min: 5, max: 120 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ color: C.textMuted, fontWeight: 600, fontSize: 13.5 }}>años</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Box>
            </Stack>
          )}

          {/* ══ PASO 1: Peso + Altura ══ */}
          {step === 1 && (
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                  Peso
                </Typography>
                <TextField
                  type="number"
                  value={form.peso}
                  onChange={e => set("peso", e.target.value)}
                  placeholder="ej: 70"
                  fullWidth
                  inputProps={{ min: 20, max: 350 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ color: C.textMuted, fontWeight: 600, fontSize: 13.5 }}>kg</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                  Altura
                </Typography>
                <TextField
                  type="number"
                  value={form.altura}
                  onChange={e => set("altura", e.target.value)}
                  placeholder="ej: 170"
                  fullWidth
                  inputProps={{ min: 80, max: 260 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ color: C.textMuted, fontWeight: 600, fontSize: 13.5 }}>cm</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Box>
            </Stack>
          )}

          {/* ══ PASO 2: Actividad ══ */}
          {step === 2 && (
            <Stack spacing={1.5}>
              {ACTIVIDADES.map(({ value, emoji, label, desc }) => {
                const sel = form.actividad === value;
                return (
                  <Box
                    key={value}
                    onClick={() => set("actividad", value)}
                    sx={{
                      p: 2, borderRadius: 3,
                      border: `2px solid ${sel ? C.brand : C.border}`,
                      bgcolor: sel ? C.brandSurface : "#fafafa",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 2,
                      transition: "all 0.18s ease",
                      "&:hover": { bordercolor: "#2a6e67", bgcolor: C.brandSurface },
                      userSelect: "none",
                    }}
                  >
                    <Typography sx={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{emoji}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: sel ? C.brand : C.textPrimary }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: C.textSecondary, lineHeight: 1.5 }}>
                        {desc}
                      </Typography>
                    </Box>
                    {sel && <CheckCircleRoundedIcon sx={{ color: "#2a6e67", fontSize: 20, flexShrink: 0 }} />}
                  </Box>
                );
              })}
            </Stack>
          )}

          {error && (
            <Typography sx={{ color: "#E24B4A", fontSize: 13, mt: 2.5 }}>{error}</Typography>
          )}

          {/* ── Navegación ── */}
          <Stack direction="row" spacing={1.5} mt={4}>
            {step > 0 && (
              <Button
                onClick={() => { setError(""); setStep(s => s - 1); }}
                startIcon={<ArrowBackRoundedIcon />}
                sx={{
                  borderRadius: 2.5, textTransform: "none", fontWeight: 600, fontSize: 14,
                  color: C.textSecondary, border: `1.5px solid ${C.border}`,
                  px: 2.5, py: 1.2, flexShrink: 0,
                  "&:hover": { bgcolor: C.brandSurface, bordercolor: "#2a6e67", color: "#2a6e67" },
                }}
              >
                Atrás
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canNext() || saving}
              fullWidth
              endIcon={step < TOTAL - 1 ? <ArrowForwardRoundedIcon /> : null}
              sx={{
                borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 15,
                py: 1.3,
                bgcolor: "#2a6e67", color: "#fff",
                boxShadow: "0 4px 18px rgba(11,94,85,0.30)",
                transition: "all 0.18s",
                "&:hover": { bgcolor: C.brandLight, boxShadow: "0 6px 22px rgba(11,94,85,0.38)" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(0,0,0,0.08)",
                  color: "rgba(0,0,0,0.28)",
                  boxShadow: "none",
                },
              }}
            >
              {saving ? "Guardando…" : step < TOTAL - 1 ? "Continuar" : "¡Comencemos!"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDataFormStyled;
