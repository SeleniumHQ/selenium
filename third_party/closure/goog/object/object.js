/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 */
goog.module('goog.object');
goog.module.declareLegacyNamespace();

const utils = goog.require('goog.utils');

/**
 * Calls a function for each element in an object/map/hash.
 * @param {?Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,?Object<K,V>):?} f The function to call for every
 *     element. This function takes 3 arguments (the value, the key and the
 *     object) and the return value is ignored.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {void}
 * @template T,K,V
 */
function forEach(obj, f, opt_obj) {
  for (const key in obj) {
    f.call(/** @type {?} */ (opt_obj), obj[key], key, obj);
  }
}

/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 * @param {?Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,?Object<K,V>):boolean} f The function to call for
 *     every element. This function takes 3 arguments (the value, the key and
 *     the object) and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the element is not
 *     included.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object<K,V>} a new object in which only elements that passed the
 *     test are present.
 * @template T,K,V
 */
function filter(obj, f, opt_obj) {
  const res = {};
  for (const key in obj) {
    if (f.call(/** @type {?} */ (opt_obj), obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
}

/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 * @param {?Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,?Object<K,V>):R} f The function to call for every
 *     element. This function takes 3 arguments (the value, the key and the
 *     object) and should return something. The result will be inserted into a
 *     new object.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object<K,R>} a new object with the results from f.
 * @template T,K,V,R
 */
function map(obj, f, opt_obj) {
  const res = {};
  for (const key in obj) {
    res[key] = f.call(/** @type {?} */ (opt_obj), obj[key], key, obj);
  }
  return res;
}

/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 * @param {?Object<K,V>} obj The object to check.
 * @param {function(this:T,V,?,?Object<K,V>):boolean} f The function to call for
 *     every element. This function takes 3 arguments (the value, the key and
 *     the object) and should return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 * @template T,K,V
 */
function some(obj, f, opt_obj) {
  for (const key in obj) {
    if (f.call(/** @type {?} */ (opt_obj), obj[key], key, obj)) {
      return true;
    }
  }
  return false;
}

/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 * @param {?Object<K,V>} obj The object to check.
 * @param {?function(this:T,V,?,?Object<K,V>):boolean} f The function to call
 *     for every element. This function takes 3 arguments (the value, the key
 *     and the object) and should return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 * @template T,K,V
 */
function every(obj, f, opt_obj) {
  for (const key in obj) {
    if (!f.call(/** @type {?} */ (opt_obj), obj[key], key, obj)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns the number of key-value pairs in the object map.
 * @param {?Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
function getCount(obj) {
  let rv = 0;
  for (const key in obj) {
    rv++;
  }
  return rv;
}

/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 * @param {?Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
function getAnyKey(obj) {
  for (const key in obj) {
    return key;
  }
}

/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 * @param {?Object<K,V>} obj The object to pick a value from.
 * @return {V|undefined} The value or undefined if the object is empty.
 * @template K,V
 */
function getAnyValue(obj) {
  for (const key in obj) {
    return obj[key];
  }
}

/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for containsValue(obj, val).
 * @param {?Object<K,V>} obj The object in which to look for val.
 * @param {V} val The object for which to check.
 * @return {boolean} true if val is present.
 * @template K,V
 */
function contains(obj, val) {
  return containsValue(obj, val);
}

/**
 * Returns the values of the object/map/hash.
 * @param {?Object<K,V>} obj The object from which to get the values.
 * @return {!Array<V>} The values in the object/map/hash.
 * @template K,V
 */
function getValues(obj) {
  const res = [];
  let i = 0;
  for (const key in obj) {
    res[i++] = obj[key];
  }
  return res;
}

/**
 * Returns the keys of the object/map/hash.
 * @param {?Object} obj The object from which to get the keys.
 * @return {!Array<string>} Array of property keys.
 */
function getKeys(obj) {
  const res = [];
  let i = 0;
  for (const key in obj) {
    res[i++] = key;
  }
  return res;
}

/**
 * Get a value from an object multiple levels deep.  This is useful for
 * pulling values from deeply nested objects, such as JSON responses.
 * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
 * @param {?Object} obj An object to get the value from. Can be array-like.
 * @param {...(string|number|!IArrayLike<number|string>)} var_args A number of
 *     keys (as strings, or numbers, for array-like objects). Can also be
 *     specified as a single array of keys.
 * @return {*} The resulting value. If, at any point, the value for a key in the
 *     current object is null or undefined, returns undefined.
 */
function getValueByKeys(obj, var_args) {
  const isArrayLike = utils.isArrayLike(var_args);
  const keys = isArrayLike ?
      /** @type {!IArrayLike<number|string>} */ (var_args) :
      arguments;

  // Start with the 2nd parameter for the variable parameters syntax.
  for (let i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    if (obj == null) return undefined;
    obj = obj[keys[i]];
  }

  return obj;
}

/**
 * Whether the object/map/hash contains the given key.
 * @param {?Object} obj The object in which to look for key.
 * @param {?} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
function containsKey(obj, key) {
  return obj !== null && key in obj;
}

/**
 * Whether the object/map/hash contains the given value. This is O(n).
 * @param {?Object<K,V>} obj The object in which to look for val.
 * @param {V} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 * @template K,V
 */
function containsValue(obj, val) {
  for (const key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
}

/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {?Object<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,?Object<K,V>):boolean} f The function to
 *     call for every element. Takes 3 arguments (the value, the key and the
 *     object) and should return a boolean.
 * @param {T=} thisObj An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 * @template T,K,V
 */
function findKey(obj, f, thisObj = undefined) {
  for (const key in obj) {
    if (f.call(/** @type {?} */ (thisObj), obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
}

/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {?Object<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,?Object<K,V>):boolean} f The function to
 *     call for every element. Takes 3 arguments (the value, the key and the
 *     object) and should return a boolean.
 * @param {T=} thisObj An optional "this" context for the function.
 * @return {V} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 * @template T,K,V
 */
function findValue(obj, f, thisObj = undefined) {
  const key = findKey(obj, f, thisObj);
  return key && obj[key];
}

/**
 * Whether the object/map/hash is empty.
 * @param {?Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
function isEmpty(obj) {
  for (const key in obj) {
    return false;
  }
  return true;
}

/**
 * Removes all key value pairs from the object/map/hash.
 * @param {?Object} obj The object to clear.
 * @return {void}
 */
function clear(obj) {
  for (const i in obj) {
    delete obj[i];
  }
}

/**
 * Removes a key-value pair based on the key.
 * @param {?Object} obj The object from which to remove the key.
 * @param {?} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
function remove(obj, key) {
  let rv;
  if (rv = key in /** @type {!Object} */ (obj)) {
    delete obj[key];
  }
  return rv;
}

/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 * @param {?Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} val The value to add.
 * @return {void}
 * @template K,V
 */
function add(obj, key, val) {
  if (obj !== null && key in obj) {
    throw new Error(`The object already contains the key "${key}"`);
  }
  set(obj, key, val);
}

/**
 * Returns the value for the given key.
 * @param {?Object<K,V>} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {R=} val The value to return if no item is found for the given key
 *     (default is undefined).
 * @return {V|R|undefined} The value for the given key.
 * @template K,V,R
 */
function get(obj, key, val = undefined) {
  if (obj !== null && key in obj) {
    return obj[key];
  }
  return val;
}

/**
 * Adds a key-value pair to the object/map/hash.
 * @param {?Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add.
 * @template K,V
 * @return {void}
 */
function set(obj, key, value) {
  obj[key] = value;
}

/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 * @param {?Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add if the key wasn't present.
 * @return {V} The value of the entry at the end of the function.
 * @template K,V
 */
function setIfUndefined(obj, key, value) {
  return key in /** @type {!Object} */ (obj) ? obj[key] : (obj[key] = value);
}

/**
 * Sets a key and value to an object if the key is not set. The value will be
 * the return value of the given function. If the key already exists, the
 * object will not be changed and the function will not be called (the function
 * will be lazily evaluated -- only called if necessary).
 * This function is particularly useful when used with an `Object` which is
 * acting as a cache.
 * @param {?Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {function():V} f The value to add if the key wasn't present.
 * @return {V} The value of the entry at the end of the function.
 * @template K,V
 */
function setWithReturnValueIfNotSet(obj, key, f) {
  if (key in obj) {
    return obj[key];
  }

  const val = f();
  obj[key] = val;
  return val;
}

/**
 * Compares two objects for equality using === on the values.
 * @param {!Object<K,V>} a
 * @param {!Object<K,V>} b
 * @return {boolean}
 * @template K,V
 */
function equals(a, b) {
  for (const k in a) {
    if (!(k in b) || a[k] !== b[k]) {
      return false;
    }
  }
  for (const k in b) {
    if (!(k in a)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns a shallow clone of the object.
 * @param {?Object<K,V>} obj Object to clone.
 * @return {!Object<K,V>} Clone of the input object.
 * @template K,V
 */
function clone(obj) {
  const res = {};
  for (const key in obj) {
    res[key] = obj[key];
  }
  return res;
}

/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 * WARNINGS:
 * <code>unsafeClone</code> does not detect reference loops. Objects
 * that refer to themselves will cause infinite recursion.
 * <code>unsafeClone</code> is unaware of unique identifiers, and
 * copies UIDs created by <code>getUid</code> into cloned results.
 * @param {T} obj The value to clone.
 * @return {T} A clone of the input value.
 * @template T
 */
function unsafeClone(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (typeof obj.clone === 'function') return obj.clone();
  if (typeof Map !== 'undefined' && obj instanceof Map) {
    return new Map(obj);
  } else if (typeof Set !== 'undefined' && obj instanceof Set) {
    return new Set(obj);
  } else if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  const clone = Array.isArray(obj) ? [] :
      typeof ArrayBuffer === 'function' &&
          typeof ArrayBuffer.isView === 'function' && ArrayBuffer.isView(obj) &&
          !(obj instanceof DataView) ?
                                     new obj.constructor(obj.length) :
                                     {};
  for (const key in obj) {
    clone[key] = unsafeClone(obj[key]);
  }
  return clone;
}

/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 * @param {?Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
function transpose(obj) {
  const transposed = {};
  for (const key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
}

/**
 * The names of the fields that are defined on Object.prototype.
 * @type {!Array<string>}
 */
const PROTOTYPE_FIELDS = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
];

/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 * Example:
 * var o = {};
 * extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * extend(o, {b: 2, c: 3});
 * o; // {a: 0, b: 2, c: 3}
 * @param {?Object} target The object to modify. Existing properties will be
 *     overwritten if they are also present in one of the objects in `var_args`.
 * @param {...(?Object|undefined)} var_args The objects from which values
 *     will be copied.
 * @return {void}
 * @deprecated Prefer Object.assign
 */
function extend(target, var_args) {
  let key;
  let source;
  for (let i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (let j = 0; j < PROTOTYPE_FIELDS.length; j++) {
      key = PROTOTYPE_FIELDS[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
}

/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments, otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {!Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
function create(var_args) {
  const argLength = arguments.length;
  if (argLength == 1 && Array.isArray(arguments[0])) {
    return create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw new Error('Uneven number of arguments');
  }

  const rv = {};
  for (let i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
}

/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments, otherwise the arguments are used as
 *     the property names.
 * @return {!Object} The new object.
 */
function createSet(var_args) {
  const argLength = arguments.length;
  if (argLength == 1 && Array.isArray(arguments[0])) {
    return createSet.apply(null, arguments[0]);
  }

  const rv = {};
  for (let i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
}

/**
 * Creates an immutable view of the underlying object, if the browser
 * supports immutable objects.
 * In default mode, writes to this view will fail silently. In strict mode,
 * they will throw an error.
 * @param {!Object<K,V>} obj An object.
 * @return {!Object<K,V>} An immutable view of that object, or the original
 *     object if this browser does not support immutables.
 * @template K,V
 */
function createImmutableView(obj) {
  let result = obj;
  if (Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result);
  }
  return result;
}

/**
 * @param {!Object} obj An object.
 * @return {boolean} Whether this is an immutable view of the object.
 */
function isImmutableView(obj) {
  return !!Object.isFrozen && Object.isFrozen(obj);
}

/**
 * Get all properties names on a given Object regardless of enumerability.
 * <p> If the browser does not support `Object.getOwnPropertyNames` nor
 * `Object.getPrototypeOf` then this is equivalent to using
 * `getKeys`
 * @param {?Object} obj The object to get the properties of.
 * @param {boolean=} includeObjectPrototype Whether properties defined on
 *     `Object.prototype` should be included in the result.
 * @param {boolean=} includeFunctionPrototype Whether properties defined on
 *     `Function.prototype` should be included in the result.
 * @return {!Array<string>}
 * @public
 */
function getAllPropertyNames(
    obj, includeObjectPrototype = undefined,
    includeFunctionPrototype = undefined) {
  if (!obj) {
    return [];
  }

  // Naively use a for..in loop to get the property names if the browser doesn't
  // support any other APIs for getting it.
  if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) {
    return getKeys(obj);
  }

  const visitedSet = {};

  // Traverse the prototype chain and add all properties to the visited set.
  let proto = obj;
  while (proto && (proto !== Object.prototype || !!includeObjectPrototype) &&
         (proto !== Function.prototype || !!includeFunctionPrototype)) {
    const names = Object.getOwnPropertyNames(proto);
    for (let i = 0; i < names.length; i++) {
      visitedSet[names[i]] = true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return getKeys(visitedSet);
}

/**
 * Given a ES5 or ES6 class reference, return its super class / super
 * constructor.
 * This should be used in rare cases where you need to walk up the inheritance
 * tree (this is generally a bad idea). But this work with ES5 and ES6 classes,
 * unlike relying on the superClass_ property.
 * Note: To start walking up the hierarchy from an instance call this with its
 * `constructor` property; e.g. `getSuperClass(instance.constructor)`.
 * @param {function(new: ?)} constructor
 * @return {?Object}
 */
function getSuperClass(constructor) {
  const proto = Object.getPrototypeOf(constructor.prototype);
  return proto && proto.constructor;
}

exports = {
  add,
  clear,
  clone,
  contains,
  containsKey,
  containsValue,
  create,
  createImmutableView,
  createSet,
  equals,
  every,
  extend,
  filter,
  findKey,
  findValue,
  forEach,
  get,
  getAllPropertyNames,
  getAnyKey,
  getAnyValue,
  getCount,
  getKeys,
  getSuperClass,
  getValueByKeys,
  getValues,
  isEmpty,
  isImmutableView,
  map,
  remove,
  set,
  setIfUndefined,
  setWithReturnValueIfNotSet,
  some,
  transpose,
  unsafeClone,
};
