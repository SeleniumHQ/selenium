/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.testing.asserts');
goog.setTestOnly();

goog.require('goog.dom.safe');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.testing.JsUnitException');

var DOUBLE_EQUALITY_PREDICATE = function(var1, var2) {
  'use strict';
  return var1 == var2;
};
var JSUNIT_UNDEFINED_VALUE = void 0;
var TO_STRING_EQUALITY_PREDICATE = function(var1, var2) {
  'use strict';
  return var1.toString() === var2.toString();
};
var OUTPUT_NEW_LINE_THRESHOLD = 40;


/** @typedef {function(?, ?):boolean} */
var PredicateFunctionType;


/**
 * An associative array of constructors corresponding to primitive and
 * well-known JS types.
 * @const {!Array<string>}
 */
const PRIMITIVE_TRUE_TYPES =
    ['String', 'Boolean', 'Number', 'Array', 'RegExp', 'Date', 'Function'];

if (typeof ArrayBuffer === 'function') {
  PRIMITIVE_TRUE_TYPES.push('ArrayBuffer');
}


/**
 * @const {{
 *   String : !PredicateFunctionType,
 *   Number : !PredicateFunctionType,
 *   Boolean : !PredicateFunctionType,
 *   Date : !PredicateFunctionType,
 *   RegExp : !PredicateFunctionType,
 *   Function : !PredicateFunctionType,
 *   TrustedHTML : !PredicateFunctionType,
 *   TrustedScript : !PredicateFunctionType,
 *   TrustedScriptURL : !PredicateFunctionType
 * }}
 */
const EQUALITY_PREDICATES = {
  'String': DOUBLE_EQUALITY_PREDICATE,
  'Number': DOUBLE_EQUALITY_PREDICATE,
  'Bigint': DOUBLE_EQUALITY_PREDICATE,
  'Boolean': DOUBLE_EQUALITY_PREDICATE,
  'Date': function(date1, date2) {
    'use strict';
    return date1.getTime() == date2.getTime();
  },
  'RegExp': TO_STRING_EQUALITY_PREDICATE,
  'Function': TO_STRING_EQUALITY_PREDICATE,
  'TrustedHTML': TO_STRING_EQUALITY_PREDICATE,
  'TrustedScript': TO_STRING_EQUALITY_PREDICATE,
  'TrustedScriptURL': TO_STRING_EQUALITY_PREDICATE
};


/**
 * Compares equality of two numbers, allowing them to differ up to a given
 * tolerance.
 * @param {number} var1 A number.
 * @param {number} var2 A number.
 * @param {number} tolerance the maximum allowed difference.
 * @return {boolean} Whether the two variables are sufficiently close.
 * @private
 */
goog.testing.asserts.numberRoughEqualityPredicate_ = function(
    var1, var2, tolerance) {
  'use strict';
  return Math.abs(var1 - var2) <= tolerance;
};


/**
 * @type {!Object<string, function(?, ?, number): boolean>}
 * @private
 */
goog.testing.asserts.primitiveRoughEqualityPredicates_ = {
  'Number': goog.testing.asserts.numberRoughEqualityPredicate_
};


var _trueTypeOf = function(something) {
  'use strict';
  let result = typeof something;
  try {
    switch (result) {
      case 'string':
        break;
      case 'boolean':
        break;
      case 'number':
        break;
      case 'object':
        if (something == null) {
          result = 'null';
          break;
        }
      case 'function':
        let foundConstructor = false;
        for (let i = 0; i < PRIMITIVE_TRUE_TYPES.length; i++) {
          // NOTE: this cannot be a for-of loop because it's used from Rhino
          // without the necessary Array.prototype[Symbol.iterator] polyfill.
          const trueType = PRIMITIVE_TRUE_TYPES[i];
          if (something.constructor === goog.global[trueType]) {
            result = trueType;
            foundConstructor = true;
            break;
          }
        }
        // Constructor doesn't match any of the known "primitive" constructors.
        if (!foundConstructor) {
          const m =
              something.constructor.toString().match(/function\s*([^( ]+)\(/);
          if (m) {
            result = m[1];
          }
        }
        break;
    }
  } catch (e) {
  } finally {
    result = result.slice(0, 1).toUpperCase() + result.slice(1);
  }
  return result;
};

var _displayStringForValue = function(aVar) {
  'use strict';
  var result;
  try {
    result = '<' + String(aVar) + '>';
  } catch (ex) {
    result = '<toString failed: ' + ex.message + '>';
    // toString does not work on this object :-(
  }
  if (!(aVar === null || aVar === JSUNIT_UNDEFINED_VALUE)) {
    result += ' (' + _trueTypeOf(aVar) + ')';
  }
  return result;
};

/** @param {?} failureMessage */
goog.testing.asserts.fail = function(failureMessage) {
  'use strict';
  _assert('Call to fail()', false, failureMessage);
};
/**
 * @const
 * @suppress {duplicate,checkTypes} Test frameworks like Jasmine may also
 * define global fail functions.
 */
var fail = goog.testing.asserts.fail;

var argumentsIncludeComments = function(expectedNumberOfNonCommentArgs, args) {
  'use strict';
  return args.length == expectedNumberOfNonCommentArgs + 1;
};

var commentArg = function(expectedNumberOfNonCommentArgs, args) {
  'use strict';
  if (argumentsIncludeComments(expectedNumberOfNonCommentArgs, args)) {
    return args[0];
  }

  return null;
};

var nonCommentArg = function(
    desiredNonCommentArgIndex, expectedNumberOfNonCommentArgs, args) {
  'use strict';
  return argumentsIncludeComments(expectedNumberOfNonCommentArgs, args) ?
      args[desiredNonCommentArgIndex] :
      args[desiredNonCommentArgIndex - 1];
};

var _validateArguments = function(expectedNumberOfNonCommentArgs, args) {
  'use strict';
  var valid = args.length == expectedNumberOfNonCommentArgs ||
      args.length == expectedNumberOfNonCommentArgs + 1 &&
          typeof args[0] === 'string';
  if (!valid) {
    goog.testing.asserts.raiseException(
        'Incorrect arguments passed to assert function.\n' +
        'Expected ' + expectedNumberOfNonCommentArgs + ' argument(s) plus ' +
        'optional comment; got ' + args.length + '.');
  }
};

/**
 * @return {?} goog.testing.TestCase or null
 * We suppress the lint error and we explicitly do not goog.require()
 * goog.testing.TestCase to avoid a build time dependency cycle.
 * @suppress {missingRequire|undefinedVars|missingProperties}
 * @private
 */
var _getCurrentTestCase = function() {
  'use strict';
  // Some users of goog.testing.asserts do not use goog.testing.TestRunner and
  // they do not include goog.testing.TestCase. Exceptions will not be
  // completely correct for these users.
  if (!goog.testing.TestCase) {
    if (goog.global.console) {
      goog.global.console.error(
          'Missing goog.testing.TestCase, ' +
          'add /* @suppress {extraRequire} */' +
          'goog.require(\'goog.testing.TestCase\')');
    }
    return null;
  }
  return goog.testing.TestCase.getActiveTestCase();
};

var _assert = function(comment, booleanValue, failureMessage) {
  'use strict';
  // If another framework has installed an adapter, tell it about the assertion.
  var adapter =
      typeof window !== 'undefined' && window['Closure assert adapter'];
  if (adapter) {
    adapter['assertWithMessage'](
        booleanValue,
        goog.testing.JsUnitException.generateMessage(comment, failureMessage));
    // Also throw an error, for callers that assume that asserts throw. We don't
    // include error details to avoid duplicate failure messages.
    if (!booleanValue) throw new Error('goog.testing assertion failed');
  }
  if (!booleanValue) {
    goog.testing.asserts.raiseException(comment, failureMessage);
  }
};


/**
 * @param {*} expected The expected value.
 * @param {*} actual The actual value.
 * @return {string} A failure message of the values don't match.
 * @private
 */
goog.testing.asserts.getDefaultErrorMsg_ = function(expected, actual) {
  'use strict';
  var expectedDisplayString = _displayStringForValue(expected);
  var actualDisplayString = _displayStringForValue(actual);
  var shouldUseNewLines =
      expectedDisplayString.length > OUTPUT_NEW_LINE_THRESHOLD ||
      actualDisplayString.length > OUTPUT_NEW_LINE_THRESHOLD;
  var msg = [
    'Expected', expectedDisplayString, 'but was', actualDisplayString
  ].join(shouldUseNewLines ? '\n' : ' ');

  if ((typeof expected == 'string') && (typeof actual == 'string')) {
    // Try to find a human-readable difference.
    var limit = Math.min(expected.length, actual.length);
    var commonPrefix = 0;
    while (commonPrefix < limit &&
           expected.charAt(commonPrefix) == actual.charAt(commonPrefix)) {
      commonPrefix++;
    }

    var commonSuffix = 0;
    while (commonSuffix < limit &&
           expected.charAt(expected.length - commonSuffix - 1) ==
               actual.charAt(actual.length - commonSuffix - 1)) {
      commonSuffix++;
    }

    if (commonPrefix + commonSuffix > limit) {
      commonSuffix = 0;
    }

    if (commonPrefix > 2 || commonSuffix > 2) {
      var printString = function(str) {
        'use strict';
        var startIndex = Math.max(0, commonPrefix - 2);
        var endIndex = Math.min(str.length, str.length - (commonSuffix - 2));
        return (startIndex > 0 ? '...' : '') +
            str.substring(startIndex, endIndex) +
            (endIndex < str.length ? '...' : '');
      };

      var expectedPrinted = printString(expected);
      var expectedActual = printString(actual);
      var shouldUseNewLinesInDiff =
          expectedPrinted.length > OUTPUT_NEW_LINE_THRESHOLD ||
          expectedActual.length > OUTPUT_NEW_LINE_THRESHOLD;
      msg += '\nDifference was at position ' + commonPrefix + '. ' + [
        'Expected', '[' + expectedPrinted + ']', 'vs. actual',
        '[' + expectedActual + ']'
      ].join(shouldUseNewLinesInDiff ? '\n' : ' ');
    }
  }
  return msg;
};


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assert = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var comment = commentArg(1, arguments);
  var booleanValue = nonCommentArg(1, 1, arguments);

  _assert(
      comment, typeof booleanValue === 'boolean',
      'Bad argument to assert(boolean): ' +
          _displayStringForValue(booleanValue));
  _assert(comment, booleanValue, 'Call to assert(boolean) with false');
};
/** @const */
var assert = goog.testing.asserts.assert;


/**
 * Asserts that the function throws an error.
 *
 * @param {!(string|Function)} a The assertion comment or the function to call.
 * @param {!Function=} opt_b The function to call (if the first argument of
 *     `assertThrows` was the comment).
 * @return {!Error} The error thrown by the function. Beware that code may throw
 *     other types in strange scenarios.
 * @throws {goog.testing.JsUnitException} If the assertion failed.
 */
goog.testing.asserts.assertThrows = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var func = nonCommentArg(1, 1, arguments);
  var comment = commentArg(1, arguments);
  _assert(
      comment, typeof func == 'function',
      'Argument passed to assertThrows is not a function');

  try {
    func();
  } catch (e) {
    goog.testing.asserts.removeOperaStacktrace_(e);

    var testCase = _getCurrentTestCase();
    if (e && e['isJsUnitException'] && testCase) {
      goog.testing.asserts.raiseException(
          comment,
          'Function passed to assertThrows caught a JsUnitException (usually ' +
              'from an assert or call to fail()). If this is expected, use ' +
              'assertThrowsJsUnitException instead.');
    }

    return e;
  }
  goog.testing.asserts.raiseException(
      comment, 'No exception thrown from function passed to assertThrows');
  throw new Error('Should have thrown an error.');  // Make the compiler happy.
};
/** @const */
var assertThrows = goog.testing.asserts.assertThrows;


