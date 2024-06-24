import { PassThrough } from "node:stream";
import { I18nextProvider } from "saaskitty/i18n";
import { RemixServer } from "saaskitty/react-router";
import {
	type ActionFunctionArgs,
	type AppLoadContext,
	type EntryContext,
	type LoaderFunctionArgs,
	createReadableStreamFromReadable,
	isbot,
	renderToPipeableStream,
} from "saaskitty/server";
import { NonceProvider } from "saaskitty/utils";

export function handleError(
	error: unknown,
	{ request }: LoaderFunctionArgs | ActionFunctionArgs,
) {
	if (request.signal.aborted) {
		return;
	}

	console.error(error);
}

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	headers: Headers,
	remixContext: EntryContext,
	context: AppLoadContext,
) {
	const ABORT_DELAY = 5_000;
	const nonce = context.cspNonce;
	const callback = isbot(request.headers.get("user-agent") || "")
		? "onAllReady"
		: "onShellReady";

	return new Promise((resolve, reject) => {
		let status = responseStatusCode;
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(
			<NonceProvider value={nonce}>
				<I18nextProvider i18n={context.i18n}>
					<RemixServer
						abortDelay={ABORT_DELAY}
						context={remixContext}
						url={request.url}
					/>
				</I18nextProvider>
			</NonceProvider>,
			{
				[callback]: () => {
					shellRendered = true;
					const body = new PassThrough();
					const stream = createReadableStreamFromReadable(body);

					headers.set("Content-Type", "text/html");
					resolve(
						new Response(stream, {
							headers,
							status,
						}),
					);
					pipe(body);
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onError(error: unknown) {
					status = 500;

					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error);
					}
				},
				nonce: nonce.script,
			},
		);

		setTimeout(abort, ABORT_DELAY);
	});
}
