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
 */

goog.provide('bot.keys');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.action');
goog.require('bot.events');
goog.require('goog.dom.selection');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');


/**
 * Map from certain characters to their keycodes.
 * This map is not localized and assumes a US-based keyboard layout only.
 * @type {!Object.<string, number>}
 * @private
 * @const
 */
bot.keys.CHAR_TO_KEYCODE_MAP_ = function() {
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
 * Map from the keycodes on the numberpad to their string equivalents.
 * @type {!Object.<goog.events.KeyCodes, string>}
 * @private
 * @const
 */
bot.keys.NUMPAD_TO_CHAR_MAP_ = function() {
  var dict = {};
  dict[goog.events.KeyCodes.NUM_ZERO] = '0';
  dict[goog.events.KeyCodes.NUM_ONE] = '1';
  dict[goog.events.KeyCodes.NUM_TWO] = '2';
  dict[goog.events.KeyCodes.NUM_THREE] = '3';
  dict[goog.events.KeyCodes.NUM_FOUR] = '4';
  dict[goog.events.KeyCodes.NUM_FIVE] = '5';
  dict[goog.events.KeyCodes.NUM_SIX] = '6';
  dict[goog.events.KeyCodes.NUM_SEVEN] = '7';
  dict[goog.events.KeyCodes.NUM_EIGHT] = '8';
  dict[goog.events.KeyCodes.NUM_NINE] = '9';
  dict[goog.events.KeyCodes.NUM_MULTIPLY] = '*';
  dict[goog.events.KeyCodes.NUM_PLUS] = '+';
  dict[goog.events.KeyCodes.NUM_MINUS] = '-';
  dict[goog.events.KeyCodes.NUM_PERIOD] = '.';
  dict[goog.events.KeyCodes.NUM_DIVISION] = '/';
  return dict;
}();


/**
 * Map from the keycodes of the modifier keys (alt, ctrl, meta, shift) to
 * their names.
 * @type {!Object.<goog.events.KeyCodes, string>}
 * @private
 * @const
 */
bot.keys.MODIFIER_TO_NAME_MAP_ = function() {
  var dict = {};
  dict[goog.events.KeyCodes.ALT] = 'alt';
  dict[goog.events.KeyCodes.CTRL] = 'ctrl';
  dict[goog.events.KeyCodes.META] = 'meta';
  dict[goog.events.KeyCodes.SHIFT] = 'shift';
  return dict;
}();


/**
 * The value used for newlines in the current browser/OS combination.
 * @type {string}
 * @private
 * @const
 */
bot.keys.NEW_LINE_ = goog.userAgent.IE ? '\r\n' : '\n';


/**
 * @typedef {{alt: boolean, ctrl: boolean, meta: boolean, shift: boolean}}
 * @private
 */
bot.keys.ModifierState_;


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

  return bot.keys.CHAR_TO_KEYCODE_MAP_[ch] || ch.toUpperCase().charCodeAt(0);
};


/**
 * Creates key[Down|Press|Up] parameters.
 *
 * @param {number} keyCode The keyCode of the keyboard key being pressed.
 * @param {number} charCode character The ASCII character code of the character
 *     being sent.
 * @param {bot.keys.ModifierState_} modifiers modifier keys currently pressed.
 * @return {bot.events.KeyboardArgs} Arguments needed to create a keyboard
 *     event.
 * @private
 */
bot.keys.genKeyParams_ = function(keyCode, charCode, modifiers) {
  var param = {
    keyCode: keyCode,
    charCode: charCode,
    alt: undefined,
    ctrl: undefined,
    shift: undefined,
    meta: undefined
  };
  for (var key in modifiers) {
    param[key] = modifiers[key];
  }
  return param;
};


/**
 * Send all the browser events related to a single keypress (e.g., keydown,
 * keypress, and keyup) to a web element.
 *
 * @param {!Element} element The element receiving the event.
 * @param {number} keyCode The keycode of the keyboard key being pressed.
 * @param {string} character The ASCII character being sent.
 * @param {boolean} isTextual Whether or not element is a text input.
 * @param {bot.keys.ModifierState_} modifiers modifier keys currently pressed.
 * @private
 */
