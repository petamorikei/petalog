import { defineConfig } from "@pandacss/dev";

export default defineConfig({
	preflight: false,
	include: ["./src/**/*.{astro,svelte,js,jsx,ts,tsx,mjs}"],
	exclude: ["./dist/**", "./styled-system/**"],
	outdir: "styled-system",
	clean: true,
	gitignore: false,
	hash: false,
	prefix: "panda",
	cssVarRoot: ":root",
	layers: {
		reset: "panda_reset",
		base: "panda_base",
		tokens: "panda_tokens",
		recipes: "panda_recipes",
		utilities: "panda_utilities",
	},
	conditions: {
		extend: {
			dark: ".dark &",
		},
	},
	theme: {
		extend: {
			breakpoints: {
				sm: "640px",
				md: "768px",
				lg: "1024px",
				xl: "1280px",
				"2xl": "1536px",
			},
		},
	},
});