/**
 * Removes a stacktrace from an Error object for Opera 10.0.
 * @param {*} e
 * @private
 */
goog.testing.asserts.removeOperaStacktrace_ = function(e) {
  'use strict';
  if (!goog.isObject(e)) return;
  const stack = e['stacktrace'];
  const errorMsg = e['message'];
  if (typeof stack !== 'string' || typeof errorMsg !== 'string') {
    return;
  }
  const stackStartIndex = errorMsg.length - stack.length;
  if (errorMsg.indexOf(stack, stackStartIndex) == stackStartIndex) {
    e['message'] = errorMsg.slice(0, stackStartIndex - 14);
  }
};


/**
 * Asserts that the function does not throw an error.
 *
 * @param {!(string|Function)} a The assertion comment or the function to call.
 * @param {!Function=} opt_b The function to call (if the first argument of
 *     `assertNotThrows` was the comment).
 * @return {*} The return value of the function.
 * @throws {goog.testing.JsUnitException} If the assertion failed.
 */
goog.testing.asserts.assertNotThrows = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var comment = commentArg(1, arguments);
  var func = nonCommentArg(1, 1, arguments);
  _assert(
      comment, typeof func == 'function',
      'Argument passed to assertNotThrows is not a function');

  try {
    return func();
  } catch (e) {
    comment = comment ? (comment + '\n') : '';
    comment += 'A non expected exception was thrown from function passed to ' +
        'assertNotThrows';
    // Some browsers don't have a stack trace so at least have the error
    // description.
    var stackTrace = e['stack'] || e['stacktrace'] || e.toString();
    goog.testing.asserts.raiseException(comment, stackTrace);
  }
};
/** @const */
var assertNotThrows = goog.testing.asserts.assertNotThrows;


/**
 * Asserts that the given callback function results in a JsUnitException when
 * called, and that the resulting failure message matches the given expected
 * message.
 * @param {function() : void} callback Function to be run expected to result
 *     in a JsUnitException (usually contains a call to an assert).
 * @param {string=} opt_expectedMessage Failure message expected to be given
 *     with the exception.
 * @return {!goog.testing.JsUnitException} The error thrown by the function.
 * @throws {goog.testing.JsUnitException} If the function did not throw a
 *     JsUnitException.
 */
goog.testing.asserts.assertThrowsJsUnitException = function(
    callback, opt_expectedMessage) {
  'use strict';
  try {
    callback();
  } catch (e) {
    var testCase = _getCurrentTestCase();
    if (testCase) {
      testCase.invalidateAssertionException(e);
    } else {
      goog.global.console.error(
          'Failed to remove expected exception: no test case is installed.');
    }

    if (!e.isJsUnitException) {
      goog.testing.asserts.fail(
          'Expected a JsUnitException, got \'' + e + '\' instead');
    }

    if (typeof opt_expectedMessage != 'undefined' &&
        e.message != opt_expectedMessage) {
      goog.testing.asserts.fail(
          'Expected message [' + opt_expectedMessage + '] but got [' +
          e.message + ']');
    }

    return e;
  }

  var msg = 'Expected a failure';
  if (typeof opt_expectedMessage != 'undefined') {
    msg += ': ' + opt_expectedMessage;
  }
  throw new goog.testing.JsUnitException(msg);
};
/** @const */
var assertThrowsJsUnitException =
    goog.testing.asserts.assertThrowsJsUnitException;


/**
 * Asserts that the IThenable rejects.
 *
 * This is useful for asserting that async functions throw, like an asynchronous
 * assertThrows. Example:
 *
 * ```
 *   async function shouldThrow() { throw new Error('error!'); }
 *   async function testShouldThrow() {
 *     const error = await assertRejects(shouldThrow());
 *     assertEquals('error!', error.message);
 *   }
 * ```
 *
 * @param {!(string|IThenable)} a The assertion comment or the IThenable.
 * @param {!IThenable=} opt_b The IThenable (if the first argument of
 *     `assertRejects` was the comment).
 * @return {!IThenable<*>} A child IThenable which resolves with the error that
 *     the passed in IThenable rejects with. This IThenable will reject if the
 *     passed in IThenable does not reject.
 */
