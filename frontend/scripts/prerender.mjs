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

/* ─── Servidor estático local que imita el fallback SPA de Vercel ──── */
const startServer = () =>
  new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      let filePath = path.join(distDir, urlPath);

      try {
        const s = await stat(filePath);
        if (s.isDirectory()) filePath = path.join(distDir, "index.html");
      } catch {
        filePath = path.join(distDir, "index.html");
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
  const server = await startServer();
  const { port } = server.address();

  const browser = await launchBrowser();

  let ok = 0;
  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "networkidle0", timeout: 30000 });
      await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {
        console.warn(`⚠️  ${route}: no se encontró <h1> — se guarda igual, revisar la página.`);
      });
      // Pequeño margen extra para que terminen de asentarse fuentes/layout async.
      await new Promise((r) => setTimeout(r, 250));

      const rootHtml = await page.evaluate(() => document.getElementById("root")?.innerHTML || "");
      await page.close();

      if (!rootHtml.trim()) {
        console.warn(`⚠️  ${route}: contenido vacío, se omite (se sirve la versión CSR normal).`);
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
      console.log(`✅ ${route.padEnd(16)} -> ${path.relative(distDir, outPath)}`);
      ok++;
    } catch (err) {
      console.error(`❌ ${route}: ${err.message}`);
    }
  }

  await browser.close();
  server.close();

  console.log(`\nPrerender completo: ${ok}/${ROUTES.length} rutas.`);
  if (ok < ROUTES.length) process.exitCode = 1;
}

main();
