// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
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

goog.require('goog.asserts');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('safaridriver.console');
goog.require('safaridriver.extension.Server');
goog.require('safaridriver.extension.Session');
goog.require('safaridriver.extension.TabManager');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Alert');
goog.require('safaridriver.message.Connect');
goog.require('webdriver.Session');
goog.require('webdriver.WebDriver');


/**
 * Initializes the SafariDriver extension's global page.
 */
safaridriver.extension.init = function() {
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.ALL);
  safaridriver.console.init();

  safaridriver.extension.LOG_.info('Creating global session...');
  safaridriver.extension.tabManager_ = new safaridriver.extension.TabManager();
  safaridriver.extension.session_ = new safaridriver.extension.Session(
      safaridriver.extension.tabManager_);

  safaridriver.extension.LOG_.info('Creating debug driver...');
  var server = safaridriver.extension.createSessionServer_();
  safaridriver.extension.driver = new webdriver.WebDriver(
      new webdriver.Session('debug', {}), server);
  goog.exportSymbol('driver', safaridriver.extension.driver);

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
 * Global session shared by eash clinet; lazily initialized in
 * {@link safaridriver.extension.init}.
 * @type {!safaridriver.extension.Session}
 * @private
 */
safaridriver.extension.session_;


/**
 * An instance of {@link webdriver.WebDriver}, provided for interacting with
 * the extension via the global page's REPL.
 * @type {webdriver.WebDriver}
 */
safaridriver.extension.driver;


/**
 * The number of WebDriver client connections active with this extension.
 * @type {number}
 * @private
 */
safaridriver.extension.numConnections_ = 0;


/**
 * Responds to a message from an injected script.
 * @param {!SafariExtensionMessageEvent} e The event.
 * @private
 */
safaridriver.extension.onMessage_ = function(e) {
  var message = safaridriver.message.fromEvent(e);
  switch (message.getType()) {
    case safaridriver.message.Connect.TYPE:
      var url = (/** @type {!safaridriver.message.Connect} */ message).getUrl();
      var server = safaridriver.extension.createSessionServer_();
      server.connect(url).
          then(function() {
            safaridriver.extension.LOG_.info('Connected to client: ' + url);
            safaridriver.extension.numConnections_++;
            server.onDispose(function() {
              safaridriver.extension.numConnections_--;
            });
          }, function(e) {
            safaridriver.extension.LOG_.severe(
                'Failed to connect to client: ' + url, e);
          });
      break;

    case safaridriver.message.Alert.TYPE:
      goog.asserts.assert(e.name === 'canLoad',
          'Received an async alert message');
      if (!safaridriver.extension.session_.isExecutingCommand()) {
        safaridriver.extension.session_.setUnhandledAlertText(
            message.getMessage());
      }

      // TODO: Fully support alerts. See
      // http://code.google.com/p/selenium/issues/detail?id=3862
      e.message = !!safaridriver.extension.numConnections_;
      e.stopPropagation();
      break;
  }
};


/**
 * Creates a new session. The SafariDriver supports multiple sessions, each
 * with their own timeouts, but they all share the same tab manager.
 * @return {!safaridriver.extension.Server} The new server.
 * @private
 */
safaridriver.extension.createSessionServer_ = function() {
  return new safaridriver.extension.Server(safaridriver.extension.session_);
};