goog.testing.asserts.assertRejects = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var thenable = /** @type {!IThenable<*>} */ (nonCommentArg(1, 1, arguments));
  var comment = commentArg(1, arguments);
  _assert(
      comment, goog.isObject(thenable) && typeof thenable.then === 'function',
      'Argument passed to assertRejects is not an IThenable');

  return thenable.then(
      function() {
        'use strict';
        goog.testing.asserts.raiseException(
            comment, 'IThenable passed into assertRejects did not reject');
      },
      function(e) {
        'use strict';
        goog.testing.asserts.removeOperaStacktrace_(e);
        return e;
      });
};
/** @const */
var assertRejects = goog.testing.asserts.assertRejects;


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertTrue = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var comment = commentArg(1, arguments);
  var booleanValue = nonCommentArg(1, 1, arguments);

  _assert(
      comment, typeof booleanValue === 'boolean',
      'Bad argument to assertTrue(boolean): ' +
          _displayStringForValue(booleanValue));
  _assert(comment, booleanValue, 'Call to assertTrue(boolean) with false');
};
/** @const */
var assertTrue = goog.testing.asserts.assertTrue;


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertFalse = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var comment = commentArg(1, arguments);
  var booleanValue = nonCommentArg(1, 1, arguments);

  _assert(
      comment, typeof booleanValue === 'boolean',
      'Bad argument to assertFalse(boolean): ' +
          _displayStringForValue(booleanValue));
  _assert(comment, !booleanValue, 'Call to assertFalse(boolean) with true');
};
/** @const */
var assertFalse = goog.testing.asserts.assertFalse;


/**
 * @param {*} a The expected value (2 args) or the debug message (3 args).
 * @param {*} b The actual value (2 args) or the expected value (3 args).
 * @param {*=} opt_c The actual value (3 args only).
 */
goog.testing.asserts.assertEquals = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var var1 = nonCommentArg(1, 2, arguments);
  var var2 = nonCommentArg(2, 2, arguments);
  _assert(
      commentArg(2, arguments), var1 === var2,
      goog.testing.asserts.getDefaultErrorMsg_(var1, var2));
};
/** @const */
var assertEquals = goog.testing.asserts.assertEquals;


/**
 * @param {*} a The expected value (2 args) or the debug message (3 args).
 * @param {*} b The actual value (2 args) or the expected value (3 args).
 * @param {*=} opt_c The actual value (3 args only).
 */
goog.testing.asserts.assertNotEquals = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var var1 = nonCommentArg(1, 2, arguments);
  var var2 = nonCommentArg(2, 2, arguments);
  _assert(
      commentArg(2, arguments), var1 !== var2,
      'Expected not to be ' + _displayStringForValue(var2));
};
/** @const */
var assertNotEquals = goog.testing.asserts.assertNotEquals;

/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertNull = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(
      commentArg(1, arguments), aVar === null,
      goog.testing.asserts.getDefaultErrorMsg_(null, aVar));
};
/** @const */
var assertNull = goog.testing.asserts.assertNull;


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertNotNull = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(
      commentArg(1, arguments), aVar !== null,
      'Expected not to be ' + _displayStringForValue(null));
};
/** @const */
var assertNotNull = goog.testing.asserts.assertNotNull;


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertUndefined = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(
      commentArg(1, arguments), aVar === JSUNIT_UNDEFINED_VALUE,
      goog.testing.asserts.getDefaultErrorMsg_(JSUNIT_UNDEFINED_VALUE, aVar));
};
/** @const */
var assertUndefined = goog.testing.asserts.assertUndefined;


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertNotUndefined = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(
      commentArg(1, arguments), aVar !== JSUNIT_UNDEFINED_VALUE,
      'Expected not to be ' + _displayStringForValue(JSUNIT_UNDEFINED_VALUE));
};
/** @const */
var assertNotUndefined = goog.testing.asserts.assertNotUndefined;

/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertNullOrUndefined = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(
      commentArg(1, arguments), aVar == null,
      'Expected ' + _displayStringForValue(null) + ' or ' +
          _displayStringForValue(JSUNIT_UNDEFINED_VALUE) + ' but was ' +
          _displayStringForValue(aVar));
};
/** @const */
var assertNullOrUndefined = goog.testing.asserts.assertNullOrUndefined;

/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertNotNullNorUndefined = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  goog.testing.asserts.assertNotNull.apply(null, arguments);
  goog.testing.asserts.assertNotUndefined.apply(null, arguments);
};
/** @const */
var assertNotNullNorUndefined = goog.testing.asserts.assertNotNullNorUndefined;


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertNonEmptyString = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(
      commentArg(1, arguments), aVar !== JSUNIT_UNDEFINED_VALUE &&
          aVar !== null && typeof aVar == 'string' && aVar !== '',
      'Expected non-empty string but was ' + _displayStringForValue(aVar));
};
/** @const */
var assertNonEmptyString = goog.testing.asserts.assertNonEmptyString;


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertNaN = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(
      commentArg(1, arguments), aVar !== aVar,
      'Expected NaN but was ' + _displayStringForValue(aVar));
};
/** @const */
var assertNaN = goog.testing.asserts.assertNaN;


/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertNotNaN = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), !isNaN(aVar), 'Expected not NaN');
};
/** @const */
var assertNotNaN = goog.testing.asserts.assertNotNaN;


/**
 * The return value of the equality predicate passed to findDifferences below,
 * in cases where the predicate can't test the input variables for equality.
 * @type {?string}
 */
goog.testing.asserts.EQUALITY_PREDICATE_CANT_PROCESS = null;


/**
 * The return value of the equality predicate passed to findDifferences below,
 * in cases where the input vriables are equal.
 * @type {?string}
 */
goog.testing.asserts.EQUALITY_PREDICATE_VARS_ARE_EQUAL = '';


/**
 * @const {!Object<string, boolean>}
 */
goog.testing.asserts.ARRAY_TYPES = {
  'Array': true,
  'Float32Array': true,
  'Float64Array': true,
  'Int8Array': true,
  'Int16Array': true,
  'Int32Array': true,
  'Uint8Array': true,
  'Uint8ClampedArray': true,
  'Uint16Array': true,
  'Uint32Array': true,
  'BigInt64Array': true,
  'BigUint64Array': true
};

/**
 * The result of a comparison performed by an EqualityFunction: if undefined,
 * the inputs are equal; otherwise, a human-readable description of their
 * inequality.
 *
 * @typedef {string|undefined}
 */
goog.testing.asserts.ComparisonResult;

/**
 * A equality predicate.
 *
 * The first two arguments are the values to be compared. The third is an
 * equality function which can be used to recursively apply findDifferences.
 *
 * An example comparison implementation for Array could be:
 *
 * function arrayEq(a, b, eq) {
 *   if (a.length !== b.length) {
 *     return "lengths unequal";
 *   }
 *
 *   const differences = [];
 *   for (let i = 0; i < a.length; i++) {
 *     // Use the findDifferences implementation to perform recursive
 *     // comparisons.
 *     const diff = eq(a[i], b[i], eq);
 *     if (diff) {
 *       differences[i] = diff;
 *     }
 *   }
 *
 *   if (differences) {
 *     return `found array differences: ${differences}`;
 *   }
 *
 *   // Otherwise return undefined, indicating no differences.
 *   return undefined;
 * }
 *
 * @typedef {function(?, ?, !goog.testing.asserts.EqualityFunction):
 * ?goog.testing.asserts.ComparisonResult}
 */
goog.testing.asserts.EqualityFunction;

/**
 * A map from prototype to custom equality matcher.
 *
 * @type {!Map<!Object, !goog.testing.asserts.EqualityFunction>}
 * @private
 */
goog.testing.asserts.CUSTOM_EQUALITY_MATCHERS = new Map();

