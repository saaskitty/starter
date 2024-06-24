import { getI18nInitOptions } from "saaskitty/i18n";
import {
	type AppConfig,
	type AppInstance,
	AppStorage,
	type BootstrapOpts,
	type GetRequestContextArgs,
	Redis,
	getAppCache,
	getAppMailer,
} from "saaskitty/server";
import { z } from "saaskitty/validator";
import { getCommands } from "#app/.server/commands/index.js";
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
		typeof getCrons,
		typeof getDatabases,
		typeof getEvents,
		typeof getJobs,
		typeof getMailers,
		typeof getStorages
	> {}

/**
 * The application config.
 */
export type Config = AppConfig<typeof configSchema>;

/**
 * The application config schema.
 */
const configSchema = {
	/**
	 * The application description.
	 *
	 * @default "The starter template for quickly launching your full-stack web application."
	 */
	APP_DESCRIPTION: z
		.string()
		.default(
			"The starter template for quickly launching your full-stack web application.",
		),

	/**
	 * The application environment.
	 *
	 * @default "development"
	 */
	APP_ENV: z.string().default("development"),

	/**
	 * The application name.
	 *
	 * @default "starter"
	 */
	APP_NAME: z.string().default("starter"),

	/**
	 * The application version.
	 *
	 * @default "0.1.0"
	 */
	APP_VERSION: z.string().default("0.1.0"),

	/**
	 * The NodeJS environment. Setting the environment to "production" generally ensures that:
	 *
	 * - logging is kept to a minimum, essential level
	 * - more caching levels take place to optimize performance
	 *
	 * @default "development"
	 */
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),

	/**
	 * The server hostname.
	 *
	 * @default "0.0.0.0"
	 */
	HOST: z.string().default("0.0.0.0"),

	/**
	 * The server port number.
	 *
	 * @default "8000"
	 */
	PORT: z.string().default("8000"),

	/**
	 * The primary cache connection URL.
	 */
	PRIMARY_CACHE_URL: z.string(),

	/**
	 * The primary database connection URL.
	 */
	PRIMARY_DB_URL: z.string(),

	/**
	 * The primary SMTP connection URL.
	 */
	PRIMARY_SMTP_URL: z.string(),

	/**
	 * The primary object storage bucket.
	 */
	PRIMARY_BUCKET: z.string(),

	/**
	 * The queue connection URL.
	 */
	QUEUE_URL: z.string(),
};

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
			queueStore: new Redis(app.config.QUEUE_URL, {
				lazyConnect: true,
				maxRetriesPerRequest: null,
			}),
			storages: getStorages(app),
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
