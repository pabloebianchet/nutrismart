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

/** Login con email y password */
export async function login(page) {
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

  await page.goto("/login", { waitUntil: "domcontentloaded" });

  const emailInput    = page.getByPlaceholder(/email/i);
  const passwordInput = page.getByPlaceholder(/contraseña|password/i);
  const submitButton  = page.getByRole("button", { name: /iniciar sesión/i });

  await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  await emailInput.fill(CREDENTIALS.email);
  await passwordInput.fill(CREDENTIALS.password);
  await submitButton.click();

  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
}

export async function waitForVisible(page, selector, timeout = 10_000) {
  await page.waitForSelector(selector, { state: "visible", timeout });
}
