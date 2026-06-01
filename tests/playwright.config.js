import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

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
    // Mobile Safari desactivado en Windows (WebKit se cuelga en este OS)
    // Activar en CI/Mac con: npx playwright test --project="Mobile Safari (iPhone)"
    // {
    //   name: "Mobile Safari (iPhone)",
    //   use: { ...devices["iPhone 14"] },
    // },
  ],
});
