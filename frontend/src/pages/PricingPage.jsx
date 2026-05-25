import { useState, useEffect } from "react";
import { Box, Typography, Chip, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import CheckRoundedIcon        from "@mui/icons-material/CheckRounded";
import RocketLaunchRoundedIcon  from "@mui/icons-material/RocketLaunchRounded";
import DiamondOutlinedIcon      from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import BoltRoundedIcon          from "@mui/icons-material/BoltRounded";
import AccessTimeRoundedIcon    from "@mui/icons-material/AccessTimeRounded";
import { API_URL } from "../config/api";

const C = {
  brand:       "#0B5E55",
  brandLight:  "#0f7a6e",
  brandSurface:"#E6F5F3",
  brandMuted:  "#B2DDD9",
  textPrimary: "#0F2420",
  textSecondary:"#4A6B67",
  textMuted:   "#8AADAA",
};

/* ── Features con ícono de módulo ────────────────────────────── */
const feat = (emoji, text) => ({ emoji, text });

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
      feat("🔍", "Análisis de alimentos ilimitados"),
      feat("🍽️", "Recetas YA con IA, ilimitadas"),
      feat("🏋️", "Plan de entrenamiento personalizado"),
      feat("📊", "Dashboard + puntaje saludable"),
      feat("🎮", "Avatar y ranking global"),
      feat("✅", "Acceso completo a los 3 módulos"),
    ],
    cta: "Comenzar prueba gratis",
    ctaAction: "start_free",
  },
  {
    id:        "silver",
    name:      "Silver",
    subtitle:  "Para uso diario",
    price:     2990,
    label:     "Por mes · renovación automática",
    Icon:      DiamondOutlinedIcon,
    color:     "#71879C",
    bg:        "#EEF2F5",
    border:    "rgba(113,135,156,0.25)",
    highlight: false,
    features: [
      feat("🔍", "1 análisis de producto por día"),
      feat("🍽️", "Recetas YA ilimitadas"),
      feat("🏋️", "1 plan de entrenamiento activo"),
      feat("📊", "Historial de análisis (30 días)"),
      feat("📏", "Dashboard + métricas + IMC"),
      feat("📧", "Soporte por email"),
    ],
    cta: "Elegir Silver",
  },
  {
    id:        "gold",
    name:      "Gold",
    subtitle:  "Sin límites, sin compromisos",
    price:     5990,
    label:     "Por mes · renovación automática",
    Icon:      WorkspacePremiumOutlinedIcon,
    color:     "#C9952A",
    bg:        "linear-gradient(135deg, #FDF6E3 0%, #FEF9EC 100%)",
    border:    "rgba(201,149,42,0.35)",
    highlight: true,
    badge:     "Más popular",
    badgeBg:   "#C9952A",
    features: [
      feat("🔍", "Análisis de alimentos ilimitados"),
      feat("🍽️", "Recetas YA ilimitadas + guardar favoritas"),
      feat("🏋️", "Hasta 2 planes de entrenamiento activos en simultáneo"),
      feat("📊", "Historial completo sin límite"),
      feat("⭐", "Dashboard premium + estadísticas detalladas"),
      feat("🚀", "Acceso anticipado a nuevas funciones"),
      feat("🎯", "Soporte prioritario"),
    ],
    cta: "Elegir Gold",
  },
];

const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

