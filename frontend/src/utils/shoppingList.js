/**
 * shoppingList.js
 * Parser de ingredientes + helpers de localStorage
 */

const STORAGE_KEY = "nui_shopping_list";

/* ─── Unidades conocidas ─────────────────────────────────────────────── */
const UNITS = [
  "kg","g","mg","ml","l","lt","litro","litros",
  "taza","tazas","tz",
  "cdta","cda","cdas","cucharada","cucharadas","cucharadita","cucharaditas",
  "unidad","unidades","u",
  "diente","dientes",
];

const FRACTIONS = {
  "½": 0.5, "¼": 0.25, "¾": 0.75,
  "⅓": 0.333, "⅔": 0.667, "⅛": 0.125,
};

/* ─── Normalizar texto ─────────────────────────────────────────────── */
const normalize = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // quitar tildes
    .replace(/\s+/g, " ")
    .trim();

/* ─── Parser ─────────────────────────────────────────────────────────── */
export const parseIngredient = (raw, recipeName = "") => {
  let text = raw.replace(/^[-•*·]\s*/, "").trim();

  // Reemplazar fracciones Unicode
  Object.entries(FRACTIONS).forEach(([k, v]) => {
    text = text.replace(new RegExp(k, "g"), String(v));
  });

  // Regex: (número) (posible_unidad) (de/del/…) (nombre)
  const m = text.match(
    /^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)\s*([a-záéíóúñA-ZÁÉÍÓÚÑ]*)\s*(?:de\s+(?:la\s+|los\s+|las\s+|el\s+)?|del\s+)?(.*)/i
  );

  let quantity = null;
  let unit     = "";
  let name     = text;

  if (m) {
    const rawQty  = m[1].replace(",", ".").replace(/\s/g, "");
    // Soporte para fracción: "1/2"
    if (rawQty.includes("/")) {
      const [a, b] = rawQty.split("/");
      quantity = parseFloat(a) / parseFloat(b);
    } else {
      quantity = parseFloat(rawQty);
    }
    if (isNaN(quantity)) quantity = null;

    const possibleUnit = (m[2] || "").toLowerCase().trim();
    if (UNITS.includes(possibleUnit)) {
      unit = possibleUnit;
      name = (m[3] || "").trim();
    } else {
      // No es una unidad conocida → es parte del nombre
      name = ((m[2] || "") + " " + (m[3] || "")).trim();
    }
  }

  if (!name) name = text;

  return {
    _id:            `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    normalizedName: normalize(name) || normalize(text),
    quantity,
    unit,
    displayText:    raw.replace(/^[-•*·]\s*/, "").trim(),
    checked:        false,
    sources:        recipeName ? [recipeName] : [],
  };
};

/* ─── Merge: suma ingredientes repetidos ─────────────────────────── */
export const mergeIngredients = (existing, newItems) => {
  const result = existing.map((i) => ({ ...i }));

  for (const item of newItems) {
    const idx = result.findIndex(
      (e) => e.normalizedName === item.normalizedName && e.unit === item.unit
    );

    if (idx >= 0) {
      // Sumar cantidades si ambas son numéricas
      if (item.quantity !== null && result[idx].quantity !== null) {
        const sum = result[idx].quantity + item.quantity;
        result[idx].quantity = Math.round(sum * 100) / 100;
      }
      // Agregar fuente si no estaba
      if (item.sources[0] && !result[idx].sources.includes(item.sources[0])) {
        result[idx].sources = [...result[idx].sources, ...item.sources];
      }
    } else {
      result.push({ ...item });
    }
  }

  return result;
};

/* ─── Formatear para mostrar ─────────────────────────────────────── */
export const formatItemLabel = (item) => {
  if (item.quantity === null) return item.name || item.displayText;
  const qty  = Number.isInteger(item.quantity) ? item.quantity : item.quantity;
  const unit = item.unit ? `${item.unit} ` : "";
  return `${qty} ${unit}${item.name}`.trim();
};

/* ─── localStorage ───────────────────────────────────────────────── */
export const loadList = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveList = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};
