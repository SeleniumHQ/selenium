// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Functions to style text.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.editor.plugins.BasicTextFormatter');
goog.provide('goog.editor.plugins.BasicTextFormatter.COMMAND');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Command');
goog.require('goog.editor.Link');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.node');
goog.require('goog.editor.range');
goog.require('goog.editor.style');
goog.require('goog.iter');
goog.require('goog.iter.StopIteration');
goog.require('goog.log');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.string.Unicode');
goog.require('goog.style');
goog.require('goog.ui.editor.messages');
goog.require('goog.userAgent');



/**
 * Functions to style text (e.g. underline, make bold, etc.)
 * @constructor
 * @extends {goog.editor.Plugin}
 */
goog.editor.plugins.BasicTextFormatter = function() {
  goog.editor.Plugin.call(this);
};
goog.inherits(goog.editor.plugins.BasicTextFormatter, goog.editor.Plugin);


/** @override */
goog.editor.plugins.BasicTextFormatter.prototype.getTrogClassId = function() {
  return 'BTF';
};


/**
 * Logging object.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.editor.plugins.BasicTextFormatter.prototype.logger =
    goog.log.getLogger('goog.editor.plugins.BasicTextFormatter');


/**
 * Commands implemented by this plugin.
 * @enum {string}
 */
goog.editor.plugins.BasicTextFormatter.COMMAND = {
  LINK: '+link',
  FORMAT_BLOCK: '+formatBlock',
  INDENT: '+indent',
  OUTDENT: '+outdent',
  STRIKE_THROUGH: '+strikeThrough',
  HORIZONTAL_RULE: '+insertHorizontalRule',
  SUBSCRIPT: '+subscript',
  SUPERSCRIPT: '+superscript',
  UNDERLINE: '+underline',
  BOLD: '+bold',
  ITALIC: '+italic',
  FONT_SIZE: '+fontSize',
  FONT_FACE: '+fontName',
  FONT_COLOR: '+foreColor',
  BACKGROUND_COLOR: '+backColor',
  ORDERED_LIST: '+insertOrderedList',
  UNORDERED_LIST: '+insertUnorderedList',
  JUSTIFY_CENTER: '+justifyCenter',
  JUSTIFY_FULL: '+justifyFull',
  JUSTIFY_RIGHT: '+justifyRight',
  JUSTIFY_LEFT: '+justifyLeft'
};


/**
 * Inverse map of execCommand strings to
 * {@link goog.editor.plugins.BasicTextFormatter.COMMAND} constants. Used to
 * determine whether a string corresponds to a command this plugin
 * handles in O(1) time.
 * @type {Object}
 * @private
 */
goog.editor.plugins.BasicTextFormatter.SUPPORTED_COMMANDS_ =
    goog.object.transpose(goog.editor.plugins.BasicTextFormatter.COMMAND);


/**
 * Whether the string corresponds to a command this plugin handles.
 * @param {string} command Command string to check.
 * @return {boolean} Whether the string corresponds to a command
 *     this plugin handles.
 * @override
 */
goog.editor.plugins.BasicTextFormatter.prototype.isSupportedCommand = function(
    command) {
  // TODO(user): restore this to simple check once table editing
  // is moved out into its own plugin
  return command in goog.editor.plugins.BasicTextFormatter.SUPPORTED_COMMANDS_;
};


/**
 * @return {goog.dom.AbstractRange} The closure range object that wraps the
 *     current user selection.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.getRange_ = function() {
  return this.getFieldObject().getRange();
};


/**
 * @return {!Document} The document object associated with the currently active
 *     field.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.getDocument_ = function() {
  return this.getFieldDomHelper().getDocument();
};


/**
 * Execute a user-initiated command.
 * @param {string} command Command to execute.
 * @param {...*} var_args For color commands, this
 *     should be the hex color (with the #). For FORMAT_BLOCK, this should be
 *     the goog.editor.plugins.BasicTextFormatter.BLOCK_COMMAND.
 *     It will be unused for other commands.
 * @return {Object|undefined} The result of the command.
 * @override
 */
