import { Box, Stack } from "@mui/material";
import { useRevAnimation } from "../hooks/useRevAnimation.js";

/**
 * Tacómetro de progreso estilo F1 — barritas que se encienden de verde a
 * rojo de izquierda a derecha según `pct`, creciendo en altura hacia la
 * derecha. Al montar hace un "acelerón a fondo": arranca en 100% (tope
 * rojo) y cae animado hasta el valor real (ver useRevAnimation).
 *
 * Es un componente propio (no una función inline) para poder llamar el
 * hook de forma segura incluso cuando el que lo usa tiene `return null`
 * condicionales antes de renderizarlo — al ser un hijo, React solo lo
 * monta (y corre el hook) cuando efectivamente se llega a renderizarlo.
 */
const RpmGauge = ({ pct, segments = 18, height = 24, minHeight = 10, spacing = 0.45 }) => {
  const gaugePct = useRevAnimation(pct);
  const items = Array.from({ length: segments });

  return (
    <Stack direction="row" spacing={spacing} alignItems="flex-end" sx={{ height }}>
      {items.map((_, i) => {
        const lit   = i < Math.round((gaugePct / 100) * segments);
        const h     = minHeight + ((height - minHeight) * i) / (segments - 1);
        const hue   = 142 - (142 * i) / (segments - 1); // 142=verde, 0=rojo
        const color = `hsl(${hue}, 82%, 45%)`;
        return (
          <Box key={i} sx={{
            flex: 1, height: h, borderRadius: "2px 2px 1px 1px",
            bgcolor: lit ? color : "rgba(15,36,32,0.08)",
            boxShadow: lit ? `0 0 6px 0 ${color}99` : "none",
            transition: "background-color 0.5s ease, box-shadow 0.5s ease",
          }} />
        );
      })}
    </Stack>
  );
};

export default RpmGauge;
