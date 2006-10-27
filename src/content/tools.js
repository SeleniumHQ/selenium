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

this.Preferences = SeleniumIDE.Preferences;

function Log(category) {
	var thresholdName = Preferences.getString("internalLogThreshold", "INFO");

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
			Log.write("Selenium IDE [" + level.name + "] " + 
					  self.category + ": " + msg);
		}
	}
}

Log.write = function(message) {
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService);
	if (consoleService != null) {
		consoleService.logStringMessage(message);
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

function showFilePicker(window, title, mode, defaultDirPrefName, handler) {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, title, mode);
    var defaultDir = Preferences.getString(defaultDirPrefName);
    if (defaultDir) {
        fp.displayDirectory = FileUtils.getFile(defaultDir);
    }
	fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
    var res = fp.show();
    if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace) {
        Preferences.setString(defaultDirPrefName, fp.file.parent.path);
        return handler(fp);
    } else {
        return null;
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
		var line = /.*(\r\n|\r|\n)?/.exec(this.text)[0];
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

function Message(key, arg) {
	var message = window.document.getElementById("strings").getString(key);
	if (arg) {
		message = message.replace(/%/, arg);
	}
	return message;
}

var ExtensionsLoader = {
	getURLs: function(commaSeparatedPaths) {
		var urls = [];
		if (commaSeparatedPaths) {
			commaSeparatedPaths.split(/,/).forEach(function(path) {
					path = path.replace(/^\s*/, '');
					path = path.replace(/\s*$/, '');
					if (!path.match(/^(file|chrome):/)) {
						path = FileUtils.fileURI(FileUtils.getFile(path));
					}
					urls.push(path);
				});
		}
		return urls;
	},
	
	loadSubScript: function(loader, paths, obj) {
		this.getURLs(paths).forEach(function(url) {
				if (url) {
					loader.loadSubScript(url, obj);
				}
			});
	}
};

function doEval(str, obj) {
    if (obj) {
        with (obj) {
            return eval(str);
        }
    } else {
        return eval(str);
    }
}

function isFirefox2() {
    return !navigator.userAgent.match(/ rv:1\.8\.0/); // Not Firefox 1.5 (Gecko 1.8.0)
}
