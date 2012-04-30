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
goog.require('bot.userAgent');
goog.require('goog.array');
goog.require('goog.string');


/**
* Examines the opt_keyboard parameter, and returns either that or a new
* keyboard instance, which is stored on the document for later use.
*
* @param {bot.Keyboard=} opt_keyboard A mouse to use.
* @return {!bot.Keyboard} A mouse instance.
*/
webdriver.atoms.inputs.getKeyboard_ = function (opt_keyboard) {
    if (opt_keyboard) {
        return opt_keyboard;
    }

    if (!bot.userAgent.FIREFOX_EXTENSION && document['__webdriver_keyboard']) {
        return document['__webdriver_keyboard'];
    }

    var keyboard = new bot.Keyboard();
    if (!bot.userAgent.FIREFOX_EXTENSION) {
        document['__webdriver_keyboard'] = keyboard;
    }

    return keyboard;
};


/**
* Examines the opt_mouse parameter, and returns either that or a new mouse
* instance, which is stored on the document for later use.
*
* @param {bot.Mouse=} opt_mouse A mouse to use.
* @return {!bot.Mouse} A mouse instance.
*/
webdriver.atoms.inputs.getMouse_ = function (opt_mouse) {
    if (opt_mouse) {
        return opt_mouse;
    }

    if (!bot.userAgent.FIREFOX_EXTENSION && document['__webdriver_mouse']) {
        return document['__webdriver_mouse'];
    }

    var mouse = new bot.Mouse();
    if (!bot.userAgent.FIREFOX_EXTENSION) {
        document['__webdriver_mouse'] = mouse;
    }

    return mouse;
};


/**
*
* @param {!Element} element The element to send the keyboard input to.
* @param {...(string|!Array.<string>)} var_args What to type.
* @param {bot.Keyboard=} opt_keyboard The keyboard to use, or construct one.
*/
webdriver.atoms.inputs.sendKeys = function (
    element, var_args, opt_keyboard) {
    var keyboard = webdriver.atoms.inputs.getKeyboard_(opt_keyboard);
    var to_type = goog.array.slice(arguments, 2);
    var flattened = goog.array.flatten(values);

    bot.action.type(element, flattened, keyboard);
};


/**
* Click on an element.
*
* @param {!Element} element The element to click.
* @param {bot.Mouse=} opt_mouse The mouse to use, or constructs one.
*/
webdriver.atoms.inputs.click = function (element, opt_mouse) {
    var mouse = webdriver.atoms.inputs.getMouse_(opt_mouse);

    bot.action.click(element, null, mouse);
};
