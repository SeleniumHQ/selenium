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

/**
 * @fileoverview Transitional utilities to unsafely trust random strings as
 * goog.html types. Intended for temporary use when upgrading a library that
 * used to accept plain strings to use safe types, but where it's not
 * practical to transitively update callers.
 *
 * IMPORTANT: No new code should use the conversion functions in this file,
 * they are intended for refactoring old code to use goog.html types. New code
 * should construct goog.html types via their APIs, template systems or
 * sanitizers. If that’s not possible it should use
 * goog.html.uncheckedconversions and undergo security review.

 *
 * The semantics of the conversions in goog.html.legacyconversions are very
 * different from the ones provided by goog.html.uncheckedconversions. The
 * latter are for use in code where it has been established through manual
 * security review that the value produced by a piece of code will always
 * satisfy the SafeHtml contract (e.g., the output of a secure HTML sanitizer).
 * In uses of goog.html.legacyconversions, this guarantee is not given -- the
 * value in question originates in unreviewed legacy code and there is no
 * guarantee that it satisfies the SafeHtml contract.
 *
 * There are only three valid uses of legacyconversions:
 *
 * 1. Introducing a goog.html version of a function which currently consumes
 * string and passes that string to a DOM API which can execute script - and
 * hence cause XSS - like innerHTML. For example, Dialog might expose a
 * setContent method which takes a string and sets the innerHTML property of
 * an element with it. In this case a setSafeHtmlContent function could be
 * added, consuming goog.html.SafeHtml instead of string, and using
 * goog.dom.safe.setInnerHtml instead of directly setting innerHTML.
 * setContent could then internally use legacyconversions to create a SafeHtml
 * from string and pass the SafeHtml to setSafeHtmlContent. In this scenario
 * remember to document the use of legacyconversions in the modified setContent
 * and consider deprecating it as well.
 *
 * 2. Automated refactoring of application code which handles HTML as string
 * but needs to call a function which only takes goog.html types. For example,
 * in the Dialog scenario from (1) an alternative option would be to refactor
 * setContent to accept goog.html.SafeHtml instead of string and then refactor
 * all current callers to use legacyconversions to pass SafeHtml. This is
 * generally preferable to (1) because it keeps the library clean of
 * legacyconversions, and makes code sites in application code that are
 * potentially vulnerable to XSS more apparent.
 *
 * 3. Old code which needs to call APIs which consume goog.html types and for
 * which it is prohibitively expensive to refactor to use goog.html types.
 * Generally, this is code where safety from XSS is either hopeless or
 * unimportant.
 *
 * @visibility {//closure/goog/html:approved_for_legacy_conversion}
 * @visibility {//closure/goog/bin/sizetests:__pkg__}
 */


goog.provide('goog.html.legacyconversions');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');


/**
 * Performs an "unchecked conversion" from string to SafeHtml for legacy API
 * purposes.
 *
 * Please read fileoverview documentation before using.
 *
 * @param {string} html A string to be converted to SafeHtml.
 * @return {!goog.html.SafeHtml} The value of html, wrapped in a SafeHtml
 *     object.
 */
goog.html.legacyconversions.safeHtmlFromString = function(html) {
  goog.html.legacyconversions.reportCallback_();
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      html, null /* dir */);
};


/**
 * Performs an "unchecked conversion" from string to SafeStyle for legacy API
 * purposes.
 *
 * Please read fileoverview documentation before using.
 *
 * @param {string} style A string to be converted to SafeStyle.
 * @return {!goog.html.SafeStyle} The value of style, wrapped in a SafeStyle
 *     object.
 */
goog.html.legacyconversions.safeStyleFromString = function(style) {
  goog.html.legacyconversions.reportCallback_();
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      style);
};


/**
 * Performs an "unchecked conversion" from string to SafeStyleSheet for legacy
 * API purposes.
 *
 * Please read fileoverview documentation before using.
 *
 * @param {string} styleSheet A string to be converted to SafeStyleSheet.
 * @return {!goog.html.SafeStyleSheet} The value of style sheet, wrapped in
 *     a SafeStyleSheet object.
 */
goog.html.legacyconversions.safeStyleSheetFromString = function(styleSheet) {
  goog.html.legacyconversions.reportCallback_();
  return goog.html.SafeStyleSheet
      .createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet);
};


/**
 * Performs an "unchecked conversion" from string to SafeUrl for legacy API
 * purposes.
 *
 * Please read fileoverview documentation before using.
 *
 * @param {string} url A string to be converted to SafeUrl.
 * @return {!goog.html.SafeUrl} The value of url, wrapped in a SafeUrl
 *     object.
 */
goog.html.legacyconversions.safeUrlFromString = function(url) {
  goog.html.legacyconversions.reportCallback_();
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Performs an "unchecked conversion" from string to TrustedResourceUrl for
 * legacy API purposes.
 *
 * Please read fileoverview documentation before using.
 *
 * @param {string} url A string to be converted to TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl} The value of url, wrapped in a
 *     TrustedResourceUrl object.
 */
goog.html.legacyconversions.trustedResourceUrlFromString = function(url) {
  goog.html.legacyconversions.reportCallback_();
  return goog.html.TrustedResourceUrl
      .createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};

/**
 * @private {function(): undefined}
 */
goog.html.legacyconversions.reportCallback_ = goog.nullFunction;


/**
 * Sets a function that will be called every time a legacy conversion is
 * performed. The function is called with no parameters but it can use
 * goog.debug.getStacktrace to get a stacktrace.
 *
 * @param {function(): undefined} callback Error callback as defined above.
 */
goog.html.legacyconversions.setReportCallback = function(callback) {
  goog.html.legacyconversions.reportCallback_ = callback;
};
