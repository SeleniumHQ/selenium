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
 * @fileoverview Definition of the browser range interface.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.browserrange.AbstractRange');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.RangeEndpoint');
goog.require('goog.dom.TagName');
goog.require('goog.dom.TextRangeIterator');
goog.require('goog.iter');
goog.require('goog.math.Coordinate');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.userAgent');



/**
 * The constructor for abstract ranges.  Don't call this from subclasses.
 * @constructor
 */
goog.dom.browserrange.AbstractRange = function() {
};


/**
 * @return {goog.dom.browserrange.AbstractRange} A clone of this range.
 */
goog.dom.browserrange.AbstractRange.prototype.clone = goog.abstractMethod;


/**
 * Returns the browser native implementation of the range.  Please refrain from
 * using this function - if you find you need the range please add wrappers for
 * the functionality you need rather than just using the native range.
 * @return {Range|TextRange} The browser native range object.
 */
goog.dom.browserrange.AbstractRange.prototype.getBrowserRange =
    goog.abstractMethod;


/**
 * Returns the deepest node in the tree that contains the entire range.
 * @return {Node} The deepest node that contains the entire range.
 */
goog.dom.browserrange.AbstractRange.prototype.getContainer =
    goog.abstractMethod;


/**
 * Returns the node the range starts in.
 * @return {Node} The element or text node the range starts in.
 */
goog.dom.browserrange.AbstractRange.prototype.getStartNode =
    goog.abstractMethod;


/**
 * Returns the offset into the node the range starts in.
 * @return {number} The offset into the node the range starts in.  For text
 *     nodes, this is an offset into the node value.  For elements, this is
 *     an offset into the childNodes array.
 */
goog.dom.browserrange.AbstractRange.prototype.getStartOffset =
    goog.abstractMethod;


/**
 * @return {goog.math.Coordinate} The coordinate of the selection start node
 *     and offset.
 */
goog.dom.browserrange.AbstractRange.prototype.getStartPosition = function() {
  return this.getPosition_(true);
};


/**
 * Returns the node the range ends in.
 * @return {Node} The element or text node the range ends in.
 */
goog.dom.browserrange.AbstractRange.prototype.getEndNode =
    goog.abstractMethod;


/**
 * Returns the offset into the node the range ends in.
 * @return {number} The offset into the node the range ends in.  For text
 *     nodes, this is an offset into the node value.  For elements, this is
 *     an offset into the childNodes array.
 */
goog.dom.browserrange.AbstractRange.prototype.getEndOffset =
    goog.abstractMethod;


/**
 * @return {goog.math.Coordinate} The coordinate of the selection end node
 *     and offset.
 */
goog.dom.browserrange.AbstractRange.prototype.getEndPosition = function() {
  return this.getPosition_(false);
};


/**
 * @param {boolean} start Whether to get the position of the start or end.
 * @return {goog.math.Coordinate} The coordinate of the selection point.
 * @private
 */
goog.dom.browserrange.AbstractRange.prototype.getPosition_ = function(start) {
  goog.asserts.assert(this.range_.getClientRects,
      'Getting selection coordinates is not supported.');

  var rects = this.range_.getClientRects();
  if (rects.length) {
    var r = start ? rects[0] : goog.array.peek(rects);
    return new goog.math.Coordinate(
        start ? r.left : r.right,
        start ? r.top : r.bottom);
  }
  return null;
};


/**
 * Compares one endpoint of this range with the endpoint of another browser
 * native range object.
 * @param {Range|TextRange} range The browser native range to compare against.
 * @param {goog.dom.RangeEndpoint} thisEndpoint The endpoint of this range
 *     to compare with.
 * @param {goog.dom.RangeEndpoint} otherEndpoint The endpoint of the other
 *     range to compare with.
 * @return {number} 0 if the endpoints are equal, negative if this range
 *     endpoint comes before the other range endpoint, and positive otherwise.
 */
goog.dom.browserrange.AbstractRange.prototype.compareBrowserRangeEndpoints =
    goog.abstractMethod;


/**
 * Tests if this range contains the given range.
 * @param {goog.dom.browserrange.AbstractRange} abstractRange The range to test.
 * @param {boolean=} opt_allowPartial If not set or false, the range must be
 *     entirely contained in the selection for this function to return true.
 * @return {boolean} Whether this range contains the given range.
 */
goog.dom.browserrange.AbstractRange.prototype.containsRange =
    function(abstractRange, opt_allowPartial) {
  // IE sometimes misreports the boundaries for collapsed ranges. So if the
  // other range is collapsed, make sure the whole range is contained. This is
  // logically equivalent, and works around IE's bug.
  var checkPartial = opt_allowPartial && !abstractRange.isCollapsed();

  var range = abstractRange.getBrowserRange();
  var start = goog.dom.RangeEndpoint.START, end = goog.dom.RangeEndpoint.END;
  /** @preserveTry */
  try {
    if (checkPartial) {
      // There are two ways to not overlap.  Being before, and being after.
      // Before is represented by this.end before range.start: comparison < 0.
      // After is represented by this.start after range.end: comparison > 0.
      // The below is the negation of not overlapping.
      return this.compareBrowserRangeEndpoints(range, end, start) >= 0 &&
             this.compareBrowserRangeEndpoints(range, start, end) <= 0;

    } else {
      // Return true if this range bounds the parameter range from both sides.
      return this.compareBrowserRangeEndpoints(range, end, end) >= 0 &&
          this.compareBrowserRangeEndpoints(range, start, start) <= 0;
    }
  } catch (e) {
    if (!goog.userAgent.IE) {
      throw e;
    }
    // IE sometimes throws exceptions when one range is invalid, i.e. points
    // to a node that has been removed from the document.  Return false in this
    // case.
    return false;
  }
};