/**
 * Returns the custom equality predicate for a given prototype, or else
 * undefined.
 *
 * @param {?Object} prototype
 * @return {!goog.testing.asserts.EqualityFunction|undefined}
 * @private
 */
goog.testing.asserts.getCustomEquality = function(prototype) {
  for (; (prototype != null) && (typeof prototype === 'object') &&
       (prototype !== Object.prototype);
       prototype = Object.getPrototypeOf(prototype)) {
    const matcher = goog.testing.asserts.CUSTOM_EQUALITY_MATCHERS.get(
        /** @type {!Object} */ (prototype));
    if (matcher) {
      return matcher;
    }
  }
  return undefined;
};

/**
 * Returns the most specific custom equality predicate which can be applied to
 * both arguments, or else undefined.
 *
 * @param {!Object} obj1
 * @param {!Object} obj2
 * @return {!goog.testing.asserts.EqualityFunction|undefined}
 * @private
 */
goog.testing.asserts.getMostSpecificCustomEquality = function(obj1, obj2) {
  for (let prototype = Object.getPrototypeOf(obj1); (prototype != null) &&
       (typeof prototype === 'object') && (prototype !== Object.prototype);
       prototype = Object.getPrototypeOf(prototype)) {
    if (prototype.isPrototypeOf(obj2)) {
      return goog.testing.asserts.getCustomEquality(prototype);
    }
  }

  // Otherwise, obj1 and obj2 did not share a common ancestor other than
  // Object.prototype so we cannot have a comparator.
  return undefined;
};

/**
 * Executes a custom equality function
 *
 * @param {!goog.testing.asserts.EqualityFunction} comparator
 * @param {!Object} obj1
 * @param {!Object} obj2
 * @param {string} path of the current field being checked.
 * @return {?goog.testing.asserts.ComparisonResult}
 * @private
 */
goog.testing.asserts.applyCustomEqualityFunction = function(
    comparator, obj1, obj2, path) {
  const /* !goog.testing.asserts.EqualityFunction */ callback =
      (left, right, unusedEq) => {
        const result = goog.testing.asserts.findDifferences(left, right);
        return result ? (path ? path + ': ' : '') + result : undefined;
      };
  return comparator(obj1, obj2, callback);
};

/**
 * Marks the given prototype as having equality semantics provided by the given
 * custom equality function.
 *
 * This will cause findDifferences and assertObjectEquals to use the given
 * function when comparing objects with this prototype. When comparing two
 * objects with different prototypes, the equality (if any) attached to their
 * lowest common ancestor in the prototype hierarchy will be used.
 *
 * @param {!Object} prototype
 * @param {!goog.testing.asserts.EqualityFunction} fn
 */
goog.testing.asserts.registerComparator = function(prototype, fn) {
  // First check that there is no comparator currently defined for this
  // prototype.
  if (goog.testing.asserts.CUSTOM_EQUALITY_MATCHERS.has(prototype)) {
    throw new Error('duplicate comparator installation for ' + prototype);
  }

  // We cannot install custom equality matchers on Object.prototype, as it
  // would replace all other comparisons.
  if (prototype === Object.prototype) {
    throw new Error('cannot customize root object comparator');
  }

  goog.testing.asserts.CUSTOM_EQUALITY_MATCHERS.set(prototype, fn);
};

/**
 * Clears the custom equality function currently applied to the given prototype.
 * Returns true if a function was removed.
 *
 * @param {!Object} prototype
 * @return {boolean} whether a comparator was removed.
 */
goog.testing.asserts.clearCustomComparator = function(prototype) {
  return goog.testing.asserts.CUSTOM_EQUALITY_MATCHERS.delete(prototype);
};

/**
 * Determines if two items of any type match, and formulates an error message
 * if not.
 * @param {*} expected Expected argument to match.
 * @param {*} actual Argument as a result of performing the test.
 * @param {(function(string, *, *): ?string)=} opt_equalityPredicate An optional
 *     function that can be used to check equality of variables. It accepts 3
 *     arguments: type-of-variables, var1, var2 (in that order) and returns an
 *     error message if the variables are not equal,
 *     goog.testing.asserts.EQUALITY_PREDICATE_VARS_ARE_EQUAL if the variables
 *     are equal, or
 *     goog.testing.asserts.EQUALITY_PREDICATE_CANT_PROCESS if the predicate
 *     couldn't check the input variables. The function will be called only if
 *     the types of var1 and var2 are identical.
 * @return {?string} Null on success, error message on failure.
 */
