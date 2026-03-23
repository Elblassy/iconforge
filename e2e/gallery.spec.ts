import { test, expect } from "@playwright/test";

test.describe("Gallery", () => {
  test("save and view in gallery", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();

    // Mock window.prompt to return a name
    await page.evaluate(() => {
      window.prompt = () => "Test Icon";
    });

    // Click Save Locally
    await page.getByRole("button", { name: /save locally/i }).click();

    // Navigate to gallery
    await page.goto("/gallery");

    // Should see the saved icon
    await expect(page.getByText("Test Icon")).toBeVisible();
  });
});
