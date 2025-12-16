// Copyright 2019 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Types provided by the full implementation. DO NOT WRITE
 * IMPLEMANTATIONS OF THE INTERFACES PROVIDED HERE. These exist to provide
 * a super type for the native-wrapped impl and the ponyfill impl.
 */
goog.module('goog.streams.fullTypes');

const liteTypes = goog.require('goog.streams.liteTypes');

/**
 * The underlying source for a ReadableStream.
 * @template T
 * @record
 * @extends {liteTypes.ReadableStreamUnderlyingSource}
 */
class ReadableStreamUnderlyingSource {
  constructor() {
    /**
     * A pull method that is called when the ReadableStream's internal queue
     * becomes not full.
     * @type {(function(!ReadableStreamDefaultController<T>):
     *     (!Promise<undefined>|undefined))|undefined}
     */
    this.pull;

    /**
     * Called when the ReadableStream is cancelled.
     * @type {(function(*): (!Promise<undefined>|undefined))|undefined}
     */
    this.cancel;
  }
}

/**
 * The strategy for the ReadableStream queue.
 * @template T
 * @record
 */
class ReadableStreamStrategy {
  constructor() {
    /**
     * A sizing algorithm that takes a chunk of the ReadableStream and returns
     * a size.
     * https://streams.spec.whatwg.org/#qs-api
     * @type {(function(T): number)|undefined}
     */
    this.size;

    /**
     * Used to calculate the desired size of the ReadableStream. The high-water
     * mark minus the sum of the sizes of chunks currently in the queue is the
     * desired size.
     * https://streams.spec.whatwg.org/#qs-api
     * @type {number|undefined}
     */
    this.highWaterMark;
  }
}

/**
 * The implemenation of ReadableStream.
 * @template T
 * @interface
 * @extends {liteTypes.ReadableStream<T>}
 * @extends {AsyncIterable<T>}
 */
class ReadableStream {
  /**
   * Returns a ReadableStreamDefaultReader that enables reading chunks from
   * the source.
   * https://streams.spec.whatwg.org/#rs-get-reader
   * @return {!ReadableStreamDefaultReader<T>}
   * @override
   */
  getReader() {}

  /**
   * Cancels the ReadableStream with an optional reason.
   * https://streams.spec.whatwg.org/#rs-cancel
   * @param {*} reason
   * @return {!Promise<undefined>}
   */
  cancel(reason) {}

  /**
   * Returns an AyncIterator over the ReadableStream.
   *
   * If preventCancel is passed as an option, calling the return() method on the
   * iterator will terminate the iterator, but will not cancel the
   * ReadableStream.
   * https://streams.spec.whatwg.org/#rs-get-iterator
   * @param {{preventCancel: boolean}=} options
   * @return {!AsyncIterator<T>}
   */
  getIterator({preventCancel = false} = {}) {}

  /**
   * Returns an Array with two elements, both new ReadableStreams that contain
   * the same data as this ReadableStream. This stream will become permanently
   * locked.
   * https://streams.spec.whatwg.org/#rs-tee
   * @return {!Array<!ReadableStream>}
   */
  tee() {}

  /**
   * https://streams.spec.whatwg.org/#rs-asynciterator
   * @param {{preventCancel: boolean}=} options
   * @return {!AsyncIterator<T>}
   */
  [Symbol.asyncIterator]({preventCancel = false} = {}) {}
}

/**
 * The DefaultReader for a ReadableStream.
 * @template T
 * @interface
 * @extends {liteTypes.ReadableStreamDefaultReader<T>}
 */
class ReadableStreamDefaultReader {
  /**
   * Cancels the ReadableStream with an optional reason.
   * https://streams.spec.whatwg.org/#default-reader-cancel
   * @param {*} reason
   * @return {!Promise<undefined>}
   */
  cancel(reason) {}
}

/**
 * @template T
 * @interface
 * @extends {AsyncIterator<T>}
 */
class ReadableStreamAsyncIterator {
  /**
   * Gets the next value from the ReadableStream.
   * https://streams.spec.whatwg.org/#rs-asynciterator-prototype-next
   * @override
   */
  next() {}

  /**
   * Cancels the underlying stream and resolves with the value.
   * @param {*} value
   * @return {!Promise<!IIterableResult<T>>}
   */
  return(value) {}
}

/**
 * The controller for a ReadableStream. Adds cancellation and backpressure.
 * @template T
 * @interface
 * @extends {liteTypes.ReadableStreamDefaultController<T>}
 */
class ReadableStreamDefaultController {
  constructor() {
    /**
     * The desired size to fill the controlled stream's internal queue.
     * It can be negative if the queue is full.
     * https://streams.spec.whatwg.org/#rs-default-controller-desired-size
     * @type {?number}
     */
    this.desiredSize;
  }
}

exports = {
  ReadableStream,
  ReadableStreamAsyncIterator,
  ReadableStreamDefaultController,
  ReadableStreamDefaultReader,
  ReadableStreamStrategy,
  ReadableStreamUnderlyingSource,
};
