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
 * @fileoverview The file contains an abstraction of a keyboad
 * for simulating the presing and releasing of keys.
 */

goog.provide('bot.Keyboard');
goog.provide('bot.Keyboard.Key');
goog.provide('bot.Keyboard.Keys');

goog.require('bot.Device');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.dom');
goog.require('bot.events.EventType');
goog.require('goog.array');
goog.require('goog.dom.TagName');
goog.require('goog.dom.selection');
goog.require('goog.structs.Map');
goog.require('goog.structs.Set');
goog.require('goog.userAgent');



/**
 * A keyboard that provides atomic typing actions.
 *
 * @constructor
 * @param {bot.Keyboard.State=} opt_state Optional keyboard state.
 * @extends {bot.Device}
 */
bot.Keyboard = function(opt_state) {
  goog.base(this);

  /** @private {boolean} */
  this.editable_ = bot.dom.isEditable(this.getElement());

  /** @private {number} */
  this.currentPos_ = 0;

  /** @private {!goog.structs.Set.<!bot.Keyboard.Key>} */
  this.pressed_ = new goog.structs.Set();

  if (opt_state) {
    // If a state is passed, let's assume we were passed an object with
    // the correct properties.
    goog.array.forEach(opt_state['pressed'], function(key) {
      this.setKeyPressed_(/** @type {!bot.Keyboard.Key} */ (key), true);
    }, this);

    this.currentPos_ = opt_state['currentPos'] || 0;
  }
};
goog.inherits(bot.Keyboard, bot.Device);


/**
 * Describes the current state of a keyboard.
 * @typedef {{pressed: !Array.<!bot.Keyboard.Key>,
 *            currentPos: number}}
 */
bot.Keyboard.State;


/**
 * Maps characters to (key,boolean) pairs, where the key generates the
 * character and the boolean is true when the shift must be pressed.
 * @private {!Object.<string, {key: !bot.Keyboard.Key, shift: boolean}>}
 * @const
 */
bot.Keyboard.CHAR_TO_KEY_ = {};


/**
 * Constructs a new key and, if it is a character key, adds a mapping from the
 * character to is in the CHAR_TO_KEY_ map. Using this factory function instead
 * of the new keyword, also helps reduce the size of the compiled Js fragment.
 *
 * @param {null|number|
 *         {gecko: (?number), ieWebkit: (?number)}} code
 *     Either a single keycode or a record of per-browser keycodes.
 * @param {string=} opt_char Character when shift is not pressed.
 * @param {string=} opt_shiftChar Character when shift is pressed.
 * @return {!bot.Keyboard.Key} The new key.
 * @private
 */
bot.Keyboard.newKey_ = function(code, opt_char, opt_shiftChar) {
  if (goog.isObject(code)) {
    if (goog.userAgent.GECKO) {
      code = code.gecko;
    } else {  // IE and Webkit
      code = code.ieWebkit;
    }
  }
  var key = new bot.Keyboard.Key(code, opt_char, opt_shiftChar);

  // For a character key, potentially map the character to the key in the
  // CHAR_TO_KEY_ map. Because of numpad, multiple keys may have the same
  // character. To avoid mapping numpad keys, we overwrite a mapping only if
  // the key has a distinct shift character.
  if (opt_char && (!(opt_char in bot.Keyboard.CHAR_TO_KEY_) || opt_shiftChar)) {
    bot.Keyboard.CHAR_TO_KEY_[opt_char] = {key: key, shift: false};
    if (opt_shiftChar) {
      bot.Keyboard.CHAR_TO_KEY_[opt_shiftChar] = {key: key, shift: true};
    }
  }

  return key;
};



/**
 * A key on the keyboard.
 *
 * @constructor
 * @param {?number} code Keycode for the key; null for the (rare) case
 *     that pressing the key issues no key events.
 * @param {string=} opt_char Character when shift is not pressed; null
 *     when the key does not cause a character to be typed.
 * @param {string=} opt_shiftChar Character when shift is pressed; null
 *     when the key does not cause a character to be typed.
 */
bot.Keyboard.Key = function(code, opt_char, opt_shiftChar) {
  /** @type {?number} */
  this.code = code;

  /** @type {?string} */
  this.character = opt_char || null;

  /** @type {?string} */
  this.shiftChar = opt_shiftChar || this.character;
};


/**
 * An enumeration of keys known to this module.
 *
 * @enum {!bot.Keyboard.Key}
 */
