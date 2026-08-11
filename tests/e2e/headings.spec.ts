import { expect, test } from "@playwright/test";

test("representative pages expose a semantic heading hierarchy", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveClass("visually-hidden");
  await expect(page.locator("main article")).toHaveCount(4);
  await expect(page.locator("main article h2")).toHaveCount(4);

  await page.goto("/archive/");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveClass("visually-hidden");
  await expect(page.locator("main section h2")).toHaveText([
    "2025",
    "2024",
    "2023",
  ]);
  await expect(page.locator("main section ul > li")).toHaveCount(4);

  await page.goto("/posts/e2e-alpha/");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("#post-container h1")).toHaveText(
    "E2E Alpha Guide",
  );

  await page.goto("/about/");
  await expect(page.locator("main h1")).toHaveCount(1);
});
