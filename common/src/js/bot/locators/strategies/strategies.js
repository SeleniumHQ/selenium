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


goog.provide('bot.locators.strategies');

goog.require('bot.locators.strategies.className');
goog.require('bot.locators.strategies.css');
goog.require('bot.locators.strategies.id');
goog.require('bot.locators.strategies.name');
goog.require('bot.locators.strategies.xpath');
goog.require('goog.object');


/**
 * Known element location strategies. The returned objects have two
 * methods on them, "single" and "many", which are used as location
 * strategies.
 *
 * @private
 * @const
 * @enum {{single:function(Window,*):Element,
 *         many:function(Window,*):!goog.ArrayLike}}
 */
bot.locators.strategies.KNOWN_ = {
  'className': bot.locators.strategies.className,
  'css': bot.locators.strategies.css,
  'id': bot.locators.strategies.id,
  'name': bot.locators.strategies.name,
  'xpath': bot.locators.strategies.xpath
};

/**
 * Lookup a particular element finding strategy based on the sole property of
 * the "target". The value of this key is used to locate the element.  
 *
 * @param {*} target A JS object with a single key.
 * @return {function(!Window, string): Element} The finder function.
 */
bot.locators.strategies.lookupSingle = function(target) {
  var key = goog.object.getAnyKey(target);

  if (key) {
    var strategy = bot.locators.strategies.KNOWN_[key];
    if (strategy && goog.isFunction(strategy.single)) {
      return goog.partial(strategy.single, bot.window_, target[key]);
    }
  }
  throw Error('Unsupported locator strategy: ' + key);
};

/**
 * Lookup all elements finding strategy based on the sole property of
 * the "target". The value of this key is used to locate the elements.
 *
 * @param {*} target A JS object with a single key.
 * @return {function(!Window, string): !goog.ArrayLike<Element>} The finder
 *     function.
 */
bot.locators.strategies.lookupMany = function(target) {
  var key = goog.object.getAnyKey(target);

  if (key) {
    var strategy = bot.locators.strategies.KNOWN_[key];
    if (strategy && goog.isFunction(strategy.many)) {
      return goog.partial(strategy.many, bot.window_, target[key]);
    }
  }
  throw Error('Unsupported locator strategy: ' + key);
};
