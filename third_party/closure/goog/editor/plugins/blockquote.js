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
 * @fileoverview goog.editor plugin to handle splitting block quotes.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.editor.plugins.Blockquote');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Command');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.node');
goog.require('goog.functions');
goog.require('goog.log');



/**
 * Plugin to handle splitting block quotes.  This plugin does nothing on its
 * own and should be used in conjunction with EnterHandler or one of its
 * subclasses.
 * @param {boolean} requiresClassNameToSplit Whether to split only blockquotes
 *     that have the given classname.
 * @param {string=} opt_className The classname to apply to generated
 *     blockquotes.  Defaults to 'tr_bq'.
 * @constructor
 * @extends {goog.editor.Plugin}
 * @final
 */
goog.editor.plugins.Blockquote = function(
    requiresClassNameToSplit, opt_className) {
  goog.editor.Plugin.call(this);

  /**
   * Whether we only split blockquotes that have {@link classname}, or whether
   * all blockquote tags should be split on enter.
   * @type {boolean}
   * @private
   */
  this.requiresClassNameToSplit_ = requiresClassNameToSplit;

  /**
   * Classname to put on blockquotes that are generated via the toolbar for
   * blockquote, so that we can internally distinguish these from blockquotes
   * that are used for indentation.  This classname can be over-ridden by
   * clients for styling or other purposes.
   * @type {string}
   * @private
   */
  this.className_ = opt_className || goog.getCssName('tr_bq');
};
goog.inherits(goog.editor.plugins.Blockquote, goog.editor.Plugin);


/**
 * Command implemented by this plugin.
 * @type {string}
 */
goog.editor.plugins.Blockquote.SPLIT_COMMAND = '+splitBlockquote';


/**
 * Class ID used to identify this plugin.
 * @type {string}
 */
goog.editor.plugins.Blockquote.CLASS_ID = 'Blockquote';


/**
 * Logging object.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.editor.plugins.Blockquote.prototype.logger =
    goog.log.getLogger('goog.editor.plugins.Blockquote');


/** @override */
goog.editor.plugins.Blockquote.prototype.getTrogClassId = function() {
  return goog.editor.plugins.Blockquote.CLASS_ID;
};


/**
 * Since our exec command is always called from elsewhere, we make it silent.
 * @override
 */
goog.editor.plugins.Blockquote.prototype.isSilentCommand = goog.functions.TRUE;


/**
 * Checks if a node is a blockquote which can be split. A splittable blockquote
 * meets the following criteria:
 * <ol>
 *   <li>Node is a blockquote element</li>
 *   <li>Node has the blockquote classname if the classname is required to
 *       split</li>
 * </ol>
 *
 * @param {Node} node DOM node in question.
 * @return {boolean} Whether the node is a splittable blockquote.
 */
goog.editor.plugins.Blockquote.prototype.isSplittableBlockquote = function(
    node) {
  if (/** @type {!Element} */ (node).tagName != goog.dom.TagName.BLOCKQUOTE) {
    return false;
  }

  if (!this.requiresClassNameToSplit_) {
    return true;
  }

  return goog.dom.classlist.contains(
      /** @type {!Element} */ (node), this.className_);
};


/**
 * Checks if a node is a blockquote element which has been setup.
 * @param {Node} node DOM node to check.
 * @return {boolean} Whether the node is a blockquote with the required class
 *     name applied.
 */
goog.editor.plugins.Blockquote.prototype.isSetupBlockquote = function(node) {
  return /** @type {!Element} */ (node).tagName ==
      goog.dom.TagName.BLOCKQUOTE &&
      goog.dom.classlist.contains(
          /** @type {!Element} */ (node), this.className_);
};


/**
 * Checks if a node is a blockquote element which has not been setup yet.
 * @param {Node} node DOM node to check.
 * @return {boolean} Whether the node is a blockquote without the required
 *     class name applied.
 */
goog.editor.plugins.Blockquote.prototype.isUnsetupBlockquote = function(node) {
  return /** @type {!Element} */ (node).tagName ==
      goog.dom.TagName.BLOCKQUOTE &&
      !this.isSetupBlockquote(node);
};


/**
 * Gets the class name required for setup blockquotes.
 * @return {string} The blockquote class name.
 */
goog.editor.plugins.Blockquote.prototype.getBlockquoteClassName = function() {
  return this.className_;
};


/**
 * Helper routine which walks up the tree to find the topmost
 * ancestor with only a single child. The ancestor node or the original
 * node (if no ancestor was found) is then removed from the DOM.
 *
 * @param {Node} node The node whose ancestors have to be searched.
 * @param {Node} root The root node to stop the search at.
 * @private
 */
goog.editor.plugins.Blockquote.findAndRemoveSingleChildAncestor_ = function(
    node, root) {
  var predicateFunc = function(parentNode) {
    return parentNode != root && parentNode.childNodes.length == 1;
  };
  var ancestor =
      goog.editor.node.findHighestMatchingAncestor(node, predicateFunc);
  if (!ancestor) {
    ancestor = node;
  }
  goog.dom.removeNode(ancestor);
};


