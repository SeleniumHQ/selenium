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
 * @fileoverview The SafeHtml type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeHtml');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.dom.tags');
goog.require('goog.html.SafeScript');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.DirectionalString');
goog.require('goog.labs.userAgent.browser');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string that is safe to use in HTML context in DOM APIs and HTML documents.
 *
 * A SafeHtml is a string-like object that carries the security type contract
 * that its value as a string will not cause untrusted script execution when
 * evaluated as HTML in a browser.
 *
 * Values of this type are guaranteed to be safe to use in HTML contexts,
 * such as, assignment to the innerHTML DOM property, or interpolation into
 * a HTML template in HTML PC_DATA context, in the sense that the use will not
 * result in a Cross-Site-Scripting vulnerability.
 *
 * Instances of this type must be created via the factory methods
 * ({@code goog.html.SafeHtml.create}, {@code goog.html.SafeHtml.htmlEscape}),
 * etc and not by invoking its constructor.  The constructor intentionally
 * takes no parameters and the type is immutable; hence only a default instance
 * corresponding to the empty string can be obtained via constructor invocation.
 *
 * @see goog.html.SafeHtml#create
 * @see goog.html.SafeHtml#htmlEscape
 * @constructor
 * @final
 * @struct
 * @implements {goog.i18n.bidi.DirectionalString}
 * @implements {goog.string.TypedString}
 */
goog.html.SafeHtml = function() {
  /**
   * The contained value of this SafeHtml.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeHtml#unwrap
   * @const {!Object}
   * @private
   */
  this.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;

  /**
   * This SafeHtml's directionality, or null if unknown.
   * @private {?goog.i18n.bidi.Dir}
   */
  this.dir_ = null;
};


/**
 * @override
 * @const
 */
goog.html.SafeHtml.prototype.implementsGoogI18nBidiDirectionalString = true;


/** @override */
goog.html.SafeHtml.prototype.getDirection = function() {
  return this.dir_;
};


/**
 * @override
 * @const
 */
goog.html.SafeHtml.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this SafeHtml's value as string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeHtml}, use {@code goog.html.SafeHtml.unwrap} instead of
 * this method. If in doubt, assume that it's security relevant. In particular,
 * note that goog.html functions which return a goog.html type do not guarantee
 * that the returned instance is of the right type. For example:
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
 * @see goog.html.SafeHtml#unwrap
 * @override
 */
goog.html.SafeHtml.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeHtml, use
   * {@code goog.html.SafeHtml.unwrap}.
   *
   * @see goog.html.SafeHtml#unwrap
   * @override
   */
  goog.html.SafeHtml.prototype.toString = function() {
    return 'SafeHtml{' + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ +
        '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a SafeHtml
 * object, and returns its value.
 * @param {!goog.html.SafeHtml} safeHtml The object to extract from.
 * @return {string} The SafeHtml object's contained string, unless the run-time
 *     type check fails. In that case, {@code unwrap} returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeHtml.unwrap = function(safeHtml) {
  // Perform additional run-time type-checking to ensure that safeHtml is indeed
  // an instance of the expected type.  This provides some additional protection
  // against security bugs due to application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeHtml instanceof goog.html.SafeHtml &&
      safeHtml.constructor === goog.html.SafeHtml &&
      safeHtml.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeHtml.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type SafeHtml, got \'' +
        safeHtml + '\' of type ' + goog.typeOf(safeHtml));
    return 'type_error:SafeHtml';
  }
};


/**
 * Shorthand for union of types that can sensibly be converted to strings
 * or might already be SafeHtml (as SafeHtml is a goog.string.TypedString).
 * @private
 * @typedef {string|number|boolean|!goog.string.TypedString|
 *           !goog.i18n.bidi.DirectionalString}
 */
goog.html.SafeHtml.TextOrHtml_;


