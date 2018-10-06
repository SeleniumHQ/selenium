/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import Pipe from '../sink/Pipe'
import * as dispose from '../disposable/dispose'
import * as base from '@most/prelude'
import invoke from '../invoke'

/**
 * When an event arrives on sampler, emit the result of calling f with the latest
 * values of all streams being sampled
 * @param {function(...values):*} f function to apply to each set of sampled values
 * @param {Stream} sampler streams will be sampled whenever an event arrives
 *  on sampler
 * @returns {Stream} stream of sampled and transformed values
 */
export function sample (f, sampler /*, ...streams */) {
  return sampleArray(f, sampler, base.drop(2, arguments))
}

/**
 * When an event arrives on sampler, emit the latest event value from stream.
 * @param {Stream} sampler stream of events at whose arrival time
 *  stream's latest value will be propagated
 * @param {Stream} stream stream of values
 * @returns {Stream} sampled stream of values
 */
export function sampleWith (sampler, stream) {
  return new Stream(new Sampler(base.id, sampler.source, [stream.source]))
}

export function sampleArray (f, sampler, streams) {
  return new Stream(new Sampler(f, sampler.source, base.map(getSource, streams)))
}

function getSource (stream) {
  return stream.source
}

function Sampler (f, sampler, sources) {
  this.f = f
  this.sampler = sampler
  this.sources = sources
}

Sampler.prototype.run = function (sink, scheduler) {
  var l = this.sources.length
  var disposables = new Array(l + 1)
  var sinks = new Array(l)

  var sampleSink = new SampleSink(this.f, sinks, sink)

  for (var hold, i = 0; i < l; ++i) {
    hold = sinks[i] = new Hold(sampleSink)
    disposables[i] = this.sources[i].run(hold, scheduler)
  }

  disposables[i] = this.sampler.run(sampleSink, scheduler)

  return dispose.all(disposables)
}

function Hold (sink) {
  this.sink = sink
  this.hasValue = false
}

Hold.prototype.event = function (t, x) {
  this.value = x
  this.hasValue = true
  this.sink._notify(this)
}

Hold.prototype.end = function () {}
Hold.prototype.error = Pipe.prototype.error

function SampleSink (f, sinks, sink) {
  this.f = f
  this.sinks = sinks
  this.sink = sink
  this.active = false
}

SampleSink.prototype._notify = function () {
  if (!this.active) {
    this.active = this.sinks.every(hasValue)
  }
}

SampleSink.prototype.event = function (t) {
  if (this.active) {
    this.sink.event(t, invoke(this.f, base.map(getValue, this.sinks)))
  }
}

SampleSink.prototype.end = Pipe.prototype.end
SampleSink.prototype.error = Pipe.prototype.error

function hasValue (hold) {
  return hold.hasValue
}

function getValue (hold) {
  return hold.value
}
