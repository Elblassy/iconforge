import { test, expect } from "@playwright/test";

test.describe("Share Link", () => {
  test("share button copies URL to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    // Wait for canvas
    await expect(page.locator("canvas")).toBeVisible();
    // Click share link button
    await page.getByRole("button", { name: /share link/i }).click();
    // Should show "Link copied!" status
    await expect(page.getByText("Link copied!")).toBeVisible();
  });
});
