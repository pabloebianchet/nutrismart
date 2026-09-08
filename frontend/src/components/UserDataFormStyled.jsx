import { useEffect, useState } from "react";
import {
  Box, Typography, Button, Stack, Paper, Alert,
  TextField, LinearProgress, InputAdornment, Avatar, CircularProgress,
} from "@mui/material";
import ArrowBackRoundedIcon      from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon   from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import AddAPhotoRoundedIcon      from "@mui/icons-material/AddAPhotoRounded";
import NotificationsRoundedIcon  from "@mui/icons-material/NotificationsRounded";
import PauseRoundedIcon          from "@mui/icons-material/PauseRounded";
import SearchRoundedIcon         from "@mui/icons-material/SearchRounded";
import FitnessCenterRoundedIcon  from "@mui/icons-material/FitnessCenterRounded";
import RefreshRoundedIcon        from "@mui/icons-material/RefreshRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import DeleteOutlineRoundedIcon  from "@mui/icons-material/DeleteOutlineRounded";
import WarningAmberRoundedIcon   from "@mui/icons-material/WarningAmberRounded";

import { useNutrition } from "../context/NutritionContext";
import { useNavigate }  from "react-router-dom";
import { API_URL }      from "../config/api";
import { cldResize }    from "../utils/cloudinaryUrl.js";

/* ── Paleta ─────────────────────────────────────────────────── */
const C = {
  brand:        "#0B5E55",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  textPrimary:  "#0F2420",
  textSecondary:"#4A6B67",
  textMuted:    "#8AADAA",
  border:       "rgba(11,94,85,0.14)",
  surface:      "#fff",
};

