import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";

const SIZE = 160;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const getColorByScore = (score) => {
  if (score <= 40) return "#e53935";   // rojo
  if (score <= 70) return "#fbc02d";   // amarillo
  return "#43a047";                   // verde
};

export default function ScoreDonut({ score }) {
  const progress = (score / 100) * CIRCUMFERENCE;
  const color = getColorByScore(score);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
      mb={3}
    >
      <svg width={SIZE} height={SIZE}>
        {/* Fondo */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#eee"
          strokeWidth={STROKE}
          fill="none"
        />

        {/* Progreso */}
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          animate={{ strokeDashoffset: CIRCUMFERENCE - progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      {/* Score centrado */}
      <Box position="absolute" textAlign="center">
        <Typography variant="h4" fontWeight={700}>
          {score}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          / 100
        </Typography>
      </Box>
    </Box>
  );
}