/**
 * Remove every nodes from the DOM tree that are all white space nodes.
 * @param {Array<Node>} nodes Nodes to be checked.
 * @private
 */
goog.editor.plugins.Blockquote.removeAllWhiteSpaceNodes_ = function(nodes) {
  for (var i = 0; i < nodes.length; ++i) {
    if (goog.editor.node.isEmpty(nodes[i], true)) {
      goog.dom.removeNode(nodes[i]);
    }
  }
};


/** @override */
goog.editor.plugins.Blockquote.prototype.isSupportedCommand = function(
    command) {
  return command == goog.editor.plugins.Blockquote.SPLIT_COMMAND;
};


/**
 * Splits a quoted region if any.  To be called on a key press event.  When this
 * function returns true, the event that caused it to be called should be
 * canceled.
 * @param {string} command The command to execute.
 * @param {...*} var_args Single additional argument representing the current
 *     cursor position. If BrowserFeature.HAS_W3C_RANGES it is an object with a
 *     {@code node} key and an {@code offset} key. In other cases (legacy IE)
 *     it is a single node.
 * @return {boolean|undefined} Boolean true when the quoted region has been
 *     split, false or undefined otherwise.
 * @override
 */
goog.editor.plugins.Blockquote.prototype.execCommandInternal = function(
    command, var_args) {
  var pos = arguments[1];
  if (command == goog.editor.plugins.Blockquote.SPLIT_COMMAND && pos &&
      (this.className_ || !this.requiresClassNameToSplit_)) {
    return goog.editor.BrowserFeature.HAS_W3C_RANGES ?
        this.splitQuotedBlockW3C_(pos) :
        this.splitQuotedBlockIE_(/** @type {Node} */ (pos));
  }
};


/**
 * Version of splitQuotedBlock_ that uses W3C ranges.
 * @param {Object} anchorPos The current cursor position.
 * @return {boolean} Whether the blockquote was split.
 * @private
 */
goog.editor.plugins.Blockquote.prototype.splitQuotedBlockW3C_ = function(
    anchorPos) {
  var cursorNode = anchorPos.node;
  var quoteNode = goog.editor.node.findTopMostEditableAncestor(
      cursorNode.parentNode, goog.bind(this.isSplittableBlockquote, this));

  var secondHalf, textNodeToRemove;
  var insertTextNode = false;
  // There are two special conditions that we account for here.
  //
  // 1. Whenever the cursor is after (one<BR>|) or just before a BR element
  //    (one|<BR>) and the user presses enter, the second quoted block starts
  //    with a BR which appears to the user as an extra newline. This stems
  //    from the fact that we create two text nodes as our split boundaries
  //    and the BR becomes a part of the second half because of this.
  //
  // 2. When the cursor is at the end of a text node with no siblings and
  //    the user presses enter, the second blockquote might contain a
  //    empty subtree that ends in a 0 length text node. We account for that
  //    as a post-splitting operation.
  if (quoteNode) {
    // selection is in a line that has text in it
    if (cursorNode.nodeType == goog.dom.NodeType.TEXT) {
      if (anchorPos.offset == cursorNode.length) {
        var siblingNode = cursorNode.nextSibling;

        // This accounts for the condition where the cursor appears at the
        // end of a text node and right before the BR eg: one|<BR>. We ensure
        // that we split on the BR in that case.
        if (siblingNode && siblingNode.tagName == goog.dom.TagName.BR) {
          cursorNode = siblingNode;
          // This might be null but splitDomTreeAt accounts for the null case.
          secondHalf = siblingNode.nextSibling;
        } else {
          textNodeToRemove = cursorNode.splitText(anchorPos.offset);
          secondHalf = textNodeToRemove;
        }
      } else {
        secondHalf = cursorNode.splitText(anchorPos.offset);
      }
    } else if (cursorNode.tagName == goog.dom.TagName.BR) {
      // This might be null but splitDomTreeAt accounts for the null case.
      secondHalf = cursorNode.nextSibling;
    } else {
      // The selection is in a line that is empty, with more than 1 level
      // of quote.
      insertTextNode = true;
    }
  } else {
    // Check if current node is a quote node.
    // This will happen if user clicks in an empty line in the quote,
    // when there is 1 level of quote.
    if (this.isSetupBlockquote(cursorNode)) {
      quoteNode = cursorNode;
      insertTextNode = true;
    }
  }

  if (insertTextNode) {
    // Create two empty text nodes to split between.
    cursorNode = this.insertEmptyTextNodeBeforeRange_();
    secondHalf = this.insertEmptyTextNodeBeforeRange_();
  }

  if (!quoteNode) {
    return false;
  }

  secondHalf =
      goog.editor.node.splitDomTreeAt(cursorNode, secondHalf, quoteNode);
  goog.dom.insertSiblingAfter(secondHalf, quoteNode);

  // Set the insertion point.
  var dh = this.getFieldDomHelper();
  var tagToInsert = this.getFieldObject().queryCommandValue(
                        goog.editor.Command.DEFAULT_TAG) ||
      goog.dom.TagName.DIV;
  var container = dh.createElement(/** @type {string} */ (tagToInsert));
  container.innerHTML = '&nbsp;';  // Prevent the div from collapsing.
  quoteNode.parentNode.insertBefore(container, secondHalf);
  dh.getWindow().getSelection().collapse(container, 0);

  // We need to account for the condition where the second blockquote
  // might contain an empty DOM tree. This arises from trying to split
  // at the end of an empty text node. We resolve this by walking up the tree
  // till we either reach the blockquote or till we hit a node with more
  // than one child. The resulting node is then removed from the DOM.
  if (textNodeToRemove) {
    goog.editor.plugins.Blockquote.findAndRemoveSingleChildAncestor_(
        textNodeToRemove, secondHalf);
  }

  goog.editor.plugins.Blockquote.removeAllWhiteSpaceNodes_(
      [quoteNode, secondHalf]);
  return true;
};


