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
 * @fileoverview The SafeStyle type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeStyle');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.html.SafeUrl');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');
goog.require('goog.string.internal');



/**
 * A string-like object which represents a sequence of CSS declarations
 * ({@code propertyName1: propertyvalue1; propertyName2: propertyValue2; ...})
 * and that carries the security type contract that its value, as a string,
 * will not cause untrusted script execution (XSS) when evaluated as CSS in a
 * browser.
 *
 * Instances of this type must be created via the factory methods
 * (`goog.html.SafeStyle.create` or
 * `goog.html.SafeStyle.fromConstant`) and not by invoking its
 * constructor. The constructor intentionally takes no parameters and the type
 * is immutable; hence only a default instance corresponding to the empty string
 * can be obtained via constructor invocation.
 *
 * SafeStyle's string representation can safely be:
 * <ul>
 *   <li>Interpolated as the content of a *quoted* HTML style attribute.
 *       However, the SafeStyle string *must be HTML-attribute-escaped* before
 *       interpolation.
 *   <li>Interpolated as the content of a {}-wrapped block within a stylesheet.
 *       '<' characters in the SafeStyle string *must be CSS-escaped* before
 *       interpolation. The SafeStyle string is also guaranteed not to be able
 *       to introduce new properties or elide existing ones.
 *   <li>Interpolated as the content of a {}-wrapped block within an HTML
 *       &lt;style&gt; element. '<' characters in the SafeStyle string
 *       *must be CSS-escaped* before interpolation.
 *   <li>Assigned to the style property of a DOM node. The SafeStyle string
 *       should not be escaped before being assigned to the property.
 * </ul>
 *
 * A SafeStyle may never contain literal angle brackets. Otherwise, it could
 * be unsafe to place a SafeStyle into a &lt;style&gt; tag (where it can't
 * be HTML escaped). For example, if the SafeStyle containing
 * "{@code font: 'foo &lt;style/&gt;&lt;script&gt;evil&lt;/script&gt;'}" were
 * interpolated within a &lt;style&gt; tag, this would then break out of the
 * style context into HTML.
 *
 * A SafeStyle may contain literal single or double quotes, and as such the
 * entire style string must be escaped when used in a style attribute (if
 * this were not the case, the string could contain a matching quote that
 * would escape from the style attribute).
 *
 * Values of this type must be composable, i.e. for any two values
 * `style1` and `style2` of this type,
 * {@code goog.html.SafeStyle.unwrap(style1) +
 * goog.html.SafeStyle.unwrap(style2)} must itself be a value that satisfies
 * the SafeStyle type constraint. This requirement implies that for any value
 * `style` of this type, `goog.html.SafeStyle.unwrap(style)` must
 * not end in a "property value" or "property name" context. For example,
 * a value of {@code background:url("} or {@code font-} would not satisfy the
 * SafeStyle contract. This is because concatenating such strings with a
 * second value that itself does not contain unsafe CSS can result in an
 * overall string that does. For example, if {@code javascript:evil())"} is
 * appended to {@code background:url("}, the resulting string may result in
 * the execution of a malicious script.
 *
 * TODO(mlourenco): Consider whether we should implement UTF-8 interchange
 * validity checks and blacklisting of newlines (including Unicode ones) and
 * other whitespace characters (\t, \f). Document here if so and also update
 * SafeStyle.fromConstant().
 *
 * The following example values comply with this type's contract:
 * <ul>
 *   <li><pre>width: 1em;</pre>
 *   <li><pre>height:1em;</pre>
 *   <li><pre>width: 1em;height: 1em;</pre>
 *   <li><pre>background:url('http://url');</pre>
 * </ul>
 * In addition, the empty string is safe for use in a CSS attribute.
 *
 * The following example values do NOT comply with this type's contract:
 * <ul>
 *   <li><pre>background: red</pre> (missing a trailing semi-colon)
 *   <li><pre>background:</pre> (missing a value and a trailing semi-colon)
 *   <li><pre>1em</pre> (missing an attribute name, which provides context for
 *       the value)
 * </ul>
 *
 * @see goog.html.SafeStyle#create
 * @see goog.html.SafeStyle#fromConstant
 * @see http://www.w3.org/TR/css3-syntax/
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.html.SafeStyle = function() {
  /**
   * The contained value of this SafeStyle.  The field has a purposely
   * ugly name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeStyle#unwrap
   * @const {!Object}
   * @private
   */
  this.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * @override
 * @const
 */
