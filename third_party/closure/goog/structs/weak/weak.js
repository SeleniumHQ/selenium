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
 * @fileoverview Common code for weak collections.
 *
 * The helpers in this file are used for the shim implementations of
 * {@code goog.structs.weak.Map} and {@code goog.structs.weak.Set}, for browsers
 * that do not support ECMAScript 6 native WeakMap and WeakSet.
 *
 * IMPORTANT CAVEAT: On browsers that do not provide native WeakMap and WeakSet
 * implementations, these data structure are only partially weak, and CAN LEAK
 * MEMORY. Specifically, if a key is no longer held, the key-value pair (in the
 * case of Map) and some internal metadata (in the case of Set), can be garbage
 * collected; however, if a key is still held when a Map or Set is no longer
 * held, the value and metadata will not be collected.
 *
 * RECOMMENDATIONS: If the lifetime of the weak collection is expected to be
 * shorter than that of its keys, the keys should be explicitly removed from the
 * collection when they are disposed. If this is not possible, this library may
 * be inappopriate for the application.
 *
 * BROWSER COMPATIBILITY: This library is compatible with browsers with a
 * correct implementation of Object.defineProperty (IE9+, FF4+, SF5.1+, CH5+,
 * OP12+, etc).
 * @see goog.structs.weak.SUPPORTED_BROWSER
 * @see http://kangax.github.io/compat-table/es5/#Object.defineProperty
 *
 */


goog.provide('goog.structs.weak');

goog.require('goog.userAgent');


/**
 * Whether this browser supports weak collections, using either the native or
 * shim implementation.
 * @const
 */
// Only test for shim, since ES6 native WeakMap/Set imply ES5 shim dependencies
goog.structs.weak.SUPPORTED_BROWSER = Object.defineProperty &&
    // IE<9 and Safari<5.1 cannot defineProperty on some objects
    !(goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')) &&
    !(goog.userAgent.SAFARI && !goog.userAgent.isVersionOrHigher('534.48.3'));


/**
 * Whether to use the browser's native WeakMap.
 * @const
 */
goog.structs.weak.USE_NATIVE_WEAKMAP = 'WeakMap' in goog.global &&
    // Firefox<24 WeakMap disallows some objects as keys
    // See https://github.com/Polymer/WeakMap/issues/3
    !(goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('24'));


/**
 * Whether to use the browser's native WeakSet.
 * @const
 */
goog.structs.weak.USE_NATIVE_WEAKSET = 'WeakSet' in goog.global;


/**
 * @package @const
 */
goog.structs.weak.WEAKREFS_PROPERTY_NAME = '__shimWeakrefs__';


/**
 * Counter used to generate unique ID for shim.
 * @private
 */
goog.structs.weak.counter_ = 0;


/**
 * Generate a unique ID for shim.
 * @return {string}
 * @package
 */
goog.structs.weak.generateId = function() {
  return (Math.random() * 1e9 >>> 0) + '' +
      (goog.structs.weak.counter_++ % 1e9);
};


/**
 * Checks that the key is an extensible object, otherwise throws an Error.
 * @param {*} key The key.
 * @package
 */
goog.structs.weak.checkKeyType = function(key) {
  if (!goog.isObject(key)) {
    throw TypeError('Invalid value used in weak collection');
  }
  if (Object.isExtensible && !Object.isExtensible(key)) {
    throw TypeError('Unsupported non-extensible object used as weak map key');
  }
};


/**
 * Adds a key-value pair to the collection with the given ID. Helper for shim
 * implementations of Map#set and Set#add.
 * @param {string} id The unique ID of the shim weak collection.
 * @param {*} key The key.
 * @param {*} value value to add.
 * @package
 */
goog.structs.weak.set = function(id, key, value) {
  goog.structs.weak.checkKeyType(key);
  if (!key.hasOwnProperty(goog.structs.weak.WEAKREFS_PROPERTY_NAME)) {
    // Use defineProperty to make property non-enumerable
    Object.defineProperty(/** @type {!Object} */(key),
        goog.structs.weak.WEAKREFS_PROPERTY_NAME, {value: {}});
  }
  key[goog.structs.weak.WEAKREFS_PROPERTY_NAME][id] = value;
};


/**
 * Returns whether the collection with the given ID contains the given
 * key. Helper for shim implementations of Map#containsKey and Set#contains.
 * @param {string} id The unique ID of the shim weak collection.
 * @param {*} key The key to check for.
 * @return {boolean}
 * @package
 */
goog.structs.weak.has = function(id, key) {
  goog.structs.weak.checkKeyType(key);
  return key.hasOwnProperty(goog.structs.weak.WEAKREFS_PROPERTY_NAME) ?
      id in key[goog.structs.weak.WEAKREFS_PROPERTY_NAME] :
      false;
};


/**
 * Removes a key-value pair based on the key. Helper for shim implementations of
 * Map#remove and Set#remove.
 * @param {string} id The unique ID of the shim weak collection.
 * @param {*} key The key to remove.
 * @return {boolean} Whether object was removed.
 * @package
 */
goog.structs.weak.remove = function(id, key) {
  if (goog.structs.weak.has(id, key)) {
    delete key[goog.structs.weak.WEAKREFS_PROPERTY_NAME][id];
    return true;
  }
  return false;
};