/**
 * Returns HTML-escaped text as a SafeHtml object.
 *
 * If text is of a type that implements
 * {@code goog.i18n.bidi.DirectionalString}, the directionality of the new
 * {@code SafeHtml} object is set to {@code text}'s directionality, if known.
 * Otherwise, the directionality of the resulting SafeHtml is unknown (i.e.,
 * {@code null}).
 *
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
 *     the parameter is of type SafeHtml it is returned directly (no escaping
 *     is done).
 * @return {!goog.html.SafeHtml} The escaped text, wrapped as a SafeHtml.
 */
goog.html.SafeHtml.htmlEscape = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var dir = null;
  if (textOrHtml.implementsGoogI18nBidiDirectionalString) {
    dir = textOrHtml.getDirection();
  }
  var textAsString;
  if (textOrHtml.implementsGoogStringTypedString) {
    textAsString = textOrHtml.getTypedStringValue();
  } else {
    textAsString = String(textOrHtml);
  }
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      goog.string.htmlEscape(textAsString), dir);
};


/**
 * Returns HTML-escaped text as a SafeHtml object, with newlines changed to
 * &lt;br&gt;.
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
 *     the parameter is of type SafeHtml it is returned directly (no escaping
 *     is done).
 * @return {!goog.html.SafeHtml} The escaped text, wrapped as a SafeHtml.
 */
goog.html.SafeHtml.htmlEscapePreservingNewlines = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      goog.string.newLineToBr(goog.html.SafeHtml.unwrap(html)),
      html.getDirection());
};


/**
 * Returns HTML-escaped text as a SafeHtml object, with newlines changed to
 * &lt;br&gt; and escaping whitespace to preserve spatial formatting. Character
 * entity #160 is used to make it safer for XML.
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
 *     the parameter is of type SafeHtml it is returned directly (no escaping
 *     is done).
 * @return {!goog.html.SafeHtml} The escaped text, wrapped as a SafeHtml.
 */
goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces = function(
    textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      goog.string.whitespaceEscape(goog.html.SafeHtml.unwrap(html)),
      html.getDirection());
};


/**
 * Coerces an arbitrary object into a SafeHtml object.
 *
 * If {@code textOrHtml} is already of type {@code goog.html.SafeHtml}, the same
 * object is returned. Otherwise, {@code textOrHtml} is coerced to string, and
 * HTML-escaped. If {@code textOrHtml} is of a type that implements
 * {@code goog.i18n.bidi.DirectionalString}, its directionality, if known, is
 * preserved.
 *
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text or SafeHtml to
 *     coerce.
 * @return {!goog.html.SafeHtml} The resulting SafeHtml object.
 * @deprecated Use goog.html.SafeHtml.htmlEscape.
 */
goog.html.SafeHtml.from = goog.html.SafeHtml.htmlEscape;


/**
 * @const
 * @private
 */
goog.html.SafeHtml.VALID_NAMES_IN_TAG_ = /^[a-zA-Z0-9-]+$/;


/**
 * Set of attributes containing URL as defined at
 * http://www.w3.org/TR/html5/index.html#attributes-1.
 * @private @const {!Object<string,boolean>}
 */
goog.html.SafeHtml.URL_ATTRIBUTES_ = goog.object.createSet(
    'action', 'cite', 'data', 'formaction', 'href', 'manifest', 'poster',
    'src');


/**
 * Tags which are unsupported via create(). They might be supported via a
 * tag-specific create method. These are tags which might require a
 * TrustedResourceUrl in one of their attributes or a restricted type for
 * their content.
 * @private @const {!Object<string,boolean>}
 */
goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_ = goog.object.createSet(
    goog.dom.TagName.APPLET, goog.dom.TagName.BASE, goog.dom.TagName.EMBED,
    goog.dom.TagName.IFRAME, goog.dom.TagName.LINK, goog.dom.TagName.MATH,
    goog.dom.TagName.META, goog.dom.TagName.OBJECT, goog.dom.TagName.SCRIPT,
    goog.dom.TagName.STYLE, goog.dom.TagName.SVG, goog.dom.TagName.TEMPLATE);


