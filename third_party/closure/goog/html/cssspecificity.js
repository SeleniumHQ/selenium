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

/** @fileoverview Calculator for specificity of CSS selectors. */

goog.module('goog.html.CssSpecificity');
goog.module.declareLegacyNamespace();

var userAgent = goog.require('goog.userAgent');
var userAgentProduct = goog.require('goog.userAgent.product');


/**
 * Cached mapping from selectors to specificities.
 * @type {!Object<string, !Array<number>>}
 */
var specificityCache = {};

/**
 * Calculates the specificity of CSS selectors, using a global cache if
 * supported.
 * @see http://www.w3.org/TR/css3-selectors/#specificity
 * @see https://specificity.keegan.st/
 * @param {string} selector The CSS selector.
 * @return {!Array<number>} The CSS specificity.
 * @supported IE9+, other browsers.
 */
function getSpecificity(selector) {
  if (userAgentProduct.IE && !userAgent.isVersionOrHigher(9)) {
    // IE8 has buggy regex support.
    return [0, 0, 0, 0];
  }
  var specificity = specificityCache.hasOwnProperty(selector) ?
      specificityCache[selector] :
      null;
  if (specificity) {
    return specificity;
  }
  if (Object.keys(specificityCache).length > (1 << 16)) {
    // Limit the size of cache to (1 << 16) == 65536. Normally HTML pages don't
    // have such numbers of selectors.
    specificityCache = {};
  }
  specificity = calculateSpecificity(selector);
  specificityCache[selector] = specificity;
  return specificity;
}

/**
 * Find matches for a regular expression in the selector and increase count.
 * @param {string} selector The selector to match the regex with.
 * @param {!Array<number>} specificity The current specificity.
 * @param {!RegExp} regex The regular expression.
 * @param {number} typeIndex Index of type count.
 * @return {string}
 */
function replaceWithEmptyText(selector, specificity, regex, typeIndex) {
  return selector.replace(regex, function(match) {
    specificity[typeIndex] += 1;
    // Replace this simple selector with whitespace so it won't be counted
    // in further simple selectors.
    return Array(match.length + 1).join(' ');
  });
}

/**
 * Replace escaped characters with plain text, using the "A" character.
 * @see https://www.w3.org/TR/CSS21/syndata.html#characters
 * @param {string} selector
 * @param {!RegExp} regex
 * @return {string}
 */
function replaceWithPlainText(selector, regex) {
  return selector.replace(regex, function(match) {
    return Array(match.length + 1).join('A');
  });
}

/**
 * Calculates the specificity of CSS selectors
 * @see http://www.w3.org/TR/css3-selectors/#specificity
 * @see https://github.com/keeganstreet/specificity
 * @see https://specificity.keegan.st/
 * @param {string} selector
 * @return {!Array<number>} The CSS specificity.
 */
function calculateSpecificity(selector) {
  var specificity = [0, 0, 0, 0];

  // Cannot use RegExp literals for all regular expressions, IE does not accept
  // the syntax.

  // Matches a backslash followed by six hexadecimal digits followed by an
  // optional single whitespace character.
  var escapeHexadecimalRegex = new RegExp('\\\\[0-9A-Fa-f]{6}\\s?', 'g');
  // Matches a backslash followed by fewer than six hexadecimal digits
  // followed by a mandatory single whitespace character.
  var escapeHexadecimalRegex2 = new RegExp('\\\\[0-9A-Fa-f]{1,5}\\s', 'g');
  // Matches a backslash followed by any character
  var escapeSpecialCharacter = /\\./g;
  selector = replaceWithPlainText(selector, escapeHexadecimalRegex);
  selector = replaceWithPlainText(selector, escapeHexadecimalRegex2);
  selector = replaceWithPlainText(selector, escapeSpecialCharacter);

  // Remove the negation pseudo-class (:not) but leave its argument because
  // specificity is calculated on its argument.
  var pseudoClassWithNotRegex = new RegExp(':not\\(([^\\)]*)\\)', 'g');
  selector = selector.replace(pseudoClassWithNotRegex, '     $1 ');

  // Remove anything after a left brace in case a user has pasted in a rule,
  // not just a selector.
  var rulesRegex = new RegExp('{[^]*', 'gm');
  selector = selector.replace(rulesRegex, '');

  // The following regular expressions assume that selectors matching the
  // preceding regular expressions have been removed.

  // SPECIFICITY 2: Counts attribute selectors.
  var attributeRegex = new RegExp('(\\[[^\\]]+\\])', 'g');
  selector = replaceWithEmptyText(selector, specificity, attributeRegex, 2);

  // SPECIFICITY 1: Counts ID selectors.
  var idRegex = new RegExp('(#[^\\#\\s\\+>~\\.\\[:]+)', 'g');
  selector = replaceWithEmptyText(selector, specificity, idRegex, 1);

  // SPECIFICITY 2: Counts class selectors.
  var classRegex = new RegExp('(\\.[^\\s\\+>~\\.\\[:]+)', 'g');
  selector = replaceWithEmptyText(selector, specificity, classRegex, 2);

  // SPECIFICITY 3: Counts pseudo-element selectors.
  var pseudoElementRegex =
      /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi;
  selector = replaceWithEmptyText(selector, specificity, pseudoElementRegex, 3);

  // SPECIFICITY 2: Counts pseudo-class selectors.
  // A regex for pseudo classes with brackets. For example:
  //   :nth-child()
  //   :nth-last-child()
  //   :nth-of-type()
  //   :nth-last-type()
  //   :lang()
  var pseudoClassWithBracketsRegex = /(:[\w-]+\([^\)]*\))/gi;
  selector = replaceWithEmptyText(
      selector, specificity, pseudoClassWithBracketsRegex, 2);
  // A regex for other pseudo classes, which don't have brackets.
  var pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g;
  selector = replaceWithEmptyText(selector, specificity, pseudoClassRegex, 2);

  // Remove universal selector and separator characters.
  selector = selector.replace(/[\*\s\+>~]/g, ' ');

  // Remove any stray dots or hashes which aren't attached to words.
  // These may be present if the user is live-editing this selector.
  selector = selector.replace(/[#\.]/g, ' ');

  // SPECIFICITY 3: The only things left should be element selectors.
  var elementRegex = /([^\s\+>~\.\[:]+)/g;
  selector = replaceWithEmptyText(selector, specificity, elementRegex, 3);

  return specificity;
}

exports = {
  getSpecificity: getSpecificity
};
