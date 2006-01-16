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
	
	userExtensionsURL:
	"",
	
	rememberBaseURL:
	"",

	baseURL:
	""
};

function OptionsManager() {
}

OptionsManager.prototype = {
	branch: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.selenium-ide."),
	
	getCharPref: function(name, defaultValue) {
		if (this.branch.prefHasUserValue(name)) {
			return this.branch.getCharPref(name);
		} else {
			return defaultValue;
		}
	},

	setCharPref: function(name, value) {
		this.branch.setCharPref(name, value != null ? value : '');
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
			var name;
			for (name in options) {
				this.setCharPref(name, options[name]);
			}
		}
	}
};

var optionsManager = new OptionsManager();
