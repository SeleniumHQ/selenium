// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Useful compiler idioms.
 *
 * @author johnlenz@google.com (John Lenz)
 */

goog.provide('goog.reflect');


/**
 * Syntax for object literal casts.
 * @see http://go/jscompiler-renaming
 * @see https://goo.gl/CRs09P
 *
 * Use this if you have an object literal whose keys need to have the same names
 * as the properties of some class even after they are renamed by the compiler.
 *
 * @param {!Function} type Type to cast to.
 * @param {Object} object Object literal to cast.
 * @return {Object} The object literal.
 */
goog.reflect.object = function(type, object) {
  return object;
};

/**
 * Syntax for renaming property strings.
 * @see http://go/jscompiler-renaming
 * @see https://goo.gl/CRs09P
 *
 * Use this if you have an need to access a property as a string, but want
 * to also have the property renamed by the compiler. In contrast to
 * goog.reflect.object, this method takes an instance of an object.
 *
 * Properties must be simple names (not qualified names).
 *
 * @param {string} prop Name of the property
 * @param {!Object} object Instance of the object whose type will be used
 *     for renaming
 * @return {string} The renamed property.
 */
goog.reflect.objectProperty = function(prop, object) {
  return prop;
};

/**
 * To assert to the compiler that an operation is needed when it would
 * otherwise be stripped. For example:
 * <code>
 *     // Force a layout
 *     goog.reflect.sinkValue(dialog.offsetHeight);
 * </code>
 * @param {T} x
 * @return {T}
 * @template T
 */
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[' '](x);
  return x;
};


/**
 * The compiler should optimize this function away iff no one ever uses
 * goog.reflect.sinkValue.
 */
goog.reflect.sinkValue[' '] = goog.nullFunction;


/**
 * Check if a property can be accessed without throwing an exception.
 * @param {Object} obj The owner of the property.
 * @param {string} prop The property name.
 * @return {boolean} Whether the property is accessible. Will also return true
 *     if obj is null.
 */
goog.reflect.canAccessProperty = function(obj, prop) {

  try {
    goog.reflect.sinkValue(obj[prop]);
    return true;
  } catch (e) {
  }
  return false;
};


/**
 * Retrieves a value from a cache given a key. The compiler provides special
 * consideration for this call such that it is generally considered side-effect
 * free. However, if the {@code opt_keyFn} or {@code valueFn} have side-effects
 * then the entire call is considered to have side-effects.
 *
 * Conventionally storing the value on the cache would be considered a
 * side-effect and preclude unused calls from being pruned, ie. even if
 * the value was never used, it would still always be stored in the cache.
 *
 * Providing a side-effect free {@code valueFn} and {@code opt_keyFn}
 * allows unused calls to {@code goog.reflect.cache} to be pruned.
 *
 * @param {!Object<K, V>} cacheObj The object that contains the cached values.
 * @param {?} key The key to lookup in the cache. If it is not string or number
 *     then a {@code opt_keyFn} should be provided. The key is also used as the
 *     parameter to the {@code valueFn}.
 * @param {function(?):V} valueFn The value provider to use to calculate the
 *     value to store in the cache. This function should be side-effect free
 *     to take advantage of the optimization.
 * @param {function(?):K=} opt_keyFn The key provider to determine the cache
 *     map key. This should be used if the given key is not a string or number.
 *     If not provided then the given key is used. This function should be
 *     side-effect free to take advantage of the optimization.
 * @return {V} The cached or calculated value.
 * @template K
 * @template V
 */
goog.reflect.cache = function(cacheObj, key, valueFn, opt_keyFn) {
  var storedKey = opt_keyFn ? opt_keyFn(key) : key;

  if (Object.prototype.hasOwnProperty.call(cacheObj, storedKey)) {
    return cacheObj[storedKey];
  }

  return (cacheObj[storedKey] = valueFn(key));
};
