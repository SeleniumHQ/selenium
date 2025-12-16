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
 * @fileoverview A lite polyfill of the ReadableStream native API with a subset
 * of methods supported.
 */
goog.module('goog.streams.liteImpl');

const NativeResolver = goog.require('goog.promise.NativeResolver');
const liteTypes = goog.require('goog.streams.liteTypes');
const {assert, assertFunction} = goog.require('goog.asserts');

/**
 * The lite implementation of ReadableStream.
 *
 * Supports the getReader() method and locked property.
 *
 * The only method of underlying sources that is supported is enqueueing,
 * closing, and erroring.
 *
 * Pulling (including backpressure and sizes) and cancellation are not
 * supported.
 * @template T
 * @implements {liteTypes.ReadableStream<T>}
 */
class ReadableStream {
  /** @package */
  constructor() {
    /** @package {!ReadableStream.State} */
    this.state = ReadableStream.State.READABLE;

    /**  @package {!ReadableStreamDefaultReader|undefined} */
    this.reader = undefined;

    /** @type {*} */
    this.storedError = undefined;

    /** @package {!ReadableStreamDefaultController} */
    this.readableStreamController;
  }

  /**
   * Returns true if the ReadableStream has been locked to a reader.
   * https://streams.spec.whatwg.org/#rs-locked
   * @return {boolean}
   * @override
   */
  get locked() {
    return this.reader !== undefined;
  }

  /**
   * Returns a ReadableStreamDefaultReader that enables reading chunks from
   * the source.
   * https://streams.spec.whatwg.org/#rs-get-reader
   * @return {!ReadableStreamDefaultReader<T>}
   * @override
   */
  getReader() {
    return this.reader = new ReadableStreamDefaultReader(this);
  }

  /**
   * @return {!Promise<!IIterableResult<T>>}
   * @package
   */
  addReadRequest() {
    const request = new NativeResolver();
    this.reader.readRequests.push(request);
    return request.promise;
  }

  /** @package */
  close() {
    this.state = ReadableStream.State.CLOSED;
    if (!this.reader) {
      return;
    }
    for (const readRequest of this.reader.readRequests) {
      readRequest.resolve({value: undefined, done: true});
    }
    this.reader.readRequests = [];
    this.reader.closedResolver.resolve();
  }

  /**
   * @param {*} e
   * @package
   */
  error(e) {
    this.state = ReadableStream.State.ERRORED;
    this.storedError = e;
    if (!this.reader) {
      return;
    }
    for (const readRequest of this.reader.readRequests) {
      readRequest.reject(e);
    }
    this.reader.readRequests = [];
    this.reader.closedResolver.promise.catch(() => {});
    this.reader.closedResolver.reject(e);
  }

  /**
   * @param {T} chunk
   * @param {boolean} done
   * @package
   */
  fulfillReadRequest(chunk, done) {
    const readRequest = assert(this.reader).readRequests.shift();
    readRequest.resolve({value: chunk, done});
  }

  /**
   * @return {number}
   * @package
   */
  getNumReadRequests() {
    return assert(this.reader).readRequests.length;
  }

  /**
   * @return {boolean}
   * @package
   */
  hasDefaultReader() {
    return this.reader !== undefined;
  }
}

/** @package @enum {number} */
ReadableStream.State = {
  READABLE: 1,
  CLOSED: 2,
  ERRORED: 3,
};

/**
 * Creates and returns a new ReadableStream.
 *
 * The underlying source should only have a start() method, and no other
 * properties.
 * @param {!liteTypes.ReadableStreamUnderlyingSource<T>} underlyingSource
 * @return {!ReadableStream<T>}
 * @suppress {strictMissingProperties}
 * @template T
 */
function newReadableStream(underlyingSource) {
  assertFunction(
      underlyingSource.start,
      `'start' property must be a function on an underlying source for a ` +
          'lite ReadableStream');
  const verifyObject =
      /** @type {!Object} */ (underlyingSource);
  assert(
      !(verifyObject.pull),
      `'pull' property not allowed on an underlying source for a ` +
          'lite ReadableStream');
  assert(
      !(verifyObject.cancel),
      `'cancel' property not allowed on an underlying source for a ` +
          'lite ReadableStream');
  assert(
      !(verifyObject.type),
      `'type' property not allowed on an underlying source for a ` +
          'lite ReadableStream');
  assert(
      !(verifyObject.autoAllocateChunkSize),
      `'autoAllocateChunkSize' property not allowed on an underlying ` +
          'source for a lite ReadableStream');
  const startAlgorithm = (controller) => underlyingSource.start(controller);
  const stream = new ReadableStream();
  const controller = new ReadableStreamDefaultController(stream);
  stream.readableStreamController = controller;
  controller.start(startAlgorithm);
  return stream;
}

