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
 * @fileoverview An HTML sanitizer that can satisfy a variety of security
 * policies.
 *
 * This package provides html sanitizing functions. It does not enforce string
 * to string conversion, instead returning a dom-like element when possible.
 *
 * Examples of usage of the static `HtmlSanitizer.sanitize`:
 * <pre>
 *   var safeHtml = HtmlSanitizer.sanitize('<script src="xss.js" />');
 *   goog.dom.safe.setInnerHtml(el, safeHtml);
 * </pre>
 *
 * @supported IE 10+, Chrome 26+, Firefox 22+, Safari 7.1+, Opera 15+
 */

goog.provide('goog.html.sanitizer.HtmlSanitizer');
goog.provide('goog.html.sanitizer.HtmlSanitizer.Builder');
goog.provide('goog.html.sanitizer.HtmlSanitizerAttributePolicy');
goog.provide('goog.html.sanitizer.HtmlSanitizerPolicy');
goog.provide('goog.html.sanitizer.HtmlSanitizerPolicyContext');
goog.provide('goog.html.sanitizer.HtmlSanitizerPolicyHints');
goog.provide('goog.html.sanitizer.HtmlSanitizerUrlPolicy');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.functions');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.sanitizer.AttributeSanitizedWhitelist');
goog.require('goog.html.sanitizer.AttributeWhitelist');
goog.require('goog.html.sanitizer.CssSanitizer');
goog.require('goog.html.sanitizer.SafeDomTreeProcessor');
goog.require('goog.html.sanitizer.TagBlacklist');
goog.require('goog.html.sanitizer.TagWhitelist');
goog.require('goog.html.sanitizer.noclobber');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.string.Const');


/**
 * Type for optional hints to policy handler functions.
 * @typedef {{
 *     tagName: (string|undefined),
 *     attributeName: (string|undefined),
 *     cssProperty: (string|undefined)
 *     }}
 */
goog.html.sanitizer.HtmlSanitizerPolicyHints;


/**
 * Type for optional context objects to the policy handler functions.
 * @typedef {{
 *     cssStyle: (?CSSStyleDeclaration|undefined)
 *     }}
 */
goog.html.sanitizer.HtmlSanitizerPolicyContext;


/**
 * Type for a policy function.
 * @typedef {function(string, goog.html.sanitizer.HtmlSanitizerPolicyHints=,
 *     goog.html.sanitizer.HtmlSanitizerPolicyContext=,
 *     (function(string, ?=, ?=, ?=):?string)=):?string}
 */
goog.html.sanitizer.HtmlSanitizerPolicy;


/**
 * Type for a URL policy function.
 *
 * @typedef {function(string, !goog.html.sanitizer.HtmlSanitizerPolicyHints=):
 *     ?goog.html.SafeUrl}
 */
goog.html.sanitizer.HtmlSanitizerUrlPolicy;


/**
 * Type for attribute policy configuration.
 * @typedef {{
 *     tagName: string,
 *     attributeName: string,
 *     policy: ?goog.html.sanitizer.HtmlSanitizerPolicy
 * }}
 */
goog.html.sanitizer.HtmlSanitizerAttributePolicy;


/**
 * Prefix used by all internal html sanitizer booking properties.
 * @private @const {string}
 */
goog.html.sanitizer.HTML_SANITIZER_BOOKKEEPING_PREFIX_ = 'data-sanitizer-';


/**
 * Attribute name added to span tags that replace unknown tags. The value of
 * this attribute is the name of the tag before the sanitization occurred.
 * @private @const {string}
 */
goog.html.sanitizer.HTML_SANITIZER_SANITIZED_ATTR_NAME_ =
    goog.html.sanitizer.HTML_SANITIZER_BOOKKEEPING_PREFIX_ + 'original-tag';

/**
 * A list of tags that contain '-' but are invalid custom element tags.
 * @private @const @dict {boolean}
 */
goog.html.sanitizer.HTML_SANITIZER_INVALID_CUSTOM_TAGS_ = {
  'ANNOTATION-XML': true,
  'COLOR-PROFILE': true,
  'FONT-FACE': true,
  'FONT-FACE-SRC': true,
  'FONT-FACE-URI': true,
  'FONT-FACE-FORMAT': true,
  'FONT-FACE-NAME': true,
  'MISSING-GLYPH': true,
};


/**
 * Special value for the STYLE container ID, which makes the sanitizer choose
 * a new random ID on each call to {@link sanitize}.
 * @private @const {string}
 */
goog.html.sanitizer.RANDOM_CONTAINER_ = '*';



/**
 * Creates an HTML sanitizer.
 * @param {!goog.html.sanitizer.HtmlSanitizer.Builder=} opt_builder
 * @final @constructor @struct
 * @extends {goog.html.sanitizer.SafeDomTreeProcessor}
 */
