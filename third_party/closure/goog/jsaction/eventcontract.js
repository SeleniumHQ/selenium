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
 * @fileoverview Provides the goog.jsaction.EventContract object, which is
 * responsible for jsaction-related event handling.
 *
 * Jsaction provides an event handling abstraction which decouples
 * the DOM and JavaScript code. The traditional way to associate event
 * handlers with DOM elements is to programmatically obtain a reference to
 * the element in question and register an event handler on it.
 * Jsaction allows for a more declarative way to set up event handling code.
 * It relies on the custom attribute 'jsaction' which contain a mapping from
 * event type to named actions) and on events bubbling up to a single event
 * handler registered on a container element.
 *
 * Example usage:
 *
 * var contract = new goog.jsaction.EventContract;
 * contract.addContainer(someContainerElement);
 * contract.addEvent(goog.jsaction.EventType.CLICK);
 *
 * This will set up the event handling for click actions for the whole
 * subtree of the container element. Note the body-element can be used as
 * container without restriction, resulting in a single event handler
 * per event type for the whole page.
 *
 * To complete the setup, EventContract needs to be hooked up to a
 * dispatcher, whose task it is to look up and invoke the appropriate
 * handler function for an action.
 *
 * var dispatcher = new goog.jsaction.Dispatcher;
 * contract.setDispatcher(dispatcher);
 *
 * Before the dispatcher has been set, EventContract will simply queue
 * events for later replay. This allows to set up jsaction handling with
 * very little code and defer loading of the dispatcher and action handlers.
 *
 * A few words about modified click events:
 *
 * A modified click is one for which browsers exhibit special behavior.
 * An example would be ctrl-click (or cmd-click on Macs) to open a link
 * in a new window or tab.
 * In order to support this, jsaction uses custom event types to distiguish
 * between plain and modified clicks.
 * - Native 'click'-events are separated into custom event types
 *   'click_plain' and 'click_mod'.
 * - These can also be specified in jsaction-attributes (although it will
 *   typically not be necessary).
 * - An action specified for type 'click' will be invoked for both
 *   plain and modified clicks.
 * - The default event type (in case none is specified in the
 *   jsaction-attribute) is 'click_plain'.
 *
 * Examples:
 *
 * <a href="http://gna.com" jsaction="klik.me">...</a>
 * - No event type is specified for the action, therefore it defaults
 *   to 'click_plain' and this is equivalent to:
 *   <a href="http://gna.com" jsaction="click_plain: klik.me">...</a>
 * - For plain click, the handler for action 'klik.me' will be invoked.
 * - For a modified click, no action will be found and the event
 *   is left to be handled by the browser (http://gna.com will be
 *   loaded in a separate tab or window).
 *
 * <a href="http://gna.com" jsaction="click: klik.me">..</a>
 * - Action 'klik.me' is invoked both for plain and modified clicks.
 * - The href-attribute is ignored in both cases.
 *
 * <a href="http://gna.com" jsaction="click_mod: klik.me">...</a>
 * - A plain click will be left to the browser to handle, which will
 *   navigate to http://gna.com.
 * - A modified click will cause action 'klik.me' to be invoked.
 *
 */


goog.provide('goog.jsaction.EventContract');
goog.provide('goog.jsaction.EventType');
goog.provide('goog.jsaction.ReplayInfo');

goog.require('goog.jsaction.util');
goog.require('goog.object');


/**
 * Records information for replaying events.
 * @typedef {{
 *     action: string,
 *     element: !Element,
 *     event: !Event,
 *     time: number
 * }}
 */
goog.jsaction.ReplayInfo;


/**
 * Event types enum.
 * @enum {string}
 */
goog.jsaction.EventType = {
  CLICK: 'click',
  CLICK_MODIFIED: 'click_mod',
  CLICK_PLAIN: 'click_plain'
};



/**
 * Instantiates EventContract, the object responsible for jsaction-related
 * event handling and queuing.
 * @constructor
 */
