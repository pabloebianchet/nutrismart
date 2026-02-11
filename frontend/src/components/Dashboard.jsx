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
import WavingHandOutlinedIcon from "@mui/icons-material/WavingHandOutlined";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user, userData, updateUserData, loadingUserData } = useNutrition();

  const navigate = useNavigate();
  const location = useLocation();

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

  /* ======================
     Helpers
  ====================== */

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

  /* ======================
     Effects
  ====================== */

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

    // Si el usuario no completó perfil o falta en Mongo, mandarlo al formulario.
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
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // actualiza cada minuto
    return () => clearInterval(interval);
  }, []);

  /* ======================
     Handlers
  ====================== */

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
        body: JSON.stringify({
          googleId: user.googleId,
          ...profileForm,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error guardando perfil");
      }

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
        { method: "DELETE" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error eliminando análisis");
      }

      setHistory((prev) => prev.filter((item) => item._id !== analysisId));
    } catch (err) {
      console.error("Error eliminando historial:", err);
    }
  };

  /* ======================
     Render
  ====================== */
  if (loadingUserData) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">Cargando datos de tu perfil...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // Fondo Dashboard
        bgcolor: "#ffffff",
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      {/* HEADER */}
      <Box mb={4}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Bienvenido{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </Typography>
            {/* <WavingHandOutlinedIcon sx={{ color: "#0f6d63" }} /> */}
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <AccessTimeRoundedIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />

              <Typography variant="body2" color="text.secondary">
                {now.toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                ·{" "}
                {now.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary" mt={1.5}>
          Este es tu panel personal de NutriSmart.
        </Typography>
      </Box>

      {/* PERFIL */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,

          // Fondo primera card Dashboard
          bgcolor: "#d1d1d1",
          boxShadow: "0 12px 30px rgba(15, 59, 47, 0.12)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
          gap: 3,
        }}
      >
        {/* IZQUIERDA */}
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Tus datos personales
          </Typography>

          {!editingProfile ? (
            <Paper
              sx={{
                p: 3,
                mt: 3,
                borderRadius: 4,
                bgcolor: "#f7fcfa",
                border: "1px solid rgba(15,109,99,0.15)",
              }}
            >
              <Stack spacing={1.5}>
                <InfoRow
                  icon={<PersonOutlineRoundedIcon />}
                  label="Género"
                  value={profileForm.sexo}
                />

                <InfoRow
                  icon={<CakeOutlinedIcon />}
                  label="Edad"
                  value={profileForm.edad ? `${profileForm.edad} años` : "—"}
                />

                <InfoRow
                  icon={<FlashOnOutlinedIcon />}
                  label="Actividad"
                  value={profileForm.actividad}
                />

                <InfoRow
                  icon={<MonitorWeightOutlinedIcon />}
                  label="Peso"
                  value={profileForm.peso ? `${profileForm.peso} kg` : "—"}
                />

                <InfoRow
                  icon={<HeightOutlinedIcon />}
                  label="Altura"
                  value={profileForm.altura ? `${profileForm.altura} cm` : "—"}
                />
              </Stack>

              <Button
                variant="outlined"
                onClick={() => setEditingProfile(true)}
                sx={{
                  mt: 3,
                  borderRadius: 999,
                  textTransform: "none",
                  borderColor: "#0f6d63",
                  color: "#0f6d63",
                }}
              >
                Editar datos
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2} mt={3}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  name="sexo"
                  label="Género"
                  value={profileForm.sexo}
                  onChange={handleChange}
                  fullWidth
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
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  name="actividad"
                  label="Actividad física"
                  value={profileForm.actividad}
                  onChange={handleChange}
                  fullWidth
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
                  fullWidth
                />
              </Stack>

              <TextField
                name="altura"
                label="Altura (cm)"
                type="number"
                value={profileForm.altura}
                onChange={handleChange}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#0f6d63",
                    textTransform: "none",
                  }}
                >
                  {savingProfile ? "Guardando..." : "Guardar"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setEditingProfile(false)}
                  sx={{ borderRadius: 999, textTransform: "none" }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>

        {/* RESUMEN */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            bgcolor: "#ffffff",
            border: "1px solid rgba(27,94,75,0.2)",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Resumen rápido
          </Typography>

          {[
            ["Género", profileForm.sexo],
            ["Edad", profileForm.edad ? `${profileForm.edad} años` : "—"],
            ["Actividad", profileForm.actividad],
            ["Peso", profileForm.peso ? `${profileForm.peso} kg` : "—"],
            ["Altura", profileForm.altura ? `${profileForm.altura} cm` : "—"],
          ].map(([label, value]) => (
            <Box key={label}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">{label}</Typography>
                <Typography fontWeight={600}>{value}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
        </Paper>
      </Paper>

      {/* CTA */}

      <TestCard peso={profileForm.peso} altura={profileForm.altura} />

      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 12px 30px rgba(15, 59, 47, 0.12)",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Nuevo análisis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Escaneá un producto y analizalo.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={() => navigate("/capture")}
          sx={{
            bgcolor: "#0f6d63",
            borderRadius: 999,
            px: 3,
            textTransform: "none",
          }}
        >
          Analizar
        </Button>
      </Paper>

      {/* HISTORIAL */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        Tus análisis recientes
      </Typography>

      {loading ? (
        <Typography color="text.secondary">Cargando historial...</Typography>
      ) : history.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          <Typography fontWeight={600}>
            Todavía no realizaste análisis
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography fontWeight={700} mt={4} mb={4}>
              Promedio de análisis ({history.length})
            </Typography>
            <ScoreDonut score={averageScore} />
          </Paper>

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
              <Paper key={item._id} sx={{ p: 3, borderRadius: 4 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(item.createdAt)}
                    </Typography>
                    <Typography fontWeight={700}>
                      Puntaje: {item.score}/100
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label="Eliminar análisis"
                    onClick={() => handleDeleteAnalysis(item._id)}
                    size="small"
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.analysisText}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Stack>
      )}
    </Box>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
    }}
  >
    <Box sx={{ color: "#0f6d63", display: "flex" }}>{icon}</Box>

    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>

    <Typography variant="body2" fontWeight={600} sx={{ ml: "auto" }}>
      {value}
    </Typography>
  </Box>
);

export default Dashboard;
