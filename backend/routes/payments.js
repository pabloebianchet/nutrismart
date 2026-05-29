import express from "express";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { sendPaymentEmail } from "../utils/sendPaymentEmail.js";
import { sendNotificationEmail } from "../utils/sendNotificationEmail.js";
import { logInfo, logError } from "../utils/logger.js";

/* ─── Validación de firma de webhook MP ─────────────────────────────────── */
const verifyMPSignature = (req) => {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secret configurado → skip (dev)

  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];
  if (!xSignature) return false;

  const parts = {};
  xSignature.split(",").forEach((part) => {
    const [k, v] = part.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  });

  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const dataId = req.query?.["data.id"] || req.body?.data?.id || "";
  const manifest = `id:${dataId};request-id:${xRequestId || ""};ts:${ts};`;

  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
};

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

/* ─── Helper: fetch autenticado a la API de MP ───────────────── */
const mpFetch = (path, options = {}) => {
  const token = process.env.MP_ACCESS_TOKEN;
  return fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};

/* ─── CREAR PAGO (Checkout Pro — pago único mensual) ─────────── */
router.post("/subscribe", authMiddleware, async (req, res) => {
  const { plan } = req.body;

  if (!PLANS[plan]) {
    return res.status(400).json({ error: "Plan inválido. Usá 'silver' o 'gold'." });
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(503).json({ error: "Pasarela de pago no configurada. Contactá al administrador." });
  }

  try {
    const user        = req.user;
    const planInfo    = PLANS[plan];
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const preferenceBody = {
      items: [{
        title:      `Nui · ${planInfo.name}`,
        description: planInfo.description,
        quantity:   1,
        unit_price: planInfo.amount,
        currency_id: planInfo.currency,
      }],
      payer: { email: user.email },
      external_reference: `${user._id}|${plan}`,
      back_urls: {
        success: `${frontendUrl}/subscription/success`,
        failure: `${frontendUrl}/pricing`,
        pending: `${frontendUrl}/pricing`,
      },
      auto_return: "approved",
    };

    // notification_url solo si está configurada
    if (process.env.MP_WEBHOOK_URL) {
      preferenceBody.notification_url = process.env.MP_WEBHOOK_URL;
    }

    const mpRes = await mpFetch("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify(preferenceBody),
    });

    if (!mpRes.ok) {
      const errBody = await mpRes.json().catch(() => ({}));
      console.error("MP Preference error:", JSON.stringify(errBody));
      const mpMessage = errBody?.message || errBody?.cause?.[0]?.description || "Error en Mercado Pago";
      return res.status(502).json({ error: `Error al crear el pago: ${mpMessage}` });
    }

    const mpData = await mpRes.json();

    // NO se toca la suscripción activa del usuario hasta que el webhook
    // confirme el pago (type === "payment", status === "approved").
    // Sobreescribir aquí causaba que un Silver activo se perdiera si
    // el usuario intentaba pasar a Gold y el pago fallaba.

    return res.json({ initPoint: mpData.init_point });
  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ error: err.message || "Error al crear el pago." });
  }
});

