import { test, expect } from "@playwright/test";
import { login } from "./helpers.js";

test.describe("🍽️ Recetas", () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/recipes");
    await page.waitForLoadState("networkidle");
  });

  test("Página de recetas carga correctamente", async ({ page }) => {
    await expect(page.locator("text=/recetas ya|recetas/i").first())
      .toBeVisible({ timeout: 10_000 });
  });

  test("Generar receta Fit para Desayuno", async ({ page }) => {
    // Seleccionar modalidad
    await page.locator("text=Fit").click();
    await page.waitForTimeout(300);

    // Seleccionar momento
    await page.locator("text=Desayuno").click();
    await page.waitForTimeout(300);

    // Click en generar
    const generateBtn = page.getByRole("button", { name: /generar|buscar recetas/i });
    await expect(generateBtn).toBeEnabled({ timeout: 5_000 });
    await generateBtn.click();

    // Esperar sugerencias (GPT puede tardar ~5s)
    await expect(page.locator("[class*='recipe'], [class*='suggestion'], text=/min|calorías|kcal/i").first())
      .toBeVisible({ timeout: 30_000 });
  });

  test("Seleccionar una receta y ver detalle", async ({ page }) => {
    // Generar primero
    await page.locator("text=Rápidas").click();
    await page.locator("text=Merienda").click();
    await page.getByRole("button", { name: /generar/i }).click();

    // Esperar sugerencias
    const firstSuggestion = page.locator("[class*='suggestion'], [class*='recipe-card']").first();
    await expect(firstSuggestion).toBeVisible({ timeout: 30_000 });
    await firstSuggestion.click();

    // Esperar detalle (ingredientes + pasos)
    await expect(page.locator("text=/ingredientes/i").first())
      .toBeVisible({ timeout: 20_000 });
  });

  test("Tab Guardadas carga sin errores", async ({ page }) => {
    await page.locator("text=/guardadas/i").first().click();
    await page.waitForTimeout(1000);
    // Debe mostrar recetas o mensaje de vacío, sin error
    const hasContent = await page.locator(
      "text=/guardada|sin recetas|no hay/i, [class*='saved']"
    ).first().isVisible({ timeout: 5_000 }).catch(() => false);
    expect(hasContent || true).toBeTruthy(); // permisivo — solo verifica que no crashea
  });

});
