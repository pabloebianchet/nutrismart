import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Divider,
  IconButton,
  Avatar,
  Chip,
} from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useNutrition } from "../context/NutritionContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import PeanutMascot, { getMood, MOOD_META } from "./PeanutMascot";
import AvatarMascot, { getAvatarState } from "./AvatarMascot";
import axios from "axios";
import TestCard from "./TestCard";
import SubscriptionWidget from "./SubscriptionWidget";
import LeaderboardWidget from "./LeaderboardWidget";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import HeightOutlinedIcon from "@mui/icons-material/HeightOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { API_URL } from "../config/api";

/* ────────────────────────────────────────────
   Paleta y tokens de diseño
──────────────────────────────────────────── */
const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  accent: "#22C9B0",
  accentWarm: "#F5A623",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.12)",
  borderStrong: "rgba(11,94,85,0.25)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
  danger: "#E24B4A",
  success: "#3B9E6A",
};

const shadow = {
  sm: "0 1px 3px rgba(11,94,85,0.08), 0 1px 2px rgba(11,94,85,0.04)",
  md: "0 4px 12px rgba(11,94,85,0.10), 0 2px 4px rgba(11,94,85,0.06)",
  lg: "0 12px 32px rgba(11,94,85,0.12), 0 4px 8px rgba(11,94,85,0.06)",
  xl: "0 24px 48px rgba(11,94,85,0.14), 0 8px 16px rgba(11,94,85,0.08)",
};

/* ────────────────────────────────────────────
   Sub-componentes
──────────────────────────────────────────── */

const StatPill = ({ label, value, icon: Icon, accent }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1.5,
      borderRadius: 3,
      bgcolor: accent ? C.brandSurface : C.surfaceAlt,
      border: `1px solid ${accent ? C.brandMuted : C.border}`,
      flex: 1,
      minWidth: 0,
    }}
  >
    {Icon && (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          bgcolor: accent ? C.brand : "rgba(11,94,85,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16, color: accent ? "#fff" : C.brand }} />
      </Box>
    )}
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          lineHeight: 1,
          mb: 0.4,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 700,
          color: C.textPrimary,
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const ScoreBadge = ({ score }) => {
  const color = score >= 75 ? C.success : score >= 50 ? C.accentWarm : C.danger;
  const label = score >= 75 ? "Excelente" : score >= 50 ? "Regular" : "Mejorar";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 600, color }}>{label}</Typography>
    </Box>
  );
};

// ─── helpers para el historial ─────────────────────────────────────────────

const getScoreColor = (s) =>
  s >= 75 ? C.success : s >= 50 ? C.accentWarm : C.danger;

const getScoreLabel = (s) =>
  s >= 90 ? "Excelente" :
  s >= 75 ? "Saludable" :
  s >= 60 ? "Aceptable" :
  s >= 45 ? "Mejorable" : "A evitar";

const getProcessingBadge = (text) => {
  const l = (text || "").toLowerCase();
  if (l.includes("ultraprocesado")) return { label: "Ultraprocesado", color: "#B71C1C" };
  if (l.includes("no procesado"))   return { label: "No procesado",   color: C.success   };
  if (l.includes("procesado"))      return { label: "Procesado",      color: "#E65100"   };
  return null;
};

const parseAnalysisText = (text) => {
  if (!text) return { classification: "", explanation: "", guidance: "" };
  const m = text.match(/Puntaje global:\s*\d+\s*\/\s*100/i);
  if (!m) return { classification: text, explanation: "", guidance: "" };
  const idx = text.indexOf(m[0]);
  const classification = text.slice(0, idx).trim();
  const after = text.slice(idx + m[0].length).trim();
  let parts = after.split(/\n\n+/).filter((p) => p.trim());
  if (parts.length < 2) parts = after.split(/\n/).filter((p) => p.trim());
  return { classification, explanation: parts[0] || after, guidance: parts.slice(1).join(" ") };
};

const getPreview = (text) => {
  if (!text) return "Sin descripción";
  const scoreIdx = text.toLowerCase().indexOf("puntaje global");
  const raw = scoreIdx > 0 ? text.slice(0, scoreIdx).trim() : text.split("\n")[0].trim();
  return raw.length > 90 ? raw.slice(0, 90) + "…" : raw || text.slice(0, 90);
};

const groupByDate = (items) => {
  const now   = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
  const used = new Set();
  const make = (label, fn) => {
    const its = items.filter(fn);
    its.forEach((i) => used.add(i._id));
    return its.length ? { label, items: its } : null;
  };
  return [
    make("Hoy",          (i) => new Date(i.createdAt) >= today),
    make("Ayer",         (i) => { const d = new Date(i.createdAt); return d >= yesterday && d < today; }),
    make("Esta semana",  (i) => { const d = new Date(i.createdAt); return d >= weekAgo && d < yesterday; }),
    make("Anteriores",   (i) => !used.has(i._id)),
  ].filter(Boolean);
};

// ─── HistoryList ───────────────────────────────────────────────────────────

const PAGE = 5;