bot.Keyboard.Keys = {
  BACKSPACE: bot.Keyboard.newKey_(8),
  TAB: bot.Keyboard.newKey_(9),
  ENTER: bot.Keyboard.newKey_(13),
  SHIFT: bot.Keyboard.newKey_(16),
  CONTROL: bot.Keyboard.newKey_(17),
  ALT: bot.Keyboard.newKey_(18),
  PAUSE: bot.Keyboard.newKey_(19),
  CAPS_LOCK: bot.Keyboard.newKey_(20),
  ESC: bot.Keyboard.newKey_(27),
  SPACE: bot.Keyboard.newKey_(32, ' '),
  PAGE_UP: bot.Keyboard.newKey_(33),
  PAGE_DOWN: bot.Keyboard.newKey_(34),
  END: bot.Keyboard.newKey_(35),
  HOME: bot.Keyboard.newKey_(36),
  LEFT: bot.Keyboard.newKey_(37),
  UP: bot.Keyboard.newKey_(38),
  RIGHT: bot.Keyboard.newKey_(39),
  DOWN: bot.Keyboard.newKey_(40),
  PRINT_SCREEN: bot.Keyboard.newKey_(44),
  INSERT: bot.Keyboard.newKey_(45),
  DELETE: bot.Keyboard.newKey_(46),

  // Number keys
  ZERO: bot.Keyboard.newKey_(48, '0', ')'),
  ONE: bot.Keyboard.newKey_(49, '1', '!'),
  TWO: bot.Keyboard.newKey_(50, '2', '@'),
  THREE: bot.Keyboard.newKey_(51, '3', '#'),
  FOUR: bot.Keyboard.newKey_(52, '4', '$'),
  FIVE: bot.Keyboard.newKey_(53, '5', '%'),
  SIX: bot.Keyboard.newKey_(54, '6', '^'),
  SEVEN: bot.Keyboard.newKey_(55, '7', '&'),
  EIGHT: bot.Keyboard.newKey_(56, '8', '*'),
  NINE: bot.Keyboard.newKey_(57, '9', '('),

  // Letter keys
  A: bot.Keyboard.newKey_(65, 'a', 'A'),
  B: bot.Keyboard.newKey_(66, 'b', 'B'),
  C: bot.Keyboard.newKey_(67, 'c', 'C'),
  D: bot.Keyboard.newKey_(68, 'd', 'D'),
  E: bot.Keyboard.newKey_(69, 'e', 'E'),
  F: bot.Keyboard.newKey_(70, 'f', 'F'),
  G: bot.Keyboard.newKey_(71, 'g', 'G'),
  H: bot.Keyboard.newKey_(72, 'h', 'H'),
  I: bot.Keyboard.newKey_(73, 'i', 'I'),
  J: bot.Keyboard.newKey_(74, 'j', 'J'),
  K: bot.Keyboard.newKey_(75, 'k', 'K'),
  L: bot.Keyboard.newKey_(76, 'l', 'L'),
  M: bot.Keyboard.newKey_(77, 'm', 'M'),
  N: bot.Keyboard.newKey_(78, 'n', 'N'),
  O: bot.Keyboard.newKey_(79, 'o', 'O'),
  P: bot.Keyboard.newKey_(80, 'p', 'P'),
  Q: bot.Keyboard.newKey_(81, 'q', 'Q'),
  R: bot.Keyboard.newKey_(82, 'r', 'R'),
  S: bot.Keyboard.newKey_(83, 's', 'S'),
  T: bot.Keyboard.newKey_(84, 't', 'T'),
  U: bot.Keyboard.newKey_(85, 'u', 'U'),
  V: bot.Keyboard.newKey_(86, 'v', 'V'),
  W: bot.Keyboard.newKey_(87, 'w', 'W'),
  X: bot.Keyboard.newKey_(88, 'x', 'X'),
  Y: bot.Keyboard.newKey_(89, 'y', 'Y'),
  Z: bot.Keyboard.newKey_(90, 'z', 'Z'),

  // Branded keys
  META: bot.Keyboard.newKey_(
      goog.userAgent.WINDOWS ? {gecko: 91, ieWebkit: 91} :
          (goog.userAgent.MAC ? {gecko: 224, ieWebkit: 91} :
              {gecko: 0, ieWebkit: 91})),  // Linux
  META_RIGHT: bot.Keyboard.newKey_(
      goog.userAgent.WINDOWS ? {gecko: 92, ieWebkit: 92} :
          (goog.userAgent.MAC ? {gecko: 224, ieWebkit: 93} :
              {gecko: 0, ieWebkit: 92})),  // Linux
  CONTEXT_MENU: bot.Keyboard.newKey_(
      goog.userAgent.WINDOWS ? {gecko: 93, ieWebkit: 93} :
          (goog.userAgent.MAC ? {gecko: 0, ieWebkit: 0} :
              {gecko: 93, ieWebkit: null})),  // Linux

  // Numpad keys
  NUM_ZERO: bot.Keyboard.newKey_({gecko: 96, ieWebkit: 96}, '0'),
  NUM_ONE: bot.Keyboard.newKey_({gecko: 97, ieWebkit: 97}, '1'),
  NUM_TWO: bot.Keyboard.newKey_({gecko: 98, ieWebkit: 98}, '2'),
  NUM_THREE: bot.Keyboard.newKey_({gecko: 99, ieWebkit: 99}, '3'),
  NUM_FOUR: bot.Keyboard.newKey_({gecko: 100, ieWebkit: 100}, '4'),
  NUM_FIVE: bot.Keyboard.newKey_({gecko: 101, ieWebkit: 101}, '5'),
  NUM_SIX: bot.Keyboard.newKey_({gecko: 102, ieWebkit: 102}, '6'),
  NUM_SEVEN: bot.Keyboard.newKey_({gecko: 103, ieWebkit: 103}, '7'),
  NUM_EIGHT: bot.Keyboard.newKey_({gecko: 104, ieWebkit: 104}, '8'),
  NUM_NINE: bot.Keyboard.newKey_({gecko: 105, ieWebkit: 105}, '9'),
  NUM_MULTIPLY: bot.Keyboard.newKey_(
      {gecko: 106, ieWebkit: 106}, '*'),
  NUM_PLUS: bot.Keyboard.newKey_(
      {gecko: 107, ieWebkit: 107}, '+'),
  NUM_MINUS: bot.Keyboard.newKey_(
      {gecko: 109, ieWebkit: 109}, '-'),
  NUM_PERIOD: bot.Keyboard.newKey_(
      {gecko: 110, ieWebkit: 110}, '.'),
  NUM_DIVISION: bot.Keyboard.newKey_(
      {gecko: 111, ieWebkit: 111}, '/'),
  NUM_LOCK: bot.Keyboard.newKey_(144),

  // Function keys
  F1: bot.Keyboard.newKey_(112),
  F2: bot.Keyboard.newKey_(113),
  F3: bot.Keyboard.newKey_(114),
  F4: bot.Keyboard.newKey_(115),
  F5: bot.Keyboard.newKey_(116),
  F6: bot.Keyboard.newKey_(117),
  F7: bot.Keyboard.newKey_(118),
  F8: bot.Keyboard.newKey_(119),
  F9: bot.Keyboard.newKey_(120),
  F10: bot.Keyboard.newKey_(121),
  F11: bot.Keyboard.newKey_(122),
  F12: bot.Keyboard.newKey_(123),

  // Punctuation keys
  EQUALS: bot.Keyboard.newKey_(
      {gecko: 107, ieWebkit: 187}, '=', '+'),
  SEPARATOR: bot.Keyboard.newKey_(108, ','),
  HYPHEN: bot.Keyboard.newKey_(
      {gecko: 109, ieWebkit: 189}, '-', '_'),
  COMMA: bot.Keyboard.newKey_(188, ',', '<'),
  PERIOD: bot.Keyboard.newKey_(190, '.', '>'),
  SLASH: bot.Keyboard.newKey_(191, '/', '?'),
  BACKTICK: bot.Keyboard.newKey_(192, '`', '~'),
  OPEN_BRACKET: bot.Keyboard.newKey_(219, '[', '{'),
  BACKSLASH: bot.Keyboard.newKey_(220, '\\', '|'),
  CLOSE_BRACKET: bot.Keyboard.newKey_(221, ']', '}'),
  SEMICOLON: bot.Keyboard.newKey_(
      {gecko: 59, ieWebkit: 186}, ';', ':'),
  APOSTROPHE: bot.Keyboard.newKey_(222, '\'', '"')
};


