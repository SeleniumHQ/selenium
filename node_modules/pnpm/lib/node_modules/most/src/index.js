/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/* eslint import/first: 0 */

import Stream from './Stream'
import * as base from '@most/prelude'
import { of, empty, never } from './source/core'
import { from } from './source/from'
import { periodic } from './source/periodic'
import symbolObservable from 'symbol-observable'

/**
 * Core stream type
 * @type {Stream}
 */
export { Stream }

// Add of and empty to constructor for fantasy-land compat
Stream.of = of
Stream.empty = empty
// Add from to constructor for ES Observable compat
Stream.from = from
export { of, of as just, empty, never, from, periodic }

// -----------------------------------------------------------------------
// Draft ES Observable proposal interop
// https://github.com/zenparsing/es-observable

import { subscribe } from './observable/subscribe'

Stream.prototype.subscribe = function (subscriber) {
  return subscribe(subscriber, this)
}

Stream.prototype[symbolObservable] = function () {
  return this
}

// -----------------------------------------------------------------------
// Fluent adapter

import { thru } from './combinator/thru'

/**
 * Adapt a functional stream transform to fluent style.
 * It applies f to the this stream object
 * @param  {function(s: Stream): Stream} f function that
 * receives the stream itself and must return a new stream
 * @return {Stream}
 */
Stream.prototype.thru = function (f) {
  return thru(f, this)
}

// -----------------------------------------------------------------------
// Adapting other sources

/**
 * Create a stream of events from the supplied EventTarget or EventEmitter
 * @param {String} event event name
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter. The source
 *  must support either addEventListener/removeEventListener (w3c EventTarget:
 *  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget),
 *  or addListener/removeListener (node EventEmitter: http://nodejs.org/api/events.html)
 * @returns {Stream} stream of events of the specified type from the source
 */
export { fromEvent } from './source/fromEvent'

// -----------------------------------------------------------------------
// Observing

import { observe, drain } from './combinator/observe'

export { observe, observe as forEach, drain }

/**
 * Process all the events in the stream
 * @returns {Promise} promise that fulfills when the stream ends, or rejects
 *  if the stream fails with an unhandled error.
 */
Stream.prototype.observe = Stream.prototype.forEach = function (f) {
  return observe(f, this)
}

/**
 * Consume all events in the stream, without providing a function to process each.
 * This causes a stream to become active and begin emitting events, and is useful
 * in cases where all processing has been setup upstream via other combinators, and
 * there is no need to process the terminal events.
 * @returns {Promise} promise that fulfills when the stream ends, or rejects
 *  if the stream fails with an unhandled error.
 */
Stream.prototype.drain = function () {
  return drain(this)
}

// -------------------------------------------------------

import { loop } from './combinator/loop'

export { loop }

/**
 * Generalized feedback loop. Call a stepper function for each event. The stepper
 * will be called with 2 params: the current seed and the an event value.  It must
 * return a new { seed, value } pair. The `seed` will be fed back into the next
 * invocation of stepper, and the `value` will be propagated as the event value.
 * @param {function(seed:*, value:*):{seed:*, value:*}} stepper loop step function
 * @param {*} seed initial seed value passed to first stepper call
 * @returns {Stream} new stream whose values are the `value` field of the objects
 * returned by the stepper
 */
Stream.prototype.loop = function (stepper, seed) {
  return loop(stepper, seed, this)
}

// -------------------------------------------------------

import { scan, reduce } from './combinator/accumulate'

export { scan, reduce }

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @returns {Stream} new stream containing successive reduce results
 */
Stream.prototype.scan = function (f, initial) {
  return scan(f, initial, this)
}

/**
 * Reduce the stream to produce a single result.  Note that reducing an infinite
 * stream will return a Promise that never fulfills, but that may reject if an error
 * occurs.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial optional initial value
 * @returns {Promise} promise for the file result of the reduce
 */
Stream.prototype.reduce = function (f, initial) {
  return reduce(f, initial, this)
}

// -----------------------------------------------------------------------
// Building and extending

export { unfold } from './source/unfold'
export { iterate } from './source/iterate'
export { generate } from './source/generate'
import { concat, cons as startWith } from './combinator/build'

export { concat, startWith }

/**
 * @param {Stream} tail
 * @returns {Stream} new stream containing all items in this followed by
 *  all items in tail
 */
Stream.prototype.concat = function (tail) {
  return concat(this, tail)
}

/**
 * @param {*} x value to prepend
 * @returns {Stream} a new stream with x prepended
 */
Stream.prototype.startWith = function (x) {
  return startWith(x, this)
}

// -----------------------------------------------------------------------
// Transforming

import { map, constant, tap } from './combinator/transform'
import { ap } from './combinator/applicative'