goog.jsaction.EventContract = function() {
  /**
   * The container elements.
   * @type {!Array.<!Element>}
   * @private
   */
  this.containers_ = [];

  /**
   * The event types handled by this instance.
   * @type {!Object.<string, boolean>}
   * @private
   */
  this.eventTypes_ = {};

  /**
   * Array of queued events for later replay.
   * @type {!Array.<!goog.jsaction.ReplayInfo>}
   * @private
   */
  this.queue_ = [];

  /**
   * The dispatcher object. As long as this isn't set, all events for which
   * an action has been found will be queued.
   * @type {goog.jsaction.Dispatcher}
   * @private
   */
  this.dispatcher_ = null;
};


/**
 * A constant for the name of the 'jsaction'-attribute.
 * @type {string}
 * @private
 * @const
 */
goog.jsaction.EventContract.ATTRIBUTE_NAME_JSACTION_ = 'jsaction';


/**
 * Constant for the name of the property attached to DOM nodes which constains
 * a map from event type to action name.
 * @type {string}
 * @private
 * @const
 */
goog.jsaction.EventContract.PROPERTY_KEY_ACTION_MAP_ = '__jsam';


/**
 * Constant for the name of the property attached to container elements. The
 * property contains the event handler function for the container in question.
 * @type {string}
 * @private
 * @const
 */
goog.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_ = '__jsaeh';


/**
 * Constant for the name of the property attached to event objects when they're
 * replayed. The property contains an object of type goog.jsaction.ReplayInfo.
 * @type {string}
 * @const
 */
goog.jsaction.EventContract.PROPERTY_KEY_REPLAY_INFO = '__jsari';


/**
 * The default event type used if no type is specified in the jsaction
 * attribute for an action.
 * @type {string}
 * @const
 * @private
 */
goog.jsaction.EventContract.DEFAULT_EVENT_TYPE_ =
    goog.jsaction.EventType.CLICK_PLAIN;


/**
 * Adds a container element. Container elements is where EventContract
 * registeres actual DOM event handlers. Adding a container element
 * will enable jsaction-handling for its whole subtree.
 * @param {!Element} containerElem The element.
 */
goog.jsaction.EventContract.prototype.addContainer = function(containerElem) {
  if (containerElem[goog.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_]) {
    if (goog.DEBUG) {
      throw Error('The provided element has already been added as ' +
                  'container to an EventContract instance.');
    }
    return;
  }

  this.containers_.push(containerElem);

  // Create the event handler for the container element and store
  // it as a property thereof. The same event handler is used for
  // all event types.
  var handler = goog.jsaction.EventContract.createEventHandler_(
      this, containerElem);
  containerElem[goog.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_] =
      handler;

  for (var eventType in this.eventTypes_) {
    goog.jsaction.util.addEventListener(containerElem, eventType, handler);
  }
};


/**
 * Adds an event type to listen for.
 * @param {string} eventType The event type.
 */
goog.jsaction.EventContract.prototype.addEvent = function(eventType) {
  if (this.eventTypes_[eventType]) {
    return;
  }

  this.eventTypes_[eventType] = true;

  for (var i = 0, container; container = this.containers_[i]; ++i) {
    var handler = container[
        goog.jsaction.EventContract.PROPERTY_KEY_EVENT_HANDLER_];
    goog.jsaction.util.addEventListener(container, eventType, handler);
  }
};


/**
 * @return {!Array.<!goog.jsaction.ReplayInfo>} The array containing
 *     the replay info for queued events.
 */
goog.jsaction.EventContract.prototype.getQueue = function() {
  return this.queue_;
};


/**
 * Sets the dispatcher.
 * @param {goog.jsaction.Dispatcher} dispatcher The dispatcher.
 */
goog.jsaction.EventContract.prototype.setDispatcher = function(dispatcher) {
  this.dispatcher_ = dispatcher;
};


/**
 * Gets the action for the given element and event type.
 * @param {!Element} elem The element.
 * @param {string} eventType The event type.
 * @return {?string} The action (or null if there is none).
 * @private
 */
goog.jsaction.EventContract.getAction_ = function(elem, eventType) {
  var actionMap = elem[goog.jsaction.EventContract.PROPERTY_KEY_ACTION_MAP_];
  if (!actionMap) {
    actionMap = elem[goog.jsaction.EventContract.PROPERTY_KEY_ACTION_MAP_] =
        goog.jsaction.EventContract.parseJsActionAttribute_(elem);
  }
  return actionMap[eventType] || null;
};