const HistoryList = ({ history, onDelete, formatDateTime }) => {
  const [expandedId,   setExpandedId]   = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE);

  const visible = history.slice(0, visibleCount);
  const remaining = history.length - visibleCount;
  const groups = groupByDate(visible);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 5,
        border: `1px solid ${C.border}`,
        boxShadow: shadow.md,
        overflow: "hidden",
        bgcolor: C.surface,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3, py: 2.2,
          borderBottom: `1px solid ${C.border}`,
          bgcolor: C.surfaceAlt,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.textPrimary }}>
            Historial de análisis
          </Typography>
          <Typography sx={{ fontSize: 12, color: C.textMuted, mt: 0.2 }}>
            {history.length} análisis · últimos 30 días
          </Typography>
        </Box>
        <Chip
          label={`Promedio ${Math.round(history.reduce((s, i) => s + (i.score ?? 0), 0) / history.length)}/100`}
          size="small"
          sx={{ bgcolor: C.brandSurface, color: C.brand, fontWeight: 700, fontSize: 12, border: `1px solid ${C.brandMuted}` }}
        />
      </Box>

      {/* Groups */}
      {groups.map((group, gi) => (
        <Box key={group.label}>
          {/* Group label */}
          <Box sx={{ px: 3, py: 1, bgcolor: "#f6faf9", borderBottom: `1px solid ${C.border}` }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.09em" }}>
              {group.label}
            </Typography>
          </Box>

          {/* Rows */}
          {group.items.map((item, idx) => {
            const score = item.score ?? 0;
            const sc = getScoreColor(score);
            const isExpanded = expandedId === item._id;
            const parsed = isExpanded ? parseAnalysisText(item.analysisText) : null;
            const badge = isExpanded ? getProcessingBadge(item.analysisText) : null;
            const isLast = idx === group.items.length - 1 && gi === groups.length - 1;

            return (
              <Box key={item._id}>
                {/* Row */}
                <Box
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                  sx={{
                    px: 3, py: 1.8,
                    display: "flex", alignItems: "center", gap: 2,
                    cursor: "pointer",
                    borderBottom: `1px solid ${C.border}`,
                    bgcolor: isExpanded ? "#f7fcfa" : "transparent",
                    transition: "background 0.15s ease",
                    "&:hover": { bgcolor: "#f7fcfa" },
                  }}
                >
                  {/* Score circle */}
                  <Box
                    sx={{
                      width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                      bgcolor: `${sc}12`,
                      border: `2px solid ${sc}`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 900, color: sc, lineHeight: 1 }}>
                      {score}
                    </Typography>
                    <Typography sx={{ fontSize: 8.5, color: sc, fontWeight: 600, lineHeight: 1 }}>
                      /100
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Box flex={1} minWidth={0}>
                    <Typography sx={{ fontSize: 11.5, color: C.textMuted, mb: 0.25, fontWeight: 500 }}>
                      {formatDateTime(item.createdAt)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13.5, color: C.textPrimary, fontWeight: 500,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        lineHeight: 1.3,
                      }}
                    >
                      {getPreview(item.analysisText)}
                    </Typography>
                  </Box>

                  {/* Chevron + delete */}
                  <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
                    <Box
                      sx={{
                        fontSize: 14, color: C.textMuted, lineHeight: 1,
                        transform: isExpanded ? "rotate(180deg)" : "none",
                        transition: "transform 0.25s ease",
                        display: "flex", alignItems: "center",
                      }}
                    >
                      ▾
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
                      sx={{ color: C.textMuted, "&:hover": { color: C.danger, bgcolor: "rgba(226,75,74,0.08)" } }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Expanded panel */}
                <Box
                  sx={{
                    maxHeight: isExpanded ? 600 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <Box sx={{ px: 3, py: 2.5, bgcolor: "#f7fcfa", borderBottom: `1px solid ${C.border}` }}>
                    {/* Score label + processing badge */}
                    <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                      <Chip
                        label={getScoreLabel(score)}
                        size="small"
                        sx={{ bgcolor: `${sc}15`, color: sc, fontWeight: 700, fontSize: 11.5, border: `1px solid ${sc}30` }}
                      />
                      {badge && (
                        <Chip
                          label={badge.label}
                          size="small"
                          sx={{ bgcolor: `${badge.color}10`, color: badge.color, fontWeight: 700, fontSize: 11.5, border: `1px solid ${badge.color}30` }}
                        />
                      )}
                    </Stack>

                    {/* Parsed sections */}
                    {parsed?.classification && (
                      <Box mb={1.5}>
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: C.brand, textTransform: "uppercase", letterSpacing: "0.09em", mb: 0.5 }}>
                          Clasificación
                        </Typography>
                        <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.65 }}>
                          {parsed.classification}
                        </Typography>
                      </Box>
                    )}
                    {parsed?.explanation && (
                      <Box mb={1.5}>
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#1565C0", textTransform: "uppercase", letterSpacing: "0.09em", mb: 0.5 }}>
                          Motivo del puntaje
                        </Typography>
                        <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.65 }}>
                          {parsed.explanation}
                        </Typography>
                      </Box>
                    )}
                    {parsed?.guidance && (
                      <Box>
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#6A1B9A", textTransform: "uppercase", letterSpacing: "0.09em", mb: 0.5 }}>
                          Consejo
                        </Typography>
                        <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.65 }}>
                          {parsed.guidance}
                        </Typography>
                      </Box>
                    )}
                    {!parsed?.classification && !parsed?.explanation && (
                      <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {item.analysisText}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}

      {/* Ver más */}
      {remaining > 0 && (
        <Box
          sx={{
            px: 3, py: 2,
            borderTop: `1px solid ${C.border}`,
            bgcolor: C.surfaceAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => setVisibleCount((v) => v + PAGE)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13.5,
              color: C.brand,
              borderRadius: 999,
              px: 3, py: 0.8,
              "&:hover": { bgcolor: C.brandSurface },
            }}
          >
            Ver {Math.min(remaining, PAGE)} análisis más
            <Typography component="span" sx={{ fontSize: 12, color: C.textMuted, ml: 0.8, fontWeight: 500 }}>
              ({remaining} restantes)
            </Typography>
          </Button>
        </Box>
      )}
    </Paper>
  );
};

