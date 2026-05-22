import { useState, useEffect } from "react";
import { Box, Typography, Chip, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNutrition } from "../context/NutritionContext";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
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
};

const PLANS = [
  {
    id: "silver",
    name: "Silver",
    price: 2990,
    label: "Por mes",
    Icon: DiamondOutlinedIcon,
    color: "#71879C",
    bg: "#EEF2F5",
    border: "rgba(113,135,156,0.25)",
    highlight: false,
    features: [
      "1 análisis de producto por día",
      "Historial de los últimos 30 días",
      "Dashboard con métricas personales",
      "Índice de Masa Corporal (IMC)",
      "Soporte por email",
    ],
    cta: "Elegir Silver",
  },
  {
    id: "gold",
    name: "Gold",
    price: 5990,
    label: "Por mes",
    Icon: WorkspacePremiumOutlinedIcon,
    color: "#C9952A",
    bg: "linear-gradient(135deg, #FDF6E3 0%, #FEF9EC 100%)",
    border: "rgba(201,149,42,0.35)",
    highlight: true,
    features: [
      "Análisis de productos ilimitados",
      "Historial completo sin límite",
      "Dashboard con métricas personales",
      "Índice de Masa Corporal (IMC)",
      "Acceso prioritario a nuevas funciones",
      "Soporte prioritario",
    ],
    cta: "Elegir Gold",
    badge: "Más popular",
  },
];

const formatARS = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const PricingPage = () => {
  const { user } = useNutrition();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("nutrismartToken");
    fetch(`${API_URL}/api/payments/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.subscription?.status === "active") {
          setActivePlan(data.subscription.plan);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSubscribe = async (planId) => {
    if (!user) { navigate("/"); return; }

    setLoading(planId);
    try {
      const token = localStorage.getItem("nutrismartToken");
      const res = await fetch(`${API_URL}/api/payments/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al procesar el pago.");
        return;
      }
      window.location.href = data.initPoint;
    } catch {
      alert("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
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
      <Box sx={{ position: "absolute", bottom: 0, left: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,94,85,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Box sx={{ px: { xs: 3, sm: 6, md: 10 }, pt: { xs: 11, sm: 15 }, pb: 12, maxWidth: 900, mx: "auto", position: "relative" }}>

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
            fontSize: { xs: 30, sm: 40 },
          }}>
            Elegí el plan que<br />mejor te quede
          </Typography>
          <Typography sx={{ fontSize: { xs: 15, sm: 16 }, color: C.textSecondary, maxWidth: 500, mx: "auto", lineHeight: 1.75 }}>
            Probá gratis con 3 análisis. Cuando estés listo, elegí el plan que mejor se adapta a tus hábitos.
          </Typography>
        </Box>

        {/* Gratis badge */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 3,
            bgcolor: C.brandSurface,
            border: `1px solid ${C.brandMuted}`,
            textAlign: "center",
            animation: "fadeUp 0.6s 0.1s ease both",
          }}
        >
          <Typography sx={{ fontSize: 14, color: C.brand, fontWeight: 600 }}>
            Incluye 3 análisis gratuitos para probar la app sin tarjeta
          </Typography>
        </Box>

        {/* Cards */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}>
          {PLANS.map((plan, i) => (
            <Box
              key={plan.id}
              sx={{
                position: "relative",
                borderRadius: 5,
                border: `1.5px solid ${plan.border}`,
                background: typeof plan.bg === "string" && plan.bg.startsWith("linear") ? plan.bg : plan.bg,
                bgcolor: typeof plan.bg === "string" && !plan.bg.startsWith("linear") ? plan.bg : undefined,
                boxShadow: plan.highlight
                  ? "0 16px 48px rgba(201,149,42,0.16), 0 4px 12px rgba(0,0,0,0.06)"
                  : "0 4px 20px rgba(11,94,85,0.08)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                animation: `fadeUp 0.6s ${0.1 + i * 0.12}s ease both`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: plan.highlight
                    ? "0 24px 56px rgba(201,149,42,0.22)"
                    : "0 20px 48px rgba(11,94,85,0.13)",
                },
              }}
            >
              {/* Badge "Más popular" */}
              {plan.badge && (
                <Box sx={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: plan.color,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  px: 2,
                  py: 0.5,
                  borderRadius: "999px",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.05em",
                  boxShadow: "0 4px 12px rgba(201,149,42,0.35)",
                }}>
                  {plan.badge}
                </Box>
              )}

              <Box sx={{ p: { xs: 3, sm: 3.5 } }}>
                {/* Plan header */}
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: 2.5,
                    bgcolor: `${plan.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <plan.Icon sx={{ fontSize: 22, color: plan.color }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Plan
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                      {plan.name}
                    </Typography>
                  </Box>
                </Stack>

                {/* Precio */}
                <Box mb={3}>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                    <Typography sx={{ fontSize: 40, fontWeight: 900, color: plan.color, lineHeight: 1, letterSpacing: "-1.5px" }}>
                      {formatARS(plan.price)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: C.textMuted, mt: 0.3 }}>
                    {plan.label} · renovación automática
                  </Typography>
                </Box>

                {/* Divisor */}
                <Box sx={{ height: 1, bgcolor: `${plan.color}20`, mb: 3 }} />

                {/* Features */}
                <Stack spacing={1.4} mb={3.5}>
                  {plan.features.map((f) => (
                    <Box key={f} sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                      <Box sx={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0, mt: 0.1,
                        bgcolor: `${plan.color}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckRoundedIcon sx={{ fontSize: 12, color: plan.color }} />
                      </Box>
                      <Typography sx={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.5 }}>
                        {f}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {/* CTA */}
                {activePlan === plan.id ? (
                  <Box
                    sx={{
                      width: "100%",
                      py: 1.4,
                      borderRadius: 2.5,
                      border: `2px solid ${plan.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      bgcolor: `${plan.color}10`,
                    }}
                  >
                    <CheckRoundedIcon sx={{ fontSize: 17, color: plan.color }} />
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: plan.color }}>
                      Tu plan actual
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={loading === plan.id}
                    onClick={() => handleSubscribe(plan.id)}
                    sx={{
                      bgcolor: plan.highlight ? plan.color : C.brand,
                      borderRadius: 2.5,
                      py: 1.4,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14.5,
                      boxShadow: plan.highlight
                        ? `0 4px 16px ${plan.color}44`
                        : "0 4px 16px rgba(11,94,85,0.28)",
                      "&:hover": {
                        bgcolor: plan.highlight ? "#b8841f" : C.brandLight,
                      },
                    }}
                  >
                    {loading === plan.id ? "Redirigiendo..." : plan.cta}
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Nota MP */}
        <Typography sx={{ textAlign: "center", fontSize: 12.5, color: C.textMuted, mt: 4, lineHeight: 1.7 }}>
          El pago se procesa de forma segura a través de Mercado Pago.<br />
          Podés cancelar la renovación automática en cualquier momento desde tu dashboard.
        </Typography>
      </Box>
    </Box>
  );
};

export default PricingPage;
