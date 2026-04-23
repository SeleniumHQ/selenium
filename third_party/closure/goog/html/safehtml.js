/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * @fileoverview The SafeHtml type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.module('goog.html.SafeHtml');
goog.module.declareLegacyNamespace();

const Const = goog.require('goog.string.Const');
const SafeScript = goog.require('goog.html.SafeScript');
const SafeStyle = goog.require('goog.html.SafeStyle');
const SafeStyleSheet = goog.require('goog.html.SafeStyleSheet');
const SafeUrl = goog.require('goog.html.SafeUrl');
const TagName = goog.require('goog.dom.TagName');
const TrustedResourceUrl = goog.require('goog.html.TrustedResourceUrl');
const TypedString = goog.require('goog.string.TypedString');
const asserts = goog.require('goog.asserts');
const browser = goog.require('goog.labs.userAgent.browser');
const googArray = goog.require('goog.array');
const googObject = goog.require('goog.object');
const internal = goog.require('goog.string.internal');
const tags = goog.require('goog.dom.tags');
const trustedtypes = goog.require('goog.html.trustedtypes');
const utils = goog.require('goog.utils');


/**
 * Token used to ensure that object is created only from this file. No code
 * outside of this file can access this token.
 * @type {!Object}
 * @const
 */
const CONSTRUCTOR_TOKEN_PRIVATE = {};

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
 * (`SafeHtml.create`, `SafeHtml.htmlEscape`),
 * etc and not by invoking its constructor. The constructor intentionally takes
 * an extra parameter that cannot be constructed outside of this file and the
 * type is immutable; hence only a default instance corresponding to the empty
 * string can be obtained via constructor invocation.
 *
 * Creating SafeHtml objects HAS SIDE-EFFECTS due to calling Trusted Types Web
 * API.
 *
 * Note that there is no `SafeHtml.fromConstant`. The reason is that
 * the following code would create an unsafe HTML:
 *
 * ```
 * SafeHtml.concat(
 *     SafeHtml.fromConstant(Const.from('<script>')),
 *     SafeHtml.htmlEscape(userInput),
 *     SafeHtml.fromConstant(Const.from('<\/script>')));
 * ```
 *
 * There's `goog.dom.constHtmlToNode` to create a node from constant strings
 * only.
 *
 * @see SafeHtml.create
 * @see SafeHtml.htmlEscape
 * @final
 * @struct
 * @implements {TypedString}
 */
class SafeHtml {
  /**
   * @private
   * @param {!TrustedHTML|string} value
   * @param {!Object} token package-internal implementation detail.
   */
  constructor(value, token) {
    if (goog.DEBUG && token !== CONSTRUCTOR_TOKEN_PRIVATE) {
      throw Error('SafeHtml is not meant to be built directly');
    }

    /**
     * The contained value of this SafeHtml.  The field has a purposely ugly
     * name to make (non-compiled) code that attempts to directly access this
     * field stand out.
     * @const
     * @private {!TrustedHTML|string}
     */
    this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = value;

    /**
     * @override
     * @const {boolean}
     */
    this.implementsGoogStringTypedString = true;
  }


  /**
   * Returns this SafeHtml's value as string.
   *
   * IMPORTANT: In code where it is security relevant that an object's type is
   * indeed `SafeHtml`, use `SafeHtml.unwrap` instead of
   * this method. If in doubt, assume that it's security relevant. In
   * particular, note that goog.html functions which return a goog.html type do
   * not guarantee that the returned instance is of the right type. For example:
   *
   * <pre>
   * var fakeSafeHtml = new String('fake');
   * fakeSafeHtml.__proto__ = SafeHtml.prototype;
   * var newSafeHtml = SafeHtml.htmlEscape(fakeSafeHtml);
   * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
   * // SafeHtml.htmlEscape() as fakeSafeHtml
   * // instanceof SafeHtml.
   * </pre>
   *
   * @return {string}
   * @see SafeHtml.unwrap
   * @override
   */
  getTypedStringValue() {
    return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_.toString();
  }


  /**
   * Returns a string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeHtml, use
   * `SafeHtml.unwrap`.
   *
   * @return {string}
   * @see SafeHtml.unwrap
   * @override
   */
  toString() {
    return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_.toString();
  }

  /**
   * Performs a runtime check that the provided object is indeed a SafeHtml
   * object, and returns its value.
   * @param {!SafeHtml} safeHtml The object to extract from.
   * @return {string} The SafeHtml object's contained string, unless the
   *     run-time type check fails. In that case, `unwrap` returns an innocuous
   *     string, or, if assertions are enabled, throws
   *     `asserts.AssertionError`.
   */
  static unwrap(safeHtml) {
    return SafeHtml.unwrapTrustedHTML(safeHtml).toString();
  }