bot.keys.sendCharKey_ = function(element, keyCode, character, isTextual,
                                 modifiers) {
  var charCode = character.charCodeAt(0);
  var keyDownParam = bot.keys.genKeyParams_(keyCode, charCode, modifiers);
  var keyPressParam;
  var keyUpParam = bot.keys.genKeyParams_(keyCode, 0, modifiers);

  if (goog.userAgent.GECKO) {
    keyPressParam = bot.keys.genKeyParams_(0, charCode, modifiers);
  } else if (goog.userAgent.IE) {
    keyPressParam = bot.keys.genKeyParams_(charCode, 0, modifiers);
  } else { // For both WebKit and Opera.
    keyPressParam = bot.keys.genKeyParams_(charCode, charCode, modifiers);
  }

  bot.events.fire(element, goog.events.EventType.KEYDOWN, keyDownParam);
  bot.events.fire(element, goog.events.EventType.KEYPRESS, keyPressParam);

  // Firing the key press event for character keys does not actually update
  // form textboxes on non-Gecko browsers, so we append the character manually.
  // Except for IE, we also need to fire the input event manually.
  // The onpropertychange event fires most of the time in IE, but it sometimes
  // misses the first element typed in.
  if (!goog.userAgent.GECKO && charCode && isTextual) {
    goog.dom.selection.setText(element, character);
    goog.dom.selection.setStart(element,
                                goog.dom.selection.getStart(element) + 1);
    if (!goog.userAgent.IE) {
      bot.events.fire(element, goog.events.EventType.INPUT);
    }
  }

  bot.events.fire(element, goog.events.EventType.KEYUP, keyUpParam);
};


/**
 * Handle editing the text on a Backspace/delete keydown event.
 *
 * @param {!Element} element The textual element receiving the event.
 * @param {number} keyCode The keycode of the keyboard key being pressed.
 * @private
 */
bot.keys.handleBackspaceDelete_ = function(element, keyCode) {
  if (!keyCode == goog.events.KeyCodes.BACKSPACE &&
      !keyCode == goog.events.KeyCodes.DELETE) {
    throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION,
                        'handleBackspaceDelete_ called with non backspace ' +
                        'or delete key.');
  }
  // We need to manually edit the text field for non Gecko browsers.
  if (!goog.userAgent.GECKO) {
    // Determine what should be deleted.  If text is already selected, that
    // text is deleted, else we move left/right from the current cursor.
    var endpoints = goog.dom.selection.getEndPoints(element);
    if (keyCode == goog.events.KeyCodes.BACKSPACE &&
        endpoints[0] == endpoints[1]) {
      goog.dom.selection.setStart(element, endpoints[1] - 1);
      // On IE, changing goog.dom.selection.setStart also changes the end.
      goog.dom.selection.setEnd(element, endpoints[1]);
    } else {
      goog.dom.selection.setEnd(element, endpoints[1] + 1);
    }

    // If the endpoints are equal (e.g., the cursor was at the beginning/end
    // of the input), the text field won't be changed.
    endpoints = goog.dom.selection.getEndPoints(element);
    var textChanged = !(endpoints[0] == element.value.length ||
                        endpoints[1] == 0);
    goog.dom.selection.setText(element, '');

    // Except for IE and GECKO, we need to fire the input event manually, but
    // only if the text was actually changed.
    // Note: Gecko has some strange behavior with the input event.  In a
    //  textarea, backspace always sends an input event, while delete only
    //  sends one if you actually change the text.
    //  In a textbox/password box, backspace always sends an input event unless
    //  the box has no text.  Delete behaves the same way in Firefox 3.0, but
    //  in later versions it only fires an input event if no text changes.
    if (!goog.userAgent.IE && textChanged) {
      bot.events.fire(element, goog.events.EventType.INPUT);
    }
  }
};