goog.html.sanitizer.HtmlSanitizer = function(opt_builder) {
  goog.html.sanitizer.SafeDomTreeProcessor.call(this);

  var builder = opt_builder || new goog.html.sanitizer.HtmlSanitizer.Builder();

  builder.installPolicies_();

  /**
   * @private @const {!Object<string, !goog.html.sanitizer.HtmlSanitizerPolicy>}
   */
  this.attributeHandlers_ = goog.object.clone(builder.attributeWhitelist_);

  /** @private @const {!Object<string, boolean>} */
  this.tagBlacklist_ = goog.object.clone(builder.tagBlacklist_);

  /** @private @const {!Object<string, boolean>} */
  this.tagWhitelist_ = goog.object.clone(builder.tagWhitelist_);

  /** @private @const {boolean} */
  this.shouldAddOriginalTagNames_ = builder.shouldAddOriginalTagNames_;

  // Add whitelist data-* attributes from the builder to the attributeHandlers
  // with a default cleanUpAttribute function. data-* attributes are inert as
  // per HTML5 specs, so not much sanitization needed.
  goog.array.forEach(builder.dataAttributeWhitelist_, function(dataAttr) {
    if (!goog.string.startsWith(dataAttr, 'data-')) {
      throw new goog.asserts.AssertionError(
          'Only "data-" attributes allowed, got: %s.', [dataAttr]);
    }
    if (goog.string.startsWith(
            dataAttr, goog.html.sanitizer.HTML_SANITIZER_BOOKKEEPING_PREFIX_)) {
      throw new goog.asserts.AssertionError(
          'Attributes with "%s" prefix are not allowed, got: %s.',
          [goog.html.sanitizer.HTML_SANITIZER_BOOKKEEPING_PREFIX_, dataAttr]);
    }

    this.attributeHandlers_['* ' + dataAttr.toUpperCase()] =
        /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (
            goog.html.sanitizer.HtmlSanitizer.cleanUpAttribute_);
  }, this);

  // Add whitelist custom element tags, ensures that they contains at least one
  // '-' and that they are not part of the reserved names.
  goog.array.forEach(builder.customElementTagWhitelist_, function(customTag) {
    customTag = customTag.toUpperCase();

    if (!goog.string.contains(customTag, '-') ||
        goog.html.sanitizer.HTML_SANITIZER_INVALID_CUSTOM_TAGS_[customTag]) {
      throw new goog.asserts.AssertionError(
          'Only valid custom element tag names allowed, got: %s.', [customTag]);
    }

    this.tagWhitelist_[customTag] = true;
  }, this);

  /** @private @const {!goog.html.sanitizer.HtmlSanitizerUrlPolicy} */
  this.networkRequestUrlPolicy_ = builder.networkRequestUrlPolicy_;

  /** @private @const {?string} */
  this.styleContainerId_ = builder.styleContainerId_;

  /** @private {?string} */
  this.currentStyleContainerId_ = null;

  /** @private @const {boolean} */
  this.inlineStyleRules_ = builder.inlineStyleRules_;
};
goog.inherits(
    goog.html.sanitizer.HtmlSanitizer,
    goog.html.sanitizer.SafeDomTreeProcessor);


/**
 * Transforms a {@link HtmlSanitizerUrlPolicy} into a
 * {@link HtmlSanitizerPolicy} by returning a wrapper that calls the {@link
 * HtmlSanitizerUrlPolicy} with the required arguments and unwraps the returned
 * {@link SafeUrl}. This is necessary because internally the sanitizer works
 * with {@HtmlSanitizerPolicy} to sanitize attributes, but its public API must
 * use {@HtmlSanitizerUrlPolicy} to ensure that callers do not violate SafeHtml
 * invariants in their custom handlers.
 * @param {!goog.html.sanitizer.HtmlSanitizerUrlPolicy} urlPolicy
 * @return {!goog.html.sanitizer.HtmlSanitizerPolicy}
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.wrapUrlPolicy_ = function(urlPolicy) {
  return /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (function(
      url, policyHints) {
    var trimmed = goog.html.sanitizer.HtmlSanitizer.cleanUpAttribute_(url);
    var safeUrl = urlPolicy(trimmed, policyHints);
    if (safeUrl &&
        goog.html.SafeUrl.unwrap(safeUrl) !=
            goog.html.SafeUrl.INNOCUOUS_STRING) {
      return goog.html.SafeUrl.unwrap(safeUrl);
    } else {
      return null;
    }
  });
};



/**
 * The builder for the HTML Sanitizer. All methods except build return
 * `this`.
 * @final @constructor @struct
 */
