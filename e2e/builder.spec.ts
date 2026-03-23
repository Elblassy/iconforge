import { test, expect } from "@playwright/test";

test.describe("Builder", () => {
  test("loads with a canvas element", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("switches to text mode and renders", async ({ page }) => {
    await page.goto("/");
    // Click the Text tab
    await page.getByRole("tab", { name: "Text" }).click();
    // Type in the text input
    const input = page.getByPlaceholder("e.g. HR, CRM, MRP");
    await input.fill("HR");
    // Canvas should still be visible
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("changes Odoo version", async ({ page }) => {
    await page.goto("/");
    // Wait for canvas to be visible first
    await expect(page.locator("canvas")).toBeVisible();
    // Open version dropdown (the combobox for Odoo Version)
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Odoo 16" }).click();
    await expect(page.locator("canvas")).toBeVisible();
  });
});