/* ────────────────────────────────────────────
   Panel de preferencias de notificaciones —
   antes vivía en el Dashboard, ahora en el perfil.
──────────────────────────────────────────── */
const NotifPrefsPanel = () => {
  const { isUS } = useNutrition();
  const token = typeof window !== "undefined" ? localStorage.getItem("nutrismartToken") : null;

  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token || !open) return;
    fetch(`${API_URL}/api/user/notif-prefs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => d.notifPrefs && setPrefs(d.notifPrefs))
      .catch(() => {});
  }, [token, open]);

  const toggle = async (key) => {
    if (!prefs || saving) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    try {
      const r = await fetch(`${API_URL}/api/user/notif-prefs`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next[key] }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.notifPrefs) setPrefs(d.notifPrefs);
      }
    } catch { }
    setSaving(false);
  };

  const Row = ({ label, Icon, fieldKey }) => {
    const active    = prefs ? !!prefs[fieldKey] : true;
    const isPaused  = !!prefs?.paused;
    const trackColor = active
      ? (isPaused ? C.brandMuted : C.brand)
      : C.border;
    return (
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ py: 1.2, borderBottom: `1px solid ${C.border}`, "&:last-child": { borderBottom: "none" } }}>
        <Stack direction="row" alignItems="center" spacing={1.2} flex={1} minWidth={0}>
          <Icon sx={{ fontSize: 18, flexShrink: 0, color: C.textSecondary }} />
          <Box minWidth={0}>
            <Typography sx={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}>
              {label}
            </Typography>
            {active && isPaused && (
              <Typography sx={{ fontSize: 10.5, color: C.textMuted, lineHeight: 1.3 }}>
                {isUS ? "Saved · inactive due to global pause" : "Guardado · inactivo por pausa global"}
              </Typography>
            )}
          </Box>
        </Stack>
        <Box
          onClick={() => toggle(fieldKey)}
          sx={{
            width: 44, height: 24, borderRadius: 12, flexShrink: 0, ml: 1.5,
            bgcolor: trackColor,
            cursor: "pointer",
            position: "relative",
            transition: "background 0.22s",
            opacity: saving ? 0.6 : 1,
            "&:active": { transform: "scale(0.95)" },
            "&::after": {
              content: '""',
              position: "absolute",
              top: 3, left: active ? 23 : 3,
              width: 18, height: 18, borderRadius: "50%",
              background: "#fff",
              transition: "left 0.22s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            },
          }}
        />
      </Stack>
    );
  };

  return (
    <Paper elevation={0} sx={{ mb: 3, borderRadius: 4, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <Stack
        direction="row" alignItems="center" justifyContent="space-between"
        onClick={() => setOpen((v) => !v)}
        sx={{
          px: 3, py: 2, cursor: "pointer",
          bgcolor: open ? C.brandSurface : C.surface,
          transition: "background 0.2s",
          "&:hover": { bgcolor: C.brandSurface },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <NotificationsRoundedIcon sx={{ fontSize: 18, color: C.textPrimary }} />
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>
              {isUS ? "Email notifications" : "Notificaciones por email"}
            </Typography>
            {prefs && (
              <Typography sx={{ fontSize: 11, color: C.textMuted, mt: 0.2 }}>
                {isUS ? (prefs.paused ? "Paused" : "Active") : (prefs.paused ? "Pausadas" : "Activas")}
              </Typography>
            )}
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 13, color: C.textMuted, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          ▾
        </Typography>
      </Stack>

      {open && (
        <Box sx={{ px: 3, pb: 2.5, pt: 1 }}>
          {!prefs ? (
            <Typography sx={{ fontSize: 13, color: C.textMuted, py: 1.5 }}>{isUS ? "Loading preferences…" : "Cargando preferencias…"}</Typography>
          ) : (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between"
                sx={{ py: 1.5, mb: 1, borderBottom: `2px solid ${C.border}` }}>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <PauseRoundedIcon sx={{ fontSize: 18, color: C.textPrimary }} />
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                      {isUS ? "Pause all emails" : "Pausar todos los emails"}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: C.textMuted }}>
                      {isUS ? "No notifications will arrive while this is on" : "Ninguna notificación llegará mientras esté activado"}
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  onClick={() => toggle("paused")}
                  sx={{
                    width: 44, height: 24, borderRadius: 12,
                    bgcolor: prefs.paused ? "#E24B4A" : C.border,
                    cursor: "pointer", position: "relative", transition: "background 0.22s",
                    opacity: saving ? 0.6 : 1,
                    "&::after": {
                      content: '""', position: "absolute", top: 3, left: prefs.paused ? 23 : 3,
                      width: 18, height: 18, borderRadius: "50%", background: "#fff",
                      transition: "left 0.22s", boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                    },
                  }}
                />
              </Stack>

              {prefs.paused && (
                <Box sx={{
                  display: "flex", alignItems: "flex-start", gap: 1,
                  bgcolor: "rgba(226,75,74,0.06)", border: "1px solid rgba(226,75,74,0.18)",
                  borderRadius: 2.5, px: 1.8, py: 1.2, mb: 1.5,
                }}>
                  <PauseRoundedIcon sx={{ fontSize: 15, flexShrink: 0, mt: 0.1, color: "#C0392B" }} />
                  <Typography sx={{ fontSize: 11.5, color: "#C0392B", lineHeight: 1.5 }}>
                    {isUS
                      ? "Emails are paused globally. You can still set your preferences; they'll activate once you turn the pause off."
                      : "Emails pausados globalmente. Podés configurar tus preferencias; se activarán cuando desactives la pausa."}
                  </Typography>
                </Box>
              )}

              <Row label={isUS ? "Result of each analysis" : "Resultado de cada análisis"} Icon={SearchRoundedIcon} fieldKey="analysis" />
              <Row label={isUS ? "Training session" : "Sesión de entrenamiento"}    Icon={FitnessCenterRoundedIcon} fieldKey="training" />
              <Row label={isUS ? "Plan renewal" : "Renovación de plan"}         Icon={RefreshRoundedIcon} fieldKey="renewal"  />
              <Row label={isUS ? "Reminders (inactivity, training, meals)" : "Recordatorios (inactividad, entreno, comidas)"} Icon={NotificationsActiveRoundedIcon} fieldKey="reminders" />

              <Typography sx={{ fontSize: 11, color: C.textMuted, mt: 1.5, lineHeight: 1.6 }}>
                {isUS
                  ? "Emails are sent only if the matching notification is on and the global pause is off."
                  : "Los emails se envían solo si la notificación correspondiente está activa y la pausa global está desactivada."}
              </Typography>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

/* ────────────────────────────────────────────
   Eliminar cuenta — acción destructiva, confirmación
   en dos pasos antes de llamar al backend.
──────────────────────────────────────────── */
const DeleteAccountSection = () => {
  const { isUS, logout } = useNutrition();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const token = localStorage.getItem("nutrismartToken");
      const res = await fetch(`${API_URL}/api/user/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (isUS ? "Couldn't delete the account." : "No se pudo eliminar la cuenta."));
        setDeleting(false);
        return;
      }
      logout();
      navigate("/");
    } catch {
      setError(isUS ? "Connection error." : "Error de conexión.");
      setDeleting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(226,75,74,0.25)", overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.2} mb={0.5}>
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18, color: "#C0392B" }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#C0392B" }}>
            {isUS ? "Delete account" : "Eliminar cuenta"}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: 12, color: C.textMuted, mb: 2, lineHeight: 1.6 }}>
          {isUS
            ? "Permanently deletes your account and all your data (analyses, training plans, food logs, recipes). This can't be undone."
            : "Elimina tu cuenta y todos tus datos (análisis, planes de entrenamiento, registros de comida, recetas) para siempre. No se puede deshacer."}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 12.5 }}>{error}</Alert>}

        {!confirming ? (
          <Button
            onClick={() => setConfirming(true)}
            startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />}
            sx={{
              borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13.5,
              color: "#C0392B", border: "1.5px solid rgba(192,57,43,0.35)", px: 2.5, py: 1,
              "&:hover": { bgcolor: "rgba(226,75,74,0.06)", borderColor: "#C0392B" },
            }}
          >
            {isUS ? "Delete my account" : "Eliminar mi cuenta"}
          </Button>
        ) : (
          <Box sx={{ bgcolor: "rgba(226,75,74,0.06)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 3, p: 2 }}>
            <Stack direction="row" alignItems="flex-start" spacing={1} mb={1.5}>
              <WarningAmberRoundedIcon sx={{ fontSize: 18, color: "#C0392B", flexShrink: 0, mt: 0.1 }} />
              <Typography sx={{ fontSize: 12.5, color: "#C0392B", fontWeight: 600, lineHeight: 1.5 }}>
                {isUS ? "Are you sure? This is permanent." : "¿Estás seguro? Esto es definitivo."}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                sx={{
                  borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13,
                  bgcolor: "#C0392B", color: "#fff", px: 2.5, py: 1,
                  "&:hover": { bgcolor: "#a93226" },
                  "&.Mui-disabled": { bgcolor: "rgba(192,57,43,0.4)", color: "#fff" },
                }}
              >
                {deleting ? (isUS ? "Deleting…" : "Eliminando…") : (isUS ? "Yes, delete permanently" : "Sí, eliminar definitivamente")}
              </Button>
              <Button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600, fontSize: 13, color: C.textSecondary, px: 2.5, py: 1 }}
              >
                {isUS ? "Cancel" : "Cancelar"}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const getGeneros = (isUS) => [
  { value: "Femenino",  emoji: "👩", label: isUS ? "Female" : "Femenino"  },
  { value: "Masculino", emoji: "👨", label: isUS ? "Male"   : "Masculino" },
  { value: "Otro",      emoji: "🧑", label: isUS ? "Other"  : "Otro"      },
];

const getActividades = (isUS) => [
  { value: "Nula",        emoji: "🛋️", label: isUS ? "No activity"  : "Sin actividad", desc: isUS ? "Desk job, almost no movement"      : "Trabajo sedentario, casi nada de movimiento" },
  { value: "Moderada",    emoji: "🚶", label: isUS ? "Moderate"     : "Moderada",       desc: isUS ? "Exercise 2–3 times a week"         : "Ejercicio 2–3 veces por semana" },
  { value: "Intensa",     emoji: "🏃", label: isUS ? "Intense"      : "Intensa",        desc: isUS ? "Exercise 4–5 times a week"         : "Ejercicio 4–5 veces por semana" },
  { value: "Profesional", emoji: "🏆", label: isUS ? "Professional" : "Profesional",    desc: isUS ? "Intensive training every day"      : "Entrenamiento intensivo todos los días" },
];

const TOTAL = 3;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    "& fieldset":             { borderColor: C.border },
    "&:hover fieldset":       { borderColor: C.brand },
    "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 2 },
  },
};