/**
 * Given a character, returns a pair of a key and a boolean: the key being one
 * that types the character and the boolean indicating whether the key must be
 * shifted to type it. This function will never return a numpad key; that is,
 * it will always return a symbol key when given a number or math symbol.
 *
 * If given a character for which this module does not know the key (the key
 * is not in the bot.Keyboard.Keys enumeration), returns a key that types the
 * given character but has a (likely incorrect) keycode of zero.
 *
 * @param {string} ch Single character.
 * @return {{key: !bot.Keyboard.Key, shift: boolean}} A pair of a key and
 *     a boolean indicating whether shift must be pressed for the character.
 */
bot.Keyboard.Key.fromChar = function(ch) {
  if (ch.length != 1) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
                        'Argument not a single character: ' + ch);
  }
  var keyShiftPair = bot.Keyboard.CHAR_TO_KEY_[ch];
  if (!keyShiftPair) {
    // We don't know the true keycode of non-US keyboard characters, but
    // ch.toUpperCase().charCodeAt(0) should occasionally be right, and
    // at least yield a positive number.
    var upperCase = ch.toUpperCase();
    var keyCode = upperCase.charCodeAt(0);
    var key = bot.Keyboard.newKey_(keyCode, ch.toLowerCase(), upperCase);
    keyShiftPair = {key: key, shift: (ch != key.character)};
  }
  return keyShiftPair;
};


