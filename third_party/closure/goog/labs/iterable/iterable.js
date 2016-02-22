// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for working with ES6 iterables.
 * Note that this file is written ES5-only.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol
 */

goog.module('goog.labs.iterable');


/**
 * Get the iterator for an iterable.
 * @param {!Iterable<VALUE>} iterable
 * @return {!Iterator<VALUE>}
 * @template VALUE
 */
exports.getIterator = function(iterable) {
  return iterable[goog.global.Symbol.iterator]();
};


/**
 * Call a function with every value of an iterable.
 *
 * Warning: this function will never halt if given an iterable that
 * is never exhausted.
 *
 * @param {!function(VALUE): void} f
 * @param {!Iterable<VALUE>} iterable
 * @template VALUE
 */
exports.forEach = function(f, iterable) {
  var iterator = exports.getIterator(iterable);
  while (true) {
    var next = iterator.next();
    if (next.done) {
      return;
    }
    f(next.value);
  }
};


/**
 * Maps the values of one iterable to create another iterable.
 *
 * When next() is called on the returned iterable, it will call the given
 * function {@code f} with the next value of the given iterable
 * {@code iterable} until the given iterable is exhausted.
 *
 * @param {!function(this: THIS, VALUE): RESULT} f
 * @param {!Iterable<VALUE>} iterable
 * @return {!Iterable<RESULT>} The created iterable that gives the mapped
 *     values.
 * @template THIS, VALUE, RESULT
 */
exports.map = function(f, iterable) {
  return new FactoryIterable(function() {
    var iterator = exports.getIterator(iterable);
    return new MapIterator(f, iterator);
  });
};



/**
 * Helper class for {@code map}.
 * @param {!function(VALUE): RESULT} f
 * @param {!Iterator<VALUE>} iterator
 * @constructor
 * @implements {Iterator<RESULT>}
 * @template VALUE, RESULT
 */
var MapIterator = function(f, iterator) {
  /** @private */
  this.func_ = f;
  /** @private */
  this.iterator_ = iterator;
};


/**
 * @override
 */
MapIterator.prototype.next = function() {
  var nextObj = this.iterator_.next();

  if (nextObj.done) {
    return {done: true, value: undefined};
  }

  var mappedValue = this.func_(nextObj.value);
  return {
    done: false,
    value: mappedValue
  };
};



/**
 * Helper class to create an iterable with a given iterator factory.
 * @param {function():!Iterator<VALUE>} iteratorFactory
 * @constructor
 * @implements {Iterable<VALUE>}
 * @template VALUE
 */
var FactoryIterable = function(iteratorFactory) {
  /**
   * @private
   */
  this.iteratorFactory_ = iteratorFactory;
};


// TODO(nnaze): For now, this section is not run if Symbol is not defined,
// since goog.global.Symbol.iterator will not be defined below.
// Determine best course of action if "Symbol" is not available.
if (goog.global.Symbol) {
  /**
   * @return {!Iterator<VALUE>}
   */
  FactoryIterable.prototype[goog.global.Symbol.iterator] = function() {
    return this.iteratorFactory_();
  };
}
