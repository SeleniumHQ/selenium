// Copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @fileoverview Defines logging for the Firefox driver. */

goog.provide('fxdriver.logging');
goog.provide('fxdriver.logging.LoggingPreferences');

goog.require('fxdriver.files.File');
goog.require('fxdriver.prefs');
goog.require('goog.array');
goog.require('goog.debug.Formatter');
goog.require('goog.debug.Logger');
goog.require('goog.debug.TextFormatter');
goog.require('goog.object');
goog.require('goog.string');



/**
 * Represents the logging preferences as sent across the wire.
 *
 * @typedef {{driver: (number|undefined), profiler: (number|undefined)}}
 */
fxdriver.logging.LoggingPreferences;


/**
 * Logging levels.
 * @enum {{value:number, name:string}}
 */
fxdriver.logging.LogLevel = {
  ALL: { value: -Math.pow(2, 31), name: 'ALL' },
  DEBUG: { value: 500, name: 'DEBUG' },
  INFO: { value: 800, name: 'INFO' },
  WARNING: { value: 900, name: 'WARNING' },
  SEVERE: { value: 1000, name: 'SEVERE' },
  OFF: { value: Math.pow(2, 31) - 1, name: 'OFF' }
};


/**
 * Types of logs.
 * @enum {string}
 */
fxdriver.logging.LogType = {
  BROWSER: 'browser',
  DRIVER: 'driver',
  PROFILER: 'profiler'
};


/**
 * A single log entry.
 *
 * @constructor
 * @param {!fxdriver.logging.LogLevel} level The log level of the entry.
 * @param {string} message The message of the entry.
 */
fxdriver.logging.LogEntry = function(level, message) {
  /** @type {number} */
  this.timestamp = new Date().getTime();

  /** @type {!LogLevel} */
  this.level = level;

  /** @type {string} */
  this.message = message;
};


/**
 * Logs a debug message to the driver log.
 *
 * @param {string} message The message to log.
 */
fxdriver.logging.debug = function(message) {
  fxdriver.logging.initialize_();
  fxdriver.logging.getDriverLogger_().fine(message);
};

/**
 * Logs an info message to the driver log.
 *
 * @param {string} message The message to log.
 */
fxdriver.logging.info = function(message) {
  fxdriver.logging.initialize_();
  fxdriver.logging.getDriverLogger_().info(message);
};

/**
 * Logs a warning message to the driver log.
 *
 * @param {string} message The message to log.
 */
fxdriver.logging.warning = function(message) {
  fxdriver.logging.initialize_();
  fxdriver.logging.getDriverLogger_().warning(message);
};

/**
 * Logs an error message to the driver log.
 *
 * @param {string} message The message to log.
 */
fxdriver.logging.error = function(message) {
  fxdriver.logging.initialize_();
  fxdriver.logging.getDriverLogger_().severe(message);
};

/**
 * Logs a message on the given log level and for the given type.
 *
 * @param {!LogType} logType The log type to use.
 * @param {!LogLevel} logLevel The log level to use.
 * @param {string} message The message to log.
 */
fxdriver.logging.log = function(logType, logLevel, message) {
  fxdriver.logging.initialize_();
  if (typeof(message) != 'string') {
    message = JSON.stringify(message);
  }
  var logFile = fxdriver.logging.getLogFile_(logType);
  var entry = new fxdriver.logging.LogEntry(logLevel.name, message);
  var logEntryStr = JSON.stringify(entry);
  logEntryStr = logEntryStr.replace(/\n/g, ' ');
  logFile.append(logEntryStr + '\n');
};

/**
 * Fetches the webdriver closure logger.
 *
 * @private
 * @return {!goog.debug.Logger} The logger.
 */
fxdriver.logging.getDriverLogger_ = function() {
  return goog.debug.Logger.getLogger('webdriver');
};

/**
 * Get log entries for a given log type.
 *
 * @param {string} logType The log type.
 * @return {!Array.<!fxdriver.logging.LogEntry>} The log entries for the type.
 */
