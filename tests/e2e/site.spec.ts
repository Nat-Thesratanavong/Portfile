import { expect, test } from "@playwright/test";
import { site } from "../../src/lib/site";

test("homepage renders the masthead", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(site.name);
});

test("posts index renders heading and content region", async ({ page }) => {
  await page.goto("/posts");
  await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  const emptyState = page.getByText("Nothing published yet");
  const firstRow = page.locator("ul li").first();
  await expect(emptyState.or(firstRow)).toBeVisible();
});

test("work index renders heading and content region", async ({ page }) => {
  await page.goto("/work");
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
  const emptyState = page.getByText("Nothing published yet");
  const firstRow = page.locator("ul li").first();
  await expect(emptyState.or(firstRow)).toBeVisible();
});

test("about page renders bio and contact links", async ({ page }) => {
  await page.goto("/about");
  const main = page.locator("main");
  await expect(main.getByRole("heading", { level: 1 })).toContainText(site.name);
  await expect(main.getByText(site.bio)).toBeVisible();
  await expect(main.getByRole("heading", { name: "Facts" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Elsewhere" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Email" })).toHaveAttribute(
    "href",
    `mailto:${site.email}`,
  );
  await expect(main.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", site.github);
});

test("rss feed serves xml", async ({ request }) => {
  const response = await request.get("/rss.xml");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("xml");
  const body = await response.text();
  expect(body).toContain("<rss");
  expect(body).toContain("<channel>");
});