/**
 * Inserts an empty text node before the field's range.
 * @return {!Node} The empty text node.
 * @private
 */
goog.editor.plugins.Blockquote.prototype.insertEmptyTextNodeBeforeRange_ =
    function() {
  var range = this.getFieldObject().getRange();
  var node = this.getFieldDomHelper().createTextNode('');
  range.insertNode(node, true);
  return node;
};


/**
 * IE version of splitQuotedBlock_.
 * @param {Node} splitNode The current cursor position.
 * @return {boolean} Whether the blockquote was split.
 * @private
 */
goog.editor.plugins.Blockquote.prototype.splitQuotedBlockIE_ = function(
    splitNode) {
  var dh = this.getFieldDomHelper();
  var quoteNode = goog.editor.node.findTopMostEditableAncestor(
      splitNode.parentNode, goog.bind(this.isSplittableBlockquote, this));

  if (!quoteNode) {
    return false;
  }

  var clone = splitNode.cloneNode(false);

  // Whenever the cursor is just before a BR element (one|<BR>) and the user
  // presses enter, the second quoted block starts with a BR which appears
  // to the user as an extra newline. This stems from the fact that the
  // dummy span that we create (splitNode) occurs before the BR and we split
  // on that.
  if (splitNode.nextSibling &&
      /** @type {!Element} */ (splitNode.nextSibling).tagName ==
          goog.dom.TagName.BR) {
    splitNode = splitNode.nextSibling;
  }
  var secondHalf = goog.editor.node.splitDomTreeAt(splitNode, clone, quoteNode);
  goog.dom.insertSiblingAfter(secondHalf, quoteNode);

  // Set insertion point.
  var tagToInsert = this.getFieldObject().queryCommandValue(
                        goog.editor.Command.DEFAULT_TAG) ||
      goog.dom.TagName.DIV;
  var div = dh.createElement(/** @type {string} */ (tagToInsert));
  quoteNode.parentNode.insertBefore(div, secondHalf);

  // The div needs non-whitespace contents in order for the insertion point
  // to get correctly inserted.
  div.innerHTML = '&nbsp;';

  // Moving the range 1 char isn't enough when you have markup.
  // This moves the range to the end of the nbsp.
  var range = dh.getDocument().selection.createRange();
  range.moveToElementText(splitNode);
  range.move('character', 2);
  range.select();

  // Remove the no-longer-necessary nbsp.
  goog.dom.removeChildren(div);

  // Clear the original selection.
  range.pasteHTML('');

  // We need to remove clone from the DOM but just removing clone alone will
  // not suffice. Let's assume we have the following DOM structure and the
  // cursor is placed after the first numbered list item "one".
  //
  // <blockquote class="gmail-quote">
  //   <div><div>a</div><ol><li>one|</li></ol></div>
  //   <div>b</div>
  // </blockquote>
  //
  // After pressing enter, we have the following structure.
  //
  // <blockquote class="gmail-quote">
  //   <div><div>a</div><ol><li>one|</li></ol></div>
  // </blockquote>
  // <div>&nbsp;</div>
  // <blockquote class="gmail-quote">
  //   <div><ol><li><span id=""></span></li></ol></div>
  //   <div>b</div>
  // </blockquote>
  //
  // The clone is contained in a subtree which should be removed. This stems
  // from the fact that we invoke splitDomTreeAt with the dummy span
  // as the starting splitting point and this results in the empty subtree
  // <div><ol><li><span id=""></span></li></ol></div>.
  //
  // We resolve this by walking up the tree till we either reach the
  // blockquote or till we hit a node with more than one child. The resulting
  // node is then removed from the DOM.
  goog.editor.plugins.Blockquote.findAndRemoveSingleChildAncestor_(
      clone, secondHalf);

  goog.editor.plugins.Blockquote.removeAllWhiteSpaceNodes_(
      [quoteNode, secondHalf]);
  return true;
};
