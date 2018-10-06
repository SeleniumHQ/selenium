"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Stream;
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function Stream(source) {
  this.source = source;
}

Stream.prototype.run = function (sink, scheduler) {
  return this.source.run(sink, scheduler);
};