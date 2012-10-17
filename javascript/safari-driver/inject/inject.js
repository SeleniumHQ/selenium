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
 * @fileoverview Script injected into each page when its DOM has fully loaded.
 */

goog.provide('safaridriver.inject');

goog.require('bot.inject');
goog.require('goog.debug.Logger');
goog.require('safaridriver.console');
goog.require('safaridriver.inject.Tab');
goog.require('safaridriver.inject.message');
goog.require('safaridriver.inject.message.Encode');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Connect');
goog.require('safaridriver.message.Response');


/**
 * @type {!goog.debug.Logger}
 * @const
 */
safaridriver.inject.LOG = goog.debug.Logger.getLogger('safaridriver.inject');


/** Initializes this injected script. */
safaridriver.inject.init = function() {
  safaridriver.console.init();

  var tab = safaridriver.inject.Tab.getInstance();
  tab.init();
  tab.on(safaridriver.message.Connect.TYPE,
         safaridriver.inject.onConnect_).
      on(safaridriver.inject.message.Encode.TYPE,
         safaridriver.inject.onEncode_);
};


/**
 * Forwards connection requests from the content page to the extension.
 * @param {!safaridriver.message.Message} message The connect message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.onConnect_ = function(message, e) {
  if (message.isSameOrigin() ||
      !safaridriver.inject.message.isFromFrame(e)) {
    return;
  }
  safaridriver.inject.LOG.info(
      'Content page has requested a WebDriver client connection to ' +
          message.getUrl());
  message.sendSync(safari.self.tab);
};


/**
 * @param {!safaridriver.inject.message.Encode} message The message.
 * @param {!MessageEvent} e The original message event.
 * @private
 */
safaridriver.inject.onEncode_ = function(message, e) {
  if (!e.source) {
    safaridriver.inject.LOG.severe('Not looking up element: ' +
        message.getLocator() + '; no window to respond to!');
    return;
  }

  var result = bot.inject.executeScript(function() {
    var locator = message.getLocator();
    return bot.getDocument().querySelector(locator);
  }, []);

  var response = new safaridriver.message.Response(
      message.getId(), (/** @type {!bot.response.ResponseObject} */result));
  response.send(e.source);
};
