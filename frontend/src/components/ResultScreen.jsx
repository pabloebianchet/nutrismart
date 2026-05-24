import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { useNutrition } from "../context/NutritionContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ScoreDonut from "./ScoreDonut";
import PointsCelebration from "./PointsCelebration";
import PointsPenalty from "./PointsPenalty";
import AnalyzingLoader from "./AnalyzingLoader";
import { API_URL } from "../config/api";

// ─── helpers ────────────────────────────────────────────────────────────────

const getScoreLevel = (s) =>
  s >= 90 ? { label: "Excelente",  color: "#1B5E20", bg: "#E8F5E9" } :
  s >= 75 ? { label: "Saludable",  color: "#2E7D32", bg: "#E8F5E9" } :
  s >= 60 ? { label: "Aceptable",  color: "#E65100", bg: "#FFF3E0" } :
  s >= 45 ? { label: "Mejorable",  color: "#D84315", bg: "#FBE9E7" } :
            { label: "A evitar",   color: "#B71C1C", bg: "#FFEBEE" };

const getProcessingLevel = (text) => {
  const l = (text || "").toLowerCase();
  if (l.includes("ultraprocesado")) return { label: "Ultraprocesado", color: "#B71C1C", icon: "⚠️" };
  if (l.includes("no procesado"))   return { label: "No procesado",   color: "#2E7D32", icon: "🌿" };
  if (l.includes("procesado"))      return { label: "Procesado",      color: "#E65100", icon: "⚡" };
  return null;
};

const parseAnalysis = (text) => {
  if (!text) return {};
  const scoreRegex = /Puntaje global:\s*\d+\s*\/\s*100/i;
  const m = text.match(scoreRegex);
  if (!m) return { classification: text, explanation: "", guidance: "" };
  const idx = text.indexOf(m[0]);
  const classification = text.slice(0, idx).trim();
  const after = text.slice(idx + m[0].length).trim();
  let parts = after.split(/\n\n+/).filter((p) => p.trim());
  if (parts.length < 2) parts = after.split(/\n/).filter((p) => p.trim());
  return {
    classification,
    explanation: parts[0] || after,
    guidance: parts.slice(1).join(" "),
  };
};

// ─── sub-components ─────────────────────────────────────────────────────────

const InfoCard = ({ MuiIcon, iconColor, iconBg, label, text, delay }) => {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 4,
          border: "1px solid rgba(11,94,85,0.10)",
          bgcolor: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(11,94,85,0.06)",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: 4,
            bgcolor: iconColor,
            borderRadius: "4px 0 0 4px",
          },
        }}
      >
        <Stack direction="row" spacing={1.8} alignItems="flex-start">
          <Box
            sx={{
              width: 38, height: 38,
              borderRadius: 2.5,
              bgcolor: iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, mt: 0.1,
            }}
          >
            <MuiIcon sx={{ fontSize: 20, color: iconColor }} />
          </Box>
          <Box flex={1}>
            <Typography
              sx={{
                fontSize: 10, fontWeight: 800, color: iconColor,
                textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.7,
              }}
            >
              {label}
            </Typography>
            <Typography sx={{ fontSize: 14.5, color: "#3D5A57", lineHeight: 1.7 }}>
              {text}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

