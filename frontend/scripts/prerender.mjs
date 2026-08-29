/**
 * Prerenderizado estático post-build.
 *
 * Renderiza en un Chromium headless las rutas públicas de marketing y
 * graba el HTML resultante como archivos estáticos dentro de dist/, para
 * que crawlers que no ejecutan JS (bots de buscadores, GPTBot, ClaudeBot,
 * PerplexityBot, etc.) reciban el contenido real en vez de un <div> vacío.
 *
 * No toca el <head> del build (title/description/OG/canonical quedan
 * intactos) — solo reemplaza el contenido de #root por el HTML ya
 * renderizado. Los usuarios reales siguen recibiendo la SPA normal:
 * main.jsx usa createRoot (no hydrateRoot), así que React reemplaza este
 * contenido estático apenas carga el bundle — no hay hydration mismatch.
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
    args:     ["--no-sandbox", "--disable-setuid-sandbox"],
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

  const browser = await launchBrowser();
  console.log(`Navegador listo (isCI=${isCI}). Servidor local en :${port}.\n`);

  let ok = 0;
  for (const route of ROUTES) {
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
      await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      log("domcontentloaded");

      const h1Found = await page.waitForSelector("h1", { timeout: 15000 }).then(() => true).catch(() => false);
      log(h1Found ? "<h1> encontrado" : "⚠ <h1> NO encontrado tras 15s");

      // Margen adicional acotado para secciones async lentas (ej. el blog
      // de la home) — nunca bloquea la captura si no llegan a tiempo,
      // solo les da una oportunidad razonable antes de tomar el snapshot.
      await new Promise((r) => setTimeout(r, 1000));

      const rootHtml = await page.evaluate(() => document.getElementById("root")?.innerHTML || "");
      log(`snapshot tomado — ${rootHtml.length} caracteres`);
      await page.close();

      if (!rootHtml.trim()) {
        console.warn(`❌ ${route}: contenido vacío tras domcontentloaded+h1 — se omite, queda el shell CSR original.`);
        continue;
      }

      const finalHtml = templateHtml.replace(
        '<div id="root"></div>',
        `<div id="root">${rootHtml}</div>`
      );

      const outPath = route === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, route.slice(1), "index.html");

      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, finalHtml, "utf-8");
      console.log(`✅ ${route.padEnd(16)} -> ${path.relative(distDir, outPath)} (${Date.now() - t0}ms, ${rootHtml.length} chars)`);
      ok++;
    } catch (err) {
      console.error(`❌ ${route}: ${err.message} (falló a los ${Date.now() - t0}ms)`);
    }
  }

  await browser.close();
  server.close();

  console.log(`\nPrerender completo: ${ok}/${ROUTES.length} rutas.`);
  if (ok < ROUTES.length) process.exitCode = 1;
}

main();
