import { TOPICS_ES, TOPICS_EN } from "../data/dailyPostTopics.js";

const BANKS = { "es-AR": TOPICS_ES, en: TOPICS_EN };

/**
 * Elige el tema del día para `lang`, evitando keywords ya usados en los
 * últimos N días de ESE MISMO idioma (`excludeKeywords`, un Set). Si el
 * banco entero ya se usó en la ventana (se agota), cae de vuelta a rotar
 * sobre todo el banco — igual es mejor que romper la generación diaria, y
 * queda marcado como `exhausted` para loguearlo.
 *
 * Selección determinística por fecha (no random) para que sea reproducible
 * y fácil de auditar: qué tema le tocó a qué día.
 */
export const pickTopic = (lang, dateStr, excludeKeywords) => {
  const bank = BANKS[lang];
  if (!bank) throw new Error(`Banco de temas no encontrado para lang="${lang}"`);

  const available = bank.filter((t) => !excludeKeywords.has(t.keyword));
  const pool = available.length > 0 ? available : bank;
  const exhausted = available.length === 0;

  const dayIndex = Math.floor(new Date(dateStr).getTime() / 86400000);
  const entry = pool[dayIndex % pool.length];

  return { ...entry, exhausted };
};

/** Similitud coseno entre dos vectores del mismo largo. */
export const cosineSimilarity = (a, b) => {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const MIN_BODY_LENGTH = 600;
export const SIMILARITY_THRESHOLD = 0.90;
export const CANNIBALIZATION_WINDOW_DAYS = 60;
export const DUPLICATE_CHECK_WINDOW_DAYS = 30;

export const cutoffDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
};
