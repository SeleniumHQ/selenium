// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Action event wrapper implementation.
 * @author eae@google.com (Emil A Eklund)
 */

goog.provide('goog.events.actionEventWrapper');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.dom');
goog.require('goog.events');
/** @suppress {extraRequire} */
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.EventWrapper');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');



/**
 * Event wrapper for action handling. Fires when an element is activated either
 * by clicking it or by focusing it and pressing Enter.
 *
 * @constructor
 * @implements {goog.events.EventWrapper}
 * @private
 */
goog.events.ActionEventWrapper_ = function() {};

/**
 * @interface
 * @private
 */
goog.events.ActionEventWrapper_.FunctionExtension_ = function() {};

/** @type {!Object|undefined} */
goog.events.ActionEventWrapper_.FunctionExtension_.prototype.scope_;

/** @type {function(?):?|{handleEvent:function(?):?}|null} */
goog.events.ActionEventWrapper_.FunctionExtension_.prototype.listener_;


/**
 * Singleton instance of ActionEventWrapper_.
 * @type {goog.events.ActionEventWrapper_}
 */
goog.events.actionEventWrapper = new goog.events.ActionEventWrapper_();


/**
 * Event types used by the wrapper.
 *
 * @type {Array<goog.events.EventType>}
 * @private
 */
goog.events.ActionEventWrapper_.EVENT_TYPES_ = [
  goog.events.EventType.CLICK,
  goog.userAgent.GECKO ? goog.events.EventType.KEYPRESS :
                         goog.events.EventType.KEYDOWN,
  goog.events.EventType.KEYUP
];


/**
 * Adds an event listener using the wrapper on a DOM Node or an object that has
 * implemented {@link goog.events.EventTarget}. A listener can only be added
 * once to an object.
 *
 * @param {goog.events.ListenableType} target The target to listen to events on.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener Callback
 *     method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to add
 *     listener to.
 * @override
 */
goog.events.ActionEventWrapper_.prototype.listen = function(
    target, listener, opt_capt, opt_scope, opt_eventHandler) {
  var callback = function(e) {
    var listenerFn = goog.events.wrapListener(listener);
    var role = goog.dom.isElement(e.target) ?
        goog.a11y.aria.getRole(/** @type {!Element} */ (e.target)) :
        null;
    if (e.type == goog.events.EventType.CLICK && e.isMouseActionButton()) {
      listenerFn.call(opt_scope, e);
    } else if (
        (e.keyCode == goog.events.KeyCodes.ENTER ||
         e.keyCode == goog.events.KeyCodes.MAC_ENTER) &&
        e.type != goog.events.EventType.KEYUP) {
      // convert keydown to keypress for backward compatibility.
      e.type = goog.events.EventType.KEYPRESS;
      listenerFn.call(opt_scope, e);
    } else if (
        e.keyCode == goog.events.KeyCodes.SPACE &&
        e.type == goog.events.EventType.KEYUP &&
        (role == goog.a11y.aria.Role.BUTTON ||
         role == goog.a11y.aria.Role.TAB)) {
      listenerFn.call(opt_scope, e);
      e.preventDefault();
    }
  };
  callback.listener_ = listener;
  callback.scope_ = opt_scope;

  if (opt_eventHandler) {
    opt_eventHandler.listen(
        target, goog.events.ActionEventWrapper_.EVENT_TYPES_, callback,
        opt_capt);
  } else {
    goog.events.listen(
        target, goog.events.ActionEventWrapper_.EVENT_TYPES_, callback,
        opt_capt);
  }
};


/**
 * Removes an event listener added using goog.events.EventWrapper.listen.
 *
 * @param {goog.events.ListenableType} target The node to remove listener from.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener Callback
 *     method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to remove
 *     listener from.
 * @override
 */
goog.events.ActionEventWrapper_.prototype.unlisten = function(
    target, listener, opt_capt, opt_scope, opt_eventHandler) {
  for (var type, j = 0; type = goog.events.ActionEventWrapper_.EVENT_TYPES_[j];
       j++) {
    var listeners = goog.events.getListeners(target, type, !!opt_capt);
    for (var obj, i = 0; obj = listeners[i]; i++) {
      var objListener =
          /** @type {!goog.events.ActionEventWrapper_.FunctionExtension_} */ (
              obj.listener);
      if (objListener.listener_ == listener &&
          objListener.scope_ == opt_scope) {
        if (opt_eventHandler) {
          opt_eventHandler.unlisten(
              target, type, obj.listener, opt_capt, opt_scope);
        } else {
          goog.events.unlisten(target, type, obj.listener, opt_capt, opt_scope);
        }
        break;
      }
    }
  }
};
