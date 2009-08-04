// Copyright 2008 Google Inc.
// All Rights Reserved
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

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
 */

goog.provide('goog.events.OnlineHandler');
goog.provide('goog.events.OnlineHandler.EventType');

goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.userAgent');


/**
 * Basic object for detecting whether the online state changes.
 * @constructor
 * @extends goog.events.EventTarget
 */
goog.events.OnlineHandler = function() {
  goog.events.EventTarget.call(this);

  this.eventHandler_ = new goog.events.EventHandler(this);

  // WebKit does not support navigator.onLine and therefore we don't
  // bother setting up events or timers. See
  // http://bugs.webkit.org/show_bug.cgi?id=11284
  if (!goog.userAgent.WEBKIT) {
    if (goog.events.OnlineHandler.supportsHtml5Events_()) {
      this.eventHandler_.listen(window, ['online', 'offline'],
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
      goog.userAgent.OPERA && goog.userAgent.isVersion('9.5');
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
 * {@inheritDoc}
 * @override
 */
goog.events.OnlineHandler.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.events.OnlineHandler.superClass_.dispose.call(this);
    this.eventHandler_.dispose();
    delete this.eventHandler_;
    if (this.timer_) {
      this.timer_.dispose();
      delete this.timer_;
    }
  }
};