const ResultScreen = () => {
  const { user, userData, ocrText, clearOcrText, updateUserData } = useNutrition();

  const [analysis,    setAnalysis]    = useState("");
  const [score,       setScore]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [celebration, setCelebration] = useState(null);
  const [penalty,     setPenalty]     = useState(null);
  const [limitError,  setLimitError]  = useState(null);
  const hasFetched = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if ((!user?._id && !user?.googleId) || !ocrText || !userData) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId:      user._id,
            googleId:    user.googleId,
            userData,
            productText: ocrText,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          if (data.error === "trial_limit_reached" || data.error === "daily_limit_reached") {
            setLimitError({ type: data.error, message: data.message });
          } else if (response.status === 429) {
            setLimitError({ type: "rate_limit", message: "Demasiadas solicitudes en poco tiempo. Esperá un momento e intentá de nuevo." });
          } else {
            setAnalysis("No se pudo generar el análisis. Intentá nuevamente.");
            setScore(0);
          }
          return;
        }

        const finalScore = typeof data.score === "number" ? data.score : 0;
        setAnalysis(data.analysis);
        setScore(finalScore);

        if (data.pointsEarned > 0 && data.totalPoints != null) {
          setCelebration({ points: data.pointsEarned, totalPoints: data.totalPoints });
          updateUserData({ healthyPoints: data.totalPoints });
        } else if (data.pointsLost > 0 && data.totalPoints != null) {
          setPenalty({ points: data.pointsLost, totalPoints: data.totalPoints });
          updateUserData({ healthyPoints: data.totalPoints });
        }
      } catch (err) {
        console.error("Error al obtener análisis:", err);
        setAnalysis("No se pudo generar el análisis. Intentá nuevamente.");
        setScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [user, ocrText, userData]);

  const handleNewAnalysis = () => {
    clearOcrText();
    navigate("/capture");
  };

  // ── loading ──
  if (loading) {
    return (
      <Box sx={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
      }}>
        <AnalyzingLoader />
      </Box>
    );
  }

  // ── limit errors ──
  if (limitError) {
    const meta = {
      trial_limit_reached: { emoji: "🥜", title: "Límite de prueba alcanzado", cta: "Ver planes",  ctaPath: "/pricing"      },
      daily_limit_reached: { emoji: "⏳", title: "Límite diario alcanzado",    cta: "Ver mi plan", ctaPath: "/subscription" },
      rate_limit:          { emoji: "🚦", title: "Demasiadas solicitudes",      cta: "Volver",      ctaPath: "/"             },
    };
    const m = meta[limitError.type] || meta.rate_limit;
    return (
      <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)" }}>
        <Paper elevation={0} sx={{ maxWidth: 420, width: "100%", borderRadius: 5, border: "1px solid rgba(11,94,85,0.12)", boxShadow: "0 20px 60px rgba(11,94,85,0.10)", overflow: "hidden", textAlign: "center" }}>
          <Box sx={{ bgcolor: "#0B5E55", px: 4, pt: 4, pb: 3 }}>
            <Typography sx={{ fontSize: 48, mb: 1 }}>{m.emoji}</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{m.title}</Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            <Typography sx={{ fontSize: 14.5, color: "#4A6B67", lineHeight: 1.7, mb: 3 }}>{limitError.message}</Typography>
            <Button variant="contained" fullWidth onClick={() => navigate(m.ctaPath)}
              sx={{ bgcolor: "#0B5E55", borderRadius: 2.5, py: 1.4, textTransform: "none", fontWeight: 700, fontSize: 14.5, mb: 1.5, "&:hover": { bgcolor: "#0f7a6e" } }}>
              {m.cta}
            </Button>
            <Button fullWidth onClick={() => navigate("/")}
              sx={{ borderRadius: 2.5, py: 1.2, textTransform: "none", fontWeight: 600, fontSize: 13.5, color: "#4A6B67" }}>
              Volver al inicio
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── results ──
  const level      = score !== null ? getScoreLevel(score) : null;
  const parsed     = parseAnalysis(analysis);
  const processing = getProcessingLevel(parsed.classification || analysis);

  return (
    <>
      {celebration && (
        <PointsCelebration
          points={celebration.points}
          totalPoints={celebration.totalPoints}
          onDone={() => setCelebration(null)}
        />
      )}
      {penalty && (
        <PointsPenalty
          points={penalty.points}
          totalPoints={penalty.totalPoints}
          onDone={() => setPenalty(null)}
        />
      )}

      <Box
        sx={{
          minHeight: "100dvh",
          background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: { xs: 4, md: 5 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 820 }}>

          {/* ── header ── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
              <Box>
                <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.7px", lineHeight: 1.1 }}>
                  Resultado del análisis
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: "#4A6B67", mt: 0.4 }}>
                  Diagnóstico nutrimental basado en el packaging
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={handleNewAnalysis}
                startIcon={<RefreshRoundedIcon />}
                sx={{
                  borderRadius: 999, textTransform: "none", fontWeight: 700,
                  fontSize: 13, borderColor: "#0B5E55", color: "#0B5E55",
                  px: 2, py: 0.9, flexShrink: 0,
                  "&:hover": { bgcolor: "rgba(11,94,85,0.06)", borderColor: "#0B5E55" },
                }}
              >
                Nuevo
              </Button>
            </Stack>
          </motion.div>

          {/* ── body: 2-col on desktop ── */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "flex-start" }}>

            {/* ── left: score card ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ flexShrink: 0 }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: { xs: "100%", md: 240 },
                  borderRadius: 5,
                  overflow: "hidden",
                  border: "1px solid rgba(11,94,85,0.10)",
                  boxShadow: "0 8px 32px rgba(11,94,85,0.10)",
                }}
              >
                {/* score hero */}
                <Box
                  sx={{
                    px: 3, pt: 3.5, pb: 2.5,
                    background: level
                      ? `linear-gradient(160deg, ${level.bg} 0%, #fff 100%)`
                      : "#f7fcfa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {score !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
                    >
                      <ScoreDonut score={score} />
                    </motion.div>
                  )}

                  {level && (
                    <Chip
                      label={level.label}
                      sx={{
                        bgcolor: level.bg,
                        color: level.color,
                        fontWeight: 800,
                        fontSize: 13,
                        border: `1.5px solid ${level.color}30`,
                        mb: 0.5,
                      }}
                    />
                  )}
                </Box>

                {/* processing level */}
                {processing && (
                  <Box
                    sx={{
                      px: 3, py: 1.8,
                      borderTop: "1px solid rgba(11,94,85,0.08)",
                      bgcolor: "#fafefe",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: 16, lineHeight: 1 }}>{processing.icon}</Typography>
                    <Box>
                      <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: "#8AADAA", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Nivel de procesamiento
                      </Typography>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: processing.color }}>
                        {processing.label}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* puntaje numérico */}
                {score !== null && (
                  <Box
                    sx={{
                      px: 3, py: 1.8,
                      borderTop: "1px solid rgba(11,94,85,0.08)",
                      bgcolor: "#fafefe",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: 16, lineHeight: 1 }}>📊</Typography>
                    <Box>
                      <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: "#8AADAA", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Puntaje global
                      </Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.5px" }}>
                        {score} <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, color: "#8AADAA" }}>/ 100</Typography>
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </motion.div>

            {/* ── right: info cards ── */}
            <Stack spacing={2} flex={1}>
              <InfoCard
                MuiIcon={AssignmentOutlinedIcon}
                iconColor="#0B5E55"
                iconBg="rgba(11,94,85,0.08)"
                label="Clasificación del producto"
                text={parsed.classification}
                delay={0.15}
              />
              <InfoCard
                MuiIcon={SearchRoundedIcon}
                iconColor="#1565C0"
                iconBg="rgba(21,101,192,0.08)"
                label="Motivo del puntaje"
                text={parsed.explanation}
                delay={0.25}
              />
              <InfoCard
                MuiIcon={TipsAndUpdatesOutlinedIcon}
                iconColor="#6A1B9A"
                iconBg="rgba(106,27,154,0.08)"
                label="Cómo incorporarlo en tu dieta"
                text={parsed.guidance}
                delay={0.35}
              />

              {/* ── CTA at bottom of cards ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleNewAnalysis}
                  startIcon={<RefreshRoundedIcon />}
                  sx={{
                    mt: 0.5,
                    py: 1.6,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: 15,
                    letterSpacing: "-0.2px",
                    background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
                    boxShadow: "0 8px 28px rgba(11,94,85,0.30)",
                    "&:hover": {
                      boxShadow: "0 12px 36px rgba(11,94,85,0.38)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.25s ease",
                  }}
                >
                  Analizar otro producto
                </Button>
              </motion.div>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default ResultScreen;
