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
 * @fileoverview The file contains an abstraction of a keyboard
 * for simulating the pressing and releasing of keys.
 */

import { BotError, ErrorCode } from './error';
import {
  Device,
  Modifier,
  ModifiersState,
  findAncestorForm,
  isFormSubmitElement,
} from './device';
import { isElement, isEditable } from './dom';
import { EventType, EventFactory } from './events';
import { GECKO, WEBKIT, IE, EDGE, isEngineVersion, IE_DOC_PRE9 } from './userAgent';

// Browser detection
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_WINDOWS = /Windows/.test(userAgent);
const IS_MAC = /Macintosh/.test(userAgent);

// ============================================================================
// Key Class
// ============================================================================

/**
 * Maps characters to (key,boolean) pairs, where the key generates the
 * character and the boolean is true when the shift must be pressed.
 */
const CHAR_TO_KEY_: Record<string, { key: Key; shift: boolean }> = {};

/**
 * A key on the keyboard.
 */
export class Key {
  code: number | null;
  character: string | null;
  shiftChar: string | null;

  constructor(code: number | null, character?: string, shiftChar?: string) {
    this.code = code;
    this.character = character || null;
    this.shiftChar = shiftChar || this.character;
  }

  /**
   * Given a character, returns a pair of a key and a boolean: the key being one
   * that types the character and the boolean indicating whether the key must be
   * shifted to type it.
   */
  static fromChar(ch: string): { key: Key; shift: boolean } {
    if (ch.length !== 1) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Argument not a single character: ' + ch
      );
    }
    let keyShiftPair = CHAR_TO_KEY_[ch];
    if (!keyShiftPair) {
      const upperCase = ch.toUpperCase();
      const keyCode = upperCase.charCodeAt(0);
      const key = newKey_(keyCode, ch.toLowerCase(), upperCase);
      keyShiftPair = { key: key, shift: ch !== key.character };
    }
    return keyShiftPair;
  }
}

/**
 * Constructs a new key and, if it is a character key, adds a mapping from the
 * character to it in the CHAR_TO_KEY_ map.
 */
function newKey_(
  code: number | null | { gecko: number | null; ieWebkit: number | null },
  character?: string,
  shiftChar?: string
): Key {
  if (code !== null && typeof code === 'object') {
    if (GECKO) {
      code = code.gecko;
    } else {
      code = code.ieWebkit;
    }
  }
  const key = new Key(code as number | null, character, shiftChar);

  if (character && (!(character in CHAR_TO_KEY_) || shiftChar)) {
    CHAR_TO_KEY_[character] = { key: key, shift: false };
    if (shiftChar) {
      CHAR_TO_KEY_[shiftChar] = { key: key, shift: true };
    }
  }

  return key;
}

// ============================================================================
// Keys Definition
// ============================================================================

/**
 * The set of keys known to this module.
 */
