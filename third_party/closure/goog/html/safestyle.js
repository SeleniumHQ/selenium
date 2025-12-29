/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The SafeStyle type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.module('goog.html.SafeStyle');
goog.module.declareLegacyNamespace();

const Const = goog.require('goog.string.Const');
const SafeUrl = goog.require('goog.html.SafeUrl');
const TypedString = goog.require('goog.string.TypedString');
const {AssertionError, assert, fail} = goog.require('goog.asserts');
const {contains, endsWith} = goog.require('goog.string.internal');
const utils = goog.require('goog.utils');

/**
 * Token used to ensure that object is created only from this file. No code
 * outside of this file can access this token.
 * @type {!Object}
 * @const
 */
const CONSTRUCTOR_TOKEN_PRIVATE = {};

/**
 * A string-like object which represents a sequence of CSS declarations
 * (`propertyName1: propertyvalue1; propertyName2: propertyValue2; ...`)
 * and that carries the security type contract that its value, as a string,
 * will not cause untrusted script execution (XSS) when evaluated as CSS in a
 * browser.
 *
 * Instances of this type must be created via the factory methods
 * (`SafeStyle.create` or `SafeStyle.fromConstant`)
 * and not by invoking its constructor. The constructor intentionally takes an
 * extra parameter that cannot be constructed outside of this file and the type
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
 * `font: 'foo &lt;style/&gt;&lt;script&gt;evil&lt;/script&gt;'` were
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
 * `SafeStyle.unwrap(style1) +
 * SafeStyle.unwrap(style2)` must itself be a value that satisfies
 * the SafeStyle type constraint. This requirement implies that for any value
 * `style` of this type, `SafeStyle.unwrap(style)` must
 * not end in a "property value" or "property name" context. For example,
 * a value of `background:url("` or `font-` would not satisfy the
 * SafeStyle contract. This is because concatenating such strings with a
 * second value that itself does not contain unsafe CSS can result in an
 * overall string that does. For example, if `javascript:evil())"` is
 * appended to `background:url("}, the resulting string may result in
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
 * @see SafeStyle#create
 * @see SafeStyle#fromConstant
 * @see http://www.w3.org/TR/css3-syntax/
 * @final
 * @struct
 * @implements {TypedString}
 */
class SafeStyle {
  /**
   * @param {string} value
   * @param {!Object} token package-internal implementation detail.
   */
  constructor(value, token) {
    if (goog.DEBUG && token !== CONSTRUCTOR_TOKEN_PRIVATE) {
      throw Error('SafeStyle is not meant to be built directly');
    }

    /**
     * The contained value of this SafeStyle.  The field has a purposely
     * ugly name to make (non-compiled) code that attempts to directly access
     * this field stand out.
     * @const
     * @private {string}
     */
    this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = value;

    /**
     * @override
     * @const {boolean}
     */
    this.implementsGoogStringTypedString = true;
  }


