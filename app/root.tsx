// Ensure that Remix's json() can serialize BigInt without issue.
//
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// @ts-expect-error
BigInt.prototype.toJSON = function () {
	return this.toString();
};

import { useTranslation } from "saaskitty/i18n";
import { ClientHints, useEffect } from "saaskitty/react";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	json,
	useNavigation,
	useRouteLoaderData,
} from "saaskitty/react-router";
import type {
	LinkDescriptor,
	LoaderFunctionArgs,
	SerializeFrom,
} from "saaskitty/server";
import {
	AuthenticityTokenProvider,
	ExternalScripts,
	HoneypotProvider,
	cn,
	useNonce,
} from "saaskitty/utils";
import styles from "#app/root.css?url";

export const handle = {
	i18n: ["common", "saaskitty"],
	scripts({ id, data, params, matches, location, parentsData }) {
		return [];
	},
} satisfies RouteHandle<SerializeFrom<typeof loader>>;

export function links(): LinkDescriptor[] {
	return [{ rel: "stylesheet", href: styles, as: "style" }];
}

export async function loader({ context }: LoaderFunctionArgs) {
	const headers = new Headers();
	const [csrfToken, csrfCookie] = await context.csrf.commitToken();

	if (csrfCookie) {
		headers.append("Set-Cookie", csrfCookie);
	}

	return json(
		{
			colorScheme: context.colorScheme,
			config: {
				appDesc: context.app.config.APP_DESCRIPTION,
				appEnv: context.app.config.APP_ENV,
				appName: context.app.config.APP_NAME,
				appVersion: context.app.config.APP_VERSION,
			},
			csrfToken,
			honeypotInputProps: context.honeypot.getInputProps(),
			language: context.i18n.language,
			timezone: context.timezone,
		},
		{
			headers,
		},
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>("root") || {
		colorScheme: "light",
		config: {},
		csrfToken: "",
		honeypotInputProps: {},
		language: "en",
		timezone: "UTC",
	};
	const navigation = useNavigation();
	const nonce = useNonce();
	const { i18n, t } = useTranslation(["common", "saaskitty"]);

	useEffect(() => {
		if (navigation.state === "loading") {
		} else {
		}
	}, [navigation.state]);

	useEffect(() => {
		i18n.changeLanguage(data.language);
	}, [data.language, i18n]);

	return (
		<html
			className={cn("antialiased", { dark: data?.colorScheme === "dark" })}
			lang={data.language}
			dir={i18n.dir()}
		>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<ClientHints nonce={nonce.script} />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: for global config.
					dangerouslySetInnerHTML={{
						__html: `window.__config = ${JSON.stringify(data.config)}`,
					}}
					nonce={nonce.script}
				/>
			</head>

			<body>
				<HoneypotProvider {...data?.honeypotInputProps}>
					<AuthenticityTokenProvider token={data?.csrfToken}>
						{children} {t("common:hello")}
					</AuthenticityTokenProvider>
				</HoneypotProvider>
				<ScrollRestoration nonce={nonce.script} />
				<Scripts nonce={nonce.script} />
				<ExternalScripts />
			</body>
		</html>
	);
}

export default function Component() {
	return <Outlet />;
}
