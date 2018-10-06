/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import PropagateTask from '../scheduler/PropagateTask'

/**
 * Create a stream that emits the current time periodically
 * @param {Number} period periodicity of events in millis
 * @param {*} deprecatedValue @deprecated value to emit each period
 * @returns {Stream} new stream that emits the current time every period
 */
export function periodic (period, deprecatedValue) {
  return new Stream(new Periodic(period, deprecatedValue))
}

function Periodic (period, value) {
  this.period = period
  this.value = value
}

Periodic.prototype.run = function (sink, scheduler) {
  return scheduler.periodic(this.period, PropagateTask.event(this.value, sink))
}
