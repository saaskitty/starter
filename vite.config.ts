import {
	buildMain,
	defineConfig,
	dirs,
	remixFlatRoutes,
	remixRoutes,
	remixVitePlugin,
	viteTsconfigPaths,
} from "saaskitty/dev";

export default defineConfig(async () => {
	const host = process.env.HOST || "0.0.0.0";
	const port = Number.parseInt(process.env.PORT || "8000");
	const external: string[] = ["vite"];

	return {
		build: {
			rollupOptions: {
				external: [/^(node:)/, ...external],
			},
			target: "esnext",
		},
		optimizeDeps: {
			include: ["app/routes/**/*"],
			exclude: ["build", "node_modules", "tests"],
		},
		plugins: [
			...(process.env.NODE_ENV !== "production"
				? [
						(await import("saaskitty/dev")).i18nextHMRPlugin({
							localesDir: `${dirs.public}/locales`,
						}),
					]
				: []),
			remixVitePlugin({
				appDirectory: dirs.app,
				buildDirectory: dirs.build,
				async buildEnd() {
					await buildMain({
						entryPoints: [`${dirs.server}/main.ts`],
						external,
						outdir: dirs.build,
					});
				},
				routes(defineRoutes) {
					return remixFlatRoutes("routes", defineRoutes, {
						appDir: dirs.app,
						ignoredRouteFiles: [
							".*",
							"**/*.css",
							"**/*.spec.{js,jsx,ts,tsx}",
							"**/__*.*",
							"**/*.server.*",
							"**/*.client.*",
						],
					});
				},
			}),
			remixRoutes(),
			viteTsconfigPaths(),
		],
		/**
		 * For bundling the server side code into 1 single file to reduce Docker
		 * image size.
		 */
		...(process.env.NODE_ENV === "production"
			? {
					ssr: {
						noExternal: [/^(?!node:).*/],
					},
				}
			: {}),
		server: {
			host,
			port,
		},
		test: {
			include: ["**/*.spec.?(c|m)[jt]s?(x)"],
			globals: true,
			globalSetup: ["tests/global-setup.ts"],
			passWithNoTests: true,
			setupFiles: ["tests/setup.ts"],
		},
	};
});