/* ── Componente ─────────────────────────────────────────────── */
const PricingPage = () => {
  const { user, subPlan, subStatus, trialDaysLeft, isTrialExpired, refreshSubscription } = useNutrition();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(null);

  // Refrescar suscripción al entrar a la página (por si volvió de MP)
  useEffect(() => { refreshSubscription(); }, []); // eslint-disable-line

  const handleAction = async (plan) => {
    if (!user) { navigate("/"); return; }

    if (plan.ctaAction === "start_free") {
      navigate("/"); // ya tiene trial activo, ir al dashboard
      return;
    }

    setLoading(plan.id);
    try {
      const token = localStorage.getItem("nutrismartToken");
      const res = await fetch(`${API_URL}/api/payments/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Error al procesar el pago."); return; }
      window.location.href = data.initPoint;
    } catch {
      alert("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  };

  /* Estado actual del usuario para cada card */
  const getPlanState = (planId) => {
    if (!user) return "default";
    if (planId === "free") {
      if (subPlan === "free" && subStatus === "active") return "trial_active";
      if (isTrialExpired) return "trial_expired";
      return "default"; // ya tiene silver/gold
    }
    if (subPlan === planId && subStatus === "active") return "current";
    return "default";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #edf8f5 0%, #ffffff 55%, #f4f9f7 100%)",
        position: "relative",
        overflow: "hidden",
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(28px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Blobs */}
      <Box sx={{ position: "absolute", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,85,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: 0,   left: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,85,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Box sx={{ px: { xs: 2.5, sm: 6, md: 10 }, pt: { xs: 11, sm: 15 }, pb: 12, maxWidth: 1100, mx: "auto", position: "relative" }}>

        {/* Hero */}
        <Box textAlign="center" sx={{ mb: 8, animation: "fadeUp 0.6s ease both" }}>
          <Chip
            icon={<BoltRoundedIcon sx={{ fontSize: "14px !important", color: `${C.brand} !important` }} />}
            label="Planes y precios"
            sx={{ mb: 3, bgcolor: C.brandSurface, color: C.brand, fontWeight: 700, fontSize: 12, border: `1px solid ${C.brandMuted}`, px: 0.5 }}
          />
          <Typography variant="h3" fontWeight={900} sx={{
            letterSpacing: "-1.5px", lineHeight: 1.12, mb: 3,
            background: `linear-gradient(135deg, ${C.textPrimary} 30%, ${C.brandLight} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            fontSize: { xs: 28, sm: 40 },
          }}>
            Una semana gratis,<br />después elegís vos
          </Typography>
          <Typography sx={{ fontSize: { xs: 14.5, sm: 16 }, color: C.textSecondary, maxWidth: 520, mx: "auto", lineHeight: 1.8 }}>
            Probá todos los módulos sin límites durante 7 días. Sin tarjeta. Sin sorpresas.
            Cuando termina tu prueba, elegís el plan que mejor se adapta a tu estilo.
          </Typography>
        </Box>

        {/* Cards — 3 columnas desktop, 1 mobile */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
          gap: 3,
          alignItems: "stretch",
        }}>
          {PLANS.map((plan, i) => {
            const state = getPlanState(plan.id);

            return (
              <Box
                key={plan.id}
                sx={{
                  position: "relative",
                  borderRadius: 5,
                  border: `1.5px solid ${plan.border}`,
                  background: typeof plan.bg === "string" && plan.bg.startsWith("linear") ? plan.bg : undefined,
                  bgcolor:    typeof plan.bg === "string" && !plan.bg.startsWith("linear") ? plan.bg : undefined,
                  boxShadow: plan.highlight
                    ? "0 16px 48px rgba(201,149,42,0.18), 0 4px 12px rgba(0,0,0,0.06)"
                    : "0 4px 20px rgba(11,94,85,0.07)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  animation: `fadeUp 0.6s ${0.08 + i * 0.1}s ease both`,
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: plan.highlight
                      ? "0 24px 56px rgba(201,149,42,0.24)"
                      : "0 20px 48px rgba(11,94,85,0.12)",
                  },
                }}
              >
                {/* Badge */}
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
                  {/* Header */}
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
                      bgcolor: `${plan.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <plan.Icon sx={{ fontSize: 22, color: plan.color }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Plan
                      </Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                        {plan.name}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography sx={{ fontSize: 12, color: C.textMuted, mb: 2.5, fontWeight: 500 }}>
                    {plan.subtitle}
                  </Typography>

                  {/* Precio */}
                  <Box mb={3}>
                    {plan.price ? (
                      <>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                          <Typography sx={{ fontSize: 38, fontWeight: 900, color: plan.color, lineHeight: 1, letterSpacing: "-1.5px" }}>
                            {formatARS(plan.price)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 12.5, color: C.textMuted, mt: 0.3 }}>
                          {plan.label}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontSize: 38, fontWeight: 900, color: plan.color, lineHeight: 1, letterSpacing: "-1.5px" }}>
                          {plan.priceLabel}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: C.textMuted, mt: 0.3 }}>
                          {plan.label}
                        </Typography>
                      </>
                    )}
                  </Box>

                  {/* Divisor */}
                  <Box sx={{ height: "1px", bgcolor: `${plan.color}20`, mb: 3 }} />

                  {/* Features */}
                  <Stack spacing={1.2} mb={3.5}>
                    {plan.features.map((f) => (
                      <Box key={f.text} sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                        <Typography sx={{ fontSize: 15, lineHeight: 1.4, flexShrink: 0, mt: "1px" }}>
                          {f.emoji}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>
                          {f.text}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  {/* CTA según estado — mt:auto lo empuja al fondo de la card */}
                  <Box sx={{ mt: "auto" }}>
                  {state === "trial_active" && plan.id === "free" ? (
                    /* Trial activo — mostrar días restantes */
                    <Box sx={{
                      width: "100%", py: 1.4, borderRadius: 2.5,
                      border: `2px solid ${plan.color}`,
                      bgcolor: `${plan.color}10`,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                    }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 17, color: plan.color }} />
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: plan.color }}>
                        {trialDaysLeft === 0
                          ? "Vence hoy"
                          : `${trialDaysLeft} día${trialDaysLeft !== 1 ? "s" : ""} restante${trialDaysLeft !== 1 ? "s" : ""}`
                        }
                      </Typography>
                    </Box>
                  ) : state === "trial_expired" && plan.id === "free" ? (
                    /* Trial expirado */
                    <Box sx={{
                      width: "100%", py: 1.4, borderRadius: 2.5,
                      border: "2px solid rgba(226,75,74,0.4)",
                      bgcolor: "rgba(226,75,74,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                    }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#E24B4A" }}>
                        Prueba expirada
                      </Typography>
                    </Box>
                  ) : state === "current" ? (
                    /* Plan activo de pago */
                    <Box sx={{
                      width: "100%", py: 1.4, borderRadius: 2.5,
                      border: `2px solid ${plan.color}`,
                      bgcolor: `${plan.color}10`,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                    }}>
                      <CheckRoundedIcon sx={{ fontSize: 17, color: plan.color }} />
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: plan.color }}>
                        Tu plan actual
                      </Typography>
                    </Box>
                  ) : plan.id === "free" ? (
                    /* Free sin trial activo: no se puede elegir de nuevo */
                    null
                  ) : (
                    /* CTA de pago */
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={loading === plan.id}
                      onClick={() => handleAction(plan)}
                      sx={{
                        bgcolor: plan.highlight ? plan.color : C.brand,
                        borderRadius: 2.5, py: 1.4,
                        textTransform: "none", fontWeight: 700, fontSize: 14.5,
                        boxShadow: plan.highlight
                          ? `0 4px 16px ${plan.color}44`
                          : "0 4px 16px rgba(11,94,85,0.28)",
                        "&:hover": { bgcolor: plan.highlight ? "#b8841f" : C.brandLight },
                      }}
                    >
                      {loading === plan.id ? "Redirigiendo…" : plan.cta}
                    </Button>
                  )}
                  </Box>{/* cierre mt:auto */}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Nota pie */}
        <Typography sx={{ textAlign: "center", fontSize: 12.5, color: C.textMuted, mt: 5, lineHeight: 1.8 }}>
          El pago se procesa de forma segura a través de Mercado Pago.<br />
          Podés cancelar la renovación automática en cualquier momento desde tu dashboard.
        </Typography>
      </Box>
    </Box>
  );
};

export default PricingPage;
