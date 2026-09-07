/**
 * checkReminders.js
 * ─────────────────────────────────────────────────────────────
 * Job diario: manda como mucho UN mail de recordatorio por usuario y
 * corrida, en este orden de prioridad:
 *   1. Inactividad — no inició sesión en REMINDER_DAYS días.
 *   2. Entrenamiento — tiene al menos un plan generado, pero no registró
 *      una sesión en REMINDER_DAYS días (y sí entró a la app recientemente
 *      — si no, ya le tocó el de inactividad arriba).
 *   3. Alimentación — tiene al menos un registro de comida alguna vez,
 *      pero no en REMINDER_DAYS días.
 *
 * Un solo toggle en notifPrefs.reminders controla los tres — no hay
 * bandera separada por tipo. lastReminderSentAt actúa como cooldown
 * compartido: no se manda un segundo recordatorio de ningún tipo hasta
 * que pasen otros REMINDER_DAYS días.
 * ─────────────────────────────────────────────────────────────
 */

import User from "../models/User.js";
import TrainingPlan from "../models/TrainingPlan.js";
import DailyLog from "../models/DailyLog.js";
import { sendNotificationEmail } from "./sendNotificationEmail.js";

const REMINDER_DAYS = 3;
const REMINDER_MS = REMINDER_DAYS * 24 * 60 * 60 * 1000;

const daysAgo = (date) => (Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000);

export const checkReminders = async () => {
  try {
    const candidates = await User.find({
      profileCompleted: true,
      "notifPrefs.paused": { $ne: true },
      "notifPrefs.reminders": { $ne: false },
      $or: [
        { lastReminderSentAt: null },
        { lastReminderSentAt: { $lte: new Date(Date.now() - REMINDER_MS) } },
      ],
    }).select("name email lang lastActiveAt");

    if (candidates.length === 0) {
      console.log("💌 Reminders: sin candidatos.");
      return;
    }

    let sent = 0;
    for (const user of candidates) {
      let kind = null;

      if (daysAgo(user.lastActiveAt) >= REMINDER_DAYS) {
        kind = "inactivity";
      } else {
        // Solo tiene sentido chequear entreno/comida si SÍ está entrando a
        // la app — si no, el de inactividad de arriba ya cubre el caso.
        const [lastPlan, lastLog] = await Promise.all([
          TrainingPlan.findOne({ user: user._id }).sort({ updatedAt: -1 }).select("updatedAt").lean(),
          DailyLog.findOne({ user: user._id }).sort({ createdAt: -1 }).select("createdAt").lean(),
        ]);

        if (lastPlan && daysAgo(lastPlan.updatedAt) >= REMINDER_DAYS) {
          kind = "training";
        } else if (lastLog && daysAgo(lastLog.createdAt) >= REMINDER_DAYS) {
          kind = "food";
        }
      }

      if (!kind) continue;

      try {
        await sendNotificationEmail("reminder", {
          kind,
          name:  user.name,
          email: user.email,
          lang:  user.lang,
        });
        await User.updateOne({ _id: user._id }, { $set: { lastReminderSentAt: new Date() } });
        sent++;
      } catch (err) {
        console.error(`❌ Reminder [${kind}] falló para ${user.email}:`, err.message);
      }
    }

    console.log(`💌 Reminders: ${sent}/${candidates.length} mail(s) enviado(s).`);
  } catch (err) {
    console.error("❌ Error en checkReminders:", err.message);
  }
};

/**
 * Inicia el job: lo ejecuta al arrancar y cada 24 horas.
 * Se llama UNA sola vez desde index.js, después de connectDB().
 */
export const startRemindersJob = () => {
  const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

  setTimeout(() => {
    checkReminders();
    setInterval(checkReminders, INTERVAL_MS);
  }, 20000); // delay inicial más largo que el resto de los jobs de arranque

  console.log("✅ Job de recordatorios iniciado (cada 24 h).");
};
