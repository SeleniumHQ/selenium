/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper class for recording the calls of a function.
 *
 * Example:
 * <pre>
 * var stubs = new goog.testing.PropertyReplacer();
 *
 * function tearDown() {
 *   stubs.reset();
 * }
 *
 * function testShuffle() {
 *   stubs.replace(Math, 'random', goog.testing.recordFunction(Math.random));
 *   var arr = shuffle([1, 2, 3, 4, 5]);
 *   assertSameElements([1, 2, 3, 4, 5], arr);
 *   assertEquals(4, Math.random.getCallCount());
 * }
 *
 * function testOpenDialog() {
 *   stubs.replace(goog.ui, 'Dialog',
 *       goog.testing.recordConstructor(goog.ui.Dialog));
 *   openConfirmDialog();
 *   var lastDialogInstance = goog.ui.Dialog.getLastCall().getThis();
 *   assertEquals('confirm', lastDialogInstance.getTitle());
 * }
 * </pre>
 */

goog.setTestOnly('goog.testing.FunctionCall');
goog.provide('goog.testing.FunctionCall');
goog.provide('goog.testing.recordConstructor');
goog.provide('goog.testing.recordFunction');

goog.require('goog.Promise');
goog.require('goog.functions');
goog.require('goog.promise.Resolver');
goog.require('goog.testing.asserts');


/**
 * A function that represents the return type of recordFunction.
 * @private
 * @param {...?} var_args
 * @return {?}
 */
goog.testing.recordedFunction_ = function(var_args) {};

/**
 * @return {number} Total number of calls.
 */
goog.testing.recordedFunction_.getCallCount = function() {};

/**
 * Asserts that the function was called a certain number of times.
 * @param {number|string} a The expected number of calls (1 arg) or debug
 *     message (2 args).
 * @param {number=} opt_b The expected number of calls (2 args only).
 */
goog.testing.recordedFunction_.assertCallCount = function(a, opt_b) {};

/**
 * @return {!Array<!goog.testing.FunctionCall>} All calls of the recorded
 *     function.
 */
goog.testing.recordedFunction_.getCalls = function() {};

/**
 * @return {?goog.testing.FunctionCall} Last call of the recorded function or
 *     null if it hasn't been called.
 */
goog.testing.recordedFunction_.getLastCall = function() {};

/**
 * Returns and removes the last call of the recorded function.
 * @return {?goog.testing.FunctionCall} Last call of the recorded function or
 *     null if it hasn't been called.
 */
goog.testing.recordedFunction_.popLastCall = function() {};

/**
 * Returns a goog.Promise that resolves when the recorded function has equal
 * to or greater than the number of calls.
 * @param {number} num
 * @return {!goog.Promise<undefined>}
 */
goog.testing.recordedFunction_.waitForCalls = function(num) {};

/**
 * Resets the recorded function and removes all calls.
 * @return {void}
 */
goog.testing.recordedFunction_.reset = function() {};

/**
 * Wraps the function into another one which calls the inner function and
 * records its calls. The recorded function will have 3 static methods:
 * `getCallCount`, `getCalls` and `getLastCall` but won't
 * inherit the original function's prototype and static fields.
 *
 * @param {!Function=} opt_f The function to wrap and record. Defaults to
 *     goog.functions.UNDEFINED.
 * @return {!goog.testing.recordFunction.Type} The wrapped function.
 */
