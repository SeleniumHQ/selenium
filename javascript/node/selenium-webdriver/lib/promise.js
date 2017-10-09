// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Defines a handful of utility functions to simplify working
 * with promises.
 */

'use strict';



/**
 * Determines whether a {@code value} should be treated as a promise.
 * Any object whose "then" property is a function will be considered a promise.
 *
 * @param {?} value The value to test.
 * @return {boolean} Whether the value is a promise.
 */
function isPromise(value) {
  try {
    // Use array notation so the Closure compiler does not obfuscate away our
    // contract.
    return value
        && (typeof value === 'object' || typeof value === 'function')
        && typeof value['then'] === 'function';
  } catch (ex) {
    return false;
  }
}


/**
 * Creates a promise that will be resolved at a set time in the future.
 * @param {number} ms The amount of time, in milliseconds, to wait before
 *     resolving the promise.
 * @return {!Promise<void>} The promise.
 */
function delayed(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}


/**
 * Wraps a function that expects a node-style callback as its final
 * argument. This callback expects two arguments: an error value (which will be
 * null if the call succeeded), and the success value as the second argument.
 * The callback will the resolve or reject the returned promise, based on its
 * arguments.
 * @param {!Function} fn The function to wrap.
 * @param {...?} args The arguments to apply to the function, excluding the
 *     final callback.
 * @return {!Thenable} A promise that will be resolved with the
 *     result of the provided function's callback.
 */
