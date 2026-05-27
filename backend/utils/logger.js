import Log from "../models/Log.js";

export const logEvent = (level, category, action, message, opts = {}) => {
  // Fire-and-forget: never throws, never awaited
  Log.create({
    level, category, action, message,
    userId:    opts.userId    || null,
    userName:  opts.userName  || null,
    userEmail: opts.userEmail || null,
    ip:        opts.ip        || null,
    meta:      opts.meta      || null,
  }).catch((err) => console.error("[Logger]", err.message));
};

export const logInfo  = (cat, action, msg, opts) => logEvent("info",  cat, action, msg, opts);
export const logWarn  = (cat, action, msg, opts) => logEvent("warn",  cat, action, msg, opts);
export const logError = (cat, action, msg, opts) => logEvent("error", cat, action, msg, opts);
