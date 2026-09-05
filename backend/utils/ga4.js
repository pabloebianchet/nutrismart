import crypto from "crypto";

/**
 * Envía un evento a GA4 vía Measurement Protocol (server-to-server) — para
 * eventos que no ocurren en el navegador, como el pixel de apertura de un
 * mail. No hay client_id real de sesión de GA acá (no es un request del
 * navegador con la cookie de GA), así que se genera uno al toque: el
 * evento entra a GA4 como conteo suelto, no conectado al resto del embudo
 * web (inapp_browser_detected / inapp_browser_magic_link_submit).
 *
 * Requiere GA_MEASUREMENT_ID (el mismo "G-XXXX" del gtag del frontend) y
 * GA_API_SECRET (Admin → Data Streams → tu stream → Measurement Protocol
 * API secrets, en GA4 — hay que crearlo ahí, no es la misma clave que el
 * measurement ID). Si faltan, no hace nada.
 */
export const sendGA4Event = async (eventName, { clientId, params = {} } = {}) => {
  // Mismo "G-XXXX" que ya usa el gtag del frontend (frontend/index.html) —
  // solo el API secret es una credencial nueva a crear en GA4.
  const measurementId = process.env.GA_MEASUREMENT_ID || "G-4MNP4XN25S";
  const apiSecret = process.env.GA_API_SECRET;
  if (!measurementId || !apiSecret) return;

  const cid = clientId || crypto.randomBytes(16).toString("hex");

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({ client_id: cid, events: [{ name: eventName, params }] }),
      }
    );
  } catch (err) {
    console.error("[GA4 Measurement Protocol]", err.message);
  }
};