/**
 * Array of modifier keys.
 *
 * @type {!Array.<!bot.Keyboard.Key>}
 * @const
 */
bot.Keyboard.MODIFIERS = [
  bot.Keyboard.Keys.ALT,
  bot.Keyboard.Keys.CONTROL,
  bot.Keyboard.Keys.META,
  bot.Keyboard.Keys.SHIFT
];


/**
 * Map of modifier to key.
 * @private {!goog.structs.Map.<!bot.Device.Modifier, !bot.Keyboard.Key>}
 */
bot.Keyboard.MODIFIER_TO_KEY_MAP_ = (function() {
  var modifiersMap = new goog.structs.Map();
  modifiersMap.set(bot.Device.Modifier.SHIFT,
      bot.Keyboard.Keys.SHIFT);
  modifiersMap.set(bot.Device.Modifier.CONTROL,
      bot.Keyboard.Keys.CONTROL);
  modifiersMap.set(bot.Device.Modifier.ALT,
      bot.Keyboard.Keys.ALT);
  modifiersMap.set(bot.Device.Modifier.META,
      bot.Keyboard.Keys.META);

  return modifiersMap;
})();


/**
 * The reverse map - key to modifier.
 * @private {!goog.structs.Map.<number, !bot.Device.Modifier>}
 */
bot.Keyboard.KEY_TO_MODIFIER_ = (function(modifiersMap) {
  var keyToModifierMap = new goog.structs.Map();
  goog.array.forEach(modifiersMap.getKeys(), function(m) {
    keyToModifierMap.set(modifiersMap.get(m).code, m);
  });

  return keyToModifierMap;
})(bot.Keyboard.MODIFIER_TO_KEY_MAP_);


/**
 * Set the modifier state if the provided key is one, otherwise just add
 * to the list of pressed keys.
 * @param {!bot.Keyboard.Key} key The key to update.
 * @param {boolean} isPressed Whether the key is pressed.
 * @private
 */
bot.Keyboard.prototype.setKeyPressed_ = function(key, isPressed) {
  if (goog.array.contains(bot.Keyboard.MODIFIERS, key)) {
    var modifier = /** @type {bot.Device.Modifier}*/ (
        bot.Keyboard.KEY_TO_MODIFIER_.get(key.code));
    this.modifiersState.setPressed(modifier, isPressed);
  }

  if (isPressed) {
    this.pressed_.add(key);
  } else {
    this.pressed_.remove(key);
  }
};


/**
 * The value used for newlines in the current browser/OS combination. Although
 * the line endings look platform dependent, they are browser dependent.
 *
 * @private {string}
 * @const
 */
bot.Keyboard.NEW_LINE_ = goog.userAgent.IE ? '\r\n' : '\n';


/**
 * Returns whether the key is currently pressed.
 *
 * @param {!bot.Keyboard.Key} key Key.
 * @return {boolean} Whether the key is pressed.
 */
bot.Keyboard.prototype.isPressed = function(key) {
  return this.pressed_.contains(key);
};


/**
 * Presses the given key on the keyboard. Keys that are pressed can be pressed
 * again before releasing, to simulate repeated keys, except for modifier keys,
 * which must be released before they can be pressed again.
 *
 * @param {!bot.Keyboard.Key} key Key to press.
 */
