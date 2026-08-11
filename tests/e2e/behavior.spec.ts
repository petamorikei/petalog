import { expect, type Page, test } from "@playwright/test";

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const posts = {
  alpha: {
    path: "/posts/e2e-alpha/",
    title: "E2E Alpha Guide",
  },
  beta: {
    path: "/posts/e2e-beta/",
    title: "E2E Beta Notes",
  },
  features: {
    path: "/posts/e2e-features/",
    title: "E2E Markdown Features",
  },
  localCover: {
    path: "/posts/e2e-local-cover/",
    title: "E2E Local Cover",
  },
} as const;

const publishedPosts = [
  posts.alpha,
  posts.localCover,
  posts.beta,
  posts.features,
] as const;

const seedStoredTheme = async (
  page: Page,
  theme: "light" | "dark" | "auto",
) => {
  await page.addInitScript((initialTheme) => {
    if (localStorage.getItem("theme") === null) {
      localStorage.setItem("theme", initialTheme);
    }
  }, theme);
};

const seedStoredHue = async (page: Page, hue: string) => {
  await page.addInitScript((initialHue) => {
    if (localStorage.getItem("hue") === null) {
      localStorage.setItem("hue", initialHue);
    }
  }, hue);
};

const expectDarkMode = async (page: Page, enabled: boolean) => {
  const root = page.locator("html");
  if (enabled) {
    await expect(root).toHaveClass(/\bdark\b/);
  } else {
    await expect(root).not.toHaveClass(/\bdark\b/);
  }
};

const expectPhotoSwipeOpen = async (page: Page) => {
  const lightbox = page.locator(".pswp.pswp--open");
  await expect(lightbox).toHaveCount(1);
  await expect(lightbox).toBeVisible();
  await expect(lightbox.locator(".pswp__bg")).toHaveCSS("opacity", "0.8");
  await expect
    .poll(() =>
      lightbox
        .locator("img.pswp__img")
        .first()
        .evaluate(
          (image: HTMLImageElement) =>
            image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
        ),
    )
    .toBe(true);
};

test.describe("visitor settings", () => {
  test("theme control persists light, dark, and system modes", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await seedStoredTheme(page, "light");

    await page.goto("/");

    const themeSwitch = page.getByRole("menuitem", {
      name: "Light/Dark Mode",
    });
    await expect(themeSwitch).toBeVisible();
    await expectDarkMode(page, false);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("light");

    await themeSwitch.click();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("dark");
    await expectDarkMode(page, true);

    await themeSwitch.click();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("auto");
    await expectDarkMode(page, false);

    await page.emulateMedia({ colorScheme: "dark" });
    await expectDarkMode(page, true);

    await page.emulateMedia({ colorScheme: "light" });
    await expectDarkMode(page, false);
  });

  test("theme hue persists when the display control is hidden", async ({
    page,
  }) => {
    await seedStoredHue(page, "250");

    await page.goto("/");

    const colorSlider = page.locator("#colorSlider");
    await expect(colorSlider).toHaveValue("250");
    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--hue")
            .trim(),
        ),
      )
      .toBe("250");

    await colorSlider.fill("125", { force: true });
    await expect(page.locator("#hueValue")).toHaveText("125");
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("hue")))
      .toBe("125");

    await page.reload();
    await expect(colorSlider).toHaveValue("125");
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.style.getPropertyValue("--hue").trim(),
        ),
      )
      .toBe("125");
  });
});

test.describe("floating navigation", () => {
  test("mobile menu closes when the visitor clicks outside it", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/");

    const panel = page.locator("#nav-menu-panel");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(panel).not.toHaveClass(/\bfloat-panel-closed\b/);

    await page.locator("#content-wrapper").click({ position: { x: 5, y: 5 } });
    await expect(panel).toHaveClass(/\bfloat-panel-closed\b/);
  });
});