  /**
   * Creates a SafeStyle object from a compile-time constant string.
   *
   * `style` should be in the format
   * `name: value; [name: value; ...]` and must not have any < or >
   * characters in it. This is so that SafeStyle's contract is preserved,
   * allowing the SafeStyle to correctly be interpreted as a sequence of CSS
   * declarations and without affecting the syntactic structure of any
   * surrounding CSS and HTML.
   *
   * This method performs basic sanity checks on the format of `style`
   * but does not constrain the format of `name` and `value`, except
   * for disallowing tag characters.
   *
   * @param {!Const} style A compile-time-constant string from which
   *     to create a SafeStyle.
   * @return {!SafeStyle} A SafeStyle object initialized to
   *     `style`.
   */
  static fromConstant(style) {
    const styleString = Const.unwrap(style);
    if (styleString.length === 0) {
      return SafeStyle.EMPTY;
    }
    assert(
        endsWith(styleString, ';'),
        `Last character of style string is not ';': ${styleString}`);
    assert(
        contains(styleString, ':'),
        'Style string must contain at least one \':\', to ' +
            'specify a "name: value" pair: ' + styleString);
    return SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
        styleString);
  };


  /**
   * Returns this SafeStyle's value as a string.
   *
   * IMPORTANT: In code where it is security relevant that an object's type is
   * indeed `SafeStyle`, use `SafeStyle.unwrap` instead of
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
   * @return {string}
   * @see SafeStyle#unwrap
   * @override
   */
  getTypedStringValue() {
    return this.privateDoNotAccessOrElseSafeStyleWrappedValue_;
  }


  /**
   * Returns a string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeStyle, use
   * `SafeStyle.unwrap`.
   *
   * @return {string}
   * @see SafeStyle#unwrap
   * @override
   */
  toString() {
    return this.privateDoNotAccessOrElseSafeStyleWrappedValue_.toString();
  }


  /**
   * Performs a runtime check that the provided object is indeed a
   * SafeStyle object, and returns its value.
   *
   * @param {!SafeStyle} safeStyle The object to extract from.
   * @return {string} The safeStyle object's contained string, unless
   *     the run-time type check fails. In that case, `unwrap` returns an
   *     innocuous string, or, if assertions are enabled, throws
   *     `AssertionError`.
   */
  static unwrap(safeStyle) {
    // Perform additional Run-time type-checking to ensure that
    // safeStyle is indeed an instance of the expected type.  This
    // provides some additional protection against security bugs due to
    // application code that disables type checks.
    // Specifically, the following checks are performed:
    // 1. The object is an instance of the expected type.
    // 2. The object is not an instance of a subclass.
    if (safeStyle instanceof SafeStyle && safeStyle.constructor === SafeStyle) {
      return safeStyle.privateDoNotAccessOrElseSafeStyleWrappedValue_;
    } else {
      fail(
          `expected object of type SafeStyle, got '${safeStyle}` +
          '\' of type ' + utils.typeOf(safeStyle));
      return 'type_error:SafeStyle';
    }
  }


  /**
   * Package-internal utility method to create SafeStyle instances.
   *
   * @param {string} style The string to initialize the SafeStyle object with.
   * @return {!SafeStyle} The initialized SafeStyle object.
   * @package
   */
  static createSafeStyleSecurityPrivateDoNotAccessOrElse(style) {
    return new SafeStyle(style, CONSTRUCTOR_TOKEN_PRIVATE);
  }

  /**
   * Creates a new SafeStyle object from the properties specified in the map.
   * @param {!SafeStyle.PropertyMap} map Mapping of property names to
   *     their values, for example {'margin': '1px'}. Names must consist of
   *     [-_a-zA-Z0-9]. Values might be strings consisting of
   *     [-,.'"%_!# a-zA-Z0-9[\]], where ", ', and [] must be properly balanced.
   *     We also allow simple functions like rgb() and url() which sanitizes its
   *     contents. Other values must be wrapped in Const. URLs might
   *     be passed as SafeUrl which will be wrapped into url(""). We
   *     also support array whose elements are joined with ' '. Null value
   * causes skipping the property.
   * @return {!SafeStyle}
   * @throws {!Error} If invalid name is provided.
   * @throws {!AssertionError} If invalid value is provided. With
   *     disabled assertions, invalid value is replaced by
   *     SafeStyle.INNOCUOUS_STRING.
   */
  static create(map) {
    let style = '';
    for (let name in map) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty#Using_hasOwnProperty_as_a_property_name
      if (Object.prototype.hasOwnProperty.call(map, name)) {
        if (!/^[-_a-zA-Z0-9]+$/.test(name)) {
          throw new Error(`Name allows only [-_a-zA-Z0-9], got: ${name}`);
        }
        let value = map[name];
        if (value == null) {
          continue;
        }
        if (Array.isArray(value)) {
          value = value.map(sanitizePropertyValue).join(' ');
        } else {
          value = sanitizePropertyValue(value);
        }
        style += `${name}:${value};`;
      }
    }
    if (!style) {
      return SafeStyle.EMPTY;
    }
    return SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
  };

  /**
   * Creates a new SafeStyle object by concatenating the values.
   * @param {...(!SafeStyle|!Array<!SafeStyle>)} var_args
   *     SafeStyles to concatenate.
   * @return {!SafeStyle}
   */
  static concat(var_args) {
    let style = '';

    /**
     * @param {!SafeStyle|!Array<!SafeStyle>} argument
     */
    const addArgument = argument => {
      if (Array.isArray(argument)) {
        argument.forEach(addArgument);
      } else {
        style += SafeStyle.unwrap(argument);
      }
    };

    Array.prototype.forEach.call(arguments, addArgument);
    if (!style) {
      return SafeStyle.EMPTY;
    }
    return SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
  };
}

