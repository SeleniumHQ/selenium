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
 * @fileoverview A full ponyfill of the ReadableStream native API.
 */
goog.module('goog.streams.fullImpl');

const NativeResolver = goog.require('goog.promise.NativeResolver');
const fullTypes = goog.require('goog.streams.fullTypes');
const liteImpl = goog.require('goog.streams.liteImpl');
const {assert, assertNumber} = goog.require('goog.asserts');

/**
 * @typedef {function(!ReadableStreamDefaultController):
 * (!Promise<undefined>|undefined)}
 */
let StartAlgorithm;

/** @typedef {function(*): !Promise<undefined>} */
let CancelAlgorithm;

/**
 * @typedef {function(!ReadableStreamDefaultController): !Promise<undefined>}
 */
let PullAlgorithm;

/**
 * The implemenation of ReadableStream.
 * @template T
 * @implements {fullTypes.ReadableStream<T>}
 */
class ReadableStream extends liteImpl.ReadableStream {
  /** @package */
  constructor() {
    super();

    /**
     * Returns an AsyncIterator over the ReadableStream.
     * https://streams.spec.whatwg.org/#rs-asynciterator
     * @return {!AsyncIterator<!IIterableResult<T>>}
     */
    this[Symbol.asyncIterator] = this.getIterator;

    /** @package {boolean} */
    this.disturbed = false;
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
   * Cancels the ReadableStream with an optional reason.
   * https://streams.spec.whatwg.org/#rs-cancel
   * @param {*} reason
   * @return {!Promise<undefined>}
   * @override
   */
  cancel(reason) {
    if (this.locked) {
      return Promise.reject(new TypeError('Cannot cancel a locked stream'));
    }
    return this.cancelInternal(reason);
  }

  /**
   * Returns an AyncIterator over the ReadableStream.
   *
   * If preventCancel is passed as an option, calling the return() method on the
   * iterator will terminate the iterator, but will not cancel the
   * ReadableStream.
   * https://streams.spec.whatwg.org/#rs-get-iterator
   * @param {{preventCancel: boolean}=} options
   * @return {!AsyncIterator<T>}
   * @override
   */
  getIterator({preventCancel = false} = {}) {
    return new ReadableStreamAsyncIterator(this.getReader(), preventCancel);
  }

  /**
   * Returns an Array with two elements, both new ReadableStreams that contain
   * the same data as this ReadableStream. This stream will become permanently
   * locked.
   * https://streams.spec.whatwg.org/#rs-tee
   * @return {!Array<!ReadableStream>}
   * @override
   */
  tee() {
    const reader = this.getReader();
    let reading = false;
    let canceled1 = false;
    let canceled2 = false;
    let reason1;
    let reason2;
    let branch1;
    let branch2;
    const cancelResolver = new NativeResolver();
    const pullAlgorithm = () => {
      if (reading) {
        return Promise.resolve();
      }
      reading = true;
      reader.read()
          .then(({value, done}) => {
            reading = false;
            if (done) {
              if (!canceled1) {
                branch1.readableStreamController.close();
              }
              if (!canceled2) {
                branch2.readableStreamController.close();
              }
              return;
            }
            if (!canceled1) {
              branch1.readableStreamController.enqueue(value);
            }
            if (!canceled2) {
              branch2.readableStreamController.enqueue(value);
            }
          })
          .catch(() => {});
      return Promise.resolve();
    };
    const cancel1Algorithm = (reason) => {
      canceled1 = true;
      reason1 = reason;
      if (canceled2) {
        const cancelResult = this.cancelInternal([reason1, reason2]);
        cancelResolver.resolve(cancelResult);
      }
      return cancelResolver.promise;
    };
    const cancel2Algorithm = (reason) => {
      canceled2 = true;
      reason2 = reason;
      if (canceled1) {
        const cancelResult = this.cancelInternal([reason1, reason2]);
        cancelResolver.resolve(cancelResult);
      }
      return cancelResolver.promise;
    };
    const startAlgorithm = () => {};
    branch1 = new ReadableStream();
    const controller1 = new ReadableStreamDefaultController(
        branch1, cancel1Algorithm, pullAlgorithm, /* highWaterMark= */ 1,
        /* size= */ undefined);
    branch1.readableStreamController = controller1;
    controller1.start(startAlgorithm);
    branch2 = new ReadableStream();
    const controller2 = new ReadableStreamDefaultController(
        branch2, cancel2Algorithm, pullAlgorithm, /* highWatermark= */ 1,
        /* size= */ undefined);
    branch2.readableStreamController = controller2;
    controller2.start(startAlgorithm);
    reader.closed.catch((reason) => {
      controller1.error(reason);
      controller2.error(reason);
    });
    return [branch1, branch2];
  }

  /**
   * @param {*} reason
   * @return {!Promise<undefined>}
   * @package
   */
  cancelInternal(reason) {
    this.disturbed = true;
    if (this.state === liteImpl.ReadableStream.State.CLOSED) {
      return Promise.resolve();
    }
    if (this.state === liteImpl.ReadableStream.State.ERRORED) {
      return Promise.reject(this.storedError);
    }
    this.close();
    return /** @type {!ReadableStreamDefaultController} */ (
               this.readableStreamController)
        .cancelSteps(reason)
        .then(() => {});
  }
}

/**
 * Creates and returns a new ReadableStream.
 *
 * The underlying source should only have a start() method, and no other
 * properties.
 * @param {!fullTypes.ReadableStreamUnderlyingSource<T>=} underlyingSource
 * @param {!fullTypes.ReadableStreamStrategy<T>=} strategy
 * @return {!ReadableStream<T>}
 * @suppress {strictMissingProperties}
 * @template T
 */
function newReadableStream(underlyingSource = {}, strategy = {}) {
  const verifyObject =
      /** @type {!Object} */ (underlyingSource);
  assert(
      !(verifyObject.type),
      `'type' property not allowed on an underlying source for a ` +
          'liteImpl ReadableStream');
  assert(
      !(verifyObject.autoAllocateChunkSize),
      `'autoAllocateChunkSize' property not allowed on an underlying ` +
          'source for a liteImpl ReadableStream');
  const startAlgorithm = underlyingSource.start ?
      (controller) => underlyingSource.start(controller) :
      () => {};
  const cancelAlgorithm = underlyingSource.cancel ? (reason) => {
    try {
      return Promise.resolve(underlyingSource.cancel(reason));
    } catch (e) {
      return Promise.reject(e);
    }
  } : undefined;
  const pullAlgorithm = underlyingSource.pull ? (controller) => {
    try {
      return Promise.resolve(underlyingSource.pull(controller));
    } catch (e) {
      return Promise.reject(e);
    }
  } : undefined;
  const highWaterMark =
      strategy.highWaterMark === undefined ? 1 : strategy.highWaterMark;
  const sizeAlgorithm = strategy.size ?
      (chunk) => strategy.size.call(undefined, chunk) :
      undefined;
  const stream = new ReadableStream();
  const controller = new ReadableStreamDefaultController(
      stream, cancelAlgorithm, pullAlgorithm, highWaterMark, sizeAlgorithm);
  stream.readableStreamController = controller;
  controller.start(startAlgorithm);
  return stream;
}

/**
 * The DefaultReader for a ReadableStream. Adds cancellation onto the liteImpl
 * DefaultReader.
 * @template T
 * @implements {fullTypes.ReadableStreamDefaultReader<T>}
 */
class ReadableStreamDefaultReader extends liteImpl.ReadableStreamDefaultReader {
  /**
   * Cancels the ReadableStream with an optional reason.
   * https://streams.spec.whatwg.org/#default-reader-cancel
   * @param {*} reason
   * @return {!Promise<undefined>}
   * @override
   */
  cancel(reason) {
    if (!this.ownerReadableStream) {
      return Promise.reject(new TypeError(
          'This readable stream reader has been released and cannot be used ' +
          'to cancel its previous owner stream'));
    }
    return /** @type {!ReadableStream} */ (this.ownerReadableStream)
        .cancelInternal(reason);
  }
}

/**
 * @template T
 * @implements {fullTypes.ReadableStreamAsyncIterator<T>}
 */
class ReadableStreamAsyncIterator {
  /**
   * @param {!ReadableStreamDefaultReader<T>} asyncIteratorReader
   * @param {boolean} preventCancel
   * @package
   */
  constructor(asyncIteratorReader, preventCancel) {
    /** @package @const {!ReadableStreamDefaultReader<T>} */
    this.asyncIteratorReader = asyncIteratorReader;

    /** @package @const {boolean} */
    this.preventCancel = preventCancel;
  }

