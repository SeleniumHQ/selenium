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

goog.provide('fxdriver.Logger');
goog.provide('fxdriver.debug');
goog.provide('fxdriver.debug.ConsoleFormatter');

goog.require('goog.debug.Formatter');
goog.require('goog.debug.Logger');
goog.require('goog.debug.LogRecord');
goog.require('goog.debug.TextFormatter');


/**
 * @private
 */
fxdriver.debug.initialized_ = false;


/**
 * @type {Object} a nsIFile.
 */
fxdriver.debug.driver_logs_file;


/**
 * Log levels for WebDriver.
 * @enum {number}
 */
fxdriver.debug.LogLevel = {
  DEBUG: 500,
  INFO: 800,
  WARNING: 900,
  ERROR: 1000,
  OFF: Math.pow(2, 31) -1
};


/**
 * The driver's log level. This property is set through the Firefox
 * profile preferences, using the key fxdriver.debug.LOG_DRIVER_.
 * By default logging is disabled.
 *
 * @private
 * @type {fxdriver.debug.LogLevel}
 */
fxdriver.debug.driverLogLevel_ = fxdriver.debug.LogLevel.OFF;


/**
 * The Firefox profile preference key for enabling the driver's logging.
 * @private
 * @const
 * @type {string}
 */
fxdriver.debug.LOG_DRIVER_ = 'webdriver.log.driver';


/**
 * Formatter that returns formatted text for display on Firefox's error console.
 *
 * @constructor
 * @extends {goog.debug.Formatter}
 */
fxdriver.debug.ConsoleFormatter = function() {
  goog.debug.Formatter.call(this);
};
goog.inherits(fxdriver.debug.ConsoleFormatter, goog.debug.Formatter);

/**
 * Formats a record as text.
 *
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string.
 */
fxdriver.debug.ConsoleFormatter.prototype.formatRecord = function(logRecord) {
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
fxdriver.debug.addErrorConsoleLogger_ = function(logger) {
  if (!Components) {
    return;
  }

  var formatter = new fxdriver.debug.ConsoleFormatter();
  formatter.showSeverityLevel = true;

  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces["nsIConsoleService"]);

  logger.addHandler(function(logRecord) {
    var text = formatter.formatRecord(logRecord);
    consoleService.logStringMessage(text);
  })
};

/**
 * Gives an equivalence from goog.debug.Logger.Level to
 * fxdriver.debug.LogLevel.
 * 
 * @private
 * @param {!goog.debug.Logger.Level} level The level to lookup.
 * @return {!fxdriver.debug.LogLevel} the corresponding level in
 *     fxdriver.debug.LogLevel if found,
 *     otherwise returns fxdriver.debug.LogLevel.OFF.
 */
fxdriver.debug.getLevelFromLogRecord_ = function(level) {
  if (level == goog.debug.Logger.Level.DEBUG) {
    return fxdriver.debug.LogLevel.DEBUG;
  }
  if (level == goog.debug.Logger.Level.WARNING) {
    return fxdriver.debug.LogLevel.WARNING;
  }
  if (level == goog.debug.Logger.Level.ERROR) {
    return fxdriver.debug.LogLevel.ERROR;
  }
  // Default return info
  return fxdriver.debug.LogLevel.OFF;
};

/**
 * Adds a handler to the logger that will record of all statements logged
 * for the given level and above.
 * 
 * @param {goog.debug.Logger} logger The logger to attach the handler to.
 */
fxdriver.debug.addLogRecorderHandler_ = function(logger) {
  var level = fxdriver.debug.driverLogLevel_;
  logger.addHandler(function(toLog) {
    var logLevel = fxdriver.debug.getLevelFromLogRecord_(toLog.getLevel());
    if (logLevel >= level) {
      var timestamp = toLog.getMillis() || (new Date()).getTime();
      fxdriver.debug.writeToFile_(fxdriver.debug.driver_logs_file.path,
          JSON.stringify({
            "timestamp": timestamp,
            "level": logLevel,
            "message": toLog.getMessage()
          }) + "\n"
      )
    }
  })
};


