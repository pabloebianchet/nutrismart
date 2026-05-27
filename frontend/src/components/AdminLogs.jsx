import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Stack, Paper, Chip, TextField, Button,
  MenuItem, Select, InputAdornment, IconButton, CircularProgress,
  Tooltip, Collapse,
} from "@mui/material";
import SearchRoundedIcon        from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon       from "@mui/icons-material/RefreshRounded";
import DeleteSweepRoundedIcon   from "@mui/icons-material/DeleteSweepRounded";
import ExpandMoreRoundedIcon    from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon    from "@mui/icons-material/ExpandLessRounded";
import ErrorOutlineRoundedIcon  from "@mui/icons-material/ErrorOutlineRounded";
import WarningAmberRoundedIcon  from "@mui/icons-material/WarningAmberRounded";
import InfoOutlinedIcon         from "@mui/icons-material/InfoOutlined";
import { API_URL }              from "../config/api";

const C = {
  brand: "#0B5E55", brandSurface: "#E6F5F3", brandMuted: "#B2DDD9",
  surface: "#fff", surfaceAlt: "#F7F9F8", border: "rgba(11,94,85,0.10)",
  text: "#0F2420", textSec: "#4A6B67", textMuted: "#8AADAA",
};

const LEVEL_META = {
  info:  { label: "Info",  color: "#0B5E55", bg: "#E6F5F3", Icon: InfoOutlinedIcon },
  warn:  { label: "Aviso", color: "#B45309", bg: "#FFFBEB", Icon: WarningAmberRoundedIcon },
  error: { label: "Error", color: "#B91C1C", bg: "#FEF2F2", Icon: ErrorOutlineRoundedIcon },
};

const CAT_META = {
  auth:     { label: "Auth",        color: "#1D4ED8", bg: "#EFF6FF" },
  payment:  { label: "Pagos",       color: "#B45309", bg: "#FFFBEB" },
  analysis: { label: "Análisis",    color: "#0B5E55", bg: "#E6F5F3" },
  training: { label: "Entreno",     color: "#BF360C", bg: "#FBE9E7" },
  recipe:   { label: "Recetas",     color: "#6A1B9A", bg: "#F3E5F5" },
  contact:  { label: "Contacto",    color: "#0369A1", bg: "#E0F2FE" },
  admin:    { label: "Admin",       color: "#374151", bg: "#F3F4F6" },
  system:   { label: "Sistema",     color: "#374151", bg: "#F3F4F6" },
};

const fmtDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const LevelBadge = ({ level }) => {
  const m = LEVEL_META[level] || LEVEL_META.info;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.4,
      px: 0.9, py: 0.25, borderRadius: 1,
      bgcolor: m.bg, color: m.color,
      fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em",
      whiteSpace: "nowrap",
    }}>
      <m.Icon sx={{ fontSize: 11 }} />
      {m.label.toUpperCase()}
    </Box>
  );
};

const CatBadge = ({ category }) => {
  const m = CAT_META[category] || CAT_META.system;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center",
      px: 0.9, py: 0.25, borderRadius: 1,
      bgcolor: m.bg, color: m.color,
      fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {m.label}
    </Box>
  );
};

