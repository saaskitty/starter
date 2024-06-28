import type { AppI18nTypeOptions, Namespace } from "saaskitty/i18n";
import type { AppRequestContext } from "saaskitty/server";
import type { ExternalScriptsHandle } from "saaskitty/utils";
import type { App, getRequestContext } from "#app/.server/main.js";
import type common from "#public/locales/en/common.json";

declare global {
	interface RouteHandle<LoaderData = unknown>
		extends ExternalScriptsHandle<LoaderData> {
		/**
		 * The I18n JSON files to download on the browser.
		 */
		i18n?: Namespace;
	}
}

/**
 * Augment i18next type options so that we get type-safe `t()`.
 */
declare module "i18next" {
	interface CustomTypeOptions extends AppI18nTypeOptions {
		resources: AppI18nTypeOptions["resources"] & {
			common: typeof common;
		};
	}
}

/**
 * Augment AppLoadContext so that we get type-safe `context` object in
 * the routes' action/loader functions.
 */
declare module "@remix-run/node" {
	interface AppLoadContext
		extends AppRequestContext<App>,
			Awaited<ReturnType<typeof getRequestContext>> {}
}

declare module "*.mdx" {
	let MDXComponent: (props: any) => JSX.Element;
	export const frontmatter: any;
	// @ts-expect-error
	export default MDXComponent;
}
