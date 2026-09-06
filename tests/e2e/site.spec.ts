import { expect, test } from "@playwright/test";

test("homepage renders the masthead", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("John Doe");
});

test("posts index renders heading and content region", async ({ page }) => {
  await page.goto("/posts");
  await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  const emptyState = page.getByText("Nothing published yet");
  const firstRow = page.locator("ul li").first();
  await expect(emptyState.or(firstRow)).toBeVisible();
});
