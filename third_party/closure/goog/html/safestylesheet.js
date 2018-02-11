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
 * @fileoverview The SafeStyleSheet type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeStyleSheet');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string-like object which represents a CSS style sheet and that carries the
 * security type contract that its value, as a string, will not cause untrusted
 * script execution (XSS) when evaluated as CSS in a browser.
 *
 * Instances of this type must be created via the factory method
 * {@code goog.html.SafeStyleSheet.fromConstant} and not by invoking its
 * constructor. The constructor intentionally takes no parameters and the type
 * is immutable; hence only a default instance corresponding to the empty string
 * can be obtained via constructor invocation.
 *
 * A SafeStyleSheet's string representation can safely be interpolated as the
 * content of a style element within HTML. The SafeStyleSheet string should
 * not be escaped before interpolation.
 *
 * Values of this type must be composable, i.e. for any two values
 * {@code styleSheet1} and {@code styleSheet2} of this type,
 * {@code goog.html.SafeStyleSheet.unwrap(styleSheet1) +
 * goog.html.SafeStyleSheet.unwrap(styleSheet2)} must itself be a value that
 * satisfies the SafeStyleSheet type constraint. This requirement implies that
 * for any value {@code styleSheet} of this type,
 * {@code goog.html.SafeStyleSheet.unwrap(styleSheet1)} must end in
 * "beginning of rule" context.

 * A SafeStyleSheet can be constructed via security-reviewed unchecked
 * conversions. In this case producers of SafeStyleSheet must ensure themselves
 * that the SafeStyleSheet does not contain unsafe script. Note in particular
 * that {@code &lt;} is dangerous, even when inside CSS strings, and so should
 * always be forbidden or CSS-escaped in user controlled input. For example, if
 * {@code &lt;/style&gt;&lt;script&gt;evil&lt;/script&gt;"} were interpolated
 * inside a CSS string, it would break out of the context of the original
 * style element and {@code evil} would execute. Also note that within an HTML
 * style (raw text) element, HTML character references, such as
 * {@code &amp;lt;}, are not allowed. See
 *
 http://www.w3.org/TR/html5/scripting-1.html#restrictions-for-contents-of-script-elements
 * (similar considerations apply to the style element).
 *
 * @see goog.html.SafeStyleSheet#fromConstant
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.html.SafeStyleSheet = function() {
  /**
   * The contained value of this SafeStyleSheet.  The field has a purposely
   * ugly name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeStyleSheet#unwrap
   * @const {!Object}
   * @private
   */
  this.SAFE_STYLE_SHEET_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * @override
 * @const
 */
goog.html.SafeStyleSheet.prototype.implementsGoogStringTypedString = true;


/**
 * Type marker for the SafeStyleSheet type, used to implement additional
 * run-time type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Creates a new SafeStyleSheet object by concatenating values.
 * @param {...(!goog.html.SafeStyleSheet|!Array<!goog.html.SafeStyleSheet>)}
 *     var_args Values to concatenate.
 * @return {!goog.html.SafeStyleSheet}
 */
goog.html.SafeStyleSheet.concat = function(var_args) {
  var result = '';

  /**
   * @param {!goog.html.SafeStyleSheet|!Array<!goog.html.SafeStyleSheet>}
   *     argument
   */
  var addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      result += goog.html.SafeStyleSheet.unwrap(argument);
    }
  };

  goog.array.forEach(arguments, addArgument);
  return goog.html.SafeStyleSheet
      .createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(result);
};


/**
 * Creates a SafeStyleSheet object from a compile-time constant string.
 *
 * {@code styleSheet} must not have any &lt; characters in it, so that
 * the syntactic structure of the surrounding HTML is not affected.
 *
 * @param {!goog.string.Const} styleSheet A compile-time-constant string from
 *     which to create a SafeStyleSheet.
 * @return {!goog.html.SafeStyleSheet} A SafeStyleSheet object initialized to
 *     {@code styleSheet}.
 */
goog.html.SafeStyleSheet.fromConstant = function(styleSheet) {
  var styleSheetString = goog.string.Const.unwrap(styleSheet);
  if (styleSheetString.length === 0) {
    return goog.html.SafeStyleSheet.EMPTY;
  }
  // > is a valid character in CSS selectors and there's no strict need to
  // block it if we already block <.
  goog.asserts.assert(
      !goog.string.contains(styleSheetString, '<'),
      "Forbidden '<' character in style sheet string: " + styleSheetString);
  return goog.html.SafeStyleSheet
      .createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheetString);
};


/**
 * Returns this SafeStyleSheet's value as a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeStyleSheet}, use {@code goog.html.SafeStyleSheet.unwrap}
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
 * @see goog.html.SafeStyleSheet#unwrap
 * @override
 */
goog.html.SafeStyleSheet.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeStyleSheet, use
   * {@code goog.html.SafeStyleSheet.unwrap}.
   *
   * @see goog.html.SafeStyleSheet#unwrap
   * @override
   */
  goog.html.SafeStyleSheet.prototype.toString = function() {
    return 'SafeStyleSheet{' +
        this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ + '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a
 * SafeStyleSheet object, and returns its value.
 *
 * @param {!goog.html.SafeStyleSheet} safeStyleSheet The object to extract from.
 * @return {string} The safeStyleSheet object's contained string, unless
 *     the run-time type check fails. In that case, {@code unwrap} returns an
 *     innocuous string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeStyleSheet.unwrap = function(safeStyleSheet) {
  // Perform additional Run-time type-checking to ensure that
  // safeStyleSheet is indeed an instance of the expected type.  This
  // provides some additional protection against security bugs due to
  // application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeStyleSheet instanceof goog.html.SafeStyleSheet &&
      safeStyleSheet.constructor === goog.html.SafeStyleSheet &&
      safeStyleSheet
              .SAFE_STYLE_SHEET_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type SafeStyleSheet, got \'' +
        safeStyleSheet + '\' of type ' + goog.typeOf(safeStyleSheet));
    return 'type_error:SafeStyleSheet';
  }
};


/**
 * Package-internal utility method to create SafeStyleSheet instances.
 *
 * @param {string} styleSheet The string to initialize the SafeStyleSheet
 *     object with.
 * @return {!goog.html.SafeStyleSheet} The initialized SafeStyleSheet object.
 * @package
 */
goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse =
    function(styleSheet) {
  return new goog.html.SafeStyleSheet().initSecurityPrivateDoNotAccessOrElse_(
      styleSheet);
};


/**
 * Called from createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(). This
 * method exists only so that the compiler can dead code eliminate static
 * fields (like EMPTY) when they're not accessed.
 * @param {string} styleSheet
 * @return {!goog.html.SafeStyleSheet}
 * @private
 */
goog.html.SafeStyleSheet.prototype.initSecurityPrivateDoNotAccessOrElse_ =
    function(styleSheet) {
  this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = styleSheet;
  return this;
};


/**
 * A SafeStyleSheet instance corresponding to the empty string.
 * @const {!goog.html.SafeStyleSheet}
 */
goog.html.SafeStyleSheet.EMPTY =
    goog.html.SafeStyleSheet
        .createSafeStyleSheetSecurityPrivateDoNotAccessOrElse('');