goog.editor.plugins.BasicTextFormatter.prototype.execCommandInternal = function(
    command, var_args) {
  var preserveDir, styleWithCss, needsFormatBlockDiv, hasDummySelection;
  var result;
  var opt_arg = arguments[1];

  switch (command) {
    case goog.editor.plugins.BasicTextFormatter.COMMAND.BACKGROUND_COLOR:
      // Don't bother for no color selected, color picker is resetting itself.
      if (!goog.isNull(opt_arg)) {
        if (goog.editor.BrowserFeature.EATS_EMPTY_BACKGROUND_COLOR) {
          this.applyBgColorManually_(opt_arg);
        } else if (goog.userAgent.OPERA) {
          // backColor will color the block level element instead of
          // the selected span of text in Opera.
          this.execCommandHelper_('hiliteColor', opt_arg);
        } else {
          this.execCommandHelper_(command, opt_arg);
        }
      }
      break;

    case goog.editor.plugins.BasicTextFormatter.COMMAND.LINK:
      result = this.toggleLink_(opt_arg);
      break;

    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT:
      this.justify_(command);
      break;

    default:
      if (goog.userAgent.IE &&
          command ==
              goog.editor.plugins.BasicTextFormatter.COMMAND.FORMAT_BLOCK &&
          opt_arg) {
        // IE requires that the argument be in the form of an opening
        // tag, like <h1>, including angle brackets.  WebKit will accept
        // the arguemnt with or without brackets, and Firefox pre-3 supports
        // only a fixed subset of tags with brackets, and prefers without.
        // So we only add them IE only.
        opt_arg = '<' + opt_arg + '>';
      }

      if (command ==
          goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_COLOR &&
          goog.isNull(opt_arg)) {
        // If we don't have a color, then FONT_COLOR is a no-op.
        break;
      }

      switch (command) {
        case goog.editor.plugins.BasicTextFormatter.COMMAND.INDENT:
        case goog.editor.plugins.BasicTextFormatter.COMMAND.OUTDENT:
          if (goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS) {
            if (goog.userAgent.GECKO) {
              styleWithCss = true;
            }
            if (goog.userAgent.OPERA) {
              if (command ==
                  goog.editor.plugins.BasicTextFormatter.COMMAND.OUTDENT) {
                // styleWithCSS actually sets negative margins on <blockquote>
                // to outdent them. If the command is enabled without
                // styleWithCSS flipped on, then the caret is in a blockquote so
                // styleWithCSS must not be used. But if the command is not
                // enabled, styleWithCSS should be used so that elements such as
                // a <div> with a margin-left style can still be outdented.
                // (Opera bug: CORE-21118)
                styleWithCss =
                    !this.getDocument_().queryCommandEnabled('outdent');
              } else {
                // Always use styleWithCSS for indenting. Otherwise, Opera will
                // make separate <blockquote>s around *each* indented line,
                // which adds big default <blockquote> margins between each
                // indented line.
                styleWithCss = true;
              }
            }
          }
          // Fall through.

        case goog.editor.plugins.BasicTextFormatter.COMMAND.ORDERED_LIST:
        case goog.editor.plugins.BasicTextFormatter.COMMAND.UNORDERED_LIST:
          if (goog.editor.BrowserFeature.LEAVES_P_WHEN_REMOVING_LISTS &&
              this.queryCommandStateInternal_(this.getDocument_(),
                  command)) {
            // IE leaves behind P tags when unapplying lists.
            // If we're not in P-mode, then we want divs
            // So, unlistify, then convert the Ps into divs.
            needsFormatBlockDiv = this.getFieldObject().queryCommandValue(
                goog.editor.Command.DEFAULT_TAG) != goog.dom.TagName.P;
          } else if (!goog.editor.BrowserFeature.CAN_LISTIFY_BR) {
            // IE doesn't convert BRed line breaks into separate list items.
            // So convert the BRs to divs, then do the listify.
            this.convertBreaksToDivs_();
          }

          // This fix only works in Gecko.
          if (goog.userAgent.GECKO &&
              goog.editor.BrowserFeature.FORGETS_FORMATTING_WHEN_LISTIFYING &&
              !this.queryCommandValue(command)) {
            hasDummySelection |= this.beforeInsertListGecko_();
          }
          // Fall through to preserveDir block

        case goog.editor.plugins.BasicTextFormatter.COMMAND.FORMAT_BLOCK:
          // Both FF & IE may lose directionality info. Save/restore it.
          // TODO(user): Does Safari also need this?
          // TODO (gmark, jparent): This isn't ideal because it uses a string
          // literal, so if the plugin name changes, it would break. We need a
          // better solution. See also other places in code that use
          // this.getPluginByClassId('Bidi').
          preserveDir = !!this.getFieldObject().getPluginByClassId('Bidi');
          break;

        case goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT:
        case goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT:
          if (goog.editor.BrowserFeature.NESTS_SUBSCRIPT_SUPERSCRIPT) {
            // This browser nests subscript and superscript when both are
            // applied, instead of canceling out the first when applying the
            // second.
            this.applySubscriptSuperscriptWorkarounds_(command);
          }
          break;

        case goog.editor.plugins.BasicTextFormatter.COMMAND.UNDERLINE:
        case goog.editor.plugins.BasicTextFormatter.COMMAND.BOLD:
        case goog.editor.plugins.BasicTextFormatter.COMMAND.ITALIC:
          // If we are applying the formatting, then we want to have
          // styleWithCSS false so that we generate html tags (like <b>).  If we
          // are unformatting something, we want to have styleWithCSS true so
          // that we can unformat both html tags and inline styling.
          // TODO(user): What about WebKit and Opera?
          styleWithCss = goog.userAgent.GECKO &&
                         goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS &&
                         this.queryCommandValue(command);
          break;

        case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_COLOR:
        case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_FACE:
          // It is very expensive in FF (order of magnitude difference) to use
          // font tags instead of styled spans. Whenever possible,
          // force FF to use spans.
          // Font size is very expensive too, but FF always uses font tags,
          // regardless of which styleWithCSS value you use.
          styleWithCss = goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS &&
                         goog.userAgent.GECKO;
      }

      /**
       * Cases where we just use the default execCommand (in addition
       * to the above fall-throughs)
       * goog.editor.plugins.BasicTextFormatter.COMMAND.STRIKE_THROUGH:
       * goog.editor.plugins.BasicTextFormatter.COMMAND.HORIZONTAL_RULE:
       * goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT:
       * goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT:
       * goog.editor.plugins.BasicTextFormatter.COMMAND.UNDERLINE:
       * goog.editor.plugins.BasicTextFormatter.COMMAND.BOLD:
       * goog.editor.plugins.BasicTextFormatter.COMMAND.ITALIC:
       * goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_SIZE:
       * goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_FACE:
       */
      this.execCommandHelper_(command, opt_arg, preserveDir, !!styleWithCss);

      if (hasDummySelection) {
        this.getDocument_().execCommand('Delete', false, true);
      }

      if (needsFormatBlockDiv) {
        this.getDocument_().execCommand('FormatBlock', false, '<div>');
      }
  }
  // FF loses focus, so we have to set the focus back to the document or the
  // user can't type after selecting from menu.  In IE, focus is set correctly
  // and resetting it here messes it up.
  if (goog.userAgent.GECKO && !this.getFieldObject().inModalMode()) {
    this.focusField_();
  }
  return result;
};


/**
 * Focuses on the field.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.focusField_ = function() {
  this.getFieldDomHelper().getWindow().focus();
};


/**
 * Gets the command value.
 * @param {string} command The command value to get.
 * @return {string|boolean|null} The current value of the command in the given
 *     selection.  NOTE: This return type list is not documented in MSDN or MDC
 *     and has been constructed from experience.  Please update it
 *     if necessary.
 * @override
 */
goog.editor.plugins.BasicTextFormatter.prototype.queryCommandValue = function(
    command) {
  var styleWithCss;
  switch (command) {
    case goog.editor.plugins.BasicTextFormatter.COMMAND.LINK:
      return this.isNodeInState_(goog.dom.TagName.A);

    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT:
      return this.isJustification_(command);

    case goog.editor.plugins.BasicTextFormatter.COMMAND.FORMAT_BLOCK:
      // TODO(nicksantos): See if we can use queryCommandValue here.
      return goog.editor.plugins.BasicTextFormatter.getSelectionBlockState_(
          this.getFieldObject().getRange());

    case goog.editor.plugins.BasicTextFormatter.COMMAND.INDENT:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.OUTDENT:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.HORIZONTAL_RULE:
      // TODO: See if there are reasonable results to return for
      // these commands.
      return false;

    case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_SIZE:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_FACE:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_COLOR:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.BACKGROUND_COLOR:
      // We use queryCommandValue here since we don't just want to know if a
      // color/fontface/fontsize is applied, we want to know WHICH one it is.
      return this.queryCommandValueInternal_(this.getDocument_(), command,
          goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS &&
          goog.userAgent.GECKO);

    case goog.editor.plugins.BasicTextFormatter.COMMAND.UNDERLINE:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.BOLD:
    case goog.editor.plugins.BasicTextFormatter.COMMAND.ITALIC:
      styleWithCss = goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS &&
                     goog.userAgent.GECKO;

    default:
      /**
       * goog.editor.plugins.BasicTextFormatter.COMMAND.STRIKE_THROUGH
       * goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT
       * goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT
       * goog.editor.plugins.BasicTextFormatter.COMMAND.UNDERLINE
       * goog.editor.plugins.BasicTextFormatter.COMMAND.BOLD
       * goog.editor.plugins.BasicTextFormatter.COMMAND.ITALIC
       * goog.editor.plugins.BasicTextFormatter.COMMAND.ORDERED_LIST
       * goog.editor.plugins.BasicTextFormatter.COMMAND.UNORDERED_LIST
       */
      // This only works for commands that use the default execCommand
      return this.queryCommandStateInternal_(this.getDocument_(), command,
          styleWithCss);
  }
};


/**
 * @override
 */
goog.editor.plugins.BasicTextFormatter.prototype.prepareContentsHtml =
    function(html) {
  // If the browser collapses empty nodes and the field has only a script
  // tag in it, then it will collapse this node. Which will mean the user
  // can't click into it to edit it.
  if (goog.editor.BrowserFeature.COLLAPSES_EMPTY_NODES &&
      html.match(/^\s*<script/i)) {
    html = '&nbsp;' + html;
  }

  if (goog.editor.BrowserFeature.CONVERT_TO_B_AND_I_TAGS) {
    // Some browsers (FF) can't undo strong/em in some cases, but can undo b/i!
    html = html.replace(/<(\/?)strong([^\w])/gi, '<$1b$2');
    html = html.replace(/<(\/?)em([^\w])/gi, '<$1i$2');
  }

  return html;
};


/**
 * @override
 */
