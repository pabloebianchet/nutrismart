/**
 * requireActiveSub
 * ─────────────────────────────────────────────────────────────
 * Middleware que protege rutas premium (generar plan, recetas, etc.)
 *
 * Reglas:
 *  - Sin suscripción → 403
 *  - Plan vencido (endDate < ahora) → auto-expira + 403
 *  - status === "cancelled" pero endDate todavía no llegó → pasa (grace
 *    period: /cancel promete "seguís teniendo acceso hasta el fin del
 *    período", este middleware tiene que respetar esa promesa)
 *  - status !== "active"/"cancelled-con-acceso" (expired) → 403
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

    const now = new Date();

    // Auto-expirar si la fecha de fin ya pasó (activa o cancelada con
    // período ya vencido)
    if ((sub.status === "active" || sub.status === "cancelled") && sub.endDate && sub.endDate < now) {
      sub.status = "expired";
      await sub.save();
    }

    // Cancelada pero todavía dentro del período pagado — sigue teniendo
    // acceso, tal como se le prometió al cancelar.
    const hasGraceAccess = sub.status === "cancelled" && sub.endDate && sub.endDate >= now;

    if (sub.status !== "active" && !hasGraceAccess) {
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
