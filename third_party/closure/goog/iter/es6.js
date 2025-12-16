// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Shims between goog.iter.Iterator and ES6 iterator.
 */

goog.module('goog.iter.es6');

const GoogIterable = goog.require('goog.iter.Iterable');
const GoogIterator = goog.require('goog.iter.Iterator');
const StopIteration = goog.require('goog.iter.StopIteration');


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
          () => wrapGoog(/** @type {!Iterator|!GoogIterator} */ (iter)));
    } else if (typeof iter[Symbol.iterator] == 'function') {
      return new ShimIterableImpl(() => iter[Symbol.iterator]());
    } else if (typeof iter.__iterator__ == 'function') {
      return new ShimIterableImpl(
          () => wrapGoog(
              /** @type {{__iterator__:function(this:?, boolean=)}} */ (iter)
                  .__iterator__()));
    }
    throw new Error('Not an iterator or iterable.');
  }
}


/**
 * @param {!GoogIterator<VALUE>|!Iterator<VALUE>} iter
 * @return {!Iterator<VALUE>}
 * @template VALUE
 */
const wrapGoog = (iter) => {
  if (!(iter instanceof GoogIterator)) return iter;
  let done = false;
  return /** @type {?} */ ({
    next() {
      let value;
      while (!done) {
        try {
          value = iter.next();
          break;
        } catch (err) {
          if (err !== StopIteration) throw err;
          done = true;
        }
      }
      return {value, done};
    },
  });
};


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

  /** @override */
  __iterator__() {
    // TODO(sdh): this seems ridiculous, but the compiler complains
    // that it's not implemented if we don't have it.
    return super.__iterator__();
  }

  /** @override */
  next() {
    const result = this.iter_.next();
    if (result.done) throw StopIteration;
    return result.value;
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
