// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Tool for caching the result of expensive deterministic
 * functions.
 *
 * @see http://en.wikipedia.org/wiki/Memoization
 *
 */

goog.provide('goog.memoize');


/**
 * Decorator around functions that caches the inner function's return values.
 *
 * To cache parameterless functions, see goog.functions.cacheReturnValue.
 *
 * @param {Function} f The function to wrap. Its return value may only depend
 *     on its arguments and 'this' context. There may be further restrictions
 *     on the arguments depending on the capabilities of the serializer used.
 * @param {function(number, Object): string=} opt_serializer A function to
 *     serialize f's arguments. It must have the same signature as
 *     goog.memoize.simpleSerializer. It defaults to that function.
 * @this {Object} The object whose function is being wrapped.
 * @return {!Function} The wrapped function.
 */
goog.memoize = function(f, opt_serializer) {
  var serializer = opt_serializer || goog.memoize.simpleSerializer;

  return function() {
    if (goog.memoize.ENABLE_MEMOIZE) {
      // In the strict mode, when this function is called as a global function,
      // the value of 'this' is undefined instead of a global object. See:
      // https://developer.mozilla.org/en/JavaScript/Strict_mode
      var thisOrGlobal = this || goog.global;
      // Maps the serialized list of args to the corresponding return value.
      var cache = thisOrGlobal[goog.memoize.CACHE_PROPERTY_] ||
          (thisOrGlobal[goog.memoize.CACHE_PROPERTY_] = {});
      var key = serializer(goog.getUid(f), arguments);
      return cache.hasOwnProperty(key) ? cache[key] :
          (cache[key] = f.apply(this, arguments));
    } else {
      return f.apply(this, arguments);
    }
  };
};


/**
 * @define {boolean} Flag to disable memoization in unit tests.
 */
goog.define('goog.memoize.ENABLE_MEMOIZE', true);


/**
 * Clears the memoization cache on the given object.
 * @param {Object} cacheOwner The owner of the cache. This is the {@code this}
 *     context of the memoized function.
 */
goog.memoize.clearCache = function(cacheOwner) {
  cacheOwner[goog.memoize.CACHE_PROPERTY_] = {};
};


/**
 * Name of the property used by goog.memoize as cache.
 * @type {string}
 * @private
 */
goog.memoize.CACHE_PROPERTY_ = 'closure_memoize_cache_';


/**
 * Simple and fast argument serializer function for goog.memoize.
 * Supports string, number, boolean, null and undefined arguments. Doesn't
 * support \x0B characters in the strings.
 * @param {number} functionUid Unique identifier of the function whose result
 *     is cached.
 * @param {Object} args The arguments that the function to memoize is called
 *     with. Note: it is an array-like object, because supports indexing and
 *     has the length property.
 * @return {string} The list of arguments with type information concatenated
 *     with the functionUid argument, serialized as \x0B-separated string.
 */
goog.memoize.simpleSerializer = function(functionUid, args) {
  var context = [functionUid];
  for (var i = args.length - 1; i >= 0; --i) {
    context.push(typeof args[i], args[i]);
  }
  return context.join('\x0B');
};