/**
 * @typedef {string|number|goog.string.TypedString|
 *     goog.html.SafeStyle.PropertyMap|undefined}
 */
goog.html.SafeHtml.AttributeValue;


/**
 * Creates a SafeHtml content consisting of a tag with optional attributes and
 * optional content.
 *
 * For convenience tag names and attribute names are accepted as regular
 * strings, instead of goog.string.Const. Nevertheless, you should not pass
 * user-controlled values to these parameters. Note that these parameters are
 * syntactically validated at runtime, and invalid values will result in
 * an exception.
 *
 * Example usage:
 *
 * goog.html.SafeHtml.create('br');
 * goog.html.SafeHtml.create('div', {'class': 'a'});
 * goog.html.SafeHtml.create('p', {}, 'a');
 * goog.html.SafeHtml.create('p', {}, goog.html.SafeHtml.create('br'));
 *
 * goog.html.SafeHtml.create('span', {
 *   'style': {'margin': '0'}
 * });
 *
 * To guarantee SafeHtml's type contract is upheld there are restrictions on
 * attribute values and tag names.
 *
 * - For attributes which contain script code (on*), a goog.string.Const is
 *   required.
 * - For attributes which contain style (style), a goog.html.SafeStyle or a
 *   goog.html.SafeStyle.PropertyMap is required.
 * - For attributes which are interpreted as URLs (e.g. src, href) a
 *   goog.html.SafeUrl, goog.string.Const or string is required. If a string
 *   is passed, it will be sanitized with SafeUrl.sanitize().
 * - For tags which can load code or set security relevant page metadata,
 *   more specific goog.html.SafeHtml.create*() functions must be used. Tags
 *   which are not supported by this function are applet, base, embed, iframe,
 *   link, math, object, script, style, svg, and template.
 *
 * @param {!goog.dom.TagName|string} tagName The name of the tag. Only tag names
 *     consisting of [a-zA-Z0-9-] are allowed. Tag names documented above are
 *     disallowed.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Mapping from attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined causes
 *     the attribute to be omitted.
 * @param {!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>=} opt_content Content to
 *     HTML-escape and put inside the tag. This must be empty for void tags
 *     like <br>. Array elements are concatenated.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid tag name, attribute name, or attribute value is
 *     provided.
 * @throws {goog.asserts.AssertionError} If content for void tag is provided.
 */
goog.html.SafeHtml.create = function(tagName, opt_attributes, opt_content) {
  goog.html.SafeHtml.verifyTagName(String(tagName));
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      String(tagName), opt_attributes, opt_content);
};


/**
 * Verifies if the tag name is valid and if it doesn't change the context.
 * E.g. STRONG is fine but SCRIPT throws because it changes context. See
 * goog.html.SafeHtml.create for an explanation of allowed tags.
 * @param {string} tagName
 * @throws {Error} If invalid tag name is provided.
 * @package
 */
goog.html.SafeHtml.verifyTagName = function(tagName) {
  if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(tagName)) {
    throw Error('Invalid tag name <' + tagName + '>.');
  }
  if (tagName.toUpperCase() in goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_) {
    throw Error('Tag name <' + tagName + '> is not allowed for SafeHtml.');
  }
};


/**
 * Creates a SafeHtml representing an iframe tag.
 *
 * This by default restricts the iframe as much as possible by setting the
 * sandbox attribute to the empty string. If the iframe requires less
 * restrictions, set the sandbox attribute as tight as possible, but do not rely
 * on the sandbox as a security feature because it is not supported by older
 * browsers. If a sandbox is essential to security (e.g. for third-party
 * frames), use createSandboxIframe which checks for browser support.
 *
 * @see https://developer.mozilla.org/en/docs/Web/HTML/Element/iframe#attr-sandbox
 *
 * @param {?goog.html.TrustedResourceUrl=} opt_src The value of the src
 *     attribute. If null or undefined src will not be set.
 * @param {?goog.html.SafeHtml=} opt_srcdoc The value of the srcdoc attribute.
 *     If null or undefined srcdoc will not be set.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Mapping from attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined causes
 *     the attribute to be omitted.
 * @param {!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>=} opt_content Content to
 *     HTML-escape and put inside the tag. Array elements are concatenated.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid tag name, attribute name, or attribute value is
 *     provided. If opt_attributes contains the src or srcdoc attributes.
 */
