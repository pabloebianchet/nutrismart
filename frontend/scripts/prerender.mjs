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
  // Versión en inglés — mismas páginas, URL propia indexable, para que
  // Google pueda rankear el sitio en búsquedas en inglés (antes solo
  // existía como mejora client-side, nunca indexada). El idioma lo decide
  // el path (ver NutritionContext), así que el "?region=ar" de abajo se
  // ignora automáticamente en estas rutas.
  "/en",
  "/en/about",
  "/en/how-it-works",
  "/en/pricing",
  "/en/contact",
  "/en/privacy",
  "/en/terms",
  "/en/legal",
];

// Backend real — en Vercel viene de VITE_API_URL (mismo valor que usa el
// frontend en producción); en local, sin esa variable, se apunta directo
// al backend de Render para poder probar con datos reales.
const API_URL = process.env.VITE_API_URL || "https://nutrismart-backend.onrender.com";

async function fetchAllPosts(lang) {
  try {
    const res = await fetch(`${API_URL}/api/posts/${lang}/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.posts || [];
  } catch (err) {
    console.error(`⚠ No se pudo obtener la lista de notas ${lang} (${err.message}) — se prerenderizan solo las rutas fijas.`);
    return [];
  }
}

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const escapeHtml = (s) => escapeAttr(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ─── Reemplaza title/description/canonical/OG/Twitter/hreflang en el
 * <head> ── Cada regex apunta al tag exacto tal como lo emite Vite en el
 * build (mismo formato que frontend/index.html). Si algún valor no vino,
 * el regex simplemente no matchea nada distinto y el tag original queda
 * igual.
 */
const applyPageMeta = (html, meta) => {
  let out = html;
  if (meta.htmlLang) {
    out = out.replace(/<html lang="[^"]*"/, `<html lang="${escapeAttr(meta.htmlLang)}"`);
  }
  if (meta.robots) {
    out = out.replace(
      /(<meta name="robots" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.robots)}$2`
    );
  }
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
    const ogTitle = meta.ogTitle || meta.title;
    out = out.replace(
      /(<meta property="og:title" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(ogTitle)}$2`
    );
    out = out.replace(
      /(<meta name="twitter:title" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(ogTitle)}$2`
    );
  }
  if (meta.ogDescription) {
    out = out.replace(
      /(<meta property="og:description" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.ogDescription)}$2`
    );
    out = out.replace(
      /(<meta name="twitter:description" content=")[^"]*("\s*\/>)/,
      `$1${escapeAttr(meta.ogDescription)}$2`
    );
  }
  // hreflang — solo para páginas que SÍ son la misma página en dos idiomas
  // (home, pricing, about, how-it-works, contact). Se sacan primero los que
  // ya estuvieran (idempotente — permite re-correr el script sobre un dist/
  // ya prerenderizado sin ir acumulando tags de vueltas anteriores) y se
  // insertan los nuevos antes de </head>.
  out = out.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/>\n?/g, "");
  if (meta.alternates?.length) {
    const tags = meta.alternates
      .map(({ hreflang, href }) => `    <link rel="alternate" hreflang="${escapeAttr(hreflang)}" href="${escapeAttr(href)}" />`)
      .join("\n");
    out = out.replace("</head>", `${tags}\n  </head>`);
  }
  // JSON-LD con id propio (ej. Article schema de cada nota del blog) — se
  // inyecta client-side vía document.head.appendChild, fuera de #root, así
  // que sin este paso nunca llegaba al HTML estático que lee Google. El
  // JSON-LD estático de home (WebApplication, sin id) no se toca.
  if (meta.jsonLdScripts?.length) {
    for (const { id, json } of meta.jsonLdScripts) {
      const idPattern = new RegExp(`\\s*<script id="${id}"[^>]*>[\\s\\S]*?<\\/script>\\n?`, "g");
      out = out.replace(idPattern, "");
      out = out.replace(
        "</head>",
        `    <script id="${escapeAttr(id)}" type="application/ld+json">${json}</script>\n  </head>`
      );
    }
  }
  return out;
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

  console.log(`Buscando notas en ${API_URL}...`);
  const [postsEs, postsEn] = await Promise.all([fetchAllPosts("es-AR"), fetchAllPosts("en")]);
  const noteRoutes = [
    ...postsEs.map((post) => `/es-ar/notas/${post.slug}`),
    ...postsEn.map((post) => `/en/notes/${post.slug}`),
  ];
  console.log(`${postsEs.length} notas ES + ${postsEn.length} notas EN — se agregan ${noteRoutes.length} rutas de notas al prerender.\n`);

  // Índices de notas (solo página 1 — páginas siguientes se sirven client-
  // side, no son críticas para el crawling inicial).
  const NOTE_INDEX_ROUTES = ["/es-ar/notas", "/en/notes"];

  const allRoutes = [...ROUTES, ...NOTE_INDEX_ROUTES, ...noteRoutes];

  const browser = await launchBrowser();
  console.log(`Navegador listo (isCI=${isCI}). Servidor local en :${port}.\n`);

  // Una ruta se procesa acá — separado del loop principal para poder
  // reintentar sin duplicar toda la lógica. Devuelve true/false.
  const renderRoute = async (route) => {
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
        title:         document.title || "",
        description:   document.querySelector('meta[name="description"]')?.content || "",
        canonical:     document.querySelector('link[rel="canonical"]')?.href || "",
        ogTitle:       document.querySelector('meta[property="og:title"]')?.content || "",
        ogDescription: document.querySelector('meta[property="og:description"]')?.content || "",
        alternates:    Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'))
                             .map((el) => ({ hreflang: el.getAttribute("hreflang"), href: el.getAttribute("href") })),
        htmlLang:      document.documentElement.lang || "",
        robots:        document.querySelector('meta[name="robots"]')?.content || "",
        jsonLdScripts: Array.from(document.querySelectorAll('script[type="application/ld+json"][id]'))
                             .map((el) => ({ id: el.id, json: el.textContent })),
      }));
      log(`snapshot tomado — ${rootHtml.length} caracteres — title: "${pageMeta.title}"`);
      await page.close();

      if (!rootHtml.trim()) {
        console.warn(`❌ ${route}: contenido vacío tras domcontentloaded+h1.`);
        return false;
      }

      let finalHtml = templateHtml.replace(
        '<div id="root"></div>',
        `<div id="root">${rootHtml}</div>`
      );
      // La home ahora también llama a usePageMeta (antes no, quedaba con el
      // <head> estático de index.html sin más) — su versión español está
      // escrita para coincidir con ese contenido original, así que aplicar
      // el meta acá es seguro y además agrega el hreflang recíproco hacia
      // /en, que antes faltaba.
      finalHtml = applyPageMeta(finalHtml, pageMeta);

      const outPath = route === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, route.slice(1), "index.html");

      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, finalHtml, "utf-8");
      console.log(`✅ ${route.padEnd(16)} -> ${path.relative(distDir, outPath)} (${Date.now() - t0}ms, ${rootHtml.length} chars)`);
      return true;
    } catch (err) {
      console.error(`❌ ${route}: ${err.message} (falló a los ${Date.now() - t0}ms)`);
      return false;
    }
  };

  // Reintento único por ruta — una falla transitoria (browser flake,
  // conexión cortada) no debería dejar una ruta entera sin prerenderizar
  // ni cortar el deploy. Encontrado en vivo: 3 rutas nuevas fallaron en
  // el build de Vercel una sola vez, sin volver a fallar en corridas
  // locales inmediatamente después — típico de un flake puntual, no un
  // bug real de la ruta.
  let ok = 0;
  const okRoutes = new Set();
  for (const route of allRoutes) {
    let success = await renderRoute(route);
    if (!success) {
      console.warn(`   [${route}] reintentando una vez...`);
      success = await renderRoute(route);
    }
    if (success) { ok++; okRoutes.add(route); }
  }

  await browser.close();
  server.close();

  console.log(`\nPrerender completo: ${ok}/${allRoutes.length} rutas (${ROUTES.length} fijas + ${NOTE_INDEX_ROUTES.length} índices + ${noteRoutes.length} notas).`);

  // Las rutas fijas (incluye /en/*) son críticas — si alguna falla, se
  // corta el deploy. Un índice o una nota individual que falle (ej.
  // timeout puntual) no debería tumbar todo el sitio: queda sin
  // prerenderizar (sirve la SPA normal vía fallback) pero el resto del
  // build sigue adelante.
  const coreOk = ROUTES.filter((r) => okRoutes.has(r)).length;
  if (coreOk < ROUTES.length) {
    console.error(`❌ ${ROUTES.length - coreOk} de las ${ROUTES.length} rutas fijas no se pudieron prerenderizar.`);
    process.exitCode = 1;
  }
  const noteOk = noteRoutes.filter((r) => okRoutes.has(r)).length;
  if (noteOk < noteRoutes.length) {
    console.warn(`⚠ ${noteRoutes.length - noteOk} notas no se pudieron prerenderizar (no bloquea el deploy).`);
  }

  // sitemap.xml YA NO se genera acá — se sirve dinámico desde el backend
  // (backend/routes/sitemap.js), leyendo Mongo en cada request (con caché
  // corto). Antes quedaba obsoleto entre deploys porque las notas se
  // publican todos los días pero el sitio no se redeploya todos los días.
}

main();
