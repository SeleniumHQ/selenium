/** @license
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
 * @fileoverview The selenium element locators.
 */

goog.provide('core.locators');


goog.require('core.Error');
goog.require('core.LocatorStrategies');



/**
 * Parses a Selenium locator, returning its type and the unprefixed locator
 * string as an object.
 *
 * @param {!string} locator The locator to parse.
 * @private
 */
core.locators.parseLocator_ = function(locator) {
  var result = locator.match(/^([A-Za-z]+)=(.+)/);

  var toReturn = {};
  if (result) {
    toReturn['type'] = result[1].toLowerCase();
    toReturn['string'] = result[2];
  } else {
    toReturn['type'] = 'implicit';
    toReturn['string'] = locator;
  }
  return toReturn
};


/**
 * Find a locator based on a prefix.
 *
 * @private
 */
core.locators.findElementBy_ = function(locatorType, locator, inDocument, inWindow) {
  var locatorFunction = core.LocatorStrategies[locatorType];
  if (! locatorFunction) {
    throw new core.Error("Unrecognised locator type: '" + locatorType + "'");
  }
  return locatorFunction.call(this, locator, inDocument, inWindow);
};


/*
 * Finds an element recursively in frames and nested frames
 * in the specified document, using various lookup protocols.
 *
 * @private
 */
core.locators.findElementRecursive_ = function(locatorType, locatorString, inDocument, inWindow) {
  var element = core.locators.findElementBy_(locatorType, locatorString, inDocument, inWindow);
  if (element != null) {
    return element;
  }

  for (var i = 0; i < inWindow.frames.length; i++) {
    // On some browsers, the document object is undefined for third-party
    // frames.  Make sure the document is valid before continuing.
    if (inWindow.frames[i].document) {
      element = core.locators.findElementRecursive_(locatorType, locatorString, inWindow.frames[i].document, inWindow.frames[i]);

      if (element != null) {
        return element;
      }
    }
  }
};

/*
 * Finds an element on the current page, using various lookup protocols.
 *
 * @param {!string} locator The locator to use.
 * @param {Window} opt_win The optional window to base the search from.
 * @return {Element} The located element, or null if nothing is found.
 * @private
 */
core.locators.findElementOrNull_ = function(locator, opt_win) {
  locator = core.locators.parseLocator_(locator);

  var win = opt_win || bot.window_;
  var element = core.locators.findElementRecursive_(locator.type, locator.string, win.document, win);

  if (element != null) {
    return element;
  }

  // Element was not found by any locator function.
  return null;
};


/**
 * Find an element. The locator used is a selenium locator, that is, one that
 * may include a leading type identifier, such as "id=". If no type identifier
 * is given, a "best guess" is made. If the locator starts with "//" it is
 * assumed to be xpath, otherwise it is assumed to be either a name or an id.
 *
 * @param {!string} locator The selenium locator to use.
 * @param {Window} opt_win The optional window to start the search from.
 * @return {!Element} The located element.
 * @throws {core.Error} If no element can be located.
 */
core.locators.findElement = function(locator, opt_win) {
  var win = opt_win || bot.window_;
  var element = core.locators.findElementOrNull_(locator, win);
  if (element == null) {
    throw new core.Error("Element " + locator + " not found");
  }
  return element;
};
