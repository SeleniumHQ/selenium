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
 * @fileoverview The jsaction dispatcher.
 * Serves as the registry with which clients register jsaction handlers.
 * When EventContract finds a jsaction to be invoked for an event, it
 * calls the dispatcher, which then looks up the corresponding handler
 * function and invokes it.
 *
 * A fully qualified jsaction name consists of a namespace and an action
 * name separated by a dot: "namespace.action.
 * Hierarchichal namespaces are not supported. Namespace and action names
 * should only consist of alphanumeric characters and underscores.
 *
 * Usage:
 *
 * The dispatcher first needs to be hooked up to an instance of
 * goog.jsaction.EventContract.
 *
 * var dispatcher = new goog.jsaction.Dispatcher;
 * eventContract.setDispatcher(dispatcher);
 *
 * Clients can register handlers for the jsactions they use in their
 * markup. For example, the code to add the action handler for element
 *   <div jsaction="foo.bar">Do stuff</div>
 * would look like this:
 *
 * var fooBarHandler = function(context) {
 *   // Do stuff.
 * };
 * dispatcher.registerHandlers('foo', {'bar': fooBarHandler});
 *
 * If a 'jsaction' attribute doesn't specify a fully qualified jsaction name,
 * the dispatcher will search for an ancestor with a 'jsnamespace' attribute.
 * Example markup using the same names as above:
 * <div jsnamespace="foo">
 *   <div jsaction="bar">Do Stuff</div>
 * </div>
 *
 */


goog.provide('goog.jsaction.Dispatcher');
goog.provide('goog.jsaction.HandlerFunction');
goog.provide('goog.jsaction.LoaderFunction');

goog.require('goog.asserts');
goog.require('goog.jsaction.Context');
goog.require('goog.jsaction.EventContract');
goog.require('goog.jsaction.replay');
goog.require('goog.jsaction.util');


/**
 * The signature of action handler functions.
 * @typedef {function(!goog.jsaction.Context):void}
 */
goog.jsaction.HandlerFunction;


/**
 * The signature of a loader function. It gets a namespace as argument.
 * A loader function is expected to do whatever necessary to load code and
 * eventually register the action handlers for the namespace.
 * @typedef {function(string)}
 */
goog.jsaction.LoaderFunction;



/**
 * Creates jsaction dispatcher that serves as registry for
 * action handlers and dispatches actions to appropriate handlers.
 * @constructor
 */
goog.jsaction.Dispatcher = function() {
  /**
   * The handler registry.
   * @type {!Object.<string, !goog.jsaction.HandlerFunction>}
   * @private
   */
  this.handlers_ = {};

  /**
   * The loader registry.
   * @type {!Object.<string, !goog.jsaction.LoaderFunction>}
   * @private
   */
  this.loaders_ = {};
};


/**
 * Constant for the name of the 'jsnamespace'-attribute.
 * @type {string}
 * @private
 */
goog.jsaction.Dispatcher.ATTRIBUTE_NAME_JSNAMESPACE_ = 'jsnamespace';


/**
 * Array of queued events. This is shared between EventContract and the
 * attached dispatcher. EventContract adds entries, while the dispatcher
 * consumes them when replaying the events.
 * @type {Array.<!goog.jsaction.ReplayInfo>}
 * @private
 */
goog.jsaction.Dispatcher.prototype.queue_;


/**
 * Attaches this dispatcher to the given EventContract instance.
 * @param {goog.jsaction.EventContract} contract The EventContract instance
 *     to attach to.
 */
goog.jsaction.Dispatcher.prototype.attach = function(contract) {
  goog.asserts.assert(!this.queue_, 'Already attached.');

  contract.setDispatcher(this);
  this.queue_ = contract.getQueue();
  this.replayEvents_();
};


/**
 * Registers a loader function for a namespace. The loader function
 * will be invoked when an action occurs from that namespace without a
 * handler being present.
 * The loader is expected to do whatever necessary to load code and
 * eventually register action handlers for the namespace.
 * @param {string} ns The namespace.
 * @param {!goog.jsaction.LoaderFunction} loaderFn The loader function.
 */
goog.jsaction.Dispatcher.prototype.registerLoader = function(ns, loaderFn) {
  this.loaders_[ns] = loaderFn;

  // Invoke the loader right away if there are queued jsactions
  // in the namespace it is registered for.
  if (this.hasQueuedActionInNamespace_(ns)) {
    loaderFn(ns);
  }
};


