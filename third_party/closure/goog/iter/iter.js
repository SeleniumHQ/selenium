/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Python style iteration utilities.
 */


goog.provide('goog.iter');
goog.provide('goog.iter.Iterable');
goog.provide('goog.iter.Iterator');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.functions');
goog.require('goog.math');

goog.require('goog.utils');


/**
 * @typedef {{length:number}|{__iterator__}}
 */
goog.iter.Iterable;


/**
 * Class/interface for iterators.
 * @constructor
 * @template VALUE
 * @implements {Iterator<VALUE>}
 * @deprecated Use objects implementing JavaScript iterable protocol introduced
 *     in ES6.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 */
goog.iter.Iterator = function() {};


/**
 * Returns the next value of the iteration as an an ES6 IIterableResult.
 * @return {!IIterableResult<VALUE>}
 * @override
 */
goog.iter.Iterator.prototype.next = function() {
  'use strict';
  return goog.iter.ES6_ITERATOR_DONE;
};


/**
 * An ES6 Iteration protocol result indicating iteration has completed for an
 *     iterator.
 * @const {!IIterableResult<?>}
 */
goog.iter.ES6_ITERATOR_DONE = goog.debug.freeze({done: true, value: undefined});


/**
 * Wraps a VALUE in the ES6 Iterator protocol's IIterableResult container,
 * including the compiler-mandated 'done' key, set to false.
 * @param {VALUE} value
 * @return {!IIterableResult<VALUE>} An ES6 Iteration Protocol compatible result
 *     object, indicating iteration is not done.
 * @template VALUE
 */
goog.iter.createEs6IteratorYield = function(value) {
  return {value, done: false};
};


/**
 * Returns the `Iterator` object itself.  This is used to implement
 * the iterator protocol in JavaScript 1.7
 * @param {boolean=} opt_keys  Whether to return the keys or values. Default is
 *     to only return the values.  This is being used by the for-in loop (true)
 *     and the for-each-in loop (false).  Even though the param gives a hint
 *     about what the iterator will return there is no guarantee that it will
 *     return the keys when true is passed.
 * @return {!goog.iter.Iterator<VALUE>} The object itself.
 */
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  'use strict';
  return this;
};


/**
 * Returns an iterator that knows how to iterate over the values in the object.
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable  If the
 *     object is an iterator it will be returned as is.  If the object has an
 *     `__iterator__` method that will be called to get the value
 *     iterator.  If the object is an array-like object we create an iterator
 *     for that.
 * @return {!goog.iter.Iterator<VALUE>} An iterator that knows how to iterate
 *     over the values in `iterable`.
 * @template VALUE
 */
goog.iter.toIterator = function(iterable) {
  'use strict';
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == 'function') {
    return /** @type {{__iterator__:function(this:?, boolean=)}} */ (iterable)
        .__iterator__(false);
  }
  if (goog.utils.isArrayLike(iterable)) {
    const like = /** @type {!IArrayLike<number|string>} */ (iterable);
    let i = 0;
    const newIter =
        /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());
    /**
     * @return {!IIterableResult<VALUE>}
     * @override
     */
    newIter.next = function() {
      'use strict';
      while (true) {
        if (i >= like.length) {
          return goog.iter.ES6_ITERATOR_DONE;
        }
        // Don't include deleted elements.
        if (!(i in like)) {
          i++;
          continue;
        }
        return goog.iter.createEs6IteratorYield(like[i++]);
      }
    };

    return newIter;
  }


  // TODO(arv): Should we fall back on goog.structs.getValues()?
  throw new Error('Not implemented');
};


/**
 * Calls a function for each element in the iterator with the element of the
 * iterator passed as argument.
 *
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable  The iterator
 *     to iterate over. If the iterable is an object `toIterator` will be
 *     called on it.
 * @param {function(this:THIS,VALUE,?,!goog.iter.Iterator<VALUE>)} f
 *     The function to call for every element.  This function takes 3 arguments
 *     (the element, undefined, and the iterator) and the return value is
 *     irrelevant.  The reason for passing undefined as the second argument is
 *     so that the same function can be used in {@see goog.array.forEach} as
 *     well as others.  The third parameter is of type "number" for
 *     arraylike objects, undefined, otherwise.
 * @param {THIS=} opt_obj  The object to be used as the value of 'this' within
 *     `f`.
 * @template THIS, VALUE
 */
goog.iter.forEach = function(iterable, f, opt_obj) {
  'use strict';
  if (goog.utils.isArrayLike(iterable)) {
    // NOTES: this passes the index number to the second parameter
    // of the callback contrary to the documentation above.
    goog.array.forEach(
        /** @type {IArrayLike<?>} */ (iterable), f, opt_obj);
  } else {
    const iterator = goog.iter.toIterator(iterable);
    while (true) {
      const {done, value} = iterator.next();
      if (done) return;
      f.call(opt_obj, value, undefined, iterator);
    }
  }
};


/**
 * Calls a function for every element in the iterator, and if the function
 * returns true adds the element to a new iterator.
 *
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterator
 *     to iterate over.
 * @param {
 *     function(this:THIS,VALUE,undefined,!goog.iter.Iterator<VALUE>):boolean} f
 *     The function to call for every element. This function takes 3 arguments
 *     (the element, undefined, and the iterator) and should return a boolean.
 *     If the return value is true the element will be included in the returned
 *     iterator.  If it is false the element is not included.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within
 *     `f`.
 * @return {!goog.iter.Iterator<VALUE>} A new iterator in which only elements
 *     that passed the test are present.
 * @template THIS, VALUE
 */
