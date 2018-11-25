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
 * @fileoverview Element locator functions.
 */


goog.provide('bot.locators');

goog.require('bot');
goog.require('bot.locators.className');
goog.require('bot.locators.css');
goog.require('bot.locators.id');
goog.require('bot.locators.linkText');
goog.require('bot.locators.name');
goog.require('bot.locators.partialLinkText');
goog.require('bot.locators.tagName');
goog.require('bot.locators.xpath');


/**
 * @typedef {{single:function(string,!(Document|Element)):Element,
 *     many:function(string,!(Document|Element)):!IArrayLike}}
 */
bot.locators.strategy;


/**
 * Known element location strategies. The returned objects have two
 * methods on them, "single" and "many", for locating a single element
 * or multiple elements, respectively.
 *
 * Note that the versions with spaces are synonyms for those without spaces,
 * and are specified at:
 * https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 * @private {Object.<string,bot.locators.strategy>}
 * @const
 */
bot.locators.STRATEGIES_ = {
  'className': bot.locators.className,
  'class name': bot.locators.className,

  'css': bot.locators.css,
  'css selector': bot.locators.css,

  'id': bot.locators.id,

  'linkText': bot.locators.linkText,
  'link text': bot.locators.linkText,

  'name': bot.locators.name,

  'partialLinkText': bot.locators.partialLinkText,
  'partial link text': bot.locators.partialLinkText,

  'tagName': bot.locators.tagName,
  'tag name': bot.locators.tagName,

  'xpath': bot.locators.xpath
};


/**
 * Add or override an existing strategy for locating elements.
 *
 * @param {string} name The name of the strategy.
 * @param {!bot.locators.strategy} strategy The strategy to use.
 */
bot.locators.add = function(name, strategy) {
  bot.locators.STRATEGIES_[name] = strategy;
};


/**
 * Returns one key from the object map that is not present in the
 * Object.prototype, if any exists.
 *
 * @param {Object} target The object to pick a key from.
 * @return {string?} The key or null if the object is empty.
 */
bot.locators.getOnlyKey = function(target) {
  for (var k in target) {
    if (target.hasOwnProperty(k)) {
      return k;
    }
  }
  return null;
};


/**
 * Find the first element in the DOM matching the target. The target
 * object should have a single key, the name of which determines the
 * locator strategy and the value of which gives the value to be
 * searched for. For example {id: 'foo'} indicates that the first
 * element on the DOM with the ID 'foo' should be returned.
 *
 * @param {!Object} target The selector to search for.
 * @param {(Document|Element)=} opt_root The node from which to start the
 *     search. If not specified, will use `document` as the root.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.findElement = function(target, opt_root) {
  var key = bot.locators.getOnlyKey(target);

  if (key) {
    var strategy = bot.locators.STRATEGIES_[key];
    if (strategy && goog.isFunction(strategy.single)) {
      var root = opt_root || bot.getDocument();
      return strategy.single(target[key], root);
    }
  }
  throw new bot.Error(bot.ErrorCode.INVALID_ARGUMENT,
                      'Unsupported locator strategy: ' + key);
};


/**
 * Find all elements in the DOM matching the target. The target object
 * should have a single key, the name of which determines the locator
 * strategy and the value of which gives the value to be searched
 * for. For example {name: 'foo'} indicates that all elements with the
 * 'name' attribute equal to 'foo' should be returned.
 *
 * @param {!Object} target The selector to search for.
 * @param {(Document|Element)=} opt_root The node from which to start the
 *     search. If not specified, will use `document` as the root.
 * @return {!IArrayLike.<Element>} All matching elements found in the
 *     DOM.
 */
bot.locators.findElements = function(target, opt_root) {
  var key = bot.locators.getOnlyKey(target);

  if (key) {
    var strategy = bot.locators.STRATEGIES_[key];
    if (strategy && goog.isFunction(strategy.many)) {
      var root = opt_root || bot.getDocument();
      return strategy.many(target[key], root);
    }
  }
  throw new bot.Error(bot.ErrorCode.INVALID_ARGUMENT,
                      'Unsupported locator strategy: ' + key);
};