goog.testing.asserts.findDifferences = function(
    expected, actual, opt_equalityPredicate) {
  'use strict';
  var failures = [];
  // Non-null if there an error at the root (with no path).  If so, we should
  // fail, but not add to the failures array (because it will be included at the
  // top anyway).
  let /** ?string*/ rootFailure = null;
  var seen1 = [];
  var seen2 = [];

  // To avoid infinite recursion when the two parameters are self-referential
  // along the same path of properties, keep track of the object pairs already
  // seen in this call subtree, and abort when a cycle is detected.
  function innerAssertWithCycleCheck(var1, var2, path) {
    // This is used for testing, so we can afford to be slow (but more
    // accurate). So we just check whether var1 is in seen1. If we
    // found var1 in index i, we simply need to check whether var2 is
    // in seen2[i]. If it is, we do not recurse to check var1/var2. If
    // it isn't, we know that the structures of the two objects must be
    // different.
    //
    // This is based on the fact that values at index i in seen1 and
    // seen2 will be checked for equality eventually (when
    // innerAssertImplementation(seen1[i], seen2[i], path) finishes).
    for (var i = 0; i < seen1.length; ++i) {
      var match1 = seen1[i] === var1;
      var match2 = seen2[i] === var2;
      if (match1 || match2) {
        if (!match1 || !match2) {
          // Asymmetric cycles, so the objects have different structure.
          failures.push('Asymmetric cycle detected at ' + path);
        }
        return;
      }
    }

    seen1.push(var1);
    seen2.push(var2);
    innerAssertImplementation(var1, var2, path);
    seen1.pop();
    seen2.pop();
  }

  const equalityPredicate = function(type, var1, var2) {
    'use strict';
    // use the custom predicate if supplied.
    const customPredicateResult = opt_equalityPredicate ?
        opt_equalityPredicate(type, var1, var2) :
        goog.testing.asserts.EQUALITY_PREDICATE_CANT_PROCESS;
    if (customPredicateResult !==
        goog.testing.asserts.EQUALITY_PREDICATE_CANT_PROCESS) {
      return customPredicateResult;
    }
    // otherwise use the default behavior.
    const typedPredicate = EQUALITY_PREDICATES[type];
    if (!typedPredicate) {
      return goog.testing.asserts.EQUALITY_PREDICATE_CANT_PROCESS;
    }
    const equal = typedPredicate(var1, var2);
    return equal ? goog.testing.asserts.EQUALITY_PREDICATE_VARS_ARE_EQUAL :
                   goog.testing.asserts.getDefaultErrorMsg_(var1, var2);
  };

  /**
   * @param {*} var1 An item in the expected object.
   * @param {*} var2 The corresponding item in the actual object.
   * @param {string} path Their path in the objects.
   * @suppress {missingProperties} The map_ property is unknown to the compiler
   *     unless goog.structs.Map is loaded.
   */
  function innerAssertImplementation(var1, var2, path) {
    if (var1 === var2) {
      return;
    }

    var typeOfVar1 = _trueTypeOf(var1);
    var typeOfVar2 = _trueTypeOf(var2);

    if (typeOfVar1 === typeOfVar2) {
      // For two objects of the same type, if one is a prototype of another, use
      // the custom equality function for the more generic of the two
      // prototypes, if available.
      if (var1 && typeof var1 === 'object') {
        try {
          const o1 = /** @type {!Object} */ (var1);
          const o2 = /** @type {!Object} */ (var2);
          const comparator =
              goog.testing.asserts.getMostSpecificCustomEquality(o1, o2);
          if (comparator) {
            const result = goog.testing.asserts.applyCustomEqualityFunction(
                comparator, o1, o2, path);
            if (result != null) {
              if (path) {
                failures.push(path + ': ' + result);
              } else {
                rootFailure = result;
              }
            }
            return;
          }
        } catch (e) {
          // Catch and log errors from custom comparators but fall back onto
          // ordinary comparisons. Such errors can occur, e.g. with proxies or
          // when the prototypes of a polyfill are not traversable.
          //
          // If you see a failure due to this line, please do not use
          // findDifferences or assertObjectEquals on these argument types.
          goog.global.console.error('Error in custom comparator: ' + e);
        }
      }

      const isArrayBuffer = typeOfVar1 === 'ArrayBuffer';
      if (isArrayBuffer) {
        // Since ArrayBuffer instances can't themselves be iterated through,
        // compare 1-byte-per-element views of them.
        var1 = new Uint8Array(/** @type {!ArrayBuffer} */ (var1));
        var2 = new Uint8Array(/** @type {!ArrayBuffer} */ (var2));
      }
      const isArray =
          isArrayBuffer || goog.testing.asserts.ARRAY_TYPES[typeOfVar1];
      var errorMessage = equalityPredicate(typeOfVar1, var1, var2);
      if (errorMessage !=
          goog.testing.asserts.EQUALITY_PREDICATE_CANT_PROCESS) {
        if (errorMessage !=
            goog.testing.asserts.EQUALITY_PREDICATE_VARS_ARE_EQUAL) {
          if (path) {
            failures.push(path + ': ' + errorMessage);
          } else {
            rootFailure = errorMessage;
          }
        }
      } else if (isArray && var1.length != var2.length) {
        failures.push(
            (path ? path + ': ' : '') + 'Expected ' + var1.length +
            '-element array ' +
            'but got a ' + var2.length + '-element array');
      } else if (typeOfVar1 == 'String') {
        // If the comparer cannot process strings (eg, roughlyEquals).
        if (var1 != var2) {
          const error = goog.testing.asserts.getDefaultErrorMsg_(var1, var2);
          if (path) {
            failures.push(path + ': ' + error);
          } else {
            rootFailure = error;
          }
        }
      } else {
        var childPath = path + (isArray ? '[%s]' : (path ? '.%s' : '%s'));
        // These type checks do not use _trueTypeOf because that does not work
        // for polyfilled Map/Set. Note that these checks may potentially fail
        // if var1 comes from a different window.
        if ((typeof Map != 'undefined' && var1 instanceof Map) ||
            (typeof Set != 'undefined' && var1 instanceof Set)) {
          var1.forEach(function(value, key) {
            'use strict';
            if (var2.has(key)) {
              // For a map, the values must be compared, but with Set, checking
              // that the second set contains the first set's "keys" is
              // sufficient.
              if (var2.get) {
                innerAssertWithCycleCheck(
                    // NOTE: replace will call functions, so stringify eagerly.
                    value, var2.get(key), childPath.replace('%s', String(key)));
              }
            } else {
              failures.push(
                  key + ' not present in actual ' + (path || typeOfVar2));
            }
          });

          var2.forEach(function(value, key) {
            'use strict';
            if (!var1.has(key)) {
              failures.push(
                  key + ' not present in expected ' + (path || typeOfVar1));
            }
          });
        } else if (!var1['__iterator__']) {
          // if an object has an __iterator__ property, we have no way of
          // actually inspecting its raw properties, and JS 1.7 doesn't
          // overload [] to make it possible for someone to generically
          // use what the iterator returns to compare the object-managed
          // properties. This gets us into deep poo with things like
          // goog.structs.Map, at least on systems that support iteration.
          for (var prop in var1) {
            if (isArray && goog.testing.asserts.isArrayIndexProp_(prop)) {
              // Skip array indices for now. We'll handle them later.
              continue;
            }

            if (prop in var2) {
              innerAssertWithCycleCheck(
                  var1[prop], var2[prop], childPath.replace('%s', prop));
            } else {
              failures.push(
                  'property ' + prop + ' not present in actual ' +
                  (path || typeOfVar2));
            }
          }
          // make sure there aren't properties in var2 that are missing
          // from var1. if there are, then by definition they don't
          // match.
          for (var prop in var2) {
            if (isArray && goog.testing.asserts.isArrayIndexProp_(prop)) {
              // Skip array indices for now. We'll handle them later.
              continue;
            }

            if (!(prop in var1)) {
              failures.push(
                  'property ' + prop + ' not present in expected ' +
                  (path || typeOfVar1));
            }
          }

          // Handle array indices by iterating from 0 to arr.length.
          //
          // Although all browsers allow holes in arrays, browsers
          // are inconsistent in what they consider a hole. For example,
          // "[0,undefined,2]" has a hole on IE but not on Firefox.
          //
          // Because our style guide bans for...in iteration over arrays,
          // we assume that most users don't care about holes in arrays,
          // and that it is ok to say that a hole is equivalent to a slot
          // populated with 'undefined'.
          if (isArray) {
            for (prop = 0; prop < var1.length; prop++) {
              innerAssertWithCycleCheck(
                  var1[prop], var2[prop],
                  childPath.replace('%s', String(prop)));
            }
          }
        } else {
          // special-case for closure objects that have iterators
          if (typeof var1.equals === 'function') {
            // use the object's own equals function, assuming it accepts an
            // object and returns a boolean
            if (!var1.equals(var2)) {
              failures.push(
                  'equals() returned false for ' + (path || typeOfVar1));
            }
          } else if (var1.map_) {
            // assume goog.structs.Map or goog.structs.Set, where comparing
            // their private map_ field is sufficient
            innerAssertWithCycleCheck(
                var1.map_, var2.map_, childPath.replace('%s', 'map_'));
          } else {
            // else die, so user knows we can't do anything
            failures.push(
                'unable to check ' + (path || typeOfVar1) +
                ' for equality: it has an iterator we do not ' +
                'know how to handle. please add an equals method');
          }
        }
      }
    } else if (path) {
      failures.push(
          path + ': ' + goog.testing.asserts.getDefaultErrorMsg_(var1, var2));
    } else {
      rootFailure = goog.testing.asserts.getDefaultErrorMsg_(var1, var2);
    }
  }

  innerAssertWithCycleCheck(expected, actual, '');

  if (rootFailure) {
    return rootFailure;
  }
  return failures.length == 0 ? null : goog.testing.asserts.getDefaultErrorMsg_(
                                           expected, actual) +
          '\n   ' + failures.join('\n   ');
};


/**
 * Notes:
 * Object equality has some nasty browser quirks, and this implementation is
 * not 100% correct. For example,
 *
 * <code>
 * var a = [0, 1, 2];
 * var b = [0, 1, 2];
 * delete a[1];
 * b[1] = undefined;
 * assertObjectEquals(a, b); // should fail, but currently passes
 * </code>
 *
 * See asserts_test.html for more interesting edge cases.
 *
 * The first comparison object provided is the expected value, the second is
 * the actual.
 *
 * @param {*} a Assertion message or comparison object.
 * @param {*} b Comparison object.
 * @param {*=} opt_c Comparison object, if an assertion message was provided.
 */
goog.testing.asserts.assertObjectEquals = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var v1 = nonCommentArg(1, 2, arguments);
  var v2 = nonCommentArg(2, 2, arguments);
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments) : '';
  var differences = goog.testing.asserts.findDifferences(v1, v2);

  _assert(failureMessage, !differences, differences);
};
/** @const */
var assertObjectEquals = goog.testing.asserts.assertObjectEquals;


/**
 * Similar to assertObjectEquals above, but accepts a tolerance margin.
 *
 * @param {*} a Assertion message or comparison object.
 * @param {*} b Comparison object.
 * @param {*} c Comparison object or tolerance.
 * @param {*=} opt_d Tolerance, if an assertion message was provided.
 */
