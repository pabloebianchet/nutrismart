import express from "express";

const router = express.Router();

// Cache en memoria simple: mismo IP no vuelve a pegarle al servicio externo
// por 6hs. Evita gastar la cuota gratuita de ip-api.com en cada carga de /pricing.
const cache = new Map();
const TTL_MS = 6 * 60 * 60 * 1000;

/* ─── GET /api/geo — país del visitante, para elegir MP (AR) vs Stripe (US) ──
 * Si el lookup falla por cualquier motivo, devuelve country: null — el
 * frontend debe interpretar null como "no se pudo determinar" y quedarse
 * con el comportamiento por defecto (Mercado Pago / Argentina), nunca
 * romper ni bloquear el flujo de pago existente.
 */
router.get("/", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "").trim().replace(/^::ffff:/, "");

  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return res.json({ country: null, ip });
  }

  const cached = cache.get(ip);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    return res.json({ country: cached.country, ip });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const r = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await r.json();
    const country = data.status === "success" ? data.countryCode : null;
    cache.set(ip, { country, ts: Date.now() });
    return res.json({ country, ip });
  } catch {
    return res.json({ country: null, ip });
  }
});

export default router;
