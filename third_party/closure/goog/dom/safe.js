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
 * @fileoverview Type-safe wrappers for unsafe DOM APIs.
 *
 * This file provides type-safe wrappers for DOM APIs that can result in
 * cross-site scripting (XSS) vulnerabilities, if the API is supplied with
 * untrusted (attacker-controlled) input.  Instead of plain strings, the type
 * safe wrappers consume values of types from the goog.html package whose
 * contract promises that values are safe to use in the corresponding context.
 *
 * Hence, a program that exclusively uses the wrappers in this file (i.e., whose
 * only reference to security-sensitive raw DOM APIs are in this file) is
 * guaranteed to be free of XSS due to incorrect use of such DOM APIs (modulo
 * correctness of code that produces values of the respective goog.html types,
 * and absent code that violates type safety).
 *
 * For example, assigning to an element's .innerHTML property a string that is
 * derived (even partially) from untrusted input typically results in an XSS
 * vulnerability. The type-safe wrapper goog.dom.safe.setInnerHtml consumes a
 * value of type goog.html.SafeHtml, whose contract states that using its values
 * in a HTML context will not result in XSS. Hence a program that is free of
 * direct assignments to any element's innerHTML property (with the exception of
 * the assignment to .innerHTML in this file) is guaranteed to be free of XSS
 * due to assignment of untrusted strings to the innerHTML property.
 */

goog.provide('goog.dom.safe');
goog.provide('goog.dom.safe.InsertAdjacentHtmlPosition');

goog.require('goog.asserts');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeScript');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string');
goog.require('goog.string.Const');


/** @enum {string} */
goog.dom.safe.InsertAdjacentHtmlPosition = {
  AFTERBEGIN: 'afterbegin',
  AFTEREND: 'afterend',
  BEFOREBEGIN: 'beforebegin',
  BEFOREEND: 'beforeend'
};


/**
 * Inserts known-safe HTML into a Node, at the specified position.
 * @param {!Node} node The node on which to call insertAdjacentHTML.
 * @param {!goog.dom.safe.InsertAdjacentHtmlPosition} position Position where
 *     to insert the HTML.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to insert.
 */
goog.dom.safe.insertAdjacentHtml = function(node, position, html) {
  node.insertAdjacentHTML(position, goog.html.SafeHtml.unwrap(html));
};


/**
 * Tags not allowed in goog.dom.safe.setInnerHtml.
 * @private @const {!Object<string, boolean>}
 */
goog.dom.safe.SET_INNER_HTML_DISALLOWED_TAGS_ = {
  'MATH': true,
  'SCRIPT': true,
  'STYLE': true,
  'SVG': true,
  'TEMPLATE': true
};


/**
 * Assigns known-safe HTML to an element's innerHTML property.
 * @param {!Element} elem The element whose innerHTML is to be assigned to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 * @throws {Error} If called with one of these tags: math, script, style, svg,
 *     template.
 */
goog.dom.safe.setInnerHtml = function(elem, html) {
  if (goog.asserts.ENABLE_ASSERTS) {
    var tagName = elem.tagName.toUpperCase();
    if (goog.dom.safe.SET_INNER_HTML_DISALLOWED_TAGS_[tagName]) {
      throw Error(
          'goog.dom.safe.setInnerHtml cannot be used to set content of ' +
          elem.tagName + '.');
    }
  }
  elem.innerHTML = goog.html.SafeHtml.unwrap(html);
};


/**
 * Assigns known-safe HTML to an element's outerHTML property.
 * @param {!Element} elem The element whose outerHTML is to be assigned to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 */
goog.dom.safe.setOuterHtml = function(elem, html) {
  elem.outerHTML = goog.html.SafeHtml.unwrap(html);
};


/**
 * Sets the given element's style property to the contents of the provided
 * SafeStyle object.
 * @param {!Element} elem
 * @param {!goog.html.SafeStyle} style
 */
goog.dom.safe.setStyle = function(elem, style) {
  elem.style.cssText = goog.html.SafeStyle.unwrap(style);
};