export { map, constant, tap, ap }

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @returns {Stream} stream containing items transformed by f
 */
Stream.prototype.map = function (f) {
  return map(f, this)
}

/**
 * Assume this stream contains functions, and apply each function to each item
 * in the provided stream.  This generates, in effect, a cross product.
 * @param {Stream} xs stream of items to which
 * @returns {Stream} stream containing the cross product of items
 */
Stream.prototype.ap = function (xs) {
  return ap(this, xs)
}

/**
 * Replace each value in the stream with x
 * @param {*} x
 * @returns {Stream} stream containing items replaced with x
 */
Stream.prototype.constant = function (x) {
  return constant(x, this)
}

/**
 * Perform a side effect for each item in the stream
 * @param {function(x:*):*} f side effect to execute for each item. The
 *  return value will be discarded.
 * @returns {Stream} new stream containing the same items as this stream
 */
Stream.prototype.tap = function (f) {
  return tap(f, this)
}

// -----------------------------------------------------------------------
// Transducer support

import { transduce } from './combinator/transduce'

export { transduce }

/**
 * Transform this stream by passing its events through a transducer.
 * @param  {function} transducer transducer function
 * @return {Stream} stream of events transformed by the transducer
 */
Stream.prototype.transduce = function (transducer) {
  return transduce(transducer, this)
}

// -----------------------------------------------------------------------
// FlatMapping

import { flatMap, join } from './combinator/flatMap'

// @deprecated flatMap, use chain instead
export { flatMap, flatMap as chain, join }

/**
 * Map each value in the stream to a new stream, and merge it into the
 * returned outer stream. Event arrival times are preserved.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @returns {Stream} new stream containing all events from each stream returned by f
 */
Stream.prototype.chain = function (f) {
  return flatMap(f, this)
}

// @deprecated use chain instead
Stream.prototype.flatMap = Stream.prototype.chain

  /**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer. Event arrival times are preserved.
 * @returns {Stream<X>} new stream containing all events of all inner streams
 */
Stream.prototype.join = function () {
  return join(this)
}

import { continueWith } from './combinator/continueWith'

// @deprecated flatMapEnd, use continueWith instead
export { continueWith, continueWith as flatMapEnd }

/**
 * Map the end event to a new stream, and begin emitting its values.
 * @param {function(x:*):Stream} f function that receives the end event value,
 * and *must* return a new Stream to continue with.
 * @returns {Stream} new stream that emits all events from the original stream,
 * followed by all events from the stream returned by f.
 */
Stream.prototype.continueWith = function (f) {
  return continueWith(f, this)
}

// @deprecated use continueWith instead
Stream.prototype.flatMapEnd = Stream.prototype.continueWith

import { concatMap } from './combinator/concatMap'

export { concatMap }

Stream.prototype.concatMap = function (f) {
  return concatMap(f, this)
}

// -----------------------------------------------------------------------
// Concurrent merging

import { mergeConcurrently } from './combinator/mergeConcurrently'

export { mergeConcurrently }

/**
 * Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer, limiting the number of inner streams that may
 * be active concurrently.
 * @param {number} concurrency at most this many inner streams will be
 *  allowed to be active concurrently.
 * @return {Stream<X>} new stream containing all events of all inner
 *  streams, with limited concurrency.
 */
Stream.prototype.mergeConcurrently = function (concurrency) {
  return mergeConcurrently(concurrency, this)
}

// -----------------------------------------------------------------------
// Merging

import { merge, mergeArray } from './combinator/merge'

export { merge, mergeArray }

/**
 * Merge this stream and all the provided streams
 * @returns {Stream} stream containing items from this stream and s in time
 * order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
Stream.prototype.merge = function (/* ...streams */) {
  return mergeArray(base.cons(this, arguments))
}

// -----------------------------------------------------------------------
// Combining

import { combine, combineArray } from './combinator/combine'

export { combine, combineArray }

/**
 * Combine latest events from all input streams
 * @param {function(...events):*} f function to combine most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
Stream.prototype.combine = function (f /*, ...streams */) {
  return combineArray(f, base.replace(this, 0, arguments))
}

// -----------------------------------------------------------------------
// Sampling

import { sample, sampleArray, sampleWith } from './combinator/sample'

export { sample, sampleArray, sampleWith }

/**
 * When an event arrives on sampler, emit the latest event value from stream.
 * @param {Stream} sampler stream of events at whose arrival time
 *  signal's latest value will be propagated
 * @returns {Stream} sampled stream of values
 */
Stream.prototype.sampleWith = function (sampler) {
  return sampleWith(sampler, this)
}

/**
 * When an event arrives on this stream, emit the result of calling f with the latest
 * values of all streams being sampled
 * @param {function(...values):*} f function to apply to each set of sampled values
 * @returns {Stream} stream of sampled and transformed values
 */
