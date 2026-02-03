import { Paper, Typography, Stack, Box } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const calculateIMC = (peso, alturaCm) => {
  const alturaM = alturaCm / 100;
  if (!peso || !alturaM) return null;
  return +(peso / (alturaM * alturaM)).toFixed(1);
};

const getIMCRiskLevel = (imc) => {
  if (imc < 18.5)
    return { label: "Bajo peso", risk: "Moderado", level: 2, color: "#fdd835" };
  if (imc < 25)
    return { label: "Normal", risk: "Bajo", level: 1, color: "#43a047" };
  if (imc < 30)
    return { label: "Sobrepeso", risk: "Moderado", level: 2, color: "#fb8c00" };
  if (imc < 35)
    return { label: "Obesidad I", risk: "Alto", level: 3, color: "#f4511e" };
  if (imc < 40)
    return {
      label: "Obesidad II",
      risk: "Muy alto",
      level: 4,
      color: "#e53935",
    };
  return { label: "Obesidad III", risk: "Extremo", level: 5, color: "#b71c1c" };
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

  const { label, risk, level, color } = getIMCRiskLevel(imc);
  const pesoIdeal = getPesoIdeal(altura);

  const data = {
    labels: ["Nivel de riesgo", "Resto"],
    datasets: [
      {
        data: [level * 20, 100 - level * 20],
        backgroundColor: [color, "#e0e0e0"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        bgcolor: "#ffffff",
        border: "1px solid #e0e0e0",
        mb: 4,
        boxShadow: "0 12px 24px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Tu IMC (Índice de Masa Corporal)
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        alignItems="center"
      >
        {/* TEXTO INFORMATIVO */}
        <Box flex={1}>
          <Typography variant="body1">
            <strong>IMC:</strong> {imc}
          </Typography>
          <Typography variant="body1">
            <strong>Clasificación:</strong> {label}
          </Typography>
          <Typography variant="body1">
            <strong>Riesgo de enfermedades:</strong> {risk}
          </Typography>
          <Typography variant="body1">
            <strong>Peso saludable sugerido:</strong> {pesoIdeal}
          </Typography>
        </Box>

        {/* GRÁFICO CIRCULAR */}
        <Box width={140} height={140}>
          <Pie
            data={data}
            options={{
              animation: {
                animateRotate: true,
                duration: 1000,
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      ctx.label === "Nivel de riesgo"
                        ? `Riesgo: ${risk}`
                        : "Sin riesgo",
                  },
                },
                legend: { display: false },
              },
            }}
          />
        </Box>
      </Stack>

      {/* DESCRIPCIÓN UX */}
      <Typography
        variant="body2"
        color="text.secondary"
        mt={3}
        sx={{ maxWidth: 600 }}
      >
        El IMC es un indicador utilizado para estimar si tu peso es saludable en
        relación con tu altura. Ayuda a identificar riesgos generales para la
        salud, pero no reemplaza una evaluación médica profesional.
      </Typography>
    </Paper>
  );
};

export default ImcCard;
