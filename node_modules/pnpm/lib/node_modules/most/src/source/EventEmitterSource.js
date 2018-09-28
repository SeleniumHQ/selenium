/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import DeferredSink from '../sink/DeferredSink'
import * as dispose from '../disposable/dispose'
import * as tryEvent from './tryEvent'

export default function EventEmitterSource (event, source) {
  this.event = event
  this.source = source
}

EventEmitterSource.prototype.run = function (sink, scheduler) {
  // NOTE: Because EventEmitter allows events in the same call stack as
  // a listener is added, use a DeferredSink to buffer events
  // until the stack clears, then propagate.  This maintains most.js's
  // invariant that no event will be delivered in the same call stack
  // as an observer begins observing.
  var dsink = new DeferredSink(sink)

  function addEventVariadic (a) {
    var l = arguments.length
    if (l > 1) {
      var arr = new Array(l)
      for (var i = 0; i < l; ++i) {
        arr[i] = arguments[i]
      }
      tryEvent.tryEvent(scheduler.now(), arr, dsink)
    } else {
      tryEvent.tryEvent(scheduler.now(), a, dsink)
    }
  }

  this.source.addListener(this.event, addEventVariadic)

  return dispose.create(disposeEventEmitter, { target: this, addEvent: addEventVariadic })
}

function disposeEventEmitter (info) {
  var target = info.target
  target.source.removeListener(target.event, info.addEvent)
}
