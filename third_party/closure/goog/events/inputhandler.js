// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview An object that encapsulates text changed events for textareas
 * and input element of type text and password. This event only occurs when the
 * element is focused (which means that using drag and drop will not trigger
 * the event because the element does not have focus at that time).<br>
 * <br>
 * Note: this does not guarantee the correctness of {@code keyCode} or
 * {@code charCode}, or attempt to unify them across browsers. See
 * {@code goog.events.KeyHandler} for that functionality.<br>
 * <br>
 * Known Issues: It does not trigger for drop events
 * Known Issues: WebKit does not fire input event in textareas.
 * @see ../demos/inputhandler.html
 */

goog.provide('goog.events.InputHandler');
goog.provide('goog.events.InputHandler.EventType');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventTarget');
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

  // WebKit before version 531 did not support input events for textareas.
  // keypress isn't as good (doesn't support copy/paste), but it's better than
  // nothing
  var type = goog.userAgent.IE ? 'propertychange' :
      (goog.userAgent.WEBKIT && element.tagName == 'TEXTAREA' &&
          !goog.userAgent.isVersion('531') ? 'keypress' : 'input');
  this.listenKey_ = goog.events.listen(this.element_, type, this);
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
 * This handles the underlying events and dispatches a new event as needed.
 * @param {goog.events.BrowserEvent} e The underlying browser event.
 */
goog.events.InputHandler.prototype.handleEvent = function(e) {
  var be = e.getBrowserEvent();
  if (be.type == 'propertychange' && be.propertyName == 'value' ||
      be.type == 'input' ||
      be.type == 'keypress') {
    if (goog.userAgent.IE || goog.userAgent.OPERA) {
      var inputEl = be.srcElement;
      // only dispatch the event if the element currently has focus
      if (inputEl != goog.dom.getOwnerDocument(inputEl).activeElement) {
        return;
      }
    }
    var event = new goog.events.BrowserEvent(be);
    event.type = goog.events.InputHandler.EventType.INPUT;
    try {
      this.dispatchEvent(event);
    } finally {
      event.dispose();
    }
  }
};


/**
 * Disposes of the input handler.
 */
goog.events.InputHandler.prototype.disposeInternal = function() {
  goog.events.InputHandler.superClass_.disposeInternal.call(this);
  goog.events.unlistenByKey(this.listenKey_);
  delete this.element_;
};