goog.editor.plugins.BasicTextFormatter.prototype.cleanContentsDom =
    function(fieldCopy) {
  var images = fieldCopy.getElementsByTagName(goog.dom.TagName.IMG);
  for (var i = 0, image; image = images[i]; i++) {
    if (goog.editor.BrowserFeature.SHOWS_CUSTOM_ATTRS_IN_INNER_HTML) {
      // Only need to remove these attributes in IE because
      // Firefox and Safari don't show custom attributes in the innerHTML.
      image.removeAttribute('tabIndex');
      image.removeAttribute('tabIndexSet');
      goog.removeUid(image);

      // Declare oldTypeIndex for the compiler. The associated plugin may not be
      // included in the compiled bundle.
      /** @type {string} */ image.oldTabIndex;

      // oldTabIndex will only be set if
      // goog.editor.BrowserFeature.TABS_THROUGH_IMAGES is true and we're in
      // P-on-enter mode.
      if (image.oldTabIndex) {
        image.tabIndex = image.oldTabIndex;
      }
    }
  }
};


/**
 * @override
 */
goog.editor.plugins.BasicTextFormatter.prototype.cleanContentsHtml =
    function(html) {
  if (goog.editor.BrowserFeature.MOVES_STYLE_TO_HEAD) {
    // Safari creates a new <head> element for <style> tags, so prepend their
    // contents to the output.
    var heads = this.getFieldObject().getEditableDomHelper().
        getElementsByTagNameAndClass(goog.dom.TagName.HEAD);
    var stylesHtmlArr = [];

    // i starts at 1 so we don't copy in the original, legitimate <head>.
    var numHeads = heads.length;
    for (var i = 1; i < numHeads; ++i) {
      var styles = heads[i].getElementsByTagName(goog.dom.TagName.STYLE);
      var numStyles = styles.length;
      for (var j = 0; j < numStyles; ++j) {
        stylesHtmlArr.push(styles[j].outerHTML);
      }
    }
    return stylesHtmlArr.join('') + html;
  }

  return html;
};


/**
 * @override
 */
goog.editor.plugins.BasicTextFormatter.prototype.handleKeyboardShortcut =
    function(e, key, isModifierPressed) {
  if (!isModifierPressed) {
    return false;
  }
  var command;
  switch (key) {
    case 'b': // Ctrl+B
      command = goog.editor.plugins.BasicTextFormatter.COMMAND.BOLD;
      break;
    case 'i': // Ctrl+I
      command = goog.editor.plugins.BasicTextFormatter.COMMAND.ITALIC;
      break;
    case 'u': // Ctrl+U
      command = goog.editor.plugins.BasicTextFormatter.COMMAND.UNDERLINE;
      break;
    case 's': // Ctrl+S
      // TODO(user): This doesn't belong in here.  Clients should handle
      // this themselves.
      // Catching control + s prevents the annoying browser save dialog
      // from appearing.
      return true;
  }

  if (command) {
    this.getFieldObject().execCommand(command);
    return true;
  }

  return false;
};


// Helpers for execCommand


/**
 * Regular expression to match BRs in HTML. Saves the BRs' attributes in $1 for
 * use with replace(). In non-IE browsers, does not match BRs adjacent to an
 * opening or closing DIV or P tag, since nonrendered BR elements can occur at
 * the end of block level containers in those browsers' editors.
 * @type {RegExp}
 * @private
 */
goog.editor.plugins.BasicTextFormatter.BR_REGEXP_ =
    goog.userAgent.IE ? /<br([^\/>]*)\/?>/gi :
                        /<br([^\/>]*)\/?>(?!<\/(div|p)>)/gi;


