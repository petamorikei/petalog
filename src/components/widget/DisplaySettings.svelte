<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { getDefaultHue, getHue, setHue } from "@utils/setting-utils";
import { css } from "styled-system/css";

const panelClass = css({
  position: "absolute",
  transitionProperty: "all",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  width: "20rem",
  right: "1rem",
  paddingInline: "1rem",
  paddingBlock: "1rem",
});
const headerClass = css({
  display: "flex",
  flexDirection: "row",
  gap: "0.5rem",
  marginBottom: "0.75rem",
  alignItems: "center",
  justifyContent: "space-between",
});
const titleClass = css({
  display: "flex",
  gap: "0.5rem",
  fontWeight: 700,
  fontSize: "1.125rem",
  lineHeight: "1.75rem",
  color: "#171717",
  transitionProperty:
    "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  position: "relative",
  marginLeft: "0.75rem",
  _dark: {
    color: "#f5f5f5",
  },
  "&::before": {
    content: '""',
    width: "0.25rem",
    height: "1rem",
    borderRadius: "0.375rem",
    backgroundColor: "var(--primary)",
    position: "absolute",
    left: "-0.75rem",
    top: "0.33rem",
  },
});
const resetButtonClass = css({
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "0.375rem",
  willChange: "transform",
  _active: {
    transform: "scale(0.9)",
  },
});
const hiddenResetButtonClass = css({
  opacity: 0,
  pointerEvents: "none",
});
const resetButtonContentClass = css({
  color: "var(--btn-content)",
});
const resetIconClass = css({
  fontSize: "0.875rem",
});
const valueWrapperClass = css({
  display: "flex",
  gap: "0.25rem",
});
const hueValueClass = css({
  transitionProperty:
    "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  backgroundColor: "var(--btn-regular-bg)",
  width: "2.5rem",
  height: "1.75rem",
  borderRadius: "0.375rem",
  display: "flex",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  alignItems: "center",
  color: "var(--btn-content)",
});
const sliderWrapperClass = css({
  width: "100%",
  height: "1.5rem",
  paddingInline: "0.25rem",
  backgroundColor: "oklch(0.8 0.1 0)",
  borderRadius: "0.25rem",
  userSelect: "none",
  _dark: {
    backgroundColor: "oklch(0.7 0.1 0)",
  },
});

let hue = getHue();
const defaultHue = getDefaultHue();

function resetHue() {
  hue = getDefaultHue();
}

$: if (hue || hue === 0) {
  setHue(hue);
}
</script>

<div id="display-setting" class={`float-panel float-panel-closed ${panelClass}`}>
    <div class={headerClass}>
        <div class={titleClass}>
            {i18n(I18nKey.themeColor)}
            <button aria-label="Reset to Default" class={`btn-regular ${resetButtonClass} ${hue === defaultHue ? hiddenResetButtonClass : ""}`}
                    on:click={resetHue}>
                <div class={resetButtonContentClass}>
                    <Icon icon="fa6-solid:arrow-rotate-left" class={resetIconClass}></Icon>
                </div>
            </button>
        </div>
        <div class={valueWrapperClass}>
            <div id="hueValue" class={hueValueClass}>
                {hue}
            </div>
        </div>
    </div>
    <div class={sliderWrapperClass}>
        <input aria-label={i18n(I18nKey.themeColor)} type="range" min="0" max="360" bind:value={hue}
               class="slider" id="colorSlider" step="5" style="width: 100%">
    </div>
</div>


<style>
	#display-setting input[type="range"] {
		-webkit-appearance: none;
		height: 1.5rem;
		background-image: var(--color-selection-bar);
		transition: background-image 0.15s ease-in-out;
	}

	#display-setting input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: 1rem;
		width: 0.5rem;
		border-radius: 0.125rem;
		background: rgba(255, 255, 255, 0.7);
		box-shadow: none;
	}
	#display-setting input[type="range"]::-webkit-slider-thumb:hover {
		background: rgba(255, 255, 255, 0.8);
	}
	#display-setting input[type="range"]::-webkit-slider-thumb:active {
		background: rgba(255, 255, 255, 0.6);
	}

	#display-setting input[type="range"]::-moz-range-thumb {
		-webkit-appearance: none;
		height: 1rem;
		width: 0.5rem;
		border-radius: 0.125rem;
		border-width: 0;
		background: rgba(255, 255, 255, 0.7);
		box-shadow: none;
	}
	#display-setting input[type="range"]::-moz-range-thumb:hover {
		background: rgba(255, 255, 255, 0.8);
	}
	#display-setting input[type="range"]::-moz-range-thumb:active {
		background: rgba(255, 255, 255, 0.6);
	}

	#display-setting input[type="range"]::-ms-thumb {
		-webkit-appearance: none;
		height: 1rem;
		width: 0.5rem;
		border-radius: 0.125rem;
		background: rgba(255, 255, 255, 0.7);
		box-shadow: none;
	}
	#display-setting input[type="range"]::-ms-thumb:hover {
		background: rgba(255, 255, 255, 0.8);
	}
	#display-setting input[type="range"]::-ms-thumb:active {
		background: rgba(255, 255, 255, 0.6);
	}
</style>
