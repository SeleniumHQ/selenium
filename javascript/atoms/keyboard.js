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
 * @fileoverview The file contains an abstraction of a keyboad
 * for simulating the presing and releasing of keys.
 *
 *
 *
 */

goog.provide('bot.Keyboard');
goog.provide('bot.Keyboard.Key');
goog.provide('bot.Keyboard.Keys');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.dom');
goog.require('bot.events');
goog.require('goog.array');
goog.require('goog.dom.selection');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.structs.Set');
goog.require('goog.userAgent');



/**
 * A keyboard that provides atomic typing actions.
 *
 * @param {!Element} element Element to type on.
 * @constructor
 */
bot.Keyboard = function(element) {
  /**
   * @type {!Element}
   * @private
   */
  this.element_ = element;

  /**
   * @type {boolean}
   * @private
   */
  this.editable_ = bot.dom.isEditable(element);

  /**
   * @type {!goog.structs.Set.<!bot.Keyboard.Key>}
   * @private
   */
  this.pressed_ = new goog.structs.Set();

  // Start the cursor from the end of the element.
  // TODO(user): Support other starting cursor points?
  if (this.editable_) {
    goog.dom.selection.setCursorPosition(element, element.value.length);
  }
};


/**
 * Maps characters to (key,boolean) pairs, where the key generates the
 * character and the boolean is true when the shift must be pressed.
 *
 * @type {!Object.<string, {key: !bot.Keyboard.Key, shift: boolean}>}
 * @const
 * @private
 */
bot.Keyboard.CHAR_TO_KEY_ = {};


/**
 * Constructs a new key and, if it is a character key, adds a mapping from the
 * character to is in the CHAR_TO_KEY_ map. Using this factory function instead
 * of the new keyword, also helps reduce the size of the compiled Js fragment.
 *
 * @param {?number|{gecko: ?number, ieWebkit: ?number, opera: ?number}} code
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
    } else if (goog.userAgent.OPERA) {
      code = code.opera;
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
      goog.userAgent.WINDOWS ? {gecko: 91, ieWebkit: 91, opera: 219} :
          (goog.userAgent.MAC ? {gecko: 224, ieWebkit: 91, opera: 17} :
              {gecko: 0, ieWebkit: 91, opera: null})),  // Linux
  META_RIGHT: bot.Keyboard.newKey_(
      goog.userAgent.WINDOWS ? {gecko: 92, ieWebkit: 92, opera: 220} :
          (goog.userAgent.MAC ? {gecko: 224, ieWebkit: 93, opera: 17} :
              {gecko: 0, ieWebkit: 92, opera: null})),  // Linux
  CONTEXT_MENU: bot.Keyboard.newKey_(
      goog.userAgent.WINDOWS ? {gecko: 93, ieWebkit: 93, opera: 0} :
          (goog.userAgent.MAC ? {gecko: 0, ieWebkit: 0, opera: 16} :
              {gecko: 93, ieWebkit: null, opera: 0})),  // Linux

  // Numpad keys
  NUM_ZERO: bot.Keyboard.newKey_({gecko: 96, ieWebkit: 96, opera: 48}, '0'),
  NUM_ONE: bot.Keyboard.newKey_({gecko: 97, ieWebkit: 97, opera: 49}, '1'),
  NUM_TWO: bot.Keyboard.newKey_({gecko: 98, ieWebkit: 98, opera: 50}, '2'),
  NUM_THREE: bot.Keyboard.newKey_({gecko: 99, ieWebkit: 99, opera: 51}, '3'),
  NUM_FOUR: bot.Keyboard.newKey_({gecko: 100, ieWebkit: 100, opera: 52}, '4'),
  NUM_FIVE: bot.Keyboard.newKey_({gecko: 101, ieWebkit: 101, opera: 53}, '5'),
  NUM_SIX: bot.Keyboard.newKey_({gecko: 102, ieWebkit: 102, opera: 54}, '6'),
  NUM_SEVEN: bot.Keyboard.newKey_({gecko: 103, ieWebkit: 103, opera: 55}, '7'),
  NUM_EIGHT: bot.Keyboard.newKey_({gecko: 104, ieWebkit: 104, opera: 56}, '8'),
  NUM_NINE: bot.Keyboard.newKey_({gecko: 105, ieWebkit: 105, opera: 57}, '9'),
  NUM_MULTIPLY: bot.Keyboard.newKey_(
      {gecko: 106, ieWebkit: 106, opera: goog.userAgent.LINUX ? 56 : 42}, '*'),
  NUM_PLUS: bot.Keyboard.newKey_(
      {gecko: 107, ieWebkit: 107, opera: goog.userAgent.LINUX ? 61 : 43}, '+'),
  NUM_MINUS: bot.Keyboard.newKey_(
      {gecko: 109, ieWebkit: 109, opera: goog.userAgent.LINUX ? 109 : 45}, '-'),
  NUM_PERIOD: bot.Keyboard.newKey_(
      {gecko: 110, ieWebkit: 110, opera: goog.userAgent.LINUX ? 190 : 78}, '.'),
  NUM_DIVISION: bot.Keyboard.newKey_(
      {gecko: 111, ieWebkit: 111, opera: goog.userAgent.LINUX ? 191 : 47}, '/'),
  NUM_LOCK: bot.Keyboard.newKey_(
      (goog.userAgent.LINUX && goog.userAgent.OPERA) ? null : 144),

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
      {gecko: 107, ieWebkit: 187, opera: 61}, '=', '+'),
  HYPHEN: bot.Keyboard.newKey_(
      {gecko: 109, ieWebkit: 189, opera: 109}, '-', '_'),
  COMMA: bot.Keyboard.newKey_(188, ',', '<'),
  PERIOD: bot.Keyboard.newKey_(190, '.', '>'),
  SLASH: bot.Keyboard.newKey_(191, '/', '?'),
  BACKTICK: bot.Keyboard.newKey_(192, '`', '~'),
  OPEN_BRACKET: bot.Keyboard.newKey_(219, '[', '{'),
  BACKSLASH: bot.Keyboard.newKey_(220, '\\', '|'),
  CLOSE_BRACKET: bot.Keyboard.newKey_(221, ']', '}'),
  SEMICOLON: bot.Keyboard.newKey_(
      {gecko: 59, ieWebkit: 186, opera: 59}, ';', ':'),
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
    var key = bot.Keyboard.newKey_(0, ch.toLowerCase(), ch.toUpperCase());
    keyShiftPair = {key: key, shift: (ch != key.character)};
  }
  return keyShiftPair;
};


/**
 * Array of modifier keys.
 *
 * @type {!Array.<bot.Keyboard.Key>}
 * @const
 */
