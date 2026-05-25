import Subscription from "../models/Subscription.js";

/**
 * Activa el período de prueba gratuito (7 días) para un usuario recién registrado.
 * Si ya tiene alguna suscripción (no debería ocurrir en registro normal), la devuelve sin crear otra.
 */
export const activateFreeTrial = async (userId) => {
  const existing = await Subscription.findOne({ user: userId });
  if (existing) return existing;

  const start = new Date();
  const end   = new Date(start);
  end.setDate(end.getDate() + 7);

  return Subscription.create({
    user:      userId,
    plan:      "free",
    status:    "active",
    startDate: start,
    endDate:   end,
    autoRenew: false,
    amount:    0,
    currency:  "ARS",
  });
};
