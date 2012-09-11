// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the ErrorReporter class, which creates an error
 * handler that reports any errors raised to a URL.
 *
 */

goog.provide('goog.debug.ErrorReporter');
goog.provide('goog.debug.ErrorReporter.ExceptionEvent');

goog.require('goog.debug');
goog.require('goog.debug.ErrorHandler');
goog.require('goog.debug.Logger');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.net.XhrIo');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.uri.utils');
goog.require('goog.userAgent');



/**
 * Constructs an error reporter. Internal Use Only. To install an error
 * reporter see the {@see #install} method below.
 *
 * @param {string} handlerUrl The URL to which all errors will be reported.
 * @param {function(!Error, !Object.<string, string>)=}
 *     opt_contextProvider When a report is to be sent to the server,
 *     this method will be called, and given an opportunity to modify the
 *     context object before submission to the server.
 * @param {boolean=} opt_noAutoProtect Whether to automatically add handlers for
 *     onerror and to protect entry points.  If apps have other error reporting
 *     facilities, it may make sense for them to set these up themselves and use
 *     the ErrorReporter just for transmission of reports.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.debug.ErrorReporter = function(
    handlerUrl, opt_contextProvider, opt_noAutoProtect) {
  /**
   * Context provider, if one was provided.
   * @type {?function(!Error, !Object.<string, string>)}
   * @private
   */
  this.contextProvider_ = opt_contextProvider || null;

  /**
   * XHR sender.
   * @type {function(string, string, string, (Object|goog.structs.Map)=)}
   * @private
   */
  this.xhrSender_ = goog.debug.ErrorReporter.defaultXhrSender;

  /**
   * The URL at which all errors caught by this handler will be logged.
   *
   * @type {string}
   * @private
   */
  this.handlerUrl_ = handlerUrl;

  if (!opt_noAutoProtect) {
    this.setup_();
  }
};
goog.inherits(goog.debug.ErrorReporter, goog.events.EventTarget);



/**
 * Event broadcast when an exception is logged.
 * @param {Error} error The exception that was was reported.
 * @param {!Object.<string, string>} context The context values sent to the
 *     server alongside this error.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.debug.ErrorReporter.ExceptionEvent = function(error, context) {
  goog.events.Event.call(this, goog.debug.ErrorReporter.ExceptionEvent.TYPE);

  /**
   * The error that was reported.
   * @type {Error}
   */
  this.error = error;

  /**
   * Context values sent to the server alongside this report.
   * @type {!Object.<string, string>}
   */
  this.context = context;
};
goog.inherits(goog.debug.ErrorReporter.ExceptionEvent, goog.events.Event);


/**
 * Event type for notifying of a logged exception.
 * @type {string}
 */
goog.debug.ErrorReporter.ExceptionEvent.TYPE =
    goog.events.getUniqueId('exception');


/**
 * The internal error handler used to catch all errors.
 *
 * @type {goog.debug.ErrorHandler}
 * @private
 */
goog.debug.ErrorReporter.prototype.errorHandler_ = null;


/**
 * Extra headers for the error-reporting XHR.
 * @type {Object|goog.structs.Map|undefined}
 * @private
 */
goog.debug.ErrorReporter.prototype.extraHeaders_;


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
 *     reported.
 * @param {function(!Error, !Object.<string, string>)=}
 *     opt_contextProvider When a report is to be sent to the server,
 *     this method will be called, and given an opportunity to modify the
 *     context object before submission to the server.
 * @param {boolean=} opt_noAutoProtect Whether to automatically add handlers for
 *     onerror and to protect entry points.  If apps have other error reporting
 *     facilities, it may make sense for them to set these up themselves and use
 *     the ErrorReporter just for transmission of reports.
 * @return {goog.debug.ErrorReporter} The error reporter.
 */
goog.debug.ErrorReporter.install = function(
    loggingUrl, opt_contextProvider, opt_noAutoProtect) {
  var instance = new goog.debug.ErrorReporter(
      loggingUrl, opt_contextProvider, opt_noAutoProtect);
  return instance;
};


/**
 * Default implemntation of XHR sender interface.
 *
 * @param {string} uri URI to make request to.
 * @param {string} method Send method.
 * @param {string} content Post data.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 */
goog.debug.ErrorReporter.defaultXhrSender = function(uri, method, content,
    opt_headers) {
  goog.net.XhrIo.send(uri, null, method, content, opt_headers);
};


/**
 * Installs exception protection for an entry point function in addition
 * to those that are protected by default.
 * Has no effect in IE because window.onerror is used for reporting
 * exceptions in that case.
 *
 * @param {Function} fn An entry point function to be protected.
 * @return {Function} A protected wrapper function that calls the entry point
 *     function or null if the entry point could not be protected.
 */