/**
 * Convert BRs in the selection to divs.
 * This is only intended to be used in IE and Opera.
 * @return {boolean} Whether any BR's were converted.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.convertBreaksToDivs_ =
    function() {
  if (!goog.userAgent.IE && !goog.userAgent.OPERA) {
    // This function is only supported on IE and Opera.
    return false;
  }
  var range = this.getRange_();
  var parent = range.getContainerElement();
  var doc = this.getDocument_();

  goog.editor.plugins.BasicTextFormatter.BR_REGEXP_.lastIndex = 0;
  // Only mess with the HTML/selection if it contains a BR.
  if (goog.editor.plugins.BasicTextFormatter.BR_REGEXP_.test(
      parent.innerHTML)) {
    // Insert temporary markers to remember the selection.
    var savedRange = range.saveUsingCarets();

    if (parent.tagName == goog.dom.TagName.P) {
      // Can't append paragraphs to paragraph tags. Throws an exception in IE.
      goog.editor.plugins.BasicTextFormatter.convertParagraphToDiv_(
          parent, true);
    } else {
      // Used to do:
      // IE: <div>foo<br>bar</div> --> <div>foo<p id="temp_br">bar</div>
      // Opera: <div>foo<br>bar</div> --> <div>foo<p class="temp_br">bar</div>
      // To fix bug 1939883, now does for both:
      // <div>foo<br>bar</div> --> <div>foo<p trtempbr="temp_br">bar</div>
      // TODO(user): Confirm if there's any way to skip this
      // intermediate step of converting br's to p's before converting those to
      // div's. The reason may be hidden in CLs 5332866 and 8530601.
      var attribute = 'trtempbr';
      var value = 'temp_br';
      var newHtml = parent.innerHTML.replace(
          goog.editor.plugins.BasicTextFormatter.BR_REGEXP_,
          '<p$1 ' + attribute + '="' + value + '">');
      goog.editor.node.replaceInnerHtml(parent, newHtml);

      var paragraphs =
          goog.array.toArray(parent.getElementsByTagName(goog.dom.TagName.P));
      goog.iter.forEach(paragraphs, function(paragraph) {
        if (paragraph.getAttribute(attribute) == value) {
          paragraph.removeAttribute(attribute);
          if (goog.string.isBreakingWhitespace(
              goog.dom.getTextContent(paragraph))) {
            // Prevent the empty blocks from collapsing.
            // A <BR> is preferable because it doesn't result in any text being
            // added to the "blank" line. In IE, however, it is possible to
            // place the caret after the <br>, which effectively creates a
            // visible line break. Because of this, we have to resort to using a
            // &nbsp; in IE.
            var child = goog.userAgent.IE ?
                doc.createTextNode(goog.string.Unicode.NBSP) :
                doc.createElement(goog.dom.TagName.BR);
            paragraph.appendChild(child);
          }
          goog.editor.plugins.BasicTextFormatter.convertParagraphToDiv_(
              paragraph);
        }
      });
    }

    // Select the previously selected text so we only listify
    // the selected portion and maintain the user's selection.
    savedRange.restore();
    return true;
  }

  return false;
};


/**
 * Convert the given paragraph to being a div. This clobbers the
 * passed-in node!
 * This is only intended to be used in IE and Opera.
 * @param {Node} paragraph Paragragh to convert to a div.
 * @param {boolean=} opt_convertBrs If true, also convert BRs to divs.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.convertParagraphToDiv_ =
    function(paragraph, opt_convertBrs) {
  if (!goog.userAgent.IE && !goog.userAgent.OPERA) {
    // This function is only supported on IE and Opera.
    return;
  }
  var outerHTML = paragraph.outerHTML.replace(/<(\/?)p/gi, '<$1div');
  if (opt_convertBrs) {
    // IE fills in the closing div tag if it's missing!
    outerHTML = outerHTML.replace(
        goog.editor.plugins.BasicTextFormatter.BR_REGEXP_,
        '</div><div$1>');
  }
  if (goog.userAgent.OPERA && !/<\/div>$/i.test(outerHTML)) {
    // Opera doesn't automatically add the closing tag, so add it if needed.
    outerHTML += '</div>';
  }
  paragraph.outerHTML = outerHTML;
};


/**
 * If this is a goog.editor.plugins.BasicTextFormatter.COMMAND,
 * convert it to something that we can pass into execCommand,
 * queryCommandState, etc.
 *
 * TODO(user): Consider doing away with the + and converter completely.
 *
 * @param {goog.editor.plugins.BasicTextFormatter.COMMAND|string}
 *     command A command key.
 * @return {string} The equivalent execCommand command.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.convertToRealExecCommand_ = function(
    command) {
  return command.indexOf('+') == 0 ? command.substring(1) : command;
};


/**
 * Justify the text in the selection.
 * @param {string} command The type of justification to perform.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.justify_ = function(command) {
  this.execCommandHelper_(command, null, false, true);
  // Firefox cannot justify divs.  In fact, justifying divs results in removing
  // the divs and replacing them with brs.  So "<div>foo</div><div>bar</div>"
  // becomes "foo<br>bar" after alignment is applied.  However, if you justify
  // again, then you get "<div style='text-align: right'>foo<br>bar</div>",
  // which at least looks visually correct.  Since justification is (normally)
  // idempotent, it isn't a problem when the selection does not contain divs to
  // apply justifcation again.
  if (goog.userAgent.GECKO) {
    this.execCommandHelper_(command, null, false, true);
  }

  // Convert all block elements in the selection to use CSS text-align
  // instead of the align property. This works better because the align
  // property is overridden by the CSS text-align property.
  //
  // Only for browsers that can't handle this by the styleWithCSS execCommand,
  // which allows us to specify if we should insert align or text-align.
  // TODO(user): What about WebKit or Opera?
  if (!(goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS &&
        goog.userAgent.GECKO)) {
    goog.iter.forEach(this.getFieldObject().getRange(),
        goog.editor.plugins.BasicTextFormatter.convertContainerToTextAlign_);
  }
};


/**
 * Converts the block element containing the given node to use CSS text-align
 * instead of the align property.
 * @param {Node} node The node to convert the container of.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.convertContainerToTextAlign_ =
    function(node) {
  var container = goog.editor.style.getContainer(node);

  // TODO(user): Fix this so that it doesn't screw up tables.
  if (container.align) {
    container.style.textAlign = container.align;
    container.removeAttribute('align');
  }
};


/**
 * Perform an execCommand on the active document.
 * @param {string} command The command to execute.
 * @param {string|number|boolean|null=} opt_value Optional value.
 * @param {boolean=} opt_preserveDir Set true to make sure that command does not
 *     change directionality of the selected text (works only if all selected
 *     text has the same directionality, otherwise ignored). Should not be true
 *     if bidi plugin is not loaded.
 * @param {boolean=} opt_styleWithCss Set to true to ask the browser to use CSS
 *     to perform the execCommand.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.execCommandHelper_ = function(
    command, opt_value, opt_preserveDir, opt_styleWithCss) {
  // There is a bug in FF: some commands do not preserve attributes of the
  // block-level elements they replace.
  // This (among the rest) leads to loss of directionality information.
  // For now we use a hack (when opt_preserveDir==true) to avoid this
  // directionality problem in the simplest cases.
  // Known affected commands: formatBlock, insertOrderedList,
  // insertUnorderedList, indent, outdent.
  // A similar problem occurs in IE when insertOrderedList or
  // insertUnorderedList remove existing list.
  var dir = null;
  if (opt_preserveDir) {
    dir =
        this.getFieldObject().queryCommandValue(
            goog.editor.Command.DIR_RTL) ? 'rtl' :
        this.getFieldObject().queryCommandValue(
            goog.editor.Command.DIR_LTR) ? 'ltr' :
        null;
  }

  command = goog.editor.plugins.BasicTextFormatter.convertToRealExecCommand_(
      command);

  var endDiv, nbsp;
  if (goog.userAgent.IE) {
    var ret = this.applyExecCommandIEFixes_(command);
    endDiv = ret[0];
    nbsp = ret[1];
  }

  if (goog.userAgent.WEBKIT) {
    endDiv = this.applyExecCommandSafariFixes_(command);
  }

  if (goog.userAgent.GECKO) {
    this.applyExecCommandGeckoFixes_(command);
  }

  if (goog.editor.BrowserFeature.DOESNT_OVERRIDE_FONT_SIZE_IN_STYLE_ATTR &&
      command.toLowerCase() == 'fontsize') {
    this.removeFontSizeFromStyleAttrs_();
  }

  var doc = this.getDocument_();
  if (opt_styleWithCss &&
      goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS) {
    doc.execCommand('styleWithCSS', false, true);
    if (goog.userAgent.OPERA) {
      this.invalidateInlineCss_();
    }
  }

  doc.execCommand(command, false, opt_value);
  if (opt_styleWithCss &&
      goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS) {
    // If we enabled styleWithCSS, turn it back off.
    doc.execCommand('styleWithCSS', false, false);
  }

  if (goog.userAgent.WEBKIT &&
      !goog.userAgent.isVersionOrHigher('526') &&
      command.toLowerCase() == 'formatblock' &&
      opt_value && /^[<]?h\d[>]?$/i.test(opt_value)) {
    this.cleanUpSafariHeadings_();
  }

  if (/insert(un)?orderedlist/i.test(command)) {
    // NOTE(user): This doesn't check queryCommandState because it seems to
    // lie. Also, this runs for insertunorderedlist so that the the list
    // isn't made up of an <ul> for each <li> - even though it looks the same,
    // the markup is disgusting.
    if (goog.userAgent.WEBKIT &&
        !goog.userAgent.isVersionOrHigher(534)) {
      this.fixSafariLists_();
    }
    if (goog.userAgent.IE) {
      this.fixIELists_();

      if (nbsp) {
        // Remove the text node, if applicable.  Do not try to instead clobber
        // the contents of the text node if it was added, or the same invalid
        // node thing as above will happen.  The error won't happen here, it
        // will happen after you hit enter and then do anything that loops
        // through the dom and tries to read that node.
        goog.dom.removeNode(nbsp);
      }
    }
  }

  if (endDiv) {
    // Remove the dummy div.
    goog.dom.removeNode(endDiv);
  }

  // Restore directionality if required and only when unambigous (dir!=null).
  if (dir) {
    this.getFieldObject().execCommand(dir);
  }
};


/**
 * Applies a background color to a selection when the browser can't do the job.
 *
 * NOTE(nicksantos): If you think this is hacky, you should try applying
 * background color in Opera. It made me cry.
 *
 * @param {string} bgColor backgroundColor from .formatText to .execCommand.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.applyBgColorManually_ =
    function(bgColor) {
  var needsSpaceInTextNode = goog.userAgent.GECKO;
  var range = this.getFieldObject().getRange();
  var textNode;
  var parentTag;
  if (range && range.isCollapsed()) {
    // Hack to handle Firefox bug:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=279330
    // execCommand hiliteColor in Firefox on collapsed selection creates
    // a font tag onkeypress
    textNode = this.getFieldDomHelper().
        createTextNode(needsSpaceInTextNode ? ' ' : '');

    var containerNode = range.getStartNode();
    // Check if we're inside a tag that contains the cursor and nothing else;
    // if we are, don't create a dummySpan. Just use this containing tag to
    // hide the 1-space selection.
    // If the user sets a background color on a collapsed selection, then sets
    // another one immediately, we get a span tag with a single empty TextNode.
    // If the user sets a background color, types, then backspaces, we get a
    // span tag with nothing inside it (container is the span).
    parentTag = containerNode.nodeType == goog.dom.NodeType.ELEMENT ?
        containerNode : containerNode.parentNode;

    if (parentTag.innerHTML == '') {
      // There's an Element to work with
      // make the space character invisible using a CSS indent hack
      parentTag.style.textIndent = '-10000px';
      parentTag.appendChild(textNode);
    } else {
      // No Element to work with; make one
      // create a span with a space character inside
      // make the space character invisible using a CSS indent hack
      parentTag = this.getFieldDomHelper().createDom(goog.dom.TagName.SPAN,
          {'style': 'text-indent:-10000px'}, textNode);
      range.replaceContentsWithNode(parentTag);
    }
    goog.dom.Range.createFromNodeContents(textNode).select();
  }

  this.execCommandHelper_('hiliteColor', bgColor, false, true);

  if (textNode) {
    // eliminate the space if necessary.
    if (needsSpaceInTextNode) {
      textNode.data = '';
    }

    // eliminate the hack.
    parentTag.style.textIndent = '';
    // execCommand modified our span so we leave it in place.
  }
};


/**
 * Toggle link for the current selection:
 *   If selection contains a link, unlink it, return null.
 *   Otherwise, make selection into a link, return the link.
 * @param {string=} opt_target Target for the link.
 * @return {goog.editor.Link?} The resulting link, or null if a link was
 *     removed.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.toggleLink_ = function(
    opt_target) {
  if (!this.getFieldObject().isSelectionEditable()) {
    this.focusField_();
  }

  var range = this.getRange_();
  // Since we wrap images in links, its possible that the user selected an
  // image and clicked link, in which case we want to actually use the
  // image as the selection.
  var parent = range && range.getContainerElement();
  var link = /** @type {Element} */ (
      goog.dom.getAncestorByTagNameAndClass(parent, goog.dom.TagName.A));
  if (link && goog.editor.node.isEditable(link)) {
    goog.dom.flattenElement(link);
  } else {
    var editableLink = this.createLink_(range, '/', opt_target);
    if (editableLink) {
      if (!this.getFieldObject().execCommand(
          goog.editor.Command.MODAL_LINK_EDITOR, editableLink)) {
        var url = this.getFieldObject().getAppWindow().prompt(
            goog.ui.editor.messages.MSG_LINK_TO, 'http://');
        if (url) {
          editableLink.setTextAndUrl(editableLink.getCurrentText() || url, url);
          editableLink.placeCursorRightOf();
        } else {
          var savedRange = goog.editor.range.saveUsingNormalizedCarets(
              goog.dom.Range.createFromNodeContents(editableLink.getAnchor()));
          editableLink.removeLink();
          savedRange.restore().select();
          return null;
        }
      }
      return editableLink;
    }
  }
  return null;
};


