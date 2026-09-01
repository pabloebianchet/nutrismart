import { useEffect, useState } from "react";
import { Box, Typography, Chip, Button, Stack, Paper, Divider, Alert, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
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

const formatUSD = (n) => `US$${n.toFixed(2)}`;

const formatAmount = (n, currency) => (currency === "USD" ? formatUSD(n) : formatARS(n));

const formatDate = (d, isUS) =>
  d ? new Date(d).toLocaleDateString(isUS ? "en-US" : "es-AR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const daysLeft = (endDate) => {
  if (!endDate) return 0;
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const StatusBadge = ({ status, isUS }) => {
  const map = {
    active:    { label: isUS ? "Active"    : "Activa",    color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
    pending:   { label: isUS ? "Pending"   : "Pendiente", color: "#F39C12", bg: "rgba(243,156,18,0.1)" },
    cancelled: { label: isUS ? "Cancelled" : "Cancelada", color: C.danger,  bg: C.dangerSurface },
    expired:   { label: isUS ? "Expired"   : "Expirada",  color: C.textMuted, bg: C.surfaceAlt },
  };
  const s = map[status] || map.expired;
  return (
    <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: 12, border: `1px solid ${s.color}44` }} />
  );
};

const SubscriptionPage = () => {
  const { user, isUS } = useNutrition();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [sub, setSub]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [cancelOpen,     setCancelOpen]     = useState(false);
  const [cancelling,     setCancelling]     = useState(false);
  const [cancelError,    setCancelError]    = useState("");

  const token = localStorage.getItem("nutrismartToken");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSubscription = () =>
    fetch(`${API_URL}/api/payments/subscription`, { headers })
      .then((r) => r.json())
      .then((d) => setSub(d.subscription || null))
      .catch(() => {});

  const handleConfirmCancel = async (retried = false) => {
    setCancelling(true);
    setCancelError("");
    try {
      const endpoint = sub.provider === "stripe" ? "stripe/cancel" : "cancel";
      const res = await fetch(`${API_URL}/api/payments/${endpoint}`, { method: "POST", headers });
      const data = await res.json();
      // wrong_provider: el estado que teníamos cargado en pantalla estaba
      // desactualizado (ej. venía de antes de un pago reciente) — refrescar
      // y reintentar UNA vez con el endpoint correcto en vez de solo tirar
      // el error. Encontrado en vivo: esto es justo lo que le mostró a un
      // usuario real un plan viejo y terminó cancelando el pago nuevo.
      if (!res.ok && data.error === "wrong_provider" && !retried) {
        await fetchSubscription();
        return handleConfirmCancel(true);
      }
      if (!res.ok) { setCancelError(data.error || (isUS ? "Couldn't cancel. Please try again." : "No se pudo cancelar. Probá de nuevo.")); return; }
      await fetchSubscription();
      setCancelOpen(false);
    } catch {
      setCancelError(isUS ? "Couldn't cancel. Please try again." : "No se pudo cancelar. Probá de nuevo.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate("/"); return; }

    // Volviendo de un checkout recién pagado: el webhook que actualiza la
    // suscripción puede tardar unos segundos en procesar. Reintentar la
    // consulta un par de veces evita mostrar el plan viejo justo después
    // de pagar — encontrado en vivo, causó que un usuario cancelara por
    // error su suscripción nueva pensando que era la vieja.
    const isSuccessReturn = location.pathname === "/subscription/success";
    fetchSubscription().finally(() => setLoading(false));

    if (isSuccessReturn) {
      const delays = [2000, 3000, 4000]; // ~9s total, además del fetch inicial
      let cancelled = false;
      (async () => {
        for (const ms of delays) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, ms));
          if (cancelled) return;
          await fetchSubscription();
        }
      })();
      return () => { cancelled = true; };
    }
  }, [user]); // eslint-disable-line


  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ color: C.textMuted }}>{isUS ? "Loading membership…" : "Cargando membresía…"}</Typography>
      </Box>
    );
  }

  // Determinar estado — "pending" se trata como sin plan (pago no confirmado)
  const isCancelled = sub?.status === "cancelled";
  const isExpired   = !sub || sub.status === "expired" || sub.status === "pending";
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
          {isUS ? "Back to dashboard" : "Volver al panel"}
        </Button>

        <Typography sx={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.4px", mb: 5, animation: "fadeUp 0.5s ease both" }}>
          {isUS ? "My membership" : "Mi membresía"}
        </Typography>

        {/* ── Sin suscripción nunca / expirada ── */}
        {isExpired ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md, textAlign: "center", animation: "fadeUp 0.5s 0.1s ease both" }}>
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: C.brandSurface, border: `2px solid ${C.brandMuted}`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
              <AddCircleOutlineRoundedIcon sx={{ fontSize: 30, color: C.brand }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: C.textPrimary, mb: 1 }}>
              {isUS ? "No active membership" : "Sin membresía activa"}
            </Typography>
            <Typography sx={{ fontSize: 14, color: C.textSecondary, mb: 3, lineHeight: 1.65 }}>
              {isUS ? "Choose a plan to get unlimited analyses and premium features." : "Elegí un plan para acceder a análisis ilimitados y funciones premium."}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/pricing")}
              sx={{ bgcolor: C.brand, borderRadius: 2.5, py: 1.3, px: 4, textTransform: "none", fontWeight: 700, fontSize: 14.5, "&:hover": { bgcolor: C.brandLight } }}>
              {isUS ? "See plans" : "Ver planes"}
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
                {isUS ? (
                  <>
                    Your subscription was cancelled. You'll keep access to all{" "}
                    <strong>{planMeta.name} Plan</strong> benefits until{" "}
                    <strong>{formatDate(sub.endDate, isUS)}</strong> ({remaining} day{remaining !== 1 ? "s" : ""} left).
                  </>
                ) : (
                  <>
                    Tu suscripción fue cancelada. Seguís teniendo acceso a todos los beneficios del{" "}
                    <strong>Plan {planMeta.name}</strong> hasta el{" "}
                    <strong>{formatDate(sub.endDate, isUS)}</strong> ({remaining} día{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}).
                  </>
                )}
              </Alert>
            )}

            {isCancelled && remaining === 0 && (
              <Alert severity="error" sx={{ borderRadius: 3, fontSize: 13.5, animation: "fadeUp 0.5s ease both" }}>
                {isUS ? "Your subscription has expired. You can renew by choosing a new plan." : "Tu suscripción venció. Podés renovar eligiendo un plan nuevo."}
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
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{isUS ? "Your plan" : "Tu plan"}</Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.4px" }}>{isUS ? `${planMeta.name} Plan` : `Plan ${planMeta.name}`}</Typography>
                  </Box>
                </Stack>
                <StatusBadge status={sub.status} isUS={isUS} />
              </Box>

              <Box sx={{ px: 3.5, py: 3 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                  {[
                    { label: isUS ? "Monthly amount"       : "Monto mensual",      value: formatAmount(sub.amount, sub.currency) },
                    { label: isUS ? "Expires on"            : "Vence el",           value: formatDate(sub.endDate, isUS) },
                    { label: isUS ? "Subscribed since"      : "Suscripción desde",  value: formatDate(sub.startDate, isUS) },
                    { label: isUS ? "Payment method"        : "Método de pago",     value: sub.provider === "stripe" ? "Stripe" : "Mercado Pago" },
                  ].map(({ label, value }) => (
                    <Box key={label}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.4 }}>{label}</Typography>
                      <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: C.textPrimary }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* ── Cupón activo ── */}
            {isActive && sub.couponCode && (sub.couponMonthsUsed ?? 0) < 3 && (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: `1.5px solid rgba(201,149,42,0.30)`, bgcolor: "#FDF6E3", boxShadow: shadow.md, animation: "fadeUp 0.5s 0.08s ease both" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(201,149,42,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LocalOfferRoundedIcon sx={{ fontSize: 20, color: "#C9952A" }} />
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.3}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: C.textPrimary }}>
                        {isUS ? `Active discount — code ${sub.couponCode}` : `Descuento activo — código ${sub.couponCode}`}
                      </Typography>
                      <Chip label={isUS
                          ? `${3 - (sub.couponMonthsUsed ?? 0)} month${3 - sub.couponMonthsUsed !== 1 ? "s" : ""} left`
                          : `${3 - (sub.couponMonthsUsed ?? 0)} mes${3 - sub.couponMonthsUsed !== 1 ? "es" : ""} restantes`}
                        size="small" sx={{ bgcolor: "rgba(201,149,42,0.15)", color: "#C9952A", fontWeight: 700, fontSize: 11, height: 20 }} />
                    </Stack>
                    <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>
                      {isUS
                        ? `Your discount is applied automatically on renewal. After month ${sub.couponMonthsUsed + (3 - (sub.couponMonthsUsed ?? 0))}, the regular price applies.`
                        : `Tu descuento se aplica automáticamente al renovar. Después del mes ${sub.couponMonthsUsed + (3 - (sub.couponMonthsUsed ?? 0))} se cobra el precio vigente.`}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* ── Renovación manual (info) ── */}
            {isActive && (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md, animation: "fadeUp 0.5s 0.1s ease both" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: C.brandSurface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <AutorenewRoundedIcon sx={{ fontSize: 20, color: C.brand }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: C.textPrimary }}>
                      {sub.provider === "stripe"
                        ? (isUS ? "Automatic renewal" : "Renovación automática")
                        : (isUS ? "Manual renewal" : "Renovación manual")}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: C.textMuted }}>
                      {sub.provider === "stripe"
                        ? (isUS
                            ? `You'll be charged automatically every month until ${formatDate(sub.endDate, isUS)}, unless you cancel before then.`
                            : `Se cobra automáticamente cada mes hasta el ${formatDate(sub.endDate, isUS)}, salvo que canceles antes.`)
                        : (isUS
                            ? `We'll email you before ${formatDate(sub.endDate, isUS)} so you can renew whenever you want.`
                            : `Te avisamos por mail antes del ${formatDate(sub.endDate, isUS)} para que puedas renovar cuando quieras.`)}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2.5 }} />
                <Button
                  onClick={() => { setCancelError(""); setCancelOpen(true); }}
                  startIcon={<CancelRoundedIcon sx={{ fontSize: 17 }} />}
                  sx={{
                    textTransform: "none", fontWeight: 700, fontSize: 13, color: C.danger,
                    px: 1, "&:hover": { bgcolor: C.dangerSurface },
                  }}
                >
                  {isUS ? "Cancel subscription" : "Cancelar suscripción"}
                </Button>
              </Paper>
            )}

            {/* ── Historial de pagos (siempre visible si existe) ── */}
            {hasHistory && (
              <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${C.border}`, boxShadow: shadow.md, overflow: "hidden", animation: "fadeUp 0.5s 0.15s ease both" }}>
                <Box sx={{ px: 3.5, py: 2.5, borderBottom: `1px solid ${C.border}`, bgcolor: C.surfaceAlt, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 18, color: C.brand }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary }}>{isUS ? "Payment history" : "Historial de pagos"}</Typography>
                </Box>
                <Stack divider={<Divider sx={{ borderColor: C.border }} />}>
                  {sub.paymentHistory.slice(0, 6).map((p, i) => (
                    <Box key={i} sx={{ px: 3.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: C.textPrimary }}>
                          {p.description || (isUS ? `Monthly charge ${planMeta.name} Plan` : `Cargo mensual Plan ${planMeta.name}`)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: C.textMuted }}>
                          {formatDate(p.createdAt, isUS)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>
                          {formatAmount(p.amount, p.currency || sub.currency)}
                        </Typography>
                        <Chip
                          label={p.status === "approved" ? (isUS ? "Paid" : "Pagado") : p.status}
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


            {/* ── Renovar / reactivar (si cancelado) ── */}
            {isCancelled && (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: `1.5px solid ${planMeta.color}33`, bgcolor: planMeta.bg, boxShadow: shadow.md, animation: "fadeUp 0.5s 0.2s ease both" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: C.textPrimary, mb: 0.3 }}>{isUS ? "Want to continue?" : "¿Querés continuar?"}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: C.textSecondary }}>
                      {isUS ? "You can choose a new plan anytime." : "Podés elegir un plan nuevo en cualquier momento."}
                    </Typography>
                  </Box>
                  <Button onClick={() => navigate("/pricing")} variant="contained"
                    sx={{ bgcolor: C.brand, borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13, px: 2.5, "&:hover": { bgcolor: C.brandLight } }}>
                    {isUS ? "See plans" : "Ver planes"}
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* ── Upgrade Silver → Gold (solo si activa) ── */}
            {sub.plan === "silver" && isActive && (
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: "1.5px solid rgba(201,149,42,0.3)", bgcolor: "#FDF6E3", boxShadow: shadow.md, animation: "fadeUp 0.5s 0.25s ease both" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: "#0F2420", mb: 0.3 }}>{isUS ? "Upgrade to Gold Plan" : "Mejorar a Plan Gold"}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: C.textSecondary }}>{isUS ? "Unlimited analyses and priority features." : "Análisis ilimitados y funciones prioritarias."}</Typography>
                  </Box>
                  <Button onClick={() => navigate("/pricing")} variant="contained"
                    sx={{ bgcolor: "#C9952A", borderRadius: 2.5, textTransform: "none", fontWeight: 700, fontSize: 13, px: 2.5, "&:hover": { bgcolor: "#b8841f" } }}>
                    {isUS ? "See Gold Plan" : "Ver Plan Gold"}
                  </Button>
                </Stack>
              </Paper>
            )}

          </Stack>
        )}
      </Box>

      {/* ── Confirmar cancelación ── */}
      <Dialog open={cancelOpen} onClose={() => !cancelling && setCancelOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, mx: 2, maxWidth: 420 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.2, fontSize: 17, fontWeight: 800, color: C.textPrimary }}>
          <WarningAmberRoundedIcon sx={{ color: C.danger }} />
          {isUS ? "Cancel subscription" : "Cancelar suscripción"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.7, mb: cancelError ? 1.5 : 0 }}>
            {isUS ? (
              <>
                You'll keep access to all <strong>{planMeta?.name} Plan</strong> benefits until{" "}
                <strong>{formatDate(sub?.endDate, isUS)}</strong>. After that date you won't be charged again.
              </>
            ) : (
              <>
                Vas a seguir teniendo acceso a todos los beneficios del <strong>Plan {planMeta?.name}</strong> hasta
                el <strong>{formatDate(sub?.endDate, isUS)}</strong>. Después de esa fecha no se te va a cobrar de nuevo.
              </>
            )}
          </Typography>
          {cancelError && (
            <Typography sx={{ fontSize: 13, color: C.danger, fontWeight: 600 }}>{cancelError}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setCancelOpen(false)} disabled={cancelling}
            sx={{ textTransform: "none", fontWeight: 600, color: C.textSecondary, borderRadius: 2.5 }}>
            {isUS ? "Back" : "Volver"}
          </Button>
          <Button
            onClick={() => handleConfirmCancel()}
            disabled={cancelling}
            variant="contained"
            startIcon={cancelling ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : null}
            sx={{ bgcolor: C.danger, borderRadius: 2.5, textTransform: "none", fontWeight: 700, px: 2.5, "&:hover": { bgcolor: "#c73f3e" } }}
          >
            {cancelling ? (isUS ? "Cancelling…" : "Cancelando…") : (isUS ? "Yes, cancel" : "Sí, cancelar")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPage;
