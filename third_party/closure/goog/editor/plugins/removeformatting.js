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
// All Rights Reserved.

/**
 * @fileoverview Plugin to handle Remove Formatting.
 *
 */

goog.provide('goog.editor.plugins.RemoveFormatting');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.node');
goog.require('goog.editor.range');
goog.require('goog.string');
goog.require('goog.userAgent');



/**
 * A plugin to handle removing formatting from selected text.
 * @constructor
 * @extends {goog.editor.Plugin}
 * @final
 */
goog.editor.plugins.RemoveFormatting = function() {
  goog.editor.Plugin.call(this);

  /**
   * Optional function to perform remove formatting in place of the
   * provided removeFormattingWorker_.
   * @type {?function(string): string}
   * @private
   */
  this.optRemoveFormattingFunc_ = null;

  /**
   * The key that this plugin triggers on when pressed with the platform
   * modifier key. Can be set by calling {@link #setKeyboardShortcutKey}.
   * @type {string}
   * @private
   */
  this.keyboardShortcutKey_ = ' ';
};
goog.inherits(goog.editor.plugins.RemoveFormatting, goog.editor.Plugin);


/**
 * The editor command this plugin in handling.
 * @type {string}
 */
goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND =
    '+removeFormat';


/**
 * Regular expression that matches a block tag name.
 * @type {RegExp}
 * @private
 */
goog.editor.plugins.RemoveFormatting.BLOCK_RE_ =
    /^(DIV|TR|LI|BLOCKQUOTE|H\d|PRE|XMP)/;


/**
 * Appends a new line to a string buffer.
 * @param {Array<string>} sb The string buffer to add to.
 * @private
 */
goog.editor.plugins.RemoveFormatting.appendNewline_ = function(sb) {
  sb.push('<br>');
};


/**
 * Create a new range delimited by the start point of the first range and
 * the end point of the second range.
 * @param {goog.dom.AbstractRange} startRange Use the start point of this
 *    range as the beginning of the new range.
 * @param {goog.dom.AbstractRange} endRange Use the end point of this
 *    range as the end of the new range.
 * @return {!goog.dom.AbstractRange} The new range.
 * @private
 */
goog.editor.plugins.RemoveFormatting.createRangeDelimitedByRanges_ = function(
    startRange, endRange) {
  return goog.dom.Range.createFromNodes(
      startRange.getStartNode(), startRange.getStartOffset(),
      endRange.getEndNode(), endRange.getEndOffset());
};


/** @override */
goog.editor.plugins.RemoveFormatting.prototype.getTrogClassId = function() {
  return 'RemoveFormatting';
};


/** @override */
goog.editor.plugins.RemoveFormatting.prototype.isSupportedCommand = function(
    command) {
  return command ==
      goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND;
};


/** @override */
goog.editor.plugins.RemoveFormatting.prototype.execCommandInternal = function(
    command, var_args) {
  if (command ==
      goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND) {
    this.removeFormatting_();
  }
};


/** @override */
goog.editor.plugins.RemoveFormatting.prototype.handleKeyboardShortcut =
    function(e, key, isModifierPressed) {
  if (!isModifierPressed) {
    return false;
  }

  // Disregard the shortcut if more than one modifier key is pressed
  // because the user may have intended a different shortcut (for example OSX
  // uses ctrlKey + metaKey + space to open the emoji picker).
  if (e.metaKey && e.ctrlKey) {
    return false;
  }

  // Disregard the shortcut if the shift key is also pressed because the user
  // may have intended a different shortcut (for example Chrome OS uses shiftKey
  // + ctrlKey + space to toggle input languages.
  if (e.shiftKey) {
    return false;
  }

  if (key == this.keyboardShortcutKey_) {
    this.getFieldObject().execCommand(
        goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND);
    return true;
  }

  return false;
};


/**
 * @param {string} key
 */
goog.editor.plugins.RemoveFormatting.prototype.setKeyboardShortcutKey =
    function(key) {
  this.keyboardShortcutKey_ = key;
};