goog.testing.asserts.assertObjectRoughlyEquals = function(a, b, c, opt_d) {
  'use strict';
  _validateArguments(3, arguments);
  var v1 = nonCommentArg(1, 3, arguments);
  var v2 = nonCommentArg(2, 3, arguments);
  var tolerance = nonCommentArg(3, 3, arguments);
  var failureMessage = commentArg(3, arguments) ? commentArg(3, arguments) : '';
  var equalityPredicate = function(type, var1, var2) {
    'use strict';
    var typedPredicate =
        goog.testing.asserts.primitiveRoughEqualityPredicates_[type];
    if (!typedPredicate) {
      return goog.testing.asserts.EQUALITY_PREDICATE_CANT_PROCESS;
    }
    var equal = typedPredicate(var1, var2, tolerance);
    return equal ? goog.testing.asserts.EQUALITY_PREDICATE_VARS_ARE_EQUAL :
                   goog.testing.asserts.getDefaultErrorMsg_(var1, var2) +
            ' which was more than ' + tolerance + ' away';
  };
  var differences =
      goog.testing.asserts.findDifferences(v1, v2, equalityPredicate);

  _assert(failureMessage, !differences, differences);
};
/** @const */
var assertObjectRoughlyEquals = goog.testing.asserts.assertObjectRoughlyEquals;

/**
 * Compares two arbitrary objects for non-equalness.
 *
 * All the same caveats as for assertObjectEquals apply here:
 * Undefined values may be confused for missing values, or vice versa.
 *
 * @param {*} a Assertion message or comparison object.
 * @param {*} b Comparison object.
 * @param {*=} opt_c Comparison object, if an assertion message was provided.
 */
goog.testing.asserts.assertObjectNotEquals = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var v1 = nonCommentArg(1, 2, arguments);
  var v2 = nonCommentArg(2, 2, arguments);
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments) : '';
  var differences = goog.testing.asserts.findDifferences(v1, v2);

  _assert(failureMessage, differences, 'Objects should not be equal');
};
/** @const */
var assertObjectNotEquals = goog.testing.asserts.assertObjectNotEquals;


/**
 * Compares two arrays ignoring negative indexes and extra properties on the
 * array objects. Use case: Internet Explorer adds the index, lastIndex and
 * input enumerable fields to the result of string.match(/regexp/g), which makes
 * assertObjectEquals fail.
 * @param {*} a The expected array (2 args) or the debug message (3 args).
 * @param {*} b The actual array (2 args) or the expected array (3 args).
 * @param {*=} opt_c The actual array (3 args only).
 */
goog.testing.asserts.assertArrayEquals = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var v1 = nonCommentArg(1, 2, arguments);
  var v2 = nonCommentArg(2, 2, arguments);
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments) : '';

  var typeOfVar1 = _trueTypeOf(v1);
  _assert(
      failureMessage, typeOfVar1 == 'Array',
      'Expected an array for assertArrayEquals but found a ' + typeOfVar1);

  var typeOfVar2 = _trueTypeOf(v2);
  _assert(
      failureMessage, typeOfVar2 == 'Array',
      'Expected an array for assertArrayEquals but found a ' + typeOfVar2);

  goog.testing.asserts.assertObjectEquals(
      failureMessage, Array.prototype.concat.call(v1),
      Array.prototype.concat.call(v2));
};
/** @const */
var assertArrayEquals = goog.testing.asserts.assertArrayEquals;


/**
 * Compares two objects that can be accessed like an array and assert that
 * each element is equal.
 * @param {string|Object} a Failure message (3 arguments)
 *     or object #1 (2 arguments).
 * @param {Object} b Object #2 (2 arguments) or object #1 (3 arguments).
 * @param {Object=} opt_c Object #2 (3 arguments).
 */
goog.testing.asserts.assertElementsEquals = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);

  var v1 = nonCommentArg(1, 2, arguments);
  var v2 = nonCommentArg(2, 2, arguments);
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments) : '';

  if (!v1) {
    goog.testing.asserts.assert(failureMessage, !v2);
  } else {
    goog.testing.asserts.assertEquals(
        'length mismatch: ' + failureMessage, v1.length, v2.length);
    for (var i = 0; i < v1.length; ++i) {
      goog.testing.asserts.assertEquals(
          'mismatch at index ' + i + ': ' + failureMessage, v1[i], v2[i]);
    }
  }
};
/** @const */
var assertElementsEquals = goog.testing.asserts.assertElementsEquals;


/**
 * Compares two objects that can be accessed like an array and assert that
 * each element is roughly equal.
 * @param {string|Object} a Failure message (4 arguments)
 *     or object #1 (3 arguments).
 * @param {Object} b Object #1 (4 arguments) or object #2 (3 arguments).
 * @param {Object|number} c Object #2 (4 arguments) or tolerance (3 arguments).
 * @param {number=} opt_d tolerance (4 arguments).
 */
goog.testing.asserts.assertElementsRoughlyEqual = function(a, b, c, opt_d) {
  'use strict';
  _validateArguments(3, arguments);

  var v1 = nonCommentArg(1, 3, arguments);
  var v2 = nonCommentArg(2, 3, arguments);
  var tolerance = nonCommentArg(3, 3, arguments);
  var failureMessage = commentArg(3, arguments) ? commentArg(3, arguments) : '';

  if (!v1) {
    goog.testing.asserts.assert(failureMessage, !v2);
  } else {
    goog.testing.asserts.assertEquals(
        'length mismatch: ' + failureMessage, v1.length, v2.length);
    for (var i = 0; i < v1.length; ++i) {
      goog.testing.asserts.assertRoughlyEquals(
          failureMessage, v1[i], v2[i], tolerance);
    }
  }
};
/** @const */
var assertElementsRoughlyEqual =
    goog.testing.asserts.assertElementsRoughlyEqual;

/**
 * Compares elements of two array-like or iterable objects using strict equality
 * without taking their order into account.
 * @param {string|!IArrayLike|!Iterable} a Assertion message or the
 *     expected elements.
 * @param {!IArrayLike|!Iterable} b Expected elements or the actual
 *     elements.
 * @param {!IArrayLike|!Iterable=} opt_c Actual elements.
 */
goog.testing.asserts.assertSameElements = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var expected = nonCommentArg(1, 2, arguments);
  var actual = nonCommentArg(2, 2, arguments);
  var message = commentArg(2, arguments);

  goog.testing.asserts.assertTrue(
      'Value of \'expected\' should be array-like or iterable',
      goog.testing.asserts.isArrayLikeOrIterable_(expected));

  goog.testing.asserts.assertTrue(
      'Value of \'actual\' should be array-like or iterable',
      goog.testing.asserts.isArrayLikeOrIterable_(actual));

  // Clones expected and actual and converts them to real arrays.
  expected = goog.testing.asserts.toArray_(expected);
  actual = goog.testing.asserts.toArray_(actual);
  // TODO(user): It would be great to show only the difference
  // between the expected and actual elements.
  _assert(
      message, expected.length == actual.length, 'Expected ' + expected.length +
          ' elements: [' + expected + '], ' +
          'got ' + actual.length + ' elements: [' + actual + ']');

  var toFind = goog.testing.asserts.toArray_(expected);
  for (var i = 0; i < actual.length; i++) {
    var index = goog.testing.asserts.indexOf_(toFind, actual[i]);
    _assert(
        message, index != -1,
        'Expected [' + expected + '], got [' + actual + ']');
    toFind.splice(index, 1);
  }
};
/** @const */
var assertSameElements = goog.testing.asserts.assertSameElements;

/**
 * @param {*} obj Object to test.
 * @return {boolean} Whether given object is array-like or iterable.
 * @private
 */
goog.testing.asserts.isArrayLikeOrIterable_ = function(obj) {
  'use strict';
  return goog.isArrayLike(obj) || goog.testing.asserts.isIterable_(obj);
};

/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertEvaluatesToTrue = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var value = nonCommentArg(1, 1, arguments);
  if (!value) {
    _assert(commentArg(1, arguments), false, 'Expected to evaluate to true');
  }
};
/** @const */
var assertEvaluatesToTrue = goog.testing.asserts.assertEvaluatesToTrue;

