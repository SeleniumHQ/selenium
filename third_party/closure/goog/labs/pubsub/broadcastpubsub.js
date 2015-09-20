// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.labs.pubsub.BroadcastPubSub');


goog.require('goog.Disposable');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.async.run');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.json');
goog.require('goog.log');
goog.require('goog.math');
goog.require('goog.pubsub.PubSub');
goog.require('goog.storage.Storage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.string');
goog.require('goog.userAgent');



/**
 * Topic-based publish/subscribe messaging implementation that provides
 * communication between browsing contexts that share the same origin.
 *
 * Wrapper around PubSub that utilizes localStorage to broadcast publications to
 * all browser windows with the same origin as the publishing context. This
 * allows for topic-based publish/subscribe implementation of strings shared by
 * all browser contexts that share the same origin.
 *
 * Delivery is guaranteed on all browsers except IE8 where topics expire after a
 * timeout. Publishing of a topic within a callback function provides no
 * guarantee on ordering in that there is a possiblilty that separate origin
 * contexts may see topics in a different order.
 *
 * This class is not secure and in certain cases (e.g., a browser crash) data
 * that is published can persist in localStorage indefinitely. Do not use this
 * class to communicate private or confidential information.
 *
 * On IE8, localStorage is shared by the http and https origins. An attacker
 * could possibly leverage this to publish to the secure origin.
 *
 * goog.labs.pubsub.BroadcastPubSub wraps an instance of PubSub rather than
 * subclassing because the base PubSub class allows publishing of arbitrary
 * objects.
 *
 * Special handling is done for the IE8 browsers. See the IE8_EVENTS_KEY_
 * constant and the {@code publish} function for more information.
 *
 *
 * @constructor @struct @extends {goog.Disposable}
 */
goog.labs.pubsub.BroadcastPubSub = function() {
  goog.labs.pubsub.BroadcastPubSub.base(this, 'constructor');
  goog.labs.pubsub.BroadcastPubSub.instances_.push(this);

  /** @private @const */
  this.pubSub_ = new goog.pubsub.PubSub();
  this.registerDisposable(this.pubSub_);

  /** @private @const */
  this.handler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.handler_);

  /** @private @const */
  this.logger_ = goog.log.getLogger('goog.labs.pubsub.BroadcastPubSub');

  /** @private @const */
  this.mechanism_ = new goog.storage.mechanism.HTML5LocalStorage();

  /** @private {goog.storage.Storage} */
  this.storage_ = null;

  /** @private {Object<string, number>} */
  this.ie8LastEventTimes_ = null;

  /** @private {number} */
  this.ie8StartupTimestamp_ = goog.now() - 1;

  if (this.mechanism_.isAvailable()) {
    this.storage_ = new goog.storage.Storage(this.mechanism_);

    var target = window;
    if (goog.labs.pubsub.BroadcastPubSub.IS_IE8_) {
      this.ie8LastEventTimes_ = {};

      target = document;
    }
    this.handler_.listen(target,
        goog.events.EventType.STORAGE,
        this.handleStorageEvent_);
  }
};
goog.inherits(goog.labs.pubsub.BroadcastPubSub, goog.Disposable);


/** @private @const {!Array<!goog.labs.pubsub.BroadcastPubSub>} */
goog.labs.pubsub.BroadcastPubSub.instances_ = [];


/**
 * SitePubSub namespace for localStorage.
 * @private @const
 */
goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_ = '_closure_bps';


/**
 * Handle the storage event and possibly dispatch topics.
 * @param {!goog.events.Event} e Event object.
 * @private
 */
