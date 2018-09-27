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
 * @fileoverview Provides functions to parse and pretty-print HTML strings.
 *
 */

goog.provide('goog.format.HtmlPrettyPrinter');
goog.provide('goog.format.HtmlPrettyPrinter.Buffer');

goog.require('goog.dom.TagName');
goog.require('goog.object');
goog.require('goog.string.StringBuffer');



/**
 * This class formats HTML to be more human-readable.
 * TODO(user): Add hierarchical indentation.
 * @param {number=} opt_timeOutMillis Max # milliseconds to spend on #format. If
 *     this time is exceeded, return partially formatted. 0 or negative number
 *     indicates no timeout.
 * @constructor
 * @final
 */
goog.format.HtmlPrettyPrinter = function(opt_timeOutMillis) {
  /**
   * Max # milliseconds to spend on #format.
   * @type {number}
   * @private
   */
  this.timeOutMillis_ =
      opt_timeOutMillis && opt_timeOutMillis > 0 ? opt_timeOutMillis : 0;
};


/**
 * Singleton.
 * @private {goog.format.HtmlPrettyPrinter?}
 */
goog.format.HtmlPrettyPrinter.instance_ = null;


/**
 * Singleton lazy initializer.
 * @return {!goog.format.HtmlPrettyPrinter} Singleton.
 * @private
 */
goog.format.HtmlPrettyPrinter.getInstance_ = function() {
  if (!goog.format.HtmlPrettyPrinter.instance_) {
    goog.format.HtmlPrettyPrinter.instance_ =
        new goog.format.HtmlPrettyPrinter();
  }
  return goog.format.HtmlPrettyPrinter.instance_;
};


/**
 * Static utility function. See prototype #format.
 * @param {string} html The HTML text to pretty print.
 * @return {string} Formatted result.
 */
goog.format.HtmlPrettyPrinter.format = function(html) {
  return goog.format.HtmlPrettyPrinter.getInstance_().format(html);
};


/**
 * List of patterns used to tokenize HTML for pretty printing. Cache
 * subexpression for tag name.
 * comment|meta-tag|tag|text|other-less-than-characters
 * @private {!RegExp}
 * @const
 */
goog.format.HtmlPrettyPrinter.TOKEN_REGEX_ =
    /(?:<!--.*?-->|<!.*?>|<(\/?)(\w+)[^<>]*>|[^<]+|<)/g;


/**
 * Tags whose contents we don't want pretty printed.
 * @private {!Object}
 * @const
 */
goog.format.HtmlPrettyPrinter.NON_PRETTY_PRINTED_TAGS_ = goog.object.createSet(
    goog.dom.TagName.SCRIPT, goog.dom.TagName.STYLE, goog.dom.TagName.PRE,
    'XMP');


/**
 * 'Block' tags. We should add newlines before and after these tags during
 * pretty printing. Tags drawn mostly from HTML4 definitions for block and other
 * non-online tags, excepting the ones in
 * #goog.format.HtmlPrettyPrinter.NON_PRETTY_PRINTED_TAGS_.
 * @private {!Object}
 * @const
 */
goog.format.HtmlPrettyPrinter.BLOCK_TAGS_ = goog.object.createSet(
    goog.dom.TagName.ADDRESS, goog.dom.TagName.APPLET, goog.dom.TagName.AREA,
    goog.dom.TagName.BASE, goog.dom.TagName.BASEFONT,
    goog.dom.TagName.BLOCKQUOTE, goog.dom.TagName.BODY,
    goog.dom.TagName.CAPTION, goog.dom.TagName.CENTER, goog.dom.TagName.COL,
    goog.dom.TagName.COLGROUP, goog.dom.TagName.DIR, goog.dom.TagName.DIV,
    goog.dom.TagName.DL, goog.dom.TagName.FIELDSET, goog.dom.TagName.FORM,
    goog.dom.TagName.FRAME, goog.dom.TagName.FRAMESET, goog.dom.TagName.H1,
    goog.dom.TagName.H2, goog.dom.TagName.H3, goog.dom.TagName.H4,
    goog.dom.TagName.H5, goog.dom.TagName.H6, goog.dom.TagName.HEAD,
    goog.dom.TagName.HR, goog.dom.TagName.HTML, goog.dom.TagName.IFRAME,
    goog.dom.TagName.ISINDEX, goog.dom.TagName.LEGEND, goog.dom.TagName.LINK,
    goog.dom.TagName.MENU, goog.dom.TagName.META, goog.dom.TagName.NOFRAMES,
    goog.dom.TagName.NOSCRIPT, goog.dom.TagName.OL, goog.dom.TagName.OPTGROUP,
    goog.dom.TagName.OPTION, goog.dom.TagName.P, goog.dom.TagName.PARAM,
    goog.dom.TagName.TABLE, goog.dom.TagName.TBODY, goog.dom.TagName.TD,
    goog.dom.TagName.TFOOT, goog.dom.TagName.TH, goog.dom.TagName.THEAD,
    goog.dom.TagName.TITLE, goog.dom.TagName.TR, goog.dom.TagName.UL);


