// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.string.Const');

goog.require('goog.asserts');
goog.require('goog.string.TypedString');



/**
 * Wrapper for compile-time-constant strings.
 *
 * Const is a wrapper for strings that can only be created from program
 * constants (i.e., string literals).  This property relies on a custom Closure
 * compiler check that {@code goog.string.Const.from} is only invoked on
 * compile-time-constant expressions.
 *
 * Const is useful in APIs whose correct and secure use requires that certain
 * arguments are not attacker controlled: Compile-time constants are inherently
 * under the control of the application and not under control of external
 * attackers, and hence are safe to use in such contexts.
 *
 * Instances of this type must be created via its factory method
 * {@code goog.string.Const.from} and not by invoking its constructor.  The
 * constructor intentionally takes no parameters and the type is immutable;
 * hence only a default instance corresponding to the empty string can be
 * obtained via constructor invocation.
 *
 * @see goog.string.Const#from
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.string.Const = function() {
  /**
   * The wrapped value of this Const object.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.string.Const#unwrap
   * @const
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
 * Returns this Const's value a string.
 *
 * IMPORTANT: In code where it is security-relevant that an object's type is
 * indeed {@code goog.string.Const}, use {@code goog.string.Const.unwrap}
 * instead of this method.
 *
 * @see goog.string.Const#unwrap
 * @override
 */
goog.string.Const.prototype.getTypedStringValue = function() {
  return this.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
};


/**
 * Returns a debug-string representation of this value.
 *
 * To obtain the actual string value wrapped inside an object of this type,
 * use {@code goog.string.Const.unwrap}.
 *
 * @see goog.string.Const#unwrap
 * @override
 */
goog.string.Const.prototype.toString = function() {
  return 'Const{' +
         this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ +
         '}';
};


/**
 * Performs a runtime check that the provided object is indeed an instance
 * of {@code goog.string.Const}, and returns its value.
 * @param {!goog.string.Const} stringConst The object to extract from.
 * @return {string} The Const object's contained string, unless the run-time
 *     type check fails. In that case, {@code unwrap} returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.string.Const.unwrap = function(stringConst) {
  // Perform additional run-time type-checking to ensure that stringConst is
  // indeed an instance of the expected type.  This provides some additional
  // protection against security bugs due to application code that disables type
  // checks.
  if (stringConst instanceof goog.string.Const &&
      stringConst.constructor === goog.string.Const &&
      stringConst.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ ===
          goog.string.Const.TYPE_MARKER_) {
    return stringConst.
        stringConstValueWithSecurityContract__googStringSecurityPrivate_;
  } else {
    goog.asserts.fail('expected object of type Const, got \'' +
                      stringConst + '\'');
    return 'type_error:Const';
  }
};


/**
 * Creates a Const object from a compile-time constant string.
 *
 * It is illegal to invoke this function on an expression whose
 * compile-time-contant value cannot be determined by the Closure compiler.
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
 * TODO(user): Compile-time checks that this function is only called
 * with compile-time constant expressions.
 *
 * @param {string} s A constant string from which to create a Const.
 * @return {!goog.string.Const} A Const object initialized to stringConst.
 */
goog.string.Const.from = function(s) {
  return goog.string.Const.create__googStringSecurityPrivate_(s);
};


/**
 * Type marker for the Const type, used to implement additional run-time
 * type checking.
 * @const
 * @private
 */
goog.string.Const.TYPE_MARKER_ = {};


/**
 * Utility method to create Const instances.
 * @param {string} s The string to initialize the Const object with.
 * @return {!goog.string.Const} The initialized Const object.
 * @private
 */
goog.string.Const.create__googStringSecurityPrivate_ = function(s) {
  var stringConst = new goog.string.Const();
  stringConst.stringConstValueWithSecurityContract__googStringSecurityPrivate_ =
      s;
  return stringConst;
};
