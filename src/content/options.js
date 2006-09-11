/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const OPTIONS = {
	encoding: "UTF-8",

	// This should be called 'userExtensionsPaths', but it is left for backward compatibility.
	userExtensionsURL:
	"",

	ideExtensionsPaths:
	"",
	
	rememberBaseURL:
	"true",

	baseURL:
	"",

	recordAssertTitle:
	"false",

	timeout:
	"30000"
};

function OptionsManager() {
}

OptionsManager.prototype = {
	branch: getOptionsBranch(),
	
	getCharPref: function(name, defaultValue) {
		if (this.branch.prefHasUserValue(name)) {
			return this.branch.getComplexValue(name, Components.interfaces.nsISupportsString).data;
		} else {
			return defaultValue;
		}
	},

	setCharPref: function(name, value) {
		var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		str.data = value;
		this.branch.setComplexValue(name, Components.interfaces.nsISupportsString, str);
	},

	load: function() {
		var options = {};
		var name;
		for (name in OPTIONS) {
			options[name] = OPTIONS[name];
		}
		var names = this.branch.getChildList('', []);
		for (var i = 0; i < names.length; i++) {
			name = names[i];
			options[name] = this.getCharPref(name, OPTIONS[name] || '');
		}
		return options;
	},

	save: function(options, prop_name) {
		if (prop_name) {
			this.setCharPref(prop_name, options[prop_name]);
		} else {
			this.branch.deleteBranch("formats");
			var name;
			for (name in options) {
				this.setCharPref(name, options[name]);
			}
		}
	}
};

var optionsManager = new OptionsManager();
