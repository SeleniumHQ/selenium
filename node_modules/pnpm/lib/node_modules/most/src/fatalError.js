/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

export default function fatalError (e) {
  setTimeout(function () {
    throw e
  }, 0)
}
