import express from "express";
import Stripe from "stripe";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
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

/* ─── GET PRECIOS PÚBLICOS (USD) ──────────────────────────────── */
router.get("/plans", (_req, res) => {
  res.json({
    silver: { amount: STRIPE_PLANS.silver.amount, currency: "USD" },
    gold:   { amount: STRIPE_PLANS.gold.amount,   currency: "USD" },
  });
});

/* ─── CREAR CHECKOUT SESSION (suscripción con auto-renovación) ── */
router.post("/checkout", authMiddleware, async (req, res) => {
  const { plan } = req.body;

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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: existingSub?.stripeCustomerId ? undefined : user.email,
      customer: existingSub?.stripeCustomerId || undefined,
      client_reference_id: user._id.toString(),
      metadata: { userId: user._id.toString(), plan },
      subscription_data: { metadata: { userId: user._id.toString(), plan } },
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
      if (!userId || !STRIPE_PLANS[plan]) return res.sendStatus(200);

      const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
      const now = new Date();
      const end = new Date(stripeSub.current_period_end * 1000);
      const amount = (stripeSub.items.data[0]?.price?.unit_amount || 0) / 100;
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
          },
          $push: {
            paymentHistory: {
              $each: [{
                stripePaymentId: session.id, provider: "stripe",
                amount, currency, status: "approved", plan,
                description: `Pago ${STRIPE_PLANS[plan].name} — Stripe`,
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
