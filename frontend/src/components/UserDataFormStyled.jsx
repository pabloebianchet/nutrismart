import { useEffect, useState } from "react";
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

import { API_URL } from "../config/api";
import { useTranslation } from "react-i18next";


const inputSx = {
  "& .MuiFilledInput-root": {
    borderRadius: 999,
    backgroundColor: "background.paper",
    overflow: "hidden",
  },
};

const UserDataFormStyled = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    sexo: "Femenino",
    edad: "",
    actividad: "Moderada",
    peso: "",
    altura: "",
  });

  const { updateUserData, user } = useNutrition();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.googleId) return;

    fetch(`${API_URL}/api/user/profile/${user.googleId}`)
      .then((res) => {
        if (!res.ok) throw new Error("No profile");
        return res.json();
      })
      .then((data) => {
        if (!data.user) return;

        const nextForm = {
          sexo: data.user.sexo || "Femenino",
          edad: data.user.edad || "",
          actividad: data.user.actividad || "Moderada",
          peso: data.user.peso || "",
          altura: data.user.altura || "",
        };

        setForm(nextForm);
        updateUserData(data.user);
      })
      .catch(() => {
        // usuario nuevo → dejamos defaults
      });
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/user/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        googleId: user.googleId,
        ...form,
      }),
    });

    const data = await res.json();
    updateUserData(data.user ?? { ...form, profileCompleted: true });
    navigate("/capture");
  };


  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.paper",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 380,
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: 3,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {t("profile.title")}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {t("profile.subtitle")}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mt={2}>
            <ShieldRoundedIcon fontSize="small" />
            <Typography variant="caption">
              {t("profile.privacy")}
            </Typography>
          </Stack>
        </Box>

        {/* FORM */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            select
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            variant="filled"
            fullWidth
            hiddenLabel
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WcRoundedIcon />
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            sx={inputSx}
          >
            <MenuItem value="" disabled>
              {t("profile.gender")}
            </MenuItem>

            {["Femenino", "Masculino", "Otro"].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="edad"
            type="number"
            value={form.edad}
            onChange={handleChange}
            placeholder={t("profile.age")}
            hiddenLabel
            variant="filled"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CakeRoundedIcon />
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            sx={inputSx}
          />

          <TextField
            select
            name="actividad"
            value={form.actividad}
            onChange={handleChange}
            placeholder={t("profile.activity")}
            hiddenLabel
            variant="filled"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DirectionsRunRoundedIcon />
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            sx={inputSx}
          >
            {["Nula", "Moderada", "Intensa", "Profesional"].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="peso"
            type="number"
            value={form.peso}
            onChange={handleChange}
            placeholder={t("profile.weight")}
            hiddenLabel
            variant="filled"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MonitorWeightRoundedIcon />
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            sx={inputSx}
          />

          <TextField
            name="altura"
            type="number"
            value={form.altura}
            onChange={handleChange}
            placeholder={t("profile.height")}
            hiddenLabel
            variant="filled"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HeightRoundedIcon />
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            sx={inputSx}
          />

          <Button
            type="submit"
            fullWidth
            sx={{
              mt: 3,
              py: 1.4,
              borderRadius: 999,

              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            {t("profile.continue")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserDataFormStyled;
