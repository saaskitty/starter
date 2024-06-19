import {
	I18nextProvider,
	RemixBrowser,
	StrictMode,
	getI18nInitOptions,
	getInitialNamespaces,
	hydrateRoot,
	i18next,
	i18nextBrowserLanguageDetector,
	i18nextHttpBackend,
	initReactI18next,
	makeZodI18nMap,
	startTransition,
	z,
} from "saaskitty/client";

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
