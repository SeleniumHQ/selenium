/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import Pipe from '../sink/Pipe'

/**
 * Generalized feedback loop. Call a stepper function for each event. The stepper
 * will be called with 2 params: the current seed and the an event value.  It must
 * return a new { seed, value } pair. The `seed` will be fed back into the next
 * invocation of stepper, and the `value` will be propagated as the event value.
 * @param {function(seed:*, value:*):{seed:*, value:*}} stepper loop step function
 * @param {*} seed initial seed value passed to first stepper call
 * @param {Stream} stream event stream
 * @returns {Stream} new stream whose values are the `value` field of the objects
 * returned by the stepper
 */
export function loop (stepper, seed, stream) {
  return new Stream(new Loop(stepper, seed, stream.source))
}

function Loop (stepper, seed, source) {
  this.step = stepper
  this.seed = seed
  this.source = source
}

Loop.prototype.run = function (sink, scheduler) {
  return this.source.run(new LoopSink(this.step, this.seed, sink), scheduler)
}

function LoopSink (stepper, seed, sink) {
  this.step = stepper
  this.seed = seed
  this.sink = sink
}

LoopSink.prototype.error = Pipe.prototype.error

LoopSink.prototype.event = function (t, x) {
  var result = this.step(this.seed, x)
  this.seed = result.seed
  this.sink.event(t, result.value)
}

LoopSink.prototype.end = function (t) {
  this.sink.end(t, this.seed)
}
