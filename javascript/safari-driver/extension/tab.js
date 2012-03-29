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

goog.require('goog.Uri');
goog.require('goog.debug.Logger');
goog.require('goog.string');


/**
 * Tracks a single SafariBrowserTab.
 * @param {!SafariBrowserTab} browserTab The tab to track.
 * @constructor
 */
safaridriver.extension.Tab = function(browserTab) {

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

  var onBeforeNavigate = goog.bind(this.onBeforeNavigate_, this);
  var onNavigate = goog.bind(this.onNavigate_, this);

  browserTab.addEventListener('beforeNavigate', onBeforeNavigate, false);
  browserTab.addEventListener('navigate', onNavigate, false);
  browserTab.addEventListener('close', function() {
    browserTab.removeEventListener('beforeNavigate', onBeforeNavigate, false);
    browserTab.removeEventListener('navigate', onNavigate, false);
  }, false);
};


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
 * @private
 */
safaridriver.extension.Tab.prototype.log_ = function(msg, opt_level) {
  var level = opt_level || goog.debug.Logger.Level.INFO;
  safaridriver.extension.Tab.LOG_.log(level, '[' + this.id_ + '] ' + msg);
};


/**
 * Schedules a command for execution when this tab is no longer between page
 * navigation events.
 * @param {function(!SafariBrowserTab)} callback The function to invoke when
 *     this command is ready.
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
  return from.toString() === to.toString() ||
      from.setFragment('').toString() !== to.setFragment('').toString();
};


/**
 * @param {SafariBeforeNavigateEvent} e The before navigate event.
 * @private
 */
safaridriver.extension.Tab.prototype.onBeforeNavigate_ = function(e) {
  if (this.loadsNewPage(e.url)) {
    this.log_('Tab is about to load a URL: ' + e.url);
    this.isReady_ = false;
    if (this.idleStateWaitKey_) {
      clearTimeout(this.idleStateWaitKey_);
      this.idleStateWaitKey_ = null;
    }
  }
};


/** @private */
safaridriver.extension.Tab.prototype.onNavigate_ = function() {
  this.log_('New URL loaded; waiting for idle state');
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
 * @param {!webdriver.Command} command The command to send.
 * @param {number=} opt_timeout How long, in milliseconds, to wait for a
 *     response before timing out. If not specified, or non-positive, no timeout
 *     will be applied.
 * @return {!webdriver.promise.Promise} A promise that will be resolved with
 *     the message
 */
safaridriver.extension.Tab.prototype.send = function(command, opt_timeout) {
  var id = goog.string.getRandomString();

  var response = new webdriver.promise.Deferred();
  var safariCommand = new safaridriver.Command(id, command);
  var message = new safaridriver.message.CommandMessage(safariCommand);

  var log = goog.bind(this.log_, this);
  log('Preparing command: ' + JSON.stringify(safariCommand));
  this.whenReady(function(tab) {
    log('Sending command: ' + JSON.stringify(safariCommand));

    tab.addEventListener('message', onMessage, false);

    if (opt_timeout && opt_timeout > 0) {
      var start = goog.now();
      var timeoutKey = setTimeout(function() {
        if (response.isPending()) {
          response.reject(new bot.Error(bot.ErrorCode.SCRIPT_TIMEOUT,
              'Timed out awaiting response to command "' + command.getName() +
              '" after ' + (goog.now() - start) + ' ms'));
        }
      }, opt_timeout);
    }

    message.send(tab.page);

    function onMessage(e) {
      try {
        var message = safaridriver.message.Message.fromEvent(e);
      } catch (ex) {
        log(goog.debug.Logger.Level.SEVERE,
            'Unable to parse message: ' + e.name + ': ' +
                JSON.stringify(e.message),
            ex);
        return;
      }

      if (!message.isType(safaridriver.message.Type.RESPONSE)) {
        log(goog.debug.Logger.Level.FINE,
            'Ignoring non-response message: ' + JSON.stringify(e.message));
        return;
      }

      if (message.getId() !== id) {
        log(goog.debug.Logger.Level.FINE,
            'Ignoring response to another command: ' + e.message.id +
                ' (' + id + ')');
        return;
      }

      if (!response.isPending()) {
        log(goog.debug.Logger.Level.WARNING,
            'Received command response after promise has been ' +
                'resolved; perhaps it previously timed-out? ' +
                JSON.stringify(e.message));
        return;
      }

      tab.removeEventListener('message', onMessage, false);
      clearTimeout(timeoutKey);
      try {
        response.resolve(webdriver.error.checkResponse(message.getResponse()));
      } catch (ex) {
        response.reject(ex);
      }
    }
  });

  return response.promise;
};
