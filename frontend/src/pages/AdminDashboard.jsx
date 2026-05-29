import { useEffect, useState, useMemo } from "react";
import AdminLogs from "../components/AdminLogs.jsx";
import {
  Box, Typography, Stack, Paper,
  TextField, InputAdornment, IconButton,
  Chip, Avatar, Button, LinearProgress,
  Drawer, Divider, Tooltip, CircularProgress, Alert,
} from "@mui/material";
import { DataGrid }    from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import { API_URL }      from "../config/api";

import DeleteOutlineRoundedIcon       from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon              from "@mui/icons-material/SearchRounded";
import PeopleAltOutlinedIcon          from "@mui/icons-material/PeopleAltOutlined";
import PersonAddAltOutlinedIcon       from "@mui/icons-material/PersonAddAltOutlined";
import AnalyticsOutlinedIcon          from "@mui/icons-material/AnalyticsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArrowBackRoundedIcon           from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon             from "@mui/icons-material/RefreshRounded";
import DiamondOutlinedIcon            from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon   from "@mui/icons-material/WorkspacePremiumOutlined";
import RocketLaunchRoundedIcon        from "@mui/icons-material/RocketLaunchRounded";
import AttachMoneyRoundedIcon         from "@mui/icons-material/AttachMoneyRounded";
import BarChartRoundedIcon            from "@mui/icons-material/BarChartRounded";
import CloseRoundedIcon               from "@mui/icons-material/CloseRounded";
import CalendarTodayOutlinedIcon      from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlinedIcon        from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon             from "@mui/icons-material/CancelOutlined";
import AccessTimeOutlinedIcon         from "@mui/icons-material/AccessTimeOutlined";
import HistoryRoundedIcon             from "@mui/icons-material/HistoryRounded";
import ReceiptLongOutlinedIcon        from "@mui/icons-material/ReceiptLongOutlined";
import CardGiftcardRoundedIcon        from "@mui/icons-material/CardGiftcardRounded";
import CheckRoundedIcon               from "@mui/icons-material/CheckRounded";

/* ─── Tokens ──────────────────────────────────────────────── */
const C = {
  brand:        "#0B5E55",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F7F9F8",
  border:       "rgba(11,94,85,0.10)",
  borderMed:    "rgba(11,94,85,0.20)",
  text:         "#0F2420",
  textSec:      "#4A6B67",
  textMuted:    "#8AADAA",
  danger:       "#E24B4A",
  dangerSurf:   "rgba(226,75,74,0.07)",
  silver:       "#71879C",
  silverSurf:   "#EEF2F5",
  gold:         "#C9952A",
  goldSurf:     "#FDF6E3",
};

const shadow = {
  sm: "0 1px 3px rgba(11,94,85,0.07)",
  md: "0 4px 14px rgba(11,94,85,0.09), 0 2px 4px rgba(11,94,85,0.05)",
  lg: "0 12px 32px rgba(11,94,85,0.11), 0 4px 8px rgba(11,94,85,0.06)",
};

const fmtARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDatetime = (d) =>
  d ? new Date(d).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

/* ─── Plan helpers ───────────────────────────────────────── */
const PLAN_META = {
  free:   { label: "Free",   color: C.brand,  bg: C.brandSurface, Icon: RocketLaunchRoundedIcon },
  silver: { label: "Silver", color: C.silver, bg: C.silverSurf,   Icon: DiamondOutlinedIcon },
  gold:   { label: "Gold",   color: C.gold,   bg: C.goldSurf,     Icon: WorkspacePremiumOutlinedIcon },
};

const STATUS_META = {
  active:    { label: "Activa",    color: "#2ECC71", bg: "rgba(46,204,113,0.12)", Icon: CheckCircleOutlinedIcon },
  cancelled: { label: "Cancelada", color: C.danger,  bg: C.dangerSurf,            Icon: CancelOutlinedIcon },
  expired:   { label: "Expirada",  color: C.textMuted, bg: "rgba(0,0,0,0.05)",    Icon: AccessTimeOutlinedIcon },
  pending:   { label: "Pendiente", color: C.gold,    bg: C.goldSurf,              Icon: AccessTimeOutlinedIcon },
};