bot.Keyboard.prototype.pressKey = function(key) {
  if (goog.array.contains(bot.Keyboard.MODIFIERS, key) && this.isPressed(key)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot press a modifier key that is already pressed.');
  }

  // Note that GECKO is special-cased below because of
  // https://bugzilla.mozilla.org/show_bug.cgi?id=501496. "preventDefault on
  // keydown does not cancel following keypress"
  var performDefault = !goog.isNull(key.code) &&
      this.fireKeyEvent_(bot.events.EventType.KEYDOWN, key);

  // Fires keydown and stops if unsuccessful.
  if (performDefault || goog.userAgent.GECKO) {
    // Fires keypress if required and stops if unsuccessful.
    if (!this.requiresKeyPress_(key) ||
        this.fireKeyEvent_(
            bot.events.EventType.KEYPRESS, key, !performDefault)) {
      if (performDefault) {
        this.maybeSubmitForm_(key);
        if (this.editable_) {
          this.maybeEditText_(key);
        }
      }
    }
  }

  this.setKeyPressed_(key, true);
};


/**
 * Whether the given key currently requires a keypress.
 * TODO: Make this dependent on the state of the modifier keys.
 *
 * @param {bot.Keyboard.Key} key Key.
 * @return {boolean} Whether it requires a keypress event.
 * @private
 */
bot.Keyboard.prototype.requiresKeyPress_ = function(key) {
  if (key.character || key == bot.Keyboard.Keys.ENTER) {
    return true;
  } else if (goog.userAgent.WEBKIT || goog.userAgent.EDGE) {
    return false;
  } else if (goog.userAgent.IE) {
    return key == bot.Keyboard.Keys.ESC;
  } else { // Gecko
    switch (key) {
      case bot.Keyboard.Keys.SHIFT:
      case bot.Keyboard.Keys.CONTROL:
      case bot.Keyboard.Keys.ALT:
        return false;
      case bot.Keyboard.Keys.META:
      case bot.Keyboard.Keys.META_RIGHT:
      case bot.Keyboard.Keys.CONTEXT_MENU:
        return goog.userAgent.GECKO;
      default:
        return true;
    }
  }
};


/**
 * Maybe submit a form if the ENTER key is released.  On non-FF browsers, firing
 * the keyPress and keyRelease events for the ENTER key does not result in a
 * form being submitted so we have to fire the form submit event as well.
 *
 * @param {bot.Keyboard.Key} key Key.
 * @private
 */
bot.Keyboard.prototype.maybeSubmitForm_ = function(key) {
  if (key != bot.Keyboard.Keys.ENTER) {
    return;
  }
  if (goog.userAgent.GECKO ||
      !bot.dom.isElement(this.getElement(), goog.dom.TagName.INPUT)) {
    return;
  }

  var form = bot.Device.findAncestorForm(this.getElement());
  if (form) {
    var inputs = form.getElementsByTagName('input');
    var hasSubmit = goog.array.some(inputs, function(e) {
      return bot.Device.isFormSubmitElement(e);
    });
    // The second part of this if statement will always include forms on Safari
    // version < 5.
    if (hasSubmit || inputs.length == 1 ||
        (goog.userAgent.WEBKIT && !bot.userAgent.isEngineVersion(534))) {
      this.submitForm(form);
    }
  }
};


/**
 * Maybe edit text when a key is pressed in an editable form.
 *
 * @param {!bot.Keyboard.Key} key Key that was pressed.
 * @private
 */
bot.Keyboard.prototype.maybeEditText_ = function(key) {
  if (key.character) {
    this.updateOnCharacter_(key);
  } else {
    switch (key) {
      case bot.Keyboard.Keys.ENTER:
        this.updateOnEnter_();
        break;
      case bot.Keyboard.Keys.BACKSPACE:
      case bot.Keyboard.Keys.DELETE:
        this.updateOnBackspaceOrDelete_(key);
        break;
      case bot.Keyboard.Keys.LEFT:
      case bot.Keyboard.Keys.RIGHT:
        this.updateOnLeftOrRight_(key);
        break;
      case bot.Keyboard.Keys.HOME:
      case bot.Keyboard.Keys.END:
        this.updateOnHomeOrEnd_(key);
        break;
    }
  }
};


/**
 * Releases the given key on the keyboard. Releasing a key that is not
 * pressed results in an exception.
 *
 * @param {!bot.Keyboard.Key} key Key to release.
 */
bot.Keyboard.prototype.releaseKey = function(key) {
  if (!this.isPressed(key)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot release a key that is not pressed. (' + key.code + ')');
  }
  if (!goog.isNull(key.code)) {
    this.fireKeyEvent_(bot.events.EventType.KEYUP, key);
  }

  this.setKeyPressed_(key, false);
};


