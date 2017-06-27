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
 * @fileoverview Potentially unsafe API for the HTML sanitizer.
 *
 * The HTML sanitizer enforces a default a safe policy, and also limits how the
 * policy can be relaxed, so that developers cannot misconfigure it and
 * introduce vulnerabilities.
 *
 * This file extends the HTML sanitizer's capabilities with potentially unsafe
 * configuration options, such as the ability to extend the tag whitelist (e.g.
 * to support web components).
 *
 * @supported IE 10+, Chrome 26+, Firefox 22+, Safari 7.1+, Opera 15+
 * @visibility {//closure/goog/html/sanitizer:approved_for_unsafe_config}
 */

goog.provide('goog.html.sanitizer.unsafe');

goog.require('goog.asserts');
goog.require('goog.html.sanitizer.HtmlSanitizer.Builder');
goog.require('goog.string');
goog.require('goog.string.Const');


/**
 * Extends the tag whitelist with the list of tags provided.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the new tags do not introduce untrusted code execution or unsanctioned
 * network activity.
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     the addition of these tags to the whitelist is safe. May include a
 *     security review ticket number.
 * @param {!goog.html.sanitizer.HtmlSanitizer.Builder} builder The builder
 *     whose tag whitelist should be extended.
 * @param {!Array<string>} tags A list of additional tags to allow through the
 *     sanitizer. Note that if the tag is also present in the blacklist,
 *     its addition to the whitelist has no effect. The tag names are
 *     case-insensitive.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.unsafe.alsoAllowTags = function(
    justification, builder, tags) {
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return builder.alsoAllowTagsPrivateDoNotAccessOrElse(tags);
};

/**
 * Installs custom attribute policies for the attributes provided in the list.
 * This can be used either on non-whitelisted attributes, effectively extending
 * the attribute whitelist, or on attributes that are whitelisted and already
 * have a policy, to override their policies.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the new tags do not introduce untrusted code execution or unsanctioned
 * network activity.
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     the addition of these attributes to the whitelist is safe. May include a
 *     security review ticket number.
 * @param {!goog.html.sanitizer.HtmlSanitizer.Builder} builder The builder
 *     whose attribute whitelist should be extended.
 * @param {!Array<(string|!goog.html.sanitizer.HtmlSanitizerAttributePolicy)>}
 *     attrs A list of attributes whose policy should be overridden. Attributes
 *     can come in of two forms:
 *     - string: allow all values and just trim whitespaces for this attribute
 *         on all tags.
 *     - HtmlSanitizerAttributePolicy: allows specifying a policy for a
 *         particular tag. The tagName can be '*', which means all tags. If no
 *         policy is passed, the default is allow all values and just trim
 *         whitespaces.
 *     The tag and attribute names are case-insensitive.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.unsafe.alsoAllowAttributes = function(
    justification, builder, attrs) {
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return builder.alsoAllowAttributesPrivateDoNotAccessOrElse(attrs);
};


/**
 * Turns off sanitization of TEMPLATE tag descendants. The output is still
 * safe to consume as a whole, but clients need to handle the contents of
 * TEMPLATE nodes carefully, hence its definition in the unsafe package.
 *
 * Note that this only applies to descendants of unsanitized template tags, not
 * to the tag itself, which must be manually added to the whitelist and removed
 * from the blacklist.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the new tags do not introduce untrusted code execution or unsanctioned
 * network activity.
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     the templates should not be sanitized, and why this is safe. May include
 *     a security review ticket number.
 * @param {!goog.html.sanitizer.HtmlSanitizer.Builder} builder The builder
 *     whose template tag descendants should not be sanitized.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 * @throws {Error} Thrown if the browser does not support TEMPLATE tags.
 *     In this case, careful post-sanitization handling wouldn't matter.
 */
goog.html.sanitizer.unsafe.keepUnsanitizedTemplateContents = function(
    justification, builder) {
  goog.asserts.assertString(
      goog.string.Const.unwrap(justification), 'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return builder.keepUnsanitizedTemplateContentsPrivateDoNotAccessOrElse();
};
