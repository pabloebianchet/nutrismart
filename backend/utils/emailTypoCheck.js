/**
 * Detecta errores de tipeo comunes en el dominio de un mail (gmail.como,
 * gmial.com, hotmial.com, etc.) comparando contra los proveedores más
 * usados con distancia de Levenshtein. Pensado para el signup por magic
 * link: ahí no hay ninguna verificación de que el mail exista de
 * verdad, así que un typo deja una cuenta creada (con trial activado)
 * que nadie va a poder usar nunca — visto en vivo con "gmail.como".
 */
const POPULAR_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "hotmail.com.ar",
  "outlook.com",
  "outlook.com.ar",
  "yahoo.com",
  "yahoo.com.ar",
  "icloud.com",
  "live.com",
  "msn.com",
];

const levenshtein = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
};

/**
 * @returns {string|null} el mail corregido sugerido, o null si el dominio
 * ya es válido / no se parece lo suficiente a ninguno conocido como para
 * asumir que es un typo (evita falsos positivos con dominios propios).
 */
export const suggestEmailCorrection = (email) => {
  const at = String(email || "").lastIndexOf("@");
  if (at === -1) return null;

  const domain = email.slice(at + 1).toLowerCase().trim();
  if (domain.length < 5 || POPULAR_DOMAINS.includes(domain)) return null;

  let best = null;
  let bestDist = Infinity;
  for (const known of POPULAR_DOMAINS) {
    const d = levenshtein(domain, known);
    if (d < bestDist) { bestDist = d; best = known; }
  }

  // Distancia 1-2 = típico error de tipeo (una letra de más/menos/cambiada).
  // Más que eso ya es probablemente un dominio genuinamente distinto.
  if (bestDist >= 1 && bestDist <= 2) {
    return email.slice(0, at + 1) + best;
  }
  return null;
};
