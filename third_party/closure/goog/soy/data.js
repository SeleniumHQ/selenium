// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Soy data primitives.
 *
 * The goal is to encompass data types used by Soy, especially to mark content
 * as known to be "safe".
 *
 * @author gboyer@google.com (Garrett Boyer)
 */

goog.provide('goog.soy.data.SanitizedContent');
goog.provide('goog.soy.data.SanitizedContentKind');
goog.provide('goog.soy.data.SanitizedCss');
goog.provide('goog.soy.data.SanitizedHtml');
goog.provide('goog.soy.data.SanitizedHtmlAttribute');
goog.provide('goog.soy.data.SanitizedJs');
goog.provide('goog.soy.data.SanitizedTrustedResourceUri');
goog.provide('goog.soy.data.SanitizedUri');
goog.provide('goog.soy.data.UnsanitizedText');

goog.require('goog.Uri');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeScript');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.string.Const');


/**
 * A type of textual content.
 *
 * This is an enum of type Object so that these values are unforgeable.
 *
 * @enum {!Object}
 */
goog.soy.data.SanitizedContentKind = {

  /**
   * A snippet of HTML that does not start or end inside a tag, comment, entity,
   * or DOCTYPE; and that does not contain any executable code
   * (JS, {@code <object>}s, etc.) from a different trust domain.
   */
  HTML: goog.DEBUG ? {sanitizedContentKindHtml: true} : {},

  /**
   * Executable Javascript code or expression, safe for insertion in a
   * script-tag or event handler context, known to be free of any
   * attacker-controlled scripts. This can either be side-effect-free
   * Javascript (such as JSON) or Javascript that's entirely under Google's
   * control.
   */
  JS: goog.DEBUG ? {sanitizedContentJsChars: true} : {},

  /** A properly encoded portion of a URI. */
  URI: goog.DEBUG ? {sanitizedContentUri: true} : {},

  /** A resource URI not under attacker control. */
  TRUSTED_RESOURCE_URI:
      goog.DEBUG ? {sanitizedContentTrustedResourceUri: true} : {},

  /**
   * Repeated attribute names and values. For example,
   * {@code dir="ltr" foo="bar" onclick="trustedFunction()" checked}.
   */
  ATTRIBUTES: goog.DEBUG ? {sanitizedContentHtmlAttribute: true} : {},

  // TODO: Consider separating rules, declarations, and values into
  // separate types, but for simplicity, we'll treat explicitly blessed
  // SanitizedContent as allowed in all of these contexts.
  /**
   * A CSS3 declaration, property, value or group of semicolon separated
   * declarations.
   */
  CSS: goog.DEBUG ? {sanitizedContentCss: true} : {},

  /**
   * Unsanitized plain-text content.
   *
   * This is effectively the "null" entry of this enum, and is sometimes used
   * to explicitly mark content that should never be used unescaped. Since any
   * string is safe to use as text, being of ContentKind.TEXT makes no
   * guarantees about its safety in any other context such as HTML.
   */
  TEXT: goog.DEBUG ? {sanitizedContentKindText: true} : {}
};



/**
 * A string-like object that carries a content-type and a content direction.
 *
 * IMPORTANT! Do not create these directly, nor instantiate the subclasses.
 * Instead, use a trusted, centrally reviewed library as endorsed by your team
 * to generate these objects. Otherwise, you risk accidentally creating
 * SanitizedContent that is attacker-controlled and gets evaluated unescaped in
 * templates.
 *
 * @constructor
 */
goog.soy.data.SanitizedContent = function() {
  throw Error('Do not instantiate directly');
};


/**
 * The context in which this content is safe from XSS attacks.
 * @type {goog.soy.data.SanitizedContentKind}
 */
goog.soy.data.SanitizedContent.prototype.contentKind;


/**
 * The content's direction; null if unknown and thus to be estimated when
 * necessary.
 * @type {?goog.i18n.bidi.Dir}
 */
goog.soy.data.SanitizedContent.prototype.contentDir = null;


/**
 * The already-safe content.
 * @protected {string}
 */
goog.soy.data.SanitizedContent.prototype.content;


/**
 * Gets the already-safe content.
 * @return {string}
 */
goog.soy.data.SanitizedContent.prototype.getContent = function() {
  return this.content;
};


/** @override */
goog.soy.data.SanitizedContent.prototype.toString = function() {
  return this.content;
};


/**
 * Converts sanitized content of kind TEXT or HTML into SafeHtml. HTML content
 * is converted without modification, while text content is HTML-escaped.
 * @return {!goog.html.SafeHtml}
 * @throws {Error} when the content kind is not TEXT or HTML.
 */