/**
 * @param {*} a The value to assert (1 arg) or debug message (2 args).
 * @param {*=} opt_b The value to assert (2 args only).
 */
goog.testing.asserts.assertEvaluatesToFalse = function(a, opt_b) {
  'use strict';
  _validateArguments(1, arguments);
  var value = nonCommentArg(1, 1, arguments);
  if (value) {
    _assert(commentArg(1, arguments), false, 'Expected to evaluate to false');
  }
};
/** @const */
var assertEvaluatesToFalse = goog.testing.asserts.assertEvaluatesToFalse;

/**
 * Compares two HTML snippets.
 *
 * Take extra care if attributes are involved. `assertHTMLEquals`'s
 * implementation isn't prepared for complex cases. For example, the following
 * comparisons erroneously fail:
 * <pre>
 * assertHTMLEquals('<a href="x" target="y">', '<a target="y" href="x">');
 * assertHTMLEquals('<div class="a b">', '<div class="b a">');
 * assertHTMLEquals('<input disabled>', '<input disabled="disabled">');
 * </pre>
 *
 * When in doubt, use `goog.testing.dom.assertHtmlMatches`.
 *
 * @param {*} a The expected value (2 args) or the debug message (3 args).
 * @param {*} b The actual value (2 args) or the expected value (3 args).
 * @param {*=} opt_c The actual value (3 args only).
 */
goog.testing.asserts.assertHTMLEquals = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var var1 = nonCommentArg(1, 2, arguments);
  var var2 = nonCommentArg(2, 2, arguments);
  var var1Standardized = standardizeHTML(var1);
  var var2Standardized = standardizeHTML(var2);

  _assert(
      commentArg(2, arguments), var1Standardized === var2Standardized,
      goog.testing.asserts.getDefaultErrorMsg_(
          var1Standardized, var2Standardized));
};
/** @const */
var assertHTMLEquals = goog.testing.asserts.assertHTMLEquals;


/**
 * Compares two CSS property values to make sure that they represent the same
 * things. This will normalize values in the browser. For example, in Firefox,
 * this assertion will consider "rgb(0, 0, 255)" and "#0000ff" to be identical
 * values for the "color" property. This function won't normalize everything --
 * for example, in most browsers, "blue" will not match "#0000ff". It is
 * intended only to compensate for unexpected normalizations performed by
 * the browser that should also affect your expected value.
 * @param {string} a Assertion message, or the CSS property name.
 * @param {string} b CSS property name, or the expected value.
 * @param {string} c The expected value, or the actual value.
 * @param {string=} opt_d The actual value.
 */
goog.testing.asserts.assertCSSValueEquals = function(a, b, c, opt_d) {
  'use strict';
  _validateArguments(3, arguments);
  var propertyName = nonCommentArg(1, 3, arguments);
  var expectedValue = nonCommentArg(2, 3, arguments);
  var actualValue = nonCommentArg(3, 3, arguments);
  var expectedValueStandardized =
      standardizeCSSValue(propertyName, expectedValue);
  var actualValueStandardized = standardizeCSSValue(propertyName, actualValue);

  _assert(
      commentArg(3, arguments),
      expectedValueStandardized == actualValueStandardized,
      goog.testing.asserts.getDefaultErrorMsg_(
          expectedValueStandardized, actualValueStandardized));
};
/** @const */
var assertCSSValueEquals = goog.testing.asserts.assertCSSValueEquals;


/**
 * @param {*} a The expected value (2 args) or the debug message (3 args).
 * @param {*} b The actual value (2 args) or the expected value (3 args).
 * @param {*=} opt_c The actual value (3 args only).
 */
goog.testing.asserts.assertHashEquals = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var var1 = nonCommentArg(1, 2, arguments);
  var var2 = nonCommentArg(2, 2, arguments);
  var message = commentArg(2, arguments);
  for (var key in var1) {
    _assert(
        message, key in var2,
        'Expected hash had key ' + key + ' that was not found');
    _assert(
        message, var1[key] == var2[key], 'Value for key ' + key +
            ' mismatch - expected = ' + var1[key] + ', actual = ' + var2[key]);
  }

  for (var key in var2) {
    _assert(
        message, key in var1,
        'Actual hash had key ' + key + ' that was not expected');
  }
};
/** @const */
var assertHashEquals = goog.testing.asserts.assertHashEquals;


/**
 * @param {*} a The expected value (3 args) or the debug message (4 args).
 * @param {*} b The actual value (3 args) or the expected value (4 args).
 * @param {*} c The tolerance (3 args) or the actual value (4 args).
 * @param {*=} opt_d The tolerance (4 args only).
 */
goog.testing.asserts.assertRoughlyEquals = function(a, b, c, opt_d) {
  'use strict';
  _validateArguments(3, arguments);
  var expected = nonCommentArg(1, 3, arguments);
  var actual = nonCommentArg(2, 3, arguments);
  var tolerance = nonCommentArg(3, 3, arguments);
  _assert(
      commentArg(3, arguments),
      goog.testing.asserts.numberRoughEqualityPredicate_(
          expected, actual, tolerance),
      'Expected ' + expected + ', but got ' + actual + ' which was more than ' +
          tolerance + ' away');
};
/** @const */
var assertRoughlyEquals = goog.testing.asserts.assertRoughlyEquals;


/**
 * Checks if the test value is included in the given container. The container
 * can be a string (where "included" means a substring), an array or any
 *  `IArrayLike` (where "included" means a member), or any type implementing
 * `indexOf` with similar semantics (returning -1 for not included).
 *
 * @param {*} a Failure message (3 arguments) or the test value
 *     (2 arguments).
 * @param {*} b The test value (3 arguments) or the container
 *     (2 arguments).
 * @param {*=} opt_c The container.
 */
goog.testing.asserts.assertContains = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var contained = nonCommentArg(1, 2, arguments);
  var container = nonCommentArg(2, 2, arguments);
  _assert(
      commentArg(2, arguments),
      goog.testing.asserts.contains_(container, contained),
      'Expected \'' + container + '\' to contain \'' + contained + '\'');
};
/** @const */
var assertContains = goog.testing.asserts.assertContains;

/**
 * Checks if the test value is not included in the given container. The
 * container can be a string (where "included" means a substring), an array or
 * any `IArrayLike` (where "included" means a member), or any type implementing
 * `indexOf` with similar semantics (returning -1 for not included).
 * @param {*} a Failure message (3 arguments) or the contained element
 *     (2 arguments).
 * @param {*} b The contained element (3 arguments) or the container
 *     (2 arguments).
 * @param {*=} opt_c The container.
 */
goog.testing.asserts.assertNotContains = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var contained = nonCommentArg(1, 2, arguments);
  var container = nonCommentArg(2, 2, arguments);
  _assert(
      commentArg(2, arguments),
      !goog.testing.asserts.contains_(container, contained),
      'Expected \'' + container + '\' not to contain \'' + contained + '\'');
};
/** @const */
var assertNotContains = goog.testing.asserts.assertNotContains;


/**
 * Checks if the given string matches the given regular expression.
 * @param {*} a Failure message (3 arguments) or the expected regular
 *     expression as a string or RegExp (2 arguments).
 * @param {*} b The regular expression (3 arguments) or the string to test
 *     (2 arguments).
 * @param {*=} opt_c The string to test.
 */
goog.testing.asserts.assertRegExp = function(a, b, opt_c) {
  'use strict';
  _validateArguments(2, arguments);
  var regexp = nonCommentArg(1, 2, arguments);
  var string = nonCommentArg(2, 2, arguments);
  if (typeof(regexp) == 'string') {
    regexp = new RegExp(regexp);
  }
  _assert(
      commentArg(2, arguments), regexp.test(string),
      'Expected \'' + string + '\' to match RegExp ' + regexp.toString());
};
/** @const */
var assertRegExp = goog.testing.asserts.assertRegExp;