/**
 * Non-block tags that break flow. We insert a line break after, but not before
 * these. Tags drawn from HTML4 definitions.
 * @private {!Object}
 * @const
 */
goog.format.HtmlPrettyPrinter.BREAKS_FLOW_TAGS_ = goog.object.createSet(
    goog.dom.TagName.BR, goog.dom.TagName.DD, goog.dom.TagName.DT,
    goog.dom.TagName.LI, goog.dom.TagName.NOFRAMES);


/**
 * Empty tags. These are treated as both start and end tags.
 * @private {!Object}
 * @const
 */
goog.format.HtmlPrettyPrinter.EMPTY_TAGS_ = goog.object.createSet(
    goog.dom.TagName.BR, goog.dom.TagName.HR, goog.dom.TagName.ISINDEX);


/**
 * Breaks up HTML so it's easily readable by the user.
 * @param {string} html The HTML text to pretty print.
 * @return {string} Formatted result.
 * @throws {Error} Regex error, data loss, or endless loop detected.
 */
goog.format.HtmlPrettyPrinter.prototype.format = function(html) {
  // Trim leading whitespace, but preserve first indent; in other words, keep
  // any spaces immediately before the first non-whitespace character (that's
  // what $1 is), but remove all other leading whitespace. This adjustment
  // historically had been made in Docs. The motivation is that some
  // browsers prepend several line breaks in designMode.
  html = html.replace(/^\s*?( *\S)/, '$1');

  // Trim trailing whitespace.
  html = html.replace(/\s+$/, '');

  // Keep track of how much time we've used.
  var timeOutMillis = this.timeOutMillis_;
  var startMillis = timeOutMillis ? goog.now() : 0;

  // Handles concatenation of the result and required line breaks.
  var buffer = new goog.format.HtmlPrettyPrinter.Buffer();

  // Declare these for efficiency since we access them in a loop.
  var tokenRegex = goog.format.HtmlPrettyPrinter.TOKEN_REGEX_;
  var nonPpTags = goog.format.HtmlPrettyPrinter.NON_PRETTY_PRINTED_TAGS_;
  var blockTags = goog.format.HtmlPrettyPrinter.BLOCK_TAGS_;
  var breaksFlowTags = goog.format.HtmlPrettyPrinter.BREAKS_FLOW_TAGS_;
  var emptyTags = goog.format.HtmlPrettyPrinter.EMPTY_TAGS_;

  // Used to verify we're making progress through our regex tokenization.
  var lastIndex = 0;

  // Use this to track non-pretty-printed tags and children.
  var nonPpTagStack = [];

  // Loop through each matched token.
  var match;
  while (match = tokenRegex.exec(html)) {
    // Get token.
    var token = match[0];

    // Is this token a tag? match.length == 3 for tags, 1 for all others.
    if (match.length == 3) {
      var tagName = match[2];
      if (tagName) {
        tagName = tagName.toUpperCase();
      }

      // Non-pretty-printed tags?
      if (nonPpTags.hasOwnProperty(tagName)) {
        // End tag?
        if (match[1] == '/') {
          // Do we have a matching start tag?
          var stackSize = nonPpTagStack.length;
          var startTagName = stackSize ? nonPpTagStack[stackSize - 1] : null;
          if (startTagName == tagName) {
            // End of non-pretty-printed block. Line break after.
            nonPpTagStack.pop();
            buffer.pushToken(false, token, !nonPpTagStack.length);
          } else {
            // Malformed HTML. No line breaks.
            buffer.pushToken(false, token, false);
          }
        } else {
          // Start of non-pretty-printed block. Line break before.
          buffer.pushToken(!nonPpTagStack.length, token, false);
          nonPpTagStack.push(tagName);
        }
      } else if (nonPpTagStack.length) {
        // Inside non-pretty-printed block, no new line breaks.
        buffer.pushToken(false, token, false);
      } else if (blockTags.hasOwnProperty(tagName)) {
        // Put line break before start block and after end block tags.
        var isEmpty = emptyTags.hasOwnProperty(tagName);
        var isEndTag = match[1] == '/';
        buffer.pushToken(isEmpty || !isEndTag, token, isEmpty || isEndTag);
      } else if (breaksFlowTags.hasOwnProperty(tagName)) {
        var isEmpty = emptyTags.hasOwnProperty(tagName);
        var isEndTag = match[1] == '/';
        // Put line break after end flow-breaking tags.
        buffer.pushToken(false, token, isEndTag || isEmpty);
      } else {
        // All other tags, no line break.
        buffer.pushToken(false, token, false);
      }
    } else {
      // Non-tags, no line break.
      buffer.pushToken(false, token, false);
    }

    // Double check that we're making progress.
    var newLastIndex = tokenRegex.lastIndex;
    if (!token || newLastIndex <= lastIndex) {
      throw Error('Regex failed to make progress through source html.');
    }
    lastIndex = newLastIndex;

    // Out of time?
    if (timeOutMillis) {
      if (goog.now() - startMillis > timeOutMillis) {
        // Push unprocessed data as one big token and reset regex object.
        buffer.pushToken(false, html.substring(tokenRegex.lastIndex), false);
        tokenRegex.lastIndex = 0;
        break;
      }
    }
  }

  // Ensure we end in a line break.
  buffer.lineBreak();

  // Construct result string.
  var result = String(buffer);

  // Length should be original length plus # line breaks added.
  var expectedLength = html.length + buffer.breakCount;
  if (result.length != expectedLength) {
    throw Error('Lost data pretty printing html.');
  }

  return result;
};



