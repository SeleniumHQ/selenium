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
 * @fileoverview Selenium methods that live in the old browserbot.
 */

goog.provide('core.browserbot');


goog.require('bot.locators');
goog.require('bot.dom');
goog.require('core.locators');
goog.require('core.patternMatcher');



/**
 * Verifies that the specified text pattern appears somewhere on the rendered
 * page shown to the user.
 *
 * @param {!string} pattern a pattern to match with the text of the page.
 * @return {boolean} Whether the pattern matches the text.
 */
core.browserbot.isTextPresent = function(pattern) {
  var body = bot.locators.findElement({'tagName': 'body'});
  if (!body) {
    return false;
  }
  var allText = bot.dom.getVisibleText((body));

  var matchMaker = core.patternMatcher.against(pattern);
  return matchMaker(allText);
};


/**
 * @param {!string} locator The selenium locator to use.
 * @return {boolean} Whether the given element is "user visible".
 */
core.browserbot.isVisible = function(locator) {
  var element = core.locators.findElement(locator);
  return bot.dom.isShown(element);
};