fxdriver.logging.getLog = function(logType) {
  fxdriver.logging.initialize_();
  if (fxdriver.logging.shouldIgnoreLogType_(logType)) {
    return [];
  }
  return fxdriver.logging.filterLogEntries_(logType,
      fxdriver.logging.getLogFromFile_(logType));
};

/**
 * Get available log types.
 *
 * @return {!Array.<string>} The available log types.
 */
fxdriver.logging.getAvailableLogTypes = function() {
  var result = [];
  var collectLogTypes = function(value, key) {
    if (!fxdriver.logging.shouldIgnoreLogType_(value)) {
      result.push(value);
    }
  };
  goog.object.forEach(fxdriver.logging.LogType, collectLogTypes);
  return result;
};

/**
 * Configures logging using logging preferences.
 *
 * @param {(string|!fxdriver.logging.LoggingPreferences)=} logging_prefs
 *   The preferences to use.
 * @param {boolean} enable_profiler Whether to collect profiler log.
 */
fxdriver.logging.configure = function(logging_prefs, enable_profiler) {
  fxdriver.logging.initialize_();

  if (goog.isString(logging_prefs)) {
    logging_prefs = JSON.parse(logging_prefs);
  }
  var configureLogLevels = function(logLevel, logType) {
    if (logLevel == fxdriver.logging.LogLevel.OFF.name) {
      fxdriver.logging.ignoreLogType_(logType);
    } else {
      fxdriver.logging.setLogLevel_(logType, logLevel);
    }
  };
  goog.object.forEach(logging_prefs, configureLogLevels);

  if (!enable_profiler) {
    fxdriver.logging.ignoreLogType_(fxdriver.logging.LogType.PROFILER);
  }
};


/**
 * Component initialization guard.
 * @private
 * @type {!boolean}
 */
fxdriver.logging.initialized_ = false;

/**
 * Initializes logging.
 *
 * @private
 */
fxdriver.logging.initialize_ = function() {

  if (fxdriver.logging.initialized_) {
    return;
  }
  fxdriver.logging.initialized_ = true;

  var rootLogger = goog.debug.Logger.getLogger('');
  fxdriver.logging.addClosureToDriverFileLogger_(rootLogger);
  fxdriver.logging.addClosureToConsoleLogger_(rootLogger);
  fxdriver.logging.addClosureToFileLogger_(rootLogger);

  if (fxdriver.logging.hasConsoleListenerBeenRegistered_()) {
    return;
  }
  fxdriver.logging.setConsoleListenerToRegistered_();

  fxdriver.logging.addConsoleToFileLogger_();
};

/**
 * Adds a log handler to the logger that records entries to Firefox's error
 * console to a temporary file using the log entry format of the wire protocol.
 *
 * @private
 */
fxdriver.logging.addConsoleToFileLogger_ = function() {
  var consoleService = Components.classes['@mozilla.org/consoleservice;1']
    .getService(Components.interfaces.nsIConsoleService);
  var formatter = new fxdriver.logging.ConsoleToLogEntryFormatter();

  // fetch already existing console entries
  var file = fxdriver.logging.getLogFile_(fxdriver.logging.LogType.BROWSER);
  var existingEntries = {};
  consoleService.getMessageArray(existingEntries, {});
  goog.array.forEach(existingEntries.value, function(consoleEntry) {
    file.append(formatter.formatConsoleEntry(consoleEntry));
  });

  // add console listener
  var filter = new fxdriver.logging.ConsoleToLogEntryFilter();
  var file = fxdriver.logging.getLogFile_(fxdriver.logging.LogType.BROWSER);
  var consoleListener = {
    observe: function(consoleEntry) {
      if (!filter.excludeConsoleEntry(consoleEntry)) {
        file.append(formatter.formatConsoleEntry(consoleEntry));
      }
    }
  };
  consoleListener.QueryInterface = fxdriver.moz.queryInterface(consoleListener,
      [Components.interfaces.nsIConsoleListener]);
  consoleService.registerListener(consoleListener);
};

