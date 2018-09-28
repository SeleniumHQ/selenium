/** @license MIT License (c) copyright 2010-2017 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

export function thru (f, stream) {
  return f(stream)
}
