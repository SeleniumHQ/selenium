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

goog.provide('safaridriver.Tab');

goog.require('goog.debug.Logger');
goog.require('goog.string');
goog.require('safaridriver.message.MessageTarget');



/**
 * @param {!(SafariEventTarget|EventTarget)} source The object that should be
 *     used as the source of messages for this tab.
 * @constructor
 * @extends {safaridriver.message.MessageTarget}
 */
safaridriver.Tab = function(source) {
  goog.base(this, source);
  this.setLogger('safaridriver.Tab');

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
   * @type {!Array.<function()>}
   * @private
   */
  this.readyListeners_ = [];
};
goog.inherits(safaridriver.Tab, safaridriver.message.MessageTarget);


/**
 * @type {?number}
 * @private
 */
safaridriver.Tab.prototype.idleStateWaitKey_ = null;


/** @return {string} This tab's ID. */
safaridriver.Tab.prototype.getId = function() {
  return this.id_;
};


/** @override */
safaridriver.Tab.prototype.log = function(msg, opt_level, opt_error) {
  goog.base(this, 'log', '[' + this.id_ + '] ' + msg, opt_level, opt_error);
};


/**
 * @return {boolean} Whether this tab is currently loading content and should
 *     delay further action upon the page.
 */
safaridriver.Tab.prototype.isReady = function() {
  return this.isReady_;
};


/**
 * Schedules a function to execute when this tab is no longer loading content.
 * @param {function()} callback The function to call.
 */
safaridriver.Tab.prototype.whenReady = function(callback) {
  if (this.isReady_) {
    callback();
  } else {
    this.log('Tab is not ready; registering callback',
        goog.debug.Logger.Level.FINER);
    this.readyListeners_.push(callback);
  }
};


/**
 * Notifies the registered listeners that this tab is ready to continue.
 */
safaridriver.Tab.prototype.notifyReady = function() {
  this.log('Tab may be ready; waiting for idle state');
  var self = this;
  if (!self.idleStateWaitKey_) {
    self.idleStateWaitKey_ = setTimeout(function() {
      self.isReady_ = true;
      self.idleStateWaitKey_ = null;
      self.log('Tab looks ready; notifying listeners');
      while (self.readyListeners_.length) {
        if (!self.isReady_) {
          self.log('Tab is no longer ready');
          return;
        }
        var callback = self.readyListeners_.shift();
        callback();
      }
    }, 100);
  }
};


/**
 * Signals that this tab is not ready to process commands and should start
 * enqueing callbacks. The tab will not invoke the calblacks until
 * {@link #notifyReady} is called.
 */
safaridriver.Tab.prototype.notifyUnready = function() {
  this.log('Tab is not ready');
  this.isReady_ = false;
  if (this.idleStateWaitKey_) {
    clearTimeout(this.idleStateWaitKey_);
    this.idleStateWaitKey_ = null;
  }
};
