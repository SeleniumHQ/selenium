/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for creating functions. Loosely inspired by these
 * java classes from the Guava library:
 * com.google.common.base.Functions
 * https://google.github.io/guava/releases/snapshot-jre/api/docs/index.html?com/google/common/base/Functions.html
 *
 * com.google.common.base.Predicates
 * https://google.github.io/guava/releases/snapshot-jre/api/docs/index.html?com/google/common/base/Predicates.html
 *
 * More about these can be found at
 * https://github.com/google/guava/wiki/FunctionalExplained
 */


goog.provide('goog.functions');


/**
 * Creates a function that always returns the same value.
 * @param {T} retValue The value to return.
 * @return {function():T} The new function.
 * @template T
 */
goog.functions.constant = function(retValue) {
  'use strict';
  return function() {
    'use strict';
    return retValue;
  };
};


/**
 * Always returns false.
 * @type {function(...): boolean}
 */
goog.functions.FALSE = function() {
  'use strict';
  return false;
};


/**
 * Always returns true.
 * @type {function(...): boolean}
 */
goog.functions.TRUE = function() {
  'use strict';
  return true;
};


/**
 * Always returns `null`.
 * @type {function(...): null}
 */
goog.functions.NULL = function() {
  'use strict';
  return null;
};


/**
 * Always returns `undefined`.
 * @type {function(...): undefined}
 */
goog.functions.UNDEFINED = function() {
  return undefined;
};

/**
 * Always returns `undefined` (loosely-typed version).
 * @type {!Function}
 */
goog.functions.EMPTY = /** @type {?} */ (goog.functions.UNDEFINED);


/**
 * A simple function that returns the first argument of whatever is passed
 * into it.
 * @param {T=} opt_returnValue The single value that will be returned.
 * @param {...*} var_args Optional trailing arguments. These are ignored.
 * @return {T} The first argument passed in, or undefined if nothing was passed.
 * @template T
 */
goog.functions.identity = function(opt_returnValue, var_args) {
  'use strict';
  return opt_returnValue;
};


/**
 * Creates a function that always throws an error with the given message.
 * @param {string} message The error message.
 * @return {!Function} The error-throwing function.
 */
goog.functions.error = function(message) {
  'use strict';
  return function() {
    'use strict';
    throw new Error(message);
  };
};


/**
 * Creates a function that throws the given object.
 * @param {*} err An object to be thrown.
 * @return {!Function} The error-throwing function.
 */
goog.functions.fail = function(err) {
  'use strict';
  return function() {
    'use strict';
    throw err;
  };
};


/**
 * Given a function, create a function that keeps opt_numArgs arguments and
 * silently discards all additional arguments.
 * @param {Function} f The original function.
 * @param {number=} opt_numArgs The number of arguments to keep. Defaults to 0.
 * @return {!Function} A version of f that only keeps the first opt_numArgs
 *     arguments.
 */
goog.functions.lock = function(f, opt_numArgs) {
  'use strict';
  opt_numArgs = opt_numArgs || 0;
  return function() {
    'use strict';
    const self = /** @type {*} */ (this);
    return f.apply(self, Array.prototype.slice.call(arguments, 0, opt_numArgs));
  };
};


/**
 * Creates a function that returns its nth argument.
 * @param {number} n The position of the return argument.
 * @return {!Function} A new function.
 */
goog.functions.nth = function(n) {
  'use strict';
  return function() {
    'use strict';
    return arguments[n];
  };
};


/**
 * Like goog.partial(), except that arguments are added after arguments to the
 * returned function.
 *
 * Usage:
 * function f(arg1, arg2, arg3, arg4) { ... }
 * var g = goog.functions.partialRight(f, arg3, arg4);
 * g(arg1, arg2);
 *
 * @param {!Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn
 *     at the end.
 * @return {!Function} A partially-applied form of the function goog.partial()
 *     was invoked as a method of.
 */
