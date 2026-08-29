/**
 * Slug de posts del blog — compartido entre el frontend (React) y
 * scripts/prerender.mjs (Node plano, mismo módulo importado por ambos).
 *
 * El identificador único real sigue siendo `date` (YYYY-MM-DD, ya único
 * en Mongo). El slug es date + título legible solo para que la URL sea
 * rica en keywords — dateFromSlug() ignora el resto y solo lee el date.
 */
export const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "") // tildes/diacríticos tras NFD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildPostSlug = (post) => `${post.date}-${slugify(post.title)}`;

const DATE_RE = /^(\d{4}-\d{2}-\d{2})/;

export const dateFromSlug = (slug) => {
  const m = DATE_RE.exec(slug || "");
  return m ? m[1] : null;
};
