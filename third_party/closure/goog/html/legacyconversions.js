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
 * @fileoverview Conversions from plain string to goog.html types for use in
 * legacy APIs that do not use goog.html types.
 *
 * This file provides conversions to create values of goog.html types from plain
 * strings.  These conversions are intended for use in legacy APIs that consume
 * HTML in the form of plain string types, but whose implementations use
 * goog.html types internally (and expose such types in an augmented, HTML-type-
 * safe API).
 *
 * IMPORTANT: No new code should use the conversion functions in this file.
 *
 * The conversion functions in this file are guarded with global flag
 * (goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS). If set to false, it
 * effectively "locks in" an entire application to only use HTML-type-safe APIs.
 *
 * Intended use of the functions in this file are as follows:
 *
 * Many Closure and application-specific classes expose methods that consume
 * values that in the class' implementation are forwarded to DOM APIs that can
 * result in security vulnerabilities.  For example, goog.ui.Dialog's setContent
 * method consumes a string that is assigned to an element's innerHTML property;
 * if this string contains untrusted (attacker-controlled) data, this can result
 * in a cross-site-scripting vulnerability.
 *
 * Widgets such as goog.ui.Dialog are being augmented to expose safe APIs
 * expressed in terms of goog.html types.  For instance, goog.ui.Dialog has a
 * method setSafeHtmlContent that consumes an object of type goog.html.SafeHtml,
 * a type whose contract guarantees that its value is safe to use in HTML
 * context, i.e. can be safely assigned to .innerHTML. An application that only
 * uses this API is forced to only supply values of this type, i.e. values that
 * are safe.
 *
 * However, the legacy method setContent cannot (for the time being) be removed
 * from goog.ui.Dialog, due to a large number of existing callers.  The
 * implementation of goog.ui.Dialog has been refactored to use
 * goog.html.SafeHtml throughout.  This in turn requires that the value consumed
 * by its setContent method is converted to goog.html.SafeHtml in an unchecked
 * conversion. The conversion function is provided by this file:
 * goog.html.legacyconversions.safeHtmlFromString.
 *
 * Note that the semantics of the conversions in goog.html.legacyconversions are
 * very different from the ones provided by goog.html.uncheckedconversions:  The
 * latter are for use in code where it has been established through manual
 * security review that the value produced by a piece of code must always
 * satisfy the SafeHtml contract (e.g., the output of a secure HTML sanitizer).
 * In uses of goog.html.legacyconversions, this guarantee is not given -- the
 * value in question originates in unreviewed legacy code and there is no
 * guarantee that it satisfies the SafeHtml contract.
 *
 * To establish correctness with confidence, application code should be
 * refactored to use SafeHtml instead of plain string to represent HTML markup,
 * and to use goog.html-typed APIs (e.g., goog.ui.Dialog#setSafeHtmlContent
 * instead of goog.ui.Dialog#setContent).
 *
 * To prevent introduction of new vulnerabilities, application owners can
 * effectively disable unsafe legacy APIs by compiling with the define
 * goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS set to false.  When
 * set, this define causes the conversion methods in this file to
 * unconditionally throw an exception.
 *
 * Note that new code should always be compiled with
 * ALLOW_LEGACY_CONVERSIONS=false.  At some future point, the default for this
 * define may change to false.
 */


goog.provide('goog.html.legacyconversions');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');


/**
 * @define {boolean} Whether conversion from string to goog.html types for
 * legacy API purposes is permitted.
 *
 * If false, the conversion functions in this file unconditionally throw an
 * exception.
 */
goog.define('goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS', true);


/**
 * Performs an "unchecked conversion" from string to SafeHtml for legacy API
 * purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * @param {string} html A string to be converted to SafeHtml.
 * @return {!goog.html.SafeHtml} The value of html, wrapped in a SafeHtml
 *     object.
 */
goog.html.legacyconversions.safeHtmlFromString = function(html) {
  goog.html.legacyconversions.throwIfConversionDisallowed_();
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      html, null /* dir */);
};


/**
 * Performs an "unchecked conversion" from string to TrustedResourceUrl for
 * legacy API purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * @param {string} url A string to be converted to TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl} The value of url, wrapped in a
 *     TrustedResourceUrl object.
 */
goog.html.legacyconversions.trustedResourceUrlFromString = function(url) {
  goog.html.legacyconversions.throwIfConversionDisallowed_();
  return goog.html.TrustedResourceUrl.
      createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Performs an "unchecked conversion" from string to SafeUrl for legacy API
 * purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * @param {string} url A string to be converted to SafeUrl.
 * @return {!goog.html.SafeUrl} The value of url, wrapped in a SafeUrl
 *     object.
 */
goog.html.legacyconversions.safeUrlFromString = function(url) {
  goog.html.legacyconversions.throwIfConversionDisallowed_();
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
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


/**
 * Checks whether legacy conversion is allowed. Throws an exception if not.
 * @private
 */
goog.html.legacyconversions.throwIfConversionDisallowed_ = function() {
  if (!goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS) {
    throw Error(
        'Error: Legacy conversion from string to goog.html types is disabled');
  }
  goog.html.legacyconversions.reportCallback_();
};
