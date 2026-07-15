import { expect, type Page, test } from "@playwright/test";

const waitForHydratedIsland = async (page: Page, componentName: string) => {
  await page.waitForFunction((name) => {
    const island = [...document.querySelectorAll("astro-island")].find(
      (element) => element.getAttribute("component-url")?.includes(name),
    );
    return island !== undefined && !island.hasAttribute("ssr");
  }, componentName);
};

test("representative pages expose a semantic heading hierarchy", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveClass("visually-hidden");
  await expect(page.locator("main article h2")).toHaveCount(5);

  await page.goto("/archive/");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveClass("visually-hidden");
  await waitForHydratedIsland(page, "ArchivePanel");
  await expect(page.locator("main section h2")).toHaveText(["2024", "2023"]);
  await expect(page.locator("main section ul > li")).toHaveCount(5);

  await page.goto("/posts/guide/");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("#post-container h1")).toHaveText(
    "Simple Guides for Fuwari",
  );

  await page.goto("/about/");
  await expect(page.locator("main h1")).toHaveCount(1);
});