goog.html.SafeHtml.createIframe = function(
    opt_src, opt_srcdoc, opt_attributes, opt_content) {
  if (opt_src) {
    // Check whether this is really TrustedResourceUrl.
    goog.html.TrustedResourceUrl.unwrap(opt_src);
  }

  var fixedAttributes = {};
  fixedAttributes['src'] = opt_src || null;
  fixedAttributes['srcdoc'] =
      opt_srcdoc && goog.html.SafeHtml.unwrap(opt_srcdoc);
  var defaultAttributes = {'sandbox': ''};
  var attributes = goog.html.SafeHtml.combineAttributes(
      fixedAttributes, defaultAttributes, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'iframe', attributes, opt_content);
};


/**
 * Creates a SafeHtml representing a sandboxed iframe tag.
 *
 * The sandbox attribute is enforced in its most restrictive mode, an empty
 * string. Consequently, the security requirements for the src and srcdoc
 * attributes are relaxed compared to SafeHtml.createIframe. This function
 * will throw on browsers that do not support the sandbox attribute, as
 * determined by SafeHtml.canUseSandboxIframe.
 *
 * The SafeHtml returned by this function can trigger downloads with no
 * user interaction on Chrome (though only a few, further attempts are blocked).
 * Firefox and IE will block all downloads from the sandbox.
 *
 * @see https://developer.mozilla.org/en/docs/Web/HTML/Element/iframe#attr-sandbox
 * @see https://lists.w3.org/Archives/Public/public-whatwg-archive/2013Feb/0112.html
 *
 * @param {string|!goog.html.SafeUrl=} opt_src The value of the src
 *     attribute. If null or undefined src will not be set.
 * @param {string=} opt_srcdoc The value of the srcdoc attribute.
 *     If null or undefined srcdoc will not be set. Will not be sanitized.
 * @param {!Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Mapping from attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined causes
 *     the attribute to be omitted.
 * @param {!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>=} opt_content Content to
 *     HTML-escape and put inside the tag. Array elements are concatenated.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid tag name, attribute name, or attribute value is
 *     provided. If opt_attributes contains the src, srcdoc or sandbox
 *     attributes. If browser does not support the sandbox attribute on iframe.
 */
goog.html.SafeHtml.createSandboxIframe = function(
    opt_src, opt_srcdoc, opt_attributes, opt_content) {
  if (!goog.html.SafeHtml.canUseSandboxIframe()) {
    throw new Error('The browser does not support sandboxed iframes.');
  }

  var fixedAttributes = {};
  if (opt_src) {
    // Note that sanitize is a no-op on SafeUrl.
    fixedAttributes['src'] =
        goog.html.SafeUrl.unwrap(goog.html.SafeUrl.sanitize(opt_src));
  } else {
    fixedAttributes['src'] = null;
  }
  fixedAttributes['srcdoc'] = opt_srcdoc || null;
  fixedAttributes['sandbox'] = '';
  var attributes =
      goog.html.SafeHtml.combineAttributes(fixedAttributes, {}, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'iframe', attributes, opt_content);
};


/**
 * Checks if the user agent supports sandboxed iframes.
 * @return {boolean}
 */
goog.html.SafeHtml.canUseSandboxIframe = function() {
  return goog.global['HTMLIFrameElement'] &&
      ('sandbox' in goog.global['HTMLIFrameElement'].prototype);
};


