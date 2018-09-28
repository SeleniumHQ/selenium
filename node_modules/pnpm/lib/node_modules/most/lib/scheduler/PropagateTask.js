'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PropagateTask;

var _fatalError = require('../fatalError');

var _fatalError2 = _interopRequireDefault(_fatalError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function PropagateTask(run, value, sink) {
  this._run = run;
  this.value = value;
  this.sink = sink;
  this.active = true;
} /** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

PropagateTask.event = function (value, sink) {
  return new PropagateTask(emit, value, sink);
};

PropagateTask.end = function (value, sink) {
  return new PropagateTask(end, value, sink);
};

PropagateTask.error = function (value, sink) {
  return new PropagateTask(error, value, sink);
};

PropagateTask.prototype.dispose = function () {
  this.active = false;
};

PropagateTask.prototype.run = function (t) {
  if (!this.active) {
    return;
  }
  this._run(t, this.value, this.sink);
};

PropagateTask.prototype.error = function (t, e) {
  if (!this.active) {
    return (0, _fatalError2.default)(e);
  }
  this.sink.error(t, e);
};

function error(t, e, sink) {
  sink.error(t, e);
}

function emit(t, x, sink) {
  sink.event(t, x);
}

function end(t, x, sink) {
  sink.end(t, x);
}