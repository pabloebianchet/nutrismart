import { test, expect } from "@playwright/test";
import { login } from "./helpers.js";

test.describe("🔔 Preferencias de notificaciones", () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    // Scroll al fondo donde está el panel de notificaciones
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  test("Panel de notificaciones es visible", async ({ page }) => {
    const panel = page.locator("text=/notificaciones|preferencias/i").first();
    await expect(panel).toBeVisible({ timeout: 10_000 });
  });

  test("Toggle 'Análisis' cambia su estado", async ({ page }) => {
    const switchEl = page.locator("[data-testid='notif-analysis'], text=/análisis/i")
      .locator("..").locator("input[type=checkbox], [role=switch]").first();

    if (!(await switchEl.isVisible())) {
      test.skip();
      return;
    }

    const initialChecked = await switchEl.isChecked();
    await switchEl.click();
    await page.waitForTimeout(800);
    const afterChecked = await switchEl.isChecked();

    expect(afterChecked).toBe(!initialChecked);

    // Restaurar estado original
    await switchEl.click();
    await page.waitForTimeout(800);
  });

  test("Pausar todas las notificaciones", async ({ page }) => {
    const pauseSwitch = page.locator("text=/pausar|paused/i")
      .locator("..").locator("input[type=checkbox], [role=switch]").first();

    if (!(await pauseSwitch.isVisible())) {
      test.skip();
      return;
    }

    const before = await pauseSwitch.isChecked();
    await pauseSwitch.click();
    await page.waitForTimeout(800);
    expect(await pauseSwitch.isChecked()).toBe(!before);

    // Restaurar
    await pauseSwitch.click();
  });

});
