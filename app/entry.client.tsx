import {
	I18nextProvider,
	getI18nInitOptions,
	getInitialNamespaces,
	i18next,
	i18nextBrowserLanguageDetector,
	i18nextHttpBackend,
	initReactI18next,
} from "saaskitty/i18n";
import { StrictMode, hydrateRoot, startTransition } from "saaskitty/react";
import { RemixBrowser } from "saaskitty/react-router";
import { makeZodI18nMap, z } from "saaskitty/validator";

const i18n = i18next
	.use(initReactI18next)
	.use(i18nextBrowserLanguageDetector)
	.use(i18nextHttpBackend);

if (import.meta.env.MODE !== "production") {
	const { HMRPlugin } = await import("i18next-hmr/plugin");

	i18n.use(new HMRPlugin({ vite: { client: true } }));
}

await i18n.init({
	...getI18nInitOptions(),
	ns: getInitialNamespaces(),
});
z.setErrorMap(makeZodI18nMap({ t: i18n.t }));

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<I18nextProvider i18n={i18n}>
				<RemixBrowser />
			</I18nextProvider>
		</StrictMode>,
	);
});