goog.iter.filter = function(iterable, f, opt_obj) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);
  const newIter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());
  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  newIter.next = function() {
    'use strict';
    while (true) {
      const {done, value} = iterator.next();
      if (done) return goog.iter.ES6_ITERATOR_DONE;
      if (f.call(opt_obj, value, undefined, iterator)) {
        return goog.iter.createEs6IteratorYield(value);
      }
    }
  };

  return newIter;
};


/**
 * Calls a function for every element in the iterator, and if the function
 * returns false adds the element to a new iterator.
 *
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterator
 *     to iterate over.
 * @param {
 *     function(this:THIS,VALUE,undefined,!goog.iter.Iterator<VALUE>):boolean} f
 *     The function to call for every element. This function takes 3 arguments
 *     (the element, undefined, and the iterator) and should return a boolean.
 *     If the return value is false the element will be included in the returned
 *     iterator.  If it is true the element is not included.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within
 *     `f`.
 * @return {!goog.iter.Iterator<VALUE>} A new iterator in which only elements
 *     that did not pass the test are present.
 * @template THIS, VALUE
 */
goog.iter.filterFalse = function(iterable, f, opt_obj) {
  'use strict';
  return goog.iter.filter(iterable, goog.functions.not(f), opt_obj);
};


/**
 * Creates a new iterator that returns the values in a range.  This function
 * can take 1, 2 or 3 arguments:
 * <pre>
 * range(5) same as range(0, 5, 1)
 * range(2, 5) same as range(2, 5, 1)
 * </pre>
 *
 * @param {number} startOrStop  The stop value if only one argument is provided.
 *     The start value if 2 or more arguments are provided.  If only one
 *     argument is used the start value is 0.
 * @param {number=} opt_stop  The stop value.  If left out then the first
 *     argument is used as the stop value.
 * @param {number=} opt_step  The number to increment with between each call to
 *     next.  This can be negative.
 * @return {!goog.iter.Iterator<number>} A new iterator that returns the values
 *     in the range.
 */
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  'use strict';
  let start = 0;
  let stop = startOrStop;
  let step = opt_step || 1;
  if (arguments.length > 1) {
    start = startOrStop;
    stop = +opt_stop;
  }
  if (step == 0) {
    throw new Error('Range step argument must not be zero');
  }

  const newIter =
      /** @type {!goog.iter.Iterator<number>} */ (new goog.iter.Iterator());
  /**
   * @return {!IIterableResult<number>}
   * @override
   */
  newIter.next = function() {
    'use strict';
    if (step > 0 && start >= stop || step < 0 && start <= stop) {
      return goog.iter.ES6_ITERATOR_DONE;
    }
    const rv = start;
    start += step;
    return goog.iter.createEs6IteratorYield(rv);
  };

  return newIter;
};


/**
 * Joins the values in a iterator with a delimiter.
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterator
 *     to get the values from.
 * @param {string} deliminator  The text to put between the values.
 * @return {string} The joined value string.
 * @template VALUE
 */
goog.iter.join = function(iterable, deliminator) {
  'use strict';
  return goog.iter.toArray(iterable).join(deliminator);
};


/**
 * For every element in the iterator call a function and return a new iterator
 * with that value.
 *
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterator to iterate over.
 * @param {
 *     function(this:THIS,VALUE,undefined,!goog.iter.Iterator<VALUE>):RESULT} f
 *     The function to call for every element.  This function takes 3 arguments
 *     (the element, undefined, and the iterator) and should return a new value.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within
 *     `f`.
 * @return {!goog.iter.Iterator<RESULT>} A new iterator that returns the
 *     results of applying the function to each element in the original
 *     iterator.
 * @template THIS, VALUE, RESULT
 */
goog.iter.map = function(iterable, f, opt_obj) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);
  const newIter =
      /** @type {!goog.iter.Iterator<RESULT>} */ (new goog.iter.Iterator());
  /**
   * @return {!IIterableResult<RESULT>}
   * @override
   */
  newIter.next = function() {
    'use strict';
    const {done, value} = iterator.next();
    if (done) return goog.iter.ES6_ITERATOR_DONE;
    const mappedVal = f.call(opt_obj, value, undefined, iterator);
    return goog.iter.createEs6IteratorYield(mappedVal);
  };

  return newIter;
};


/**
 * Passes every element of an iterator into a function and accumulates the
 * result.
 *
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable<VALUE>} iterable The
 *     iterator to iterate over.
 * @param {function(this:THIS,RVALUE,VALUE):RVALUE} f The function to call for
 *     every element. This function takes 2 arguments (the function's previous
 *     result or the initial value, and the value of the current element).
 *     function(previousValue, currentElement) : newValue.
 * @param {RVALUE} val The initial value to pass into the function on the first
 *     call.
 * @param {THIS=} opt_obj  The object to be used as the value of 'this' within
 *     f.
 * @return {RVALUE} Result of evaluating f repeatedly across the values of
 *     the iterator.
 * @template THIS, VALUE, RVALUE
 */
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  'use strict';
  let rval = val;
  goog.iter.forEach(iterable, function(val) {
    'use strict';
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};


/**
 * Goes through the values in the iterator. Calls f for each of these, and if
 * any of them returns true, this returns true (without checking the rest). If
 * all return false this will return false.
 *
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterator
 *     object.
 * @param {
 *     function(this:THIS,VALUE,undefined,!goog.iter.Iterator<VALUE>):boolean} f
 *     The function to call for every value. This function takes 3 arguments
 *     (the value, undefined, and the iterator) and should return a boolean.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within
 *     `f`.
 * @return {boolean} true if any value passes the test.
 * @template THIS, VALUE
 */
goog.iter.some = function(iterable, f, opt_obj) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);

  while (true) {
    const {done, value} = iterator.next();
    if (done) return false;
    if (f.call(opt_obj, value, undefined, iterator)) {
      return true;
    }
  }
};