/**
 * Adds a log handler to the logger that will record messages to
 * Firefox's Error Console.
 *
 * @private
 * @param {!goog.debug.Logger} logger The logger to use.
 */
fxdriver.logging.addClosureToConsoleLogger_ = function(logger) {
  var formatter = new fxdriver.logging.ClosureToConsoleFormatter();
  formatter.showSeverityLevel = true;
  var consoleService = Components.classes['@mozilla.org/consoleservice;1']
      .getService(Components.interfaces['nsIConsoleService']);
  logger.addHandler(function(logRecord) {
    consoleService.logStringMessage(formatter.formatRecord(logRecord));
  });
};

/**
 * Adds a log handler to the logger that will record to a log file.
 *
 * @private
 * @param {!goog.debug.Logger} logger The logger to use.
 */
fxdriver.logging.addClosureToFileLogger_ = function(logger) {
  var filePath = fxdriver.prefs.getCharPref(
      fxdriver.logging.getPrefNameLogFile_(), undefined);
  if (!filePath) {
    return;
  }
  var formatter = new goog.debug.TextFormatter('webdriver');

  if ('/dev/stdout' == filePath) {
    logger.addHandler(function(logRecord) {
      dump(formatter.formatRecord(logRecord));
    });
    return;
  }

  var file = fxdriver.files.getFile(filePath);
  logger.addHandler(function(logRecord) {
    file.append(formatter.formatRecord(logRecord));
  });
};

/**
 * Adds a log handler to the logger that records log entries to a temporary
 * file using the log entry format of the wire protocol.
 *
 * @private
 * @param {!goog.debug.Logger} logger The logger to use.
 */
fxdriver.logging.addClosureToDriverFileLogger_ = function(logger) {
  var formatter = new fxdriver.logging.ClosureToLogEntryFormatter();
  var file = fxdriver.logging.getLogFile_(fxdriver.logging.LogType.DRIVER);
  logger.addHandler(function(logRecord) {
    file.append(formatter.formatRecord(logRecord));
  });
};



/**
 * Filter log entries based on the log level set for the given log type.
 *
 * @private
 * @param {!LogLevel} logType The log type.
 * @param {!Array.<!fxdriver.logging.LogEntry>} logEntries The log entries
 *    to filter.
 * @return {!Array.<!fxdriver.logging.LogEntry>} A filtered list of log entries.
 */
fxdriver.logging.filterLogEntries_ = function(logType, logEntries) {
  var result = [];
  var logLevel = fxdriver.logging.getLogLevel_(logType);
  goog.array.forEach(logEntries, function(entry) {
    if (entry.level.value >= logLevel.value) {
      result.push(entry);
    }
  });
  return result;
};

/**
 * Filter deciding whether to exclude a console entry from being converted to
 * a log entry.
 *
 * @constructor
 */
fxdriver.logging.ConsoleToLogEntryFilter = function() {
};

/**
 * Checks if the given console entry should be excluded from being converted
 * to a log entry.
 *
 * @param {!nsIConsoleMessage} consoleEntry The console entry.
 * @return {!boolean} true if this entry should be excluded.
 */
fxdriver.logging.ConsoleToLogEntryFilter.prototype.excludeConsoleEntry =
    function(consoleEntry) {
  var msg = fxdriver.logging.getConsoleEntryMessage_(consoleEntry);
  return goog.string.contains(msg, '[WEBDRIVER]');
};



/**
 * Formatter that return a formatted JSON log entry to write to a file given
 * a Firefox error console entry.
 *
 * @constructor
 */
fxdriver.logging.ConsoleToLogEntryFormatter = function() {
};

/**
 * Formats a console entry to a JSON log entry.
 *
 * @param {!nsIConsoleMessage} consoleEntry The entry.
 * @return {string} The formatted string.
 */
