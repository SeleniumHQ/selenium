// Copyright 2012 Software Freedom Conservancy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('safaridriver.extension.Session');

goog.require('goog.debug.Logger');
goog.require('goog.string');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product.isVersion');
goog.require('webdriver.Session');


/**
 * Represents a session with the SafariDriver.
 * @param {!safaridriver.extension.TabManager} tabManager The tab manager to use with this
 *     session.
 * @constructor
 * @extends {webdriver.Session}
 */
safaridriver.extension.Session = function(tabManager) {
  goog.base(this, goog.string.getRandomString(),
      safaridriver.extension.Session.CAPABILITIES);

  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.log_ = goog.debug.Logger.getLogger('safaridriver.extension.Session');

  /**
   * @type {!safaridriver.extension.TabManager}
   * @private
   */
  this.tabManager_ = tabManager;
};
goog.inherits(safaridriver.extension.Session, webdriver.Session);


/**
 * The capabilites of the SafariDriver.
 * @type {!Object.<*>}
 * @const
 */
safaridriver.extension.Session.CAPABILITIES = {
  'browserName': 'safari',
  'version': goog.userAgent.product.VERSION,
  'platform': goog.userAgent.MAC ? 'MAC' : 'WINDOWS',
  'javascriptEnabled': true,
  'takesScreenshot': true,
  'cssSelectorsEnabled': true,
  // The SafariDriver cannot handle insecure SSL, so indicate that in the
  // returned capabilities.
  'secureSsl': true
};


/**
 * @type {number}
 * @private
 */
safaridriver.extension.Session.prototype.implicitWait_ = 0;


/**
 * @type {number}
 * @private
 */
safaridriver.extension.Session.prototype.scriptTimeout_ = 0;


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
 * @param {!safaridriver.extension.Tab} tab The tab that commands should be routed to.
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


/** @return {number} */
safaridriver.extension.Session.prototype.getImplicitWait = function() {
  return this.implicitWait_;
};


/** @param {number} wait How long to wait. */
safaridriver.extension.Session.prototype.setImplicitWait = function(wait) {
  this.implicitWait_ = wait;
};


/** @return {number} */
safaridriver.extension.Session.prototype.getScriptTimeout = function() {
  return this.scriptTimeout_;
};


/** @param {number} wait How long to wait. */
safaridriver.extension.Session.prototype.setScriptTimeout = function(wait) {
  this.scriptTimeout_ = wait;
};


