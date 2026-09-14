import ExcludedIp from "../models/ExcludedIp.js";

/**
 * ¿La IP dada está marcada como interna/de testing? Se consulta en cada
 * registro (evento infrecuente) — no hace falta cachear en memoria.
 */
export const isExcludedIp = async (ip) => {
  if (!ip) return false;
  const found = await ExcludedIp.findOne({ ip }).lean();
  return !!found;
};
