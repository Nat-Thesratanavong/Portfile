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
  await expect(main.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", site.linkedin);
});

test("rss feed serves xml", async ({ request }) => {
  const response = await request.get("/rss.xml");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("xml");
  const body = await response.text();
  expect(body).toContain("<rss");
  expect(body).toContain("<channel>");
});

test("play page loads with instructions, score, and a start control", async ({ page }) => {
  await page.goto("/play");

  await expect(page).toHaveTitle(/Play/);
  await expect(page.getByRole("heading", { name: "Atari Pong" })).toBeVisible();
  await expect(page.getByText(/first-to-seven match/i)).toBeVisible();
  await expect(page.getByLabel("Match score")).toContainText("0");
  await expect(page.getByRole("button", { name: "Start match" })).toBeVisible();
});

test("play page supports starting, pausing, resuming, and restarting", async ({ page }) => {
  await page.goto("/play");
  await page.getByRole("button", { name: "Start match" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Match in progress");

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Match paused");

  await page.getByRole("button", { name: "Resume" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.getByRole("button", { name: "Start match" })).toBeVisible();
  await expect(page.getByLabel("Match score")).toContainText("0");
});

test("mouse movement changes the player paddle position", async ({ page }) => {
  await page.goto("/play");
  const canvas = page.locator("canvas");
  const before = Number(await canvas.getAttribute("data-player-y"));
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();

  if (bounds) {
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height * 0.8);
  }

  await expect.poll(async () => Number(await canvas.getAttribute("data-player-y"))).toBeGreaterThan(before);
});

test("play status is accessible and explains the current state", async ({ page }) => {
  await page.goto("/play");
  const status = page.getByRole("status");
  await expect(status).toHaveAttribute("aria-live", "polite");
  await expect(status).toContainText("Ready when you are");

  await page.getByRole("button", { name: "Start match" }).click();
  await expect(status).toContainText("Match in progress");
});

test("touch-primary devices receive the desktop-only message", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
    baseURL: "http://localhost:3000",
  });
  const page = await context.newPage();

  await page.goto("/play");
  await expect(page.getByTestId("touch-fallback")).toContainText("needs a mouse or trackpad");
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await context.close();
});
