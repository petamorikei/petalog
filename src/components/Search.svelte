<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { css } from "styled-system/css";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

const searchBarClass = css({
	display: { base: "none", lg: "flex" },
	transitionProperty: "all",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	alignItems: "center",
	height: "2.75rem",
	marginRight: "0.5rem",
	borderRadius: "0.5rem",
	backgroundColor: "rgb(0 0 0 / 0.04)",
	_hover: {
		backgroundColor: "rgb(0 0 0 / 0.06)",
	},
	_focusWithin: {
		backgroundColor: "rgb(0 0 0 / 0.06)",
	},
	_dark: {
		backgroundColor: "rgb(255 255 255 / 0.05)",
		_hover: {
			backgroundColor: "rgb(255 255 255 / 0.1)",
		},
		_focusWithin: {
			backgroundColor: "rgb(255 255 255 / 0.1)",
		},
	},
});
const searchIconClass = css({
	position: "absolute",
	fontSize: "1.25rem",
	pointerEvents: "none",
	marginLeft: "0.75rem",
	transitionProperty:
		"color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	marginBlock: "auto",
	color: "rgb(0 0 0 / 0.3)",
	_dark: {
		color: "rgb(255 255 255 / 0.3)",
	},
});
const desktopInputClass = css({
	transitionProperty: "all",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	paddingLeft: "2.5rem",
	fontSize: "0.875rem",
	lineHeight: "1.25rem",
	backgroundColor: "transparent",
	outlineWidth: "0",
	height: "100%",
	width: "10rem",
	color: "rgb(0 0 0 / 0.5)",
	_active: {
		width: "15rem",
	},
	_focus: {
		width: "15rem",
	},
	_dark: {
		color: "rgb(255 255 255 / 0.5)",
	},
});
const searchSwitchClass = css({
	display: { lg: "none!" },
	borderRadius: "0.5rem",
	width: "2.75rem",
	height: "2.75rem",
	_active: {
		transform: "scale(0.9)",
	},
});
const searchSwitchIconClass = css({
	fontSize: "1.25rem",
});
const panelClass = css({
	position: "absolute",
	width: { md: "30rem" },
	top: "5rem",
	left: { base: "1rem", md: "unset" },
	right: "1rem",
	boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
	borderRadius: "1rem",
	padding: "0.5rem",
});
const insideSearchBarClass = css({
	display: { base: "flex", lg: "none" },
	position: "relative",
	transitionProperty: "all",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	alignItems: "center",
	height: "2.75rem",
	borderRadius: "0.75rem",
	backgroundColor: "rgb(0 0 0 / 0.04)",
	_hover: {
		backgroundColor: "rgb(0 0 0 / 0.06)",
	},
	_focusWithin: {
		backgroundColor: "rgb(0 0 0 / 0.06)",
	},
	_dark: {
		backgroundColor: "rgb(255 255 255 / 0.05)",
		_hover: {
			backgroundColor: "rgb(255 255 255 / 0.1)",
		},
		_focusWithin: {
			backgroundColor: "rgb(255 255 255 / 0.1)",
		},
	},
});
const insideInputClass = css({
	paddingLeft: "2.5rem",
	position: "absolute",
	inset: "0",
	fontSize: "0.875rem",
	lineHeight: "1.25rem",
	backgroundColor: "transparent",
	outlineWidth: "0",
	color: "rgb(0 0 0 / 0.5)",
	_focus: {
		width: "15rem",
	},
	_dark: {
		color: "rgb(255 255 255 / 0.5)",
	},
});
const resultLinkClass = css({
	transitionProperty:
		"color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	"&:first-of-type": {
		marginTop: { base: "0.5rem", lg: "0" },
	},
	display: "block",
	borderRadius: "0.75rem",
	fontSize: "1.125rem",
	lineHeight: "1.75rem",
	paddingInline: "0.75rem",
	paddingBlock: "0.5rem",
	_hover: {
		backgroundColor: "var(--btn-plain-bg-hover)",
	},
	_active: {
		backgroundColor: "var(--btn-plain-bg-active)",
	},
});
const resultTitleClass = css({
	transitionProperty:
		"color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	display: "inline-flex",
	fontWeight: 700,
	_groupHover: {
		color: "var(--primary)",
	},
});
const resultChevronClass = css({
	transitionProperty:
		"color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	fontSize: "0.75rem",
	transform: "translateX(0.25rem)",
	marginBlock: "auto",
	color: "var(--primary)",
});
const resultExcerptClass = css({
	transitionProperty:
		"color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	fontSize: "0.875rem",
	lineHeight: "1.25rem",
});

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(keyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		} else {
			searchResults = [];
			console.error("Pagefind is not available in production environment.");
		}

		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	} finally {
		isSearching = false;
	}
};

onMount(() => {
	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		console.log("Pagefind status on init:", pagefindLoaded);
		if (keywordDesktop) search(keywordDesktop, true);
		if (keywordMobile) search(keywordMobile, false);
	};

	if (import.meta.env.DEV) {
		console.log(
			"Pagefind is not available in development mode. Using mock data.",
		);
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", () => {
			console.log("Pagefind ready event received.");
			initializeSearch();
		});
		document.addEventListener("pagefindloaderror", () => {
			console.warn(
				"Pagefind load error event received. Search functionality will be limited.",
			);
			initializeSearch(); // Initialize with pagefindLoaded as false
		});

		// Fallback in case events are not caught or pagefind is already loaded by the time this script runs
		setTimeout(() => {
			if (!initialized) {
				console.log("Fallback: Initializing search after timeout.");
				initializeSearch();
			}
		}, 2000); // Adjust timeout as needed
	}
});

$: if (initialized && keywordDesktop) {
	(async () => {
		await search(keywordDesktop, true);
	})();
}

$: if (initialized && keywordMobile) {
	(async () => {
		await search(keywordMobile, false);
	})();
}
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class={searchBarClass}>
    <Icon icon="material-symbols:search" class={searchIconClass}></Icon>
    <input placeholder="{i18n(I18nKey.search)}" bind:value={keywordDesktop} on:focus={() => search(keywordDesktop, true)}
           class={desktopInputClass}
    >
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch"
        class={`btn-plain scale-animation ${searchSwitchClass}`}>
    <Icon icon="material-symbols:search" class={searchSwitchIconClass}></Icon>
</button>

<!-- search panel -->
<div id="search-panel" class={`float-panel float-panel-closed search-panel ${panelClass}`}>

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class={insideSearchBarClass}>
        <Icon icon="material-symbols:search" class={searchIconClass}></Icon>
        <input placeholder="Search" bind:value={keywordMobile}
               class={insideInputClass}
        >
    </div>

    <!-- search results -->
    {#each result as item}
        <a href={item.url}
           class={`group ${resultLinkClass}`}>
            <div class={`text-90 ${resultTitleClass}`}>
                {item.meta.title}<Icon icon="fa6-solid:chevron-right" class={resultChevronClass}></Icon>
            </div>
            <div class={`text-50 ${resultExcerptClass}`}>
                {@html item.excerpt}
            </div>
        </a>
    {/each}
</div>

<style>
  input:focus {
    outline: 0;
  }
  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
</style>