goog.labs.pubsub.BroadcastPubSub.prototype.handleStorageEvent_ =
    function(e) {
  if (goog.labs.pubsub.BroadcastPubSub.IS_IE8_) {
    // Even though we have the event, IE8 doesn't update our localStorage until
    // after we handle the actual event.
    goog.async.run(this.handleIe8StorageEvent_, this);
    return;
  }

  var browserEvent = e.getBrowserEvent();
  if (browserEvent.key !=
      goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_) {
    return;
  }

  var data = goog.json.parse(browserEvent.newValue);
  var args = goog.isObject(data) && data['args'];
  if (goog.isArray(args) && goog.array.every(args, goog.isString)) {
    this.dispatch_(args);
  } else {
    goog.log.warning(this.logger_, 'storage event contained invalid arguments');
  }
};


/**
 * Dispatches args on the internal pubsub queue.
 * @param {!Array<string>} args The arguments to publish.
 * @private
 */
goog.labs.pubsub.BroadcastPubSub.prototype.dispatch_ = function(args) {
  goog.pubsub.PubSub.prototype.publish.apply(this.pubSub_, args);
};


/**
 * Publishes a message to a topic. Remote subscriptions in other tabs/windows
 * are dispatched via local storage events. Local subscriptions are called
 * asynchronously via Timer event in order to simulate remote behavior locally.
 * @param {string} topic Topic to publish to.
 * @param {...string} var_args String arguments that are applied to each
 *     subscription function.
 */
