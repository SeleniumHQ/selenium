// Copyright 2018 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A sanitizer for CSS property values. It is intended
 * to be used on the result of {@code CSSStyleDeclaration.getPropertyValue},
 * which has already been parsed and validated by the browser out of stylesheets
 * and inline style attributes. At the moment, it's only purpose is to detect
 * CSS functions to apply a whitelist and support rewriting of URLs.
 * @package
 */

goog.module('goog.html.sanitizer.CssPropertySanitizer');
goog.module.declareLegacyNamespace();

var SafeUrl = goog.require('goog.html.SafeUrl');
var googAsserts = goog.require('goog.asserts');
var googObject = goog.require('goog.object');
var googString = goog.require('goog.string');


/**
 * Allowed CSS functions
 * @const {!Object<string,boolean>}
 */
var ALLOWED_FUNCTIONS = googObject.createSet(
    'rgb', 'rgba', 'alpha', 'rect', 'image', 'linear-gradient',
    'radial-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient',
    'cubic-bezier', 'matrix', 'perspective', 'rotate', 'rotate3d', 'rotatex',
    'rotatey', 'steps', 'rotatez', 'scale', 'scale3d', 'scalex', 'scaley',
    'scalez', 'skew', 'skewx', 'skewy', 'translate', 'translate3d',
    'translatex', 'translatey', 'translatez');

/**
 * The set of characters that need to be normalized inside url("...").
 * We normalize newlines because they are not allowed inside quoted strings,
 * normalize quote characters, angle-brackets, and asterisks because they
 * could be used to break out of the URL or introduce targets for CSS
 * error recovery.  We normalize parentheses since they delimit unquoted
 * URLs and calls and could be a target for error recovery.
 * @const {!RegExp}
 */
var NORM_URL_REGEXP = /[\n\f\r\"\'()*<>]/g;

/**
 * The replacements for NORM_URL_REGEXP.
 * @const {!Object<string, string>}
 */
var NORM_URL_REPLACEMENTS = {
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
 * @return {string} Normalized character.
 */
function normalizeUrlChar(ch) {
  return googAsserts.assert(NORM_URL_REPLACEMENTS[ch]);
}

/**
 * Constructs a safe URI from a given URI and prop using a given uriRewriter
 * function.
 * @param {string} uri URI to be sanitized.
 * @param {string} propName Property name which contained the URI.
 * @param {?function(string, string):?SafeUrl} uriRewriter A URI rewriter that
 *     returns a {@link SafeUrl}.
 * @return {?string} Safe URI for use in CSS.
 */
function getSafeUri(uri, propName, uriRewriter) {
  if (!uriRewriter) {
    return null;
  }
  var safeUri = uriRewriter(uri, propName);
  if (safeUri && SafeUrl.unwrap(safeUri) != SafeUrl.INNOCUOUS_STRING) {
    return 'url("' +
        SafeUrl.unwrap(safeUri).replace(NORM_URL_REGEXP, normalizeUrlChar) +
        '")';
  }
  return null;
}

/**
 * Sanitizes the value for a given a browser-parsed CSS value.
 * @param {string} propName A property name.
 * @param {string} propValue Value of the property as parsed by the browser.
 * @param {function(string, string):?SafeUrl=} opt_uriRewriter A URI
 *     rewriter that returns an unwrapped goog.html.SafeUrl.
 * @return {?string} Sanitized property value or null if the property should be
 *     rejected altogether.
 */
exports.sanitizeProperty = function(propName, propValue, opt_uriRewriter) {
  propValue = googString.trim(propValue);
  if (propValue == '') {
    return null;
  }

  if (googString.caseInsensitiveStartsWith(propValue, 'url(')) {
    // Urls can only appear as the only function call in the property value, and
    // are rewritten according to the policy implemented in opt_uriRewriter.
    if (!propValue.endsWith(')') || googString.countOf(propValue, '(') > 1 ||
        googString.countOf(propValue, ')') > 1) {
      // This is a little stricter than it needs to be (e.g. it will refuse
      // url("http://foo.com/a(b"), but it's better to err on the side of
      // caution (even though getSafeUri is guaranteed to yield a single,
      // SafeHtml-compliant url(...) value).
      return null;
    }
    // TODO(pelizzi): use HtmlSanitizerUrlPolicy for opt_uriRewriter.
    if (!opt_uriRewriter) {
      return null;
    }
    // TODO(danesh): Check if we need to resolve this URI.
    var uri = googString.stripQuotes(
        propValue.substring(4, propValue.length - 1), '"\'');

    return getSafeUri(uri, propName, opt_uriRewriter);
  } else if (propValue.indexOf('(') > 0) {
    // Functions are filtered through a whitelist. String arguments (e.g.
    // url("...")) are not supported, because IE/EDGE can feed back malformed
    // output when given malformed input (e.g. url("ab"c")). We would need a
    // full parser to address this.
    if (/"|'/.test(propValue)) {
      return null;
    }
    var regex = /([\-\w]+)\(/g;
    var match;
    while (match = regex.exec(propValue)) {
      if (!(match[1] in ALLOWED_FUNCTIONS)) {
        return null;
      }
    }
    return propValue;
  } else {
    // Everything else is allowed.
    // TODO(pelizzi): This was kept as-is during refactoring to maintain the
    // existing behavior. In particular we allow 'quotes: "xx" "yy"'. But
    // ideally we should only allow values without quotes and parentheses here.
    return propValue;
  }
};