Stream.prototype.sample = function (f /* ...streams */) {
  return sampleArray(f, this, base.tail(arguments))
}

// -----------------------------------------------------------------------
// Zipping

import { zip, zipArray } from './combinator/zip'

export { zip, zipArray }

/**
 * Pair-wise combine items with those in s. Given 2 streams:
 * [1,2,3] zipWith f [4,5,6] -> [f(1,4),f(2,5),f(3,6)]
 * Note: zip causes fast streams to buffer and wait for slow streams.
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @returns {Stream} new stream containing pairs
 */
Stream.prototype.zip = function (f /*, ...streams */) {
  return zipArray(f, base.replace(this, 0, arguments))
}

// -----------------------------------------------------------------------
// Switching

import { switchLatest } from './combinator/switch'

// @deprecated switch, use switchLatest instead
export { switchLatest, switchLatest as switch }

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @returns {Stream} switching stream
 */
Stream.prototype.switchLatest = function () {
  return switchLatest(this)
}

// @deprecated use switchLatest instead
Stream.prototype.switch = Stream.prototype.switchLatest

// -----------------------------------------------------------------------
// Filtering

import { filter, skipRepeats, skipRepeatsWith } from './combinator/filter'

// @deprecated distinct, use skipRepeats instead
// @deprecated distinctBy, use skipRepeatsWith instead
export { filter, skipRepeats, skipRepeats as distinct, skipRepeatsWith, skipRepeatsWith as distinctBy }

/**
 * Retain only items matching a predicate
 * stream:                           -12345678-
 * filter(x => x % 2 === 0, stream): --2-4-6-8-
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
Stream.prototype.filter = function (p) {
  return filter(p, this)
}

/**
 * Skip repeated events, using === to compare items
 * stream:           -abbcd-
 * distinct(stream): -ab-cd-
 * @returns {Stream} stream with no repeated events
 */
Stream.prototype.skipRepeats = function () {
  return skipRepeats(this)
}

/**
 * Skip repeated events, using supplied equals function to compare items
 * @param {function(a:*, b:*):boolean} equals function to compare items
 * @returns {Stream} stream with no repeated events
 */
Stream.prototype.skipRepeatsWith = function (equals) {
  return skipRepeatsWith(equals, this)
}

// -----------------------------------------------------------------------
// Slicing

import { take, skip, slice, takeWhile, skipWhile, skipAfter } from './combinator/slice'

export { take, skip, slice, takeWhile, skipWhile, skipAfter }

/**
 * stream:          -abcd-
 * take(2, stream): -ab|
 * @param {Number} n take up to this many events
 * @returns {Stream} stream containing at most the first n items from this stream
 */
Stream.prototype.take = function (n) {
  return take(n, this)
}

/**
 * stream:          -abcd->
 * skip(2, stream): ---cd->
 * @param {Number} n skip this many events
 * @returns {Stream} stream not containing the first n events
 */
Stream.prototype.skip = function (n) {
  return skip(n, this)
}

/**
 * Slice a stream by event index. Equivalent to, but more efficient than
 * stream.take(end).skip(start);
 * NOTE: Negative start and end are not supported
 * @param {Number} start skip all events before the start index
 * @param {Number} end allow all events from the start index to the end index
 * @returns {Stream} stream containing items where start <= index < end
 */
Stream.prototype.slice = function (start, end) {
  return slice(start, end, this)
}

/**
 * stream:                        -123451234->
 * takeWhile(x => x < 5, stream): -1234|
 * @param {function(x:*):boolean} p predicate
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
Stream.prototype.takeWhile = function (p) {
  return takeWhile(p, this)
}

/**
 * stream:                        -123451234->
 * skipWhile(x => x < 5, stream): -----51234->
 * @param {function(x:*):boolean} p predicate
 * @returns {Stream} stream containing items following *and including* the
 * first item for which p returns falsy.
 */
Stream.prototype.skipWhile = function (p) {
  return skipWhile(p, this)
}

/**
 * stream:                         -123456789->
 * skipAfter(x => x === 5, stream):-12345|
 * @param {function(x:*):boolean} p predicate
 * @returns {Stream} stream containing items up to, *and including*, the
 * first item for which p returns truthy.
 */
Stream.prototype.skipAfter = function (p) {
  return skipAfter(p, this)
}

// -----------------------------------------------------------------------
// Time slicing

import { takeUntil, skipUntil, during } from './combinator/timeslice'

// @deprecated takeUntil, use until instead
// @deprecated skipUntil, use since instead
export { takeUntil, takeUntil as until, skipUntil, skipUntil as since, during }

