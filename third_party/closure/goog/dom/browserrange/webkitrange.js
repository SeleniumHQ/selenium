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
 * @fileoverview Definition of the WebKit specific range wrapper.  Inherits most
 * functionality from W3CRange, but adds exceptions as necessary.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.browserrange.WebKitRange');

goog.require('goog.dom.RangeEndpoint');
goog.require('goog.dom.browserrange.W3cRange');
goog.require('goog.userAgent');


/**
 * The constructor for WebKit specific browser ranges.
 * @param {Range} range The range object.
 * @constructor
 * @extends {goog.dom.browserrange.W3cRange}
 */
goog.dom.browserrange.WebKitRange = function(range) {
  goog.dom.browserrange.W3cRange.call(this, range);
};
goog.inherits(goog.dom.browserrange.WebKitRange,
              goog.dom.browserrange.W3cRange);


/**
 * Creates a range object that selects the given node's text.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.WebKitRange} A WebKit range wrapper object.
 */
goog.dom.browserrange.WebKitRange.createFromNodeContents = function(node) {
  return new goog.dom.browserrange.WebKitRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node));
};


/**
 * Creates a range object that selects between the given nodes.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {goog.dom.browserrange.WebKitRange} A wrapper object.
 */
goog.dom.browserrange.WebKitRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  return new goog.dom.browserrange.WebKitRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode,
          startOffset, endNode, endOffset));
};

/** @inheritDoc */
goog.dom.browserrange.WebKitRange.prototype.compareBrowserRangeEndpoints =
    function(range, thisEndpoint, otherEndpoint) {
  // Webkit pre-528 has some bugs where compareBoundaryPoints() doesn't work the
  // way it is supposed to, but if we reverse the sense of two comparisons,
  // it works fine.
  // https://bugs.webkit.org/show_bug.cgi?id=20738
  if (goog.userAgent.isVersion('528')) {
    return (goog.dom.browserrange.WebKitRange.superClass_.
                compareBrowserRangeEndpoints.call(
                    this, range, thisEndpoint, otherEndpoint));
  }
  return this.range_.compareBoundaryPoints(
      otherEndpoint == goog.dom.RangeEndpoint.START ?
          (thisEndpoint == goog.dom.RangeEndpoint.START ?
              goog.global['Range'].START_TO_START :
              goog.global['Range'].END_TO_START) : // Sense reversed
          (thisEndpoint == goog.dom.RangeEndpoint.START ?
              goog.global['Range'].START_TO_END : // Sense reversed
              goog.global['Range'].END_TO_END),
      /** @type {Range} */ (range));
};

/** @inheritDoc */
goog.dom.browserrange.WebKitRange.prototype.selectInternal = function(
    selection, reversed) {
  // Unselect everything. This addresses a bug in Webkit where it sometimes
  // caches the old selection.
  // https://bugs.webkit.org/show_bug.cgi?id=20117
  selection.removeAllRanges();

  if (reversed) {
    selection.setBaseAndExtent(this.getEndNode(), this.getEndOffset(),
        this.getStartNode(), this.getStartOffset());
  } else {
    selection.setBaseAndExtent(this.getStartNode(), this.getStartOffset(),
        this.getEndNode(), this.getEndOffset());
  }
};