/**
 * Writes known-safe HTML to a document.
 * @param {!Document} doc The document to be written to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 */
goog.dom.safe.documentWrite = function(doc, html) {
  doc.write(goog.html.SafeHtml.unwrap(html));
};


/**
 * Safely assigns a URL to an anchor element's href property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * anchor's href property.  If url is of type string however, it is first
 * sanitized using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.setAnchorHref(anchorEl, url);
 * which is a safe alternative to
 *   anchorEl.href = url;
 * The latter can result in XSS vulnerabilities if url is a
 * user-/attacker-controlled value.
 *
 * @param {!HTMLAnchorElement} anchor The anchor element whose href property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setAnchorHref = function(anchor, url) {
  goog.dom.safe.assertIsHTMLAnchorElement_(anchor);
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  anchor.href = goog.html.SafeUrl.unwrap(safeUrl);
};


/**
 * Safely assigns a URL to an image element's src property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * image's src property.  If url is of type string however, it is first
 * sanitized using goog.html.SafeUrl.sanitize.
 *
 * @param {!HTMLImageElement} imageElement The image element whose src property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setImageSrc = function(imageElement, url) {
  goog.dom.safe.assertIsHTMLImageElement_(imageElement);
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  imageElement.src = goog.html.SafeUrl.unwrap(safeUrl);
};


/**
 * Safely assigns a URL to an embed element's src property.
 *
 * Example usage:
 *   goog.dom.safe.setEmbedSrc(embedEl, url);
 * which is a safe alternative to
 *   embedEl.src = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLEmbedElement} embed The embed element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setEmbedSrc = function(embed, url) {
  goog.dom.safe.assertIsHTMLEmbedElement_(embed);
  embed.src = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a URL to a frame element's src property.
 *
 * Example usage:
 *   goog.dom.safe.setFrameSrc(frameEl, url);
 * which is a safe alternative to
 *   frameEl.src = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLFrameElement} frame The frame element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setFrameSrc = function(frame, url) {
  goog.dom.safe.assertIsHTMLFrameElement_(frame);
  frame.src = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a URL to an iframe element's src property.
 *
 * Example usage:
 *   goog.dom.safe.setIframeSrc(iframeEl, url);
 * which is a safe alternative to
 *   iframeEl.src = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLIFrameElement} iframe The iframe element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setIframeSrc = function(iframe, url) {
  goog.dom.safe.assertIsHTMLIFrameElement_(iframe);
  iframe.src = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns HTML to an iframe element's srcdoc property.
 *
 * Example usage:
 *   goog.dom.safe.setIframeSrcdoc(iframeEl, safeHtml);
 * which is a safe alternative to
 *   iframeEl.srcdoc = html;
 * The latter can result in loading untrusted code.
 *
 * @param {!HTMLIFrameElement} iframe The iframe element whose srcdoc property
 *     is to be assigned to.
 * @param {!goog.html.SafeHtml} html The HTML to assign.
 */
goog.dom.safe.setIframeSrcdoc = function(iframe, html) {
  goog.dom.safe.assertIsHTMLIFrameElement_(iframe);
  iframe.srcdoc = goog.html.SafeHtml.unwrap(html);
};


