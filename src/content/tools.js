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
	//var LOG_THRESHOLD = "DEBUG";
	// RELEASE
	//var LOG_THRESHOLD = "WARN";
	// TODO: this variable should be configurable through option

	var thresholdName = getOptionValue("internalLogThreshold", "INFO");

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
		var threshold = this[thresholdName];
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

function getOptionsBranch() {
	return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.selenium-ide.");
}

function getOptionValue(name, defaultValue) {
	var branch = getOptionsBranch();
	if (branch.prefHasUserValue(name)) {
		return branch.getCharPref(name);
	} else {
		return defaultValue;
	}
}

function exactMatchPattern(string) {
	if (string != null && (string.match(/^\w*:/) || string.indexOf('?') >= 0 || string.indexOf('*') >= 0)) {
		return "exact:" + string;
	} else {
		return string;
	}
}

function LineReader(text) {
	this.text = text;
}

LineReader.prototype.read = function() {
	if (this.text.length > 0) {
		line = /.*(\r\n|\r|\n)?/.exec(this.text)[0];
		this.text = this.text.substr(line.length);
		line = line.replace(/\r?\n?$/, '');
		return line;
	} else {
		return null;
	}
}

var StringUtils = {};

StringUtils.underscore = function(text) {
	return text.replace(/[A-Z]/g, function(str) {
			return '_' + str.toLowerCase();
		});
}
