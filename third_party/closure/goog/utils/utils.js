/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions that were removed from goog.base but are
 * still needed by the Selenium atoms. These provide compatibility shims for
 * legacy Closure Library code.
 */

goog.provide('goog.utils');


/**
 * Returns true if the specified value is not undefined.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 * @deprecated Use `val !== undefined` instead.
 */
goog.utils.isDef = function(val) {
  return val !== undefined;
};


/**
 * Returns true if the specified value is a string.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a string.
 * @deprecated Use `typeof val === 'string'` instead.
 */
goog.utils.isString = function(val) {
  return typeof val === 'string';
};


/**
 * Returns true if the specified value is a number.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 * @deprecated Use `typeof val === 'number'` instead.
 */
goog.utils.isNumber = function(val) {
  return typeof val === 'number';
};


/**
 * Returns true if the specified value is a boolean.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a boolean.
 * @deprecated Use `typeof val === 'boolean'` instead.
 */
goog.utils.isBoolean = function(val) {
  return typeof val === 'boolean';
};


/**
 * Returns true if the specified value is a function.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a function.
 * @deprecated Use `typeof val === 'function'` instead.
 */
goog.utils.isFunction = function(val) {
  return typeof val === 'function';
};


/**
 * Returns true if the specified value is null.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is null.
 * @deprecated Use `val === null` instead.
 */
goog.utils.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is an object. This includes arrays and
 * functions.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.utils.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
};


/**
 * Returns true if the specified value is an array.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 * @deprecated Use `Array.isArray(val)` instead.
 */
goog.utils.isArray = function(val) {
  return Array.isArray(val);
};


/**
 * This is a "fixed" version of the typeof operator. It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 *
 * @param {?} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.utils.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      var className = Object.prototype.toString.call(
          /** @type {!Object} */ (value));

      if (className == '[object Window]') {
        return 'object';
      }

      if ((className == '[object Array]' ||
           typeof value.length == 'number' &&
               typeof value.splice != 'undefined' &&
               typeof value.propertyIsEnumerable != 'undefined' &&
               !value.propertyIsEnumerable('splice'))) {
        return 'array';
      }

      if ((className == '[object Function]' ||
           typeof value.call != 'undefined' &&
               typeof value.propertyIsEnumerable != 'undefined' &&
               !value.propertyIsEnumerable('call'))) {
        return 'function';
      }

    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is array-like. An array-like value has
 * a numeric length property.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is array-like.
 */
goog.utils.isArrayLike = function(val) {
  var type = goog.utils.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 * @return {!Object} The prototype of the child class.
 */
goog.utils.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  /**
   * Calls superclass constructor/method.
   *
   * @param {!Object} me Should always be "this".
   * @param {string} methodName The method name to call. Calling superclass
   *     constructor can be done with the special string 'constructor'.
   * @param {...*} var_args The arguments to pass to superclass
   *     method/constructor.
   * @return {*} The return value of the superclass method/constructor.
   */
  childCtor.base = function(me, methodName, var_args) {
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };

  return childCtor.prototype;
};


/**
 * Adds a getInstance() static method that always returns the same instance.
 *
 * @param {!Function} ctor The constructor for the class.
 */
goog.utils.addSingletonGetter = function(ctor) {
  ctor.instance_ = undefined;
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * The property used to store the unique ID on objects.
 * @private {string}
 * @const
 */
goog.utils.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for unique IDs.
 * @private {number}
 */
goog.utils.uidCounter_ = 0;


/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.utils.getUid = function(obj) {
  return obj[goog.utils.UID_PROPERTY_] ||
      (obj[goog.utils.UID_PROPERTY_] = ++goog.utils.uidCounter_);
};


/**
 * Whether the given object is already assigned a unique ID.
 *
 * @param {!Object} obj The object to check.
 * @return {boolean} Whether there is an assigned unique id for the object.
 */
goog.utils.hasUid = function(obj) {
  return !!obj[goog.utils.UID_PROPERTY_];
};


/**
 * Removes the unique ID from an object.
 *
 * @param {Object} obj The object to remove the unique ID from.
 */
goog.utils.removeUid = function(obj) {
  if (obj !== null && 'removeAttribute' in obj) {
    obj.removeAttribute(goog.utils.UID_PROPERTY_);
  }

  try {
    delete obj[goog.utils.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * An alias for Function.prototype.bind that works in older browsers.
 *
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function passed as an
 *     argument.
 * @template T
 */
goog.utils.bind = function(fn, selfObj, var_args) {
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Like goog.utils.bind(), except that a 'this object' is not required. Useful
 * when the target function is already bound.
 *
 * @param {?function(...)} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function passed as an
 *     argument.
 */
goog.utils.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};


/**
 * A function that always throws an error. Useful for defining abstract methods.
 *
 * @throws {Error} Always throws Error.
 */
goog.utils.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Returns the current time as a number of milliseconds since epoch.
 *
 * @return {number} Current time in milliseconds.
 * @deprecated Use `Date.now()` instead.
 */
goog.utils.now = function() {
  return Date.now();
};