/**
 * A reader for a lite ReadableStream.
 *
 * Supports the read() and releaseLock() methods, along with the closed
 * property.
 * @template T
 * @implements {liteTypes.ReadableStreamDefaultReader<T>}
 */
class ReadableStreamDefaultReader {
  /**
   * @param {!ReadableStream} stream
   * @package
   */
  constructor(stream) {
    if (stream.reader) {
      throw new TypeError(
          'ReadableStreamReader constructor can only accept readable streams ' +
          'that are not yet locked to a reader');
    }
    /** @package {!ReadableStream|undefined} */
    this.ownerReadableStream = stream;

    /** @package {!NativeResolver<undefined>} */
    this.closedResolver = new NativeResolver();

    /** @package {!Array<!NativeResolver<!IIterableResult<T>>>} */
    this.readRequests = [];

    if (stream.state === ReadableStream.State.CLOSED) {
      this.closedResolver.resolve();
    } else if (stream.state === ReadableStream.State.ERRORED) {
      this.closedResolver.promise.catch(() => {});
      this.closedResolver.reject(stream.storedError);
    }
  }

  /**
   * Returns a Promise that resolves when the Stream closes or is errored, or if
   * the reader releases its lock.
   * https://streams.spec.whatwg.org/#default-reader-closed
   * @return {!Promise<undefined>}
   * @override
   */
  get closed() {
    return this.closedResolver.promise;
  }

  /**
   * Returns a Promise that resolves with an IIterableResult providing the next
   * chunk or that the stream is closed. The Promise may reject if the stream
   * is errored.
   * https://streams.spec.whatwg.org/#default-reader-read
   * @return {!Promise<!IIterableResult<T>>}
   * @override
   */
  read() {
    if (!this.ownerReadableStream) {
      throw new TypeError(
          'This readable stream reader has been released and cannot be used ' +
          'to read from its previous owner stream');
    }
    return this.readInternal();
  }

  /**
   * Release the lock on the stream. Any further calls to read() will error,
   * and the stream can create another reader.
   * https://streams.spec.whatwg.org/#default-reader-release-lock
   * @return {void}
   * @override
   */
  releaseLock() {
    if (!this.ownerReadableStream) {
      return;
    }
    if (this.readRequests.length) {
      throw new TypeError(
          'Cannot release a readable stream reader when it still has ' +
          'outstanding read() calls that have not yet settled');
    }
    this.release();
  }

  /** @package */
  release() {
    const stream = assert(this.ownerReadableStream);
    const e = new TypeError(
        'This readable stream reader has been released and cannot be used ' +
        `to monitor the stream's state`);
    if (stream.state === ReadableStream.State.READABLE) {
      this.closedResolver.promise.catch(() => {});
      this.closedResolver.reject(e);
    } else {
      this.closedResolver = new NativeResolver();
      this.closedResolver.promise.catch(() => {});
      this.closedResolver.reject(e);
    }
    stream.reader = undefined;
    this.ownerReadableStream = undefined;
  }

  /**
   * @return {!Promise<!IIterableResult<T>>}
   * @package
   */
  readInternal() {
    const stream = assert(this.ownerReadableStream);
    if (stream.state === ReadableStream.State.CLOSED) {
      return Promise.resolve({value: undefined, done: true});
    }
    if (stream.state === ReadableStream.State.ERRORED) {
      return Promise.reject(stream.storedError);
    }
    return stream.readableStreamController.pullSteps();
  }
}

/**
 * A controller for a lite ReadableStream.
 *
 * Provides the enqueue(), error(), and close() methods.
 * @template T
 * @implements {liteTypes.ReadableStreamDefaultController<T>}
 */
class ReadableStreamDefaultController {
  /**
   * @param {!ReadableStream} stream
   * @package
   */
  constructor(stream) {
    /** @package @const {!ReadableStream} */
    this.controlledReadableStream = stream;

    /** @package @const {!Queue} */
    this.queue = new Queue();

    /** @package {boolean} */
    this.closeRequested = false;
  }

