// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilities for creating and working with iframes
 * cross-browser.
 * @author gboyer@google.com (Garry Boyer)
 */


goog.provide('goog.dom.iframe');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string.Const');
goog.require('goog.userAgent');


/**
 * Safe source for a blank iframe.
 *
 * Intentionally not about:blank for IE, which gives mixed content warnings in
 * IE6 over HTTPS. Using 'about:blank' for all other browsers to support Content
 * Security Policy (CSP). According to http://www.w3.org/TR/CSP/ CSP does not
 * allow inline javascript by default.
 *
 * @const {!goog.html.TrustedResourceUrl}
 */
goog.dom.iframe.BLANK_SOURCE_URL = goog.userAgent.IE ?
    goog.html.TrustedResourceUrl.fromConstant(
        goog.string.Const.from('javascript:""')) :
    goog.html.TrustedResourceUrl.fromConstant(
        goog.string.Const.from('about:blank'));


/**
 * Legacy version of goog.dom.iframe.BLANK_SOURCE_URL.
 * @const {string}
 */
goog.dom.iframe.BLANK_SOURCE =
    goog.html.TrustedResourceUrl.unwrap(goog.dom.iframe.BLANK_SOURCE_URL);


/**
 * Safe source for a new blank iframe that may not cause a new load of the
 * iframe. This is different from {@code goog.dom.iframe.BLANK_SOURCE} in that
 * it will allow an iframe to be loaded synchronously in more browsers, notably
 * Gecko, following the javascript protocol spec.
 *
 * NOTE: This should not be used to replace the source of an existing iframe.
 * The new src value will be ignored, per the spec.
 *
 * Due to cross-browser differences, the load is not guaranteed  to be
 * synchronous. If code depends on the load of the iframe,
 * then {@code goog.net.IframeLoadMonitor} or a similar technique should be
 * used.
 *
 * According to
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#javascript-protocol
 * the 'javascript:""' URL should trigger a new load of the iframe, which may be
 * asynchronous. A void src, such as 'javascript:undefined', does not change
 * the browsing context document's, and thus should not trigger another load.
 *
 * Intentionally not about:blank, which also triggers a load.
 *
 * NOTE: 'javascript:' URL handling spec compliance varies per browser. IE
 * throws an error with 'javascript:undefined'. Webkit browsers will reload the
 * iframe when setting this source on an existing iframe.
 *
 * @const {!goog.html.TrustedResourceUrl}
 */
goog.dom.iframe.BLANK_SOURCE_NEW_FRAME_URL = goog.userAgent.IE ?
    goog.html.TrustedResourceUrl.fromConstant(
        goog.string.Const.from('javascript:""')) :
    goog.html.TrustedResourceUrl.fromConstant(
        goog.string.Const.from('javascript:undefined'));


/**
 * Legacy version of goog.dom.iframe.BLANK_SOURCE_NEW_FRAME_URL.
 * @const {string}
 */
goog.dom.iframe.BLANK_SOURCE_NEW_FRAME = goog.html.TrustedResourceUrl.unwrap(
    goog.dom.iframe.BLANK_SOURCE_NEW_FRAME_URL);


/**
 * Styles to help ensure an undecorated iframe.
 * @const {string}
 * @private
 */
goog.dom.iframe.STYLES_ = 'border:0;vertical-align:bottom;';


/**
 * Creates a completely blank iframe element.
 *
 * The iframe will not caused mixed-content warnings for IE6 under HTTPS.
 * The iframe will also have no borders or padding, so that the styled width
 * and height will be the actual width and height of the iframe.
 *
 * This function currently only attempts to create a blank iframe.  There
 * are no guarantees to the contents of the iframe or whether it is rendered
 * in quirks mode.
 *
 * @param {goog.dom.DomHelper} domHelper The dom helper to use.
 * @param {!goog.html.SafeStyle=} opt_styles CSS styles for the iframe.
 * @return {!HTMLIFrameElement} A completely blank iframe.
 */
goog.dom.iframe.createBlank = function(domHelper, opt_styles) {
  var styles;
  if (opt_styles) {
    // SafeStyle has to be converted back to a string for now, since there's
    // no safe alternative to createDom().
    styles = goog.html.SafeStyle.unwrap(opt_styles);
  } else {  // undefined.
    styles = '';
  }
  return domHelper.createDom(goog.dom.TagName.IFRAME, {
    'frameborder': 0,
    // Since iframes are inline elements, we must align to bottom to
    // compensate for the line descent.
    'style': goog.dom.iframe.STYLES_ + styles,
    'src': goog.dom.iframe.BLANK_SOURCE
  });
};


/**
 * Writes the contents of a blank iframe that has already been inserted
 * into the document.
 * @param {!HTMLIFrameElement} iframe An iframe with no contents, such as
 *     one created by {@link #createBlank}, but already appended to
 *     a parent document.
 * @param {!goog.html.SafeHtml} content Content to write to the iframe,
 *     from doctype to the HTML close tag.
 */
goog.dom.iframe.writeSafeContent = function(iframe, content) {
  var doc = goog.dom.getFrameContentDocument(iframe);
  doc.open();
  goog.dom.safe.documentWrite(doc, content);
  doc.close();
};


// TODO(gboyer): Provide a higher-level API for the most common use case, so
// that you can just provide a list of stylesheets and some content HTML.
/**
 * Creates a same-domain iframe containing preloaded content.
 *
 * This is primarily useful for DOM sandboxing.  One use case is to embed
 * a trusted Javascript app with potentially conflicting CSS styles.  The
 * second case is to reduce the cost of layout passes by the browser -- for
 * example, you can perform sandbox sizing of characters in an iframe while
 * manipulating a heavy DOM in the main window.  The iframe and parent frame
 * can access each others' properties and functions without restriction.
 *
 * @param {!Element} parentElement The parent element in which to append the
 *     iframe.
 * @param {!goog.html.SafeHtml=} opt_headContents Contents to go into the
 *     iframe's head.
 * @param {!goog.html.SafeHtml=} opt_bodyContents Contents to go into the
 *     iframe's body.
 * @param {!goog.html.SafeStyle=} opt_styles CSS styles for the iframe itself,
 *     before adding to the parent element.
 * @param {boolean=} opt_quirks Whether to use quirks mode (false by default).
 * @return {!HTMLIFrameElement} An iframe that has the specified contents.
 */
goog.dom.iframe.createWithContent = function(
    parentElement, opt_headContents, opt_bodyContents, opt_styles, opt_quirks) {
  var domHelper = goog.dom.getDomHelper(parentElement);

  var content = goog.html.SafeHtml.create(
      'html', {}, goog.html.SafeHtml.concat(
                      goog.html.SafeHtml.create('head', {}, opt_headContents),
                      goog.html.SafeHtml.create('body', {}, opt_bodyContents)));
  if (!opt_quirks) {
    content =
        goog.html.SafeHtml.concat(goog.html.SafeHtml.DOCTYPE_HTML, content);
  }

  var iframe = goog.dom.iframe.createBlank(domHelper, opt_styles);

  // Cannot manipulate iframe content until it is in a document.
  parentElement.appendChild(iframe);
  goog.dom.iframe.writeSafeContent(iframe, content);

  return iframe;
};
