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

function Log(category) {
	// DEBUG
	var LOG_THRESHOLD = "DEBUG";
	// RELEASE
	//	var LOG_THRESHOLD = "WARN";

	var log = this;
	var self = this;
	this.category = category;
	
	function LogLevel(level, name) {
		this.level = level;
		this.name = name;
		var self = this;
		log[name.toLowerCase()] = function(msg) { log.log(self, msg) };
	}

	this.DEBUG = new LogLevel(1, "DEBUG");
	this.INFO = new LogLevel(2, "INFO");
	this.WARN = new LogLevel(3, "WARN");
	this.ERROR = new LogLevel(4, "ERROR");

	this.log = function(level, msg) {
		var threshold = this[LOG_THRESHOLD];
		if (level.level >= threshold.level) {
			var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
			if (consoleService != null) {
				consoleService.logStringMessage("Selenium IDE [" + level.name + "] " + 
												self.category + ": " + msg);
			}
		}
	}
}

function instanceOf(object, constructor) {
	while (object != null) {
		if (object == constructor.prototype)
			return true;
		object = object.__proto__;
	}
	return false;
}