/* ─── KPI Card ───────────────────────────────────────────── */
const KpiCard = ({ label, value, sub, icon: Icon, color, bgColor, borderColor }) => {
  const bg  = bgColor     ?? C.surface;
  const brd = borderColor ?? C.border;
  const col = color       ?? C.brand;
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 4, border: `1px solid ${brd}`,
      bgcolor: bg, boxShadow: shadow.md, position: "relative", overflow: "hidden",
      transition: "box-shadow 0.2s", "&:hover": { boxShadow: shadow.lg },
    }}>
      <Box sx={{ position: "absolute", right: -12, top: -12, width: 64, height: 64,
        borderRadius: "50%", bgcolor: `${col}12`, pointerEvents: "none" }} />
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box sx={{ width: 38, height: 38, borderRadius: 2.5,
          bgcolor: `${col}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon sx={{ fontSize: 19, color: col }} />
        </Box>
      </Stack>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted,
        textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 32, fontWeight: 900, color: col, lineHeight: 1 }}>
        {value ?? "—"}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: 11.5, color: C.textMuted, mt: 0.5 }}>{sub}</Typography>
      )}
    </Paper>
  );
};

/* ─── Section Header ─────────────────────────────────────── */
const SectionHeader = ({ title, subtitle }) => (
  <Box mb={2.5}>
    <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{ fontSize: 12, color: C.textMuted, mt: 0.3 }}>{subtitle}</Typography>
    )}
  </Box>
);

/* ─── Plan Card ──────────────────────────────────────────── */
const PlanCard = ({ icon: Icon, name, color, bgColor, active, rows }) => (
  <Paper elevation={0} sx={{
    borderRadius: 4, border: `1.5px solid ${color}25`,
    bgcolor: bgColor, boxShadow: shadow.md, overflow: "hidden",
    transition: "box-shadow 0.2s", "&:hover": { boxShadow: shadow.lg },
  }}>
    <Stack direction="row" alignItems="center" spacing={1.5}
      sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${color}18` }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2.5,
        bgcolor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon sx={{ fontSize: 18, color }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.text }}>Plan {name}</Typography>
        <Typography sx={{ fontSize: 11, color: C.textMuted }}>activos ahora</Typography>
      </Box>
      <Box sx={{ ml: "auto !important" }}>
        <Typography sx={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{active}</Typography>
      </Box>
    </Stack>
    <Box sx={{ px: 3, py: 2 }}>
      {rows.map(({ label, value }) => (
        <Stack key={label} direction="row" justifyContent="space-between" alignItems="center"
          sx={{ py: 0.8, borderBottom: `1px solid ${color}10`, "&:last-child": { borderBottom: "none" } }}>
          <Typography sx={{ fontSize: 12.5, color: C.textSec }}>{label}</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color }}>{value}</Typography>
        </Stack>
      ))}
    </Box>
  </Paper>
);

/* ─── Bar Row ────────────────────────────────────────────── */
const BarRow = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box mb={1.4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography sx={{ fontSize: 12.5, color: C.textSec, fontWeight: 600 }}>{label}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: C.text }}>{value}</Typography>
          <Typography sx={{ fontSize: 11, color: C.textMuted }}>({pct}%)</Typography>
        </Stack>
      </Stack>
      <LinearProgress variant="determinate" value={pct}
        sx={{ height: 7, borderRadius: 999,
          bgcolor: `${color}15`,
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 999 } }} />
    </Box>
  );
};

/* ─── Helpers demog ──────────────────────────────────────── */
const EDAD_LABELS = { 0: "< 18", 18: "18 – 24", 25: "25 – 34", 35: "35 – 44", 45: "45 – 54", 55: "55+" };
const ACTIV_LABELS = {
  sedentario:   "Sedentario",
  ligero:       "Ligero",
  moderado:     "Moderado",
  activo:       "Activo",
  "muy activo": "Muy activo",
  "muy_activo": "Muy activo",
};
const SEXO_LABELS = { M: "Masculino", F: "Femenino", masculino: "Masculino", femenino: "Femenino" };

const DURATION_PRESETS = [
  { label: "7d",  days: 7  },
  { label: "15d", days: 15 },
  { label: "30d", days: 30 },
  { label: "60d", days: 60 },
  { label: "90d", days: 90 },
];