/**
 * stream:                    -a-b-c-d-e-f-g->
 * signal:                    -------x
 * takeUntil(signal, stream): -a-b-c-|
 * @param {Stream} signal retain only events in stream before the first
 * event in signal
 * @returns {Stream} new stream containing only events that occur before
 * the first event in signal.
 */
Stream.prototype.until = function (signal) {
  return takeUntil(signal, this)
}

// @deprecated use until instead
Stream.prototype.takeUntil = Stream.prototype.until

  /**
 * stream:                    -a-b-c-d-e-f-g->
 * signal:                    -------x
 * takeUntil(signal, stream): -------d-e-f-g->
 * @param {Stream} signal retain only events in stream at or after the first
 * event in signal
 * @returns {Stream} new stream containing only events that occur after
 * the first event in signal.
 */
Stream.prototype.since = function (signal) {
  return skipUntil(signal, this)
}

// @deprecated use since instead
Stream.prototype.skipUntil = Stream.prototype.since

  /**
 * stream:                    -a-b-c-d-e-f-g->
 * timeWindow:                -----s
 * s:                               -----t
 * stream.during(timeWindow): -----c-d-e-|
 * @param {Stream<Stream>} timeWindow a stream whose first event (s) represents
 *  the window start time.  That event (s) is itself a stream whose first event (t)
 *  represents the window end time
 * @returns {Stream} new stream containing only events within the provided timespan
 */
Stream.prototype.during = function (timeWindow) {
  return during(timeWindow, this)
}

// -----------------------------------------------------------------------
// Delaying

import { delay } from './combinator/delay'

export { delay }

/**
 * @param {Number} delayTime milliseconds to delay each item
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
Stream.prototype.delay = function (delayTime) {
  return delay(delayTime, this)
}

// -----------------------------------------------------------------------
// Getting event timestamp

import { timestamp } from './combinator/timestamp'
export { timestamp }

/**
 * Expose event timestamps into the stream. Turns a Stream<X> into
 * Stream<{time:t, value:X}>
 * @returns {Stream<{time:number, value:*}>}
 */
Stream.prototype.timestamp = function () {
  return timestamp(this)
}

// -----------------------------------------------------------------------
// Rate limiting

import { throttle, debounce } from './combinator/limit'

export { throttle, debounce }

/**
 * Limit the rate of events
 * stream:              abcd----abcd----
 * throttle(2, stream): a-c-----a-c-----
 * @param {Number} period time to suppress events
 * @returns {Stream} new stream that skips events for throttle period
 */
Stream.prototype.throttle = function (period) {
  return throttle(period, this)
}

/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * stream:              abcd----abcd----
 * debounce(2, stream): -----d-------d--
 * @param {Number} period events occuring more frequently than this
 *  on the provided scheduler will be suppressed
 * @returns {Stream} new debounced stream
 */
Stream.prototype.debounce = function (period) {
  return debounce(period, this)
}

// -----------------------------------------------------------------------
// Awaiting Promises

import { fromPromise, awaitPromises } from './combinator/promises'

// @deprecated await, use awaitPromises instead
export { fromPromise, awaitPromises, awaitPromises as await }

/**
 * Await promises, turning a Stream<Promise<X>> into Stream<X>.  Preserves
 * event order, but timeshifts events based on promise resolution time.
 * @returns {Stream<X>} stream containing non-promise values
 */
Stream.prototype.awaitPromises = function () {
  return awaitPromises(this)
}

// @deprecated use awaitPromises instead
Stream.prototype.await = Stream.prototype.awaitPromises

// -----------------------------------------------------------------------
// Error handling

import { recoverWith, flatMapError, throwError } from './combinator/errors'

// @deprecated flatMapError, use recoverWith instead
export { recoverWith, flatMapError, throwError }

/**
 * If this stream encounters an error, recover and continue with items from stream
 * returned by f.
 * stream:                  -a-b-c-X-
 * f(X):                           d-e-f-g-
 * flatMapError(f, stream): -a-b-c-d-e-f-g-
 * @param {function(error:*):Stream} f function which returns a new stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
Stream.prototype.recoverWith = function (f) {
  return flatMapError(f, this)
}

// @deprecated use recoverWith instead
Stream.prototype.flatMapError = Stream.prototype.recoverWith

// -----------------------------------------------------------------------
// Multicasting

import multicast from '@most/multicast'

export { multicast }

/**
 * Transform the stream into multicast stream.  That means that many subscribers
 * to the stream will not cause multiple invocations of the internal machinery.
 * @returns {Stream} new stream which will multicast events to all observers.
 */
Stream.prototype.multicast = function () {
  return multicast(this)
}

// export the instance of the defaultScheduler for third-party libraries
import defaultScheduler from './scheduler/defaultScheduler'

export { defaultScheduler }

// export an implementation of Task used internally for third-party libraries
import PropagateTask from './scheduler/PropagateTask'

export { PropagateTask }
