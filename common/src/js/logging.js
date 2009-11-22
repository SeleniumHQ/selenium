/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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
 * @fileoverview Defines a logging API that logs to a DOM on the current page as
 *     well as the Firebug console.
 * @author jmelyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.logging');
goog.provide('webdriver.logging.Level');

goog.require('goog.dom');
goog.require('goog.string');


/**
 * Represents a level that can be used to filter log messages.
 * @param {number} code Numeric value for this level.
 * @param {string} firebugLogFnName The name of the firebug function to use for
 *    logging messages at this level to the console.
 * @param {string} domColor The color string to use for logging messages to the
 *    DOM at this level.
 * @constructor
 */
webdriver.logging.Level = function(code, firebugLogFnName, domColor) {
  this.code = code;
  this.firebugLogFnName = firebugLogFnName;
  this.domColor = domColor;
};


webdriver.logging.Level.ERROR = new webdriver.logging.Level(0, 'error', 'red');
webdriver.logging.Level.WARN = new webdriver.logging.Level(1, 'warn', 'orange');
webdriver.logging.Level.INFO = new webdriver.logging.Level(2, 'info', 'black');
webdriver.logging.Level.DEBUG = new webdriver.logging.Level(3, 'debug', 'gray');


/**
 * A reference to the Firebug console.  Will be undefined if the current browser
 * does not have Firebug installed (or if the current browser is not Firefox).
 * @type {?Object}
 * @private
 */
webdriver.logging.console_ = window['console'];


/**
 * Whether to log to the Firebug console if it is available.
 * @type {boolean}
 * @private
 */
webdriver.logging.firebugLogging_ = false;


/**
 * Whether to log messages to the DOM.
 * @type {boolean}
 * @private
 */
webdriver.logging.domLogging_ = true;


/**
 * The current logging level.  Messages below this level will not be logged.
 * @type {webdriver.logging.Level}
 * @private
 */
webdriver.logging.currentLevel_ = webdriver.logging.Level.INFO;


/**
 * @param {boolean} enable Whether to enable logging to the Firebug console.
 */
webdriver.logging.enableFirebugLogging = function(enable) {
  webdriver.logging.firebugLogging_ = enable;
};


/**
 * @param {boolean} enable Whether to enable logging to the DOM.
 */
webdriver.logging.enableDomLogging = function(enable) {
  webdriver.logging.domLogging_ = enable;
};


/**
 * @param {webdriver.logging.Level} newLevel The new level to filter messages
 *     by.
 */
webdriver.logging.setLevel = function (newLevel) {
  webdriver.logging.currentLevel_ = newLevel;
};


/**
 * Clears all log messages.
 */
webdriver.logging.clear = function() {
  if (webdriver.logging.div_) {
    goog.dom.setTextContent(webdriver.logging.div_, '');
  }

  if (webdriver.logging.firebugLogging_ &&
      webdriver.logging.console_ &&
      goog.isFunction(webdriver.logging.console_['clear'])) {
    webdriver.logging.console_['clear']();
  }
};


/**
 * Utility function for logging status messages.
 * @param {string} msg The message to log.
 * @param {?webdriver.logging.Level} opt_logLevel The level to log the message
 *     at. Defaults to {@code webdriver.LogLevel.INFO}.
 */
webdriver.logging.log = function(msg, opt_logLevel) {
  var logLevel = opt_logLevel || webdriver.logging.Level.INFO;
  if (logLevel.code > webdriver.logging.currentLevel_.code) {
    return;
  }

  msg = '[' + goog.now() + ']: ' + msg;

  if (webdriver.logging.firebugLogging_) {
    var consoleLoggerFn = webdriver.logging.console_ ?
        (webdriver.logging.console_[logLevel.firebugLogFnName] ||
         webdriver.logging.console_['log']) : null;
    if (goog.isFunction(consoleLoggerFn)) {
      consoleLoggerFn(msg);
    }
  }

  if (!webdriver.logging.domLogging_) {
    return;
  }

  if (!webdriver.logging.div_) {
    webdriver.logging.div_ = goog.dom.createDom('DIV', {
      style: 'border: 1px solid black; margin: 3px; padding: 3px'
    });
    goog.dom.appendChild(goog.dom.getDocument().body, webdriver.logging.div_);
  }

  var logRecord = goog.dom.createDom('DIV', {
    style: ('font-family: Courier; font-size: 9pt; ' +
            'color: ' + logLevel.domColor + ';' +
            'border-top: 1px solid silver;')
  });
  logRecord.innerHTML = webdriver.logging.jsStringToHtml(msg);
  goog.dom.appendChild(webdriver.logging.div_, logRecord);
};


/**
 * Escapes a JavaScript string so it can be inserted as HTML.
 * - Converts newlines to BR tags
 * - Replaces all whitespace with {@code nbsp;}
 * - Escapes all appropriate characters with HTML entities (&lt;, &gt;, etc.)
 * @param {string} str The string to convert to HTML.
 * @return {string} The converted string.
 */
webdriver.logging.jsStringToHtml = function(str) {
  str = goog.string.canonicalizeNewlines(str);
  str = goog.string.htmlEscape(str);
  return str.replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;');
};


/**
 * An alias for {@code webdriver.logging.log} used to log messages at the
 * {@code DEBUG} level.
 * @param {string} message The message to log.
 */
webdriver.logging.debug = function(message) {
  webdriver.logging.log(message, webdriver.logging.Level.DEBUG);
};


/**
 * An alias for {@code webdriver.logging.log} used to log messages at the
 * {@code INFO} level.
 * @param {string} message The message to log.
 */
webdriver.logging.info = function(message) {
  webdriver.logging.log(message, webdriver.logging.Level.INFO);
};


/**
 * An alias for {@code webdriver.logging.log} used to log messages at the
 * {@code WARN} level.
 * @param {string} message The message to log.
 */
webdriver.logging.warn = function(message) {
  webdriver.logging.log(message, webdriver.logging.Level.WARN);
};


/**
 * An alias for {@code webdriver.logging.log} used to log messages at the
 * {@code ERROR} level.
 * @param {string} message The message to log.
 */
webdriver.logging.error = function(message) {
  webdriver.logging.log(message, webdriver.logging.Level.ERROR);
};


/**
 * Utility function for recursively describing all of the properties in an
 * object using a DFS traversal.
 * @param {*} obj The object to describe.
 * @param {string} opt_indent Indentation for the current DFS level.
 * @return {string} The object description.
 */
webdriver.logging.describe = function(obj, opt_indent) {
  var indent = opt_indent || '';
  var msgLines = [];
  if (goog.isString(obj)) {
    msgLines.push(indent + ' (' + goog.typeOf(obj) + ') ' + obj);
  } else {
    for (var prop in obj) {
      msgLines.push(
        indent + prop + ': (' + goog.typeOf(obj[prop]) + ') ' + obj[prop]);
      if (goog.isObject(obj[prop]) && !goog.isFunction(obj[prop]) &&
          goog.isArray(obj[prop])) {
        msgLines.push(webdriver.logging.describe(obj[prop], indent + '  '));
      }
    };
  }
  return msgLines.join('\n');
};