bot.Keyboard.MODIFIERS = [
  bot.Keyboard.Keys.ALT,
  bot.Keyboard.Keys.CONTROL,
  bot.Keyboard.Keys.META,
  bot.Keyboard.Keys.SHIFT
];


/**
 * The value used for newlines in the current browser/OS combination.
 * @type {string}
 * @private
 * @const
 */
bot.Keyboard.NEW_LINE_ =
    goog.userAgent.IE || goog.userAgent.OPERA ? '\r\n' : '\n';


/**
 * Returns whether the key is currently pressed.
 *
 * @param {bot.Keyboard.Key} key Key.
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
  if (this.isPressed(key) && goog.array.contains(bot.Keyboard.MODIFIERS, key)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot press a modifier key that is already pressed.');
  }

  if (!goog.isNull(key.code)) {
    this.fireKeyEvent_(goog.events.EventType.KEYDOWN, key);
    if (this.requiresKeyPress_(key)) {
      this.fireKeyEvent_(goog.events.EventType.KEYPRESS, key);
    }

    if (this.editable_) {
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
        }
      }
    }
  }

  this.pressed_.add(key);
};


/**
 * Whether the given key currently requires a keypress.
 * TODO(user): Make this dependent on the state of the modifier keys.
 *
 * @param {bot.Keyboard.Key} key Key.
 * @return {boolean} Whether it requires a keypress event.
 * @private
 */
