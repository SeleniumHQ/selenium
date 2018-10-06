'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ap = ap;

var _combine = require('./combine');

var _prelude = require('@most/prelude');

/**
 * Assume fs is a stream containing functions, and apply the latest function
 * in fs to the latest value in xs.
 * fs:         --f---------g--------h------>
 * xs:         -a-------b-------c-------d-->
 * ap(fs, xs): --fa-----fb-gb---gc--hc--hd->
 * @param {Stream} fs stream of functions to apply to the latest x
 * @param {Stream} xs stream of values to which to apply all the latest f
 * @returns {Stream} stream containing all the applications of fs to xs
 */
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function ap(fs, xs) {
  return (0, _combine.combine)(_prelude.apply, fs, xs);
}