function checkedNodeCall(fn, ...args) {
  return new Promise(function(fulfill, reject) {
    try {
      args.push(function(error, value) {
        error ? reject(error) : fulfill(value);
      });
      fn(...args);
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * Registers a listener to invoke when a promise is resolved, regardless
 * of whether the promise's value was successfully computed. This function
 * is synonymous with the {@code finally} clause in a synchronous API:
 *
 *     // Synchronous API:
 *     try {
 *       doSynchronousWork();
 *     } finally {
 *       cleanUp();
 *     }
 *
 *     // Asynchronous promise API:
 *     doAsynchronousWork().finally(cleanUp);
 *
 * __Note:__ similar to the {@code finally} clause, if the registered
 * callback returns a rejected promise or throws an error, it will silently
 * replace the rejection error (if any) from this promise:
 *
 *     try {
 *       throw Error('one');
 *     } finally {
 *       throw Error('two');  // Hides Error: one
 *     }
 *
 *     let p = Promise.reject(Error('one'));
 *     promise.finally(p, function() {
 *       throw Error('two');  // Hides Error: one
 *     });
 *
 * @param {!IThenable<?>} promise The promise to add the listener to.
 * @param {function(): (R|IThenable<R>)} callback The function to call when
 *     the promise is resolved.
 * @return {!Promise<R>} A promise that will be resolved with the callback
 *     result.
 * @template R
 */
function thenFinally(promise, callback) {
  let error;
  let mustThrow = false;
  return Promise.resolve(promise).then(function() {
    return callback();
  }, function(err) {
    error = err;
    mustThrow = true;
    return callback();
  }).then(function() {
    if (mustThrow) {
      throw error;
    }
  });
}


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array, which is used as the fulfillment value of the promise returned
 * by this function.
 *
 * If the return value of the mapping function is a promise, this function
 * will wait for it to be fulfilled before inserting it into the new array.
 *
 * If the mapping function throws or returns a rejected promise, the
 * promise returned by this function will be rejected with the same reason.
 * Only the first failure will be reported; all subsequent errors will be
 * silently ignored.
 *
 * @param {!(Array<TYPE>|IThenable<!Array<TYPE>>)} arr The
 *     array to iterator over, or a promise that will resolve to said array.
 * @param {function(this: SELF, TYPE, number, !Array<TYPE>): ?} fn The
 *     function to call for each element in the array. This function should
 *     expect three arguments (the element, the index, and the array itself.
 * @param {SELF=} opt_self The object to be used as the value of 'this' within
 *     {@code fn}.
 * @template TYPE, SELF
 */
function map(arr, fn, opt_self) {
  return Promise.resolve(arr).then(v => {
    if (!Array.isArray(v)) {
      throw TypeError('not an array');
    }
    var arr = /** @type {!Array} */(v);
    return new Promise(function(fulfill, reject) {
      var n = arr.length;
      var values = new Array(n);
      (function processNext(i) {
        for (; i < n; i++) {
          if (i in arr) {
            break;
          }
        }
        if (i >= n) {
          fulfill(values);
          return;
        }
        try {
          Promise
              .resolve(fn.call(opt_self, arr[i], i, /** @type {!Array} */(arr)))
              .then(
                  function(value) {
                    values[i] = value;
                    processNext(i + 1);
                  },
                  reject);
        } catch (ex) {
          reject(ex);
        }
      })(0);
    });
  });
}


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * If the return value of the filter function is a promise, this function
 * will wait for it to be fulfilled before determining whether to insert the
 * element into the new array.
 *
 * If the filter function throws or returns a rejected promise, the promise
 * returned by this function will be rejected with the same reason. Only the
 * first failure will be reported; all subsequent errors will be silently
 * ignored.
 *
 * @param {!(Array<TYPE>|IThenable<!Array<TYPE>>)} arr The
 *     array to iterator over, or a promise that will resolve to said array.
 * @param {function(this: SELF, TYPE, number, !Array<TYPE>): (
 *             boolean|IThenable<boolean>)} fn The function
 *     to call for each element in the array.
 * @param {SELF=} opt_self The object to be used as the value of 'this' within
 *     {@code fn}.
 * @template TYPE, SELF
 */
function filter(arr, fn, opt_self) {
  return Promise.resolve(arr).then(v => {
    if (!Array.isArray(v)) {
      throw TypeError('not an array');
    }
    var arr = /** @type {!Array} */(v);
    return new Promise(function(fulfill, reject) {
      var n = arr.length;
      var values = [];
      var valuesLength = 0;
      (function processNext(i) {
        for (; i < n; i++) {
          if (i in arr) {
            break;
          }
        }
        if (i >= n) {
          fulfill(values);
          return;
        }
        try {
          var value = arr[i];
          var include = fn.call(opt_self, value, i, /** @type {!Array} */(arr));
          Promise.resolve(include)
              .then(
                  function(include) {
                    if (include) {
                      values[valuesLength++] = value;
                    }
                    processNext(i + 1);
                  },
                  reject);
        } catch (ex) {
          reject(ex);
        }
      })(0);
    });
  });
}


/**
 * Returns a promise that will be resolved with the input value in a
 * fully-resolved state. If the value is an array, each element will be fully
 * resolved. Likewise, if the value is an object, all keys will be fully
 * resolved. In both cases, all nested arrays and objects will also be
 * fully resolved.  All fields are resolved in place; the returned promise will
 * resolve on {@code value} and not a copy.
 *
 * Warning: This function makes no checks against objects that contain
 * cyclical references:
 *
 *     var value = {};
 *     value['self'] = value;
 *     promise.fullyResolved(value);  // Stack overflow.
 *
 * @param {*} value The value to fully resolve.
 * @return {!Thenable} A promise for a fully resolved version
 *     of the input value.
 */
function fullyResolved(value) {
  return Promise.resolve(value).then(fullyResolveValue);
}


/**
 * @param {*} value The value to fully resolve. If a promise, assumed to
 *     already be resolved.
 * @return {!Thenable} A promise for a fully resolved version
 *     of the input value.
 */
function fullyResolveValue(value) {
  if (Array.isArray(value)) {
    return fullyResolveKeys(/** @type {!Array} */ (value));
  }

  if (value && typeof value === 'object') {
    return fullyResolveKeys(/** @type {!Object} */ (value));
  }

  if (typeof value === 'function') {
    return fullyResolveKeys(/** @type {!Object} */ (value));
  }

  return Promise.resolve(value);
}


/**
 * @param {!(Array|Object)} obj the object to resolve.
 * @return {!Thenable} A promise that will be resolved with the
 *     input object once all of its values have been fully resolved.
 */
function fullyResolveKeys(obj) {
  var isArray = Array.isArray(obj);
  var numKeys = isArray ? obj.length : (function() {
    let n = 0;
    for (let key in obj) {
      n += 1;
    }
    return n;
  })();

  if (!numKeys) {
    return Promise.resolve(obj);
  }

  function forEachProperty(obj, fn) {
    for (let key in obj) {
      fn.call(null, obj[key], key, obj);
    }
  }

  function forEachElement(arr, fn) {
    arr.forEach(fn);
  }

  var numResolved = 0;
  return new Promise(function(fulfill, reject) {
    var forEachKey = isArray ? forEachElement: forEachProperty;

    forEachKey(obj, function(partialValue, key) {
      if (!Array.isArray(partialValue)
          && (!partialValue || typeof partialValue !== 'object')) {
        maybeResolveValue();
        return;
      }

      fullyResolved(partialValue).then(
          function(resolvedValue) {
            obj[key] = resolvedValue;
            maybeResolveValue();
          },
          reject);
    });

    function maybeResolveValue() {
      if (++numResolved == numKeys) {
        fulfill(obj);
      }
    }
  });
}


// PUBLIC API


module.exports = {
  checkedNodeCall,
  delayed,
  filter,
  finally: thenFinally,
  fullyResolved,
  isPromise,
  map
};
