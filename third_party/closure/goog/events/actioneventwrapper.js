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

// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview Action event wrapper implementation.
 */

goog.provide('goog.events.actionEventWrapper');

goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.EventWrapper');
goog.require('goog.events.KeyCodes');


/**
 * Event wrapper for action handling. Fires when an element is activated either
 * by clicking it or by focusing it and pressing Enter.
 *
 * @constructor
 * @implements {goog.events.EventWrapper}
 * @private
 */
goog.events.ActionEventWrapper_ = function() {
};


/**
 * Singleton instance of ActionEventWrapper_.
 * @type {goog.events.ActionEventWrapper_}
 */
goog.events.actionEventWrapper = new goog.events.ActionEventWrapper_();


/**
 * Event types used by the wrapper.
 *
 * @type {Array.<goog.events.EventType>}
 * @private
 */
goog.events.ActionEventWrapper_.EVENT_TYPES_ = [
  goog.events.EventType.CLICK,
  goog.events.EventType.KEYPRESS
];


/**
 * Adds an event listener using the wrapper on a DOM Node or an object that has
 * implemented {@link goog.events.EventTarget}. A listener can only be added
 * once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} target The node to listen to
 *     events on.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler} opt_eventHandler Event handler to add
 *     listener to.
 */
goog.events.ActionEventWrapper_.prototype.listen = function(target, listener,
    opt_capt, opt_scope, opt_eventHandler) {
  var callback = function(e) {
    if (e.type == goog.events.EventType.CLICK &&
      e.isButton(goog.events.BrowserEvent.MouseButton.LEFT) ||
      e.type == goog.events.EventType.KEYPRESS && (
          e.keyCode == goog.events.KeyCodes.ENTER ||
          e.keyCode == goog.events.KeyCodes.MAC_ENTER)) {
      listener.call(opt_scope, e);
    }
  }
  callback.listener_ = listener;
  callback.scope_ = opt_scope;

  if (opt_eventHandler) {
    opt_eventHandler.listen(target,
        goog.events.ActionEventWrapper_.EVENT_TYPES_,
        callback);
  } else {
    goog.events.listen(target,
        goog.events.ActionEventWrapper_.EVENT_TYPES_,
        callback);
  }
};


/**
 * Removes an event listener added using goog.events.EventWrapper.listen.
 *
 * @param {EventTarget|goog.events.EventTarget} target The node to remove
 *    listener from.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler} opt_eventHandler Event handler to remove
 *     listener from.
 */
goog.events.ActionEventWrapper_.prototype.unlisten = function(target, listener,
    opt_capt, opt_scope, opt_eventHandler) {
  for (var type, j = 0; type = goog.events.ActionEventWrapper_.EVENT_TYPES_[j];
      j++) {
    var listeners = goog.events.getListeners(target, type, false);
    for (var obj, i = 0; obj = listeners[i]; i++) {
      if (obj.listener.listener_ == listener &&
          obj.listener.scope_ == opt_scope) {
        if (opt_eventHandler) {
          opt_eventHandler.unlisten(target, type, obj.listener);
        } else {
          goog.events.unlisten(target, type, obj.listener);
        }
        break;
      }
    }
  }
};
