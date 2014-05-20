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
 * @fileoverview Activity Monitor.
 *
 * Fires throttled events when a user interacts with the specified document.
 * This class also exposes the amount of time since the last user event.
 *
 * If you would prefer to get BECOME_ACTIVE and BECOME_IDLE events when the
 * user changes states, then you should use the IdleTimer class instead.
 *
 */

goog.provide('goog.ui.ActivityMonitor');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * Once initialized with a document, the activity monitor can be queried for
 * the current idle time.
 *
 * @param {goog.dom.DomHelper|Array.<goog.dom.DomHelper>=} opt_domHelper
 *     DomHelper which contains the document(s) to listen to.  If null, the
 *     default document is usedinstead.
 * @param {boolean=} opt_useBubble Whether to use the bubble phase to listen for
 *     events. By default listens on the capture phase so that it won't miss
 *     events that get stopPropagation/cancelBubble'd. However, this can cause
 *     problems in IE8 if the page loads multiple scripts that include the
 *     closure event handling code.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.ActivityMonitor = function(opt_domHelper, opt_useBubble) {
  goog.events.EventTarget.call(this);

  /**
   * Array of documents that are being listened to.
   * @type {Array.<Document>}
   * @private
   */
  this.documents_ = [];

  /**
   * Whether to use the bubble phase to listen for events.
   * @type {boolean}
   * @private
   */
  this.useBubble_ = !!opt_useBubble;

  /**
   * The event handler.
   * @type {goog.events.EventHandler.<!goog.ui.ActivityMonitor>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * Whether the current window is an iframe.
   * TODO(user): Move to goog.dom.
   * @type {boolean}
   * @private
   */
  this.isIframe_ = window.parent != window;

  if (!opt_domHelper) {
    this.addDocument(goog.dom.getDomHelper().getDocument());
  } else if (goog.isArray(opt_domHelper)) {
    for (var i = 0; i < opt_domHelper.length; i++) {
      this.addDocument(opt_domHelper[i].getDocument());
    }
  } else {
    this.addDocument(opt_domHelper.getDocument());
  }

  /**
   * The time (in milliseconds) of the last user event.
   * @type {number}
   * @private
   */
  this.lastEventTime_ = goog.now();

};
goog.inherits(goog.ui.ActivityMonitor, goog.events.EventTarget);


/**
 * The last event type that was detected.
 * @type {string}
 * @private
 */
goog.ui.ActivityMonitor.prototype.lastEventType_ = '';


/**
 * The mouse x-position after the last user event.
 * @type {number}
 * @private
 */
goog.ui.ActivityMonitor.prototype.lastMouseX_;


/**
 * The mouse y-position after the last user event.
 * @type {number}
 * @private
 */
goog.ui.ActivityMonitor.prototype.lastMouseY_;


/**
 * The earliest time that another throttled ACTIVITY event will be dispatched
 * @type {number}
 * @private
 */
goog.ui.ActivityMonitor.prototype.minEventTime_ = 0;


/**
 * Minimum amount of time in ms between throttled ACTIVITY events
 * @type {number}
 */
goog.ui.ActivityMonitor.MIN_EVENT_SPACING = 3 * 1000;


/**
 * If a user executes one of these events, s/he is considered not idle.
 * @type {Array.<goog.events.EventType>}
 * @private
 */
goog.ui.ActivityMonitor.userEventTypesBody_ = [
  goog.events.EventType.CLICK,
  goog.events.EventType.DBLCLICK,
  goog.events.EventType.MOUSEDOWN,
  goog.events.EventType.MOUSEMOVE,
  goog.events.EventType.MOUSEUP
];


/**
 * If a user executes one of these events, s/he is considered not idle.
 * Note: monitoring touch events within iframe cause problems in iOS.
 * @type {Array.<goog.events.EventType>}
 * @private
 */
goog.ui.ActivityMonitor.userTouchEventTypesBody_ = [
  goog.events.EventType.TOUCHEND,
  goog.events.EventType.TOUCHMOVE,
  goog.events.EventType.TOUCHSTART
];


/**
 * If a user executes one of these events, s/he is considered not idle.
 * @type {Array.<goog.events.EventType>}
 * @private
 */
goog.ui.ActivityMonitor.userEventTypesDocuments_ =
    [goog.events.EventType.KEYDOWN, goog.events.EventType.KEYUP];


/**
 * Event constants for the activity monitor.
 * @enum {string}
 */
goog.ui.ActivityMonitor.Event = {
  /** Event fired when the user does something interactive */
  ACTIVITY: 'activity'
};


/** @override */
goog.ui.ActivityMonitor.prototype.disposeInternal = function() {
  goog.ui.ActivityMonitor.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
  this.eventHandler_ = null;
  delete this.documents_;
};


