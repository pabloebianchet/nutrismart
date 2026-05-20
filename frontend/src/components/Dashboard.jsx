import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Divider,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
} from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useNutrition } from "../context/NutritionContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ScoreDonut from "./ScoreDonut";
import TestCard from "./TestCard";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import HeightOutlinedIcon from "@mui/icons-material/HeightOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { API_URL } from "../config/api";

/* ────────────────────────────────────────────
   Paleta y tokens de diseño
──────────────────────────────────────────── */
const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  accent: "#22C9B0",
  accentWarm: "#F5A623",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.12)",
  borderStrong: "rgba(11,94,85,0.25)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
  danger: "#E24B4A",
  success: "#3B9E6A",
};

const shadow = {
  sm: "0 1px 3px rgba(11,94,85,0.08), 0 1px 2px rgba(11,94,85,0.04)",
  md: "0 4px 12px rgba(11,94,85,0.10), 0 2px 4px rgba(11,94,85,0.06)",
  lg: "0 12px 32px rgba(11,94,85,0.12), 0 4px 8px rgba(11,94,85,0.06)",
  xl: "0 24px 48px rgba(11,94,85,0.14), 0 8px 16px rgba(11,94,85,0.08)",
};

/* ────────────────────────────────────────────
   Sub-componentes
──────────────────────────────────────────── */

const StatPill = ({ label, value, icon: Icon, accent }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1.5,
      borderRadius: 3,
      bgcolor: accent ? C.brandSurface : C.surfaceAlt,
      border: `1px solid ${accent ? C.brandMuted : C.border}`,
      flex: 1,
      minWidth: 0,
    }}
  >
    {Icon && (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          bgcolor: accent ? C.brand : "rgba(11,94,85,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16, color: accent ? "#fff" : C.brand }} />
      </Box>
    )}
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          lineHeight: 1,
          mb: 0.4,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 700,
          color: C.textPrimary,
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const ScoreBadge = ({ score }) => {
  const color = score >= 75 ? C.success : score >= 50 ? C.accentWarm : C.danger;
  const label = score >= 75 ? "Excelente" : score >= 50 ? "Regular" : "Mejorar";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: 11, fontWeight: 600, color }}>
        {label}
      </Typography>
    </Box>
  );
};

const AnalysisCard = ({ item, onDelete, formatDateTime }) => {
  const score = item.score ?? 0;
  const pct = Math.min(score, 100);
  const barColor = pct >= 75 ? C.success : pct >= 50 ? C.accentWarm : C.danger;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 4,
        border: `1px solid ${C.border}`,
        bgcolor: C.surface,
        boxShadow: shadow.sm,
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: shadow.md,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Color accent strip */}
      <Box sx={{ height: 3, bgcolor: barColor, width: `${pct}%` }} />

      <Box sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                color: C.textMuted,
                mb: 0.3,
                fontWeight: 500,
              }}
            >
              {formatDateTime(item.createdAt)}
            </Typography>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: C.textPrimary,
                lineHeight: 1,
              }}
            >
              {score}
              <Typography
                component="span"
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.textMuted,
                  ml: 0.5,
                }}
              >
                /100
              </Typography>
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ScoreBadge score={score} />
            <IconButton
              size="small"
              onClick={() => onDelete(item._id)}
              sx={{
                color: C.textMuted,
                "&:hover": { color: C.danger, bgcolor: "rgba(226,75,74,0.08)" },
              }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: "rgba(11,94,85,0.08)",
            mb: 2,
            "& .MuiLinearProgress-bar": { bgcolor: barColor, borderRadius: 2 },
          }}
        />

        <Typography
          variant="body2"
          sx={{
            color: C.textSecondary,
            fontSize: 13,
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.analysisText}
        </Typography>
      </Box>
    </Paper>
  );
};