export const Keys = {
  BACKSPACE: newKey_(8),
  TAB: newKey_(9),
  ENTER: newKey_(13),
  SHIFT: newKey_(16),
  CONTROL: newKey_(17),
  ALT: newKey_(18),
  PAUSE: newKey_(19),
  CAPS_LOCK: newKey_(20),
  ESC: newKey_(27),
  SPACE: newKey_(32, ' '),
  PAGE_UP: newKey_(33),
  PAGE_DOWN: newKey_(34),
  END: newKey_(35),
  HOME: newKey_(36),
  LEFT: newKey_(37),
  UP: newKey_(38),
  RIGHT: newKey_(39),
  DOWN: newKey_(40),
  PRINT_SCREEN: newKey_(44),
  INSERT: newKey_(45),
  DELETE: newKey_(46),

  // Number keys
  ZERO: newKey_(48, '0', ')'),
  ONE: newKey_(49, '1', '!'),
  TWO: newKey_(50, '2', '@'),
  THREE: newKey_(51, '3', '#'),
  FOUR: newKey_(52, '4', '$'),
  FIVE: newKey_(53, '5', '%'),
  SIX: newKey_(54, '6', '^'),
  SEVEN: newKey_(55, '7', '&'),
  EIGHT: newKey_(56, '8', '*'),
  NINE: newKey_(57, '9', '('),

  // Letter keys
  A: newKey_(65, 'a', 'A'),
  B: newKey_(66, 'b', 'B'),
  C: newKey_(67, 'c', 'C'),
  D: newKey_(68, 'd', 'D'),
  E: newKey_(69, 'e', 'E'),
  F: newKey_(70, 'f', 'F'),
  G: newKey_(71, 'g', 'G'),
  H: newKey_(72, 'h', 'H'),
  I: newKey_(73, 'i', 'I'),
  J: newKey_(74, 'j', 'J'),
  K: newKey_(75, 'k', 'K'),
  L: newKey_(76, 'l', 'L'),
  M: newKey_(77, 'm', 'M'),
  N: newKey_(78, 'n', 'N'),
  O: newKey_(79, 'o', 'O'),
  P: newKey_(80, 'p', 'P'),
  Q: newKey_(81, 'q', 'Q'),
  R: newKey_(82, 'r', 'R'),
  S: newKey_(83, 's', 'S'),
  T: newKey_(84, 't', 'T'),
  U: newKey_(85, 'u', 'U'),
  V: newKey_(86, 'v', 'V'),
  W: newKey_(87, 'w', 'W'),
  X: newKey_(88, 'x', 'X'),
  Y: newKey_(89, 'y', 'Y'),
  Z: newKey_(90, 'z', 'Z'),

  // Branded keys
  META: newKey_(
    IS_WINDOWS
      ? { gecko: 91, ieWebkit: 91 }
      : IS_MAC
        ? { gecko: 224, ieWebkit: 91 }
        : { gecko: 0, ieWebkit: 91 }
  ),
  META_RIGHT: newKey_(
    IS_WINDOWS
      ? { gecko: 92, ieWebkit: 92 }
      : IS_MAC
        ? { gecko: 224, ieWebkit: 93 }
        : { gecko: 0, ieWebkit: 92 }
  ),
  CONTEXT_MENU: newKey_(
    IS_WINDOWS
      ? { gecko: 93, ieWebkit: 93 }
      : IS_MAC
        ? { gecko: 0, ieWebkit: 0 }
        : { gecko: 93, ieWebkit: null }
  ),

  // Numpad keys
  NUM_ZERO: newKey_({ gecko: 96, ieWebkit: 96 }, '0'),
  NUM_ONE: newKey_({ gecko: 97, ieWebkit: 97 }, '1'),
  NUM_TWO: newKey_({ gecko: 98, ieWebkit: 98 }, '2'),
  NUM_THREE: newKey_({ gecko: 99, ieWebkit: 99 }, '3'),
  NUM_FOUR: newKey_({ gecko: 100, ieWebkit: 100 }, '4'),
  NUM_FIVE: newKey_({ gecko: 101, ieWebkit: 101 }, '5'),
  NUM_SIX: newKey_({ gecko: 102, ieWebkit: 102 }, '6'),
  NUM_SEVEN: newKey_({ gecko: 103, ieWebkit: 103 }, '7'),
  NUM_EIGHT: newKey_({ gecko: 104, ieWebkit: 104 }, '8'),
  NUM_NINE: newKey_({ gecko: 105, ieWebkit: 105 }, '9'),
  NUM_MULTIPLY: newKey_({ gecko: 106, ieWebkit: 106 }, '*'),
  NUM_PLUS: newKey_({ gecko: 107, ieWebkit: 107 }, '+'),
  NUM_MINUS: newKey_({ gecko: 109, ieWebkit: 109 }, '-'),
  NUM_PERIOD: newKey_({ gecko: 110, ieWebkit: 110 }, '.'),
  NUM_DIVISION: newKey_({ gecko: 111, ieWebkit: 111 }, '/'),
  NUM_LOCK: newKey_(144),

  // Function keys
  F1: newKey_(112),
  F2: newKey_(113),
  F3: newKey_(114),
  F4: newKey_(115),
  F5: newKey_(116),
  F6: newKey_(117),
  F7: newKey_(118),
  F8: newKey_(119),
  F9: newKey_(120),
  F10: newKey_(121),
  F11: newKey_(122),
  F12: newKey_(123),

  // Punctuation keys
  EQUALS: newKey_({ gecko: 107, ieWebkit: 187 }, '=', '+'),
  SEPARATOR: newKey_(108, ','),
  HYPHEN: newKey_({ gecko: 109, ieWebkit: 189 }, '-', '_'),
  COMMA: newKey_(188, ',', '<'),
  PERIOD: newKey_(190, '.', '>'),
  SLASH: newKey_(191, '/', '?'),
  BACKTICK: newKey_(192, '`', '~'),
  OPEN_BRACKET: newKey_(219, '[', '{'),
  BACKSLASH: newKey_(220, '\\', '|'),
  CLOSE_BRACKET: newKey_(221, ']', '}'),
  SEMICOLON: newKey_({ gecko: 59, ieWebkit: 186 }, ';', ':'),
  APOSTROPHE: newKey_(222, "'", '"'),
} as const;

