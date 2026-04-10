/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

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
goog.require('goog.asserts.dom');
goog.require('goog.dom.asserts');
goog.require('goog.functions');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeScript');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.string.Const');
goog.require('goog.string.internal');


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
  'use strict';
  node.insertAdjacentHTML(position, goog.html.SafeHtml.unwrapTrustedHTML(html));
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
 * Whether assigning to innerHTML results in a non-spec-compliant clean-up. Used
 * to define goog.dom.safe.unsafeSetInnerHtmlDoNotUseOrElse.
 *
 * <p>As mentioned in https://stackoverflow.com/questions/28741528, re-rendering
 * an element in IE by setting innerHTML causes IE to recursively disconnect all
 * parent/children connections that were in the previous contents of the
 * element. Unfortunately, this can unexpectedly result in confusing cases where
 * a function is run (typically asynchronously) on element that has since
 * disconnected from the DOM but assumes the presence of its children. A simple
 * workaround is to remove all children first. Testing on IE11 via
 * https://jsperf.com/innerhtml-vs-removechild/239, removeChild seems to be
 * ~10x faster than innerHTML='' for a large number of children (perhaps due
 * to the latter's recursive behavior), implying that this workaround would
 * not hurt performance and might actually improve it.
 * @return {boolean}
 * @private
 */
goog.dom.safe.isInnerHtmlCleanupRecursive_ =
    goog.functions.cacheReturnValue(function() {
      'use strict';
      // `document` missing in some test frameworks.
      if (goog.DEBUG && typeof document === 'undefined') {
        return false;
      }
      // Create 3 nested <div>s without using innerHTML.
      // We're not chaining the appendChilds in one call,  as this breaks
      // in a DocumentFragment.
      var div = document.createElement('div');
      var childDiv = document.createElement('div');
      childDiv.appendChild(document.createElement('div'));
      div.appendChild(childDiv);
      // `firstChild` is null in Google Js Test.
      if (goog.DEBUG && !div.firstChild) {
        return false;
      }
      var innerChild = div.firstChild.firstChild;
      div.innerHTML =
          goog.html.SafeHtml.unwrapTrustedHTML(goog.html.SafeHtml.EMPTY);
      return !innerChild.parentElement;
    });


/**
 * Assigns HTML to an element's innerHTML property. Helper to use only here and
 * in soy.js.
 * @param {?Element|?ShadowRoot} elem The element whose innerHTML is to be
 *     assigned to.
 * @param {!goog.html.SafeHtml} html
 */
goog.dom.safe.unsafeSetInnerHtmlDoNotUseOrElse = function(elem, html) {
  'use strict';
  // See comment above goog.dom.safe.isInnerHtmlCleanupRecursive_.
  if (goog.dom.safe.isInnerHtmlCleanupRecursive_()) {
    while (elem.lastChild) {
      elem.removeChild(elem.lastChild);
    }
  }
  elem.innerHTML = goog.html.SafeHtml.unwrapTrustedHTML(html);
};


/**
 * Assigns known-safe HTML to an element's innerHTML property.
 * @param {!Element|!ShadowRoot} elem The element whose innerHTML is to be
 *     assigned to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 * @throws {Error} If called with one of these tags: math, script, style, svg,
 *     template.
 */
goog.dom.safe.setInnerHtml = function(elem, html) {
  'use strict';
  if (goog.asserts.ENABLE_ASSERTS && /** @type {?} */ (elem).tagName) {
    var tagName = /** @type {!Element} */ (elem).tagName.toUpperCase();
    if (goog.dom.safe.SET_INNER_HTML_DISALLOWED_TAGS_[tagName]) {
      throw new Error(
          'goog.dom.safe.setInnerHtml cannot be used to set content of ' +
          /** @type {!Element} */ (elem).tagName + '.');
    }
  }

  goog.dom.safe.unsafeSetInnerHtmlDoNotUseOrElse(elem, html);
};


/**
 * Assigns constant HTML to an element's innerHTML property.
 * @param {!Element} element The element whose innerHTML is to be assigned to.
 * @param {!goog.string.Const} constHtml The known-safe HTML to assign.
 * @throws {!Error} If called with one of these tags: math, script, style, svg,
 *     template.
 */
goog.dom.safe.setInnerHtmlFromConstant = function(element, constHtml) {
  'use strict';
  goog.dom.safe.setInnerHtml(
      element,
      goog.html.uncheckedconversions
          .safeHtmlFromStringKnownToSatisfyTypeContract(
              goog.string.Const.from('Constant HTML to be immediatelly used.'),
              goog.string.Const.unwrap(constHtml)));
};


/**
 * Assigns known-safe HTML to an element's outerHTML property.
 * @param {!Element} elem The element whose outerHTML is to be assigned to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 */
goog.dom.safe.setOuterHtml = function(elem, html) {
  'use strict';
  elem.outerHTML = goog.html.SafeHtml.unwrapTrustedHTML(html);
};


/**
 * Safely assigns a URL a form element's action property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * form's action property.  If url is of type string however, it is first
 * sanitized using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.setFormElementAction(formEl, url);
 * which is a safe alternative to
 *   formEl.action = url;
 * The latter can result in XSS vulnerabilities if url is a
 * user-/attacker-controlled value.
 *
 * @param {!Element} form The form element whose action property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @return {void}
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setFormElementAction = function(form, url) {
  'use strict';
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  goog.asserts.dom.assertIsHtmlFormElement(form).action =
      goog.html.SafeUrl.unwrap(safeUrl);
};

/**
 * Safely assigns a URL to a button element's formaction property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * button's formaction property.  If url is of type string however, it is first
 * sanitized using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.setButtonFormAction(buttonEl, url);
 * which is a safe alternative to
 *   buttonEl.action = url;
 * The latter can result in XSS vulnerabilities if url is a
 * user-/attacker-controlled value.
 *
 * @param {!Element} button The button element whose action property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @return {void}
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setButtonFormAction = function(button, url) {
  'use strict';
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  goog.asserts.dom.assertIsHtmlButtonElement(button).formAction =
      goog.html.SafeUrl.unwrap(safeUrl);
};
/**
 * Safely assigns a URL to an input element's formaction property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * input's formaction property.  If url is of type string however, it is first
 * sanitized using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.setInputFormAction(inputEl, url);
 * which is a safe alternative to
 *   inputEl.action = url;
 * The latter can result in XSS vulnerabilities if url is a
 * user-/attacker-controlled value.
 *
 * @param {!Element} input The input element whose action property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @return {void}
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setInputFormAction = function(input, url) {
  'use strict';
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  goog.asserts.dom.assertIsHtmlInputElement(input).formAction =
      goog.html.SafeUrl.unwrap(safeUrl);
};

/**
 * Sets the given element's style property to the contents of the provided
 * SafeStyle object.
 * @param {!Element} elem
 * @param {!goog.html.SafeStyle} style
 * @return {void}
 */
goog.dom.safe.setStyle = function(elem, style) {
  'use strict';
  elem.style.cssText = goog.html.SafeStyle.unwrap(style);
};


/**
 * Writes known-safe HTML to a document.
 * @param {!Document} doc The document to be written to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 * @return {void}
 */
goog.dom.safe.documentWrite = function(doc, html) {
  'use strict';
  doc.write(goog.html.SafeHtml.unwrapTrustedHTML(html));
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
 * @return {void}
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setAnchorHref = function(anchor, url) {
  'use strict';
  goog.asserts.dom.assertIsHtmlAnchorElement(anchor);
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  anchor.href = goog.html.SafeUrl.unwrap(safeUrl);
};


/**
 * Safely assigns a URL to a audio element's src property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * audio's src property.  If url is of type string however, it is first
 * sanitized using goog.html.SafeUrl.sanitize.
 *
 * @param {!HTMLAudioElement} audioElement The audio element whose src property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @return {void}
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setAudioSrc = function(audioElement, url) {
  'use strict';
  goog.asserts.dom.assertIsHtmlAudioElement(audioElement);
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  audioElement.src = goog.html.SafeUrl.unwrap(safeUrl);
};

/**
 * Safely assigns a URL to a video element's src property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * video's src property.  If url is of type string however, it is first
 * sanitized using goog.html.SafeUrl.sanitize.
 *
 * @param {!HTMLVideoElement} videoElement The video element whose src property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @return {void}
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setVideoSrc = function(videoElement, url) {
  'use strict';
  goog.asserts.dom.assertIsHtmlVideoElement(videoElement);
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  videoElement.src = goog.html.SafeUrl.unwrap(safeUrl);
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
  'use strict';
  goog.asserts.dom.assertIsHtmlEmbedElement(embed);
  embed.src = goog.html.TrustedResourceUrl.unwrapTrustedScriptURL(url);
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
 * @deprecated Use safevalues.dom.safeIframeEl.setSrc instead.
 * @param {!HTMLFrameElement} frame The frame element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 * @return {void}
 */
goog.dom.safe.setFrameSrc = function(frame, url) {
  'use strict';
  goog.asserts.dom.assertIsHtmlFrameElement(frame);
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
 * @return {void}
 */
goog.dom.safe.setIframeSrc = function(iframe, url) {
  'use strict';
  goog.asserts.dom.assertIsHtmlIFrameElement(iframe);
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
 * @return {void}
 */
goog.dom.safe.setIframeSrcdoc = function(iframe, html) {
  'use strict';
  goog.asserts.dom.assertIsHtmlIFrameElement(iframe);
  iframe.srcdoc = goog.html.SafeHtml.unwrapTrustedHTML(html);
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
 * @return {void}
 * @throws {Error} if rel contains "stylesheet" and url is not a
 *     TrustedResourceUrl
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setLinkHrefAndRel = function(link, url, rel) {
  'use strict';
  goog.asserts.dom.assertIsHtmlLinkElement(link);
  link.rel = rel;
  if (goog.string.internal.caseInsensitiveContains(rel, 'stylesheet')) {
    goog.asserts.assert(
        url instanceof goog.html.TrustedResourceUrl,
        'URL must be TrustedResourceUrl because "rel" contains "stylesheet"');
    link.href = goog.html.TrustedResourceUrl.unwrap(url);
    const win = link.ownerDocument && link.ownerDocument.defaultView;
    const nonce = goog.dom.safe.getStyleNonce(win);
    if (nonce) {
      link.setAttribute('nonce', nonce);
    }
  } else if (url instanceof goog.html.TrustedResourceUrl) {
    link.href = goog.html.TrustedResourceUrl.unwrap(url);
  } else if (url instanceof goog.html.SafeUrl) {
    link.href = goog.html.SafeUrl.unwrap(url);
  } else {  // string
    // SafeUrl.sanitize must return legitimate SafeUrl when passed a string.
    link.href = goog.html.SafeUrl.unwrap(
        goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url));
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
 * @deprecated
 *
 * @param {!HTMLObjectElement} object The object element whose data property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 * @return {void}
 */
goog.dom.safe.setObjectData = function(object, url) {
  'use strict';
  goog.asserts.dom.assertIsHtmlObjectElement(object);
  object.data = goog.html.TrustedResourceUrl.unwrapTrustedScriptURL(url);
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
 * @return {void}
 */
goog.dom.safe.setScriptSrc = function(script, url) {
  'use strict';
  goog.asserts.dom.assertIsHtmlScriptElement(script);
  goog.dom.safe.setNonceForScriptElement_(script);
  script.src = goog.html.TrustedResourceUrl.unwrapTrustedScriptURL(url);
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
 * @return {void}
 */
goog.dom.safe.setScriptContent = function(script, content) {
  'use strict';
  goog.asserts.dom.assertIsHtmlScriptElement(script);
  goog.dom.safe.setNonceForScriptElement_(script);
  script.textContent = goog.html.SafeScript.unwrapTrustedScript(content);
};


/**
 * Set nonce-based CSPs to dynamically created scripts.
 * @param {!HTMLScriptElement} script The script element whose nonce value
 *     is to be calculated
 * @private
 */
goog.dom.safe.setNonceForScriptElement_ = function(script) {
  'use strict';
  var win = script.ownerDocument && script.ownerDocument.defaultView;
  const nonce = goog.dom.safe.getScriptNonce(win);
  if (nonce) {
    script.setAttribute('nonce', nonce);
  }
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
 * @return {void}
 * @see goog.html.SafeUrl#sanitize

 */
goog.dom.safe.setLocationHref = function(loc, url) {
  'use strict';
  goog.dom.asserts.assertIsLocation(loc);
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  loc.href = goog.html.SafeUrl.unwrap(safeUrl);
};

/**
 * Safely assigns the URL of a Location object.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and
 * passed to Location#assign. If url is of type string however, it is
 * first sanitized using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.assignLocation(document.location, newUrl);
 * which is a safe alternative to
 *   document.location.assign(newUrl);
 * The latter can result in XSS vulnerabilities if newUrl is a
 * user-/attacker-controlled value.
 *
 * This has the same behaviour as setLocationHref, however some test
 * mock Location.assign instead of a property assignment.
 *
 * @param {!Location} loc The Location object which is to be assigned.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @return {void}
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.assignLocation = function(loc, url) {
  'use strict';
  goog.dom.asserts.assertIsLocation(loc);
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  loc.assign(goog.html.SafeUrl.unwrap(safeUrl));
};


/**
 * Safely replaces the URL of a Location object.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and
 * passed to Location#replace. If url is of type string however, it is
 * first sanitized using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.replaceLocation(document.location, newUrl);
 * which is a safe alternative to
 *   document.location.replace(newUrl);
 * The latter can result in XSS vulnerabilities if newUrl is a
 * user-/attacker-controlled value.
 *
 * @param {!Location} loc The Location object which is to be replaced.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @return {void}
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.replaceLocation = function(loc, url) {
  'use strict';
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  loc.replace(goog.html.SafeUrl.unwrap(safeUrl));
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
 * The latter can result in XSS vulnerabilities if url is a
 * user-/attacker-controlled value.
 *
 * @param {string|!goog.html.SafeUrl} url The URL to open.
 * @param {Window=} opt_openerWin Window of which to call the .open() method.
 *     Defaults to the global window.
 * @param {!goog.string.Const|string=} opt_name Name of the window to open in.
 *     Can be _top, etc as allowed by window.open(). This accepts string for
 *     legacy reasons. Pass goog.string.Const if possible.
 * @param {string=} opt_specs Comma-separated list of specifications, same as
 *     in window.open().
 * @return {Window} Window the url was opened in.
 */
goog.dom.safe.openInWindow = function(url, opt_openerWin, opt_name, opt_specs) {
  'use strict';
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitizeJavascriptUrlAssertUnchanged(url);
  }
  var win = opt_openerWin || goog.global;
  // If opt_name is undefined, simply passing that in to open() causes IE to
  // reuse the current window instead of opening a new one. Thus we pass '' in
  // instead, which according to spec opens a new window. See
  // https://html.spec.whatwg.org/multipage/browsers.html#dom-open .
  var name = opt_name instanceof goog.string.Const ?
      goog.string.Const.unwrap(opt_name) :
      opt_name || '';
  // Do not pass opt_specs to window.open unless it was provided by the caller.
  // IE11 will use it as a signal to open a new window rather than a new tab
  // (even if it is undefined).
  if (opt_specs !== undefined) {
    return win.open(goog.html.SafeUrl.unwrap(safeUrl), name, opt_specs);
  } else {
    return win.open(goog.html.SafeUrl.unwrap(safeUrl), name);
  }
};


/**
 * Parses the HTML as 'text/html'.
 * @param {!DOMParser} parser
 * @param {!goog.html.SafeHtml} html The HTML to be parsed.
 * @return {!Document}
 */
goog.dom.safe.parseFromStringHtml = function(parser, html) {
  'use strict';
  return goog.dom.safe.parseFromString(parser, html, 'text/html');
};


/**
 * Parses the string.
 * @param {!DOMParser} parser
 * @param {!goog.html.SafeHtml} content Note: We don't have a special type for
 *     XML or SVG supported by this function so we use SafeHtml.
 * @param {string} type
 * @return {!Document}
 */
goog.dom.safe.parseFromString = function(parser, content, type) {
  'use strict';
  return parser.parseFromString(
      goog.html.SafeHtml.unwrapTrustedHTML(content), type);
};


/**
 * Safely creates an HTMLImageElement from a Blob.
 *
 * Example usage:
 *     goog.dom.safe.createImageFromBlob(blob);
 * which is a safe alternative to
 *     image.src = createObjectUrl(blob)
 * The latter can result in executing malicious same-origin scripts from a bad
 * Blob.
 * @param {!Blob} blob The blob to create the image from.
 * @return {!HTMLImageElement} The image element created from the blob.
 * @throws {!Error} If called with a Blob with a MIME type other than image/.*.
 */
goog.dom.safe.createImageFromBlob = function(blob) {
  'use strict';
  // Any image/* MIME type is accepted as safe.
  if (!/^image\/.*/g.test(blob.type)) {
    throw new Error(
        'goog.dom.safe.createImageFromBlob only accepts MIME type image/.*.');
  }
  var objectUrl = goog.global.URL.createObjectURL(blob);
  var image = new goog.global.Image();
  image.onload = function() {
    'use strict';
    goog.global.URL.revokeObjectURL(objectUrl);
  };
  image.src = objectUrl;
  return image;
};

/**
 * Creates a DocumentFragment by parsing html in the context of a Range.
 * @param {!Range} range The Range object starting from the context node to
 * create a fragment in.
 * @param {!goog.html.SafeHtml} html HTML to create a fragment from.
 * @return {?DocumentFragment}
 */
goog.dom.safe.createContextualFragment = function(range, html) {
  'use strict';
  return range.createContextualFragment(
      goog.html.SafeHtml.unwrapTrustedHTML(html));
};

/**
 * Returns CSP script nonce, if set for any <script> tag.
 * @param {?Window=} opt_window The window context used to retrieve the nonce.
 *     Defaults to global context.
 * @return {string} CSP nonce or empty string if no nonce is present.
 */
goog.dom.safe.getScriptNonce = function(opt_window) {
  return goog.dom.safe.getNonce_('script[nonce]', opt_window);
};

/**
 * Returns CSP style nonce, if set for any <style> or <link rel="stylesheet">
 * tag.
 * @param {?Window=} opt_window The window context used to retrieve the nonce.
 *     Defaults to global context.
 * @return {string} CSP nonce or empty string if no nonce is present.
 */
goog.dom.safe.getStyleNonce = function(opt_window) {
  return goog.dom.safe.getNonce_(
      'style[nonce],link[rel="stylesheet"][nonce]', opt_window);
};

/**
 * According to the CSP3 spec a nonce must be a valid base64 string.
 * @see https://www.w3.org/TR/CSP3/#grammardef-base64-value
 * @private @const
 */
goog.dom.safe.NONCE_PATTERN_ = /^[\w+/_-]+[=]{0,2}$/;

/**
 * Returns CSP nonce, if set for any tag of given type.
 * @param {string} selector Selector for locating the element with nonce.
 * @param {?Window=} win The window context used to retrieve the nonce.
 * @return {string} CSP nonce or empty string if no nonce is present.
 * @private
 */
goog.dom.safe.getNonce_ = function(selector, win) {
  const doc = (win || goog.global).document;
  if (!doc.querySelector) {
    return '';
  }
  let el = doc.querySelector(selector);
  if (el) {
    // Try to get the nonce from the IDL property first, because browsers that
    // implement additional nonce protection features (currently only Chrome) to
    // prevent nonce stealing via CSS do not expose the nonce via attributes.
    // See https://github.com/whatwg/html/issues/2369
    const nonce = el['nonce'] || el.getAttribute('nonce');
    if (nonce && goog.dom.safe.NONCE_PATTERN_.test(nonce)) {
      return nonce;
    }
  }
  return '';
};
