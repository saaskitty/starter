/**
 * Keep this to avoid drizzle-kit's db:push command from dropping this table.
 */
import {
	bigint,
	pgTable,
	serial,
	text,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const schemaMigrations = pgTable(
	"schema_migrations",
	{
		id: serial("id").primaryKey(),
		hash: text("hash").notNull(),
		createdAt: bigint("created_at", {
			mode: "number",
		}),
	},
	(table) => ({
		uniqueHash: uniqueIndex("schema_migrations_hash_unique").on(table.hash),
	}),
);
