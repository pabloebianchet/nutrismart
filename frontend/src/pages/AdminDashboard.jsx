import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Stack, Paper,
  TextField, InputAdornment, IconButton,
  Chip, Avatar, Button, LinearProgress,
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
import CancelOutlinedIcon             from "@mui/icons-material/CancelOutlined";
import BarChartRoundedIcon            from "@mui/icons-material/BarChartRounded";

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
    {/* Header */}
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

    {/* Rows */}
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

/* ─── AdminDashboard ─────────────────────────────────────── */
const AdminDashboard = () => {
  const { user }   = useNutrition();
  const navigate   = useNavigate();

  const [stats,      setStats]      = useState(null);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [deletingId, setDeletingId] = useState(null);

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
      field: "sexo", headerName: "Sexo", width: 80,
      renderCell: (params) => (
        <Typography sx={{ fontSize: 12.5, color: params.value ? C.text : C.textMuted }}>
          {params.value ? (params.value === "M" || params.value === "masculino" ? "M" : "F") : "—"}
        </Typography>
      ),
    },
    {
      field: "edad", headerName: "Edad", width: 70,
      renderCell: (params) => (
        <Typography sx={{ fontSize: 12.5, color: params.value ? C.text : C.textMuted }}>
          {params.value ? `${params.value}a` : "—"}
        </Typography>
      ),
    },
    {
      field: "actividad", headerName: "Actividad", width: 110,
      renderCell: (params) => (
        <Typography sx={{ fontSize: 11.5, color: params.value ? C.textSec : C.textMuted }}>
          {params.value ? (ACTIV_LABELS[params.value] ?? params.value) : "—"}
        </Typography>
      ),
    },
    {
      field: "profileCompleted", headerName: "Perfil", width: 80,
      renderCell: (params) => (
        <Chip label={params.value ? "Completo" : "Incompleto"} size="small"
          sx={{ fontSize: 10.5, height: 20, fontWeight: 700,
            bgcolor: params.value ? "rgba(11,94,85,0.10)" : "rgba(0,0,0,0.05)",
            color:   params.value ? C.brand : C.textMuted, border: "none" }} />
      ),
    },
    {
      field: "createdAt", headerName: "Registro", flex: 1,
      valueGetter: (v) => v ? new Date(v).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "",
      renderCell: (params) => (
        <Typography sx={{ fontSize: 12, color: C.textSec }}>{params.value}</Typography>
      ),
    },
    {
      field: "actions", headerName: "", width: 56, sortable: false, filterable: false,
      renderCell: (params) => (
        <IconButton size="small" disabled={deletingId === params.row._id}
          onClick={() => handleDelete(params.row._id)}
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
    <Box sx={{ minHeight: "100vh", bgcolor: C.surfaceAlt,
      px: { xs: 2, sm: 3, md: 5 }, py: { xs: 3, md: 5 },
      maxWidth: 1400, mx: "auto" }}>

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
          sub={`${(s.activeSilver ?? 0) + (s.activeGold ?? 0)} subs pagadas`} />
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
            { label: "Nuevas hoy",       value: s.silverToday ?? 0 },
            { label: "Nuevas esta semana", value: s.silverWeek ?? 0 },
            { label: "Nuevas este año",  value: s.silverYear  ?? 0 },
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
      </Box>

      {/* Tabla resumen por período */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`,
        boxShadow: shadow.sm, overflow: "hidden", mb: 5 }}>
        <Box sx={{ px: 3, py: 2, bgcolor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>Altas pagadas por período</Typography>
        </Box>
        {/* Header */}
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

        {/* Edad */}
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

        {/* Sexo */}
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

        {/* Actividad */}
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
      <SectionHeader title="Usuarios registrados" subtitle="Todos los usuarios de la plataforma" />
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

        <Box sx={{ height: 520 }}>
          <DataGrid rows={filteredUsers} columns={columns} getRowId={(r) => r._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            disableRowSelectionOnClick rowHeight={64}
            sx={{
              border: "none", bgcolor: C.surface, fontFamily: "inherit",
              "& .MuiDataGrid-columnHeaders":    { bgcolor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` },
              "& .MuiDataGrid-columnHeader":     { bgcolor: C.surfaceAlt, px: 2 },
              "& .MuiDataGrid-columnHeaderTitle":{ fontSize: 11, fontWeight: 700, color: C.textMuted,
                textTransform: "uppercase", letterSpacing: "0.07em" },
              "& .MuiDataGrid-columnSeparator":  { display: "none" },
              "& .MuiDataGrid-row":              { borderBottom: `1px solid ${C.border}`, transition: "background-color 0.15s" },
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
    </Box>
  );
};

export default AdminDashboard;
