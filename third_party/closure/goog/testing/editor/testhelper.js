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
 * @fileoverview Class that allows for simple text editing tests.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.setTestOnly('goog.testing.editor.TestHelper');
goog.provide('goog.testing.editor.TestHelper');

goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.node');
goog.require('goog.editor.plugins.AbstractBubblePlugin');
goog.require('goog.testing.dom');



/**
 * Create a new test controller.
 * @param {Element} root The root editable element.
 * @constructor
 * @extends {goog.Disposable}
 * @final
 */
goog.testing.editor.TestHelper = function(root) {
  if (!root) {
    throw Error('Null root');
  }
  goog.Disposable.call(this);

  /**
   * Convenience variable for root DOM element.
   * @type {!Element}
   * @private
   */
  this.root_ = root;

  /**
   * The starting HTML of the editable element.
   * @type {string}
   * @private
   */
  this.savedHtml_ = '';
};
goog.inherits(goog.testing.editor.TestHelper, goog.Disposable);


/**
 * Selects a new root element.
 * @param {Element} root The root editable element.
 */
goog.testing.editor.TestHelper.prototype.setRoot = function(root) {
  if (!root) {
    throw Error('Null root');
  }
  this.root_ = root;
};


/**
 * Make the root element editable.  Also saves its HTML to be restored
 * in tearDown.
 */
goog.testing.editor.TestHelper.prototype.setUpEditableElement = function() {
  this.savedHtml_ = this.root_.innerHTML;
  if (goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) {
    this.root_.contentEditable = true;
  } else {
    this.root_.ownerDocument.designMode = 'on';
  }
  this.root_.setAttribute('g_editable', 'true');
};


/**
 * Reset the element previously initialized, restoring its HTML and making it
 * non editable.
 * @suppress {accessControls} Private state of
 *     {@link goog.editor.plugins.AbstractBubblePlugin} is accessed for test
 *     purposes.
 */
goog.testing.editor.TestHelper.prototype.tearDownEditableElement = function() {
  if (goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) {
    this.root_.contentEditable = false;
  } else {
    this.root_.ownerDocument.designMode = 'off';
  }
  goog.dom.removeChildren(this.root_);
  this.root_.innerHTML = this.savedHtml_;
  this.root_.removeAttribute('g_editable');

  if (goog.editor.plugins && goog.editor.plugins.AbstractBubblePlugin) {
    // Remove old bubbles.
    for (var key in goog.editor.plugins.AbstractBubblePlugin.bubbleMap_) {
      goog.editor.plugins.AbstractBubblePlugin.bubbleMap_[key].dispose();
    }
    // Ensure we get a new bubble for each test.
    goog.editor.plugins.AbstractBubblePlugin.bubbleMap_ = {};
  }
};


/**
 * Assert that the html in 'root' is substantially similar to htmlPattern.
 * This method tests for the same set of styles, and for the same order of
 * nodes.  Breaking whitespace nodes are ignored.  Elements can be annotated
 * with classnames corresponding to keys in goog.userAgent and will be
 * expected to show up in that user agent and expected not to show up in
 * others.
 * @param {string} htmlPattern The pattern to match.
 */
goog.testing.editor.TestHelper.prototype.assertHtmlMatches = function(
    htmlPattern) {
  goog.testing.dom.assertHtmlContentsMatch(htmlPattern, this.root_);
};


/**
 * Finds the first text node descendant of root with the given content.
 * @param {string|RegExp} textOrRegexp The text to find, or a regular
 *     expression to find a match of.
 * @return {Node} The first text node that matches, or null if none is found.
 */
goog.testing.editor.TestHelper.prototype.findTextNode = function(textOrRegexp) {
  return goog.testing.dom.findTextNode(textOrRegexp, this.root_);
};


/**
 * Select from the given {@code fromOffset} in the given {@code from} node to
 * the given {@code toOffset} in the optionally given {@code to} node. If nodes
 * are passed in, uses them, otherwise uses findTextNode to find the nodes to
 * select. Selects a caret if opt_to and opt_toOffset are not given.
 * @param {Node|string} from Node or text of the node to start the selection at.
 * @param {number} fromOffset Offset within the above node to start the
 *     selection at.
 * @param {Node|string=} opt_to Node or text of the node to end the selection
 *     at.
 * @param {number=} opt_toOffset Offset within the above node to end the
 *     selection at.
 * @return {!goog.dom.AbstractRange}
 */
goog.testing.editor.TestHelper.prototype.select = function(
    from, fromOffset, opt_to, opt_toOffset) {
  var end;
  var start = end = goog.isString(from) ? this.findTextNode(from) : from;
  var endOffset;
  var startOffset = endOffset = fromOffset;

  if (opt_to && goog.isNumber(opt_toOffset)) {
    end = goog.isString(opt_to) ? this.findTextNode(opt_to) : opt_to;
    endOffset = opt_toOffset;
  }

  var range =
      goog.dom.Range.createFromNodes(start, startOffset, end, endOffset);
  range.select();
  return range;
};


/** @override */
goog.testing.editor.TestHelper.prototype.disposeInternal = function() {
  if (goog.editor.node.isEditableContainer(this.root_)) {
    this.tearDownEditableElement();
  }
  delete this.root_;
  goog.testing.editor.TestHelper.base(this, 'disposeInternal');
};