/**
 * Create a link out of the current selection.  If nothing is selected, insert
 * a new link.  Otherwise, enclose the selection in a link.
 * @param {goog.dom.AbstractRange} range The closure range object for the
 *     current selection.
 * @param {string} url The url to link to.
 * @param {string=} opt_target Target for the link.
 * @return {goog.editor.Link?} The newly created link, or null if the link
 *     couldn't be created.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.createLink_ = function(range,
    url, opt_target) {
  var anchor = null;
  var anchors = [];
  var parent = range && range.getContainerElement();
  // We do not yet support creating links around images.  Instead of throwing
  // lots of js errors, just fail silently.
  // TODO(user): Add support for linking images.
  if (parent && parent.tagName == goog.dom.TagName.IMG) {
    return null;
  }
  // If range is not present, the editable field doesn't have focus, abort
  // creating a link.
  if (!range) {
    return null;
  }

  if (range.isCollapsed()) {
    var textRange = range.getTextRange(0).getBrowserRangeObject();
    if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
      anchor = this.getFieldDomHelper().createElement(goog.dom.TagName.A);
      textRange.insertNode(anchor);
    } else if (goog.editor.BrowserFeature.HAS_IE_RANGES) {
      // TODO: Use goog.dom.AbstractRange's surroundContents
      textRange.pasteHTML("<a id='newLink'></a>");
      anchor = this.getFieldDomHelper().getElement('newLink');
      anchor.removeAttribute('id');
    }
  } else {
    // Create a unique identifier for the link so we can retrieve it later.
    // execCommand doesn't return the link to us, and we need a way to find
    // the newly created link in the dom, and the url is the only property
    // we have control over, so we set that to be unique and then find it.
    var uniqueId = goog.string.createUniqueString();
    this.execCommandHelper_('CreateLink', uniqueId);
    var setHrefAndLink = function(element, index, arr) {
      // We can't do straight comparision since the href can contain the
      // absolute url.
      if (goog.string.endsWith(element.href, uniqueId)) {
        anchors.push(element);
      }
    };

    goog.array.forEach(this.getFieldObject().getElement().getElementsByTagName(
        goog.dom.TagName.A), setHrefAndLink);
    if (anchors.length) {
      anchor = anchors.pop();
    }
    var isLikelyUrl = function(a, i, anchors) {
      return goog.editor.Link.isLikelyUrl(goog.dom.getRawTextContent(a));
    };
    if (anchors.length && goog.array.every(anchors, isLikelyUrl)) {
      for (var i = 0, a; a = anchors[i]; i++) {
        goog.editor.Link.createNewLinkFromText(a, opt_target);
      }
      anchors = null;
    }
  }

  return goog.editor.Link.createNewLink(
      /** @type {HTMLAnchorElement} */ (anchor), url, opt_target, anchors);
};


//---------------------------------------------------------------------
// browser fixes


/**
 * The following execCommands are "broken" in some way - in IE they allow
 * the nodes outside the contentEditable region to get modified (see
 * execCommand below for more details).
 * @const
 * @private
 */
goog.editor.plugins.BasicTextFormatter.brokenExecCommandsIE_ = {
  'indent' : 1,
  'outdent' : 1,
  'insertOrderedList' : 1,
  'insertUnorderedList' : 1,
  'justifyCenter' : 1,
  'justifyFull' : 1,
  'justifyRight': 1,
  'justifyLeft': 1,
  'ltr' : 1,
  'rtl' : 1
};


/**
 * When the following commands are executed while the selection is
 * inside a blockquote, they hose the blockquote tag in weird and
 * unintuitive ways.
 * @const
 * @private
 */
goog.editor.plugins.BasicTextFormatter.blockquoteHatingCommandsIE_ = {
  'insertOrderedList' : 1,
  'insertUnorderedList' : 1
};


