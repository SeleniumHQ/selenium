/** Contains the global config values which can be adjusted */
export const GridConfig = {
	/** core/Status.ts */
	status: {
		/** How often we poll the GraphQL endpoint */
		xhrPollingIntervalMillis: 5000,
	},

	/** Server config */
	serverUri:
		process.env.NODE_ENV === "development"
			? "http://localhost:4444/graphql"
			: document.location.protocol + "//" + document.location.host + "/graphql",
};