const getStepsMeta = (isUS) => [
  { title: null, sub: isUS ? "We need a few details to personalize your experience." : "Necesitamos algunos datos para personalizar tu experiencia." },
  { title: isUS ? "Your measurements 📏"   : "Tus medidas 📏",       sub: isUS ? "With your weight and height we calculate your BMI and improve your recommendations." : "Con tu peso y altura calculamos tu IMC y mejoramos tus recomendaciones." },
  { title: isUS ? "How active are you? 🏃" : "¿Cuánto te movés? 🏃", sub: isUS ? "Your activity level determines how many calories you need per day." : "Tu nivel de actividad determina cuántas calorías necesitás por día." },
];

/* ════════════════════════════════════════════════════════════ */
const UserDataFormStyled = () => {
  const [step,   setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [form,   setForm]   = useState({
    sexo: "", edad: "", peso: "", altura: "", actividad: "", name: "",
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const { updateUserData, user, userData, isUS } = useNutrition();
  const navigate = useNavigate();

  // Perfil ya completado (viene de "Mi perfil" en el menú, o del botón
  // "Editar" del dashboard) → todos los campos en una sola pantalla, sin
  // el wizard de pasos — ya tiene los datos cargados, no es alguien
  // registrándose por primera vez. El wizard de pasos queda solo para el
  // onboarding real.
  const isEditMode = userData?.profileCompleted === true;

  const GENEROS    = getGeneros(isUS);
  const ACTIVIDADES = getActividades(isUS);
  const STEPS_META  = getStepsMeta(isUS);

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
          name:      d.user.name      || "",
        }));
        updateUserData(d.user);
      })
      .catch(() => {});
  }, [user]); // eslint-disable-line

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const step0Valid = () => {
    const edad = Number(form.edad);
    return !!form.name.trim() && !!form.sexo && edad >= 5 && edad <= 120;
  };
  const step1Valid = () => {
    const peso = Number(form.peso), alt = Number(form.altura);
    return peso >= 20 && peso <= 350 && alt >= 80 && alt <= 260;
  };
  const step2Valid = () => !!form.actividad;

  const canNext = () => {
    // Edit mode: todos los campos están en pantalla a la vez, tienen que
    // validar todos juntos para habilitar "Guardar".
    if (isEditMode) return step0Valid() && step1Valid() && step2Valid();
    if (step === 0) return step0Valid();
    if (step === 1) return step1Valid();
    if (step === 2) return step2Valid();
    return false;
  };

  const handleNext = () => {
    setError("");
    if (!isEditMode && step < TOTAL - 1) setStep(s => s + 1);
    else handleSubmit();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-seleccionar el mismo archivo después
    if (!file) return;

    setPhotoError("");
    setPhotoUploading(true);
    try {
      const token = localStorage.getItem("nutrismartToken");
      const body = new FormData();
      body.append("photo", file);
      const res = await fetch(`${API_URL}/api/user/profile-picture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setPhotoError(data.error || (isUS ? "Error uploading photo." : "Error al subir la foto."));
        return;
      }
      updateUserData(data.user);
    } catch {
      setPhotoError(isUS ? "Connection error." : "Error de conexión.");
    } finally {
      setPhotoUploading(false);
    }
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
      setError(isUS ? "Error saving. Please try again." : "Error al guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || (isUS ? "there" : "ahí");
  const pct       = ((step + 1) / TOTAL) * 100;
  const meta      = STEPS_META[step];

  return (
    <Box sx={{ width: "100%", maxWidth: 520, mx: "auto" }}>

      {/* ── Progreso — solo en el wizard de onboarding, no al editar ── */}
      {!isEditMode && (
      <Box sx={{ mb: 3, px: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {isUS ? `Step ${step + 1} of ${TOTAL}` : `Paso ${step + 1} de ${TOTAL}`}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: C.textMuted }}>
            {TOTAL - step - 1 === 0
              ? (isUS ? "Last step!" : "¡Último paso!")
              : isUS
                ? `${TOTAL - step - 1} step${TOTAL - step - 1 !== 1 ? "s" : ""} left`
                : `Falta${TOTAL - step - 1 !== 1 ? "n" : ""} ${TOTAL - step - 1} paso${TOTAL - step - 1 !== 1 ? "s" : ""}`}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 5, borderRadius: 99,
            bgcolor: C.brandSurface,
            "& .MuiLinearProgress-bar": { bgcolor: C.brand, borderRadius: 99 },
          }}
        />

        <Stack direction="row" spacing={0.75} mt={1.5} justifyContent="center">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === step ? 22 : 7, height: 7,
                borderRadius: 99,
                bgcolor: C.brand,
                opacity: i < step ? 0.3 : i === step ? 1 : 0.12,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Stack>
      </Box>
      )}

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
          <Typography sx={{ fontSize: { xs: 20, sm: 23 }, fontWeight: 900, fontFamily: '"Baloo 2", "Nunito", system-ui, sans-serif', color: C.textPrimary, letterSpacing: "-0.5px", mb: 0.75 }}>
            {isEditMode
              ? (isUS ? "Edit your profile" : "Editar tu perfil")
              : step === 0 ? (isUS ? `Hi, ${firstName}! 👋` : `¡Hola, ${firstName}! 👋`) : meta.title}
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.65 }}>
            {isEditMode
              ? (isUS ? "Update your details whenever you want." : "Actualizá tus datos cuando quieras.")
              : meta.sub}
          </Typography>
        </Box>

        <Box sx={{ height: "1px", bgcolor: C.border, mx: { xs: 3, sm: 4 } }} />

        {/* Body */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 4 }}>
        <Stack spacing={isEditMode ? 4.5 : 0}>

          {/* ══ PASO 0: Nombre + Foto + Género + Edad ══ */}
          {(isEditMode || step === 0) && (
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                  {isUS ? "Full name" : "Nombre completo"}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* Foto de perfil — editable siempre, tenga o no una de
                      Google ya cargada (pensado también para el futuro
                      chat entre usuarios, donde va a importar más). */}
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar src={cldResize(user?.picture, 170)} sx={{ width: 56, height: 56, bgcolor: C.brandSurface, border: `1.5px solid ${C.border}` }} />
                    <Box
                      component="label"
                      sx={{
                        position: "absolute", bottom: -4, right: -4,
                        width: 26, height: 26, borderRadius: "50%",
                        bgcolor: C.brand, display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", border: "2px solid #fff",
                        "&:hover": { bgcolor: C.brandLight },
                      }}
                    >
                      {photoUploading
                        ? <CircularProgress size={12} sx={{ color: "#fff" }} />
                        : <AddAPhotoRoundedIcon sx={{ fontSize: 13, color: "#fff" }} />}
                      <input type="file" accept="image/*" hidden onChange={handlePhotoChange} disabled={photoUploading} />
                    </Box>
                  </Box>
                  <TextField
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder={isUS ? "Your full name" : "Tu nombre y apellido"}
                    fullWidth
                    sx={fieldSx}
                  />
                </Stack>
                {photoError && (
                  <Typography sx={{ fontSize: 12, color: "#C62828", mt: 1 }}>{photoError}</Typography>
                )}
              </Box>

              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                  {isUS ? "Gender" : "Género"}
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
                          "&:hover": { borderColor: C.brand, bgcolor: C.brandSurface },
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
                  {isUS ? "Age" : "Edad"}
                </Typography>
                <TextField
                  type="number"
                  value={form.edad}
                  onChange={e => set("edad", e.target.value)}
                  placeholder={isUS ? "e.g: 28" : "ej: 28"}
                  fullWidth
                  inputProps={{ min: 5, max: 120 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ color: C.textMuted, fontWeight: 600, fontSize: 13.5 }}>{isUS ? "years" : "años"}</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Box>
            </Stack>
          )}

          {/* ══ PASO 1: Peso + Altura ══ */}
          {(isEditMode || step === 1) && (
            <Stack spacing={3}>
              {isEditMode && (
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.textPrimary }}>
                  {isUS ? "Your measurements 📏" : "Tus medidas 📏"}
                </Typography>
              )}
              <Box>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                  {isUS ? "Weight" : "Peso"}
                </Typography>
                <TextField
                  type="number"
                  value={form.peso}
                  onChange={e => set("peso", e.target.value)}
                  placeholder={isUS ? "e.g: 70" : "ej: 70"}
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
                  {isUS ? "Height" : "Altura"}
                </Typography>
                <TextField
                  type="number"
                  value={form.altura}
                  onChange={e => set("altura", e.target.value)}
                  placeholder={isUS ? "e.g: 170" : "ej: 170"}
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
          {(isEditMode || step === 2) && (
            <Stack spacing={1.5}>
              {isEditMode && (
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.textPrimary }}>
                  {isUS ? "How active are you? 🏃" : "¿Cuánto te movés? 🏃"}
                </Typography>
              )}
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
                      "&:hover": { borderColor: C.brand, bgcolor: C.brandSurface },
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
                    {sel && <CheckCircleRoundedIcon sx={{ color: C.brand, fontSize: 20, flexShrink: 0 }} />}
                  </Box>
                );
              })}
            </Stack>
          )}

        </Stack>

          {error && (
            <Typography sx={{ color: "#E24B4A", fontSize: 13, mt: 2.5 }}>{error}</Typography>
          )}

          {/* ── Navegación ── */}
          <Stack direction="row" spacing={1.5} mt={4}>
            {!isEditMode && step > 0 && (
              <Button
                onClick={() => { setError(""); setStep(s => s - 1); }}
                startIcon={<ArrowBackRoundedIcon />}
                sx={{
                  borderRadius: 2.5, textTransform: "none", fontWeight: 600, fontSize: 14,
                  color: C.textSecondary, border: `1.5px solid ${C.border}`,
                  px: 2.5, py: 1.2, flexShrink: 0,
                  "&:hover": { bgcolor: C.brandSurface, borderColor: C.brand, color: C.brand },
                }}
              >
                {isUS ? "Back" : "Atrás"}
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canNext() || saving}
              fullWidth
              endIcon={!isEditMode && step < TOTAL - 1 ? <ArrowForwardRoundedIcon /> : null}
              sx={{
                borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 15,
                py: 1.3,
                bgcolor: C.brand, color: "#fff",
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
              {saving
                ? (isUS ? "Saving…" : "Guardando…")
                : isEditMode
                  ? (isUS ? "Save changes" : "Guardar cambios")
                  : step < TOTAL - 1
                    ? (isUS ? "Continue" : "Continuar")
                    : (isUS ? "Let's start!" : "¡Comencemos!")}
            </Button>
          </Stack>
        </Box>
      </Box>

      {isEditMode && (
        <Stack spacing={2.5} sx={{ mt: 3 }}>
          <NotifPrefsPanel />
          <DeleteAccountSection />
        </Stack>
      )}
    </Box>
  );
};

export default UserDataFormStyled;
