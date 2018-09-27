/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import { of as streamOf } from '../source/core'
import { continueWith } from './continueWith'

/**
 * @param {*} x value to prepend
 * @param {Stream} stream
 * @returns {Stream} new stream with x prepended
 */
export function cons (x, stream) {
  return concat(streamOf(x), stream)
}

/**
* @param {Stream} left
* @param {Stream} right
* @returns {Stream} new stream containing all events in left followed by all
*  events in right.  This *timeshifts* right to the end of left.
*/
export function concat (left, right) {
  return continueWith(function () {
    return right
  }, left)
}
