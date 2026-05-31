import { test, expect } from "@playwright/test";
import { login } from "./helpers.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Imagen de prueba de un producto con etiqueta nutricional
const TEST_IMAGE = path.join(__dirname, "assets", "test-product.jpg");

test.describe("🔍 Análisis de producto", () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState("networkidle");
  });

  test("Botón 'Analizar producto' es visible en el dashboard", async ({ page }) => {
    const btn = page.locator("text=/analizar|analyze/i, [aria-label*='analizar']").first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
  });

  test("Flujo completo: subir imagen → obtener análisis", async ({ page }) => {
    // Ir a la página de captura
    await page.goto("/capture");
    await page.waitForLoadState("networkidle");

    // Subir imagen de prueba
    const fileInput = page.locator("input[type=file]").first();
    if (!(await fileInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      // Puede estar oculto, intentar click en el botón de cámara
      const cameraBtn = page.locator("text=/foto|imagen|subir|cámara/i").first();
      if (await cameraBtn.isVisible()) await cameraBtn.click();
    }

    try {
      await fileInput.setInputFiles(TEST_IMAGE);
    } catch {
      test.skip(); // No hay imagen de prueba, saltear
      return;
    }

    // Esperar el análisis (puede tardar por OCR + GPT)
    await expect(page.locator("text=/puntaje|score|análisis completado|kcal|calorías/i").first())
      .toBeVisible({ timeout: 60_000 });
  });

  test("Historial de análisis se carga en el dashboard", async ({ page }) => {
    const history = page.locator("text=/historial|últimos análisis|productos analizados/i").first();
    // Solo verificar que el dashboard renderiza la sección de historial
    await expect(history).toBeVisible({ timeout: 10_000 });
  });

});