/**
 * Makes sure that superscript is removed before applying subscript, and vice
 * versa. Fixes {@link http://buganizer/issue?id=1173491} .
 * @param {goog.editor.plugins.BasicTextFormatter.COMMAND} command The command
 *     being applied, either SUBSCRIPT or SUPERSCRIPT.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.
    prototype.applySubscriptSuperscriptWorkarounds_ = function(command) {
  if (!this.queryCommandValue(command)) {
    // The current selection doesn't currently have the requested
    // command, so we are applying it as opposed to removing it.
    // (Note that queryCommandValue() will only return true if the
    // command is applied to the whole selection, not just part of it.
    // In this case it is fine because only if the whole selection has
    // the command applied will we be removing it and thus skipping the
    // removal of the opposite command.)
    var oppositeCommand =
        (command == goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT ?
            goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT :
            goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT);
    var oppositeExecCommand = goog.editor.plugins.BasicTextFormatter.
        convertToRealExecCommand_(oppositeCommand);
    // Executing the opposite command on a selection that already has it
    // applied will cancel it out. But if the selection only has the
    // opposite command applied to a part of it, the browser will
    // normalize the selection to have the opposite command applied on
    // the whole of it.
    if (!this.queryCommandValue(oppositeCommand)) {
      // The selection doesn't have the opposite command applied to the
      // whole of it, so let's exec the opposite command to normalize
      // the selection.
      // Note: since we know both subscript and superscript commands
      // will boil down to a simple call to the browser's execCommand(),
      // for performance reasons we can do that directly instead of
      // calling execCommandHelper_(). However this is a potential for
      // bugs if the implementation of execCommandHelper_() is changed
      // to do something more int eh case of subscript and superscript.
      this.getDocument_().execCommand(oppositeExecCommand, false, null);
    }
    // Now that we know the whole selection has the opposite command
    // applied, we exec it a second time to properly remove it.
    this.getDocument_().execCommand(oppositeExecCommand, false, null);
  }
};


/**
 * Removes inline font-size styles from elements fully contained in the
 * selection, so the font tags produced by execCommand work properly.
 * See {@bug 1286408}.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.removeFontSizeFromStyleAttrs_ =
    function() {
  // Expand the range so that we consider surrounding tags. E.g. if only the
  // text node inside a span is selected, the browser could wrap a font tag
  // around the span and leave the selection such that only the text node is
  // found when looking inside the range, not the span.
  var range = goog.editor.range.expand(this.getFieldObject().getRange(),
                                       this.getFieldObject().getElement());
  goog.iter.forEach(goog.iter.filter(range, function(tag, dummy, iter) {
    return iter.isStartTag() && range.containsNode(tag);
  }), function(node) {
    goog.style.setStyle(node, 'font-size', '');
    // Gecko doesn't remove empty style tags.
    if (goog.userAgent.GECKO &&
        node.style.length == 0 && node.getAttribute('style') != null) {
      node.removeAttribute('style');
    }
  });
};


/**
 * Apply pre-execCommand fixes for IE.
 * @param {string} command The command to execute.
 * @return {!Array<Node>} Array of nodes to be removed after the execCommand.
 *     Will never be longer than 2 elements.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.applyExecCommandIEFixes_ =
    function(command) {
  // IE has a crazy bug where executing list commands
  // around blockquotes cause the blockquotes to get transformed
  // into "<OL><OL>" or "<UL><UL>" tags.
  var toRemove = [];
  var endDiv = null;
  var range = this.getRange_();
  var dh = this.getFieldDomHelper();
  if (command in
      goog.editor.plugins.BasicTextFormatter.blockquoteHatingCommandsIE_) {
    var parent = range && range.getContainerElement();
    if (parent) {
      var blockquotes = goog.dom.getElementsByTagNameAndClass(
          goog.dom.TagName.BLOCKQUOTE, null, parent);

      // If a blockquote contains the selection, the fix is easy:
      // add a dummy div to the blockquote that isn't in the current selection.
      //
      // if the selection contains a blockquote,
      // there appears to be no easy way to protect it from getting mangled.
      // For now, we're just going to punt on this and try to
      // adjust the selection so that IE does something reasonable.
      //
      // TODO(nicksantos): Find a better fix for this.
      var bq;
      for (var i = 0; i < blockquotes.length; i++) {
        if (range.containsNode(blockquotes[i])) {
          bq = blockquotes[i];
          break;
        }
      }

      var bqThatNeedsDummyDiv = bq || goog.dom.getAncestorByTagNameAndClass(
          parent, goog.dom.TagName.BLOCKQUOTE);
      if (bqThatNeedsDummyDiv) {
        endDiv = dh.createDom(goog.dom.TagName.DIV, {style: 'height:0'});
        goog.dom.appendChild(bqThatNeedsDummyDiv, endDiv);
        toRemove.push(endDiv);

        if (bq) {
          range = goog.dom.Range.createFromNodes(bq, 0, endDiv, 0);
        } else if (range.containsNode(endDiv)) {
          // the selection might be the entire blockquote, and
          // it's important that endDiv not be in the selection.
          range = goog.dom.Range.createFromNodes(
              range.getStartNode(), range.getStartOffset(),
              endDiv, 0);
        }
        range.select();
      }
    }
  }

  // IE has a crazy bug where certain block execCommands cause it to mess with
  // the DOM nodes above the contentEditable element if the selection contains
  // or partially contains the last block element in the contentEditable
  // element.
  // Known commands: Indent, outdent, insertorderedlist, insertunorderedlist,
  // Justify (all of them)

  // Both of the above are "solved" by appending a dummy div to the field
  // before the execCommand and removing it after, but we don't need to do this
  // if we've alread added a dummy div somewhere else.
  var fieldObject = this.getFieldObject();
  if (!fieldObject.usesIframe() && !endDiv) {
    if (command in
        goog.editor.plugins.BasicTextFormatter.brokenExecCommandsIE_) {
      var field = fieldObject.getElement();

      // If the field is totally empty, or if the field contains only text nodes
      // and the cursor is at the end of the field, then IE stills walks outside
      // the contentEditable region and destroys things AND justify will not
      // work. This is "solved" by adding a text node into the end of the
      // field and moving the cursor before it.
      if (range && range.isCollapsed() &&
          !goog.dom.getFirstElementChild(field)) {
        // The problem only occurs if the selection is at the end of the field.
        var selection = range.getTextRange(0).getBrowserRangeObject();
        var testRange = selection.duplicate();
        testRange.moveToElementText(field);
        testRange.collapse(false);

        if (testRange.isEqual(selection)) {
          // For reasons I really don't understand, if you use a breaking space
          // here, either " " or String.fromCharCode(32), this textNode becomes
          // corrupted, only after you hit ENTER to split it.  It exists in the
          // dom in that its parent has it as childNode and the parent's
          // innerText is correct, but the node itself throws invalid argument
          // errors when you try to access its data, parentNode, nextSibling,
          // previousSibling or most other properties.  WTF.
          var nbsp = dh.createTextNode(goog.string.Unicode.NBSP);
          field.appendChild(nbsp);
          selection.move('character', 1);
          selection.move('character', -1);
          selection.select();
          toRemove.push(nbsp);
        }
      }

      endDiv = dh.createDom(goog.dom.TagName.DIV, {style: 'height:0'});
      goog.dom.appendChild(field, endDiv);
      toRemove.push(endDiv);
    }
  }

  return toRemove;
};


/**
 * Fix a ridiculous Safari bug: the first letters of new headings
 * somehow retain their original font size and weight if multiple lines are
 * selected during the execCommand that turns them into headings.
 * The solution is to strip these styles which are normally stripped when
 * making things headings anyway.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.cleanUpSafariHeadings_ =
    function() {
  goog.iter.forEach(this.getRange_(), function(node) {
    if (node.className == 'Apple-style-span') {
      // These shouldn't persist after creating headings via
      // a FormatBlock execCommand.
      node.style.fontSize = '';
      node.style.fontWeight = '';
    }
  });
};


/**
 * Prevent Safari from making each list item be "1" when converting from
 * unordered to ordered lists.
 * (see https://bugs.webkit.org/show_bug.cgi?id=19539, fixed by 2010-04-21)
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.fixSafariLists_ = function() {
  var previousList = false;
  goog.iter.forEach(this.getRange_(), function(node) {
    var tagName = node.tagName;
    if (tagName == goog.dom.TagName.UL || tagName == goog.dom.TagName.OL) {
      // Don't disturb lists outside of the selection. If this is the first <ul>
      // or <ol> in the range, we don't really want to merge the previous list
      // into it, since that list isn't in the range.
      if (!previousList) {
        previousList = true;
        return;
      }
      // The lists must be siblings to be merged; otherwise, indented sublists
      // could be broken.
      var previousElementSibling = goog.dom.getPreviousElementSibling(node);
      if (!previousElementSibling) {
        return;
      }
      // Make sure there isn't text between the two lists before they are merged
      var range = node.ownerDocument.createRange();
      range.setStartAfter(previousElementSibling);
      range.setEndBefore(node);
      if (!goog.string.isEmptyOrWhitespace(range.toString())) {
        return;
      }
      // Make sure both are lists of the same type (ordered or unordered)
      if (previousElementSibling.nodeName == node.nodeName) {
        // We must merge the previous list into this one. Moving around
        // the current node will break the iterator, so we can't merge
        // this list into the previous one.
        while (previousElementSibling.lastChild) {
          node.insertBefore(previousElementSibling.lastChild, node.firstChild);
        }
        previousElementSibling.parentNode.removeChild(previousElementSibling);
      }
    }
  });
};


/**
 * Sane "type" attribute values for OL elements
 * @private
 */