/* ─── WEBHOOK DE MERCADO PAGO ────────────────────────────────── */
router.post("/webhook", async (req, res) => {
  // Validar firma MP
  if (!verifyMPSignature(req)) {
    console.warn("⚠️  Webhook MP rechazado: firma inválida");
    return res.sendStatus(401);
  }

  try {
    const { type, data } = req.body;

    /* ── 1. Cobro mensual procesado (suscripción recurrente) ── */
    if (type === "subscription_authorized_payment" && data?.id) {
      const pmRes  = await mpFetch(`/authorized_payments/${data.id}`);
      const payment = await pmRes.json();

      if (payment.status === "processed") {
        // Obtenemos el preapproval para leer external_reference
        const paRes      = await mpFetch(`/preapproval/${payment.preapproval_id}`);
        const preapproval = await paRes.json();

        const [userId, plan] = (preapproval.external_reference || "").split("|");
        if (!userId) return res.sendStatus(200);

        const planInfo = PLANS[plan];
        if (!planInfo) return res.sendStatus(200);

        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);

        const sub = await Subscription.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              user:             userId,
              plan,
              status:           "active",
              startDate:        now,
              endDate:          end,
              amount:           payment.transaction_amount ?? planInfo.amount,
              currency:         planInfo.currency,
              mpSubscriptionId: payment.preapproval_id,
              autoRenew:        true,
            },
            $push: {
              paymentHistory: {
                $each: [{
                  mpPaymentId: String(payment.id),
                  amount:      payment.transaction_amount ?? planInfo.amount,
                  currency:    planInfo.currency,
                  status:      "approved",
                  plan,
                  description: `Cobro ${planInfo.name} — 30 días`,
                }],
                $position: 0,
              },
            },
          },
          { upsert: true, returnDocument: "after" }
        );

        const user = await User.findById(userId);
        if (user) {
          // Es renovación solo si el pago anterior fue del mismo plan
          // paymentHistory[0] = nuevo pago (position:0), [1] = anterior
          const isRenewal = sub.paymentHistory.length > 1 &&
            sub.paymentHistory[1]?.plan === plan;

          await sendPaymentEmail({
            name:     user.name,
            email:    user.email,
            plan,
            amount:   payment.transaction_amount ?? planInfo.amount,
            currency: planInfo.currency,
            endDate:  end,
            isRenewal,
          });

          // Email al admin con info del nuevo suscriptor
          sendNotificationEmail("admin-new-sub", {
            userName:  user.name,
            userEmail: user.email,
            plan,
            amount:    payment.transaction_amount ?? planInfo.amount,
            currency:  planInfo.currency,
            startDate: now,
            endDate:   end,
            isRenewal,
          }).catch(() => {});

          if (isRenewal && !user.notifPrefs?.paused && user.notifPrefs?.renewal !== false) {
            const PLAN_NAMES = { silver: "Silver", gold: "Gold" };
            sendNotificationEmail("renewal", {
              name:     user.name,
              email:    user.email,
              planName: PLAN_NAMES[plan] || plan,
              endDate:  end,
            }).catch(() => {});
          }

          logInfo("payment", isRenewal ? "subscription.renewed" : "subscription.created",
            `${isRenewal ? "Renovación" : "Nueva suscripción"} ${planInfo.name} — ${user?.email}`,
            { userId: user?._id, userName: user?.name, userEmail: user?.email,
              meta: { plan, amount: payment.transaction_amount ?? planInfo.amount, isRenewal } });
        }
      }
    }

    /* ── 2. Cambio de estado de suscripción (cancelación, pausa) ── */
    if (type === "subscription_preapproval" && data?.id) {
      const paRes      = await mpFetch(`/preapproval/${data.id}`);
      const preapproval = await paRes.json();

      const [userId] = (preapproval.external_reference || "").split("|");
      if (!userId) return res.sendStatus(200);

      if (preapproval.status === "cancelled") {
        await Subscription.findOneAndUpdate(
          { user: userId, mpSubscriptionId: data.id },
          { $set: { status: "cancelled", autoRenew: false } }
        );
        console.log(`Suscripción cancelada desde MP para usuario ${userId}`);
      }

      if (preapproval.status === "authorized") {
        // Primera autorización — el primer cobro llega via subscription_authorized_payment
        console.log(`Suscripción autorizada para usuario ${userId}`);
      }
    }

    /* ── 3. Compatibilidad con pagos únicos anteriores (Checkout Pro) ── */
    if (type === "payment" && data?.id) {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const paymentClient = new Payment(client);
      const mp = await paymentClient.get({ id: data.id });

      if (mp.status === "approved") {
        const [userId, plan] = (mp.external_reference || "").split("|");
        if (!userId) return res.sendStatus(200);

        const planInfo = PLANS[plan];
        if (!planInfo) return res.sendStatus(200);

        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);

        const sub = await Subscription.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              user:      userId,
              plan,
              status:    "active",
              startDate: now,
              endDate:   end,
              amount:    mp.transaction_amount,
              currency:  mp.currency_id,
            },
            $push: {
              paymentHistory: {
                $each: [{
                  mpPaymentId: mp.id.toString(),
                  amount:      mp.transaction_amount,
                  currency:    mp.currency_id,
                  status:      "approved",
                  plan,
                  description: `Pago ${planInfo.name} — 30 días`,
                }],
                $position: 0,
              },
            },
          },
          { upsert: true, returnDocument: "after" }
        );

        const user = await User.findById(userId);
        if (user) {
          const isRenewal = sub.paymentHistory.length > 1 &&
            sub.paymentHistory[1]?.plan === plan;
          await sendPaymentEmail({
            name:     user.name,
            email:    user.email,
            plan,
            amount:   mp.transaction_amount,
            currency: mp.currency_id,
            endDate:  end,
            isRenewal,
          });

          sendNotificationEmail("admin-new-sub", {
            userName:  user.name,
            userEmail: user.email,
            plan,
            amount:    mp.transaction_amount,
            currency:  mp.currency_id,
            startDate: now,
            endDate:   end,
            isRenewal,
          }).catch(() => {});

          logInfo("payment", isRenewal ? "subscription.renewed" : "subscription.created",
            `${isRenewal ? "Renovación" : "Nueva suscripción"} ${planInfo.name} — ${user.email}`,
            { userId: user._id, userName: user.name, userEmail: user.email,
              meta: { plan, amount: mp.transaction_amount, currency: mp.currency_id, isRenewal, mpPaymentId: mp.id } });
        }
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    logError("payment", "webhook.error", `Error en webhook: ${err.message}`, { meta: { error: err.message } });
    return res.sendStatus(500);
  }
});

