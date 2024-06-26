import type { Config } from "tailwindcss";
import type { CustomThemeConfig } from "tailwindcss/types/config.js";

export const theme = {
	extend: {
		colors: {},
	},
} satisfies Partial<
	CustomThemeConfig & {
		extend: Partial<CustomThemeConfig>;
	}
>;

export default {
	content: ["app/**/*.{js,jsx,mdx,ts,tsx}"],
	darkMode: "class",
	theme,
	plugins: [],
} satisfies Config;