/**
 * Removes formatting from the current selection.  Removes basic formatting
 * (B/I/U) using the browser's execCommand.  Then extracts the html from the
 * selection to convert, calls either a client's specified removeFormattingFunc
 * callback or trogedit's general built-in removeFormattingWorker_,
 * and then replaces the current selection with the converted text.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.removeFormatting_ = function() {
  var range = this.getFieldObject().getRange();
  if (range.isCollapsed()) {
    return;
  }

  // Get the html to format and send it off for formatting. Built in
  // removeFormat only strips some inline elements and some inline CSS styles
  var convFunc = this.optRemoveFormattingFunc_ ||
      goog.bind(this.removeFormattingWorker_, this);
  this.convertSelectedHtmlText_(convFunc);

  // Do the execCommand last as it needs block elements removed to work
  // properly on background/fontColor in FF. There are, unfortunately, still
  // cases where background/fontColor are not removed here.
  var doc = this.getFieldDomHelper().getDocument();
  doc.execCommand('RemoveFormat', false, undefined);

  if (goog.editor.BrowserFeature.ADDS_NBSPS_IN_REMOVE_FORMAT) {
    // WebKit converts spaces to non-breaking spaces when doing a RemoveFormat.
    // See: https://bugs.webkit.org/show_bug.cgi?id=14062
    this.convertSelectedHtmlText_(function(text) {
      // This loses anything that might have legitimately been a non-breaking
      // space, but that's better than the alternative of only having non-
      // breaking spaces.
      // Old versions of WebKit (Safari 3, Chrome 1) incorrectly match /u00A0
      // and newer versions properly match &nbsp;.
      var nbspRegExp =
          goog.userAgent.isVersionOrHigher('528') ? /&nbsp;/g : /\u00A0/g;
      return text.replace(nbspRegExp, ' ');
    });
  }
};


/**
 * Finds the nearest ancestor of the node that is a table.
 * @param {Node} nodeToCheck Node to search from.
 * @return {Node} The table, or null if one was not found.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.getTableAncestor_ = function(
    nodeToCheck) {
  var fieldElement = this.getFieldObject().getElement();
  while (nodeToCheck && nodeToCheck != fieldElement) {
    if (nodeToCheck.tagName == goog.dom.TagName.TABLE) {
      return nodeToCheck;
    }
    nodeToCheck = nodeToCheck.parentNode;
  }
  return null;
};


/**
 * Replaces the contents of the selection with html. Does its best to maintain
 * the original selection. Also does its best to result in a valid DOM.
 *
 * TODO(user): See if there's any way to make this work on Ranges, and then
 * move it into goog.editor.range. The Firefox implementation uses execCommand
 * on the document, so must work on the actual selection.
 *
 * @param {string} html The html string to insert into the range.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.pasteHtml_ = function(html) {
  var range = this.getFieldObject().getRange();

  var dh = this.getFieldDomHelper();
  // Use markers to set the extent of the selection so that we can reselect it
  // afterwards. This works better than builtin range manipulation in FF and IE
  // because their implementations are so self-inconsistent and buggy.
  var startSpanId = goog.string.createUniqueString();
  var endSpanId = goog.string.createUniqueString();
  html = '<span id="' + startSpanId + '"></span>' + html + '<span id="' +
      endSpanId + '"></span>';
  var dummyNodeId = goog.string.createUniqueString();
  var dummySpanText = '<span id="' + dummyNodeId + '"></span>';

  if (goog.editor.BrowserFeature.HAS_IE_RANGES) {
    // IE's selection often doesn't include the outermost tags.
    // We want to use pasteHTML to replace the range contents with the newly
    // unformatted text, so we have to check to make sure we aren't just
    // pasting into some stray tags.  To do this, we first clear out the
    // contents of the range and then delete all empty nodes parenting the now
    // empty range. This way, the pasted contents are never re-embedded into
    // formated nodes. Pasting purely empty html does not work, since IE moves
    // the selection inside the next node, so we insert a dummy span.
    var textRange = range.getTextRange(0).getBrowserRangeObject();
    textRange.pasteHTML(dummySpanText);
    var parent;
    while ((parent = textRange.parentElement()) &&
           goog.editor.node.isEmpty(parent) &&
           !goog.editor.node.isEditableContainer(parent)) {
      var tag = parent.nodeName;
      // We can't remove these table tags as it will invalidate the table dom.
      if (tag == goog.dom.TagName.TD || tag == goog.dom.TagName.TR ||
          tag == goog.dom.TagName.TH) {
        break;
      }

      goog.dom.removeNode(parent);
    }
    textRange.pasteHTML(html);
    var dummySpan = dh.getElement(dummyNodeId);
    // If we entered the while loop above, the node has already been removed
    // since it was a child of parent and parent was removed.
    if (dummySpan) {
      goog.dom.removeNode(dummySpan);
    }
  } else if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    // insertHtml and range.insertNode don't merge blocks correctly.
    // (e.g. if your selection spans two paragraphs)
    dh.getDocument().execCommand('insertImage', false, dummyNodeId);
    var dummyImageNodePattern = new RegExp('<[^<]*' + dummyNodeId + '[^>]*>');
    var parent = this.getFieldObject().getRange().getContainerElement();
    if (parent.nodeType == goog.dom.NodeType.TEXT) {
      // Opera sometimes returns a text node here.
      // TODO(user): perhaps we should modify getParentContainer?
      parent = parent.parentNode;
    }

    // We have to search up the DOM because in some cases, notably when
    // selecting li's within a list, execCommand('insertImage') actually splits
    // tags in such a way that parent that used to contain the selection does
    // not contain inserted image.
    while (!dummyImageNodePattern.test(parent.innerHTML)) {
      parent = parent.parentNode;
    }

    // Like the IE case above, sometimes the selection does not include the
    // outermost tags.  For Gecko, we have already expanded the range so that
    // it does, so we can just replace the dummy image with the final html.
    // For WebKit, we use the same approach as we do with IE  - we
    // inject a dummy span where we will eventually place the contents, and
    // remove parentNodes of the span while they are empty.

    if (goog.userAgent.GECKO) {
      // Escape dollars passed in second argument of String.proto.replace.
      // And since we're using that to replace, we need to escape those as well,
      // hence the 2*2 dollar signs.
      goog.editor.node.replaceInnerHtml(
          parent, parent.innerHTML.replace(
                      dummyImageNodePattern, html.replace(/\$/g, '$$$$')));
    } else {
      goog.editor.node.replaceInnerHtml(
          parent,
          parent.innerHTML.replace(dummyImageNodePattern, dummySpanText));
      var dummySpan = dh.getElement(dummyNodeId);
      parent = dummySpan;
      while ((parent = dummySpan.parentNode) &&
             goog.editor.node.isEmpty(parent) &&
             !goog.editor.node.isEditableContainer(parent)) {
        var tag = parent.nodeName;
        // We can't remove these table tags as it will invalidate the table dom.
        if (tag == goog.dom.TagName.TD || tag == goog.dom.TagName.TR ||
            tag == goog.dom.TagName.TH) {
          break;
        }

        // We can't just remove parent since dummySpan is inside it, and we need
        // to keep dummy span around for the replacement.  So we move the
        // dummySpan up as we go.
        goog.dom.insertSiblingAfter(dummySpan, parent);
        goog.dom.removeNode(parent);
      }
      goog.editor.node.replaceInnerHtml(
          parent,
          // Escape dollars passed in second argument of String.proto.replace
          parent.innerHTML.replace(
              new RegExp(dummySpanText, 'i'), html.replace(/\$/g, '$$$$')));
    }
  }

  var startSpan = dh.getElement(startSpanId);
  var endSpan = dh.getElement(endSpanId);
  goog.dom.Range
      .createFromNodes(startSpan, 0, endSpan, endSpan.childNodes.length)
      .select();
  goog.dom.removeNode(startSpan);
  goog.dom.removeNode(endSpan);
};


/**
 * Gets the html inside the selection to send off for further processing.
 *
 * TODO(user): Make this general so that it can be moved into
 * goog.editor.range.  The main reason it can't be moved is because we need to
 * get the range before we do the execCommand and continue to operate on that
 * same range (reasons are documented above).
 *
 * @param {goog.dom.AbstractRange} range The selection.
 * @return {string} The html string to format.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.getHtmlText_ = function(range) {
  var div = this.getFieldDomHelper().createDom(goog.dom.TagName.DIV);
  var textRange = range.getBrowserRangeObject();

  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    // Get the text to convert.
    div.appendChild(textRange.cloneContents());
  } else if (goog.editor.BrowserFeature.HAS_IE_RANGES) {
    // Trim the whitespace on the ends of the range, so that it the container
    // will be the container of only the text content that we are changing.
    // This gets around issues in IE where the spaces are included in the
    // selection, but ignored sometimes by execCommand, and left orphaned.
    var rngText = range.getText();

    // BRs get reported as \r\n, but only count as one character for moves.
    // Adjust the string so our move counter is correct.
    rngText = rngText.replace(/\r\n/g, '\r');

    var rngTextLength = rngText.length;
    var left = rngTextLength - goog.string.trimLeft(rngText).length;
    var right = rngTextLength - goog.string.trimRight(rngText).length;

    textRange.moveStart('character', left);
    textRange.moveEnd('character', -right);

    var htmlText = textRange.htmlText;
    // Check if in pretag and fix up formatting so that new lines are preserved.
    if (textRange.queryCommandValue('formatBlock') == 'Formatted') {
      htmlText = goog.string.newLineToBr(textRange.htmlText);
    }
    div.innerHTML = htmlText;
  }

  // Get the innerHTML of the node instead of just returning the text above
  // so that its properly html escaped.
  return div.innerHTML;
};


/**
 * Move the range so that it doesn't include any partially selected tables.
 * @param {goog.dom.AbstractRange} range The range to adjust.
 * @param {Node} startInTable Table node that the range starts in.
 * @param {Node} endInTable Table node that the range ends in.
 * @return {!goog.dom.SavedCaretRange} Range to use to restore the
 *     selection after we run our custom remove formatting.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.adjustRangeForTables_ = function(
    range, startInTable, endInTable) {
  // Create placeholders for the current selection so we can restore it
  // later.
  var savedCaretRange = goog.editor.range.saveUsingNormalizedCarets(range);

  var startNode = range.getStartNode();
  var startOffset = range.getStartOffset();
  var endNode = range.getEndNode();
  var endOffset = range.getEndOffset();
  var dh = this.getFieldDomHelper();

  // Move start after the table.
  if (startInTable) {
    var textNode = dh.createTextNode('');
    goog.dom.insertSiblingAfter(textNode, startInTable);
    startNode = textNode;
    startOffset = 0;
  }
  // Move end before the table.
  if (endInTable) {
    var textNode = dh.createTextNode('');
    goog.dom.insertSiblingBefore(textNode, endInTable);
    endNode = textNode;
    endOffset = 0;
  }

  goog.dom.Range.createFromNodes(startNode, startOffset, endNode, endOffset)
      .select();

  return savedCaretRange;
};


/**
 * Remove a caret from the dom and hide it in a safe place, so it can
 * be restored later via restoreCaretsFromCave.
 * @param {goog.dom.SavedCaretRange} caretRange The caret range to
 *     get the carets from.
 * @param {boolean} isStart Whether this is the start or end caret.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.putCaretInCave_ = function(
    caretRange, isStart) {
  var cavedCaret = goog.dom.removeNode(caretRange.getCaret(isStart));
  if (isStart) {
    this.startCaretInCave_ = cavedCaret;
  } else {
    this.endCaretInCave_ = cavedCaret;
  }
};


/**
 * Restore carets that were hidden away by adding them back into the dom.
 * Note: this does not restore to the original dom location, as that
 * will likely have been modified with remove formatting.  The only
 * guarantees here are that start will still be before end, and that
 * they will be in the editable region.  This should only be used when
 * you don't actually intend to USE the caret again.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.restoreCaretsFromCave_ =
    function() {
  // To keep start before end, we put the end caret at the bottom of the field
  // and the start caret at the start of the field.
  var field = this.getFieldObject().getElement();
  if (this.startCaretInCave_) {
    field.insertBefore(this.startCaretInCave_, field.firstChild);
    this.startCaretInCave_ = null;
  }
  if (this.endCaretInCave_) {
    field.appendChild(this.endCaretInCave_);
    this.endCaretInCave_ = null;
  }
};


/**
 * Gets the html inside the current selection, passes it through the given
 * conversion function, and puts it back into the selection.
 *
 * @param {function(string): string} convertFunc A conversion function that
 *    transforms an html string to new html string.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.convertSelectedHtmlText_ =
    function(convertFunc) {
  var range = this.getFieldObject().getRange();

  // For multiple ranges, it is really hard to do our custom remove formatting
  // without invalidating other ranges. So instead of always losing the
  // content, this solution at least lets the browser do its own remove
  // formatting which works correctly most of the time.
  if (range.getTextRangeCount() > 1) {
    return;
  }

  if (goog.userAgent.GECKO || goog.userAgent.EDGE) {
    // Determine if we need to handle tables, since they are special cases.
    // If the selection is entirely within a table, there is no extra
    // formatting removal we can do.  If a table is fully selected, we will
    // just blow it away. If a table is only partially selected, we can
    // perform custom remove formatting only on the non table parts, since we
    // we can't just remove the parts and paste back into it (eg. we can't
    // inject html where a TR used to be).
    // If the selection contains the table and more, this is automatically
    // handled, but if just the table is selected, it can be tricky to figure
    // this case out, because of the numerous ways selections can be formed -
    // ex. if a table has a single tr with a single td with a single text node
    // in it, and the selection is (textNode: 0), (textNode: nextNode.length)
    // then the entire table is selected, even though the start and end aren't
    // the table itself. We are truly inside a table if the expanded endpoints
    // are still inside the table.

    // Expand the selection to include any outermost tags that weren't included
    // in the selection, but have the same visible selection. Stop expanding
    // if we reach the top level field.
    var expandedRange =
        goog.editor.range.expand(range, this.getFieldObject().getElement());

    var startInTable = this.getTableAncestor_(expandedRange.getStartNode());
    var endInTable = this.getTableAncestor_(expandedRange.getEndNode());

    if (startInTable || endInTable) {
      if (startInTable == endInTable) {
        // We are fully contained in the same table, there is no extra
        // remove formatting that we can do, just return and run browser
        // formatting only.
        return;
      }

      // Adjust the range to not contain any partially selected tables, since
      // we don't want to run our custom remove formatting on them.
      var savedCaretRange =
          this.adjustRangeForTables_(range, startInTable, endInTable);

      // Hack alert!!
      // If start is not in a table, then the saved caret will get sent out
      // for uber remove formatting, and it will get blown away.  This is
      // fine, except that we need to be able to re-create a range from the
      // savedCaretRange later on.  So, we just remove it from the dom, and
      // put it back later so we can create a range later (not exactly in the
      // same spot, but don't worry we don't actually try to use it later)
      // and then it will be removed when we dispose the range.
      if (!startInTable) {
        this.putCaretInCave_(savedCaretRange, true);
      }
      if (!endInTable) {
        this.putCaretInCave_(savedCaretRange, false);
      }

      // Re-fetch the range, and re-expand it, since we just modified it.
      range = this.getFieldObject().getRange();
      expandedRange =
          goog.editor.range.expand(range, this.getFieldObject().getElement());
    }

    expandedRange.select();
    range = expandedRange;
  }

  // Convert the selected text to the format-less version, paste back into
  // the selection.
  var text = this.getHtmlText_(range);
  this.pasteHtml_(convertFunc(text));

  if ((goog.userAgent.GECKO || goog.userAgent.EDGE) && savedCaretRange) {
    // If we moved the selection, move it back so the user can't tell we did
    // anything crazy and so the browser removeFormat that we call next
    // will operate on the entire originally selected range.
    range = this.getFieldObject().getRange();
    this.restoreCaretsFromCave_();
    var realSavedCaretRange = savedCaretRange.toAbstractRange();
    var startRange = startInTable ? realSavedCaretRange : range;
    var endRange = endInTable ? realSavedCaretRange : range;
    var restoredRange =
        goog.editor.plugins.RemoveFormatting.createRangeDelimitedByRanges_(
            startRange, endRange);
    restoredRange.select();
    savedCaretRange.dispose();
  }
};


/**
 * Does a best-effort attempt at clobbering all formatting that the
 * browser's execCommand couldn't clobber without being totally inefficient.
 * Attempts to convert visual line breaks to BRs. Leaves anchors that contain an
 * href and images.
 * Adapted from Gmail's MessageUtil's htmlToPlainText. http://go/messageutil.js
 * @param {string} html The original html of the message.
 * @return {string} The unformatted html, which is just text, br's, anchors and
 *     images.
 * @private
 */
