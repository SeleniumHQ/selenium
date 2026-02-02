/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.events.EventId');



/**
 * A templated class that is used when registering for events. Typical usage:
 *
 *    /** @type {goog.events.EventId<MyEventObj>} *\
 *    var myEventId = new goog.events.EventId(
 *        goog.events.getUniqueId(('someEvent'));
 *
 *    // No need to cast or declare here since the compiler knows the
 *    // correct type of 'evt' (MyEventObj).
 *    something.listen(myEventId, function(evt) {});
 *
 * @param {string} eventId
 * @template T
 * @constructor
 * @struct
 * @final
 */
goog.events.EventId = function(eventId) {
  'use strict';
  /** @const */ this.id = eventId;
};


/**
 * @override
 * @return {string}
 */
goog.events.EventId.prototype.toString = function() {
  'use strict';
  return this.id;
};
