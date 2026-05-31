import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.test") });

const BASE_URL   = process.env.TEST_BASE_URL  || "https://nuiapp.com";
const API_URL    = process.env.TEST_API_URL   || "https://nutrismart-backend.onrender.com";
const TEST_EMAIL = process.env.TEST_EMAIL     || "";
const TEST_PASS  = process.env.TEST_PASSWORD  || "";

/**
 * Login vía API — inyecta el token en localStorage.
 * No depende del formulario UI, estable ante cambios de diseño.
 */
export async function loginViaAPI(page) {
  const res = await page.request.post(`${API_URL}/api/auth/login`, {
    data: { email: TEST_EMAIL, password: TEST_PASS },
  });

  if (!res.ok()) throw new Error(`Login API falló: ${res.status()}`);

  const { token, user } = await res.json();

  await page.goto(BASE_URL);
  await page.evaluate(({ token, user }) => {
    localStorage.setItem("nutrismartToken", token);
    localStorage.setItem("nutrismartUser", JSON.stringify(user));
  }, { token, user });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
}
