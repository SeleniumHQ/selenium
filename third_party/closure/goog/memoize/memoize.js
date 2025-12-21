/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tool for caching the result of expensive deterministic
 * functions.
 *
 * @see http://en.wikipedia.org/wiki/Memoization
 */

goog.module('goog.memoize');
goog.module.declareLegacyNamespace();

const reflect = goog.require('goog.reflect');

/**
 * Note that when using the WeakMap polyfill users may run into issues
 * where memoize is unable to store a cache properly (as the polyfill tries to
 * store the values on the key object as properties.). The workaround is to not
 * memoize onto a sealed context if the code needs to run in browsers where
 * WeakMap is not available (IE<=10 as an example).
 * @type {!WeakMap<!Object, !Object>}
 */
const MODULE_LOCAL_CACHE = new WeakMap();

/**
 * Decorator around functions that caches the inner function's return values.
 *
 * To cache parameterless functions, see goog.functions.cacheReturnValue.
 *
 * @param {Function} f The function to wrap. Its return value may only depend
 *     on its arguments and 'this' context. There may be further restrictions
 *     on the arguments depending on the capabilities of the serializer used.
 * @param {function(number, !IArrayLike<?>): string=} serializer A function to
 *     serialize f's arguments. It must have the same signature as
 *     goog.memoize.simpleSerializer. It defaults to that function.
 * @return {!Function} The wrapped function.
 */
function memoize(f, serializer = simpleSerializer) {
  const uidF = goog.getUid(f);
  const keyFn = ([that, ...args]) => serializer(uidF, args);
  const valueFn = ([that, ...args]) => f.apply(that, args);

  /**
   * @this {Object} The object whose function is being wrapped.
   * @param {...*} args
   * @return {?} the return value of the original function.
   */
  const memoizedFn = function(...args) {
    if (memoize.ENABLE_MEMOIZE) {
      const cacheKey = this || goog.global;
      let cache = MODULE_LOCAL_CACHE.get(cacheKey);
      if (!cache) {
        cache = {};
        MODULE_LOCAL_CACHE.set(cacheKey, cache);
      }
      return reflect.cache(cache, [this, ...args], valueFn, keyFn);
    } else {
      return f.apply(this, args);
    }
  };
  return memoizedFn;
}
exports = memoize;

/**
 * @define {boolean} Flag to disable memoization in unit tests.
 */
memoize.ENABLE_MEMOIZE = goog.define('goog.memoize.ENABLE_MEMOIZE', true);


/**
 * Clears the memoization cache on the given object.
 * @param {?Object} cacheOwner The owner of the cache.
 */
const clearCache = function(cacheOwner) {
  MODULE_LOCAL_CACHE.set(cacheOwner || goog.global, {});
};
exports.clearCache = clearCache;


/**
 * Simple and fast argument serializer function for goog.memoize.
 * Supports string, number, boolean, null and undefined arguments. Doesn't
 * support \x0B characters in the strings.
 * @param {number} functionUid Unique identifier of the function whose result
 *     is cached.
 * @param {!IArrayLike<?>} args The arguments that the function to memoize is
 *     called with. Note: it is an array-like object, because it supports
 *     indexing and has the length property.
 * @return {string} The list of arguments with type information concatenated
 *     with the functionUid argument, serialized as \x0B-separated string.
 */
const simpleSerializer = function(functionUid, args) {
  const context = [functionUid];
  for (let i = args.length - 1; i >= 0; --i) {
    context.push(typeof args[i], args[i]);
  }
  return context.join('\x0B');
};
exports.simpleSerializer = simpleSerializer;