goog.functions.partialRight = function(fn, var_args) {
  'use strict';
  const rightArgs = Array.prototype.slice.call(arguments, 1);
  return function() {
    'use strict';
    // Even in strict mode, IE10/11 and Edge (non-Chromium) use global context
    // when free-calling functions. To catch cases where people were using this
    // erroneously, we explicitly change the context to undefined to match
    // strict mode specifications.
    let self = /** @type {*} */ (this);
    if (self === goog.global) {
      self = undefined;
    }
    const newArgs = Array.prototype.slice.call(arguments);
    newArgs.push.apply(newArgs, rightArgs);
    return fn.apply(self, newArgs);
  };
};


/**
 * Given a function, create a new function that swallows its return value
 * and replaces it with a new one.
 * @param {Function} f A function.
 * @param {T} retValue A new return value.
 * @return {function(...?):T} A new function.
 * @template T
 */
goog.functions.withReturnValue = function(f, retValue) {
  'use strict';
  return goog.functions.sequence(f, goog.functions.constant(retValue));
};


/**
 * Creates a function that returns whether its argument equals the given value.
 *
 * Example:
 * var key = goog.object.findKey(obj, goog.functions.equalTo('needle'));
 *
 * @param {*} value The value to compare to.
 * @param {boolean=} opt_useLooseComparison Whether to use a loose (==)
 *     comparison rather than a strict (===) one. Defaults to false.
 * @return {function(*):boolean} The new function.
 */
goog.functions.equalTo = function(value, opt_useLooseComparison) {
  'use strict';
  return function(other) {
    'use strict';
    return opt_useLooseComparison ? (value == other) : (value === other);
  };
};


/**
 * Creates the composition of the functions passed in.
 * For example, (goog.functions.compose(f, g))(a) is equivalent to f(g(a)).
 * @param {function(...?):T} fn The final function.
 * @param {...Function} var_args A list of functions.
 * @return {function(...?):T} The composition of all inputs.
 * @template T
 */
goog.functions.compose = function(fn, var_args) {
  'use strict';
  const functions = arguments;
  const length = functions.length;
  return function() {
    'use strict';
    const self = /** @type {*} */ (this);
    let result;
    if (length) {
      result = functions[length - 1].apply(self, arguments);
    }

    for (let i = length - 2; i >= 0; i--) {
      result = functions[i].call(self, result);
    }
    return result;
  };
};


/**
 * Creates a function that calls the functions passed in in sequence, and
 * returns the value of the last function. For example,
 * (goog.functions.sequence(f, g))(x) is equivalent to f(x),g(x).
 * @param {...Function} var_args A list of functions.
 * @return {!Function} A function that calls all inputs in sequence.
 */
goog.functions.sequence = function(var_args) {
  'use strict';
  const functions = arguments;
  const length = functions.length;
  return function() {
    'use strict';
    const self = /** @type {*} */ (this);
    let result;
    for (let i = 0; i < length; i++) {
      result = functions[i].apply(self, arguments);
    }
    return result;
  };
};


/**
 * Creates a function that returns true if each of its components evaluates
 * to true. The components are evaluated in order, and the evaluation will be
 * short-circuited as soon as a function returns false.
 * For example, (goog.functions.and(f, g))(x) is equivalent to f(x) && g(x).
 * @param {...Function} var_args A list of functions.
 * @return {function(...?):boolean} A function that ANDs its component
 *      functions.
 */
goog.functions.and = function(var_args) {
  'use strict';
  const functions = arguments;
  const length = functions.length;
  return function() {
    'use strict';
    const self = /** @type {*} */ (this);
    for (let i = 0; i < length; i++) {
      if (!functions[i].apply(self, arguments)) {
        return false;
      }
    }
    return true;
  };
};