/**
 * Registers action handlers.
 * @param {string} ns The namespace.
 * @param {!Object.<string, !goog.jsaction.HandlerFunction>} handlers
 *     The handlers. Map from action name to action handler function.
 */
goog.jsaction.Dispatcher.prototype.registerHandlers = function(ns, handlers) {
  for (var name in handlers) {
    var action = ns + '.' + name;
    goog.jsaction.Dispatcher.assertValidAction_(action);
    this.handlers_[action] = handlers[name];
  }

  this.replayEvents_();
};


/**
 * Dispatches an action to the appropriate handler function.
 * @param {string} action The action.
 * @param {!Element} elem The element.
 * @param {!Event} e The event object.
 * @param {number} time The time when the event occured.
 * @return {boolean} Whether the action has been handled.
 */
goog.jsaction.Dispatcher.prototype.dispatch = function(
    action, elem, e, time) {
  // If the action doesn't specify a namespace, find the ancestor with a
  // 'jsnamespace' attribute.
  if (action.indexOf('.') == -1) {
    for (var ancestor = elem; ancestor; ancestor = ancestor.parentNode) {
      var ns = ancestor.getAttribute(
          goog.jsaction.Dispatcher.ATTRIBUTE_NAME_JSNAMESPACE_);
      if (ns) {
        action = ns + '.' + action;
        break;
      }
    }
  }

  goog.jsaction.Dispatcher.assertValidAction_(action);

  if (this.maybeInvokeHandler_(action, elem, e, time)) {
    return true;
  }

  var ns = goog.jsaction.Dispatcher.getNamespace_(action);
  var loaderFn = this.loaders_[ns];
  if (loaderFn) {
    loaderFn(ns);
    // The loader may register handlers synchronously (although this
    // will not be the typical case), therefore attempt again to invoke
    // the handler.
    return this.maybeInvokeHandler_(action, elem, e, time);
  }
  return false;
};


/**
 * Looks up the handler for an action an invokes it (if present).
 * @param {string} action The action.
 * @param {!Element} elem The element.
 * @param {!Event} e The event object.
 * @param {number} time The time when the event occured.
 * @return {boolean} Whether the handler has been invoked.
 * @private
 */
goog.jsaction.Dispatcher.prototype.maybeInvokeHandler_ = function(
    action, elem, e, time) {
  var handler = this.handlers_[action];
  if (handler) {
    handler(new goog.jsaction.Context(action, elem, e, time));
    goog.jsaction.util.preventDefault(e);
    return true;
  }
  return false;
};


/**
 * Extracts and returns the namespace from a fully qualified jsaction
 * of the form "namespace.actionname".
 * @param {string} action The action.
 * @return {string} The namespace.
 * @private
 */
goog.jsaction.Dispatcher.getNamespace_ = function(action) {
  return action.split('.')[0];
};


/**
 * Asserts the validity of fully qualified action name.
 * @param {string} action The action name to validate.
 * @private
 */
goog.jsaction.Dispatcher.assertValidAction_ = function(action) {
  goog.asserts.assert(/^[a-zA-Z_]*\.[a-zA-Z_]*$/.test(action));
};


/**
 * Determines whether there is a queued action for the given namespace.
 * @param {string} ns The namespace.
 * @return {boolean} Whether there is a queued action for the given namespace.
 * @private
 */
goog.jsaction.Dispatcher.prototype.hasQueuedActionInNamespace_ = function(ns) {
  if (this.queue_) {
    for (var i = 0; i < this.queue_.length; ++i) {
      if (ns == goog.jsaction.Dispatcher.getNamespace_(this.queue_[i].action)) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Replays all events in the queue for which there is a handler.
 * @private
 */
goog.jsaction.Dispatcher.prototype.replayEvents_ = function() {
  if (!this.queue_) {
    return;
  }
  for (var i = 0, replayInfo; replayInfo = this.queue_[i]; ) {
    if (replayInfo.action in this.handlers_) {
      // Remove the entry from the queue and replay the event.
      this.queue_.splice(i, 1);
      goog.jsaction.replay.replayEvent(replayInfo);
    } else {
      ++i;
    }
  }
};
