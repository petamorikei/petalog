import { expect, type Page, test } from "@playwright/test";

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

type StoredSettings = {
	theme?: "light" | "dark" | "auto";
	hue?: string;
};

const seedStoredSettings = async (page: Page, settings: StoredSettings) => {
	await page.addInitScript((initialSettings) => {
		if (
			initialSettings.theme !== undefined &&
			localStorage.getItem("theme") === null
		) {
			localStorage.setItem("theme", initialSettings.theme);
		}
		if (
			initialSettings.hue !== undefined &&
			localStorage.getItem("hue") === null
		) {
			localStorage.setItem("hue", initialSettings.hue);
		}
	}, settings);
};

const waitForHydratedIsland = async (page: Page, componentName: string) => {
	await page.waitForFunction((name) => {
		const island = [...document.querySelectorAll("astro-island")].find(
			(element) => element.getAttribute("component-url")?.includes(name),
		);
		return island !== undefined && !island.hasAttribute("ssr");
	}, componentName);
};

const expectDarkMode = async (page: Page, enabled: boolean) => {
	const root = page.locator("html");
	if (enabled) {
		await expect(root).toHaveClass(/\bdark\b/);
	} else {
		await expect(root).not.toHaveClass(/\bdark\b/);
	}
};

test.describe("visitor settings", () => {
	test("theme control persists light, dark, and system modes", async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP_VIEWPORT);
		await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
		await seedStoredSettings(page, { theme: "light" });

		await page.goto("/");
		await waitForHydratedIsland(page, "LightDarkSwitch");

		const themeSwitch = page.locator("#scheme-switch");
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

	test("hue persists and the display settings panel closes on outside click", async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP_VIEWPORT);
		await seedStoredSettings(page, { theme: "light", hue: "250" });

		await page.goto("/");
		await waitForHydratedIsland(page, "DisplaySettings");

		const panel = page.locator("#display-setting");
		await page.getByRole("button", { name: "Display Settings" }).click();
		await expect(panel).not.toHaveClass(/\bfloat-panel-closed\b/);

		await page.locator("#colorSlider").fill("125");
		await expect(page.locator("#hueValue")).toHaveText("125");
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem("hue")))
			.toBe("125");
		await expect
			.poll(() =>
				page.evaluate(() =>
					getComputedStyle(document.documentElement)
						.getPropertyValue("--hue")
						.trim(),
				),
			)
			.toBe("125");

		await page.locator("#content-wrapper").click({ position: { x: 5, y: 5 } });
		await expect(panel).toHaveClass(/\bfloat-panel-closed\b/);

		await page.reload();
		await waitForHydratedIsland(page, "DisplaySettings");
		await expect(page.locator("#hueValue")).toHaveText("125");
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
	test("Pagefind returns a real production result and closes on outside click", async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP_VIEWPORT);
		await page.goto("/");
		await waitForHydratedIsland(page, "Search");
		await page.waitForFunction(
			() =>
				typeof (
					window as typeof window & {
						pagefind?: { search?: unknown };
					}
				).pagefind?.search === "function",
		);

		await page.locator("#search-bar input").fill("Expressive Code");

		const searchPanel = page.locator("#search-panel");
		const result = searchPanel.locator('a[href="/posts/expressive-code/"]');
		await expect(result).toBeVisible({ timeout: 10_000 });
		await expect(result).toContainText("Expressive Code Example");
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
		await waitForHydratedIsland(page, "ArchivePanel");
		await expect(archivePosts).toHaveCount(5);

		await page.goto("/archive/?tag=Fuwari");
		await waitForHydratedIsland(page, "ArchivePanel");
		await expect(archivePosts).toHaveCount(2);
		await expect(archivePosts).toHaveText([
			/Markdown Extended Features/,
			/Simple Guides for Fuwari/,
		]);

		await page.goto("/archive/?category=Guides");
		await waitForHydratedIsland(page, "ArchivePanel");
		await expect(archivePosts).toHaveCount(1);
		await expect(archivePosts).toHaveText([/Simple Guides for Fuwari/]);
	});
});

test.describe("Expressive Code", () => {
	test("custom copy and collapsible sections remain interactive", async ({
		context,
		page,
	}) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"], {
			origin: "http://127.0.0.1:4321",
		});
		await page.setViewportSize(DESKTOP_VIEWPORT);
		await page.goto("/posts/expressive-code/");

		const firstCodeBlock = page.locator(".expressive-code").first();
		const copyButton = firstCodeBlock.getByRole("button", {
			name: "Copy code",
		});
		await firstCodeBlock.hover();
		await copyButton.click();
		await expect(copyButton).toHaveClass(/(?:^|\s)success(?:\s|$)/);
		await expect
			.poll(() => page.evaluate(() => navigator.clipboard.readText()))
			.toBe("console.log('This code is syntax highlighted!')");

		const collapsedSection = page.locator("details.ec-section").first();
		await expect(collapsedSection).not.toHaveAttribute("open", "");
		await collapsedSection.locator("summary").click();
		await expect(collapsedSection).toHaveAttribute("open", "");
	});
});

