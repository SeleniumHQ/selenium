/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import * as dispose from '../disposable/dispose'
import { tryEnd, tryEvent } from '../source/tryEvent'

export function fromObservable (observable) {
  return new Stream(new ObservableSource(observable))
}

export function ObservableSource (observable) {
  this.observable = observable
}

ObservableSource.prototype.run = function (sink, scheduler) {
  var sub = this.observable.subscribe(new SubscriberSink(sink, scheduler))
  if (typeof sub === 'function') {
    return dispose.create(sub)
  } else if (sub && typeof sub.unsubscribe === 'function') {
    return dispose.create(unsubscribe, sub)
  }

  throw new TypeError('Observable returned invalid subscription ' + String(sub))
}

export function SubscriberSink (sink, scheduler) {
  this.sink = sink
  this.scheduler = scheduler
}

SubscriberSink.prototype.next = function (x) {
  tryEvent(this.scheduler.now(), x, this.sink)
}

SubscriberSink.prototype.complete = function (x) {
  tryEnd(this.scheduler.now(), x, this.sink)
}

SubscriberSink.prototype.error = function (e) {
  this.sink.error(this.scheduler.now(), e)
}

function unsubscribe (subscription) {
  return subscription.unsubscribe()
}
