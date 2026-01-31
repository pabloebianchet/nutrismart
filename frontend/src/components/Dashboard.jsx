import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Divider,
} from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { useNutrition } from "../context/NutritionContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ScoreDonut from "./ScoreDonut";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user, userData, updateUserData } = useNutrition();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    sexo: "Femenino",
    edad: "",
    actividad: "Moderada",
    peso: "",
    altura: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + (item.score ?? 0), 0) /
            history.length
        )
      : 0;

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  useEffect(() => {
    if (!user?.googleId) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/analysis/${user.googleId}`
        );

        setHistory(res.data.history || []);
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.googleId]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileCancel = () => {
    setEditingProfile(false);
    if (userData) {
      setProfileForm({
        sexo: userData.sexo || "Femenino",
        edad: userData.edad || "",
        actividad: userData.actividad || "Moderada",
        peso: userData.peso || "",
        altura: userData.altura || "",
      });
    }
  };

  const handleProfileSave = async () => {
    if (!user?.googleId) return;
    setSavingProfile(true);
    try {
      await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: user.googleId,
          ...profileForm,
        }),
      });
      updateUserData({ ...profileForm, profileCompleted: true });
      setEditingProfile(false);
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4fbf7",
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800}>
          Hola{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </Typography>

        <Typography variant="body1" color="text.secondary" mt={1}>
          Este es tu panel personal de NutriSmart.
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          bgcolor: "#ffffff",
          boxShadow: "0 12px 30px rgba(15, 59, 47, 0.12)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Tus datos personales
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Ajustá tus datos para mejorar el análisis nutricional.
          </Typography>

          <Stack spacing={2} mt={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                name="sexo"
                label="Género"
                value={profileForm.sexo}
                onChange={handleProfileChange}
                disabled={!editingProfile}
                fullWidth
              >
                {["Femenino", "Masculino", "Otro"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="edad"
                label="Edad"
                type="number"
                value={profileForm.edad}
                onChange={handleProfileChange}
                disabled={!editingProfile}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                name="actividad"
                label="Actividad física"
                value={profileForm.actividad}
                onChange={handleProfileChange}
                disabled={!editingProfile}
                fullWidth
              >
                {["Nula", "Moderada", "Intensa", "Profesional"].map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  )
                )}
              </TextField>
              <TextField
                name="peso"
                label="Peso (kg)"
                type="number"
                value={profileForm.peso}
                onChange={handleProfileChange}
                disabled={!editingProfile}
                fullWidth
              />
            </Stack>

            <TextField
              name="altura"
              label="Altura (cm)"
              type="number"
              value={profileForm.altura}
              onChange={handleProfileChange}
              disabled={!editingProfile}
              fullWidth
            />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mt={3}
          >
            {editingProfile ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    bgcolor: "#0f6d63",
                    "&:hover": { bgcolor: "#0c5a52" },
                  }}
                >
                  {savingProfile ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleProfileCancel}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    borderColor: "#0f6d63",
                    color: "#0f6d63",
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={() => setEditingProfile(true)}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  borderColor: "#0f6d63",
                  color: "#0f6d63",
                }}
              >
                Editar datos
              </Button>
            )}
          </Stack>
        </Box>

        <Box>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: "#f7fcfa",
              borderColor: "rgba(27, 94, 75, 0.2)",
              height: "100%",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Resumen rápido
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Género</Typography>
                <Typography fontWeight={600}>
                  {profileForm.sexo || "Sin datos"}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Edad</Typography>
                <Typography fontWeight={600}>
                  {profileForm.edad ? `${profileForm.edad} años` : "Sin datos"}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">
                  Actividad física
                </Typography>
                <Typography fontWeight={600}>
                  {profileForm.actividad || "Sin datos"}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Peso</Typography>
                <Typography fontWeight={600}>
                  {profileForm.peso ? `${profileForm.peso} kg` : "Sin datos"}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Altura</Typography>
                <Typography fontWeight={600}>
                  {profileForm.altura
                    ? `${profileForm.altura} cm`
                    : "Sin datos"}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Paper>

      {/* CTA NUEVO ANÁLISIS */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 12px 30px rgba(15, 59, 47, 0.12)",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Nuevo análisis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analizá un producto escaneando su etiqueta.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineRoundedIcon />}
          sx={{
            bgcolor: "#0f6d63",
            borderRadius: 999,
            px: 3,
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#0c5a52",
            },
          }}
          onClick={() => navigate("/capture")}
        >
          Analizar
        </Button>
      </Paper>

      {/* HISTORIAL */}
      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Tus análisis recientes
        </Typography>

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Cargando historial...
          </Typography>
        ) : history.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: "center",
              bgcolor: "#ffffff",
              boxShadow: "0 10px 25px rgba(15, 59, 47, 0.08)",
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              Todavía no realizaste análisis
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Cuando analices productos, los vas a ver acá durante 30 días.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                bgcolor: "#ffffff",
                boxShadow: "0 12px 30px rgba(15, 59, 47, 0.12)",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Promedio de tus análisis
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Basado en {history.length} productos analizados.
                </Typography>
              </Box>
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
                <Paper
                  key={item._id}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: "#ffffff",
                    boxShadow: "0 10px 25px rgba(15, 59, 47, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    minHeight: 210,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(item.createdAt)}
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    Puntaje: {item.score} / 100
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {item.analysisText}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