  /**
   * Unwraps value as TrustedHTML if supported or as a string if not.
   * @param {!SafeHtml} safeHtml
   * @return {!TrustedHTML|string}
   * @see SafeHtml.unwrap
   */
  static unwrapTrustedHTML(safeHtml) {
    // Perform additional run-time type-checking to ensure that safeHtml is
    // indeed an instance of the expected type.  This provides some additional
    // protection against security bugs due to application code that disables
    // type checks. Specifically, the following checks are performed:
    // 1. The object is an instance of the expected type.
    // 2. The object is not an instance of a subclass.
    if (safeHtml instanceof SafeHtml && safeHtml.constructor === SafeHtml) {
      return safeHtml.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
    } else {
      asserts.fail(
          `expected object of type SafeHtml, got '${safeHtml}' of type ` +
          utils.typeOf(safeHtml));
      return 'type_error:SafeHtml';
    }
  }

  /**
   * Returns HTML-escaped text as a SafeHtml object.
   *
   * @param {!SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
   *     the parameter is of type SafeHtml it is returned directly (no escaping
   *     is done).
   * @return {!SafeHtml} The escaped text, wrapped as a SafeHtml.
   */
  static htmlEscape(textOrHtml) {
    if (textOrHtml instanceof SafeHtml) {
      return textOrHtml;
    }
    const textIsObject = typeof textOrHtml == 'object';
    let textAsString;
    if (textIsObject &&
        /** @type {?} */ (textOrHtml).implementsGoogStringTypedString) {
      textAsString =
          /** @type {!TypedString} */ (textOrHtml).getTypedStringValue();
    } else {
      textAsString = String(textOrHtml);
    }
    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        internal.htmlEscape(textAsString));
  }


  /**
   * Returns HTML-escaped text as a SafeHtml object, with newlines changed to
   * &lt;br&gt;.
   * @param {!SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
   *     the parameter is of type SafeHtml it is returned directly (no escaping
   *     is done).
   * @return {!SafeHtml} The escaped text, wrapped as a SafeHtml.
   */
  static htmlEscapePreservingNewlines(textOrHtml) {
    if (textOrHtml instanceof SafeHtml) {
      return textOrHtml;
    }
    const html = SafeHtml.htmlEscape(textOrHtml);
    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        internal.newLineToBr(SafeHtml.unwrap(html)));
  }


  /**
   * Returns HTML-escaped text as a SafeHtml object, with newlines changed to
   * &lt;br&gt; and escaping whitespace to preserve spatial formatting.
   * Character entity #160 is used to make it safer for XML.
   * @param {!SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
   *     the parameter is of type SafeHtml it is returned directly (no escaping
   *     is done).
   * @return {!SafeHtml} The escaped text, wrapped as a SafeHtml.
   */
  static htmlEscapePreservingNewlinesAndSpaces(textOrHtml) {
    if (textOrHtml instanceof SafeHtml) {
      return textOrHtml;
    }
    const html = SafeHtml.htmlEscape(textOrHtml);
    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        internal.whitespaceEscape(SafeHtml.unwrap(html)));
  }

  /**
   * Converts an arbitrary string into an HTML comment by HTML-escaping the
   * contents and embedding the result between HTML comment markers.
   *
   * Escaping is needed because Internet Explorer supports conditional comments
   * and so may render HTML markup within comments.
   *
   * @param {string} text
   * @return {!SafeHtml}
   */
  static comment(text) {
    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        '<!--' + internal.htmlEscape(text) + '-->');
  }

  /**
   * Creates a SafeHtml content consisting of a tag with optional attributes and
   * optional content.
   *
   * For convenience tag names and attribute names are accepted as regular
   * strings, instead of Const. Nevertheless, you should not pass
   * user-controlled values to these parameters. Note that these parameters are
   * syntactically validated at runtime, and invalid values will result in
   * an exception.
   *
   * Example usage:
   *
   * SafeHtml.create('br');
   * SafeHtml.create('div', {'class': 'a'});
   * SafeHtml.create('p', {}, 'a');
   * SafeHtml.create('p', {}, SafeHtml.create('br'));
   *
   * SafeHtml.create('span', {
   *   'style': {'margin': '0'}
   * });
   *
   * To guarantee SafeHtml's type contract is upheld there are restrictions on
   * attribute values and tag names.
   *
   * - For attributes which contain script code (on*), a Const is
   *   required.
   * - For attributes which contain style (style), a SafeStyle or a
   *   SafeStyle.PropertyMap is required.
   * - For attributes which are interpreted as URLs (e.g. src, href) a
   *   SafeUrl, Const or string is required. If a string
   *   is passed, it will be sanitized with SafeUrl.sanitize().
   * - For tags which can load code or set security relevant page metadata,
   *   more specific SafeHtml.create*() functions must be used. Tags
   *   which are not supported by this function are applet, base, embed, iframe,
   *   link, math, meta, object, script, style, svg, and template.
   *
   * @param {!TagName|string} tagName The name of the tag. Only tag names
   *     consisting of [a-zA-Z0-9-] are allowed. Tag names documented above are
   *     disallowed.
   * @param {?Object<string, ?SafeHtml.AttributeValue>=} attributes  Mapping
   *     from attribute names to their values. Only attribute names consisting
   *     of [a-zA-Z0-9-] are allowed. Value of null or undefined causes the
   *     attribute to be omitted.
   * @param {!SafeHtml.TextOrHtml_|
   *     !Array<!SafeHtml.TextOrHtml_>=} content Content to HTML-escape and put
   * inside the tag. This must be empty for void tags like <br>. Array elements
   * are concatenated.
   * @return {!SafeHtml} The SafeHtml content with the tag.
   * @throws {!Error} If invalid tag name, attribute name, or attribute value is
   *     provided.
   * @throws {!asserts.AssertionError} If content for void tag is provided.
   * @deprecated Use a recommended templating system like Lit instead.
   *     More information: go/goog.html-readme // LINE-INTERNAL
   */
  static create(tagName, attributes = undefined, content = undefined) {
    SafeHtml.verifyTagName(String(tagName));
    return SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
        String(tagName), attributes, content);
  }


  /**
   * Verifies if the tag name is valid and if it doesn't change the context.
   * E.g. STRONG is fine but SCRIPT throws because it changes context. See
   * SafeHtml.create for an explanation of allowed tags.
   * @param {string} tagName
   * @return {void}
   * @throws {!Error} If invalid tag name is provided.
   * @package
   */
  static verifyTagName(tagName) {
    if (!VALID_NAMES_IN_TAG.test(tagName)) {
      throw new Error(
          SafeHtml.ENABLE_ERROR_MESSAGES ? `Invalid tag name <${tagName}>.` :
                                           '');
    }
    if (tagName.toUpperCase() in NOT_ALLOWED_TAG_NAMES) {
      throw new Error(
          SafeHtml.ENABLE_ERROR_MESSAGES ?

              `Tag name <${tagName}> is not allowed for SafeHtml.` :
              '');
    }
  }


  /**
   * Creates a SafeHtml representing an iframe tag.
   *
   * This by default restricts the iframe as much as possible by setting the
   * sandbox attribute to the empty string. If the iframe requires less
   * restrictions, set the sandbox attribute as tight as possible, but do not
   * rely on the sandbox as a security feature because it is not supported by
   * older browsers. If a sandbox is essential to security (e.g. for third-party
   * frames), use createSandboxIframe which checks for browser support.
   *
   * @see https://developer.mozilla.org/en/docs/Web/HTML/Element/iframe#attr-sandbox
   *
   * @param {?TrustedResourceUrl=} src The value of the src
   *     attribute. If null or undefined src will not be set.
   * @param {?SafeHtml=} srcdoc The value of the srcdoc attribute.
   *     If null or undefined srcdoc will not be set.
   * @param {?Object<string, ?SafeHtml.AttributeValue>=} attributes  Mapping
   *     from attribute names to their values. Only attribute names consisting
   *     of [a-zA-Z0-9-] are allowed. Value of null or undefined causes the
   *     attribute to be omitted.
   * @param {!SafeHtml.TextOrHtml_|
   *     !Array<!SafeHtml.TextOrHtml_>=} content Content to HTML-escape and put
   * inside the tag. Array elements are concatenated.
   * @return {!SafeHtml} The SafeHtml content with the tag.
   * @throws {!Error} If invalid tag name, attribute name, or attribute value is
   *     provided. If attributes
   * contains the src or srcdoc attributes.
   */
  static createIframe(
      src = undefined, srcdoc = undefined, attributes = undefined,
      content = undefined) {
    if (src) {
      // Check whether this is really TrustedResourceUrl.
      TrustedResourceUrl.unwrap(src);
    }

    const fixedAttributes = {};
    fixedAttributes['src'] = src || null;
    fixedAttributes['srcdoc'] = srcdoc && SafeHtml.unwrap(srcdoc);
    const defaultAttributes = {'sandbox': ''};
    const combinedAttrs = SafeHtml.combineAttributes(
        fixedAttributes, defaultAttributes, attributes);
    return SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
        'iframe', combinedAttrs, content);
  }


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
   * user interaction on Chrome (though only a few, further attempts are
   * blocked). Firefox and IE will block all downloads from the sandbox.
   *
   * @see https://developer.mozilla.org/en/docs/Web/HTML/Element/iframe#attr-sandbox
   * @see https://lists.w3.org/Archives/Public/public-whatwg-archive/2013Feb/0112.html
   *
   * @param {string|!SafeUrl=} src The value of the src
   *     attribute. If null or undefined src will not be set.
   * @param {string=} srcdoc The value of the srcdoc attribute.
   *     If null or undefined srcdoc will not be set. Will not be sanitized.
   * @param {!Object<string, ?SafeHtml.AttributeValue>=} attributes  Mapping
   *     from attribute names to their values. Only attribute names consisting
   *     of [a-zA-Z0-9-] are allowed. Value of null or undefined causes the
   *     attribute to be omitted.
   * @param {!SafeHtml.TextOrHtml_|
   *     !Array<!SafeHtml.TextOrHtml_>=} content Content to HTML-escape and put
   * inside the tag. Array elements are concatenated.
   * @return {!SafeHtml} The SafeHtml content with the tag.
   * @throws {!Error} If invalid tag name, attribute name, or attribute value is
   *     provided. If attributes
   * contains the src, srcdoc or sandbox attributes. If browser does not support
   * the sandbox attribute on iframe.
   */
  static createSandboxIframe(
      src = undefined, srcdoc = undefined, attributes = undefined,
      content = undefined) {
    if (!SafeHtml.canUseSandboxIframe()) {
      throw new Error(
          SafeHtml.ENABLE_ERROR_MESSAGES ?
              'The browser does not support sandboxed iframes.' :
              '');
    }

    const fixedAttributes = {};
    if (src) {
      // Note that sanitize is a no-op on SafeUrl.
      fixedAttributes['src'] = SafeUrl.unwrap(SafeUrl.sanitize(src));
    } else {
      fixedAttributes['src'] = null;
    }
    fixedAttributes['srcdoc'] = srcdoc || null;
    fixedAttributes['sandbox'] = '';
    const combinedAttrs =
        SafeHtml.combineAttributes(fixedAttributes, {}, attributes);
    return SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
        'iframe', combinedAttrs, content);
  }


  /**
   * Checks if the user agent supports sandboxed iframes.
   * @return {boolean}
   */
  static canUseSandboxIframe() {
    return goog.global['HTMLIFrameElement'] &&
        ('sandbox' in goog.global['HTMLIFrameElement'].prototype);
  }


  /**
   * Creates a SafeHtml representing a script tag with the src attribute.
   * @param {!TrustedResourceUrl} src The value of the src
   * attribute.
   * @param {?Object<string, ?SafeHtml.AttributeValue>=}
   * attributes
   *     Mapping from attribute names to their values. Only attribute names
   *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined
   *     causes the attribute to be omitted.
   * @return {!SafeHtml} The SafeHtml content with the tag.
   * @throws {!Error} If invalid attribute name or value is provided. If
   *     attributes  contains the
   * src attribute.
   */
  static createScriptSrc(src, attributes = undefined) {
    // TODO(mlourenco): The charset attribute should probably be blocked. If
    // its value is attacker controlled, the script contains attacker controlled
    // sub-strings (even if properly escaped) and the server does not set
    // charset then XSS is likely possible.
    // https://html.spec.whatwg.org/multipage/scripting.html#dom-script-charset

    // Check whether this is really TrustedResourceUrl.
    TrustedResourceUrl.unwrap(src);

    const fixedAttributes = {'src': src};
    const defaultAttributes = {};
    const combinedAttrs = SafeHtml.combineAttributes(
        fixedAttributes, defaultAttributes, attributes);
    return SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
        'script', combinedAttrs);
  }

  /**
   * Creates a SafeHtml representing a script tag. Does not allow the language,
   * src, text or type attributes to be set.
   * @param {!SafeScript|!Array<!SafeScript>}
   *     script Content to put inside the tag. Array elements are
   *     concatenated.
   * @param {?Object<string, ?SafeHtml.AttributeValue>=} attributes  Mapping
   *     from attribute names to their values. Only attribute names consisting
   *     of [a-zA-Z0-9-] are allowed. Value of null or undefined causes the
   *     attribute to be omitted.
   * @return {!SafeHtml} The SafeHtml content with the tag.
   * @throws {!Error} If invalid attribute name or attribute value is provided.
   *     If attributes  contains the
   *     language, src or text attribute.
   * @deprecated Use safevalues.scriptToHtml instead.
   */
  static createScript(script, attributes = undefined) {
    for (let attr in attributes) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty#Using_hasOwnProperty_as_a_property_name
      if (Object.prototype.hasOwnProperty.call(attributes, attr)) {
        const attrLower = attr.toLowerCase();
        if (attrLower == 'language' || attrLower == 'src' ||
            attrLower == 'text') {
          throw new Error(
              SafeHtml.ENABLE_ERROR_MESSAGES ?
                  `Cannot set "${attrLower}" attribute` :
                  '');
        }
      }
    }

    let content = '';
    script = googArray.concat(script);
    for (let i = 0; i < script.length; i++) {
      content += SafeScript.unwrap(script[i]);
    }
    // Convert to SafeHtml so that it's not HTML-escaped. This is safe because
    // as part of its contract, SafeScript should have no dangerous '<'.
    const htmlContent =
        SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content);
    return SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
        'script', attributes, htmlContent);
  }


  /**
   * Creates a SafeHtml representing a style tag. The type attribute is set
   * to "text/css".
   * @param {!SafeStyleSheet|!Array<!SafeStyleSheet>}
   *     styleSheet Content to put inside the tag. Array elements are
   *     concatenated.
   * @param {?Object<string, ?SafeHtml.AttributeValue>=} attributes  Mapping
   *     from attribute names to their values. Only attribute names consisting
   *     of [a-zA-Z0-9-] are allowed. Value of null or undefined causes the
   *     attribute to be omitted.
   * @return {!SafeHtml} The SafeHtml content with the tag.
   * @throws {!Error} If invalid attribute name or attribute value is provided.
   *     If attributes  contains the
   *     type attribute.
   */
  static createStyle(styleSheet, attributes = undefined) {
    const fixedAttributes = {'type': 'text/css'};
    const defaultAttributes = {};
    const combinedAttrs = SafeHtml.combineAttributes(
        fixedAttributes, defaultAttributes, attributes);

    let content = '';
    styleSheet = googArray.concat(styleSheet);
    for (let i = 0; i < styleSheet.length; i++) {
      content += SafeStyleSheet.unwrap(styleSheet[i]);
    }
    // Convert to SafeHtml so that it's not HTML-escaped. This is safe because
    // as part of its contract, SafeStyleSheet should have no dangerous '<'.
    const htmlContent =
        SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content);
    return SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
        'style', combinedAttrs, htmlContent);
  }


  /**
   * Creates a SafeHtml representing a meta refresh tag.
   * @param {!SafeUrl|string} url Where to redirect. If a string is
   *     passed, it will be sanitized with SafeUrl.sanitize().
   * @param {number=} secs Number of seconds until the page should be
   *     reloaded. Will be set to 0 if unspecified.
   * @return {!SafeHtml} The SafeHtml content with the tag.
   */
  static createMetaRefresh(url, secs = undefined) {
    // Note that sanitize is a no-op on SafeUrl.
    let unwrappedUrl = SafeUrl.unwrap(SafeUrl.sanitize(url));

    if (browser.isIE() || browser.isEdge()) {
      // IE/EDGE can't parse the content attribute if the url contains a
      // semicolon. We can fix this by adding quotes around the url, but then we
      // can't parse quotes in the URL correctly. Also, it seems that IE/EDGE
      // did not unescape semicolons in these URLs at some point in the past. We
      // take a best-effort approach.
      //
      // If the URL has semicolons (which may happen in some cases, see
      // http://www.w3.org/TR/1999/REC-html401-19991224/appendix/notes.html#h-B.2
      // for instance), wrap it in single quotes to protect the semicolons.
      // If the URL has semicolons and single quotes, url-encode the single
      // quotes as well.
      //
      // This is imperfect. Notice that both ' and ; are reserved characters in
      // URIs, so this could do the wrong thing, but at least it will do the
      // wrong thing in only rare cases.
      if (internal.contains(unwrappedUrl, ';')) {
        unwrappedUrl = '\'' + unwrappedUrl.replace(/'/g, '%27') + '\'';
      }
    }
    const attributes = {
      'http-equiv': 'refresh',
      'content': (secs || 0) + '; url=' + unwrappedUrl,
    };

    // This function will handle the HTML escaping for attributes.
    return SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
        'meta', attributes);
  }

  /**
   * Creates a new SafeHtml object by joining the parts with separator.
   * @param {!SafeHtml.TextOrHtml_} separator
   * @param {!Array<!SafeHtml.TextOrHtml_|
   *     !Array<!SafeHtml.TextOrHtml_>>} parts Parts to join. If a part
   *     contains an array then each member of this array is also joined with
   * the separator.
   * @return {!SafeHtml}
   */
  static join(separator, parts) {
    const separatorHtml = SafeHtml.htmlEscape(separator);
    const content = [];

    /**
     * @param {!SafeHtml.TextOrHtml_|
     *     !Array<!SafeHtml.TextOrHtml_>} argument
     */
    const addArgument = (argument) => {
      if (Array.isArray(argument)) {
        argument.forEach(addArgument);
      } else {
        const html = SafeHtml.htmlEscape(argument);
        content.push(SafeHtml.unwrap(html));
      }
    };

    parts.forEach(addArgument);
    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        content.join(SafeHtml.unwrap(separatorHtml)));
  }


  /**
   * Creates a new SafeHtml object by concatenating values.
   * @param {...(!SafeHtml.TextOrHtml_|
   *     !Array<!SafeHtml.TextOrHtml_>)} var_args Values to concatenate.
   * @return {!SafeHtml}
   */
  static concat(var_args) {
    return SafeHtml.join(SafeHtml.EMPTY, Array.prototype.slice.call(arguments));
  }

  /**
   * Package-internal utility method to create SafeHtml instances.
   *
   * @param {string} html The string to initialize the SafeHtml object with.
   * @return {!SafeHtml} The initialized SafeHtml object.
   * @package
   */
  static createSafeHtmlSecurityPrivateDoNotAccessOrElse(html) {
    /** @noinline */
    const noinlineHtml = html;
    const policy = trustedtypes.getPolicyPrivateDoNotAccessOrElse();
    const trustedHtml = policy ? policy.createHTML(noinlineHtml) : noinlineHtml;
    return new SafeHtml(trustedHtml, CONSTRUCTOR_TOKEN_PRIVATE);
  }


  /**
   * Like create() but does not restrict which tags can be constructed.
   *
   * @param {string} tagName Tag name. Set or validated by caller.
   * @param {?Object<string, ?SafeHtml.AttributeValue>=} attributes
   * @param {(!SafeHtml.TextOrHtml_|
   *     !Array<!SafeHtml.TextOrHtml_>)=} content
   * @return {!SafeHtml}
   * @throws {!Error} If invalid or unsafe attribute name or value is provided.
   * @throws {!asserts.AssertionError} If content for void tag is provided.
   * @package
   */
  static createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      tagName, attributes = undefined, content = undefined) {
    let result = `<${tagName}`;
    result += SafeHtml.stringifyAttributes(tagName, attributes);

    if (content == null) {
      content = [];
    } else if (!Array.isArray(content)) {
      content = [content];
    }

    if (tags.isVoidTag(tagName.toLowerCase())) {
      asserts.assert(
          !content.length, `Void tag <${tagName}> does not allow content.`);
      result += '>';
    } else {
      const html = SafeHtml.concat(content);
      result += '>' + SafeHtml.unwrap(html) + '</' + tagName + '>';
    }

    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(result);
  }


  /**
   * Creates a string with attributes to insert after tagName.
   * @param {string} tagName
   * @param {?Object<string, ?SafeHtml.AttributeValue>=} attributes
   * @return {string} Returns an empty string if there are no attributes,
   *     returns a string starting with a space otherwise.
   * @throws {!Error} If attribute value is unsafe for the given tag and
   *     attribute.
   * @package
   */
  static stringifyAttributes(tagName, attributes = undefined) {
    let result = '';
    if (attributes) {
      for (let name in attributes) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty#Using_hasOwnProperty_as_a_property_name
        if (Object.prototype.hasOwnProperty.call(attributes, name)) {
          if (!VALID_NAMES_IN_TAG.test(name)) {
            throw new Error(
                SafeHtml.ENABLE_ERROR_MESSAGES ?
                    `Invalid attribute name "${name}".` :
                    '');
          }
          const value = attributes[name];
          if (value == null) {
            continue;
          }
          result += ' ' + getAttrNameAndValue(tagName, name, value);
        }
      }
    }
    return result;
  }


  /**
   * @param {!Object<string, ?SafeHtml.AttributeValue>} fixedAttributes
   * @param {!Object<string, string>} defaultAttributes
   * @param {?Object<string, ?SafeHtml.AttributeValue>=} attributes  Optional
   *     attributes passed to create*().
   * @return {!Object<string, ?SafeHtml.AttributeValue>}
   * @throws {!Error} If attributes contains an attribute with the same name as
   *     an attribute in fixedAttributes.
   * @package
   */
  static combineAttributes(
      fixedAttributes, defaultAttributes, attributes = undefined) {
    const combinedAttributes = {};

    for (const name in fixedAttributes) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty#Using_hasOwnProperty_as_a_property_name
      if (Object.prototype.hasOwnProperty.call(fixedAttributes, name)) {
        asserts.assert(name.toLowerCase() == name, 'Must be lower case');
        combinedAttributes[name] = fixedAttributes[name];
      }
    }
    for (const name in defaultAttributes) {
      if (Object.prototype.hasOwnProperty.call(defaultAttributes, name)) {
        asserts.assert(name.toLowerCase() == name, 'Must be lower case');
        combinedAttributes[name] = defaultAttributes[name];
      }
    }

    if (attributes) {
      for (const name in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, name)) {
          const nameLower = name.toLowerCase();
          if (nameLower in fixedAttributes) {
            throw new Error(
                SafeHtml.ENABLE_ERROR_MESSAGES ?
                    `Cannot override "${nameLower}" attribute, got "` + name +
                        '" with value "' + attributes[name] + '"' :
                    '');
          }
          if (nameLower in defaultAttributes) {
            delete combinedAttributes[nameLower];
          }
          combinedAttributes[name] = attributes[name];
        }
      }
    }

    return combinedAttributes;
  }
}


