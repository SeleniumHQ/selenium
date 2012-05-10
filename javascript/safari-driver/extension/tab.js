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

goog.provide('safaridriver.extension.Tab');

goog.require('bot.response');
goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.string');
goog.require('webdriver.EventEmitter');


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
 * @extends {webdriver.EventEmitter}
 */
safaridriver.extension.Tab = function(browserTab) {
  goog.base(this);

  /**
   * @type {!SafariBrowserTab}
   * @private
   */
  this.browserTab_ = browserTab;

  /**
   * @type {string}
   * @private
   */
  this.id_ = goog.string.getRandomString();

  /**
   * @type {boolean}
   * @private
   */
  this.isReady_ = true;

  /**
   * @type {!Array.<function(!SafariBrowserTab)>}
   * @private
   */
  this.readyListeners_ = [];

  var onMessage = goog.bind(this.onMessage_, this);

  browserTab.addEventListener('message', onMessage, false);
  browserTab.addEventListener('close', function() {
    browserTab.removeEventListener('message', onMessage, false);
  }, false);
};
goog.inherits(safaridriver.extension.Tab, webdriver.EventEmitter);


/**
 * @type {!goog.debug.Logger}
 * @private
 * @const
 */
safaridriver.extension.Tab.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.extension.Tab');


/**
 * @type {?number}
 * @private
 */
safaridriver.extension.Tab.prototype.idleStateWaitKey_ = null;


/** @return {!SafariBrowserTab} The tab associated with this window. */
safaridriver.extension.Tab.prototype.getBrowserTab = function() {
  return this.browserTab_
};


/** @return {string} This window's ID. */
safaridriver.extension.Tab.prototype.getId = function() {
  return this.id_;
};


/**
 * @param {string} msg The message to log.
 * @param {goog.debug.Logger.Level=} opt_level The message level.
 * @param {Error=} opt_error An error message to log with the message.
 * @private
 */
safaridriver.extension.Tab.prototype.log_ = function(msg, opt_level,
                                                     opt_error) {
  var level = opt_level || goog.debug.Logger.Level.INFO;
  safaridriver.extension.Tab.LOG_.log(level, '[' + this.id_ + '] ' + msg,
      opt_error);
};


/**
 * Schedules a command for execution when this tab is no longer between page
 * navigation events.
 * @param {function(!SafariBrowserTab)} callback The function to invoke when
 *     this tab is ready.
 */
safaridriver.extension.Tab.prototype.whenReady = function(callback) {
  if (this.isReady_) {
    callback(this.browserTab_);
    return;
  }

  this.log_('Tab is not ready for commands; registering callback');
  this.readyListeners_.push(callback);
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
 * @private
 */
safaridriver.extension.Tab.prototype.onUnload_ = function() {
  this.log_('Tab frame has been unloaded');
  this.isReady_ = false;
  if (this.idleStateWaitKey_) {
    clearTimeout(this.idleStateWaitKey_);
    this.idleStateWaitKey_ = null;
  }
};


/**
 * @private
 */
safaridriver.extension.Tab.prototype.onLoad_ = function() {
  this.log_('Frame has loaded a new page; waiting for idle state');
  var self = this;
  self.isReady_ = true;

  // Wait if we stay ready for a short time before notifying our listeners.
  if (!self.idleStateWaitKey_) {
    self.idleStateWaitKey_ = setTimeout(function() {
      self.idleStateWaitKey_ = null;
      self.log_('Tab looks ready; notifying listeners');
      while (self.readyListeners_.length) {
        if (!self.isReady_) {
          self.log_('Tab is loading another page');
          return;
        }
        self.readyListeners_.shift()(self.browserTab_);
      }
    }, 100);
  }
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
  self.log_('Preparing command: ' + JSON.stringify(command));
  this.whenReady(function(tab) {
    self.log_('Sending command: ' + JSON.stringify(command));

    var removeResponseListener = goog.bind(self.removeListener, self,
        safaridriver.message.Type.RESPONSE, onResponse);

    if (opt_timeout > 0) {
      var start = goog.now();
      var timeoutKey = setTimeout(function() {
        removeResponseListener();
        if (response.isPending()) {
          response.reject(new bot.Error(bot.ErrorCode.SCRIPT_TIMEOUT,
              'Timed out awaiting response to command "' + command.getName() +
              '" after ' + (goog.now() - start) + ' ms'));
        }
      }, opt_timeout);
    }

    message.send(tab.page);
    self.addListener(safaridriver.message.Type.RESPONSE, onResponse);

    function onResponse(message) {
      if (!response.isPending()) {
        // Whoops! We shouldn't be listening for responses anymore.
        removeResponseListener();
        return;
      }

      if (message.getId() !== command.getId()) {
        self.log_(
            'Ignoring response to another command: ' + message +
                ' (' + command.getId() + ')',
            goog.debug.Logger.Level.FINE);
        return;
      }

      if (!response.isPending()) {
        self.log_(
            'Received command response after promise has been ' +
                'resolved; perhaps it previously timed-out? ' + message,
            goog.debug.Logger.Level.WARNING);
        return;
      }

      removeResponseListener();
      clearTimeout(timeoutKey);
      try {
        response.resolve(bot.response.checkResponse(message.getResponse()));
      } catch (ex) {
        response.reject(ex);
      }
    }
  });

  return response.promise;
};


/**
 * @param {!SafariExtensionMessageEvent} e The message event.
 * @private
 */
safaridriver.extension.Tab.prototype.onMessage_ = function(e) {
  try {
    var message = safaridriver.message.Message.fromEvent(e);
  } catch (ex) {
    this.log_(
        'Unable to parse message: ' + e.name + ': ' +
            JSON.stringify(e.message),
        goog.debug.Logger.Level.SEVERE,
        ex);
    return;
  }

  this.log_('Received message: ' + message);
  switch (message.getType()) {
    case safaridriver.message.Type.LOADED:
      this.onLoad_();
      break;

    case safaridriver.message.Type.UNLOADED:
      this.onUnload_();
      break;
  }

  this.emit(message.getType(), message);
};
