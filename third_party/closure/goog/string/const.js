/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.string.Const');

goog.require('goog.asserts');
goog.require('goog.string.TypedString');



/**
 * Wrapper for compile-time-constant strings.
 *
 * Const is a wrapper for strings that can only be created from program
 * constants (i.e., string literals).  This property relies on a custom Closure
 * compiler check that `goog.string.Const.from` is only invoked on
 * compile-time-constant expressions.
 *
 * Const is useful in APIs whose correct and secure use requires that certain
 * arguments are not attacker controlled: Compile-time constants are inherently
 * under the control of the application and not under control of external
 * attackers, and hence are safe to use in such contexts.
 *
 * Instances of this type must be created via its factory method
 * `goog.string.Const.from` and not by invoking its constructor.  The
 * constructor intentionally takes no parameters and the type is immutable;
 * hence only a default instance corresponding to the empty string can be
 * obtained via constructor invocation.  Use goog.string.Const.EMPTY
 * instead of using this constructor to get an empty Const string.
 *
 * @see goog.string.Const#from
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 * @param {Object=} opt_token package-internal implementation detail.
 * @param {string=} opt_content package-internal implementation detail.
 */
goog.string.Const = function(opt_token, opt_content) {
  'use strict';
  /**
   * The wrapped value of this Const object.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ =
      ((opt_token ===
        goog.string.Const.GOOG_STRING_CONSTRUCTOR_TOKEN_PRIVATE_) &&
       opt_content) ||
      '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.string.Const#unwrap
   * @const {!Object}
   * @private
   */
  this.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ =
      goog.string.Const.TYPE_MARKER_;
};


/**
 * @override
 * @const
 */
goog.string.Const.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this Const's value as a string.
 *
 * IMPORTANT: In code where it is security-relevant that an object's type is
 * indeed `goog.string.Const`, use `goog.string.Const.unwrap`
 * instead of this method.
 *
 * @see goog.string.Const#unwrap
 * @override
 * @return {string}
 */
goog.string.Const.prototype.getTypedStringValue = function() {
  'use strict';
  return this.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug-string representation of this value.
   *
   * To obtain the actual string value wrapped inside an object of this type,
   * use `goog.string.Const.unwrap`.
   *
   * @see goog.string.Const#unwrap
   * @override
   * @return {string}
   */
  goog.string.Const.prototype.toString = function() {
    'use strict';
    return 'Const{' +
        this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ +
        '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed an instance
 * of `goog.string.Const`, and returns its value.
 * @param {!goog.string.Const} stringConst The object to extract from.
 * @return {string} The Const object's contained string, unless the run-time
 *     type check fails. In that case, `unwrap` returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     `goog.asserts.AssertionError`.
 */
goog.string.Const.unwrap = function(stringConst) {
  'use strict';
  // Perform additional run-time type-checking to ensure that stringConst is
  // indeed an instance of the expected type.  This provides some additional
  // protection against security bugs due to application code that disables type
  // checks.
  if (stringConst instanceof goog.string.Const &&
      stringConst.constructor === goog.string.Const &&
      stringConst.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ ===
          goog.string.Const.TYPE_MARKER_) {
    return stringConst
        .stringConstValueWithSecurityContract__googStringSecurityPrivate_;
  } else {
    goog.asserts.fail(
        'expected object of type Const, got \'' + stringConst + '\'');
    return 'type_error:Const';
  }
};


/**
 * Creates a Const object from a compile-time constant string.
 *
 * It is illegal to invoke this function on an expression whose
 * compile-time-constant value cannot be determined by the Closure compiler.
 *
 * Correct invocations include,
 * <pre>
 *   var s = goog.string.Const.from('hello');
 *   var t = goog.string.Const.from('hello' + 'world');
 * </pre>
 *
 * In contrast, the following are illegal:
 * <pre>
 *   var s = goog.string.Const.from(getHello());
 *   var t = goog.string.Const.from('hello' + world);
 * </pre>
 *
 * @param {string} s A constant string from which to create a Const.
 * @return {!goog.string.Const} A Const object initialized to stringConst.
 */
goog.string.Const.from = function(s) {
  'use strict';
  return new goog.string.Const(
      goog.string.Const.GOOG_STRING_CONSTRUCTOR_TOKEN_PRIVATE_, s);
};

/**
 * Type marker for the Const type, used to implement additional run-time
 * type checking.
 * @const {!Object}
 * @private
 */
goog.string.Const.TYPE_MARKER_ = {};

/**
 * @type {!Object}
 * @private
 * @const
 */
goog.string.Const.GOOG_STRING_CONSTRUCTOR_TOKEN_PRIVATE_ = {};

/**
 * A Const instance wrapping the empty string.
 * @const {!goog.string.Const}
 */
goog.string.Const.EMPTY = goog.string.Const.from('');