/**
 * Send all the browser events related to a single keypress (e.g., keydown,
 * keypress, keyup, input) of a special key (arrow keys, enter, etc.).
 *
 * @param {!Element} element The element receiving the event.
 * @param {number} keyCode The keycode of the keyboard key being pressed.
 * @param {boolean} isTextual Whether or not element is a text input.
 * @param {bot.keys.ModifierState_} modifiers The modifier keys currently
 *   pressed.
 * @private
 */
bot.keys.sendSpecialKey_ = function(element, keyCode, isTextual, modifiers) {
  var keyUpDownParam = bot.keys.genKeyParams_(keyCode, 0, modifiers);
  var keyPressParam;

  // Determine if we will need to send a keypress.
  // Gecko always sends the keypress with charCode=0.  Other browsers only send
  // keyDown/keyUp except on Enter.
  if (goog.userAgent.GECKO) {
    keyPressParam = bot.keys.genKeyParams_(keyCode, 0, modifiers);
  } else if (keyCode == goog.events.KeyCodes.ENTER) {
    keyPressParam = bot.keys.genKeyParams_(keyCode, keyCode, modifiers);
  }

  bot.events.fire(element, goog.events.EventType.KEYDOWN, keyUpDownParam);
  if (keyPressParam) {
    bot.events.fire(element, goog.events.EventType.KEYPRESS, keyPressParam);
  }

  // Handle other events caused by the keydown/keypress events.
  // Not currently handled: up and down, home, end, pgup, pgdown.

  // If we hit Enter in a textarea, we need to add the newline and fire the
  // input event.
  if (!goog.userAgent.GECKO &&
      keyCode == goog.events.KeyCodes.ENTER &&
      element.tagName.toUpperCase() == goog.dom.TagName.TEXTAREA) {
    goog.dom.selection.setText(element, bot.keys.NEW_LINE_);
    goog.dom.selection.setStart(
        element, goog.dom.selection.getStart(element) + 1);
    if (!goog.userAgent.IE) {
      bot.events.fire(element, goog.events.EventType.INPUT);
    }
  }

  // Arrow keys.
  if (keyCode == goog.events.KeyCodes.LEFT) {
    goog.dom.selection.setCursorPosition(
        element, goog.dom.selection.getStart(element) - 1);
  } else if (keyCode == goog.events.KeyCodes.RIGHT) {
    goog.dom.selection.setCursorPosition(
        element, goog.dom.selection.getStart(element) + 1);
  }

  // Backspace, Delete.
  if (isTextual && (keyCode == goog.events.KeyCodes.BACKSPACE ||
                    keyCode == goog.events.KeyCodes.DELETE)) {
    bot.keys.handleBackspaceDelete_(element, keyCode);
  }

  bot.events.fire(element, goog.events.EventType.KEYUP, keyUpDownParam);
};


/**
 * Trigger pressing/unpressing a modifier key, e.g., ctrl, alt, shift, or
 * the meta key.
 *
 * @param {!Element} element The element receiving the event.
 * @param {goog.events.KeyCodes} keyCode The keycode of the key being pressed.
 * @param {bot.keys.ModifierState_} modifiers modifier keys currently pressed.
 * @private
 */
bot.keys.sendModifierKey_ = function(element, keyCode, modifiers) {
  var key = bot.keys.MODIFIER_TO_NAME_MAP_[keyCode];
  if (!key) {
    throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION,
                        'Unrecognized toggle key: ' + keyCode);
  }

  var alreadyPressed = modifiers[key];
  var params = bot.keys.genKeyParams_(keyCode, 0, modifiers);
  // If the key was already toggled on, we fire a keyup, else a keydown.
  if (alreadyPressed) {
    // Shift keyup fires differently than the others on linux.
    if (goog.userAgent.LINUX && keyCode == goog.events.KeyCodes.SHIFT) {
      params = bot.keys.genKeyParams_(0, 0, modifiers);
    }
    bot.events.fire(element, goog.events.EventType.KEYUP, params);
  } else {
    // On Firefox, the meta key fires differently, and also fires a keypress.
    if (goog.userAgent.GECKO && keyCode == goog.events.KeyCodes.META) {
      params = bot.keys.genKeyParams_(0, 0, modifiers);
    }
    bot.events.fire(element, goog.events.EventType.KEYDOWN, params);
    if (goog.userAgent.GECKO && keyCode == goog.events.KeyCodes.META) {
      bot.events.fire(element, goog.events.EventType.KEYPRESS, params);
    }
  }

  modifiers[key] = !modifiers[key];
};