goog.editor.plugins.BasicTextFormatter.orderedListTypes_ = {
  '1' : 1,
  'a' : 1,
  'A' : 1,
  'i' : 1,
  'I' : 1
};


/**
 * Sane "type" attribute values for UL elements
 * @private
 */
goog.editor.plugins.BasicTextFormatter.unorderedListTypes_ = {
  'disc' : 1,
  'circle' : 1,
  'square' : 1
};


/**
 * Changing an OL to a UL (or the other way around) will fail if the list
 * has a type attribute (such as "UL type=disc" becoming "OL type=disc", which
 * is visually identical). Most browsers will remove the type attribute
 * automatically, but IE doesn't. This does it manually.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.fixIELists_ = function() {
  // Find the lowest-level <ul> or <ol> that contains the entire range.
  var range = this.getRange_();
  var container = range && range.getContainer();
  while (container &&
         container.tagName != goog.dom.TagName.UL &&
         container.tagName != goog.dom.TagName.OL) {
    container = container.parentNode;
  }
  if (container) {
    // We want the parent node of the list so that we can grab it using
    // getElementsByTagName
    container = container.parentNode;
  }
  if (!container) return;
  var lists = goog.array.toArray(
      container.getElementsByTagName(goog.dom.TagName.UL));
  goog.array.extend(lists, goog.array.toArray(
      container.getElementsByTagName(goog.dom.TagName.OL)));
  // Fix the lists
  goog.array.forEach(lists, function(node) {
    var type = node.type;
    if (type) {
      var saneTypes =
          (node.tagName == goog.dom.TagName.UL ?
              goog.editor.plugins.BasicTextFormatter.unorderedListTypes_ :
              goog.editor.plugins.BasicTextFormatter.orderedListTypes_);
      if (!saneTypes[type]) {
        node.type = '';
      }
    }
  });
};


/**
 * In WebKit, the following commands will modify the node with
 * contentEditable=true if there are no block-level elements.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.brokenExecCommandsSafari_ = {
  'justifyCenter' : 1,
  'justifyFull' : 1,
  'justifyRight': 1,
  'justifyLeft': 1,
  'formatBlock' : 1
};


/**
 * In WebKit, the following commands can hang the browser if the selection
 * touches the beginning of the field.
 * https://bugs.webkit.org/show_bug.cgi?id=19735
 * @private
 */
goog.editor.plugins.BasicTextFormatter.hangingExecCommandWebkit_ = {
  'insertOrderedList': 1,
  'insertUnorderedList': 1
};


/**
 * Apply pre-execCommand fixes for Safari.
 * @param {string} command The command to execute.
 * @return {!Element|undefined} The div added to the field.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.applyExecCommandSafariFixes_ =
    function(command) {
  // See the comment on brokenExecCommandsSafari_
  var div;
  if (goog.editor.plugins.BasicTextFormatter.
      brokenExecCommandsSafari_[command]) {
    // Add a new div at the end of the field.
    // Safari knows that it would be wrong to apply text-align to the
    // contentEditable element if there are non-empty block nodes in the field,
    // because then it would align them too. So in this case, it will
    // enclose the current selection in a block node.
    div = this.getFieldDomHelper().createDom(
        goog.dom.TagName.DIV, {'style': 'height: 0'}, 'x');
    goog.dom.appendChild(this.getFieldObject().getElement(), div);
  }

  if (!goog.userAgent.isVersionOrHigher(534) &&
      goog.editor.plugins.BasicTextFormatter.
          hangingExecCommandWebkit_[command]) {
    // Add a new div at the beginning of the field.
    var field = this.getFieldObject().getElement();
    div = this.getFieldDomHelper().createDom(
        goog.dom.TagName.DIV, {'style': 'height: 0'}, 'x');
    field.insertBefore(div, field.firstChild);
  }

  return div;
};


/**
 * Apply pre-execCommand fixes for Gecko.
 * @param {string} command The command to execute.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.applyExecCommandGeckoFixes_ =
    function(command) {
  if (goog.userAgent.isVersionOrHigher('1.9') &&
      command.toLowerCase() == 'formatblock') {
    // Firefox 3 and above throw a JS error for formatblock if the range is
    // a child of the body node. Changing the selection to the BR fixes the
    // problem.
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=481696
    var range = this.getRange_();
    var startNode = range.getStartNode();
    if (range.isCollapsed() && startNode &&
        startNode.tagName == goog.dom.TagName.BODY) {
      var startOffset = range.getStartOffset();
      var childNode = startNode.childNodes[startOffset];
      if (childNode && childNode.tagName == goog.dom.TagName.BR) {
        // Change the range using getBrowserRange() because goog.dom.TextRange
        // will avoid setting <br>s directly.
        // @see goog.dom.TextRange#createFromNodes
        var browserRange = range.getBrowserRangeObject();
        browserRange.setStart(childNode, 0);
        browserRange.setEnd(childNode, 0);
      }
    }
  }
};


/**
 * Workaround for Opera bug CORE-23903. Opera sometimes fails to invalidate
 * serialized CSS or innerHTML for the DOM after certain execCommands when
 * styleWithCSS is on. Toggling an inline style on the elements fixes it.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.invalidateInlineCss_ =
    function() {
  var ancestors = [];
  var ancestor = this.getFieldObject().getRange().getContainerElement();
  do {
    ancestors.push(ancestor);
  } while (ancestor = ancestor.parentNode);
  var nodesInSelection = goog.iter.chain(
      goog.iter.toIterator(this.getFieldObject().getRange()),
      goog.iter.toIterator(ancestors));
  var containersInSelection =
      goog.iter.filter(nodesInSelection, goog.editor.style.isContainer);
  goog.iter.forEach(containersInSelection, function(element) {
    var oldOutline = element.style.outline;
    element.style.outline = '0px solid red';
    element.style.outline = oldOutline;
  });
};


/**
 * Work around a Gecko bug that causes inserted lists to forget the current
 * font. This affects WebKit in the same way and Opera in a slightly different
 * way, but this workaround only works in Gecko.
 * WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=19653
 * Mozilla bug: https://bugzilla.mozilla.org/show_bug.cgi?id=439966
 * Opera bug: https://bugs.opera.com/show_bug.cgi?id=340392
 * TODO: work around this issue in WebKit and Opera as well.
 * @return {boolean} Whether the workaround was applied.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.beforeInsertListGecko_ =
    function() {
  var tag = this.getFieldObject().queryCommandValue(
      goog.editor.Command.DEFAULT_TAG);
  if (tag == goog.dom.TagName.P || tag == goog.dom.TagName.DIV) {
    return false;
  }

  // Prevent Firefox from forgetting current formatting
  // when creating a list.
  // The bug happens with a collapsed selection, but it won't
  // happen when text with the desired formatting is selected.
  // So, we insert some dummy text, insert the list,
  // then remove the dummy text (while preserving its formatting).
  // (This formatting bug also affects WebKit, but this fix
  // only seems to work in Firefox)
  var range = this.getRange_();
  if (range.isCollapsed() &&
      (range.getContainer().nodeType != goog.dom.NodeType.TEXT)) {
    var tempTextNode = this.getFieldDomHelper().
        createTextNode(goog.string.Unicode.NBSP);
    range.insertNode(tempTextNode, false);
    goog.dom.Range.createFromNodeContents(tempTextNode).select();
    return true;
  }
  return false;
};


// Helpers for queryCommandState


/**
 * Get the toolbar state for the block-level elements in the given range.
 * @param {goog.dom.AbstractRange} range The range to get toolbar state for.
 * @return {string?} The selection block state.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.getSelectionBlockState_ =
    function(range) {
  var tagName = null;
  goog.iter.forEach(range, function(node, ignore, it) {
    if (!it.isEndTag()) {
      // Iterate over all containers in the range, checking if they all have the
      // same tagName.
      var container = goog.editor.style.getContainer(node);
      var thisTagName = container.tagName;
      tagName = tagName || thisTagName;

      if (tagName != thisTagName) {
        // If we find a container tag that doesn't match, exit right away.
        tagName = null;
        throw goog.iter.StopIteration;
      }

      // Skip the tag.
      it.skipTag();
    }
  });

  return tagName;
};


/**
 * Hash of suppoted justifications.
 * @type {Object}
 * @private
 */
