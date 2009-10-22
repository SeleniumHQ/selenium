// Copyright 2007 Google Inc.
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
 * @fileoverview This file contains a class to provide a unified mechanism for
 * CLICK and enter KEYDOWN events. This provides better accessibility by
 * providing the given functionality to a keyboard user which is otherwise
 * would be available only via a mouse click.
 *
 * If there is an existing CLICK listener or planning to be added as below -
 *
 * <code>this.eventHandler_.listen(el, CLICK, this.onClick_);<code>
 *
 * it can be replaced with an ACTION listener as follows:
 *
 * <code>this.eventHandler_.listen(
 *    new goog.events.ActionHandler(el),
 *    ACTION,
 *    this.onAction_);<code>
 */

goog.provide('goog.events.ActionEvent');
goog.provide('goog.events.ActionHandler');
goog.provide('goog.events.ActionHandler.EventType');

goog.require('goog.events.EventTarget');
goog.require('goog.events.KeyCodes');

/**
 * A wrapper around an element that you want to listen to ACTION events on.
 * @param {Element|Document} element The element or document to listen on.
 * @constructor
 * @extends goog.events.EventTarget
 */
goog.events.ActionHandler = function(element) {
  goog.events.EventTarget.call(this);

  /**
   * This is the element that we will listen to events on.
   * @type {Element|Document}
   * @private
   */
  this.element_ = element;

  goog.events.listen(element, goog.events.EventType.KEYDOWN,
      this.handleKeyDown_, false, this);
  goog.events.listen(element, goog.events.EventType.CLICK,
      this.handleClick_, false, this);
};
goog.inherits(goog.events.ActionHandler, goog.events.EventTarget);


/**
 * Enum type for the events fired by the action handler
 * @enum {string}
 */
goog.events.ActionHandler.EventType = {
  ACTION: 'action',
  BEFOREACTION: 'beforeaction'
};


/**
 * Handles key press events.
 * @param {goog.event.BrowserEvent} e The key press event.
 * @private
 */
goog.events.ActionHandler.prototype.handleKeyDown_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ENTER ||
      goog.userAgent.WEBKIT && e.keyCode == goog.events.KeyCodes.MAC_ENTER) {
    this.dispatchEvents_(e);
  }
};


/**
 * Handles mouse events.
 * @param {goog.event.BrowserEvent} e The click event.
 * @private
 */
goog.events.ActionHandler.prototype.handleClick_ = function(e) {
  this.dispatchEvents_(e);
};


/**
 * Dispatches BeforeAction and Action events to the element
 * @param {goog.event.BrowserEvent} e The event causing dispatches.
 * @private
 */
goog.events.ActionHandler.prototype.dispatchEvents_ = function(e) {
  var beforeActionEvent = new goog.events.BeforeActionEvent(e);

  var dispatched = false;
  try {
    // Allow application specific logic here before the ACTION event.
    // For example, Finto uses this event to restore keyboard focus
    dispatched = this.dispatchEvent(beforeActionEvent);
  } finally {
    beforeActionEvent.dispose();
  }

  if (dispatched) {
    return true;
  }

  // Wrap up original event and send it off
  var actionEvent = new goog.events.ActionEvent(e);
  try {
    this.dispatchEvent(actionEvent);
  } finally {
    actionEvent.dispose();

    // Stop propogating the event 
    e.stopPropagation();
  }
};


/**
 * Disposes the actionhandler.
 */
goog.events.ActionHandler.prototype.dispose = function() {
  if (!this.getDisposed()) {
    goog.events.ActionHandler.superClass_.dispose.call(this);
    goog.events.unlisten(this.element_, goog.events.EventType.KEYDOWN,
        this.handleKeyDown_, false, this);
    goog.events.unlisten(this.element_, goog.events.EventType.CLICK,
        this.handleClick_, false, this);
    this.element_ = null;
  }
};


/**
 * This class is used for the goog.event.ActionHandler.EventType.ACTION event.
 * @param {Object} browserEvent Browser event object.
 * @constructor
 * @extends goog.events.BrowserEvent
 */
goog.events.ActionEvent = function(browserEvent) {
  goog.events.BrowserEvent.call(this, browserEvent);
  this.type = goog.events.ActionHandler.EventType.ACTION;
};
goog.inherits(goog.events.ActionEvent, goog.events.BrowserEvent);


/**
 * This class is used for the goog.event.ActionHandler.EventType.BEFOREACTION
 * event. BEFOREACTION gives a chance to the application (such as Pinto) so the
 * keyboard focus can be restored back, if required.
 * @param {Object} browserEvent Browser event object.
 * @constructor
 * @extends goog.events.BrowserEvent
 */
goog.events.BeforeActionEvent = function(browserEvent) {
  goog.events.BrowserEvent.call(this, browserEvent);
  this.type = goog.events.ActionHandler.EventType.BEFOREACTION;
};
goog.inherits(goog.events.BeforeActionEvent, goog.events.BrowserEvent);
