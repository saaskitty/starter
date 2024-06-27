import { getI18nInitOptions } from "saaskitty/i18n";
import {
	type AppInstance,
	AppStorage,
	type BootstrapOpts,
	type GetRequestContextArgs,
	Redis,
	getAppCache,
	getAppMailer,
} from "saaskitty/server";
import { getChannels } from "#app/.server/channels/index.js";
import { getCommands } from "#app/.server/commands/index.js";
import { configSchema } from "#app/.server/config.js";
import { getCrons } from "#app/.server/crons/index.js";
import { getDatabases } from "#app/.server/databases/index.js";
import { getEvents } from "#app/.server/events/index.js";
import { getJobs } from "#app/.server/jobs/index.js";

/**
 * The application instance.
 */
export interface App
	extends AppInstance<
		typeof getCaches,
		typeof configSchema,
		typeof getChannels,
		typeof getCrons,
		typeof getDatabases,
		typeof getEvents,
		typeof getJobs,
		typeof getMailers,
		typeof getStorages
	> {}

/**
 * Get the application caches.
 *
 * @param {App} app The app instance.
 * @returns {Object} An object containing the caches.
 */
function getCaches(app: App) {
	return {
		primary: getAppCache(
			new Redis(app.config.PRIMARY_CACHE_URL, {
				lazyConnect: true,
				maxRetriesPerRequest: null,
			}),
		),
	};
}

/**
 * Get the application mailers.
 *
 * @param {App} app The app instance.
 * @returns {Object} An object containing the mailers.
 */
function getMailers(app: App) {
	return {
		primary: getAppMailer(app.config.PRIMARY_SMTP_URL),
	};
}

/**
 * Get the application object storages.
 *
 * @param {App} app The app instance.
 * @returns {Object} An object containing the storages.
 */
function getStorages(app: App) {
	return {
		primary: new AppStorage({
			bucket: app.config.PRIMARY_BUCKET,
		}),
	};
}

/**
 * Asynchronously populate the request context which will be available in the
 * routes' action/loader functions.
 *
 * Note that the object returned from this function can override the one from
 * saaskitty.
 *
 * @param {GetRequestContextArgs} args - The arguments for generating the request context.
 * @param {App} args.app - The application instance.
 * @param {FastifyRequest<RouteGenericInterface, HttpServer>} args.req - The Fastify request object.
 * @param {FastifyReply<HttpServer>} args.res - The Fastify reply object.
 *
 * @returns {Promise<object>} - A promise that resolves to the request context object.
 */
export async function getRequestContext({
	app,
	req,
	res,
}: GetRequestContextArgs) {
	return {};
}

/**
 * The options to bootstrap the application instance with.
 */
export const bootstrapOpts: BootstrapOpts<typeof configSchema> = {
	/**
	 * The application type-safe config schema to parse the environment variables.
	 */
	configSchema,

	/**
	 * The Fastify server options.
	 */
	server: {
		getRequestContext,
		helmet: {},
	},

	/**
	 * The callback to trigger before the app instance is decorated with
	 * databases/storages/etc.
	 *
	 * @param {App} app The app instance.
	 */
	async preDecorate(app: App) {
		return {
			caches: getCaches(app),
			channels: getChannels(),
			commands: getCommands(app),
			crons: getCrons(app),
			databases: getDatabases(app),
			events: getEvents(app),
			i18n: getI18nInitOptions({
				ns: ["common"],
				supportedLngs: [],
			}),
			jobs: getJobs(app),
			mailers: getMailers(app),
			publisher: new Redis(app.config.PUBSUB_URL, {
				lazyConnect: true,
				maxRetriesPerRequest: null,
			}),
			queueStore: new Redis(app.config.QUEUE_URL, {
				lazyConnect: true,
				maxRetriesPerRequest: null,
			}),
			storages: getStorages(app),
			subscriber: new Redis(app.config.PUBSUB_URL, {
				lazyConnect: true,
				maxRetriesPerRequest: null,
			}),
		};
	},

	/**
	 * The callback to trigger after the app instance is decorated with
	 * databases/storages/etc.
	 *
	 * @param {App} app The app instance.
	 */
	async postDecorate(app: App) {},
};