goog.soy.data.SanitizedContent.prototype.toSafeHtml = function() {
  if (this.contentKind === goog.soy.data.SanitizedContentKind.TEXT) {
    return goog.html.SafeHtml.htmlEscape(this.toString());
  }
  if (this.contentKind !== goog.soy.data.SanitizedContentKind.HTML) {
    throw Error('Sanitized content was not of kind TEXT or HTML.');
  }
  return goog.html.uncheckedconversions
      .safeHtmlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Soy SanitizedContent of kind HTML produces ' +
              'SafeHtml-contract-compliant value.'),
          this.toString(), this.contentDir);
};


/**
 * Converts sanitized content of kind URI into SafeUrl without modification.
 * @return {!goog.html.SafeUrl}
 * @throws {Error} when the content kind is not URI.
 */
goog.soy.data.SanitizedContent.prototype.toSafeUrl = function() {
  if (this.contentKind !== goog.soy.data.SanitizedContentKind.URI) {
    throw Error('Sanitized content was not of kind URI.');
  }
  return goog.html.uncheckedconversions
      .safeUrlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Soy SanitizedContent of kind URI produces ' +
              'SafeHtml-contract-compliant value.'),
          this.toString());
};


/**
 * Unsanitized plain text string.
 *
 * While all strings are effectively safe to use as a plain text, there are no
 * guarantees about safety in any other context such as HTML. This is
 * sometimes used to mark that should never be used unescaped.
 *
 * @param {*} content Plain text with no guarantees.
 * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
 *     unknown and thus to be estimated when necessary. Default: null.
 * @extends {goog.soy.data.SanitizedContent}
 * @constructor
 */
goog.soy.data.UnsanitizedText = function(content, opt_contentDir) {
  // Not calling the superclass constructor which just throws an exception.

  /** @override */
  this.content = String(content);
  this.contentDir = opt_contentDir != null ? opt_contentDir : null;
};
goog.inherits(goog.soy.data.UnsanitizedText, goog.soy.data.SanitizedContent);


/** @override */
goog.soy.data.UnsanitizedText.prototype.contentKind =
    goog.soy.data.SanitizedContentKind.TEXT;



/**
 * Content of type {@link goog.soy.data.SanitizedContentKind.HTML}.
 *
 * The content is a string of HTML that can safely be embedded in a PCDATA
 * context in your app.  If you would be surprised to find that an HTML
 * sanitizer produced {@code s} (e.g.  it runs code or fetches bad URLs) and
 * you wouldn't write a template that produces {@code s} on security or privacy
 * grounds, then don't pass {@code s} here. The default content direction is
 * unknown, i.e. to be estimated when necessary.
 *
 * @extends {goog.soy.data.SanitizedContent}
 * @constructor
 */
goog.soy.data.SanitizedHtml = function() {
  goog.soy.data.SanitizedHtml.base(this, 'constructor');
};
goog.inherits(goog.soy.data.SanitizedHtml, goog.soy.data.SanitizedContent);

/** @override */
goog.soy.data.SanitizedHtml.prototype.contentKind =
    goog.soy.data.SanitizedContentKind.HTML;

/**
 * Checks if the value could be used as the Soy type {html}.
 * @param {*} value
 * @return {boolean}
 */
goog.soy.data.SanitizedHtml.isCompatibleWith = function(value) {
  return goog.isString(value) ||
      value instanceof goog.soy.data.SanitizedHtml ||
      value instanceof goog.soy.data.UnsanitizedText ||
      value instanceof goog.html.SafeHtml;
};



/**
 * Content of type {@link goog.soy.data.SanitizedContentKind.JS}.
 *
 * The content is JavaScript source that when evaluated does not execute any
 * attacker-controlled scripts. The content direction is LTR.
 *
 * @extends {goog.soy.data.SanitizedContent}
 * @constructor
 */
goog.soy.data.SanitizedJs = function() {
  goog.soy.data.SanitizedJs.base(this, 'constructor');
};
goog.inherits(goog.soy.data.SanitizedJs, goog.soy.data.SanitizedContent);

/** @override */
goog.soy.data.SanitizedJs.prototype.contentKind =
    goog.soy.data.SanitizedContentKind.JS;

/** @override */
goog.soy.data.SanitizedJs.prototype.contentDir = goog.i18n.bidi.Dir.LTR;

/**
 * Checks if the value could be used as the Soy type {js}.
 * @param {*} value
 * @return {boolean}
 */
goog.soy.data.SanitizedJs.isCompatibleWith = function(value) {
  return goog.isString(value) ||
      value instanceof goog.soy.data.SanitizedJs ||
      value instanceof goog.soy.data.UnsanitizedText ||
      value instanceof goog.html.SafeScript;
};



/**
 * Content of type {@link goog.soy.data.SanitizedContentKind.URI}.
 *
 * The content is a URI chunk that the caller knows is safe to emit in a
 * template. The content direction is LTR.
 *
 * @extends {goog.soy.data.SanitizedContent}
 * @constructor
 */
