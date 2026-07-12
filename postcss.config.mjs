import panda from "@pandacss/dev/postcss";

// Tailwind emitted its layers as ordinary rules. Flatten Panda's build-time
// layers as well so selector specificity and source order stay identical.
const flattenCascadeLayers = {
	postcssPlugin: "petalog-flatten-cascade-layers",
	OnceExit(root, { result }) {
		const sourceFile = result.opts.from?.replaceAll("\\", "/");
		if (!sourceFile?.includes("/src/styles/")) return;

		root.walkAtRules("layer", (rule) => {
			if (rule.nodes) {
				rule.replaceWith(...rule.nodes);
			} else {
				rule.remove();
			}
		});
	},
};

export default {
	plugins: [panda(), flattenCascadeLayers],
};
