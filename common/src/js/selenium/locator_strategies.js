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
 * @fileoverview The selenium element locators.
 */

goog.provide('core.LocatorStrategies');


goog.require('bot.locators');
goog.require('core.Error');
goog.require('core.filters');
goog.require('goog.string');



/**
 * The implicit locator, that is used when no prefix is supplied.
 *
 * @param {!string} locator The value of the locator to use.
 * @param {Document} opt_doc The document to start the search from.
 * @param {Window} opt_win The window to start the serch from.
 * @return {Element} The located element.
 */
core.LocatorStrategies['implicit'] = function(locator, opt_doc, opt_win) {
  if (goog.string.startsWith(locator, ('//'))) {
    return core.LocatorStrategies['xpath'](locator, opt_doc, opt_win);
  }
  if (goog.string.startsWith(locator, 'document.')) {
    return core.LocatorStrategies['dom'](locator, opt_doc, opt_win);
  }
  return core.LocatorStrategies['identifier'](locator, opt_doc, opt_win);
};


/**
 * Find an element by the value of the 'alt' attribute.
 *
 * @param {!string} locator The value of the locator to use.
 * @param {Document} opt_doc The document to start the search from.
 * @param {Window} opt_win The window to start the serch from.
 * @return {Element} The located element.
 */
core.LocatorStrategies['alt'] = function(locator, opt_doc, opt_win) {
  return core.locators.elementFindFirstMatchingChild(opt_doc,
      function(element) {
        return element.alt == locator;
      });
};


/**
 * Find an element by the value of the 'class' attribute.
 *
 * @param {!string} locator The value of the locator to use.
 * @param {Document} opt_doc The document to start the search from.
 * @param {Window} opt_win The window to start the serch from.
 * @return {Element} The located element.
 */
core.LocatorStrategies['class'] = function(locator, opt_doc, opt_win) {
  return core.locators.elementFindFirstMatchingChild(opt_doc,
      function(element) {
        return element.className == locator;
      });
};


/**
 * Find an element by evaluating a Javascript expression.
 *
 * @param {!string} locator The value of the locator to use.
 * @param {Document} opt_doc The document to start the search from.
 * @param {Window} opt_win The window to start the serch from.
 * @return {Element} The located element.
 */
core.LocatorStrategies['dom'] = function(locator, opt_doc, opt_win) {
  var element = null;
  try {
    element = eval(locator);
  } catch (e) {
    return null;
  }

  return element ? (/**@type{Element}*/ element) : null;
};

/**
 * Find an element using by the value of its "id" attribute.
 *
 * @param {!string} locator The value of the locator to use.
 * @param {Document} opt_doc The document to start the search from.
 * @param {Window} opt_win The window to start the serch from.
 * @return {Element} The located element.
 */
core.LocatorStrategies['id'] = function(locator, opt_doc, opt_win) {
  var selector = {};
  selector['id'] = locator;
  return bot.locators.findElement(selector, opt_doc);
};


/**
 * Find an element by the value of its "id" or "name" attribute.
 *
 * @param {!string} locator The value of the locator to use.
 * @param {Document} opt_doc The document to start the search from.
 * @param {Window} opt_win The window to start the serch from.
 * @return {Element} The located element.
 */
core.LocatorStrategies['identifier'] = function(locator, opt_doc, opt_win) {
  var idSelector = {};
  idSelector['id'] = locator;
  var nameSelector = {};
  nameSelector['name'] = locator;

  return bot.locators.findElement(idSelector, opt_doc) ||
         bot.locators.findElement(nameSelector, opt_doc);
};


/**
 * Find an element by the value of its "name" attribute.
 *
 * @param {!string} locator The value of the locator to use.
 * @param {Document} opt_doc The document to start the search from.
 * @param {Window} opt_win The window to start the serch from.
 * @return {Element} The located element.
 */
core.LocatorStrategies['name'] = function(locator, opt_doc, opt_win) {
  var dom = goog.dom.getDomHelper(opt_doc);
  // TODO(user): Remove next statement once Closure has been fixed to allow
  // a root argument of type Document to getElementsByTagNameAndClass.
  var root = /**@type{Element}*/ (opt_win.documentElement ?
    opt_win.documentElement : opt_doc);
  var elements = dom.getElementsByTagNameAndClass('*', null, root);

  var filters = locator.split(' ');
  filters[0] = 'name=' + filters[0];

  while (filters.length) {
    var filter = filters.shift();
    elements = core.filters.selectElements(filter, elements, 'value');
  }

  return elements.length > 0 ? elements[0] : null;
};


/**
 * Find an element using xpath.
 *
 * @param {!string} locator The value of the locator to use.
 * @param {Document} opt_doc The document to start the search from.
 * @param {Window} opt_win The window to start the serch from.
 * @return {Element} The located element.
 */
core.LocatorStrategies['xpath'] = function(locator, opt_doc, opt_win) {
  var selector = {};
  selector['xpath'] = locator;

  return bot.locators.findElement(selector, opt_doc);
};