/**
 * Given the current state of the SHIFT and CAPS_LOCK key, returns the
 * character that will be typed is the specified key is pressed.
 *
 * @param {!bot.Keyboard.Key} key Key.
 * @return {string} Character to be typed.
 * @private
 */
bot.Keyboard.prototype.getChar_ = function(key) {
  if (!key.character) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR, 'not a character key');
  }
  var shiftPressed = this.isPressed(bot.Keyboard.Keys.SHIFT);
  return /** @type {string} */ (shiftPressed ? key.shiftChar : key.character);
};


/**
 * Whether firing a keypress event causes text to be edited without any
 * additional logic to surgically apply the edit.
 * @private {boolean}
 * @const
 */
bot.Keyboard.KEYPRESS_EDITS_TEXT_ = goog.userAgent.GECKO &&
    !bot.userAgent.isEngineVersion(12);


/**
 * @param {!bot.Keyboard.Key} key Key with character to insert.
 * @private
 */
bot.Keyboard.prototype.updateOnCharacter_ = function(key) {
  if (bot.Keyboard.KEYPRESS_EDITS_TEXT_) {
    return;
  }

  var character = this.getChar_(key);
  var newPos = goog.dom.selection.getStart(this.getElement()) + 1;
  if (bot.Keyboard.supportsSelection(this.getElement())) {
    goog.dom.selection.setText(this.getElement(), character);
    goog.dom.selection.setStart(this.getElement(), newPos);
  } else {
    this.getElement().value += character;
  }
  if (goog.userAgent.WEBKIT) {
    this.fireHtmlEvent(bot.events.EventType.TEXTINPUT);
  }
  if (!bot.userAgent.IE_DOC_PRE9) {
    this.fireHtmlEvent(bot.events.EventType.INPUT);
  }
  this.updateCurrentPos_(newPos);
};


/** @private */
bot.Keyboard.prototype.updateOnEnter_ = function() {
  if (bot.Keyboard.KEYPRESS_EDITS_TEXT_) {
    return;
  }

  // WebKit fires text input regardless of whether a new line is added, see:
  // https://bugs.webkit.org/show_bug.cgi?id=54152
  if (goog.userAgent.WEBKIT) {
    this.fireHtmlEvent(bot.events.EventType.TEXTINPUT);
  }
  if (bot.dom.isElement(this.getElement(), goog.dom.TagName.TEXTAREA)) {
    var newPos = goog.dom.selection.getStart(this.getElement()) +
        bot.Keyboard.NEW_LINE_.length;
    if (bot.Keyboard.supportsSelection(this.getElement())) {
      goog.dom.selection.setText(this.getElement(), bot.Keyboard.NEW_LINE_);
      goog.dom.selection.setStart(this.getElement(), newPos);
    } else {
      this.getElement().value += bot.Keyboard.NEW_LINE_;
    }
    if (!goog.userAgent.IE) {
      this.fireHtmlEvent(bot.events.EventType.INPUT);
    }
    this.updateCurrentPos_(newPos);
  }
};


/**
 * @param {!bot.Keyboard.Key} key Backspace or delete key.
 * @private
 */
bot.Keyboard.prototype.updateOnBackspaceOrDelete_ = function(key) {
  if (bot.Keyboard.KEYPRESS_EDITS_TEXT_) {
    return;
  }

  // Determine what should be deleted.  If text is already selected, that
  // text is deleted, else we move left/right from the current cursor.
  bot.Keyboard.checkCanUpdateSelection_(this.getElement());
  var endpoints = goog.dom.selection.getEndPoints(this.getElement());
  if (endpoints[0] == endpoints[1]) {
    if (key == bot.Keyboard.Keys.BACKSPACE) {
      goog.dom.selection.setStart(this.getElement(), endpoints[1] - 1);
      // On IE, changing goog.dom.selection.setStart also changes the end.
      goog.dom.selection.setEnd(this.getElement(), endpoints[1]);
    } else {
      goog.dom.selection.setEnd(this.getElement(), endpoints[1] + 1);
    }
  }

  // If the endpoints are equal (e.g., the cursor was at the beginning/end
  // of the input), the text field won't be changed.
  endpoints = goog.dom.selection.getEndPoints(this.getElement());
  var textChanged = !(endpoints[0] == this.getElement().value.length ||
                      endpoints[1] == 0);
  goog.dom.selection.setText(this.getElement(), '');

  // Except for IE and GECKO, we need to fire the input event manually, but
  // only if the text was actually changed.
  // Note: Gecko has some strange behavior with the input event.  In a
  //  textarea, backspace always sends an input event, while delete only
  //  sends one if you actually change the text.
  //  In a textbox/password box, backspace always sends an input event unless
  //  the box has no text.  Delete behaves the same way in Firefox 3.0, but
  //  in later versions it only fires an input event if no text changes.
  if (!goog.userAgent.IE && textChanged ||
      (goog.userAgent.GECKO && key == bot.Keyboard.Keys.BACKSPACE)) {
    this.fireHtmlEvent(bot.events.EventType.INPUT);
  }

  // Update the cursor position
  endpoints = goog.dom.selection.getEndPoints(this.getElement());
  this.updateCurrentPos_(endpoints[1]);
};


