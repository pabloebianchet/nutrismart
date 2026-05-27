/**
 * ShoppingListDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Drawer deslizable con la lista de compras acumulativa.
 *
 * Fixes v2:
 *  - mt en Paper para evitar solapamiento con nav flotante (mobile/desktop)
 *  - Orden estable (los items NO se mueven al checkearlos) → bug uncheck resuelto
 *  - Input para agregar items manualmente
 */

import { useState, useRef } from "react";
import {
  Drawer, Box, Typography, Stack, IconButton,
  Checkbox, Button, Tooltip, Badge, TextField,
  InputAdornment,
} from "@mui/material";
import CloseRoundedIcon         from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingCartRoundedIcon  from "@mui/icons-material/ShoppingCartRounded";
import DeleteSweepRoundedIcon   from "@mui/icons-material/DeleteSweepRounded";
import AddRoundedIcon           from "@mui/icons-material/AddRounded";
import { motion, AnimatePresence } from "framer-motion";
import { saveList, formatItemLabel, parseIngredient, mergeIngredients } from "../utils/shoppingList";

/* ─── FAB flotante ──────────────────────────────────────────────────────────── */
export const ShoppingFab = ({ count, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      position: "fixed",
      bottom: { xs: 100, sm: 32 },
      right: { xs: 16, sm: 32 },
      zIndex: 1200,
      cursor: "pointer",
    }}
  >
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.94 }}
    >
      <Badge
        badgeContent={count}
        color="error"
        max={99}
        sx={{
          "& .MuiBadge-badge": {
            fontSize: 11, fontWeight: 800,
            minWidth: 20, height: 20,
            top: 4, right: 4,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#bae0dc",
            color: "#fff",
            borderRadius: 999,
            px: 2.2,
            py: 1.3,
            boxShadow: "0 8px 28px rgba(11,94,85,0.38)",
          }}
        >
          <ShoppingCartRoundedIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.2px" }}>
            Mi lista
          </Typography>
        </Box>
      </Badge>
    </motion.div>
  </Box>
);

/* ─── Ítem individual (orden estable, sin saltos) ───────────────────────────── */
const ListItem = ({ item, onChange, onRemove }) => (
  <motion.div
    layout="position"
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
    transition={{ duration: 0.2 }}
  >
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        py: 0.7,
        px: 0.5,
        borderRadius: 2,
        transition: "background 0.15s",
        "&:hover": { bgcolor: "rgba(11,94,85,0.035)" },
      }}
    >
      <Checkbox
        checked={item.checked}
        onChange={(e) => onChange(item._id, e.target.checked)}
        size="small"
        sx={{
          color: "rgba(11,94,85,0.28)",
          "&.Mui-checked": { color: "#bae0dc" },
          p: 0.6,
          flexShrink: 0,
        }}
      />
      <Box flex={1} minWidth={0}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: item.checked ? 400 : 600,
            color: item.checked ? "#9ABAB7" : "#0F2420",
            textDecoration: item.checked ? "line-through" : "none",
            lineHeight: 1.4,
            transition: "all 0.2s",
          }}
        >
          {formatItemLabel(item)}
        </Typography>
        {item.sources?.length > 0 && (
          <Typography sx={{ fontSize: 11, color: "#B0C4C0", mt: 0.1 }}>
            {item.sources.join(", ")}
          </Typography>
        )}
      </Box>
      <Tooltip title="Quitar">
        <IconButton
          size="small"
          onClick={() => onRemove(item._id)}
          sx={{
            color: "#C0D5D2",
            "&:hover": { color: "#E57373", bgcolor: "rgba(229,115,115,0.08)" },
            p: 0.5,
            flexShrink: 0,
          }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  </motion.div>
);

