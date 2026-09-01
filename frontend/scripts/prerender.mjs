/**
 * Prerenderizado estático post-build.
 *
 * Renderiza en un Chromium headless las rutas públicas de marketing y
 * graba el HTML resultante como archivos estáticos dentro de dist/, para
 * que crawlers que no ejecutan JS (bots de buscadores, GPTBot, ClaudeBot,
 * PerplexityBot, etc.) reciban el contenido real en vez de un <div> vacío.
 *
 * Además del contenido de #root, también captura el <head> resultante
 * después de que cada página corre su propio usePageMeta (title,
 * description, canonical, OG, Twitter) y lo hornea en el HTML estático
 * — así cada ruta queda con su metadata propia en vez de la genérica
 * de home para las 8 páginas. La home no llama a usePageMeta (su OG es
 * deliberadamente distinto del title/description principal), así que
 * para "/" esto es un no-op: se relee lo mismo que ya había.
 *
 * Los usuarios reales siguen recibiendo la SPA normal: main.jsx usa
 * createRoot (no hydrateRoot), así que React reemplaza el contenido
 * estático apenas carga el bundle — no hay hydration mismatch.
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPostSlug } from "../src/utils/blogSlug.js";

/**
 * Lanzamiento del browser según entorno:
 * - Local (dev): `puppeteer` normal — trae su propio Chrome vía postinstall
 *   (sin restricciones en una máquina de desarrollador).
 * - Vercel/CI: el contenedor de build bloquea el postinstall de `puppeteer`
 *   por seguridad (no descarga Chrome), y aunque se lo fuerce a mano, la
 *   imagen Linux no tiene las librerías del sistema que Chrome necesita
 *   (libnspr4, libnss3, etc — no hay apt disponible ahí). Se usa en cambio
 *   `@sparticuz/chromium`: un binario headless-only que viaja empaquetado
 *   dentro del propio paquete npm (nada de red ni de librerías del SO).
 */
const isCI = Boolean(process.env.VERCEL || process.env.CI);

async function launchBrowser() {
  if (isCI) {
    const { default: chromium }  = await import("@sparticuz/chromium");
    const { default: puppeteer } = await import("puppeteer-core");
    return puppeteer.launch({
      args:           puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless:       "shell",
    });
  }
  const { default: puppeteer } = await import("puppeteer");
  return puppeteer.launch({
    headless: "new",
    // --disable-web-security: el servidor local sirve desde 127.0.0.1:puerto
    // (origin efímero), que nunca va a estar en la whitelist de CORS del
    // backend real (solo permite nuiapp.com/localhost:5173). @sparticuz/chromium
    // ya trae este flag por defecto en el path de CI — se replica acá para que
    // las pruebas locales con VITE_API_URL real sean representativas.
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir   = path.resolve(__dirname, "..", "dist");

// Rutas públicas indexables — deben coincidir con robots.txt / sitemap.xml
const ROUTES = [
  "/",
  "/about",
  "/how-it-works",
  "/pricing",
  "/contact",
  "/privacidad",
  "/terminos",
  "/legal",
];

// Prioridad/frecuencia de las rutas estáticas en el sitemap (se preservan
// los valores que ya tenía el sitemap.xml escrito a mano).
const STATIC_SITEMAP_META = {
  "/":              { changefreq: "weekly",  priority: "1.0" },
  "/pricing":       { changefreq: "monthly", priority: "0.9" },
  "/about":         { changefreq: "monthly", priority: "0.8" },
  "/how-it-works":  { changefreq: "monthly", priority: "0.8" },
  "/contact":       { changefreq: "monthly", priority: "0.6" },
  "/privacidad":    { changefreq: "yearly",  priority: "0.3" },
  "/terminos":      { changefreq: "yearly",  priority: "0.3" },
  "/legal":         { changefreq: "yearly",  priority: "0.3" },
};

// Backend real — en Vercel viene de VITE_API_URL (mismo valor que usa el
// frontend en producción); en local, sin esa variable, se apunta directo
// al backend de Render para poder probar con datos reales.
const API_URL = process.env.VITE_API_URL || "https://nutrismart-backend.onrender.com";

async function fetchAllPosts() {
  try {
    const res = await fetch(`${API_URL}/api/posts/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.posts || [];
  } catch (err) {
    console.error(`⚠ No se pudo obtener la lista de posts del blog (${err.message}) — se prerenderizan solo las rutas fijas.`);
    return [];
  }
}

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const escapeHtml = (s) => escapeAttr(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ─── Reemplaza title/description/canonical/OG/Twitter en el <head> ──
 * Cada regex apunta al tag exacto tal como lo emite Vite en el build
 * (mismo formato que frontend/index.html). Si algún valor no vino
 * (por ejemplo home, que no llama a usePageMeta), el regex simplemente
 * no matchea nada distinto y el tag original queda igual.
 */
const applyPageMeta = (html, meta) => {
  let out = html;
  if (meta.title) {
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  }
  if (meta.description) {
    out = out.replace(
      /(<meta name="description" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.description)}$2`
    );
    out = out.replace(
      /(<meta name="twitter:description" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.description)}$2`
    );
    out = out.replace(
      /(<meta property="og:description" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.description)}$2`
    );
  }
  if (meta.canonical) {
    out = out.replace(
      /(<link rel="canonical" href=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.canonical)}$2`
    );
    out = out.replace(
      /(<meta property="og:url" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.canonical)}$2`
    );
  }
  if (meta.title) {
    out = out.replace(
      /(<meta property="og:title" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.title)}$2`
    );
    out = out.replace(
      /(<meta name="twitter:title" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.title)}$2`
    );
  }
  return out;
};

