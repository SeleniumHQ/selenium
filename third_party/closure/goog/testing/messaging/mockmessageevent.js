// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A simple mock class for imitating HTML5 MessageEvents.
 *
 */

goog.provide('goog.testing.messaging.MockMessageEvent');

goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventType');
goog.require('goog.testing.events.Event');



/**
 * Creates a new fake MessageEvent.
 *
 * @param {*} data The data of the message.
 * @param {string=} opt_origin The origin of the message, for server-sent and
 *     cross-document events.
 * @param {string=} opt_lastEventId The last event ID, for server-sent events.
 * @param {Window=} opt_source The proxy for the source window, for
 *     cross-document events.
 * @param {Array<MessagePort>=} opt_ports The Array of ports sent with the
 *     message, for cross-document and channel events.
 * @extends {goog.testing.events.Event}
 * @constructor
 * @final
 */
goog.testing.messaging.MockMessageEvent = function(
    data, opt_origin, opt_lastEventId, opt_source, opt_ports) {
  goog.testing.messaging.MockMessageEvent.base(
      this, 'constructor', goog.events.EventType.MESSAGE);

  /**
   * The data of the message.
   * @type {*}
   */
  this.data = data;

  /**
   * The origin of the message, for server-sent and cross-document events.
   * @type {?string}
   */
  this.origin = opt_origin || null;

  /**
   * The last event ID, for server-sent events.
   * @type {?string}
   */
  this.lastEventId = opt_lastEventId || null;

  /**
   * The proxy for the source window, for cross-document events.
   * @type {Window}
   */
  this.source = opt_source || null;

  /**
   * The Array of ports sent with the message, for cross-document and channel
   * events.
   * @type {Array<!MessagePort>}
   */
  this.ports = opt_ports || null;
};
goog.inherits(
    goog.testing.messaging.MockMessageEvent, goog.testing.events.Event);


/**
 * Wraps a new fake MessageEvent in a BrowserEvent, like how a real MessageEvent
 * would be wrapped.
 *
 * @param {*} data The data of the message.
 * @param {string=} opt_origin The origin of the message, for server-sent and
 *     cross-document events.
 * @param {string=} opt_lastEventId The last event ID, for server-sent events.
 * @param {Window=} opt_source The proxy for the source window, for
 *     cross-document events.
 * @param {Array<MessagePort>=} opt_ports The Array of ports sent with the
 *     message, for cross-document and channel events.
 * @return {!goog.events.BrowserEvent} The wrapping event.
 */
goog.testing.messaging.MockMessageEvent.wrap = function(
    data, opt_origin, opt_lastEventId, opt_source, opt_ports) {
  return new goog.events.BrowserEvent(
      new goog.testing.messaging.MockMessageEvent(
          data, opt_origin, opt_lastEventId, opt_source, opt_ports));
};
