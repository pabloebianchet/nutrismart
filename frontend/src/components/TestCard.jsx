import { Paper, Typography, Stack, Box, Chip } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip);

const calculateIMC = (peso, alturaCm) => {
  const alturaM = alturaCm / 100;
  if (!peso || !alturaM) return null;
  return +(peso / (alturaM * alturaM)).toFixed(1);
};

const getIMCRiskLevel = (imc) => {
  if (imc < 18.5)
    return { label: "Bajo peso", risk: "Moderado", color: "#fdd835" };
  if (imc < 25) return { label: "Normal", risk: "Bajo", color: "#43a047" };
  if (imc < 30)
    return { label: "Sobrepeso", risk: "Moderado", color: "#fb8c00" };
  if (imc < 35) return { label: "Obesidad I", risk: "Alto", color: "#f4511e" };
  if (imc < 40)
    return { label: "Obesidad II", risk: "Muy alto", color: "#e53935" };
  return { label: "Obesidad III", risk: "Extremo", color: "#b71c1c" };
};

const getPesoIdeal = (alturaCm) => {
  const alturaM = alturaCm / 100;
  const min = +(18.5 * alturaM * alturaM).toFixed(1);
  const max = +(24.9 * alturaM * alturaM).toFixed(1);
  return `${min} – ${max} kg`;
};


const ImcCard = ({ peso, altura }) => {
  const imc = calculateIMC(peso, altura);
  if (!imc) return null;

  const { label, risk, color } = getIMCRiskLevel(imc);
  const pesoIdeal = getPesoIdeal(altura);

  const data = {
    labels: ["IMC"],
    datasets: [
      {
        label: "Rango IMC",
        data: [40],
        backgroundColor: [
          "#fdd835", // bajo peso
          "#43a047", // normal
          "#fb8c00", // sobrepeso
          "#f4511e", // obesidad I
          "#e53935", // obesidad II+
        ],
        borderRadius: 999,
        barThickness: 18,
      },
      {
        label: "Tu IMC",
        data: [imc],
        backgroundColor: color,
        barThickness: 6,
        borderRadius: 999,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    animation: {
      duration: 1200,
      easing: "easeOutCubic",
    },
    scales: {
      x: {
        min: 0,
        max: 40,
        grid: { display: false },
        ticks: {
          stepSize: 5,
        },
      },
      y: {
        grid: { display: false },
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: () => `Tu IMC: ${imc}`,
        },
      },
    },
  };

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        mb: 4,
        boxShadow: "0 12px 30px rgba(15, 59, 47, 0.12)",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Índice de Masa Corporal (IMC)
      </Typography>

      <Stack spacing={2}>
        {/* ESTADO */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography fontSize={28} fontWeight={800}>
            {imc}
          </Typography>

          <Chip
            label={label}
            sx={{
              bgcolor: `${color}20`,
              color,
              fontWeight: 600,
            }}
          />

          <Typography color="text.secondary">
            Riesgo: <strong>{risk}</strong>
          </Typography>
        </Stack>

        {/* BARRA */}
        <Box mt={2}>
          <Bar data={data} options={options} />
        </Box>

        {/* REFERENCIAS */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <LegendItem color="#43a047" label="Normal (18.5 – 24.9)" />
          <LegendItem color="#fb8c00" label="Sobrepeso" />
          <LegendItem color="#e53935" label="Obesidad" />
        </Stack>

        {/* INFO */}
        <Typography variant="body2" color="text.secondary" mt={1}>
          Peso saludable estimado para tu altura: <strong>{pesoIdeal}</strong>
        </Typography>
      </Stack>
    </Paper>
  );
};

const LegendItem = ({ color, label }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: color,
      }}
    />
    <Typography variant="caption">{label}</Typography>
  </Stack>
);

export default ImcCard;
