/**
 * AvatarMascot
 * ─────────────────────────────────────────────────────────────────────────────
 * Personaje Pixar-style de cuerpo entero parado en el borde inferior
 * derecho de la card. Requiere PNG con fondo TRANSPARENTE para verse bien.
 *
 * Archivos en /public/avatars/:
 *   m_1.svg … m_5.png   →  Masculino
 *   f_1.png … f_5.png   →  Femenino / Otro
 *
 * Tamaño ideal: 500 × 700 px, fondo transparente (usar remove.bg).
 */

import { Box, Typography } from "@mui/material";
import { useState } from "react";


/* ── Umbrales ──────────────────────────────────────────────────────────────── */
export const getAvatarState = (pts) => {
  if (pts >= 200) return 5;
  if (pts >= 100) return 4;
  if (pts >= 50) return 3;
  if (pts >= 20) return 2;
  return 1;
};

const genderPrefix = (sexo) =>
  sexo?.toLowerCase().includes("mas") ? "m" : "f";

/* ── Placeholder emoji mientras no hay imagen ──────────────────────────────── */
const EMOJIS = ["😴", "🚶", "🏃", "💪", "🏆"];

const Placeholder = ({ w, h, state }) => (
  <Box
    sx={{
      width: w,
      height: h,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      pb: 1.5,
      gap: 0.5,
    }}
  >
    <Typography sx={{ fontSize: h * 0.32, lineHeight: 1 }}>
      {EMOJIS[state - 1]}
    </Typography>
    <Typography
      sx={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}
    >
      nivel {state}/5
    </Typography>
  </Box>
);

/* ── Componente ─────────────────────────────────────────────────────────────── */
const AvatarMascot = ({
  points = 0,
  sexo = "Femenino",
  width = 480,
  height = 700,
  showLabel = false,
}) => {
  const state = getAvatarState(points);
  const prefix = genderPrefix(sexo);
  const src = `/avatars/${prefix}_${state}.png`;

  const [imgOk, setImgOk] = useState(true);
  const [loaded, setLoaded] = useState(false);

  return (
    <Box
      sx={{
        width,
        height,
        position: "relative",
        // Sin background — el PNG transparente se integra directo con la card
        background: "none",
      }}
    >
      {/* Shimmer sutil mientras carga */}
      {!loaded && imgOk && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 100%)",
            borderRadius: 2,
          }}
        />
      )}

      {imgOk ? (
        <Box
          component="img"
          src={src}
          alt={`avatar nivel ${state}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setImgOk(false);
            setLoaded(true);
          }}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "top center",
            display: loaded ? "block" : "none",
            // drop-shadow para que el personaje tenga profundidad sobre la card
            filter: "drop-shadow(-4px 0 16px rgba(0,0,0,0.25))",
          }}
        />
      ) : (
        <Placeholder w={width} h={height} state={state} />
      )}

      {showLabel && (
        <Typography
          sx={{
            position: "absolute",
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            whiteSpace: "nowrap",
          }}
        >
          Nivel {state} / 5
        </Typography>
      )}
    </Box>
  );
};

export default AvatarMascot;
