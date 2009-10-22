// Copyright 2006 Google Inc.
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
 * @fileoverview This event handler allows you to catch focusin and focusout
 * events on  descendants. Unlike the "focus" and "blur" events which do not
 * propagate consistently, and therefore must be added to the element that is
 * focused, this allows you to attach one listener to an ancester and you will
 * be notified when the focus state changes of ony of its descendants.
 */

goog.provide('goog.events.FocusHandler');

goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventTarget');
goog.require('goog.userAgent');


/**
 * This event handler allows you to catch focus events when descendants gain or
 * loses focus.
 * @param {Element|Document} element  The node to listen on.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.events.FocusHandler = function(element) {
  goog.events.EventTarget.call(this);

  /**
   * This is the element that we will listen to the real focus events on.
   * @type {Element|Document}
   * @private
   */
  this.element_ = element;

  // In IE we use focusin/focusout and in other browsers we use a capturing
  // listner for focus/blur
  var typeIn = goog.userAgent.IE ? 'focusin' : 'focus';
  var typeOut = goog.userAgent.IE ? 'focusout' : 'blur';

  /**
   * Store the listen key so it easier to unlisten in dispose.
   * @private
   * @type {string}
   */
  this.listenKeyIn_ = goog.events.listen(this.element_, typeIn,
                                         this, !goog.userAgent.IE);

  /**
   * Store the listen key so it easier to unlisten in dispose.
   * @private
   * @type {string}
   */
  this.listenKeyOut_ = goog.events.listen(this.element_, typeOut,
                                          this, !goog.userAgent.IE);
};
goog.inherits(goog.events.FocusHandler, goog.events.EventTarget);


/**
 * Enum type for the events fired by the focus handler
 * @enum {string}
 */
goog.events.FocusHandler.EventType = {
  FOCUSIN: 'focusin',
  FOCUSOUT: 'focusout'
};


/**
 * This handles the underlying events and dispatches a new event.
 * @param {goog.events.BrowserEvent} e  The underlying browser event.
 */
goog.events.FocusHandler.prototype.handleEvent = function(e) {
  var be = e.getBrowserEvent();
  var event = new goog.events.BrowserEvent(be);
  event.type = e.type == 'focusin' || e.type == 'focus' ?
      goog.events.FocusHandler.EventType.FOCUSIN :
      goog.events.FocusHandler.EventType.FOCUSOUT;
  try {
    this.dispatchEvent(event);
  } finally {
    event.dispose();
  }
};


/**
 * Disposes the focus handler.
 */
goog.events.FocusHandler.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.events.FocusHandler.superClass_.dispose.call(this);
    goog.events.unlistenByKey(this.listenKeyIn_);
    goog.events.unlistenByKey(this.listenKeyOut_);
    this.element_ = null;
  }
};
