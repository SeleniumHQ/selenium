/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The SafeStyleSheet type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.module('goog.html.SafeStyleSheet');
goog.module.declareLegacyNamespace();

const Const = goog.require('goog.string.Const');
const SafeStyle = goog.require('goog.html.SafeStyle');
const TypedString = goog.require('goog.string.TypedString');
const googObject = goog.require('goog.object');
const {assert, fail} = goog.require('goog.asserts');
const {contains} = goog.require('goog.string.internal');
const utils = goog.require('goog.utils');

/**
 * Token used to ensure that object is created only from this file. No code
 * outside of this file can access this token.
 * @const {!Object}
 */
const CONSTRUCTOR_TOKEN_PRIVATE = {};

/**
 * A string-like object which represents a CSS style sheet and that carries the
 * security type contract that its value, as a string, will not cause untrusted
 * script execution (XSS) when evaluated as CSS in a browser.
 *
 * Instances of this type must be created via the factory method
 * `SafeStyleSheet.fromConstant` and not by invoking its constructor. The
 * constructor intentionally takes an extra parameter that cannot be constructed
 * outside of this file and the type is immutable; hence only a default instance
 * corresponding to the empty string can be obtained via constructor invocation.
 *
 * A SafeStyleSheet's string representation can safely be interpolated as the
 * content of a style element within HTML. The SafeStyleSheet string should
 * not be escaped before interpolation.
 *
 * Values of this type must be composable, i.e. for any two values
 * `styleSheet1` and `styleSheet2` of this type,
 * `SafeStyleSheet.unwrap(styleSheet1) + SafeStyleSheet.unwrap(styleSheet2)`
 * must itself be a value that satisfies the SafeStyleSheet type constraint.
 * This requirement implies that for any value `styleSheet` of this type,
 * `SafeStyleSheet.unwrap(styleSheet1)` must end in
 * "beginning of rule" context.
 *
 * A SafeStyleSheet can be constructed via security-reviewed unchecked
 * conversions. In this case producers of SafeStyleSheet must ensure themselves
 * that the SafeStyleSheet does not contain unsafe script. Note in particular
 * that `&lt;` is dangerous, even when inside CSS strings, and so should
 * always be forbidden or CSS-escaped in user controlled input. For example, if
 * `&lt;/style&gt;&lt;script&gt;evil&lt;/script&gt;"` were interpolated
 * inside a CSS string, it would break out of the context of the original
 * style element and `evil` would execute. Also note that within an HTML
 * style (raw text) element, HTML character references, such as
 * `&amp;lt;`, are not allowed. See
 * http://www.w3.org/TR/html5/scripting-1.html#restrictions-for-contents-of-script-elements
 * (similar considerations apply to the style element).
 *
 * @see SafeStyleSheet#fromConstant
 * @final
 * @implements {TypedString}
 */
class SafeStyleSheet {
  /**
   * @param {string} value
   * @param {!Object} token package-internal implementation detail.
   */
  constructor(value, token) {
    if (goog.DEBUG && token !== CONSTRUCTOR_TOKEN_PRIVATE) {
      throw Error('SafeStyleSheet is not meant to be built directly');
    }

    /**
     * The contained value of this SafeStyleSheet.  The field has a purposely
     * ugly name to make (non-compiled) code that attempts to directly access
     * this field stand out.
     * @const
     * @private {string}
     */
    this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = value;

    /**
     * @override
     * @const
     */
    this.implementsGoogStringTypedString = true;
  }

  /**
   * Returns a string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeStyleSheet, use
   * `SafeStyleSheet.unwrap`.
   *
   * @return {string}
   * @see SafeStyleSheet#unwrap
   * @override
   */
  toString() {
    return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_.toString();
  }