/**
 * Sends a series of keyboard events that type the passed in value into an
 * element.
 *
 * You can pass in either strings, or goog.events.KeyCodes for special keys
 * such as the arrow keys, Enter, etc.  If you type any of the modifier keys
 * (alt, ctrl, meta, shift), that key is "toggled" on until it is toggled
 * off, or until the type function ends.
 *
 * E.x.:
 *   bot.keys.type(element, 'ab', goog.events.KeyCodes.LEFT,
 *                 goog.events.KeyCodes.DELETE,
 *                 goog.events.KeyCodes.SHIFT,
 *                 'cd');
 *   This should result in "acd" showing up in element.  The "cd" is supposedly
 *   typed with the shift key pressed down (see "not yet implemented" below).
 *
 * Several things are not yet implemented -- holding shift while typing keys
 * should print the modified keys (e.g., capitals), up and down arrow keys
 * moving the cursor, holding Shift while moving the arrow keys, and other
 * miscellaneous.
 *
 * @param {!Element} element The element receiving the event.
 * @param {...(string|goog.events.KeyCodes)} var_args The values to type into
 *    element.  These are either strings or the goog.event.KeyCode of a
 *    noncharacter key (e.g., the arrow keys).
 */
bot.keys.type = function(element, var_args) {
  // In Firefox on Windows the element.input event does not fire if the
  // element does not have focus.
  bot.action.focusOnElement(element);
  var modifierState = {alt: false, ctrl: false, meta: false, shift: false};
  var isTextual = bot.action.isTextual(element);

  // Typing always starts from the end of a textual input box.
  if (isTextual) {
    goog.dom.selection.setCursorPosition(element, element.value.length);
  }

  // We loop over the arguments in case we were passed more than one value.
  var values = goog.array.slice(arguments, 1);
  goog.array.forEach(values, function(value) {
    if (goog.isString(value)) {
      for (var i = 0; i < value.length; i++) {
        bot.keys.sendCharKey_(
            element, bot.keys.keyCode_(value.charAt(i)), value.charAt(i),
            isTextual, modifierState);
      }
    } else if (value >= goog.events.KeyCodes.NUM_ZERO &&
               value <= goog.events.KeyCodes.NUM_DIVISION) {
      bot.keys.sendCharKey_(
          element, value, bot.keys.NUMPAD_TO_CHAR_MAP_[value],
          isTextual, modifierState);
    } else if (bot.keys.MODIFIER_TO_NAME_MAP_[value]) {
      bot.keys.sendModifierKey_(element, value, modifierState);
    } else if (!goog.events.KeyCodes.isCharacterKey(value)) {
      bot.keys.sendSpecialKey_(element, value, isTextual, modifierState);
    } else {
      throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION,
                          'bot.keys.type does not support using keycodes ' +
                          'for printable characters, excluding the numpad ' +
                          'keys. Use strings instead.');
    }
  });
  // Unset all modifier keys that haven't been explicitly unset.
  // TODO(user): specify an order in which the keys are released.
  for (var key in bot.keys.MODIFIER_TO_NAME_MAP_) {
    var keyCode = (/** @type {goog.events.KeyCodes} */ key);
    if (modifierState[bot.keys.MODIFIER_TO_NAME_MAP_[keyCode]]) {
      bot.keys.sendModifierKey_(element, keyCode, modifierState);
    }
  }
};
