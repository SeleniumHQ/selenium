/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/* global Set, Symbol */
var iteratorSymbol
// Firefox ships a partial implementation using the name @@iterator.
// https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
if (typeof Set === 'function' && typeof new Set()['@@iterator'] === 'function') {
  iteratorSymbol = '@@iterator'
} else {
  iteratorSymbol = typeof Symbol === 'function' ? Symbol.iterator
  : '_es6shim_iterator_'
}

export function isIterable (o) {
  return typeof o[iteratorSymbol] === 'function'
}

export function getIterator (o) {
  return o[iteratorSymbol]()
}

export function makeIterable (f, o) {
  o[iteratorSymbol] = f
  return o
}