/**
 * Goes through the values in the iterator. Calls f for each of these and if any
 * of them returns false this returns false (without checking the rest). If all
 * return true this will return true.
 *
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterator
 *     object.
 * @param {
 *     function(this:THIS,VALUE,undefined,!goog.iter.Iterator<VALUE>):boolean} f
 *     The function to call for every value. This function takes 3 arguments
 *     (the value, undefined, and the iterator) and should return a boolean.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within
 *     `f`.
 * @return {boolean} true if every value passes the test.
 * @template THIS, VALUE
 */
goog.iter.every = function(iterable, f, opt_obj) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);

  while (true) {
    const {done, value} = iterator.next();
    if (done) return true;
    if (!f.call(opt_obj, value, undefined, iterator)) {
      return false;
    }
  }
};


/**
 * Takes zero or more iterables and returns one iterator that will iterate over
 * them in the order chained.
 * @param {...!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} var_args Any
 *     number of iterable objects.
 * @return {!goog.iter.Iterator<VALUE>} Returns a new iterator that will
 *     iterate over all the given iterables' contents.
 * @template VALUE
 */
goog.iter.chain = function(var_args) {
  'use strict';
  return goog.iter.chainFromIterable(arguments);
};


/**
 * Takes a single iterable containing zero or more iterables and returns one
 * iterator that will iterate over each one in the order given.
 * @see https://goo.gl/5NRp5d
 * @param {goog.iter.Iterator<?>|goog.iter.Iterable} iterable The iterable of
 *     iterables to chain.
 * @return {!goog.iter.Iterator<VALUE>} Returns a new iterator that will
 *     iterate over all the contents of the iterables contained within
 *     `iterable`.
 * @template VALUE
 */
goog.iter.chainFromIterable = function(iterable) {
  'use strict';
  const iteratorOfIterators = goog.iter.toIterator(iterable);
  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());
  let current = null;

  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  iter.next = function() {
    'use strict';
    while (true) {
      if (current == null) {
        const it = iteratorOfIterators.next();
        if (it.done) return goog.iter.ES6_ITERATOR_DONE;
        const value = /** @type {!goog.iter.Iterator<VALUE>} */ (it.value);
        current = goog.iter.toIterator(value);
      }
      const it = current.next();
      if (it.done) {
        // If the child iterator is out of values, set current to null which
        // triggers iterating over the parent above.
        current = null;
        continue;
      }
      const value = /** @type {VALUE} */ (it.value);
      return goog.iter.createEs6IteratorYield(value);
    }
  };

  return iter;
};


/**
 * Builds a new iterator that iterates over the original, but skips elements as
 * long as a supplied function returns true.
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterator
 *     object.
 * @param {
 *     function(this:THIS,VALUE,undefined,!goog.iter.Iterator<VALUE>):boolean} f
 *     The function to call for every value. This function takes 3 arguments
 *     (the value, undefined, and the iterator) and should return a boolean.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within
 *     `f`.
 * @return {!goog.iter.Iterator<VALUE>} A new iterator that drops elements from
 *     the original iterator as long as `f` is true.
 * @template THIS, VALUE
 */
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);

  const newIter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());
  let dropping = true;

  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  newIter.next = function() {
    'use strict';
    while (true) {
      const {done, value} = iterator.next();
      if (done) return goog.iter.ES6_ITERATOR_DONE;
      if (dropping && f.call(opt_obj, value, undefined, iterator)) {
        continue;
      } else {
        dropping = false;
      }
      return goog.iter.createEs6IteratorYield(value);
    }
  };

  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but only as long as a
 * supplied function returns true.
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterator
 *     object.
 * @param {
 *     function(this:THIS,VALUE,undefined,!goog.iter.Iterator<VALUE>):boolean} f
 *     The function to call for every value. This function takes 3 arguments
 *     (the value, undefined, and the iterator) and should return a boolean.
 * @param {THIS=} opt_obj This is used as the 'this' object in f when called.
 * @return {!goog.iter.Iterator<VALUE>} A new iterator that keeps elements in
 *     the original iterator as long as the function is true.
 * @template THIS, VALUE
 */
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);
  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  iter.next = function() {
    'use strict';
    const {done, value} = iterator.next();
    if (done) return goog.iter.ES6_ITERATOR_DONE;
    if (f.call(opt_obj, value, undefined, iterator)) {
      return goog.iter.createEs6IteratorYield(value);
    }
    return goog.iter.ES6_ITERATOR_DONE;
  };

  return iter;
};


/**
 * Converts the iterator to an array
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterator
 *     to convert to an array.
 * @return {!Array<VALUE>} An array of the elements the iterator iterates over.
 * @template VALUE
 */
