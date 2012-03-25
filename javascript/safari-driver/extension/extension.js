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

/**
 * @fileoverview Entry point for the SafariDriver extension's global script.
 */

goog.provide('safaridriver.extension');

goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('safaridriver.message');
goog.require('safaridriver.extension.Server');
goog.require('safaridriver.extension.Session');
goog.require('safaridriver.extension.TabManager');
goog.require('safaridriver.console');
goog.require('webdriver.Session');
goog.require('webdriver.WebDriver');


/**
 * Initializes the SafariDriver extension's global page.
 */
safaridriver.extension.init = function() {
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.ALL);
  safaridriver.console.init();

  safaridriver.extension.LOG_.info('Initializing tab manager...');
  safaridriver.extension.tabManager_ = new safaridriver.extension.TabManager();

  safaridriver.extension.LOG_.info('Creating debug driver...');
  var server = safaridriver.extension.createSessionServer_();
  safaridriver.extension.driver = new webdriver.WebDriver(
      new webdriver.Session('debug', {}), server);

  // Now that we're initialized, we sit and wait for a page to send us a client
  // to attempt connecting to.
  safaridriver.extension.LOG_.info('Waiting for connect command...');
  safari.application.addEventListener('message',
      safaridriver.extension.onMessage_, false);
};


/**
 * @type {!goog.debug.Logger}
 * @const
 * @private
 */
safaridriver.extension.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.extension');


/**
 * Global tab manager shared by each instance; lazily initialized in
 * {@link safaridriver.extension.init}.
 * @type {!safaridriver.extension.TabManager}
 * @private
 */
safaridriver.extension.tabManager_;


/**
 * An instance of {@link webdriver.WebDriver}, provided for interacting with
 * the extension via the global page's REPL.
 * @type {webdriver.WebDriver}
 */
safaridriver.extension.driver;


/**
 * Responds to a message from an injected script.
 * @param {!SafariExtensionMessageEvent} e The event.
 * @private
 */
safaridriver.extension.onMessage_ = function(e) {
  safaridriver.extension.LOG_.info('Received message: ' + e.name);
  var message = safaridriver.message.Message.fromEvent(e);
  if (message.isType(safaridriver.message.Type.CONNECT)) {
    var url = (/** @type {!safaridriver.message.ConnectMessage} */ message).
        getUrl();
    safaridriver.extension.createSessionServer_().connect(url).
        then(function() {
          safaridriver.extension.LOG_.info('Connected to client: ' + url);
        }, function(e) {
          safaridriver.extension.LOG_.severe(
              'Failed to connect to client: ' + url, e);
        });
  }
};


/**
 * Creates a new session. The SafariDriver supports multiple sessions, each
 * with their own timeouts, but they all share the same tab manager.
 * @return {!safaridriver.extension.Server} The new server.
 * @private
 */
safaridriver.extension.createSessionServer_ = function() {
  var session = new safaridriver.extension.Session(
      safaridriver.extension.tabManager_);
  return new safaridriver.extension.Server(session);
};
