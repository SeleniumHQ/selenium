/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

export function isPromise (p) {
  return p !== null && typeof p === 'object' && typeof p.then === 'function'
}