/**
 * Adds a document to those being monitored by this class.
 *
 * @param {Document} doc Document to monitor.
 */
goog.ui.ActivityMonitor.prototype.addDocument = function(doc) {
  if (goog.array.contains(this.documents_, doc)) {
    return;
  }
  this.documents_.push(doc);
  var useCapture = !this.useBubble_;

  var eventsToListenTo = goog.array.concat(
      goog.ui.ActivityMonitor.userEventTypesDocuments_,
      goog.ui.ActivityMonitor.userEventTypesBody_);

  if (!this.isIframe_) {
    // Monitoring touch events in iframe causes problems interacting with text
    // fields in iOS (input text, textarea, contenteditable, select/copy/paste),
    // so just ignore these events. This shouldn't matter much given that a
    // touchstart event followed by touchend event produces a click event,
    // which is being monitored correctly.
    goog.array.extend(eventsToListenTo,
        goog.ui.ActivityMonitor.userTouchEventTypesBody_);
  }

  this.eventHandler_.listen(doc, eventsToListenTo, this.handleEvent_,
      useCapture);
};


/**
 * Removes a document from those being monitored by this class.
 *
 * @param {Document} doc Document to monitor.
 */
goog.ui.ActivityMonitor.prototype.removeDocument = function(doc) {
  if (this.isDisposed()) {
    return;
  }
  goog.array.remove(this.documents_, doc);
  var useCapture = !this.useBubble_;

  var eventsToUnlistenTo = goog.array.concat(
      goog.ui.ActivityMonitor.userEventTypesDocuments_,
      goog.ui.ActivityMonitor.userEventTypesBody_);

  if (!this.isIframe_) {
    // See note above about monitoring touch events in iframe.
    goog.array.extend(eventsToUnlistenTo,
        goog.ui.ActivityMonitor.userTouchEventTypesBody_);
  }

  this.eventHandler_.unlisten(doc, eventsToUnlistenTo, this.handleEvent_,
      useCapture);
};


/**
 * Updates the last event time when a user action occurs.
 * @param {goog.events.BrowserEvent} e Event object.
 * @private
 */
goog.ui.ActivityMonitor.prototype.handleEvent_ = function(e) {
  var update = false;
  switch (e.type) {
    case goog.events.EventType.MOUSEMOVE:
      // In FF 1.5, we get spurious mouseover and mouseout events when the UI
      // redraws. We only want to update the idle time if the mouse has moved.
      if (typeof this.lastMouseX_ == 'number' &&
          this.lastMouseX_ != e.clientX ||
          typeof this.lastMouseY_ == 'number' &&
          this.lastMouseY_ != e.clientY) {
        update = true;
      }
      this.lastMouseX_ = e.clientX;
      this.lastMouseY_ = e.clientY;
      break;
    default:
      update = true;
  }

  if (update) {
    var type = goog.asserts.assertString(e.type);
    this.updateIdleTime(goog.now(), type);
  }
};


/**
 * Updates the last event time to be the present time, useful for non-DOM
 * events that should update idle time.
 */
goog.ui.ActivityMonitor.prototype.resetTimer = function() {
  this.updateIdleTime(goog.now(), 'manual');
};


/**
 * Updates the idle time and fires an event if time has elapsed since
 * the last update.
 * @param {number} eventTime Time (in MS) of the event that cleared the idle
 *     timer.
 * @param {string} eventType Type of the event, used only for debugging.
 * @protected
 */
goog.ui.ActivityMonitor.prototype.updateIdleTime = function(
    eventTime, eventType) {
  // update internal state noting whether the user was idle
  this.lastEventTime_ = eventTime;
  this.lastEventType_ = eventType;

  // dispatch event
  if (eventTime > this.minEventTime_) {
    this.dispatchEvent(goog.ui.ActivityMonitor.Event.ACTIVITY);
    this.minEventTime_ = eventTime + goog.ui.ActivityMonitor.MIN_EVENT_SPACING;
  }
};


/**
 * Returns the amount of time the user has been idle.
 * @param {number=} opt_now The current time can optionally be passed in for the
 *     computation to avoid an extra Date allocation.
 * @return {number} The amount of time in ms that the user has been idle.
 */
goog.ui.ActivityMonitor.prototype.getIdleTime = function(opt_now) {
  var now = opt_now || goog.now();
  return now - this.lastEventTime_;
};


/**
 * Returns the type of the last user event.
 * @return {string} event type.
 */
goog.ui.ActivityMonitor.prototype.getLastEventType = function() {
  return this.lastEventType_;
};


/**
 * Returns the time of the last event
 * @return {number} last event time.
 */
goog.ui.ActivityMonitor.prototype.getLastEventTime = function() {
  return this.lastEventTime_;
};
