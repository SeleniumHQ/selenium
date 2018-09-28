/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import SafeSink from '../sink/SafeSink'
import * as dispose from '../disposable/dispose'
import * as tryEvent from '../source/tryEvent'
import PropagateTask from '../scheduler/PropagateTask'

/**
 * If stream encounters an error, recover and continue with items from stream
 * returned by f.
 * @param {function(error:*):Stream} f function which returns a new stream
 * @param {Stream} stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
export function recoverWith (f, stream) {
  return new Stream(new RecoverWith(f, stream.source))
}

export var flatMapError = recoverWith

/**
 * Create a stream containing only an error
 * @param {*} e error value, preferably an Error or Error subtype
 * @returns {Stream} new stream containing only an error
 */
export function throwError (e) {
  return new Stream(new ErrorSource(e))
}

function ErrorSource (e) {
  this.value = e
}

ErrorSource.prototype.run = function (sink, scheduler) {
  return scheduler.asap(new PropagateTask(runError, this.value, sink))
}

function runError (t, e, sink) {
  sink.error(t, e)
}

function RecoverWith (f, source) {
  this.f = f
  this.source = source
}

RecoverWith.prototype.run = function (sink, scheduler) {
  return new RecoverWithSink(this.f, this.source, sink, scheduler)
}

function RecoverWithSink (f, source, sink, scheduler) {
  this.f = f
  this.sink = new SafeSink(sink)
  this.scheduler = scheduler
  this.disposable = source.run(this, scheduler)
}

RecoverWithSink.prototype.event = function (t, x) {
  tryEvent.tryEvent(t, x, this.sink)
}

RecoverWithSink.prototype.end = function (t, x) {
  tryEvent.tryEnd(t, x, this.sink)
}

RecoverWithSink.prototype.error = function (t, e) {
  var nextSink = this.sink.disable()

  dispose.tryDispose(t, this.disposable, this.sink)
  this._startNext(t, e, nextSink)
}

RecoverWithSink.prototype._startNext = function (t, x, sink) {
  try {
    this.disposable = this._continue(this.f, x, sink)
  } catch (e) {
    sink.error(t, e)
  }
}

RecoverWithSink.prototype._continue = function (f, x, sink) {
  var stream = f(x)
  return stream.source.run(sink, this.scheduler)
}

RecoverWithSink.prototype.dispose = function () {
  return this.disposable.dispose()
}
