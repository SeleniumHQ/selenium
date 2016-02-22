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

/**
 * @fileoverview Defines a log handler that forwards entries to another
 * component.
 */

goog.provide('safaridriver.logging.ForwardingHandler');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.debug.LogManager');
goog.require('safaridriver.message.Log');
goog.require('webdriver.logging');



/**
 * Registers a log handler that will forward all entries to the given
 * target.
 * @param {!(SafariContentBrowserTabProxy|SafariWebPageProxy|Window)} target
 *     The object to send log entries to.
 * @constructor
 * @extends {goog.Disposable}
 */
safaridriver.logging.ForwardingHandler = function(target) {
  goog.base(this);

  /** @private {!(SafariContentBrowserTabProxy|SafariWebPageProxy|Window)} */
  this.target_ = target;

  /** @private {!Function} */
  this.boundHandle_ = goog.bind(this.handleLogRecord_, this);

  goog.debug.LogManager.getRoot().addHandler(this.boundHandle_);
};
goog.inherits(safaridriver.logging.ForwardingHandler, goog.Disposable);


/** @private {boolean} */
safaridriver.logging.ForwardingHandler.prototype.captureConsole_ = false;


/** @override */
safaridriver.logging.ForwardingHandler.prototype.disposeInternal = function() {
  goog.debug.LogManager.getRoot().removeHandler(this.boundHandle_);
  delete this.boundHandle_;
};


/**
 * Configures this handler to also capture and forward JavaScript console
 * output.
 */
safaridriver.logging.ForwardingHandler.prototype.captureConsoleOutput =
    function() {
  if (this.captureConsole_) {
    return;
  }
  this.captureConsole_ = true;

  if (!window.console) {
    return;
  }

  var target = this.target_;
  wrap('debug', webdriver.logging.Level.DEBUG);
  wrap('error', webdriver.logging.Level.SEVERE);
  wrap('group', webdriver.logging.Level.INFO);
  wrap('info', webdriver.logging.Level.INFO);
  wrap('log', webdriver.logging.Level.INFO);
  wrap('warn', webdriver.logging.Level.WARNING);

  function wrap(fnName, level) {
    var nativeFn = console[fnName];
    if (!nativeFn) {
      return;
    }

    var fn = function() {
      var args = goog.array.slice(arguments, 0);
      var message = new safaridriver.message.Log([
        new webdriver.logging.Entry(level, args.join(' '),
            goog.now(), webdriver.logging.Type.BROWSER)
      ]);
      message.send(target);
      return nativeFn.apply(console, arguments);
    };

    fn.toString = function() {
      return nativeFn.toString();
    };

    console[fnName] = fn;
  }
};


/**
 * Forwards a log message.
 * @param {!safaridriver.message.Log} message The message to forward.
 */
safaridriver.logging.ForwardingHandler.prototype.forward = function(message) {
  message.send(this.target_);
};


/**
 * @param {!goog.debug.LogRecord} logRecord The record to forward.
 * @private
 */
safaridriver.logging.ForwardingHandler.prototype.handleLogRecord_ = function(
    logRecord) {
  var entry = webdriver.logging.Entry.fromClosureLogRecord(
      logRecord, webdriver.logging.Type.DRIVER);
  var message = new safaridriver.message.Log([entry]);
  this.forward(message);
};