export type KeysType = typeof Keys;

/**
 * Array of modifier keys.
 */
export const MODIFIERS: Key[] = [Keys.ALT, Keys.CONTROL, Keys.META, Keys.SHIFT];

/**
 * Map of modifier to key.
 */
const MODIFIER_TO_KEY_MAP_: Map<Modifier, Key> = new Map([
  [Modifier.SHIFT, Keys.SHIFT],
  [Modifier.CONTROL, Keys.CONTROL],
  [Modifier.ALT, Keys.ALT],
  [Modifier.META, Keys.META],
]);

/**
 * Map of key code to modifier.
 */
const KEY_TO_MODIFIER_: Map<number, Modifier> = new Map();
MODIFIER_TO_KEY_MAP_.forEach((key, modifier) => {
  if (key.code !== null) {
    KEY_TO_MODIFIER_.set(key.code, modifier);
  }
});

/**
 * The value used for newlines in the current browser/OS combination.
 */
const NEW_LINE_ = IE ? '\r\n' : '\n';

/**
 * Whether firing a keypress event causes text to be edited without any
 * additional logic to surgically apply the edit.
 */
const KEYPRESS_EDITS_TEXT_ = GECKO && !isEngineVersion(12);

// ============================================================================
// Selection helpers (replacing goog.dom.selection)
// ============================================================================

function useSelectionProperties_(
  element: HTMLInputElement | HTMLTextAreaElement
): boolean {
  try {
    return typeof element.selectionStart === 'number';
  } catch {
    return false;
  }
}

function getSelectionStart(element: HTMLInputElement | HTMLTextAreaElement): number {
  try {
    return element.selectionStart ?? 0;
  } catch {
    return 0;
  }
}

function getSelectionEnd(element: HTMLInputElement | HTMLTextAreaElement): number {
  try {
    return element.selectionEnd ?? 0;
  } catch {
    return 0;
  }
}

function getEndPoints(
  element: HTMLInputElement | HTMLTextAreaElement
): [number, number] {
  return [getSelectionStart(element), getSelectionEnd(element)];
}

function setSelectionStart(
  element: HTMLInputElement | HTMLTextAreaElement,
  start: number
): void {
  if (useSelectionProperties_(element)) {
    element.selectionStart = start;
  }
}

function setSelectionEnd(
  element: HTMLInputElement | HTMLTextAreaElement,
  end: number
): void {
  if (useSelectionProperties_(element)) {
    element.selectionEnd = end;
  }
}

function setCursorPosition(
  element: HTMLInputElement | HTMLTextAreaElement,
  pos: number
): void {
  if (useSelectionProperties_(element)) {
    element.selectionStart = pos;
    element.selectionEnd = pos;
  }
}

function setSelectedText(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string
): void {
  if (useSelectionProperties_(element)) {
    const start = getSelectionStart(element);
    const end = getSelectionEnd(element);
    const value = element.value;
    element.value = value.substring(0, start) + text + value.substring(end);
    element.selectionStart = start;
    element.selectionEnd = start + text.length;
  }
}

// ============================================================================
// Keyboard State
// ============================================================================

/**
 * Describes the current state of a keyboard.
 */
export interface KeyboardState {
  pressed: Key[];
  currentPos: number;
}

// ============================================================================
// Keyboard Class
// ============================================================================

