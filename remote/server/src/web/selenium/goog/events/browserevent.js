// Copyright 2005 Google Inc.
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
 * @fileoverview A patched, standardized event object for browser events.
 *
 * <pre>
 * The patched event object contains the following members:
 * - type           {String}    Event type, e.g. 'click'
 * - timestamp      {Date}      A date object for when the event was fired
 * - target         {Object}    The element that actually triggered the event
 * - currentTarget  {Object}    The element the listener is attached to
 * - relatedTarget  {Object}    For mouseover and mouseout, the previous object
 * - offsetX        {Number}    X-coordinate relative to target
 * - offsetY        {Number}    Y-coordinate relative to target
 * - clientX        {Number}    X-coordinate relative to viewport
 * - clientY        {Number}    Y-coordinate relative to viewport
 * - screenX        {Number}    X-coordinate relative to the edge of the screen
 * - screenY        {Number}    Y-coordinate relative to the edge of the screen
 * - button         {Number}    Mouse button. Use isButton() to test.
 * - keyCode        {Number}    Key-code
 * - ctrlKey        {Boolean}   Was ctrl key depressed
 * - altKey         {Boolean}   Was alt key depressed
 * - shiftKey       {Boolean}   Was shift key depressed
 * </pre>
 */

goog.provide('goog.events.BrowserEvent');

goog.require('goog.events.Event');
goog.require('goog.userAgent');

/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * The content of this object will not be initialized if no event object is
 * provided. If this is the case, init() needs to be invoked separately.
 * @param {Event} opt_e Browser event object.
 * @param {Node} opt_currentTarget Current target for event.
 * @constructor
 */
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
 if (opt_e) {
   this.init(opt_e, opt_currentTarget);
 }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);


/**
 * Normalized button constants for the mouse.
 * @enum number
 */
goog.events.BrowserEvent.MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};


/**
 * Static data for mapping mouse buttons.
 * @type {Array.<number>}
 * @private
 */
goog.events.BrowserEvent.IEButtonMap_ = [
    1, // LEFT
    4, // MIDDLE
    2  // RIGHT
];


/**
 * Event type
 * @type {string?}
 */
 goog.events.BrowserEvent.prototype.type = null;


/**
 * Target that fired the event
 * @type {Node?}
 */
goog.events.BrowserEvent.prototype.target = null;


/**
 * Node that had the listener attached
 * @type {Node?}
 */
goog.events.BrowserEvent.prototype.currentTarget = null;


/**
 * For mouseover and mouseout events, the related object for the event
 * @type {Node?}
 */
goog.events.BrowserEvent.prototype.relatedTarget = null;


/**
 * X-coordinate relative to target
 * @type {number}
 */
goog.events.BrowserEvent.prototype.offsetX = 0;


/**
 * Y-coordinate relative to target
 * @type {number}
 */
goog.events.BrowserEvent.prototype.offsetY = 0;


/**
 * X-coordinate relative to the window
 * @type {number}
 */
goog.events.BrowserEvent.prototype.clientX = 0;


/**
 * Y-coordinate relative to the window
 * @type {number}
 */
goog.events.BrowserEvent.prototype.clientY = 0;


/**
 * X-coordinate relative to the monitor
 * @type {number}
 */
goog.events.BrowserEvent.prototype.screenX = 0;


/**
 * Y-coordinate relative to the monitor
 * @type {number}
 */
goog.events.BrowserEvent.prototype.screenY = 0;


/**
 * Which mouse button was pressed
 * @type {number}
 */
goog.events.BrowserEvent.prototype.button = 0;


/**
 * Keycode of key press
 * @type {number}
 */
goog.events.BrowserEvent.prototype.keyCode = 0;


/**
 * Keycode of key press
 * @type {number}
 */
goog.events.BrowserEvent.prototype.charCode = 0;


/**
 * Whether control was pressed at time of event
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.ctrlKey = false;


/**
 * Whether alt was pressed at time of event
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.altKey = false;


/**
 * Whether shift was pressed at time of event
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.shiftKey = false;


/**
 * Whether the meta key was pressed at time of event
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.metaKey = false;


/**
 * The browser event object
 * @type {Event?}
 * @private
 */
goog.events.BrowserEvent.prototype.event_ = null;


/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * @param {Event} e Browser event object.
 * @param {Node} opt_currentTarget Current target for event.
 */
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  this.type = e.type;
  this.target = e.target || e.srcElement;
  this.currentTarget = opt_currentTarget;
  if (e.relatedTarget) {
    this.relatedTarget = e.relatedTarget;
  } else if (this.type == goog.events.EventType.MOUSEOVER) {
    this.relatedTarget = e.fromElement;
  } else if (this.type == goog.events.EventType.MOUSEOUT) {
    this.relatedTarget = e.toElement;
  } else {
    this.relatedTarget = null;
  }

  this.offsetX = typeof e.layerX == 'number' ? e.layerX : e.offsetX;
  this.offsetY = typeof e.layerY == 'number' ? e.layerY : e.offsetY;
  this.clientX = typeof e.clientX == 'number' ? e.clientX : e.pageX;
  this.clientY = typeof e.clientY == 'number' ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;

  this.button = e.button;

  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode ||
                 (this.type == goog.events.EventType.KEYPRESS ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.event_ = e;
  this.returnValue_ = null;
  this.propagationStopped_ = null;
};

/**
 * Tests to see which button was pressed during the event. This is really
 * only useful in IE and Gecko browsers. Safari and Opera report that the
 * left button was clicked. Safari expects a 1-button mouse, and Opera has
 * default behavior for left and middle click that can only be overridden
 * via a configuration setting. There's a nice table of this mess at
 * http://www.unixpapa.com/js/mouse.html.
 *
 * @param {goog.events.BrowserEvent.MouseButton} button The button
 *     to test for.
 * @return {boolean} True if button was pressed.
 */
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if (goog.userAgent.IE) {
    return !!(this.event_.button &
        goog.events.BrowserEvent.IEButtonMap_[button]);
  } else {
    return this.event_.button == button;
  }
};


/**
 * Override the stop propogation method and give it access to the original
 * event
 */
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
  if (this.event_.stopPropagation) {
    this.event_.stopPropagation();
  } else {
    this.event_.cancelBubble = true;
  }
};


/**
 * Override preventDefault and allow access to the original event through a
 * closure
 */
goog.events.BrowserEvent.prototype.preventDefault = function() {
  this.returnValue_ = false;
  if (!this.event_.preventDefault) {
    this.event_.returnValue = false;
    /** @preserveTry */
    try {
      this.event_.keyCode = -1;
    } catch (ex) {
      // IE 7 throws an 'access denied' exception when trying to change
      // keyCode in some situations (e.g. srcElement is input[type=file],
      // or srcElement is an anchor tag rewritten by parent's innerHTML).
      // Do nothing in this case.
    }
  } else {
    this.event_.preventDefault();
  }
};


/**
 * Returns the underlying browser event object
 */
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_;
};


/**
 * Disposes the object
 */
goog.events.BrowserEvent.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.events.Event.prototype.dispose.call(this);
    this.event_ = null;
  }
};