/**
 * @param {!bot.Keyboard.Key} key Special key to press.
 * @private
 */
bot.Keyboard.prototype.updateOnLeftOrRight_ = function(key) {
  bot.Keyboard.checkCanUpdateSelection_(this.getElement());
  var element = this.getElement();
  var start = goog.dom.selection.getStart(element);
  var end = goog.dom.selection.getEnd(element);

  var newPos, startPos = 0, endPos = 0;
  if (key == bot.Keyboard.Keys.LEFT) {
    if (this.isPressed(bot.Keyboard.Keys.SHIFT)) {
      // If the current position of the cursor is at the start of the
      // selection, pressing left expands the selection one character to the
      // left; otherwise, pressing left collapses it one character to the
      // left.
      if (this.currentPos_ == start) {
        // Never attempt to move further left than the beginning of the text.
        startPos = Math.max(start - 1, 0);
        endPos = end;
        newPos = startPos;
      } else {
        startPos = start;
        endPos = end - 1;
        newPos = endPos;
      }
    } else {
      // With no current selection, pressing left moves the cursor one
      // character to the left; with an existing selection, it collapses the
      // selection to the beginning of the selection.
      newPos = start == end ? Math.max(start - 1, 0) : start;
    }
  } else {  // (key == bot.Keyboard.Keys.RIGHT)
    if (this.isPressed(bot.Keyboard.Keys.SHIFT)) {
      // If the current position of the cursor is at the end of the selection,
      // pressing right expands the selection one character to the right;
      // otherwise, pressing right collapses it one character to the right.
      if (this.currentPos_ == end) {
        startPos = start;
        // Never attempt to move further right than the end of the text.
        endPos = Math.min(end + 1, element.value.length);
        newPos = endPos;
      } else {
        startPos = start + 1;
        endPos = end;
        newPos = startPos;
      }
    } else {
      // With no current selection, pressing right moves the cursor one
      // character to the right; with an existing selection, it collapses the
      // selection to the end of the selection.
      newPos = start == end ? Math.min(end + 1, element.value.length) : end;
    }
  }

  if (this.isPressed(bot.Keyboard.Keys.SHIFT)) {
    goog.dom.selection.setStart(element, startPos);
    // On IE, changing goog.dom.selection.setStart also changes the end.
    goog.dom.selection.setEnd(element, endPos);
  } else {
    goog.dom.selection.setCursorPosition(element, newPos);
  }
  this.updateCurrentPos_(newPos);
};


/**
 * @param {!bot.Keyboard.Key} key Special key to press.
 * @private
 */
bot.Keyboard.prototype.updateOnHomeOrEnd_ = function(key) {
  bot.Keyboard.checkCanUpdateSelection_(this.getElement());
  var element = this.getElement();
  var start = goog.dom.selection.getStart(element);
  var end = goog.dom.selection.getEnd(element);
  // TODO: Handle multiline (TEXTAREA) elements.
  if (key == bot.Keyboard.Keys.HOME) {
    if (this.isPressed(bot.Keyboard.Keys.SHIFT)) {
      goog.dom.selection.setStart(element, 0);
      // If current position is at the end of the selection, typing home
      // changes the selection to begin at the beginning of the text, running
      // to the where the current selection begins.
      var endPos = this.currentPos_ == start ? end : start;
      // On IE, changing goog.dom.selection.setStart also changes the end.
      goog.dom.selection.setEnd(element, endPos);
    } else {
      goog.dom.selection.setCursorPosition(element, 0);
    }
    this.updateCurrentPos_(0);
  } else {  // (key == bot.Keyboard.Keys.END)
    if (this.isPressed(bot.Keyboard.Keys.SHIFT)) {
      if (this.currentPos_ == start) {
        // Current position is at the beginning of the selection. Typing end
        // changes the selection to begin where the current selection ends,
        // running to the end of the text.
        goog.dom.selection.setStart(element, end);
      }
      goog.dom.selection.setEnd(element, element.value.length);
    } else {
      goog.dom.selection.setCursorPosition(element, element.value.length);
    }
    this.updateCurrentPos_(element.value.length);
  }
};


