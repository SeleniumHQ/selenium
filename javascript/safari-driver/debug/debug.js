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

goog.provide('safaridriver.debug');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.log');
goog.require('goog.string');
goog.require('safaridriver.Command');
goog.require('safaridriver.console');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Log');
goog.require('safaridriver.message.MessageTarget');
goog.require('webdriver.Capabilities');
goog.require('webdriver.Session');
goog.require('webdriver.WebDriver');
goog.require('webdriver.logging');
goog.require('webdriver.promise');


/**
 * @private {goog.log.Logger}
 * @const
 */
safaridriver.debug.LOG_ = goog.log.getLogger('safaridriver.debug');


/**
 * Initializes the debug log window.
 */
safaridriver.debug.init = function() {
  safaridriver.console.init();

  var messageTarget = new safaridriver.message.MessageTarget(safari.self);
  messageTarget.on(
      safaridriver.message.Log.TYPE, safaridriver.debug.onLogEntry_);
  messageTarget.setLogger(safaridriver.debug.LOG_);

  var driver = webdriver.WebDriver.createSession(
      new safaridriver.debug.CommandExecutor(messageTarget),
      webdriver.Capabilities.safari());

  goog.exportSymbol('driver', driver);
};


/**
 * @param {number} ms A timestamp, in milliseconds.
 * @return {string} The formatted timestamp.
 * @private
 */
safaridriver.debug.formatTimeStamp_ = function(ms) {
  var time = new Date(ms);
  return pad(time.getHours()) + ':' +
         pad(time.getMinutes()) + ':' +
         pad(time.getSeconds()) + '.' +
         pad(Math.floor(time.getMilliseconds() / 10));

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }
};


/**
 * @param {!safaridriver.message.Log} message The log message.
 * @private
 */
safaridriver.debug.onLogEntry_ = function(message) {
  var log = goog.dom.getElement('log');
  message.getEntries().forEach(function(entry) {
    var content =
        safaridriver.debug.formatTimeStamp_(entry.timestamp) +
        ' ' + entry.message.replace('<', '&lt;').replace('>', '&gt;');

    var className = ['msg'];
    switch (entry.level) {
      case webdriver.logging.Level.DEBUG:
        className.push('debug');
        break;
      case webdriver.logging.Level.WARNING:
        className.push('warning');
        break;
      case webdriver.logging.Level.SEVERE:
        className.push('severe');
        break;
    }

    if (entry.type === webdriver.logging.Type.BROWSER) {
      className.push('browser');
    }

    var div = goog.dom.createDom(
        goog.dom.TagName.DIV, className.join(' '),
        goog.dom.createDom(goog.dom.TagName.PRE, null, content));
    goog.dom.appendChild(log, div);
  });
};


/**
 * @param {!safaridriver.message.MessageTarget} target Message target for the
 *     current tab.
 * @constructor
 * @implements {webdriver.CommandExecutor}
 */
safaridriver.debug.CommandExecutor = function(target) {

  /** @private {!safaridriver.message.MessageTarget} */
  this.target_ = target;
};


/** @override */
safaridriver.debug.CommandExecutor.prototype.execute = function(command) {
  var target = this.target_;
  return new webdriver.promise.Promise(function(fulfill) {
    var driverCommand = new safaridriver.Command(
        goog.string.getRandomString(),
        command.getName(), command.getParameters());

    target.once(safaridriver.message.Response.TYPE, function(message) {
      var response = /** @type {!safaridriver.message.Response} */ (message).
          getResponse();
      fulfill(response);
    });

    new safaridriver.message.Command(driverCommand).send(safari.self.tab);
  });
};
