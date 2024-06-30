import type { AppConfig } from "saaskitty/server";
import { z } from "saaskitty/validator";

/**
 * The application config.
 */
export type Config = AppConfig<typeof configSchema>;

/**
 * The application config schema.
 */
export const configSchema = {
	/**
	 * The application base URL.
	 */
	APP_BASE_URL: z.string(),

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
	 * The secrets used to sign the cookies.
	 */
	COOKIE_SECRETS: z
		.string()
		.transform((val) => val.split(",").map((secret) => secret.trim()))
		.refine(
			(arr) => arr.length > 0 && arr.every((secret) => secret.length > 0),
			{
				message: "must be a comma-separated list of non-empty strings",
			},
		)
		.transform((arr) => arr as string[]),

	/**
	 * The secret used to sign the CSRF token.
	 */
	CSRF_SECRET: z.string(),

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
	 * The Redis pubsub connection URL.
	 */
	PUBSUB_URL: z.string(),

	/**
	 * The Redis queue connection URL.
	 */
	QUEUE_URL: z.string(),
};