/**
 * Creates a function that returns true if any of its components evaluates
 * to true. The components are evaluated in order, and the evaluation will be
 * short-circuited as soon as a function returns true.
 * For example, (goog.functions.or(f, g))(x) is equivalent to f(x) || g(x).
 * @param {...Function} var_args A list of functions.
 * @return {function(...?):boolean} A function that ORs its component
 *    functions.
 */
goog.functions.or = function(var_args) {
  'use strict';
  const functions = arguments;
  const length = functions.length;
  return function() {
    'use strict';
    const self = /** @type {*} */ (this);
    for (let i = 0; i < length; i++) {
      if (functions[i].apply(self, arguments)) {
        return true;
      }
    }
    return false;
  };
};


/**
 * Creates a function that returns the Boolean opposite of a provided function.
 * For example, (goog.functions.not(f))(x) is equivalent to !f(x).
 * @param {!Function} f The original function.
 * @return {function(...?):boolean} A function that delegates to f and returns
 * opposite.
 */
goog.functions.not = function(f) {
  'use strict';
  return function() {
    'use strict';
    const self = /** @type {*} */ (this);
    return !f.apply(self, arguments);
  };
};


/**
 * Generic factory function to construct an object given the constructor
 * and the arguments. Intended to be bound to create object factories.
 *
 * Example:
 *
 * var factory = goog.partial(goog.functions.create, Class);
 *
 * @param {function(new:T, ...)} constructor The constructor for the Object.
 * @param {...*} var_args The arguments to be passed to the constructor.
 * @return {T} A new instance of the class given in `constructor`.
 * @template T
 * @deprecated This function does not work with ES6 class constructors. Use
 *     arrow functions + spread args instead.
 */
goog.functions.create = function(constructor, var_args) {
  'use strict';
  /**
   * @constructor
   * @final
   */
  const temp = function() {};
  temp.prototype = constructor.prototype;

  // obj will have constructor's prototype in its chain and
  // 'obj instanceof constructor' will be true.
  const obj = new temp();

  // obj is initialized by constructor.
  // arguments is only array-like so lacks shift(), but can be used with
  // the Array prototype function.
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1));
  return obj;
};


/**
 * @define {boolean} Whether the return value cache should be used.
 *    This should only be used to disable caches when testing.
 */
goog.functions.CACHE_RETURN_VALUE =
    goog.define('goog.functions.CACHE_RETURN_VALUE', true);


/**
 * Gives a wrapper function that caches the return value of a parameterless
 * function when first called.
 *
 * When called for the first time, the given function is called and its
 * return value is cached (thus this is only appropriate for idempotent
 * functions).  Subsequent calls will return the cached return value. This
 * allows the evaluation of expensive functions to be delayed until first used.
 *
 * To cache the return values of functions with parameters, see goog.memoize.
 *
 * @param {function():T} fn A function to lazily evaluate.
 * @return {function():T} A wrapped version the function.
 * @template T
 */
goog.functions.cacheReturnValue = function(fn) {
  'use strict';
  let called = false;
  let value;

  return function() {
    'use strict';
    if (!goog.functions.CACHE_RETURN_VALUE) {
      return fn();
    }

    if (!called) {
      value = fn();
      called = true;
    }

    return value;
  };
};


/**
 * Wraps a function to allow it to be called, at most, once. All
 * additional calls are no-ops.
 *
 * This is particularly useful for initialization functions
 * that should be called, at most, once.
 *
 * @param {function():*} f Function to call.
 * @return {function():undefined} Wrapped function.
 */
goog.functions.once = function(f) {
  'use strict';
  // Keep a reference to the function that we null out when we're done with
  // it -- that way, the function can be GC'd when we're done with it.
  let inner = f;
  return function() {
    'use strict';
    if (inner) {
      const tmp = inner;
      inner = null;
      tmp();
    }
  };
};


