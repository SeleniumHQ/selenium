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
 * @fileoverview Unchecked conversions to create values of goog.html types from
 * plain strings.  Use of these functions could potentially result in instances
 * of goog.html types that violate their type contracts, and hence result in
 * security vulnerabilties.
 *
 * Therefore, all uses of the methods herein must be carefully security
 * reviewed.  Avoid use of the methods in this file whenever possible; instead
 * prefer to create instances of goog.html types using inherently safe builders
 * or template systems.
 *
 *
 *
 * @visibility {//closure/goog/html:approved_for_unchecked_conversion}
 * @visibility {//closure/goog/bin/sizetests:__pkg__}
 */


goog.provide('goog.html.uncheckedconversions');

goog.require('goog.asserts');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeScript');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string');
goog.require('goog.string.Const');


/**
 * Performs an "unchecked conversion" to SafeHtml from a plain string that is
 * known to satisfy the SafeHtml type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code html} satisfies the SafeHtml type contract in all
 * possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} html A string that is claimed to adhere to the SafeHtml
 *     contract.
 * @param {?goog.i18n.bidi.Dir=} opt_dir The optional directionality of the
 *     SafeHtml to be constructed. A null or undefined value signifies an
 *     unknown directionality.
 * @return {!goog.html.SafeHtml} The value of html, wrapped in a SafeHtml
 *     object.
 * @suppress {visibility} For access to SafeHtml.create...  Note that this
 *     use is appropriate since this method is intended to be "package private"
 *     withing goog.html.  DO NOT call SafeHtml.create... from outside this
 *     package; use appropriate wrappers instead.
 */
goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract =
    function(justification, html, opt_dir) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      html, opt_dir || null);
};


/**
 * Performs an "unchecked conversion" to SafeScript from a plain string that is
 * known to satisfy the SafeScript type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code script} satisfies the SafeScript type contract in
 * all possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} script The string to wrap as a SafeScript.
 * @return {!goog.html.SafeScript} The value of {@code script}, wrapped in a
 *     SafeScript object.
 */
goog.html.uncheckedconversions.safeScriptFromStringKnownToSatisfyTypeContract =
    function(justification, script) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmpty(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(
      script);
};


/**
 * Performs an "unchecked conversion" to SafeStyle from a plain string that is
 * known to satisfy the SafeStyle type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code style} satisfies the SafeUrl type contract in all
 * possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} style The string to wrap as a SafeStyle.
 * @return {!goog.html.SafeStyle} The value of {@code style}, wrapped in a
 *     SafeStyle object.
 */
goog.html.uncheckedconversions.safeStyleFromStringKnownToSatisfyTypeContract =
    function(justification, style) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      style);
};


/**
 * Performs an "unchecked conversion" to SafeStyleSheet from a plain string
 * that is known to satisfy the SafeStyleSheet type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code styleSheet} satisfies the SafeUrl type contract in
 * all possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} styleSheet The string to wrap as a SafeStyleSheet.
 * @return {!goog.html.SafeStyleSheet} The value of {@code styleSheet}, wrapped
 *     in a SafeStyleSheet object.
 */
goog.html.uncheckedconversions
    .safeStyleSheetFromStringKnownToSatisfyTypeContract = function(
    justification, styleSheet) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeStyleSheet
      .createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet);
};


/**
 * Performs an "unchecked conversion" to SafeUrl from a plain string that is
 * known to satisfy the SafeUrl type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code url} satisfies the SafeUrl type contract in all
 * possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} url The string to wrap as a SafeUrl.
 * @return {!goog.html.SafeUrl} The value of {@code url}, wrapped in a SafeUrl
 *     object.
 */
goog.html.uncheckedconversions.safeUrlFromStringKnownToSatisfyTypeContract =
    function(justification, url) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Performs an "unchecked conversion" to TrustedResourceUrl from a plain string
 * that is known to satisfy the TrustedResourceUrl type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code url} satisfies the TrustedResourceUrl type contract
 * in all possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} url The string to wrap as a TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl} The value of {@code url}, wrapped in
 *     a TrustedResourceUrl object.
 */
goog.html.uncheckedconversions
    .trustedResourceUrlFromStringKnownToSatisfyTypeContract = function(
    justification, url) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.TrustedResourceUrl
      .createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};
