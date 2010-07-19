// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 *
*
 */

goog.provide('goog.events.ActionEvent');
goog.provide('goog.events.ActionHandler');
goog.provide('goog.events.ActionHandler.EventType');
goog.provide('goog.events.BeforeActionEvent');

goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');

/**
 * A wrapper around an element that you want to listen to ACTION events on.
 * @param {Element|Document} element The element or document to listen on.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.events.ActionHandler = function(element) {
  goog.events.EventTarget.call(this);

  /**
   * This is the element that we will listen to events on.
   * @type {Element|Document}
   * @private
   */
  this.element_ = element;

  goog.events.listen(element, goog.events.ActionHandler.KEY_EVENT_TYPE_,
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
 * Key event type to listen for.
 * @type {string}
 * @private
 */
goog.events.ActionHandler.KEY_EVENT_TYPE_ = goog.userAgent.GECKO ?
    goog.events.EventType.KEYPRESS :
    goog.events.EventType.KEYDOWN;


/**
 * Handles key press events.
 * @param {!goog.events.BrowserEvent} e The key press event.
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
 * @param {!goog.events.BrowserEvent} e The click event.
 * @private
 */
goog.events.ActionHandler.prototype.handleClick_ = function(e) {
  this.dispatchEvents_(e);
};


/**
 * Dispatches BeforeAction and Action events to the element
 * @param {!goog.events.BrowserEvent} e The event causing dispatches.
 * @private
 */
goog.events.ActionHandler.prototype.dispatchEvents_ = function(e) {
  var beforeActionEvent = new goog.events.BeforeActionEvent(e);

  try {
    // Allow application specific logic here before the ACTION event.
    // For example, Gmail uses this event to restore keyboard focus
    if (!this.dispatchEvent(beforeActionEvent)) {
      // If the listener swallowed the BEFOREACTION event, don't dispatch the
      // ACTION event.
      return;
    }
  } finally {
    beforeActionEvent.dispose();
  }


  // Wrap up original event and send it off
  var actionEvent = new goog.events.ActionEvent(e);
  try {
    this.dispatchEvent(actionEvent);
  } finally {
    actionEvent.dispose();

    // Stop propagating the event
    e.stopPropagation();
  }
};


/**
 * Disposes of the action handler.
 */
goog.events.ActionHandler.prototype.disposeInternal = function() {
  goog.events.ActionHandler.superClass_.disposeInternal.call(this);
  goog.events.unlisten(this.element_, goog.events.ActionHandler.KEY_EVENT_TYPE_,
      this.handleKeyDown_, false, this);
  goog.events.unlisten(this.element_, goog.events.EventType.CLICK,
      this.handleClick_, false, this);
  delete this.element_;
};



/**
 * This class is used for the goog.events.ActionHandler.EventType.ACTION event.
 * @param {!goog.events.BrowserEvent} browserEvent Browser event object.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
goog.events.ActionEvent = function(browserEvent) {
  goog.events.BrowserEvent.call(this, browserEvent.getBrowserEvent());
  this.type = goog.events.ActionHandler.EventType.ACTION;
};
goog.inherits(goog.events.ActionEvent, goog.events.BrowserEvent);



/**
 * This class is used for the goog.events.ActionHandler.EventType.BEFOREACTION
 * event. BEFOREACTION gives a chance to the application so the keyboard focus
 * can be restored back, if required.
 * @param {!goog.events.BrowserEvent} browserEvent Browser event object.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
goog.events.BeforeActionEvent = function(browserEvent) {
  goog.events.BrowserEvent.call(this, browserEvent.getBrowserEvent());
  this.type = goog.events.ActionHandler.EventType.BEFOREACTION;
};
goog.inherits(goog.events.BeforeActionEvent, goog.events.BrowserEvent);