/* ─── Drawer principal ──────────────────────────────────────────────────────── */
const ShoppingListDrawer = ({ open, onClose, items, setItems }) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [newItem,      setNewItem]      = useState("");
  const inputRef = useRef(null);

  const pending   = items.filter((i) => !i.checked).length;
  const completed = items.filter((i) => i.checked).length;

  /* ── handlers ── */
  const handleToggle = (id, checked) => {
    const next = items.map((i) => (i._id === id ? { ...i, checked } : i));
    setItems(next);
    saveList(next);
  };

  const handleRemove = (id) => {
    const next = items.filter((i) => i._id !== id);
    setItems(next);
    saveList(next);
  };

  const handleClearCompleted = () => {
    const next = items.filter((i) => !i.checked);
    setItems(next);
    saveList(next);
  };

  const handleClearAll = () => {
    setItems([]);
    saveList([]);
    setConfirmClear(false);
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    const txt = newItem.trim();
    if (!txt) return;
    const parsed = parseIngredient(txt, "Manual");
    const merged = mergeIngredients(items, [parsed]);
    setItems(merged);
    saveList(merged);
    setNewItem("");
    inputRef.current?.focus();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width:  { xs: "100vw", sm: 390 },
          maxWidth: "100vw",
          bgcolor: "#FAFCFB",
          display: "flex",
          flexDirection: "column",
          // Arrancar debajo del nav flotante en mobile / fijo en desktop
          mt:     { xs: "68px", md: "64px" },
          height: { xs: "calc(100dvh - 68px)", md: "calc(100dvh - 64px)" },
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 2,
          background: "linear-gradient(135deg, #bae0dc 0%, #0f7a6e 100%)",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.3}>
              <ShoppingCartRoundedIcon sx={{ fontSize: 21 }} />
              <Typography sx={{ fontSize: 19, fontWeight: 900, letterSpacing: "-0.4px" }}>
                Mi lista de compras
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.68)" }}>
              {items.length === 0
                ? "Agregá ingredientes desde tus recetas o manualmente"
                : pending > 0
                  ? `${pending} pendiente${pending > 1 ? "s" : ""} · ${completed} comprado${completed !== 1 ? "s" : ""}`
                  : "¡Todo listo! ✓"}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "rgba(255,255,255,0.75)",
              mt: -0.5,
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        {/* Progress bar */}
        {items.length > 0 && (
          <Box
            sx={{
              mt: 1.8,
              bgcolor: "rgba(255,255,255,0.18)",
              borderRadius: 999,
              height: 5,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                borderRadius: 999,
                bgcolor: "#34D399",
                width: `${Math.round((completed / items.length) * 100)}%`,
                transition: "width 0.4s ease",
              }}
            />
          </Box>
        )}
      </Box>

      {/* ── Input manual ── */}
      <Box
        component="form"
        onSubmit={handleAddManual}
        sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0, borderBottom: "1px solid rgba(11,94,85,0.07)" }}
      >
        <TextField
          inputRef={inputRef}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Agregar item (ej: 3 huevos, leche…)"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  disabled={!newItem.trim()}
                  size="small"
                  sx={{
                    bgcolor: newItem.trim() ? "#bae0dc" : "transparent",
                    color: newItem.trim() ? "#fff" : "#B0C4C0",
                    "&:hover": { bgcolor: "#0f7a6e" },
                    transition: "all 0.2s",
                    width: 30,
                    height: 30,
                  }}
                >
                  <AddRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2.5,
              fontSize: 13.5,
              bgcolor: "#fff",
              "& fieldset": { borderColor: "rgba(11,94,85,0.15)" },
              "&:hover fieldset": { borderColor: "rgba(11,94,85,0.30) !important" },
              "&.Mui-focused fieldset": { borderColor: "#bae0dc !important" },
            },
          }}
        />
      </Box>

      {/* ── Lista (orden estable, sin saltos) ── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.5 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontSize: 48, mb: 1.5 }}>🛒</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0F2420", mb: 0.5 }}>
              La lista está vacía
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#6B8C88", lineHeight: 1.6 }}>
              Escribí un item arriba o generá una receta<br />
              y tocá <strong>"Agregar a mi lista"</strong>
            </Typography>
          </Box>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <ListItem
                key={item._id}
                item={item}
                onChange={handleToggle}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
        )}
      </Box>

      {/* ── Footer ── */}
      {items.length > 0 && (
        <Box
          sx={{
            px: 2.5,
            pt: 2,
            // pb amplio en mobile para no quedar tapado por el FAB "Analizar producto" (bottom:24 + h:54)
            pb: { xs: "88px", sm: 2 },
            borderTop: "1px solid rgba(11,94,85,0.08)",
            bgcolor: "#fff",
            flexShrink: 0,
          }}
        >
          <Stack spacing={1}>
            {completed > 0 && (
              <Button
                fullWidth
                onClick={handleClearCompleted}
                startIcon={<DeleteSweepRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13.5,
                  borderRadius: 2.5,
                  py: 1.1,
                  bgcolor: "rgba(11,94,85,0.07)",
                  color: "#bae0dc",
                  "&:hover": { bgcolor: "rgba(11,94,85,0.12)" },
                }}
              >
                Quitar comprados ({completed})
              </Button>
            )}

            {!confirmClear ? (
              <Button
                fullWidth
                onClick={() => setConfirmClear(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 2.5,
                  py: 0.9,
                  color: "#B0C4C0",
                  "&:hover": { color: "#E57373", bgcolor: "rgba(229,115,115,0.06)" },
                }}
              >
                Vaciar lista
              </Button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ bgcolor: "rgba(239,68,68,0.06)", borderRadius: 2.5, p: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#E24B4A",
                      fontWeight: 700,
                      textAlign: "center",
                      mb: 1,
                    }}
                  >
                    ¿Vaciar toda la lista?
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      size="small"
                      onClick={() => setConfirmClear(false)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 2,
                        color: "#4A6B67",
                        bgcolor: "rgba(11,94,85,0.06)",
                        "&:hover": { bgcolor: "rgba(11,94,85,0.10)" },
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      onClick={handleClearAll}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 2,
                        bgcolor: "#E24B4A",
                        color: "#fff",
                        "&:hover": { bgcolor: "#C0392B" },
                      }}
                    >
                      Sí, vaciar
                    </Button>
                  </Stack>
                </Box>
              </motion.div>
            )}
          </Stack>
        </Box>
      )}
    </Drawer>
  );
};

export default ShoppingListDrawer;