goog.iter.toArray = function(iterable) {
  'use strict';
  // Fast path for array-like.
  if (goog.utils.isArrayLike(iterable)) {
    return goog.array.toArray(/** @type {!IArrayLike<?>} */ (iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  const array = [];
  goog.iter.forEach(iterable, function(val) {
    'use strict';
    array.push(val);
  });
  return array;
};


/**
 * Iterates over two iterables and returns true if they contain the same
 * sequence of elements and have the same length.
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable1 The first
 *     iterable object.
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable2 The second
 *     iterable object.
 * @param {function(VALUE,VALUE):boolean=} opt_equalsFn Optional comparison
 *     function.
 *     Should take two arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} true if the iterables contain the same sequence of elements
 *     and have the same length.
 * @template VALUE
 */
goog.iter.equals = function(iterable1, iterable2, opt_equalsFn) {
  'use strict';
  const fillValue = {};
  const pairs = goog.iter.zipLongest(fillValue, iterable1, iterable2);
  const equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  return goog.iter.every(pairs, function(pair) {
    'use strict';
    return equalsFn(pair[0], pair[1]);
  });
};


/**
 * Advances the iterator to the next position, returning the given default value
 * instead of throwing an exception if the iterator has no more entries.
 * @param {goog.iter.Iterator<VALUE>|goog.iter.Iterable} iterable The iterable
 *     object.
 * @param {VALUE} defaultValue The value to return if the iterator is empty.
 * @return {VALUE} The next item in the iteration, or defaultValue if the
 *     iterator was empty.
 * @template VALUE
 */
goog.iter.nextOrValue = function(iterable, defaultValue) {
  'use strict';
  const iterator = /** @type {!goog.iter.Iterator<VALUE>} */ (
      goog.iter.toIterator(iterable));
  const {done, value} = iterator.next();
  if (done) return defaultValue;
  return value;
};


/**
 * Cartesian product of zero or more sets.  Gives an iterator that gives every
 * combination of one element chosen from each set.  For example,
 * ([1, 2], [3, 4]) gives ([1, 3], [1, 4], [2, 3], [2, 4]).
 * @see http://docs.python.org/library/itertools.html#itertools.product
 * @param {...!IArrayLike<VALUE>} var_args Zero or more sets, as
 *     arrays.
 * @return {!goog.iter.Iterator<!Array<VALUE>>} An iterator that gives each
 *     n-tuple (as an array).
 * @template VALUE
 */
goog.iter.product = function(var_args) {
  'use strict';
  const someArrayEmpty = Array.prototype.some.call(arguments, function(arr) {
    'use strict';
    return !arr.length;
  });

  // An empty set in a cartesian product gives an empty set.
  if (someArrayEmpty || !arguments.length) {
    return /** @type {!goog.iter.Iterator<!Array<VALUE>>} */ (
        new goog.iter.Iterator());
  }

  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());
  const arrays = arguments;

  // The first indices are [0, 0, ...]
  /** @type {?Array<number>} */
  let indices = goog.array.repeat(0, arrays.length);

  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  iter.next = function() {
    'use strict';
    if (indices) {
      const retVal = goog.array.map(indices, function(valueIndex, arrayIndex) {
        'use strict';
        return arrays[arrayIndex][valueIndex];
      });

      // Generate the next-largest indices for the next call.
      // Increase the rightmost index. If it goes over, increase the next
      // rightmost (like carry-over addition).
      for (let i = indices.length - 1; i >= 0; i--) {
        // Assertion prevents compiler warning below.
        goog.asserts.assert(indices);
        if (indices[i] < arrays[i].length - 1) {
          indices[i]++;
          break;
        }

        // We're at the last indices (the last element of every array), so
        // the iteration is over on the next call.
        if (i == 0) {
          indices = null;
          break;
        }
        // Reset the index in this column and loop back to increment the
        // next one.
        indices[i] = 0;
      }
      return goog.iter.createEs6IteratorYield(retVal);
    }

    return goog.iter.ES6_ITERATOR_DONE;
  };


  return iter;
};


/**
 * Create an iterator to cycle over the iterable's elements indefinitely.
 * For example, ([1, 2, 3]) would return : 1, 2, 3, 1, 2, 3, ...
 * @see: http://docs.python.org/library/itertools.html#itertools.cycle.
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable object.
 * @return {!goog.iter.Iterator<VALUE>} An iterator that iterates indefinitely
 *     over the values in `iterable`.
 * @template VALUE
 */
goog.iter.cycle = function(iterable) {
  'use strict';
  const baseIterator = /** @type {!goog.iter.Iterator<VALUE>} */ (
      goog.iter.toIterator(iterable));

  // We maintain a cache to store the iterable elements as we iterate
  // over them. The cache is used to return elements once we have
  // iterated over the iterable once.
  const cache = [];
  let cacheIndex = 0;

  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

  // This flag is set after the iterable is iterated over once
  let useCache = false;

  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  iter.next = function() {
    'use strict';
    let returnElement = null;

    // Pull elements off the original iterator if not using cache
    if (!useCache) {
      const it = baseIterator.next();
      if (it.done) {
        if (goog.array.isEmpty(cache)) {
          return goog.iter.ES6_ITERATOR_DONE;
        }
        // set useCache to true after we've exhausted the inner iterator and
        // there is at least one element in the cache.
        useCache = true;
        // Fallthrough to using the cache immediately.
      } else {
        cache.push(it.value);
        return it;
      }
    }

    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;

    return goog.iter.createEs6IteratorYield(returnElement);
  };

  return iter;
};


/**
 * Creates an iterator that counts indefinitely from a starting value.
 * @see http://docs.python.org/2/library/itertools.html#itertools.count
 * @param {number=} opt_start The starting value. Default is 0.
 * @param {number=} opt_step The number to increment with between each call to
 *     next. Negative and floating point numbers are allowed. Default is 1.
 * @return {!goog.iter.Iterator<number>} A new iterator that returns the values
 *     in the series.
 */
goog.iter.count = function(opt_start, opt_step) {
  'use strict';
  let counter = opt_start || 0;
  const step = (opt_step !== undefined) ? opt_step : 1;
  const iter =
      /** @type {!goog.iter.Iterator<number>} */ (new goog.iter.Iterator());

  /**
   * @return {!IIterableResult<number>}
   * @override @see {!goog.iter.Iterator}
   */
  iter.next = function() {
    'use strict';
    const returnValue = counter;
    counter += step;
    return goog.iter.createEs6IteratorYield(returnValue);
  };

  return iter;
};


/**
 * Creates an iterator that returns the same object or value repeatedly.
 * @param {VALUE} value Any object or value to repeat.
 * @return {!goog.iter.Iterator<VALUE>} A new iterator that returns the
 *     repeated value.
 * @template VALUE
 */
goog.iter.repeat = function(value) {
  'use strict';
  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  iter.next = function() {
    return goog.iter.createEs6IteratorYield(value);
  };

  return iter;
};


/**
 * Creates an iterator that returns running totals from the numbers in
 * `iterable`. For example, the array {@code [1, 2, 3, 4, 5]} yields
 * {@code 1 -> 3 -> 6 -> 10 -> 15}.
 * @see http://docs.python.org/3.2/library/itertools.html#itertools.accumulate
 * @param {!goog.iter.Iterator<number>|!goog.iter.Iterable} iterable The
 *     iterable of numbers to accumulate.
 * @return {!goog.iter.Iterator<number>} A new iterator that returns the
 *     numbers in the series.
 */
goog.iter.accumulate = function(iterable) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);
  let total = 0;
  const iter =
      /** @type {!goog.iter.Iterator<number>} */ (new goog.iter.Iterator());

  /**
   * @return {!IIterableResult<number>}
   * @override @see {!goog.iter.Iterator}
   */
  iter.next = function() {
    'use strict';
    const {done, value} = iterator.next();
    if (done) return goog.iter.ES6_ITERATOR_DONE;
    total += value;
    return goog.iter.createEs6IteratorYield(total);
  };

  return iter;
};


