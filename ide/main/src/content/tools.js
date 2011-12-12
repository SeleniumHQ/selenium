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

if (this.SeleniumIDE && SeleniumIDE.Preferences) {
    this.Preferences = SeleniumIDE.Preferences;
} else {
    // Preferences is not available when called from xlator
    this.Preferences = {
        getString: function(name, defaultValue) {
            return defaultValue;
        }
    };
}

function Log(category) {
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
		var threshold = this[this._getThreshold()];
		if (level.level >= threshold.level) {
			this._write("Selenium IDE [" + level.name + "] " + 
                      this._formatDate(new Date()) + " " +
					  self.category + ": " + msg);
		}
	}
}

Log.prototype = {
    _getThreshold: function() {
        if (!this.threshold) {
            this.threshold = Preferences.getString("internalLogThreshold", "INFO");
        }
        return this.threshold;
    },

    _formatDate: function(date) {
        return date.getFullYear() + 
          "-" + this._formatDigits(date.getMonth() + 1, 2) + 
          "-" + this._formatDigits(date.getDate(), 2) +
          " " + this._formatDigits(date.getHours(), 2) +
          ":" + this._formatDigits(date.getMinutes(), 2) +
          ":" + this._formatDigits(date.getSeconds(), 2) +
          "." + this._formatDigits(date.getMilliseconds(), 3);
    },

    _formatDigits: function(n, digits) {
        var s = n.toString();
        var pre = digits - s.length;
        var result = "";
        for (var i = 0; i < pre; i++) {
            result += "0";
        }
        result += s;
        return result;
    },

    _write: function(message) {
        var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
		    .getService(Components.interfaces.nsIConsoleService);
        if (consoleService != null) {
            consoleService.logStringMessage(message);
        }
    }
}

function showFilePicker(window, title, mode, defaultDirPrefName, handler, defaultExtension) {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, title, mode);
	if (defaultExtension) {
	  fp.defaultExtension = defaultExtension;
	}
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

/**
 * Opens the given URL in a new tab if a browser window is already open, or
 * a new window otherwise.
 *
 * @param url  the URL to open.
 */
function openTabOrWindow(url)
{
    try {
        var gBrowser = window.opener.getBrowser();
        gBrowser.selectedTab = gBrowser.addTab(url);
    }
    catch (e) {
        window.open(url);
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

String.prototype.startsWith = function(str) {
	return (this.match("^" + str) == str)
}

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

function Message(key, arg) {
    var strings = window.document.getElementById("strings");
    if (strings) {
        var message = strings.getString(key);
        if (arg) {
            message = message.replace(/%/, arg);
        }
        return message;
    } else {
        return key;
    }
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
          // force a reload of the extensions by adding the timestamp as parameter
          var timestamp = new Date().getTime();
          path = path + '?' + timestamp;
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

/**
 * Returns the string with angle brackets and ampersands escaped as HTML
 * entities. This is a cleaner implementation than the escapeHTML() methods
 * defined by both the prototype and scriptaculous frameworks as it does not
 * rely on the presence of a document object which can be manipulated.
 */
String.prototype.escapeHTML2 = function() {
    return this
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

String.prototype.formatAsHTML = function() {
    return this.replace(/(?:\r\n|\r|\n)/g, '<br />');
};

Array.prototype["delete"] = function(value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == value) {
            this.splice(i, 1);
            return true;
        }
    }
    return false;
}

// Samit: Ref: Split the fn to allow both objects of a class as well as the class itself to be notifiable as required
function observable(clazz) {
  classObservable(clazz.prototype);
/*    clazz.prototype.addObserver = function(observer) {
        if (!this.observers) this.observers = [];
        this.observers.push(observer);
    }

    clazz.prototype.removeObserver = function(observer) {
        if (!this.observers) return;
        this.observers["delete"](observer);
    }

    clazz.prototype.notify = function(event) {
        if (this.log) {
            this.log.debug("notify " + event);
        }
        if (!this.observers) return;
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (var i = 0; i < this.observers.length; i++) {
            var observer = this.observers[i];
            if (observer[event]) {
                try {
                    observer[event].apply(observer, args);
                } catch(e) {
                    //continue with the rest even if one observer fails
                }
            }
        }
    }*/
}

function classObservable(clazz) {
    clazz.addObserver = function(observer) {
        if (!this.observers) this.observers = [];
        this.observers.push(observer);
    };

    clazz.removeObserver = function(observer) {
        if (!this.observers) return;
        this.observers["delete"](observer);
    };

    clazz.notify = function(event) {
        if (this.log) {
            this.log.debug("notify " + event);
        }
        if (!this.observers) return;
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (var i = 0; i < this.observers.length; i++) {
            var observer = this.observers[i];
            if (observer[event]) {
                try {
                    observer[event].apply(observer, args);
                } catch(e) {
                    //continue with the rest even if one observer fails
                }
            }
        }
    };
}

function defineEnum(clazz, names) {
    var map = {};
    for (var i = 0; i < names.length; i++) {
        clazz[names[i]] = i;
        map[i] = names[i];
    }
    return map;
}

function $(id) {
    return document.getElementById(id);
}