goog.html.sanitizer.HtmlSanitizer.Builder = function() {
  /**
   * A set of attribute sanitization functions. Default built-in handlers are
   * all tag-agnostic by design. Note that some attributes behave differently
   * when attached to different nodes (for example, the href attribute will
   * generally not make a network request, but &lt;link href=""&gt; does), and
   * so when necessary a tag-specific handler can be used to override a
   * tag-agnostic one.
   * @private {!Object<string, !goog.html.sanitizer.HtmlSanitizerPolicy>}
   */
  this.attributeWhitelist_ = {};
  goog.array.forEach(
      [
        goog.html.sanitizer.AttributeWhitelist,
        goog.html.sanitizer.AttributeSanitizedWhitelist
      ],
      function(wl) {
        goog.array.forEach(goog.object.getKeys(wl), function(attr) {
          this.attributeWhitelist_[attr] =
              /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */
              (goog.html.sanitizer.HtmlSanitizer.cleanUpAttribute_);
        }, this);
      },
      this);

  /**
   * A set of attribute handlers that should not inherit their default policy
   * during build().
   * @private @const {!Object<string, boolean>}
   */
  this.attributeOverrideList_ = {};

  /**
   * List of data attributes to whitelist. Data-attributes are inert and don't
   * require sanitization.
   * @private @const {!Array<string>}
   */
  this.dataAttributeWhitelist_ = [];

  /**
   * List of custom element tags to whitelist. Custom elements are inert on
   * their own and require code to actually be dangerous, so the risk is similar
   * to data-attributes.
   * @private @const {!Array<string>}
   */
  this.customElementTagWhitelist_ = [];

  /**
   * A tag blacklist, to effectively remove an element and its children from the
   * dom.
   * @private @const {!Object<string, boolean>}
   */
  this.tagBlacklist_ = goog.object.clone(goog.html.sanitizer.TagBlacklist);

  /**
   * A tag whitelist, to effectively allow an element and its children from the
   * dom.
   * @private {!Object<string, boolean>}
   */
  this.tagWhitelist_ = goog.object.clone(goog.html.sanitizer.TagWhitelist);

  /**
   * Whether non-whitelisted and non-blacklisted tags that have been converted
   * to &lt;span&rt; tags will contain the original tag in a data attribute.
   * @private {boolean}
   */
  this.shouldAddOriginalTagNames_ = false;

  /**
   * A function to be applied to URLs found on the parsing process which do not
   * trigger requests.
   * @private {!goog.html.sanitizer.HtmlSanitizerUrlPolicy}
   */
  this.urlPolicy_ = goog.html.sanitizer.HtmlSanitizer.defaultUrlPolicy_;

  /**
   * A function to be applied to urls found on the parsing process which may
   * trigger requests.
   * @private {!goog.html.sanitizer.HtmlSanitizerUrlPolicy}
   */
  this.networkRequestUrlPolicy_ =
      goog.html.sanitizer.HtmlSanitizer.defaultNetworkRequestUrlPolicy_;

  /**
   * A function to be applied to names found on the parsing process.
   * @private {!goog.html.sanitizer.HtmlSanitizerPolicy}
   */
  this.namePolicy_ = goog.html.sanitizer.HtmlSanitizer.defaultNamePolicy_;

  /**
   * A function to be applied to other tokens (i.e. classes and IDs) found on
   * the parsing process.
   * @private {!goog.html.sanitizer.HtmlSanitizerPolicy}
   */
  this.tokenPolicy_ = goog.html.sanitizer.HtmlSanitizer.defaultTokenPolicy_;

  /**
   * A function to sanitize inline CSS styles. Defaults to deny all.
   * @private {function(
   *     !goog.html.sanitizer.HtmlSanitizerPolicy,
   *     string,
   *     !goog.html.sanitizer.HtmlSanitizerPolicyHints,
   *     !goog.html.sanitizer.HtmlSanitizerPolicyContext):?string}
   */
  this.sanitizeInlineCssPolicy_ = goog.functions.NULL;

  /**
   * An optional ID to restrict the scope of CSS rules when STYLE tags are
   * allowed.
   * @private {?string}
   */
  this.styleContainerId_ = null;

  /**
   * Whether rules in STYLE tags should be inlined into style attributes.
   * @private {boolean}
   */
  this.inlineStyleRules_ = false;

  /**
   * True iff policies have been installed for the instance.
   * @private {boolean}
   */
  this.policiesInstalled_ = false;
};


