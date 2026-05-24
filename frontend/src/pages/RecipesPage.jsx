import { useState } from "react";
import { Box, Typography, Stack, Chip, Button, Paper, CircularProgress } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { motion, AnimatePresence } from "framer-motion";
import { useNutrition } from "../context/NutritionContext";
import { useLocation } from "react-router-dom";
import { API_URL } from "../config/api";

// ─── config ─────────────────────────────────────────────────────────────────

const MODALIDADES = [
  { id: "Fit",         label: "Fit",         emoji: "💚", desc: "Liviano, proteico y natural",  color: "#2E7D32", bg: "#E8F5E9", border: "rgba(46,125,50,0.25)"  },
  { id: "Hipertrofia", label: "Hipertrofia", emoji: "💪", desc: "Alto en proteína y calorías",  color: "#BF360C", bg: "#FBE9E7", border: "rgba(191,54,12,0.25)"  },
  { id: "Rápidas",     label: "Rápidas",     emoji: "⚡", desc: "Listo en menos de 15 min",    color: "#1565C0", bg: "#E3F2FD", border: "rgba(21,101,192,0.25)"  },
];

const MOMENTOS = [
  { id: "Desayuno", emoji: "🌅", color: "#F57F17" },
  { id: "Almuerzo", emoji: "☀️", color: "#2E7D32" },
  { id: "Merienda", emoji: "🍎", color: "#6A1B9A" },
  { id: "Cena",     emoji: "🌙", color: "#283593" },
  { id: "Snack",    emoji: "🫐", color: "#00695C" },
];

// ─── animation variants ──────────────────────────────────────────────────────

const slide = {
  enter:  { opacity: 0, x: 40  },
  center: { opacity: 1, x: 0   },
  exit:   { opacity: 0, x: -40 },
};

const fadeUp = {
  enter:  { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0  },
  exit:   { opacity: 0, y: -20 },
};

// ─── sub-components ──────────────────────────────────────────────────────────

