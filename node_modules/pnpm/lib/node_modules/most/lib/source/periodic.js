'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.periodic = periodic;

var _Stream = require('../Stream');

var _Stream2 = _interopRequireDefault(_Stream);

var _PropagateTask = require('../scheduler/PropagateTask');

var _PropagateTask2 = _interopRequireDefault(_PropagateTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a stream that emits the current time periodically
 * @param {Number} period periodicity of events in millis
 * @param {*} deprecatedValue @deprecated value to emit each period
 * @returns {Stream} new stream that emits the current time every period
 */
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function periodic(period, deprecatedValue) {
  return new _Stream2.default(new Periodic(period, deprecatedValue));
}

function Periodic(period, value) {
  this.period = period;
  this.value = value;
}

Periodic.prototype.run = function (sink, scheduler) {
  return scheduler.periodic(this.period, _PropagateTask2.default.event(this.value, sink));
};