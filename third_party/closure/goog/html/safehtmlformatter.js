// Copyright 2016 The Closure Library Authors. All Rights Reserved.
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


goog.provide('goog.html.SafeHtmlFormatter');

goog.require('goog.asserts');
goog.require('goog.dom.tags');
goog.require('goog.html.SafeHtml');
goog.require('goog.string');



/**
 * Formatter producing SafeHtml from a plain text format and HTML fragments.
 *
 * Example usage:
 *
 * var formatter = new goog.html.SafeHtmlFormatter();
 * var safeHtml = formatter.format(
 *     formatter.startTag('b') +
 *     'User input:' +
 *     formatter.endTag('b') +
 *     ' ' +
 *     formatter.text(userInput));
 *
 * The most common usage is with goog.getMsg:
 *
 * var MSG_USER_INPUT = goog.getMsg(
 *     '{$startLink}Learn more{$endLink} about {$userInput}', {
 *       'startLink': formatter.startTag('a', {'href': url}),
 *       'endLink': formatter.endTag('a'),
 *       'userInput': formatter.text(userInput)
 *     });
 * var safeHtml = formatter.format(MSG_USER_INPUT);
 *
 * The formatting string should be constant with all variables processed by
 * formatter.text().
 *
 * @constructor
 * @struct
 * @final
 */
goog.html.SafeHtmlFormatter = function() {
  /**
   * Mapping from a marker to a replacement.
   * @private {!Object<string, !goog.html.SafeHtmlFormatter.Replacement>}
   */
  this.replacements_ = {};

  /** @private {number} Number of stored replacements. */
  this.replacementsCount_ = 0;
};


/**
 * @typedef {?{
 *   startTag: (string|undefined),
 *   attributes: (string|undefined),
 *   endTag: (string|undefined),
 *   html: (string|undefined)
 * }}
 */
goog.html.SafeHtmlFormatter.Replacement;


/**
 * Formats a plain text string with markers holding HTML fragments to SafeHtml.
 * @param {string} format Plain text format, will be HTML-escaped.
 * @return {!goog.html.SafeHtml}
 */
goog.html.SafeHtmlFormatter.prototype.format = function(format) {
  var openedTags = [];
  var marker = goog.string.htmlEscape(goog.html.SafeHtmlFormatter.MARKER_);
  var html = goog.string.htmlEscape(format).replace(
      new RegExp('\\{' + marker + '[\\w&#;]+\\}', 'g'),
      goog.bind(this.replaceFormattingString_, this, openedTags));
  goog.asserts.assert(openedTags.length == 0,
      'Expected no unclosed tags, got <' + openedTags.join('>, <') + '>.');
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      html, null);
};


/**
 * Replaces found formatting strings with saved tags.
 * @param {!Array<string>} openedTags The tags opened so far, modified by this
 *     function.
 * @param {string} match
 * @return {string}
 * @private
 */
goog.html.SafeHtmlFormatter.prototype.replaceFormattingString_ =
    function(openedTags, match) {
  var replacement = this.replacements_[match];
  if (!replacement) {
    // Someone included a string looking like our internal marker in the format.
    return match;
  }
  var result = '';
  if (replacement.startTag) {
    result += '<' + replacement.startTag + replacement.attributes + '>';
    if (goog.asserts.ENABLE_ASSERTS) {
      if (!goog.dom.tags.isVoidTag(replacement.startTag.toLowerCase())) {
        openedTags.push(replacement.startTag.toLowerCase());
      }
    }
  }
  if (replacement.html) {
    result += replacement.html;
  }
  if (replacement.endTag) {
    result += '</' + replacement.endTag + '>';
    if (goog.asserts.ENABLE_ASSERTS) {
      var lastTag = openedTags.pop();
      goog.asserts.assert(lastTag == replacement.endTag.toLowerCase(),
          'Expected </' + lastTag + '>, got </' + replacement.endTag + '>.');
    }
  }
  return result;
};


/**
 * Saves a start tag and returns its marker.
 * @param {string} tagName
 * @param {?Object<string, ?goog.html.SafeHtml.AttributeValue>=} opt_attributes
 *     Mapping from attribute names to their values. Only attribute names
 *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined causes
 *     the attribute to be omitted.
 * @return {string} Marker.
 * @throws {Error} If invalid tag name, attribute name, or attribute value is
 *     provided. This function accepts the same tags and attributes as
 *     {@link goog.html.SafeHtml.create}.
 */
goog.html.SafeHtmlFormatter.prototype.startTag = function(
    tagName, opt_attributes) {
  goog.html.SafeHtml.verifyTagName(tagName);
  return this.storeReplacement_({
    startTag: tagName,
    attributes: goog.html.SafeHtml.stringifyAttributes(tagName, opt_attributes)
  });
};


/**
 * Saves an end tag and returns its marker.
 * @param {string} tagName
 * @return {string} Marker.
 * @throws {Error} If invalid tag name, attribute name, or attribute value is
 *     provided. This function accepts the same tags and attributes as
 *     {@link goog.html.SafeHtml.create}.
 */
goog.html.SafeHtmlFormatter.prototype.endTag = function(tagName) {
  goog.html.SafeHtml.verifyTagName(tagName);
  return this.storeReplacement_({endTag: tagName});
};


/**
 * Escapes a text, saves it and returns its marker.
 *
 * Wrapping any user input to .text() prevents the attacker with access to
 * the random number generator to duplicate tags used elsewhere in the format.
 *
 * @param {string} text
 * @return {string} Marker.
 */
goog.html.SafeHtmlFormatter.prototype.text = function(text) {
  return this.storeReplacement_({html: goog.string.htmlEscape(text)});
};


/**
 * Saves SafeHtml and returns its marker.
 * @param {!goog.html.SafeHtml} safeHtml
 * @return {string} Marker.
 */
goog.html.SafeHtmlFormatter.prototype.safeHtml = function(safeHtml) {
  return this.storeReplacement_({
    html: goog.html.SafeHtml.unwrap(safeHtml)
  });
};


/** @private @const {string} Marker used for replacements. */
goog.html.SafeHtmlFormatter.MARKER_ = 'SafeHtmlFormatter:';


/**
 * Stores a replacement and returns its marker.
 * @param {!goog.html.SafeHtmlFormatter.Replacement} replacement
 * @return {string} Marker.
 * @private
 */
goog.html.SafeHtmlFormatter.prototype.storeReplacement_ = function(
    replacement) {
  this.replacementsCount_++;
  var marker = '{' + goog.html.SafeHtmlFormatter.MARKER_ +
      this.replacementsCount_ + '_' + goog.string.getRandomString() + '}';
  this.replacements_[goog.string.htmlEscape(marker)] = replacement;
  return marker;
};