/* ────────────────────────────────────────────
   Nudge cruzado entrenamiento ↔ análisis
──────────────────────────────────────────── */
const CrossModuleNudge = ({ historyCount, loading }) => {
  const navigate = useNavigate();
  if (loading) return null;

  const mainSessions  = loadTPlan(T_MAIN_KEY)?.sessions?.length  || 0;
  const quickSessions = loadTPlan(T_QUICK_KEY)?.sessions?.length || 0;
  const totalSessions = mainSessions + quickSessions;

  // Analiza comida pero nunca entrenó → sugerir entrenamiento
  if (historyCount > 2 && totalSessions === 0) {
    return (
      <Paper elevation={0} sx={{
        mb: 4, borderRadius: 4,
        border: "1px solid rgba(11,94,85,0.14)",
        background: "linear-gradient(135deg, #f4faf8 0%, #fff 100%)",
        overflow: "hidden",
      }}>
        <Box sx={{ px: 3, py: 2.2, display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 3, flexShrink: 0,
            background: "linear-gradient(135deg, #BF360C 0%, #E64A19 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(191,54,12,0.28)",
          }}>
            <Typography sx={{ fontSize: 22, lineHeight: 1 }}>🏋️</Typography>
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#0F2420", mb: 0.2, lineHeight: 1.3 }}>
              ¡Empezá a entrenar para sumar más puntos!
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "#4A6B67", lineHeight: 1.45 }}>
              Analizás bien tu alimentación. Cada sesión de entrenamiento registrada suma <strong>+5 pts saludables</strong>.
            </Typography>
          </Box>
          <Button
            onClick={() => navigate("/training")}
            size="small"
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: 13,
              color: "#BF360C", borderRadius: 999, flexShrink: 0,
              border: "1.5px solid rgba(191,54,12,0.25)", px: 2, py: 0.8,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "rgba(191,54,12,0.06)", borderColor: "#BF360C" },
            }}
          >
            Ver planes →
          </Button>
        </Box>
      </Paper>
    );
  }

  // Entrenó pero nunca analizó comida → sugerir análisis
  if (totalSessions > 0 && historyCount === 0) {
    return (
      <Paper elevation={0} sx={{
        mb: 4, borderRadius: 4,
        border: "1px solid rgba(11,94,85,0.14)",
        background: "linear-gradient(135deg, #f4faf8 0%, #fff 100%)",
        overflow: "hidden",
      }}>
        <Box sx={{ px: 3, py: 2.2, display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 3, flexShrink: 0,
            background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(11,94,85,0.28)",
          }}>
            <Typography sx={{ fontSize: 22, lineHeight: 1 }}>🔍</Typography>
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#0F2420", mb: 0.2, lineHeight: 1.3 }}>
              ¡Analizá tus alimentos para potenciar tus resultados!
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "#4A6B67", lineHeight: 1.45 }}>
              Estás entrenando bien. Cada análisis con puntaje ≥ 50/100 suma <strong>+5 pts saludables</strong>.
            </Typography>
          </Box>
          <Button
            onClick={() => navigate("/capture")}
            size="small"
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: 13,
              color: "#0B5E55", borderRadius: 999, flexShrink: 0,
              border: "1.5px solid rgba(11,94,85,0.22)", px: 2, py: 0.8,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "rgba(11,94,85,0.06)", borderColor: "#0B5E55" },
            }}
          >
            Analizar →
          </Button>
        </Box>
      </Paper>
    );
  }

  return null;
};

/* ────────────────────────────────────────────
   Entrenamiento Widget
──────────────────────────────────────────── */

const T_MAIN_KEY  = "nutrismart_training_main";
const T_QUICK_KEY = "nutrismart_training_quick";

const TIPO_META = {
  "Calistenia":        { color: "#1565C0", bg: "#E3F2FD", emoji: "🤸" },
  "Hipertrofia":       { color: "#BF360C", bg: "#FBE9E7", emoji: "💪" },
  "Fit":               { color: "#6A1B9A", bg: "#F3E5F5", emoji: "✨" },
  "Ejercicio en Casa": { color: "#2E7D32", bg: "#E8F5E9", emoji: "🏠" },
  "Running":           { color: "#E65100", bg: "#FFF3E0", emoji: "🏃" },
};

const loadTPlan = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };

