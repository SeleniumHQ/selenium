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
	
	commandLoadPattern:
	"<tr>" +
	"\\s*<td>([^<]*)</td>" +
	"\\s*<td>([^<]*)</td>" +
	"\\s*(<td>([^<]*)</td>|<td/>)" +
	"\\s*</tr>\\s*",
	
	commandLoadScript:
	"command.command = result[1];\n" +
	"command.target = result[2];\n" +
	"command.value = result[4];\n",

	commentLoadPattern:
	"<!--((.|\\s)*?)-->\\s*",

	commentLoadScript:
	"comment.comment = result[1];\n",

	testTemplate:
	"<html>\n" +
	"<head><title>${name}</title></head>\n" +
	"<body>\n" +
	'<table cellpadding="1" cellspacing="1" border="1">\n'+
	'<thead>\n' +
	'<tr><td rowspan="1" colspan="3">${name}</td></tr>\n' +
	"</thead><tbody>\n" +
	"${commands}\n" +
	"</tbody></table>\n" +
	"</body>\n" +
	"</html>\n",

	commandTemplate:
	"<tr>\n" +
	"\t<td>${command.command}</td>\n" +
	"\t<td>${command.target}</td>\n" +
	"\t<td>${command.value}</td>\n" +
	"</tr>\n",

	commentTemplate:
	"<!--${comment.comment}-->\n",
	
	userExtensionsURL:
	"",
	
	escapeXmlEntities:
	"partial",

	escapeDollar:
	"false",
};

function RecorderOptions() {
	this.branch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.selenium-ide.");
}

RecorderOptions.prototype = {
	getCharPref: function(name, defaultValue) {
		if (this.branch.prefHasUserValue(name)) {
			return this.branch.getCharPref(name);
		} else {
			return defaultValue;
		}
	},

	setCharPref: function(name, value) {
		this.branch.setCharPref(name, value);
	},

	load: function() {
		var name;
		for (name in OPTIONS) {
			this[name] = this.getCharPref(name, OPTIONS[name]);
		}
	},

	save: function() {
		var name;
		for (name in OPTIONS) {
			this.setCharPref(name, this[name]);
		}
	}
};

