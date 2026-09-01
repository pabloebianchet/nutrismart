import { useEffect } from "react";

const BASE_URL = "https://nuiapp.com";
const DEFAULT  = {
  title:       "Nui — Tu asistente de salud con IA",
  description: "Analizá alimentos, generá recetas saludables, entrenamiento personalizado y balance calórico diario por voz. Gratis 7 días.",
  image:       `${BASE_URL}/img/og-image.png`,
};

/**
 * Actualiza title, description, Open Graph y (opcional) hreflang al montar
 * la página. Se restauran los valores por defecto al desmontar.
 *
 * `alternates`: array de { hreflang, href } para páginas que SÍ son la
 * misma página en dos idiomas (home, pricing, about, how-it-works,
 * contact) — no usar en contenido independiente entre idiomas (las notas
 * del blog), donde un hreflang alternate sería un error semántico.
 */
const usePageMeta = ({ title, description, image, canonical, alternates, ogTitle, ogDescription } = {}) => {
  useEffect(() => {
    const t   = title       || DEFAULT.title;
    const d   = description || DEFAULT.description;
    const ogT = ogTitle       || t;
    const ogD = ogDescription || d;
    const img = image       || DEFAULT.image;
    const url = canonical   ? `${BASE_URL}${canonical}` : BASE_URL;

    // Title
    const prevTitle = document.title;
    document.title  = t;

    // Meta description
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
      el.setAttribute("content", content);
      return el;
    };
    const setOG = (prop, content) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
      return el;
    };
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement("link"); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
      return el;
    };

    setMeta("description",   d);
    setOG("og:title",        ogT);
    setOG("og:description",  ogD);
    setOG("og:image",        img);
    setOG("og:url",          url);
    setMeta("twitter:title",       ogT);
    setMeta("twitter:description", ogD);
    setMeta("twitter:image",       img);
    setLink("canonical",           url);

    // Upsert por hreflang (no "borrar todo y volver a crear") — así el
    // resultado converge al mismo set sin importar cuántas veces corra
    // este efecto antes de que algo (ej. Puppeteer) tome una foto del DOM.
    // Nunca queda un momento con tags duplicados de dos corridas distintas.
    const wantedHreflangs = new Set((alternates || []).map((a) => a.hreflang));
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => {
      if (!wantedHreflangs.has(el.getAttribute("hreflang"))) el.remove();
    });
    for (const { hreflang, href } of (alternates || [])) {
      let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
      if (!el) {
        el = document.createElement("link");
        el.rel = "alternate";
        el.hreflang = hreflang;
        document.head.appendChild(el);
      }
      el.href = `${BASE_URL}${href}`;
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, ogTitle, ogDescription, image, canonical, JSON.stringify(alternates)]);
};

export default usePageMeta;