/**
 * Writes text to a file.
 *
 * @private
 * @param {!string} path The absolute path of the file to write to.
 * @param {string} toWrite The text to write.
 */
fxdriver.debug.writeToFile_ = function(path, toWrite) {
  var file = Components.classes['@mozilla.org/file/local;1']
      .createInstance(Components.interfaces['nsILocalFile']);
  file.initWithPath(path);

  var ostream = Components.classes['@mozilla.org/network/file-output-stream;1']
      .createInstance(Components.interfaces['nsIFileOutputStream']);
  // Append to file. We use 0x02 for write only and 0x10 to set the file
  // pointer to the end of the file before writing.
  // Those values are defined here https://developer.mozilla.org/en/PR_Open#Parameters.
  ostream.init(file, 0x02 | 0x10, 0666, 0);

  var converter = Components.classes['@mozilla.org/intl/converter-output-stream;1']
      .createInstance(Components.interfaces['nsIConverterOutputStream']);
  converter.init(ostream, 'UTF-8', 0, 0);

  converter.writeString(toWrite);

  converter.close();
};


/**
 * Add a log handler to the logger that will record to a log file.
 *
 * @param {!goog.debug.Logger} logger The logger to use.
 * @param {string?} opt_path The path to the file to use for logging.
 * @private
 */
fxdriver.debug.addFileLogger_ = function(logger, opt_path) {
  if (!opt_path) {
    return;
  }

  // Make sure that file exists
  var file = Components.classes['@mozilla.org/file/local;1']
      .createInstance(Components.interfaces['nsILocalFile']);
  file.initWithPath(opt_path);
  file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
  var fileName = file.path;

  var formatter = new goog.debug.TextFormatter('webdriver');

  logger.addHandler(function(logRecord) {
    fxdriver.debug.writeToFile_(fileName, formatter.formatRecord(logRecord));
  });
};

/**
 * Initialize the goog.debug logging infrastructure with the pieces needed to
 * log on Firefox.
 */
fxdriver.debug.initialize = function() {
  if (fxdriver.debug.initialized_) {
    return;
  }

  var rootLogger = goog.debug.Logger.getLogger('');
  fxdriver.debug.addErrorConsoleLogger_(rootLogger);

  var prefs = Components.classes["@mozilla.org/preferences-service;1"]
     .getService(Components.interfaces["nsIPrefBranch"]);

  var file = prefs.prefHasUserValue("webdriver.log.file") &&
      prefs.getCharPref("webdriver.log.file");

  fxdriver.debug.addFileLogger_(rootLogger, file);

  if (prefs.prefHasUserValue(fxdriver.debug.LOG_DRIVER_)) {
    fxdriver.debug.driverLogLevel_ = prefs.getIntPref(fxdriver.debug.LOG_DRIVER_);
    fxdriver.debug.driver_logs_file = Components.classes["@mozilla.org/file/directory_service;1"].
        getService(Components.interfaces.nsIProperties).
        get("TmpD", Components.interfaces.nsIFile);
    fxdriver.debug.driver_logs_file.append("driverlogs.txt");
    fxdriver.debug.driver_logs_file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE,
        0666);
    fxdriver.debug.addLogRecorderHandler_(rootLogger);
  }

  fxdriver.debug.initialized_ = true;
};


fxdriver.Logger.dumpn = function(text) {
  fxdriver.debug.initialize();

  var logger = goog.debug.Logger.getLogger('webdriver');
  logger.info(text);
};


fxdriver.Logger.dump = function(element) {
  fxdriver.debug.initialize();
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
    fxdriver.Logger.dumpProperties_(element, rows);
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


fxdriver.Logger.dumpProperties_ = function(view, rows) {
  fxdriver.debug.initialize();
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


fxdriver.Logger.stackTrace = function() {
  fxdriver.debug.initialize();
  var stack = Components.stack;
  var i = 5;
  var dump = "";
  while (i && stack.caller) {
    stack = stack.caller;
    dump += stack + "\n";
  }

  fxdriver.Logger.dumpn(dump);
};
