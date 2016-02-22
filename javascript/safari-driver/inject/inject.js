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
 * @fileoverview Script injected into each page when its DOM has fully loaded.
 */

goog.provide('safaridriver.inject');

goog.require('bot.inject');
goog.require('goog.debug.LogManager');
goog.require('goog.log');
goog.require('safaridriver.inject.Tab');
goog.require('safaridriver.inject.commands.module');
goog.require('safaridriver.inject.message');
goog.require('safaridriver.inject.message.Encode');
goog.require('safaridriver.logging.ForwardingHandler');
goog.require('safaridriver.message');
goog.require('safaridriver.message.Connect');
goog.require('safaridriver.message.Response');


/**
 * @type {goog.log.Logger}
 * @const
 */
safaridriver.inject.LOG = goog.log.getLogger('safaridriver.inject');


/** Initializes this injected script. */
safaridriver.inject.init = function() {
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.INFO);

  var handler = new safaridriver.logging.ForwardingHandler(safari.self.tab);
  window.addEventListener('unload', function() {
    handler.dispose();
  }, false);

  safaridriver.inject.commands.module.init();

  var tab = safaridriver.inject.Tab.getInstance();
  tab.init();
  tab.on(safaridriver.message.Connect.TYPE,
         safaridriver.inject.onConnect_).
      on(safaridriver.inject.message.Encode.TYPE,
         safaridriver.inject.onEncode_);
};
goog.exportSymbol('init', safaridriver.inject.init);


/**
 * Forwards connection requests from the content page to the extension.
 * @param {!safaridriver.message.Message} message The connect message.
 * @param {!MessageEvent.<*>} e The original message event.
 * @private
 */
safaridriver.inject.onConnect_ = function(message, e) {
  if (message.isSameOrigin() ||
      !safaridriver.inject.message.isFromFrame(e)) {
    return;
  }
  goog.log.info(safaridriver.inject.LOG,
      'Content page has requested a WebDriver client connection to ' +
          message.getUrl());
  var response = message.sendSync(safari.self.tab);
  safaridriver.message.Message.sendSyncResponse(response);
};


/**
 * @param {!safaridriver.inject.message.Encode} message The message.
 * @param {!MessageEvent.<*>} e The original message event.
 * @private
 */
safaridriver.inject.onEncode_ = function(message, e) {
  if (!e.source) {
    goog.log.error(safaridriver.inject.LOG, 'Not looking up element: ' +
        message.getLocator() + '; no window to respond to!');
    return;
  }

  var result = bot.inject.executeScript(function() {
    var locator = message.getLocator();
    return bot.getDocument().querySelector(locator);
  }, []);

  var response = new safaridriver.message.Response(
      message.getId(), /** @type {!bot.response.ResponseObject} */ (result));
  response.send(e.source);
};