/**
 * A SafeStyle instance corresponding to the empty string.
 * @const {!SafeStyle}
 */
SafeStyle.EMPTY = SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse('');


/**
 * The innocuous string generated by SafeStyle.create when passed
 * an unsafe value.
 * @const {string}
 */
SafeStyle.INNOCUOUS_STRING = 'zClosurez';


/**
 * A single property value.
 * @typedef {string|!Const|!SafeUrl}
 */
SafeStyle.PropertyValue;


/**
 * Mapping of property names to their values.
 * We don't support numbers even though some values might be numbers (e.g.
 * line-height or 0 for any length). The reason is that most numeric values need
 * units (e.g. '1px') and allowing numbers could cause users forgetting about
 * them.
 * @typedef {!Object<string, ?SafeStyle.PropertyValue|
 *     ?Array<!SafeStyle.PropertyValue>>}
 */
SafeStyle.PropertyMap;



/**
 * Checks and converts value to string.
 * @param {!SafeStyle.PropertyValue} value
 * @return {string}
 */
function sanitizePropertyValue(value) {
  if (value instanceof SafeUrl) {
    const url = SafeUrl.unwrap(value);
    return 'url("' + url.replace(/</g, '%3c').replace(/[\\"]/g, '\\$&') + '")';
  }
  const result = value instanceof Const ?
      Const.unwrap(value) :
      sanitizePropertyValueString(String(value));
  // These characters can be used to change context and we don't want that even
  // with const values.
  if (/[{;}]/.test(result)) {
    throw new AssertionError('Value does not allow [{;}], got: %s.', [result]);
  }
  return result;
}


/**
 * Checks string value.
 * @param {string} value
 * @return {string}
 */
function sanitizePropertyValueString(value) {
  // Some CSS property values permit nested functions. We allow one level of
  // nesting, and all nested functions must also be in the FUNCTIONS_RE_ list.
  const valueWithoutFunctions = value.replace(FUNCTIONS_RE, '$1')
                                    .replace(FUNCTIONS_RE, '$1')
                                    .replace(URL_RE, 'url');
  if (!VALUE_RE.test(valueWithoutFunctions)) {
    fail(
        `String value allows only ${VALUE_ALLOWED_CHARS}` +
        ' and simple functions, got: ' + value);
    return SafeStyle.INNOCUOUS_STRING;
  } else if (COMMENT_RE.test(value)) {
    fail(`String value disallows comments, got: ${value}`);
    return SafeStyle.INNOCUOUS_STRING;
  } else if (!hasBalancedQuotes(value)) {
    fail(`String value requires balanced quotes, got: ${value}`);
    return SafeStyle.INNOCUOUS_STRING;
  } else if (!hasBalancedSquareBrackets(value)) {
    fail(
        'String value requires balanced square brackets and one' +
        ' identifier per pair of brackets, got: ' + value);
    return SafeStyle.INNOCUOUS_STRING;
  }
  return sanitizeUrl(value);
}


/**
 * Checks that quotes (" and ') are properly balanced inside a string. Assumes
 * that neither escape (\) nor any other character that could result in
 * breaking out of a string parsing context are allowed;
 * see http://www.w3.org/TR/css3-syntax/#string-token-diagram.
 * @param {string} value Untrusted CSS property value.
 * @return {boolean} True if property value is safe with respect to quote
 *     balancedness.
 */
function hasBalancedQuotes(value) {
  let outsideSingle = true;
  let outsideDouble = true;
  for (let i = 0; i < value.length; i++) {
    const c = value.charAt(i);
    if (c == '\'' && outsideDouble) {
      outsideSingle = !outsideSingle;
    } else if (c == '"' && outsideSingle) {
      outsideDouble = !outsideDouble;
    }
  }
  return outsideSingle && outsideDouble;
}


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
 */
function hasBalancedSquareBrackets(value) {
  let outside = true;
  const tokenRe = /^[-_a-zA-Z0-9]$/;
  for (let i = 0; i < value.length; i++) {
    const c = value.charAt(i);
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
}


/**
 * Characters allowed in VALUE_RE.
 * @type {string}
 */
const VALUE_ALLOWED_CHARS = '[-+,."\'%_!#/ a-zA-Z0-9\\[\\]]';


/**
 * Regular expression for safe values.
 * Quotes (" and ') are allowed, but a check must be done elsewhere to ensure
 * they're balanced.
 * Square brackets ([ and ]) are allowed, but a check must be done elsewhere
 * to ensure they're balanced. The content inside a pair of square brackets must
 * be one alphanumeric identifier.
 * ',' allows multiple values to be assigned to the same property
 * (e.g. background-attachment or font-family) and hence could allow
 * multiple values to get injected, but that should pose no risk of XSS.
 * The expression checks only for XSS safety, not for CSS validity.
 * @const {!RegExp}
 */
const VALUE_RE = new RegExp(`^${VALUE_ALLOWED_CHARS}+\$`);


/**
 * Regular expression for url(). We support URLs allowed by
 * https://www.w3.org/TR/css-syntax-3/#url-token-diagram without using escape
 * sequences. Use percent-encoding if you need to use special characters like
 * backslash.
 * @const {!RegExp}
 */
const URL_RE = new RegExp(
    '\\b(url\\([ \t\n]*)(' +
        '\'[ -&(-\\[\\]-~]*\'' +  // Printable characters except ' and \.
        '|"[ !#-\\[\\]-~]*"' +    // Printable characters except " and \.
        '|[!#-&*-\\[\\]-~]*' +    // Printable characters except [ "'()\\].
        ')([ \t\n]*\\))',
    'g');

/**
 * Names of functions allowed in FUNCTIONS_RE.
 * @const {!Array<string>}
 */
const ALLOWED_FUNCTIONS = [
  'calc',
  'cubic-bezier',
  'fit-content',
  'hsl',
  'hsla',
  'linear-gradient',
  'matrix',
  'minmax',
  'radial-gradient',
  'repeat',
  'rgb',
  'rgba',
  '(rotate|scale|translate)(X|Y|Z|3d)?',
  'steps',
  'var',
];


/**
 * Regular expression for simple functions.
 * @const {!RegExp}
 */
const FUNCTIONS_RE = new RegExp(
    '\\b(' + ALLOWED_FUNCTIONS.join('|') + ')' +
        '\\([-+*/0-9a-zA-Z.%#\\[\\], ]+\\)',
    'g');


/**
 * Regular expression for comments. These are disallowed in CSS property values.
 * @const {!RegExp}
 */
const COMMENT_RE = /\/\*/;


/**
 * Sanitize URLs inside url().
 * NOTE: We could also consider using CSS.escape once that's available in the
 * browsers. However, loosely matching URL e.g. with url\(.*\) and then escaping
 * the contents would result in a slightly different language than CSS leading
 * to confusion of users. E.g. url(")") is valid in CSS but it would be invalid
 * as seen by our parser. On the other hand, url(\) is invalid in CSS but our
 * parser would be fine with it.
 * @param {string} value Untrusted CSS property value.
 * @return {string}
 */
function sanitizeUrl(value) {
  return value.replace(URL_RE, (match, before, url, after) => {
    let quote = '';
    url = url.replace(/^(['"])(.*)\1$/, (match, start, inside) => {
      quote = start;
      return inside;
    });
    const sanitized = SafeUrl.sanitize(url).getTypedStringValue();
    return before + quote + sanitized + quote + after;
  });
}


exports = SafeStyle;
