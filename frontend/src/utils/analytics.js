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

/**
 * Click en un CTA "Empezar gratis" / "Iniciar sesión" — se llama desde
 * varios lugares de la landing (nav, hero, secciones intermedias, pricing,
 * CTA final) que antes no distinguían de dónde venía el click, así que no
 * se podía saber si el CTA del hero (arriba de todo) se estaba usando o
 * si toda la interacción real venía de más abajo en la página.
 * @param {string} location identificador de qué CTA se clickeó (ej: "hero", "nav_start_free", "pricing_gold")
 */
export const trackCTAClick = (location) =>
  track("select_content", { content_type: "cta", item_id: location });

/**
 * Se dispara UNA vez cuando se detecta que el sitio se abrió dentro del
 * navegador embebido de Instagram/Facebook y se muestra el aviso para salir
 * al navegador del sistema — mide cuánto tráfico pago cae en ese caso.
 */
export const trackInAppBrowserDetected = () => track("inapp_browser_detected");

/**
 * Click en el botón "Abrir en el navegador" del aviso de in-app browser —
 * permite separar "vio el aviso" de "efectivamente intentó salir", para
 * saber si el aviso en sí genera abandono o si la gente lo usa.
 */
export const trackInAppBrowserExitClick = () => track("inapp_browser_exit_click");
