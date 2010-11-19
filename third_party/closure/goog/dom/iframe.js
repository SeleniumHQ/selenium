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
 */


goog.provide('goog.dom.iframe');

goog.require('goog.dom');


/**
 * Safe source for a blank iframe.
 *
 * Intentionally not about:blank, which gives mixed content warnings in IE6
 * over HTTPS.
 *
 * @type {string}
 */
goog.dom.iframe.BLANK_SOURCE = 'javascript:""';


/**
 * Styles to help ensure an undecorated iframe.
 * @type {string}
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
 * @param {string=} opt_styles CSS styles for the iframe.
 * @return {!HTMLIFrameElement} A completely blank iframe.
 */
goog.dom.iframe.createBlank = function(domHelper, opt_styles) {
  return /** @type {!HTMLIFrameElement} */ (domHelper.createDom('iframe', {
    'frameborder': 0,
    // Since iframes are inline elements, we must align to bottom to
    // compensate for the line descent.
    'style': goog.dom.iframe.STYLES_ + (opt_styles || ''),
    'src': goog.dom.iframe.BLANK_SOURCE
  }));
};


/**
 * Writes the contents of a blank iframe that has already been inserted
 * into the document.
 * @param {!HTMLIFrameElement} iframe An iframe with no contents, such as
 *     one created by goog.dom.iframe.createBlank, but already appended to
 *     a parent document.
 * @param {string} content Content to write to the iframe, from doctype to
 *     the HTML close tag.
 */
goog.dom.iframe.writeContent = function(iframe, content) {
  var doc = goog.dom.getFrameContentDocument(iframe);
  doc.open();
  doc.write(content);
  doc.close();
};


// TODO(user): Provide a higher-level API for the most common use case, so
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
 * @param {string=} opt_headContents Contents to go into the iframe's head.
 * @param {string=} opt_bodyContents Contents to go into the iframe's body.
 * @param {string=} opt_styles CSS styles for the iframe itself, before adding
 *     to the parent element.
 * @param {boolean=} opt_quirks Whether to use quirks mode (false by default).
 * @return {HTMLIFrameElement} An iframe that has the specified contents.
 */
goog.dom.iframe.createWithContent = function(
    parentElement, opt_headContents, opt_bodyContents, opt_styles, opt_quirks) {
  var domHelper = goog.dom.getDomHelper(parentElement);
  // Generate the HTML content.
  var contentBuf = [];

  if (!opt_quirks) {
    contentBuf.push('<!DOCTYPE html>');
  }
  contentBuf.push('<html><head>', opt_headContents, '</head><body>',
      opt_bodyContents, '</body></html>');

  var iframe = goog.dom.iframe.createBlank(domHelper, opt_styles);

  // Cannot manipulate iframe content until it is in a document.
  parentElement.appendChild(iframe);
  goog.dom.iframe.writeContent(iframe, contentBuf.join(''));

  return iframe;
};