const StepLabel = ({ n, label }) => (
  <Stack direction="row" spacing={1} alignItems="center" mb={3}>
    <Box sx={{
      width: 26, height: 26, borderRadius: "50%",
      bgcolor: "#0B5E55", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{n}</Typography>
    </Box>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#4A6B67", textTransform: "uppercase", letterSpacing: "0.07em" }}>
      {label}
    </Typography>
  </Stack>
);

const RecipeLoader = ({ message }) => (
  <Box sx={{ textAlign: "center", py: 8 }}>
    <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
      <Typography sx={{ fontSize: 56, lineHeight: 1, "@keyframes cookSpin": { "0%,100%": { transform: "rotate(-10deg)" }, "50%": { transform: "rotate(10deg)" } }, animation: "cookSpin 1.2s ease-in-out infinite" }}>
        🍳
      </Typography>
    </Box>
    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F2420", mb: 0.5 }}>{message}</Typography>
    <Stack direction="row" spacing={0.6} justifyContent="center" mt={1.5}>
      {[0, 1, 2].map((i) => (
        <Box key={i} sx={{
          width: 7, height: 7, borderRadius: "50%", bgcolor: "#0B5E55",
          "@keyframes bounce": { "0%,80%,100%": { transform: "scale(0.8)", opacity: 0.4 }, "40%": { transform: "scale(1.2)", opacity: 1 } },
          animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
    </Stack>
  </Box>
);

// ─── main page ───────────────────────────────────────────────────────────────

const RecipesPage = () => {
  const { userData } = useNutrition();
  const location     = useLocation();

  const preselected  = location.state?.modalidad ?? null;

  const [step,       setStep]       = useState("select");
  const [modalidad,  setModalidad]  = useState(preselected);
  const [momento,    setMomento]    = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selected,   setSelected]   = useState(null);       // { name, emoji, description }
  const [detail,     setDetail]     = useState(null);       // full recipe
  const [showSteps,  setShowSteps]  = useState(false);
  const [error,      setError]      = useState("");

  const token = localStorage.getItem("nutrismartToken");
  const canGenerate = modalidad && momento;

  // ── fetch suggestions ──
  const handleGenerate = async () => {
    setError("");
    setStep("loading");
    try {
      const res  = await fetch(`${API_URL}/api/recipes/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ modalidad, momento, userData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar recetas");
      setSuggestions(data.recipes || []);
      setStep("suggestions");
    } catch (err) {
      setError(err.message);
      setStep("select");
    }
  };

  // ── fetch full recipe detail ──
  const handleSelectRecipe = async (recipe) => {
    setSelected(recipe);
    setShowSteps(false);
    setDetail(null);
    setError("");
    setStep("loading-detail");
    try {
      const res  = await fetch(`${API_URL}/api/recipes/detail`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: recipe.name, emoji: recipe.emoji, modalidad, momento, userData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar la receta");
      setDetail(data);
      setStep("detail");
    } catch (err) {
      setError(err.message);
      setStep("suggestions");
    }
  };

  const reset = () => {
    setStep("select"); setModalidad(preselected); setMomento(null);
    setSuggestions([]); setSelected(null); setDetail(null);
    setShowSteps(false); setError("");
  };

  // ── active modalidad config ──
  const activeMod = MODALIDADES.find((m) => m.id === modalidad);

  return (
    <Box sx={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
      px: { xs: 2, sm: 3 },
      py: { xs: 4, md: 5 },
      display: "flex",
      justifyContent: "center",
    }}>
      <Box sx={{ width: "100%", maxWidth: 680 }}>

        {/* ── Hero header ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Typography sx={{ fontSize: 28 }}>🍽️</Typography>
                <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.8px", lineHeight: 1 }}>
                  Recetas YA
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 13.5, color: "#4A6B67", mt: 0.5 }}>
                IA que cocina para vos · rápido y personalizado
              </Typography>
            </Box>
            {step !== "select" && (
              <Button
                onClick={reset}
                startIcon={<RefreshRoundedIcon />}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, color: "#0B5E55", borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}
              >
                Nueva
              </Button>
            )}
          </Stack>
        </motion.div>

        {/* ── Steps ── */}
        <AnimatePresence mode="wait">

          {/* ────── SELECT ────── */}
          {step === "select" && (
            <motion.div key="select" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>

              {/* Modalidad */}
              <StepLabel n="1" label="¿Qué tipo de receta?" />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 4 }}>
                {MODALIDADES.map((m) => {
                  const active = modalidad === m.id;
                  return (
                    <Box
                      key={m.id}
                      onClick={() => setModalidad(m.id)}
                      sx={{
                        p: 2.5, borderRadius: 4, cursor: "pointer",
                        border: `2px solid ${active ? m.color : "rgba(11,94,85,0.10)"}`,
                        bgcolor: active ? m.bg : "#fff",
                        transition: "all 0.2s ease",
                        position: "relative",
                        "&:hover": { borderColor: m.color, bgcolor: m.bg, transform: "translateY(-2px)", boxShadow: `0 8px 24px ${m.border}` },
                      }}
                    >
                      {active && (
                        <Box sx={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", bgcolor: m.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckRoundedIcon sx={{ fontSize: 13, color: "#fff" }} />
                        </Box>
                      )}
                      <Typography sx={{ fontSize: 28, mb: 0.8, lineHeight: 1 }}>{m.emoji}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0F2420", letterSpacing: "-0.3px" }}>{m.label}</Typography>
                      <Typography sx={{ fontSize: 12, color: "#4A6B67", mt: 0.3 }}>{m.desc}</Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Momento — aparece al elegir modalidad */}
              <AnimatePresence>
                {modalidad && (
                  <motion.div
                    key="momento"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <StepLabel n="2" label="¿Para qué momento?" />
                    <Stack direction="row" spacing={1.2} flexWrap="wrap" mb={4} useFlexGap>
                      {MOMENTOS.map((m) => {
                        const active = momento === m.id;
                        return (
                          <Box
                            key={m.id}
                            onClick={() => setMomento(m.id)}
                            sx={{
                              display: "flex", alignItems: "center", gap: 1,
                              px: 2.2, py: 1.2, borderRadius: 999, cursor: "pointer",
                              border: `2px solid ${active ? m.color : "rgba(11,94,85,0.12)"}`,
                              bgcolor: active ? `${m.color}12` : "#fff",
                              transition: "all 0.18s ease",
                              "&:hover": { borderColor: m.color, bgcolor: `${m.color}10` },
                            }}
                          >
                            <Typography sx={{ fontSize: 18, lineHeight: 1 }}>{m.emoji}</Typography>
                            <Typography sx={{ fontSize: 13.5, fontWeight: active ? 800 : 600, color: active ? m.color : "#4A6B67" }}>
                              {m.id}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {error && (
                <Typography sx={{ fontSize: 13.5, color: "#E24B4A", textAlign: "center", mb: 2 }}>{error}</Typography>
              )}

              {/* CTA */}
              <AnimatePresence>
                {canGenerate && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleGenerate}
                      sx={{
                        py: 1.8, borderRadius: 3, textTransform: "none", fontWeight: 800, fontSize: 16,
                        letterSpacing: "-0.2px",
                        background: activeMod
                          ? `linear-gradient(135deg, ${activeMod.color} 0%, ${activeMod.color}CC 100%)`
                          : "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
                        boxShadow: `0 8px 28px ${activeMod?.border || "rgba(11,94,85,0.30)"}`,
                        "&:hover": { transform: "translateY(-2px)", boxShadow: `0 12px 36px ${activeMod?.border || "rgba(11,94,85,0.38)"}` },
                        transition: "all 0.25s ease",
                      }}
                    >
                      {activeMod?.emoji} Descubrir recetas de {momento}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ────── LOADING SUGGESTIONS ────── */}
          {step === "loading" && (
            <motion.div key="loading" variants={fadeUp} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Paper elevation={0} sx={{ borderRadius: 5, border: "1px solid rgba(11,94,85,0.10)", p: 4 }}>
                <RecipeLoader message="Preparando tus recetas…" />
              </Paper>
            </motion.div>
          )}

          {/* ────── SUGGESTIONS ────── */}
          {step === "suggestions" && (
            <motion.div key="suggestions" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                <Button onClick={() => setStep("select")} startIcon={<ArrowBackRoundedIcon />} size="small"
                  sx={{ textTransform: "none", color: "#4A6B67", fontWeight: 600, borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}>
                  Volver
                </Button>
                <Chip
                  label={`${activeMod?.emoji} ${modalidad} · ${MOMENTOS.find(m => m.id === momento)?.emoji} ${momento}`}
                  size="small"
                  sx={{ bgcolor: activeMod?.bg, color: activeMod?.color, fontWeight: 700, border: `1px solid ${activeMod?.border}` }}
                />
              </Stack>

              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0F2420", mb: 0.5, letterSpacing: "-0.4px" }}>
                Elegí tu receta
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: "#4A6B67", mb: 3 }}>
                Tocá una para ver los ingredientes
              </Typography>

              {error && (
                <Typography sx={{ fontSize: 13.5, color: "#E24B4A", mb: 2 }}>{error}</Typography>
              )}

              <Stack spacing={2}>
                {suggestions.map((r, i) => (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.1 }}
                  >
                    <Paper
                      elevation={0}
                      onClick={() => handleSelectRecipe(r)}
                      sx={{
                        p: 2.5, borderRadius: 4, cursor: "pointer",
                        border: "1px solid rgba(11,94,85,0.10)",
                        boxShadow: "0 2px 12px rgba(11,94,85,0.06)",
                        display: "flex", alignItems: "center", gap: 2.5,
                        transition: "all 0.2s ease",
                        "&:hover": { boxShadow: "0 8px 28px rgba(11,94,85,0.14)", transform: "translateY(-2px)", borderColor: "#0B5E55" },
                      }}
                    >
                      <Box sx={{
                        width: 56, height: 56, borderRadius: 3,
                        bgcolor: activeMod?.bg || "#E6F5F3",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 30, flexShrink: 0,
                      }}>
                        {r.emoji}
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography sx={{ fontSize: 15.5, fontWeight: 800, color: "#0F2420", letterSpacing: "-0.3px", mb: 0.3 }}>
                          {r.name}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#4A6B67", lineHeight: 1.5 }}>
                          {r.description}
                        </Typography>
                      </Box>
                      <Box sx={{ fontSize: 20, color: "#8AADAA", flexShrink: 0 }}>›</Box>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>

              <Button
                onClick={handleGenerate}
                startIcon={<RefreshRoundedIcon />}
                sx={{ mt: 3, textTransform: "none", fontWeight: 600, fontSize: 13.5, color: "#4A6B67", borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}
              >
                Otras opciones
              </Button>
            </motion.div>
          )}

          {/* ────── LOADING DETAIL ────── */}
          {step === "loading-detail" && (
            <motion.div key="loading-detail" variants={fadeUp} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Paper elevation={0} sx={{ borderRadius: 5, border: "1px solid rgba(11,94,85,0.10)", p: 4 }}>
                <RecipeLoader message={`Preparando "${selected?.name}"…`} />
              </Paper>
            </motion.div>
          )}

          {/* ────── DETAIL ────── */}
          {step === "detail" && detail && (
            <motion.div key="detail" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>

              {/* Back */}
              <Button onClick={() => { setStep("suggestions"); setShowSteps(false); }} startIcon={<ArrowBackRoundedIcon />} size="small"
                sx={{ mb: 2.5, textTransform: "none", color: "#4A6B67", fontWeight: 600, borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}>
                Otras recetas
              </Button>

              {/* Recipe header */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <Paper elevation={0} sx={{
                  borderRadius: 5, overflow: "hidden",
                  border: "1px solid rgba(11,94,85,0.10)",
                  boxShadow: "0 8px 32px rgba(11,94,85,0.10)",
                  mb: 2.5,
                }}>
                  {/* Header band */}
                  <Box sx={{
                    px: 3, pt: 3, pb: 2.5,
                    background: activeMod
                      ? `linear-gradient(135deg, ${activeMod.color}18 0%, #fff 100%)`
                      : "linear-gradient(135deg, #edf8f5 0%, #fff 100%)",
                    borderBottom: "1px solid rgba(11,94,85,0.08)",
                  }}>
                    <Typography sx={{ fontSize: 44, lineHeight: 1, mb: 1 }}>{detail.emoji}</Typography>
                    <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.6px", lineHeight: 1.2, mb: 1.5 }}>
                      {detail.name}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {[
                        { label: `⏱ ${detail.time}` },
                        { label: `📊 ${detail.difficulty}` },
                        { label: `🔥 ${detail.calories}` },
                        { label: `🍽️ ${detail.servings} porción${detail.servings > 1 ? "es" : ""}` },
                      ].map((c) => (
                        <Chip key={c.label} label={c.label} size="small"
                          sx={{ bgcolor: "#fff", border: "1px solid rgba(11,94,85,0.14)", fontWeight: 600, fontSize: 12.5, color: "#4A6B67" }} />
                      ))}
                    </Stack>
                  </Box>

                  {/* Ingredients */}
                  <Box sx={{ px: 3, py: 2.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em", mb: 1.5 }}>
                      Ingredientes
                    </Typography>
                    <Stack spacing={0.9}>
                      {detail.ingredients?.map((ing, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0B5E55", mt: 0.8, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 14, color: "#3D5A57", lineHeight: 1.5 }}>{ing}</Typography>
                          </Stack>
                        </motion.div>
                      ))}
                    </Stack>
                  </Box>
                </Paper>
              </motion.div>

              {/* ¡Vamos! button → reveals steps */}
              <AnimatePresence mode="wait">
                {!showSteps ? (
                  <motion.div key="vamos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Button
                      fullWidth variant="contained"
                      onClick={() => setShowSteps(true)}
                      sx={{
                        py: 1.9, borderRadius: 3, textTransform: "none", fontWeight: 900, fontSize: 17,
                        letterSpacing: "-0.2px",
                        background: activeMod
                          ? `linear-gradient(135deg, ${activeMod.color} 0%, ${activeMod.color}BB 100%)`
                          : "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
                        boxShadow: `0 8px 28px ${activeMod?.border || "rgba(11,94,85,0.30)"}`,
                        "&:hover": { transform: "translateY(-2px)", boxShadow: `0 12px 36px ${activeMod?.border || "rgba(11,94,85,0.38)"}` },
                        transition: "all 0.25s ease",
                      }}
                    >
                      ¡Vamos! 🚀
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="steps" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    <Paper elevation={0} sx={{
                      borderRadius: 5, border: "1px solid rgba(11,94,85,0.10)",
                      boxShadow: "0 4px 20px rgba(11,94,85,0.08)", overflow: "hidden",
                    }}>
                      <Box sx={{ px: 3, py: 2, bgcolor: "#f7fcfa", borderBottom: "1px solid rgba(11,94,85,0.08)" }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                          Preparación paso a paso
                        </Typography>
                      </Box>
                      <Box sx={{ px: 3, py: 2.5 }}>
                        <Stack spacing={2.5}>
                          {detail.steps?.map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                              <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{
                                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                  background: activeMod
                                    ? `linear-gradient(135deg, ${activeMod.color} 0%, ${activeMod.color}CC 100%)`
                                    : "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{i + 1}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 14.5, color: "#3D5A57", lineHeight: 1.7, pt: 0.2 }}>
                                  {step}
                                </Typography>
                              </Stack>
                            </motion.div>
                          ))}
                        </Stack>

                        {/* Tip */}
                        {detail.tip && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                            <Box sx={{
                              mt: 3, px: 2.5, py: 2, borderRadius: 3,
                              bgcolor: activeMod?.bg || "#E6F5F3",
                              border: `1px solid ${activeMod?.border || "rgba(11,94,85,0.15)"}`,
                            }}>
                              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                                <Typography sx={{ fontSize: 18, lineHeight: 1 }}>💡</Typography>
                                <Box>
                                  <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: activeMod?.color || "#0B5E55", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.4 }}>
                                    Tip
                                  </Typography>
                                  <Typography sx={{ fontSize: 13.5, color: "#4A6B67", lineHeight: 1.6 }}>
                                    {detail.tip}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </motion.div>
                        )}
                      </Box>
                    </Paper>

                    {/* Nueva receta */}
                    <Button
                      fullWidth onClick={reset}
                      startIcon={<RefreshRoundedIcon />}
                      sx={{
                        mt: 2.5, py: 1.5, borderRadius: 3, textTransform: "none", fontWeight: 700, fontSize: 14.5,
                        border: "1.5px solid rgba(11,94,85,0.20)", color: "#0B5E55",
                        "&:hover": { bgcolor: "rgba(11,94,85,0.05)", borderColor: "#0B5E55" },
                      }}
                    >
                      Nueva receta
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>

        <Box sx={{ height: 80 }} />
      </Box>
    </Box>
  );
};

export default RecipesPage;