/**
 * @define {boolean} Whether to strip out error messages or to leave them in.
 */
SafeHtml.ENABLE_ERROR_MESSAGES =
    goog.define('goog.html.SafeHtml.ENABLE_ERROR_MESSAGES', goog.DEBUG);


/**
 * Whether the `style` attribute is supported. Set to false to avoid the byte
 * weight of `SafeStyle` where unneeded. An error will be thrown if
 * the `style` attribute is used.
 * @define {boolean}
 */
SafeHtml.SUPPORT_STYLE_ATTRIBUTE =
    goog.define('goog.html.SafeHtml.SUPPORT_STYLE_ATTRIBUTE', true);


/**
 * Shorthand for union of types that can sensibly be converted to strings
 * or might already be SafeHtml (as SafeHtml is a TypedString).
 * @private
 * @typedef {string|number|boolean|!TypedString}
 */
SafeHtml.TextOrHtml_;


/**
 * Coerces an arbitrary object into a SafeHtml object.
 *
 * If `textOrHtml` is already of type `SafeHtml`, the same
 * object is returned. Otherwise, `textOrHtml` is coerced to string, and
 * HTML-escaped.
 *
 * @param {!SafeHtml.TextOrHtml_} textOrHtml The text or SafeHtml to
 *     coerce.
 * @return {!SafeHtml} The resulting SafeHtml object.
 * @deprecated Use SafeHtml.htmlEscape.
 */
