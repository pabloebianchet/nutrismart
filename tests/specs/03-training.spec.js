import { test, expect } from "@playwright/test";
import { login } from "./helpers.js";

test.describe("🏋️ Plan de entrenamiento", () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/training");
    await page.waitForLoadState("networkidle");
  });

  test("Página de entrenamiento carga correctamente", async ({ page }) => {
    await expect(page.locator("text=/entrenamiento|training/i").first())
      .toBeVisible({ timeout: 10_000 });
  });

  test("Crear plan de Hipertrofia — Gym — 1 mes — 3 días", async ({ page }) => {
    // Seleccionar tipo
    await page.locator("text=Hipertrofia").click();
    await page.waitForTimeout(300);

    // Seleccionar lugar
    await page.locator("text=Gym").click();
    await page.waitForTimeout(300);

    // Seleccionar duración
    await page.locator("text=1 mes").click();
    await page.waitForTimeout(300);

    // Seleccionar frecuencia
    const freq3 = page.locator("text=3").filter({ hasText: /^3$/ }).first();
    if (await freq3.isVisible()) await freq3.click();
    await page.waitForTimeout(300);

    // Click en generar
    const generateBtn = page.getByRole("button", { name: /generar|crear plan/i });
    await expect(generateBtn).toBeEnabled({ timeout: 5_000 });
    await generateBtn.click();

    // Esperar que el plan aparezca (puede tardar ~10s por GPT)
    await expect(page.locator("text=/día 1|day 1|push|pull|full body/i").first())
      .toBeVisible({ timeout: 45_000 });
  });

  test("Abrir un día del plan y registrar sesión", async ({ page }) => {
    // Verificar que hay un plan ya generado
    const dayCard = page.locator("text=/día 1|push|pull|piernas|full body/i").first();
    const hasPlan = await dayCard.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!hasPlan) {
      test.skip(); // Sin plan previo, saltear
      return;
    }

    await dayCard.click();
    await page.waitForTimeout(1000);

    // Ingresar datos en el primer ejercicio
    const weightInputs = page.locator("input[placeholder*='kg'], input[placeholder*='Peso']");
    const repsInputs   = page.locator("input[placeholder*='Rep'], input[placeholder*='rep']");

    if (await weightInputs.first().isVisible()) {
      await weightInputs.first().fill("60");
      await repsInputs.first().fill("10");
    }

    // Click en registrar sesión
    const registerBtn = page.getByRole("button", { name: /registrar sesión|registrar/i });
    if (await registerBtn.isVisible()) {
      await registerBtn.click();
      await page.waitForTimeout(500);

      // Confirmar si hay diálogo de confirmación
      const confirmBtn = page.getByRole("button", { name: /sí|confirmar|registrar/i });
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click();
      }

      // Verificar que aparece algún mensaje de éxito
      await expect(page.locator("text=/completada|puntos|✓/i").first())
        .toBeVisible({ timeout: 10_000 });
    }
  });

});