  /**
   * Creates a style sheet consisting of one selector and one style definition.
   * Use {@link SafeStyleSheet.concat} to create longer style sheets.
   * This function doesn't support @import, @media and similar constructs.
   * @param {string} selector CSS selector, e.g. '#id' or 'tag .class, #id'. We
   *     support CSS3 selectors: https://w3.org/TR/css3-selectors/#selectors.
   * @param {!SafeStyle.PropertyMap|!SafeStyle} style Style
   *     definition associated with the selector.
   * @return {!SafeStyleSheet}
   * @throws {!Error} If invalid selector is provided.
   */
  static createRule(selector, style) {
    if (contains(selector, '<')) {
      throw new Error(`Selector does not allow '<', got: ${selector}`);
    }

    // Remove strings.
    const selectorToCheck =
        selector.replace(/('|")((?!\1)[^\r\n\f\\]|\\[\s\S])*\1/g, '');

    // Check characters allowed in CSS3 selectors.
    if (!/^[-_a-zA-Z0-9#.:* ,>+~[\]()=\\^$|]+$/.test(selectorToCheck)) {
      throw new Error(
          'Selector allows only [-_a-zA-Z0-9#.:* ,>+~[\\]()=\\^$|] and ' +
          'strings, got: ' + selector);
    }

    // Check balanced () and [].
    if (!SafeStyleSheet.hasBalancedBrackets_(selectorToCheck)) {
      throw new Error(
          '() and [] in selector must be balanced, got: ' + selector);
    }

    if (!(style instanceof SafeStyle)) {
      style = SafeStyle.create(style);
    }
    const styleSheet =
        `${selector}{` + SafeStyle.unwrap(style).replace(/</g, '\\3C ') + '}';
    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(
        styleSheet);
  }

  /**
   * Checks if a string has balanced () and [] brackets.
   * @param {string} s String to check.
   * @return {boolean}
   * @private
   */
  static hasBalancedBrackets_(s) {
    const brackets = {'(': ')', '[': ']'};
    const expectedBrackets = [];
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (brackets[ch]) {
        expectedBrackets.push(brackets[ch]);
      } else if (googObject.contains(brackets, ch)) {
        if (expectedBrackets.pop() != ch) {
          return false;
        }
      }
    }
    return expectedBrackets.length == 0;
  }

  /**
   * Creates a new SafeStyleSheet object by concatenating values.
   * @param {...(!SafeStyleSheet|!Array<!SafeStyleSheet>)}
   *     var_args Values to concatenate.
   * @return {!SafeStyleSheet}
   */
  static concat(var_args) {
    let result = '';

    /**
     * @param {!SafeStyleSheet|!Array<!SafeStyleSheet>}
     *     argument
     */
    const addArgument = argument => {
      if (Array.isArray(argument)) {
        argument.forEach(addArgument);
      } else {
        result += SafeStyleSheet.unwrap(argument);
      }
    };

    Array.prototype.forEach.call(arguments, addArgument);
    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(
        result);
  }

  /**
   * Creates a SafeStyleSheet object from a compile-time constant string.
   *
   * `styleSheet` must not have any &lt; characters in it, so that
   * the syntactic structure of the surrounding HTML is not affected.
   *
   * @param {!Const} styleSheet A compile-time-constant string from
   *     which to create a SafeStyleSheet.
   * @return {!SafeStyleSheet} A SafeStyleSheet object initialized to
   *     `styleSheet`.
   */
  static fromConstant(styleSheet) {
    const styleSheetString = Const.unwrap(styleSheet);
    if (styleSheetString.length === 0) {
      return SafeStyleSheet.EMPTY;
    }
    // > is a valid character in CSS selectors and there's no strict need to
    // block it if we already block <.
    assert(
        !contains(styleSheetString, '<'),
        `Forbidden '<' character in style sheet string: ${styleSheetString}`);
    return SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(
        styleSheetString);
  }

  /**
   * Returns this SafeStyleSheet's value as a string.
   *
   * IMPORTANT: In code where it is security relevant that an object's type is
   * indeed `SafeStyleSheet`, use `SafeStyleSheet.unwrap`
   * instead of this method. If in doubt, assume that it's security relevant. In
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
   * @see SafeStyleSheet#unwrap
   * @override
   */
  getTypedStringValue() {
    return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
  }

  /**
   * Performs a runtime check that the provided object is indeed a
   * SafeStyleSheet object, and returns its value.
   *
   * @param {!SafeStyleSheet} safeStyleSheet The object to extract from.
   * @return {string} The safeStyleSheet object's contained string, unless
   *     the run-time type check fails. In that case, `unwrap` returns an
   *     innocuous string, or, if assertions are enabled, throws
   *     `asserts.AssertionError`.
   */
  static unwrap(safeStyleSheet) {
    // Perform additional Run-time type-checking to ensure that
    // safeStyleSheet is indeed an instance of the expected type.  This
    // provides some additional protection against security bugs due to
    // application code that disables type checks.
    // Specifically, the following checks are performed:
    // 1. The object is an instance of the expected type.
    // 2. The object is not an instance of a subclass.
    if (safeStyleSheet instanceof SafeStyleSheet &&
        safeStyleSheet.constructor === SafeStyleSheet) {
      return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
    } else {
      fail(
          'expected object of type SafeStyleSheet, got \'' + safeStyleSheet +
          '\' of type ' + utils.typeOf(safeStyleSheet));
      return 'type_error:SafeStyleSheet';
    }
  }

  /**
   * Package-internal utility method to create SafeStyleSheet instances.
   *
   * @param {string} styleSheet The string to initialize the SafeStyleSheet
   *     object with.
   * @return {!SafeStyleSheet} The initialized SafeStyleSheet object.
   * @package
   */
  static createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet) {
    return new SafeStyleSheet(styleSheet, CONSTRUCTOR_TOKEN_PRIVATE);
  }
}

/**
 * A SafeStyleSheet instance corresponding to the empty string.
 * @const {!SafeStyleSheet}
 */
SafeStyleSheet.EMPTY =
    SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse('');


exports = SafeStyleSheet;
