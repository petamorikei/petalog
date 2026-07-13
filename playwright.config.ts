import { defineConfig, devices } from "@playwright/test";

const previewHost = "127.0.0.1";
const previewPort = 4321;
const previewUrl = `http://${previewHost}:${previewPort}`;
const runtimeProcess = (
	globalThis as typeof globalThis & {
		process?: {
			env?: Record<string, string | undefined>;
		};
	}
).process;
const isCI = Boolean(runtimeProcess?.env?.CI);

export default defineConfig({
	testDir: "./tests",
	outputDir: "test-results",
	fullyParallel: false,
	forbidOnly: isCI,
	retries: isCI ? 1 : 0,
	// Serial execution avoids resource contention changing font and image timing.
	workers: 1,
	reporter: isCI
		? [["line"], ["html", { open: "never" }]]
		: [["list"], ["html", { open: "never" }]],
	timeout: 45_000,
	expect: {
		timeout: 10_000,
	},
	use: {
		baseURL: previewUrl,
		actionTimeout: 10_000,
		navigationTimeout: 30_000,
		locale: "en-US",
		timezoneId: "UTC",
		serviceWorkers: "block",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				browserName: "chromium",
			},
		},
	],
	webServer: {
		command: `pnpm build && pnpm exec astro preview --host ${previewHost} --port ${previewPort}`,
		url: previewUrl,
		reuseExistingServer: !isCI,
		stdout: "pipe",
		stderr: "pipe",
		timeout: 180_000,
	},
});
