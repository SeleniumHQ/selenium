/**
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview Text handling methods.
 */

goog.provide('core.text');


goog.require('bot.dom');
goog.require('bot.userAgent');
goog.require('core.locators');
goog.require('core.patternMatcher');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.string');
goog.require('goog.userAgent');



/**
 * Attempt to normalize the text content of an element.
 *
 * @param {!Node} element The element to use.
 * @param {boolean} preformatted Whether the text is preformatted or not.
 * @return {string} The text content of the element.
 * @private
 */
core.text.getTextContent_ = function(element, preformatted) {
  if (element.style && (element.style.visibility == 'hidden'
      || element.style.display == 'none')) {
    return '';
  }

  var text;

  if (element.nodeType == goog.dom.NodeType.TEXT) {
    text = element.data;
    if (!preformatted) {
      text = text.replace(/\n|\r|\t/g, ' ');
    }
    return text.replace(/&nbsp/, ' ');
  }
  if (element.nodeType == goog.dom.NodeType.ELEMENT && element.nodeName != 'SCRIPT') {
    var childrenPreformatted = preformatted || (element.tagName == 'PRE');
    text = '';
    for (var i = 0; i < element.childNodes.length; i++) {
      var child = element.childNodes.item(i);
      if (!child) {
        continue;
      }
      text += core.text.getTextContent_(child, childrenPreformatted);
    }
    // Handle block elements that introduce newlines
    // -- From HTML spec:
    //<!ENTITY % block
    //     "P | %heading; | %list; | %preformatted; | DL | DIV | NOSCRIPT |
    //      BLOCKQUOTE | F:wORM | HR | TABLE | FIELDSET | ADDRESS">
    //
    // TODO: should potentially introduce multiple newlines to separate blocks
    if (element.tagName == 'P' || element.tagName == 'BR' ||
        element.tagName == 'HR' || element.tagName == 'DIV') {
      text += '\n';
    }
    text = text.replace(/&nbsp/, ' ');
    if (bot.userAgent.IE && bot.userAgent.isProductVersion(9)) {
      text = text.replace(/&#100;/, ' ');
    }
    return text;
  }
  return '';
};


/**
 * Convert all newlines to \n. A newline is defined as being one of the common
 * line endings for Mac, Windows or UNIX.
 *
 * @param {string} text The text to normalize.
 * @return {string} The converted text, with all line endings replaced with '\n'.
 * @private
 */
core.text.normalizeNewlines_ = function(text) {
  return text.replace(/\r\n|\r/g, '\n');
};


/**
 * @param {string} text The text to perform the replacement on.
 * @param {string} oldText The string to replace.
 * @param {string} newText The replacement text.
 * @return 'text' with all occurances of 'oldText' replaced by 'newText'.
 * @private
 */
core.text.replaceAll_ = function(text, oldText, newText) {
  while (text.indexOf(oldText) != -1) {
    text = text.replace(oldText, newText);
  }
  return text;
};


/**
 * Replace multiple sequential spaces with a single space, and then convert
 * &nbsp; to space.
 *
 * @param {string} text The text to normalize.
 * @return {string} The normalized text.
 * @private
 */
core.text.normalizeSpaces_ = function(text) {
  // Replace multiple spaces with a single space
  // TODO - this shouldn't occur inside PRE elements
  text = text.replace(/\ +/g, ' ');

  // Replace &nbsp; with a space
  var nbspPattern = new RegExp(String.fromCharCode(160), 'g');
  if (goog.userAgent.SAFARI) {
    return core.text.replaceAll_(text, String.fromCharCode(160), ' ');
  } else {
    return text.replace(nbspPattern, ' ');
  }
};


/**
 * Locate an element and return it's text content.
 *
 * @param {string|!Element} locator The element locator.
 * @return {string} The text content of the located element.
 */
core.text.getText = function(locator) {
  var element = core.locators.findElement(locator);

  var text = '';
  var isRecentFirefox =
      (goog.userAgent.GECKO && goog.userAgent.VERSION >= '1.8');

  if (isRecentFirefox ||
      goog.userAgent.SAFARI || goog.userAgent.OPERA || goog.userAgent.IE) {
    text = core.text.getTextContent_(element, false);
  } else {
    if (element.textContent) {
      text = element.textContent;
    } else {
      if (element.innerText) {
        text = element.innerText;
      }
    }
  }

  text = core.text.normalizeNewlines_(text);
  text = core.text.normalizeSpaces_(text);

  return goog.string.trim(text);
};

/**
 * @return {string} The entire text content of the page.
 */
core.text.getBodyText = function() {
  var doc = bot.getWindow().document;
  var body = doc.body;
  return !!body ? core.text.getText(body) : '';
};


/**
 * Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
 *
 * @param {string} pattern A <a href="#patterns">pattern</a> to match with the
 *    text of the page.
 * @return {boolean} Whether the pattern matches the text.
 */
core.text.isTextPresent = function(pattern) {
  var allText = core.text.getBodyText();

  var patternMatcher = core.patternMatcher.against(pattern);
  if (patternMatcher.strategyName == 'glob') {
    if (pattern.indexOf('glob:') == 0) {
      pattern = pattern.substring('glob:'.length); // strip off "glob:"
    }
    patternMatcher = core.patternMatcher.against('globContains:' + pattern);
  }
  return patternMatcher(allText);
};


core.text.linkLocator = function(locator, opt_doc) {
  var doc = opt_doc || goog.dom.getOwnerDocument(bot.getWindow());

  var links = doc.getElementsByTagName('a');

  for (var i = 0; i < links.length; i++) {
    var element = links[i];
    var text = core.text.getText(element);
    if (core.patternMatcher.matches(locator, text)) {
      return element;
    }
  }
  return null;
};
core.locators.addStrategy('link', core.text.linkLocator);