goog.labs.pubsub.BroadcastPubSub.prototype.publish =
    function(topic, var_args) {
  var args = goog.array.toArray(arguments);

  // Dispatch to localStorage.
  if (this.storage_) {
    // Update topics to use the optional prefix.
    var now = goog.now();
    var data = {
      'args': args,
      'timestamp': now
    };

    if (!goog.labs.pubsub.BroadcastPubSub.IS_IE8_) {
      // Generated events will contain all the data in modern browsers.
      this.storage_.set(goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_, data);
      this.storage_.remove(goog.labs.pubsub.BroadcastPubSub.STORAGE_KEY_);
    } else {
      // With IE8 we need to manage our own events queue.
      var events = null;
      /** @preserveTry */
      try {
        events = this.storage_.get(
            goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
      } catch (ex) {
        goog.log.error(this.logger_,
            'publish encountered invalid event queue at ' +
            goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
      }
      if (!goog.isArray(events)) {
        events = [];
      }
      // Avoid a race condition where we're publishing in the same
      // millisecond that another event that may be getting
      // processed. In short, we try go guarantee that whatever event
      // we put on the event queue has a timestamp that is older than
      // any other timestamp in the queue.
      var lastEvent = events[events.length - 1];
      var lastTimestamp = lastEvent && lastEvent['timestamp'] ||
          this.ie8StartupTimestamp_;
      if (lastTimestamp >= now) {
        now = lastTimestamp +
            goog.labs.pubsub.BroadcastPubSub.IE8_TIMESTAMP_UNIQUE_OFFSET_MS_;
        data['timestamp'] = now;
      }
      events.push(data);
      this.storage_.set(
          goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_, events);

      // Cleanup this event in IE8_EVENT_LIFETIME_MS_ milliseconds.
      goog.Timer.callOnce(goog.bind(this.cleanupIe8StorageEvents_, this, now),
          goog.labs.pubsub.BroadcastPubSub.IE8_EVENT_LIFETIME_MS_);
    }
  }

  // W3C spec is to not dispatch the storage event to the same window that
  // modified localStorage. For conforming browsers we have to manually dispatch
  // the publish event to subscriptions on instances of BroadcastPubSub in the
  // current window.
  if (!goog.userAgent.IE) {
    // Dispatch the publish event to local instances asynchronously to fix some
    // quirks with timings. The result is that all subscriptions are dispatched
    // before any future publishes are processed. The effect is that
    // subscriptions in the same window are dispatched as if they are the result
    // of a publish from another tab.
    goog.array.forEach(goog.labs.pubsub.BroadcastPubSub.instances_,
        function(instance) {
          goog.async.run(goog.bind(instance.dispatch_, instance, args));
        });
  }
};


/**
 * Unsubscribes a function from a topic. Only deletes the first match found.
 * Returns a Boolean indicating whether a subscription was removed.
 * @param {string} topic Topic to unsubscribe from.
 * @param {Function} fn Function to unsubscribe.
 * @param {Object=} opt_context Object in whose context the function was to be
 *     called (the global scope if none).
 * @return {boolean} Whether a matching subscription was removed.
 */
goog.labs.pubsub.BroadcastPubSub.prototype.unsubscribe =
    function(topic, fn, opt_context) {
  return this.pubSub_.unsubscribe(topic, fn, opt_context);
};


/**
 * Removes a subscription based on the key returned by {@link #subscribe}. No-op
 * if no matching subscription is found. Returns a Boolean indicating whether a
 * subscription was removed.
 * @param {number} key Subscription key.
 * @return {boolean} Whether a matching subscription was removed.
 */
goog.labs.pubsub.BroadcastPubSub.prototype.unsubscribeByKey = function(key) {
  return this.pubSub_.unsubscribeByKey(key);
};


/**
 * Subscribes a function to a topic. The function is invoked as a method on the
 * given {@code opt_context} object, or in the global scope if no context is
 * specified. Subscribing the same function to the same topic multiple times
 * will result in multiple function invocations while publishing. Returns a
 * subscription key that can be used to unsubscribe the function from the topic
 * via {@link #unsubscribeByKey}.
 * @param {string} topic Topic to subscribe to.
 * @param {Function} fn Function to be invoked when a message is published to
 *     the given topic.
 * @param {Object=} opt_context Object in whose context the function is to be
 *     called (the global scope if none).
 * @return {number} Subscription key.
 */
goog.labs.pubsub.BroadcastPubSub.prototype.subscribe =
    function(topic, fn, opt_context) {
  return this.pubSub_.subscribe(topic, fn, opt_context);
};


/**
 * Subscribes a single-use function to a topic. The function is invoked as a
 * method on the given {@code opt_context} object, or in the global scope if no
 * context is specified, and is then unsubscribed. Returns a subscription key
 * that can be used to unsubscribe the function from the topic via {@link
 * #unsubscribeByKey}.
 * @param {string} topic Topic to subscribe to.
 * @param {Function} fn Function to be invoked once and then unsubscribed when
 *     a message is published to the given topic.
 * @param {Object=} opt_context Object in whose context the function is to be
 *     called (the global scope if none).
 * @return {number} Subscription key.
 */
goog.labs.pubsub.BroadcastPubSub.prototype.subscribeOnce =
    function(topic, fn, opt_context) {
  return this.pubSub_.subscribeOnce(topic, fn, opt_context);
};


/**
 * Returns the number of subscriptions to the given topic (or all topics if
 * unspecified).
 * @param {string=} opt_topic The topic (all topics if unspecified).
 * @return {number} Number of subscriptions to the topic.
 */
goog.labs.pubsub.BroadcastPubSub.prototype.getCount = function(opt_topic) {
  return this.pubSub_.getCount(opt_topic);
};


/**
 * Clears the subscription list for a topic, or all topics if unspecified.
 * @param {string=} opt_topic Topic to clear (all topics if unspecified).
 */
goog.labs.pubsub.BroadcastPubSub.prototype.clear = function(opt_topic) {
  this.pubSub_.clear(opt_topic);
};


/** @override */
goog.labs.pubsub.BroadcastPubSub.prototype.disposeInternal = function() {
  goog.array.remove(goog.labs.pubsub.BroadcastPubSub.instances_, this);
  if (goog.labs.pubsub.BroadcastPubSub.IS_IE8_ &&
      goog.isDefAndNotNull(this.storage_) &&
      goog.labs.pubsub.BroadcastPubSub.instances_.length == 0) {
    this.storage_.remove(
        goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
  }
  goog.labs.pubsub.BroadcastPubSub.base(this, 'disposeInternal');
};


/**
 * Prefix for IE8 storage event queue keys.
 * @private @const
 */
goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_PREFIX_ = '_closure_bps_ie8evt';


/**
 * Time (in milliseconds) that IE8 events should live. If they are not
 * processed by other windows in this time they will be removed.
 * @private @const
 */
goog.labs.pubsub.BroadcastPubSub.IE8_EVENT_LIFETIME_MS_ = 1000 * 10;


/**
 * Time (in milliseconds) that the IE8 event queue should live.
 * @private @const
 */
goog.labs.pubsub.BroadcastPubSub.IE8_QUEUE_LIFETIME_MS_ = 1000 * 30;


/**
 * Time delta that is used to distinguish between timestamps of events that
 * happen in the same millisecond.
 * @private @const
 */
goog.labs.pubsub.BroadcastPubSub.IE8_TIMESTAMP_UNIQUE_OFFSET_MS_ = .01;


/**
 * Name for this window/tab's storage key that stores its IE8 event queue.
 *
 * The browsers storage events are supposed to track the key which was changed,
 * the previous value for that key, and the new value of that key. Our
 * implementation is dependent on this information but IE8 doesn't provide it.
 * We implement our own event queue using local storage to track this
 * information in IE8. Since all instances share the same localStorage context
 * in a particular tab, we share the events queue.
 *
 * This key is a static member shared by all instances of BroadcastPubSub in the
 * same Window context. To avoid read-update-write contention, this key is only
 * written in a single context in the cleanupIe8StorageEvents_ function. Since
 * instances in other contexts will read this key there is code in the {@code
 * publish} function to make sure timestamps are unique even within the same
 * millisecond.
 *
 * @private @const
 */
goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_ =
    goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_PREFIX_ +
        goog.math.randomInt(1e9);


/**
 * All instances of this object should access elements using strings and not
 * attributes. Since we are communicating across browser tabs we could be
 * dealing with different versions of javascript and thus may have different
 * obfuscation in each tab.
 * @private @typedef {{'timestamp': number, 'args': !Array<string>}}
 */
goog.labs.pubsub.BroadcastPubSub.Ie8Event_;


/** @private @const */
goog.labs.pubsub.BroadcastPubSub.IS_IE8_ =
    goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 8;


/**
 * Validates an event object.
 * @param {!Object} obj The object to validate as an Event.
 * @return {?goog.labs.pubsub.BroadcastPubSub.Ie8Event_} A valid
 *     event object or null if the object is invalid.
 * @private
 */
goog.labs.pubsub.BroadcastPubSub.validateIe8Event_ = function(obj) {
  if (goog.isObject(obj) && goog.isNumber(obj['timestamp']) &&
      goog.array.every(obj['args'], goog.isString)) {
    return {'timestamp': obj['timestamp'], 'args': obj['args']};
  }
  return null;
};


/**
 * Returns an array of valid IE8 events.
 * @param {!Array<!Object>} events Possible IE8 events.
 * @return {!Array<!goog.labs.pubsub.BroadcastPubSub.Ie8Event_>}
 *     Valid IE8 events.
 * @private
 */
goog.labs.pubsub.BroadcastPubSub.filterValidIe8Events_ = function(events) {
  return goog.array.filter(goog.array.map(events,
      goog.labs.pubsub.BroadcastPubSub.validateIe8Event_),
      goog.isDefAndNotNull);
};


/**
 * Returns the IE8 events that have a timestamp later than the provided
 * timestamp.
 * @param {number} timestamp Expired timestamp.
 * @param {!Array<!goog.labs.pubsub.BroadcastPubSub.Ie8Event_>} events
 *     Possible IE8 events.
 * @return {!Array<!goog.labs.pubsub.BroadcastPubSub.Ie8Event_>}
 *     Unexpired IE8 events.
 * @private
 */
goog.labs.pubsub.BroadcastPubSub.filterNewIe8Events_ =
    function(timestamp, events) {
  return goog.array.filter(events, function(event) {
    return event['timestamp'] > timestamp;
  });
};


/**
 * Processes the events array for key if all elements are valid IE8 events.
 * @param {string} key The key in localStorage where the event queue is stored.
 * @param {!Array<!Object>} events Array of possible events stored at key.
 * @return {boolean} Return true if all elements in the array are valid
 *     events, false otherwise.
 * @private
 */
goog.labs.pubsub.BroadcastPubSub.prototype.maybeProcessIe8Events_ =
    function(key, events) {
  if (!events.length) {
    return false;
  }

  var validEvents =
      goog.labs.pubsub.BroadcastPubSub.filterValidIe8Events_(events);
  if (validEvents.length == events.length) {
    var lastTimestamp = goog.array.peek(validEvents)['timestamp'];
    var previousTime =
        this.ie8LastEventTimes_[key] || this.ie8StartupTimestamp_;
    if (lastTimestamp > previousTime -
        goog.labs.pubsub.BroadcastPubSub.IE8_QUEUE_LIFETIME_MS_) {
      this.ie8LastEventTimes_[key] = lastTimestamp;
      validEvents = goog.labs.pubsub.BroadcastPubSub.filterNewIe8Events_(
          previousTime, validEvents);
      for (var i = 0, event; event = validEvents[i]; i++) {
        this.dispatch_(event['args']);
      }
      return true;
    }
  } else {
    goog.log.warning(this.logger_, 'invalid events found in queue ' + key);
  }

  return false;
};


/**
 * Handle the storage event and possibly dispatch events. Looks through all keys
 * in localStorage for valid keys.
 * @private
 */
goog.labs.pubsub.BroadcastPubSub.prototype.handleIe8StorageEvent_ = function() {
  var numKeys = this.mechanism_.getCount();
  for (var idx = 0; idx < numKeys; idx++) {
    var key = this.mechanism_.key(idx);
    // Don't process events we generated. The W3C standard says that storage
    // events should be queued by the browser for each window whose document's
    // storage object is affected by a change in localStorage. Chrome, Firefox,
    // and modern IE don't dispatch the event to the window which made the
    // change. This code simulates that behavior in IE8.
    if (!(goog.isString(key) && goog.string.startsWith(
        key, goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_PREFIX_))) {
      continue;
    }

    var events = null;
    /** @preserveTry */
    try {
      events = this.storage_.get(key);
    } catch (ex) {
      goog.log.warning(this.logger_, 'invalid remote event queue ' + key);
    }

    if (!(goog.isArray(events) && this.maybeProcessIe8Events_(key, events))) {
      // Events is not an array, empty, contains invalid events, or expired.
      this.storage_.remove(key);
    }
  }
};


/**
 * Cleanup our IE8 event queue by removing any events that come at or before the
 * given timestamp.
 * @param {number} timestamp Maximum timestamp to remove from the queue.
 * @private
 */
goog.labs.pubsub.BroadcastPubSub.prototype.cleanupIe8StorageEvents_ =
    function(timestamp) {
  var events = null;
  /** @preserveTry */
  try {
    events = this.storage_.get(
        goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
  } catch (ex) {
    goog.log.error(this.logger_,
        'cleanup encountered invalid event queue key ' +
        goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
  }
  if (!goog.isArray(events)) {
    this.storage_.remove(goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
    return;
  }

  events = goog.labs.pubsub.BroadcastPubSub.filterNewIe8Events_(
      timestamp, goog.labs.pubsub.BroadcastPubSub.filterValidIe8Events_(
          events));

  if (events.length > 0) {
    this.storage_.set(goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_, events);
  } else {
    this.storage_.remove(goog.labs.pubsub.BroadcastPubSub.IE8_EVENTS_KEY_);
  }
};
