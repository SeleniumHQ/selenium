/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package are given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will make the compiler treat <code>foo</code> as non-nullable. Similarly,
 * <code>goog.asserts.assertNumber(foo)</code> informs the compiler about the
 * type of <code>foo</code>. Where applicable, such assertions are preferable to
 * casts by jsdoc with <code>@type</code>.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo());
 * goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 * Additionally, note the compiler will consider the type to be "tightened" for
 * all statements <em>after</em> the assertion. For example:
 * <code>
 * const /** ?Object &#ast;/ value = foo();
 * goog.asserts.assert(value);
 * // "value" is of type {!Object} at this point.
 * </code>
 */

goog.module('goog.asserts');
goog.module.declareLegacyNamespace();

const DebugError = goog.require('goog.debug.Error');
const NodeType = goog.require('goog.dom.NodeType');
const utils = goog.require('goog.utils');


// NOTE: this needs to be exported directly and referenced via the exports
// object because unit tests stub it out.
/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
exports.ENABLE_ASSERTS = goog.define('goog.asserts.ENABLE_ASSERTS', goog.DEBUG);



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {DebugError}
 * @final
 */
function AssertionError(messagePattern, messageArgs) {
  DebugError.call(this, subs(messagePattern, messageArgs));

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
}
utils.inherits(AssertionError, DebugError);
exports.AssertionError = AssertionError;

/** @override @type {string} */
AssertionError.prototype.name = 'AssertionError';


/**
 * The default error handler.
 * @param {!AssertionError} e The exception to be handled.
 * @return {void}
 */
exports.DEFAULT_ERROR_HANDLER = function(e) {
  throw e;
};


/**
 * The handler responsible for throwing or logging assertion errors.
 * @type {function(!AssertionError)}
 */
let errorHandler_ = exports.DEFAULT_ERROR_HANDLER;


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} pattern The string containing the pattern.
 * @param {!Array<*>} subs The items to substitute into the pattern.
 * @return {string} A copy of `str` in which each occurrence of
 *     `%s` has been replaced an argument from `var_args`.
 */