/**
 * Creates a SafeHtml representing a script tag with the src attribute.
 * @param {!goog.html.TrustedResourceUrl} src The value of the src
 * attribute.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=}
 * opt_attributes
 *     Mapping from attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined
 *     causes the attribute to be omitted.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid attribute name or value is provided. If
 *     opt_attributes contains the src attribute.
 */
goog.html.SafeHtml.createScriptSrc = function(src, opt_attributes) {
  // TODO(mlourenco): The charset attribute should probably be blocked. If
  // its value is attacker controlled, the script contains attacker controlled
  // sub-strings (even if properly escaped) and the server does not set charset
  // then XSS is likely possible.
  // https://html.spec.whatwg.org/multipage/scripting.html#dom-script-charset

  // Check whether this is really TrustedResourceUrl.
  goog.html.TrustedResourceUrl.unwrap(src);

  var fixedAttributes = {'src': src};
  var defaultAttributes = {};
  var attributes = goog.html.SafeHtml.combineAttributes(
      fixedAttributes, defaultAttributes, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'script', attributes);
};


/**
 * Creates a SafeHtml representing a script tag. Does not allow the language,
 * src, text or type attributes to be set.
 * @param {!goog.html.SafeScript|!Array<!goog.html.SafeScript>}
 *     script Content to put inside the tag. Array elements are
 *     concatenated.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Mapping from attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined causes
 *     the attribute to be omitted.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid attribute name or attribute value is provided. If
 *     opt_attributes contains the language, src, text or type attribute.
 */
goog.html.SafeHtml.createScript = function(script, opt_attributes) {
  for (var attr in opt_attributes) {
    var attrLower = attr.toLowerCase();
    if (attrLower == 'language' || attrLower == 'src' || attrLower == 'text' ||
        attrLower == 'type') {
      throw Error('Cannot set "' + attrLower + '" attribute');
    }
  }

  var content = '';
  script = goog.array.concat(script);
  for (var i = 0; i < script.length; i++) {
    content += goog.html.SafeScript.unwrap(script[i]);
  }
  // Convert to SafeHtml so that it's not HTML-escaped. This is safe because
  // as part of its contract, SafeScript should have no dangerous '<'.
  var htmlContent =
      goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
          content, goog.i18n.bidi.Dir.NEUTRAL);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'script', opt_attributes, htmlContent);
};


/**
 * Creates a SafeHtml representing a style tag. The type attribute is set
 * to "text/css".
 * @param {!goog.html.SafeStyleSheet|!Array<!goog.html.SafeStyleSheet>}
 *     styleSheet Content to put inside the tag. Array elements are
 *     concatenated.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Mapping from attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined causes
 *     the attribute to be omitted.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid attribute name or attribute value is provided. If
 *     opt_attributes contains the type attribute.
 */
goog.html.SafeHtml.createStyle = function(styleSheet, opt_attributes) {
  var fixedAttributes = {'type': 'text/css'};
  var defaultAttributes = {};
  var attributes = goog.html.SafeHtml.combineAttributes(
      fixedAttributes, defaultAttributes, opt_attributes);

  var content = '';
  styleSheet = goog.array.concat(styleSheet);
  for (var i = 0; i < styleSheet.length; i++) {
    content += goog.html.SafeStyleSheet.unwrap(styleSheet[i]);
  }
  // Convert to SafeHtml so that it's not HTML-escaped. This is safe because
  // as part of its contract, SafeStyleSheet should have no dangerous '<'.
  var htmlContent =
      goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
          content, goog.i18n.bidi.Dir.NEUTRAL);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'style', attributes, htmlContent);
};


/**
 * Creates a SafeHtml representing a meta refresh tag.
 * @param {!goog.html.SafeUrl|string} url Where to redirect. If a string is
 *     passed, it will be sanitized with SafeUrl.sanitize().
 * @param {number=} opt_secs Number of seconds until the page should be
 *     reloaded. Will be set to 0 if unspecified.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 */