SafeHtml.from = SafeHtml.htmlEscape;


/**
 * @const
 */
const VALID_NAMES_IN_TAG = /^[a-zA-Z0-9-]+$/;


/**
 * Set of attributes containing URL as defined at
 * http://www.w3.org/TR/html5/index.html#attributes-1.
 * @const {!Object<string,boolean>}
 */
const URL_ATTRIBUTES = googObject.createSet(
    'action', 'cite', 'data', 'formaction', 'href', 'manifest', 'poster',
    'src');


/**
 * Tags which are unsupported via create(). They might be supported via a
 * tag-specific create method. These are tags which might require a
 * TrustedResourceUrl in one of their attributes or a restricted type for
 * their content.
 * @const {!Object<string,boolean>}
 */
const NOT_ALLOWED_TAG_NAMES = googObject.createSet(
    TagName.APPLET, TagName.BASE, TagName.EMBED, TagName.IFRAME, TagName.LINK,
    TagName.MATH, TagName.META, TagName.OBJECT, TagName.SCRIPT, TagName.STYLE,
    TagName.SVG, TagName.TEMPLATE);


/**
 * @typedef {string|number|!TypedString|
 *     !SafeStyle.PropertyMap|undefined|null}
 */
SafeHtml.AttributeValue;


/**
 * @param {string} tagName The tag name.
 * @param {string} name The attribute name.
 * @param {!SafeHtml.AttributeValue} value The attribute value.
 * @return {string} A "name=value" string.
 * @throws {!Error} If attribute value is unsafe for the given tag and
 *     attribute.
 * @private
 */
