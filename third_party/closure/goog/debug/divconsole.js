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
 * @fileoverview Simple logger that logs a Div Element.
 *
 */

goog.provide('goog.debug.DivConsole');

goog.require('goog.debug.HtmlFormatter');
goog.require('goog.debug.LogManager');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.html.SafeHtml');
goog.require('goog.style');



/**
 * A class for visualising logger calls in a div element.
 * @param {Element} element The element to append to.
 * @constructor
 */
goog.debug.DivConsole = function(element) {
  this.publishHandler_ = goog.bind(this.addLogRecord, this);
  this.formatter_ = new goog.debug.HtmlFormatter();
  this.formatter_.showAbsoluteTime = false;
  this.isCapturing_ = false;
  this.element_ = element;
  this.elementOwnerDocument_ =
      this.element_.ownerDocument || this.element_.document;

  this.installStyles();
};


/**
 * Installs styles for the log messages and its div
 */
goog.debug.DivConsole.prototype.installStyles = function() {
  goog.style.installStyles(
      '.dbg-sev{color:#F00}' +
      '.dbg-w{color:#C40}' +
      '.dbg-sh{font-weight:bold;color:#000}' +
      '.dbg-i{color:#444}' +
      '.dbg-f{color:#999}' +
      '.dbg-ev{color:#0A0}' +
      '.dbg-m{color:#990}' +
      '.logmsg{border-bottom:1px solid #CCC;padding:2px}' +
      '.logsep{background-color: #8C8;}' +
      '.logdiv{border:1px solid #CCC;background-color:#FCFCFC;' +
      'font:medium monospace}',
      this.element_);
  this.element_.className += ' logdiv';
};


/**
 * Sets whether we are currently capturing logger output.
 * @param {boolean} capturing Whether to capture logger output.
 */
goog.debug.DivConsole.prototype.setCapturing = function(capturing) {
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
goog.debug.DivConsole.prototype.addLogRecord = function(logRecord) {
  if (!logRecord) {
    return;
  }
  var scroll = this.element_.scrollHeight - this.element_.scrollTop -
      this.element_.clientHeight <= 100;

  var div = this.elementOwnerDocument_.createElement(goog.dom.TagName.DIV);
  div.className = 'logmsg';
  goog.dom.safe.setInnerHtml(
      div, this.formatter_.formatRecordAsHtml(logRecord));
  this.element_.appendChild(div);

  if (scroll) {
    this.element_.scrollTop = this.element_.scrollHeight;
  }
};


/**
 * Gets the formatter for outputting to the console. The default formatter
 * is an instance of goog.debug.HtmlFormatter
 * @return {!goog.debug.Formatter} The formatter in use.
 */
goog.debug.DivConsole.prototype.getFormatter = function() {
  return this.formatter_;
};


/**
 * Sets the formatter for outputting to the console.
 * @param {goog.debug.HtmlFormatter} formatter The formatter to use.
 */
goog.debug.DivConsole.prototype.setFormatter = function(formatter) {
  this.formatter_ = formatter;
};


/**
 * Adds a separator to the debug window.
 */
goog.debug.DivConsole.prototype.addSeparator = function() {
  var div = this.elementOwnerDocument_.createElement(goog.dom.TagName.DIV);
  div.className = 'logmsg logsep';
  this.element_.appendChild(div);
};


/**
 * Clears the console.
 */
goog.debug.DivConsole.prototype.clear = function() {
  if (this.element_) {
    goog.dom.safe.setInnerHtml(this.element_, goog.html.SafeHtml.EMPTY);
  }
};