goog.debug.ErrorReporter.prototype.protectAdditionalEntryPoint = function(fn) {
  if (this.errorHandler_) {
    return this.errorHandler_.protectEntryPoint(fn);
  }
  return null;
};


/**
 * Add headers to the logging url.
 * @param {Object|goog.structs.Map} loggingHeaders Extra headers to send
 *     to the logging URL.
 */
goog.debug.ErrorReporter.prototype.setLoggingHeaders =
    function(loggingHeaders) {
  this.extraHeaders_ = loggingHeaders;
};


/**
 * Set the function used to send error reports to the server.
 * @param {function(string, string, string, (Object|goog.structs.Map)=)}
 *     xhrSender If provided, this will be used to send a report to the
 *     server instead of the default method. The function will be given the URI,
 *     HTTP method request content, and (optionally) request headers to be
 *     added.
 */
goog.debug.ErrorReporter.prototype.setXhrSender = function(xhrSender) {
  this.xhrSender_ = xhrSender;
};


/**
 * Sets up the error reporter.
 *
 * @private
 */
goog.debug.ErrorReporter.prototype.setup_ = function() {
  if (goog.userAgent.IE) {
    // Use "onerror" because caught exceptions in IE don't provide line number.
    goog.debug.catchErrors(
        goog.bind(this.handleException, this), false, null);
  } else {
    // "onerror" doesn't work with FF2 or Chrome
    this.errorHandler_ = new goog.debug.ErrorHandler(
        goog.bind(this.handleException, this));

    this.errorHandler_.protectWindowSetTimeout();
    this.errorHandler_.protectWindowSetInterval();
    goog.debug.entryPointRegistry.monitorAll(this.errorHandler_);
  }
};


/**
 * Handler for caught exceptions. Sends report to the LoggingServlet and
 * notifies any listeners.
 *
 * @param {Object} e The exception.
 * @param {!Object.<string, string>=} opt_context Context values to optionally
 *     include in the error report.
 */
goog.debug.ErrorReporter.prototype.handleException = function(e,
    opt_context) {
  var error = (/** @type {!Error} */ goog.debug.normalizeErrorObject(e));

  // Construct the context, possibly from the one provided in the argument, and
  // pass it to the context provider if there is one.
  var context = opt_context ? goog.object.clone(opt_context) : {};
  if (this.contextProvider_) {
    try {
      this.contextProvider_(error, context);
    } catch (err) {
      goog.debug.ErrorReporter.logger_.severe('Context provider threw an ' +
          'exception: ' + err.message);
    }
  }
  this.sendErrorReport(error.message, error.fileName, error.lineNumber,
      error.stack, context);

  try {
    this.dispatchEvent(
        new goog.debug.ErrorReporter.ExceptionEvent(error, context));
  } catch (ex) {
    // Swallow exception to avoid infinite recursion.
  }
};


/**
 * Sends an error report to the logging URL.  This will not consult the context
 * provider, the report will be sent exactly as specified.
 *
 * @param {string} message Error description.
 * @param {string} fileName URL of the JavaScript file with the error.
 * @param {number} line Line number of the error.
 * @param {string=} opt_trace Call stack trace of the error.
 * @param {!Object.<string, string>=} opt_context Context information to include
 *     in the request.
 */
goog.debug.ErrorReporter.prototype.sendErrorReport =
    function(message, fileName, line, opt_trace, opt_context) {
  try {
    // Create the logging URL.
    var requestUrl = goog.uri.utils.appendParams(this.handlerUrl_,
        'script', fileName, 'error', message, 'line', line);
    var queryMap = {};
    queryMap['trace'] = opt_trace;

    // Copy context into query data map
    if (opt_context) {
      for (var entry in opt_context) {
        queryMap['context.' + entry] = opt_context[entry];
      }
    }

    // Copy query data map into request.
    var queryData = goog.uri.utils.buildQueryDataFromMap(queryMap);

    // Send the request with the contents of the error.
    this.xhrSender_(requestUrl, 'POST', queryData, this.extraHeaders_);
  } catch (e) {
    var logMessage = goog.string.buildString(
        'Error occurred in sending an error report.\n\n',
        'script:', fileName, '\n',
        'line:', line, '\n',
        'error:', message, '\n',
        'trace:', opt_trace);
    goog.debug.ErrorReporter.logger_.info(logMessage);
  }
};


/** @override */
goog.debug.ErrorReporter.prototype.disposeInternal = function() {
  goog.dispose(this.errorHandler_);
  goog.base(this, 'disposeInternal');
};
