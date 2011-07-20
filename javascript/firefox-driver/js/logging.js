/*
 Copyright 2010 WebDriver committers
 Copyright 2010 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

goog.provide('Logger');

/**
 * Declare the namespace
 */
var Logger = {
  initialized: false
};

Logger._init = function() {
  if (Logger.initialized == true) {
    return;
  }

  Logger.initialized = true;
  var CC = Components.classes;
  var CI = Components.interfaces;

  var consoleService = CC["@mozilla.org/consoleservice;1"]
      .getService(CI["nsIConsoleService"]);

  var prefs = CC["@mozilla.org/preferences-service;1"]
      .getService(CI["nsIPrefBranch"]);
  var logToConsole = prefs.prefHasUserValue("webdriver_log_to_console") &&
      prefs.getBoolPref("webdriver_log_to_console");
  var logToFile = prefs.prefHasUserValue("webdriver.log.file") &&
      prefs.getCharPref("webdriver.log.file");

  if (logToConsole) {
    var consoleLogger = {
      observe: function(message) {
        dump(message.message);
      },
      QueryInterface: function(iid) {
        if (!iid.equals(CI['nsIConsoleListener']) &&
            !idd.equals(CI['nsISupports'])) {
          throw Components.results.NS_ERROR_NO_INTERFACE;
        }

        return this;
      }
    };

    consoleService.registerListener(consoleLogger);
  }

  if (!!logToFile) {
    // Make sure that file exists
    var file = CC['@mozilla.org/file/local;1']
        .createInstance(CI['nsILocalFile']);
    file.initWithPath(logToFile);
    file.createUnique(CI.nsIFile.NORMAL_FILE_TYPE, 0666);
    var fileName = file.path;
    consoleService.logStringMessage("Also logging to file: " + fileName);

    var fileLogger = {
      observe: function(message) {
        var file = CC['@mozilla.org/file/local;1']
            .createInstance(CI['nsILocalFile']);
        file.initWithPath(fileName);

        var ostream = CC['@mozilla.org/network/file-output-stream;1']
        .createInstance(CI['nsIFileOutputStream']);
        // Append to file
        ostream.init(file, 0x02 | 0x10, 0666, 0);

        var converter = CC['@mozilla.org/intl/converter-output-stream;1']
            .createInstance(CI['nsIConverterOutputStream']);
        converter.init(ostream, 'UTF-8', 0, 0);

        converter.writeString(message.message);

        converter.close();
      },
      QueryInterface: function(iid) {
        if (!iid.equals(CI['nsIConsoleListener']) &&
            !idd.equals(CI['nsISupports'])) {
          throw Components.results.NS_ERROR_NO_INTERFACE;
        }

        return this;
      }
    };

    consoleService.registerListener(fileLogger)
  }

  Logger.log_ = function(message) {
    consoleService.logStringMessage(message);
  };
};


Logger.dumpn = function(text) {
  Logger._init();
  var stack = Components.stack.caller;
  var filename = stack.filename.replace(/.*\//, '');
  Logger.log_(filename + ":" + stack.lineNumber  + " - " + text + "\n");
};


Logger.dump = function(element) {
  Logger._init();
  var dump = "=============\n";

  var rows = [];

  dump += "Supported interfaces: ";
  for (var i in Components.interfaces) {
    try {
      var view = element.QueryInterface(Components.interfaces[i]);
      dump += i + ", ";
    } catch (e) {
      // Doesn't support the interface
    }
  }
  dump += "\n------------\n";

  try {
    Logger.dumpProperties_(element, rows);
  } catch (e) {
    Logger.log_("caught an exception: " + e);
  }

  rows.sort();
  for (var i in rows) {
    dump += rows[i] + "\n";
  }

  dump += "=============\n\n\n";
  Logger.log_(dump);
};


Logger.dumpProperties_ = function(view, rows) {
  Logger._init();
  for (var i in view) {
    var value = "\t" + i + ": ";
    try {
      if (typeof(view[i]) == typeof(Function)) {
        value += " function()";
      } else {
        value += String(view[i]);
      }
    } catch (e) {
      value += " Cannot obtain value";
    }

    rows.push(value);
  }
};


Logger.stackTrace = function() {
  Logger._init();
  var stack = Components.stack;
  var i = 5;
  var dump = "";
  while (i && stack.caller) {
    stack = stack.caller;
    dump += stack + "\n";
  }

  Logger.log_(dump);
};
