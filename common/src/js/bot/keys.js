
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

/**
 * @fileoverview This file contains code to simulate sending keyboard events
 * into the browser, making sure to note the differences in browser keyboard
 * event handling.
 *
 *
 */

goog.provide('bot.keys');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.action');
goog.require('bot.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');


/**
 * Map from certain characters to their keycodes.
 * This map is not localized and assumes a US-based keyboard layout only.
 * TODO(user): include non character keys, e.g., shift, delete, arrows.
 * @type {!Object.<string, number>}
 * @private
 * @const
 */
bot.keys.STR_TO_KEYCODE_MAP_ = function() {
  var dict = {
    '!': goog.events.KeyCodes.ONE,
    '@': goog.events.KeyCodes.TWO,
    '#': goog.events.KeyCodes.THREE,
    '$': goog.events.KeyCodes.FOUR,
    '%': goog.events.KeyCodes.FIVE,
    '^': goog.events.KeyCodes.SIX,
    '&': goog.events.KeyCodes.SEVEN,
    '*': goog.events.KeyCodes.EIGHT,
    '(': goog.events.KeyCodes.NINE,
    ')': goog.events.KeyCodes.ZERO
  };
  if (goog.userAgent.GECKO) {
    goog.object.extend(dict, {
      ';': 59, ':': 59,
      '=': 61, '+': 61,
      ',': 188, '<': 188,
      '-': 109, '_': 109,
      '.': 190, '>': 190,
      '/': 191, '?': 191,
      '`': 192, '~': 192,
      '[': 219, '{': 219,
      '\\': 220, '|': 220,
      ']': 221, '}': 221,
      "'": 222, '"': 222
    });
  } else if (goog.userAgent.IE) {
    goog.object.extend(dict, {
      ';': 186, ':': 186,
      '=': 187, '+': 187,
      ',': 188, '<': 188,
      '-': 189, '_': 189,
      '.': 190, '>': 190,
      '/': 191, '?': 191,
      '`': 192, '~': 192,
      '[': 219, '{': 219,
      '\\': 220, '|': 220,
      ']': 221, '}': 221,
      "'": 222, '"': 222
    });
  } else if (goog.userAgent.OPERA) {
    goog.object.extend(dict, {
      ';': 59, ':': 59,
      '=': 61, '+': 61,
      ',': 44, '<': 44,
      '-': 45, '_': 45,
      '.': 46, '>': 46,
      '/': 47, '?': 47,
      '`': 96, '~': 96,
      '[': 91, '{': 91,
      '\\': 92, '|': 92,
      ']': 93, '}': 93,
      "'": 39, '"': 39
    });
  }

  return dict;
}();


/**
 * Converts a character into its keycode.  This does not yet handle localization
 * (international keyboards may have different keycodes).
 *
 * @param {string} ch Character to convert.
 * @return {number} The key code matching the character given.
 * @private
 */
bot.keys.keyCode_ = function(ch) {
  if (ch.length != 1) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
                        'Expected a single character, got: "' + ch + '"');
  }

  return bot.keys.STR_TO_KEYCODE_MAP_[ch] || ch.toUpperCase().charCodeAt(0);
};


/**
 * Send all the browser events related to a single keypress (e.g., keydown,
 * keypress, and keyup) to a web element.
 *
 * @param {!Element} element The element receiving the event.
 * @param {number} keyCode The keycode of the keyboard key being pressed.
 * @param {number} charCode The ASCII character code of the character being
 *     sent.
 * @private
 */
bot.keys.sendKey_ = function(element, keyCode, charCode) {
  // TODO(user): handle modifier keys (ctrl, alt, caps, etc.)
  var keyDownParam = {keyCode: keyCode, charCode: 0};
  var keyPressParam;
  var keyUpParam = {keyCode: keyCode, charCode: 0};

  if (goog.userAgent.GECKO) {
    keyPressParam = {keyCode: 0, charCode: charCode};
  } else if (goog.userAgent.IE) {
    keyPressParam = {keyCode: charCode, charCode: 0};
  } else { // For both WebKit and Opera.
    keyPressParam = {keyCode: charCode, charCode: charCode};
  }

  bot.events.fire(element, goog.events.EventType.KEYDOWN, keyDownParam);
  bot.events.fire(element, goog.events.EventType.KEYPRESS, keyPressParam);

  // Firing the key press event for character keys does not actually update
  // form textboxes on non-Gecko browsers, so we append the character manually.
  // Except for IE, we also need to fire the input event manually.
  // TODO(user): Factor out isTextual as an argument to this function,
  // so it isn't called on each iteration through the loop.
  if (!goog.userAgent.GECKO && charCode && bot.action.isTextual(element)) {
    element.value += String.fromCharCode(charCode);
    if (!goog.userAgent.IE) {
      bot.events.fire(element, goog.events.EventType.INPUT);
    }
  }

  bot.events.fire(element, goog.events.EventType.KEYUP, keyUpParam);
};


/**
 * Sends a series of keyboard events that type the passed in value into an
 * element.
 *
 * @param {!Element} element The element receiving the event.
 * @param {string} value The string to type into element.
 */
bot.keys.type = function(element, value) {
  // In Firefox on Windows the element.input event does not fire if the
  // element does not have focus.
  bot.action.focusOnElement(element);

  for (var i = 0; i < value.length; i++) {
    bot.keys.sendKey_(element, bot.keys.keyCode_(value.charAt(i)),
                      value.charCodeAt(i));
  }
};
