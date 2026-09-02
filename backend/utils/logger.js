import Log from "../models/Log.js";

// Eventos de ciclo de vida de suscripción — alimentan las métricas de
// negocio del admin (altas/cancelaciones por período). No deben expirar,
// a diferencia del resto de los logs (auditoría técnica, 90 días).
const PERMANENT_ACTIONS = new Set([
  "subscription.created",
  "subscription.renewed",
  "subscription.cancelled",
  "subscription.assigned",
  "subscription.restored",
]);

const LOG_RETENTION_DAYS = 90;

export const logEvent = (level, category, action, message, opts = {}) => {
  // Fire-and-forget: never throws, never awaited
  Log.create({
    level, category, action, message,
    userId:    opts.userId    || null,
    userName:  opts.userName  || null,
    userEmail: opts.userEmail || null,
    ip:        opts.ip        || null,
    meta:      opts.meta      || null,
    expiresAt: PERMANENT_ACTIONS.has(action)
      ? null
      : new Date(Date.now() + LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000),
  }).catch((err) => console.error("[Logger]", err.message));
};

export const logInfo  = (cat, action, msg, opts) => logEvent("info",  cat, action, msg, opts);
export const logWarn  = (cat, action, msg, opts) => logEvent("warn",  cat, action, msg, opts);
export const logError = (cat, action, msg, opts) => logEvent("error", cat, action, msg, opts);
