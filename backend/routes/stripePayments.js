import express from "express";
import Stripe from "stripe";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import { authMiddleware } from "../middleware/auth.js";
import { sendPaymentEmail } from "../utils/sendPaymentEmail.js";
import { sendNotificationEmail } from "../utils/sendNotificationEmail.js";
import { logInfo, logError } from "../utils/logger.js";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

// Precios EE.UU. — Price IDs creados con scripts/setupStripeProducts.mjs
// El monto acá es solo para mostrar en la UI; el cobro real lo define el
// Price de Stripe (priceEnv) — si se cambia el precio en Stripe, actualizar
// este número también para que no quede desincronizado con lo que se cobra.
const STRIPE_PLANS = {
  silver: { name: "Plan Silver", priceEnv: "STRIPE_PRICE_SILVER", dailyLimit: 1,    amount: 6.99 },
  gold:   { name: "Plan Gold",   priceEnv: "STRIPE_PRICE_GOLD",   dailyLimit: null, amount: 12.99 },
};

const PLAN_NAMES = { silver: "Silver", gold: "Gold" };

const router = express.Router();

// ── TEMPORAL: diagnóstico de un caso puntual (webhook de checkout.session.
// completed que nunca actualizó Mongo para un usuario específico) — borrar
// apenas se resuelva. Gateado por un secreto de un solo uso, no por sesión
// de usuario, para poder consultarlo sin pedirle el JWT a nadie.
router.get("/debug-customer", async (req, res) => {
  if (req.query.k !== "nui-debug-2026-09-01-temp") return res.sendStatus(404);
  try {
    const stripe = getStripe();
    const email = req.query.email;
    const customers = await stripe.customers.list({ email, limit: 10 });
    const safeIso = (unixSeconds) => (unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null);
    const out = [];
    for (const c of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: c.id, limit: 10, status: "all" });
      out.push({
        customerId: c.id,
        created: safeIso(c.created),
        subscriptions: subs.data.map((s) => ({
          id: s.id,
          status: s.status,
          priceId: s.items.data[0]?.price?.id,
          amount: s.items.data[0]?.price?.unit_amount,
          currency: s.items.data[0]?.price?.currency,
          current_period_end: safeIso(s.current_period_end),
          cancel_at_period_end: s.cancel_at_period_end,
          metadata: s.metadata,
        })),
      });
    }
    return res.json({ customers: out });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─── Cupones — mismo sistema/códigos que Mercado Pago ───────────
 * Un Cupón de Nui (Mongo) se refleja en un Coupon nativo de Stripe,
 * creado una sola vez (id determinístico) y reutilizado. Stripe aplica
 * el % de descuento automáticamente por 3 ciclos de facturación
 * (duration_in_months) — a diferencia de MP no hace falta que nuestro
 * código reaplique el descuento mes a mes, Stripe ya lo hace solo.
 */
const getOrCreateStripeCoupon = async (stripe, coupon, plan) => {
  const id = `nui_${coupon.code}_${plan}`.toLowerCase();
  try {
    return await stripe.coupons.retrieve(id);
  } catch {
    return await stripe.coupons.create({
      id,
      percent_off: coupon.discountPct,
      duration: "repeating",
      duration_in_months: 3,
      name: `${coupon.code} — ${coupon.discountPct}% x3 meses`,
    });
  }
};

// Mismas reglas que /api/payments/validate-coupon (MP), adaptadas: como
// Stripe aplica el descuento automáticamente durante 3 ciclos sin que
// nuestro backend tenga que reintervenir, el límite por usuario acá es
// más simple — un código ya usado por ese usuario no se puede reusar
// (evita cancelar y resuscribirse para encadenar descuentos gratis).
const validateCouponForUser = async (code, plan, user) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), active: true });
  if (!coupon) return { error: "Código inválido o inactivo." };

  if (coupon.appliesTo !== "both" && coupon.appliesTo !== plan) {
    return { error: `Este código solo aplica al Plan ${coupon.appliesTo === "silver" ? "Silver" : "Gold"}.` };
  }
  if (coupon.maxUses !== null && coupon.usages.length >= coupon.maxUses) {
    return { error: "Este código ya alcanzó su límite de usos." };
  }
  if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
    return { error: "Este código de descuento venció." };
  }

  const existingSub = await Subscription.findOne({ user: user._id });
  if (existingSub?.couponCode === coupon.code) {
    return { error: "Ya usaste este código de descuento anteriormente." };
  }

  return { coupon };
};

/* ─── GET PRECIOS PÚBLICOS (USD) ──────────────────────────────── */
router.get("/plans", (_req, res) => {
  res.json({
    silver: { amount: STRIPE_PLANS.silver.amount, currency: "USD" },
    gold:   { amount: STRIPE_PLANS.gold.amount,   currency: "USD" },
  });
});