function subs(pattern, subs) {
  const splitParts = pattern.split('%s');
  let returnString = '';

  // Replace up to the last split part. We are inserting in the
  // positions between split parts.
  const subLast = splitParts.length - 1;
  for (let i = 0; i < subLast; i++) {
    // keep unsupplied as '%s'
    const sub = (i < subs.length) ? subs[i] : '%s';
    returnString += splitParts[i] + sub;
  }
  return returnString + splitParts[subLast];
}


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {?Array<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {!Array<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {AssertionError} When the value is not a number.
 */
function doAssertFailure(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  let message = 'Assertion failed';
  let args;
  if (givenMessage) {
    message += ': ' + givenMessage;
    args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  const e = new AssertionError('' + message, args || []);
  errorHandler_(e);
}


/**
 * Sets a custom error handler that can be used to customize the behavior of
 * assertion failures, for example by turning all assertion failures into log
 * messages.
 * @param {function(!AssertionError)} errorHandler
 * @return {void}
 */
exports.setErrorHandler = function(errorHandler) {
  if (exports.ENABLE_ASSERTS) {
    errorHandler_ = errorHandler;
  }
};


/**
 * Checks if the condition evaluates to true if ENABLE_ASSERTS is
 * true.
 * @template T
 * @param {T} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {T} The value of the condition.
 * @throws {AssertionError} When the condition evaluates to false.
 * @closurePrimitive {asserts.truthy}
 */
exports.assert = function(condition, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && !condition) {
    doAssertFailure(
        '', null, opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Checks if `value` is `null` or `undefined` if goog.asserts.ENABLE_ASSERTS is
 * true.
 *
 * @param {T} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {R} `value` with its type narrowed to exclude `null` and `undefined`.
 *
 * @template T
 * @template R :=
 *     mapunion(T, (V) =>
 *         cond(eq(V, 'null'),
 *             none(),
 *             cond(eq(V, 'undefined'),
 *                 none(),
 *                 V)))
 *  =:
 *
 * @throws {!AssertionError} When `value` is `null` or `undefined`.
 * @closurePrimitive {asserts.matchesReturn}
 */
exports.assertExists = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && value == null) {
    doAssertFailure(
        'Expected to exist: %s.', [value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return value;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.asserts.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {void}
 * @throws {AssertionError} Failure.
 * @closurePrimitive {asserts.fail}
 */
exports.fail = function(opt_message, var_args) {
  if (exports.ENABLE_ASSERTS) {
    errorHandler_(new AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1)));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {AssertionError} When the value is not a number.
 * @closurePrimitive {asserts.matchesReturn}
 */
exports.assertNumber = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && typeof value !== 'number') {
    doAssertFailure(
        'Expected number but got %s: %s.', [utils.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {AssertionError} When the value is not a string.
 * @closurePrimitive {asserts.matchesReturn}
 */
exports.assertString = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && typeof value !== 'string') {
    doAssertFailure(
        'Expected string but got %s: %s.', [utils.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {AssertionError} When the value is not a function.
 * @closurePrimitive {asserts.matchesReturn}
 */
exports.assertFunction = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && typeof value !== 'function') {
    doAssertFailure(
        'Expected function but got %s: %s.', [utils.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {AssertionError} When the value is not an object.
 * @closurePrimitive {asserts.matchesReturn}
 */
exports.assertObject = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && !utils.isObject(value)) {
    doAssertFailure(
        'Expected object but got %s: %s.', [utils.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array<?>} The value, guaranteed to be a non-null array.
 * @throws {AssertionError} When the value is not an array.
 * @closurePrimitive {asserts.matchesReturn}
 */
exports.assertArray = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && !Array.isArray(value)) {
    doAssertFailure(
        'Expected array but got %s: %s.', [utils.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array<?>} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {AssertionError} When the value is not a boolean.
 * @closurePrimitive {asserts.matchesReturn}
 */
exports.assertBoolean = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && typeof value !== 'boolean') {
    doAssertFailure(
        'Expected boolean but got %s: %s.', [utils.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is a DOM Element if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Element} The value, likely to be a DOM Element when asserts are
 *     enabled.
 * @throws {AssertionError} When the value is not an Element.
 * @closurePrimitive {asserts.matchesReturn}
 * @deprecated Use goog.asserts.dom.assertIsElement instead.
 */
exports.assertElement = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS &&
      (!utils.isObject(value) ||
       /** @type {!Node} */ (value).nodeType != NodeType.ELEMENT)) {
    doAssertFailure(
        'Expected Element but got %s: %s.', [utils.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Element} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 *
 * The compiler may tighten the type returned by this function.
 *
 * Do not use this to ensure a value is an HTMLElement or a subclass! Cross-
 * document DOM inherits from separate - though identical - browser classes, and
 * such a check will unexpectedly fail. Please use the methods in
 * goog.asserts.dom for these purposes.
 *
 * @param {?} value The value to check.
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {AssertionError} When the value is not an instance of
 *     type.
 * @return {T}
 * @template T
 * @closurePrimitive {asserts.matchesReturn}
 */
exports.assertInstanceof = function(value, type, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS && !(value instanceof type)) {
    doAssertFailure(
        'Expected instanceof %s but got %s.', [getType(type), getType(value)],
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};


/**
 * Checks whether the value is a finite number, if ENABLE_ASSERTS
 * is true.
 *
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {AssertionError} When the value is not a number, or is
 *     a non-finite number such as NaN, Infinity or -Infinity.
 * @return {number} The value initially passed in.
 */
exports.assertFinite = function(value, opt_message, var_args) {
  if (exports.ENABLE_ASSERTS &&
      (typeof value != 'number' || !isFinite(value))) {
    doAssertFailure(
        'Expected %s to be a finite number but it is not.', [value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};

/**
 * Returns the type of a value. If a constructor is passed, and a suitable
 * string cannot be found, 'unknown type name' will be returned.
 * @param {*} value A constructor, object, or primitive.
 * @return {string} The best display name for the value, or 'unknown type name'.
 */
function getType(value) {
  if (value instanceof Function) {
    return value.displayName || value.name || 'unknown type name';
  } else if (value instanceof Object) {
    return /** @type {string} */ (value.constructor.displayName) ||
        value.constructor.name || Object.prototype.toString.call(value);
  } else {
    return value === null ? 'null' : typeof value;
  }
}