/**
 * Safely sets a link element's href and rel properties. Whether or not
 * the URL assigned to href has to be a goog.html.TrustedResourceUrl
 * depends on the value of the rel property. If rel contains "stylesheet"
 * then a TrustedResourceUrl is required.
 *
 * Example usage:
 *   goog.dom.safe.setLinkHrefAndRel(linkEl, url, 'stylesheet');
 * which is a safe alternative to
 *   linkEl.rel = 'stylesheet';
 *   linkEl.href = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLLinkElement} link The link element whose href property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl|!goog.html.TrustedResourceUrl} url The URL
 *     to assign to the href property. Must be a TrustedResourceUrl if the
 *     value assigned to rel contains "stylesheet". A string value is
 *     sanitized with goog.html.SafeUrl.sanitize.
 * @param {string} rel The value to assign to the rel property.
 * @throws {Error} if rel contains "stylesheet" and url is not a
 *     TrustedResourceUrl
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setLinkHrefAndRel = function(link, url, rel) {
  goog.dom.safe.assertIsHTMLLinkElement_(link);
  link.rel = rel;
  if (goog.string.caseInsensitiveContains(rel, 'stylesheet')) {
    goog.asserts.assert(
        url instanceof goog.html.TrustedResourceUrl,
        'URL must be TrustedResourceUrl because "rel" contains "stylesheet"');
    link.href = goog.html.TrustedResourceUrl.unwrap(url);
  } else if (url instanceof goog.html.TrustedResourceUrl) {
    link.href = goog.html.TrustedResourceUrl.unwrap(url);
  } else if (url instanceof goog.html.SafeUrl) {
    link.href = goog.html.SafeUrl.unwrap(url);
  } else {  // string
    // SafeUrl.sanitize must return legitimate SafeUrl when passed a string.
    link.href = goog.html.SafeUrl.sanitize(url).getTypedStringValue();
  }
};


/**
 * Safely assigns a URL to an object element's data property.
 *
 * Example usage:
 *   goog.dom.safe.setObjectData(objectEl, url);
 * which is a safe alternative to
 *   objectEl.data = url;
 * The latter can result in loading untrusted code unless setit is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLObjectElement} object The object element whose data property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setObjectData = function(object, url) {
  goog.dom.safe.assertIsHTMLObjectElement_(object);
  object.data = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a URL to a script element's src property.
 *
 * Example usage:
 *   goog.dom.safe.setScriptSrc(scriptEl, url);
 * which is a safe alternative to
 *   scriptEl.src = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLScriptElement} script The script element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setScriptSrc = function(script, url) {
  goog.dom.safe.assertIsHTMLScriptElement_(script);
  script.src = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a value to a script element's content.
 *
 * Example usage:
 *   goog.dom.safe.setScriptContent(scriptEl, content);
 * which is a safe alternative to
 *   scriptEl.text = content;
 * The latter can result in executing untrusted code unless it is ensured that
 * the code is loaded from a trustworthy resource.
 *
 * @param {!HTMLScriptElement} script The script element whose content is being
 *     set.
 * @param {!goog.html.SafeScript} content The content to assign.
 */
goog.dom.safe.setScriptContent = function(script, content) {
  goog.dom.safe.assertIsHTMLScriptElement_(script);
  script.text = goog.html.SafeScript.unwrap(content);
};


/**
 * Safely assigns a URL to a Location object's href property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * loc's href property.  If url is of type string however, it is first sanitized
 * using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.setLocationHref(document.location, redirectUrl);
 * which is a safe alternative to
 *   document.location.href = redirectUrl;
 * The latter can result in XSS vulnerabilities if redirectUrl is a
 * user-/attacker-controlled value.
 *
 * @param {!Location} loc The Location object whose href property is to be
 *     assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setLocationHref = function(loc, url) {
  goog.dom.safe.assertIsLocation_(loc);
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  loc.href = goog.html.SafeUrl.unwrap(safeUrl);
};


/**
 * Safely opens a URL in a new window (via window.open).
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and passed in to
 * window.open.  If url is of type string however, it is first sanitized
 * using goog.html.SafeUrl.sanitize.
 *
 * Note that this function does not prevent leakages via the referer that is
 * sent by window.open. It is advised to only use this to open 1st party URLs.
 *
 * Example usage:
 *   goog.dom.safe.openInWindow(url);
 * which is a safe alternative to
 *   window.open(url);
 * The latter can result in XSS vulnerabilities if redirectUrl is a
 * user-/attacker-controlled value.
 *
 * @param {string|!goog.html.SafeUrl} url The URL to open.
 * @param {Window=} opt_openerWin Window of which to call the .open() method.
 *     Defaults to the global window.
 * @param {!goog.string.Const=} opt_name Name of the window to open in. Can be
 *     _top, etc as allowed by window.open().
 * @param {string=} opt_specs Comma-separated list of specifications, same as
 *     in window.open().
 * @param {boolean=} opt_replace Whether to replace the current entry in browser
 *     history, same as in window.open().
 * @return {Window} Window the url was opened in.
 */
