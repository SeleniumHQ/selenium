// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/** @fileoverview Defines logging for the Firefox driver. */

goog.provide('fxdriver.logging');

goog.require('fxdriver.files.File');
goog.require('fxdriver.prefs');
goog.require('goog.array');
goog.require('goog.debug.TextFormatter');
goog.require('goog.log');
goog.require('goog.object');
goog.require('goog.string');
goog.require('webdriver.logging');



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
 * @param {string} name The logger name.
 * @returns {goog.log.Logger} The logger, or {@code null} if logging is
 *     disabled for the current build.
 * @see goog.log.getLogger
 */
fxdriver.logging.getLogger = function(name) {
  fxdriver.logging.initialize_();
  return goog.log.getLogger(name);
};


/**
 * Logs a message on the given log level and for the given type.
 *
 * @param {string} logType The log type to use.
 * @param {!webdriver.logging.Level} logLevel The log level to use.
 * @param {string} message The message to log.
 */
fxdriver.logging.log = function(logType, logLevel, message) {
  fxdriver.logging.initialize_();
  if (typeof(message) != 'string') {
    message = JSON.stringify(message);
  }
  var logFile = fxdriver.logging.getLogFile_(logType);
  var entry = new webdriver.logging.Entry(
      logLevel.name, message, goog.now(), logType);
  var logEntryStr = JSON.stringify(entry);
  logEntryStr = logEntryStr.replace(/\n/g, ' ');
  logFile.append(logEntryStr + '\n');
};


/**
 * Get log entries for a given log type.
 *
 * @param {string} logType The log type.
 * @return {!Array.<!webdriver.logging.Entry>} The log entries for the type.
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
  goog.object.forEach(fxdriver.logging.LogType, function(value) {
    if (!fxdriver.logging.shouldIgnoreLogType_(value)) {
      result.push(value);
    }
  });
  return result;
};


/**
 * Configures logging using logging preferences.
 *
 * @param {(string|!webdriver.logging.Preferences)=} logging_prefs
 *   The preferences to use.
 * @param {boolean} enable_profiler Whether to collect profiler log.
 */
fxdriver.logging.configure = function(logging_prefs, enable_profiler) {
  fxdriver.logging.initialize_();

  if (goog.isString(logging_prefs)) {
    logging_prefs = JSON.parse(logging_prefs);
  }
  goog.object.forEach(logging_prefs, function(logLevel, logType) {
    if (logLevel == webdriver.logging.Level.OFF.name) {
      fxdriver.logging.ignoreLogType_(logType);
    } else {
      fxdriver.logging.setLogLevel_(logType, logLevel);
    }
  });

  if (!enable_profiler) {
    fxdriver.logging.ignoreLogType_(fxdriver.logging.LogType.PROFILER);
  }
};


/**
 * Component initialization guard.
 * @private {!boolean}
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

  var rootLogger = goog.log.getLogger('');
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

  var array = {};
  var existingEntries = consoleService.getMessageArray(array, {}) || array.value || [];

  goog.array.forEach(existingEntries, function(consoleEntry) {
    file.append(formatter.formatConsoleEntry(consoleEntry));
  });

  // add console listener
  var filter = new fxdriver.logging.ConsoleToLogEntryFilter();
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
 * @param {goog.log.Logger} logger The logger to use.
 * @private
 */
fxdriver.logging.addClosureToConsoleLogger_ = function(logger) {
  var consoleService = Components.classes['@mozilla.org/consoleservice;1']
      .getService(Components.interfaces['nsIConsoleService']);
  goog.log.addHandler(logger, function(logRecord) {
    var sb = [];
    sb.push('[WEBDRIVER] ');
    sb.push('[', logRecord.getLevel().name, '] ');
    sb.push('[', logRecord.getLoggerName(), '] ');
    sb.push(logRecord.getMessage(), '\n');
    if (logRecord.getException()) {
      sb.push(logRecord.getException().message, '\n');
    }
    consoleService.logStringMessage(sb.join(''));
  });
};