/**
 * Checks that the cursor position can be updated for the given element.
 * @param {!Element} element The element to test.
 * @throws {Error} If the cursor position cannot be updated for the given
 *     element.
 * @see https://code.google.com/p/chromium/issues/detail?id=330456
 * @private
 * @suppress {uselessCode}
 */
bot.Keyboard.checkCanUpdateSelection_ = function(element) {
  try {
    if (typeof element.selectionStart == 'number') {
      return;
    }
  } catch (ex) {
    // The native error message is actually pretty informative, just add a
    // reference to the relevant Chrome bug to provide more context.
    if (ex.message.indexOf('does not support selection.') != -1) {
      // message is a readonly property, so need to rethrow.
      throw Error(ex.message + ' (For more information, see ' +
          'https://code.google.com/p/chromium/issues/detail?id=330456)');
    }
    throw ex;
  }
  throw Error('Element does not support selection');
};


/**
 * @param {!Element} element The element to test.
 * @return {boolean} Whether the given element supports the input element
 *     selection API.
 * @see https://code.google.com/p/chromium/issues/detail?id=330456
 */
bot.Keyboard.supportsSelection = function(element) {
  try {
    bot.Keyboard.checkCanUpdateSelection_(element);
  } catch (ex) {
    return false;
  }
  return true;
};


/**
* @param {number} pos New position of the cursor.
* @private
*/
bot.Keyboard.prototype.updateCurrentPos_ = function(pos) {
  this.currentPos_ = pos;
};


/**
* @param {bot.events.EventType} type Event type.
* @param {!bot.Keyboard.Key} key Key.
* @param {boolean=} opt_preventDefault Whether the default event should be
*     prevented. Defaults to false.
* @return {boolean} Whether the event fired successfully or was cancelled.
* @private
*/
bot.Keyboard.prototype.fireKeyEvent_ = function(type, key, opt_preventDefault) {
  if (goog.isNull(key.code)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Key must have a keycode to be fired.');
  }

  var args = {
    altKey: this.isPressed(bot.Keyboard.Keys.ALT),
    ctrlKey: this.isPressed(bot.Keyboard.Keys.CONTROL),
    metaKey: this.isPressed(bot.Keyboard.Keys.META),
    shiftKey: this.isPressed(bot.Keyboard.Keys.SHIFT),
    keyCode: key.code,
    charCode: (key.character && type == bot.events.EventType.KEYPRESS) ?
        this.getChar_(key).charCodeAt(0) : 0,
    preventDefault: !!opt_preventDefault
  };

  return this.fireKeyboardEvent(type, args);
};


/**
 * Sets focus to the element. If the element does not have focus, place cursor
 * at the end of the text in the element.
 *
 * @param {!Element} element Element that is moved to.
 */
bot.Keyboard.prototype.moveCursor = function(element) {
  this.setElement(element);
  this.editable_ = bot.dom.isEditable(element);

  var focusChanged = this.focusOnElement();
  if (this.editable_ && focusChanged) {
    goog.dom.selection.setCursorPosition(element, element.value.length);
    this.updateCurrentPos_(element.value.length);
  }
};


/**
 * Serialize the current state of the keyboard.
 *
 * @return {bot.Keyboard.State} The current keyboard state.
 */
bot.Keyboard.prototype.getState = function() {
  // Need to use quoted literals here, so the compiler will not rename the
  // properties of the emitted object. When the object is created via the
  // "constructor", we will look for these *specific* properties. Everywhere
  // else internally, we use the dot-notation, so it's okay if the compiler
  // renames the internal variable name.
  return {
    'pressed': this.pressed_.getValues(),
    'currentPos': this.currentPos_
  };
};


/**
 * Returns the state of the modifier keys, to be shared with other input
 * devices.
 *
 * @return {bot.Device.ModifiersState} Modifiers state.
 */
bot.Keyboard.prototype.getModifiersState = function() {
  return this.modifiersState;
};