/**
 * Creates an iterator that returns arrays containing the ith elements from the
 * provided iterables. The returned arrays will be the same size as the number
 * of iterables given in `var_args`. Once the shortest iterable is
 * exhausted, subsequent calls to `next()` will return
 * `goog.iter.ES6_ITERATOR_DONE`.
 * @see http://docs.python.org/2/library/itertools.html#itertools.izip
 * @param {...!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} var_args Any
 *     number of iterable objects.
 * @return {!goog.iter.Iterator<!Array<VALUE>>} A new iterator that returns
 *     arrays of elements from the provided iterables.
 * @template VALUE
 */
goog.iter.zip = function(var_args) {
  'use strict';
  const args = arguments;
  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

  if (args.length > 0) {
    const iterators = goog.array.map(args, goog.iter.toIterator);
    let allDone = false;
    /**
     * @return {!IIterableResult<VALUE>}
     * @override
     */
    iter.next = function() {
      'use strict';
      if (allDone) return goog.iter.ES6_ITERATOR_DONE;

      const arr = [];
      for (let i = 0, iterator; iterator = iterators[i++];) {
        const it = /** @type {!IIterableResult<VALUE>} */ (iterator.next());
        if (it.done) {
          // One of the iterators being zipped is done, so set allDone and
          // return.
          allDone = true;
          return goog.iter.ES6_ITERATOR_DONE;
        }
        arr.push(it.value);
      }
      return goog.iter.createEs6IteratorYield(arr);
    };
  }

  return iter;
};


/**
 * Creates an iterator that returns arrays containing the ith elements from the
 * provided iterables. The returned arrays will be the same size as the number
 * of iterables given in `var_args`. Shorter iterables will be extended
 * with `fillValue`. Once the longest iterable is exhausted, subsequent
 * calls to `next()` will return `goog.iter.ES6_ITERATOR_DONE`.
 * @see http://docs.python.org/2/library/itertools.html#itertools.izip_longest
 * @param {VALUE} fillValue The object or value used to fill shorter iterables.
 * @param {...!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} var_args Any
 *     number of iterable objects.
 * @return {!goog.iter.Iterator<!Array<VALUE>>} A new iterator that returns
 *     arrays of elements from the provided iterables.
 * @template VALUE
 */
goog.iter.zipLongest = function(fillValue, var_args) {
  'use strict';
  const args = Array.prototype.slice.call(arguments, 1);
  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

  if (args.length > 0) {
    const iterators = goog.array.map(args, goog.iter.toIterator);

    let allDone = false;  // set to true once all iterators are empty.
    /**
     * @return {!IIterableResult<VALUE>}
     * @override
     */
    iter.next = function() {
      'use strict';
      if (allDone) return goog.iter.ES6_ITERATOR_DONE;

      let iteratorsHaveValues = false;
      const arr = [];
      for (let i = 0, iterator; iterator = iterators[i++];) {
        const it = /** @type {!IIterableResult<VALUE>} */ (iterator.next());
        if (it.done) {
          // If this iterator is empty, others might not be, so use the
          // fillValue.
          arr.push(fillValue);
          continue;
        }
        arr.push(it.value);
        iteratorsHaveValues = true;
      }

      if (!iteratorsHaveValues) {
        allDone = true;
        return goog.iter.ES6_ITERATOR_DONE;
      }
      return goog.iter.createEs6IteratorYield(arr);
    };
  }

  return iter;
};


/**
 * Creates an iterator that filters `iterable` based on a series of
 * `selectors`. On each call to `next()`, one item is taken from
 * both the `iterable` and `selectors` iterators. If the item from
 * `selectors` evaluates to true, the item from `iterable` is given.
 * Otherwise, it is skipped. Once either `iterable` or `selectors`
 * is exhausted, subsequent calls to `next()` will return
 * `goog.iter.ES6_ITERATOR_DONE`.
 * @see http://docs.python.org/2/library/itertools.html#itertools.compress
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to filter.
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} selectors An
 *     iterable of items to be evaluated in a boolean context to determine if
 *     the corresponding element in `iterable` should be included in the
 *     result.
 * @return {!goog.iter.Iterator<VALUE>} A new iterator that returns the
 *     filtered values.
 * @template VALUE
 */
