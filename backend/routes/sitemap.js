import express from "express";
import DailyPost from "../models/DailyPost.js";

const router = express.Router();
const BASE = "https://nuiapp.com";

// Cache corto en memoria — Googlebot/Bingbot piden el sitemap
// periódicamente, no en cada visita real; evita pegarle a Mongo en cada
// request sin dejar de reflejar contenido nuevo en minutos, no en deploys.
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map(); // key -> { xml, expiresAt }

const cached = async (key, build) => {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.xml;
  const xml = await build();
  cache.set(key, { xml, expiresAt: Date.now() + CACHE_TTL_MS });
  return xml;
};

const escapeXml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const xmlHeader = (root) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

/* ─── Rutas fijas del sitio principal — deben coincidir con
 * frontend/scripts/prerender.mjs (STATIC_SITEMAP_META) ─────────────── */
const STATIC_URLS = [
  { loc: "/",                changefreq: "weekly",  priority: "1.0" },
  { loc: "/pricing",         changefreq: "monthly", priority: "0.9" },
  { loc: "/about",           changefreq: "monthly", priority: "0.8" },
  { loc: "/how-it-works",    changefreq: "monthly", priority: "0.8" },
  { loc: "/contact",         changefreq: "monthly", priority: "0.6" },
  { loc: "/privacidad",      changefreq: "yearly",  priority: "0.3" },
  { loc: "/terminos",        changefreq: "yearly",  priority: "0.3" },
  { loc: "/legal",           changefreq: "yearly",  priority: "0.3" },
  { loc: "/en",               changefreq: "weekly",  priority: "1.0" },
  { loc: "/en/pricing",       changefreq: "monthly", priority: "0.9" },
  { loc: "/en/about",         changefreq: "monthly", priority: "0.8" },
  { loc: "/en/how-it-works",  changefreq: "monthly", priority: "0.8" },
  { loc: "/en/contact",       changefreq: "monthly", priority: "0.6" },
  { loc: "/en/privacy",       changefreq: "yearly",  priority: "0.3" },
  { loc: "/en/terms",         changefreq: "yearly",  priority: "0.3" },
  { loc: "/en/legal",         changefreq: "yearly",  priority: "0.3" },
];

router.get("/sitemap.xml", async (req, res) => {
  const xml = await cached("index", async () => {
    const now = new Date().toISOString();
    const entries = ["sitemap-static.xml", "sitemap-notes-es.xml", "sitemap-notes-en.xml"]
      .map((f) => `  <sitemap>\n    <loc>${BASE}/${f}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`)
      .join("\n");
    return `${xmlHeader("sitemapindex")}${entries}\n</sitemapindex>\n`;
  });
  res.set("Content-Type", "application/xml").send(xml);
});

router.get("/sitemap-static.xml", async (req, res) => {
  const xml = await cached("static", async () => {
    const urls = STATIC_URLS.map(({ loc, changefreq, priority }) =>
      `  <url>\n    <loc>${BASE}${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    ).join("\n\n");
    return `${xmlHeader("urlset")}\n${urls}\n\n</urlset>\n`;
  });
  res.set("Content-Type", "application/xml").send(xml);
});

const buildNotesSitemap = async (lang, path) => {
  const posts = await DailyPost.find({ lang, indexStatus: "index" })
    .select("slug date updatedAt")
    .lean();
  const urls = posts.map((p) => {
    const loc = `${BASE}/${path}/${p.slug}`;
    const lastmod = (p.updatedAt || p.date) instanceof Date
      ? p.updatedAt.toISOString()
      : new Date(p.updatedAt || p.date).toISOString();
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
  }).join("\n\n");
  return `${xmlHeader("urlset")}\n${urls}\n\n</urlset>\n`;
};

router.get("/sitemap-notes-es.xml", async (req, res) => {
  const xml = await cached("notes-es", () => buildNotesSitemap("es-AR", "es-ar/notas"));
  res.set("Content-Type", "application/xml").send(xml);
});

router.get("/sitemap-notes-en.xml", async (req, res) => {
  const xml = await cached("notes-en", () => buildNotesSitemap("en", "en/notes"));
  res.set("Content-Type", "application/xml").send(xml);
});

export default router;