goog.editor.plugins.BasicTextFormatter.SUPPORTED_JUSTIFICATIONS_ = {
  'center': 1,
  'justify': 1,
  'right': 1,
  'left': 1
};


/**
 * Returns true if the current justification matches the justification
 * command for the entire selection.
 * @param {string} command The justification command to check for.
 * @return {boolean} Whether the current justification matches the justification
 *     command for the entire selection.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.isJustification_ =
    function(command) {
  var alignment = command.replace('+justify', '').toLowerCase();
  if (alignment == 'full') {
    alignment = 'justify';
  }
  var bidiPlugin = this.getFieldObject().getPluginByClassId('Bidi');
  if (bidiPlugin) {
    // BiDi aware version

    // TODO: Since getComputedStyle is not used here, this version may be even
    // faster. If profiling confirms that it would be good to use this approach
    // in both cases. Otherwise the bidi part should be moved into an
    // execCommand so this bidi plugin dependence isn't needed here.
    /** @type {Function} */
    bidiPlugin.getSelectionAlignment;
    return alignment == bidiPlugin.getSelectionAlignment();
  } else {
    // BiDi unaware version
    var range = this.getRange_();
    if (!range) {
      // When nothing is in the selection then no justification
      // command matches.
      return false;
    }

    var parent = range.getContainerElement();
    var nodes =
        goog.array.filter(
            parent.childNodes,
            function(node) {
              return goog.editor.node.isImportant(node) &&
                  range.containsNode(node, true);
            });
    nodes = nodes.length ? nodes : [parent];

    for (var i = 0; i < nodes.length; i++) {
      var current = nodes[i];

      // If any node in the selection is not aligned the way we are checking,
      // then the justification command does not match.
      var container = goog.editor.style.getContainer(
          /** @type {Node} */ (current));
      if (alignment !=
          goog.editor.plugins.BasicTextFormatter.getNodeJustification_(
              container)) {
        return false;
      }
    }

    // If all nodes in the selection are aligned the way we are checking,
    // the justification command does match.
    return true;
  }
};


/**
 * Determines the justification for a given block-level element.
 * @param {Element} element The node to get justification for.
 * @return {string} The justification for a given block-level node.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.getNodeJustification_ =
    function(element) {
  var value = goog.style.getComputedTextAlign(element);
  // Strip preceding -moz- or -webkit- (@bug 2472589).
  value = value.replace(/^-(moz|webkit)-/, '');

  // If there is no alignment, try the inline property,
  // otherwise assume left aligned.
  // TODO: for rtl languages we probably need to assume right.
  if (!goog.editor.plugins.BasicTextFormatter.
      SUPPORTED_JUSTIFICATIONS_[value]) {
    value = element.align || 'left';
  }
  return /** @type {string} */ (value);
};


/**
 * Returns true if a selection contained in the node should set the appropriate
 * toolbar state for the given nodeName, e.g. if the node is contained in a
 * strong element and nodeName is "strong", then it will return true.
 * @param {string} nodeName The type of node to check for.
 * @return {boolean} Whether the user's selection is in the given state.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.isNodeInState_ =
    function(nodeName) {
  var range = this.getRange_();
  var node = range && range.getContainerElement();
  var ancestor = goog.dom.getAncestorByTagNameAndClass(node, nodeName);
  return !!ancestor && goog.editor.node.isEditable(ancestor);
};


/**
 * Wrapper for browser's queryCommandState.
 * @param {Document|TextRange|Range} queryObject The object to query.
 * @param {string} command The command to check.
 * @param {boolean=} opt_styleWithCss Set to true to enable styleWithCSS before
 *     performing the queryCommandState.
 * @return {boolean} The command state.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.queryCommandStateInternal_ =
    function(queryObject, command, opt_styleWithCss) {
  return /** @type {boolean} */ (this.queryCommandHelper_(true, queryObject,
      command, opt_styleWithCss));
};


/**
 * Wrapper for browser's queryCommandValue.
 * @param {Document|TextRange|Range} queryObject The object to query.
 * @param {string} command The command to check.
 * @param {boolean=} opt_styleWithCss Set to true to enable styleWithCSS before
 *     performing the queryCommandValue.
 * @return {string|boolean|null} The command value.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.queryCommandValueInternal_ =
    function(queryObject, command, opt_styleWithCss) {
  return this.queryCommandHelper_(false, queryObject,
      command, opt_styleWithCss);
};


/**
 * Helper function to perform queryCommand(Value|State).
 * @param {boolean} isGetQueryCommandState True to use queryCommandState, false
 *     to use queryCommandValue.
 * @param {Document|TextRange|Range} queryObject The object to query.
 * @param {string} command The command to check.
 * @param {boolean=} opt_styleWithCss Set to true to enable styleWithCSS before
 *     performing the queryCommand(Value|State).
 * @return {string|boolean|null} The command value.
 * @private
 */
goog.editor.plugins.BasicTextFormatter.prototype.queryCommandHelper_ = function(
    isGetQueryCommandState, queryObject, command, opt_styleWithCss) {
  command =
      goog.editor.plugins.BasicTextFormatter.convertToRealExecCommand_(
          command);
  if (opt_styleWithCss) {
    var doc = this.getDocument_();
    // Don't use this.execCommandHelper_ here, as it is more heavyweight
    // and inserts a dummy div to protect against comamnds that could step
    // outside the editable region, which would cause change event on
    // every toolbar update.
    doc.execCommand('styleWithCSS', false, true);
  }
  var ret = isGetQueryCommandState ? queryObject.queryCommandState(command) :
      queryObject.queryCommandValue(command);
  if (opt_styleWithCss) {
    doc.execCommand('styleWithCSS', false, false);
  }
  return ret;
};
