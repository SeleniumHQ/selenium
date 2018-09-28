/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import * as dispose from '../disposable/dispose'
import * as tryEvent from './tryEvent'

export default function EventTargetSource (event, source, capture) {
  this.event = event
  this.source = source
  this.capture = capture
}

EventTargetSource.prototype.run = function (sink, scheduler) {
  function addEvent (e) {
    tryEvent.tryEvent(scheduler.now(), e, sink)
  }

  this.source.addEventListener(this.event, addEvent, this.capture)

  return dispose.create(disposeEventTarget,
    { target: this, addEvent: addEvent })
}

function disposeEventTarget (info) {
  var target = info.target
  target.source.removeEventListener(target.event, info.addEvent, target.capture)
}
