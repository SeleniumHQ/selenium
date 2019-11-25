// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Simple logger that logs to the window console if available.
 *
 * Has an autoInstall option which can be put into initialization code, which
 * will start logging if "Debug=true" is in document.location.href
 *
 */

goog.provide('goog.debug.Console');

goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.debug.TextFormatter');



/**
 * Create and install a log handler that logs to window.console if available
 * @constructor
 */
goog.debug.Console = function() {
  this.publishHandler_ = goog.bind(this.addLogRecord, this);

  /**
   * Formatter for formatted output.
   * @type {!goog.debug.TextFormatter}
   * @private
   */
  this.formatter_ = new goog.debug.TextFormatter();
  this.formatter_.showAbsoluteTime = false;
  this.formatter_.showExceptionText = false;
  // The console logging methods automatically append a newline.
  this.formatter_.appendNewline = false;

  this.isCapturing_ = false;
  this.logBuffer_ = '';

  /**
   * Loggers that we shouldn't output.
   * @type {!Object<boolean>}
   * @private
   */
  this.filteredLoggers_ = {};
};


/**
 * Returns the text formatter used by this console
 * @return {!goog.debug.TextFormatter} The text formatter.
 */
goog.debug.Console.prototype.getFormatter = function() {
  return this.formatter_;
};


/**
 * Sets whether we are currently capturing logger output.
 * @param {boolean} capturing Whether to capture logger output.
 */
goog.debug.Console.prototype.setCapturing = function(capturing) {
  if (capturing == this.isCapturing_) {
    return;
  }

  // attach or detach handler from the root logger
  var rootLogger = goog.debug.LogManager.getRoot();
  if (capturing) {
    rootLogger.addHandler(this.publishHandler_);
  } else {
    rootLogger.removeHandler(this.publishHandler_);
    this.logBuffer = '';
  }
  this.isCapturing_ = capturing;
};


/**
 * Adds a log record.
 * @param {goog.debug.LogRecord} logRecord The log entry.
 */
goog.debug.Console.prototype.addLogRecord = function(logRecord) {

  // Check to see if the log record is filtered or not.
  if (this.filteredLoggers_[logRecord.getLoggerName()]) {
    return;
  }

  var record = this.formatter_.formatRecord(logRecord);
  var console = goog.debug.Console.console_;
  if (console) {
    switch (logRecord.getLevel()) {
      case goog.debug.Logger.Level.SHOUT:
        goog.debug.Console.logToConsole_(console, 'info', record);
        break;
      case goog.debug.Logger.Level.SEVERE:
        goog.debug.Console.logToConsole_(console, 'error', record);
        break;
      case goog.debug.Logger.Level.WARNING:
        goog.debug.Console.logToConsole_(console, 'warn', record);
        break;
      default:
        goog.debug.Console.logToConsole_(console, 'debug', record);
        break;
    }
  } else {
    this.logBuffer_ += record;
  }
};


/**
 * Adds a logger name to be filtered.
 * @param {string} loggerName the logger name to add.
 */
goog.debug.Console.prototype.addFilter = function(loggerName) {
  this.filteredLoggers_[loggerName] = true;
};


/**
 * Removes a logger name to be filtered.
 * @param {string} loggerName the logger name to remove.
 */
goog.debug.Console.prototype.removeFilter = function(loggerName) {
  delete this.filteredLoggers_[loggerName];
};


/**
 * Global console logger instance
 * @type {goog.debug.Console}
 */
goog.debug.Console.instance = null;


/**
 * The console to which to log.  This is a property so it can be mocked out in
 * this unit test for goog.debug.Console. Using goog.global, as console might be
 * used in window-less contexts.
 * @type {!{log:!Function}}
 * @private
 */
goog.debug.Console.console_ = goog.global['console'];


/**
 * Sets the console to which to log.
 * @param {!Object} console The console to which to log.
 */
goog.debug.Console.setConsole = function(console) {
  goog.debug.Console.console_ = /** @type {!{log:!Function}} */ (console);
};


/**
 * Install the console and start capturing if "Debug=true" is in the page URL
 */
goog.debug.Console.autoInstall = function() {
  if (!goog.debug.Console.instance) {
    goog.debug.Console.instance = new goog.debug.Console();
  }

  if (goog.global.location &&
      goog.global.location.href.indexOf('Debug=true') != -1) {
    goog.debug.Console.instance.setCapturing(true);
  }
};


/**
 * Show an alert with all of the captured debug information.
 * Information is only captured if console is not available
 */
goog.debug.Console.show = function() {
  alert(goog.debug.Console.instance.logBuffer_);
};


/**
 * Logs the record to the console using the given function.  If the function is
 * not available on the console object, the log function is used instead.
 * @param {!{log:!Function}} console The console object.
 * @param {string} fnName The name of the function to use.
 * @param {string} record The record to log.
 * @private
 */
goog.debug.Console.logToConsole_ = function(console, fnName, record) {
  if (console[fnName]) {
    console[fnName](record);
  } else {
    console.log(record);
  }
};
