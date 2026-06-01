import { useEffect } from "react";

const BASE_URL = "https://nuiapp.com";
const DEFAULT  = {
  title:       "Nui — Tu asistente de salud con IA",
  description: "Analizá alimentos, generá recetas saludables, entrenamiento personalizado y balance calórico diario por voz. Gratis 7 días.",
  image:       `${BASE_URL}/img/og-image.png`,
};

/**
 * Actualiza title, description y Open Graph al montar la página.
 * Se restauran los valores por defecto al desmontar.
 */
const usePageMeta = ({ title, description, image, canonical } = {}) => {
  useEffect(() => {
    const t   = title       || DEFAULT.title;
    const d   = description || DEFAULT.description;
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
    setOG("og:title",        t);
    setOG("og:description",  d);
    setOG("og:image",        img);
    setOG("og:url",          url);
    setMeta("twitter:title",       t);
    setMeta("twitter:description", d);
    setMeta("twitter:image",       img);
    setLink("canonical",           url);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, image, canonical]);
};

export default usePageMeta;
