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

'use strict';

/**
 * @fileoverview Defines types related to user input with the WebDriver API.
 */

const {InvalidArgumentError} = require('./error');

/**
 * Enumeration of the buttons used in the advanced interactions API.
 * @enum {number}
 */
const Button = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};



/**
 * Representations of pressable keys that aren't text.  These are stored in
 * the Unicode PUA (Private Use Area) code points, 0xE000-0xF8FF.  Refer to
 * http://www.google.com.au/search?&q=unicode+pua&btnG=Search
 *
 * @enum {string}
 * @see <https://www.w3.org/TR/webdriver/#keyboard-actions>
 */
const Key = {
  NULL:         '\uE000',
  CANCEL:       '\uE001',  // ^break
  HELP:         '\uE002',
  BACK_SPACE:   '\uE003',
  TAB:          '\uE004',
  CLEAR:        '\uE005',
  RETURN:       '\uE006',
  ENTER:        '\uE007',
  SHIFT:        '\uE008',
  CONTROL:      '\uE009',
  ALT:          '\uE00A',
  PAUSE:        '\uE00B',
  ESCAPE:       '\uE00C',
  SPACE:        '\uE00D',
  PAGE_UP:      '\uE00E',
  PAGE_DOWN:    '\uE00F',
  END:          '\uE010',
  HOME:         '\uE011',
  ARROW_LEFT:   '\uE012',
  LEFT:         '\uE012',
  ARROW_UP:     '\uE013',
  UP:           '\uE013',
  ARROW_RIGHT:  '\uE014',
  RIGHT:        '\uE014',
  ARROW_DOWN:   '\uE015',
  DOWN:         '\uE015',
  INSERT:       '\uE016',
  DELETE:       '\uE017',
  SEMICOLON:    '\uE018',
  EQUALS:       '\uE019',

  NUMPAD0:      '\uE01A',  // number pad keys
  NUMPAD1:      '\uE01B',
  NUMPAD2:      '\uE01C',
  NUMPAD3:      '\uE01D',
  NUMPAD4:      '\uE01E',
  NUMPAD5:      '\uE01F',
  NUMPAD6:      '\uE020',
  NUMPAD7:      '\uE021',
  NUMPAD8:      '\uE022',
  NUMPAD9:      '\uE023',
  MULTIPLY:     '\uE024',
  ADD:          '\uE025',
  SEPARATOR:    '\uE026',
  SUBTRACT:     '\uE027',
  DECIMAL:      '\uE028',
  DIVIDE:       '\uE029',

  F1:           '\uE031',  // function keys
  F2:           '\uE032',
  F3:           '\uE033',
  F4:           '\uE034',
  F5:           '\uE035',
  F6:           '\uE036',
  F7:           '\uE037',
  F8:           '\uE038',
  F9:           '\uE039',
  F10:          '\uE03A',
  F11:          '\uE03B',
  F12:          '\uE03C',

  COMMAND:      '\uE03D',  // Apple command key
  META:         '\uE03D',  // alias for Windows key

  /**
   * Japanese modifier key for switching between full- and half-width
   * characters.
   * @see <https://en.wikipedia.org/wiki/Language_input_keys>
   */
  ZENKAKU_HANKAKU: '\uE040',
};


/**
 * Simulate pressing many keys at once in a "chord". Takes a sequence of
 * {@linkplain Key keys} or strings, appends each of the values to a string,
 * adds the chord termination key ({@link Key.NULL}) and returns the resulting
 * string.
 *
 * Note: when the low-level webdriver key handlers see Keys.NULL, active
 * modifier keys (CTRL/ALT/SHIFT/etc) release via a keyup event.
 *
 * @param {...string} keys The key sequence to concatenate.
 * @return {string} The null-terminated key sequence.
 */
Key.chord = function(...keys) {
  return keys.join('') + Key.NULL;
};


/**
 * Used with {@link ./webelement.WebElement#sendKeys WebElement#sendKeys} on
 * file input elements (`<input type="file">`) to detect when the entered key
 * sequence defines the path to a file.
 *
 * By default, {@linkplain ./webelement.WebElement WebElement's} will enter all
 * key sequences exactly as entered. You may set a
 * {@linkplain ./webdriver.WebDriver#setFileDetector file detector} on the
 * parent WebDriver instance to define custom behavior for handling file
 * elements. Of particular note is the
 * {@link selenium-webdriver/remote.FileDetector}, which should be used when
 * running against a remote
 * [Selenium Server](http://docs.seleniumhq.org/download/).
 */
class FileDetector {

  /**
   * Handles the file specified by the given path, preparing it for use with
   * the current browser. If the path does not refer to a valid file, it will
   * be returned unchanged, otherwise a path suitable for use with the current
   * browser will be returned.
   *
   * This default implementation is a no-op. Subtypes may override this function
   * for custom tailored file handling.
   *
   * @param {!./webdriver.WebDriver} driver The driver for the current browser.
   * @param {string} path The path to process.
   * @return {!Promise<string>} A promise for the processed file path.
   * @package
   */
  handleFile(driver, path) {
    return Promise.resolve(path);
  }
}