test.describe("content discovery", () => {
  test("navigation exposes only actionable links", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("/");

    const categoryLink = page.locator("#categories").getByRole("link", {
      name: "View all posts in the E2E Guides category",
    });
    await expect(categoryLink).toBeVisible();
    await expect(categoryLink.locator("button")).toHaveCount(0);
    await expect(page.locator('#swup-container a[href=""]')).toHaveCount(0);

    await page.goto(posts.features.path);
    await expect(page.locator('#swup-container a[href="#"]')).toHaveCount(0);
  });

  test("Pagefind returns a production result and closes on outside click", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("/");
    await page.waitForFunction(
      () =>
        typeof (
          window as typeof window & {
            pagefind?: { search?: unknown };
          }
        ).pagefind?.search === "function",
    );

    await page.locator("#search-bar input").fill("quasar lantern");

    const searchPanel = page.locator("#search-panel");
    const result = searchPanel.locator(`a[href="${posts.alpha.path}"]`);
    await expect(result).toBeVisible({ timeout: 10_000 });
    await expect(result).toContainText(posts.alpha.title);
    await expect(searchPanel).not.toHaveClass(/\bfloat-panel-closed\b/);

    await page.locator("#content-wrapper").click({ position: { x: 5, y: 5 } });
    await expect(searchPanel).toHaveClass(/\bfloat-panel-closed\b/);
  });

  test("archive query parameters filter posts by tag and category", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    const archivePosts = page.locator(
      '#swup-container a[aria-label][href^="/posts/"]',
    );

    await page.goto("/archive/");
    await expect(archivePosts).toHaveCount(publishedPosts.length);

    await page.goto("/archive/?tag=e2e-shared");
    await expect(archivePosts).toHaveCount(2);
    await expect(archivePosts).toHaveText([
      new RegExp(posts.alpha.title),
      new RegExp(posts.beta.title),
    ]);

    await page.goto("/archive/?category=E2E%20Guides");
    await expect(archivePosts).toHaveCount(2);
    await expect(archivePosts).toHaveText([
      new RegExp(posts.alpha.title),
      new RegExp(posts.localCover.title),
    ]);

    await page.goto("/archive/?tag=missing-e2e-tag");
    await expect(archivePosts).toHaveCount(0);
  });
});

test.describe("Markdown rendering", () => {
  test("Expressive Code copy and collapsible sections remain interactive", async ({
    baseURL,
    context,
    page,
  }) => {
    if (!baseURL) {
      throw new Error(
        "Playwright baseURL is required for clipboard permissions.",
      );
    }
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: baseURL,
    });
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(posts.features.path);

    const firstCodeBlock = page.locator(".expressive-code").first();
    const copyButton = firstCodeBlock.getByRole("button", {
      name: "Copy code",
    });
    await firstCodeBlock.hover();
    await copyButton.click();
    await expect(copyButton).toHaveClass(/(?:^|\s)success(?:\s|$)/);
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('console.log("e2e fixture");');

    const collapsedSection = page.locator("details.ec-section").first();
    await expect(collapsedSection).not.toHaveAttribute("open", "");
    await collapsedSection.locator("summary").click();
    await expect(collapsedSection).toHaveAttribute("open", "");
  });

  test("directives and math preserve their generated DOM", async ({ page }) => {
    await page.goto(posts.features.path);

    const admonitions = page.locator("blockquote.admonition");
    await expect(admonitions).toHaveCount(2);
    await expect(admonitions.locator(".bdm-title")).toHaveText([
      "NOTE",
      "FIXTURE WARNING",
    ]);
    await expect(page.locator("spoiler")).toContainText(
      "contains the fixture secret",
    );

    await expect(page.locator(".katex")).toHaveCount(2);
    await expect(page.locator(".katex-display")).toHaveCount(1);
    const annotations = page.locator(
      '.katex-mathml annotation[encoding="application/x-tex"]',
    );
    await expect(annotations).toHaveCount(2);
    await expect(annotations.first()).toHaveText("a^2 + b^2 = c^2");
  });
});