bot.Keyboard.prototype.requiresKeyPress_ = function(key) {
  if (key.character || key == bot.Keyboard.Keys.ENTER) {
    return true;
  } else if (goog.userAgent.WEBKIT) {
    return false;
  } else if (goog.userAgent.IE) {
    return key == bot.Keyboard.Keys.ESC;
  } else { // Gecko and Opera
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
 * Releases the given key on the keyboard. Releasing a key that is not
 * pressed results in an exception.
 *
 * @param {!bot.Keyboard.Key} key Key to release.
 */
bot.Keyboard.prototype.releaseKey = function(key) {;
  if (!this.isPressed(key)) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'Cannot release a key that is not pressed.');
  }
  if (!goog.isNull(key.code)) {
    this.fireKeyEvent_(goog.events.EventType.KEYUP, key);
  }
  this.pressed_.remove(key);
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
 * @param {!bot.Keyboard.Key} key Key with character to insert.
 * @private
 */
bot.Keyboard.prototype.updateOnCharacter_ = function(key) {
  // Gecko updates the element as a result of the keypress.
  if (goog.userAgent.GECKO) {
    return;
  }

  var character = this.getChar_(key);
  goog.dom.selection.setText(this.element_, character);
  goog.dom.selection.setStart(this.element_,
                              goog.dom.selection.getStart(this.element_) + 1);
  if (goog.userAgent.WEBKIT) {
    bot.events.fire(this.element_, 'textInput');
  }
  if (!goog.userAgent.IE) {
    bot.events.fire(this.element_, goog.events.EventType.INPUT);
  }
};


/**
 * @private
 */
bot.Keyboard.prototype.updateOnEnter_ = function() {
  // Gecko updates the element as a result of the keypress.
  if (goog.userAgent.GECKO) {
    return;
  }

  // WebKit fires text input regardless of whether a new line is added, see:
  // https://bugs.webkit.org/show_bug.cgi?id=54152
  if (goog.userAgent.WEBKIT) {
    bot.events.fire(this.element_, 'textInput');
  }
  if (bot.dom.isElement(this.element_, goog.dom.TagName.TEXTAREA)) {
    goog.dom.selection.setText(this.element_, bot.Keyboard.NEW_LINE_);
    goog.dom.selection.setStart(this.element_,
        goog.dom.selection.getStart(this.element_) +
        bot.Keyboard.NEW_LINE_.length);
    if (!goog.userAgent.IE) {
      bot.events.fire(this.element_, goog.events.EventType.INPUT);
    }
  }
};


/**
 * @param {!bot.Keyboard.Key} key Backspace or delete key.
 * @private
 */
bot.Keyboard.prototype.updateOnBackspaceOrDelete_ = function(key) {
  // Gecko updates the element as a result of the keypress.
  if (goog.userAgent.GECKO) {
    return;
  }

  // Determine what should be deleted.  If text is already selected, that
  // text is deleted, else we move left/right from the current cursor.
  var endpoints = goog.dom.selection.getEndPoints(this.element_);
  if (key == bot.Keyboard.Keys.BACKSPACE && endpoints[0] == endpoints[1]) {
    goog.dom.selection.setStart(this.element_, endpoints[1] - 1);
    // On IE, changing goog.dom.selection.setStart also changes the end.
    goog.dom.selection.setEnd(this.element_, endpoints[1]);
  } else {
    goog.dom.selection.setEnd(this.element_, endpoints[1] + 1);
  }

  // If the endpoints are equal (e.g., the cursor was at the beginning/end
  // of the input), the text field won't be changed.
  endpoints = goog.dom.selection.getEndPoints(this.element_);
  var textChanged = !(endpoints[0] == this.element_.value.length ||
                      endpoints[1] == 0);
  goog.dom.selection.setText(this.element_, '');

  // Except for IE and GECKO, we need to fire the input event manually, but
  // only if the text was actually changed.
  // Note: Gecko has some strange behavior with the input event.  In a
  //  textarea, backspace always sends an input event, while delete only
  //  sends one if you actually change the text.
  //  In a textbox/password box, backspace always sends an input event unless
  //  the box has no text.  Delete behaves the same way in Firefox 3.0, but
  //  in later versions it only fires an input event if no text changes.
  if (!goog.userAgent.IE && textChanged) {
    bot.events.fire(this.element_, goog.events.EventType.INPUT);
  }
};


/**
 * @param {!bot.Keyboard.Key} key Special key to press.
 * @private
 */
bot.Keyboard.prototype.updateOnLeftOrRight_ = function(key) {
  var start = goog.dom.selection.getStart(this.element_);
  if (key == bot.Keyboard.Keys.LEFT) {
    goog.dom.selection.setCursorPosition(this.element_, start - 1);
  } else {  // (key == bot.Keyboard.Keys.RIGHT)
    goog.dom.selection.setCursorPosition(this.element_, start + 1);
  }
};


/**
 * @param {string} type Event type.
 * @param {!bot.Keyboard.Key} key Key.
 * @private
 */
bot.Keyboard.prototype.fireKeyEvent_ = function(type, key) {
  var args = {
    alt: this.isPressed(bot.Keyboard.Keys.ALT),
    ctrl: this.isPressed(bot.Keyboard.Keys.CONTROL),
    meta: this.isPressed(bot.Keyboard.Keys.META),
    shift: this.isPressed(bot.Keyboard.Keys.SHIFT)
  };

  var isKeyPress = (type == goog.events.EventType.KEYPRESS);
  var isKeyPressChar = isKeyPress && key.character;
  var code = isKeyPressChar ? this.getChar_(key).charCodeAt(0) : key.code;

  if (goog.userAgent.GECKO) {
    args.keyCode = isKeyPressChar ? 0 : code;
    args.charCode = isKeyPressChar ? code : 0;
  } else if (goog.userAgent.WEBKIT) {
    args.keyCode = code;
    args.charCode = isKeyPress ? code : 0;
  } else { // IE and Opera
    args.keyCode = code;
  }

  args = /** @type {bot.events.KeyboardArgs} */ args;
  bot.events.fire(this.element_, type, args);
};