goog.html.SafeStyle.prototype.implementsGoogStringTypedString = true;


/**
 * Type marker for the SafeStyle type, used to implement additional
 * run-time type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Creates a SafeStyle object from a compile-time constant string.
 *
 * `style` should be in the format
 * {@code name: value; [name: value; ...]} and must not have any < or >
 * characters in it. This is so that SafeStyle's contract is preserved,
 * allowing the SafeStyle to correctly be interpreted as a sequence of CSS
 * declarations and without affecting the syntactic structure of any
 * surrounding CSS and HTML.
 *
 * This method performs basic sanity checks on the format of `style`
 * but does not constrain the format of `name` and `value`, except
 * for disallowing tag characters.
 *
 * @param {!goog.string.Const} style A compile-time-constant string from which
 *     to create a SafeStyle.
 * @return {!goog.html.SafeStyle} A SafeStyle object initialized to
 *     `style`.
 */
goog.html.SafeStyle.fromConstant = function(style) {
  var styleString = goog.string.Const.unwrap(style);
  if (styleString.length === 0) {
    return goog.html.SafeStyle.EMPTY;
  }
  goog.asserts.assert(
      goog.string.internal.endsWith(styleString, ';'),
      'Last character of style string is not \';\': ' + styleString);
  goog.asserts.assert(
      goog.string.internal.contains(styleString, ':'),
      'Style string must contain at least one \':\', to ' +
          'specify a "name: value" pair: ' + styleString);
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      styleString);
};


/**
 * Returns this SafeStyle's value as a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed `SafeStyle`, use `goog.html.SafeStyle.unwrap` instead of
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
 * @see goog.html.SafeStyle#unwrap
 * @override
 */
goog.html.SafeStyle.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeStyleWrappedValue_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeStyle, use
   * `goog.html.SafeStyle.unwrap`.
   *
   * @see goog.html.SafeStyle#unwrap
   * @override
   */
  goog.html.SafeStyle.prototype.toString = function() {
    return 'SafeStyle{' + this.privateDoNotAccessOrElseSafeStyleWrappedValue_ +
        '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a
 * SafeStyle object, and returns its value.
 *
 * @param {!goog.html.SafeStyle} safeStyle The object to extract from.
 * @return {string} The safeStyle object's contained string, unless
 *     the run-time type check fails. In that case, `unwrap` returns an
 *     innocuous string, or, if assertions are enabled, throws
 *     `goog.asserts.AssertionError`.
 */
goog.html.SafeStyle.unwrap = function(safeStyle) {
  // Perform additional Run-time type-checking to ensure that
  // safeStyle is indeed an instance of the expected type.  This
  // provides some additional protection against security bugs due to
  // application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeStyle instanceof goog.html.SafeStyle &&
      safeStyle.constructor === goog.html.SafeStyle &&
      safeStyle.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeStyle.privateDoNotAccessOrElseSafeStyleWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type SafeStyle, got \'' +
        safeStyle + '\' of type ' + goog.typeOf(safeStyle));
    return 'type_error:SafeStyle';
  }
};


/**
 * Package-internal utility method to create SafeStyle instances.
 *
 * @param {string} style The string to initialize the SafeStyle object with.
 * @return {!goog.html.SafeStyle} The initialized SafeStyle object.
 * @package
 */
goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse = function(
    style) {
  return new goog.html.SafeStyle().initSecurityPrivateDoNotAccessOrElse_(style);
};


/**
 * Called from createSafeStyleSecurityPrivateDoNotAccessOrElse(). This
 * method exists only so that the compiler can dead code eliminate static
 * fields (like EMPTY) when they're not accessed.
 * @param {string} style
 * @return {!goog.html.SafeStyle}
 * @private
 */
