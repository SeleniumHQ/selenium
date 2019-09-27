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

goog.provide('core.LocatorStrategies');

goog.require('bot.inject.cache');
goog.require('bot.locators');
goog.require('core.filters');
goog.require('core.text');
goog.require('goog.dom');
goog.require('goog.string');



/**
 * The implicit locator, that is used when no prefix is supplied.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.implicit_ = function(locator, opt_doc) {
  if (goog.string.startsWith(locator, ('//'))) {
    return core.LocatorStrategies.xpath_(locator, opt_doc);
  }
  if (goog.string.startsWith(locator, 'document.')) {
    return core.LocatorStrategies.dom_(locator, opt_doc);
  }
  return core.LocatorStrategies.identifier_(locator, opt_doc);
};


/**
 * Find an element by the value of the 'alt' attribute.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.alt_ = function(locator, opt_doc) {
  var doc = opt_doc || goog.dom.getOwnerDocument(bot.getWindow());

  return core.locators.elementFindFirstMatchingChild(doc,
      function(element) {
        return element['alt'] == locator;
      });
};


/**
 * Find an element by the value of the 'class' attribute.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from..
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.class_ = function(locator, opt_doc) {
  var doc = opt_doc || goog.dom.getOwnerDocument(bot.getWindow());

  return core.locators.elementFindFirstMatchingChild(doc,
      function(element) {
        return element.className == locator;
      });
};


/**
 * Find an element by evaluating a Javascript expression.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.dom_ = function(locator, opt_doc) {
  var element = null;
  try {
    element = eval(locator);
  } catch (e) {
    return null;
  }

  return element ? /**@type{Element}*/ (element) : null;
};


/**
 * Find an element using by the value of its "id" attribute.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.id_ = function(locator, opt_doc) {
  return bot.locators.findElement({'id': locator}, opt_doc);
};


/**
 * Find an element by the value of its "id" or "name" attribute.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.identifier_ = function(locator, opt_doc) {
  return core.LocatorStrategies['id'](locator, opt_doc) ||
         core.LocatorStrategies['name'](locator, opt_doc);
};


/**
 * Find an element by the value of its "name" attribute.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.name_ = function(locator, opt_doc) {
  var doc = opt_doc || goog.dom.getOwnerDocument(bot.getWindow());
  var dom = goog.dom.getDomHelper(doc);

  var elements = goog.dom.getElementsByTagNameAndClass('*', null, doc);

  var filters = locator.split(' ');
  filters[0] = 'name=' + filters[0];

  while (filters.length) {
    var filter = filters.shift();
    elements = core.filters.selectElements(filter, elements, 'value');
  }

  return elements.length > 0 ? elements[0] : null;
};


/**
 * Find an element by the value of an opaque key.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.stored_ = function(locator, opt_doc) {
  try {
    return /** @type {!Element}*/ (bot.inject.cache.getElement(
        locator, opt_doc));
  } catch (e) {
    return null;
  }
};


/**
 * Find an element using xpath.
 *
 * @param {string} locator The value of the locator to use.
 * @param {Document=} opt_doc The document to start the search from.
 * @return {Element} The located element.
 * @private
 */
core.LocatorStrategies.xpath_ = function(locator, opt_doc) {
  var trailingSlash = goog.string.endsWith(locator, '/');
  var selector = {'xpath': locator};

  try {
    var element = bot.locators.findElement(selector, opt_doc);
    if (element || !trailingSlash) {
      return element;
    }
  } catch (e) {
    if (!trailingSlash) {
      throw e;
    }

    // The exception from the xpath engine *may* have been because of
    // the trailing slash. If there was a trailing slash, fall through.
  }

  selector = {'xpath': locator.substring(0, locator.length - 1)};
  return bot.locators.findElement(selector, opt_doc);
};


/**
 * Selenium Core location strategies.
 *
 * @const
 * @type {Object.<string, function(string):function(string, Document=):Element>}
 */
core.LocatorStrategies['alt'] = core.LocatorStrategies.alt_;
core.LocatorStrategies['class'] = core.LocatorStrategies.class_;
core.LocatorStrategies['dom'] = core.LocatorStrategies.dom_;
core.LocatorStrategies['id'] = core.LocatorStrategies.id_;
core.LocatorStrategies['identifier'] = core.LocatorStrategies.identifier_;
core.LocatorStrategies['implicit'] = core.LocatorStrategies.implicit_;
core.LocatorStrategies['link'] = core.text.linkLocator;
core.LocatorStrategies['name'] = core.LocatorStrategies.name_;
core.LocatorStrategies['stored'] = core.LocatorStrategies.stored_;
core.LocatorStrategies['xpath'] = core.LocatorStrategies.xpath_;
