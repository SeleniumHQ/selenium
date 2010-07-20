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

goog.provide('core.LocatorStrategies');


goog.require('bot.locators');
goog.require('core.Error');



/**
 * The implicit locator, that is used when no prefix is supplied.
 */
core.LocatorStrategies['implicit'] = function(locator, inDocument, inWindow) {
  if (locator.startsWith('//')) {
    return core.locators.findElement('xpath=' + locator, inDocument, inWindow);
  }
  if (locator.startsWith('document.')) {
    return core.locators.findElement('dom=' + locator, inDocument, inWindow);
  }
  return core.LocatorStrategies['identifier'](locator, inDocument, inWindow);
};


core.LocatorStrategies['id'] = function(locator, inDocument, inWindow) {
  var selector = {};
  selector['id'] = locator;
  return bot.locators.findElement(selector);
};


core.LocatorStrategies['identifier'] = function(locator, inDocument, inWindow) {
  var idSelector = {};
  idSelector['id'] = locator;
  var nameSelector = {};
  nameSelector['name'] = locator;

  return bot.locators.findElement(idSelector) || bot.locators.findElement(nameSelector);
};


core.LocatorStrategies['name'] = function(locator, inDocument, inWindow) {
  var selector = {};
  selector['name'] = locator;

  return bot.locators.findElement(selector);
};
