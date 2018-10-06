/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import * as dispose from '../disposable/dispose'
import PropagateTask from '../scheduler/PropagateTask'

/**
 * Stream containing only x
 * @param {*} x
 * @returns {Stream}
 */
export function of (x) {
  return new Stream(new Just(x))
}

function Just (x) {
  this.value = x
}

Just.prototype.run = function (sink, scheduler) {
  return scheduler.asap(new PropagateTask(runJust, this.value, sink))
}

function runJust (t, x, sink) {
  sink.event(t, x)
  sink.end(t, void 0)
}

/**
 * Stream containing no events and ends immediately
 * @returns {Stream}
 */
export function empty () {
  return EMPTY
}

function EmptySource () {}

EmptySource.prototype.run = function (sink, scheduler) {
  var task = PropagateTask.end(void 0, sink)
  scheduler.asap(task)

  return dispose.create(disposeEmpty, task)
}

function disposeEmpty (task) {
  return task.dispose()
}

var EMPTY = new Stream(new EmptySource())

/**
 * Stream containing no events and never ends
 * @returns {Stream}
 */
export function never () {
  return NEVER
}

function NeverSource () {}

NeverSource.prototype.run = function () {
  return dispose.empty()
}

var NEVER = new Stream(new NeverSource())
