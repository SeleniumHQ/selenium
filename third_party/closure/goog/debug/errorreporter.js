// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview Definition of the ErrorReporter class, which creates an error
 * handler that reports any errors raised to a URL.
 *
 */

goog.provide('goog.debug.ErrorReporter');

goog.require('goog.Uri');
goog.require('goog.debug.ErrorHandler');
goog.require('goog.events');
goog.require('goog.net.XhrIo');
goog.require('goog.string');



/**
 * Constructs an error reporter. Internal Use Only. To install an error reporter
 * see the {@see #install} method below.
 *
 * @param {string} handlerUrl The URL to which all errors will be reported.
 * @constructor
 */
goog.debug.ErrorReporter = function(handlerUrl) {
  /**
   * The URL at which all errors caught by this handler will be logged.
   *
   * @type {string}
   * @private
   */
  this.handlerUrl_ = handlerUrl;

  this.setup_();
};


/**
 * The internal error handler used to catch all errors.
 *
 * @type {goog.debug.ErrorHandler}
 * @private
 */
goog.debug.ErrorReporter.prototype.errorHandler_ = null;


/**
 * Logging object.
 *
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.ErrorReporter.logger_ =
    goog.debug.Logger.getLogger('goog.debug.ErrorReporter');


/**
 * Installs an error reporter to catch all JavaScript errors raised.
 *
 * @param {string} loggingUrl The URL to which the errors caught will be
 *   reported.
 * @return {goog.debug.ErrorReporter} The error reporter.
 */
goog.debug.ErrorReporter.install = function(loggingUrl) {
  var instance = new goog.debug.ErrorReporter(loggingUrl);
  return instance;
};


/**
 * Sets up the error reporter.
 * @private
 */
goog.debug.ErrorReporter.prototype.setup_ = function() {
  if (goog.userAgent.IE) {
    // Use "onerror" because caught exceptions in IE don't provide line number.
    goog.debug.catchErrors(
        goog.bind(this.handleException_, this), false, null);
  } else {
    // "onerror" doesn't work with FF2 or Chrome
    this.errorHandler_ = new goog.debug.ErrorHandler(
        goog.bind(this.handleException_, this));

    this.errorHandler_.protectWindowSetTimeout();
    this.errorHandler_.protectWindowSetInterval();
    goog.events.protectBrowserEventEntryPoint(this.errorHandler_);
    goog.net.XhrIo.protectEntryPoints(this.errorHandler_);
  }
};


/**
 * Handler for caught exceptions. Sends report to the LoggingServlet.
 *
 * @param {Error} e The exception.
 * @private
 */
goog.debug.ErrorReporter.prototype.handleException_ = function(e) {
  var error = goog.debug.normalizeErrorObject(e);

  // Make sure when handling exceptions that the error file name contains only
  // the basename (e.g. "file.js"). goog.debug.catchErrors does this stripping,
  // but goog.debug.ErrorHandler.protectEntryPoint does not.
  var baseName = String(error.fileName).split(/[\/\\]/).pop();

  this.sendErrorReport(error.message, baseName, error.lineNumber);
};


/**
 * Sends an error report to the logging URL.
 *
 * @param {string} message Error description.
 * @param {string} fileName URL of the JavaScript file with the error.
 * @param {number} line Line number of the error.
 */
goog.debug.ErrorReporter.prototype.sendErrorReport =
    function(message, fileName, line) {
  try {
    // Create the logging URL.
    var requestUrl = new goog.Uri(this.handlerUrl_);
    requestUrl.setParameterValue('script', fileName);
    requestUrl.setParameterValue('error', message);
    requestUrl.setParameterValue('line', line);

    // Send the request with the contents of the error.
    goog.net.XhrIo.send(requestUrl.toString());
  } catch (e) {
    var logMessage = goog.string.buildString(
        'Error occurred in sending an error report.\n\n',
        'script:', fileName, '\n',
        'line:', line, '\n',
        'error:', message);
    goog.debug.ErrorReporter.logger_.info(logMessage);
  }
};
