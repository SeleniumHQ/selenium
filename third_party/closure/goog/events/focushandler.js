// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This event handler allows you to catch focusin and focusout
 * events on  descendants. Unlike the "focus" and "blur" events which do not
 * propagate consistently, and therefore must be added to the element that is
 * focused, this allows you to attach one listener to an ancester and you will
 * be notified when the focus state changes of ony of its descendants.
 * @author arv@google.com (Erik Arvidsson)
 * @see ../demos/focushandler.html
 */

goog.provide('goog.events.FocusHandler');
goog.provide('goog.events.FocusHandler.EventType');

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
 * @final
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
   * @type {goog.events.Key}
   */
  this.listenKeyIn_ =
      goog.events.listen(this.element_, typeIn, this, !goog.userAgent.IE);

  /**
   * Store the listen key so it easier to unlisten in dispose.
   * @private
   * @type {goog.events.Key}
   */
  this.listenKeyOut_ =
      goog.events.listen(this.element_, typeOut, this, !goog.userAgent.IE);
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
  this.dispatchEvent(event);
};


/** @override */
goog.events.FocusHandler.prototype.disposeInternal = function() {
  goog.events.FocusHandler.superClass_.disposeInternal.call(this);
  goog.events.unlistenByKey(this.listenKeyIn_);
  goog.events.unlistenByKey(this.listenKeyOut_);
  delete this.element_;
};