/** @record */
function Action() {}

/** @type {!ActionType} */
Action.prototype.type;

/** @type {(number|undefined)} */
Action.prototype.duration;

/** @type {(string|undefined)} */
Action.prototype.value;

/** @type {(Button|undefined)} */
Action.prototype.button;


/**
 * Device types supported by the WebDriver protocol.
 *
 * @enum {string}
 * @see https://w3c.github.io/webdriver/webdriver-spec.html#input-source-state
 */
const DeviceType = {
  KEY: 'key',
  NONE: 'none',
  POINTER: 'pointer'
};


/**
 * Represents a user input device.
 *
 * @abstract
 */
class Device {
  /**
   * @param {DeviceType} type the input type.
   * @param {string} id a unique ID for this device.
   */
  constructor(type, id) {
    /** @private @const */ this.type_ = type;
    /** @private @const */ this.id_ = id;
  }

  /** @return {!Object} the JSON encoding for this device. */
  toJSON() {
    return {'type': this.type_, 'id': this.id_};
  }
}


/**
 * Keyboard input device.
 *
 * @final
 * @see <https://www.w3.org/TR/webdriver/#dfn-key-input-source>
 */
class Keyboard extends Device {
  /** @param {string} id the device ID. */
  constructor(id) {
    super(DeviceType.KEY, id);
  }
}


/**
 * Pointer input device.
 *
 * @final
 * @see <https://www.w3.org/TR/webdriver/#dfn-pointer-input-source>
 */
class Pointer extends Device {
  /**
   * @param {string} id the device ID.
   * @param {Pointer.Type} type the pointer type.
   */
  constructor(id, type) {
    super(DeviceType.POINTER, id);
    /** @private @const */ this.pointerType_ = type;
  }

  /** @override */
  toJSON() {
    return Object.assign(
        {'parameters': {'pointerType': this.pointerType_}},
        super.toJSON());
  }
}


/**
 * The supported types of pointers.
 * @enum {string}
 */
Pointer.Type = {
  MOUSE: 'mouse',
  PEN: 'pen',
  TOUCH: 'touch'
};


/** @enum {string} */
const ActionType = {
  KEY_DOWN: 'keyDown',
  KEY_UP: 'keyUp',
  PAUSE: 'pause',
  POINTER_DOWN: 'pointerDown',
  POINTER_UP: 'pointerUp',
  POINTER_MOVE: 'pointerMove',
  POINTER_CANCEL: 'pointerCancel'
};


/**
 * Defines a sequence of actions to perform with an individual input device.
 *
 * @see <https://www.w3.org/TR/webdriver/#actions>
 */
class Sequence {
  /** @param {!Device} device the device to generate this action sequence. */
  constructor(device) {
    /** @private @const */
    this.device_ = device;

    /** @private @const {!Array<!Action>} */
    this.actions_ = [];
  }

  /**
   * Clears all actions in this sequence.
   * @final
   */
  clear() {
    this.actions_.length = 0;
  }

  /**
   * @return {number} the length of this action sequence.
   * @final
   */
  length() {
    return this.actions_.length;
  }

  /**
   * @return {boolean} whether this sequence is empty or contains only
   *     {@linkplain #pause pause} actions.
   * @final
   */
  isIdle() {
    return this.length() == 0
        || this.actions_.every(action => action.type === ActionType.PAUSE);
  }

  /**
   * Inserts a pause action into this action sequence.
   *
   * @param {number=} duration the length of a pause to take, in milliseconds.
   *     If omitted or 0, the device will pause for the entire "tick".
   * @return {THIS} a self reference.
   * @this {THIS}
   * @template THIS
   */
  pause(duration = 0) {
    this.actions_.push({type: ActionType.PAUSE, duration});
    return this;
  }

  /** @return {!Object} the JSON encoding for this action sequence. */
  toJSON() {
    const actions = this.actions_;
    return Object.assign({actions}, this.device_.toJSON());
  }
}


/**
 * Defines a sequence of key input actions.
 *
 * @final
 */
class KeySequence extends Sequence {
  /** @param {!Keyboard} keyboard the keyboard to use. */
  constructor(keyboard) {
    super(keyboard);
  }

  /**
   * @param {(string|Key|number)} key
   * @return {string}
   * @throws {!(InvalidArgumentError|RangeError)}
   * @private
   */
  static checkCodePoint_(key) {
    if (typeof key === 'number') {
      return String.fromCodePoint(key);
    }

    if (typeof key !== 'string') {
      throw new InvalidArgumentError(`key is not a string: ${key}`);
    }

    if (Array.from(key.normalize()).length != 1) {
      throw new InvalidArgumentError(
          `key input is not a single code point: ${key}`);
    }
    return key;
  }

  /**
   * Records an action to press a single key.
   * @param {(Key|string|number)} key the key to press. This key may be
   *     specified as a {@link Key} value, a specific unicode code point,
   *     or a string containing a single unicode code point.
   * @return {!KeySequence} a self reference.
   */
  keyDown(key) {
    this.actions_.push({
      type: ActionType.KEY_DOWN,
      value: KeySequence.checkCodePoint_(key)
    });
    return this;
  }