function getAttrNameAndValue(tagName, name, value) {
  // If it's goog.string.Const, allow any valid attribute name.
  if (value instanceof Const) {
    value = Const.unwrap(value);
  } else if (name.toLowerCase() == 'style') {
    if (SafeHtml.SUPPORT_STYLE_ATTRIBUTE) {
      value = getStyleValue(value);
    } else {
      throw new Error(
          SafeHtml.ENABLE_ERROR_MESSAGES ? 'Attribute "style" not supported.' :
                                           '');
    }
  } else if (/^on/i.test(name)) {
    // TODO(jakubvrana): Disallow more attributes with a special meaning.
    throw new Error(
        SafeHtml.ENABLE_ERROR_MESSAGES ? `Attribute "${name}` +
                '" requires goog.string.Const value, "' + value + '" given.' :
                                         '');
    // URL attributes handled differently according to tag.
  } else if (name.toLowerCase() in URL_ATTRIBUTES) {
    if (value instanceof TrustedResourceUrl) {
      value = TrustedResourceUrl.unwrap(value);
    } else if (value instanceof SafeUrl) {
      value = SafeUrl.unwrap(value);
    } else if (typeof value === 'string') {
      value = SafeUrl.sanitize(value).getTypedStringValue();
    } else {
      throw new Error(
          SafeHtml.ENABLE_ERROR_MESSAGES ?
              `Attribute "${name}" on tag "${tagName}` +
                  '" requires goog.html.SafeUrl, goog.string.Const, or' +
                  ' string, value "' + value + '" given.' :
              '');
    }
  }

  // Accept SafeUrl, TrustedResourceUrl, etc. for attributes which only require
  // HTML-escaping.
  if (/** @type {?} */ (value).implementsGoogStringTypedString) {
    // Ok to call getTypedStringValue() since there's no reliance on the type
    // contract for security here.
    value =
        /** @type {!TypedString} */ (value).getTypedStringValue();
  }

  asserts.assert(
      typeof value === 'string' || typeof value === 'number',
      'String or number value expected, got ' + (typeof value) +
          ' with value: ' + value);
  return `${name}="` + internal.htmlEscape(String(value)) + '"';
}


