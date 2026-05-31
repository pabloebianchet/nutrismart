import "dotenv/config";

export const CREDENTIALS = {
  email:    process.env.TEST_EMAIL    || "",
  password: process.env.TEST_PASSWORD || "",
};

/** Login con email y password, espera a que cargue el dashboard */
export async function login(page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.getByPlaceholder(/email/i).fill(CREDENTIALS.email);
  await page.getByPlaceholder(/contraseña|password/i).fill(CREDENTIALS.password);
  await page.getByRole("button", { name: /ingresar|login|entrar/i }).click();

  // Esperar que llegue al dashboard (URL cambia o aparece el avatar)
  await page.waitForURL(/\/$/, { timeout: 20_000 });
  await page.waitForLoadState("networkidle");
}

/** Espera que un elemento sea visible */
export async function waitForVisible(page, selector, timeout = 10_000) {
  await page.waitForSelector(selector, { state: "visible", timeout });
}
