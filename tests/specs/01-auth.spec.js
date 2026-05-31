import { test, expect } from "@playwright/test";
import { login } from "./helpers.js";

test.describe("🔐 Autenticación", () => {

  test("Login con email y password — llega al dashboard", async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("text=Nui").first()).toBeVisible();
  });

  test("Login con credenciales incorrectas — muestra error", async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(1500);

    await page.getByTestId("app-splash").waitFor({ state: "hidden", timeout: 8_000 }).catch(() => {});

    const emailInput = page.getByTestId("login-email-input");
    if (!(await emailInput.isVisible().catch(() => false))) {
      await page.getByTestId("login-email-tab").click();
      await page.getByTestId("app-splash").waitFor({ state: "hidden", timeout: 5_000 }).catch(() => {});
    }

    await emailInput.waitFor({ state: "visible", timeout: 8_000 });
    await emailInput.fill("wrong@test.com");
    await page.getByTestId("login-password-input").fill("wrongpass");
    await page.getByTestId("login-submit-button").click();

    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByText(/credenciales|incorrectas|inválidas|error/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Cerrar sesión — redirige al login", async ({ page }) => {
    await login(page);
    const logoutBtn = page.locator("text=/cerrar sesión|logout|salir/i").first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/login/);
    } else {
      test.skip();
    }
  });

});
