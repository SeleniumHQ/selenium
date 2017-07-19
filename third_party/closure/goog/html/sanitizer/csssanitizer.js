// Copyright 2016 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview
 * JavaScript support for client-side CSS sanitization.
 *
 * @author danesh@google.com (Danesh Irani)
 * @author mikesamuel@gmail.com (Mike Samuel)
 */

goog.provide('goog.html.sanitizer.CssSanitizer');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.object');
goog.require('goog.string');


/**
 * The set of characters that need to be normalized inside url("...").
 * We normalize newlines because they are not allowed inside quoted strings,
 * normalize quote characters, angle-brackets, and asterisks because they
 * could be used to break out of the URL or introduce targets for CSS
 * error recovery.  We normalize parentheses since they delimit unquoted
 * URLs and calls and could be a target for error recovery.
 * @const @private {!RegExp}
 */
goog.html.sanitizer.CssSanitizer.NORM_URL_REGEXP_ = /[\n\f\r\"\'()*<>]/g;


/**
 * The replacements for NORM_URL_REGEXP.
 * @private @const {!Object<string, string>}
 */
goog.html.sanitizer.CssSanitizer.NORM_URL_REPLACEMENTS_ = {
  '\n': '%0a',
  '\f': '%0c',
  '\r': '%0d',
  '"': '%22',
  '\'': '%27',
  '(': '%28',
  ')': '%29',
  '*': '%2a',
  '<': '%3c',
  '>': '%3e'
};


/**
 * Normalizes a character for use in a url() directive.
 * @param {string} ch Character to be normalized.
 * @return {?string} Normalized character.
 * @private
 */
goog.html.sanitizer.CssSanitizer.normalizeUrlChar_ = function(ch) {
  return goog.html.sanitizer.CssSanitizer.NORM_URL_REPLACEMENTS_[ch] || null;
};


/**
 * Constructs a safe URI from a given URI and prop using a given uriRewriter
 * function.
 * @param {string} uri URI to be sanitized.
 * @param {string} propName Property name which contained the URI.
 * @param {?function(string, string):?goog.html.SafeUrl} uriRewriter A URI
 *    rewriter that returns a goog.html.SafeUrl.
 * @return {?string} Safe URI for use in CSS.
 * @private
 */
goog.html.sanitizer.CssSanitizer.getSafeUri_ = function(
    uri, propName, uriRewriter) {
  if (!uriRewriter) {
    return null;
  }
  var safeUri = uriRewriter(uri, propName);
  if (safeUri &&
      goog.html.SafeUrl.unwrap(safeUri) != goog.html.SafeUrl.INNOCUOUS_STRING) {
    return 'url("' +
        goog.html.SafeUrl.unwrap(safeUri).replace(
            goog.html.sanitizer.CssSanitizer.NORM_URL_REGEXP_,
            goog.html.sanitizer.CssSanitizer.normalizeUrlChar_) +
        '")';
  }
  return null;
};


/**
 * Used to detect the beginning of the argument list of a CSS property value
 * containing a CSS function call.
 * @private @const {string}
 */
goog.html.sanitizer.CssSanitizer.FUNCTION_ARGUMENTS_BEGIN_ = '(';


/**
 * Used to detect the end of the argument list of a CSS property value
 * containing a CSS function call.
 * @private @const {string}
 */
goog.html.sanitizer.CssSanitizer.FUNCTION_ARGUMENTS_END_ = ')';


/**
 * Allowed CSS functions
 * @const @private {!Array<string>}
 */
goog.html.sanitizer.CssSanitizer.ALLOWED_FUNCTIONS_ = [
  'rgb',
  'rgba',
  'alpha',
  'rect',
  'image',
  'linear-gradient',
  'radial-gradient',
  'repeating-linear-gradient',
  'repeating-radial-gradient',
  'cubic-bezier',
  'matrix',
  'perspective',
  'rotate',
  'rotate3d',
  'rotatex',
  'rotatey',
  'steps',
  'rotatez',
  'scale',
  'scale3d',
  'scalex',
  'scaley',
  'scalez',
  'skew',
  'skewx',
  'skewy',
  'translate',
  'translate3d',
  'translatex',
  'translatey',
  'translatez'
];


/**
 * Removes a vendor prefix from a property name.
 * @param {string} propName A property name.
 * @return {string} A property name without vendor prefixes.
 * @private
 */
goog.html.sanitizer.CssSanitizer.withoutVendorPrefix_ = function(propName) {
  // http://stackoverflow.com/a/5411098/20394 has a fairly extensive list
  // of vendor prefices. Blink has not declared a vendor prefix distinct from
  // -webkit- and http://css-tricks.com/tldr-on-vendor-prefix-drama/ discusses
  // how Mozilla recognizes some -webkit- prefixes.
  // http://wiki.csswg.org/spec/vendor-prefixes talks more about
  // cross-implementation, and lists other prefixes.
  return propName.replace(
      /^-(?:apple|css|epub|khtml|moz|mso?|o|rim|wap|webkit|xv)-(?=[a-z])/i, '');
};


/**
 * Sanitizes the value for a given a browser-parsed CSS value.
 * @param {string} propName A property name.
 * @param {string} propValue Value of the property as parsed by the browser.
 * @param {function(string, string):?goog.html.SafeUrl=} opt_uriRewriter A URI
 *     rewriter that returns an unwrapped goog.html.SafeUrl.
 * @return {?string} Sanitized property value or null.
 * @private
 */
goog.html.sanitizer.CssSanitizer.sanitizeProperty_ = function(
    propName, propValue, opt_uriRewriter) {
  var outputPropValue = goog.string.trim(propValue);
  if (outputPropValue == '') {
    return null;
  }

  if (goog.string.caseInsensitiveStartsWith(outputPropValue, 'url(')) {
    // Urls are rewritten according to the policy implemented in
    // opt_uriRewriter.
    // TODO(pelizzi): use HtmlSanitizerUrlPolicy for opt_uriRewriter.
    if (!opt_uriRewriter) {
      return null;
    }
    // TODO(danesh): Check if we need to resolve this URI.
    var uri = goog.string.stripQuotes(
        outputPropValue.substring(4, outputPropValue.length - 1), '"\'');

    return goog.html.sanitizer.CssSanitizer.getSafeUri_(
        uri, propName, opt_uriRewriter);
  } else if (outputPropValue.indexOf('(') > 0) {
    // Functions are filtered through a whitelist. Nesting whitelisted functions
    // is not supported.
    if (goog.string.countOf(
            outputPropValue,
            goog.html.sanitizer.CssSanitizer.FUNCTION_ARGUMENTS_BEGIN_) > 1 ||
        !(goog.array.contains(
              goog.html.sanitizer.CssSanitizer.ALLOWED_FUNCTIONS_,
              outputPropValue
                  .substring(
                      0,
                      outputPropValue.indexOf(goog.html.sanitizer.CssSanitizer
                                                  .FUNCTION_ARGUMENTS_BEGIN_))
                  .toLowerCase()) &&
          goog.string.endsWith(
              outputPropValue,
              goog.html.sanitizer.CssSanitizer.FUNCTION_ARGUMENTS_END_))) {
      // TODO(b/34222379): Handle functions that may need recursing or that may
      // appear in the middle of a string. For now, just allow functions which
      // aren't nested.
      return null;
    }
    return outputPropValue;
  } else {
    // Everything else is allowed.
    return outputPropValue;
  }
};


/**
 * Sanitizes an inline style attribute. Short-hand attributes are expanded to
 * their individual elements. Note: The sanitizer does not output vendor
 * prefixed styles.
 * @param {?CSSStyleDeclaration} cssStyle A CSS style object.
 * @param {function(string, string):?goog.html.SafeUrl=} opt_uriRewriter A URI
 *     rewriter that returns a goog.html.SafeUrl.
 * @return {!goog.html.SafeStyle} A sanitized inline cssText.
 */
goog.html.sanitizer.CssSanitizer.sanitizeInlineStyle = function(
    cssStyle, opt_uriRewriter) {
  if (!cssStyle) {
    return goog.html.SafeStyle.EMPTY;
  }

  var cleanCssStyle = document.createElement('div').style;
  var cssPropNames =
      goog.html.sanitizer.CssSanitizer.getCssPropNames_(cssStyle);

  for (var i = 0; i < cssPropNames.length; i++) {
    var propName =
        goog.html.sanitizer.CssSanitizer.withoutVendorPrefix_(cssPropNames[i]);
    if (!goog.html.sanitizer.CssSanitizer.isDisallowedPropertyName_(propName)) {
      var propValue =
          goog.html.sanitizer.CssSanitizer.getCssValue_(cssStyle, propName);

      var sanitizedValue = goog.html.sanitizer.CssSanitizer.sanitizeProperty_(
          propName, propValue, opt_uriRewriter);
      goog.html.sanitizer.CssSanitizer.setCssValue_(
          cleanCssStyle, propName, sanitizedValue);
    }
  }
  return goog.html.uncheckedconversions
      .safeStyleFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from('Output of CSS sanitizer'),
          cleanCssStyle.cssText || '');
};


