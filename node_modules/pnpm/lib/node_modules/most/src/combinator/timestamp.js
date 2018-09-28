/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import Pipe from '../sink/Pipe'

export function timestamp (stream) {
  return new Stream(new Timestamp(stream.source))
}

function Timestamp (source) {
  this.source = source
}

Timestamp.prototype.run = function (sink, scheduler) {
  return this.source.run(new TimestampSink(sink), scheduler)
}

function TimestampSink (sink) {
  this.sink = sink
}

TimestampSink.prototype.end = Pipe.prototype.end
TimestampSink.prototype.error = Pipe.prototype.error

TimestampSink.prototype.event = function (t, x) {
  this.sink.event(t, { time: t, value: x })
}