goog.html.SafeStyle.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(
    style) {
  this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = style;
  return this;
};


/**
 * A SafeStyle instance corresponding to the empty string.
 * @const {!goog.html.SafeStyle}
 */
goog.html.SafeStyle.EMPTY =
    goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse('');


/**
 * The innocuous string generated by goog.html.SafeStyle.create when passed
 * an unsafe value.
 * @const {string}
 */
goog.html.SafeStyle.INNOCUOUS_STRING = 'zClosurez';


/**
 * A single property value.
 * @typedef {string|!goog.string.Const|!goog.html.SafeUrl}
 */
goog.html.SafeStyle.PropertyValue;


/**
 * Mapping of property names to their values.
 * We don't support numbers even though some values might be numbers (e.g.
 * line-height or 0 for any length). The reason is that most numeric values need
 * units (e.g. '1px') and allowing numbers could cause users forgetting about
 * them.
 * @typedef {!Object<string, ?goog.html.SafeStyle.PropertyValue|
 *     ?Array<!goog.html.SafeStyle.PropertyValue>>}
 */
goog.html.SafeStyle.PropertyMap;


/**
 * Creates a new SafeStyle object from the properties specified in the map.
 * @param {goog.html.SafeStyle.PropertyMap} map Mapping of property names to
 *     their values, for example {'margin': '1px'}. Names must consist of
 *     [-_a-zA-Z0-9]. Values might be strings consisting of
 *     [-,.'"%_!# a-zA-Z0-9[\]], where ", ', and [] must be properly balanced.
 *     We also allow simple functions like rgb() and url() which sanitizes its
 *     contents. Other values must be wrapped in goog.string.Const. URLs might
 *     be passed as goog.html.SafeUrl which will be wrapped into url(""). We
 *     also support array whose elements are joined with ' '. Null value causes
 *     skipping the property.
 * @return {!goog.html.SafeStyle}
 * @throws {Error} If invalid name is provided.
 * @throws {goog.asserts.AssertionError} If invalid value is provided. With
 *     disabled assertions, invalid value is replaced by
 *     goog.html.SafeStyle.INNOCUOUS_STRING.
 */
goog.html.SafeStyle.create = function(map) {
  var style = '';
  for (var name in map) {
    if (!/^[-_a-zA-Z0-9]+$/.test(name)) {
      throw new Error('Name allows only [-_a-zA-Z0-9], got: ' + name);
    }
    var value = map[name];
    if (value == null) {
      continue;
    }
    if (goog.isArray(value)) {
      value = goog.array.map(value, goog.html.SafeStyle.sanitizePropertyValue_)
                  .join(' ');
    } else {
      value = goog.html.SafeStyle.sanitizePropertyValue_(value);
    }
    style += name + ':' + value + ';';
  }
  if (!style) {
    return goog.html.SafeStyle.EMPTY;
  }
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      style);
};


/**
 * Checks and converts value to string.
 * @param {!goog.html.SafeStyle.PropertyValue} value
 * @return {string}
 * @private
 */
