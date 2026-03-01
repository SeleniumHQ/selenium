/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The SafeScript type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.module('goog.html.SafeScript');
goog.module.declareLegacyNamespace();

const Const = goog.require('goog.string.Const');
const TypedString = goog.require('goog.string.TypedString');
const trustedtypes = goog.require('goog.html.trustedtypes');
const {fail} = goog.require('goog.asserts');
const utils = goog.require('goog.utils');

/**
 * Token used to ensure that object is created only from this file. No code
 * outside of this file can access this token.
 * @const {!Object}
 */
const CONSTRUCTOR_TOKEN_PRIVATE = {};

/**
 * A string-like object which represents JavaScript code and that carries the
 * security type contract that its value, as a string, will not cause execution
 * of unconstrained attacker controlled code (XSS) when evaluated as JavaScript
 * in a browser.
 *
 * Instances of this type must be created via the factory method
 * `SafeScript.fromConstant` and not by invoking its constructor. The
 * constructor intentionally takes an extra parameter that cannot be constructed
 * outside of this file and the type is immutable; hence only a default instance
 * corresponding to the empty string can be obtained via constructor invocation.
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
 * `&lt;` is dangerous, even when inside JavaScript strings, and so should
 * always be forbidden or JavaScript escaped in user controlled input. For
 * example, if `&lt;/script&gt;&lt;script&gt;evil&lt;/script&gt;"` were
 * interpolated inside a JavaScript string, it would break out of the context
 * of the original script element and `evil` would execute. Also note
 * that within an HTML script (raw text) element, HTML character references,
 * such as "&lt;" are not allowed. See
 * http://www.w3.org/TR/html5/scripting-1.html#restrictions-for-contents-of-script-elements.
 * Creating SafeScript objects HAS SIDE-EFFECTS due to calling Trusted Types Web
 * API.
 *
 * @see SafeScript#fromConstant
 * @final
 * @implements {TypedString}
 */
class SafeScript {
  /**
   * @param {!TrustedScript|string} value
   * @param {!Object} token package-internal implementation detail.
   */
  constructor(value, token) {
    if (goog.DEBUG && token !== CONSTRUCTOR_TOKEN_PRIVATE) {
      throw Error('SafeScript is not meant to be built directly');
    }

    /**
     * The contained value of this SafeScript.  The field has a purposely ugly
     * name to make (non-compiled) code that attempts to directly access this
     * field stand out.
     * @const
     * @private {!TrustedScript|string}
     */
    this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = value;

    /**
     * @override
     * @const
     */
    this.implementsGoogStringTypedString = true;
  }

  /**
   * Returns a string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeScript, use
   * `SafeScript.unwrap`.
   *
   * @return {string}
   * @see SafeScript#unwrap
   * @override
   */
  toString() {
    return this.privateDoNotAccessOrElseSafeScriptWrappedValue_.toString();
  }

  /**
   * Creates a SafeScript object from a compile-time constant string.
   *
   * @param {!Const} script A compile-time-constant string from which to create
   *     a SafeScript.
   * @return {!SafeScript} A SafeScript object initialized to `script`.
   */
  static fromConstant(script) {
    const scriptString = Const.unwrap(script);
    if (scriptString.length === 0) {
      return SafeScript.EMPTY;
    }
    return SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(
        scriptString);
  }

  /**
   * Creates a SafeScript JSON representation from anything that could be passed
   * to JSON.stringify.
   * @param {*} val
   * @return {!SafeScript}
   */
  static fromJson(val) {
    return SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(
        SafeScript.stringify_(val));
  }

  /**
   * Returns this SafeScript's value as a string.
   *
   * IMPORTANT: In code where it is security relevant that an object's type is
   * indeed `SafeScript`, use `SafeScript.unwrap` instead of
   * this method. If in doubt, assume that it's security relevant. In
   * particular, note that goog.html functions which return a goog.html type do
   * not guarantee the returned instance is of the right type. For example:
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
   * @see SafeScript#unwrap
   * @override
   */
  getTypedStringValue() {
    return this.privateDoNotAccessOrElseSafeScriptWrappedValue_.toString();
  }

  /**
   * Performs a runtime check that the provided object is indeed a
   * SafeScript object, and returns its value.
   *
   * @param {!SafeScript} safeScript The object to extract from.
   * @return {string} The safeScript object's contained string, unless
   *     the run-time type check fails. In that case, `unwrap` returns an
   *     innocuous string, or, if assertions are enabled, throws
   *     `asserts.AssertionError`.
   */
  static unwrap(safeScript) {
    return SafeScript.unwrapTrustedScript(safeScript).toString();
  }

  /**
   * Unwraps value as TrustedScript if supported or as a string if not.
   * @param {!SafeScript} safeScript
   * @return {!TrustedScript|string}
   * @see SafeScript.unwrap
   */
  static unwrapTrustedScript(safeScript) {
    // Perform additional Run-time type-checking to ensure that
    // safeScript is indeed an instance of the expected type.  This
    // provides some additional protection against security bugs due to
    // application code that disables type checks.
    // Specifically, the following checks are performed:
    // 1. The object is an instance of the expected type.
    // 2. The object is not an instance of a subclass.
    if (safeScript instanceof SafeScript &&
        safeScript.constructor === SafeScript) {
      return safeScript.privateDoNotAccessOrElseSafeScriptWrappedValue_;
    } else {
      fail(
          'expected object of type SafeScript, got \'' + safeScript +
          '\' of type ' + utils.typeOf(safeScript));
      return 'type_error:SafeScript';
    }
  }

  /**
   * Converts the given value to an embeddable JSON string and returns it. The
   * resulting string can be embedded in HTML because the '<' character is
   * encoded.
   *
   * @param {*} val
   * @return {string}
   * @private
   */
  static stringify_(val) {
    const json = JSON.stringify(val);
    return json.replace(/</g, '\\x3c');
  }

  /**
   * Package-internal utility method to create SafeScript instances.
   *
   * @param {string} script The string to initialize the SafeScript object with.
   * @return {!SafeScript} The initialized SafeScript object.
   * @package
   */
  static createSafeScriptSecurityPrivateDoNotAccessOrElse(script) {
    /** @noinline */
    const noinlineScript = script;
    const policy = trustedtypes.getPolicyPrivateDoNotAccessOrElse();
    const trustedScript =
        policy ? policy.createScript(noinlineScript) : noinlineScript;
    return new SafeScript(trustedScript, CONSTRUCTOR_TOKEN_PRIVATE);
  }
}

/**
 * A SafeScript instance corresponding to the empty string.
 * @const {!SafeScript}
 */
SafeScript.EMPTY = /** @type {!SafeScript} */ ({
  // NOTE: this compiles to nothing, but hides the possible side effect of
  // SafeScript creation (due to calling trustedTypes.createPolicy) from the
  // compiler so that the entire call can be removed if the result is not used.
  valueOf: function() {
    return SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse('');
  },
}.valueOf());


exports = SafeScript;