const EntrenamientoWidget = () => {
  const navigate = useNavigate();

  const mainData  = loadTPlan(T_MAIN_KEY);
  const quickData = loadTPlan(T_QUICK_KEY);
  const hasMain   = !!mainData?.plan;
  const hasQuick  = !!quickData?.plan;

  // Plan a mostrar: principal > rápido > nada
  const activeData = hasMain ? mainData : (hasQuick ? quickData : null);
  const isQuick    = !hasMain && hasQuick;

  /* ── Sin plan activo: banner promo ── */
  if (!activeData) {
    return (
      <Paper elevation={0} sx={{
        mb: 4, borderRadius: 5, overflow: "hidden",
        border: `1px solid ${C.borderStrong}`, boxShadow: shadow.lg,
      }}>
        <Box sx={{
          p: { xs: 3.5, md: 4.5 },
          background: "linear-gradient(145deg, #1a2f2a 0%, #0d3d34 50%, #0B5E55 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {/* blobs */}
          <Box sx={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", bottom: -50, left: -30, width: 160, height: 160, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

          <Box sx={{ position: "relative" }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <Typography sx={{ fontSize: 30 }}>🏋️</Typography>
              <Box>
                <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 900, color: "#fff", letterSpacing: "-0.7px", lineHeight: 1 }}>
                  Entrenamiento
                </Typography>
                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)", mt: 0.2 }}>
                  Plan personalizado con IA
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.2} mb={3.5}>
              {[
                "Calistenia, Hipertrofia, Running y más",
                "Seguimiento de sesiones con progresión",
                "Tips semanales personalizados con IA",
              ].map((f) => (
                <Stack key={f} direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "rgba(46,204,113,0.25)", border: "1px solid rgba(46,204,113,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 10, color: "#2ECC71" }}>✓</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>{f}</Typography>
                </Stack>
              ))}
            </Stack>

            <Button variant="contained" onClick={() => navigate("/training")} sx={{
              bgcolor: "#fff", color: "#0B5E55", borderRadius: 999,
              px: 3.5, py: 1.3, textTransform: "none", fontWeight: 800, fontSize: 14.5,
              boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
              "&:hover": { bgcolor: "#edf8f5", boxShadow: "0 8px 28px rgba(0,0,0,0.22)", transform: "translateY(-1px)" },
              transition: "all 0.2s ease",
            }}>
              Comenzar con un plan de entrenamiento →
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  }

  /* ── Con plan activo: resume card ── */
  const cfg      = activeData.config || {};
  const plan     = activeData.plan   || {};
  const elapsed  = Math.floor((Date.now() - new Date(activeData.startDate)) / 86400000);
  const total    = activeData.totalDays || 1;
  const pct      = Math.min(100, Math.round((elapsed / total) * 100));
  const week     = Math.max(1, Math.ceil((elapsed + 1) / 7));
  const sessCount = activeData.sessions?.length || 0;
  const meta     = TIPO_META[cfg.tipo] || { color: "#0B5E55", bg: "#E6F5F3", emoji: "🏋️" };

  return (
    <Paper elevation={0} sx={{
      mb: 4, borderRadius: 5, overflow: "hidden",
      border: `1.5px solid ${meta.color}30`,
      boxShadow: `0 8px 32px ${meta.color}18`,
    }}>
      <Box sx={{
        px: { xs: 3, md: 4 }, py: { xs: 2.8, md: 3.5 },
        background: `linear-gradient(135deg, ${meta.color}12 0%, #fff 60%)`,
      }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2.5}
        >
          {/* ── Info ── */}
          <Box flex={1} minWidth={0}>
            {/* Badge */}
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.8,
              px: 1.5, py: 0.45, borderRadius: 999,
              bgcolor: `${meta.color}14`, border: `1px solid ${meta.color}30`, mb: 1.2,
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: meta.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: meta.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {isQuick ? "⚡ Plan rápido activo" : "🏋️ Entrenamiento activo"}
              </Typography>
            </Box>

            {/* Título del plan */}
            <Typography sx={{ fontSize: { xs: 17, sm: 19 }, fontWeight: 900, color: "#0F2420", letterSpacing: "-0.5px", mb: 0.8, lineHeight: 1.25 }}>
              {plan.planTitle || `${cfg.tipo} — ${cfg.duracion}`}
            </Typography>

            {/* Chips de contexto */}
            <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap mb={total > 1 ? 2 : 0}>
              <Chip label={`${meta.emoji} ${cfg.tipo}`} size="small"
                sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.color}25` }} />
              {cfg.lugar && (
                <Chip label={cfg.lugar} size="small"
                  sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67" }} />
              )}
              {total > 1 && (
                <Chip label={`Semana ${week}`} size="small"
                  sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "rgba(11,94,85,0.07)", color: "#4A6B67" }} />
              )}
              {sessCount > 0 && (
                <Chip label={`${sessCount} sesión${sessCount > 1 ? "es" : ""} registrada${sessCount > 1 ? "s" : ""}`} size="small"
                  sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: `${meta.color}12`, color: meta.color }} />
              )}
              {hasMain && hasQuick && (
                <Chip label="⚡ + plan rápido" size="small"
                  sx={{ height: 20, fontSize: 11, fontWeight: 600, bgcolor: "#FFF3E0", color: "#E65100" }} />
              )}
            </Stack>

            {/* Barra de progreso (solo planes > 1 día) */}
            {total > 1 && (
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.6}>
                  <Typography sx={{ fontSize: 11.5, color: "#4A6B67", fontWeight: 600 }}>
                    {Math.min(elapsed, total)} de {total} días
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: meta.color }}>
                    {pct}% completado
                  </Typography>
                </Stack>
                <Box sx={{ height: 7, borderRadius: 3.5, bgcolor: `${meta.color}14`, overflow: "hidden" }}>
                  <Box sx={{
                    height: "100%", width: `${pct}%`, borderRadius: 3.5,
                    background: `linear-gradient(90deg, ${meta.color} 0%, ${meta.color}BB 100%)`,
                    transition: "width 1s ease",
                  }} />
                </Box>
              </Box>
            )}
          </Box>

          {/* ── CTA ── */}
          <Button
            variant="contained"
            onClick={() => navigate("/training")}
            sx={{
              background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}CC 100%)`,
              borderRadius: 999, px: { xs: 3, sm: 3.5 }, py: 1.5,
              textTransform: "none", fontWeight: 800, fontSize: { xs: 14, sm: 15 },
              boxShadow: `0 6px 20px ${meta.color}40`,
              flexShrink: 0, whiteSpace: "nowrap",
              "&:hover": { transform: "translateY(-2px)", boxShadow: `0 10px 28px ${meta.color}55` },
              transition: "all 0.22s ease",
            }}
          >
            Continuar entrenamiento →
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

/* ────────────────────────────────────────────
   Recetas YA Banner
──────────────────────────────────────────── */
const MODALIDADES_PREVIEW = [
  { id: "Fit",         emoji: "💚", label: "Fit",         color: "#2E7D32", bg: "#E8F5E9" },
  { id: "Hipertrofia", emoji: "💪", label: "Hipertrofia", color: "#BF360C", bg: "#FBE9E7" },
  { id: "Rápidas",     emoji: "⚡", label: "Rápidas",     color: "#1565C0", bg: "#E3F2FD" },
];

