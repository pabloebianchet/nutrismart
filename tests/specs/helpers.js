import { expect } from "@playwright/test";
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.test") });

export const CREDENTIALS = {
  email:    process.env.TEST_EMAIL    || "",
  password: process.env.TEST_PASSWORD || "",
};

export async function login(page) {
  await page.goto("/login");

  // Esperar que el splash desaparezca (dura ~2s al cargar la página)
  await page.getByTestId("app-splash").waitFor({ state: "hidden", timeout: 8_000 })
    .catch(() => {}); // si no hay splash, continuar

  // En Desktop el tab "Google" está activo — clickear "Email y contraseña"
  const emailInput = page.getByTestId("login-email-input");
  const emailVisible = await emailInput.isVisible().catch(() => false);
  if (!emailVisible) {
    await page.getByTestId("login-email-tab").click();
    // Esperar que el splash no aparezca de nuevo después del tab click
    await page.getByTestId("app-splash").waitFor({ state: "hidden", timeout: 5_000 })
      .catch(() => {});
  }

  await emailInput.waitFor({ state: "visible", timeout: 10_000 });
  await emailInput.fill(CREDENTIALS.email);
  await page.getByTestId("login-password-input").fill(CREDENTIALS.password);
  await page.getByTestId("login-submit-button").click();

  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
}

export async function waitForVisible(page, selector, timeout = 10_000) {
  await page.waitForSelector(selector, { state: "visible", timeout });
}