/**
 * A keyboard that provides atomic typing actions.
 */
export class Keyboard extends Device {
  private editable_: boolean;
  private currentPos_: number = 0;
  private pressed_: Set<Key> = new Set();

  constructor(opt_state?: KeyboardState) {
    super();

    this.editable_ = isEditable(this.getElement());

    if (opt_state) {
      if (opt_state.pressed) {
        opt_state.pressed.forEach((key) => {
          this.setKeyPressed_(key, true);
        });
      }
      this.currentPos_ = opt_state.currentPos || 0;
    }
  }

  /**
   * Set the modifier state if the provided key is one, otherwise just add
   * to the list of pressed keys.
   */
  private setKeyPressed_(key: Key, isPressed: boolean): void {
    if (MODIFIERS.includes(key)) {
      const modifier = KEY_TO_MODIFIER_.get(key.code!);
      if (modifier !== undefined) {
        this.modifiersState.setPressed(modifier, isPressed);
      }
    }

    if (isPressed) {
      this.pressed_.add(key);
    } else {
      this.pressed_.delete(key);
    }
  }

  /**
   * Returns whether the key is currently pressed.
   */
  isPressed(key: Key): boolean {
    return this.pressed_.has(key);
  }

  /**
   * Presses the given key on the keyboard.
   */
  pressKey(key: Key): void {
    if (MODIFIERS.includes(key) && this.isPressed(key)) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Cannot press a modifier key that is already pressed.'
      );
    }

    const performDefault =
      key.code !== null && this.fireKeyEvent_(EventType.KEYDOWN, key);

    if (performDefault || GECKO) {
      if (
        !this.requiresKeyPress_(key) ||
        this.fireKeyEvent_(EventType.KEYPRESS, key, !performDefault)
      ) {
        if (performDefault) {
          this.maybeSubmitForm_(key);
          if (this.editable_) {
            this.maybeEditText_(key);
          }
        }
      }
    }

    this.setKeyPressed_(key, true);
  }

  /**
   * Whether the given key currently requires a keypress.
   */
  private requiresKeyPress_(key: Key): boolean {
    if (key.character || key === Keys.ENTER) {
      return true;
    } else if (WEBKIT || EDGE) {
      return false;
    } else if (IE) {
      return key === Keys.ESC;
    } else {
      // Gecko
      switch (key) {
        case Keys.SHIFT:
        case Keys.CONTROL:
        case Keys.ALT:
          return false;
        case Keys.META:
        case Keys.META_RIGHT:
        case Keys.CONTEXT_MENU:
          return GECKO;
        default:
          return true;
      }
    }
  }

  /**
   * Maybe submit a form if the ENTER key is released.
   */
  private maybeSubmitForm_(key: Key): void {
    if (key !== Keys.ENTER) {
      return;
    }
    if ((GECKO && !isEngineVersion(93)) || !isElement(this.getElement(), 'INPUT')) {
      return;
    }

    const form = findAncestorForm(this.getElement());
    if (form) {
      const inputs = form.getElementsByTagName('input');
      const hasSubmit = Array.from(inputs).some((e) => isFormSubmitElement(e));
      if (hasSubmit || inputs.length === 1 || (WEBKIT && !isEngineVersion(534))) {
        this.submitForm(form);
      }
    }
  }

  /**
   * Maybe edit text when a key is pressed in an editable form.
   */
  private maybeEditText_(key: Key): void {
    if (key.character) {
      this.updateOnCharacter_(key);
    } else {
      switch (key) {
        case Keys.ENTER:
          this.updateOnEnter_();
          break;
        case Keys.BACKSPACE:
        case Keys.DELETE:
          this.updateOnBackspaceOrDelete_(key);
          break;
        case Keys.LEFT:
        case Keys.RIGHT:
          this.updateOnLeftOrRight_(key);
          break;
        case Keys.HOME:
        case Keys.END:
          this.updateOnHomeOrEnd_(key);
          break;
      }
    }
  }

  /**
   * Releases the given key on the keyboard.
   */
  releaseKey(key: Key): void {
    if (!this.isPressed(key)) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Cannot release a key that is not pressed. (' + key.code + ')'
      );
    }
    if (key.code !== null) {
      this.fireKeyEvent_(EventType.KEYUP, key);
    }

    this.setKeyPressed_(key, false);
  }

  /**
   * Given the current state of the SHIFT and CAPS_LOCK key, returns the
   * character that will be typed if the specified key is pressed.
   */
  private getChar_(key: Key): string {
    if (!key.character) {
      throw new BotError(ErrorCode.UNKNOWN_ERROR, 'not a character key');
    }
    const shiftPressed = this.isPressed(Keys.SHIFT);
    return (shiftPressed ? key.shiftChar : key.character) as string;
  }

  /**
   * Updates text when a character key is pressed.
   */
  private updateOnCharacter_(key: Key): void {
    if (KEYPRESS_EDITS_TEXT_) {
      return;
    }

    const element = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
    const character = this.getChar_(key);
    const newPos = getSelectionStart(element) + 1;
    if (supportsSelection(element)) {
      setSelectedText(element, character);
      setSelectionStart(element, newPos);
    } else {
      element.value += character;
    }
    if (WEBKIT) {
      this.fireHtmlEvent(EventType.TEXTINPUT);
    }
    if (!IE_DOC_PRE9) {
      this.fireHtmlEvent(EventType.INPUT);
    }
    this.updateCurrentPos_(newPos);
  }

  /**
   * Updates text when ENTER is pressed.
   */
  private updateOnEnter_(): void {
    if (KEYPRESS_EDITS_TEXT_) {
      return;
    }

    if (WEBKIT) {
      this.fireHtmlEvent(EventType.TEXTINPUT);
    }
    if (isElement(this.getElement(), 'TEXTAREA')) {
      const element = this.getElement() as HTMLTextAreaElement;
      const newPos = getSelectionStart(element) + NEW_LINE_.length;
      if (supportsSelection(element)) {
        setSelectedText(element, NEW_LINE_);
        setSelectionStart(element, newPos);
      } else {
        element.value += NEW_LINE_;
      }
      if (!IE) {
        this.fireHtmlEvent(EventType.INPUT);
      }
      this.updateCurrentPos_(newPos);
    }
  }

  /**
   * Updates text when BACKSPACE or DELETE is pressed.
   */
  private updateOnBackspaceOrDelete_(key: Key): void {
    if (KEYPRESS_EDITS_TEXT_) {
      return;
    }

    const element = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
    checkCanUpdateSelection_(element);
    let endpoints = getEndPoints(element);
    if (endpoints[0] === endpoints[1]) {
      if (key === Keys.BACKSPACE) {
        setSelectionStart(element, endpoints[1] - 1);
        setSelectionEnd(element, endpoints[1]);
      } else {
        setSelectionEnd(element, endpoints[1] + 1);
      }
    }

    endpoints = getEndPoints(element);
    const textChanged = !(
      endpoints[0] === element.value.length || endpoints[1] === 0
    );
    setSelectedText(element, '');

    if ((!IE && textChanged) || (GECKO && key === Keys.BACKSPACE)) {
      this.fireHtmlEvent(EventType.INPUT);
    }

    endpoints = getEndPoints(element);
    this.updateCurrentPos_(endpoints[1]);
  }

  /**
   * Updates cursor position when LEFT or RIGHT is pressed.
   */
  private updateOnLeftOrRight_(key: Key): void {
    const element = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
    checkCanUpdateSelection_(element);
    const start = getSelectionStart(element);
    const end = getSelectionEnd(element);

    let newPos: number;
    let startPos = 0;
    let endPos = 0;

    if (key === Keys.LEFT) {
      if (this.isPressed(Keys.SHIFT)) {
        if (this.currentPos_ === start) {
          startPos = Math.max(start - 1, 0);
          endPos = end;
          newPos = startPos;
        } else {
          startPos = start;
          endPos = end - 1;
          newPos = endPos;
        }
      } else {
        newPos = start === end ? Math.max(start - 1, 0) : start;
      }
    } else {
      if (this.isPressed(Keys.SHIFT)) {
        if (this.currentPos_ === end) {
          startPos = start;
          endPos = Math.min(end + 1, element.value.length);
          newPos = endPos;
        } else {
          startPos = start + 1;
          endPos = end;
          newPos = startPos;
        }
      } else {
        newPos = start === end ? Math.min(end + 1, element.value.length) : end;
      }
    }

    if (this.isPressed(Keys.SHIFT)) {
      setSelectionStart(element, startPos);
      setSelectionEnd(element, endPos);
    } else {
      setCursorPosition(element, newPos);
    }
    this.updateCurrentPos_(newPos);
  }

  /**
   * Updates cursor position when HOME or END is pressed.
   */
  private updateOnHomeOrEnd_(key: Key): void {
    const element = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
    checkCanUpdateSelection_(element);
    const start = getSelectionStart(element);
    const end = getSelectionEnd(element);

    if (key === Keys.HOME) {
      if (this.isPressed(Keys.SHIFT)) {
        setSelectionStart(element, 0);
        const endPos = this.currentPos_ === start ? end : start;
        setSelectionEnd(element, endPos);
      } else {
        setCursorPosition(element, 0);
      }
      this.updateCurrentPos_(0);
    } else {
      if (this.isPressed(Keys.SHIFT)) {
        if (this.currentPos_ === start) {
          setSelectionStart(element, end);
        }
        setSelectionEnd(element, element.value.length);
      } else {
        setCursorPosition(element, element.value.length);
      }
      this.updateCurrentPos_(element.value.length);
    }
  }

  /**
   * Updates the current cursor position.
   */
  private updateCurrentPos_(pos: number): void {
    this.currentPos_ = pos;
  }

  /**
   * Fires a keyboard event.
   */
  private fireKeyEvent_(
    type: EventFactory,
    key: Key,
    opt_preventDefault?: boolean
  ): boolean {
    if (key.code === null) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Key must have a keycode to be fired.'
      );
    }

    const args = {
      altKey: this.isPressed(Keys.ALT),
      ctrlKey: this.isPressed(Keys.CONTROL),
      metaKey: this.isPressed(Keys.META),
      shiftKey: this.isPressed(Keys.SHIFT),
      keyCode: key.code,
      charCode:
        key.character && type === EventType.KEYPRESS
          ? this.getChar_(key).charCodeAt(0)
          : 0,
      preventDefault: !!opt_preventDefault,
    };

    return this.fireKeyboardEvent(type, args);
  }

  /**
   * Sets focus to the element. If the element does not have focus, place cursor
   * at the end of the text in the element.
   */
  moveCursor(element: Element): void {
    this.setElement(element);
    this.editable_ = isEditable(element);

    const focusChanged = this.focusOnElement();
    if (this.editable_ && focusChanged) {
      const inputElement = element as HTMLInputElement | HTMLTextAreaElement;
      setCursorPosition(inputElement, inputElement.value.length);
      this.updateCurrentPos_(inputElement.value.length);
    }
  }

  /**
   * Serialize the current state of the keyboard.
   */
  getState(): KeyboardState {
    return {
      pressed: Array.from(this.pressed_),
      currentPos: this.currentPos_,
    };
  }

  /**
   * Returns the state of the modifier keys, to be shared with other input devices.
   */
  getModifiersState(): ModifiersState {
    return this.modifiersState;
  }
}

// ============================================================================
// Static helpers
// ============================================================================

/**
 * Checks that the cursor position can be updated for the given element.
 */
function checkCanUpdateSelection_(
  element: HTMLInputElement | HTMLTextAreaElement
): void {
  try {
    if (typeof element.selectionStart === 'number') {
      return;
    }
  } catch (ex) {
    if ((ex as Error).message.indexOf('does not support selection.') !== -1) {
      throw Error(
        (ex as Error).message +
          ' (For more information, see ' +
          'https://code.google.com/p/chromium/issues/detail?id=330456)'
      );
    }
    throw ex;
  }
  throw Error('Element does not support selection');
}

/**
 * Returns whether the given element supports the input element selection API.
 */
export function supportsSelection(
  element: HTMLInputElement | HTMLTextAreaElement
): boolean {
  try {
    checkCanUpdateSelection_(element);
  } catch {
    return false;
  }
  return true;
}