/**
 * Extends the list of allowed data attributes.
 * @param {!Array<string>} dataAttributeWhitelist
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.allowDataAttributes =
    function(dataAttributeWhitelist) {
  goog.array.extend(this.dataAttributeWhitelist_, dataAttributeWhitelist);
  return this;
};

/**
 * Extends the list of allowed custom element tags.
 * @param {!Array<string>} customElementTagWhitelist
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.allowCustomElementTags =
    function(customElementTagWhitelist) {
  goog.array.extend(this.customElementTagWhitelist_, customElementTagWhitelist);
  return this;
};


/**
 * Allows form tags in the HTML. Without this all form tags and content will be
 * dropped.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.allowFormTag = function() {
  delete this.tagBlacklist_['FORM'];
  return this;
};


/**
 * Allows STYLE tags. Note that the sanitizer wraps the output of each call to
 * {@link sanitize} with a SPAN tag, give it a random ID unique across multiple
 * calls, and then restrict all CSS rules found inside STYLE tags to only apply
 * to children of the SPAN tag. This means that CSS rules in STYLE tags will
 * only apply to content provided in the same call to {@link sanitize}. This
 * feature is not compatible with {@link inlineStyleRules}.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.allowStyleTag = function() {
  if (this.inlineStyleRules_) {
    throw new Error('Rules from STYLE tags are already being inlined.');
  }
  delete this.tagBlacklist_['STYLE'];
  this.styleContainerId_ = goog.html.sanitizer.RANDOM_CONTAINER_;
  return this;
};


/**
 * Fixes the ID of the style container used for CSS rules found in STYLE tags,
 * and disables automatic wrapping with the container. This allows multiple
 * calls to {@link sanitize} to share STYLE rules. If opt_styleContainer is
 * missing, the sanitizer will stop restricting the scope of CSS rules
 * altogether. Requires {@link allowStyleTag} to be called first.
 * @param {string=} opt_styleContainer An optional container ID to restrict the
 *     scope of any CSS rule found in STYLE tags.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.withStyleContainer =
    function(opt_styleContainer) {
  if ('STYLE' in this.tagBlacklist_) {
    throw new Error('STYLE tags must first be allowed through allowStyleTag.');
  }
  if (opt_styleContainer != undefined) {
    if (!/^[a-zA-Z][\w-:\.]*$/.test(opt_styleContainer)) {
      throw new Error('Invalid ID.');
    }
    this.styleContainerId_ = opt_styleContainer;
  } else {
    this.styleContainerId_ = null;
  }
  return this;
};


/**
 * Converts rules in STYLE tags into style attributes on the tags they apply to.
 * This feature is not compatible with {@link withStyleContainer} and {@link
 * allowStyleTag}. This method requires {@link allowCssStyles} (otherwise rules
 * would be deleted after being inlined), and is not compatible with {@link
 * allowStyleTag}.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.inlineStyleRules =
    function() {
  if (this.sanitizeInlineCssPolicy_ == goog.functions.NULL) {
    throw new Error(
        'Inlining style rules requires allowing STYLE attributes ' +
        'first.');
  }
  if (!('STYLE' in this.tagBlacklist_)) {
    throw new Error(
        'You have already configured the builder to allow STYLE tags in the ' +
        'output. Inlining style rules would prevent STYLE tags from ' +
        'appearing in the output and conflict with such directive.');
  }
  this.inlineStyleRules_ = true;
  return this;
};


/**
 * Allows inline CSS styles.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.allowCssStyles =
    function() {
  this.sanitizeInlineCssPolicy_ =
      goog.html.sanitizer.HtmlSanitizer.sanitizeCssDeclarationList_;
  return this;
};


/**
 * Extends the tag whitelist (Package-internal utility method only).
 * @param {!Array<string>} tags The list of tags to be added to the whitelist.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 * @package
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype
    .alsoAllowTagsPrivateDoNotAccessOrElse = function(tags) {
  goog.array.forEach(tags, function(tag) {
    this.tagWhitelist_[tag.toUpperCase()] = true;
    delete this.tagBlacklist_[tag.toUpperCase()];
  }, this);
  return this;
};


/**
 * Extends the attribute whitelist (Package-internal utility method only).
 * @param {!Array<(string|!goog.html.sanitizer.HtmlSanitizerAttributePolicy)>}
 *     attrs The list of attributes to be added to the whitelist.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 * @package
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype
    .alsoAllowAttributesPrivateDoNotAccessOrElse = function(attrs) {
  goog.array.forEach(attrs, function(attr) {
    if (typeof attr === 'string') {
      attr = {tagName: '*', attributeName: attr, policy: null};
    }
    var handlerName = goog.html.sanitizer.HtmlSanitizer.attrIdentifier_(
        attr.tagName, attr.attributeName);
    this.attributeWhitelist_[handlerName] = attr.policy ?
        attr.policy :
        /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (
            goog.html.sanitizer.HtmlSanitizer.cleanUpAttribute_);
    this.attributeOverrideList_[handlerName] = true;
  }, this);
  return this;
};


/**
 * Allows only the provided whitelist of tags. Tags still need to be in the
 * TagWhitelist to be allowed.
 * <p>
 * SPAN tags are ALWAYS ALLOWED as part of the mechanism required to preserve
 * the HTML tree structure (when removing non-blacklisted tags and
 * non-whitelisted tags).
 * @param {!Array<string>} tagWhitelist
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 * @throws {Error} Thrown if an attempt is made to allow a non-whitelisted tag.
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.onlyAllowTags = function(
    tagWhitelist) {
  this.tagWhitelist_ = {'SPAN': true};
  goog.array.forEach(tagWhitelist, function(tag) {
    tag = tag.toUpperCase();
    if (goog.html.sanitizer.TagWhitelist[tag]) {
      this.tagWhitelist_[tag] = true;
    } else {
      throw new Error(
          'Only whitelisted tags can be allowed. See ' +
          'goog.html.sanitizer.TagWhitelist.');
    }
  }, this);
  return this;
};


/**
 * Allows only the provided whitelist of attributes, possibly setting a custom
 * policy for them. The set of tag/attribute combinations need to be a subset of
 * the currently allowed combinations.
 * <p>
 * Note that you cannot define a generic handler for an attribute if only a
 * tag-specific one is present, and vice versa. To configure the sanitizer to
 * accept an attribute only for a specific tag when only a generic handler is
 * whitelisted, use the goog.html.sanitizer.HtmlSanitizerPolicyHints parameter
 * and simply reject the attribute in unwanted tags.
 * <p>
 * Also note that the sanitizer's policy is still called after the provided one,
 * to ensure that supplying misconfigured policy cannot introduce
 * vulnerabilities. To completely override an existing attribute policy or to
 * allow new attributes, see the goog.html.sanitizer.unsafe package.
 * @param {!Array<(string|!goog.html.sanitizer.HtmlSanitizerAttributePolicy)>}
 *     attrWhitelist The subset of attributes that the sanitizer will accept.
 *     Attributes can come in of two forms:
 *     - string: allow all values for this attribute on all tags.
 *     - HtmlSanitizerAttributePolicy: allows specifying a policy for a
 *         particular tag. The tagName can be "*", which means all tags. If no
 *         policy is passed, the default is to allow all values.
 *     The tag and attribute names are case-insensitive.
 *     Note that the policy for id, URLs, names etc is controlled separately
 *     (using withCustom* methods).
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 * @throws {Error} Thrown if an attempt is made to allow a non-whitelisted
 *     attribute.
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.onlyAllowAttributes =
    function(attrWhitelist) {
  var oldWhitelist = this.attributeWhitelist_;
  this.attributeWhitelist_ = {};
  goog.array.forEach(attrWhitelist, function(attr) {
    if (goog.typeOf(attr) === 'string') {
      attr = {tagName: '*', attributeName: attr.toUpperCase(), policy: null};
    }
    var handlerName = goog.html.sanitizer.HtmlSanitizer.attrIdentifier_(
        attr.tagName, attr.attributeName);
    if (!oldWhitelist[handlerName]) {
      throw new Error('Only whitelisted attributes can be allowed.');
    }
    this.attributeWhitelist_[handlerName] = attr.policy ?
        attr.policy :
        /** @type {goog.html.sanitizer.HtmlSanitizerPolicy} */ (
            goog.html.sanitizer.HtmlSanitizer.cleanUpAttribute_);
  }, this);
  return this;
};


