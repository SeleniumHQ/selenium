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
 * @fileoverview A native implementation of the ponyfill.
 */
goog.module('goog.streams.fullNativeImpl');

const fullTypes = goog.require('goog.streams.fullTypes');
const liteNativeImpl = goog.require('goog.streams.liteNativeImpl');

/**
 * The implemenation of ReadableStream.
 * @template T
 * @implements {fullTypes.ReadableStream<T>}
 */
class NativeReadableStream extends liteNativeImpl.NativeReadableStream {
  /**
   * @param {!ReadableStream} stream
   */
  constructor(stream) {
    super(stream);

    /**
     * Returns an AsyncIterator over the ReadableStream.
     * https://streams.spec.whatwg.org/#rs-asynciterator
     * @return {!AsyncIterator<!IIterableResult<T>>}
     */
    this[Symbol.asyncIterator] = this.getIterator;
  }

  /**
   * @return {!NativeReadableStreamDefaultReader}
   * @override
   */
  getReader() {
    return new NativeReadableStreamDefaultReader(
        /** @type {!ReadableStreamDefaultReader} */ (this.stream.getReader()));
  }

  /** @override */
  cancel(reason) {
    return this.stream.cancel(reason);
  }

  /** @override */
  getIterator(options = undefined) {
    return this.stream.getIterator(options);
  }

  /** @override */
  tee() {
    return this.stream.tee().map((stream) => new NativeReadableStream(stream));
  }
}

/**
 * @param {!fullTypes.ReadableStreamUnderlyingSource<T>=} underlyingSource
 * @param {!fullTypes.ReadableStreamStrategy<T>=} strategy
 * @return {!NativeReadableStream<T>}
 * @suppress {strictMissingProperties}
 * @template T
 */
function newReadableStream(underlyingSource = {}, strategy = {}) {
  /** @const {!ReadableStreamSource} */
  const source = {};
  if (underlyingSource.start) {
    source.start = (controller) => {
      return underlyingSource.start(
          new NativeReadableStreamDefaultController(controller));
    };
  }
  if (underlyingSource.pull) {
    source.pull = (controller) => {
      return underlyingSource.pull(
          new NativeReadableStreamDefaultController(controller));
    };
  }
  if (underlyingSource.cancel) {
    source.cancel = underlyingSource.cancel;
  }
  const stream = new ReadableStream(source, strategy);
  return new NativeReadableStream(stream);
}

/**
 * The DefaultReader for a ReadableStream.
 * @template T
 * @implements {fullTypes.ReadableStreamDefaultReader<T>}
 */
class NativeReadableStreamDefaultReader extends
    liteNativeImpl.NativeReadableStreamDefaultReader {
  /** @override */
  cancel(reason) {
    return /** @type {!Promise<undefined>} */ (this.reader.cancel(reason));
  }
}

/**
 * @template T
 * @implements {fullTypes.ReadableStreamAsyncIterator<T>}
 */
class NativeReadableStreamAsyncIterator {
  /**
   * @param {!AsyncIterator<T>} iterator
   */
  constructor(iterator) {
    /** @private @const {!AsyncIterator<T>} */
    this.iterator_ = iterator;
  }

  /** @override */
  next() {
    return this.iterator_.next();
  }

  /** @override */
  return(value) {
    return /** @type {{return: function(*): !Promise<!IIterableResult<T>>}} */ (
               this.iterator_)
        .return(value);
  }
}

/**
 * The controller for a ReadableStream. Adds cancellation and backpressure.
 * @template T
 * @implements {fullTypes.ReadableStreamDefaultController<T>}
 */
class NativeReadableStreamDefaultController extends
    liteNativeImpl.NativeReadableStreamDefaultController {
  /** @override */
  get desiredSize() {
    return this.controller.desiredSize;
  }
}

exports = {
  NativeReadableStream,
  NativeReadableStreamAsyncIterator,
  NativeReadableStreamDefaultController,
  NativeReadableStreamDefaultReader,
  newReadableStream,
};
