import { useEffect, useState } from "react";
import {
  Box, Typography, Stack, Paper, Button, TextField, Chip,
  IconButton, Divider, Select, MenuItem, InputAdornment, Tooltip,
  Collapse, Alert,
} from "@mui/material";
import AddRoundedIcon             from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon   from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon      from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon      from "@mui/icons-material/ExpandLessRounded";
import ToggleOnRoundedIcon        from "@mui/icons-material/ToggleOnRounded";
import ToggleOffOutlinedIcon      from "@mui/icons-material/ToggleOffOutlined";
import ContentCopyRoundedIcon     from "@mui/icons-material/ContentCopyRounded";
import ReceiptLongOutlinedIcon    from "@mui/icons-material/ReceiptLongOutlined";
import { API_URL } from "../config/api";

const C = {
  brand:        "#0B5E55",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F7F9F8",
  border:       "rgba(11,94,85,0.10)",
  text:         "#0F2420",
  textSec:      "#4A6B67",
  textMuted:    "#8AADAA",
  danger:       "#E24B4A",
  dangerSurf:   "rgba(226,75,74,0.07)",
  gold:         "#C9952A",
  goldSurf:     "#FDF6E3",
  silver:       "#71879C",
  silverSurf:   "#EEF2F5",
  purple:       "#7C3AED",
  purpleSurf:   "#F5F3FF",
};

const shadow = {
  sm: "0 1px 3px rgba(11,94,85,0.07)",
  md: "0 4px 14px rgba(11,94,85,0.09)",
};

const fmtARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n ?? 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const planLabel = (p) => p === "silver" ? "Silver" : p === "gold" ? "Gold" : "Silver y Gold";
const planColor = (p) => p === "silver" ? C.silver : p === "gold" ? C.gold : C.brand;
const planBg    = (p) => p === "silver" ? C.silverSurf : p === "gold" ? C.goldSurf : C.brandSurface;

const EMPTY_FORM = {
  code: "", creatorName: "", creatorEmail: "",
  discountPct: "", appliesTo: "both", maxUses: "", validUntil: "",
};

