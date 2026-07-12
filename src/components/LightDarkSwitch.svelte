<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import { css } from "styled-system/css";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);

const switchWrapperClass = css({
	position: "relative",
	zIndex: 50,
});
const switchButtonClass = css({
	position: "relative",
	borderRadius: "0.5rem",
	height: "2.75rem",
	width: "2.75rem",
	_active: {
		transform: "scale(0.9)",
	},
});
const modeIconWrapperClass = css({
	position: "absolute",
});
const hiddenModeIconClass = css({
	opacity: 0,
});
const modeIconClass = css({
	fontSize: "1.25rem",
});
const panelClass = css({
	display: { base: "none", lg: "block" },
	position: "absolute",
	transitionProperty:
		"color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	top: "2.75rem",
	right: "-0.5rem",
	paddingTop: "1.25rem",
});
const panelContentClass = css({
	padding: "0.5rem",
});
const optionButtonClass = css({
	display: "flex",
	transitionProperty:
		"color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
	transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
	transitionDuration: "150ms",
	whiteSpace: "nowrap",
	alignItems: "center",
	justifyContent: "flex-start!",
	width: "100%",
	borderRadius: "0.5rem",
	height: "2.25rem",
	paddingInline: "0.75rem",
	fontWeight: 500,
	_active: {
		transform: "scale(0.95)",
	},
});
const optionGapClass = css({
	marginBottom: "0.125rem",
});
const optionIconClass = css({
	fontSize: "1.25rem",
	marginRight: "0.75rem",
});

onMount(() => {
	mode = getStoredTheme();
	const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
	const changeThemeWhenSchemeChanged: Parameters<
		typeof darkModePreference.addEventListener<"change">
	>[1] = (_e) => {
		applyThemeToDocument(mode);
	};
	darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);
	return () => {
		darkModePreference.removeEventListener(
			"change",
			changeThemeWhenSchemeChanged,
		);
	};
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
}

function toggleScheme() {
	let i = 0;
	for (; i < seq.length; i++) {
		if (seq[i] === mode) {
			break;
		}
	}
	switchScheme(seq[(i + 1) % seq.length]);
}

function showPanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel.classList.remove("float-panel-closed");
}

function hidePanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel.classList.add("float-panel-closed");
}
</script>

<!-- Keep this panel above the other floating panels. -->
<div class={switchWrapperClass} role="menu" tabindex="-1" onmouseleave={hidePanel}>
    <button aria-label="Light/Dark Mode" role="menuitem" class={`btn-plain scale-animation ${switchButtonClass}`} id="scheme-switch" onclick={toggleScheme} onmouseenter={showPanel}>
        <div class={`${modeIconWrapperClass} ${mode !== LIGHT_MODE ? hiddenModeIconClass : ""}`}>
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class={modeIconClass}></Icon>
        </div>
        <div class={`${modeIconWrapperClass} ${mode !== DARK_MODE ? hiddenModeIconClass : ""}`}>
            <Icon icon="material-symbols:dark-mode-outline-rounded" class={modeIconClass}></Icon>
        </div>
        <div class={`${modeIconWrapperClass} ${mode !== AUTO_MODE ? hiddenModeIconClass : ""}`}>
            <Icon icon="material-symbols:radio-button-partial-outline" class={modeIconClass}></Icon>
        </div>
    </button>

    <div id="light-dark-panel" class={`float-panel-closed ${panelClass}`} >
        <div class={`card-base float-panel ${panelContentClass}`}>
            <button class={`btn-plain scale-animation ${optionButtonClass} ${optionGapClass}`}
                    class:current-theme-btn={mode === LIGHT_MODE}
                    onclick={() => switchScheme(LIGHT_MODE)}
            >
                <Icon icon="material-symbols:wb-sunny-outline-rounded" class={optionIconClass}></Icon>
                {i18n(I18nKey.lightMode)}
            </button>
            <button class={`btn-plain scale-animation ${optionButtonClass} ${optionGapClass}`}
                    class:current-theme-btn={mode === DARK_MODE}
                    onclick={() => switchScheme(DARK_MODE)}
            >
                <Icon icon="material-symbols:dark-mode-outline-rounded" class={optionIconClass}></Icon>
                {i18n(I18nKey.darkMode)}
            </button>
            <button class={`btn-plain scale-animation ${optionButtonClass}`}
                    class:current-theme-btn={mode === AUTO_MODE}
                    onclick={() => switchScheme(AUTO_MODE)}
            >
                <Icon icon="material-symbols:radio-button-partial-outline" class={optionIconClass}></Icon>
                {i18n(I18nKey.systemMode)}
            </button>
        </div>
    </div>
</div>