const LogRow = ({ log, isLast }) => {
  const [open, setOpen] = useState(false);
  const hasMeta = log.meta && Object.keys(log.meta).length > 0;

  return (
    <Box sx={{ borderBottom: isLast ? "none" : `1px solid ${C.border}` }}>
      <Box
        onClick={() => hasMeta && setOpen(p => !p)}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "140px 52px 80px 1fr auto" },
          gap: { xs: 0.5, sm: 1.5 },
          px: { xs: 2, sm: 2.5 },
          py: 1.4,
          alignItems: "center",
          cursor: hasMeta ? "pointer" : "default",
          transition: "background 0.12s",
          "&:hover": hasMeta ? { bgcolor: C.brandSurface } : {},
        }}
      >
        {/* Timestamp */}
        <Typography sx={{ fontSize: 11.5, color: C.textMuted, fontFamily: "monospace", whiteSpace: "nowrap" }}>
          {fmtDate(log.createdAt)}
        </Typography>

        {/* Level */}
        <Box><LevelBadge level={log.level} /></Box>

        {/* Category */}
        <Box><CatBadge category={log.category} /></Box>

        {/* Message + user */}
        <Box minWidth={0}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.35 }} noWrap>
            {log.message}
          </Typography>
          {(log.userName || log.userEmail) && (
            <Typography sx={{ fontSize: 11, color: C.textMuted }} noWrap>
              {log.userName}{log.userName && log.userEmail ? " · " : ""}{log.userEmail}
            </Typography>
          )}
        </Box>

        {/* Expand icon */}
        {hasMeta && (
          <Box sx={{ color: C.textMuted, display: { xs: "none", sm: "flex" } }}>
            {open ? <ExpandLessRoundedIcon sx={{ fontSize: 16 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />}
          </Box>
        )}
      </Box>

      {/* Meta details */}
      {hasMeta && (
        <Collapse in={open}>
          <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 1.5, pt: 0.5 }}>
            <Box sx={{ bgcolor: "#F8FAFA", borderRadius: 2, p: 1.5, border: `1px solid ${C.border}` }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.8 }}>
                Detalles
              </Typography>
              <Typography component="pre" sx={{
                fontSize: 12, color: C.textSec, fontFamily: "monospace",
                whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0,
                lineHeight: 1.6,
              }}>
                {JSON.stringify(log.meta, null, 2)}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const LEVELS = [
  { value: "all",   label: "Todos los niveles" },
  { value: "info",  label: "Info" },
  { value: "warn",  label: "Aviso" },
  { value: "error", label: "Error" },
];

const CATEGORIES = [
  { value: "all",      label: "Todas las categorías" },
  { value: "auth",     label: "Auth" },
  { value: "payment",  label: "Pagos" },
  { value: "analysis", label: "Análisis" },
  { value: "training", label: "Entreno" },
  { value: "recipe",   label: "Recetas" },
  { value: "contact",  label: "Contacto" },
  { value: "admin",    label: "Admin" },
  { value: "system",   label: "Sistema" },
];

const selectSx = {
  borderRadius: 2.5, fontSize: 13, bgcolor: C.surface,
  "& fieldset": { borderColor: C.border },
  "&:hover fieldset": { borderColor: C.brandMuted },
  "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 },
};

const AdminLogs = () => {
  const token = localStorage.getItem("nutrismartToken");

  const [logs,       setLogs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [level,      setLevel]      = useState("all");
  const [category,   setCategory]   = useState("all");
  const [from,       setFrom]       = useState("");
  const [to,         setTo]         = useState("");
  const [clearing,   setClearing]   = useState(false);

  const LIMIT = 50;

  const fetchLogs = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (level    !== "all") params.set("level",    level);
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      if (from)   params.set("from", from);
      if (to)     params.set("to",   to);

      const res  = await fetch(`${API_URL}/api/admin/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, level, category, search, from, to, token]);

  useEffect(() => { fetchLogs(1); setPage(1); }, [level, category, from, to]); // eslint-disable-line
  useEffect(() => { fetchLogs(page); }, [page]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const handleClearOld = async () => {
    if (!window.confirm("¿Eliminar logs de más de 30 días?")) return;
    setClearing(true);
    await fetch(`${API_URL}/api/admin/logs?olderThan=30`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setClearing(false);
    fetchLogs(1);
  };

  return (
    <Box>
      {/* Header + filters */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, overflow: "hidden", mb: 2 }}>
        <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 2, bgcolor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.text }}>
                Logs del sistema
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                {total.toLocaleString("es-AR")} eventos · mostrando {logs.length}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Actualizar">
                <IconButton size="small" onClick={() => fetchLogs(page)} disabled={loading}
                  sx={{ bgcolor: C.brandSurface, color: C.brand, "&:hover": { bgcolor: C.brandMuted } }}>
                  <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Button size="small" onClick={handleClearOld} disabled={clearing}
                startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 15 }} />}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, color: "#B91C1C",
                  bgcolor: "#FEF2F2", borderRadius: 999, px: 1.8,
                  "&:hover": { bgcolor: "#FEE2E2" } }}>
                Limpiar +30 días
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Filter bar */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
            {/* Search */}
            <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 1, flex: 1, minWidth: 200 }}>
              <TextField
                size="small" fullWidth placeholder="Buscar en mensaje, acción, usuario…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                slotProps={{ input: { startAdornment: (
                  <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 16, color: C.textMuted }} /></InputAdornment>
                ) } }}
                sx={{ "& .MuiOutlinedInput-root": { ...selectSx, borderRadius: 999 } }}
              />
              <Button type="submit" variant="contained" size="small"
                sx={{ bgcolor: C.brand, borderRadius: 999, textTransform: "none", fontWeight: 700, px: 2, flexShrink: 0, "&:hover": { bgcolor: "#0f7a6e" } }}>
                Buscar
              </Button>
            </Box>

            {/* Level */}
            <Select size="small" value={level} onChange={(e) => setLevel(e.target.value)}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border }, ...selectSx, minWidth: 160 }}>
              {LEVELS.map(l => <MenuItem key={l.value} value={l.value} sx={{ fontSize: 13 }}>{l.label}</MenuItem>)}
            </Select>

            {/* Category */}
            <Select size="small" value={category} onChange={(e) => setCategory(e.target.value)}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border }, ...selectSx, minWidth: 180 }}>
              {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value} sx={{ fontSize: 13 }}>{c.label}</MenuItem>)}
            </Select>

            {/* Date range */}
            <TextField type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} label="Desde"
              sx={{ "& .MuiOutlinedInput-root": selectSx, minWidth: 140 }} />
            <TextField type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} label="Hasta"
              sx={{ "& .MuiOutlinedInput-root": selectSx, minWidth: 140 }} />
          </Stack>
        </Box>

        {/* Column headers — desktop only */}
        <Box sx={{
          display: { xs: "none", sm: "grid" },
          gridTemplateColumns: "140px 52px 80px 1fr auto",
          gap: 1.5, px: 2.5, py: 1,
          bgcolor: "#FAFCFB", borderBottom: `1px solid ${C.border}`,
        }}>
          {["Timestamp", "Nivel", "Categoría", "Mensaje / Usuario", ""].map((h, i) => (
            <Typography key={i} sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {h}
            </Typography>
          ))}
        </Box>

        {/* Log rows */}
        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress size={28} sx={{ color: C.brand }} />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ fontSize: 40, mb: 1.5 }}>📋</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text, mb: 0.5 }}>Sin logs</Typography>
            <Typography sx={{ fontSize: 13, color: C.textMuted }}>No hay eventos que coincidan con los filtros</Typography>
          </Box>
        ) : (
          logs.map((log, i) => <LogRow key={log._id} log={log} isLast={i === logs.length - 1} />)
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" spacing={1} alignItems="center">
          <Button size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, color: C.brand, borderRadius: 999,
              "&:hover": { bgcolor: C.brandSurface } }}>
            ← Anterior
          </Button>
          <Typography sx={{ fontSize: 13, color: C.textMuted }}>
            Página {page} de {totalPages}
          </Typography>
          <Button size="small" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, color: C.brand, borderRadius: 999,
              "&:hover": { bgcolor: C.brandSurface } }}>
            Siguiente →
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default AdminLogs;