goog.dom.safe.openInWindow = function(
    url, opt_openerWin, opt_name, opt_specs, opt_replace) {
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  var win = opt_openerWin || window;
  return win.open(
      goog.html.SafeUrl.unwrap(safeUrl),
      // If opt_name is undefined, simply passing that in to open() causes IE to
      // reuse the current window instead of opening a new one. Thus we pass ''
      // in instead, which according to spec opens a new window. See
      // https://html.spec.whatwg.org/multipage/browsers.html#dom-open .
      opt_name ? goog.string.Const.unwrap(opt_name) : '', opt_specs,
      opt_replace);
};


/*
 * Custom assertions for use in the above wrapper methods to ensure that they
 * are indeed invoked on an element of the appropriate type.
 *
 * Using a goog.dom.safe wrapper on an object on the incorrect type (via an
 * incorrect static type cast) can result in security bugs: For instance,
 * g.d.s.setAnchorHref ensures that the URL assigned to the .href attribute
 * satisfies the SafeUrl contract, i.e., is safe to dereference as a hyperlink.
 * However, the value assigned to a HTMLLinkElement's .href property requires
 * the stronger TrustedResourceUrl contract, since it can refer to a stylesheet.
 * Thus, using g.d.s.setAnchorHref on an (incorrectly statically typed) object
 * of type HTMLLinkElement can result in a security vulnerability.
 * Assertions of the correct run-time type help prevent such incorrect use.
 *
 * In some cases, code using the DOM API is tested using mock objects (e.g., a
 * plain object such as {'href': url} instead of an actual Location object).
 * To allow such mocking, the assertions permit objects of types that are not
 * relevant DOM API objects at all (for instance, not Element or Location).
 *
 * Note that instanceof checks don't work straightforwardly in older versions of
 * IE, or across frames (see,
 * http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object,
 * http://stackoverflow.com/questions/26248599/instanceof-htmlelement-in-iframe-is-not-element-or-object).
 *
 * Hence, these assertions may pass vacuously in such scenarios. The resulting
 * risk of security bugs is limited by the following factors:
 *  - A bug can only arise in scenarios involving incorrect static typing (the
 *    wrapper methods are statically typed to demand objects of the appropriate,
 *    precise type).
 *  - Operations on elements across frames are relatively rare.
 *  - Typically, code is tested and exercised in multiple browsers.
 */

/**
 * Asserts that a given object is a Location.
 *
 * To permit this assertion to pass in the context of tests where DOM APIs might
 * be mocked, also accepts any other type except for subtypes of {!Element}.
 * This is to ensure that, for instance, HTMLLinkElement is not being used in
 * place of a Location, since this could result in security bugs due to stronger
 * contracts required for assignments to the href property of the latter.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!Location}
 * @private
 */
goog.dom.safe.assertIsLocation_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof Location != 'undefined' &&
      typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof Location || !(o instanceof Element)),
        'Argument is not a Location (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!Location} */ (o);
};

/**
 * Asserts that a given object is a HTMLAnchorElement.
 *
 * To permit this assertion to pass in the context of tests where elements might
 * be mocked, also accepts objects that are not of type Location nor a subtype
 * of Element.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!HTMLAnchorElement}
 * @private
 */
goog.dom.safe.assertIsHTMLAnchorElement_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof HTMLAnchorElement != 'undefined' &&
      typeof Location != 'undefined' && typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof HTMLAnchorElement ||
              !((o instanceof Location) || (o instanceof Element))),
        'Argument is not a HTMLAnchorElement (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!HTMLAnchorElement} */ (o);
};

/**
 * Asserts that a given object is a HTMLLinkElement.
 *
 * To permit this assertion to pass in the context of tests where elements might
 * be mocked, also accepts objects that are not a subtype of Element.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!HTMLLinkElement}
 * @private
 */
goog.dom.safe.assertIsHTMLLinkElement_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof HTMLLinkElement != 'undefined' &&
      typeof Location != 'undefined' && typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof HTMLLinkElement ||
              !((o instanceof Location) || (o instanceof Element))),
        'Argument is not a HTMLLinkElement (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!HTMLLinkElement} */ (o);
};

