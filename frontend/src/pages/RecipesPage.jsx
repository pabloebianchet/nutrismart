import { useState, useEffect } from "react";
import {
  Box, Typography, Stack, Chip, Button, Paper,
  CircularProgress, IconButton, Tooltip, Snackbar, Alert,
} from "@mui/material";
import ArrowBackRoundedIcon       from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon         from "@mui/icons-material/RefreshRounded";
import CheckRoundedIcon           from "@mui/icons-material/CheckRounded";
import BookmarkBorderRoundedIcon  from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon        from "@mui/icons-material/BookmarkRounded";
import WhatsAppIcon               from "@mui/icons-material/WhatsApp";
import ContentCopyRoundedIcon     from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon   from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon      from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon      from "@mui/icons-material/ExpandLessRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import { motion, AnimatePresence } from "framer-motion";
import { useNutrition }           from "../context/NutritionContext";
import { useLocation }            from "react-router-dom";
import { API_URL }                from "../config/api";
import ShoppingListDrawer, { ShoppingFab } from "../components/ShoppingListDrawer";
import { parseIngredient, mergeIngredients, loadList, saveList } from "../utils/shoppingList";

// ─── config ─────────────────────────────────────────────────────────────────

const MODALIDADES = [
  { id: "Fit",         label: "Fit",         emoji: "💚", desc: "Liviano, proteico y natural", color: "#2E7D32", bg: "#E8F5E9", border: "rgba(46,125,50,0.25)"   },
  { id: "Hipertrofia", label: "Hipertrofia", emoji: "💪", desc: "Alto en proteína y calorías", color: "#BF360C", bg: "#FBE9E7", border: "rgba(191,54,12,0.25)"   },
  { id: "Rápidas",     label: "Rápidas",     emoji: "⚡", desc: "Listo en menos de 15 min",   color: "#1565C0", bg: "#E3F2FD", border: "rgba(21,101,192,0.25)"   },
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

// ─── Instagram icon (not in MUI) ─────────────────────────────────────────────

const InstagramIcon = () => (
  <Box component="svg" sx={{ width: 19, height: 19 }} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </Box>
);

// ─── helpers ─────────────────────────────────────────────────────────────────

const buildShareText = (recipe) => {
  const lines = [
    `${recipe.emoji || "🍽️"} *${recipe.name}*`,
    `⏱ ${recipe.time}  🔥 ${recipe.calories}  📊 ${recipe.difficulty}`,
    "",
    "🛒 *Ingredientes:*",
    ...(recipe.ingredients || []).map((i) => `• ${i}`),
    "",
    "👨‍🍳 *Preparación:*",
    ...(recipe.steps || []).map((s, idx) => `${idx + 1}. ${s}`),
  ];
  if (recipe.tip) lines.push("", `💡 *Tip:* ${recipe.tip}`);
  lines.push("", "Generado con NUI App 💚");
  return lines.join("\n");
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
    <Typography sx={{
      fontSize: 56, lineHeight: 1, mb: 3,
      "@keyframes cookSpin": { "0%,100%": { transform: "rotate(-10deg)" }, "50%": { transform: "rotate(10deg)" } },
      animation: "cookSpin 1.2s ease-in-out infinite",
      display: "inline-block",
    }}>
      🍳
    </Typography>
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

const ShareIcons = ({ recipe, onCopy, onInstagram }) => (
  <Stack direction="row" spacing={0.5}>
    <Tooltip title="Compartir por WhatsApp">
      <IconButton
        size="small"
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(recipe))}`, "_blank", "noopener")}
        sx={{ color: "#25D366", "&:hover": { bgcolor: "rgba(37,211,102,0.10)" } }}
      >
        <WhatsAppIcon sx={{ fontSize: 19 }} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Compartir en Instagram">
      <IconButton
        size="small"
        onClick={onInstagram}
        sx={{ color: "#C13584", "&:hover": { bgcolor: "rgba(193,53,132,0.10)" } }}
      >
        <InstagramIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Copiar receta">
      <IconButton
        size="small"
        onClick={onCopy}
        sx={{ color: "#4A6B67", "&:hover": { bgcolor: "rgba(11,94,85,0.08)" } }}
      >
        <ContentCopyRoundedIcon sx={{ fontSize: 17 }} />
      </IconButton>
    </Tooltip>
  </Stack>
);

// ─── saved recipe card (for Guardadas tab) ────────────────────────────────────

const SavedCard = ({ recipe, expanded, onToggle, onDelete, onCopy, onInstagram, deleting }) => {
  const mod = MODALIDADES.find((m) => m.id === recipe.modalidad);
  return (
    <Paper elevation={0} sx={{
      borderRadius: 4, border: "1px solid rgba(11,94,85,0.10)",
      boxShadow: "0 2px 12px rgba(11,94,85,0.06)", overflow: "hidden",
    }}>
      {/* header row */}
      <Box
        onClick={onToggle}
        sx={{ px: 2.5, py: 2, cursor: "pointer", display: "flex", alignItems: "center", gap: 2,
          "&:hover": { bgcolor: "rgba(11,94,85,0.025)" }, transition: "background 0.15s" }}
      >
        <Box sx={{
          width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
          bgcolor: mod?.bg || "#E6F5F3",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
        }}>
          {recipe.emoji}
        </Box>
        <Box flex={1} minWidth={0}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0F2420", letterSpacing: "-0.3px", mb: 0.3 }}>
            {recipe.name}
          </Typography>
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            {mod && (
              <Chip label={`${mod.emoji} ${mod.label}`} size="small"
                sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: mod.bg, color: mod.color, border: `1px solid ${mod.border}` }} />
            )}
            {recipe.momento && (
              <Chip label={recipe.momento} size="small"
                sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67" }} />
            )}
            {recipe.time && (
              <Typography sx={{ fontSize: 11.5, color: "#8AADAA", alignSelf: "center" }}>⏱ {recipe.time}</Typography>
            )}
            {recipe.calories && (
              <Typography sx={{ fontSize: 11.5, color: "#8AADAA", alignSelf: "center" }}>🔥 {recipe.calories}</Typography>
            )}
          </Stack>
        </Box>
        <Box sx={{ color: "#8AADAA", flexShrink: 0 }}>
          {expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        </Box>
      </Box>

      {/* expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
        <Box sx={{ px: 2.5, pb: 2, pt: 0.5, borderTop: "1px solid rgba(11,94,85,0.07)" }}>

          {/* ingredients */}
          <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em", mb: 1.2, mt: 1.5 }}>
            Ingredientes
          </Typography>
          <Stack spacing={0.7} mb={2}>
            {(recipe.ingredients || []).map((ing, i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#0B5E55", mt: 0.85, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13.5, color: "#3D5A57", lineHeight: 1.5 }}>{ing}</Typography>
              </Stack>
            ))}
          </Stack>

          {/* steps */}
          {(recipe.steps || []).length > 0 && (
            <>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#0B5E55", textTransform: "uppercase", letterSpacing: "0.09em", mb: 1.2 }}>
                Preparación
              </Typography>
              <Stack spacing={1.8} mb={2}>
                {recipe.steps.map((s, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      bgcolor: mod?.bg || "#E6F5F3",
                      border: `1.5px solid ${mod?.color || "#0B5E55"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 900, color: mod?.color || "#0B5E55" }}>{i + 1}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13.5, color: "#3D5A57", lineHeight: 1.6, pt: 0.1 }}>{s}</Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}

          {/* tip */}
          {recipe.tip && (
            <Box sx={{ px: 2, py: 1.5, borderRadius: 2.5, bgcolor: mod?.bg || "#E6F5F3", border: `1px solid ${mod?.border || "rgba(11,94,85,0.15)"}`, mb: 2 }}>
              <Stack direction="row" spacing={1}>
                <Typography sx={{ fontSize: 16, lineHeight: 1 }}>💡</Typography>
                <Typography sx={{ fontSize: 13, color: "#4A6B67", lineHeight: 1.6 }}>{recipe.tip}</Typography>
              </Stack>
            </Box>
          )}

          {/* actions */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <ShareIcons recipe={recipe} onCopy={onCopy} onInstagram={onInstagram} />
            <Tooltip title="Eliminar receta">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                disabled={deleting}
                sx={{ color: "#E57373", "&:hover": { bgcolor: "rgba(229,115,115,0.10)" } }}
              >
                {deleting
                  ? <CircularProgress size={16} sx={{ color: "#E57373" }} />
                  : <DeleteOutlineRoundedIcon sx={{ fontSize: 19 }} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
};

// ─── main page ───────────────────────────────────────────────────────────────

const RecipesPage = () => {
  const { userData } = useNutrition();
  const location     = useLocation();

  const preselected = location.state?.modalidad ?? null;

  const [activeTab,    setActiveTab]    = useState("create");
  const [step,         setStep]         = useState("select");
  const [modalidad,    setModalidad]    = useState(preselected);
  const [momento,      setMomento]      = useState(null);
  const [suggestions,  setSuggestions]  = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [detail,       setDetail]       = useState(null);
  const [showSteps,    setShowSteps]    = useState(false);
  const [error,        setError]        = useState("");

  // save & share
  // recipe image (DALL-E, async)
  const [recipeImage,  setRecipeImage]  = useState(null);  // { imageUrl, authorName, authorLink, unsplashLink }
  const [loadingImage, setLoadingImage] = useState(false);

  const [saving,       setSaving]       = useState(false);
  const [savedNames,   setSavedNames]   = useState(new Set());
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [expandedId,   setExpandedId]   = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [snackMsg,     setSnackMsg]     = useState("");

  // shopping list
  const [shoppingList,    setShoppingList]    = useState(() => loadList());
  const [drawerOpen,      setDrawerOpen]      = useState(false);
  const [addedToList,     setAddedToList]     = useState(false); // feedback inmediato

  const token       = localStorage.getItem("nutrismartToken");
  const canGenerate = modalidad && momento;
  const activeMod   = MODALIDADES.find((m) => m.id === modalidad);
  const isSaved     = detail ? savedNames.has(detail.name) : false;

  // ── load saved on mount ──
  const fetchSaved = async () => {
    setLoadingSaved(true);
    try {
      const res  = await fetch(`${API_URL}/api/recipes/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.recipes || [];
      setSavedRecipes(list);
      setSavedNames(new Set(list.map((r) => r.name)));
    } catch {
      // silently fail
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []); // eslint-disable-line

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
  const generateImage = async (name, emoji, ingredients) => {
    setRecipeImage(null);
    setLoadingImage(true);
    try {
      const res  = await fetch(`${API_URL}/api/recipes/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, emoji, modalidad, ingredients }),
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) setRecipeImage(data);
    } catch {}
    finally { setLoadingImage(false); }
  };

  const handleSelectRecipe = async (recipe) => {
    setSelected(recipe);
    setShowSteps(false);
    setDetail(null);
    setRecipeImage(null);
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
      // Generar imagen de forma asíncrona (no bloquea la UI)
      generateImage(data.name, data.emoji, data.ingredients);
    } catch (err) {
      setError(err.message);
      setStep("suggestions");
    }
  };

  // ── save recipe ──
  const handleSave = async () => {
    if (!detail || isSaved || saving) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/api/recipes/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...detail, modalidad, momento }),
      });
      const data = await res.json();
      if (!res.ok && data.error !== "already_saved") throw new Error(data.error);
      const newRecipe = data.saved || { ...detail, modalidad, momento, _id: String(Date.now()) };
      setSavedNames((prev) => new Set([...prev, detail.name]));
      setSavedRecipes((prev) => [newRecipe, ...prev]);
      setSnackMsg("¡Receta guardada! 💾");
    } catch {
      setSnackMsg("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // ── instagram: copy + open ──
  const handleInstagram = async (recipe) => {
    try {
      await navigator.clipboard.writeText(buildShareText(recipe).replace(/\*/g, ""));
    } catch {}
    window.open("https://www.instagram.com", "_blank", "noopener");
    setSnackMsg("¡Receta copiada! Pegala en tus Stories 📸");
  };

  // ── copy to clipboard ──
  const handleCopy = async (recipe) => {
    try {
      await navigator.clipboard.writeText(buildShareText(recipe).replace(/\*/g, ""));
      setSnackMsg("¡Copiado al portapapeles! 📋");
    } catch {
      setSnackMsg("No se pudo copiar.");
    }
  };

  // ── add ingredients to shopping list ──
  const handleAddToList = () => {
    if (!detail?.ingredients?.length) return;
    const newItems = detail.ingredients.map((ing) =>
      parseIngredient(ing, detail.name)
    );
    const merged = mergeIngredients(shoppingList, newItems);
    setShoppingList(merged);
    saveList(merged);
    setAddedToList(true);
    setTimeout(() => setAddedToList(false), 2500);
    setSnackMsg(`🛒 ${newItems.length} ingrediente${newItems.length > 1 ? "s" : ""} agregado${newItems.length > 1 ? "s" : ""} a tu lista`);
  };

  // ── delete saved recipe ──
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/recipes/saved/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const removed = savedRecipes.find((r) => r._id === id);
      setSavedRecipes((prev) => prev.filter((r) => r._id !== id));
      if (removed) setSavedNames((prev) => { const s = new Set(prev); s.delete(removed.name); return s; });
      setSnackMsg("Receta eliminada.");
    } catch {
      setSnackMsg("No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  const reset = () => {
    setStep("select"); setModalidad(preselected); setMomento(null);
    setSuggestions([]); setSelected(null); setDetail(null);
    setShowSteps(false); setError("");
    setRecipeImage(null); setLoadingImage(false);
  };

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
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
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
            {step !== "select" && activeTab === "create" && (
              <Button
                onClick={reset}
                startIcon={<RefreshRoundedIcon />}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, color: "#0B5E55", borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}
              >
                Nueva
              </Button>
            )}
          </Stack>

          {/* ── Tab switcher ── */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={0}
              sx={{ bgcolor: "rgba(11,94,85,0.06)", borderRadius: 999, p: 0.5, display: "inline-flex" }}>
              {[
                { id: "create", label: "Crear receta" },
                { id: "saved",  label: savedRecipes.length ? `Guardadas (${savedRecipes.length})` : "Guardadas" },
              ].map((tab) => (
                <Box
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    px: 2.2, py: 0.8, borderRadius: 999, cursor: "pointer",
                    bgcolor: activeTab === tab.id ? "#fff" : "transparent",
                    boxShadow: activeTab === tab.id ? "0 2px 8px rgba(11,94,85,0.12)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Typography sx={{
                    fontSize: 13.5,
                    fontWeight: activeTab === tab.id ? 800 : 600,
                    color: activeTab === tab.id ? "#0B5E55" : "#4A6B67",
                    whiteSpace: "nowrap",
                  }}>
                    {tab.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </motion.div>

        {/* ══════════════ TAB: CREATE ══════════════ */}
        {activeTab === "create" && (
          <AnimatePresence mode="wait">

            {/* ────── SELECT ────── */}
            {step === "select" && (
              <motion.div key="select" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>

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

                <AnimatePresence>
                  {modalidad && (
                    <motion.div key="momento" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3 }}>
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

                {error && (
                  <Typography sx={{ fontSize: 13.5, color: "#E24B4A", textAlign: "center", mb: 2 }}>{error}</Typography>
                )}

                <AnimatePresence>
                  {canGenerate && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      <Button
                        fullWidth variant="contained"
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

                {error && <Typography sx={{ fontSize: 13.5, color: "#E24B4A", mb: 2 }}>{error}</Typography>}

                <Stack spacing={2}>
                  {suggestions.map((r, i) => (
                    <motion.div key={r.name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.1 }}>
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

                <Button onClick={() => { setStep("suggestions"); setShowSteps(false); }} startIcon={<ArrowBackRoundedIcon />} size="small"
                  sx={{ mb: 2.5, textTransform: "none", color: "#4A6B67", fontWeight: 600, borderRadius: 999, "&:hover": { bgcolor: "rgba(11,94,85,0.06)" } }}>
                  Otras recetas
                </Button>

                {/* Recipe card */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                  <Paper elevation={0} sx={{
                    borderRadius: 5, overflow: "hidden",
                    border: "1px solid rgba(11,94,85,0.10)",
                    boxShadow: "0 8px 32px rgba(11,94,85,0.10)",
                    mb: 2,
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

                    {/* Imagen del plato (Unsplash, carga async) */}
                    {(loadingImage || recipeImage) && (
                      <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", bgcolor: "#F0F7F5" }}>
                        {loadingImage && !recipeImage && (
                          <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                            <Typography sx={{
                              fontSize: 36,
                              "@keyframes pulse": { "0%,100%": { opacity: 0.5, transform: "scale(0.95)" }, "50%": { opacity: 1, transform: "scale(1.05)" } },
                              animation: "pulse 1.5s ease-in-out infinite",
                            }}>
                              🍳
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#8AADAA", fontWeight: 600 }}>
                              Buscando imagen del plato…
                            </Typography>
                          </Box>
                        )}
                        {recipeImage && (
                          <>
                            <Box
                              component="img"
                              src={recipeImage.imageUrl}
                              alt={detail.name}
                              sx={{
                                width: "100%", height: "100%", objectFit: "cover", display: "block",
                                "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
                                animation: "fadeIn 0.6s ease",
                              }}
                            />
                            {/* Crédito Unsplash (requerido por sus términos) */}
                            <Box
                              component="a"
                              href={`${recipeImage.unsplashLink}?utm_source=nui_app&utm_medium=referral`}
                              target="_blank" rel="noopener noreferrer"
                              sx={{
                                position: "absolute", bottom: 0, right: 0,
                                px: 1.2, py: 0.4,
                                bgcolor: "rgba(0,0,0,0.45)",
                                fontSize: 10, color: "rgba(255,255,255,0.85)",
                                textDecoration: "none",
                                "&:hover": { color: "#fff" },
                              }}
                            >
                              📷 {recipeImage.authorName} · Unsplash
                            </Box>
                          </>
                        )}
                      </Box>
                    )}

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

                {/* Agregar a lista de compras */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <Button
                    fullWidth
                    onClick={handleAddToList}
                    startIcon={<AddShoppingCartRoundedIcon />}
                    sx={{
                      mb: 2,
                      py: 1.4, borderRadius: 3,
                      textTransform: "none", fontWeight: 800, fontSize: 14.5,
                      letterSpacing: "-0.2px",
                      bgcolor: addedToList ? "rgba(16,185,129,0.12)" : "rgba(11,94,85,0.07)",
                      color: addedToList ? "#059669" : "#0B5E55",
                      border: `1.5px solid ${addedToList ? "rgba(16,185,129,0.30)" : "rgba(11,94,85,0.15)"}`,
                      "&:hover": {
                        bgcolor: "rgba(11,94,85,0.12)",
                        borderColor: "#0B5E55",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {addedToList ? "✓ Ingredientes agregados a tu lista" : "Agregar ingredientes a mi lista"}
                  </Button>
                </motion.div>

                {/* Save & Share row */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center"
                    sx={{ px: 1, mb: 2 }}>

                    {/* Save button */}
                    <Button
                      onClick={handleSave}
                      disabled={isSaved || saving}
                      startIcon={
                        saving
                          ? <CircularProgress size={16} sx={{ color: "#0B5E55" }} />
                          : isSaved
                            ? <BookmarkRoundedIcon sx={{ fontSize: 19 }} />
                            : <BookmarkBorderRoundedIcon sx={{ fontSize: 19 }} />
                      }
                      sx={{
                        textTransform: "none", fontWeight: 700, fontSize: 13.5,
                        borderRadius: 999, px: 2, py: 0.9,
                        color: isSaved ? "#0B5E55" : "#4A6B67",
                        bgcolor: isSaved ? "rgba(11,94,85,0.08)" : "transparent",
                        border: `1.5px solid ${isSaved ? "rgba(11,94,85,0.25)" : "rgba(11,94,85,0.15)"}`,
                        "&:hover": { bgcolor: "rgba(11,94,85,0.08)", borderColor: "#0B5E55" },
                        "&.Mui-disabled": {
                          color: isSaved ? "#0B5E55" : "#aaa",
                          borderColor: isSaved ? "rgba(11,94,85,0.25)" : "rgba(0,0,0,0.1)",
                          bgcolor: isSaved ? "rgba(11,94,85,0.08)" : "transparent",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {isSaved ? "Guardada ✓" : "Guardar"}
                    </Button>

                    {/* Share icons */}
                    <ShareIcons recipe={detail} onCopy={() => handleCopy(detail)} onInstagram={() => handleInstagram(detail)} />
                  </Stack>
                </motion.div>

                {/* ¡Vamos! → steps */}
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
                            {detail.steps?.map((s, i) => (
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
                                    {s}
                                  </Typography>
                                </Stack>
                              </motion.div>
                            ))}
                          </Stack>

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
        )}

        {/* ══════════════ TAB: GUARDADAS ══════════════ */}
        {activeTab === "saved" && (
          <motion.div key="saved-tab" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {loadingSaved ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CircularProgress size={32} sx={{ color: "#0B5E55" }} />
              </Box>
            ) : savedRecipes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography sx={{ fontSize: 48, mb: 2 }}>📭</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0F2420", mb: 1 }}>
                  Aún no guardaste ninguna receta
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: "#4A6B67", mb: 3 }}>
                  Generá una y tocá "Guardar" para verla acá
                </Typography>
                <Button
                  onClick={() => setActiveTab("create")}
                  variant="contained"
                  sx={{
                    textTransform: "none", fontWeight: 700, borderRadius: 999, px: 3,
                    background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
                    boxShadow: "0 6px 20px rgba(11,94,85,0.28)",
                  }}
                >
                  Crear receta
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {savedRecipes.map((recipe) => (
                  <motion.div
                    key={recipe._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SavedCard
                      recipe={recipe}
                      expanded={expandedId === recipe._id}
                      onToggle={() => setExpandedId(expandedId === recipe._id ? null : recipe._id)}
                      onDelete={() => handleDelete(recipe._id)}
                      onCopy={() => handleCopy(recipe)}
                      onInstagram={() => handleInstagram(recipe)}
                      deleting={deletingId === recipe._id}
                    />
                  </motion.div>
                ))}
              </Stack>
            )}
          </motion.div>
        )}

        <Box sx={{ height: 80 }} />
      </Box>

      {/* ── Shopping List FAB ── */}
      <AnimatePresence>
        {shoppingList.length > 0 && (
          <ShoppingFab
            count={shoppingList.filter((i) => !i.checked).length}
            onClick={() => setDrawerOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* ── Shopping List Drawer ── */}
      <ShoppingListDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={shoppingList}
        setItems={setShoppingList}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={!!snackMsg}
        autoHideDuration={2800}
        onClose={() => setSnackMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackMsg("")}
          severity={snackMsg.includes("pudo") ? "error" : "success"}
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecipesPage;
