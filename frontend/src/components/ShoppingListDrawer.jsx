/**
 * ShoppingListDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Drawer deslizable con la lista de compras acumulativa.
 * - Items con checkbox para marcar como comprados
 * - Contador de pendientes en el FAB
 * - Agrupados por fuente (receta)
 * - Borrar item individual o vaciar toda la lista
 */

import { useState } from "react";
import {
  Drawer, Box, Typography, Stack, IconButton,
  Checkbox, Divider, Button, Tooltip, Chip, Badge,
} from "@mui/material";
import CloseRoundedIcon        from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingCartRoundedIcon  from "@mui/icons-material/ShoppingCartRounded";
import DeleteSweepRoundedIcon   from "@mui/icons-material/DeleteSweepRounded";
import { motion, AnimatePresence } from "framer-motion";
import { saveList, formatItemLabel } from "../utils/shoppingList";

/* ─── FAB flotante ──────────────────────────────────────────────────────────── */
export const ShoppingFab = ({ count, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      position: "fixed",
      bottom: { xs: 96, sm: 32 },
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
            bgcolor: "#0B5E55",
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

/* ─── Ítem individual ───────────────────────────────────────────────────────── */
const ListItem = ({ item, onChange, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
    transition={{ duration: 0.22 }}
  >
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        py: 0.8,
        px: 0.5,
        borderRadius: 2,
        transition: "background 0.15s",
        "&:hover": { bgcolor: "rgba(11,94,85,0.035)" },
        opacity: item.checked ? 0.45 : 1,
      }}
    >
      <Checkbox
        checked={item.checked}
        onChange={(e) => onChange(item._id, e.target.checked)}
        size="small"
        sx={{
          color: "rgba(11,94,85,0.30)",
          "&.Mui-checked": { color: "#0B5E55" },
          p: 0.6,
        }}
      />
      <Box flex={1} minWidth={0}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: "#0F2420",
            textDecoration: item.checked ? "line-through" : "none",
            lineHeight: 1.4,
          }}
        >
          {formatItemLabel(item)}
        </Typography>
        {item.sources?.length > 0 && (
          <Typography sx={{ fontSize: 11, color: "#8AADAA", mt: 0.1 }}>
            {item.sources.join(", ")}
          </Typography>
        )}
      </Box>
      <Tooltip title="Quitar">
        <IconButton
          size="small"
          onClick={() => onRemove(item._id)}
          sx={{ color: "#C0D5D2", "&:hover": { color: "#E57373", bgcolor: "rgba(229,115,115,0.08)" }, p: 0.5 }}
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

  const pending   = items.filter((i) => !i.checked).length;
  const completed = items.filter((i) => i.checked).length;

  const handleToggle = (id, checked) => {
    const next = items.map((i) => i._id === id ? { ...i, checked } : i);
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

  // Ordenar: pendientes primero, luego tachados
  const sorted = [...items].sort((a, b) => Number(a.checked) - Number(b.checked));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 380 },
          maxWidth: "100vw",
          bgcolor: "#FAFCFB",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2.5, pt: 3, pb: 2,
          background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.4}>
              <ShoppingCartRoundedIcon sx={{ fontSize: 22 }} />
              <Typography sx={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px" }}>
                Mi lista de compras
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.70)" }}>
              {pending > 0
                ? `${pending} pendiente${pending > 1 ? "s" : ""}`
                : items.length > 0
                  ? "¡Todo listo! ✓"
                  : "Agregá ingredientes desde tus recetas"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.75)", mt: -0.5, "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.12)" } }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        {/* Progress bar */}
        {items.length > 0 && (
          <Box sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.20)", borderRadius: 999, height: 6, overflow: "hidden" }}>
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

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ fontSize: 52, mb: 1.5 }}>🛒</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0F2420", mb: 0.5 }}>
              La lista está vacía
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: "#6B8C88", lineHeight: 1.6 }}>
              Generá una receta y tocá<br />
              <strong>"Agregar a mi lista"</strong> para empezar
            </Typography>
          </Box>
        ) : (
          <AnimatePresence mode="popLayout">
            {/* Pendientes */}
            {sorted.filter((i) => !i.checked).map((item) => (
              <ListItem
                key={item._id}
                item={item}
                onChange={handleToggle}
                onRemove={handleRemove}
              />
            ))}

            {/* Separador de completados */}
            {completed > 0 && pending > 0 && (
              <motion.div key="divider" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Divider sx={{ my: 1.5 }}>
                  <Chip
                    label={`${completed} comprado${completed > 1 ? "s" : ""}`}
                    size="small"
                    sx={{ fontSize: 11, fontWeight: 700, color: "#8AADAA", bgcolor: "rgba(11,94,85,0.06)" }}
                  />
                </Divider>
              </motion.div>
            )}

            {sorted.filter((i) => i.checked).map((item) => (
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

      {/* ── Footer con acciones ── */}
      {items.length > 0 && (
        <Box
          sx={{
            px: 2.5, py: 2,
            borderTop: "1px solid rgba(11,94,85,0.08)",
            bgcolor: "#fff",
            flexShrink: 0,
          }}
        >
          <Stack spacing={1.2}>
            {completed > 0 && (
              <Button
                fullWidth
                onClick={handleClearCompleted}
                startIcon={<DeleteSweepRoundedIcon />}
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: 13.5,
                  borderRadius: 2.5, py: 1.2,
                  bgcolor: "rgba(11,94,85,0.07)",
                  color: "#0B5E55",
                  "&:hover": { bgcolor: "rgba(11,94,85,0.12)" },
                }}
              >
                Quitar comprados ({completed})
              </Button>
            )}

            {/* Confirm clear all */}
            {!confirmClear ? (
              <Button
                fullWidth
                onClick={() => setConfirmClear(true)}
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: 13,
                  borderRadius: 2.5, py: 1,
                  color: "#B0C4C0",
                  "&:hover": { color: "#E57373", bgcolor: "rgba(229,115,115,0.06)" },
                }}
              >
                Vaciar lista
              </Button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ bgcolor: "rgba(239,68,68,0.06)", borderRadius: 2.5, p: 1.5 }}>
                  <Typography sx={{ fontSize: 13, color: "#E24B4A", fontWeight: 700, textAlign: "center", mb: 1 }}>
                    ¿Vaciar toda la lista?
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth size="small"
                      onClick={() => setConfirmClear(false)}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, color: "#4A6B67", bgcolor: "rgba(11,94,85,0.06)", "&:hover": { bgcolor: "rgba(11,94,85,0.10)" } }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      fullWidth size="small"
                      onClick={handleClearAll}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, bgcolor: "#E24B4A", color: "#fff", "&:hover": { bgcolor: "#C0392B" } }}
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