/**
 * Adds a log handler to the logger that will record to a log file.
 *
 * @param {goog.log.Logger} logger The logger to use.
 * @private
 */
fxdriver.logging.addClosureToFileLogger_ = function(logger) {
  var filePath = fxdriver.prefs.getCharPref(
      fxdriver.logging.getPrefNameLogFile_(), undefined);
  if (!filePath) {
    return;
  }
  var formatter = new goog.debug.TextFormatter('webdriver');

  if ('/dev/stdout' == filePath) {
    goog.log.addHandler(logger, function(logRecord) {
      dump(formatter.formatRecord(logRecord));
    });
    return;
  }

  var file = fxdriver.files.getFile(filePath);
  goog.log.addHandler(logger, function(logRecord) {
    file.append(formatter.formatRecord(logRecord));
  });
};


/**
 * Adds a log handler to the logger that records log entries to a temporary
 * file using the log entry format of the wire protocol.
 *
 * @param {goog.log.Logger} logger The logger to use.
 * @private
 */
fxdriver.logging.addClosureToDriverFileLogger_ = function(logger) {
  var file = fxdriver.logging.getLogFile_(fxdriver.logging.LogType.DRIVER);
  goog.log.addHandler(logger, function(logRecord) {
    var entry = webdriver.logging.Entry.fromClosureLogRecord(logRecord);
    file.append(JSON.stringify(entry).replace(/\n/g, ' ') + '\n');
  });
};



/**
 * Filter log entries based on the log level set for the given log type.
 *
 * @param {string} logType The log type.
 * @param {!Array.<!webdriver.logging.Entry>} logEntries The log entries.
 * @return {!Array.<!webdriver.logging.Entry>} The filtered log entries.
 * @private
 */