/* ─── VALIDAR CUPÓN (USD) ──────────────────────────────────────── */
router.post("/validate-coupon", authMiddleware, async (req, res) => {
  const { code, plan } = req.body;
  if (!code || !plan) return res.status(400).json({ error: "Código y plan requeridos." });
  if (!STRIPE_PLANS[plan]) return res.status(400).json({ error: "Plan inválido." });

  try {
    const { coupon, error } = await validateCouponForUser(code, plan, req.user);
    if (error) return res.status(400).json({ error });

    const planInfo = STRIPE_PLANS[plan];
    const discountAmount = +(planInfo.amount * coupon.discountPct / 100).toFixed(2);
    const finalAmount    = +(planInfo.amount - discountAmount).toFixed(2);

    return res.json({
      valid: true,
      code: coupon.code,
      creatorName: coupon.creatorName,
      discountPct: coupon.discountPct,
      originalAmount: planInfo.amount,
      discountAmount,
      finalAmount,
      monthsLeft: 3,
    });
  } catch (err) {
    return res.status(500).json({ error: "Error al validar el cupón." });
  }
});

/* ─── CREAR CHECKOUT SESSION (suscripción con auto-renovación) ── */
router.post("/checkout", authMiddleware, async (req, res) => {
  const { plan, couponCode } = req.body;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe no está configurado. Contactá al administrador." });
  }

  const planInfo = STRIPE_PLANS[plan];
  if (!planInfo) return res.status(400).json({ error: "Plan inválido. Usá 'silver' o 'gold'." });

  const priceId = process.env[planInfo.priceEnv];
  if (!priceId) {
    return res.status(503).json({ error: `Precio de ${planInfo.name} no configurado.` });
  }

  try {
    const stripe = getStripe();
    const user = req.user;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const existingSub = await Subscription.findOne({ user: user._id });

    let discounts;
    let appliedCouponCode = "";
    if (couponCode) {
      const { coupon, error } = await validateCouponForUser(couponCode, plan, user);
      if (error) return res.status(400).json({ error });
      const stripeCoupon = await getOrCreateStripeCoupon(stripe, coupon, plan);
      discounts = [{ coupon: stripeCoupon.id }];
      appliedCouponCode = coupon.code;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(discounts ? { discounts } : {}),
      customer_email: existingSub?.stripeCustomerId ? undefined : user.email,
      customer: existingSub?.stripeCustomerId || undefined,
      client_reference_id: user._id.toString(),
      metadata: { userId: user._id.toString(), plan, couponCode: appliedCouponCode },
      subscription_data: { metadata: { userId: user._id.toString(), plan, couponCode: appliedCouponCode } },
      success_url: `${frontendUrl}/subscription/success?provider=stripe`,
      cancel_url:  `${frontendUrl}/pricing`,
      // Managed Payments (cálculo/remisión automática de impuestos de Stripe)
      // viene habilitado por defecto en cuentas nuevas y exige tax_code en
      // cada producto — decisión de compliance a tomar a propósito más
      // adelante, no algo para activar como efecto colateral acá.
      managed_payments: { enabled: false },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return res.status(500).json({ error: "Error al crear el checkout de Stripe." });
  }
});

/* ─── CANCELAR (al fin del período — el usuario conserva acceso) ── */
router.post("/cancel", authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id, provider: "stripe" });
    if (!sub) return res.status(404).json({ error: "No tenés una suscripción de Stripe activa." });

    if (sub.stripeSubscriptionId) {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
      } catch (stripeErr) {
        console.error("Error al cancelar en Stripe:", stripeErr.message);
      }
    }

    sub.status    = "cancelled";
    sub.autoRenew = false;
    await sub.save();

    logInfo("payment", "subscription.cancelled",
      `Cancelación Plan ${sub.plan} (Stripe) — ${req.user.email}`,
      { userId: req.user._id, userName: req.user.name, userEmail: req.user.email,
        meta: { plan: sub.plan, amount: sub.amount, provider: "stripe" } });

    if (req.user?.email) {
      sendNotificationEmail("cancellation", {
        name: req.user.name, email: req.user.email,
        planName: PLAN_NAMES[sub.plan] || sub.plan, endDate: sub.endDate,
      }).catch((err) => console.error("❌ Email cancelación usuario:", err.message));
    }

    return res.json({ message: "Suscripción cancelada. Seguís teniendo acceso hasta el fin del período." });
  } catch (err) {
    return res.status(500).json({ error: "Error al cancelar la suscripción." });
  }
});

/* ─── WEBHOOK DE STRIPE ───────────────────────────────────────────
 * Montado en index.js con express.raw() ANTES del express.json()
 * global — Stripe necesita el body crudo para validar la firma.
 */
