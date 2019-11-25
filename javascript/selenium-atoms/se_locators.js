// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview The selenium element locators.
 */

goog.provide('core.locators');
goog.provide('core.locators.Locator');


goog.require('core.Error');
goog.require('core.LocatorStrategies');
goog.require('goog.dom.NodeType');
goog.require('goog.string');



/**
 * @typedef {{type: string, string: string}}
 */
core.locators.Locator;

/**
 * Parses a Selenium locator, returning its type and the unprefixed locator
 * string as an object.
 *
 * @param {string} locator The locator to parse.
 * @return {!core.locators.Locator} The parsed locator.
 * @private
 */
core.locators.parseLocator_ = function(locator) {
  var result = locator.match(/^([A-Za-z]+)=.+/);

  if (result) {
    var type = result[1].toLowerCase();
    var actualLocator = locator.substring(type.length + 1);
    return {
      'type': type,
      'string': actualLocator
    };
  }

  // The tyrant that is jsdoc demands homage.
  var /**@type{core.locators.Locator}*/ toReturn = {'string': '', 'type': ''};
  toReturn['string'] = locator;
  if (goog.string.startsWith(locator, ('//'))) {
    toReturn['type'] = 'xpath';
  } else if (goog.string.startsWith(locator, 'document.')) {
    toReturn['type'] = 'dom';
  } else {
    toReturn['type'] = 'identifier';
  }

  return toReturn;
};


/**
 * Add a locator strategy to those already known about.
 *
 * @param {string} name The name of the strategy.
 * @param {function(string, Document=):Element} strategy The strategy
 *   implementation.
 */
core.locators.addStrategy = function(name, strategy) {
  core.LocatorStrategies[name] = strategy;
};


/**
 * Find a locator based on a prefix.
 *
 * @param {string} locatorType The type of locator to use.
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to base the search from.
 * @return {Element} The located element or null.
 * @private
 */
core.locators.findElementBy_ = function(locatorType, locator, opt_doc) {
  var locatorFunction = core.LocatorStrategies[locatorType];
  if (!locatorFunction) {
    throw new core.Error("Unrecognised locator type: '" + locatorType + "'");
  }
  return locatorFunction.call(null, locator, opt_doc);
};


/**
 * Finds an element recursively in frames and nested frames
 * in the specified document, using various lookup protocols.
 *
 * @param {string} locatorType The type of locator to use.
 * @param {string} locatorString The value of the locator to use.
 * @param {Document=} opt_doc The document to base the search from.
 * @param {Window=} opt_win The window to base the search from.
 * @return {Element} The located element or null.
 * @private
 */
core.locators.findElementRecursive_ = function(locatorType, locatorString,
        opt_doc, opt_win) {
  var element = core.locators.findElementBy_(
      locatorType, locatorString, opt_doc);
  if (element != null) {
    return element;
  }

  if (!opt_win) {
    return null;
  }

  for (var i = 0; i < opt_win.frames.length; i++) {
    // On some browsers, the document object is undefined for third-party
    // frames.  Make sure the document is valid before continuing.
    var childDocument;

    try {
      childDocument = opt_win.frames[i].document;
    } catch (e) {
      // Tried to go across domains. That's okay
    }

    if (childDocument) {
      element = core.locators.findElementRecursive_(
              locatorType, locatorString, childDocument, opt_win.frames[i]);

      if (element != null) {
        return element;
      }
    }
  }
  return null;
};

/**
 * Finds an element on the current page, using various lookup protocols.
 *
 * @param {string} locator The locator to use.
 * @param {Window=} opt_win The optional window to base the search from.
 * @return {Element} The located element, or null if nothing is found.
 */
core.locators.findElementOrNull = function(locator, opt_win) {
  var loc = core.locators.parseLocator_(locator);

  var win = opt_win || bot.getWindow();
  var element = core.locators.findElementRecursive_(
      loc['type'], loc['string'], win.document, win);

  return element;
};


/**
 * Find an element. The locator used is a selenium locator, that is, one that
 * may include a leading type identifier, such as "id=". If no type identifier
 * is given, a "best guess" is made. If the locator starts with "//" it is
 * assumed to be xpath, otherwise it is assumed to be either a name or an id.
 *
 * @param {string|!Element} locator The selenium locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @param {Window=} opt_win The optional window to start the search from.
 * @return {!Element} The located element.
 * @throws {core.Error} If no element can be located.
 */
core.locators.findElement = function(locator, opt_doc, opt_win) {
  // Fast path out
  if (!goog.isString(locator)) {
    return locator;
  }

  var win = opt_win || bot.getWindow();
  var element = core.locators.findElementOrNull(locator, win);
  if (element == null) {
    throw new core.Error('Element ' + locator + ' not found');
  }
  return element;
};


/**
 * @param {string} locator The selenium locator to use.
 * @return {boolean} Whether the element can be found on the DOM.
 */
core.locators.isElementPresent = function(locator) {
  return !!core.locators.findElementOrNull(locator);
};


/**
 * @param {!Element|!Document} element The element to base the search from.
 * @param {function(!Element):boolean} selector The selenium locator to use.
 * @return {Element} The first matching child element.
 */
core.locators.elementFindFirstMatchingChild = function(element, selector) {
  var childCount = element.childNodes.length;
  for (var i = 0; i < childCount; i++) {
    var child = element.childNodes[i];
    if (child.nodeType == goog.dom.NodeType.ELEMENT) {
      var childEl = /** @type {!Element} */ (child);
      if (selector(childEl)) {
        return childEl;
      }
      var result = core.locators.elementFindFirstMatchingChild(
          childEl, selector);
      if (result) {
        return result;
      }
    }
  }
  return null;
};
