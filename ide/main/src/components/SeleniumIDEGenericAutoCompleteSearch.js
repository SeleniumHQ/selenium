function SeleniumIDEGenericAutoCompleteSearch() {
	this.candidates = {};
}

SeleniumIDEGenericAutoCompleteSearch.prototype = {
	startSearch: function(searchString, searchParam, prevResult, listener) {
		var result = new AutoCompleteResult(searchString, this.candidates[searchParam] || []);
		listener.onSearchResult(this, result);
	},

	stopSearch: function() {
	},

    setCandidates: function(key, values) {
        this.setCandidatesWithComments(key, values, null);
	},

    setCandidatesWithComments: function(key, values, comments) {
		var count = values.Count();
        var candidates = this.candidates[key] = new Array(count);
		for (var i = 0; i < count; i++) {
            candidates[i] = [values.GetElementAt(i).QueryInterface(Components.interfaces.nsISupportsString).data,
                             comments ? comments.GetElementAt(i).QueryInterface(Components.interfaces.nsISupportsString).data : null];
		}
	},

    clearCandidates: function(key) {
        if (this.candidates[key]) {
            delete this.candidates[key];
        }
    },

    QueryInterface: function(uuid) {
		if (uuid.equals(Components.interfaces.nsISeleniumIDEGenericAutoCompleteSearch) ||
			uuid.equals(Components.interfaces.nsIAutoCompleteSearch) ||
			uuid.equals(Components.interfaces.nsISupports)) {
			return this;
		}
        Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
        return null;
    }
};

function AutoCompleteResult(search, candidates) {
	this.search = search;
	this.result = [];
	var lsearch = search.toLowerCase();
    //Samit: Enh: add support for strict camel case as well as relaxed camel case autocompletion
    if (lsearch != search && search.match(/^!?[A-Za-z]+$/)) {
        var searchSrc = search;
        var pattern = "[a-z]*$1";
        if (searchSrc.match(/^!/)) {
            //use relaxed camel case if the search expression begins with an "!"
            pattern = ".*$1";
            searchSrc = searchSrc.replace(/^!/, '');
        }
        var searchRegExp = new RegExp(searchSrc.replace(/([A-Z]|$)/g, pattern));
        for (var i = 0; i < candidates.length; i++) {
            if (searchRegExp.test(candidates[i][0])) {
                this.result.push(candidates[i]);
            }
        }
    }else {
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i][0].toLowerCase().indexOf(lsearch) == 0) {
                this.result.push(candidates[i]);
            }
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
		return this.result.length;
	},
	get searchResult() {
		return Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS;
	},
	get searchString() {
		return this.search;
	},
	getCommentAt: function(index) {
		return this.result[index][1] || '';
	},
	getStyleAt: function(index) {
		return '';
	},
	getValueAt: function(index) {
		return this.result[index][0];
	},
	getImageAt: function (index) {
		return '';
	},
	getLabelAt: function getLabelAt(index) {
		return this.getValueAt(index);
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
};

//const COMPONENT_ID = Components.ID("{4791AF5F-AFBA-45A1-8204-47A135DF9591}");
const COMPONENT_ID = Components.ID("{E5226A0D-4698-4E15-9D6D-86771AE172C9}");

var SeleniumIDEGenericAutoCompleteModule = {
    registerSelf: function (compMgr, fileSpec, location, type) {
        compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        compMgr.registerFactoryLocation(COMPONENT_ID,
                                        "Selenium IDE Generic Autocomplete",
                                        "@mozilla.org/autocomplete/search;1?name=selenium-ide-generic",
                                        fileSpec,
                                        location,
                                        type);
    },

    getClassObject: function (compMgr, cid, iid) {
        if (!cid.equals(COMPONENT_ID)) throw Components.results.NS_ERROR_NO_INTERFACE;
        if (!iid.equals(Components.interfaces.nsIFactory))
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

		return SeleniumIDEGenericAutoCompleteFactory;
    },

    canUnload: function(compMgr) {
        return true;
    }
};

var SeleniumIDEGenericAutoCompleteFactory = {
	createInstance: function (outer, iid) {
		if (outer != null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		return new SeleniumIDEGenericAutoCompleteSearch().QueryInterface(iid);
	}
};

function NSGetModule(compMgr, fileSpec) {
    return SeleniumIDEGenericAutoCompleteModule;
}

function NSGetFactory(cid) {
    if (cid.toString().toUpperCase() != COMPONENT_ID.toString().toUpperCase()) throw Components.results.NS_ERROR_FACTORY_NOT_REGISTERED;
    return SeleniumIDEGenericAutoCompleteFactory;
}
