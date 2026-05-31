import { test, expect } from "@playwright/test";
import { login } from "./helpers.js";

test.describe("💳 Suscripción y membresía", () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Página de precios carga los planes", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=/silver|gold|plan/i").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=/por mes/i").first()).toBeVisible({ timeout: 5_000 });
  });

  test("Modal de checkout abre al clickear un plan", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");

    const silverBtn = page.getByRole("button", { name: /elegir silver/i });
    if (await silverBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await silverBtn.click();
      // Modal debe aparecer
      await expect(page.locator("text=/confirmar plan|Mercado Pago/i").first())
        .toBeVisible({ timeout: 5_000 });
    } else {
      test.skip(); // Ya tiene plan activo
    }
  });

  test("Página 'Mi membresía' carga sin errores", async ({ page }) => {
    await page.goto("/subscription");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=/membresía|suscripción|plan/i").first())
      .toBeVisible({ timeout: 10_000 });
  });

});
