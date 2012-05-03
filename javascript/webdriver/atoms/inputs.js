// Copyright 2012 WebDriver committers
// Copyright 2012 Software Freedom Conservancy
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
 * @fileoverview Synthetic events for fun and profit.
 */

goog.provide('webdriver.atoms.inputs');

goog.require('bot.Keyboard');
goog.require('bot.Mouse');
goog.require('bot.action');
goog.require('goog.array');


/**
 * Send keyboard input to a particular element.
 *
 * @param {!Element} element The element to send the keyboard input to.
 * @param {Array.<!bot.Keyboard.Key>} opt_state The keyboard to use, or construct one.
 * @param {...(string|!Array.<string>)} var_args What to type.
 * @return {Array.<!bot.Keyboard.Key>} The keyboard state.
 */
webdriver.atoms.inputs.sendKeys = function (element, opt_state, var_args) {
  var keyboard = new bot.Keyboard(opt_state);
  var to_type = goog.array.slice(arguments, 2);
  var flattened = goog.array.flatten(to_type);

  bot.action.type(element, flattened, keyboard);

  return keyboard.getState();
};
goog.exportSymbol('sendKeys', webdriver.atoms.inputs.sendKeys);


/**
 * Click on an element.
 *
 * @param {!Element} element The element to click.
 */
webdriver.atoms.inputs.click = function (element) {
  var mouse = new bot.Mouse();

  bot.action.click(element, null, mouse);
};
goog.exportSymbol('click', webdriver.atoms.inputs.click);