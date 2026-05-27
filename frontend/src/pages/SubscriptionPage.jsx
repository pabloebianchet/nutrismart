import { useEffect, useState } from "react";
import { Box, Typography, Chip, Button, Stack, Paper, Divider, Switch, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { API_URL } from "../config/api";

const C = {
  brand: "#0B5E55",
  brandLight: "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted: "#B2DDD9",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9F8",
  border: "rgba(11,94,85,0.10)",
  textPrimary: "#0F2420",
  textSecondary: "#4A6B67",
  textMuted: "#8AADAA",
  danger: "#E24B4A",
  dangerSurface: "rgba(226,75,74,0.07)",
};

const shadow = { md: "0 4px 20px rgba(11,94,85,0.09)" };

const PLAN_META = {
  silver: { name: "Silver", Icon: DiamondOutlinedIcon,           color: "#71879C", bg: "#EEF2F5" },
  gold:   { name: "Gold",   Icon: WorkspacePremiumOutlinedIcon,  color: "#C9952A", bg: "#FDF6E3" },
};

const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const daysLeft = (endDate) => {
  if (!endDate) return 0;
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const StatusBadge = ({ status }) => {
  const map = {
    active:    { label: "Activa",    color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
    pending:   { label: "Pendiente", color: "#F39C12", bg: "rgba(243,156,18,0.1)" },
    cancelled: { label: "Cancelada", color: C.danger,  bg: C.dangerSurface },
    expired:   { label: "Expirada",  color: C.textMuted, bg: C.surfaceAlt },
  };
  const s = map[status] || map.expired;
  return (
    <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: 12, border: `1px solid ${s.color}44` }} />
  );
};

const SubscriptionPage = () => {
  const { user } = useNutrition();
  const navigate  = useNavigate();

  const [sub, setSub]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [togglingRenew, setTogglingRenew] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const token = localStorage.getItem("nutrismartToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    fetch(`${API_URL}/api/payments/subscription`, { headers })
      .then((r) => r.json())
      .then((d) => setSub(d.subscription || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleToggleRenew = async () => {
    setTogglingRenew(true);
    try {
      const res  = await fetch(`${API_URL}/api/payments/toggle-renew`, { method: "POST", headers });
      const data = await res.json();
      setSub((p) => ({ ...p, autoRenew: data.autoRenew }));
    } catch {} finally { setTogglingRenew(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res  = await fetch(`${API_URL}/api/payments/cancel`, { method: "POST", headers });
      const data = await res.json();
      if (res.ok) setSub((p) => ({ ...p, status: "cancelled", autoRenew: false }));
      else alert(data.error);
    } catch {} finally { setCancelling(false); setConfirmCancel(false); }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ color: C.textMuted }}>Cargando membresía…</Typography>
      </Box>
    );
  }

  // Determinar estado
  const isCancelled = sub?.status === "cancelled";
  const isExpired   = !sub || sub.status === "expired";
  const isActive    = sub?.status === "active";
  const hasHistory  = sub?.paymentHistory?.length > 0;
  const planMeta    = sub ? (PLAN_META[sub.plan] || PLAN_META.silver) : null;
  const remaining   = sub?.endDate ? daysLeft(sub.endDate) : 0;

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #edf8f5 0%, #fff 55%, #f4f9f7 100%)",
      px: { xs: 2, sm: 4, md: 8 },
      pt: { xs: 11, sm: 14 },
      pb: 10,
      "@keyframes fadeUp": { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
    }}>
      <Box sx={{ maxWidth: 720, mx: "auto" }}>

        {/* Back */}
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/")}
          sx={{ mb: 3, textTransform: "none", color: C.textSecondary, fontWeight: 600, fontSize: 13, borderRadius: 999, px: 2, border: `1px solid ${C.border}`, bgcolor: C.surface, boxShadow: "0 1px 4px rgba(11,94,85,0.06)", "&:hover": { bgcolor: C.brandSurface, borderColor: C.brandMuted, color: C.brand } }}>
          Volver al panel
        </Button>

        <Typography sx={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.4px", mb: 5, animation: "fadeUp 0.5s ease both" }}>
          Mi membresía
        </Typography>

        {/* ── Sin suscripción nunca / expirada ── */}
        {isExpired ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md, textAlign: "center", animation: "fadeUp 0.5s 0.1s ease both" }}>
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: C.brandSurface, border: `2px solid ${C.brandMuted}`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
              <AddCircleOutlineRoundedIcon sx={{ fontSize: 30, color: C.brand }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: C.textPrimary, mb: 1 }}>
              Sin membresía activa
            </Typography>
            <Typography sx={{ fontSize: 14, color: C.textSecondary, mb: 3, lineHeight: 1.65 }}>
              Elegí un plan para acceder a análisis ilimitados y funciones premium.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/pricing")}
              sx={{ bgcolor: C.brand, borderRadius: 2.5, py: 1.3, px: 4, textTransform: "none", fontWeight: 700, fontSize: 14.5, "&:hover": { bgcolor: C.brandLight } }}>
              Ver planes
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>

            {/* ── Banner: cancelado pero con días restantes ── */}
            {isCancelled && remaining > 0 && (
              <Alert
                icon={<InfoOutlinedIcon fontSize="inherit" />}
                severity="warning"
                sx={{
                  borderRadius: 3,
                  fontSize: 13.5,
                  fontWeight: 500,
                  animation: "fadeUp 0.5s ease both",
                  "& .MuiAlert-message": { lineHeight: 1.6 },
                }}
              >
                Tu suscripción fue cancelada. Seguís teniendo acceso a todos los beneficios del{" "}
                <strong>Plan {planMeta.name}</strong> hasta el{" "}
                <strong>{formatDate(sub.endDate)}</strong> ({remaining} día{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}).
              </Alert>
            )}

            {isCancelled && remaining === 0 && (
              <Alert severity="error" sx={{ borderRadius: 3, fontSize: 13.5, animation: "fadeUp 0.5s ease both" }}>
                Tu suscripción venció. Podés renovar eligiendo un plan nuevo.
              </Alert>
            )}

            {/* ── Card plan ── */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: `1.5px solid ${planMeta.color}33`, boxShadow: shadow.md, overflow: "hidden", animation: "fadeUp 0.5s 0.05s ease both" }}>
              <Box sx={{ bgcolor: planMeta.bg, px: 3.5, py: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: `${planMeta.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <planMeta.Icon sx={{ fontSize: 24, color: planMeta.color }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tu plan</Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.4px" }}>Plan {planMeta.name}</Typography>
                  </Box>
                </Stack>
                <StatusBadge status={sub.status} />
              </Box>

              <Box sx={{ px: 3.5, py: 3 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                  {[
                    { label: "Monto mensual",      value: formatARS(sub.amount) },
                    { label: "Vence el", value: formatDate(sub.endDate) },
                    { label: "Suscripción desde",  value: formatDate(sub.startDate) },
                    { label: "Método de pago",     value: "Mercado Pago" },
                  ].map(({ label, value }) => (
                    <Box key={label}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.4 }}>{label}</Typography>
                      <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: C.textPrimary }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* ── Renovación manual (info) ── */}
            {isActive && (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md, animation: "fadeUp 0.5s 0.1s ease both" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: C.brandSurface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <AutorenewRoundedIcon sx={{ fontSize: 20, color: C.brand }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: C.textPrimary }}>Renovación manual</Typography>
                    <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>
                      Te avisamos por mail antes del {formatDate(sub.endDate)} para que puedas renovar cuando quieras.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* ── Historial de pagos (siempre visible si existe) ── */}
            {hasHistory && (
              <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md, overflow: "hidden", animation: "fadeUp 0.5s 0.15s ease both" }}>
                <Box sx={{ px: 3.5, py: 2.5, borderBottom: `1px solid ${C.border}`, bgcolor: C.surfaceAlt, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 18, color: C.brand }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary }}>Historial de pagos</Typography>
                </Box>
                <Stack divider={<Divider sx={{ borderColor: C.border }} />}>
                  {sub.paymentHistory.slice(0, 6).map((p, i) => (
                    <Box key={i} sx={{ px: 3.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: C.textPrimary }}>
                          {p.description || `Cargo mensual Plan ${planMeta.name}`}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                          {formatDate(p.createdAt)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>
                          {formatARS(p.amount)}
                        </Typography>
                        <Chip
                          label={p.status === "approved" ? "Pagado" : p.status}
                          size="small"
                          sx={{
                            bgcolor: p.status === "approved" ? "rgba(46,204,113,0.1)" : C.surfaceAlt,
                            color:   p.status === "approved" ? "#2ECC71" : C.textMuted,
                            fontWeight: 700, fontSize: 11,
                          }}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* ── Cancelar (solo si activa) ── */}
            {isActive && (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md, animation: "fadeUp 0.5s 0.2s ease both" }}>
                {!confirmCancel ? (
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: C.textPrimary, mb: 0.3 }}>Cancelar suscripción</Typography>
                      <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>
                        Seguís con acceso hasta el {formatDate(sub.endDate)}.
                      </Typography>
                    </Box>
                    <Button
                      startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setConfirmCancel(true)}
                      sx={{ textTransform: "none", color: C.danger, fontWeight: 600, fontSize: 13, borderRadius: 2, px: 2, border: `1px solid ${C.dangerSurface}`, "&:hover": { bgcolor: C.dangerSurface } }}
                    >
                      Cancelar plan
                    </Button>
                  </Stack>
                ) : (
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary, mb: 1 }}>¿Confirmar cancelación?</Typography>
                    <Typography sx={{ fontSize: 13.5, color: C.textSecondary, mb: 2.5, lineHeight: 1.6 }}>
                      Tu acceso continúa hasta el <strong>{formatDate(sub.endDate)}</strong>. Después de esa fecha perdés los beneficios del plan.
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                      <Button onClick={() => setConfirmCancel(false)} sx={{ textTransform: "none", color: C.textSecondary, fontWeight: 600, borderRadius: 2, border: `1px solid ${C.border}`, px: 2.5 }}>
                        No, mantener
                      </Button>
                      <Button onClick={handleCancel} disabled={cancelling} variant="contained"
                        sx={{ textTransform: "none", bgcolor: C.danger, fontWeight: 700, borderRadius: 2, px: 2.5, "&:hover": { bgcolor: "#c73f3e" } }}>
                        {cancelling ? "Cancelando..." : "Sí, cancelar"}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Paper>
            )}

            {/* ── Renovar / reactivar (si cancelado) ── */}
            {isCancelled && (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: `1.5px solid ${planMeta.color}33`, bgcolor: planMeta.bg, boxShadow: shadow.md, animation: "fadeUp 0.5s 0.2s ease both" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: C.textPrimary, mb: 0.3 }}>¿Querés continuar?</Typography>
                    <Typography sx={{ fontSize: 12.5, color: C.textSecondary }}>
                      Podés elegir un plan nuevo en cualquier momento.
                    </Typography>
                  </Box>
                  <Button onClick={() => navigate("/pricing")} variant="contained"
                    sx={{ bgcolor: C.brand, borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13, px: 2.5, "&:hover": { bgcolor: C.brandLight } }}>
                    Ver planes
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* ── Upgrade Silver → Gold (solo si activa) ── */}
            {sub.plan === "silver" && isActive && (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: "1.5px solid rgba(201,149,42,0.3)", bgcolor: "#FDF6E3", boxShadow: shadow.md, animation: "fadeUp 0.5s 0.25s ease both" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: "#0F2420", mb: 0.3 }}>Mejorar a Plan Gold</Typography>
                    <Typography sx={{ fontSize: 12.5, color: C.textSecondary }}>Análisis ilimitados y funciones prioritarias.</Typography>
                  </Box>
                  <Button onClick={() => navigate("/pricing")} variant="contained"
                    sx={{ bgcolor: "#C9952A", borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13, px: 2.5, "&:hover": { bgcolor: "#b8841f" } }}>
                    Ver Plan Gold
                  </Button>
                </Stack>
              </Paper>
            )}

          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default SubscriptionPage;
