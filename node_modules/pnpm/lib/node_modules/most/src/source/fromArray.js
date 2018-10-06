/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import PropagateTask from '../scheduler/PropagateTask'

export function fromArray (a) {
  return new Stream(new ArraySource(a))
}

function ArraySource (a) {
  this.array = a
}

ArraySource.prototype.run = function (sink, scheduler) {
  return scheduler.asap(new PropagateTask(runProducer, this.array, sink))
}

function runProducer (t, array, sink) {
  for (var i = 0, l = array.length; i < l && this.active; ++i) {
    sink.event(t, array[i])
  }

  this.active && sink.end(t)
}