/**
 * Gets value allowed in "style" attribute.
 * @param {!SafeHtml.AttributeValue} value It could be SafeStyle or a
 *     map which will be passed to SafeStyle.create.
 * @return {string} Unwrapped value.
 * @throws {!Error} If string value is given.
 * @private
 */
function getStyleValue(value) {
  if (!utils.isObject(value)) {
    throw new Error(
        SafeHtml.ENABLE_ERROR_MESSAGES ?
            'The "style" attribute requires goog.html.SafeStyle or map ' +
                'of style properties, ' + (typeof value) + ' given: ' + value :
            '');
  }
  if (!(value instanceof SafeStyle)) {
    // Process the property bag into a style object.
    value = SafeStyle.create(/** @type {!SafeStyle.PropertyMap} */ (value));
  }
  return SafeStyle.unwrap(value);
}


/**
 * A SafeHtml instance corresponding to the HTML doctype: "<!DOCTYPE html>".
 * @const {!SafeHtml}
 */
SafeHtml.DOCTYPE_HTML = /** @type {!SafeHtml} */ ({
  // NOTE: this compiles to nothing, but hides the possible side effect of
  // SafeHtml creation (due to calling trustedTypes.createPolicy) from the
  // compiler so that the entire call can be removed if the result is not used.
  valueOf: function() {
    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        '<!DOCTYPE html>');
  },
}.valueOf());

/**
 * A SafeHtml instance corresponding to the empty string.
 * @const {!SafeHtml}
 */
SafeHtml.EMPTY = new SafeHtml(
    (goog.global.trustedTypes && goog.global.trustedTypes.emptyHTML) || '',
    CONSTRUCTOR_TOKEN_PRIVATE);

/**
 * A SafeHtml instance corresponding to the <br> tag.
 * @const {!SafeHtml}
 */
SafeHtml.BR = /** @type {!SafeHtml} */ ({
  // NOTE: this compiles to nothing, but hides the possible side effect of
  // SafeHtml creation (due to calling trustedTypes.createPolicy) from the
  // compiler so that the entire call can be removed if the result is not used.
  valueOf: function() {
    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse('<br>');
  },
}.valueOf());


exports = SafeHtml;