goog.iter.compress = function(iterable, selectors) {
  'use strict';
  const valueIterator = goog.iter.toIterator(iterable);
  const selectorIterator = goog.iter.toIterator(selectors);

  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

  let allDone = false;

  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  iter.next = function() {
    if (allDone) return goog.iter.ES6_ITERATOR_DONE;

    while (true) {
      const valIt = valueIterator.next();
      if (valIt.done) {
        allDone = true;
        return goog.iter.ES6_ITERATOR_DONE;
      }

      const selectorIt = selectorIterator.next();
      if (selectorIt.done) {
        allDone = true;
        return goog.iter.ES6_ITERATOR_DONE;
      }

      const val = valIt.value;
      const selectorVal = selectorIt.value;
      if (selectorVal) return goog.iter.createEs6IteratorYield(val);
    }
  };

  return iter;
};



/**
 * Implements the `goog.iter.groupBy` iterator.
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to group.
 * @param {function(VALUE): KEY=} opt_keyFunc  Optional function for
 *     determining the key value for each group in the `iterable`. Default
 *     is the identity function.
 * @constructor
 * @extends {goog.iter.Iterator<!Array<?>>}
 * @template KEY, VALUE
 * @private
 */
goog.iter.GroupByIterator_ = function(iterable, opt_keyFunc) {
  'use strict';
  /**
   * The iterable to group, coerced to an iterator.
   * @type {!goog.iter.Iterator}
   */
  this.iterator = goog.iter.toIterator(iterable);

  /**
   * A function for determining the key value for each element in the iterable.
   * If no function is provided, the identity function is used and returns the
   * element unchanged.
   * @type {function(VALUE): KEY}
   */
  this.keyFunc = opt_keyFunc || goog.functions.identity;

  /**
   * The target key for determining the start of a group.
   * @type {KEY}
   */
  this.targetKey;

  /**
   * The current key visited during iteration.
   * @type {KEY}
   */
  this.currentKey;

  /**
   * The current value being added to the group.
   * @type {VALUE}
   */
  this.currentValue;
};
goog.utils.inherits(goog.iter.GroupByIterator_, goog.iter.Iterator);


/**
 * @return {!IIterableResult<!Array<?>>}
 * @override
 */
goog.iter.GroupByIterator_.prototype.next = function() {
  'use strict';
  while (this.currentKey == this.targetKey) {
    const it = this.iterator.next();
    if (it.done) return goog.iter.ES6_ITERATOR_DONE;
    this.currentValue = it.value;
    this.currentKey = this.keyFunc(this.currentValue);
  }
  this.targetKey = this.currentKey;
  return goog.iter.createEs6IteratorYield(
      [this.currentKey, this.groupItems_(this.targetKey)]);
};


/**
 * Performs the grouping of objects using the given key.
 * @param {KEY} targetKey  The target key object for the group.
 * @return {!Array<VALUE>} An array of grouped objects.
 * @private
 */
goog.iter.GroupByIterator_.prototype.groupItems_ = function(targetKey) {
  'use strict';
  const arr = [];
  while (this.currentKey == targetKey) {
    arr.push(this.currentValue);
    const it = this.iterator.next();
    if (it.done) break;
    this.currentValue = it.value;
    this.currentKey = this.keyFunc(this.currentValue);
  }
  return arr;
};


/**
 * Creates an iterator that returns arrays containing elements from the
 * `iterable` grouped by a key value. For iterables with repeated
 * elements (i.e. sorted according to a particular key function), this function
 * has a `uniq`-like effect. For example, grouping the array:
 * {@code [A, B, B, C, C, A]} produces
 * {@code [A, [A]], [B, [B, B]], [C, [C, C]], [A, [A]]}.
 * @see http://docs.python.org/2/library/itertools.html#itertools.groupby
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to group.
 * @param {function(VALUE): KEY=} opt_keyFunc  Optional function for
 *     determining the key value for each group in the `iterable`. Default
 *     is the identity function.
 * @return {!goog.iter.Iterator<!Array<?>>} A new iterator that returns
 *     arrays of consecutive key and groups.
 * @template KEY, VALUE
 */
goog.iter.groupBy = function(iterable, opt_keyFunc) {
  'use strict';
  return new goog.iter.GroupByIterator_(iterable, opt_keyFunc);
};


/**
 * Gives an iterator that gives the result of calling the given function
 * <code>f</code> with the arguments taken from the next element from
 * <code>iterable</code> (the elements are expected to also be iterables).
 *
 * Similar to {@see goog.iter.map} but allows the function to accept multiple
 * arguments from the iterable.
 *
 * @param {!goog.iter.Iterator<?>|!goog.iter.Iterable} iterable The iterable of
 *     iterables to iterate over.
 * @param {function(this:THIS,...*):RESULT} f The function to call for every
 *     element.  This function takes N+2 arguments, where N represents the
 *     number of items from the next element of the iterable. The two
 *     additional arguments passed to the function are undefined and the
 *     iterator itself. The function should return a new value.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within
 *     `f`.
 * @return {!goog.iter.Iterator<RESULT>} A new iterator that returns the
 *     results of applying the function to each element in the original
 *     iterator.
 * @template THIS, RESULT
 */
