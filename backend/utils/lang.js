// Idioma de salida para contenido generado por IA.
// El frontend manda `lang: "en"` cuando el usuario está en la región US (isUS).
// Cualquier otro valor (o ausencia) cae a español, el comportamiento histórico.
export const getLang = (req) =>
  (req.body?.lang === "en" || req.query?.lang === "en") ? "en" : "es";