/**
 * Sanitizes inline CSS text and returns it as a SafeStyle object. When adequate
 * browser support is not available, such as for IE9 and below, a
 * SafeStyle-wrapped empty string is returned.
 * @param {string} cssText CSS text to be sanitized.
 * @param {function(string, string):?goog.html.SafeUrl=} opt_uriRewriter A URI
 *     rewriter that returns a goog.html.SafeUrl.
 * @return {!goog.html.SafeStyle} A sanitized inline cssText.
 */
goog.html.sanitizer.CssSanitizer.sanitizeInlineStyleString = function(
    cssText, opt_uriRewriter) {
  // same check as in goog.html.sanitizer.HTML_SANITIZER_SUPPORTED_
  if (goog.userAgent.IE && document.documentMode < 10) {
    return new goog.html.SafeStyle();
  }

  var div = goog.html.sanitizer.CssSanitizer
      .createInertDocument_()
      .createElement('DIV');
  div.style.cssText = cssText;
  return goog.html.sanitizer.CssSanitizer.sanitizeInlineStyle(
      div.style, opt_uriRewriter);
};


/**
 * Creates an DOM Document object that will not execute scripts or make
 * network requests while parsing HTML.
 * @return {!Document}
 * @private
 */
goog.html.sanitizer.CssSanitizer.createInertDocument_ = function() {
  // Documents created using window.document.implementation.createHTMLDocument()
  // use the same custom component registry as their parent document. This means
  // that parsing arbitrary HTML can result in calls to user-defined JavaScript.
  // This is worked around by creating a template element and its content's
  // document. See https://github.com/cure53/DOMPurify/issues/47.
  var doc = document;
  if (typeof HTMLTemplateElement === 'function') {
    doc =
        goog.dom.createElement(goog.dom.TagName.TEMPLATE).content.ownerDocument;
  }
  return doc.implementation.createHTMLDocument('');
};