fxdriver.logging.filterLogEntries_ = function(logType, logEntries) {
  var logLevel = fxdriver.logging.getLogLevel_(logType);
  return goog.array.filter(logEntries, function(entry) {
    return entry.level.value >= logLevel.value;
  });
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
 * @return {boolean} Whether this entry should be excluded.
 */
fxdriver.logging.ConsoleToLogEntryFilter.prototype.excludeConsoleEntry =
    function(consoleEntry) {
  var msg = fxdriver.logging.getConsoleEntryMessage_(consoleEntry);
  return goog.string.startsWith(msg, '[WEBDRIVER] ');
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
  var entry = new webdriver.logging.Entry(
      fxdriver.logging.getConsoleEntryLogLevel_(consoleEntry),
      fxdriver.logging.getConsoleEntryMessage_(consoleEntry));
  return JSON.stringify(entry).replace(/\n/g, ' ') + '\n';
};


/**
 * Gets the message from a browser log entry.
 *
 * @private
 * @param {!nsIConsoleMessage} entry The log entry.
 * @return {string} The message.
 */
fxdriver.logging.getConsoleEntryMessage_ = function(entry) {
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
 * @return {!webdriver.logging.Level} The log level.
 */
fxdriver.logging.getConsoleEntryLogLevel_ = function(entry) {
  try {
    entry.QueryInterface(Components.interfaces.nsIScriptError);
    if (entry.flags & entry.exceptionFlag) {
      return webdriver.logging.Level.SEVERE;
    }
    if (entry.flags & entry.warningFlag) {
      return webdriver.logging.Level.WARNING;
    }
  } catch (interfaceNotSupported) {
  }
  return webdriver.logging.Level.INFO;
};


/**
 * Creates a new log file for the given log type and stores its location.
 *
 * @private
 * @param {string} logType The log type.
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
 * @param {string} logType The log type.
 * @return {!fxdriver.files.File} The log file.
 * @private
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
 * @param {string} logType The log type.
 * @return {!Array.<!webdriver.logging.Entry>} All logged entries.
 * @private
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
    entry.level = webdriver.logging.getLevel(entry.level);
  });
  return result;
};


/**
 * Sets the log level for the given log type.
 *
 * @param {string} logType The log type.
 * @param {string} logLevelName The log level name.
 * @private
 */
fxdriver.logging.setLogLevel_ = function(logType, logLevelName) {
  fxdriver.prefs.setCharPref(fxdriver.logging.getPrefNameLogLevel_(logType),
      logLevelName);
};


/**
 * Gets the log level for the given log type. Default is INFO if no level is
 * stored for the log type.
 *
 * @param {string} logType The log type.
 * @return {!webdriver.logging.Level} The log level.
 * @private
 */
fxdriver.logging.getLogLevel_ = function(logType) {
  var name = fxdriver.prefs.getCharPref(
      fxdriver.logging.getPrefNameLogLevel_(logType), 'INFO');
  return webdriver.logging.getLevel(name);
};


/**
 * Gets the log level preference name for the given log type.
 *
 * @param {!string} logType The log type to get the preference name for.
 * @return {string} The preference name.
 * @private
 */
fxdriver.logging.getPrefNameLogLevel_ = function(logType) {
  return 'webdriver.log.' + logType + '.level';
};


/**
 * Gets the log level preference name for the given log type, or for the named
 * webdriver log file if a log type is not given.
 *
 * @param {string=} opt_logType The log type to get the preference name for.
 * @return {string} The preference name.
 * @private
 */
fxdriver.logging.getPrefNameLogFile_ = function(opt_logType) {
  if (!opt_logType) {
    return 'webdriver.log.file';
  }
  return 'webdriver.log.' + opt_logType + '.file';
};


/**
 * Checks if logging has been initialized.
 *
 * @return {boolean} Whether logging has been initialized.
 * @private
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
 * @private {string}
 */
fxdriver.logging.prefNameInitialized_ = 'webdriver.log.init';


/**
 * Stores setting to ignore the given log type.
 *
 * @param {string} logType The log type to ignore.
 * @private
 */
fxdriver.logging.ignoreLogType_ = function(logType) {
  fxdriver.prefs.setBoolPref(
      fxdriver.logging.getPrefNameLogIgnore_(logType), true);
};


/**
 * Checks if the given log type should be ignored.
 *
 * @param {string} logType The log type to ignore.
 * @return {boolean} true if the log type should be ignored, otherwise false.
 * @private
 */
fxdriver.logging.shouldIgnoreLogType_ = function(logType) {
  return fxdriver.prefs.getBoolPref(
    fxdriver.logging.getPrefNameLogIgnore_(logType), false);
};


/**
 * Gets the log ignore preference name for the given log type.
 *
 * @param {string} logType The log type to get the preference name for.
 * @return {string} The preference name.
 * @private
 */
fxdriver.logging.getPrefNameLogIgnore_ = function(logType) {
  return 'webdriver.log.' + logType + '.ignore';
};


/**
 * Takes an object and attempts to discover which interfaces it implements.
 *
 * @param {*} element The object to dump.
 */
fxdriver.logging.dumpObject = function(element) {
  var msg = '=============\n';

  var rows = [];

  msg += 'Supported interfaces: ';
  goog.object.forEach(Components.interfaces, function(i) {
    try {
      var view = element.QueryInterface(Components.interfaces[i]);
      msg += i + ', ';
    } catch (e) {
      // Doesn't support the interface
    }
  });
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
  goog.log.info(fxdriver.logging.driverLogger_, msg);
};


/**
 * @param {*} view The object to get the properties of.
 * @param {!Array.<string>} rows The place to output results to.
 * @private
 */
fxdriver.logging.dumpProperties_ = function(view, rows) {
  goog.object.forEach(view, function(value, key) {
    var entry = '\t' + key + ': ';
    if (typeof value === 'function') {
      entry += ' function()';
    } else {
      entry += key;
    }
    rows.push(entry);
  });
};