goog.testing.recordFunction = function(opt_f) {
  'use strict';
  var f = opt_f || goog.functions.UNDEFINED;
  var calls = [];
  /** @type {?goog.promise.Resolver} */
  var waitForCallsResolver = null;
  /** @type {number} */
  var waitForCallsCount = 0;

  function maybeResolveWaitForCalls() {
    if (waitForCallsResolver && calls.length >= waitForCallsCount) {
      waitForCallsResolver.resolve();
      waitForCallsResolver = null;
      waitForCallsCount = 0;
    }
  }

  /** @type {!goog.testing.recordFunction.Type} */
  function recordedFunction() {
    var owner = /** @type {?} */ (this);
    try {
      var ret = f.apply(owner, arguments);
      calls.push(new goog.testing.FunctionCall(f, owner, arguments, ret, null));
      maybeResolveWaitForCalls();
      return ret;
    } catch (err) {
      calls.push(
          new goog.testing.FunctionCall(f, owner, arguments, undefined, err));
      maybeResolveWaitForCalls();
      throw err;
    }
  }

  /**
   * @return {number} Total number of calls.
   */
  recordedFunction.getCallCount = function() {
    'use strict';
    return calls.length;
  };

  /**
   * Asserts that the function was called a certain number of times.
   * @param {number|string} a The expected number of calls (1 arg) or debug
   *     message (2 args).
   * @param {number=} opt_b The expected number of calls (2 args only).
   */
  recordedFunction.assertCallCount = function(a, opt_b) {
    'use strict';
    var actual = calls.length;
    var expected = arguments.length == 1 ? a : opt_b;
    var message = arguments.length == 1 ? '' : ' ' + a;
    assertEquals(
        'Expected ' + expected + ' call(s), but was ' + actual + '.' + message,
        expected, actual);
  };

  /**
   * @return {!Array<!goog.testing.FunctionCall>} All calls of the recorded
   *     function.
   */
  recordedFunction.getCalls = function() {
    'use strict';
    return calls;
  };


  /**
   * @return {goog.testing.FunctionCall} Last call of the recorded function or
   *     null if it hasn't been called.
   */
  recordedFunction.getLastCall = function() {
    'use strict';
    return calls[calls.length - 1] || null;
  };

  /**
   * Returns and removes the last call of the recorded function.
   * @return {goog.testing.FunctionCall} Last call of the recorded function or
   *     null if it hasn't been called.
   */
  recordedFunction.popLastCall = function() {
    'use strict';
    return calls.pop() || null;
  };

  /**
   * Returns a goog.Promise that resolves when the recorded function has equal
   * to or greater than the number of calls.
   * @param {number} num
   * @return {!goog.Promise<undefined>}
   */
  recordedFunction.waitForCalls = function(num) {
    'use strict';
    waitForCallsCount = num;
    waitForCallsResolver = goog.Promise.withResolver();
    var promise = waitForCallsResolver.promise;
    maybeResolveWaitForCalls();
    return promise;
  };

  /**
   * Resets the recorded function and removes all calls.
   */
  recordedFunction.reset = function() {
    'use strict';
    calls.length = 0;
    waitForCallsResolver = null;
    waitForCallsCount = 0;
  };

  return recordedFunction;
};

/** @typedef {typeof goog.testing.recordedFunction_} */
goog.testing.recordFunction.Type;


/**
 * Same as {@link goog.testing.recordFunction} but the recorded function will
 * have the same prototype and static fields as the original one. It can be
 * used with constructors.
 *
 * @param {!Function} ctor The function to wrap and record.
 * @return {!Function} The wrapped function.
 */
goog.testing.recordConstructor = function(ctor) {
  'use strict';
  var recordedConstructor = goog.testing.recordFunction(ctor);
  recordedConstructor.prototype = ctor.prototype;

  // NOTE: This does not handle non-enumerable properties, should it?
  for (var x in ctor) {
    recordedConstructor[x] = ctor[x];
  }
  return recordedConstructor;
};



/**
 * Struct for a single function call.
 * @param {!Function} func The called function.
 * @param {!Object} thisContext `this` context of called function.
 * @param {!Arguments} args Arguments of the called function.
 * @param {*} ret Return value of the function or undefined in case of error.
 * @param {*} error The error thrown by the function or null if none.
 * @constructor
 */
goog.testing.FunctionCall = function(func, thisContext, args, ret, error) {
  'use strict';
  this.function_ = func;
  this.thisContext_ = thisContext;
  this.arguments_ = Array.prototype.slice.call(args);
  this.returnValue_ = ret;
  this.error_ = error;
};


/**
 * @return {!Function} The called function.
 */
goog.testing.FunctionCall.prototype.getFunction = function() {
  'use strict';
  return this.function_;
};


/**
 * @return {!Object} `this` context of called function. It is the same as
 *     the created object if the function is a constructor.
 */
goog.testing.FunctionCall.prototype.getThis = function() {
  'use strict';
  return this.thisContext_;
};


/**
 * @return {!Array<?>} Arguments of the called function.
 */
goog.testing.FunctionCall.prototype.getArguments = function() {
  'use strict';
  return this.arguments_;
};


/**
 * Returns the nth argument of the called function.
 * @param {number} index 0-based index of the argument.
 * @return {*} The argument value or undefined if there is no such argument.
 */
goog.testing.FunctionCall.prototype.getArgument = function(index) {
  'use strict';
  return this.arguments_[index];
};


/**
 * @return {*} Return value of the function or undefined in case of error.
 */
goog.testing.FunctionCall.prototype.getReturnValue = function() {
  'use strict';
  return this.returnValue_;
};


/**
 * @return {*} The error thrown by the function or null if none.
 */
goog.testing.FunctionCall.prototype.getError = function() {
  'use strict';
  return this.error_;
};
