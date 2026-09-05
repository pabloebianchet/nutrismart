/**
 * Detecta navegadores embebidos (Instagram/Facebook in-app browser). Ahí no
 * hay sesión de Google compartida con Safari/Chrome, así que "Continuar con
 * Google" siempre cae al login manual completo (mail + contraseña) en vez
 * del selector de cuenta de un toque — la fricción que frena el registro
 * de tráfico pago que llega desde un anuncio de Instagram/Facebook.
 */
export const isInAppBrowser = () => {
  if (typeof navigator === "undefined") return false;
  return /Instagram|FBAN|FBAV|FB_IAB/.test(navigator.userAgent || "");
};

const isIOS = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent || "");

/**
 * Fuerza la apertura de la URL actual en el navegador del sistema.
 * iOS: el esquema x-safari-https:// abre Safari directamente.
 * Android: intent:// con scheme=https y sin `package` fijo — así Android
 * resuelve contra el navegador default del usuario (Chrome, Samsung
 * Internet, Firefox, el que sea) en vez de fallar si Chrome no está
 * instalado o no es el default.
 */
export const openInSystemBrowser = () => {
  const url = window.location.href;
  if (isIOS()) {
    window.location.href = url.replace(/^https?:\/\//, "x-safari-https://");
  } else {
    const withoutProtocol = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${withoutProtocol}#Intent;scheme=https;end;`;
  }
};
