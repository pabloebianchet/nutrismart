import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Stack, Paper, Chip, TextField, Button,
  MenuItem, Select, InputAdornment, IconButton, CircularProgress,
  Tooltip, Collapse,
} from "@mui/material";
import SearchRoundedIcon       from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon      from "@mui/icons-material/RefreshRounded";
import DeleteSweepRoundedIcon  from "@mui/icons-material/DeleteSweepRounded";
import ExpandMoreRoundedIcon   from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon   from "@mui/icons-material/ExpandLessRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoOutlinedIcon        from "@mui/icons-material/InfoOutlined";
import { API_URL }             from "../config/api";

const C = {
  brand: "#0B5E55", brandSurface: "#E6F5F3", brandMuted: "#B2DDD9",
  surface: "#fff", surfaceAlt: "#F7F9F8", border: "rgba(11,94,85,0.10)",
  text: "#0F2420", textSec: "#4A6B67", textMuted: "#8AADAA",
};

const LEVEL_META = {
  info:  { label: "INFO",  color: "#0B5E55", bg: "#E6F5F3", border: "#0B5E55", Icon: InfoOutlinedIcon },
  warn:  { label: "WARN",  color: "#B45309", bg: "#FFFBEB", border: "#D97706", Icon: WarningAmberRoundedIcon },
  error: { label: "ERROR", color: "#B91C1C", bg: "#FEF2F2", border: "#EF4444", Icon: ErrorOutlineRoundedIcon },
};

const CAT_META = {
  auth:     { label: "Auth",     color: "#1D4ED8", bg: "#EFF6FF" },
  payment:  { label: "Pagos",    color: "#B45309", bg: "#FFFBEB" },
  analysis: { label: "Análisis", color: "#0B5E55", bg: "#E6F5F3" },
  training: { label: "Entreno",  color: "#BF360C", bg: "#FBE9E7" },
  recipe:   { label: "Recetas",  color: "#6A1B9A", bg: "#F3E5F5" },
  contact:  { label: "Contacto", color: "#0369A1", bg: "#E0F2FE" },
  admin:    { label: "Admin",    color: "#374151", bg: "#F3F4F6" },
  system:   { label: "Sistema",  color: "#374151", bg: "#F3F4F6" },
};

/* ── Helpers ── */
const fmtTime = (d) =>
  new Date(d).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const fmtFull = (d) =>
  new Date(d).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

const relativeTime = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)   return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400)return `hace ${Math.floor(diff / 3600)} h`;
  return fmtTime(d);
};

