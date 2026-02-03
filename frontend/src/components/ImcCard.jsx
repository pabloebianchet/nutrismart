import { Paper, Typography, Stack } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

const calculateImc = (peso, alturaCm) => {
  const alturaM = alturaCm / 100;
  if (!peso || !alturaM) return null;
  return +(peso / (alturaM * alturaM)).toFixed(1);
};

const getImcRiskLevel = (imc) => {
  if (imc < 18.5) return { label: "Bajo peso", risk: "Moderado", level: 2 };
  if (imc < 25) return { label: "Normal", risk: "Bajo", level: 1 };
  if (imc < 30) return { label: "Sobrepeso", risk: "Moderado", level: 2 };
  if (imc < 35) return { label: "Obesidad I", risk: "Alto", level: 3 };
  if (imc < 40) return { label: "Obesidad II", risk: "Muy alto", level: 4 };
  return { label: "Obesidad III", risk: "Extremo", level: 5 };
};

const ImcCard = ({ peso, altura }) => {
  const imc = calculateImc(peso, altura);
  if (!imc) return null;

  const { label, risk, level } = getImcRiskLevel(imc);

  const data = {
    labels: ["Nivel de riesgo"],
    datasets: [
      {
        data: [level * 20, 100 - level * 20],
        backgroundColor: ["#e53935", "#eee"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "#fff3f3",
        border: "1px solid #e53935",
        mb: 4,
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2}>
        Tu IMC (Índice de Masa Corporal)
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
        <Stack spacing={1} flex={1}>
          <Typography>
            <strong>IMC:</strong> {imc}
          </Typography>
          <Typography>
            <strong>Clasificación:</strong> {label}
          </Typography>
          <Typography>
            <strong>Riesgo cerebrovascular:</strong> {risk}
          </Typography>
        </Stack>
        <div style={{ width: 120, height: 120 }}>
          <Pie
            data={data}
            options={{ plugins: { legend: { display: false } } }}
          />
        </div>
      </Stack>
    </Paper>
  );
};

export default ImcCard;