export const stripeWebhookHandler = async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("⚠️  STRIPE_WEBHOOK_SECRET no configurado — webhook rechazado.");
    return res.sendStatus(401);
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.warn(`⚠️  Webhook Stripe rechazado: firma inválida (${err.message})`);
    return res.sendStatus(400);
  }

  try {
    /* ── Alta inicial: checkout completado ── */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode !== "subscription") return res.sendStatus(200);

      const userId = session.client_reference_id || session.metadata?.userId;
      const plan   = session.metadata?.plan;
      const couponCode = session.metadata?.couponCode || "";
      if (!userId || !STRIPE_PLANS[plan]) return res.sendStatus(200);

      const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
      const now = new Date();
      const end = new Date(stripeSub.current_period_end * 1000);
      // amount_total ya refleja el descuento del cupón si se aplicó uno —
      // el unit_amount del Price siempre es el precio de lista, sin descuento.
      const amount = (session.amount_total ?? stripeSub.items.data[0]?.price?.unit_amount ?? 0) / 100;
      const currency = (stripeSub.items.data[0]?.price?.currency || "usd").toUpperCase();

      const sub = await Subscription.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            user: userId, plan, status: "active", provider: "stripe",
            startDate: now, endDate: end,
            amount, currency, autoRenew: true,
            stripeCustomerId:     session.customer,
            stripeSubscriptionId: session.subscription,
            ...(couponCode ? { couponCode } : {}),
          },
          $push: {
            paymentHistory: {
              $each: [{
                stripePaymentId: session.id, provider: "stripe",
                amount, currency, status: "approved", plan,
                description: `Pago ${STRIPE_PLANS[plan].name} — Stripe${couponCode ? ` (cupón ${couponCode})` : ""}`,
              }],
              $position: 0,
            },
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      const user = await User.findById(userId);
      if (user) {
        const isRenewal = sub.paymentHistory.length > 1 && sub.paymentHistory[1]?.plan === plan;
        sendPaymentEmail({ name: user.name, email: user.email, plan, amount, currency, endDate: end, isRenewal }).catch(() => {});
        sendNotificationEmail("admin-new-sub", {
          userName: user.name, userEmail: user.email, plan, amount, currency,
          startDate: now, endDate: end, isRenewal,
        }).catch(() => {});
        logInfo("payment", "subscription.created",
          `Nueva suscripción ${STRIPE_PLANS[plan].name} (Stripe) — ${user.email}`,
          { userId: user._id, userName: user.name, userEmail: user.email, meta: { plan, amount, currency, provider: "stripe" } });

        if (couponCode) {
          const originalAmount = STRIPE_PLANS[plan].amount;
          await Coupon.findOneAndUpdate(
            { code: couponCode },
            { $push: { usages: {
                userId: user._id, userEmail: user.email, plan,
                originalAmount,
                discountAmount: +(originalAmount - amount).toFixed(2),
                finalAmount: amount,
                stripePaymentId: session.id, provider: "stripe",
              } } }
          ).catch((err) => console.error("Error al registrar uso de cupón (Stripe):", err.message));
        }
      }
    }

    /* ── Renovación automática (cobro recurrente mensual) ── */
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      if (!invoice.subscription || invoice.billing_reason === "subscription_create") {
        // subscription_create ya se maneja en checkout.session.completed
        return res.sendStatus(200);
      }

      const sub = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
      if (!sub) return res.sendStatus(200);

      const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription);
      const end = new Date(stripeSub.current_period_end * 1000);
      const amount = (invoice.amount_paid || 0) / 100;
      const currency = (invoice.currency || "usd").toUpperCase();

      sub.status = "active";
      sub.endDate = end;
      sub.amount = amount;
      sub.currency = currency;
      sub.paymentHistory.unshift({
        stripePaymentId: invoice.id, provider: "stripe",
        amount, currency, status: "approved", plan: sub.plan,
        description: `Renovación ${STRIPE_PLANS[sub.plan]?.name || sub.plan} — Stripe`,
      });
      await sub.save();

      const user = await User.findById(sub.user);
      if (user) {
        sendPaymentEmail({ name: user.name, email: user.email, plan: sub.plan, amount, currency, endDate: end, isRenewal: true }).catch(() => {});
        if (!user.notifPrefs?.paused && user.notifPrefs?.renewal !== false) {
          sendNotificationEmail("renewal", {
            name: user.name, email: user.email,
            planName: PLAN_NAMES[sub.plan] || sub.plan, endDate: end,
          }).catch(() => {});
        }
        logInfo("payment", "subscription.renewed",
          `Renovación ${sub.plan} (Stripe) — ${user.email}`,
          { userId: user._id, userName: user.name, userEmail: user.email, meta: { plan: sub.plan, amount, provider: "stripe" } });
      }
    }

    /* ── Cancelación efectiva (al llegar el fin del período) ── */
    if (event.type === "customer.subscription.deleted") {
      const stripeSub = event.data.object;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: stripeSub.id },
        { $set: { status: "cancelled", autoRenew: false } }
      );
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Stripe webhook error:", err.message);
    logError("payment", "webhook.error", `Error en webhook Stripe: ${err.message}`, { meta: { error: err.message } });
    return res.sendStatus(500);
  }
};

export default router;