/* ── LogRow ── */
const LogRow = ({ log, isLast }) => {
  const [open, setOpen] = useState(false);
  const hasMeta = log.meta && Object.keys(log.meta).length > 0;
  const m    = LEVEL_META[log.level]    || LEVEL_META.info;
  const cat  = CAT_META[log.category]   || CAT_META.system;

  return (
    <Box sx={{
      borderBottom: isLast ? "none" : `1px solid ${C.border}`,
      borderLeft: `3px solid ${m.border}`,
      transition: "background 0.12s",
      "&:hover": { bgcolor: log.level === "error" ? "#FFF5F5" : log.level === "warn" ? "#FFFDF0" : C.brandSurface },
    }}>
      <Box
        onClick={() => hasMeta && setOpen(p => !p)}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "120px 1fr auto" },
          gap: { xs: 0.5, sm: 1.5 },
          px: 2, py: 1.2,
          alignItems: "start",
          cursor: hasMeta ? "pointer" : "default",
        }}
      >
        {/* Col 1: Timestamp + Nivel + Categoría */}
        <Stack spacing={0.6} sx={{ minWidth: 0 }}>
          <Tooltip title={fmtFull(log.createdAt)} placement="right">
            <Typography sx={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace", whiteSpace: "nowrap" }}>
              {relativeTime(log.createdAt)}
            </Typography>
          </Tooltip>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {/* Level badge */}
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.4,
              px: 0.7, py: 0.15, borderRadius: 1,
              bgcolor: m.bg, color: m.color,
              fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
            }}>
              <m.Icon sx={{ fontSize: 10 }} />
              {m.label}
            </Box>
            {/* Category badge */}
            <Box sx={{
              display: "inline-flex", px: 0.7, py: 0.15, borderRadius: 1,
              bgcolor: cat.bg, color: cat.color,
              fontSize: 10, fontWeight: 700,
            }}>
              {cat.label}
            </Box>
          </Stack>
        </Stack>

        {/* Col 2: Acción + Mensaje + Usuario */}
        <Box sx={{ minWidth: 0 }}>
          {log.action && (
            <Typography sx={{
              fontSize: 11, fontFamily: "monospace", color: m.color,
              fontWeight: 700, mb: 0.3, opacity: 0.85,
            }}>
              {log.action}
            </Typography>
          )}
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4, wordBreak: "break-word" }}>
            {log.message}
          </Typography>
          {(log.userName || log.userEmail) && (
            <Typography sx={{ fontSize: 11, color: C.textMuted, mt: 0.3 }}>
              👤 {log.userName}{log.userName && log.userEmail ? " · " : ""}{log.userEmail}
            </Typography>
          )}
        </Box>

        {/* Col 3: Expand */}
        <Box sx={{ display: "flex", alignItems: "flex-start", pt: 0.3 }}>
          {hasMeta
            ? open
              ? <ExpandLessRoundedIcon sx={{ fontSize: 16, color: C.textMuted }} />
              : <ExpandMoreRoundedIcon sx={{ fontSize: 16, color: C.textMuted }} />
            : <Box sx={{ width: 16 }} />
          }
        </Box>
      </Box>

      {/* Meta expandible */}
      {hasMeta && (
        <Collapse in={open}>
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Box sx={{ bgcolor: "#F8FAFA", borderRadius: 2, p: 1.5, border: `1px solid ${C.border}` }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.8 }}>
                Detalles
              </Typography>
              <Typography component="pre" sx={{
                fontSize: 11.5, color: C.textSec, fontFamily: "monospace",
                whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0, lineHeight: 1.6,
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

/* ── Constantes ── */
const LEVELS = [
  { value: "all",   label: "Todos los niveles" },
  { value: "info",  label: "Info" },
  { value: "warn",  label: "Aviso" },
  { value: "error", label: "Error" },
];
const CATEGORIES = [
  { value: "all",      label: "Todas" },
  { value: "auth",     label: "Auth" },
  { value: "payment",  label: "Pagos" },
  { value: "analysis", label: "Análisis" },
  { value: "training", label: "Entreno" },
  { value: "recipe",   label: "Recetas" },
  { value: "contact",  label: "Contacto" },
  { value: "admin",    label: "Admin" },
  { value: "system",   label: "Sistema" },
];
const PAGE_SIZES = [10, 25, 50];

const selectSx = {
  borderRadius: 2.5, fontSize: 13, bgcolor: C.surface,
  "& fieldset": { borderColor: C.border },
  "&:hover fieldset": { borderColor: C.brandMuted },
  "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 },
};

/* ── AdminLogs ── */
const AdminLogs = () => {
  const token = localStorage.getItem("nutrismartToken");

  const [logs,       setLogs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [limit,      setLimit]      = useState(25);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [level,      setLevel]      = useState("all");
  const [category,   setCategory]   = useState("all");
  const [from,       setFrom]       = useState("");
  const [to,         setTo]         = useState("");
  const [clearing,   setClearing]   = useState(false);

  const fetchLogs = useCallback(async (p = page, lim = limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: lim });
      if (level    !== "all") params.set("level",    level);
      if (category !== "all") params.set("category", category);
      if (search)  params.set("search", search);
      if (from)    params.set("from",   from);
      if (to)      params.set("to",     to);

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
  }, [page, limit, level, category, search, from, to, token]);

  useEffect(() => { fetchLogs(1, limit); setPage(1); }, [level, category, from, to, limit]); // eslint-disable-line
  useEffect(() => { fetchLogs(page, limit); }, [page]); // eslint-disable-line

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchLogs(1, limit); };

  const handleClearOld = async () => {
    if (!window.confirm("¿Eliminar logs de más de 30 días?")) return;
    setClearing(true);
    await fetch(`${API_URL}/api/admin/logs?olderThan=30`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    setClearing(false);
    fetchLogs(1, limit);
    setPage(1);
  };

  /* Conteo de errors/warns en la página actual */
  const errorCount = logs.filter(l => l.level === "error").length;
  const warnCount  = logs.filter(l => l.level === "warn").length;

  return (
    <Box>
      <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, overflow: "hidden", mb: 2 }}>

        {/* Header */}
        <Box sx={{ px: 3, py: 2, bgcolor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.text }}>Logs del sistema</Typography>
                {errorCount > 0 && (
                  <Chip label={`${errorCount} error${errorCount !== 1 ? "es" : ""}`} size="small"
                    sx={{ bgcolor: "#FEF2F2", color: "#B91C1C", fontWeight: 700, fontSize: 11, height: 20 }} />
                )}
                {warnCount > 0 && (
                  <Chip label={`${warnCount} aviso${warnCount !== 1 ? "s" : ""}`} size="small"
                    sx={{ bgcolor: "#FFFBEB", color: "#B45309", fontWeight: 700, fontSize: 11, height: 20 }} />
                )}
              </Stack>
              <Typography sx={{ fontSize: 12, color: C.textMuted, mt: 0.3 }}>
                {total.toLocaleString("es-AR")} eventos totales · mostrando {logs.length}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Page size */}
              <Select size="small" value={limit} onChange={(e) => { setLimit(e.target.value); setPage(1); }}
                sx={{ ...selectSx, minWidth: 80, fontSize: 12 }}>
                {PAGE_SIZES.map(s => <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s} / pág</MenuItem>)}
              </Select>
              <Tooltip title="Actualizar">
                <IconButton size="small" onClick={() => fetchLogs(page, limit)} disabled={loading}
                  sx={{ bgcolor: C.brandSurface, color: C.brand, "&:hover": { bgcolor: C.brandMuted } }}>
                  <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Button size="small" onClick={handleClearOld} disabled={clearing}
                startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 15 }} />}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, color: "#B91C1C",
                  bgcolor: "#FEF2F2", borderRadius: 999, px: 1.8, "&:hover": { bgcolor: "#FEE2E2" } }}>
                +30 días
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Filtros */}
        <Box sx={{ px: 3, py: 2, bgcolor: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
            <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 1, flex: 1, minWidth: 200 }}>
              <TextField size="small" fullWidth placeholder="Buscar mensaje, acción, usuario…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 16, color: C.textMuted }} /></InputAdornment> } }}
                sx={{ "& .MuiOutlinedInput-root": { ...selectSx, borderRadius: 999 } }}
              />
              <Button type="submit" variant="contained" size="small"
                sx={{ bgcolor: C.brand, borderRadius: 999, textTransform: "none", fontWeight: 700, px: 2, flexShrink: 0, "&:hover": { bgcolor: "#0f7a6e" } }}>
                Buscar
              </Button>
            </Box>
            <Select size="small" value={level} onChange={(e) => setLevel(e.target.value)}
              sx={{ ...selectSx, minWidth: 150 }}>
              {LEVELS.map(l => <MenuItem key={l.value} value={l.value} sx={{ fontSize: 13 }}>{l.label}</MenuItem>)}
            </Select>
            <Select size="small" value={category} onChange={(e) => setCategory(e.target.value)}
              sx={{ ...selectSx, minWidth: 140 }}>
              {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value} sx={{ fontSize: 13 }}>{c.label}</MenuItem>)}
            </Select>
            <TextField type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} label="Desde"
              sx={{ "& .MuiOutlinedInput-root": selectSx, minWidth: 135 }} />
            <TextField type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} label="Hasta"
              sx={{ "& .MuiOutlinedInput-root": selectSx, minWidth: 135 }} />
          </Stack>
        </Box>

        {/* Header columnas */}
        <Box sx={{
          display: { xs: "none", sm: "grid" },
          gridTemplateColumns: "120px 1fr 16px",
          gap: 1.5, px: 2, py: 1,
          bgcolor: "#FAFCFB", borderBottom: `1px solid ${C.border}`,
          borderLeft: "3px solid transparent",
        }}>
          {["Cuándo / Nivel", "Acción · Mensaje · Usuario", ""].map((h, i) => (
            <Typography key={i} sx={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {h}
            </Typography>
          ))}
        </Box>

        {/* Filas */}
        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress size={28} sx={{ color: C.brand }} />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ fontSize: 36, mb: 1 }}>📋</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text, mb: 0.5 }}>Sin logs</Typography>
            <Typography sx={{ fontSize: 13, color: C.textMuted }}>No hay eventos con los filtros aplicados</Typography>
          </Box>
        ) : (
          logs.map((log, i) => <LogRow key={log._id} log={log} isLast={i === logs.length - 1} />)
        )}
      </Paper>

      {/* Paginación */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
          <Button size="small" disabled={page === 1} onClick={() => setPage(1)}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, color: C.brand, borderRadius: 2, minWidth: 32, px: 1, "&:hover": { bgcolor: C.brandSurface } }}>
            «
          </Button>
          <Button size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, color: C.brand, borderRadius: 2, "&:hover": { bgcolor: C.brandSurface } }}>
            ← Anterior
          </Button>

          {/* Números de página */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            return (
              <Button key={p} size="small" onClick={() => setPage(p)}
                sx={{ minWidth: 32, px: 0.5, fontWeight: page === p ? 900 : 600, fontSize: 13,
                  textTransform: "none", borderRadius: 2,
                  bgcolor: page === p ? C.brandSurface : "transparent",
                  color: page === p ? C.brand : C.textSec,
                  "&:hover": { bgcolor: C.brandSurface } }}>
                {p}
              </Button>
            );
          })}

          <Button size="small" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, color: C.brand, borderRadius: 2, "&:hover": { bgcolor: C.brandSurface } }}>
            Siguiente →
          </Button>
          <Button size="small" disabled={page === totalPages} onClick={() => setPage(totalPages)}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, color: C.brand, borderRadius: 2, minWidth: 32, px: 1, "&:hover": { bgcolor: C.brandSurface } }}>
            »
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default AdminLogs;