/**
 * Adds the original tag name in the data attribute 'original-tag' when unknown
 * tags are sanitized to &lt;span&rt;, so that caller can distinguish them from
 * actual &lt;span&rt; tags.
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.addOriginalTagNames =
    function() {
  this.shouldAddOriginalTagNames_ = true;
  return this;
};


/**
 * Sets a custom network URL policy.
 * @param {!goog.html.sanitizer.HtmlSanitizerUrlPolicy}
 *     customNetworkReqUrlPolicy
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype
    .withCustomNetworkRequestUrlPolicy = function(customNetworkReqUrlPolicy) {
  this.networkRequestUrlPolicy_ = customNetworkReqUrlPolicy;
  return this;
};


/**
 * Sets a custom non-network URL policy.
 * @param {!goog.html.sanitizer.HtmlSanitizerUrlPolicy} customUrlPolicy
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.withCustomUrlPolicy =
    function(customUrlPolicy) {
  this.urlPolicy_ = customUrlPolicy;
  return this;
};


/**
 * Sets a custom name policy.
 * @param {!goog.html.sanitizer.HtmlSanitizerPolicy} customNamePolicy
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.withCustomNamePolicy =
    function(customNamePolicy) {
  this.namePolicy_ = customNamePolicy;
  return this;
};


/**
 * Sets a custom token policy.
 * @param {!goog.html.sanitizer.HtmlSanitizerPolicy} customTokenPolicy
 * @return {!goog.html.sanitizer.HtmlSanitizer.Builder}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.withCustomTokenPolicy =
    function(customTokenPolicy) {
  this.tokenPolicy_ = customTokenPolicy;
  return this;
};


/**
 * Wraps a custom policy function with the sanitizer's default policy.
 * @param {?goog.html.sanitizer.HtmlSanitizerPolicy} customPolicy The custom
 *     policy for the tag/attribute combination.
 * @param {!goog.html.sanitizer.HtmlSanitizerPolicy} defaultPolicy The
 *     sanitizer's policy that is always called after the custom policy.
 * @return {!goog.html.sanitizer.HtmlSanitizerPolicy}
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.wrapPolicy_ = function(
    customPolicy, defaultPolicy) {
  return /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (function(
      value, hints, ctx, policy) {
    var result = customPolicy(value, hints, ctx, policy);
    return result == null ? null : defaultPolicy(result, hints, ctx, policy);
  });
};


/**
 * Installs the sanitizer's default policy for a specific tag/attribute
 * combination on the provided whitelist, but only if a policy already exists.
 * @param {!Object<string, !goog.html.sanitizer.HtmlSanitizerPolicy>}
 *     whitelist The whitelist to modify.
 * @param {!Object<string, boolean>} overrideList The set of attributes handlers
 *     that should not be wrapped with a default policy.
 * @param {string} key The tag/attribute combination
 * @param {!goog.html.sanitizer.HtmlSanitizerPolicy} defaultPolicy The
 *     sanitizer's policy.
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.installDefaultPolicy_ = function(
    whitelist, overrideList, key, defaultPolicy) {
  if (whitelist[key] && !overrideList[key]) {
    whitelist[key] = goog.html.sanitizer.HtmlSanitizer.wrapPolicy_(
        whitelist[key], defaultPolicy);
  }
};


/**
 * Builds and returns a goog.html.sanitizer.HtmlSanitizer object.
 * @return {!goog.html.sanitizer.HtmlSanitizer}
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.build = function() {
  return new goog.html.sanitizer.HtmlSanitizer(this);
};


/**
 * Installs the sanitization policies for the attributes.
 * May only be called once.
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.Builder.prototype.installPolicies_ =
    function() {
  if (this.policiesInstalled_) {
    throw new Error('HtmlSanitizer.Builder.build() can only be used once.');
  }

  var installPolicy = goog.html.sanitizer.HtmlSanitizer.installDefaultPolicy_;

  // Binding all the non-trivial attribute sanitizers to the appropriate,
  // potentially customizable, handling functions at build().
  installPolicy(
      this.attributeWhitelist_, this.attributeOverrideList_, '* USEMAP',
      /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (
          goog.html.sanitizer.HtmlSanitizer.sanitizeUrlFragment_));

  var urlAttributes = ['* ACTION', '* CITE', '* HREF'];
  var urlPolicy =
      goog.html.sanitizer.HtmlSanitizer.wrapUrlPolicy_(this.urlPolicy_);
  goog.array.forEach(urlAttributes, function(attribute) {
    installPolicy(
        this.attributeWhitelist_, this.attributeOverrideList_, attribute,
        urlPolicy);
  }, this);

  var networkUrlAttributes = [
    // LONGDESC can result in a network request. See b/23381636.
    '* LONGDESC', '* SRC', 'LINK HREF'
  ];
  var networkRequestUrlPolicy =
      goog.html.sanitizer.HtmlSanitizer.wrapUrlPolicy_(
          this.networkRequestUrlPolicy_);
  goog.array.forEach(networkUrlAttributes, function(attribute) {
    installPolicy(
        this.attributeWhitelist_, this.attributeOverrideList_, attribute,
        networkRequestUrlPolicy);
  }, this);

  var nameAttributes = ['* FOR', '* HEADERS', '* NAME'];
  goog.array.forEach(nameAttributes, function(attribute) {
    installPolicy(
        this.attributeWhitelist_, this.attributeOverrideList_, attribute,
        /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (goog.partial(
            goog.html.sanitizer.HtmlSanitizer.sanitizeName_,
            this.namePolicy_)));
  }, this);

  installPolicy(
      this.attributeWhitelist_, this.attributeOverrideList_, 'A TARGET',
      /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (goog.partial(
          goog.html.sanitizer.HtmlSanitizer.allowedAttributeValues_,
          ['_blank', '_self'])));

  installPolicy(
      this.attributeWhitelist_, this.attributeOverrideList_, '* CLASS',
      /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (goog.partial(
          goog.html.sanitizer.HtmlSanitizer.sanitizeClasses_,
          this.tokenPolicy_)));

  installPolicy(
      this.attributeWhitelist_, this.attributeOverrideList_, '* ID',
      /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */ (goog.partial(
          goog.html.sanitizer.HtmlSanitizer.sanitizeId_, this.tokenPolicy_)));

  installPolicy(
      this.attributeWhitelist_, this.attributeOverrideList_, '* STYLE',
      /** @type {!goog.html.sanitizer.HtmlSanitizerPolicy} */
      (goog.partial(this.sanitizeInlineCssPolicy_, networkRequestUrlPolicy)));

  this.policiesInstalled_ = true;
};