goog.html.SafeStyle.sanitizePropertyValue_ = function(value) {
  if (value instanceof goog.html.SafeUrl) {
    var url = goog.html.SafeUrl.unwrap(value);
    return 'url("' + url.replace(/</g, '%3c').replace(/[\\"]/g, '\\$&') + '")';
  }
  var result = value instanceof goog.string.Const ?
      goog.string.Const.unwrap(value) :
      goog.html.SafeStyle.sanitizePropertyValueString_(String(value));
  // These characters can be used to change context and we don't want that even
  // with const values.
  if (/[{;}]/.test(result)) {
    throw new goog.asserts.AssertionError(
        'Value does not allow [{;}], got: %s.', [result]);
  }
  return result;
};


/**
 * Checks string value.
 * @param {string} value
 * @return {string}
 * @private
 */
goog.html.SafeStyle.sanitizePropertyValueString_ = function(value) {
  // Some CSS property values permit nested functions. We allow one level of
  // nesting, and all nested functions must also be in the FUNCTIONS_RE_ list.
  var valueWithoutFunctions =
      value.replace(goog.html.SafeStyle.FUNCTIONS_RE_, '$1')
          .replace(goog.html.SafeStyle.FUNCTIONS_RE_, '$1')
          .replace(goog.html.SafeStyle.URL_RE_, 'url');
  if (!goog.html.SafeStyle.VALUE_RE_.test(valueWithoutFunctions)) {
    goog.asserts.fail(
        'String value allows only ' + goog.html.SafeStyle.VALUE_ALLOWED_CHARS_ +
        ' and simple functions, got: ' + value);
    return goog.html.SafeStyle.INNOCUOUS_STRING;
  } else if (goog.html.SafeStyle.COMMENT_RE_.test(value)) {
    goog.asserts.fail('String value disallows comments, got: ' + value);
    return goog.html.SafeStyle.INNOCUOUS_STRING;
  } else if (!goog.html.SafeStyle.hasBalancedQuotes_(value)) {
    goog.asserts.fail('String value requires balanced quotes, got: ' + value);
    return goog.html.SafeStyle.INNOCUOUS_STRING;
  } else if (!goog.html.SafeStyle.hasBalancedSquareBrackets_(value)) {
    goog.asserts.fail(
        'String value requires balanced square brackets and one' +
        ' identifier per pair of brackets, got: ' + value);
    return goog.html.SafeStyle.INNOCUOUS_STRING;
  }
  return goog.html.SafeStyle.sanitizeUrl_(value);
};


/**
 * Checks that quotes (" and ') are properly balanced inside a string. Assumes
 * that neither escape (\) nor any other character that could result in
 * breaking out of a string parsing context are allowed;
 * see http://www.w3.org/TR/css3-syntax/#string-token-diagram.
 * @param {string} value Untrusted CSS property value.
 * @return {boolean} True if property value is safe with respect to quote
 *     balancedness.
 * @private
 */
goog.html.SafeStyle.hasBalancedQuotes_ = function(value) {
  var outsideSingle = true;
  var outsideDouble = true;
  for (var i = 0; i < value.length; i++) {
    var c = value.charAt(i);
    if (c == "'" && outsideDouble) {
      outsideSingle = !outsideSingle;
    } else if (c == '"' && outsideSingle) {
      outsideDouble = !outsideDouble;
    }
  }
  return outsideSingle && outsideDouble;
};


/**
 * Checks that square brackets ([ and ]) are properly balanced inside a string,
 * and that the content in the square brackets is one ident-token;
 * see https://www.w3.org/TR/css-syntax-3/#ident-token-diagram.
 * For practicality, and in line with other restrictions posed on SafeStyle
 * strings, we restrict the character set allowable in the ident-token to
 * [-_a-zA-Z0-9].
 * @param {string} value Untrusted CSS property value.
 * @return {boolean} True if property value is safe with respect to square
 *     bracket balancedness.
 * @private
 */
goog.html.SafeStyle.hasBalancedSquareBrackets_ = function(value) {
  var outside = true;
  var tokenRe = /^[-_a-zA-Z0-9]$/;
  for (var i = 0; i < value.length; i++) {
    var c = value.charAt(i);
    if (c == ']') {
      if (outside) return false;  // Unbalanced ].
      outside = true;
    } else if (c == '[') {
      if (!outside) return false;  // No nesting.
      outside = false;
    } else if (!outside && !tokenRe.test(c)) {
      return false;
    }
  }
  return outside;
};


/**
 * Characters allowed in goog.html.SafeStyle.VALUE_RE_.
 * @private {string}
 */
goog.html.SafeStyle.VALUE_ALLOWED_CHARS_ = '[-,."\'%_!# a-zA-Z0-9\\[\\]]';


/**
 * Regular expression for safe values.
 *
 * Quotes (" and ') are allowed, but a check must be done elsewhere to ensure
 * they're balanced.
 *
 * Square brackets ([ and ]) are allowed, but a check must be done elsewhere
 * to ensure they're balanced. The content inside a pair of square brackets must
 * be one alphanumeric identifier.
 *
 * ',' allows multiple values to be assigned to the same property
 * (e.g. background-attachment or font-family) and hence could allow
 * multiple values to get injected, but that should pose no risk of XSS.
 *
 * The expression checks only for XSS safety, not for CSS validity.
 * @const {!RegExp}
 * @private
 */
goog.html.SafeStyle.VALUE_RE_ =
    new RegExp('^' + goog.html.SafeStyle.VALUE_ALLOWED_CHARS_ + '+$');


/**
 * Regular expression for url(). We support URLs allowed by
 * https://www.w3.org/TR/css-syntax-3/#url-token-diagram without using escape
 * sequences. Use percent-encoding if you need to use special characters like
 * backslash.
 * @private @const {!RegExp}
 */
goog.html.SafeStyle.URL_RE_ = new RegExp(
    '\\b(url\\([ \t\n]*)(' +
        '\'[ -&(-\\[\\]-~]*\'' +  // Printable characters except ' and \.
        '|"[ !#-\\[\\]-~]*"' +    // Printable characters except " and \.
        '|[!#-&*-\\[\\]-~]*' +    // Printable characters except [ "'()\\].
        ')([ \t\n]*\\))',
    'g');

/**
 * Names of functions allowed in FUNCTIONS_RE_.
 * @private @const {!Array<string>}
 */
goog.html.SafeStyle.ALLOWED_FUNCTIONS_ = [
  'calc',
  'cubic-bezier',
  'fit-content',
  'hsl',
  'hsla',
  'matrix',
  'minmax',
  'repeat',
  'rgb',
  'rgba',
  '(rotate|scale|translate)(X|Y|Z|3d)?',
];


/**
 * Regular expression for simple functions.
 * @private @const {!RegExp}
 */
goog.html.SafeStyle.FUNCTIONS_RE_ = new RegExp(
    '\\b(' + goog.html.SafeStyle.ALLOWED_FUNCTIONS_.join('|') + ')' +
        '\\([-+*/0-9a-z.%\\[\\], ]+\\)',
    'g');


/**
 * Regular expression for comments. These are disallowed in CSS property values.
 * @private @const {!RegExp}
 */
goog.html.SafeStyle.COMMENT_RE_ = /\/\*/;


/**
 * Sanitize URLs inside url().
 *
 * NOTE: We could also consider using CSS.escape once that's available in the
 * browsers. However, loosely matching URL e.g. with url\(.*\) and then escaping
 * the contents would result in a slightly different language than CSS leading
 * to confusion of users. E.g. url(")") is valid in CSS but it would be invalid
 * as seen by our parser. On the other hand, url(\) is invalid in CSS but our
 * parser would be fine with it.
 *
 * @param {string} value Untrusted CSS property value.
 * @return {string}
 * @private
 */
goog.html.SafeStyle.sanitizeUrl_ = function(value) {
  return value.replace(
      goog.html.SafeStyle.URL_RE_, function(match, before, url, after) {
        var quote = '';
        url = url.replace(/^(['"])(.*)\1$/, function(match, start, inside) {
          quote = start;
          return inside;
        });
        var sanitized = goog.html.SafeUrl.sanitize(url).getTypedStringValue();
        return before + quote + sanitized + quote + after;
      });
};


/**
 * Creates a new SafeStyle object by concatenating the values.
 * @param {...(!goog.html.SafeStyle|!Array<!goog.html.SafeStyle>)} var_args
 *     SafeStyles to concatenate.
 * @return {!goog.html.SafeStyle}
 */
goog.html.SafeStyle.concat = function(var_args) {
  var style = '';

  /**
   * @param {!goog.html.SafeStyle|!Array<!goog.html.SafeStyle>} argument
   */
  var addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      style += goog.html.SafeStyle.unwrap(argument);
    }
  };

  goog.array.forEach(arguments, addArgument);
  if (!style) {
    return goog.html.SafeStyle.EMPTY;
  }
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      style);
};