test.describe("Markdown extensions", () => {
	test("directives preserve their generated DOM", async ({ page }) => {
		await page.goto("/posts/markdown-extended/");

		const admonitions = page.locator("blockquote.admonition");
		await expect(admonitions).toHaveCount(7);
		await expect(admonitions.locator(".bdm-title")).toHaveText([
			"NOTE",
			"TIP",
			"IMPORTANT",
			"WARNING",
			"CAUTION",
			"MY CUSTOM TITLE",
			"TIP",
		]);

		const githubCard = page.locator(
			'a.card-github[repo="Fabrizz/MMM-OnSpotify"]',
		);
		await expect(githubCard).toHaveAttribute(
			"href",
			"https://github.com/Fabrizz/MMM-OnSpotify",
		);
		await expect(page.locator("spoiler")).toContainText("is hidden ayyy");
	});

	test("math preserves its KaTeX and MathML output", async ({ page }) => {
		await page.goto("/posts/markdown/");

		await expect(page.locator(".katex")).toHaveCount(3);
		await expect(page.locator(".katex-display")).toHaveCount(1);

		const annotations = page.locator(
			'.katex-mathml annotation[encoding="application/x-tex"]',
		);
		await expect(annotations).toHaveCount(3);
		await expect(annotations.first()).toHaveText("\\omega = d\\phi / dt");
	});
});

test.describe("content assets", () => {
	test("the local post cover remains optimized and loadable", async ({
		page,
	}) => {
		await page.goto("/posts/guide/");

		const cover = page.locator("#post-cover img");
		await expect(cover).toHaveAttribute("src", /\/_astro\/cover\..+\.webp$/);
		await expect
			.poll(() =>
				cover.evaluate((image: HTMLImageElement) => ({
					complete: image.complete,
					naturalHeight: image.naturalHeight,
					naturalWidth: image.naturalWidth,
				})),
			)
			.toEqual({ complete: true, naturalHeight: 1024, naturalWidth: 2048 });

		await page.goto("/");
		const homeCover = page.locator(
			'a[href="/posts/guide/"][aria-label="Simple Guides for Fuwari"] img',
		);
		await expect(homeCover).toHaveAttribute(
			"src",
			/\/_astro\/cover\..+\.webp$/,
		);
		await expect
			.poll(() =>
				homeCover.evaluate((image: HTMLImageElement) => ({
					complete: image.complete,
					naturalHeight: image.naturalHeight,
					naturalWidth: image.naturalWidth,
				})),
			)
			.toEqual({ complete: true, naturalHeight: 1024, naturalWidth: 2048 });
	});

	test("published routes and RSS order remain stable", async ({ request }) => {
		const response = await request.get("/rss.xml");
		expect(response.status()).toBe(200);

		const rss = await response.text();
		const titles = [...rss.matchAll(/<item><title>([^<]+)<\/title>/g)].map(
			([, title]) => title,
		);
		expect(titles).toEqual([
			"Markdown Extended Features",
			"Expressive Code Example",
			"Simple Guides for Fuwari",
			"Markdown Example",
			"Include Video in the Posts",
		]);

		const paths = [
			...rss.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g),
		].map(([, link]) => new URL(link).pathname);
		expect(paths).toEqual([
			"/posts/markdown-extended/",
			"/posts/expressive-code/",
			"/posts/guide/",
			"/posts/markdown/",
			"/posts/video/",
		]);

		for (const path of paths) {
			const postResponse = await request.get(path, { maxRedirects: 0 });
			expect(postResponse.status()).toBe(200);
		}

		for (const path of [
			"/posts/draft/",
			"/posts/guide/index.md/",
			"/posts/markdown.md/",
			"/2/",
		]) {
			const missingResponse = await request.get(path, { maxRedirects: 0 });
			expect(missingResponse.status(), path).toBe(404);
		}
	});
});

test.describe("navigation and scrolling", () => {
	test("Swup replaces content and updates the document head without a reload", async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP_VIEWPORT);
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

		await expect(page).toHaveTitle("About - Fuwari");
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"About",
		);
		await expect(page.locator("#swup-container h1#about")).toHaveText("About#");
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
		await page.goto("/posts/expressive-code/");

		await page.evaluate(() =>
			window.scrollTo(0, document.documentElement.scrollHeight),
		);
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeGreaterThan(400);

		const backToTop = page.locator("#back-to-top-btn");
		await expect(backToTop).not.toHaveClass(/(?:^|\s)hide(?:\s|$)/);
		await page.getByRole("button", { name: "Back to Top" }).click();

		await expect
			.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 })
			.toBeLessThanOrEqual(1);
		await expect(backToTop).toHaveClass(/(?:^|\s)hide(?:\s|$)/);
	});
});

test("representative pages do not overflow the viewport horizontally", async ({
	page,
}) => {
	const routes = [
		"/",
		"/archive/",
		"/about/",
		"/posts/guide/",
		"/posts/markdown/",
		"/posts/markdown-extended/",
		"/posts/expressive-code/",
		"/posts/video/",
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
				await waitForHydratedIsland(page, "ArchivePanel");
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