goog.html.SafeHtml.createMetaRefresh = function(url, opt_secs) {

  // Note that sanitize is a no-op on SafeUrl.
  var unwrappedUrl = goog.html.SafeUrl.unwrap(goog.html.SafeUrl.sanitize(url));

  if (goog.labs.userAgent.browser.isIE() ||
      goog.labs.userAgent.browser.isEdge()) {
    // IE/EDGE can't parse the content attribute if the url contains a
    // semicolon. We can fix this by adding quotes around the url, but then we
    // can't parse quotes in the URL correctly. Also, it seems that IE/EDGE
    // did not unescape semicolons in these URLs at some point in the past. We
    // take a best-effort approach.
    //
    // If the URL has semicolons (which may happen in some cases, see
    // http://www.w3.org/TR/1999/REC-html401-19991224/appendix/notes.html#h-B.2
    // for instance), wrap it in single quotes to protect the semicolons.
    // If the URL has semicolons and single quotes, url-encode the single quotes
    // as well.
    //
    // This is imperfect. Notice that both ' and ; are reserved characters in
    // URIs, so this could do the wrong thing, but at least it will do the wrong
    // thing in only rare cases.
    if (goog.string.contains(unwrappedUrl, ';')) {
      unwrappedUrl = "'" + unwrappedUrl.replace(/'/g, '%27') + "'";
    }
  }
  var attributes = {
    'http-equiv': 'refresh',
    'content': (opt_secs || 0) + '; url=' + unwrappedUrl
  };

  // This function will handle the HTML escaping for attributes.
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'meta', attributes);
};


/**
 * @param {string} tagName The tag name.
 * @param {string} name The attribute name.
 * @param {!goog.html.SafeHtml.AttributeValue} value The attribute value.
 * @return {string} A "name=value" string.
 * @throws {Error} If attribute value is unsafe for the given tag and attribute.
 * @private
 */
goog.html.SafeHtml.getAttrNameAndValue_ = function(tagName, name, value) {
  // If it's goog.string.Const, allow any valid attribute name.
  if (value instanceof goog.string.Const) {
    value = goog.string.Const.unwrap(value);
  } else if (name.toLowerCase() == 'style') {
    value = goog.html.SafeHtml.getStyleValue_(value);
  } else if (/^on/i.test(name)) {
    // TODO(jakubvrana): Disallow more attributes with a special meaning.
    throw Error(
        'Attribute "' + name + '" requires goog.string.Const value, "' + value +
        '" given.');
    // URL attributes handled differently according to tag.
  } else if (name.toLowerCase() in goog.html.SafeHtml.URL_ATTRIBUTES_) {
    if (value instanceof goog.html.TrustedResourceUrl) {
      value = goog.html.TrustedResourceUrl.unwrap(value);
    } else if (value instanceof goog.html.SafeUrl) {
      value = goog.html.SafeUrl.unwrap(value);
    } else if (goog.isString(value)) {
      value = goog.html.SafeUrl.sanitize(value).getTypedStringValue();
    } else {
      throw Error(
          'Attribute "' + name + '" on tag "' + tagName +
          '" requires goog.html.SafeUrl, goog.string.Const, or string,' +
          ' value "' + value + '" given.');
    }
  }

  // Accept SafeUrl, TrustedResourceUrl, etc. for attributes which only require
  // HTML-escaping.
  if (value.implementsGoogStringTypedString) {
    // Ok to call getTypedStringValue() since there's no reliance on the type
    // contract for security here.
    value = value.getTypedStringValue();
  }

  goog.asserts.assert(
      goog.isString(value) || goog.isNumber(value),
      'String or number value expected, got ' + (typeof value) +
          ' with value: ' + value);
  return name + '="' + goog.string.htmlEscape(String(value)) + '"';
};


/**
 * Gets value allowed in "style" attribute.
 * @param {!goog.html.SafeHtml.AttributeValue} value It could be SafeStyle or a
 *     map which will be passed to goog.html.SafeStyle.create.
 * @return {string} Unwrapped value.
 * @throws {Error} If string value is given.
 * @private
 */