/**
 * The default policy for URLs: allow any.
 * @private @const {!goog.html.sanitizer.HtmlSanitizerUrlPolicy}
 */
goog.html.sanitizer.HtmlSanitizer.defaultUrlPolicy_ =
    goog.html.SafeUrl.sanitize;


/**
 * The default policy for URLs which cause network requests: drop all.
 * @private @const {!goog.html.sanitizer.HtmlSanitizerUrlPolicy}
 */
goog.html.sanitizer.HtmlSanitizer.defaultNetworkRequestUrlPolicy_ =
    goog.functions.NULL;


/**
 * The default policy for attribute names: drop all.
 * @private @const {!goog.html.sanitizer.HtmlSanitizerPolicy}
 */
goog.html.sanitizer.HtmlSanitizer.defaultNamePolicy_ = goog.functions.NULL;


/**
 * The default policy for other tokens (i.e. class names and IDs): drop all.
 * @private @const {!goog.html.sanitizer.HtmlSanitizerPolicy}
 */
goog.html.sanitizer.HtmlSanitizer.defaultTokenPolicy_ = goog.functions.NULL;



/**
 * Returns a key into the attribute handlers dictionary given a node name and
 * an attribute name. If no node name is given, returns a key applying to all
 * nodes.
 * @param {?string} nodeName
 * @param {string} attributeName
 * @return {string} key into attribute handlers dict
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.attrIdentifier_ = function(
    nodeName, attributeName) {
  if (!nodeName) {
    nodeName = '*';
  }
  return (nodeName + ' ' + attributeName).toUpperCase();
};


/**
 * Sanitizes a list of CSS declarations.
 * @param {goog.html.sanitizer.HtmlSanitizerPolicy} policySanitizeUrl
 * @param {string} attrValue
 * @param {goog.html.sanitizer.HtmlSanitizerPolicyHints} policyHints
 * @param {goog.html.sanitizer.HtmlSanitizerPolicyContext} policyContext
 * @return {?string} sanitizedCss from the policyContext
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.sanitizeCssDeclarationList_ = function(
    policySanitizeUrl, attrValue, policyHints, policyContext) {
  if (!policyContext.cssStyle) {
    return null;
  }
  var naiveUriRewriter = function(uri, prop) {
    policyHints.cssProperty = prop;
    var sanitizedUrl = policySanitizeUrl(uri, policyHints);
    if (sanitizedUrl == null) {
      return null;
    }
    return goog.html.uncheckedconversions
        .safeUrlFromStringKnownToSatisfyTypeContract(
            goog.string.Const.from(
                'HtmlSanitizerPolicy created with networkRequestUrlPolicy_ ' +
                'when installing \'* STYLE\' handler.'),
            sanitizedUrl);
  };
  var sanitizedStyle = goog.html.SafeStyle.unwrap(
      goog.html.sanitizer.CssSanitizer.sanitizeInlineStyle(
          policyContext.cssStyle, naiveUriRewriter));
  return sanitizedStyle == '' ? null : sanitizedStyle;
};


/**
 * Cleans up an attribute value that we don't particularly want to do anything
 * to. At the moment we just trim the whitespace.
 * @param {string} attrValue
 * @return {string} sanitizedAttrValue
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.cleanUpAttribute_ = function(attrValue) {
  return goog.string.trim(attrValue);
};


/**
 * Allows a set of attribute values.
 * @param {!Array<string>} allowedValues Set of allowed values lowercased.
 * @param {string} attrValue
 * @param {goog.html.sanitizer.HtmlSanitizerPolicyHints} policyHints
 * @return {?string} sanitizedAttrValue
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.allowedAttributeValues_ = function(
    allowedValues, attrValue, policyHints) {
  var trimmed = goog.string.trim(attrValue);
  return goog.array.contains(allowedValues, trimmed.toLowerCase()) ? trimmed :
                                                                     null;
};


/**
 * Sanitizes URL fragments.
 * @param {string} urlFragment
 * @param {goog.html.sanitizer.HtmlSanitizerPolicyHints} policyHints
 * @return {?string} sanitizedAttrValue
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.sanitizeUrlFragment_ = function(
    urlFragment, policyHints) {
  var trimmed = goog.string.trim(urlFragment);
  if (trimmed && trimmed.charAt(0) == '#') {
    // We do not apply the name or token policy to Url Fragments by design.
    return trimmed;
  }
  return null;
};


/**
 * Runs an attribute name through a name policy.
 * @param {goog.html.sanitizer.HtmlSanitizerPolicy} namePolicy
 * @param {string} attrName
 * @param {goog.html.sanitizer.HtmlSanitizerPolicyHints} policyHints
 * @return {?string} sanitizedAttrValue
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.sanitizeName_ = function(
    namePolicy, attrName, policyHints) {
  var trimmed = goog.string.trim(attrName);
  /* NOTE(user):
   * There are two cases to be concerned about - escaped quotes in attribute
   * values which is the responsibility of the serializer and illegal
   * characters.  The latter does violate the spec but I do not believe it has
   * a security consequence.
   */
  return namePolicy(trimmed, policyHints);
};