/**
 * Parses the jsaction-attribute on the given element and returns
 * a map from event type to action.
 * @param {!Element} elem The element.
 * @return {!Object.<string, string>} A map from
 *     event type to an action.
 * @private
 */
goog.jsaction.EventContract.parseJsActionAttribute_ = function(elem) {
  var actionMap = {};
  var attrValue = elem.getAttribute(
      goog.jsaction.EventContract.ATTRIBUTE_NAME_JSACTION_);
  if (attrValue) {
    var actionSpecs = attrValue.replace(/\s/g, '').split(';');
    for (var i = 0; i < actionSpecs.length; ++i) {
      var parts = actionSpecs[i].split(':');
      var type = parts[0];
      var action = parts[1];
      if (!action) {
        action = parts[0];
        type = goog.jsaction.EventContract.DEFAULT_EVENT_TYPE_;
      }
      actionMap[type] = action;
    }

    var clickAction = actionMap[goog.jsaction.EventType.CLICK];
    if (clickAction) {
      if (!actionMap[goog.jsaction.EventType.CLICK_MODIFIED]) {
        actionMap[goog.jsaction.EventType.CLICK_MODIFIED] =
            clickAction;
      }
      if (!actionMap[goog.jsaction.EventType.CLICK_PLAIN]) {
        actionMap[goog.jsaction.EventType.CLICK_PLAIN] =
            clickAction;
      }
    }
  }
  return actionMap;
};


/**
 * Creates the event handler function to be used for a container element.
 * @param {!goog.jsaction.EventContract} contract The EventContract instance.
 * @param {!Element} container The container element.
 * @return {function(!Event)} The event handler function.
 * @private
 */
goog.jsaction.EventContract.createEventHandler_ = function(
    contract, container) {
  return function(e) {
    contract.handleEvent_(e, container);
  }
};


/**
 * Handles a browser event.
 * Walks up the DOM tree starting at the target element of the event until
 * it finds an eligible action for the event or reaches the container element.
 * If an action is found, the event is handed to the dispatcher
 * to invoke an associated action handler (TODO, coming real soon).
 * @param {!Event} e The native event object.
 * @param {!Element} containerElem The container element.
 * @private
 */
goog.jsaction.EventContract.prototype.handleEvent_ = function(
    e, containerElem) {
  var targetElem = e.srcElement || e.target;
  var eventType = e.type;

  // If the event is replayed, we use the time from the original event.
  var replayInfo = e[goog.jsaction.EventContract.PROPERTY_KEY_REPLAY_INFO];
  var time = replayInfo && replayInfo.time || goog.now();

  // TODO(user): Apply mapping for event types where the jsaction type
  // doesn't match the type of DOM event (e.g. focus vs. focusin).

  // Distinguish modified and plain click events.
  if (eventType == goog.jsaction.EventType.CLICK) {
    eventType = goog.jsaction.util.isModifiedClickEvent(e) ?
        goog.jsaction.EventType.CLICK_MODIFIED :
        goog.jsaction.EventType.CLICK_PLAIN;
  }

  // Find an ancestor with an eligible action.
  var action, elem;
  for (var node = targetElem;
       !action && node && node != containerElem;
       node = node.parentNode) {
    elem = /** @type {!Element} */(node);
    action = goog.jsaction.EventContract.getAction_(elem, eventType);
    if (action) {
      break;
    }
  }

  if (action && elem) {
    var actionHandled = false;
    if (this.dispatcher_) {
      actionHandled = this.dispatcher_.dispatch(action, elem, e, time);
    }

    if (!actionHandled) {
      // NOTE(user): If an action was handled by the dispatcher, it
      // is also up to the dispatcher/handler to stop propagation
      // and prevent the default.
      goog.jsaction.util.stopPropagation(e);
      goog.jsaction.util.preventDefault(e);

      this.queue_.push({
        action: action,
        element: elem,
        event: /** @type {!Event} */(goog.object.clone(e)),
        time: time
      });
    }
  }
};
