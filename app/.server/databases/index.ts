import { getAppDatabase } from "saaskitty/orm";
import * as primarySchema from "#app/.server/databases/primary/schemas/index.js";
import type { App } from "#app/.server/main.js";

/**
 * Get the application databases.
 *
 * @param {App} app The app instance.
 * @returns {Object} An object containing the databases.
 */
export function getDatabases(app: App) {
	return {
		primary: getAppDatabase({
			connections: {
				primary: {
					url: app.config.PRIMARY_DB_URL,
				},
				replicas: [],
			},
			dir: `${app.dirs.databases}/primary`,
			logger: app.log,
			schema: primarySchema,
		}),
	};
}