/**
 * Tests if this range contains the given node.
 * @param {Node} node The node to test.
 * @param {boolean=} opt_allowPartial If not set or false, the node must be
 *     entirely contained in the selection for this function to return true.
 * @return {boolean} Whether this range contains the given node.
 */
goog.dom.browserrange.AbstractRange.prototype.containsNode = function(node,
    opt_allowPartial) {
  return this.containsRange(
      goog.dom.browserrange.createRangeFromNodeContents(node),
      opt_allowPartial);
};


/**
 * Tests if the selection is collapsed - i.e. is just a caret.
 * @return {boolean} Whether the range is collapsed.
 */
goog.dom.browserrange.AbstractRange.prototype.isCollapsed =
    goog.abstractMethod;


/**
 * @return {string} The text content of the range.
 */
goog.dom.browserrange.AbstractRange.prototype.getText =
    goog.abstractMethod;


/**
 * Returns the HTML fragment this range selects.  This is slow on all browsers.
 * @return {string} HTML fragment of the range, does not include context
 *     containing elements.
 */
goog.dom.browserrange.AbstractRange.prototype.getHtmlFragment = function() {
  var output = new goog.string.StringBuffer();
  goog.iter.forEach(this, function(node, ignore, it) {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      output.append(goog.string.htmlEscape(node.nodeValue.substring(
          it.getStartTextOffset(), it.getEndTextOffset())));
    } else if (node.nodeType == goog.dom.NodeType.ELEMENT) {
      if (it.isEndTag()) {
        if (goog.dom.canHaveChildren(node)) {
          output.append('</' + node.tagName + '>');
        }
      } else {
        var shallow = node.cloneNode(false);
        var html = goog.dom.getOuterHtml(shallow);
        if (goog.userAgent.IE && node.tagName == goog.dom.TagName.LI) {
          // For an LI, IE just returns "<li>" with no closing tag
          output.append(html);
        } else {
          var index = html.lastIndexOf('<');
          output.append(index ? html.substr(0, index) : html);
        }
      }
    }
  }, this);

  return output.toString();
};


/**
 * Returns valid HTML for this range.  This is fast on IE, and semi-fast on
 * other browsers.
 * @return {string} Valid HTML of the range, including context containing
 *     elements.
 */
goog.dom.browserrange.AbstractRange.prototype.getValidHtml =
    goog.abstractMethod;


/**
 * Returns a RangeIterator over the contents of the range.  Regardless of the
 * direction of the range, the iterator will move in document order.
 * @param {boolean=} opt_keys Unused for this iterator.
 * @return {!goog.dom.RangeIterator} An iterator over tags in the range.
 */
goog.dom.browserrange.AbstractRange.prototype.__iterator__ = function(
    opt_keys) {
  return new goog.dom.TextRangeIterator(this.getStartNode(),
      this.getStartOffset(), this.getEndNode(), this.getEndOffset());
};


// SELECTION MODIFICATION


/**
 * Set this range as the selection in its window.
 * @param {boolean=} opt_reverse Whether to select the range in reverse,
 *     if possible.
 */
goog.dom.browserrange.AbstractRange.prototype.select =
    goog.abstractMethod;


/**
 * Removes the contents of the range from the document.  As a side effect, the
 * selection will be collapsed.  The behavior of content removal is normalized
 * across browsers.  For instance, IE sometimes creates extra text nodes that
 * a W3C browser does not.  That behavior is corrected for.
 */
goog.dom.browserrange.AbstractRange.prototype.removeContents =
    goog.abstractMethod;


/**
 * Surrounds the text range with the specified element (on Mozilla) or with a
 * clone of the specified element (on IE).  Returns a reference to the
 * surrounding element if the operation was successful; returns null if the
 * operation failed.
 * @param {Element} element The element with which the selection is to be
 *    surrounded.
 * @return {Element} The surrounding element (same as the argument on Mozilla,
 *    but not on IE), or null if unsuccessful.
 */
goog.dom.browserrange.AbstractRange.prototype.surroundContents =
    goog.abstractMethod;


/**
 * Inserts a node before (or after) the range.  The range may be disrupted
 * beyond recovery because of the way this splits nodes.
 * @param {Node} node The node to insert.
 * @param {boolean} before True to insert before, false to insert after.
 * @return {Node} The node added to the document.  This may be different
 *     than the node parameter because on IE we have to clone it.
 */
goog.dom.browserrange.AbstractRange.prototype.insertNode =
    goog.abstractMethod;


/**
 * Surrounds this range with the two given nodes.  The range may be disrupted
 * beyond recovery because of the way this splits nodes.
 * @param {Element} startNode The node to insert at the start.
 * @param {Element} endNode The node to insert at the end.
 */
goog.dom.browserrange.AbstractRange.prototype.surroundWithNodes =
    goog.abstractMethod;


/**
 * Collapses the range to one of its boundary points.
 * @param {boolean} toStart Whether to collapse to the start of the range.
 */
goog.dom.browserrange.AbstractRange.prototype.collapse =
    goog.abstractMethod;