const RecetasYABanner = () => {
  const navigate = useNavigate();
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: 5,
        overflow: "hidden",
        border: `1px solid ${C.borderStrong}`,
        boxShadow: shadow.lg,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" },
      }}
    >
      {/* ── Columna izquierda: contexto ── */}
      <Box
        sx={{
          p: { xs: 3.5, md: 5 },
          background: "linear-gradient(145deg, #0B5E55 0%, #0d7268 60%, #0f8a7c 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* blob decorativo */}
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -60, left: -30, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        <Box sx={{ position: "relative" }}>
          {/* Badge */}
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8, px: 1.5, py: 0.5, borderRadius: 999, bgcolor: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.20)", mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#2ECC71" }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Nuevo módulo
            </Typography>
          </Box>

          {/* Title */}
          <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
            <Typography sx={{ fontSize: 32 }}>🍽️</Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 900, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1 }}>
              Recetas YA
            </Typography>
          </Stack>

          <Typography sx={{ fontSize: 14.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, mb: 3, maxWidth: 320 }}>
            La IA que cocina para vos. Elegís el tipo de plato y el momento del día, y te da tres opciones con ingredientes y pasos al instante.
          </Typography>

          {/* Feature list */}
          <Stack spacing={1.2} mb={3.5}>
            {[
              "Fit, Hipertrofia, Rápidas o Desayunos",
              "Desayuno, Almuerzo, Merienda, Cena o Snack",
              "Ingredientes + pasos detallados con IA",
            ].map((f) => (
              <Stack key={f} direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "rgba(46,204,113,0.25)", border: "1px solid rgba(46,204,113,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 10, color: "#2ECC71" }}>✓</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{f}</Typography>
              </Stack>
            ))}
          </Stack>

          <Button
            variant="contained"
            onClick={() => navigate("/recipes")}
            sx={{
              bgcolor: "#fff",
              color: "#0B5E55",
              borderRadius: 999,
              px: 3.5, py: 1.3,
              textTransform: "none",
              fontWeight: 800,
              fontSize: 14.5,
              boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
              "&:hover": { bgcolor: "#edf8f5", boxShadow: "0 8px 28px rgba(0,0,0,0.22)", transform: "translateY(-1px)" },
              transition: "all 0.2s ease",
            }}
          >
            Descubrir recetas →
          </Button>
        </Box>
      </Box>

      {/* ── Columna derecha: visual ── */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          bgcolor: "#F7FBF9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
          Modalidades disponibles
        </Typography>

        {/* Modalidad cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
          {MODALIDADES_PREVIEW.map((m) => (
            <Box
              key={m.label}
              onClick={() => navigate("/recipes", { state: { modalidad: m.id } })}
              sx={{
                px: 2, py: 1.8, borderRadius: 3.5, cursor: "pointer",
                bgcolor: m.bg,
                border: `1.5px solid ${m.color}25`,
                transition: "all 0.18s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: `0 6px 18px ${m.color}25`, borderColor: `${m.color}60` },
              }}
            >
              <Typography sx={{ fontSize: 22, lineHeight: 1, mb: 0.6 }}>{m.emoji}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: m.color, letterSpacing: "-0.2px" }}>{m.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Momentos chips */}
        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
            Para cada momento
          </Typography>
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            {["🌅 Desayuno", "☀️ Almuerzo", "🍎 Merienda", "🌙 Cena", "🫐 Snack"].map((m) => (
              <Chip
                key={m}
                label={m}
                size="small"
                onClick={() => navigate("/recipes")}
                sx={{ bgcolor: "#fff", border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 12, color: C.textSecondary, cursor: "pointer", "&:hover": { bgcolor: C.brandSurface, borderColor: C.brandMuted } }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

/* ────────────────────────────────────────────
   Panel preferencias de notificaciones
──────────────────────────────────────────── */
const NotifPrefsPanel = () => {
  const { user } = useNutrition();
  const token = typeof window !== "undefined" ? localStorage.getItem("nutrismartToken") : null;

  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token || !open) return;
    fetch(`${API_URL}/api/user/notif-prefs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => d.notifPrefs && setPrefs(d.notifPrefs))
      .catch(() => {});
  }, [token, open]);

  const toggle = async (key) => {
    if (!prefs || saving) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    try {
      const r = await fetch(`${API_URL}/api/user/notif-prefs`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next[key] }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.notifPrefs) setPrefs(d.notifPrefs);
      }
    } catch { }
    setSaving(false);
  };

  const Row = ({ label, icon, fieldKey, disabled }) => {
    const active = prefs ? (prefs.paused ? false : prefs[fieldKey]) : true;
    return (
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ py: 1.2, borderBottom: `1px solid ${C.border}`, "&:last-child": { borderBottom: "none" } }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Typography sx={{ fontSize: 18 }}>{icon}</Typography>
          <Typography sx={{ fontSize: 13, color: disabled ? C.textMuted : C.textPrimary, fontWeight: 500 }}>
            {label}
          </Typography>
        </Stack>
        <Box
          onClick={() => !disabled && toggle(fieldKey)}
          sx={{
            width: 44, height: 24, borderRadius: 12,
            bgcolor: active && !disabled ? C.brand : C.border,
            cursor: disabled ? "not-allowed" : "pointer",
            position: "relative",
            transition: "background 0.22s",
            opacity: saving ? 0.6 : 1,
            "&::after": {
              content: '""',
              position: "absolute",
              top: 3, left: active && !disabled ? 23 : 3,
              width: 18, height: 18, borderRadius: "50%",
              background: "#fff",
              transition: "left 0.22s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            },
          }}
        />
      </Stack>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 4,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row" alignItems="center" justifyContent="space-between"
        onClick={() => setOpen((v) => !v)}
        sx={{
          px: 3, py: 2,
          cursor: "pointer",
          bgcolor: open ? C.brandSurface : C.surface,
          transition: "background 0.2s",
          "&:hover": { bgcolor: C.brandSurface },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography sx={{ fontSize: 18 }}>🔔</Typography>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>
              Notificaciones por email
            </Typography>
            {prefs && (
              <Typography sx={{ fontSize: 11, color: C.textMuted, mt: 0.2 }}>
                {prefs.paused ? "Pausadas" : "Activas"}
              </Typography>
            )}
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 13, color: C.textMuted, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          ▾
        </Typography>
      </Stack>

      {open && (
        <Box sx={{ px: 3, pb: 2.5, pt: 1 }}>
          {!prefs ? (
            <Typography sx={{ fontSize: 13, color: C.textMuted, py: 1.5 }}>Cargando preferencias…</Typography>
          ) : (
            <>
              {/* Master pause */}
              <Stack direction="row" alignItems="center" justifyContent="space-between"
                sx={{ py: 1.5, mb: 1, borderBottom: `2px solid ${C.border}` }}>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <Typography sx={{ fontSize: 18 }}>⏸️</Typography>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                      Pausar todos los emails
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: C.textMuted }}>
                      Ninguna notificación llegará mientras esté activado
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  onClick={() => toggle("paused")}
                  sx={{
                    width: 44, height: 24, borderRadius: 12,
                    bgcolor: prefs.paused ? "#E24B4A" : C.border,
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.22s",
                    opacity: saving ? 0.6 : 1,
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 3, left: prefs.paused ? 23 : 3,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.22s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                    },
                  }}
                />
              </Stack>

              <Row label="Email de bienvenida"       icon="👋" fieldKey="welcome"  disabled={prefs.paused} />
              <Row label="Resultado de cada análisis" icon="🔍" fieldKey="analysis" disabled={prefs.paused} />
              <Row label="Sesión de entrenamiento"    icon="🏋️" fieldKey="training" disabled={prefs.paused} />

              <Typography sx={{ fontSize: 11, color: C.textMuted, mt: 1.5, lineHeight: 1.6 }}>
                Los emails se envían solo si la notificación correspondiente está activa y el tipo no está pausado.
              </Typography>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

/* ────────────────────────────────────────────
   Dashboard principal
──────────────────────────────────────────── */
const Dashboard = () => {
  const { user, userData, updateUserData, loadingUserData } = useNutrition();

  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.email === "raccoonitweb@gmail.com";

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [displayPoints, setDisplayPoints] = useState(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    sexo: "Femenino",
    edad: "",
    actividad: "Moderada",
    peso: "",
    altura: "",
  });

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + (item.score ?? 0), 0) /
            history.length,
        )
      : 0;

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const datePart = date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} · ${timePart}`;
  };

  useEffect(() => {
    if (userData?.healthyPoints != null) {
      setDisplayPoints(userData.healthyPoints);
    }
  }, [userData?.healthyPoints]);

  useEffect(() => {
    if (!userData) return;
    setProfileForm({
      sexo: userData.sexo || "Femenino",
      edad: userData.edad || "",
      actividad: userData.actividad || "Moderada",
      peso: userData.peso || "",
      altura: userData.altura || "",
    });
  }, [userData]);

  const fetchHistory = useCallback(async () => {
    const identifier = user?._id || user?.googleId;
    if (!identifier) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("nutrismartToken");
      const res = await axios.get(
        `${API_URL}/api/user/analysis/${identifier}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.googleId]);

  useEffect(() => {
    const identifier = user?._id || user?.googleId;
    if (!identifier) return;
    if (userData?.profileCompleted !== true) {
      navigate("/profile", { replace: true });
      return;
    }
    fetchHistory();
  }, [
    fetchHistory,
    navigate,
    user?._id,
    user?.googleId,
    userData?.profileCompleted,
    location.key,
    historyRefreshToken,
  ]);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?._id && !user?.googleId) return;
    setSavingProfile(true);
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, googleId: user.googleId, ...profileForm }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error || "Error guardando perfil");
      updateUserData({ ...profileForm, profileCompleted: true });
      setEditingProfile(false);
      setHistoryRefreshToken((prev) => prev + 1);
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!analysisId) return;
    try {
      const token = localStorage.getItem("nutrismartToken");
      const response = await fetch(
        `${API_URL}/api/user/analysis/${analysisId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error || "Error eliminando análisis");
      setHistory((prev) => prev.filter((item) => item._id !== analysisId));
    } catch (err) {
      console.error("Error eliminando historial:", err);
    }
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (loadingUserData) {
    return (
      <Box
        sx={{
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: C.brandSurface,
            border: `3px solid ${C.brandMuted}`,
            borderTopColor: C.brand,
            animation: "spin 0.8s linear infinite",
            "@keyframes spin": { to: { transform: "rotate(360deg)" } },
          }}
        />
        <Typography sx={{ color: C.textMuted, fontSize: 14 }}>
          Cargando tu perfil…
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.surfaceAlt,
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 3, md: 5 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      {/* ── HEADER ──────────────────────────────── */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={5}
        gap={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={user?.picture}
            alt={user?.name}
            sx={{
              width: 52,
              height: 52,
              bgcolor: C.brand,
              fontSize: 18,
              fontWeight: 700,
              boxShadow: `0 0 0 3px ${C.brandMuted}`,
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontSize: 13,
                color: C.textMuted,
                fontWeight: 500,
                mb: 0.2,
              }}
            >
              {greeting()},
            </Typography>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: C.textPrimary,
                lineHeight: 1.2,
              }}
            >
              {firstName || "Usuario"}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
        >
          <Chip
            icon={
              <AccessTimeRoundedIcon sx={{ fontSize: "14px !important" }} />
            }
            label={`${now.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })} · ${now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`}
            size="small"
            sx={{
              bgcolor: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
              fontSize: 12,
              fontWeight: 500,
              boxShadow: shadow.sm,
            }}
          />
          {isAdmin && (
            <Button
              variant="outlined"
              startIcon={<AdminPanelSettingsOutlinedIcon />}
              onClick={() => navigate("/admin")}
              size="small"
              sx={{
                borderRadius: 999,
                textTransform: "none",
                borderColor: C.brand,
                color: C.brand,
                fontWeight: 600,
                fontSize: 13,
                "&:hover": { bgcolor: C.brandSurface },
              }}
            >
              Admin
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ── PUNTOS SALUDABLES ───────────────────── */}
      {(() => {
        const pts   = displayPoints ?? 0;
        const mood  = getMood(pts);
        const meta  = MOOD_META[mood];
        const level = pts < 50 ? { icon: "🌱", name: "Inicio"    }
                    : pts < 150? { icon: "🥗", name: "Saludable" }
                    : pts < 300? { icon: "💪", name: "Activo"    }
                    :            { icon: "🏆", name: "Experto"   };
        return (
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 4,
              overflow: "hidden",
              border: "1.5px solid rgba(46,204,113,0.20)",
              boxShadow: "0 4px 24px rgba(11,94,85,0.14)",
              background: "linear-gradient(135deg, #0B5E55 0%, #0f7a6e 100%)",
              position: "relative",
              minHeight: 160,
              "@keyframes breatheMascot": {
                "0%,100%": { transform: "translateY(0px)" },
                "50%":     { transform: "translateY(-6px)" },
              },
              "@keyframes moodPop": {
                "0%":   { transform: "scale(0.85) translateY(8px)", opacity: 0 },
                "65%":  { transform: "scale(1.04) translateY(-4px)", opacity: 1 },
                "100%": { transform: "scale(1) translateY(0)",      opacity: 1 },
              },
            }}
          >
            {/* Blobs decorativos */}
            <Box sx={{ position: "absolute", top: -30, right: 160, width: 140, height: 140, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", bottom: -40, right: 80, width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

            <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "stretch", gap: 2, position: "relative" }}>

              {/* Info izquierda */}
              <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.09em", mb: 0.3 }}>
                  Puntos saludables
                </Typography>
                <Typography sx={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-2px" }}>
                  {pts}
                </Typography>

                <Box sx={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 0.8, mt: 0.8, px: 1.5, py: 0.4, borderRadius: 999, bgcolor: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: meta.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{meta.label}</Typography>
                </Box>

                <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.50)", mt: 1 }}>
                  
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                  <Typography sx={{ fontSize: 18 }}>{level.icon}</Typography>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.50)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1 }}>Nivel</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{level.name}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Avatar — ventana: solo cintura para arriba visible */}
              <Box
                key={getAvatarState(pts)}
                sx={{
                  position: "absolute",
                  right: { xs: -160, sm: -70 },
                  bottom: { xs: "-255%", sm: "-260%" },
                  animation: "moodPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both, breatheMascot 3.5s 1s ease-in-out infinite",
                }}
              >
                <AvatarMascot
                  points={pts}
                  sexo={userData?.sexo || profileForm?.sexo}
                  showLabel={false}
                />
              </Box>
            </Box>
          </Paper>
        );
      })()}

      {/* ── STATS RÁPIDAS ────────────────────────── */}
      {history.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            mb: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              boxShadow: shadow.sm,
              bgcolor: C.surface,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Puntaje promedio
            </Typography>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 900,
                color: C.brand,
                lineHeight: 1,
              }}
            >
              {averageScore}
              <Typography
                component="span"
                sx={{ fontSize: 14, fontWeight: 500, color: C.textMuted }}
              >
                /100
              </Typography>
            </Typography>
            <ScoreBadge score={averageScore} />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              boxShadow: shadow.sm,
              bgcolor: C.surface,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Análisis realizados
            </Typography>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 900,
                color: C.textPrimary,
                lineHeight: 1,
              }}
            >
              {history.length}
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.textMuted }}>
              en total
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
              boxShadow: shadow.sm,
              bgcolor: C.surface,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              gridColumn: { xs: "1 / -1", sm: "auto" },
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Mejor puntaje
            </Typography>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 900,
                color: C.success,
                lineHeight: 1,
              }}
            >
              {Math.max(...history.map((h) => h.score ?? 0))}
              <Typography
                component="span"
                sx={{ fontSize: 14, fontWeight: 500, color: C.textMuted }}
              >
                /100
              </Typography>
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.textMuted }}>
              récord personal
            </Typography>
          </Paper>
        </Box>
      )}

      {/* ── NUDGE CRUZADO ───────────────────────── */}
      <CrossModuleNudge historyCount={history.length} loading={loading} />

      {/* ── PERFIL ──────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 5,
          border: `1px solid ${C.border}`,
          boxShadow: shadow.md,
          overflow: "hidden",
          bgcolor: C.surface,
        }}
      >
        {/* Header de sección */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 2.5,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: C.surfaceAlt,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2.5,
                bgcolor: C.brandSurface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonOutlineRoundedIcon sx={{ fontSize: 18, color: C.brand }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}
              >
                Perfil personal
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                Tus datos físicos
              </Typography>
            </Box>
          </Stack>

          {!editingProfile && (
            <Button
              startIcon={<EditOutlinedIcon />}
              onClick={() => setEditingProfile(true)}
              size="small"
              sx={{
                textTransform: "none",
                color: C.brand,
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 999,
                px: 2,
                "&:hover": { bgcolor: C.brandSurface },
              }}
            >
              Editar
            </Button>
          )}
        </Box>

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          {!editingProfile ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(5, 1fr)",
                },
                gap: 1.5,
              }}
            >
              <StatPill
                icon={PersonOutlineRoundedIcon}
                label="Género"
                value={profileForm.sexo}
              />
              <StatPill
                icon={CakeOutlinedIcon}
                label="Edad"
                value={profileForm.edad ? `${profileForm.edad} años` : null}
              />
              <StatPill
                icon={FlashOnOutlinedIcon}
                label="Actividad"
                value={profileForm.actividad}
                accent
              />
              <StatPill
                icon={MonitorWeightOutlinedIcon}
                label="Peso"
                value={profileForm.peso ? `${profileForm.peso} kg` : null}
              />
              <StatPill
                icon={HeightOutlinedIcon}
                label="Altura"
                value={profileForm.altura ? `${profileForm.altura} cm` : null}
              />
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  mb: 2,
                }}
              >
                <TextField
                  select
                  name="sexo"
                  label="Género"
                  value={profileForm.sexo}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={inputSx}
                >
                  {["Femenino", "Masculino", "Otro"].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="edad"
                  label="Edad"
                  type="number"
                  value={profileForm.edad}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={inputSx}
                />

                <TextField
                  select
                  name="actividad"
                  label="Actividad física"
                  value={profileForm.actividad}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={inputSx}
                >
                  {["Nula", "Moderada", "Intensa", "Profesional"].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="peso"
                  label="Peso (kg)"
                  type="number"
                  value={profileForm.peso}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={inputSx}
                />

                <TextField
                  name="altura"
                  label="Altura (cm)"
                  type="number"
                  value={profileForm.altura}
                  onChange={handleChange}
                  size="small"
                  sx={{ ...inputSx, gridColumn: { xs: "auto", sm: "1 / -1" } }}
                />
              </Box>

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={savingProfile ? null : <CheckRoundedIcon />}
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  sx={{
                    borderRadius: 999,
                    bgcolor: C.brand,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    boxShadow: "none",
                    "&:hover": { bgcolor: C.brandLight, boxShadow: "none" },
                  }}
                >
                  {savingProfile ? "Guardando…" : "Guardar"}
                </Button>

                <Button
                  startIcon={<CloseRoundedIcon />}
                  onClick={() => setEditingProfile(false)}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    color: C.textSecondary,
                    fontWeight: 600,
                    px: 3,
                    "&:hover": { bgcolor: C.surfaceAlt },
                  }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Paper>

      {/* ── TEST CARD (IMC u otro) ───────────────── */}
      <Box mb={4}>
        <TestCard
          peso={profileForm.peso}
          altura={profileForm.altura}
          sexo={profileForm.sexo}
          edad={profileForm.edad}
        />
      </Box>

      {/* ── MEMBRESÍA ───────────────────────────── */}
      <Box mb={4}>
        <SubscriptionWidget />
      </Box>

      {/* ── RANKING GLOBAL ──────────────────────── */}
      <LeaderboardWidget />

      {/* ── ENTRENAMIENTO ───────────────────────── */}
      <EntrenamientoWidget />

      {/* ── RECETAS YA ──────────────────────────── */}
      <RecetasYABanner />

      {/* ── NOTIFICACIONES ──────────────────────── */}
      <NotifPrefsPanel />

      {/* ── CTA NUEVO ANÁLISIS ──────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 5,
          borderRadius: 5,
          border: `1px solid ${C.borderStrong}`,
          boxShadow: shadow.lg,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${C.brand} 0%, ${C.brandLight} 100%)`,
          position: "relative",
        }}
      >
        {/* Decorative circle */}
        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 40,
            bottom: -60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ p: { xs: 3, md: 4 }, position: "relative" }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 0.5,
              }}
            >
              NUI App
            </Typography>
            <Typography
              sx={{ fontSize: 20, fontWeight: 800, color: "#fff", mb: 0.5 }}
            >
              Analizá tu próximo producto
            </Typography>
            <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
              Escaneá el código o la etiqueta nutricional
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => navigate("/capture")}
            sx={{
              bgcolor: "#fff",
              color: C.brand,
              borderRadius: 999,
              px: 4,
              py: 1.4,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              flexShrink: 0,
              "&:hover": {
                bgcolor: C.brandSurface,
                boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
              },
            }}
          >
            Nuevo análisis
          </Button>
        </Stack>
      </Paper>

      {/* ── HISTORIAL ───────────────────────────── */}

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `3px solid ${C.brandMuted}`,
              borderTopColor: C.brand,
              animation: "spin 0.8s linear infinite",
              "@keyframes spin": { to: { transform: "rotate(360deg)" } },
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography sx={{ color: C.textMuted, fontSize: 14 }}>
            Cargando historial…
          </Typography>
        </Box>
      ) : history.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 5,
            border: `1px dashed ${C.brandMuted}`,
            bgcolor: C.brandSurface,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: C.brandMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <TrendingUpRoundedIcon sx={{ fontSize: 28, color: C.brand }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              color: C.textPrimary,
              mb: 0.5,
            }}
          >
            Todavía no realizaste análisis
          </Typography>
          <Typography sx={{ fontSize: 14, color: C.textMuted, mb: 3 }}>
            Comenzá escaneando el primer producto
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/capture")}
            sx={{
              bgcolor: C.brand,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              boxShadow: "none",
              "&:hover": { bgcolor: C.brandLight, boxShadow: "none" },
            }}
          >
            Empezar ahora
          </Button>
        </Paper>
      ) : (
        <HistoryList
          history={history}
          onDelete={handleDeleteAnalysis}
          formatDateTime={formatDateTime}
        />
      )}

      {/* Spacer bottom */}
      <Box sx={{ height: 40 }} />
    </Box>
  );
};

/* ────────────────────────────────────────────
   Helpers de estilos
──────────────────────────────────────────── */
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: C.brand },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: C.brand,
      borderWidth: 1.5,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: C.brand },
};

export default Dashboard;
