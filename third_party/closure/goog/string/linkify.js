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
 * @fileoverview Utility function for linkifying text.
 * @author bolinfest@google.com (Michael Bolin)
 */

goog.provide('goog.string.linkify');

goog.require('goog.string');


/**
 * Takes a string of plain text and linkifies URLs and email addresses. For a
 * URL (unless opt_attributes is specified), the target of the link will be
 * _blank and it will have a rel=nofollow attribute applied to it so that links
 * created by linkify will not be of interest to search engines.
 * @param {string} text Plain text.
 * @param {Object.<string, string>=} opt_attributes Attributes to add to all
 *      links created. Default are rel=nofollow and target=_blank. To clear
 *      those default attributes set rel='' and target=''.
 * @return {string} HTML Linkified HTML text. Any text that is not part of a
 *      link will be HTML-escaped.
 */
goog.string.linkify.linkifyPlainText = function(text, opt_attributes) {
  // This shortcut makes linkifyPlainText ~10x faster if text doesn't contain
  // URLs or email addresses and adds insignificant performance penalty if it
  // does.
  if (text.indexOf('@') == -1 &&
      text.indexOf('://') == -1 &&
      text.indexOf('www.') == -1 &&
      text.indexOf('Www.') == -1 &&
      text.indexOf('WWW.') == -1) {
    return goog.string.htmlEscape(text);
  }

  var attributesMap = opt_attributes || {};
  // Set default options.
  if (!('rel' in attributesMap)) {
    attributesMap['rel'] = 'nofollow';
  }
  if (!('target' in attributesMap)) {
    attributesMap['target'] = '_blank';
  }
  // Creates attributes string from options.
  var attributesArray = [];
  for (var key in attributesMap) {
    if (attributesMap.hasOwnProperty(key) && attributesMap[key]) {
      attributesArray.push(
          goog.string.htmlEscape(key), '="',
          goog.string.htmlEscape(attributesMap[key]), '" ');
    }
  }
  var attributes = attributesArray.join('');

  return text.replace(
      goog.string.linkify.FIND_LINKS_RE_,
      function(part, before, original, email, protocol) {
        var output = [goog.string.htmlEscape(before)];
        if (!original) {
          return output[0];
        }
        output.push('<a ', attributes, 'href="');
        /** @type {string} */
        var linkText;
        /** @type {string} */
        var afterLink;
        if (email) {
          output.push('mailto:');
          linkText = email;
          afterLink = '';
        } else {
          // This is a full url link.
          if (!protocol) {
            output.push('http://');
          }
          var splitEndingPunctuation =
              original.match(goog.string.linkify.ENDS_WITH_PUNCTUATION_RE_);
          // An open paren in the link will often be matched with a close paren
          // at the end, so skip cutting off ending punctuation if there's an
          // open paren. For example:
          // http://en.wikipedia.org/wiki/Titanic_(1997_film)
          if (splitEndingPunctuation && !goog.string.contains(original, '(')) {
            linkText = splitEndingPunctuation[1];
            afterLink = splitEndingPunctuation[2];
          } else {
            linkText = original;
            afterLink = '';
          }
        }
        linkText = goog.string.htmlEscape(linkText);
        afterLink = goog.string.htmlEscape(afterLink);
        output.push(linkText, '">', linkText, '</a>', afterLink);
        return output.join('');
      });
};


/**
 * Gets the first URI in text.
 * @param {string} text Plain text.
 * @return {string} The first URL, or an empty string if not found.
 */
goog.string.linkify.findFirstUrl = function(text) {
  var link = text.match(goog.string.linkify.URL_);
  return link != null ? link[0] : '';
};


/**
 * Gets the first email address in text.
 * @param {string} text Plain text.
 * @return {string} The first email address, or an empty string if not found.
 */
goog.string.linkify.findFirstEmail = function(text) {
  var email = text.match(goog.string.linkify.EMAIL_);
  return email != null ? email[0] : '';
};


/**
 * If a series of these characters is at the end of a url, it will be considered
 * punctuation and not part of the url.
 * @type {string}
 * @const
 * @private
 */
goog.string.linkify.ENDING_PUNCTUATION_CHARS_ = ':;,\\.?>\\]\\)!';


/**
 * @type {!RegExp}
 * @const
 * @private
 */
goog.string.linkify.ENDS_WITH_PUNCTUATION_RE_ = new RegExp(
    '^(.*?)([' + goog.string.linkify.ENDING_PUNCTUATION_CHARS_ + ']+)$');


/**
 * Set of characters to be put into a regex character set ("[...]"), used to
 * match against a url hostname and everything after it. It includes
 * "#-@", which represents the characters "#$%&'()*+,-./0123456789:;<=>?@".
 * @type {string}
 * @const
 * @private
 */
goog.string.linkify.ACCEPTABLE_URL_CHARS_ = '\\w~#-@!\\[\\]';


/**
 * List of all protocols patterns recognized in urls (mailto is handled in email
 * matching).
 * @type {!Array.<string>}
 * @const
 * @private
 */
goog.string.linkify.RECOGNIZED_PROTOCOLS_ = ['https?', 'ftp'];


/**
 * Regular expression pattern that matches the beginning of an url.
 * Contains a catching group to capture the scheme.
 * @type {string}
 * @const
 * @private
 */
goog.string.linkify.PROTOCOL_START_ =
    '(' + goog.string.linkify.RECOGNIZED_PROTOCOLS_.join('|') + ')://';


/**
 * Regular expression pattern that matches the beginning of a typical
 * http url without the http:// scheme.
 * @type {string}
 * @const
 * @private
 */
goog.string.linkify.WWW_START_ = 'www\\.';


/**
 * Regular expression pattern that matches an url.
 * @type {string}
 * @const
 * @private
 */
goog.string.linkify.URL_ =
    '(?:' + goog.string.linkify.PROTOCOL_START_ + '|' +
    goog.string.linkify.WWW_START_ + ')\\w[' +
    goog.string.linkify.ACCEPTABLE_URL_CHARS_ + ']*';


/**
 * Regular expression pattern that matches a top level domain.
 * @type {string}
 * @const
 * @private
 */
goog.string.linkify.TOP_LEVEL_DOMAIN_ =
    '(?:com|org|net|edu|gov' +
    // from http://www.iana.org/gtld/gtld.htm
    '|aero|biz|cat|coop|info|int|jobs|mobi|museum|name|pro|travel' +
    '|arpa|asia|xxx' +
    // a two letter country code
    '|[a-z][a-z])\\b';


/**
 * Regular expression pattern that matches an email.
 * Contains a catching group to capture the email without the optional "mailto:"
 * prefix.
 * @type {string}
 * @const
 * @private
 */
goog.string.linkify.EMAIL_ =
    '(?:mailto:)?([\\w.+-]+@[A-Za-z0-9.-]+\\.' +
    goog.string.linkify.TOP_LEVEL_DOMAIN_ + ')';


/**
 * Regular expression to match all the links (url or email) in a string.
 * First match is text before first link, might be empty string.
 * Second match is the original text that should be replaced by a link.
 * Third match is the email address in the case of an email.
 * Fourth match is the scheme of the url if specified.
 * @type {!RegExp}
 * @const
 * @private
 */
goog.string.linkify.FIND_LINKS_RE_ = new RegExp(
    // Match everything including newlines.
    '([\\S\\s]*?)(' +
    // Match email after a word break.
    '\\b' + goog.string.linkify.EMAIL_ + '|' +
    // Match url after a workd break.
    '\\b' + goog.string.linkify.URL_ + '|$)',
    'gi');

