// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview This event handler will dispatch events when
 * {@code navigator.onLine} changes.  HTML5 defines two events, online and
 * offline that is fired on the window.  As of today 3 browsers support these
 * events: Firefox 3 (Gecko 1.9), Opera 9.5, and IE8.  If we have any of these
 * we listen to the 'online' and 'offline' events on the current window
 * object.  Otherwise we poll the navigator.onLine property to detect changes.
 *
 * Note that this class only reflects what the browser tells us and this usually
 * only reflects changes to the File -> Work Offline menu item.
 *
*
 * @see ../demos/onlinehandler.html
 */

// TODO(user): We should probably implement some kind of polling service and/or
// a poll for changes event handler that can be used to fire events when a state
// changes.

goog.provide('goog.events.OnlineHandler');
goog.provide('goog.events.OnlineHandler.EventType');

goog.require('goog.Timer');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.userAgent');


/**
 * Basic object for detecting whether the online state changes.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.events.OnlineHandler = function() {
  goog.events.EventTarget.call(this);

  this.eventHandler_ = new goog.events.EventHandler(this);

  // Earlier WebKit versions do not support navigator.onLine and therefore we
  // don't bother setting up events or timers.
  if (!goog.userAgent.WEBKIT ||
      goog.userAgent.WEBKIT && goog.userAgent.isVersion('528')) {
    if (goog.events.OnlineHandler.supportsHtml5Events_()) {
      this.eventHandler_.listen(document.body, ['online', 'offline'],
                                this.handleChange_);
    } else {
      this.online_ = this.isOnline();
      this.timer_ = new goog.Timer(goog.events.OnlineHandler.POLL_INTERVAL_);
      this.eventHandler_.listen(this.timer_, goog.Timer.TICK, this.handleTick_);
      this.timer_.start();
    }
  }
};
goog.inherits(goog.events.OnlineHandler, goog.events.EventTarget);


/**
 * Enum for the events dispatched by the OnlineHandler.
 * @enum {string}
 */
goog.events.OnlineHandler.EventType = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};


/**
 * The time to wait before checking the {@code navigator.onLine} again.
 * @type {number}
 * @private
 */
goog.events.OnlineHandler.POLL_INTERVAL_ = 250;


/**
 * @private
 * @return {boolean} Whether the browser supports the HTML5 offline events.
 */
goog.events.OnlineHandler.supportsHtml5Events_ = function() {
  return goog.userAgent.GECKO && goog.userAgent.isVersion('1.9b') ||
      goog.userAgent.IE && goog.userAgent.isVersion('8') ||
      goog.userAgent.OPERA && goog.userAgent.isVersion('9.5') ||
      goog.userAgent.WEBKIT && goog.userAgent.isVersion('528');
};


/**
 * Stores the last value of the online state so we can detect if this has
 * changed.
 * @type {boolean}
 * @private
 */
goog.events.OnlineHandler.prototype.online_;


/**
 * The timer object used to poll the online state.
 * @type {goog.Timer}
 * @private
 */
goog.events.OnlineHandler.prototype.timer_;


/**
 * Event handler to simplify event listening.
 * @type {goog.events.EventHandler}
 * @private
 */
goog.events.OnlineHandler.prototype.eventHandler_;


/**
 * Returns whether or not the system is online. This method works properly
 * regardless of whether or not the listener IsListening.
 * @return {boolean} Whether the browser is currently thinking it is online.
 */
goog.events.OnlineHandler.prototype.isOnline = function() {
  return 'onLine' in navigator ? navigator.onLine : true;
};


/**
 * Called every time the timer ticks to see if the state has changed and when
 * the online state changes the method handleChange_ is called.
 * @param {goog.events.Event} e The event object.
 * @private
 */
goog.events.OnlineHandler.prototype.handleTick_ = function(e) {
  var online = this.isOnline();
  if (online != this.online_) {
    this.online_ = online;
    this.handleChange_(e);
  }
};


/**
 * Called when the online state changes.  This dispatches the
 * {@code ONLINE} and {@code OFFLINE} events respectively.
 * @param {goog.events.Event} e The event object.
 * @private
 */
goog.events.OnlineHandler.prototype.handleChange_ = function(e) {
  var type = this.isOnline() ?
      goog.events.OnlineHandler.EventType.ONLINE :
      goog.events.OnlineHandler.EventType.OFFLINE;
  this.dispatchEvent(type);
};


/**
 * @inheritDoc
 */
goog.events.OnlineHandler.prototype.disposeInternal = function() {
  goog.events.OnlineHandler.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
  delete this.eventHandler_;
  if (this.timer_) {
    this.timer_.dispose();
    delete this.timer_;
  }
};
