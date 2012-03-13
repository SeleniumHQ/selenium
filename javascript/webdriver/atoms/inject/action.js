// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
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
 * @fileoverview Ready to inject atoms for manipulating the DOM.
 */

goog.provide('webdriver.atoms.inject.action');

goog.require('bot.action');
goog.require('bot.inject');
goog.require('goog.dom.selection');


/**
 * Submits the form containing the given element.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to submit.
 */
webdriver.atoms.inject.action.submit = function(element) {
  bot.inject.executeScript(bot.action.submit, [element], true);
};


/**
 * Clear an element.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to clear.
 * @see bot.action.clear
 */
webdriver.atoms.inject.action.clear = function(element) {
  bot.inject.executeScript(bot.action.clear, [element], true);
};


/**
 * Click an element.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to click.
 * @see bot.action.click
 */
webdriver.atoms.inject.action.click = function(element) {
  bot.inject.executeScript(bot.action.click, [element], true);
};

