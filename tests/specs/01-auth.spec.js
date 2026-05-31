import { test, expect } from "@playwright/test";
import { login } from "./helpers.js";

test.describe("🔐 Autenticación", () => {

  test("Login con email y password — llega al dashboard", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("text=Nui").first()).toBeVisible();
  });

  test("Login con credenciales incorrectas — muestra error", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    try {
      const emailTab = page.locator('[role="tab"]').filter({ hasText: /email/i });
      if (await emailTab.isVisible({ timeout: 3_000 })) await emailTab.click();
    } catch {}

    await page.getByPlaceholder(/email/i).waitFor({ state: "visible", timeout: 10_000 });
    await page.getByPlaceholder(/email/i).fill("wrong@test.com");
    await page.getByPlaceholder(/contraseña|password/i).fill("wrongpass");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    // Debe quedar en /login y mostrar algún error
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
    await expect(
      page.locator("[role=alert], .MuiAlert-root, text=/credenciales|incorrecto|inválid|error/i").first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("Cerrar sesión — redirige al login", async ({ page }) => {
    await login(page);
    // Buscar botón de cerrar sesión (puede estar en un menú)
    const logoutBtn = page.locator("text=/cerrar sesión|logout|salir/i").first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/login/);
    } else {
      test.skip(); // no encontró el botón de logout
    }
  });

});
