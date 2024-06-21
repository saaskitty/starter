import { setupTestDatabaseTemplate } from "saaskitty/test";
import { bootstrapOpts } from "#app/.server/main.js";

/**
 * Run before all tests start.
 */
export async function setup() {
	await setupTestDatabaseTemplate(bootstrapOpts);
}

/**
 * Run after all tests end.
 */
export async function teardown() {}
