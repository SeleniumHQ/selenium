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


goog.provide('safaridriver.extension.Session');

goog.require('goog.string');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('webdriver.Capability');
goog.require('webdriver.Capabilities');
goog.require('webdriver.Session');



/**
 * Represents a session with the SafariDriver.
 * @param {!safaridriver.extension.TabManager} tabManager The tab manager to
 *     use with this session.
 * @constructor
 * @extends {webdriver.Session}
 */
safaridriver.extension.Session = function(tabManager) {
  goog.base(this, goog.string.getRandomString(),
      safaridriver.extension.Session.CAPABILITIES);

  /** @private {!safaridriver.extension.TabManager} */
  this.tabManager_ = tabManager;
};
goog.inherits(safaridriver.extension.Session, webdriver.Session);


/**
 * The capabilites of the SafariDriver.
 * @type {!webdriver.Capabilities}
 * @const
 */
safaridriver.extension.Session.CAPABILITIES = webdriver.Capabilities.safari().
    set(webdriver.Capability.VERSION, goog.userAgent.product.VERSION).
    set(webdriver.Capability.PLATFORM, goog.userAgent.MAC ? 'MAC' : 'WINDOWS').
    set(webdriver.Capability.SUPPORTS_JAVASCRIPT, true).
    set(webdriver.Capability.TAKES_SCREENSHOT, true).
    set(webdriver.Capability.SUPPORTS_CSS_SELECTORS, true).
    set(webdriver.Capability.SECURE_SSL, true);


/**
 * The command currently being executed with this session, if any.
 * @private {safaridriver.Command}
 */
safaridriver.extension.Session.prototype.currentCommand_ = null;


/**
 * The text from an alert that was opened between commands, or null.
 * @private {?string}
 * @see http://code.google.com/p/selenium/issues/detail?id=3862
 * @see http://code.google.com/p/selenium/issues/detail?id=3969
 */
safaridriver.extension.Session.prototype.unhandledAlertText_ = null;


/** @private {number} */
safaridriver.extension.Session.prototype.implicitWait_ = 0;


/** @private {number} */
safaridriver.extension.Session.prototype.scriptTimeout_ = 0;


/**
 * @param {safaridriver.Command} command The command.
 */
safaridriver.extension.Session.prototype.setCurrentCommand = function(command) {
  if (command && this.currentCommand_) {
    throw Error('Session is executing: ' + this.currentCommand_.getName() +
        '; cannot set current to: ' + command.getName());
  }
  this.currentCommand_ = command;
};


/**
 * @return {boolean} Whether this session is currently executing a command.
 */
safaridriver.extension.Session.prototype.isExecutingCommand = function() {
  return !!this.currentCommand_;
};


/**
 * @param {?string} txt The text from an unhandled alert.
 */
safaridriver.extension.Session.prototype.setUnhandledAlertText = function(txt) {
  this.unhandledAlertText_ = txt;
};


/**
 * @return {?string} The text from the last unhandled alert, or null.
 */
safaridriver.extension.Session.prototype.getUnhandledAlertText = function() {
  return this.unhandledAlertText_;
};


/**
 * @return {!safaridriver.extension.Tab} The tab commands should be routed to.
 * @throws {bot.Error} If there are no open windows, or the focused tab has been
 *     closed.
 */
safaridriver.extension.Session.prototype.getCommandTab = function() {
  return this.tabManager_.getCommandTab();
};


/**
 * Sets the tab that all commands should be routed to.
 * @param {!safaridriver.extension.Tab} tab The tab that commands should be
 *     routed to.
 */
safaridriver.extension.Session.prototype.setCommandTab = function(tab) {
  this.tabManager_.setCommandTab(tab);
};


/**
 * Retrieves the entry matching the provided ID or SafariBrowserTab.
 * @param {string} id The ID of the tab to look up.
 * @return {safaridriver.extension.Tab} The located entry, or {@code null} if
 *     none was found.
 */
safaridriver.extension.Session.prototype.getTab = function(id) {
  return this.tabManager_.getTab(id);
};


/**
 * @return {!Array.<string>} A list of IDs for the open tabs.
 */
safaridriver.extension.Session.prototype.getTabIds = function() {
  return this.tabManager_.getIds();
};


/** @return {number} The current implicit wait setting, in milliseconds. */
safaridriver.extension.Session.prototype.getImplicitWait = function() {
  return this.implicitWait_;
};


/** @param {number} wait How long to wait, in milliseconds. */
safaridriver.extension.Session.prototype.setImplicitWait = function(wait) {
  this.implicitWait_ = wait;
};


/** @return {number} The current script timeout setting, in milliseconds. */
safaridriver.extension.Session.prototype.getScriptTimeout = function() {
  return this.scriptTimeout_;
};


/** @param {number} wait How long to wait, in milliseconds. */
safaridriver.extension.Session.prototype.setScriptTimeout = function(wait) {
  this.scriptTimeout_ = wait;
};


