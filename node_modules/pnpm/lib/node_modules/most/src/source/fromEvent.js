/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import EventTargetSource from './EventTargetSource'
import EventEmitterSource from './EventEmitterSource'

/**
 * Create a stream from an EventTarget, such as a DOM Node, or EventEmitter.
 * @param {String} event event type name, e.g. 'click'
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter
 * @param {*?} capture for DOM events, whether to use
 *  capturing--passed as 3rd parameter to addEventListener.
 * @returns {Stream} stream containing all events of the specified type
 * from the source.
 */
export function fromEvent (event, source, capture) { // eslint-disable-line complexity
  var s

  if (typeof source.addEventListener === 'function' && typeof source.removeEventListener === 'function') {
    if (arguments.length < 3) {
      capture = false
    }

    s = new EventTargetSource(event, source, capture)
  } else if (typeof source.addListener === 'function' && typeof source.removeListener === 'function') {
    s = new EventEmitterSource(event, source)
  } else {
    throw new Error('source must support addEventListener/removeEventListener or addListener/removeListener')
  }

  return new Stream(s)
}
