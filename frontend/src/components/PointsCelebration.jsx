import { useEffect, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";

const PARTICLES = ["🍎", "🥦", "🥕", "🌿", "🍋", "🫐", "🥑", "⭐", "✨"];

const rand = (min, max) => Math.random() * (max - min) + min;

const Particle = ({ emoji, style }) => (
  <Box
    sx={{
      position: "absolute",
      fontSize: style.size,
      pointerEvents: "none",
      userSelect: "none",
      left: style.left,
      top: style.top,
      animation: `celebParticle${style.id} ${style.dur}s ease-out forwards`,
      [`@keyframes celebParticle${style.id}`]: {
        "0%":   { transform: "translate(0, 0) rotate(0deg) scale(1)",   opacity: 1 },
        "60%":  { opacity: 1 },
        "100%": { transform: `translate(${style.tx}px, ${style.ty}px) rotate(${style.rot}deg) scale(0.4)`, opacity: 0 },
      },
    }}
  >
    {emoji}
  </Box>
);

const PointsCelebration = ({ points, totalPoints, onDone }) => {
  const [phase, setPhase] = useState("enter"); // enter → hold → exit
  const [displayCount, setDisplayCount] = useState(totalPoints - points);
  const timerRef = useRef(null);

  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: PARTICLES[i % PARTICLES.length],
      size: `${rand(22, 42)}px`,
      left: `${rand(20, 80)}%`,
      top: `${rand(30, 70)}%`,
      tx: rand(-160, 160),
      ty: rand(-220, -60),
      rot: rand(-360, 360),
      dur: rand(0.9, 1.6),
    }))
  ).current;

  // Counter animation
  useEffect(() => {
    let current = totalPoints - points;
    const step = () => {
      if (current < totalPoints) {
        current += 1;
        setDisplayCount(current);
        timerRef.current = setTimeout(step, 60);
      }
    };
    const delay = setTimeout(step, 400);
    return () => { clearTimeout(delay); clearTimeout(timerRef.current); };
  }, [points, totalPoints]);

  // Lifecycle
  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("exit"), 2600);
    const doneTimer = setTimeout(() => onDone?.(), 3200);
    return () => { clearTimeout(holdTimer); clearTimeout(doneTimer); };
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
        "@keyframes celebEnter": {
          from: { opacity: 0, transform: "scale(0.6) translateY(30px)" },
          to:   { opacity: 1, transform: "scale(1) translateY(0)" },
        },
        "@keyframes celebExit": {
          from: { opacity: 1, transform: "scale(1) translateY(0)" },
          to:   { opacity: 0, transform: "scale(0.8) translateY(-20px)" },
        },
        "@keyframes peanutBounce": {
          "0%,100%": { transform: "translateY(0) rotate(-5deg) scale(1)" },
          "20%":     { transform: "translateY(-28px) rotate(10deg) scale(1.2)" },
          "40%":     { transform: "translateY(-10px) rotate(-8deg) scale(1.05)" },
          "60%":     { transform: "translateY(-20px) rotate(6deg) scale(1.15)" },
          "80%":     { transform: "translateY(-5px) rotate(-3deg) scale(1.02)" },
        },
        "@keyframes shimmer": {
          "0%,100%": { opacity: 0.7 },
          "50%":     { opacity: 1 },
        },
        "@keyframes plusFloat": {
          "0%":   { opacity: 0, transform: "translateY(0) scale(0.5)" },
          "30%":  { opacity: 1, transform: "translateY(-12px) scale(1.2)" },
          "80%":  { opacity: 1, transform: "translateY(-28px) scale(1)" },
          "100%": { opacity: 0, transform: "translateY(-40px) scale(0.8)" },
        },
      }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <Particle key={p.id} emoji={p.emoji} style={p} />
      ))}

      {/* Main card */}
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
          boxShadow: "0 24px 80px rgba(11,94,85,0.22), 0 8px 24px rgba(11,94,85,0.12)",
          border: "1.5px solid rgba(11,94,85,0.12)",
          animation: phase === "exit"
            ? "celebExit 0.5s ease forwards"
            : "celebEnter 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
          minWidth: 260,
        }}
      >
        {/* Peanut */}
        <Box
          sx={{
            fontSize: 72,
            lineHeight: 1,
            animation: "peanutBounce 1.2s ease-in-out",
            display: "inline-block",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
          }}
        >
          🥜
        </Box>

        {/* Texto principal */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 900,
              color: "#0F2420",
              letterSpacing: "-0.4px",
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            ¡Excelente elección!
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#4A6B67",
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Seguís cuidando tu salud 💪
          </Typography>
        </Box>

        {/* Puntos ganados — número grande */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#8AADAA",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 0.5,
            }}
          >
            Puntos ganados
          </Typography>
          <Typography
            sx={{
              fontSize: 72,
              fontWeight: 900,
              color: "#2ECC71",
              lineHeight: 1,
              letterSpacing: "-3px",
              textShadow: "0 4px 20px rgba(46,204,113,0.35)",
              animation: "celebEnter 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            +{points}
          </Typography>
        </Box>

        {/* Total acumulado — chico, debajo */}
        <Box
          sx={{
            px: 3,
            py: 1,
            borderRadius: 3,
            background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
            boxShadow: "0 4px 16px rgba(11,94,85,0.30)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 18 }}>🥜</Typography>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Total: <span style={{ color: "#fff", fontWeight: 900 }}>{displayCount} pts</span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PointsCelebration;
