// Copyright 2011 The Closure Library Authors. All Rights Reserved
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
 * @fileoverview Functions for replaying events.
 * NOTE(user): This file should be considered private within goog.jsaction.
 *
 */


goog.provide('goog.jsaction.replay');

goog.require('goog.asserts');
goog.require('goog.jsaction.EventContract');


/**
 * Replays an event.
 * @param {!goog.jsaction.ReplayInfo} replayInfo The replay info record.
 */
goog.jsaction.replay.replayEvent = function(replayInfo) {
  var event = goog.jsaction.replay.createEvent_(replayInfo.event);

  // Add the replay info as property to the event object.
  // This allows the event handler (EventContract#handleEvent_) to
  // detect replayed events.
  event[goog.jsaction.EventContract.PROPERTY_KEY_REPLAY_INFO] = replayInfo;

  goog.jsaction.replay.triggerEvent_(replayInfo.element, event);
};


/**
 * Creates an event object.
 * @param {!Event} original The event to create a new event from.
 * @return {!Event} The event object.
 * @private
 */
goog.jsaction.replay.createEvent_ = function(original) {
  var event;
  if (document.createEvent) {
    // Event creation as per W3C event model specification.
    event = document.createEvent('MouseEvents');
    event.initMouseEvent(
        original.type,
        true,  // canBubble
        true,  // cancelable
        window,
        original.detail,
        original.screenX, original.screenY,
        original.clientX, original.clientY,
        original.ctrlKey, original.altKey,
        original.shiftKey, original.metaKey,
        original.button,
        original.relatedTarget);

  } else {
    goog.asserts.assert(document.createEventObject);
    // Older versions of IE (up to version 8) do not support the
    // W3C event model. Use the IE specific functions instead.
    event = document.createEventObject();
    event.type = original.type;
    event.clientX = original.clientX;
    event.clientY = original.clientY;
    event.button = original.button;
    event.detail = original.detail;
    event.ctrlKey = original.ctrlKey;
    event.altKey = original.altKey;
    event.shiftKey = original.shiftKey;
    event.metaKey = original.metaKey;
  }
  return event;
};


/**
 * Triggers an event.
 * @param {!Element} elem The element to trigger the event on.
 * @param {!Event} event The event object.
 * @private
 */
goog.jsaction.replay.triggerEvent_ = function(elem, event) {
  if (elem.dispatchEvent) {
    elem.dispatchEvent(event);
  } else {
    goog.asserts.assert(elem.fireEvent);
    elem.fireEvent('on' + event.type, event);
  }
};
