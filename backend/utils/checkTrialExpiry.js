/**
 * checkTrialExpiry.js
 * ─────────────────────────────────────────────────────────────
 * Job diario: detecta usuarios con prueba gratuita que vence
 * mañana y les envía un email recordatorio.
 *
 * Se ejecuta al arrancar el servidor y cada 24 horas.
 * Usa el campo trialExpiryEmailSent en Subscription para
 * garantizar que el email se envíe una sola vez por trial.
 * ─────────────────────────────────────────────────────────────
 */

import Subscription from "../models/Subscription.js";
import { sendNotificationEmail } from "./sendNotificationEmail.js";

export const checkTrialExpiryEmails = async () => {
  const now = new Date();

  // Ventana: mañana completo (00:00:00 a 23:59:59)
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  try {
    const expiringSubs = await Subscription.find({
      plan:                 "free",
      status:               "active",
      endDate:              { $gte: tomorrowStart, $lte: tomorrowEnd },
      trialExpiryEmailSent: { $ne: true },
    }).populate("user", "name email");

    if (expiringSubs.length === 0) {
      console.log("⏰ Trial expiry check: sin envíos pendientes.");
      return;
    }

    for (const sub of expiringSubs) {
      const user = sub.user;
      if (!user?.email) continue;

      await sendNotificationEmail("trial-expiry", {
        name:         user.name,
        email:        user.email,
        trialEndDate: sub.endDate,
      });

      // Marcar como enviado para evitar duplicados
      sub.trialExpiryEmailSent = true;
      await sub.save();
    }

    console.log(`⏰ Trial expiry check: ${expiringSubs.length} email(s) enviado(s).`);
  } catch (err) {
    console.error("❌ Error en checkTrialExpiryEmails:", err.message);
  }
};

/**
 * Inicia el job: lo ejecuta al arrancar y cada 24 horas.
 * Se llama UNA sola vez desde index.js, después de connectDB().
 */
export const startTrialExpiryJob = () => {
  const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

  // Pequeño delay inicial para asegurarse de que MongoDB está listo
  setTimeout(() => {
    checkTrialExpiryEmails();
    setInterval(checkTrialExpiryEmails, INTERVAL_MS);
  }, 8000);

  console.log("✅ Job de trial-expiry iniciado (cada 24 h).");
};
