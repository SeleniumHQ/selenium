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
	serverUri:
		// TODO add a cli flag somewhere (?)
		process.env.NODE_ENV === "development"
			? "http://localhost:4444/graphql"
			: document.location.protocol + "//" + document.location.host + "/graphql",

	/** Keybinds config */
	globalKeybinds: {
		toggleKeybindsPage: "ctrl + /",
	},
  /* Look at console.keybinds.ts for keybinds for the console.tsx */
};