goog.editor.plugins.RemoveFormatting.prototype.removeFormattingWorker_ =
    function(html) {
  var el = goog.dom.createElement(goog.dom.TagName.DIV);
  el.innerHTML = html;

  // Put everything into a string buffer to avoid lots of expensive string
  // concatenation along the way.
  var sb = [];
  var stack = [el.childNodes, 0];

  // Keep separate stacks for places where we need to keep track of
  // how deeply embedded we are.  These are analogous to the general stack.
  var preTagStack = [];
  var preTagLevel = 0;  // Length of the prestack.
  var tableStack = [];
  var tableLevel = 0;

  // sp = stack pointer, pointing to the stack array.
  // decrement by 2 since the stack alternates node lists and
  // processed node counts
  for (var sp = 0; sp >= 0; sp -= 2) {
    // Check if we should pop the table level.
    var changedLevel = false;
    while (tableLevel > 0 && sp <= tableStack[tableLevel - 1]) {
      tableLevel--;
      changedLevel = true;
    }
    if (changedLevel) {
      goog.editor.plugins.RemoveFormatting.appendNewline_(sb);
    }


    // Check if we should pop the <pre>/<xmp> level.
    changedLevel = false;
    while (preTagLevel > 0 && sp <= preTagStack[preTagLevel - 1]) {
      preTagLevel--;
      changedLevel = true;
    }
    if (changedLevel) {
      goog.editor.plugins.RemoveFormatting.appendNewline_(sb);
    }

    // The list of of nodes to process at the current stack level.
    var nodeList = stack[sp];
    // The number of nodes processed so far, stored in the stack immediately
    // following the node list for that stack level.
    var numNodesProcessed = stack[sp + 1];

    while (numNodesProcessed < nodeList.length) {
      var node = nodeList[numNodesProcessed++];
      var nodeName = node.nodeName;

      var formatted = this.getValueForNode(node);
      if (goog.isDefAndNotNull(formatted)) {
        sb.push(formatted);
        continue;
      }

      // TODO(user): Handle case 'EMBED' and case 'OBJECT'.
      switch (nodeName) {
        case '#text':
          // Note that IE does not preserve whitespace in the dom
          // values, even in a pre tag, so this is useless for IE.
          var nodeValue = preTagLevel > 0 ?
              node.nodeValue :
              goog.string.stripNewlines(node.nodeValue);
          nodeValue = goog.string.htmlEscape(nodeValue);
          sb.push(nodeValue);
          continue;

        case String(goog.dom.TagName.P):
          goog.editor.plugins.RemoveFormatting.appendNewline_(sb);
          goog.editor.plugins.RemoveFormatting.appendNewline_(sb);
          break;  // break (not continue) so that child nodes are processed.

        case String(goog.dom.TagName.BR):
          goog.editor.plugins.RemoveFormatting.appendNewline_(sb);
          continue;

        case String(goog.dom.TagName.TABLE):
          goog.editor.plugins.RemoveFormatting.appendNewline_(sb);
          tableStack[tableLevel++] = sp;
          break;

        case String(goog.dom.TagName.PRE):
        case 'XMP':
          // This doesn't fully handle xmp, since
          // it doesn't actually ignore tags within the xmp tag.
          preTagStack[preTagLevel++] = sp;
          break;

        case String(goog.dom.TagName.STYLE):
        case String(goog.dom.TagName.SCRIPT):
        case String(goog.dom.TagName.SELECT):
          continue;

        case String(goog.dom.TagName.A):
          if (node.href && node.href != '') {
            sb.push("<a href='");
            sb.push(node.href);
            sb.push("'>");
            sb.push(this.removeFormattingWorker_(node.innerHTML));
            sb.push('</a>');
            continue;  // Children taken care of.
          } else {
            break;  // Take care of the children.
          }

        case String(goog.dom.TagName.IMG):
          sb.push("<img src='");
          sb.push(node.src);
          sb.push("'");
          // border=0 is a common way to not show a blue border around an image
          // that is wrapped by a link. If we remove that, the blue border will
          // show up, which to the user looks like adding format, not removing.
          if (node.border == '0') {
            sb.push(" border='0'");
          }
          sb.push('>');
          continue;

        case String(goog.dom.TagName.TD):
          // Don't add a space for the first TD, we only want spaces to
          // separate td's.
          if (node.previousSibling) {
            sb.push(' ');
          }
          break;

        case String(goog.dom.TagName.TR):
          // Don't add a newline for the first TR.
          if (node.previousSibling) {
            goog.editor.plugins.RemoveFormatting.appendNewline_(sb);
          }
          break;

        case String(goog.dom.TagName.DIV):
          var parent = node.parentNode;
          if (parent.firstChild == node &&
              goog.editor.plugins.RemoveFormatting.BLOCK_RE_.test(
                  parent.tagName)) {
            // If a DIV is the first child of another element that itself is a
            // block element, the DIV does not add a new line.
            break;
          }
        // Otherwise, the DIV does add a new line.  Fall through.

        default:
          if (goog.editor.plugins.RemoveFormatting.BLOCK_RE_.test(nodeName)) {
            goog.editor.plugins.RemoveFormatting.appendNewline_(sb);
          }
      }

      // Recurse down the node.
      var children = node.childNodes;
      if (children.length > 0) {
        // Push the current state on the stack.
        stack[sp++] = nodeList;
        stack[sp++] = numNodesProcessed;

        // Iterate through the children nodes.
        nodeList = children;
        numNodesProcessed = 0;
      }
    }
  }

  // Replace &nbsp; with white space.
  return goog.string.normalizeSpaces(sb.join(''));
};


/**
 * Handle per node special processing if necessary. If this function returns
 * null then standard cleanup is applied. Otherwise this node and all children
 * are assumed to be cleaned.
 * NOTE(user): If an alternate RemoveFormatting processor is provided
 * (setRemoveFormattingFunc()), this will no longer work.
 * @param {Element} node The node to clean.
 * @return {?string} The HTML strig representation of the cleaned data.
 */
goog.editor.plugins.RemoveFormatting.prototype.getValueForNode = function(
    node) {
  return null;
};


/**
 * Sets a function to be used for remove formatting.
 * @param {function(string): string} removeFormattingFunc - A function that
 *     takes  a string of html and returns a string of html that does any other
 *     formatting changes desired.  Use this only if trogedit's behavior doesn't
 *     meet your needs.
 */
goog.editor.plugins.RemoveFormatting.prototype.setRemoveFormattingFunc =
    function(removeFormattingFunc) {
  this.optRemoveFormattingFunc_ = removeFormattingFunc;
};
