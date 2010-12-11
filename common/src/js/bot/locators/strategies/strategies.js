// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
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

goog.provide('bot.locators.strategies');

goog.require('bot.locators.strategies.className');
goog.require('bot.locators.strategies.css');
goog.require('bot.locators.strategies.id');
goog.require('bot.locators.strategies.linkText');
goog.require('bot.locators.strategies.name');
goog.require('bot.locators.strategies.partialLinkText');
goog.require('bot.locators.strategies.tagName');
goog.require('bot.locators.strategies.xpath');
goog.require('goog.array');  // for the goog.array.ArrayLike typedef
goog.require('goog.object');



/**
 * @typedef {{single:function(string,!(Document|Element)):Element,
 *     many:function(string,!(Document|Element)):!goog.array.ArrayLike}}
 */
bot.locators.strategies.strategy;


/**
 * Known element location strategies. The returned objects have two
 * methods on them, "single" and "many", which are used as location
 * strategies.
 *
 * @private
 * @const
 * @type {Object.<string,bot.locators.strategies.strategy>}
 */
bot.locators.strategies.KNOWN_ = {
  'className': bot.locators.strategies.className,
  'css': bot.locators.strategies.css,
  'id': bot.locators.strategies.id,
  'linkText': bot.locators.strategies.linkText,
  'name': bot.locators.strategies.name,
  'partialLinkText': bot.locators.strategies.partialLinkText,
  'tagName': bot.locators.strategies.tagName,
  'xpath': bot.locators.strategies.xpath
};


/**
 * Add or override an existing strategy for locating elements.
 *
 * @param {string} name The name of the strategy.
 * @param {!bot.locators.strategies.strategy} strategy The strategy to use.
 */
bot.locators.strategies.add = function(name, strategy) {
  bot.locators.strategies.KNOWN_[name] = strategy;
};


/**
 * Lookup a particular element finding strategy based on the sole property of
 * the "target". The value of this key is used to locate the element.
 *
 * @param {Object} target A JS object with a single key.
 * @param {(Document|Element)=} opt_root The node from which to start the
 *     search. If not specified, will use {@code document} as the root.
 * @return {function(): Element} The finder function.
 */
bot.locators.strategies.lookupSingle = function(target, opt_root) {
  var key = goog.object.getAnyKey(target);

  if (key) {
    var strategy = bot.locators.strategies.KNOWN_[key];
    if (strategy && goog.isFunction(strategy.single)) {
      return goog.partial(strategy.single, target[key],
                          opt_root || goog.dom.getOwnerDocument(bot.window_));
    }
  }
  throw Error('Unsupported locator strategy: ' + key);
};

/**
 * Lookup all elements finding strategy based on the sole property of
 * the "target". The value of this key is used to locate the elements.
 *
 * @param {Object} target A JS object with a single key.
 * @param {(Document|Element)=} opt_root The node from which to start the
 *     search. If not specified, will use {@code document} as the root.
 * @return {function(): !goog.array.ArrayLike.<Element>} The finder
 *     function.
 */
bot.locators.strategies.lookupMany = function(target, opt_root) {
  var key = goog.object.getAnyKey(target);

  if (key) {
    var strategy = bot.locators.strategies.KNOWN_[key];
    if (strategy && goog.isFunction(strategy.many)) {
      return goog.partial(strategy.many, target[key],
                          opt_root || goog.dom.getOwnerDocument(bot.window_));
    }
  }
  throw Error('Unsupported locator strategy: ' + key);
};
