// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Contains utility methods to extract text content from HTML.
 * @supported IE 10+, Chrome 26+, Firefox 22+, Safari 7.1+, Opera 15+
 */

goog.provide('goog.html.textExtractor');

goog.require('goog.array');
goog.require('goog.dom.TagName');
goog.require('goog.html.sanitizer.HtmlSanitizer');
goog.require('goog.object');
goog.require('goog.userAgent');


/**
 * Safely extracts text from an untrusted HTML string using the HtmlSanitizer.
 * Compared to goog.html.utils.stripHtmlTags, it tries to be smarter about
 * printing newlines between blocks and leave out textual content that would not
 * be displayed to the user (such as SCRIPT and STYLE tags).
 * @param {string} html The untrusted HTML string.
 * @return {string}
 */
// TODO(pelizzi): consider an optional bool parameter to also extract the text
// content of alt attributes and such.
goog.html.textExtractor.extractTextContent = function(html) {
  if (!goog.html.textExtractor.isSupported()) {
    return '';
  }
  // Disable all attributes except style to protect against DOM clobbering.
  var sanitizer = new goog.html.sanitizer.HtmlSanitizer.Builder()
                      .onlyAllowAttributes(['style'])
                      .allowCssStyles()
                      .build();
  // The default policy of the sanitizer strips the content of tags such as
  // SCRIPT and STYLE, whose non-textual content would otherwise end up in the
  // extracted text.
  var sanitizedNodes = sanitizer.sanitizeToDomNode(html);
  // textContent and innerText do not handle spacing between block elements
  // properly. We need to reimplement a similar algorithm ourselves and account
  // for spacing between block elements.
  return goog.html.textExtractor.extractTextContentFromNode_(sanitizedNodes)
      .trim();
};


/**
 * Recursively extract text from the supplied DOM node and its descendants.
 * @param {!Node} node
 * @return {string}
 * @private
 */
goog.html.textExtractor.extractTextContentFromNode_ = function(node) {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      var element = /** @type {!Element} */ (node);
      if (element.tagName == goog.dom.TagName.BR) {
        return '\n';
      }
      var result = goog.array
                       .map(
                           node.childNodes,
                           goog.html.textExtractor.extractTextContentFromNode_)
                       .join('');
      if (goog.html.textExtractor.isBlockElement_(element)) {
        result = '\n' + result + '\n';
      }
      return result;
    case Node.TEXT_NODE:
      return node.nodeValue.replace(/\s+/g, ' ').trim();
    default:
      return '';
  }
};


/**
 * A set of block elements.
 * @private @const {!Object<!goog.dom.TagName, boolean>}
 */
goog.html.textExtractor.BLOCK_ELEMENTS_ = goog.object.createSet(
    goog.dom.TagName.ADDRESS, goog.dom.TagName.BLOCKQUOTE,
    goog.dom.TagName.CENTER, goog.dom.TagName.DIV, goog.dom.TagName.DL,
    goog.dom.TagName.FIELDSET, goog.dom.TagName.FORM, goog.dom.TagName.H1,
    goog.dom.TagName.H2, goog.dom.TagName.H3, goog.dom.TagName.H4,
    goog.dom.TagName.H5, goog.dom.TagName.H6, goog.dom.TagName.HR,
    goog.dom.TagName.OL, goog.dom.TagName.P, goog.dom.TagName.PRE,
    goog.dom.TagName.TABLE, goog.dom.TagName.UL);


/**
 * Returns true whether this is a block element, i.e. the browser would visually
 * separate the text content from the text content of the previous node.
 * @param {!Element} element
 * @return {boolean}
 * @private
 */
goog.html.textExtractor.isBlockElement_ = function(element) {
  return element.style.display == 'block' ||
      goog.html.textExtractor.BLOCK_ELEMENTS_.hasOwnProperty(element.tagName);
};


/**
 * Whether the browser supports the text extractor. The extractor depends on the
 * HTML Sanitizer, which only supports IE starting from version 10.
 * Visible for testing.
 * @return {boolean}
 * @package
 */
goog.html.textExtractor.isSupported = function() {
  return !goog.userAgent.IE || goog.userAgent.isVersionOrHigher(10);
};
