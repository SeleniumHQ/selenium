/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Simple logger that logs a Div Element.
 */

goog.provide('goog.debug.DivConsole');

goog.require('goog.debug.HtmlFormatter');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.log');
goog.require('goog.string.Const');
goog.require('goog.style');
goog.requireType('goog.debug.Formatter');
goog.requireType('goog.log.LogRecord');


/**
 * A class for visualising logger calls in a div element.
 * @param {Element} element The element to append to.
 * @constructor
 */
goog.debug.DivConsole = function(element) {
  'use strict';
  this.publishHandler_ = goog.bind(this.addLogRecord, this);
  this.formatter_ = new goog.debug.HtmlFormatter();
  this.formatter_.showAbsoluteTime = false;
  this.isCapturing_ = false;
  this.element_ = element;
  this.elementOwnerDocument_ =
      this.element_.ownerDocument || this.element_.document;
  this.domHelper_ = new goog.dom.DomHelper(this.elementOwnerDocument_);

  this.installStyles();
};


/**
 * Installs styles for the log messages and its div
 */
goog.debug.DivConsole.prototype.installStyles = function() {
  'use strict';
  goog.style.installSafeStyleSheet(
      goog.html.SafeStyleSheet.fromConstant(goog.string.Const.from(
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
          'font:medium monospace}')),
      this.element_);
  this.element_.className += ' logdiv';
};


/**
 * Sets whether we are currently capturing logger output.
 * @param {boolean} capturing Whether to capture logger output.
 */
goog.debug.DivConsole.prototype.setCapturing = function(capturing) {
  'use strict';
  if (capturing == this.isCapturing_) {
    return;
  }

  // attach or detach handler from the root logger
  var rootLogger = goog.log.getRootLogger();
  if (capturing) {
    goog.log.addHandler(rootLogger, this.publishHandler_);
  } else {
    goog.log.removeHandler(rootLogger, this.publishHandler_);
  }
  this.isCapturing_ = capturing;
};


/**
 * Adds a log record.
 * @param {?goog.log.LogRecord} logRecord The log entry.
 */
goog.debug.DivConsole.prototype.addLogRecord = function(logRecord) {
  'use strict';
  if (!logRecord) {
    return;
  }
  var scroll = this.element_.scrollHeight - this.element_.scrollTop -
          this.element_.clientHeight <=
      100;

  var div = this.domHelper_.createElement(goog.dom.TagName.DIV);
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
  'use strict';
  return this.formatter_;
};


/**
 * Sets the formatter for outputting to the console.
 * @param {goog.debug.HtmlFormatter} formatter The formatter to use.
 */
goog.debug.DivConsole.prototype.setFormatter = function(formatter) {
  'use strict';
  this.formatter_ = formatter;
};


/**
 * Adds a separator to the debug window.
 */
goog.debug.DivConsole.prototype.addSeparator = function() {
  'use strict';
  var div = this.domHelper_.createElement(goog.dom.TagName.DIV);
  div.className = 'logmsg logsep';
  this.element_.appendChild(div);
};


/**
 * Clears the console.
 */
goog.debug.DivConsole.prototype.clear = function() {
  'use strict';
  if (this.element_) {
    goog.dom.safe.setInnerHtml(this.element_, goog.html.SafeHtml.EMPTY);
  }
};
