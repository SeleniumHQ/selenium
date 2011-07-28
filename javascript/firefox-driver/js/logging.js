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
goog.provide('webdriver.debug');
goog.provide('webdriver.debug.ConsoleFormatter');

goog.require('goog.debug.Formatter');
goog.require('goog.debug.Logger');
goog.require('goog.debug.LogRecord');
goog.require('goog.debug.TextFormatter');

/**
 * @private
 */
webdriver.debug.initialized_ = false;

/**
 * Formatter that returns formatted text for display on Firefox's error console.
 *
 * @constructor
 * @extends {goog.debug.Formatter}
 */
webdriver.debug.ConsoleFormatter = function() {
  goog.debug.Formatter.call(this);
};
goog.inherits(webdriver.debug.ConsoleFormatter, goog.debug.Formatter);

/**
 * Formats a record as text.
 *
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string.
 */
webdriver.debug.ConsoleFormatter.prototype.formatRecord = function(logRecord) {
  // Build message html
  var sb = [];

  if (this.showSeverityLevel) {
    sb.push('[', logRecord.getLevel().name, '] ');
  }

  var stack = Components.stack;
  // Trial and error says that we're 7 levels deep in the stack when called.
  for (var i = 0; i < 7 && stack; i++) {
    stack = stack['caller'];
  }

  var filename = stack.filename.replace(/.*\//, '');
  sb.push(filename + ':' + stack.lineNumber + ' ');

  sb.push(logRecord.getMessage(), '\n');
  if (this.showExceptionText && logRecord.getException()) {
    sb.push(logRecord.getExceptionText(), '\n');
  }

  return sb.join('');
};

/**
 * Add a log handler to the logger that will record messages to Firefox's Error Console.
 *
 * @param {!goog.debug.Logger} logger The logger to use.
 * @private
 */
webdriver.debug.addErrorConsoleLogger_ = function(logger) {
  if (!Components) {
    return;
  }

  var formatter = new webdriver.debug.ConsoleFormatter();
  formatter.showSeverityLevel = true;

  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces["nsIConsoleService"]);

  logger.addHandler(function(logRecord) {
    var text = formatter.formatRecord(logRecord);
    consoleService.logStringMessage(text);
  })
};


/**
 * Add a log handler to the logger that will record to a log file.
 *
 * @param {!goog.debug.Logger} logger The logger to use.
 * @param {string?} opt_path The path to the file to use for logging.
 * @private
 */
webdriver.debug.addFileLogger_ = function(logger, opt_path) {
  if (!opt_path) {
    return;
  }

  // Make sure that file exists
  var file = Components.classes['@mozilla.org/file/local;1']
      .createInstance(Components.interfaces['nsILocalFile']);
  file.initWithPath(logToFile);
  file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
  var fileName = file.path;

  var formatter = new goog.debug.TextFormatter('webdriver');

  logger.addHandler(function(logRecord) {
    var file = Components.classes['@mozilla.org/file/local;1']
        .createInstance(Components.interfaces['nsILocalFile']);
    file.initWithPath(fileName);

    var ostream = Components.classes['@mozilla.org/network/file-output-stream;1']
        .createInstance(Components.interfaces['nsIFileOutputStream']);
    // Append to file
    ostream.init(file, 0x02 | 0x10, 0666, 0);

    var converter = Components.classes['@mozilla.org/intl/converter-output-stream;1']
        .createInstance(Components.interfaces['nsIConverterOutputStream']);
    converter.init(ostream, 'UTF-8', 0, 0);

    var text = formatter.formatRecord(logRecord);
    converter.writeString(text);

    converter.close();
  });
};

/**
 * Initialize the goog.debug logging infrastructure with the pieces needed to
 * log on Firefox.
 */
webdriver.debug.initialize = function() {
  if (webdriver.debug.initialized_) {
    return;
  }

  var rootLogger = goog.debug.Logger.getLogger('');
  webdriver.debug.addErrorConsoleLogger_(rootLogger);

  var prefs = Components.classes["@mozilla.org/preferences-service;1"]
     .getService(Components.interfaces["nsIPrefBranch"]);

  var file = prefs.prefHasUserValue("webdriver.log.file") &&
      prefs.getCharPref("webdriver.log.file");
  webdriver.debug.addFileLogger_(rootLogger, file);

  webdriver.debug.initialized_ = true;
};


Logger.dumpn = function(text) {
  webdriver.debug.initialize();

  var logger = goog.debug.Logger.getLogger('webdriver');
  logger.info(text);
};


Logger.dump = function(element) {
  // no-op
};


Logger.dump = function(element) {
  webdriver.debug.initialize();
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
  } catch (ignored) {
  }

  rows.sort();
  for (var j in rows) {
    dump += rows[j] + "\n";
  }

  dump += "=============\n\n\n";

  var logger = goog.debug.Logger.getLogger('webdriver');
  logger.warning(dump);
};


Logger.dumpProperties_ = function(view, rows) {
  webdriver.debug.initialize();
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
  webdriver.debug.initialize();
  var stack = Components.stack;
  var i = 5;
  var dump = "";
  while (i && stack.caller) {
    stack = stack.caller;
    dump += stack + "\n";
  }

  Logger.log_(dump);
};