fxdriver.logging.ConsoleToLogEntryFormatter.prototype.formatConsoleEntry =
    function(consoleEntry) {
  var entry = {
    level: fxdriver.logging.getConsoleEntryLogLevel_(consoleEntry).name,
    message: fxdriver.logging.getConsoleEntryMessage_(consoleEntry),
    timestamp: new Date().getTime()
  };
  return JSON.stringify(entry).replace(/\n/g, ' ') + '\n';
};

/**
 * Gets the message from a browser log entry.
 *
 * @private
 * @param {!nsIConsoleMessage} entry The log entry.
 * @return {string} The message.
 */
fxdriver.logging.getConsoleEntryMessage_ =
    function(entry) {
  try {
    entry.QueryInterface(Components.interfaces.nsIScriptError);
    return entry.errorMessage;
  } catch (interfaceNotSupported) {
  }
  try {
    entry.QueryInterface(Components.interfaces.nsIConsoleMessage);
    return entry.message + '\n';
  } catch (interfaceNotSupported) {
  }
  return '' + entry;
};

/**
 * Gets the log level from a browser log entry.
 *
 * @private
 * @param {!nsIConsoleMessage} entry The log entry.
 * @return {!fxdriver.logging.LogLevel} The log level.
 */
fxdriver.logging.getConsoleEntryLogLevel_ =
    function(entry) {
  try {
    entry.QueryInterface(Components.interfaces.nsIScriptError);
    if (entry.flags & entry.exceptionFlag) {
      return fxdriver.logging.LogLevel.SEVERE;
    }
    if (entry.flags & entry.warningFlag) {
      return fxdriver.logging.LogLevel.WARNING;
    }
  } catch (interfaceNotSupported) {
  }
  return fxdriver.logging.LogLevel.INFO;
};


/**
 * Formatter that return a formatted JSON log entry to write to a file given
 * a closure log record.
 *
 * @constructor
 * @extends {goog.debug.Formatter}
 */
fxdriver.logging.ClosureToLogEntryFormatter = function() {
  goog.debug.Formatter.call(this);
};
goog.inherits(fxdriver.logging.ClosureToLogEntryFormatter,
    goog.debug.Formatter);

/**
 * Formats a record as a JSON log entry.
 *
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string.
 */
fxdriver.logging.ClosureToLogEntryFormatter.prototype.formatRecord =
    function(logRecord) {
  var entry = {
    message: JSON.stringify(fxdriver.logging.formatMessage_(logRecord,
        this.showExceptionText)),
    level: fxdriver.logging.getLevelFromLogRecord_(logRecord.getLevel()).name,
    timestamp: new Date().getTime()
  };
  return JSON.stringify(entry).replace(/\n/g, ' ') + '\n';
};

/**
 * Translates goog.debug.Logger.Level to fxdriver.logging.LogLevel.
 *
 * @private
 * @param {!goog.debug.Logger.Level} level The level to lookup.
 * @return {!fxdriver.logging.LogLevel} the corresponding level in
 *     fxdriver.logging.LogLevel if found, otherwise returns
 *     fxdriver.logging.LogLevel.INFO.
 */
fxdriver.logging.getLevelFromLogRecord_ = function(level) {
  switch (level) {
    case goog.debug.Logger.Level.WARNING:
      return fxdriver.logging.LogLevel.WARNING;
    case goog.debug.Logger.Level.ERROR:
      return fxdriver.logging.LogLevel.ERROR;
    case goog.debug.Logger.Level.INFO:
      return fxdriver.logging.LogLevel.INFO;
  }
  return fxdriver.logging.LogLevel.DEBUG;
};


/**
 * Formatter that returns formatted text for display on Firefox's error console.
 *
 * @constructor
 * @extends {goog.debug.Formatter}
 */
fxdriver.logging.ClosureToConsoleFormatter = function() {
  goog.debug.Formatter.call(this);
};
goog.inherits(fxdriver.logging.ClosureToConsoleFormatter, goog.debug.Formatter);

/**
 * Formats a record as text.
 *
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string.
 */
