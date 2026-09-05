/**
 * Detecta navegadores embebidos (Instagram/Facebook in-app browser). Ahí no
 * hay sesión de Google compartida con Safari/Chrome, así que "Continuar con
 * Google" siempre cae al login manual completo (mail + contraseña) en vez
 * del selector de cuenta de un toque — la fricción que frena el registro
 * de tráfico pago que llega desde un anuncio de Instagram/Facebook.
 *
 * Se probaron variantes de "escapar" al navegador del sistema (esquemas
 * x-safari-https:// e intent://) y quedó confirmado en vivo que Instagram
 * las bloquea — por eso el flujo para este caso es magic link por mail en
 * vez de forzar una salida del WebView.
 */
export const isInAppBrowser = () => {
  if (typeof navigator === "undefined") return false;
  return /Instagram|FBAN|FBAV|FB_IAB/.test(navigator.userAgent || "");
};
