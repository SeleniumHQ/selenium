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
 * @fileoverview An object that encapsulates text changed events for textareas
 * and input element of type text and password. The event occurs after the value
 * has been changed. The event does not occur if value was changed
 * programmatically.<br>
 * <br>
 * Note: this does not guarantee the correctness of {@code keyCode} or
 * {@code charCode}, or attempt to unify them across browsers. See
 * {@code goog.events.KeyHandler} for that functionality.<br>
 * <br>
 * Known issues:
 * <ul>
 * <li>Does not trigger for drop events on Opera due to browser bug.
 * <li>IE doesn't have native support for input event. WebKit before version 531
 *     doesn't have support for textareas. For those browsers an emulation mode
 *     based on key, clipboard and drop events is used. Thus this event won't
 *     trigger in emulation mode if text was modified by context menu commands
 *     such as 'Undo' and 'Delete'.
 * </ul>
*
 * @see ../demos/inputhandler.html
 */

goog.provide('goog.events.InputHandler');
goog.provide('goog.events.InputHandler.EventType');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');


/**
 * This event handler will dispatch events when the user types into a text
 * input, password input or a textarea
 * @param {Element} element  The element that you want to listen for input
 *     events on.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.events.InputHandler = function(element) {
  goog.events.EventTarget.call(this);

  /**
   * The element that you want to listen for input events on.
   * @type {Element}
   * @private
   */
  this.element_ = element;

  /**
   * Whether input event is emulated.
   * IE doesn't support input events. We could use property change events but
   * they are broken in many ways:
   * - Fire even if value was changed programmatically.
   * - Aren't always delivered. For example, if you change value or even width
   *   of input programmatically, next value change made by user won't fire an
   *   event.
   * WebKit before version 531 did not support input events for textareas.
   * @type {boolean}
   * @private
   */
  this.inputEventEmulation_ =
      goog.userAgent.IE ||
      (goog.userAgent.WEBKIT && !goog.userAgent.isVersion('531') &&
          element.tagName == 'TEXTAREA');

  /**
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler();
  this.eventHandler_.listen(
      this.element_,
      this.inputEventEmulation_ ? ['keydown', 'paste', 'cut', 'drop'] : 'input',
      this);
};
goog.inherits(goog.events.InputHandler, goog.events.EventTarget);


/**
 * Enum type for the events fired by the input handler
 * @enum {string}
 */
goog.events.InputHandler.EventType = {
  INPUT: 'input'
};

/**
 * Id of a timer used to postpone firing input event in emulation mode.
 * @type {?number}
 * @private
 */
goog.events.InputHandler.prototype.timer_ = null;


/**
 * This handles the underlying events and dispatches a new event as needed.
 * @param {goog.events.BrowserEvent} e The underlying browser event.
 */
goog.events.InputHandler.prototype.handleEvent = function(e) {
  if (this.inputEventEmulation_) {
    // Filter out key events that don't modify text.
    if (e.type == 'keydown' &&
        !goog.events.KeyCodes.isTextModifyingKeyEvent(e)) {
      return;
    }

    // It is still possible that pressed key won't modify the value of an
    // element. Storing old value will help us to detect modification but is
    // also a little bit dangerous. If value is changed programmatically in
    // another key down handler, we will detect it as user-initiated change.
    var valueBeforeKey = e.type == 'keydown' ? this.element_.value : null;

    // Since key down, paste, cut and drop events are fired before actual value
    // of the element has changed, we need to postpone dispatching input event
    // until value is updated.
    this.cancelTimerIfSet_();
    this.timer_ = goog.Timer.callOnce(function() {
      this.timer_ = null;
      if (this.element_.value != valueBeforeKey) {
        this.dispatchInputEvent_(e.getBrowserEvent());
      }
    }, 0, this);
  } else {
    // Unlike other browsers, Opera fires an extra input event when an element
    // is blurred after the user has input into it. Since Opera doesn't fire
    // input event on drop, it's enough to check whether element still has focus
    // to suppress bogus notification.
    if (!goog.userAgent.OPERA || this.element_ ==
        goog.dom.getOwnerDocument(this.element_).activeElement) {
      this.dispatchInputEvent_(e.getBrowserEvent());
    }
  }
};


/**
 * Cancels timer if it is set, does nothing otherwise.
 * @private
 */
goog.events.InputHandler.prototype.cancelTimerIfSet_ = function() {
  if (this.timer_ != null) {
    goog.Timer.clear(this.timer_);
    this.timer_ = null;
  }
};


/**
 * Dispatches an input event.
 * @param {Event} be The underlying browser event.
 * @private
 */
goog.events.InputHandler.prototype.dispatchInputEvent_ = function(be) {
  var event = new goog.events.BrowserEvent(be);
  event.type = goog.events.InputHandler.EventType.INPUT;
  try {
    this.dispatchEvent(event);
  } finally {
    event.dispose();
  }
};


/**
 * Disposes of the input handler.
 */
goog.events.InputHandler.prototype.disposeInternal = function() {
  goog.events.InputHandler.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
  this.cancelTimerIfSet_();
  delete this.element_;
};
