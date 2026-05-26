import express from "express";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { sendPaymentEmail } from "../utils/sendPaymentEmail.js";
import { sendNotificationEmail } from "../utils/sendNotificationEmail.js";

const router = express.Router();

const PLANS = {
  silver: {
    name: "Plan Silver",
    amount: 2990,
    currency: "ARS",
    description: "1 análisis por día · renovación mensual",
    dailyLimit: 1,
  },
  gold: {
    name: "Plan Gold",
    amount: 5990,
    currency: "ARS",
    description: "Análisis ilimitados · renovación mensual",
    dailyLimit: null,
  },
};

const getMPClient = () => {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN no configurado");
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
};

/* ─── CREAR SUSCRIPCIÓN ───────────────────────────────────── */
router.post("/subscribe", authMiddleware, async (req, res) => {
  const { plan } = req.body;

  if (!PLANS[plan]) {
    return res.status(400).json({ error: "Plan inválido. Usá 'silver' o 'gold'." });
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(503).json({ error: "Pasarela de pago no configurada. Contactá al administrador." });
  }

  try {
    const user = req.user;
    const planInfo = PLANS[plan];
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const client = getMPClient();
    const preference = new Preference(client);

    const returnUrl = process.env.MP_WEBHOOK_URL
      ? process.env.MP_WEBHOOK_URL.replace("/api/payments/webhook", "/payment/return")
      : `${frontendUrl}/subscription/success`;

    const mpResponse = await preference.create({
      body: {
        items: [{
          id: plan,
          title: `NutriSmart · ${planInfo.name}`,
          description: planInfo.description,
          quantity: 1,
          unit_price: planInfo.amount,
          currency_id: planInfo.currency,
        }],
        payer: { email: user.email },
        external_reference: `${user._id}|${plan}`,
        back_urls: {
          success: returnUrl,
          failure: returnUrl,
          pending: returnUrl,
        },
        auto_return: "approved",
        notification_url: process.env.MP_WEBHOOK_URL,
      },
    });

    // Guardar preferencia pendiente
    await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        plan,
        status: "pending",
        mpSubscriptionId: mpResponse.id,
        amount: planInfo.amount,
        currency: planInfo.currency,
        autoRenew: true,
      },
      { upsert: true, new: true }
    );

    return res.json({ initPoint: mpResponse.init_point });
  } catch (err) {
    console.error("Subscribe error completo:", err);
    return res.status(500).json({ error: err.message || "Error al crear la suscripción." });
  }
});

/* ─── WEBHOOK DE MERCADO PAGO ─────────────────────────────── */
router.post("/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment" && data?.id) {
      const client = getMPClient();
      const paymentClient = new Payment(client);
      const mp = await paymentClient.get({ id: data.id });

      if (mp.status === "approved") {
        // external_reference tiene formato "userId|plan"
        const [userId, plan] = (mp.external_reference || "").split("|");
        if (!userId) return res.sendStatus(200);

        const planInfo = PLANS[plan];
        if (!planInfo) return res.sendStatus(200);

        // Loguear discrepancia de monto (no rechazar — MP puede agregar cargos o cuotas)
        const expectedAmount = planInfo.amount;
        if (mp.transaction_amount && mp.transaction_amount < expectedAmount * 0.50) {
          console.warn(`Webhook: monto sospechosamente bajo: esperado ~${expectedAmount}, recibido ${mp.transaction_amount}`);
        }

        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);

        const sub = await Subscription.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              user: userId,
              plan,
              status: "active",
              startDate: now,
              endDate: end,
              amount: mp.transaction_amount,
              currency: mp.currency_id,
            },
            $push: {
              paymentHistory: {
                $each: [{
                  mpPaymentId: mp.id.toString(),
                  amount: mp.transaction_amount,
                  currency: mp.currency_id,
                  status: "approved",
                  plan,
                  description: `Pago ${planInfo.name} — 30 días`,
                }],
                $position: 0,
              },
            },
          },
          { upsert: true, new: true }
        );

        const user = await User.findById(userId);
        if (user) {
          const isRenewal = sub.paymentHistory.length > 1;

          // Email de recibo de pago (transaccional, siempre se envía)
          await sendPaymentEmail({
            name: user.name,
            email: user.email,
            plan,
            amount: mp.transaction_amount,
            currency: mp.currency_id,
            endDate: end,
            isRenewal,
          });

          // Email motivacional de renovación (solo si hay renovación y el user no pausó)
          if (isRenewal && !user.notifPrefs?.paused && user.notifPrefs?.renewal !== false) {
            const PLAN_NAMES = { silver: "Silver", gold: "Gold" };
            sendNotificationEmail("renewal", {
              name:     user.name,
              email:    user.email,
              planName: PLAN_NAMES[plan] || plan,
              endDate:  end,
            }).catch(() => {});
          }
        }
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.sendStatus(500);
  }
});

/* ─── GET SUSCRIPCIÓN DEL USUARIO ────────────────────────── */
router.get("/subscription", authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });

    // Auto-expirar cualquier suscripción vencida (free trial o plan pago)
    if (sub?.status === "active" && sub.endDate && sub.endDate < new Date()) {
      sub.status = "expired";
      await sub.save();
    }

    return res.json({ subscription: sub || null });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener la suscripción." });
  }
});

/* ─── CANCELAR SUSCRIPCIÓN ───────────────────────────────── */
router.post("/cancel", authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    if (!sub) return res.status(404).json({ error: "No tenés una suscripción activa." });

    // Checkout Pro es pago único — no hay suscripción MP que cancelar en la API

    sub.status = "cancelled";
    sub.autoRenew = false;
    await sub.save();

    return res.json({ message: "Suscripción cancelada. Seguís teniendo acceso hasta el fin del período." });
  } catch (err) {
    return res.status(500).json({ error: "Error al cancelar la suscripción." });
  }
});

/* ─── TOGGLE AUTO-RENOVACIÓN ────────────────────────────── */
router.post("/toggle-renew", authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    if (!sub) return res.status(404).json({ error: "No tenés una suscripción." });

    sub.autoRenew = !sub.autoRenew;
    await sub.save();

    return res.json({ autoRenew: sub.autoRenew });
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar la configuración." });
  }
});

export { PLANS };
export default router;
