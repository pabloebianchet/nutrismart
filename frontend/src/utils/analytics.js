/**
 * Wrapper mínimo sobre gtag — respeta el Consent Mode v2 ya configurado en
 * index.html (si el usuario no aceptó cookies, gtag igual existe pero GA
 * no persiste nada; no hace falta chequear consentimiento acá).
 */
const track = (eventName, params = {}) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
};

/**
 * Evento estándar de GA4/Google Ads para conversión de registro completado.
 * Disparar UNA vez, justo cuando se crea la cuenta (no en cada login).
 * @param {"google"|"email"} method
 */
export const trackSignUp = (method) => track("sign_up", { method });