test.describe("content assets", () => {
  test("a local cover is optimized, loadable, and previewable after navigation", async ({
    page,
  }) => {
    await page.goto(posts.localCover.path);

    const cover = page.locator("#post-cover img");
    await expect(cover).toHaveAttribute(
      "src",
      /\/_astro\/demo-banner\..+\.webp$/,
    );
    await expect(cover).toHaveAttribute(
      "srcset",
      / 640w, .* 828w, .* 1080w, .* 1280w, .* 1668w$/,
    );
    await expect(cover).toHaveAttribute(
      "sizes",
      "(min-width: 1200px) 800px, (min-width: 1024px) calc(100vw - 400px), (min-width: 768px) calc(100vw - 104px), calc(100vw - 48px)",
    );
    await expect(cover).toHaveAttribute("width", "1920");
    await expect(cover).toHaveAttribute("height", "1369");
    await expect
      .poll(() =>
        cover.evaluate((image: HTMLImageElement) => ({
          complete: image.complete,
          hasNaturalSize: image.naturalHeight > 0 && image.naturalWidth > 0,
        })),
      )
      .toEqual({ complete: true, hasNaturalSize: true });

    await page.goto("/");
    const homeCover = page.locator(
      `a[href="${posts.localCover.path}"][aria-label="${posts.localCover.title}"] img`,
    );
    await expect(homeCover).toHaveAttribute(
      "src",
      /\/_astro\/demo-banner\..+\.webp$/,
    );
    await expect(homeCover).toHaveAttribute(
      "srcset",
      / 320w, .* 480w, .* 640w, .* 828w, .* 1280w$/,
    );
    await expect(homeCover).toHaveAttribute(
      "sizes",
      "(min-width: 768px) 250px, calc(100vw - 2rem)",
    );

    await Promise.all([
      page.waitForURL(new RegExp(`${posts.localCover.path}$`)),
      homeCover.click(),
    ]);
    await page.locator("#post-cover img").click();
    await expectPhotoSwipeOpen(page);
    await page.locator(".pswp__button--close").click();
    await expect(page.locator(".pswp.pswp--open")).toHaveCount(0);
  });

  test("only fixture publications appear in RSS and resolve to post routes", async ({
    request,
  }) => {
    const response = await request.get("/rss.xml");
    expect(response.status()).toBe(200);

    const rss = await response.text();
    const titles = [...rss.matchAll(/<item><title>([^<]+)<\/title>/g)].map(
      ([, title]) => title,
    );
    expect(titles).toEqual(publishedPosts.map(({ title }) => title));

    const paths = [
      ...rss.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g),
    ].map(([, link]) => new URL(link).pathname);
    expect(paths).toEqual(publishedPosts.map(({ path }) => path));

    for (const path of paths) {
      const postResponse = await request.get(path, { maxRedirects: 0 });
      expect(postResponse.status(), path).toBe(200);
    }

    for (const path of [
      "/posts/e2e-draft/",
      "/posts/e2e-local-cover/index.md/",
      "/posts/e2e-alpha.md/",
    ]) {
      const missingResponse = await request.get(path, { maxRedirects: 0 });
      expect(missingResponse.status(), path).toBe(404);
    }
  });
});

test.describe("navigation and scrolling", () => {
  test("Swup replaces content and updates the document head without a reload", async ({
    context,
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);

    const referencePage = await context.newPage();
    await referencePage.goto("/about/");
    const expectedTitle = await referencePage.title();
    const expectedDescription = await referencePage
      .locator('meta[name="description"]')
      .getAttribute("content");
    await referencePage.close();

    await page.goto("/");
    await page.waitForFunction(() =>
      Boolean(
        (
          window as typeof window & {
            swup?: { hooks?: unknown };
          }
        ).swup?.hooks,
      ),
    );
    await page.evaluate(() => {
      (
        window as typeof window & {
          __behaviorNavigationMarker?: string;
        }
      ).__behaviorNavigationMarker = "preserved";
    });

    await Promise.all([
      page.waitForURL(/\/about\/$/),
      page.locator('#navbar a[aria-label="About"]').click(),
    ]);

    await expect(page).toHaveTitle(expectedTitle);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      expectedDescription ?? "",
    );
    await expect(page.locator("#swup-container h1")).toHaveCount(1);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              window as typeof window & {
                __behaviorNavigationMarker?: string;
              }
            ).__behaviorNavigationMarker,
        ),
      )
      .toBe("preserved");
  });

  test("Back to Top becomes available after scrolling and returns to the top", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(posts.features.path);

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(400);

    const backToTopContainer = page.locator("#back-to-top-btn");
    const backToTopButton = page.getByRole("button", { name: "Back to Top" });
    await expect(backToTopContainer).not.toHaveClass(/(?:^|\s)hide(?:\s|$)/);
    await backToTopButton.click();

    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 })
      .toBeLessThanOrEqual(1);
    await expect(backToTopContainer).toHaveClass(/(?:^|\s)hide(?:\s|$)/);
  });
});

test("representative pages do not overflow the viewport horizontally", async ({
  page,
}) => {
  const routes = [
    "/",
    "/archive/",
    "/about/",
    ...publishedPosts.map(({ path }) => path),
  ];
  const viewports = [MOBILE_VIEWPORT, DESKTOP_VIEWPORT];

  await page.route(
    (url) => url.hostname !== "127.0.0.1",
    (route) => route.abort(),
  );

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("#content-wrapper")).toBeVisible();
      if (route === "/archive/") {
        await expect(
          page.locator(`a[href="${posts.alpha.path}"]`),
        ).toBeVisible();
      }
      await page.evaluate(() => document.fonts.ready);

      const horizontalOverflow = await page.evaluate(() => {
        const pageWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        );
        return pageWidth - document.documentElement.clientWidth;
      });
      expect
        .soft(
          horizontalOverflow,
          `${route} at ${viewport.width}x${viewport.height}`,
        )
        .toBeLessThanOrEqual(1);
    }
  }
});
