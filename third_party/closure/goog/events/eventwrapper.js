/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Definition of the goog.events.EventWrapper interface.
 */

goog.provide('goog.events.EventWrapper');

goog.requireType('goog.events.EventHandler');
goog.requireType('goog.events.ListenableType');



/**
 * Interface for event wrappers.
 * @interface
 */
goog.events.EventWrapper = function() {};


/**
 * Adds an event listener using the wrapper on a DOM Node or an object that has
 * implemented {@link goog.events.EventTarget}. A listener can only be added
 * once to an object.
 *
 * @param {goog.events.ListenableType} src The node to listen to events on.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener Callback
 *     method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to add
 *     listener to.
 */
goog.events.EventWrapper.prototype.listen = function(
    src, listener, opt_capt, opt_scope, opt_eventHandler) {};


/**
 * Removes an event listener added using goog.events.EventWrapper.listen.
 *
 * @param {goog.events.ListenableType} src The node to remove listener from.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener Callback
 *     method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to remove
 *     listener from.
 */
goog.events.EventWrapper.prototype.unlisten = function(
    src, listener, opt_capt, opt_scope, opt_eventHandler) {};
