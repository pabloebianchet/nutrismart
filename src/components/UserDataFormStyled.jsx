import { useState } from "react";
import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
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
    navigate("/capture"); // redirige al paso siguiente
  };

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#d5ede4", // fondo base suave
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          bgcolor: "#ffffff",
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header decorativo */}
        <Box
          sx={{
            bgcolor: "#0e6253",
            color: "#fff",
            py: 4,
            px: 3,
            textAlign: "center",
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            ¡Hola!
          </Typography>
          <Typography variant="subtitle2">Bienvenido a NutriSmart</Typography>
        </Box>

        {/* Formulario */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            px: 3,
            py: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            select
            name="sexo"
            label="Sexo"
            value={form.sexo}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            InputProps={{ sx: { borderRadius: 4, bgcolor: "#f5f5f5" } }}
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
            InputProps={{ sx: { borderRadius: 4, bgcolor: "#f5f5f5" } }}
          />

          <TextField
            select
            name="actividad"
            label="Actividad física"
            value={form.actividad}
            onChange={handleChange}
            fullWidth
            InputProps={{ sx: { borderRadius: 4, bgcolor: "#f5f5f5" } }}
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
            InputProps={{ sx: { borderRadius: 4, bgcolor: "#f5f5f5" } }}
          />

          <TextField
            name="altura"
            label="Altura (cm)"
            type="number"
            value={form.altura}
            onChange={handleChange}
            fullWidth
            InputProps={{ sx: { borderRadius: 4, bgcolor: "#f5f5f5" } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 1,
              py: 1.5,
              fontWeight: "bold",
              borderRadius: 4,
              bgcolor: "#0e6253",
              "&:hover": {
                bgcolor: "#09493e",
              },
            }}
          >
            CONTINUAR
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDataFormStyled;