/**
 * Ensures that the class prefix is present on all space-separated tokens
 * (i.e. all class names).
 * @param {goog.html.sanitizer.HtmlSanitizerPolicy} tokenPolicy
 * @param {string} attrValue
 * @param {goog.html.sanitizer.HtmlSanitizerPolicyHints} policyHints
 * @return {?string} sanitizedAttrValue
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.sanitizeClasses_ = function(
    tokenPolicy, attrValue, policyHints) {
  var classes = attrValue.split(/(?:\s+)/);
  var sanitizedClasses = [];
  for (var i = 0; i < classes.length; i++) {
    var sanitizedClass = tokenPolicy(classes[i], policyHints);
    if (sanitizedClass) {
      sanitizedClasses.push(sanitizedClass);
    }
  }
  return sanitizedClasses.length == 0 ? null : sanitizedClasses.join(' ');
};


/**
 * Ensures that the id prefix is present.
 * @param {goog.html.sanitizer.HtmlSanitizerPolicy} tokenPolicy
 * @param {string} attrValue
 * @param {goog.html.sanitizer.HtmlSanitizerPolicyHints} policyHints
 * @return {?string} sanitizedAttrValue
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.sanitizeId_ = function(
    tokenPolicy, attrValue, policyHints) {
  var trimmed = goog.string.trim(attrValue);
  return tokenPolicy(trimmed, policyHints);
};


/**
 * Retrieves a HtmlSanitizerPolicyContext from a dirty node given an attribute
 * name.
 * @param {string} attributeName
 * @param {!Element} dirtyElement
 * @return {!goog.html.sanitizer.HtmlSanitizerPolicyContext}
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.getContext_ = function(
    attributeName, dirtyElement) {
  var policyContext = {cssStyle: undefined};
  if (attributeName == 'style') {
    policyContext.cssStyle =
        goog.html.sanitizer.noclobber.getElementStyle(dirtyElement);
  }
  return policyContext;
};


/**
 * Parses the DOM tree of a given HTML string, then walks the tree. For each
 * element, it creates a new sanitized version, applies sanitized attributes,
 * and returns a SafeHtml object representing the sanitized tree.
 * @param {string} unsanitizedHtml
 * @return {!goog.html.SafeHtml} Sanitized HTML
 */
goog.html.sanitizer.HtmlSanitizer.prototype.sanitize = function(
    unsanitizedHtml) {
  this.currentStyleContainerId_ = this.getStyleContainerId_();
  var sanitizedString = this.processToString(unsanitizedHtml);
  return goog.html.uncheckedconversions
      .safeHtmlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from('Output of HTML sanitizer'), sanitizedString);
};


/**
 * Parses the DOM tree of a given HTML string, then walks the tree. For each
 * element, it creates a new sanitized version, applies sanitized attributes,
 * and returns a span element containing the sanitized content. The root element
 * might define a class name to restrict the visibility of CSS rules contained
 * in tree.
 * @param {string} unsanitizedHtml
 * @return {!HTMLSpanElement} Sanitized HTML
 */
goog.html.sanitizer.HtmlSanitizer.prototype.sanitizeToDomNode = function(
    unsanitizedHtml) {
  this.currentStyleContainerId_ = this.getStyleContainerId_();
  return goog.html.sanitizer.SafeDomTreeProcessor.prototype.processToTree.call(
      this, unsanitizedHtml);
};


/** @override */
goog.html.sanitizer.HtmlSanitizer.prototype.processRoot = function(newRoot) {
  // If the container ID was manually specified, we let the caller add the
  // ancestor to activate the rules.
  if (this.currentStyleContainerId_ &&
      this.styleContainerId_ == goog.html.sanitizer.RANDOM_CONTAINER_) {
    newRoot.id = this.currentStyleContainerId_;
  }
};


/** @override */
goog.html.sanitizer.HtmlSanitizer.prototype.preProcessHtml = function(
    unsanitizedHtml) {
  if (!this.inlineStyleRules_) {
    return unsanitizedHtml;
  }
  // Inline style rules on the unsanitized input, so that we don't have to
  // worry about customTokenPolicy and customNamePolicy interferring with
  // selectors.
  // TODO(pelizzi): To generate an inert document tree to walk on, we are going
  // to parse the document into a DOM tree twice --
  // first with DOMParser here, and then by setting innerHTML on a new TEMPLATE
  // element in the main sanitization loop (see getDomTreeWalker in
  // safedomtreeprocessor.js). It would be best if we used one technique
  // consistently, parsing the input string once and passing a single inert tree
  // from one phase to another, but the decision to use TEMPLATE rather than
  // DomParser or document.createHtmlImplementation as the inert HTML container
  // for the main sanitization logic predates the work on supporting STYLE tags,
  // and we later found on that TEMPLATE inert documents do not have computed
  // stylesheet information on STYLE tags.
  var inertUnsanitizedDom =
      goog.html.sanitizer.CssSanitizer.safeParseHtmlAndGetInertElement(
          '<div>' + unsanitizedHtml + '</div>');
  goog.asserts.assert(
      inertUnsanitizedDom,
      'Older browsers that don\'t support inert ' +
          'parsing should not get to this branch');
  goog.html.sanitizer.CssSanitizer.inlineStyleRules(inertUnsanitizedDom);
  return inertUnsanitizedDom.innerHTML;
};


