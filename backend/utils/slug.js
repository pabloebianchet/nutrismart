/**
 * Mismo algoritmo que frontend/src/utils/blogSlug.js — duplicado a propósito
 * porque backend y frontend son deploys separados (Render vs Vercel), sin
 * acceso cruzado a los archivos del otro en runtime. Si se toca acá, tocar
 * también allá.
 */
export const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildPostSlug = (post) => `${post.date}-${slugify(post.title)}`;
