// Copyright 2011 Software Freedom Conservancy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Factory methods for the supported locator strategies.
 */

goog.provide('webdriver.Locator');
goog.provide('webdriver.Locator.Strategy');

goog.require('bot.json');
goog.require('goog.object');



/**
 * An element locator.
 * @param {string} using The type of strategy to use for this locator.
 * @param {string} value The search target of this locator.
 * @constructor
 */
webdriver.Locator = function(using, value) {

  /**
   * The search strategy to use when searching for an element.
   * @type {string}
   */
  this.using = using;

  /**u
   * The search target for this locator.
   * @type {string}
   */
  this.value = value;
};


/**
 * Creates a factory function for a {@code webdriver.Locator}.
 * @param {string} type The type of locator for the factory.
 * @return {function(string):!webdriver.Locator} The new factory function.
 * @private
 */
webdriver.Locator.factory_ = function(type) {
  return function(value) {
    return new webdriver.Locator(type, value);
  };
};


/**
 * Factory methods for the supported locator strategies.
 * @type {Object.<function(string):!webdriver.Locator>}
 */
webdriver.Locator.Strategy = {
  'className': webdriver.Locator.factory_('class name'),
  'class name': webdriver.Locator.factory_('class name'),
  'css': webdriver.Locator.factory_('css selector'),
  'id': webdriver.Locator.factory_('id'),
  'js': webdriver.Locator.factory_('js'),
  'linkText': webdriver.Locator.factory_('link text'),
  'link text': webdriver.Locator.factory_('link text'),
  'name': webdriver.Locator.factory_('name'),
  'partialLinkText': webdriver.Locator.factory_('partial link text'),
  'partial link text': webdriver.Locator.factory_('partial link text'),
  'tagName': webdriver.Locator.factory_('tag name'),
  'tag name': webdriver.Locator.factory_('tag name'),
  'xpath': webdriver.Locator.factory_('xpath')
};
goog.exportSymbol('By', webdriver.Locator.Strategy);


/**
 * Creates a new Locator from an object whose only property is also a key in
 * the {@code webdriver.Locator.Strategy} map.
 * @param {Object.<string>} obj The object to convert into a locator.
 * @return {webdriver.Locator} The new locator object.
 */
webdriver.Locator.createFromObj = function(obj) {
  var key = goog.object.getAnyKey(obj);
  if (!key) {
    throw Error('No keys found in locator hash object');
  } else if (key in webdriver.Locator.Strategy) {
    return webdriver.Locator.Strategy[key](obj[key]);
  }
  throw Error('Unsupported locator strategy: ' + key);
};


/**
 * Verifies that a {@code locator} is a valid locator to use for searching for
 * elements on the page.
 * @param {webdriver.Locator|Object.<string>} locator The locator
 *     to verify, or a short-hand object that can be converted into a locator
 *     to verify.
 * @return {!webdriver.Locator} The validated locator.
 */
webdriver.Locator.checkLocator = function(locator) {
  if (!locator.using || !locator.value) {
    locator = webdriver.Locator.createFromObj(locator);
  }
  return (/**@type {!webdriver.Locator} */locator);
};


/** @return {string} String representation of this locator. */
webdriver.Locator.prototype.toString = function() {
  return 'By.' + this.using.replace(/ ([a-z])/g, function(all, match) {
    return match.toUpperCase();
  }) + '(' + bot.json.stringify(this.value) + ')';
};
