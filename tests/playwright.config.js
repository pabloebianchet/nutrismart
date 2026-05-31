import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: resolve(__dirname, ".env.test") });

export default defineConfig({
  testDir:    "./specs",
  timeout:    60_000,
  retries:    1,
  workers:    1, // secuencial para no generar múltiples planes/análisis de prueba

  reporter: [
    ["list"],
    ["html", { outputFolder: "report", open: "never" }],
  ],

  use: {
    baseURL:           process.env.TEST_BASE_URL || "https://tu-app.vercel.app",
    headless:          true,
    screenshot:        "only-on-failure",
    video:             "retain-on-failure",
    trace:             "retain-on-failure",
    actionTimeout:     15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Safari (iPhone)",
      use: { ...devices["iPhone 14"] },
    },
  ],
});
