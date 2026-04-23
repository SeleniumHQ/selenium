/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for working with ES6 iterables.
 *
 * The goal is that this should be a replacement for goog.iter which uses
 * a now non-standard approach to iterables.
 *
 * This module's API should track the TC39 proposal as closely as possible to
 * allow for eventual deprecation and migrations.
 * https://github.com/tc39/proposal-iterator-helpers
 *
 * @see go/closure-iters-labs
 * @see https://goo.gl/Rok5YQ
 */

goog.module('goog.collections.iters');
goog.module.declareLegacyNamespace();

/**
 * Get the iterator for an iterable.
 * @param {!Iterable<VALUE>} iterable
 * @return {!Iterator<VALUE>}
 * @template VALUE
 */
function getIterator(iterable) {
  return iterable[goog.global.Symbol.iterator]();
}
exports.getIterator = getIterator;


/**
 * Call a function with every value of an iterable.
 *
 * Warning: this function will never halt if given an iterable that
 * is never exhausted.
 *
 * @param {!Iterator<VALUE>} iterator
 * @param {function(VALUE) : *} f
 * @template VALUE
 */
function forEach(iterator, f) {
  let result;
  while (!(result = iterator.next()).done) {
    f(result.value);
  }
}
exports.forEach = forEach;

/**
 * An Iterable that wraps a child iterable, and maps every element of the child
 * iterator to a new value, using a mapping function. Similar to Array.map, but
 * for Iterable.
 * @template TO,FROM
 * @implements {IteratorIterable<TO>}
 */
class MapIterator {
  /**
   * @param {!Iterable<FROM>} childIter
   * @param {function(FROM): TO} mapFn
   */
  constructor(childIter, mapFn) {
    /** @private @const {!Iterator<FROM>} */
    this.childIterator_ = getIterator(childIter);

    /** @private @const {function(FROM): TO} */
    this.mapFn_ = mapFn;
  }

  [Symbol.iterator]() {
    return this;
  }

  /** @override */
  next() {
    const childResult = this.childIterator_.next();
    // Always return a new object, even when childResult.done == true. This is
    // so that we don't accidentally preserve generator return values, which
    // are unlikely to be meaningful in the context of this MapIterator.
    return {
      value: childResult.done ? undefined :
                                this.mapFn_.call(undefined, childResult.value),
      done: childResult.done,
    };
  }
}


/**
 * Maps the values of one iterable to create another iterable.
 *
 * When next() is called on the returned iterable, it will call the given
 * function `f` with the next value of the given iterable
 * `iterable` until the given iterable is exhausted.
 *
 * @param {!Iterable<VALUE>} iterable
 * @param {function(VALUE): RESULT} f
 * @return {!IteratorIterable<RESULT>} The created iterable that gives the
 *     mapped values.
 * @template VALUE, RESULT
 */
exports.map = function(iterable, f) {
  return new MapIterator(iterable, f);
};


/**
 * An Iterable that wraps a child Iterable and returns a subset of the child's
 * items, based on a filter function. Similar to Array.filter, but for
 * Iterable.
 * @template T
 * @implements {IteratorIterable<T>}
 */
class FilterIterator {
  /**
   * @param {!Iterable<T>} childIter
   * @param {function(T): boolean} filterFn
   */
  constructor(childIter, filterFn) {
    /** @private @const {!Iterator<T>} */
    this.childIter_ = getIterator(childIter);

    /** @private @const {function(T): boolean} */
    this.filterFn_ = filterFn;
  }

  [Symbol.iterator]() {
    return this;
  }

  /** @override */
  next() {
    while (true) {
      const childResult = this.childIter_.next();
      if (childResult.done) {
        // Don't return childResult directly, because that would preserve
        // generator return values, and we want to ignore them.
        return {done: true, value: undefined};
      }
      const passesFilter = this.filterFn_.call(undefined, childResult.value);
      if (passesFilter) {
        return childResult;
      }
    }
  }
}


/**
 * Filter elements from one iterator to create another iterable.
 *
 * When next() is called on the returned iterator, it will call next() on the
 * given iterator and call the given function `f` with that value until `true`
 * is returned or the given iterator is exhausted.
 *
 * @param {!Iterable<VALUE>} iterable
 * @param {function(VALUE): boolean} f
 * @return {!IteratorIterable<VALUE>} The created iterable that gives the mapped
 *     values.
 * @template VALUE
 */
exports.filter = function(iterable, f) {
  return new FilterIterator(iterable, f);
};


/**
 * @template T
 * @implements {IteratorIterable<T>}
 */
class ConcatIterator {
  /** @param {!Array<!Iterator<T>>} iterators */
  constructor(iterators) {
    /** @private @const {!Array<!Iterator<T>>} */
    this.iterators_ = iterators;

    /** @private {number} */
    this.iterIndex_ = 0;
  }

  [Symbol.iterator]() {
    return this;
  }

  /** @override */
  next() {
    while (this.iterIndex_ < this.iterators_.length) {
      const result = this.iterators_[this.iterIndex_].next();
      if (!result.done) {
        return result;
      }
      this.iterIndex_++;
    }
    return /** @type {!IIterableResult<T>} */ ({done: true});
  }
}


/**
 * Concatenates multiple iterators to create a new iterable.
 *
 * When next() is called on the return iterator, it will call next() on the
 * current passed iterator. When the current passed iterator is exhausted, it
 * will move on to the next iterator until there are no more left.
 *
 * All generator return values will be ignored (i.e. when childIter.next()
 * returns {done: true, value: notUndefined} it will be treated as just
 * {done: true}).
 *
 * @param {...!Iterable<VALUE>} iterables
 * @return {!IteratorIterable<VALUE>}
 * @template VALUE
 */
exports.concat = function(...iterables) {
  return new ConcatIterator(iterables.map(getIterator));
};

/**
 * Creates an array containing the values from the given iterator.
 * @param {!Iterator<VALUE>} iterator
 * @return {!Array<VALUE>}
 * @template VALUE
 */
exports.toArray = function(iterator) {
  const arr = [];
  forEach(iterator, e => arr.push(e));
  return arr;
};
