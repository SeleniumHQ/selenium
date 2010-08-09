/** @license
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


/**
 * @fileoverview Logger that logs to the firefox error console.
 */

goog.provide('webdriver.debug.Console');

goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger.Level');
goog.require('goog.debug.TextFormatter');



/**
 * Create and install a log handler that logs to the error console.
 * @constructor
 */
webdriver.debug.Console = function() {
  var Cc = Components['classes'];
  var Ci = Components['interfaces'];

  if (!Cc || !Ci) {
    // nothing sane to do
    return;
  }

  this.console_ = Cc['@mozilla.org/consoleservice;1']
          .getService(Ci['nsIConsoleService']);

  this.publishHandler_ = goog.bind(this.addLogRecord, this);
  this.formatter_ = new goog.debug.TextFormatter();
  this.isCapturing_ = false;
};


/**
 * Returns the text formatter used by this console
 * @return {goog.debug.TextFormatter} The text formatter.
 */
webdriver.debug.Console.prototype.getFormatter = function() {
  return this.formatter_;
};


/**
 * Sets whether we are currently capturing logger output.
 * @param {boolean} capturing Whether to capture logger output.
 */
webdriver.debug.Console.prototype.setCapturing = function(capturing) {
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
webdriver.debug.Console.prototype.addLogRecord = function(logRecord) {
  var record = this.formatter_.formatRecord(logRecord);

  if (this.console_.logStringMessage) {
    // The call depth from the calling site 6
    var stack = Components.stack;
    for (var i = 0; i < 6 && stack; i++) {
      stack = stack.caller;
    }

    var filename = stack ? stack.filename.replace(/.*\//, '') : 'unknown';
    var line = stack ? stack.lineNumber : 'xx';
    this.console_.logStringMessage(filename + ":" + line  + " - " +
                       record);
  }
};

if (Components && Components.classes && !webdriver.debug.Console.instance) {
  webdriver.debug.Console.instance = new webdriver.debug.Console();
}
if (webdriver.debug.Console.instance) {
  webdriver.debug.Console.instance.setCapturing(true);
}