goog.soy.data.SanitizedUri = function() {
  goog.soy.data.SanitizedUri.base(this, 'constructor');
};
goog.inherits(goog.soy.data.SanitizedUri, goog.soy.data.SanitizedContent);

/** @override */
goog.soy.data.SanitizedUri.prototype.contentKind =
    goog.soy.data.SanitizedContentKind.URI;

/** @override */
goog.soy.data.SanitizedUri.prototype.contentDir = goog.i18n.bidi.Dir.LTR;

/**
 * Checks if the value could be used as the Soy type {uri}.
 * @param {*} value
 * @return {boolean}
 */
goog.soy.data.SanitizedUri.isCompatibleWith = function(value) {
  return goog.isString(value) ||
      value instanceof goog.soy.data.SanitizedUri ||
      value instanceof goog.soy.data.UnsanitizedText ||
      value instanceof goog.html.SafeUrl ||
      value instanceof goog.html.TrustedResourceUrl ||
      value instanceof goog.Uri;
};



/**
 * Content of type
 * {@link goog.soy.data.SanitizedContentKind.TRUSTED_RESOURCE_URI}.
 *
 * The content is a TrustedResourceUri chunk that is not under attacker control.
 * The content direction is LTR.
 *
 * @extends {goog.soy.data.SanitizedContent}
 * @constructor
 */
goog.soy.data.SanitizedTrustedResourceUri = function() {
  goog.soy.data.SanitizedTrustedResourceUri.base(this, 'constructor');
};
goog.inherits(
    goog.soy.data.SanitizedTrustedResourceUri, goog.soy.data.SanitizedContent);

/** @override */
goog.soy.data.SanitizedTrustedResourceUri.prototype.contentKind =
    goog.soy.data.SanitizedContentKind.TRUSTED_RESOURCE_URI;

/** @override */
goog.soy.data.SanitizedTrustedResourceUri.prototype.contentDir =
    goog.i18n.bidi.Dir.LTR;

/**
 * Checks if the value could be used as the Soy type {trusted_resource_uri}.
 * @param {*} value
 * @return {boolean}
 */
goog.soy.data.SanitizedTrustedResourceUri.isCompatibleWith = function(value) {
  return goog.isString(value) ||
      value instanceof goog.soy.data.SanitizedTrustedResourceUri ||
      value instanceof goog.soy.data.UnsanitizedText ||
      value instanceof goog.html.TrustedResourceUrl;
};



/**
 * Content of type {@link goog.soy.data.SanitizedContentKind.ATTRIBUTES}.
 *
 * The content should be safely embeddable within an open tag, such as a
 * key="value" pair. The content direction is LTR.
 *
 * @extends {goog.soy.data.SanitizedContent}
 * @constructor
 */
goog.soy.data.SanitizedHtmlAttribute = function() {
  goog.soy.data.SanitizedHtmlAttribute.base(this, 'constructor');
};
goog.inherits(
    goog.soy.data.SanitizedHtmlAttribute, goog.soy.data.SanitizedContent);

/** @override */
goog.soy.data.SanitizedHtmlAttribute.prototype.contentKind =
    goog.soy.data.SanitizedContentKind.ATTRIBUTES;

/** @override */
goog.soy.data.SanitizedHtmlAttribute.prototype.contentDir =
    goog.i18n.bidi.Dir.LTR;

/**
 * Checks if the value could be used as the Soy type {attribute}.
 * @param {*} value
 * @return {boolean}
 */
goog.soy.data.SanitizedHtmlAttribute.isCompatibleWith = function(value) {
  return goog.isString(value) ||
      value instanceof goog.soy.data.SanitizedHtmlAttribute ||
      value instanceof goog.soy.data.UnsanitizedText;
};



/**
 * Content of type {@link goog.soy.data.SanitizedContentKind.CSS}.
 *
 * The content is non-attacker-exploitable CSS, such as {@code color:#c3d9ff}.
 * The content direction is LTR.
 *
 * @extends {goog.soy.data.SanitizedContent}
 * @constructor
 */
goog.soy.data.SanitizedCss = function() {
  goog.soy.data.SanitizedCss.base(this, 'constructor');
};
goog.inherits(goog.soy.data.SanitizedCss, goog.soy.data.SanitizedContent);


/** @override */
goog.soy.data.SanitizedCss.prototype.contentKind =
    goog.soy.data.SanitizedContentKind.CSS;


/** @override */
goog.soy.data.SanitizedCss.prototype.contentDir = goog.i18n.bidi.Dir.LTR;


/**
 * Checks if the value could be used as the Soy type {css}.
 * @param {*} value
 * @return {boolean}
 */
goog.soy.data.SanitizedCss.isCompatibleWith = function(value) {
  return goog.isString(value) ||
      value instanceof goog.soy.data.SanitizedCss ||
      value instanceof goog.soy.data.UnsanitizedText ||
      value instanceof goog.html.SafeStyle;
};
