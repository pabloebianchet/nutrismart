/**
 * Adivina un nombre a partir de la parte local del mail (antes del @) —
 * usado como punto de partida para cuentas de magic link, que no tienen
 * ningún nombre real disponible (a diferencia de Google, que lo da en el
 * perfil). Es solo una sugerencia: el usuario la edita en el onboarding.
 * "juan.perez23@gmail.com" → "Juan Perez"
 */
export const nameFromEmail = (email) => {
  const local = String(email || "").split("@")[0] || "";
  const cleaned = local
    .replace(/[0-9]+/g, " ")
    .replace(/[._-]+/g, " ")
    .trim();

  if (!cleaned) return "";

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};