  /**
   * Signals that the ReadableStream should close. The ReadableStream will
   * actually close once all of its chunks have been read.
   * https://streams.spec.whatwg.org/#rs-default-controller-close
   * @return {void}
   * @override
   */
  close() {
    if (!this.canCloseOrEnqueue()) {
      throw new TypeError(
          'Cannot close a readable stream that has already been requested to ' +
          'be closed');
    }
    this.closeInternal();
  }

  /**
   * Enqueues a new chunk into the stream that can be read.
   * https://streams.spec.whatwg.org/#rs-default-controller-enqueue
   * @param {T} chunk
   * @override
   */
  enqueue(chunk) {
    if (!this.canCloseOrEnqueue()) {
      throw new TypeError(
          'Cannot enqueue a readable stream that has already been requested ' +
          'to be closed');
    }
    this.enqueueInternal(chunk);
  }

  /**
   * Closes the stream with an error. Any future interactions with the
   * controller will throw an error.
   * https://streams.spec.whatwg.org/#rs-default-controller-error
   * @param {*} e
   * @override
   */
  error(e) {
    this.errorInternal(e);
  }

  /**
   * @param {function(!ReadableStreamDefaultController):
   *     (!Promise<undefined>|undefined)} startAlgorithm
   * @package
   */
  start(startAlgorithm) {
    Promise.resolve(startAlgorithm(this))
        .then(
            () => {
              this.started();
            },
            (e) => {
              this.errorInternal(e);
            });
  }

  /**
   * @return {!Promise<!IIterableResult<T>>}
   * @package
   */
  pullSteps() {
    if (!this.queue.empty()) {
      const chunk = this.dequeueFromQueue();
      if (this.closeRequested && this.queue.empty()) {
        this.clearAlgorithms();
        this.controlledReadableStream.close();
      } else {
        this.callPullIfNeeded();
      }
      return Promise.resolve({value: chunk, done: false});
    }
    const promise = this.controlledReadableStream.addReadRequest();
    this.callPullIfNeeded();
    return promise;
  }

  /** @package */
  started() {}

  /** @package */
  callPullIfNeeded() {}

  /** @package */
  clearAlgorithms() {}

  /**
   * @package
   */
  closeInternal() {
    this.closeRequested = true;
    if (this.queue.empty()) {
      this.clearAlgorithms();
      this.controlledReadableStream.close();
    }
  }

  /**
   * @param {T} chunk
   * @package
   */
  enqueueInternal(chunk) {
    if (this.controlledReadableStream.locked &&
        this.controlledReadableStream.getNumReadRequests() > 0) {
      this.controlledReadableStream.fulfillReadRequest(
          chunk, /* done= */ false);
      return;
    }
    this.enqueueIntoQueue(chunk);
  }

  /**
   * @param {*} e
   * @package
   */
  errorInternal(e) {
    if (this.controlledReadableStream.state !== ReadableStream.State.READABLE) {
      return;
    }
    this.resetQueue();
    this.clearAlgorithms();
    this.controlledReadableStream.error(e);
  }

  /**
   * @return {boolean}
   * @package
   */
  canCloseOrEnqueue() {
    return !this.closeRequested &&
        this.controlledReadableStream.state === ReadableStream.State.READABLE;
  }

  /**
   * @param {T} chunk
   * @protected
   */
  enqueueIntoQueue(chunk) {
    this.queue.enqueueValue(chunk);
  }

  /**
   * @return {T}
   * @protected
   */
  dequeueFromQueue() {
    return this.queue.dequeueValue();
  }

  /**
   * @protected
   */
  resetQueue() {
    this.queue.resetQueue();
  }
}

/**
 * An internal Queue representation. This simple Queue just wraps an Array.
 * Other implementations may also have a size associated with each element.
 * @template T
 * @package
 */
class Queue {
  constructor() {
    /** @private {!Array<T>} */
    this.queue_ = [];
  }

  /**
   * @return {boolean}
   */
  empty() {
    return this.queue_.length === 0;
  }

  /**
   * @param {T} value
   */
  enqueueValue(value) {
    this.queue_.push(value);
  }

  /**
   * @return {T}
   */
  dequeueValue() {
    return this.queue_.shift();
  }

  /**
   * @return {void}
   */
  resetQueue() {
    this.queue_ = [];
  }
}

exports = {
  Queue,
  ReadableStream,
  ReadableStreamDefaultController,
  ReadableStreamDefaultReader,
  newReadableStream,
};