/**
 * This class is a buffer to which we push our output. It tracks line breaks to
 * make sure we don't add unnecessary ones.
 * @constructor
 * @final
 */
goog.format.HtmlPrettyPrinter.Buffer = function() {
  /**
   * Tokens to be output in #toString.
   * @type {goog.string.StringBuffer}
   * @private
   */
  this.out_ = new goog.string.StringBuffer();
};


/**
 * Tracks number of line breaks added.
 * @type {number}
 */
goog.format.HtmlPrettyPrinter.Buffer.prototype.breakCount = 0;


/**
 * Tracks if we are at the start of a new line.
 * @type {boolean}
 * @private
 */
goog.format.HtmlPrettyPrinter.Buffer.prototype.isBeginningOfNewLine_ = true;


/**
 * Tracks if we need a new line before the next token.
 * @type {boolean}
 * @private
 */
goog.format.HtmlPrettyPrinter.Buffer.prototype.needsNewLine_ = false;


/**
 * Adds token and necessary line breaks to output buffer.
 * @param {boolean} breakBefore If true, add line break before token if
 *     necessary.
 * @param {string} token Token to push.
 * @param {boolean} breakAfter If true, add line break after token if
 *     necessary.
 */
goog.format.HtmlPrettyPrinter.Buffer.prototype.pushToken = function(
    breakBefore, token, breakAfter) {
  // If this token needs a preceding line break, and
  // we haven't already added a line break, and
  // this token does not start with a line break,
  // then add line break.
  // Due to FF3.0 bug with lists, we don't insert a /n
  // right before </ul>. See bug 1520665.
  if ((this.needsNewLine_ || breakBefore) && !/^\r?\n/.test(token) &&
      !/\/ul/i.test(token)) {
    this.lineBreak();
  }

  // Token.
  this.out_.append(token);

  // Remember if this string ended with a line break so we know we don't have to
  // insert another one before the next token.
  this.isBeginningOfNewLine_ = /\r?\n$/.test(token);

  // Remember if this token requires a line break after it. We don't insert it
  // here because we might not have to if the next token starts with a line
  // break.
  this.needsNewLine_ = breakAfter && !this.isBeginningOfNewLine_;
};


/**
 * Append line break if we need one.
 */
goog.format.HtmlPrettyPrinter.Buffer.prototype.lineBreak = function() {
  if (!this.isBeginningOfNewLine_) {
    this.out_.append('\n');
    ++this.breakCount;
  }
};


/**
 * @return {string} String representation of tokens.
 * @override
 */
goog.format.HtmlPrettyPrinter.Buffer.prototype.toString = function() {
  return this.out_.toString();
};