/**
 * Provides a cross-browser way to get a CSS property names.
 * @param {!CSSStyleDeclaration} cssStyle A CSS style object.
 * @return {!Array<string>} CSS property names.
 * @private
 */
goog.html.sanitizer.CssSanitizer.getCssPropNames_ = function(cssStyle) {
  var propNames = [];
  if (goog.isArrayLike(cssStyle)) {
    // Gets property names via item().
    // https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-item
    propNames = goog.array.toArray(cssStyle);
  } else {
    // In IE8 and other older browsers we have to iterate over all the property
    // names. We skip cssText because it contains the unsanitized CSS, which
    // defeats the purpose.
    propNames = goog.object.getKeys(cssStyle);
    goog.array.remove(propNames, 'cssText');
  }
  return propNames;
};


/**
 * Provides a way to get a CSS value without falling prey to things like
 * &lt;form&gt;&lt;input name="propertyValue"&gt;
 * &lt;input name="propertyValue"&gt;&lt;/form&gt;. If not available,
 * likely only older browsers, fallback to a direct call.
 * @param {!CSSStyleDeclaration} cssStyle A CSS style object.
 * @param {string} propName A property name.
 * @return {string} Value of the property as parsed by the browser.
 * @private
 */
goog.html.sanitizer.CssSanitizer.getCssValue_ = function(cssStyle, propName) {
  var getPropDescriptor = Object.getOwnPropertyDescriptor(
      CSSStyleDeclaration.prototype, 'getPropertyValue');
  if (getPropDescriptor && cssStyle.getPropertyValue) {
    // getPropertyValue on Safari can return null
    return getPropDescriptor.value.call(cssStyle, propName) || '';
  } else if (cssStyle.getAttribute) {
    // In IE8 and other older browers we make a direct call to getAttribute.
    return String(cssStyle.getAttribute(propName) || '');
  } else {
    // Unsupported, likely quite old, browser.
    return '';
  }
};


/**
 * Provides a way to set a CSS value without falling prey to things like
 * &lt;form&gt;&lt;input name="property"&gt;
 * &lt;input name="property"&gt;&lt;/form&gt;. If not available,
 * likely only older browsers, fallback to a direct call.
 * @param {!CSSStyleDeclaration} cssStyle A CSS style object.
 * @param {string} propName A property name.
 * @param {?string} sanitizedValue Sanitized value of the property to be set
 *     on the CSS style object.
 * @private
 */
goog.html.sanitizer.CssSanitizer.setCssValue_ = function(
    cssStyle, propName, sanitizedValue) {
  if (sanitizedValue) {
    var setPropDescriptor = Object.getOwnPropertyDescriptor(
        CSSStyleDeclaration.prototype, 'setProperty');
    if (setPropDescriptor && cssStyle.setProperty) {
      setPropDescriptor.value.call(cssStyle, propName, sanitizedValue);
    } else if (cssStyle.setAttribute) {
      // In IE8 and other older browers we make a direct call to setAttribute.
      cssStyle.setAttribute(propName, sanitizedValue);
    }
  }
};


/**
 * Checks whether the property name specified should be disallowed.
 * @param {string} propName A property name.
 * @return {boolean} Whether the property name is disallowed.
 * @private
 */
goog.html.sanitizer.CssSanitizer.isDisallowedPropertyName_ = function(
    propName) {
  // getPropertyValue doesn't deal with custom variables properly and will NOT
  // decode CSS escapes (but the browser will do so silently). Simply disallow
  // custom variables (http://www.w3.org/TR/css-variables/#defining-variables).
  return goog.string.startsWith(propName, '--') ||
      goog.string.startsWith(propName, 'var');
};