/**
 * Converts an array-like or iterable object to an array (clones it if it's
 * already an array).
 * @param {!Iterable|!IArrayLike} obj The collection object.
 * @return {!Array<?>} Copy of the collection as array.
 * @private
 */
goog.testing.asserts.toArray_ = function(obj) {
  'use strict';
  var ret = [];
  if (goog.testing.asserts.isIterable_(obj)) {
    var iterator =
        goog.testing.asserts.getIterator_(/** @type {!Iterable} */ (obj));

    // Cannot use for..of syntax here as ES6 syntax is not available in Closure.
    // See b/117231092
    while (true) {
      var result = iterator.next();
      if (result.done) {
        return ret;
      }
      ret.push(result.value);
    }
  }

  for (var i = 0; i < /** @type {!IArrayLike} */ (obj).length; i++) {
    ret[i] = obj[i];
  }
  return ret;
};

// TODO(nnaze): Consider moving isIterable_ and getIterator_ functionality
// into goog.iter.es6. See discussion in cl/217356297.

/**
 * @param {*} obj
 * @return {boolean} Whether the object is iterable (JS iterator protocol).
 * @private
 */
goog.testing.asserts.isIterable_ = function(obj) {
  'use strict';
  return !!(
      typeof Symbol !== 'undefined' && Symbol.iterator && obj[Symbol.iterator]);
};

/**
 * @param {!Iterable} iterable
 * @return {!Iterator} An iterator for obj.
 * @throws {!goog.testing.JsUnitException} If the given object is not iterable.
 * @private
 */
goog.testing.asserts.getIterator_ = function(iterable) {
  'use strict';
  if (!goog.testing.asserts.isIterable_(iterable)) {
    goog.testing.asserts.raiseException('parameter iterable is not iterable');
  }

  return iterable[Symbol.iterator]();
};


/**
 * Finds the position of the first occurrence of an element in a container.
 * @param {IArrayLike<?>|{indexOf: function(*): number}} container
 *     The array to find the element in.
 * @param {*} contained Element to find.
 * @return {number} Index of the first occurrence or -1 if not found.
 * @private
 */
goog.testing.asserts.indexOf_ = function(container, contained) {
  'use strict';
  if (typeof container.indexOf == 'function') {
    return /** @type {{indexOf: function(*): number}} */ (container).indexOf(
        contained);
  } else {
    // IE6/7 do not have indexOf so do a search.
    for (var i = 0; i < /** @type {!IArrayLike<?>} */ (container).length; i++) {
      if (container[i] === contained) {
        return i;
      }
    }
    return -1;
  }
};


/**
 * Tells whether the array contains the given element.
 * @param {IArrayLike<?>|{indexOf: function(*): number}} container The array to
 *     find the element in.
 * @param {*} contained Element to find.
 * @return {boolean} Whether the element is in the array.
 * @private
 */
goog.testing.asserts.contains_ = function(container, contained) {
  'use strict';
  // TODO(user): Can we check for container.contains as well?
  // That would give us support for most goog.structs (though weird results
  // with anything else with a contains method, like goog.math.Range). Falling
  // back with container.some would catch all iterables, too.
  return goog.testing.asserts.indexOf_(container, contained) != -1;
};

var standardizeHTML = function(html) {
  'use strict';
  var translator = document.createElement('div');

  goog.dom.safe.setInnerHtml(
      translator,
      goog.html.uncheckedconversions
          .safeHtmlFromStringKnownToSatisfyTypeContract(
              goog.string.Const.from('HTML is never attached to DOM'), html));

  // Trim whitespace from result (without relying on goog.string)
  return translator.innerHTML.replace(/^\s+|\s+$/g, '');
};


/**
 * Standardizes a CSS value for a given property by applying it to an element
 * and then reading it back.
 * @param {string} propertyName CSS property name.
 * @param {string} value CSS value.
 * @return {string} Normalized CSS value.
 */
var standardizeCSSValue = function(propertyName, value) {
  'use strict';
  var styleDeclaration = document.createElement('div').style;
  styleDeclaration[propertyName] = value;
  return styleDeclaration[propertyName];
};


/**
 * Raises a JsUnit exception with the given comment. If the exception is
 * unexpectedly caught during a unit test, it will be rethrown so that it is
 * seen by the test framework.
 * @param {string} comment A summary for the exception.
 * @param {string=} opt_message A description of the exception.
 */
goog.testing.asserts.raiseException = function(comment, opt_message) {
  'use strict';
  var e = new goog.testing.JsUnitException(comment, opt_message);

  var testCase = _getCurrentTestCase();
  if (testCase) {
    testCase.raiseAssertionException(e);
  } else {
    goog.global.console.error(
        'Failed to save thrown exception: no test case is installed.');
    throw e;
  }
};


/**
 * Helper function for assertObjectEquals.
 * @param {string} prop A property name.
 * @return {boolean} If the property name is an array index.
 * @private
 */
goog.testing.asserts.isArrayIndexProp_ = function(prop) {
  'use strict';
  return prop === '0' || /^[1-9][0-9]*$/.test(prop);
};

/** @define {boolean} */
goog.EXPORT_ASSERTIONS = goog.define('goog.EXPORT_ASSERTIONS', true);
/*
 * These symbols are both exported in the global namespace (for legacy
 * reasons) and as part of the goog.testing.asserts namespace. Although they
 * can be used globally in tests, these symbols are allowed to be imported for
 * cleaner typing.
 */
if (goog.EXPORT_ASSERTIONS) {
  goog.exportSymbol('fail', fail);
  goog.exportSymbol('assert', assert);
  goog.exportSymbol('assertThrows', assertThrows);
  goog.exportSymbol('assertNotThrows', assertNotThrows);
  goog.exportSymbol('assertThrowsJsUnitException', assertThrowsJsUnitException);
  goog.exportSymbol('assertRejects', assertRejects);
  goog.exportSymbol('assertTrue', assertTrue);
  goog.exportSymbol('assertFalse', assertFalse);
  goog.exportSymbol('assertEquals', assertEquals);
  goog.exportSymbol('assertNotEquals', assertNotEquals);
  goog.exportSymbol('assertNull', assertNull);
  goog.exportSymbol('assertNotNull', assertNotNull);
  goog.exportSymbol('assertUndefined', assertUndefined);
  goog.exportSymbol('assertNotUndefined', assertNotUndefined);
  goog.exportSymbol('assertNullOrUndefined', assertNullOrUndefined);
  goog.exportSymbol('assertNotNullNorUndefined', assertNotNullNorUndefined);
  goog.exportSymbol('assertNonEmptyString', assertNonEmptyString);
  goog.exportSymbol('assertNaN', assertNaN);
  goog.exportSymbol('assertNotNaN', assertNotNaN);
  goog.exportSymbol('assertObjectEquals', assertObjectEquals);
  goog.exportSymbol('assertObjectRoughlyEquals', assertObjectRoughlyEquals);
  goog.exportSymbol('assertObjectNotEquals', assertObjectNotEquals);
  goog.exportSymbol('assertArrayEquals', assertArrayEquals);
  goog.exportSymbol('assertElementsEquals', assertElementsEquals);
  goog.exportSymbol('assertElementsRoughlyEqual', assertElementsRoughlyEqual);
  goog.exportSymbol('assertSameElements', assertSameElements);
  goog.exportSymbol('assertEvaluatesToTrue', assertEvaluatesToTrue);
  goog.exportSymbol('assertEvaluatesToFalse', assertEvaluatesToFalse);
  goog.exportSymbol('assertHTMLEquals', assertHTMLEquals);
  goog.exportSymbol('assertHashEquals', assertHashEquals);
  goog.exportSymbol('assertRoughlyEquals', assertRoughlyEquals);
  goog.exportSymbol('assertContains', assertContains);
  goog.exportSymbol('assertNotContains', assertNotContains);
  goog.exportSymbol('assertRegExp', assertRegExp);
}