/**
 * Gets the style container ID for the sanitized output, or creates a new random
 * one. If no style container is necessary or style containment is disabled,
 * returns null.
 * @return {?string}
 * @private
 */
goog.html.sanitizer.HtmlSanitizer.prototype.getStyleContainerId_ = function() {
  var randomStyleContainmentEnabled =
      this.styleContainerId_ == goog.html.sanitizer.RANDOM_CONTAINER_;
  var randomStyleContainmentNecessary =
      !('STYLE' in this.tagBlacklist_) && 'STYLE' in this.tagWhitelist_;
  // If the builder was configured to create a random unique ID, create one, but
  // do so only if STYLE is allowed to begin with.
  return randomStyleContainmentEnabled && randomStyleContainmentNecessary ?
      'sanitizer-' + goog.string.getRandomString() :
      this.styleContainerId_;
};


/** @override */
goog.html.sanitizer.HtmlSanitizer.prototype.createTextNode = function(
    dirtyNode) {
  // Text nodes don't need to be sanitized, unless they are children of STYLE
  // and STYLE tags are allowed.
  var textContent = dirtyNode.data;
  // If STYLE is allowed, apply a policy to its text content. Ideally
  // sanitizing text content of tags shouldn't be hardcoded for STYLE, but we
  // have no plans to support sanitizing the text content of other nodes for
  // now.
  var dirtyParent = goog.html.sanitizer.noclobber.getParentNode(dirtyNode);
  if (dirtyParent &&
      goog.html.sanitizer.noclobber.getNodeName(dirtyParent).toLowerCase() ==
          'style' &&
      !('STYLE' in this.tagBlacklist_) && 'STYLE' in this.tagWhitelist_) {
    // Note that we don't have access to the parsed CSS declarations inside a
    // TEMPLATE tag, so the CSS sanitizer accepts a string and parses it
    // on its own using DOMParser.
    textContent = goog.html.SafeStyleSheet.unwrap(
        goog.html.sanitizer.CssSanitizer.sanitizeStyleSheetString(
            textContent, this.currentStyleContainerId_,
            goog.bind(function(uri, propName) {
              return this.networkRequestUrlPolicy_(
                  uri, {cssProperty: propName});
            }, this)));
  }
  return document.createTextNode(textContent);
};


/** @override */
goog.html.sanitizer.HtmlSanitizer.prototype.createElementWithoutAttributes =
    function(dirtyElement) {
  var dirtyName =
      goog.html.sanitizer.noclobber.getNodeName(dirtyElement).toUpperCase();
  if (dirtyName in this.tagBlacklist_) {
    // If it's blacklisted, completely remove the tag and its descendants.
    return null;
  }
  if (this.tagWhitelist_[dirtyName]) {
    // If it's whitelisted, keep as is.
    return document.createElement(dirtyName);
  }
  // If it's neither blacklisted nor whitelisted, replace with span. If the
  // relevant builder option is enabled, the tag will bear the original tag
  // name in a data attribute.
  var spanElement = goog.dom.createElement(goog.dom.TagName.SPAN);
  if (this.shouldAddOriginalTagNames_) {
    goog.html.sanitizer.noclobber.setElementAttribute(
        spanElement, goog.html.sanitizer.HTML_SANITIZER_SANITIZED_ATTR_NAME_,
        dirtyName.toLowerCase());
  }
  return spanElement;
};


/** @override */
goog.html.sanitizer.HtmlSanitizer.prototype.processElementAttribute = function(
    dirtyElement, attribute) {
  var attributeName = attribute.name;
  if (goog.string.startsWith(
          attributeName,
          goog.html.sanitizer.HTML_SANITIZER_BOOKKEEPING_PREFIX_)) {
    // This is the namespace for the data attributes added by the sanitizer. We
    // prevent untrusted content from setting them in the output.
    return null;
  }

  var elementName = goog.html.sanitizer.noclobber.getNodeName(dirtyElement);
  var unsanitizedAttrValue = attribute.value;

  // Create policy hints object
  var policyHints = {
    tagName: goog.string.trim(elementName).toLowerCase(),
    attributeName: goog.string.trim(attributeName).toLowerCase()
  };
  var policyContext = goog.html.sanitizer.HtmlSanitizer.getContext_(
      policyHints.attributeName, dirtyElement);

  // Prefer attribute handler for this specific tag.
  var tagHandlerIndex = goog.html.sanitizer.HtmlSanitizer.attrIdentifier_(
      elementName, attributeName);
  if (tagHandlerIndex in this.attributeHandlers_) {
    var handler = this.attributeHandlers_[tagHandlerIndex];
    return handler(unsanitizedAttrValue, policyHints, policyContext);
  }
  // Fall back on attribute handler for wildcard tag.
  var genericHandlerIndex =
      goog.html.sanitizer.HtmlSanitizer.attrIdentifier_(null, attributeName);
  if (genericHandlerIndex in this.attributeHandlers_) {
    var handler = this.attributeHandlers_[genericHandlerIndex];
    return handler(unsanitizedAttrValue, policyHints, policyContext);
  }
  return null;
};


/**
 * Sanitizes a HTML string using a sanitizer with default options.
 * @param {string} unsanitizedHtml
 * @return {!goog.html.SafeHtml} sanitizedHtml
 */
goog.html.sanitizer.HtmlSanitizer.sanitize = function(unsanitizedHtml) {
  var sanitizer = new goog.html.sanitizer.HtmlSanitizer.Builder().build();
  return sanitizer.sanitize(unsanitizedHtml);
};