/* ────────────────────────────────────────────
   Dashboard principal
──────────────────────────────────────────── */
const Dashboard = () => {
  const { user, userData, updateUserData, loadingUserData } = useNutrition();

  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.email === "raccoonitweb@gmail.com";

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);

  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    sexo: "Femenino",
    edad: "",
    actividad: "Moderada",
    peso: "",
    altura: "",
  });

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + (item.score ?? 0), 0) /
            history.length,
        )
      : 0;

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const datePart = date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} · ${timePart}`;
  };

  useEffect(() => {
    if (!userData) return;
    setProfileForm({
      sexo: userData.sexo || "Femenino",
      edad: userData.edad || "",
      actividad: userData.actividad || "Moderada",
      peso: userData.peso || "",
      altura: userData.altura || "",
    });
  }, [userData]);

  const fetchHistory = useCallback(async () => {
    if (!user?.googleId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/user/analysis/${user.googleId}`,
      );
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.googleId]);

  useEffect(() => {
    if (!user?.googleId) return;
    if (userData?.profileCompleted !== true) {
      navigate("/profile", { replace: true });
      return;
    }
    fetchHistory();
  }, [
    fetchHistory,
    navigate,
    user?.googleId,
    userData?.profileCompleted,
    location.key,
    historyRefreshToken,
  ]);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?.googleId) return;
    setSavingProfile(true);
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleId: user.googleId, ...profileForm }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error || "Error guardando perfil");
      updateUserData({ ...profileForm, profileCompleted: true });
      setEditingProfile(false);
      setHistoryRefreshToken((prev) => prev + 1);
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!analysisId) return;
    try {
      const response = await fetch(
        `${API_URL}/api/user/analysis/${analysisId}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error || "Error eliminando análisis");
      setHistory((prev) => prev.filter((item) => item._id !== analysisId));
    } catch (err) {
      console.error("Error eliminando historial:", err);
    }
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (loadingUserData) {
    return (
      <Box
        sx={{
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: C.brandSurface,
            border: `3px solid ${C.brandMuted}`,
            borderTopColor: C.brand,
            animation: "spin 0.8s linear infinite",
            "@keyframes spin": { to: { transform: "rotate(360deg)" } },
          }}
        />
        <Typography sx={{ color: C.textMuted, fontSize: 14 }}>
          Cargando tu perfil…
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.surfaceAlt,
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 3, md: 5 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      {/* ── HEADER ──────────────────────────────── */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={5}
        gap={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={user?.picture}
            alt={user?.name}
            sx={{
              width: 52,
              height: 52,
              bgcolor: C.brand,
              fontSize: 18,
              fontWeight: 700,
              boxShadow: `0 0 0 3px ${C.brandMuted}`,
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                color: C.textMuted,
                fontWeight: 500,
                mb: 0.2,
              }}
            >
              {greeting()},
            </Typography>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: C.textPrimary,
                lineHeight: 1.2,
              }}
            >
              {firstName || "Usuario"}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
        >
          <Chip
            icon={
              <AccessTimeRoundedIcon sx={{ fontSize: "14px !important" }} />
            }
            label={`${now.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })} · ${now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`}
            size="small"
            sx={{
              bgcolor: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
              fontSize: 12,
              fontWeight: 500,
              boxShadow: shadow.sm,
            }}
          />
          {isAdmin && (
            <Button
              variant="outlined"
              startIcon={<AdminPanelSettingsOutlinedIcon />}
              onClick={() => navigate("/admin")}
              size="small"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                borderColor: C.brand,
                color: C.brand,
                fontWeight: 600,
                fontSize: 13,
                "&:hover": { bgcolor: C.brandSurface },
              }}
            >
              Admin
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ── STATS RÁPIDAS ────────────────────────── */}
      {history.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            mb: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              boxShadow: shadow.sm,
              bgcolor: C.surface,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Puntaje promedio
            </Typography>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 900,
                color: C.brand,
                lineHeight: 1,
              }}
            >
              {averageScore}
              <Typography
                component="span"
                sx={{ fontSize: 14, fontWeight: 500, color: C.textMuted }}
              >
                /100
              </Typography>
            </Typography>
            <ScoreBadge score={averageScore} />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              boxShadow: shadow.sm,
              bgcolor: C.surface,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Análisis realizados
            </Typography>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 900,
                color: C.textPrimary,
                lineHeight: 1,
              }}
            >
              {history.length}
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.textMuted }}>
              en total
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              boxShadow: shadow.sm,
              bgcolor: C.surface,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              gridColumn: { xs: "1 / -1", sm: "auto" },
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Mejor puntaje
            </Typography>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 900,
                color: C.success,
                lineHeight: 1,
              }}
            >
              {Math.max(...history.map((h) => h.score ?? 0))}
              <Typography
                component="span"
                sx={{ fontSize: 14, fontWeight: 500, color: C.textMuted }}
              >
                /100
              </Typography>
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.textMuted }}>
              récord personal
            </Typography>
          </Paper>
        </Box>
      )}

      {/* ── PERFIL ──────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 5,
          border: `1px solid ${C.border}`,
          boxShadow: shadow.md,
          overflow: "hidden",
          bgcolor: C.surface,
        }}
      >
        {/* Header de sección */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 2.5,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: C.surfaceAlt,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2.5,
                bgcolor: C.brandSurface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonOutlineRoundedIcon sx={{ fontSize: 18, color: C.brand }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}
              >
                Perfil personal
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                Tus datos físicos
              </Typography>
            </Box>
          </Stack>

          {!editingProfile && (
            <Button
              startIcon={<EditOutlinedIcon />}
              onClick={() => setEditingProfile(true)}
              size="small"
              sx={{
                textTransform: "none",
                color: C.brand,
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 999,
                px: 2,
                "&:hover": { bgcolor: C.brandSurface },
              }}
            >
              Editar
            </Button>
          )}
        </Box>

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          {!editingProfile ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(5, 1fr)",
                },
                gap: 1.5,
              }}
            >
              <StatPill
                icon={PersonOutlineRoundedIcon}
                label="Género"
                value={profileForm.sexo}
              />
              <StatPill
                icon={CakeOutlinedIcon}
                label="Edad"
                value={profileForm.edad ? `${profileForm.edad} años` : null}
              />
              <StatPill
                icon={FlashOnOutlinedIcon}
                label="Actividad"
                value={profileForm.actividad}
                accent
              />
              <StatPill
                icon={MonitorWeightOutlinedIcon}
                label="Peso"
                value={profileForm.peso ? `${profileForm.peso} kg` : null}
              />
              <StatPill
                icon={HeightOutlinedIcon}
                label="Altura"
                value={profileForm.altura ? `${profileForm.altura} cm` : null}
              />
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  mb: 2,
                }}
              >
                <TextField
                  select
                  name="sexo"
                  label="Género"
                  value={profileForm.sexo}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={inputSx}
                >
                  {["Femenino", "Masculino", "Otro"].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="edad"
                  label="Edad"
                  type="number"
                  value={profileForm.edad}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={inputSx}
                />

                <TextField
                  select
                  name="actividad"
                  label="Actividad física"
                  value={profileForm.actividad}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={inputSx}
                >
                  {["Nula", "Moderada", "Intensa", "Profesional"].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="peso"
                  label="Peso (kg)"
                  type="number"
                  value={profileForm.peso}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={inputSx}
                />

                <TextField
                  name="altura"
                  label="Altura (cm)"
                  type="number"
                  value={profileForm.altura}
                  onChange={handleChange}
                  size="small"
                  sx={{ ...inputSx, gridColumn: { xs: "auto", sm: "1 / -1" } }}
                />
              </Box>

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={savingProfile ? null : <CheckRoundedIcon />}
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  sx={{
                    borderRadius: 999,
                    bgcolor: C.brand,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    boxShadow: "none",
                    "&:hover": { bgcolor: C.brandLight, boxShadow: "none" },
                  }}
                >
                  {savingProfile ? "Guardando…" : "Guardar"}
                </Button>

                <Button
                  startIcon={<CloseRoundedIcon />}
                  onClick={() => setEditingProfile(false)}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    color: C.textSecondary,
                    fontWeight: 600,
                    px: 3,
                    "&:hover": { bgcolor: C.surfaceAlt },
                  }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Paper>

      {/* ── TEST CARD (IMC u otro) ───────────────── */}
      <Box mb={4}>
        <TestCard peso={profileForm.peso} altura={profileForm.altura} />
      </Box>

      {/* ── CTA NUEVO ANÁLISIS ──────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 5,
          borderRadius: 5,
          border: `1px solid ${C.borderStrong}`,
          boxShadow: shadow.lg,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${C.brand} 0%, ${C.brandLight} 100%)`,
          position: "relative",
        }}
      >
        {/* Decorative circle */}
        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 40,
            bottom: -60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ p: { xs: 3, md: 4 }, position: "relative" }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 0.5,
              }}
            >
              NutriSmart
            </Typography>
            <Typography
              sx={{ fontSize: 20, fontWeight: 800, color: "#fff", mb: 0.5 }}
            >
              Analizá tu próximo producto
            </Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
              Escaneá el código o la etiqueta nutricional
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => navigate("/capture")}
            sx={{
              bgcolor: "#fff",
              color: C.brand,
              borderRadius: 999,
              px: 4,
              py: 1.4,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              flexShrink: 0,
              "&:hover": {
                bgcolor: C.brandSurface,
                boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
              },
            }}
          >
            Nuevo análisis
          </Button>
        </Stack>
      </Paper>

      {/* ── HISTORIAL ───────────────────────────── */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography
            sx={{ fontSize: 18, fontWeight: 800, color: C.textPrimary }}
          >
            Análisis recientes
          </Typography>
          {history.length > 0 && (
            <Typography sx={{ fontSize: 13, color: C.textMuted, mt: 0.3 }}>
              {history.length} análisis realizados
            </Typography>
          )}
        </Box>
        {history.length > 0 && (
          <Chip
            icon={
              <BarChartRoundedIcon
                sx={{
                  fontSize: "14px !important",
                  color: `${C.brand} !important`,
                }}
              />
            }
            label={`Promedio ${averageScore}/100`}
            size="small"
            sx={{
              bgcolor: C.brandSurface,
              color: C.brand,
              fontWeight: 700,
              fontSize: 12,
              border: `1px solid ${C.brandMuted}`,
            }}
          />
        )}
      </Stack>

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `3px solid ${C.brandMuted}`,
              borderTopColor: C.brand,
              animation: "spin 0.8s linear infinite",
              "@keyframes spin": { to: { transform: "rotate(360deg)" } },
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography sx={{ color: C.textMuted, fontSize: 14 }}>
            Cargando historial…
          </Typography>
        </Box>
      ) : history.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 5,
            border: `1px dashed ${C.brandMuted}`,
            bgcolor: C.brandSurface,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: C.brandMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <TrendingUpRoundedIcon sx={{ fontSize: 28, color: C.brand }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              color: C.textPrimary,
              mb: 0.5,
            }}
          >
            Todavía no realizaste análisis
          </Typography>
          <Typography sx={{ fontSize: 14, color: C.textMuted, mb: 3 }}>
            Comenzá escaneando el primer producto
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/capture")}
            sx={{
              bgcolor: C.brand,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              boxShadow: "none",
              "&:hover": { bgcolor: C.brandLight, boxShadow: "none" },
            }}
          >
            Empezar ahora
          </Button>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {/* Donut promedio */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 5,
              border: `1px solid ${C.border}`,
              boxShadow: shadow.sm,
              bgcolor: C.surface,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: C.textPrimary,
                mb: 0.5,
              }}
            >
              Puntaje promedio general
            </Typography>
            <Typography sx={{ fontSize: 13, color: C.textMuted, mb: 3 }}>
              Basado en {history.length} análisis realizados
            </Typography>
            <ScoreDonut score={averageScore} />
          </Paper>

          {/* Grid de cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {history.map((item) => (
              <AnalysisCard
                key={item._id}
                item={item}
                onDelete={handleDeleteAnalysis}
                formatDateTime={formatDateTime}
              />
            ))}
          </Box>
        </Stack>
      )}

      {/* Spacer bottom */}
      <Box sx={{ height: 40 }} />
    </Box>
  );
};

/* ────────────────────────────────────────────
   Helpers de estilos
──────────────────────────────────────────── */
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: C.brand },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: C.brand,
      borderWidth: 1.5,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: C.brand },
};

export default Dashboard;
