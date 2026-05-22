import { useEffect, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";

const SAD_PARTICLES = ["💔", "💧", "⚠️", "☁️", "😮‍💨"];

const rand = (min, max) => Math.random() * (max - min) + min;

/* ── Partícula que cae hacia abajo ───────────── */
const SadParticle = ({ emoji, style }) => (
  <Box
    sx={{
      position: "absolute",
      fontSize: style.size,
      pointerEvents: "none",
      userSelect: "none",
      left: style.left,
      top: style.top,
      animation: `sadParticle${style.id} ${style.dur}s ease-in forwards`,
      [`@keyframes sadParticle${style.id}`]: {
        "0%":   { transform: "translate(0,0) rotate(0deg) scale(1)",                       opacity: 1 },
        "60%":  { opacity: 0.7 },
        "100%": { transform: `translate(${style.tx}px,${style.ty}px) rotate(${style.rot}deg) scale(0.3)`, opacity: 0 },
      },
    }}
  >
    {emoji}
  </Box>
);

/* ── Componente principal ────────────────────── */
const PointsPenalty = ({ points, totalPoints, onDone }) => {
  const [phase, setPhase]             = useState("enter");
  const [displayCount, setDisplayCount] = useState(totalPoints + points); // empieza alto y baja
  const timerRef = useRef(null);

  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: SAD_PARTICLES[i % SAD_PARTICLES.length],
      size: `${rand(18, 32)}px`,
      left: `${rand(15, 85)}%`,
      top:  `${rand(5, 35)}%`,
      tx: rand(-80, 80),
      ty: rand(80, 200),     // caen hacia ABAJO
      rot: rand(-180, 180),
      dur: rand(0.9, 1.5),
    }))
  ).current;

  // Contador decreciente
  useEffect(() => {
    let current = totalPoints + points;
    const step = () => {
      if (current > totalPoints) {
        current -= 1;
        setDisplayCount(current);
        timerRef.current = setTimeout(step, 80);
      }
    };
    const delay = setTimeout(step, 600);
    return () => { clearTimeout(delay); clearTimeout(timerRef.current); };
  }, [points, totalPoints]);

  // Ciclo de vida
  useEffect(() => {
    const hold = setTimeout(() => setPhase("exit"), 3000);
    const done = setTimeout(() => onDone?.(), 3600);
    return () => { clearTimeout(hold); clearTimeout(done); };
  }, [onDone]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",

        "@keyframes penaltyEnter": {
          from: { opacity: 0, transform: "scale(0.7) translateY(-20px)" },
          to:   { opacity: 1, transform: "scale(1) translateY(0)"       },
        },
        "@keyframes penaltyExit": {
          from: { opacity: 1, transform: "scale(1)"    },
          to:   { opacity: 0, transform: "scale(0.85) translateY(10px)" },
        },
        "@keyframes peanutTumble": {
          "0%":   { transform: "translateY(-50px) rotate(0deg) scale(1.3)",  opacity: 0 },
          "35%":  { transform: "translateY(0) rotate(200deg) scale(1)",      opacity: 1 },
          "55%":  { transform: "translateY(-14px) rotate(190deg) scale(1.05)"           },
          "70%":  { transform: "translateY(0) rotate(360deg) scale(1)"                 },
          "85%":  { transform: "translateY(-5px) rotate(358deg)"                       },
          "100%": { transform: "translateY(0) rotate(360deg) scale(1)",      opacity: 1 },
        },
        "@keyframes minusFloat": {
          "0%":   { opacity: 0, transform: "translateY(0) scale(0.5)"   },
          "25%":  { opacity: 1, transform: "translateY(10px) scale(1.2)" },
          "80%":  { opacity: 1, transform: "translateY(32px) scale(1)"  },
          "100%": { opacity: 0, transform: "translateY(48px) scale(0.8)"},
        },
        "@keyframes shake": {
          "0%,100%": { transform: "translateX(0)"  },
          "20%":     { transform: "translateX(-5px)" },
          "40%":     { transform: "translateX(5px)"  },
          "60%":     { transform: "translateX(-4px)" },
          "80%":     { transform: "translateX(4px)"  },
        },
        "@keyframes countDown": {
          "0%":   { color: "#E24B4A", transform: "scale(1.25)" },
          "100%": { color: "#fff",    transform: "scale(1)"    },
        },
      }}
    >
      {/* Partículas cayendo */}
      {particles.map((p) => (
        <SadParticle key={p.id} emoji={p.emoji} style={p} />
      ))}

      {/* Card principal */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          px: 5,
          py: 4,
          borderRadius: 6,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 24px 80px rgba(226,75,74,0.18), 0 8px 24px rgba(0,0,0,0.10)",
          border: "1.5px solid rgba(226,75,74,0.20)",
          animation: phase === "exit"
            ? "penaltyExit 0.55s ease forwards"
            : "penaltyEnter 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
          minWidth: 260,
        }}
      >
        {/* Maní cayendo + tumbling */}
        <Box
          sx={{
            fontSize: 72,
            lineHeight: 1,
            animation: "peanutTumble 0.9s cubic-bezier(0.36,0.07,0.19,0.97) both, shake 0.6s 0.9s ease both",
            display: "inline-block",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.18))",
          }}
        >
          🥜
        </Box>

        {/* "-3" cayendo desde la esquina */}
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 18,
            animation: "minusFloat 2.4s ease-out forwards",
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 900,
              color: "#E24B4A",
              letterSpacing: "-0.5px",
              textShadow: "0 2px 8px rgba(226,75,74,0.40)",
            }}
          >
            -{points}
          </Typography>
        </Box>

        {/* Texto principal */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: 19,
              fontWeight: 900,
              color: "#0F2420",
              letterSpacing: "-0.4px",
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            ¡Ay, qué pena!
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#4A6B67",
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Ese producto no es muy saludable 😢
          </Typography>
        </Box>

        {/* Contador decreciendo */}
        <Box
          sx={{
            mt: 0.5,
            px: 3,
            py: 1.2,
            borderRadius: 3,
            background: "linear-gradient(135deg, #C0392B 0%, #E24B4A 100%)",
            boxShadow: "0 4px 16px rgba(226,75,74,0.35)",
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Typography sx={{ fontSize: 22 }}>🥜</Typography>
          <Box>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.65)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                lineHeight: 1,
              }}
            >
              Puntos saludables
            </Typography>
            <Typography
              sx={{
                fontSize: 26,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.1,
                letterSpacing: "-1px",
                animation: "countDown 0.3s ease",
              }}
            >
              {displayCount}
            </Typography>
          </Box>
        </Box>

        {/* Tip motivacional */}
        <Typography
          sx={{
            fontSize: 12,
            color: "#8AADAA",
            textAlign: "center",
            mt: 0.5,
            fontStyle: "italic",
          }}
        >
          Elegí opciones más naturales para sumar puntos 💪
        </Typography>
      </Box>
    </Box>
  );
};

export default PointsPenalty;
