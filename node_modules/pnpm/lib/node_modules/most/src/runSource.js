/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import * as dispose from './disposable/dispose'
import defaultScheduler from './scheduler/defaultScheduler'

export function withDefaultScheduler (source) {
  return withScheduler(source, defaultScheduler)
}

export function withScheduler (source, scheduler) {
  return new Promise(function (resolve, reject) {
    runSource(source, scheduler, resolve, reject)
  })
}

function runSource (source, scheduler, resolve, reject) {
  var disposable = dispose.settable()
  var observer = new Drain(resolve, reject, disposable)

  disposable.setDisposable(source.run(observer, scheduler))
}

function Drain (end, error, disposable) {
  this._end = end
  this._error = error
  this._disposable = disposable
  this.active = true
}

Drain.prototype.event = function (t, x) {}

Drain.prototype.end = function (t, x) {
  if (!this.active) {
    return
  }
  this.active = false
  disposeThen(this._end, this._error, this._disposable, x)
}

Drain.prototype.error = function (t, e) {
  this.active = false
  disposeThen(this._error, this._error, this._disposable, e)
}

function disposeThen (end, error, disposable, x) {
  Promise.resolve(disposable.dispose()).then(function () {
    end(x)
  }, error)
}
