/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Shims between goog.iter.Iterator and ES6 iterator.
 */

goog.module('goog.iter.es6');
goog.module.declareLegacyNamespace();

const GoogIterable = goog.require('goog.iter.Iterable');
const GoogIterator = goog.require('goog.iter.Iterator');


/**
 * Common interface extending both `goog.iter.Iterable` and ES6 `Iterable`,
 * and providing `toGoog()` and `toEs6()` methods to get either kind
 * of iterator.  `ShimIterable.of()` is the primary entry point for
 * this library.  If it is given an iterable that is *not* also an
 * iterator, then it will inherit any reusability from its argument
 * (i.e. `ShimIterable.of(mySet)` will be reusable, since mySet makes
 * a fresh Iterator every time, whereas `ShimIterable.of(myIterator)`
 * will be one-shot).
 *
 * `ShimGoogIterator` and `ShimEs6Iterator` extend `ShimIterable` and
 * also implement one or the other iterator API.  Since they extend
 * `ShimIterable`, it is easy to convert back and forth between the two
 * APIs.  Any such conversion will expose a view to the same underlying
 * iterator, so elements pulled via one API will not be available from
 * the other.
 *
 * @interface
 * @extends {Iterable<VALUE>}
 * @template VALUE
 */
class ShimIterable {
  /** @return {!GoogIterator<VALUE>} */
  __iterator__() {}

  /** @return {!ShimGoogIterator<VALUE>} */
  toGoog() {}

  /** @return {!ShimEs6Iterator<VALUE>} */
  toEs6() {}

  /**
   * @param {!Iterable<VALUE>|!Iterator<VALUE>|
   *         !GoogIterator<VALUE>|!GoogIterable} iter
   * @return {!ShimIterable}
   * @template VALUE
   */
  static of(iter) {
    if (iter instanceof ShimIterableImpl || iter instanceof ShimGoogIterator ||
        iter instanceof ShimEs6Iterator) {
      return iter;
    } else if (typeof iter.next == 'function') {
      return new ShimIterableImpl(
          () => /** @type {!Iterator|!GoogIterator} */ (iter));
    } else if (typeof iter[Symbol.iterator] == 'function') {
      return new ShimIterableImpl(() => iter[Symbol.iterator]());
    } else if (typeof iter.__iterator__ == 'function') {
      return new ShimIterableImpl(
          () => /** @type {{__iterator__:function(this:?, boolean=)}} */ (iter)
                    .__iterator__());
    }
    throw new Error('Not an iterator or iterable.');
  }
}


/**
 * Concrete (private) implementation of a non-iterator iterable.  This is
 * separate from the iterator versions since it supports iterables that
 * are not "one-shot".
 * @implements {ShimIterable<VALUE>}
 * @template VALUE
 */
class ShimIterableImpl {
  /** @param {function(): !Iterator<VALUE>} func */
  constructor(func) {
    /** @const @private */
    this.func_ = func;
  }

  /** @override */
  __iterator__() {
    return new ShimGoogIterator(this.func_());
  }

  /** @override */
  toGoog() {
    return new ShimGoogIterator(this.func_());
  }

  /** @override */
  [Symbol.iterator]() {
    return new ShimEs6Iterator(this.func_());
  }

  /** @override */
  toEs6() {
    return new ShimEs6Iterator(this.func_());
  }
}


/**
 * Concrete `goog.iter.Iterator` subclass that also implements `ShimIterable`.
 * @extends {GoogIterator<VALUE>}
 * @implements {ShimIterable<VALUE>}
 * @template VALUE
 */
class ShimGoogIterator extends GoogIterator {
  /** @param {!Iterator<VALUE>} iter */
  constructor(iter) {
    super();
    this.iter_ = iter;
  }

  /**
   * @override @see {!goog.iter.Iterator}
   * @return {!IIterableResult<VALUE>}
   */
  next() {
    return this.iter_.next();
  }


  /** @override */
  toGoog() {
    return this;
  }

  /** @override */
  [Symbol.iterator]() {
    return new ShimEs6Iterator(this.iter_);
  }

  /** @override */
  toEs6() {
    return new ShimEs6Iterator(this.iter_);
  }
}


/**
 * Concrete ES6 `Iterator` that also implements `ShimIterable`.
 * @implements {IteratorIterable<VALUE>}
 * @extends {ShimIterableImpl<VALUE>}
 * @template VALUE
 */
class ShimEs6Iterator extends ShimIterableImpl {
  /** @param {!Iterator<VALUE>} iter */
  constructor(iter) {
    super(() => iter);
    /** @const @private */
    this.iter_ = iter;
  }

  /** @override */
  next() {
    return this.iter_.next();
  }
}


exports = {
  ShimIterable,
  ShimEs6Iterator,
  ShimGoogIterator,
};
