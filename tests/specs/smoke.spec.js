/**
 * Smoke Tests — NUI App
 * Verifican que las páginas principales cargan sin crashear.
 * Rápidos, estables, sin depender de detalles de UI.
 */
import { test, expect } from "@playwright/test";
import { loginViaAPI }   from "./helpers.js";

/* ─── Páginas públicas (sin login) ─────────────────────────── */
test.describe("🌐 Páginas públicas", () => {

  test("Landing page carga", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveTitle(/error|404|not found/i);
    await expect(page.locator("text=Nui").first()).toBeVisible({ timeout: 10_000 });
  });

  test("Página de precios carga", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("text=/silver|gold|plan/i").first()).toBeVisible({ timeout: 20_000 });
  });

  test("Página de login carga", async ({ page }) => {
    await page.goto("/login");
    await expect(page).not.toHaveTitle(/error|404/i);
    // Esperar que desaparezca el splash y aparezca el formulario
    await expect(page.locator("text=/bienvenido|google|email/i").first()).toBeVisible({ timeout: 10_000 });
  });

  test("Páginas legales cargan", async ({ page }) => {
    for (const path of ["/privacidad", "/terminos", "/contact"]) {
      await page.goto(path);
      await expect(page).not.toHaveTitle(/error|404/i);
    }
  });

});

/* ─── Páginas autenticadas ──────────────────────────────────── */
test.describe("🔐 App autenticada", () => {

  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page);
  });

  test("Dashboard carga correctamente", async ({ page }) => {
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator("text=Nui").first()).toBeVisible({ timeout: 10_000 });
  });

  test("Página de recetas carga", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.locator("text=/receta|fit|hipertrofia|rápida/i").first())
      .toBeVisible({ timeout: 20_000 });
  });

  test("Página de entrenamiento carga", async ({ page }) => {
    await page.goto("/training");
    await expect(page.locator("text=/entrenamiento|training|plan/i").first())
      .toBeVisible({ timeout: 10_000 });
  });

  test("Página de membresía carga", async ({ page }) => {
    await page.goto("/subscription");
    await expect(page.locator("text=/membresía|suscripción|plan/i").first())
      .toBeVisible({ timeout: 10_000 });
  });

  test("No hay errores de consola críticos en el dashboard", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForTimeout(2000);
    const critical = errors.filter(e => !e.includes("ResizeObserver")); // ignorar warnings conocidos
    expect(critical).toHaveLength(0);
  });

});