/* ─── Genera sitemap.xml dinámico: rutas fijas + un <url> por post ─── */
const buildSitemap = (posts) => {
  const staticUrls = ROUTES.map((route) => {
    const { changefreq, priority } = STATIC_SITEMAP_META[route];
    const loc = route === "/" ? "https://nuiapp.com/" : `https://nuiapp.com${route}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });

  const postUrls = posts.map((post) => {
    const loc = `https://nuiapp.com/blog/${buildPostSlug(post)}`;
    const lastmod = post.date;
    return `  <url>\n    <loc>${escapeAttr(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n${[...staticUrls, ...postUrls].join("\n\n")}\n\n</urlset>\n`;
};

const MIME_TYPES = {
  ".js":    "text/javascript",
  ".mjs":   "text/javascript",
  ".css":   "text/css",
  ".json":  "application/json",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".svg":   "image/svg+xml",
  ".ico":   "image/x-icon",
  ".webp":  "image/webp",
  ".woff2": "font/woff2",
  ".woff":  "font/woff",
  ".html":  "text/html",
};

/* ─── Servidor estático local que imita el fallback SPA de Vercel ────
 * `originalIndexHtml` es el snapshot del index.html tal como lo dejó
 * `vite build`, ANTES de que este script empiece a escribir versiones
 * prerenderizadas. El fallback SPA siempre sirve ESE snapshot congelado
 * — nunca el archivo en disco, que va cambiando a medida que cada ruta
 * se procesa. Sin esto, la ruta "/" (primera del array) pisa dist/index.html
 * con su propio resultado, y las rutas siguientes navegan contra un
 * fallback ya "contaminado" con el HTML de la home en vez del shell
 * vacío original — funciona por casualidad (React con createRoot vuelve
 * a montar todo igual), pero es un comportamiento frágil que no debería
 * depender de esa autocorrección.
 */
const startServer = (originalIndexHtml) =>
  new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      const filePath = path.join(distDir, urlPath);

      let isRealFile = false;
      try {
        const s = await stat(filePath);
        isRealFile = !s.isDirectory();
      } catch {
        isRealFile = false;
      }

      if (!isRealFile) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(originalIndexHtml);
        return;
      }

      try {
        const content = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream" });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

async function main() {
  if (!existsSync(path.join(distDir, "index.html"))) {
    console.error("❌ dist/index.html no existe — corré `vite build` antes del prerender.");
    process.exit(1);
  }

  const templateHtml = await readFile(path.join(distDir, "index.html"), "utf-8");
  const server = await startServer(templateHtml);
  const { port } = server.address();

  console.log(`Buscando posts del blog en ${API_URL}...`);
  const posts = await fetchAllPosts();
  const blogRoutes = posts.map((post) => `/blog/${buildPostSlug(post)}`);
  console.log(`${posts.length} posts encontrados — se agregan ${blogRoutes.length} rutas de blog al prerender.\n`);

  const allRoutes = [...ROUTES, ...blogRoutes];

  const browser = await launchBrowser();
  console.log(`Navegador listo (isCI=${isCI}). Servidor local en :${port}.\n`);

  let ok = 0;
  const okRoutes = new Set();
  for (const route of allRoutes) {
    const t0 = Date.now();
    const log = (msg) => console.log(`   [${route}] +${String(Date.now() - t0).padStart(5)}ms  ${msg}`);
    try {
      const page = await browser.newPage();
      page.on("console",     (m)   => log(`console.${m.type()}: ${m.text().slice(0, 200)}`));
      page.on("pageerror",   (err) => log(`⚠ pageerror: ${err.message}`));
      page.on("requestfailed", (r) => log(`⚠ requestfailed: ${r.url()} — ${r.failure()?.errorText}`));

      // domcontentloaded, no networkidle0: la home dispara un fetch real al
      // backend (LandingPostsSection → /api/posts/landing) que puede tardar
      // si el backend estuvo inactivo (cold start de Render, 15-50s). Con
      // networkidle0 ese fetch lento bloquea la navegación ENTERA hasta
      // los 30s de timeout — con domcontentloaded seguimos apenas el DOM
      // inicial está listo y esperamos el contenido real por selector.
      //
      // ?region=ar fuerza el idioma/moneda por defecto (español/ARS) durante
      // el prerender — sin esto, NutritionContext geolocaliza la IP del
      // propio contenedor de build de Vercel (no la de un visitante real),
      // que suele resolver como EE.UU., y el HTML estático que indexa Google
      // quedaría en inglés aunque el <head> (title/canonical) siga en
      // español — un mismatch real. El contenido en inglés para visitantes
      // reales de EE.UU. lo sigue resolviendo el cliente normalmente, esto
      // solo fija qué versión queda "horneada" en el HTML crudo.
      await page.goto(`http://127.0.0.1:${port}${route}?region=ar`, { waitUntil: "domcontentloaded", timeout: 30000 });
      log("domcontentloaded");

      const h1Found = await page.waitForSelector("h1", { timeout: 15000 }).then(() => true).catch(() => false);
      log(h1Found ? "<h1> encontrado" : "⚠ <h1> NO encontrado tras 15s");

      // Margen adicional acotado para secciones async lentas (ej. el blog
      // de la home) — nunca bloquea la captura si no llegan a tiempo,
      // solo les da una oportunidad razonable antes de tomar el snapshot.
      await new Promise((r) => setTimeout(r, 1000));

      const rootHtml = await page.evaluate(() => document.getElementById("root")?.innerHTML || "");
      const pageMeta = await page.evaluate(() => ({
        title:       document.title || "",
        description: document.querySelector('meta[name="description"]')?.content || "",
        canonical:   document.querySelector('link[rel="canonical"]')?.href || "",
      }));
      log(`snapshot tomado — ${rootHtml.length} caracteres — title: "${pageMeta.title}"`);
      await page.close();

      if (!rootHtml.trim()) {
        console.warn(`❌ ${route}: contenido vacío tras domcontentloaded+h1 — se omite, queda el shell CSR original.`);
        continue;
      }

      let finalHtml = templateHtml.replace(
        '<div id="root"></div>',
        `<div id="root">${rootHtml}</div>`
      );
      // La home no llama a usePageMeta (su OG es deliberadamente más corto
      // que el title/description principal) — no tocar su <head> en absoluto.
      // Leer y reaplicar el canonical vía `.href` lo normaliza agregando
      // una barra final ("nuiapp.com" -> "nuiapp.com/"), un cambio no
      // pedido — más simple y seguro: para "/" ni se intenta.
      if (route !== "/") finalHtml = applyPageMeta(finalHtml, pageMeta);

      const outPath = route === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, route.slice(1), "index.html");

      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, finalHtml, "utf-8");
      console.log(`✅ ${route.padEnd(16)} -> ${path.relative(distDir, outPath)} (${Date.now() - t0}ms, ${rootHtml.length} chars)`);
      ok++;
      okRoutes.add(route);
    } catch (err) {
      console.error(`❌ ${route}: ${err.message} (falló a los ${Date.now() - t0}ms)`);
    }
  }

  await browser.close();
  server.close();

  console.log(`\nPrerender completo: ${ok}/${allRoutes.length} rutas (${ROUTES.length} fijas + ${blogRoutes.length} de blog).`);

  // Las 8 rutas fijas son críticas — si alguna falla, se corta el deploy.
  // Un post individual del blog que falle (ej. timeout puntual) no debería
  // tumbar todo el sitio: queda sin prerenderizar (sirve la SPA normal vía
  // fallback) pero el resto del build sigue adelante.
  const coreOk = ROUTES.filter((r) => okRoutes.has(r)).length;
  if (coreOk < ROUTES.length) {
    console.error(`❌ ${ROUTES.length - coreOk} de las 8 rutas fijas no se pudieron prerenderizar.`);
    process.exitCode = 1;
  }
  const blogOk = blogRoutes.filter((r) => okRoutes.has(r)).length;
  if (blogOk < blogRoutes.length) {
    console.warn(`⚠ ${blogRoutes.length - blogOk} posts del blog no se pudieron prerenderizar (no bloquea el deploy).`);
  }

  // sitemap.xml dinámico — rutas fijas + una entrada por post existente.
  try {
    await writeFile(path.join(distDir, "sitemap.xml"), buildSitemap(posts), "utf-8");
    console.log(`✅ sitemap.xml generado con ${ROUTES.length + posts.length} URLs.`);
  } catch (err) {
    console.error(`❌ No se pudo escribir sitemap.xml: ${err.message}`);
  }
}

main();