/**
 * Wraps a function to allow it to be called, at most, once per interval
 * (specified in milliseconds). If the wrapper function is called N times within
 * that interval, only the Nth call will go through.
 *
 * This is particularly useful for batching up repeated actions where the
 * last action should win. This can be used, for example, for refreshing an
 * autocomplete pop-up every so often rather than updating with every keystroke,
 * since the final text typed by the user is the one that should produce the
 * final autocomplete results. For more stateful debouncing with support for
 * pausing, resuming, and canceling debounced actions, use
 * `goog.async.Debouncer`.
 *
 * @param {function(this:SCOPE, ...?)} f Function to call.
 * @param {number} interval Interval over which to debounce. The function will
 *     only be called after the full interval has elapsed since the last call.
 * @param {SCOPE=} opt_scope Object in whose scope to call the function.
 * @return {function(...?): undefined} Wrapped function.
 * @template SCOPE
 */
goog.functions.debounce = function(f, interval, opt_scope) {
  'use strict';
  let timeout = 0;
  return /** @type {function(...?)} */ (function(var_args) {
    'use strict';
    goog.global.clearTimeout(timeout);
    const args = arguments;
    timeout = goog.global.setTimeout(function() {
      'use strict';
      f.apply(opt_scope, args);
    }, interval);
  });
};


/**
 * Wraps a function to allow it to be called, at most, once per interval
 * (specified in milliseconds). If the wrapper function is called N times in
 * that interval, both the 1st and the Nth calls will go through.
 *
 * This is particularly useful for limiting repeated user requests where the
 * the last action should win, but you also don't want to wait until the end of
 * the interval before sending a request out, as it leads to a perception of
 * slowness for the user.
 *
 * @param {function(this:SCOPE, ...?)} f Function to call.
 * @param {number} interval Interval over which to throttle. The function can
 *     only be called once per interval.
 * @param {SCOPE=} opt_scope Object in whose scope to call the function.
 * @return {function(...?): undefined} Wrapped function.
 * @template SCOPE
 */
goog.functions.throttle = function(f, interval, opt_scope) {
  'use strict';
  let timeout = 0;
  let shouldFire = false;
  let storedArgs = [];

  const handleTimeout = function() {
    'use strict';
    timeout = 0;
    if (shouldFire) {
      shouldFire = false;
      fire();
    }
  };

  const fire = function() {
    'use strict';
    timeout = goog.global.setTimeout(handleTimeout, interval);
    let args = storedArgs;
    storedArgs = [];  // Avoid a space leak by clearing stored arguments.
    f.apply(opt_scope, args);
  };

  return /** @type {function(...?)} */ (function(var_args) {
    'use strict';
    storedArgs = arguments;
    if (!timeout) {
      fire();
    } else {
      shouldFire = true;
    }
  });
};


/**
 * Wraps a function to allow it to be called, at most, once per interval
 * (specified in milliseconds). If the wrapper function is called N times within
 * that interval, only the 1st call will go through.
 *
 * This is particularly useful for limiting repeated user requests where the
 * first request is guaranteed to have all the data required to perform the
 * final action, so there's no need to wait until the end of the interval before
 * sending the request out.
 *
 * @param {function(this:SCOPE, ...?)} f Function to call.
 * @param {number} interval Interval over which to rate-limit. The function will
 *     only be called once per interval, and ignored for the remainer of the
 *     interval.
 * @param {SCOPE=} opt_scope Object in whose scope to call the function.
 * @return {function(...?): undefined} Wrapped function.
 * @template SCOPE
 */
goog.functions.rateLimit = function(f, interval, opt_scope) {
  'use strict';
  let timeout = 0;

  const handleTimeout = function() {
    'use strict';
    timeout = 0;
  };

  return /** @type {function(...?)} */ (function(var_args) {
    'use strict';
    if (!timeout) {
      timeout = goog.global.setTimeout(handleTimeout, interval);
      f.apply(opt_scope, arguments);
    }
  });
};

/**
 * Returns true if the specified value is a function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.functions.isFunction = (val) => {
  return typeof val === 'function';
};
