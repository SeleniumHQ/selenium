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


goog.provide('safaridriver.extension.Tab');

goog.require('bot.response');
goog.require('goog.Uri');
goog.require('safaridriver.Tab');
goog.require('safaridriver.message');


/**
 * Tracks a single SafariBrowserTab.
 *
 * <p>Upon receiving a message from the managed SafariBrowserTab, each
 * instance will emit an event whose type matches the original message's
 * {@link safaridriver.message.Type}. The parsed
 * {@link safaridriver.message.Message} will be included as the event's data
 * payload.
 *
 * @param {!SafariBrowserTab} browserTab The tab to track.
 * @constructor
 * @extends {safaridriver.Tab}
 */
safaridriver.extension.Tab = function(browserTab) {
  goog.base(this, browserTab, 'safaridriver.extension.Tab');

  /**
   * @type {!SafariBrowserTab}
   * @private
   */
  this.browserTab_ = browserTab;

  browserTab.addEventListener('close', goog.bind(this.dispose, this), false);
  this.on(safaridriver.message.Type.LOAD, goog.bind(this.notifyReady, this));
  this.on(safaridriver.message.Type.UNLOAD,
      goog.bind(this.notifyUnready, this));
};
goog.inherits(safaridriver.extension.Tab, safaridriver.Tab);


/** @return {!SafariBrowserTab} The tab associated with this window. */
safaridriver.extension.Tab.prototype.getBrowserTab = function() {
  return this.browserTab_
};


/**
 * Determines whether loading the given URL would trigger a full page load. This
 * should return false if the given URL and the current page's differ only by
 * fragment.
 * @param {(string|!goog.Uri)} url The URL to check.
 * @return {boolean} Whether the URL would trigger a new page.
 */
safaridriver.extension.Tab.prototype.loadsNewPage = function(url) {
  var from = new goog.Uri(this.browserTab_.url);
  var to = new goog.Uri(url);
  if (from.toString() === to.toString()) {
    // If one of the URIs has a fragment, then they must both have one.
    // Otherwise, we must check if one of them has an empty hash. We must check
    // for these separately, because goog.Uri strips them off.
    return !!from.getFragment() ||
        /#$/.test(this.browserTab_.url) === /#$/.test(url);
  }
  return from.toString() === to.toString() ||
      from.setFragment('').toString() !== to.setFragment('').toString();
};


/**
 * Sends a command to this tab's injected script.
 * @param {!safaridriver.Command} command The command to send.
 * @param {number=} opt_timeout How long, in milliseconds, to wait for a
 *     response before timing out. If not specified, or non-positive, no timeout
 *     will be applied.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the message
 */
safaridriver.extension.Tab.prototype.send = function(command, opt_timeout) {
  var response = new webdriver.promise.Deferred();
  var message = new safaridriver.message.CommandMessage(command);

  var self = this;
  var timeoutKey;
  self.log('Preparing message: ' + message);
  this.whenReady(onReady);
  return response.promise;

  /**
   * @param {boolean=} opt_leaveResponseListener Whether to leave the response
   *     listener attached to the tab.
   */
  function cleanUp(opt_leaveResponseListener) {
    if (!opt_leaveResponseListener) {
      self.removeListener(safaridriver.message.Type.RESPONSE, onResponse);
    }
    self.removeListener(safaridriver.message.Type.UNLOAD, onUnload);
    self.browserTab_.removeEventListener('close', onClose, true);
    clearTimeout(timeoutKey);
  }

  function onReady() {
    self.log('Sending message: ' + message);

    if (opt_timeout > 0) {
      var start = goog.now();
      timeoutKey = setTimeout(function() {
        cleanUp();
        if (response.isPending()) {
          response.reject(new bot.Error(bot.ErrorCode.SCRIPT_TIMEOUT,
              'Timed out awaiting response to command "' + command.getName() +
                  '" after ' + (goog.now() - start) + ' ms'));
        }
      }, opt_timeout);
    }

    self.addListener(safaridriver.message.Type.RESPONSE, onResponse);
    self.addListener(safaridriver.message.Type.UNLOAD, onUnload);
    self.browserTab_.addEventListener('close', onClose, true);
    message.send(self.browserTab_.page);
  }

  function onResponse(message) {
    if (!response.isPending()) {
      // Whoops! We shouldn't be listening for responses anymore.
      cleanUp();
      return;
    }

    if (message.getId() !== command.getId()) {
      self.log(
          'Ignoring response to another command: ' + message +
              ' (' + command.getId() + ')',
          goog.debug.Logger.Level.FINE);
      return;
    }

    if (!response.isPending()) {
      self.log(
          'Received command response after promise has been ' +
              'resolved; perhaps it previously timed-out? ' + message,
          goog.debug.Logger.Level.WARNING);
      return;
    }

    cleanUp();
    try {
      response.resolve(bot.response.checkResponse(message.getResponse()));
    } catch (ex) {
      response.reject(ex);
    }
  }

  // If an unload event is received before a command response, it indicates
  // that the tab was already in the process of unloading before we sent the
  // command and the command was never received. Wait for the currently
  // selected frame to finish loading, then retry the command.
  function onUnload() {
    cleanUp(/*leaveResponseListener=*/true);
    self.log('Tab has unloaded before we received a response; waiting for the' +
        ' page to reload before we try again');
    self.whenReady(function() {
      if (response.isPending()) {
        onReady();
      }
    });
  }

  function onClose() {
    cleanUp();
    if (response.isPending()) {
      self.log(
          'The window closed before a response was received.' +
              'returning a null-success response.',
          goog.debug.Logger.Level.WARNING);
      // TODO(jleyba): Is a null success response always the correct action
      // when the window closes before a response is received?
      response.resolve(bot.response.createResponse(null));
    }
  }
};


/**
 * Retrieves the visible contents of this tab as a base64 PNG data URL.
 * @param {function(string)} fn The function to call when the data is ready.
 */
safaridriver.extension.Tab.prototype.visibleContentsAsDataURL = function(fn) {
  var browserTab = this.browserTab_;
  this.whenReady(function() {
    browserTab.visibleContentsAsDataURL(fn);
  });
};
