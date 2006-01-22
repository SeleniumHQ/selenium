function SeleniumAutoCompleteSearch() {
	this.commands = [];
}

SeleniumAutoCompleteSearch.prototype = {
	startSearch: function(searchString, searchParam, prevResult, listener) {
		var result = new AutoCompleteResult(searchString, this.commands);
		listener.onSearchResult(this, result);
	},

	stopSearch: function() {
	},

	setSeleniumCommands: function(commands) {
		var count = commands.Count();
		this.commands = new Array(count);
		for (var i = 0; i < count; i++) {
			this.commands[i] = commands.GetElementAt(i).QueryInterface(Components.interfaces.nsISupportsString).data;
		}
	},

    QueryInterface: function (uuid) {
		if (uuid.equals(Components.interfaces.nsISeleniumAutoCompleteSearch) ||
			uuid.equals(Components.interfaces.nsIAutoCompleteSearch) ||
			uuid.equals(Components.interfaces.nsISupports)) {
			return this;
		}
        Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
        return null;
    }
}

function AutoCompleteResult(search, commands) {
	this.search = search;
	this.commands = [];
	var lsearch = search.toLowerCase();
	for (var i = 0; i < commands.length; i++) {
		if (commands[i].toLowerCase().indexOf(lsearch) == 0) {
			this.commands.push(commands[i]);
		}
	}
}

AutoCompleteResult.prototype = {
	get defaultIndex() {
		return 0;
	},
	get errorDescription() {
		return '';
	},
	get matchCount() {
		return this.commands.length;
	},
	get searchResult() {
		return Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS;
	},
	get searchString() {
		return this.search;
	},
	getCommentAt: function(index) {
		return '';
	},
	getStyleAt: function(index) {
		return '';
	},
	getValueAt: function(index) {
		return this.commands[index];
	},
	removeValueAt: function(rowIndex, removeFromDb) {
	},
    QueryInterface: function (uuid) {
		if (uuid.equals(Components.interfaces.nsIAutoCompleteResult) ||
			uuid.equals(Components.interfaces.nsISupports)) {
			return this;
		}
        Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
        return null;
    }
}

const COMPONENT_ID = Components.ID("{4791AF5F-AFBA-45A1-8204-47A135DF9591}");

var SeleniumAutoCompleteModule = {
    registerSelf: function (compMgr, fileSpec, location, type) {
        compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        compMgr.registerFactoryLocation(COMPONENT_ID,
                                        "Selenium Command Autocomplete",
                                        "@mozilla.org/autocomplete/search;1?name=selenium-commands",
                                        fileSpec,
                                        location,
                                        type);
    },

    getClassObject: function (compMgr, cid, iid) {
        if (!cid.equals(COMPONENT_ID))
            throw Components.results.NS_ERROR_NO_INTERFACE;
        if (!iid.equals(Components.interfaces.nsIFactory))
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

		return SeleniumAutoCompleteFactory;
    },

    canUnload: function(compMgr) {
        return true;
    }
};

var SeleniumAutoCompleteFactory = {
	createInstance: function (outer, iid) {
		if (outer != null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		return new SeleniumAutoCompleteSearch().QueryInterface(iid);
	}
};

function NSGetModule(compMgr, fileSpec) {
    return SeleniumAutoCompleteModule;
}

