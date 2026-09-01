import { useState, useEffect } from "react";
import {
  Box, Typography, Chip, Button, Stack,
  TextField, InputAdornment, CircularProgress, Dialog, DialogContent, Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import CheckRoundedIcon             from "@mui/icons-material/CheckRounded";
import RocketLaunchRoundedIcon      from "@mui/icons-material/RocketLaunchRounded";
import DiamondOutlinedIcon          from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import BoltRoundedIcon              from "@mui/icons-material/BoltRounded";
import AccessTimeRoundedIcon        from "@mui/icons-material/AccessTimeRounded";
import LocalOfferRoundedIcon        from "@mui/icons-material/LocalOfferRounded";
import LockOutlinedIcon             from "@mui/icons-material/LockOutlined";
import LockRoundedIcon              from "@mui/icons-material/LockRounded";
import SearchRoundedIcon            from "@mui/icons-material/SearchRounded";
import RestaurantRoundedIcon        from "@mui/icons-material/RestaurantRounded";
import FitnessCenterRoundedIcon     from "@mui/icons-material/FitnessCenterRounded";
import BarChartRoundedIcon          from "@mui/icons-material/BarChartRounded";
import SportsEsportsRoundedIcon     from "@mui/icons-material/SportsEsportsRounded";
import StraightenRoundedIcon        from "@mui/icons-material/StraightenRounded";
import EmailRoundedIcon             from "@mui/icons-material/EmailRounded";
import CalendarMonthRoundedIcon     from "@mui/icons-material/CalendarMonthRounded";
import StarRoundedIcon              from "@mui/icons-material/StarRounded";
import TrackChangesRoundedIcon      from "@mui/icons-material/TrackChangesRounded";
import { API_URL } from "../config/api";
import usePageMeta from "../hooks/usePageMeta";

const C = {
  brand:        "#0B5E55",
  brandLight:   "#0f7a6e",
  brandSurface: "#E6F5F3",
  brandMuted:   "#B2DDD9",
  textPrimary:  "#0F2420",
  textSecondary:"#4A6B67",
  textMuted:    "#8AADAA",
};

const feat = (Icon, text) => ({ Icon, text });

const PLANS = [
  {
    id:        "free",
    name:      "Free",
    subtitle:  "7 días sin límites",
    price:     null,
    priceLabel:"Gratis",
    label:     "Sin tarjeta de crédito",
    Icon:      RocketLaunchRoundedIcon,
    color:     "#0B5E55",
    bg:        "#E6F5F3",
    border:    "rgba(11,94,85,0.25)",
    highlight: false,
    badge:     "Empezá hoy",
    badgeBg:   "#0B5E55",
    features: [
      feat(SearchRoundedIcon, "Análisis de alimentos ilimitados"),
      feat(RestaurantRoundedIcon, "Recetas YA con IA, ilimitadas"),
      feat(FitnessCenterRoundedIcon, "Plan de entrenamiento personalizado"),
      feat(BoltRoundedIcon, "Balance calórico diario por voz"),
      feat(BarChartRoundedIcon, "Dashboard + puntaje saludable"),
      feat(SportsEsportsRoundedIcon, "Avatar y ranking global"),
    ],
    cta: "Comenzar prueba gratis",
    ctaAction: "start_free",
  },
  {
    id:        "silver",
    name:      "Silver",
    subtitle:  "Para uso diario",
    label:     "Por mes · renovación manual",
    Icon:      DiamondOutlinedIcon,
    color:     "#71879C",
    bg:        "#EEF2F5",
    border:    "rgba(113,135,156,0.25)",
    highlight: false,
    features: [
      feat(SearchRoundedIcon, "1 análisis de producto por día"),
      feat(RestaurantRoundedIcon, "Recetas YA ilimitadas"),
      feat(FitnessCenterRoundedIcon, "1 plan de entrenamiento activo"),
      feat(BoltRoundedIcon, "Balance energético diario por voz"),
      feat(BarChartRoundedIcon, "Historial de análisis (30 días)"),
      feat(StraightenRoundedIcon, "Dashboard + métricas + IMC"),
      feat(EmailRoundedIcon, "Soporte por email"),
    ],
    cta: "Elegir Silver",
  },
  {
    id:        "gold",
    name:      "Gold",
    subtitle:  "Sin límites, sin compromisos",
    label:     "Por mes · renovación manual",
    Icon:      WorkspacePremiumOutlinedIcon,
    color:     "#C9952A",
    bg:        "linear-gradient(135deg, #FDF6E3 0%, #FEF9EC 100%)",
    border:    "rgba(201,149,42,0.35)",
    highlight: true,
    badge:     "Más popular",
    badgeBg:   "#C9952A",
    features: [
      feat(SearchRoundedIcon, "Análisis de alimentos ilimitados"),
      feat(RestaurantRoundedIcon, "Recetas YA ilimitadas + guardar favoritas"),
      feat(FitnessCenterRoundedIcon, "Hasta 2 planes de entrenamiento activos"),
      feat(BoltRoundedIcon, "Balance energético diario por voz"),
      feat(CalendarMonthRoundedIcon, "Historial mensual de balance (tabla por día)"),
      feat(BarChartRoundedIcon, "Historial completo sin límite"),
      feat(StarRoundedIcon, "Dashboard premium + estadísticas detalladas"),
      feat(RocketLaunchRoundedIcon, "Acceso anticipado a nuevas funciones"),
      feat(TrackChangesRoundedIcon, "Soporte prioritario"),
    ],
    cta: "Elegir Gold",
  },
];

// Misma estructura que PLANS (mismos id/Icon/color) — solo texto en inglés,
// se usa cuando isUS. Mantenerla en sync manualmente si se edita PLANS.
const PLANS_EN = [
  {
    id: "free", name: "Free", subtitle: "7-day free trial", price: null,
    priceLabel: "Free", label: "No credit card required",
    Icon: RocketLaunchRoundedIcon, color: "#0B5E55", bg: "#E6F5F3",
    border: "rgba(11,94,85,0.25)", highlight: false, badge: "Start today", badgeBg: "#0B5E55",
    features: [
      feat(SearchRoundedIcon, "Unlimited food analysis"),
      feat(RestaurantRoundedIcon, "Unlimited AI-generated recipes"),
      feat(FitnessCenterRoundedIcon, "Personalized training plan"),
      feat(BoltRoundedIcon, "Daily calorie tracking by voice"),
      feat(BarChartRoundedIcon, "Dashboard + health score"),
      feat(SportsEsportsRoundedIcon, "Avatar and global ranking"),
    ],
    cta: "Start free trial", ctaAction: "start_free",
  },
  {
    id: "silver", name: "Silver", subtitle: "For everyday use", label: "Per month · auto-renews",
    Icon: DiamondOutlinedIcon, color: "#71879C", bg: "#EEF2F5",
    border: "rgba(113,135,156,0.25)", highlight: false,
    features: [
      feat(SearchRoundedIcon, "1 product analysis per day"),
      feat(RestaurantRoundedIcon, "Unlimited AI recipes"),
      feat(FitnessCenterRoundedIcon, "1 active training plan"),
      feat(BoltRoundedIcon, "Daily energy balance by voice"),
      feat(BarChartRoundedIcon, "Analysis history (30 days)"),
      feat(StraightenRoundedIcon, "Dashboard + metrics + BMI"),
      feat(EmailRoundedIcon, "Email support"),
    ],
    cta: "Choose Silver",
  },
  {
    id: "gold", name: "Gold", subtitle: "No limits, no compromises", label: "Per month · auto-renews",
    Icon: WorkspacePremiumOutlinedIcon, color: "#C9952A",
    bg: "linear-gradient(135deg, #FDF6E3 0%, #FEF9EC 100%)",
    border: "rgba(201,149,42,0.35)", highlight: true, badge: "Most popular", badgeBg: "#C9952A",
    features: [
      feat(SearchRoundedIcon, "Unlimited food analysis"),
      feat(RestaurantRoundedIcon, "Unlimited AI recipes + save favorites"),
      feat(FitnessCenterRoundedIcon, "Up to 2 active training plans"),
      feat(BoltRoundedIcon, "Daily energy balance by voice"),
      feat(CalendarMonthRoundedIcon, "Monthly balance history (daily table)"),
      feat(BarChartRoundedIcon, "Unlimited full history"),
      feat(StarRoundedIcon, "Premium dashboard + detailed stats"),
      feat(RocketLaunchRoundedIcon, "Early access to new features"),
      feat(TrackChangesRoundedIcon, "Priority support"),
    ],
    cta: "Choose Gold",
  },
];

const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

// "US$" en vez de solo "$" — el símbolo pelado es ambiguo (en Argentina "$"
// es pesos), y esta página puede verse desde cualquier lado del mundo.
const formatUSD = (n) => `US$${n.toFixed(2)}`;

/* ── Modal de checkout ───────────────────────────────────────── */
const CheckoutModal = ({ plan, planPrices, isUS, onClose, onPay }) => {
  const [couponInput, setCouponInput] = useState("");
  const [validating,  setValidating]  = useState(false);
  const [couponData,  setCouponData]  = useState(null);
  const [couponError, setCouponError] = useState("");
  const [paying,      setPaying]      = useState(false);

  const basePrice = plan.id === "silver" ? planPrices.silver : planPrices.gold;
  const finalPrice = couponData ? couponData.finalAmount : basePrice;
  const fmt = isUS ? formatUSD : formatARS;

  const validateCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setValidating(true);
    setCouponError("");
    setCouponData(null);
    try {
      const token = localStorage.getItem("nutrismartToken");
      const endpoint = isUS ? "stripe/validate-coupon" : "validate-coupon";
      const res   = await fetch(`${API_URL}/api/payments/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, plan: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || (isUS ? "Invalid code." : "Código inválido.")); }
      else         { setCouponData(data); }
    } catch {
      setCouponError(isUS ? "Error validating the code." : "Error al validar el código.");
    } finally {
      setValidating(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await onPay(plan, couponData?.code ?? null);
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog open onClose={onClose}
      PaperProps={{ sx: { borderRadius: 5, mx: 2, maxWidth: 400, width: "100%" } }}>
      <DialogContent sx={{ p: 3.5 }}>

        {/* Header plan */}
        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: `${plan.color}18`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <plan.Icon sx={{ fontSize: 24, color: plan.color }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {isUS ? "Confirm plan" : "Confirmar plan"}
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.4px" }}>
              {isUS ? `${plan.name} Plan` : `Plan ${plan.name}`}
            </Typography>
          </Box>
          <Box sx={{ ml: "auto !important", textAlign: "right" }}>
            {!isUS && couponData && (
              <Typography sx={{ fontSize: 13, color: C.textMuted, textDecoration: "line-through", lineHeight: 1 }}>
                {fmt(basePrice)}
              </Typography>
            )}
            <Typography sx={{ fontSize: 26, fontWeight: 900, color: plan.color, lineHeight: 1.1 }}>
              {fmt(finalPrice)}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textMuted }}>{isUS ? "per month" : "por mes"}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* Cupón */}
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.2 }}>
          {isUS ? "Have a discount code?" : "¿Tenés un código de descuento?"}
        </Typography>

        {!couponData ? (
          <Stack direction="row" spacing={1} mb={couponError ? 0 : 2.5}>
            <TextField
              placeholder={isUS ? "e.g. PABLONUI" : "Ej: PABLONUI"}
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
              onKeyDown={(e) => e.key === "Enter" && validateCoupon()}
              size="small"
              fullWidth
              error={!!couponError}
              helperText={couponError}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOfferRoundedIcon sx={{ fontSize: 15, color: C.textMuted }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2, fontSize: 13,
                  "& fieldset": { borderColor: "rgba(11,94,85,0.20)" },
                  "&.Mui-focused fieldset": { borderColor: C.brand, borderWidth: 1.5 },
                },
              }}
            />
            <Button
              onClick={validateCoupon}
              disabled={!couponInput.trim() || validating}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, fontSize: 13,
                px: 2.5, whiteSpace: "nowrap", borderColor: C.brand, color: C.brand,
                "&:hover": { bgcolor: C.brandSurface } }}
            >
              {validating ? <CircularProgress size={14} sx={{ color: C.brand }} /> : isUS ? "Apply" : "Aplicar"}
            </Button>
          </Stack>
        ) : (
          <Box sx={{ px: 2, py: 1.5, borderRadius: 2.5, bgcolor: "#E8F5E9",
            border: "1.5px solid rgba(46,125,50,0.25)", mb: 2.5,
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocalOfferRoundedIcon sx={{ fontSize: 16, color: "#2E7D32" }} />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#2E7D32" }}>
                  -{couponData.discountPct}% · {couponData.code}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#4A6B67" }}>
                  {isUS
                    ? `Valid for ${couponData.monthsLeft} month${couponData.monthsLeft !== 1 ? "s" : ""} · from ${couponData.creatorName}`
                    : `Válido ${couponData.monthsLeft} mes${couponData.monthsLeft !== 1 ? "es" : ""} · de ${couponData.creatorName}`}
                </Typography>
              </Box>
            </Stack>
            <Chip label={`-${fmt(basePrice - finalPrice)}`} size="small"
              sx={{ bgcolor: "rgba(46,125,50,0.12)", color: "#2E7D32", fontWeight: 800, fontSize: 11 }} />
          </Box>
        )}

        {couponError && <Box sx={{ mb: 2.5 }} />}

        {/* Botón pagar */}
        <Button
          fullWidth
          variant="contained"
          disabled={paying}
          onClick={handlePay}
          startIcon={paying ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <LockOutlinedIcon />}
          sx={{
            bgcolor: plan.highlight ? plan.color : C.brand,
            borderRadius: 2.5, py: 1.5, textTransform: "none",
            fontWeight: 800, fontSize: 15, mb: 1.5,
            boxShadow: plan.highlight ? `0 4px 16px ${plan.color}44` : "0 4px 16px rgba(11,94,85,0.28)",
            "&:hover": { bgcolor: plan.highlight ? "#b8841f" : C.brandLight },
          }}
        >
          {paying
            ? (isUS ? "Redirecting…" : "Redirigiendo…")
            : isUS ? `Pay with Stripe · ${fmt(finalPrice)}` : `Ir a Mercado Pago · ${fmt(finalPrice)}`}
        </Button>

        <Button fullWidth onClick={onClose}
          sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600, fontSize: 13.5,
            color: C.textSecondary, "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}>
          {isUS ? "Cancel" : "Cancelar"}
        </Button>

        <Typography sx={{ textAlign: "center", fontSize: 11, color: C.textMuted, mt: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
          <LockRoundedIcon sx={{ fontSize: 13 }} /> {isUS ? "Secure payment processed by Stripe" : "Pago seguro procesado por Mercado Pago"}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

/* ── PricingPage ─────────────────────────────────────────────── */
const PricingPage = () => {
  usePageMeta({
    title:       "Planes y precios — Nui App | Silver $6.890 · Gold $8.980",
    description: "Elegí el plan de salud que mejor te quede. 7 días gratis sin tarjeta. Plan Silver $6.890/mes o Gold $8.980/mes con análisis ilimitados, recetas, entrenamiento y balance energético.",
    canonical:   "/pricing",
  });
  const { user, subPlan, subStatus, trialDaysLeft, isTrialExpired, refreshSubscription } = useNutrition();
  const navigate = useNavigate();
  const [planPrices,    setPlanPrices]    = useState({ silver: 2990, gold: 5990 });
  const [usdPrices,     setUsdPrices]     = useState({ silver: 6.99, gold: 12.99 });
  const [isUS,          setIsUS]          = useState(false); // default: Argentina/Mercado Pago
  const [checkoutPlan,  setCheckoutPlan]  = useState(null); // plan a pagar

  useEffect(() => {
    refreshSubscription();
    fetch(`${API_URL}/api/payments/plans`)
      .then((r) => r.json())
      .then((d) => setPlanPrices({ silver: d.silver?.amount ?? 2990, gold: d.gold?.amount ?? 5990 }))
      .catch(() => {});
    fetch(`${API_URL}/api/payments/stripe/plans`)
      .then((r) => r.json())
      .then((d) => setUsdPrices({ silver: d.silver?.amount ?? 6.99, gold: d.gold?.amount ?? 12.99 }))
      .catch(() => {});
    // Override de prueba — abrí /pricing?region=us para forzar la vista de
    // EE.UU. sin necesitar una IP real de ahí (VPN, etc). Quitar el param
    // vuelve al comportamiento normal (detección real por IP).
    const forcedRegion = new URLSearchParams(window.location.search).get("region");
    if (forcedRegion === "us") { setIsUS(true); return; }
    if (forcedRegion === "ar") { setIsUS(false); return; }

    // Detección de región — si falla o no se puede determinar, se queda con
    // el comportamiento por defecto (Argentina / Mercado Pago), nunca rompe.
    fetch(`${API_URL}/api/geo`)
      .then((r) => r.json())
      .then((d) => setIsUS(d.country === "US"))
      .catch(() => {});
  }, []); // eslint-disable-line

  const priceFor = (planId) => {
    const source = isUS ? usdPrices : planPrices;
    return planId === "silver" ? source.silver : planId === "gold" ? source.gold : null;
  };

  const handleAction = (plan) => {
    if (!user) { navigate("/"); return; }
    if (plan.ctaAction === "start_free") { navigate("/"); return; }
    setCheckoutPlan(plan);
  };

  const handlePay = async (plan, couponCode) => {
    const token = localStorage.getItem("nutrismartToken");

    if (isUS) {
      const res = await fetch(`${API_URL}/api/payments/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan.id, couponCode: couponCode || null }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Error al procesar el pago."); return; }
      window.location.href = data.url;
      return;
    }

    const res = await fetch(`${API_URL}/api/payments/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan: plan.id, couponCode: couponCode || null }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Error al procesar el pago."); return; }
    window.location.href = data.initPoint;
  };

  const getPlanState = (planId) => {
    if (!user) return "default";
    if (planId === "free") {
      if (subPlan === "free" && subStatus === "active") return "trial_active";
      if (isTrialExpired) return "trial_expired";
      return "default";
    }
    if (subPlan === planId && subStatus === "active") return "current";
    return "default";
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #edf8f5 0%, #ffffff 55%, #f4f9f7 100%)",
      position: "relative", overflow: "hidden",
      "@keyframes fadeUp": {
        from: { opacity: 0, transform: "translateY(28px)" },
        to:   { opacity: 1, transform: "translateY(0)" },
      },
    }}>
      <Box sx={{ position: "absolute", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,85,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: 0, left: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,85,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Box sx={{ px: { xs: 2.5, sm: 6, md: 10 }, pt: { xs: 11, sm: 15 }, pb: 12, maxWidth: 1100, mx: "auto", position: "relative" }}>

        {/* Hero */}
        <Box textAlign="center" sx={{ mb: 8, animation: "fadeUp 0.6s ease both" }}>
          <Chip
            icon={<BoltRoundedIcon sx={{ fontSize: "14px !important", color: `${C.brand} !important` }} />}
            label={isUS ? "Plans & pricing" : "Planes y precios"}
            sx={{ mb: 3, bgcolor: C.brandSurface, color: C.brand, fontWeight: 700, fontSize: 12, border: `1px solid ${C.brandMuted}`, px: 0.5 }}
          />
          <Typography variant="h3" component="h1" fontWeight={900} sx={{
            letterSpacing: "-1.5px", lineHeight: 1.12, mb: 3,
            background: `linear-gradient(135deg, ${C.textPrimary} 30%, ${C.brandLight} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            fontSize: { xs: 28, sm: 40 },
          }}>
            {isUS ? <>One week free,<br />then you choose</> : <>Una semana gratis,<br />después elegís vos</>}
          </Typography>
          <Typography sx={{ fontSize: { xs: 14.5, sm: 16 }, color: C.textSecondary, maxWidth: 520, mx: "auto", lineHeight: 1.8 }}>
            {isUS
              ? "Try every module with no limits for 7 days. No card required, no surprises. When your trial ends, pick the plan that fits you best."
              : "Probá todos los módulos sin límites durante 7 días. Sin tarjeta. Sin sorpresas. Cuando termina tu prueba, elegís el plan que mejor se adapta a tu estilo."}
          </Typography>
        </Box>

        {/* Cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3, alignItems: "stretch" }}>
          {(isUS ? PLANS_EN : PLANS).map((plan, i) => {
            const state = getPlanState(plan.id);
            const price = priceFor(plan.id);

            return (
              <Box key={plan.id} sx={{
                position: "relative", borderRadius: 5,
                border: `1.5px solid ${plan.border}`,
                background: typeof plan.bg === "string" && plan.bg.startsWith("linear") ? plan.bg : undefined,
                bgcolor:    typeof plan.bg === "string" && !plan.bg.startsWith("linear") ? plan.bg : undefined,
                boxShadow: plan.highlight
                  ? "0 16px 48px rgba(201,149,42,0.18), 0 4px 12px rgba(0,0,0,0.06)"
                  : "0 4px 20px rgba(11,94,85,0.07)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                animation: `fadeUp 0.6s ${0.08 + i * 0.1}s ease both`,
                display: "flex", flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: plan.highlight ? "0 24px 56px rgba(201,149,42,0.24)" : "0 20px 48px rgba(11,94,85,0.12)",
                },
              }}>
                {plan.badge && (
                  <Box sx={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    bgcolor: plan.badgeBg || plan.color, color: "#fff",
                    fontSize: 11, fontWeight: 800, px: 2, py: 0.5,
                    borderRadius: 999, whiteSpace: "nowrap", letterSpacing: "0.05em",
                    boxShadow: `0 4px 12px ${plan.badgeBg || plan.color}55`,
                  }}>
                    {plan.badge}
                  </Box>
                )}

                <Box sx={{ p: { xs: 3, sm: 3.5 }, display: "flex", flexDirection: "column", flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, flexShrink: 0, bgcolor: `${plan.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <plan.Icon sx={{ fontSize: 22, color: plan.color }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Plan</Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.3px", lineHeight: 1.2 }}>{plan.name}</Typography>
                    </Box>
                  </Stack>

                  <Typography sx={{ fontSize: 12, color: C.textMuted, mb: 2.5, fontWeight: 500 }}>{plan.subtitle}</Typography>

                  {/* Precio */}
                  <Box mb={3}>
                    {price ? (
                      <>
                        <Typography sx={{ fontSize: 38, fontWeight: 900, color: plan.color, lineHeight: 1, letterSpacing: "-1.5px" }}>
                          {isUS ? formatUSD(price) : formatARS(price)}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: C.textMuted, mt: 0.3 }}>
                          {plan.label}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontSize: 38, fontWeight: 900, color: plan.color, lineHeight: 1, letterSpacing: "-1.5px" }}>{plan.priceLabel}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: C.textMuted, mt: 0.3 }}>{plan.label}</Typography>
                      </>
                    )}
                  </Box>

                  <Box sx={{ height: "1px", bgcolor: `${plan.color}20`, mb: 3 }} />

                  <Stack spacing={1.2} mb={3.5}>
                    {plan.features.map((f) => (
                      <Box key={f.text} sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                        <f.Icon sx={{ fontSize: 17, color: C.textSecondary, flexShrink: 0, mt: "1px" }} />
                        <Typography sx={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>{f.text}</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Box sx={{ mt: "auto" }}>
                    {state === "trial_active" && plan.id === "free" ? (
                      <Box sx={{ width: "100%", py: 1.4, borderRadius: 2.5, border: `2px solid ${plan.color}`, bgcolor: `${plan.color}10`, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <AccessTimeRoundedIcon sx={{ fontSize: 17, color: plan.color }} />
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: plan.color }}>
                          {trialDaysLeft === 0
                            ? (isUS ? "Ends today" : "Vence hoy")
                            : isUS
                              ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left`
                              : `${trialDaysLeft} día${trialDaysLeft !== 1 ? "s" : ""} restante${trialDaysLeft !== 1 ? "s" : ""}`}
                        </Typography>
                      </Box>
                    ) : state === "trial_expired" && plan.id === "free" ? (
                      <Box sx={{ width: "100%", py: 1.4, borderRadius: 2.5, border: "2px solid rgba(226,75,74,0.4)", bgcolor: "rgba(226,75,74,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#E24B4A" }}>{isUS ? "Trial expired" : "Prueba expirada"}</Typography>
                      </Box>
                    ) : state === "current" ? (
                      <Box sx={{ width: "100%", py: 1.4, borderRadius: 2.5, border: `2px solid ${plan.color}`, bgcolor: `${plan.color}10`, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <CheckRoundedIcon sx={{ fontSize: 17, color: plan.color }} />
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: plan.color }}>{isUS ? "Your current plan" : "Tu plan actual"}</Typography>
                      </Box>
                    ) : plan.id === "free" ? null : (
                      <Button variant="contained" fullWidth onClick={() => handleAction(plan)}
                        sx={{
                          bgcolor: plan.highlight ? plan.color : C.brand,
                          borderRadius: 2.5, py: 1.4, textTransform: "none", fontWeight: 700, fontSize: 14.5,
                          boxShadow: plan.highlight ? `0 4px 16px ${plan.color}44` : "0 4px 16px rgba(11,94,85,0.28)",
                          "&:hover": { bgcolor: plan.highlight ? "#b8841f" : C.brandLight },
                        }}>
                        {plan.cta}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Typography sx={{ textAlign: "center", fontSize: 12.5, color: C.textMuted, mt: 5, lineHeight: 1.8 }}>
          {isUS
            ? <>Payments are processed securely through Stripe.<br />Renews automatically every month — cancel anytime, no commitment.</>
            : <>El pago se procesa de forma segura a través de Mercado Pago.<br />Te avisamos por mail antes del vencimiento para que puedas renovar cuando quieras.</>}
        </Typography>
      </Box>

      {/* Modal de checkout */}
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          planPrices={isUS ? usdPrices : planPrices}
          isUS={isUS}
          onClose={() => setCheckoutPlan(null)}
          onPay={handlePay}
        />
      )}
    </Box>
  );
};

export default PricingPage;
