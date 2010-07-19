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
*
 */

goog.provide('goog.ui.ActivityMonitor');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');


/**
 * Once initialized with a document, the activity monitor can be queried for
 * the current idle time.
 * TODO(user): Expand this class to allow it to monitor multiple DOMs.
 *
 * @param {goog.dom.DomHelper|Array.<goog.dom.DomHelper>=} opt_domHelper
 *     DomHelper which contains the document(s) to listen to.  If null, the
 *     default document is usedinstead.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.ActivityMonitor = function(opt_domHelper) {
  goog.events.EventTarget.call(this);

  var documents;
  if (!opt_domHelper) {
    documents = [goog.dom.getDomHelper().getDocument()];
  } else if (goog.isArray(opt_domHelper)) {
    documents = [];
    for (var i = 0; i < opt_domHelper.length; i++) {
       documents.push(opt_domHelper[i].getDocument());
    }
  } else {
    documents = [opt_domHelper.getDocument()];
  }

  /**
   * The document body which is being listened to.
   * @type {Array.<HTMLDocument>}
   * @private
   */
  this.documents_ = documents;

  /**
   * The time (in milliseconds) of the last user event.
   * @type {number}
   * @private
   */
  this.lastEventTime_ = goog.now();

  var eventHandler = new goog.events.EventHandler(this);
  /**
   * The event handler.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = eventHandler;

  // Set up listeners on capture
  for (var i = 0; i < this.documents_.length; i++) {
    eventHandler.listen(
        this.documents_[i], goog.ui.ActivityMonitor.userEventTypesDocuments_,
        this.handleEvent_, true);
    eventHandler.listen(
        this.documents_[i].body, goog.ui.ActivityMonitor.userEventTypesBody_,
        this.handleEvent_, true);
  }
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
goog.ui.ActivityMonitor.userEventTypesBody_ =
  [goog.events.EventType.CLICK, goog.events.EventType.DBLCLICK,
   goog.events.EventType.MOUSEDOWN, goog.events.EventType.MOUSEUP,
   goog.events.EventType.MOUSEMOVE];


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


/** @inheritDoc */
goog.ui.ActivityMonitor.prototype.disposeInternal = function() {
  goog.ui.ActivityMonitor.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
  this.eventHandler_ = null;
  delete this.documents_;
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
    this.updateIdleTime_(goog.now(), /** @type {string} */ (e.type));
  }
};


/**
 * Updates the last event time to be the present time, useful for non-DOM
 * events that should update idle time.
 */
goog.ui.ActivityMonitor.prototype.resetTimer = function() {
  this.updateIdleTime_(goog.now(), 'manual');
};


/**
 * Does the work of updating the idle time and firing an event
 * @param {number} eventTime Time (in MS) of the event that cleared the idle
 * timer.
 * @param {string} eventType Type of the event, used only for debugging.
 * @private
 */
goog.ui.ActivityMonitor.prototype.updateIdleTime_ = function(eventTime,
      eventType) {
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