fxdriver.logging.ClosureToConsoleFormatter.prototype.formatRecord =
    function(logRecord) {
  // Build message html
  var sb = [];
  sb.push('[WEBDRIVER] ');
  if (this.showSeverityLevel) {
    sb.push('[', logRecord.getLevel().name, '] ');
  }
  sb.push(fxdriver.logging.formatMessage_(logRecord, this.showExceptionText));
  return sb.join('');
};

/**
 * Formats a closure log record to a message.
 *
 * @private
 * @param {!goog.debug.LogRecord} logRecord The log record.
 * @param {boolean} showExceptionText Whether to show exception text.
 * @return {string} The formatted message.
 */
fxdriver.logging.formatMessage_ = function(logRecord, showExceptionText) {
  var sb = [];
  var stack = Components.stack;
  // Trial and error says that we're 8 levels deep in the stack when called.
  for (var i = 0; i < 8 && stack; i++) {
    stack = stack['caller'];
  }
  var filename = stack.filename.replace(/.*\//, '');
  sb.push(filename + ':' + stack.lineNumber + ' ');
  sb.push(logRecord.getMessage(), '\n');
  if (showExceptionText && logRecord.getException()) {
    sb.push(logRecord.getExceptionText(), '\n');
  }
  return sb.join('');
};



/**
 * Creates a new log file for the given log type and stores its location.
 *
 * @private
 * @param {!LogType} logType The log type.
 * @return {!fxdriver.files.File} The new log file.
 */
fxdriver.logging.createNewLogFile_ = function(logType) {
  var logFile = fxdriver.files.createTempFile(logType + '_log', '.txt');
  fxdriver.prefs.setCharPref(fxdriver.logging.getPrefNameLogFile_(logType),
      logFile.getFilePath());
  return logFile;
};

/**
 * Gets the log file for the given log type.
 *
 * @private
 * @param {!LogType} logType The log type.
 * @return {!fxdriver.logging.File} The log file.
 */
fxdriver.logging.getLogFile_ = function(logType) {
  var fileName = fxdriver.prefs.getCharPref(
      fxdriver.logging.getPrefNameLogFile_(logType), undefined);
  var logFile = fxdriver.files.getFile(fileName);
  if (!logFile) {
    logFile = fxdriver.logging.createNewLogFile_(logType);
  }
  return logFile;
};

/**
 * Gets log entries for the given log type.
 *
 * @private
 * @param {!LogType} logType The log type.
 * @return {!Array.<!fxdriver.logging.LogEntry>} All logged entries.
 */
fxdriver.logging.getLogFromFile_ = function(logType) {

  // TODO: There is a risk of using up all available stack space when there
  // is a large number of log entries. To prevent this from happening the
  // number of returned log entries should be divided into chunks of some
  // appropriate size, and for cases where something has been chunked off there
  // should be an indication of this at the end of the list of log entries.

  var logFile = fxdriver.logging.getLogFile_(logType);
  var fileContent = logFile.read().trim().split('\n').join(',\n');
  var result = JSON.parse('[' + fileContent + ']');
  logFile.resetBuffer();
  goog.array.forEach(result, function(entry) {
    entry.level = fxdriver.logging.LogLevel[entry.level];
  });
  return result;
};

/**
 * Sets the log level for the given log type.
 *
 * @private
 * @param {!LogLevel} logType The log type.
 * @param {string} logLevelName The log level name.
 */
fxdriver.logging.setLogLevel_ = function(logType, logLevelName) {
  fxdriver.prefs.setCharPref(fxdriver.logging.getPrefNameLogLevel_(logType),
      logLevelName);
};

/**
 * Gets the log level for the given log type. Default is INFO if no level is
 * stored for the log type.
 *
 * @private
 * @param {!LogType} logType The log type.
 * @return {!LogLevel} The log level.
 */
fxdriver.logging.getLogLevel_ = function(logType) {
  return fxdriver.logging.LogLevel[fxdriver.prefs.getCharPref(
      fxdriver.logging.getPrefNameLogLevel_(logType), 'INFO')];
};

/**
 * Gets the log level preference name for the given log type.
 *
 * @private
 * @param {!LogType} logType The log type to get the preference name for.
 * @return {string} The preference name.
 */
fxdriver.logging.getPrefNameLogLevel_ = function(logType) {
  return 'webdriver.log.' + logType + '.level';
};

/**
 * Gets the log level preference name for the given log type, or for the named
 * webdriver log file if a log type is not given.
 *
 * @private
 * @param {LogType} logType The log type to get the preference name for.
 * @return {string} The preference name.
 */
fxdriver.logging.getPrefNameLogFile_ = function(logType) {
  if (!logType) {
    return 'webdriver.log.file';
  }
  return 'webdriver.log.' + logType + '.file';
};

/**
 * Checks if logging has been initialized.
 *
 * @private
 * @return {!boolean} True if logging has been initialized.
 */
fxdriver.logging.hasConsoleListenerBeenRegistered_ = function() {
  return fxdriver.prefs.getBoolPref(
      fxdriver.logging.prefNameInitialized_, false);
};

/**
 * Sets logging to initialized.
 *
 * @private
 */
fxdriver.logging.setConsoleListenerToRegistered_ = function() {
  fxdriver.prefs.setBoolPref(fxdriver.logging.prefNameInitialized_, true);
};

/**
 * Preference name used to keep track of logging initialization which should
 * be run at most once.
 *
 * This preference acts as a guard which makes sure the protected code is only
 * run once. This is needed for some parts of the initialization. For instance,
 * there should only be one registered console listener or there will be
 * duplicated messages in the logs.
 *
 * TODO: Find a better solution that doesn't use a preference.
 *
 * @private
 * @type {string}
 */
fxdriver.logging.prefNameInitialized_ = 'webdriver.log.init';

/**
 * Stores setting to ignore the given log type.
 *
 * @private
 * @param {!LogType} logType The log type to ignore.
 */
fxdriver.logging.ignoreLogType_ = function(logType) {
  fxdriver.prefs.setBoolPref(
      fxdriver.logging.getPrefNameLogIgnore_(logType), true);
};

/**
 * Checks if the given log type should be ignored.
 *
 * @private
 * @param {!LogType} logType The log type to ignore.
 * @return {!boolean} true if the log type should be ignored, otherwise false.
 */
fxdriver.logging.shouldIgnoreLogType_ = function(logType) {
  return fxdriver.prefs.getBoolPref(
    fxdriver.logging.getPrefNameLogIgnore_(logType), false);
};

/**
 * Gets the log ignore preference name for the given log type.
 *
 * @private
 * @param {!LogType} logType The log type to get the preference name for.
 * @return {!string} The preference name.
 */
fxdriver.logging.getPrefNameLogIgnore_ = function(logType) {
  return 'webdriver.log.' + logType + '.ignore';
};

/**
 * Takes an object and attempts to discover which interfaces it implements.
 *
 * @param {*} object The object to dump.
 */
fxdriver.logging.dumpObject = function(element) {
  var msg = '=============\n';

  var rows = [];

  msg += 'Supported interfaces: ';
  for (var i in Components.interfaces) {
    try {
      var view = element.QueryInterface(Components.interfaces[i]);
      msg += i + ', ';
    } catch (e) {
      // Doesn't support the interface
    }
  }
  msg += '\n------------\n';

  try {
    fxdriver.logging.dumpProperties_(element, rows);
  } catch (ignored) {
  }

  rows.sort();
  for (var j in rows) {
    msg += rows[j] + '\n';
  }

  msg += '=============\n\n\n';
  fxdriver.logging.info(msg);
};

/**
 * @param {*} view The object to get the properties of.
 * @param {!Array.<string>} rows The place to output results to.
 * @private
 */
fxdriver.logging.dumpProperties_ = function(view, rows) {
  for (var i in view) {
    var value = '\t' + i + ': ';
    try {
      if (typeof(view[i]) == typeof(Function)) {
        value += ' function()';
      } else {
        value += String(view[i]);
      }
    } catch (e) {
      value += ' Cannot obtain value';
    }
    rows.push(value);
  }
};