/* ─── Fila de cupón ──────────────────────────────────────────── */
const CouponRow = ({ coupon, onToggle, onDelete }) => {
  const [open, setOpen] = useState(false);

  const totalUses    = coupon.usages?.length ?? 0;
  const totalDesc    = coupon.usages?.reduce((a, u) => a + (u.discountAmount ?? 0), 0) ?? 0;
  const totalFinal   = coupon.usages?.reduce((a, u) => a + (u.finalAmount ?? 0), 0) ?? 0;
  const silverUses   = coupon.usages?.filter((u) => u.plan === "silver").length ?? 0;
  const goldUses     = coupon.usages?.filter((u) => u.plan === "gold").length ?? 0;

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${C.border}`, overflow: "hidden", bgcolor: C.surface }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" sx={{ px: 2.5, py: 2, flexWrap: "wrap", gap: 1.5 }}>

        {/* Código */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 130 }}>
          <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: C.purpleSurf, border: `1px solid ${C.purple}30` }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: C.purple, letterSpacing: "0.05em" }}>
              {coupon.code}
            </Typography>
          </Box>
          <Tooltip title="Copiar código">
            <IconButton size="small" onClick={() => navigator.clipboard.writeText(coupon.code)}
              sx={{ color: C.textMuted, "&:hover": { color: C.purple } }}>
              <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Creador */}
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>{coupon.creatorName}</Typography>
          {coupon.creatorEmail && (
            <Typography sx={{ fontSize: 11, color: C.textMuted }}>{coupon.creatorEmail}</Typography>
          )}
        </Box>

        {/* Descuento */}
        <Chip label={`${coupon.discountPct}% off`} size="small"
          sx={{ bgcolor: C.goldSurf, color: C.gold, fontWeight: 800, fontSize: 12, border: `1px solid ${C.gold}30` }} />

        {/* Aplica a */}
        <Chip label={planLabel(coupon.appliesTo)} size="small"
          sx={{ bgcolor: planBg(coupon.appliesTo), color: planColor(coupon.appliesTo), fontWeight: 700, fontSize: 11 }} />

        {/* Usos */}
        <Stack alignItems="center" sx={{ minWidth: 50 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: C.brand, lineHeight: 1 }}>{totalUses}</Typography>
          <Typography sx={{ fontSize: 10, color: C.textMuted }}>usos</Typography>
        </Stack>

        {/* Estado */}
        <Tooltip title={coupon.active ? "Activo — click para desactivar" : "Inactivo — click para activar"}>
          <IconButton onClick={() => onToggle(coupon._id, !coupon.active)} size="small"
            sx={{ color: coupon.active ? C.brand : C.textMuted }}>
            {coupon.active
              ? <ToggleOnRoundedIcon sx={{ fontSize: 28 }} />
              : <ToggleOffOutlinedIcon sx={{ fontSize: 28 }} />}
          </IconButton>
        </Tooltip>

        {/* Eliminar */}
        <IconButton onClick={() => onDelete(coupon._id, coupon.code)} size="small"
          sx={{ color: C.textMuted, "&:hover": { color: C.danger, bgcolor: C.dangerSurf } }}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>

        {/* Expandir */}
        <IconButton onClick={() => setOpen((p) => !p)} size="small" sx={{ color: C.textMuted }}>
          {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        </IconButton>
      </Stack>

      {/* Detalle expandible */}
      <Collapse in={open}>
        <Divider sx={{ borderColor: C.border }} />
        <Box sx={{ px: 2.5, py: 2.5, bgcolor: C.surfaceAlt }}>

          {/* Resumen numérico */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1.5, mb: 2.5 }}>
            {[
              { label: "Usos Silver",      value: silverUses, color: C.silver },
              { label: "Usos Gold",        value: goldUses,   color: C.gold   },
              { label: "Total descontado", value: fmtARS(totalDesc), color: C.danger },
              { label: "Total cobrado",    value: fmtARS(totalFinal), color: C.brand },
              { label: "Vence",            value: fmtDate(coupon.validUntil), color: C.textSec },
              { label: "Límite de usos",   value: coupon.maxUses ?? "Sin límite", color: C.textSec },
            ].map(({ label, value, color }) => (
              <Box key={label} sx={{ bgcolor: C.surface, p: 1.5, borderRadius: 2, border: `1px solid ${C.border}` }}>
                <Typography sx={{ fontSize: 10.5, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.3 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Historial de usos */}
          {coupon.usages?.length > 0 ? (
            <>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: 14, color: C.textMuted }} />
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Historial de usos
                </Typography>
              </Stack>
              <Stack spacing={0.8}>
                {[...coupon.usages].reverse().map((u, i) => (
                  <Stack key={i} direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ px: 2, py: 1.2, bgcolor: C.surface, borderRadius: 2, border: `1px solid ${C.border}` }}>
                    <Box>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{u.userEmail}</Typography>
                      <Typography sx={{ fontSize: 11, color: C.textMuted }}>{fmtDate(u.createdAt)}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip label={u.plan === "silver" ? "Silver" : "Gold"} size="small"
                        sx={{ height: 18, fontSize: 10, fontWeight: 700,
                          bgcolor: u.plan === "silver" ? C.silverSurf : C.goldSurf,
                          color:   u.plan === "silver" ? C.silver : C.gold }} />
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: 12, color: C.danger, fontWeight: 700 }}>
                          -{fmtARS(u.discountAmount)}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: C.textMuted }}>
                          Cobrado: {fmtARS(u.finalAmount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </>
          ) : (
            <Typography sx={{ fontSize: 13, color: C.textMuted }}>Este cupón aún no fue utilizado.</Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

/* ─── AdminCoupons ────────────────────────────────────────────── */
const AdminCoupons = ({ token }) => {
  const [coupons,    setCoupons]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/coupons`, { headers });
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleCreate = async () => {
    setFormError("");
    if (!form.code.trim())        return setFormError("El código es requerido.");
    if (!form.creatorName.trim()) return setFormError("El nombre del creador es requerido.");
    if (!form.discountPct)        return setFormError("El descuento es requerido.");

    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/coupons`, {
        method: "POST", headers,
        body: JSON.stringify({ ...form, discountPct: Number(form.discountPct), maxUses: form.maxUses || null, validUntil: form.validUntil || null }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Error al crear."); return; }
      setCoupons((p) => [data.coupon, ...p]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch { setFormError("Error de conexión."); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id, active) => {
    const res  = await fetch(`${API_URL}/api/admin/coupons/${id}`, {
      method: "PATCH", headers, body: JSON.stringify({ active }),
    });
    if (res.ok) setCoupons((p) => p.map((c) => c._id === id ? { ...c, active } : c));
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`¿Eliminar el cupón ${code}?`)) return;
    const res = await fetch(`${API_URL}/api/admin/coupons/${id}`, { method: "DELETE", headers });
    if (res.ok) setCoupons((p) => p.filter((c) => c._id !== id));
  };

  if (loading) return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Typography sx={{ color: C.textMuted, fontSize: 14 }}>Cargando cupones…</Typography>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={3} gap={2}>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.text }}>Cupones de descuento</Typography>
          <Typography sx={{ fontSize: 12, color: C.textMuted, mt: 0.3 }}>
            {coupons.length} cupón{coupons.length !== 1 ? "es" : ""} · descuento válido por 3 meses por usuario
          </Typography>
        </Box>
        <Button
          startIcon={<AddRoundedIcon />}
          onClick={() => setShowForm((p) => !p)}
          variant={showForm ? "outlined" : "contained"}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderRadius: 2.5, px: 2.5,
            bgcolor: showForm ? "transparent" : C.brand, borderColor: C.brand, color: showForm ? C.brand : "#fff",
            "&:hover": { bgcolor: showForm ? C.brandSurface : C.brandLight } }}
        >
          {showForm ? "Cancelar" : "Nuevo cupón"}
        </Button>
      </Stack>

      {/* Formulario crear */}
      <Collapse in={showForm}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1.5px solid ${C.brandMuted}`, bgcolor: C.brandSurface, mb: 3 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: C.text, mb: 2.5 }}>Crear nuevo cupón</Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField label="Código (ej: PABLONUI)" value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              size="small" fullWidth
              slotProps={{ htmlInput: { maxLength: 20 } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: C.surface } }} />

            <TextField label="Nombre del creador" value={form.creatorName}
              onChange={(e) => setForm((p) => ({ ...p, creatorName: e.target.value }))}
              size="small" fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: C.surface } }} />

            <TextField label="Email del creador (opcional)" value={form.creatorEmail}
              onChange={(e) => setForm((p) => ({ ...p, creatorEmail: e.target.value }))}
              size="small" fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: C.surface } }} />

            <TextField label="Descuento (%)" value={form.discountPct} type="number"
              onChange={(e) => setForm((p) => ({ ...p, discountPct: e.target.value }))}
              size="small" fullWidth
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: C.surface } }} />

            <Select value={form.appliesTo} size="small"
              onChange={(e) => setForm((p) => ({ ...p, appliesTo: e.target.value }))}
              sx={{ borderRadius: 2, bgcolor: C.surface, fontSize: 13 }}>
              <MenuItem value="both">Silver y Gold</MenuItem>
              <MenuItem value="silver">Solo Silver</MenuItem>
              <MenuItem value="gold">Solo Gold</MenuItem>
            </Select>

            <TextField label="Límite de usos (opcional)" value={form.maxUses} type="number"
              onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
              size="small" fullWidth placeholder="Sin límite"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: C.surface } }} />

            <TextField label="Válido hasta (opcional)" value={form.validUntil} type="date"
              onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
              size="small" fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: C.surface } }} />
          </Box>

          {formError && <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: 12.5 }}>{formError}</Alert>}

          <Button onClick={handleCreate} disabled={saving} variant="contained" fullWidth
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13.5, py: 1.2,
              bgcolor: C.brand, "&:hover": { bgcolor: C.brandLight } }}>
            {saving ? "Creando…" : "Crear cupón"}
          </Button>
        </Paper>
      </Collapse>

      {/* Lista de cupones */}
      {coupons.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: `1px solid ${C.border}`, textAlign: "center" }}>
          <Typography sx={{ fontSize: 32, mb: 1 }}>🎟️</Typography>
          <Typography sx={{ fontSize: 14, color: C.textMuted }}>No hay cupones creados todavía.</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {coupons.map((c) => (
            <CouponRow key={c._id} coupon={c} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AdminCoupons;