/* ─── GET SUSCRIPCIÓN DEL USUARIO ────────────────────────────── */
router.get("/subscription", authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });

    // Auto-expirar cualquier suscripción vencida
    if (sub?.status === "active" && sub.endDate && sub.endDate < new Date()) {
      sub.status = "expired";
      await sub.save();
    }

    return res.json({ subscription: sub || null });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener la suscripción." });
  }
});

/* ─── CANCELAR SUSCRIPCIÓN ───────────────────────────────────── */
router.post("/cancel", authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    if (!sub) return res.status(404).json({ error: "No tenés una suscripción activa." });

    // Cancelar el preapproval en MP para detener el cobro automático
    if (sub.mpSubscriptionId) {
      try {
        await mpFetch(`/preapproval/${sub.mpSubscriptionId}`, {
          method: "PUT",
          body: JSON.stringify({ status: "cancelled" }),
        });
      } catch (mpErr) {
        console.error("Error al cancelar en MP:", mpErr.message);
        // Cancelamos localmente igual aunque MP falle
      }
    }

    sub.status    = "cancelled";
    sub.autoRenew = false;
    await sub.save();

    logInfo("payment", "subscription.cancelled",
      `Cancelación Plan ${sub.plan} — ${req.user.email}`,
      { userId: req.user._id, userName: req.user.name, userEmail: req.user.email,
        meta: { plan: sub.plan, amount: sub.amount } });

    // Emails de confirmación de cancelación
    const cancelUser = req.user; // ya viene populado del authMiddleware
    if (cancelUser?.email) {
      const PLAN_NAMES = { silver: "Silver", gold: "Gold" };
      const planName   = PLAN_NAMES[sub.plan] || sub.plan;

      // Al usuario
      sendNotificationEmail("cancellation", {
        name:     cancelUser.name,
        email:    cancelUser.email,
        planName,
        endDate:  sub.endDate,
      }).catch((err) => console.error("❌ Email cancelación usuario:", err.message));

      // Al admin
      sendNotificationEmail("admin-new-sub", {
        userName:  cancelUser.name,
        userEmail: cancelUser.email,
        plan:      sub.plan,
        amount:    sub.amount,
        currency:  sub.currency || "ARS",
        startDate: sub.startDate,
        endDate:   sub.endDate,
        isRenewal: false,
        isCancellation: true,
      }).catch((err) => console.error("❌ Email cancelación admin:", err.message));
    }

    return res.json({ message: "Suscripción cancelada. Seguís teniendo acceso hasta el fin del período." });
  } catch (err) {
    return res.status(500).json({ error: "Error al cancelar la suscripción." });
  }
});

/* ─── TOGGLE AUTO-RENOVACIÓN ─────────────────────────────────── */
router.post("/toggle-renew", authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    if (!sub) return res.status(404).json({ error: "No tenés una suscripción." });

    const newAutoRenew = !sub.autoRenew;

    // Si se desactiva: cancelar el preapproval en MP para detener el cobro automático
    // El status queda "active" — el usuario conserva acceso hasta endDate
    if (!newAutoRenew && sub.mpSubscriptionId) {
      try {
        await mpFetch(`/preapproval/${sub.mpSubscriptionId}`, {
          method: "PUT",
          body: JSON.stringify({ status: "cancelled" }),
        });
      } catch (mpErr) {
        console.error("Error al cancelar preapproval en MP:", mpErr.message);
      }
    }

    sub.autoRenew = newAutoRenew;
    await sub.save();

    return res.json({ autoRenew: sub.autoRenew });
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar la configuración." });
  }
});

export { PLANS };
export default router;