goog.iter.starMap = function(iterable, f, opt_obj) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);
  const iter =
      /** @type {!goog.iter.Iterator<RESULT>} */ (new goog.iter.Iterator());

  /**
   * @return {!IIterableResult<RESULT>}
   * @override
   */
  iter.next = function() {
    'use strict';
    const it = /** @type {!IIterableResult<!goog.iter.Iterator<?>>} */ (
        iterator.next());
    if (it.done) return goog.iter.ES6_ITERATOR_DONE;
    const args = goog.iter.toArray(it.value);
    const value = f.apply(opt_obj, [].concat(args, undefined, iterator));
    return goog.iter.createEs6IteratorYield(value);
  };


  return iter;
};


/**
 * Returns an array of iterators each of which can iterate over the values in
 * `iterable` without advancing the others.
 * @see http://docs.python.org/2/library/itertools.html#itertools.tee
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to tee.
 * @param {number=} opt_num  The number of iterators to create. Default is 2.
 * @return {!Array<goog.iter.Iterator<VALUE>>} An array of iterators.
 * @template VALUE
 */
goog.iter.tee = function(iterable, opt_num) {
  'use strict';
  const iterator = goog.iter.toIterator(iterable);
  const num = (typeof opt_num === 'number') ? opt_num : 2;
  const buffers = goog.array.map(goog.array.range(num), function() {
    'use strict';
    return [];
  });

  /***
   * @return {boolean} True iff something was added to the buffers, false
   *     otherwise. Used to signal whether there were any more iterators, or if
   *     the parent iterator should indicate exhaustion.
   */
  function addNextIteratorValueToBuffers() {
    'use strict';
    const {done, value} = iterator.next();
    if (done) return false;
    for (let i = 0, buffer; buffer = buffers[i++];) {
      buffer.push(value);
    }
    return true;
  }

  /***
   * @param {!Array<VALUE>} buffer
   * @return {!goog.iter.Iterator<VALUE>}
   */
  function createIterator(buffer) {
    'use strict';
    // Each tee'd iterator has an associated buffer (initially empty). When a
    // tee'd iterator's buffer is empty, it calls
    // addNextIteratorValueToBuffers(), adding the next value to all tee'd
    // iterators' buffers, and then returns that value. This allows each
    // iterator to be advanced independently.
    const iter =
        /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

    /**
     * @return {!IIterableResult<VALUE>}
     * @override
     */
    iter.next = function() {
      'use strict';
      if (goog.array.isEmpty(buffer)) {
        const added = addNextIteratorValueToBuffers();
        if (!added) return goog.iter.ES6_ITERATOR_DONE;
      }
      goog.asserts.assert(!goog.array.isEmpty(buffer));
      return goog.iter.createEs6IteratorYield(buffer.shift());
    };

    return iter;
  }

  return goog.array.map(buffers, createIterator);
};


/**
 * Creates an iterator that returns arrays containing a count and an element
 * obtained from the given `iterable`.
 * @see http://docs.python.org/2/library/functions.html#enumerate
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to enumerate.
 * @param {number=} opt_start  Optional starting value. Default is 0.
 * @return {!goog.iter.Iterator<!Array<?>>} A new iterator containing
 *     count/item pairs.
 * @template VALUE
 */
goog.iter.enumerate = function(iterable, opt_start) {
  'use strict';
  return goog.iter.zip(goog.iter.count(opt_start), iterable);
};


/**
 * Creates an iterator that returns the first `limitSize` elements from an
 * iterable. If this number is greater than the number of elements in the
 * iterable, all the elements are returned.
 * @see http://goo.gl/V0sihp Inspired by the limit iterator in Guava.
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to limit.
 * @param {number} limitSize  The maximum number of elements to return.
 * @return {!goog.iter.Iterator<VALUE>} A new iterator containing
 *     `limitSize` elements.
 * @template VALUE
 */
goog.iter.limit = function(iterable, limitSize) {
  'use strict';
  goog.asserts.assert(goog.math.isInt(limitSize) && limitSize >= 0);

  const iterator = goog.iter.toIterator(iterable);

  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());
  let remaining = limitSize;

  /**
   * @return {!IIterableResult<VALUE>}
   * @override
   */
  iter.next = function() {
    'use strict';
    if (remaining-- > 0) {
      return iterator.next();
    }
    return goog.iter.ES6_ITERATOR_DONE;
  };

  return iter;
};


/**
 * Creates an iterator that is advanced `count` steps ahead. Consumed
 * values are silently discarded. If `count` is greater than the number
 * of elements in `iterable`, an empty iterator is returned. Subsequent
 * calls to `next()` will return `goog.iter.ES6_ITERATOR_DONE`.
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to consume.
 * @param {number} count  The number of elements to consume from the iterator.
 * @return {!goog.iter.Iterator<VALUE>} An iterator advanced zero or more steps
 *     ahead.
 * @template VALUE
 */
goog.iter.consume = function(iterable, count) {
  'use strict';
  goog.asserts.assert(goog.math.isInt(count) && count >= 0);

  const iterator = goog.iter.toIterator(iterable);

  while (count-- > 0) {
    goog.iter.nextOrValue(iterator, null);
  }

  return iterator;
};


/**
 * Creates an iterator that returns a range of elements from an iterable.
 * Similar to {@see goog.array.slice} but does not support negative indexes.
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to slice.
 * @param {number} start  The index of the first element to return.
 * @param {number=} opt_end  The index after the last element to return. If
 *     defined, must be greater than or equal to `start`.
 * @return {!goog.iter.Iterator<VALUE>} A new iterator containing a slice of
 *     the original.
 * @template VALUE
 */
