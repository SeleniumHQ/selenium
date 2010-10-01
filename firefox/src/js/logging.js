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


var CC = Components.classes;
var CI = Components.interfaces;


/**
 * Declare the namespace
 */
function Logger() {
  var consoleService = CC["@mozilla.org/consoleservice;1"]
      .getService(CI["nsIConsoleService"]);

  var prefs = CC["@mozilla.org/preferences-service;1"]
      .getService(CI["nsIPrefBranch"]);
  var logToConsole = prefs.prefHasUserValue("webdriver_log_to_console") &&
      prefs.getBoolPref("webdriver_log_to_console");

  Logger.log_ = function(message) {
    if (logToConsole) {
      dump(message);
    }

    consoleService.logStringMessage(message);
  };
}


Logger.dumpn = function(text) {
  var stack = Components.stack.caller;
  var filename = stack.filename.replace(/.*\//, '');
  Logger.log_(filename + ":" + stack.lineNumber  + " - " + text + "\n");
};


Logger.dump = function(element) {
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
  var stack = Components.stack;
  var i = 5;
  var dump = "";
  while (i && stack.caller) {
    stack = stack.caller;
    dump += stack + "\n";
  }

  Logger.log_(dump);
};


// Initialize the logging system. Because of the way that Firefox imports work
// this will only happen once.
new Logger();


// Declare the exported symbols
var EXPORTED_SYMBOLS = [ 'Logger' ];