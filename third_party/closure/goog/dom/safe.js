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
 * vulnerability. The type-safe wrapper goog.html.setInnerHtml consumes a value
 * of type goog.html.SafeHtml, whose contract states that using its values in a
 * HTML context will not result in XSS. Hence a program that is free of direct
 * assignments to any element's innerHTML property (with the exception of the
 * assignment to .innerHTML in this file) is guaranteed to be free of XSS due to
 * assignment of untrusted strings to the innerHTML property.
 */

goog.provide('goog.dom.safe');
goog.provide('goog.dom.safe.InsertAdjacentHtmlPosition');

goog.require('goog.asserts');
goog.require('goog.html.SafeHtml');
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
 * Assigns known-safe HTML to an element's innerHTML property.
 * @param {!Element} elem The element whose innerHTML is to be assigned to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 */
goog.dom.safe.setInnerHtml = function(elem, html) {
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
  iframe.src = goog.html.TrustedResourceUrl.unwrap(url);
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
  object.data = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a URL to an iframe element's src property.
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
  script.src = goog.html.TrustedResourceUrl.unwrap(url);
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
