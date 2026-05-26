/**
 * requireActiveSub
 * ─────────────────────────────────────────────────────────────
 * Middleware que protege rutas premium (generar plan, recetas, etc.)
 *
 * Reglas:
 *  - Sin suscripción → 403
 *  - Plan vencido (endDate < ahora) → auto-expira + 403
 *  - status !== "active" (expired, cancelled) → 403
 *  - status === "active" → pasa
 *
 * Requiere que authMiddleware haya corrido antes (req.user disponible).
 */

import Subscription from "../models/Subscription.js";

export const requireActiveSub = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });

    if (!sub) {
      return res.status(403).json({
        error: "Necesitás una suscripción activa para usar esta función.",
        code:  "SUBSCRIPTION_REQUIRED",
      });
    }

    // Auto-expirar si la fecha de fin ya pasó (paid o free)
    if (sub.status === "active" && sub.endDate && sub.endDate < new Date()) {
      sub.status = "expired";
      await sub.save();
    }

    if (sub.status !== "active") {
      return res.status(403).json({
        error:     "Tu suscripción venció. Renovar para continuar.",
        code:      "SUBSCRIPTION_REQUIRED",
        subStatus: sub.status,
        subPlan:   sub.plan,
      });
    }

    next();
  } catch (err) {
    console.error("requireActiveSub error:", err.message);
    return res.status(500).json({ error: "Error al verificar la suscripción." });
  }
};
