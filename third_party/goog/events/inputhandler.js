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
 * @fileoverview An object that encapsulates text changed events for textareas
 * and input element of type text and password. This event only occurs when the
 * element is focused (which means that using drag and drop will not trigger
 * the event because the element does not have focus at that time).<br>
 * <br>
 * Known Issues: It does not trigger for drop events
 * Known Issues: WebKit does not fire input event in textareas.
 */

goog.provide('goog.events.InputHandler');

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

  var type = goog.userAgent.IE ? 'propertychange' : 'input';
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
      be.type == 'input') {
    if (goog.userAgent.IE) {
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
 * Disposes the keyhandler.
 */
goog.events.InputHandler.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.events.InputHandler.superClass_.dispose.call(this);
    goog.events.unlistenByKey(this.listenKey_);
    this.element_ = null;
  }
};
