import { Paper, Typography, Stack, Box, Chip } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { useUiPreferences } from "../context/UiPreferencesContext";
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

const getIMCRiskLevel = (imc, language) => {
  const levels = {
    es:{under:"Bajo peso",normal:"Normal",over:"Sobrepeso",ob1:"Obesidad I",ob2:"Obesidad II",ob3:"Obesidad III",mod:"Moderado",low:"Bajo",high:"Alto",vhigh:"Muy alto",ext:"Extremo"},
    en:{under:"Underweight",normal:"Normal",over:"Overweight",ob1:"Obesity I",ob2:"Obesity II",ob3:"Obesity III",mod:"Moderate",low:"Low",high:"High",vhigh:"Very high",ext:"Extreme"},
    it:{under:"Sottopeso",normal:"Normale",over:"Sovrappeso",ob1:"Obesità I",ob2:"Obesità II",ob3:"Obesità III",mod:"Moderato",low:"Basso",high:"Alto",vhigh:"Molto alto",ext:"Estremo"}
  };
  const dict = levels[language] || levels.es;
  if (imc < 18.5)
    return { label: dict.under, risk: dict.mod, color: "#fdd835" };
  if (imc < 25) return { label: dict.normal, risk: dict.low, color: "#43a047" };
  if (imc < 30)
    return { label: dict.over, risk: dict.mod, color: "#fb8c00" };
  if (imc < 35) return { label: dict.ob1, risk: dict.high, color: "#f4511e" };
  if (imc < 40)
    return { label: dict.ob2, risk: dict.vhigh, color: "#e53935" };
  return { label: dict.ob3, risk: dict.ext, color: "#b71c1c" };
};

const getPesoIdeal = (alturaCm) => {
  const alturaM = alturaCm / 100;
  const min = +(18.5 * alturaM * alturaM).toFixed(1);
  const max = +(24.9 * alturaM * alturaM).toFixed(1);
  return `${min} – ${max} kg`;
};


const ImcCard = ({ peso, altura }) => {
  const { language } = useUiPreferences();
  const txt = {
    es:{title:"Índice de Masa Corporal (IMC)",risk:"Riesgo",normal:"Normal (18.5 – 24.9)",over:"Sobrepeso",obesity:"Obesidad",healthy:"Peso saludable estimado para tu altura",yourImc:"Tu IMC"},
    en:{title:"Body Mass Index (BMI)",risk:"Risk",normal:"Normal (18.5 – 24.9)",over:"Overweight",obesity:"Obesity",healthy:"Estimated healthy weight for your height",yourImc:"Your BMI"},
    it:{title:"Indice di Massa Corporea (BMI)",risk:"Rischio",normal:"Normale (18.5 – 24.9)",over:"Sovrappeso",obesity:"Obesità",healthy:"Peso sano stimato per la tua altezza",yourImc:"Il tuo BMI"}
  }[language] || {};
  const imc = calculateIMC(peso, altura);
  if (!imc) return null;

  const { label, risk, color } = getIMCRiskLevel(imc, language);
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
        label: txt.yourImc,
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
          label: () => `${txt.yourImc}: ${imc}`,
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
        {txt.title}
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
            {txt.risk}: <strong>{risk}</strong>
          </Typography>
        </Stack>

        {/* BARRA */}
        <Box mt={2}>
          <Bar data={data} options={options} />
        </Box>

        {/* REFERENCIAS */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <LegendItem color="#43a047" label={txt.normal} />
          <LegendItem color="#fb8c00" label={txt.over} />
          <LegendItem color="#e53935" label={txt.obesity} />
        </Stack>

        {/* INFO */}
        <Typography variant="body2" color="text.secondary" mt={1}>
          {txt.healthy}: <strong>{pesoIdeal}</strong>
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
