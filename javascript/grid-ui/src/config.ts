/** Contains the global config values which can be adjusted */
export const GridConfig = {
	/** core/Status.ts */
	status: {
		/** The xhr polling time interval used in core/Status.ts */
		xhrPollingIntervalMillis: 5000,
	},
	/** Console.tsx */
	console: {
		/** default number of entries in the Table per page */
		numEntriesPerPage: 8,
	},

	/** RingSystem.tsx */
	ringsystem: {
		defaultRingRadius: 100,
		defaultRingStroke: 10,
	},

	/** Server config */
	// For development
	// Install https://www.npmjs.com/package/cors-anywhere on an empty directory
	// Run: node node_modules/cors-anywhere/server.js
	// Then start the Selenium Server on port 4444 (which is the default).
	serverUri:
		process.env.NODE_ENV === "development"
			? "http://localhost:8080/http://localhost:4444/graphql"
			: document.location.protocol + "//" + document.location.host + "/graphql",

	/** Keybinds config */
	globalKeybinds: {
		toggleKeybindsPage: "ctrl + /",
	},
  /* Look at console.keybinds.ts for keybinds for the console.tsx */
};
