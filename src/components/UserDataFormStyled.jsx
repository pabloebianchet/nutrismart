import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  InputAdornment,
  Stack,
} from "@mui/material";
import WcRoundedIcon from "@mui/icons-material/WcRounded";
import CakeRoundedIcon from "@mui/icons-material/CakeRounded";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import MonitorWeightRoundedIcon from "@mui/icons-material/MonitorWeightRounded";
import HeightRoundedIcon from "@mui/icons-material/HeightRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useNutrition } from "../context/NutritionContext";
import { useNavigate } from "react-router-dom";

const UserDataFormStyled = () => {
  const [form, setForm] = useState({
    sexo: "",
    edad: "",
    actividad: "",
    peso: "",
    altura: "",
  });

  const { updateUserData } = useNutrition();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserData(form);
    navigate("/capture");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 2, sm: 3 },
        boxSizing: "border-box",
      }}
    >
      <Paper
  sx={{
    width: "100%",
    maxWidth: 520,
    height: "calc(100vh - 32px)", // 👈 altura fija visible
    display: "flex",
    flexDirection: "column",
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(15, 59, 47, 0.18)",
  }}
>
        {/* Header */}
       <Box
  sx={{
    background:
      "linear-gradient(135deg, rgba(14, 98, 83, 0.95), rgba(38, 166, 154, 0.9))",
    color: "#fff",
    py: 4,
    px: 4,
    flexShrink: 0, // 👈 importante
  }}
>
          <Typography variant="h4" fontWeight={800}>
            Personalizá tu análisis
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Completá tus datos para obtener resultados precisos y prácticos.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={2}>
            <ShieldRoundedIcon fontSize="small" />
            <Typography variant="caption">
              Tu información se usa solo para este análisis.
            </Typography>
          </Stack>
        </Box>

        {/* Formulario */}
        <Box
  component="form"
  onSubmit={handleSubmit}
  sx={{
    px: 4,
    py: 4,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",   // 👈 scroll interno
    flexGrow: 1,         // 👈 ocupa el resto del alto
  }}
>
          <TextField
            select
            name="sexo"
            label="Sexo"
            value={form.sexo}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WcRoundedIcon color="success" />
                </InputAdornment>
              ),
              sx: { borderRadius: 4, bgcolor: "#f4fbf7" },
            }}
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
            value={form.edad}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CakeRoundedIcon color="success" />
                </InputAdornment>
              ),
              sx: { borderRadius: 4, bgcolor: "#f4fbf7" },
            }}
          />

          <TextField
            select
            name="actividad"
            label="Actividad física"
            value={form.actividad}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DirectionsRunRoundedIcon color="success" />
                </InputAdornment>
              ),
              sx: { borderRadius: 4, bgcolor: "#f4fbf7" },
            }}
          >
            {["Nula", "Moderada", "Intensa", "Profesional"].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="peso"
            label="Peso (kg)"
            type="number"
            value={form.peso}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MonitorWeightRoundedIcon color="success" />
                </InputAdornment>
              ),
              sx: { borderRadius: 4, bgcolor: "#f4fbf7" },
            }}
          />

          <TextField
            name="altura"
            label="Altura (cm)"
            type="number"
            value={form.altura}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HeightRoundedIcon color="success" />
                </InputAdornment>
              ),
              sx: { borderRadius: 4, bgcolor: "#f4fbf7" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 4,
              py: 1.6,
              fontWeight: "bold",
              borderRadius: 999,
              bgcolor: "#0e6253",
              boxShadow: "0 12px 25px rgba(14, 98, 83, 0.25)",
              "&:hover": {
                bgcolor: "#09493e",
              },
            }}
          >
            Continuar al análisis
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserDataFormStyled;
