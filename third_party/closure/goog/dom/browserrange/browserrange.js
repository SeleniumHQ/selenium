// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the browser range namespace and interface, as
 * well as several useful utility functions.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
*
*
 *
 * @supported IE6, IE7, FF1.5+, Safari.
 */


goog.provide('goog.dom.browserrange');
goog.provide('goog.dom.browserrange.Error');

goog.require('goog.dom');
goog.require('goog.dom.browserrange.GeckoRange');
goog.require('goog.dom.browserrange.IeRange');
goog.require('goog.dom.browserrange.OperaRange');
goog.require('goog.dom.browserrange.W3cRange');
goog.require('goog.dom.browserrange.WebKitRange');
goog.require('goog.userAgent');


/**
 * Common error constants.
 * @enum {string}
 */
goog.dom.browserrange.Error = {
  NOT_IMPLEMENTED: 'Not Implemented'
};


// NOTE(robbyw): While it would be nice to eliminate the duplicate switches
//               below, doing so uncovers bugs in the JsCompiler in which
//               necessary code is stripped out.


/**
 * Static method that returns the proper type of browser range.
 * @param {Range|TextRange} range A browser range object.
 * @return {goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.createRange = function(range) {
  if (goog.userAgent.IE) {
    return new goog.dom.browserrange.IeRange(
        /** @type {TextRange} */ (range),
        goog.dom.getOwnerDocument(range.parentElement()));
  } else if (goog.userAgent.WEBKIT) {
    return new goog.dom.browserrange.WebKitRange(
        /** @type {Range} */ (range));
  } else if (goog.userAgent.GECKO) {
    return new goog.dom.browserrange.GeckoRange(
        /** @type {Range} */ (range));
  } else if (goog.userAgent.OPERA) {
    return new goog.dom.browserrange.OperaRange(
        /** @type {Range} */ (range));
  } else {
    // Default other browsers, including Opera, to W3c ranges.
    return new goog.dom.browserrange.W3cRange(
        /** @type {Range} */ (range));
  }
};


/**
 * Static method that returns the proper type of browser range.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.createRangeFromNodeContents = function(node) {
  if (goog.userAgent.IE) {
    return goog.dom.browserrange.IeRange.createFromNodeContents(node);
  } else if (goog.userAgent.WEBKIT) {
    return goog.dom.browserrange.WebKitRange.createFromNodeContents(node);
  } else if (goog.userAgent.GECKO) {
    return goog.dom.browserrange.GeckoRange.createFromNodeContents(node);
  } else if (goog.userAgent.OPERA) {
    return goog.dom.browserrange.OperaRange.createFromNodeContents(node);
  } else {
    // Default other browsers to W3c ranges.
    return goog.dom.browserrange.W3cRange.createFromNodeContents(node);
  }
};


/**
 * Static method that returns the proper type of browser range.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the node to start.  This is
 *     either the index into the childNodes array for element startNodes or
 *     the index into the character array for text startNodes.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the node to end.  This is
 *     either the index into the childNodes array for element endNodes or
 *     the index into the character array for text endNodes.
 * @return {goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.createRangeFromNodes = function(startNode, startOffset,
    endNode, endOffset) {
  if (goog.userAgent.IE) {
    return goog.dom.browserrange.IeRange.createFromNodes(startNode, startOffset,
        endNode, endOffset);
  } else if (goog.userAgent.WEBKIT) {
    return goog.dom.browserrange.WebKitRange.createFromNodes(startNode,
        startOffset, endNode, endOffset);
  } else if (goog.userAgent.GECKO) {
    return goog.dom.browserrange.GeckoRange.createFromNodes(startNode,
        startOffset, endNode, endOffset);
  } else if (goog.userAgent.OPERA) {
    return goog.dom.browserrange.OperaRange.createFromNodes(startNode,
        startOffset, endNode, endOffset);
  } else {
    // Default other browsers to W3c ranges.
    return goog.dom.browserrange.W3cRange.createFromNodes(startNode,
        startOffset, endNode, endOffset);
  }
};
