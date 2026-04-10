/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */


goog.module('goog.html.SafeHtmlFormatter');
goog.module.declareLegacyNamespace();

const SafeHtml = goog.require('goog.html.SafeHtml');
const {ENABLE_ASSERTS, assert} = goog.require('goog.asserts');
const {getRandomString, htmlEscape} = goog.require('goog.string');
const {isVoidTag} = goog.require('goog.dom.tags');

/**
 * Formatter producing SafeHtml from a plain text format and HTML fragments.
 * Example usage:
 * var formatter = new SafeHtmlFormatter();
 * var safeHtml = formatter.format(
 *     formatter.startTag('b') +
 *     'User input:' +
 *     formatter.endTag('b') +
 *     ' ' +
 *     formatter.text(userInput));
 * The most common usage is with goog.getMsg:
 * var MSG_USER_INPUT = goog.getMsg(
 *     '{$startLink}Learn more{$endLink} about {$userInput}', {
 *       'startLink': formatter.startTag('a', {'href': url}),
 *       'endLink': formatter.endTag('a'),
 *       'userInput': formatter.text(userInput)
 *     });
 * var safeHtml = formatter.format(MSG_USER_INPUT);
 * The formatting string should be constant with all variables processed by
 * formatter.text().
 * @final
 */
class SafeHtmlFormatter {
  constructor() {
    /**
     * Mapping from a marker to a replacement.
     * @private {!Object<string, !SafeHtmlFormatter.Replacement>}
     */
    this.replacements_ = {};

    /** @private {number} Number of stored replacements. */
    this.replacementsCount_ = 0;
  }

  /**
   * Formats a plain text string with markers holding HTML fragments to
   * SafeHtml.
   * @param {string} format Plain text format, will be HTML-escaped.
   * @return {!SafeHtml}
   */
  format(format) {
    const openedTags = [];
    const marker = htmlEscape(MARKER);
    const html = htmlEscape(format).replace(
        new RegExp(`\\{${marker}[\\w&#;]+\\}`, 'g'),
        goog.bind(this.replaceFormattingString_, this, openedTags));
    assert(
        openedTags.length == 0,
        'Expected no unclosed tags, got <' + openedTags.join('>, <') + '>.');
    return SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(html);
  }

  /**
   * Replaces found formatting strings with saved tags.
   * @param {!Array<string>} openedTags The tags opened so far, modified by this
   *     function.
   * @param {string} match
   * @return {string}
   * @private
   */
  replaceFormattingString_(openedTags, match) {
    const replacement = this.replacements_[match];
    if (!replacement) {
      // Someone included a string looking like our internal marker in the
      // format.
      return match;
    }
    let result = '';
    if (replacement.startTag) {
      result += '<' + replacement.startTag + replacement.attributes + '>';
      if (ENABLE_ASSERTS) {
        if (!isVoidTag(replacement.startTag.toLowerCase())) {
          openedTags.push(replacement.startTag.toLowerCase());
        }
      }
    }
    if (replacement.html) {
      result += replacement.html;
    }
    if (replacement.endTag) {
      result += '</' + replacement.endTag + '>';
      if (ENABLE_ASSERTS) {
        const lastTag = openedTags.pop();
        assert(
            lastTag == replacement.endTag.toLowerCase(),
            `Expected </${lastTag}>, got </` + replacement.endTag + '>.');
      }
    }
    return result;
  }

  /**
   * Saves a start tag and returns its marker.
   * @param {string} tagName
   * @param {?Object<string, ?SafeHtml.AttributeValue>=} attributes
   *     Mapping from attribute names to their values. Only attribute names
   *     consisting of [a-zA-Z0-9-] are allowed. Value of null or undefined
   * causes the attribute to be omitted.
   * @return {string} Marker.
   * @throws {!Error} If invalid tag name, attribute name, or attribute value is
   *     provided. This function accepts the same tags and attributes as
   *     {@link SafeHtml.create}.
   */
  startTag(tagName, attributes = undefined) {
    SafeHtml.verifyTagName(tagName);
    return this.storeReplacement_({
      startTag: tagName,
      attributes: SafeHtml.stringifyAttributes(tagName, attributes),
    });
  }

  /**
   * Saves an end tag and returns its marker.
   * @param {string} tagName
   * @return {string} Marker.
   * @throws {!Error} If invalid tag name, attribute name, or attribute value is
   *     provided. This function accepts the same tags as {@link
   *     SafeHtml.create}.
   */
  endTag(tagName) {
    SafeHtml.verifyTagName(tagName);
    return this.storeReplacement_({endTag: tagName});
  }

  /**
   * Escapes a text, saves it and returns its marker.
   *
   * Wrapping any user input to .text() prevents the attacker with access to
   * the random number generator to duplicate tags used elsewhere in the format.
   *
   * @param {string} text
   * @return {string} Marker.
   */
  text(text) {
    return this.storeReplacement_({html: htmlEscape(text)});
  }

  /**
   * Saves SafeHtml and returns its marker.
   * @param {!SafeHtml} safeHtml
   * @return {string} Marker.
   */
  safeHtml(safeHtml) {
    return this.storeReplacement_({
      html: SafeHtml.unwrap(safeHtml),
    });
  }

  /**
   * Stores a replacement and returns its marker.
   * @param {!SafeHtmlFormatter.Replacement} replacement
   * @return {string} Marker.
   * @private
   */
  storeReplacement_(replacement) {
    this.replacementsCount_++;
    const marker =
        `{${MARKER}` + this.replacementsCount_ + '_' + getRandomString() + '}';
    this.replacements_[htmlEscape(marker)] = replacement;
    return marker;
  }
}


/**
 * @typedef {?{
 *   startTag: (string|undefined),
 *   attributes: (string|undefined),
 *   endTag: (string|undefined),
 *   html: (string|undefined)
 * }}
 */
SafeHtmlFormatter.Replacement;


/** @const {string} Marker used for replacements. */
const MARKER = 'SafeHtmlFormatter:';


exports = SafeHtmlFormatter;
