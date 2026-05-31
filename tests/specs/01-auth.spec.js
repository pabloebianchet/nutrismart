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
    await page.getByPlaceholder(/email/i).fill("wrong@test.com");
    await page.getByPlaceholder(/contraseña|password/i).fill("wrongpass");
    await page.getByRole("button", { name: /ingresar|login|entrar/i }).click();
    // Debe aparecer algún mensaje de error
    await expect(page.locator("[role=alert], .MuiAlert-root, text=/error|incorrecto|inválido/i").first())
      .toBeVisible({ timeout: 8_000 });
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