/* ─── UserDetailDrawer ───────────────────────────────────── */
const UserDetailDrawer = ({ user, onClose, onDelete, deleting, onAssigned, token }) => {
  const [assignPlan,    setAssignPlan]    = useState("silver");
  const [assignDays,    setAssignDays]    = useState(30);
  const [customDays,    setCustomDays]    = useState("");
  const [assigning,     setAssigning]     = useState(false);
  const [assignResult,  setAssignResult]  = useState(null); // { ok, msg }

  if (!user) return null;
  // "pending" = pago no confirmado → tratar como sin suscripción
  const sub  = user.subscription?.status === "pending" ? null : user.subscription;
  const plan = sub ? (PLAN_META[sub.plan] ?? PLAN_META.silver) : null;
  const stat = sub ? (STATUS_META[sub.status] ?? STATUS_META.expired) : null;

  const history = sub?.paymentHistory ?? [];

  const effectiveDays = customDays ? parseInt(customDays) || 0 : assignDays;

  const handleAssign = async () => {
    if (!effectiveDays || effectiveDays < 1) {
      setAssignResult({ ok: false, msg: "Ingresá una duración válida." });
      return;
    }
    setAssigning(true);
    setAssignResult(null);
    try {
      const res  = await fetch(`${API_URL}/api/admin/users/${user._id}/subscription`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ plan: assignPlan, days: effectiveDays }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssignResult({ ok: false, msg: data.error || "Error al asignar." });
      } else {
        setAssignResult({ ok: true, msg: `Plan ${assignPlan} activo por ${effectiveDays} días ✓` });
        onAssigned(user._id, data.subscription);
      }
    } catch {
      setAssignResult({ ok: false, msg: "Error de conexión." });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Drawer anchor="right" open={!!user} onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100vw", sm: 480 }, bgcolor: C.surfaceAlt } }}>

      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, bgcolor: C.surface, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 42, height: 42, fontSize: 13, fontWeight: 800,
            bgcolor: C.brandSurface, color: C.brand, border: `2px solid ${C.brandMuted}` }}>
            {(user.name || user.email || "?").slice(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
              {user.name || "Sin nombre"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.textMuted }}>{user.email}</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small"
          sx={{ color: C.textMuted, borderRadius: 2, "&:hover": { bgcolor: C.brandSurface, color: C.brand } }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>

        {/* ── Info general ── */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.surface, mb: 2 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5 }}>
            Datos generales
          </Typography>
          {[
            { label: "Registrado",  value: fmtDate(user.createdAt) },
            { label: "Perfil",      value: user.profileCompleted ? "Completo" : "Incompleto" },
            { label: "Edad",        value: user.edad ? `${user.edad} años` : "—" },
            { label: "Sexo",        value: SEXO_LABELS[user.sexo] ?? user.sexo ?? "—" },
            { label: "Actividad",   value: ACTIV_LABELS[user.actividad] ?? user.actividad ?? "—" },
          ].map(({ label, value }) => (
            <Stack key={label} direction="row" justifyContent="space-between" alignItems="center"
              sx={{ py: 0.7, borderBottom: `1px solid ${C.border}`, "&:last-child": { borderBottom: "none" } }}>
              <Typography sx={{ fontSize: 12.5, color: C.textSec }}>{label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.text }}>{value}</Typography>
            </Stack>
          ))}
        </Paper>

        {/* ── Suscripción ── */}
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
          Suscripción
        </Typography>

        {!sub ? (
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.surface, mb: 2 }}>
            <Typography sx={{ fontSize: 13, color: C.textMuted }}>Sin suscripción registrada</Typography>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1.5px solid ${plan.color}30`, overflow: "hidden", mb: 2 }}>
            {/* Plan header */}
            <Box sx={{ px: 3, py: 2, bgcolor: plan.bg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: `${plan.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <plan.Icon sx={{ fontSize: 18, color: plan.color }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: C.text }}>Plan {plan.label}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: C.textSec }}>
                    {sub.amount > 0 ? fmtARS(sub.amount) + "/mes" : "Prueba gratuita"}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={stat.label}
                icon={<stat.Icon sx={{ fontSize: "14px !important", color: `${stat.color} !important` }} />}
                size="small"
                sx={{ bgcolor: stat.bg, color: stat.color, fontWeight: 700, fontSize: 11,
                  border: `1px solid ${stat.color}30`, "& .MuiChip-icon": { ml: "6px" } }}
              />
            </Box>
            {/* Dates */}
            <Box sx={{ px: 3, py: 2, bgcolor: C.surface }}>
              {[
                { label: "Inicio",    value: fmtDate(sub.startDate), Icon: CalendarTodayOutlinedIcon },
                { label: "Vencimiento", value: fmtDate(sub.endDate), Icon: AccessTimeOutlinedIcon },
              ].map(({ label, value, Icon: RowIcon }) => (
                <Stack key={label} direction="row" justifyContent="space-between" alignItems="center"
                  sx={{ py: 0.7, borderBottom: `1px solid ${C.border}`, "&:last-child": { borderBottom: "none" } }}>
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <RowIcon sx={{ fontSize: 14, color: C.textMuted }} />
                    <Typography sx={{ fontSize: 12.5, color: C.textSec }}>{label}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value}</Typography>
                </Stack>
              ))}
            </Box>
          </Paper>
        )}

        {/* ── Historial de pagos ── */}
        <Stack direction="row" spacing={1} alignItems="center" mb={1} mt={0.5}>
          <HistoryRoundedIcon sx={{ fontSize: 15, color: C.textMuted }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Historial de pagos
          </Typography>
          {history.length > 0 && (
            <Chip label={history.length} size="small"
              sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: C.brandSurface, color: C.brand }} />
          )}
        </Stack>

        {history.length === 0 ? (
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.surface }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ReceiptLongOutlinedIcon sx={{ fontSize: 20, color: C.textMuted }} />
              <Typography sx={{ fontSize: 13, color: C.textMuted }}>Sin pagos registrados</Typography>
            </Stack>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {history.map((p, i) => {
              const pmeta = PLAN_META[p.plan] ?? PLAN_META.silver;
              return (
                <Paper key={p.mpPaymentId ?? i} elevation={0} sx={{
                  px: 2.5, py: 1.8, borderRadius: 3, bgcolor: C.surface,
                  border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5,
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: pmeta.bg, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <pmeta.Icon sx={{ fontSize: 16, color: pmeta.color }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                        {p.description || `Plan ${pmeta.label}`}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: C.textMuted, whiteSpace: "nowrap" }}>
                        {fmtDatetime(p.createdAt)}
                        {p.mpPaymentId && (
                          <Tooltip title={`ID: ${p.mpPaymentId}`} placement="top">
                            <span style={{ marginLeft: 6, cursor: "help" }}>· #{p.mpPaymentId.slice(-6)}</span>
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack alignItems="flex-end" sx={{ flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: pmeta.color }}>
                      {p.mpPaymentId?.startsWith("admin_") ? "Sin cargo" : fmtARS(p.amount)}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {p.mpPaymentId?.startsWith("admin_") && (
                        <Chip label="Promo" size="small"
                          sx={{ height: 17, fontSize: 10, fontWeight: 700,
                            bgcolor: "#F5F3FF", color: "#7C3AED" }} />
                      )}
                      <Chip
                        label={p.status === "approved" ? "Aprobado" : p.status === "rejected" ? "Rechazado" : "Pendiente"}
                        size="small"
                        sx={{
                          height: 17, fontSize: 10, fontWeight: 700,
                          bgcolor: p.status === "approved" ? "rgba(46,204,113,0.12)" : p.status === "rejected" ? C.dangerSurf : C.goldSurf,
                          color:   p.status === "approved" ? "#2ECC71" : p.status === "rejected" ? C.danger : C.gold,
                        }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}

        {/* ── Asignar plan (admin) ── */}
        <Divider sx={{ my: 3, borderColor: C.border }} />

        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <CardGiftcardRoundedIcon sx={{ fontSize: 15, color: C.brand }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Asignar acceso (admin)
          </Typography>
        </Stack>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1.5px solid ${C.brandMuted}`, bgcolor: C.brandSurface, mb: 2 }}>

          {/* Selector de plan */}
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>
            Plan
          </Typography>
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
            {["free", "silver", "gold"].map((p) => {
              const m = PLAN_META[p];
              const active = assignPlan === p;
              return (
                <Box key={p} onClick={() => setAssignPlan(p)} sx={{
                  display: "flex", alignItems: "center", gap: 0.6,
                  px: 1.5, py: 0.7, borderRadius: 2, cursor: "pointer",
                  bgcolor: active ? m.bg : C.surface,
                  border: `1.5px solid ${active ? m.color : C.border}`,
                  transition: "all 0.15s",
                }}>
                  <m.Icon sx={{ fontSize: 14, color: m.color }} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: active ? 800 : 600, color: m.color }}>
                    {m.label}
                  </Typography>
                  {active && <CheckRoundedIcon sx={{ fontSize: 13, color: m.color, ml: 0.3 }} />}
                </Box>
              );
            })}
          </Stack>

          {/* Selector de duración */}
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>
            Duración
          </Typography>
          <Stack direction="row" spacing={0.8} mb={1.5} flexWrap="wrap" useFlexGap>
            {DURATION_PRESETS.map(({ label, days }) => {
              const active = !customDays && assignDays === days;
              return (
                <Box key={days} onClick={() => { setAssignDays(days); setCustomDays(""); }} sx={{
                  px: 1.5, py: 0.6, borderRadius: 2, cursor: "pointer",
                  bgcolor: active ? C.brand : C.surface,
                  border: `1.5px solid ${active ? C.brand : C.border}`,
                  transition: "all 0.15s",
                }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : C.textSec }}>
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          <TextField
            placeholder="O ingresá días personalizados (ej: 45)"
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value.replace(/\D/g, ""))}
            size="small" fullWidth
            sx={{ mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: C.surface, fontSize: 13,
                "& fieldset": { borderColor: C.border },
                "&:hover fieldset": { borderColor: C.brandMuted },
                "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 } } }}
          />

          {assignResult && (
            <Alert severity={assignResult.ok ? "success" : "error"}
              sx={{ borderRadius: 2, fontSize: 12.5, mb: 1.5, py: 0.5 }}>
              {assignResult.msg}
            </Alert>
          )}

          <Button
            onClick={handleAssign}
            disabled={assigning || !effectiveDays}
            fullWidth variant="contained"
            startIcon={assigning ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <CardGiftcardRoundedIcon />}
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13,
              py: 1.1, bgcolor: C.brand, "&:hover": { bgcolor: C.brandLight },
              "&:disabled": { opacity: 0.6 } }}
          >
            {assigning ? "Asignando…" : `Asignar Plan ${PLAN_META[assignPlan]?.label} · ${effectiveDays || "—"} días`}
          </Button>
        </Paper>

        {/* ── Eliminar usuario ── */}
        <Divider sx={{ my: 2, borderColor: C.border }} />
        <Button
          onClick={() => onDelete(user._id)}
          disabled={deleting === user._id}
          startIcon={<DeleteOutlineRoundedIcon />}
          fullWidth
          sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13,
            py: 1.2, color: C.danger, border: `1px solid rgba(226,75,74,0.25)`,
            bgcolor: C.dangerSurf,
            "&:hover": { bgcolor: "rgba(226,75,74,0.14)", borderColor: C.danger },
            "&:disabled": { opacity: 0.5 } }}
        >
          {deleting === user._id ? "Eliminando…" : "Eliminar usuario"}
        </Button>
      </Box>
    </Drawer>
  );
};

/* ─── AdminDashboard ─────────────────────────────────────── */
const AdminDashboard = () => {
  const { user }   = useNutrition();
  const navigate   = useNavigate();

  const [activeTab,    setActiveTab]    = useState("stats");
  const [stats,        setStats]        = useState(null);
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [deletingId,   setDeletingId]   = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem("nutrismartToken");

  const fetchAdminData = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.status === 401 || statsRes.status === 403) { navigate("/"); return; }
      setStats(await statsRes.json());
      const ud = await usersRes.json();
      setUsers(ud.users || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    fetchAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((p) => p.filter((u) => u._id !== id));
      setStats((p) => p ? { ...p, totalUsers: p.totalUsers - 1 } : p);
      if (selectedUser?._id === id) setSelectedUser(null);
    } catch (err) { console.error("Delete error:", err); }
    finally { setDeletingId(null); }
  };

  const filteredUsers = useMemo(
    () => users.filter((u) =>
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.name  || "").toLowerCase().includes(search.toLowerCase())
    ),
    [users, search],
  );

  /* Demo totals */
  const sexoTotal  = useMemo(() => stats?.demo?.sexo?.reduce((a, r) => a + r.count, 0) ?? 0, [stats]);
  const activTotal = useMemo(() => stats?.demo?.actividad?.reduce((a, r) => a + r.count, 0) ?? 0, [stats]);
  const edadTotal  = useMemo(() => stats?.demo?.edadRanges?.reduce((a, r) => a + r.count, 0) ?? 0, [stats]);

  /* ─── Columnas de la tabla ───────────────────────────────── */
  const columns = [
    {
      field: "email", headerName: "Usuario", flex: 1.8,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 700,
            bgcolor: C.brandSurface, color: C.brand, border: `1px solid ${C.brandMuted}` }}>
            {(params.row.name || params.value || "?").slice(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 13, color: C.text, fontWeight: 600, lineHeight: 1.2 }}>
              {params.row.name || "—"}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textMuted }}>{params.value}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "subscription_plan", headerName: "Plan", width: 110,
      valueGetter: (_, row) => row.subscription?.plan ?? "",
      renderCell: (params) => {
        const sub  = params.row.subscription;
        if (!sub || sub.status === "pending") return <Typography sx={{ fontSize: 12, color: C.textMuted }}>—</Typography>;
        const meta = PLAN_META[sub.plan] ?? PLAN_META.silver;
        return (
          <Chip
            icon={<meta.Icon sx={{ fontSize: "14px !important", color: `${meta.color} !important` }} />}
            label={meta.label}
            size="small"
            sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: 11,
              border: `1px solid ${meta.color}30`, "& .MuiChip-icon": { ml: "6px" } }}
          />
        );
      },
    },
    {
      field: "subscription_status", headerName: "Estado", width: 110,
      valueGetter: (_, row) => row.subscription?.status ?? "",
      renderCell: (params) => {
        const sub  = params.row.subscription;
        if (!sub || sub.status === "pending") return <Typography sx={{ fontSize: 12, color: C.textMuted }}>—</Typography>;
        const stat = STATUS_META[sub.status] ?? STATUS_META.expired;
        return (
          <Chip label={stat.label} size="small"
            sx={{ bgcolor: stat.bg, color: stat.color, fontWeight: 700, fontSize: 11,
              border: `1px solid ${stat.color}30` }} />
        );
      },
    },
    {
      field: "subscription_end", headerName: "Vence", width: 120,
      valueGetter: (_, row) => row.subscription?.endDate ?? "",
      renderCell: (params) => {
        const endDate = params.row.subscription?.status !== "pending" ? params.row.subscription?.endDate : null;
        if (!endDate) return <Typography sx={{ fontSize: 12, color: C.textMuted }}>—</Typography>;
        const days = Math.ceil((new Date(endDate) - new Date()) / 86400000);
        const color = days < 0 ? C.textMuted : days <= 5 ? C.danger : C.text;
        return (
          <Tooltip title={fmtDate(endDate)} placement="top">
            <Typography sx={{ fontSize: 12, color, fontWeight: days > 0 && days <= 5 ? 700 : 500 }}>
              {days < 0 ? "Vencida" : days === 0 ? "Hoy" : `${days}d`}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "createdAt", headerName: "Registro", width: 120,
      valueGetter: (v) => v ? new Date(v).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 12, color: C.textSec }}>{params.value}</Typography>
      ),
    },
    {
      field: "profileCompleted", headerName: "Perfil", width: 80,
      renderCell: (params) => (
        <Chip label={params.value ? "Completo" : "—"} size="small"
          sx={{ fontSize: 10.5, height: 20, fontWeight: 700,
            bgcolor: params.value ? "rgba(11,94,85,0.10)" : "rgba(0,0,0,0.05)",
            color:   params.value ? C.brand : C.textMuted, border: "none" }} />
      ),
    },
    {
      field: "actions", headerName: "", width: 56, sortable: false, filterable: false,
      renderCell: (params) => (
        <IconButton size="small" disabled={deletingId === params.row._id}
          onClick={(e) => { e.stopPropagation(); handleDelete(params.row._id); }}
          sx={{ color: C.textMuted, borderRadius: 2,
            "&:hover": { color: C.danger, bgcolor: C.dangerSurf } }}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (loading) return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2 }}>
      <Box sx={{ width: 44, height: 44, borderRadius: "50%",
        border: `3px solid ${C.brandMuted}`, borderTopColor: C.brand,
        animation: "spin 0.8s linear infinite",
        "@keyframes spin": { to: { transform: "rotate(360deg)" } } }} />
      <Typography sx={{ color: C.textMuted, fontSize: 14 }}>Cargando datos…</Typography>
    </Box>
  );

  const s = stats?.subs ?? {};
  const d = stats?.demo ?? {};

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.surfaceAlt }}>
    <Box sx={{ maxWidth: 1400, mx: "auto",
      px: { xs: 2, sm: 3, md: 5 }, py: { xs: 3, md: 5 } }}>

      {/* ── HEADER ───────────────────────────────────── */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }} mb={5} gap={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: C.brand,
            display: "flex", alignItems: "center", justifyContent: "center", boxShadow: shadow.md }}>
            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 24, color: "#fff" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 11, color: C.textMuted, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.2 }}>
              NUI App
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1.2 }}>
              Administración
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/")}
            sx={{ textTransform: "none", color: C.textSec, fontWeight: 600, fontSize: 13,
              borderRadius: 999, px: 2.5, border: `1px solid ${C.border}`, bgcolor: C.surface,
              boxShadow: shadow.sm, "&:hover": { bgcolor: C.brandSurface, borderColor: C.brandMuted, color: C.brand } }}>
            Volver al panel
          </Button>
          <IconButton onClick={() => fetchAdminData({ silent: true })} disabled={refreshing}
            sx={{ border: `1px solid ${C.border}`, bgcolor: C.surface, boxShadow: shadow.sm,
              borderRadius: 2.5, "&:hover": { bgcolor: C.brandSurface, borderColor: C.brandMuted } }}>
            <RefreshRoundedIcon sx={{ fontSize: 20, color: C.textSec, transition: "transform 0.4s",
              animation: refreshing ? "spin 0.6s linear infinite" : "none",
              "@keyframes spin": { to: { transform: "rotate(360deg)" } } }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Tab switcher */}
      <Stack direction="row" spacing={0} sx={{ bgcolor: "rgba(11,94,85,0.06)", borderRadius: 999, p: 0.5, display: "inline-flex", mb: 4 }}>
        {[
          { id: "stats", label: "📊 Estadísticas" },
          { id: "logs",  label: "📋 Logs" },
        ].map((tab) => (
          <Box key={tab.id} onClick={() => setActiveTab(tab.id)} sx={{
            px: 2.5, py: 0.9, borderRadius: 999, cursor: "pointer",
            bgcolor: activeTab === tab.id ? "#fff" : "transparent",
            boxShadow: activeTab === tab.id ? "0 2px 8px rgba(11,94,85,0.12)" : "none",
            transition: "all 0.2s ease",
          }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: activeTab === tab.id ? 800 : 600,
              color: activeTab === tab.id ? "#0B5E55" : "#4A6B67", whiteSpace: "nowrap" }}>
              {tab.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      {activeTab === "logs" && <AdminLogs />}

      {activeTab === "stats" && (<>

      {/* ── SECCIÓN: KPIs GENERALES ───────────────────── */}
      <SectionHeader title="Resumen general" subtitle="Usuarios y actividad de la plataforma" />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3,1fr)", lg: "repeat(6,1fr)" },
        gap: 2, mb: 5 }}>
        <KpiCard label="Usuarios totales"  value={stats?.totalUsers}    icon={PeopleAltOutlinedIcon}      color={C.brand} bgColor={C.brandSurface} borderColor={C.brandMuted} />
        <KpiCard label="Nuevos hoy"        value={stats?.newUsersToday} icon={PersonAddAltOutlinedIcon}   color="#3B9E6A" />
        <KpiCard label="Nuevos esta semana" value={stats?.newUsersWeek} icon={PersonAddAltOutlinedIcon}   color="#3B9E6A" />
        <KpiCard label="Análisis hoy"      value={stats?.analysesToday} icon={AnalyticsOutlinedIcon}      color={C.brand} />
        <KpiCard label="Análisis totales"  value={stats?.analysesTotal} icon={AnalyticsOutlinedIcon}      color={C.brand} />
        <KpiCard label="MRR estimado"      value={fmtARS(s.mrr ?? 0)}  icon={AttachMoneyRoundedIcon}
          color={C.gold} bgColor={C.goldSurf} borderColor="rgba(201,149,42,0.25)"
          sub={`${(s.activeSilver ?? 0) + (s.activeGold ?? 0)} pagas · ${s.activeAdmin ?? 0} promo`} />
      </Box>

      {/* ── SECCIÓN: SUSCRIPCIONES ───────────────────── */}
      <SectionHeader title="Suscripciones" subtitle="Estado actual y alta por período de cada plan" />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 2.5, mb: 2 }}>
        <PlanCard
          icon={RocketLaunchRoundedIcon} name="Free (trial)" color={C.brand}
          bgColor={C.brandSurface} active={s.activeFree ?? 0}
          rows={[
            { label: "Cancelados", value: s.cancelled ?? 0 },
            { label: "Expirados",  value: s.expired   ?? 0 },
          ]}
        />
        <PlanCard
          icon={DiamondOutlinedIcon} name="Silver" color={C.silver}
          bgColor={C.silverSurf} active={s.activeSilver ?? 0}
          rows={[
            { label: "Nuevas hoy",         value: s.silverToday ?? 0 },
            { label: "Nuevas esta semana", value: s.silverWeek  ?? 0 },
            { label: "Nuevas este año",    value: s.silverYear  ?? 0 },
          ]}
        />
        <PlanCard
          icon={WorkspacePremiumOutlinedIcon} name="Gold" color={C.gold}
          bgColor={C.goldSurf} active={s.activeGold ?? 0}
          rows={[
            { label: "Nuevas hoy",         value: s.goldToday ?? 0 },
            { label: "Nuevas esta semana", value: s.goldWeek  ?? 0 },
            { label: "Nuevas este año",    value: s.goldYear  ?? 0 },
          ]}
        />
        <PlanCard
          icon={CardGiftcardRoundedIcon} name="Promo / Admin" color="#7C3AED"
          bgColor="#F5F3FF" active={s.activeAdmin ?? 0}
          rows={[
            { label: "No contabilizado en MRR", value: "—" },
            { label: "Asignados manualmente",   value: s.activeAdmin ?? 0 },
          ]}
        />
      </Box>

      {/* Tabla resumen por período */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`,
        boxShadow: shadow.sm, overflow: "hidden", mb: 5 }}>
        <Box sx={{ px: 3, py: 2, bgcolor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>Altas pagadas por período</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr repeat(3,100px)", px: 3, py: 1.2,
          bgcolor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
          {["Plan", "Hoy", "Esta semana", "Este año"].map((h) => (
            <Typography key={h} sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted,
              textTransform: "uppercase", letterSpacing: "0.07em", textAlign: h !== "Plan" ? "center" : "left" }}>
              {h}
            </Typography>
          ))}
        </Box>
        {[
          { label: "Silver", color: C.silver, today: s.silverToday, week: s.silverWeek, year: s.silverYear },
          { label: "Gold",   color: C.gold,   today: s.goldToday,   week: s.goldWeek,   year: s.goldYear   },
          { label: "Total",  color: C.brand,
            today: (s.silverToday ?? 0) + (s.goldToday ?? 0),
            week:  (s.silverWeek  ?? 0) + (s.goldWeek  ?? 0),
            year:  (s.silverYear  ?? 0) + (s.goldYear  ?? 0),
          },
        ].map((row, i) => (
          <Box key={row.label} sx={{
            display: "grid", gridTemplateColumns: "1fr repeat(3,100px)",
            px: 3, py: 1.4,
            bgcolor: i === 2 ? `${C.brand}06` : "transparent",
            borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
          }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: i === 2 ? 800 : 600, color: row.color }}>{row.label}</Typography>
            {[row.today, row.week, row.year].map((v, j) => (
              <Typography key={j} sx={{ fontSize: 15, fontWeight: 800, color: row.color, textAlign: "center" }}>
                {v ?? 0}
              </Typography>
            ))}
          </Box>
        ))}
      </Paper>

      {/* ── SECCIÓN: DEMOGRAFÍA ──────────────────────── */}
      <SectionHeader title="Demografía de usuarios"
        subtitle={`${d.profileCount ?? 0} usuario${d.profileCount !== 1 ? "s" : ""} con perfil completo`} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2.5, mb: 5 }}>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
            <BarChartRoundedIcon sx={{ fontSize: 18, color: C.brand }} />
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.text }}>Edad</Typography>
            <Box sx={{ ml: "auto !important" }}>
              <Typography sx={{ fontSize: 28, fontWeight: 900, color: C.brand, lineHeight: 1 }}>
                {d.edadAvg ?? "—"}
              </Typography>
              <Typography sx={{ fontSize: 10, color: C.textMuted, textAlign: "right" }}>promedio</Typography>
            </Box>
          </Stack>
          {(d.edadRanges ?? [])
            .filter((r) => r._id !== "nd")
            .sort((a, b) => (typeof a._id === "number" ? a._id - b._id : 0))
            .map((r) => (
              <BarRow key={r._id} label={EDAD_LABELS[r._id] ?? r._id}
                value={r.count} total={edadTotal} color={C.brand} />
            ))}
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: "#7C3AED" }} />
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.text }}>Género</Typography>
          </Stack>
          {sexoTotal === 0
            ? <Typography sx={{ fontSize: 13, color: C.textMuted }}>Sin datos aún</Typography>
            : (d.sexo ?? [])
                .sort((a, b) => b.count - a.count)
                .map((r) => (
                  <BarRow key={r._id} label={SEXO_LABELS[r._id] ?? r._id ?? "Otro"}
                    value={r.count} total={sexoTotal} color="#7C3AED" />
                ))
          }
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${C.border}` }}>
            <Typography sx={{ fontSize: 11.5, color: C.textMuted }}>
              Total con perfil: <strong style={{ color: C.text }}>{sexoTotal}</strong>
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
            <BarChartRoundedIcon sx={{ fontSize: 18, color: C.gold }} />
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.text }}>Nivel de actividad</Typography>
          </Stack>
          {activTotal === 0
            ? <Typography sx={{ fontSize: 13, color: C.textMuted }}>Sin datos aún</Typography>
            : (d.actividad ?? [])
                .sort((a, b) => b.count - a.count)
                .map((r) => (
                  <BarRow key={r._id} label={ACTIV_LABELS[r._id] ?? r._id ?? "Otro"}
                    value={r.count} total={activTotal} color={C.gold} />
                ))
          }
        </Paper>
      </Box>

      {/* ── SECCIÓN: TABLA USUARIOS ───────────────────── */}
      <SectionHeader
        title="Usuarios registrados"
        subtitle={`${filteredUsers.length} usuario${filteredUsers.length !== 1 ? "s" : ""} · click en una fila para ver detalle y pagos`}
      />
      <Paper elevation={0} sx={{ borderRadius: 5, border: `1px solid ${C.border}`,
        boxShadow: shadow.md, overflow: "hidden", bgcolor: C.surface }}>

        <Box sx={{ px: { xs: 3, md: 4 }, py: 2.5, borderBottom: `1px solid ${C.border}`,
          bgcolor: C.surfaceAlt, display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: C.brandSurface,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: C.brand }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                Usuarios registrados
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                {filteredUsers.length} resultado{filteredUsers.length !== 1 ? "s" : ""}
                {search && ` para "${search}"`}
              </Typography>
            </Box>
          </Stack>

          <TextField placeholder="Buscar por nombre o email…" value={search}
            onChange={(e) => setSearch(e.target.value)} size="small"
            sx={{ width: { xs: "100%", sm: 300 },
              "& .MuiOutlinedInput-root": { borderRadius: 999, bgcolor: C.surface, fontSize: 13,
                "& fieldset": { borderColor: C.border },
                "&:hover fieldset": { borderColor: C.brandMuted },
                "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 } } }}
            slotProps={{ input: { startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: C.textMuted }} />
              </InputAdornment>
            ) } }}
          />
        </Box>

        <Box sx={{ height: 540 }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            getRowId={(r) => r._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            disableRowSelectionOnClick={false}
            onRowClick={(params) => setSelectedUser(params.row)}
            rowHeight={64}
            sx={{
              border: "none", bgcolor: C.surface, fontFamily: "inherit",
              "& .MuiDataGrid-columnHeaders":    { bgcolor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` },
              "& .MuiDataGrid-columnHeader":     { bgcolor: C.surfaceAlt, px: 2 },
              "& .MuiDataGrid-columnHeaderTitle":{ fontSize: 11, fontWeight: 700, color: C.textMuted,
                textTransform: "uppercase", letterSpacing: "0.07em" },
              "& .MuiDataGrid-columnSeparator":  { display: "none" },
              "& .MuiDataGrid-row":              { borderBottom: `1px solid ${C.border}`, transition: "background-color 0.15s", cursor: "pointer" },
              "& .MuiDataGrid-row:last-child":   { borderBottom: "none" },
              "& .MuiDataGrid-row:hover":        { bgcolor: C.brandSurface },
              "& .MuiDataGrid-cell":             { border: "none", outline: "none !important",
                display: "flex", alignItems: "center", px: 2, "&:focus": { outline: "none" }, "&:focus-within": { outline: "none" } },
              "& .MuiDataGrid-footerContainer":  { borderTop: `1px solid ${C.border}`, bgcolor: C.surfaceAlt, minHeight: 52, px: 1 },
              "& .MuiTablePagination-root":      { fontSize: 13, color: C.textSec },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 12, color: C.textMuted },
              "& .MuiDataGrid-scrollbar": {
                "&::-webkit-scrollbar":       { width: 6, height: 6 },
                "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                "&::-webkit-scrollbar-thumb": { bgcolor: C.brandMuted, borderRadius: 3 },
              },
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ height: 48 }} />
      </>)}
    </Box>

    {/* ── Drawer detalle usuario ── */}
    <UserDetailDrawer
      user={selectedUser}
      onClose={() => setSelectedUser(null)}
      onDelete={handleDelete}
      deleting={deletingId}
      token={token}
      onAssigned={(userId, newSub) => {
        // Actualizar lista de usuarios y el usuario seleccionado con la nueva sub
        setUsers((prev) => prev.map((u) =>
          u._id === userId ? { ...u, subscription: newSub } : u
        ));
        setSelectedUser((prev) => prev ? { ...prev, subscription: newSub } : prev);
      }}
    />
    </Box>
  );
};

export default AdminDashboard;
