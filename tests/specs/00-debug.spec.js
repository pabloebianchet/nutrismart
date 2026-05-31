import { test } from "@playwright/test";
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.test") });

test("📸 Screenshot diagnóstico de la página de login", async ({ page }) => {
  await page.goto(process.env.TEST_BASE_URL + "/login");
  await page.waitForTimeout(3000); // esperar que cargue React

  // Foto del estado inicial
  await page.screenshot({ path: "debug-01-initial.png", fullPage: true });

  // Loguear todo el texto visible
  const text = await page.locator("body").innerText();
  console.log("=== TEXTO EN PANTALLA ===");
  console.log(text.slice(0, 1000));

  // Loguear todos los botones
  const buttons = await page.locator("button").all();
  console.log(`\n=== BOTONES (${buttons.length}) ===`);
  for (const btn of buttons) {
    const t = await btn.innerText().catch(() => "");
    const visible = await btn.isVisible();
    if (visible) console.log(`  [BTN] "${t}"`);
  }

  // Loguear todos los tabs
  const tabs = await page.locator('[role="tab"]').all();
  console.log(`\n=== TABS (${tabs.length}) ===`);
  for (const tab of tabs) {
    const t = await tab.innerText().catch(() => "");
    console.log(`  [TAB] "${t}"`);
  }

  // Loguear todos los inputs
  const inputs = await page.locator("input").all();
  console.log(`\n=== INPUTS (${inputs.length}) ===`);
  for (const inp of inputs) {
    const type = await inp.getAttribute("type");
    const name = await inp.getAttribute("name");
    const visible = await inp.isVisible();
    console.log(`  [INPUT] type=${type} name=${name} visible=${visible}`);
  }

  // Click en el tab de email si existe
  const emailTab = page.locator('[role="tab"]').filter({ hasText: /email/i });
  const tabCount = await emailTab.count();
  console.log(`\nTabs con 'email': ${tabCount}`);

  if (tabCount > 0) {
    await emailTab.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "debug-02-after-tab-click.png", fullPage: true });

    const inputs2 = await page.locator("input").all();
    console.log(`\n=== INPUTS TRAS CLICK EN TAB (${inputs2.length}) ===`);
    for (const inp of inputs2) {
      const type = await inp.getAttribute("type");
      const visible = await inp.isVisible();
      console.log(`  [INPUT] type=${type} visible=${visible}`);
    }
  }
});