goog.html.SafeHtml.getStyleValue_ = function(value) {
  if (!goog.isObject(value)) {
    throw Error(
        'The "style" attribute requires goog.html.SafeStyle or map ' +
        'of style properties, ' + (typeof value) + ' given: ' + value);
  }
  if (!(value instanceof goog.html.SafeStyle)) {
    // Process the property bag into a style object.
    value = goog.html.SafeStyle.create(value);
  }
  return goog.html.SafeStyle.unwrap(value);
};


/**
 * Creates a SafeHtml content with known directionality consisting of a tag with
 * optional attributes and optional content.
 * @param {!goog.i18n.bidi.Dir} dir Directionality.
 * @param {string} tagName
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 * @param {!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>=} opt_content
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 */
goog.html.SafeHtml.createWithDir = function(
    dir, tagName, opt_attributes, opt_content) {
  var html = goog.html.SafeHtml.create(tagName, opt_attributes, opt_content);
  html.dir_ = dir;
  return html;
};


/**
 * Creates a new SafeHtml object by concatenating values.
 * @param {...(!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>)} var_args Values to concatenate.
 * @return {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.concat = function(var_args) {
  var dir = goog.i18n.bidi.Dir.NEUTRAL;
  var content = '';

  /**
   * @param {!goog.html.SafeHtml.TextOrHtml_|
   *     !Array<!goog.html.SafeHtml.TextOrHtml_>} argument
   */
  var addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      var html = goog.html.SafeHtml.htmlEscape(argument);
      content += goog.html.SafeHtml.unwrap(html);
      var htmlDir = html.getDirection();
      if (dir == goog.i18n.bidi.Dir.NEUTRAL) {
        dir = htmlDir;
      } else if (htmlDir != goog.i18n.bidi.Dir.NEUTRAL && dir != htmlDir) {
        dir = null;
      }
    }
  };

  goog.array.forEach(arguments, addArgument);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      content, dir);
};


/**
 * Creates a new SafeHtml object with known directionality by concatenating the
 * values.
 * @param {!goog.i18n.bidi.Dir} dir Directionality.
 * @param {...(!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>)} var_args Elements of array
 *     arguments would be processed recursively.
 * @return {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.concatWithDir = function(dir, var_args) {
  var html = goog.html.SafeHtml.concat(goog.array.slice(arguments, 1));
  html.dir_ = dir;
  return html;
};


/**
 * Type marker for the SafeHtml type, used to implement additional run-time
 * type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Package-internal utility method to create SafeHtml instances.
 *
 * @param {string} html The string to initialize the SafeHtml object with.
 * @param {?goog.i18n.bidi.Dir} dir The directionality of the SafeHtml to be
 *     constructed, or null if unknown.
 * @return {!goog.html.SafeHtml} The initialized SafeHtml object.
 * @package
 */
goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse = function(
    html, dir) {
  return new goog.html.SafeHtml().initSecurityPrivateDoNotAccessOrElse_(
      html, dir);
};


/**
 * Called from createSafeHtmlSecurityPrivateDoNotAccessOrElse(). This
 * method exists only so that the compiler can dead code eliminate static
 * fields (like EMPTY) when they're not accessed.
 * @param {string} html
 * @param {?goog.i18n.bidi.Dir} dir
 * @return {!goog.html.SafeHtml}
 * @private
 */
goog.html.SafeHtml.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(
    html, dir) {
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = html;
  this.dir_ = dir;
  return this;
};


/**
 * Like create() but does not restrict which tags can be constructed.
 *
 * @param {string} tagName Tag name. Set or validated by caller.
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 * @param {(!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>)=} opt_content
 * @return {!goog.html.SafeHtml}
 * @throws {Error} If invalid or unsafe attribute name or value is provided.
 * @throws {goog.asserts.AssertionError} If content for void tag is provided.
 * @package
 */
goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse = function(
    tagName, opt_attributes, opt_content) {
  var dir = null;
  var result = '<' + tagName;
  result += goog.html.SafeHtml.stringifyAttributes(tagName, opt_attributes);

  var content = opt_content;
  if (!goog.isDefAndNotNull(content)) {
    content = [];
  } else if (!goog.isArray(content)) {
    content = [content];
  }

  if (goog.dom.tags.isVoidTag(tagName.toLowerCase())) {
    goog.asserts.assert(
        !content.length, 'Void tag <' + tagName + '> does not allow content.');
    result += '>';
  } else {
    var html = goog.html.SafeHtml.concat(content);
    result += '>' + goog.html.SafeHtml.unwrap(html) + '</' + tagName + '>';
    dir = html.getDirection();
  }

  var dirAttribute = opt_attributes && opt_attributes['dir'];
  if (dirAttribute) {
    if (/^(ltr|rtl|auto)$/i.test(dirAttribute)) {
      // If the tag has the "dir" attribute specified then its direction is
      // neutral because it can be safely used in any context.
      dir = goog.i18n.bidi.Dir.NEUTRAL;
    } else {
      dir = null;
    }
  }

  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      result, dir);
};


/**
 * Creates a string with attributes to insert after tagName.
 * @param {string} tagName
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 * @return {string} Returns an empty string if there are no attributes, returns
 *     a string starting with a space otherwise.
 * @throws {Error} If attribute value is unsafe for the given tag and attribute.
 * @package
 */
goog.html.SafeHtml.stringifyAttributes = function(tagName, opt_attributes) {
  var result = '';
  if (opt_attributes) {
    for (var name in opt_attributes) {
      if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(name)) {
        throw Error('Invalid attribute name "' + name + '".');
      }
      var value = opt_attributes[name];
      if (!goog.isDefAndNotNull(value)) {
        continue;
      }
      result +=
          ' ' + goog.html.SafeHtml.getAttrNameAndValue_(tagName, name, value);
    }
  }
  return result;
};


/**
 * @param {!Object<string, ?goog.html.SafeHtml.AttributeValue>} fixedAttributes
 * @param {!Object<string, string>} defaultAttributes
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Optional attributes passed to create*().
 * @return {!Object<string, ?goog.html.SafeHtml.AttributeValue>}
 * @throws {Error} If opt_attributes contains an attribute with the same name
 *     as an attribute in fixedAttributes.
 * @package
 */
goog.html.SafeHtml.combineAttributes = function(
    fixedAttributes, defaultAttributes, opt_attributes) {
  var combinedAttributes = {};
  var name;

  for (name in fixedAttributes) {
    goog.asserts.assert(name.toLowerCase() == name, 'Must be lower case');
    combinedAttributes[name] = fixedAttributes[name];
  }
  for (name in defaultAttributes) {
    goog.asserts.assert(name.toLowerCase() == name, 'Must be lower case');
    combinedAttributes[name] = defaultAttributes[name];
  }

  for (name in opt_attributes) {
    var nameLower = name.toLowerCase();
    if (nameLower in fixedAttributes) {
      throw Error(
          'Cannot override "' + nameLower + '" attribute, got "' + name +
          '" with value "' + opt_attributes[name] + '"');
    }
    if (nameLower in defaultAttributes) {
      delete combinedAttributes[nameLower];
    }
    combinedAttributes[name] = opt_attributes[name];
  }

  return combinedAttributes;
};


/**
 * A SafeHtml instance corresponding to the HTML doctype: "<!DOCTYPE html>".
 * @const {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.DOCTYPE_HTML =
    goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        '<!DOCTYPE html>', goog.i18n.bidi.Dir.NEUTRAL);


/**
 * A SafeHtml instance corresponding to the empty string.
 * @const {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.EMPTY =
    goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        '', goog.i18n.bidi.Dir.NEUTRAL);


/**
 * A SafeHtml instance corresponding to the <br> tag.
 * @const {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.BR =
    goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        '<br>', goog.i18n.bidi.Dir.NEUTRAL);