  /**
   * Records an action to release a single key.
   * @param {(Key|string|number)} key the key to release. This key may be
   *     specified as a {@link Key} value, a specific unicode code point,
   *     or a string containing a single unicode code point.
   * @return {!KeySequence} a self reference.
   */
  keyUp(key) {
    this.actions_.push({
      type: ActionType.KEY_UP,
      value: KeySequence.checkCodePoint_(key)
    });
    return this;
  }

  /**
   * Records a sequence of actions to type the provided key sequence.
   * For each key, this will record a pair of {@linkplain #keyDown keyDown}
   * and {@linkplain #keyUp keyUp} actions. An implication of this pairing
   * is that modifier keys (e.g. {@link ./input.Key.SHIFT Key.SHIFT}) will
   * always be immediately released. In other words, `sendKeys(Key.SHIFT, 'a')`
   * is the same as typing `sendKeys('a')`, _not_ `sendKeys('A')`.
   *
   * @param {...(Key|string|number)} keys the keys to type.
   * @return {!KeySequence} a self reference.
   */
  sendKeys(...keys) {
    for (const key of keys) {
      if (typeof key === 'string') {
        for (const symbol of key) {
          this.keyDown(symbol);
          this.keyUp(symbol);
        }
      } else {
        this.keyDown(key);
        this.keyUp(key);
      }
    }
    return this;
  }
}


/**
 * Defines the reference point from which to compute offsets for
 * {@linkplain PointerSequence#pointerMove pointer move} actions.
 *
 * @enum {string}
 */
const Origin = {
  /** Compute offsets relative to the pointer's current position. */
  POINTER: 'pointer',
  /** Compute offsets relative to the viewport. */
  VIEWPORT: 'viewport'
};


/**
 * Defines a sequence of pointer input actions.
 *
 * @final
 */
class PointerSequence extends Sequence {
  /** @param {!Pointer} pointer the pointer to use. */
  constructor(pointer) {
    super(pointer);
  }

  /**
   * Cancels a pointer action.
   * @return {!PointerSequence} a self reference.
   */
  pointerCancel() {
    this.actions_.push({type: ActionType.POINTER_CANCEL});
    return this;
  }

  /**
   * Records an action for pressing a pointer button.
   *
   * @param {Button=} button the button to press; this may be omitted for
   *    {@link Pointer.Type.PEN} and {@link Pointer.Type.TOUCH} devices.
   * @return {!PointerSequence} a self reference.
   */
  pointerDown(button = Button.LEFT) {
    this.actions_.push({type: ActionType.POINTER_DOWN, button});
    return this;
  }

  /**
   * Records an action for releasing a pointer button.
   *
   * @param {Button=} button the button to release; this may be omitted for
   *    {@link Pointer.Type.PEN} and {@link Pointer.Type.TOUCH} devices.
   * @return {!PointerSequence} a self reference.
   */
  pointerUp(button = Button.LEFT) {
    this.actions_.push({type: ActionType.POINTER_UP, button});
    return this;
  }

  /**
   * Records an action for moving the pointer `x` and `y` pixels from the
   * specified `origin`. The `origin` may be defined as the pointer's
   * {@linkplain Origin.POINTER current position}, the
   * {@linkplain Origin.VIEWPORT viewport}, or the center of a specific
   * {@linkplain ./webdriver.WebElement WebElement}.
   *
   * @param {{
   *   x: number,
   *   y: number,
   *   duration: (number|undefined),
   *   origin: (!Origin|!./webdriver.WebElement|undefined),
   * }} options the move options.
   * @return {!PointerSequence} a self reference.
   */
  pointerMove({x, y, duration = 100, origin = Origin.VIEWPORT}) {
    this.actions_.push({
      type: ActionType.POINTER_MOVE,
      origin,
      duration,
      x,
      y
    });
    return this;
  }

  /**
   * Short-hand for performing a simple click (down/up) with this pointer.
   *
   * @param {./webdriver.WebElement=} element the element on which to click.
   *     If specified, the pointer will first be moved to the center of the
   *     the element.
   * @return {!PointerSequence} a self reference.
   */
  click(element = undefined) {
    if (element) {
      this.pointerMove({x: 0, y: 0, origin: element});
    }
    this.pointerDown();
    this.pointerUp();
    return this;
  }

  /**
   * Short-hand for performing a simple double-click with this pointer.
   *
   * @param {./webdriver.WebElement=} element the element on which to click.
   *     If specified, the pointer will first be moved to the center of the
   *     the element.
   * @return {!PointerSequence} a self reference.
   */
  doubleClick(element = undefined) {
    return this.click(element).click();
  }
}


// PUBLIC API


module.exports = {
  Button,
  Device,
  Key,
  Keyboard,
  KeySequence,
  FileDetector,
  Origin,
  Pointer,
  PointerSequence,
  Sequence,
};
