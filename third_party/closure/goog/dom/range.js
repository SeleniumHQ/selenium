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
 * @fileoverview Utilities for working with ranges in HTML documents.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ojan@google.com (Ojan Vafai)
 * @author jparent@google.com (Julie Parent)
 */

goog.provide('goog.dom.Range');

goog.require('goog.dom');
goog.require('goog.dom.AbstractRange');
goog.require('goog.dom.ControlRange');
goog.require('goog.dom.MultiRange');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TextRange');
goog.require('goog.userAgent');


/**
 * Create a new selection from the given browser window's current selection.
 * Note that this object does not auto-update if the user changes their
 * selection and should be used as a snapshot.
 * @param {Window=} opt_win The window to get the selection of.  Defaults to the
 *     window this class was defined in.
 * @return {goog.dom.AbstractRange?} A range wrapper object, or null if there
 *     was an error.
 */
goog.dom.Range.createFromWindow = function(opt_win) {
  var sel = goog.dom.AbstractRange.getBrowserSelectionForWindow(
      opt_win || window);
  return sel && goog.dom.Range.createFromBrowserSelection(sel);
};


/**
 * Create a new range wrapper from the given browser selection object.  Note
 * that this object does not auto-update if the user changes their selection and
 * should be used as a snapshot.
 * @param {!Object} selection The browser selection object.
 * @return {goog.dom.AbstractRange?} A range wrapper object or null if there
 *    was an error.
 */
goog.dom.Range.createFromBrowserSelection = function(selection) {
  var range;
  var isReversed = false;
  if (selection.createRange) {
    /** @preserveTry */
    try {
      range = selection.createRange();
    } catch (e) {
      // Access denied errors can be thrown here in IE if the selection was
      // a flash obj or if there are cross domain issues
      return null;
    }
  } else if (selection.rangeCount) {
    if (selection.rangeCount > 1) {
      return goog.dom.MultiRange.createFromBrowserSelection(
          /** @type {Selection} */ (selection));
    } else {
      range = selection.getRangeAt(0);
      isReversed = goog.dom.Range.isReversed(selection.anchorNode,
          selection.anchorOffset, selection.focusNode, selection.focusOffset);
    }
  } else {
    return null;
  }

  return goog.dom.Range.createFromBrowserRange(range, isReversed);
};


/**
 * Create a new range wrapper from the given browser range object.
 * @param {Range|TextRange} range The browser range object.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {goog.dom.AbstractRange} A range wrapper object.
 */
goog.dom.Range.createFromBrowserRange = function(range, opt_isReversed) {
  // Create an IE control range when appropriate.
  return goog.dom.AbstractRange.isNativeControlRange(range) ?
      goog.dom.ControlRange.createFromBrowserRange(range) :
      goog.dom.TextRange.createFromBrowserRange(range, opt_isReversed);
};


/**
 * Create a new range wrapper that selects the given node's text.
 * @param {Node} node The node to select.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {goog.dom.AbstractRange} A range wrapper object.
 */
goog.dom.Range.createFromNodeContents = function(node, opt_isReversed) {
  return goog.dom.TextRange.createFromNodeContents(node, opt_isReversed);
};


/**
 * Create a new range wrapper that represents a caret at the given node,
 * accounting for the given offset.  This always creates a TextRange, regardless
 * of whether node is an image node or other control range type node.
 * @param {Node} node The node to place a caret at.
 * @param {number} offset The offset within the node to place the caret at.
 * @return {goog.dom.AbstractRange} A range wrapper object.
 */
goog.dom.Range.createCaret = function(node, offset) {
  return goog.dom.TextRange.createFromNodes(node, offset, node, offset);
};


/**
 * Create a new range wrapper that selects the area between the given nodes,
 * accounting for the given offsets.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the node to start.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the node to end.
 * @return {goog.dom.AbstractRange} A range wrapper object.
 */
goog.dom.Range.createFromNodes = function(startNode, startOffset, endNode,
    endOffset) {
  return goog.dom.TextRange.createFromNodes(startNode, startOffset, endNode,
      endOffset);
};


/**
 * Clears the window's selection.
 * @param {Window=} opt_win The window to get the selection of.  Defaults to the
 *     window this class was defined in.
 */
goog.dom.Range.clearSelection = function(opt_win) {
  var sel = goog.dom.AbstractRange.getBrowserSelectionForWindow(
      opt_win || window);
  if (!sel) {
    return;
  }
  if (sel.empty) {
    // We can't just check that the selection is empty, becuase IE
    // sometimes gets confused.
    try {
      sel.empty();
    } catch (e) {
      // Emptying an already empty selection throws an exception in IE
    }
  } else {
    sel.removeAllRanges();
  }
};


/**
 * Tests if the window has a selection.
 * @param {Window=} opt_win The window to check the selection of.  Defaults to
 *     the window this class was defined in.
 * @return {boolean} Whether the window has a selection.
 */
goog.dom.Range.hasSelection = function(opt_win) {
  var sel = goog.dom.AbstractRange.getBrowserSelectionForWindow(
      opt_win || window);
  return !!sel && (goog.userAgent.IE ? sel.type != 'None' : !!sel.rangeCount);
};


/**
 * Returns whether the focus position occurs before the anchor position.
 * @param {Node} anchorNode The node to start with.
 * @param {number} anchorOffset The offset within the node to start.
 * @param {Node} focusNode The node to end with.
 * @param {number} focusOffset The offset within the node to end.
 * @return {boolean} Whether the focus position occurs before the anchor
 *     position.
 */
goog.dom.Range.isReversed = function(anchorNode, anchorOffset, focusNode,
    focusOffset) {
  if (anchorNode == focusNode) {
    return focusOffset < anchorOffset;
  }
  var child;
  if (anchorNode.nodeType == goog.dom.NodeType.ELEMENT && anchorOffset) {
    child = anchorNode.childNodes[anchorOffset];
    if (child) {
      anchorNode = child;
      anchorOffset = 0;
    } else if (goog.dom.contains(anchorNode, focusNode)) {
      // If focus node is contained in anchorNode, it must be before the
      // end of the node.  Hence we are reversed.
      return true;
    }
  }
  if (focusNode.nodeType == goog.dom.NodeType.ELEMENT && focusOffset) {
    child = focusNode.childNodes[focusOffset];
    if (child) {
      focusNode = child;
      focusOffset = 0;
    } else if (goog.dom.contains(focusNode, anchorNode)) {
      // If anchor node is contained in focusNode, it must be before the
      // end of the node.  Hence we are not reversed.
      return false;
    }
  }
  return (goog.dom.compareNodeOrder(anchorNode, focusNode) ||
      anchorOffset - focusOffset) > 0;
};
