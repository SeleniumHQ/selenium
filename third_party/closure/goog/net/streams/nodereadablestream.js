// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview the API spec for the closure polyfill of Node stream.Readable.
 *
 * Node streams API is specified at https://nodejs.org/api/stream.html
 *
 * Only a subset of Node streams API (under the object mode) will be supported.
 *
 * It's our belief that Node and whatwg streams will eventually
 * converge. As it happens, we will add a whatwg streams polyfill too.
 * (https://github.com/whatwg/streams)
 *
 * This API requires no special server-side support other than the standard
 * HTTP semantics. Message framing only relies on MIME types such as JSON
 * to support atomic message delivery (e.g. elements of a JSON array).
 * Other streaming-related features such as cancellation and keep-alive are
 * exposed/constrained by the Node streams API semantics.
 *
 * Flow-control support is limited due to the underlying use of XHR. That is,
 * this version will assume the "flowing mode", and the read method is not
 * provided.
 *
 */

goog.provide('goog.net.streams.NodeReadableStream');



/**
 * This interface represents a readable stream.
 *
 * @interface
 */
goog.net.streams.NodeReadableStream = function() {};


/**
 * Read events for the stream.
 * @enum {string}
 */
goog.net.streams.NodeReadableStream.EventType = {
  READABLE: 'readable',
  DATA: 'data',
  END: 'end',
  CLOSE: 'close',
  ERROR: 'error'
};


/**
 * Register a callback to handle I/O events.
 *
 * See https://iojs.org/api/events.html
 *
 * Note that under the object mode, an event of DATA will deliver a message
 * of 1) JSON compliant JS object, including arrays; or 2) an ArrayBuffer.
 *
 * Ordering: messages will be delivered to callbacks in their registration
 * order. There is no ordering between on() and once() callbacks.
 *
 * Exceptions from callbacks will be caught and ignored.
 *
 * @param {string} eventType The event type
 * @param {function(!Object=)} callback The call back to handle the event with
 * an optional input object
 * @return {goog.net.streams.NodeReadableStream} this object
 */
goog.net.streams.NodeReadableStream.prototype.on = goog.abstractMethod;


/**
 * Register a callback to handle I/O events. This is an alias to on().
 *
 * @param {string} eventType The event type
 * @param {function(!Object=)} callback The call back to handle the event with
 * an optional input object
 * @return {goog.net.streams.NodeReadableStream} this object
 */
goog.net.streams.NodeReadableStream.prototype.addListener = goog.abstractMethod;


/**
 * Unregister an existing callback, including one-time callbacks.
 *
 * @param {string} eventType The event type
 * @param {function(!Object=)} callback The call back to unregister
 * @return {goog.net.streams.NodeReadableStream} this object
 */
goog.net.streams.NodeReadableStream.prototype.removeListener =
    goog.abstractMethod;


/**
 * Register a one-time callback to handle I/O events.
 *
 * @param {string} eventType The event type
 * @param {function(!Object=)} callback The call back to handle the event with
 * an optional input object
 * @return {goog.net.streams.NodeReadableStream} this object
 */
goog.net.streams.NodeReadableStream.prototype.once = goog.abstractMethod;