  /**
   * Gets the next value from the ReadableStream.
   * https://streams.spec.whatwg.org/#rs-asynciterator-prototype-next
   * @override
   */
  next() {
    if (!this.asyncIteratorReader.ownerReadableStream) {
      return Promise.reject(
          new TypeError('There is no more data left in the ReadableStream'));
    }
    return this.asyncIteratorReader.read().then(({value, done}) => {
      if (done) {
        this.asyncIteratorReader.release();
      }
      return {value, done};
    });
  }

  /**
   * Cancels the underlying stream and resolves with the value.
   * @param {*} value
   * @return {!Promise<!IIterableResult<T>>}
   * @override
   */
  return(value) {
    if (!this.asyncIteratorReader.ownerReadableStream) {
      return Promise.reject(
          new TypeError('There is no more data left in the ReadableStream'));
    }
    if (this.asyncIteratorReader.readRequests.length) {
      return Promise.reject(new TypeError(
          'There are pending read requests in the ReadableStream'));
    }
    if (!this.preventCancel) {
      const result = this.asyncIteratorReader.cancel(value);
      this.asyncIteratorReader.release();
      return result.then(() => ({done: true, value}));
    }
    this.asyncIteratorReader.release();
    return Promise.resolve({done: true, value});
  }
}

/**
 * The controller for a ReadableStream. Adds cancellation and backpressure onto
 * the liteImpl DefaultController.
 * @template T
 * @implements {fullTypes.ReadableStreamDefaultController}
 */
class ReadableStreamDefaultController extends
    liteImpl.ReadableStreamDefaultController {
  /**
   * @param {!ReadableStream} stream
   * @param {!CancelAlgorithm|undefined} cancelAlgorithm
   * @param {!PullAlgorithm|undefined} pullAlgorithm
   * @param {number} strategyHWM
   * @param {(function(T): number)|undefined} strategySizeAlgorithm
   * @package
   */
  constructor(
      stream, cancelAlgorithm, pullAlgorithm, strategyHWM,
      strategySizeAlgorithm) {
    super(stream);

    /** @private {!CancelAlgorithm|undefined} */
    this.cancelAlgorithm_ = cancelAlgorithm;

    /** @private {boolean} */
    this.pullAgain_ = false;

    /** @private {!PullAlgorithm|undefined} */
    this.pullAlgorithm_ = pullAlgorithm;

    /** @private {boolean} */
    this.pulling_ = false;

    /** @private {number} */
    this.queueTotalSize_ = 0;

    /** @private {boolean} */
    this.started_ = false;

    /** @private @const {number} */
    this.strategyHWM_ = strategyHWM;

    /** @private {(function(T): number)|undefined} */
    this.strategySizeAlgorithm_ = strategySizeAlgorithm;

    /** @private @const {!QueueWithSizes<T>} */
    this.queueWithSizes_ = new QueueWithSizes(this.queue);
  }

  /**
   * Returns the desired size to fill the controlled stream's internal queue. It
   * can be negative if the queue is full.
   * https://streams.spec.whatwg.org/#rs-default-controller-desired-size
   * @return {?number}
   * @override
   */
  get desiredSize() {
    return this.getDesiredSize_();
  }

  /** @override */
  started() {
    this.started_ = true;
    this.callPullIfNeeded();
  }

  /** @override */
  callPullIfNeeded() {
    if (!this.pullAlgorithm_ || !this.shouldCallPull_()) {
      return;
    }
    if (this.pulling_) {
      this.pullAgain_ = true;
      return;
    }
    this.pulling_ = true;
    this.pullAlgorithm_(this).then(
        () => {
          this.pulling_ = false;
          if (this.pullAgain_) {
            this.pullAgain_ = false;
            this.callPullIfNeeded();
          }
        },
        (error) => {
          this.error(error);
        });
  }

  /**
   * @return {boolean}
   * @private
   */
  shouldCallPull_() {
    if (!this.canCloseOrEnqueue()) {
      return false;
    }
    if (!this.started_) {
      return false;
    }
    if (this.controlledReadableStream.locked &&
        this.controlledReadableStream.getNumReadRequests() > 0) {
      return true;
    }
    return assertNumber(this.getDesiredSize_()) > 0;
  }

  /** @override */
  clearAlgorithms() {
    this.cancelAlgorithm_ = undefined;
    this.pullAlgorithm_ = undefined;
    this.strategySizeAlgorithm_ = undefined;
  }

  /**
   * @param {*} reason
   * @return {!Promise<*>}
   * @package
   */
  cancelSteps(reason) {
    this.queue.resetQueue();
    const cancelResult = this.cancelAlgorithm_ ? this.cancelAlgorithm_(reason) :
                                                 Promise.resolve();
    this.clearAlgorithms();
    return cancelResult;
  }

  /** @override */
  enqueueIntoQueue(chunk) {
    let size;
    try {
      // Default to size of 1 if no algorithm is specified.
      size = Number(
          this.strategySizeAlgorithm_ ? this.strategySizeAlgorithm_(chunk) : 1);
    } catch (e) {
      this.error(e);
      throw e;
    }
    if (typeof size !== 'number' || Number.isNaN(size) || size < 0 ||
        size === Infinity) {
      throw new RangeError(
          `The return value of a queuing strategy's size function must be a` +
          ' finite, non-NaN, non-negative number');
    }
    this.queueTotalSize_ += size;
    this.queueWithSizes_.enqueueValueWithSize(chunk, size);
  }

  /** @override */
  dequeueFromQueue() {
    const {value, size} = this.queueWithSizes_.dequeueValueWithSize();
    this.queueTotalSize_ -= size;
    if (this.queueTotalSize_ < 0) {
      // This might be less than zero due to rounding errors.
      this.queueTotalSize_ = 0;
    }
    return value;
  }

  /** @override */
  resetQueue() {
    this.queueWithSizes_.resetQueue();
  }

  /**
   * @return {?number}
   * @private
   */
  getDesiredSize_() {
    if (this.controlledReadableStream.state ===
        liteImpl.ReadableStream.State.ERRORED) {
      return null;
    }
    if (this.controlledReadableStream.state ===
        liteImpl.ReadableStream.State.CLOSED) {
      return 0;
    }
    return this.strategyHWM_ - this.queueTotalSize_;
  }
}

/**
 * An internal Queue representation that wraps a queue and has a size associated
 * with each chunk.
 * @template T
 * @package
 */
class QueueWithSizes {
  /**
   * @param {!liteImpl.Queue} queue
   */
  constructor(queue) {
    /**
     * @private @const {!liteImpl.Queue}
     */
    this.queue_ = queue;

    /**
     * @private {!Array<number>}
     */
    this.sizes_ = [];
  }

  /**
   * @param {T} chunk
   * @param {number} size
   */
  enqueueValueWithSize(chunk, size) {
    this.queue_.enqueueValue(chunk);
    this.sizes_.push(size);
  }

  /**
   * @return {{value: T, size: number}}
   */
  dequeueValueWithSize() {
    return {
      value: this.queue_.dequeueValue(),
      size: this.sizes_.shift(),
    };
  }

  /**
   * @return {void}
   */
  resetQueue() {
    this.queue_.resetQueue();
    this.sizes_ = [];
  }
}

exports = {
  ReadableStream,
  ReadableStreamAsyncIterator,
  ReadableStreamDefaultController,
  ReadableStreamDefaultReader,
  newReadableStream,
};