goog.iter.slice = function(iterable, start, opt_end) {
  'use strict';
  goog.asserts.assert(goog.math.isInt(start) && start >= 0);

  let iterator = goog.iter.consume(iterable, start);

  if (typeof opt_end === 'number') {
    goog.asserts.assert(goog.math.isInt(opt_end) && opt_end >= start);
    iterator = goog.iter.limit(iterator, opt_end - start /* limitSize */);
  }

  return iterator;
};


/**
 * Checks an array for duplicate elements.
 * @param {?IArrayLike<VALUE>} arr The array to check for
 *     duplicates.
 * @return {boolean} True, if the array contains duplicates, false otherwise.
 * @private
 * @template VALUE
 */
// TODO(user): Consider moving this into goog.array as a public function.
goog.iter.hasDuplicates_ = function(arr) {
  'use strict';
  const deduped = [];
  goog.array.removeDuplicates(arr, deduped);
  return arr.length != deduped.length;
};


/**
 * Creates an iterator that returns permutations of elements in
 * `iterable`.
 *
 * Permutations are obtained by taking the Cartesian product of
 * `opt_length` iterables and filtering out those with repeated
 * elements. For example, the permutations of {@code [1,2,3]} are
 * {@code [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]}.
 * @see http://docs.python.org/2/library/itertools.html#itertools.permutations
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable from which to generate permutations.
 * @param {number=} opt_length Length of each permutation. If omitted, defaults
 *     to the length of `iterable`.
 * @return {!goog.iter.Iterator<!Array<VALUE>>} A new iterator containing the
 *     permutations of `iterable`.
 * @template VALUE
 */
goog.iter.permutations = function(iterable, opt_length) {
  'use strict';
  const elements = goog.iter.toArray(iterable);
  const length =
      (typeof opt_length === 'number') ? opt_length : elements.length;

  const sets = goog.array.repeat(elements, length);
  const product = goog.iter.product.apply(undefined, sets);

  return goog.iter.filter(product, function(arr) {
    'use strict';
    return !goog.iter.hasDuplicates_(arr);
  });
};


/**
 * Creates an iterator that returns combinations of elements from
 * `iterable`.
 *
 * Combinations are obtained by taking the {@see goog.iter.permutations} of
 * `iterable` and filtering those whose elements appear in the order they
 * are encountered in `iterable`. For example, the 3-length combinations
 * of {@code [0,1,2,3]} are {@code [[0,1,2], [0,1,3], [0,2,3], [1,2,3]]}.
 * @see http://docs.python.org/2/library/itertools.html#itertools.combinations
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable from which to generate combinations.
 * @param {number} length The length of each combination.
 * @return {!goog.iter.Iterator<!Array<VALUE>>} A new iterator containing
 *     combinations from the `iterable`.
 * @template VALUE
 */
goog.iter.combinations = function(iterable, length) {
  'use strict';
  const elements = goog.iter.toArray(iterable);
  const indexes = goog.iter.range(elements.length);
  const indexIterator = goog.iter.permutations(indexes, length);
  // sortedIndexIterator will now give arrays of with the given length that
  // indicate what indexes into "elements" should be returned on each iteration.
  const sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    'use strict';
    return goog.array.isSorted(arr);
  });

  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

  function getIndexFromElements(index) {
    return elements[index];
  }
  /**
   * @return {!IIterableResult<!Array<VALUE>>}
   * @override
   */
  iter.next = function() {
    'use strict';
    const {done, value} = sortedIndexIterator.next();
    if (done) return goog.iter.ES6_ITERATOR_DONE;
    return goog.iter.createEs6IteratorYield(
        goog.array.map(value, getIndexFromElements));
  };

  return iter;
};


/**
 * Creates an iterator that returns combinations of elements from
 * `iterable`, with repeated elements possible.
 *
 * Combinations are obtained by taking the Cartesian product of `length`
 * iterables and filtering those whose elements appear in the order they are
 * encountered in `iterable`. For example, the 2-length combinations of
 * {@code [1,2,3]} are {@code [[1,1], [1,2], [1,3], [2,2], [2,3], [3,3]]}.
 * @see https://goo.gl/C0yXe4
 * @see https://goo.gl/djOCsk
 * @param {!goog.iter.Iterator<VALUE>|!goog.iter.Iterable} iterable The
 *     iterable to combine.
 * @param {number} length The length of each combination.
 * @return {!goog.iter.Iterator<!Array<VALUE>>} A new iterator containing
 *     combinations from the `iterable`.
 * @template VALUE
 */
goog.iter.combinationsWithReplacement = function(iterable, length) {
  'use strict';
  const elements = goog.iter.toArray(iterable);
  const indexes = goog.array.range(elements.length);
  const sets = goog.array.repeat(indexes, length);
  const indexIterator = goog.iter.product.apply(undefined, sets);
  // sortedIndexIterator will now give arrays of with the given length that
  // indicate what indexes into "elements" should be returned on each iteration.
  const sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    'use strict';
    return goog.array.isSorted(arr);
  });

  const iter =
      /** @type {!goog.iter.Iterator<VALUE>} */ (new goog.iter.Iterator());

  function getIndexFromElements(index) {
    return elements[index];
  }

  /**
   * @return {!IIterableResult<!Array<VALUE>>}
   * @override
   */
  iter.next = function() {
    'use strict';
    const {done, value} = sortedIndexIterator.next();
    if (done) return goog.iter.ES6_ITERATOR_DONE;
    return goog.iter.createEs6IteratorYield(goog.array.map(
        /** @type {!Array<number>} */ (value), getIndexFromElements));
  };

  return iter;
};