/**
 * Asserts that a given object is a HTMLImageElement.
 *
 * To permit this assertion to pass in the context of tests where elements might
 * be mocked, also accepts objects that are not a subtype of Element.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!HTMLImageElement}
 * @private
 */
goog.dom.safe.assertIsHTMLImageElement_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof HTMLImageElement != 'undefined' &&
      typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof HTMLImageElement || !(o instanceof Element)),
        'Argument is not a HTMLImageElement (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!HTMLImageElement} */ (o);
};

/**
 * Asserts that a given object is a HTMLEmbedElement.
 *
 * To permit this assertion to pass in the context of tests where elements might
 * be mocked, also accepts objects that are not a subtype of Element.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!HTMLEmbedElement}
 * @private
 */
goog.dom.safe.assertIsHTMLEmbedElement_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof HTMLEmbedElement != 'undefined' &&
      typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof HTMLEmbedElement || !(o instanceof Element)),
        'Argument is not a HTMLEmbedElement (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!HTMLEmbedElement} */ (o);
};

/**
 * Asserts that a given object is a HTMLFrameElement.
 *
 * To permit this assertion to pass in the context of tests where elements might
 * be mocked, also accepts objects that are not a subtype of Element.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!HTMLFrameElement}
 * @private
 */
goog.dom.safe.assertIsHTMLFrameElement_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof HTMLFrameElement != 'undefined' &&
      typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof HTMLFrameElement || !(o instanceof Element)),
        'Argument is not a HTMLFrameElement (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!HTMLFrameElement} */ (o);
};

/**
 * Asserts that a given object is a HTMLIFrameElement.
 *
 * To permit this assertion to pass in the context of tests where elements might
 * be mocked, also accepts objects that are not a subtype of Element.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!HTMLIFrameElement}
 * @private
 */
goog.dom.safe.assertIsHTMLIFrameElement_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof HTMLIFrameElement != 'undefined' &&
      typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof HTMLIFrameElement || !(o instanceof Element)),
        'Argument is not a HTMLIFrameElement (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!HTMLIFrameElement} */ (o);
};

/**
 * Asserts that a given object is a HTMLObjectElement.
 *
 * To permit this assertion to pass in the context of tests where elements might
 * be mocked, also accepts objects that are not a subtype of Element.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!HTMLObjectElement}
 * @private
 */
goog.dom.safe.assertIsHTMLObjectElement_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof HTMLObjectElement != 'undefined' &&
      typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof HTMLObjectElement || !(o instanceof Element)),
        'Argument is not a HTMLObjectElement (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!HTMLObjectElement} */ (o);
};

/**
 * Asserts that a given object is a HTMLScriptElement.
 *
 * To permit this assertion to pass in the context of tests where elements might
 * be mocked, also accepts objects that are not a subtype of Element.
 *
 * @param {?Object} o The object whose type to assert.
 * @return {!HTMLScriptElement}
 * @private
 */
goog.dom.safe.assertIsHTMLScriptElement_ = function(o) {
  if (goog.asserts.ENABLE_ASSERTS && typeof HTMLScriptElement != 'undefined' &&
      typeof Element != 'undefined') {
    goog.asserts.assert(
        o && (o instanceof HTMLScriptElement || !(o instanceof Element)),
        'Argument is not a HTMLScriptElement (or a non-Element mock); got: %s',
        goog.dom.safe.debugStringForType_(o));
  }
  return /** @type {!HTMLScriptElement} */ (o);
};

/**
 * Returns a string representation of a value's type.
 *
 * @param {*} value An object, or primitive.
 * @return {string} The best display name for the value.
 * @private
 */
goog.dom.safe.debugStringForType_ = function(value) {
  if (goog.isObject(value)) {
    return value.constructor.displayName || value.constructor.name ||
        Object.prototype.toString.call(value);
  } else {
    return value === undefined ? 'undefined' :
                                 value === null ? 'null' : typeof value;
  }
};
