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
 * @fileoverview The SafeScript type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeScript');

goog.require('goog.asserts');
goog.require('goog.html.trustedtypes');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string-like object which represents JavaScript code and that carries the
 * security type contract that its value, as a string, will not cause execution
 * of unconstrained attacker controlled code (XSS) when evaluated as JavaScript
 * in a browser.
 *
 * Instances of this type must be created via the factory method
 * `goog.html.SafeScript.fromConstant` and not by invoking its
 * constructor. The constructor intentionally takes no parameters and the type
 * is immutable; hence only a default instance corresponding to the empty string
 * can be obtained via constructor invocation.
 *
 * A SafeScript's string representation can safely be interpolated as the
 * content of a script element within HTML. The SafeScript string should not be
 * escaped before interpolation.
 *
 * Note that the SafeScript might contain text that is attacker-controlled but
 * that text should have been interpolated with appropriate escaping,
 * sanitization and/or validation into the right location in the script, such
 * that it is highly constrained in its effect (for example, it had to match a
 * set of whitelisted words).
 *
 * A SafeScript can be constructed via security-reviewed unchecked
 * conversions. In this case producers of SafeScript must ensure themselves that
 * the SafeScript does not contain unsafe script. Note in particular that
 * {@code &lt;} is dangerous, even when inside JavaScript strings, and so should
 * always be forbidden or JavaScript escaped in user controlled input. For
 * example, if {@code &lt;/script&gt;&lt;script&gt;evil&lt;/script&gt;"} were
 * interpolated inside a JavaScript string, it would break out of the context
 * of the original script element and `evil` would execute. Also note
 * that within an HTML script (raw text) element, HTML character references,
 * such as "&lt;" are not allowed. See
 * http://www.w3.org/TR/html5/scripting-1.html#restrictions-for-contents-of-script-elements.
 *
 * @see goog.html.SafeScript#fromConstant
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.html.SafeScript = function() {
  /**
   * The contained value of this SafeScript.  The field has a purposely
   * ugly name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {!TrustedScript|string}
   */
  this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeScript#unwrap
   * @const {!Object}
   * @private
   */
  this.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * @override
 * @const
 */
goog.html.SafeScript.prototype.implementsGoogStringTypedString = true;


/**
 * Type marker for the SafeScript type, used to implement additional
 * run-time type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Creates a SafeScript object from a compile-time constant string.
 *
 * @param {!goog.string.Const} script A compile-time-constant string from which
 *     to create a SafeScript.
 * @return {!goog.html.SafeScript} A SafeScript object initialized to
 *     `script`.
 */
goog.html.SafeScript.fromConstant = function(script) {
  var scriptString = goog.string.Const.unwrap(script);
  if (scriptString.length === 0) {
    return goog.html.SafeScript.EMPTY;
  }
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(
      scriptString);
};


/**
 * Creates a SafeScript from a compile-time constant string but with arguments
 * that can vary at run-time. The code argument should be formatted as an
 * inline function (see example below). The arguments will be JSON-encoded and
 * provided as input to the function specified in code.
 *
 * Example Usage:
 *
 *     let safeScript = SafeScript.fromConstantAndArgs(
 *         Const.from('function(arg1, arg2) { doSomething(arg1, arg2); }'),
 *         arg1,
 *         arg2);
 *
 * This produces a SafeScript equivalent to the following:
 *
 *     (function(arg1, arg2) { doSomething(arg1, arg2); })("value1", "value2");
 *
 * @param {!goog.string.Const} code
 * @param {...*} var_args
 * @return {!goog.html.SafeScript}
 */
goog.html.SafeScript.fromConstantAndArgs = function(code, var_args) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push(goog.html.SafeScript.stringify_(arguments[i]));
  }
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(
      '(' + goog.string.Const.unwrap(code) + ')(' + args.join(', ') + ');');
};


/**
 * Creates a SafeScript JSON representation from anything that could be passed
 * to JSON.stringify.
 * @param {*} val
 * @return {!goog.html.SafeScript}
 */
goog.html.SafeScript.fromJson = function(val) {
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(
      goog.html.SafeScript.stringify_(val));
};


/**
 * Returns this SafeScript's value as a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed `SafeScript`, use `goog.html.SafeScript.unwrap` instead of
 * this method. If in doubt, assume that it's security relevant. In particular,
 * note that goog.html functions which return a goog.html type do not guarantee
 * the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml
 * // instanceof goog.html.SafeHtml.
 * </pre>
 *
 * @see goog.html.SafeScript#unwrap
 * @override
 */
goog.html.SafeScript.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeScriptWrappedValue_.toString();
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeScript, use
   * `goog.html.SafeScript.unwrap`.
   *
   * @see goog.html.SafeScript#unwrap
   * @override
   */
  goog.html.SafeScript.prototype.toString = function() {
    return 'SafeScript{' +
        this.privateDoNotAccessOrElseSafeScriptWrappedValue_ + '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a
 * SafeScript object, and returns its value.
 *
 * @param {!goog.html.SafeScript} safeScript The object to extract from.
 * @return {string} The safeScript object's contained string, unless
 *     the run-time type check fails. In that case, `unwrap` returns an
 *     innocuous string, or, if assertions are enabled, throws
 *     `goog.asserts.AssertionError`.
 */
goog.html.SafeScript.unwrap = function(safeScript) {
  return goog.html.SafeScript.unwrapTrustedScript(safeScript).toString();
};


/**
 * Unwraps value as TrustedScript if supported or as a string if not.
 * @param {!goog.html.SafeScript} safeScript
 * @return {!TrustedScript|string}
 * @see goog.html.SafeScript.unwrap
 */
goog.html.SafeScript.unwrapTrustedScript = function(safeScript) {
  // Perform additional Run-time type-checking to ensure that
  // safeScript is indeed an instance of the expected type.  This
  // provides some additional protection against security bugs due to
  // application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeScript instanceof goog.html.SafeScript &&
      safeScript.constructor === goog.html.SafeScript &&
      safeScript.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeScript.privateDoNotAccessOrElseSafeScriptWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type SafeScript, got \'' +
        safeScript + '\' of type ' + goog.typeOf(safeScript));
    return 'type_error:SafeScript';
  }
};


/**
 * Converts the given value to a embeddabel JSON string and returns it. The
 * resulting string can be embedded in HTML because the '<' character is
 * encoded.
 *
 * @param {*} val
 * @return {string}
 * @private
 */
goog.html.SafeScript.stringify_ = function(val) {
  var json = JSON.stringify(val);
  return json.replace(/</g, '\\x3c');
};

/**
 * Package-internal utility method to create SafeScript instances.
 *
 * @param {string} script The string to initialize the SafeScript object with.
 * @return {!goog.html.SafeScript} The initialized SafeScript object.
 * @package
 */
goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse =
    function(script) {
  return new goog.html.SafeScript().initSecurityPrivateDoNotAccessOrElse_(
      script);
};


/**
 * Called from createSafeScriptSecurityPrivateDoNotAccessOrElse(). This
 * method exists only so that the compiler can dead code eliminate static
 * fields (like EMPTY) when they're not accessed.
 * @param {string} script
 * @return {!goog.html.SafeScript}
 * @private
 */
goog.html.SafeScript.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(
    script) {
  this.privateDoNotAccessOrElseSafeScriptWrappedValue_ =
      goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY ?
      goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY.createScript(
          script) :
      script;
  return this;
};


/**
 * A SafeScript instance corresponding to the empty string.
 * @const {!goog.html.SafeScript}
 */
goog.html.SafeScript.EMPTY =
    goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse('');
