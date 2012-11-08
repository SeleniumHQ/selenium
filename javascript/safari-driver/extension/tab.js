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
goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('safaridriver.Tab');
goog.require('safaridriver.message.Command');
goog.require('safaridriver.message.Load');
goog.require('safaridriver.message.PendingFrame');
goog.require('safaridriver.message.Response');
goog.require('safaridriver.message.Unload');



/**
 * Tracks a single SafariBrowserTab.
 *
 * <p>Upon receiving a message from the managed SafariBrowserTab, each
 * instance will emit an event whose type matches the original message's type.
 * The parsed {@link safaridriver.message.Message} will be included as the
 * event's data payload.
 *
 * @param {!SafariBrowserTab} browserTab The tab to track.
 * @constructor
 * @extends {safaridriver.Tab}
 */
safaridriver.extension.Tab = function(browserTab) {
  goog.base(this, browserTab);

  this.setLogger('safaridriver.extension.Tab');

  /**
   * @type {!SafariBrowserTab}
   * @private
   */
  this.browserTab_ = browserTab;

  browserTab.addEventListener('close', goog.bind(this.dispose, this), false);
  this.on(safaridriver.message.Load.TYPE, goog.bind(this.onLoad_, this));
  this.on(safaridriver.message.Unload.TYPE, goog.bind(this.onUnload_, this));
  this.on(safaridriver.message.PendingFrame.TYPE,
      goog.bind(this.onPendingFrame_, this));
};
goog.inherits(safaridriver.extension.Tab, safaridriver.Tab);


/**
 * Whether the active frame in this tab is currently loading.
 * @type {boolean}
 * @private
 */
safaridriver.extension.Tab.prototype.frameIsLoading_ = false;


/**
 * @private
 */
safaridriver.extension.Tab.prototype.onLoad_ = function() {
  this.frameIsLoading_ = false;
  this.notifyReady();
};


/**
 * Responds to queries from the tab on whether one of its descendant frames is
 * currently loading.
 * @param {!safaridriver.message.PendingFrame} message The message.
 * @param {!SafariExtensionMessageEvent} e The original message event.
 * @private
 */
safaridriver.extension.Tab.prototype.onPendingFrame_ = function(message, e) {
  goog.asserts.assert(e.name === 'canLoad',
      'Received an async pending frame query');
  this.log('onPendingFrame_(frameIsLoading=' + this.frameIsLoading_ + ')');
  e.message = this.frameIsLoading_;
  e.stopPropagation();
};


/**
 * @param {!safaridriver.message.Unload} message The unload message.
 * @private
 */
safaridriver.extension.Tab.prototype.onUnload_ = function(message) {
  this.log('Received unload notification: ' + message);
  this.log('Is frame currently ready? ' + this.isReady());
  if (message.isFrame() && this.isReady()) {
    this.frameIsLoading_ = true;
  } else {
    this.frameIsLoading_ = false;
    this.notifyUnready();
  }
};


/** @return {!SafariBrowserTab} The tab associated with this window. */
safaridriver.extension.Tab.prototype.getBrowserTab = function() {
  return this.browserTab_;
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
 *     the message.
 */
safaridriver.extension.Tab.prototype.send = function(command, opt_timeout) {
  var response = new webdriver.promise.Deferred();
  var message = new safaridriver.message.Command(command);

  var self = this;
  var timeoutKey;

  this.whenReady(onReady);

  return response.promise;

  /**
   * @param {boolean=} opt_leaveResponseListener Whether to leave the response
   *     listener attached to the tab.
   */
  function cleanUp(opt_leaveResponseListener) {
    if (!opt_leaveResponseListener) {
      self.removeListener(safaridriver.message.Response.TYPE,
          onResponse);
    }
    self.removeListener(safaridriver.message.Unload.TYPE, onUnload);
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

    self.addListener(safaridriver.message.Response.TYPE, onResponse);
    self.addListener(safaridriver.message.Unload.TYPE, onUnload);
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

    self.log('Received response: ' + message);
    response.resolve(message.getResponse());
  }

  // If an unload event is received before a command response, it indicates
  // that the tab was already in the process of unloading before we sent the
  // command and the command was never received. Wait for the currently
  // selected frame to finish loading, then retry the command.
  function onUnload() {
    cleanUp(/*leaveResponseListener=*/true);
    self.log('Tab has unloaded before we received a response; waiting for the' +
        ' page to reload before we try again');

    // Unload notifications are sent synchronously, so we must yield before
    // scheduling a retry or we could end up in an infinite loop when the
    // target window is a frame.
    setTimeout(function() {
      self.whenReady(function() {
        if (response.isPending()) {
          onReady();
        }
      });
    }, 150);
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
