/**
 * clientIp.js
 * ─────────────────────────────────────────────────────────────
 * IP real del visitante — la app corre detrás de Cloudflare (delante de
 * Render), así que `req.ip` (aunque `trust proxy` esté seteado) muchas
 * veces devuelve una IP de borde de Cloudflare compartida entre un
 * montón de visitantes sin relación entre sí, no la IP real de quien
 * hace la request. Confirmado en vivo investigando actividad sospechosa:
 * la misma "IP" aparecía en decenas de usuarios distintos.
 *
 * Cloudflare siempre manda la IP real del visitante en el header
 * CF-Connecting-IP para tráfico proxied — hay que usar ese primero.
 * ─────────────────────────────────────────────────────────────
 */
export const getClientIp = (req) =>
  req.headers["cf-connecting-ip"] || req.ip;
