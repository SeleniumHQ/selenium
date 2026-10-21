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

import { isElement } from './core/element.js'
import { ELEMENT_NOT_INTERACTABLE, INVALID_ARGUMENT, botError } from './core/error.js'
import { EventType, fire } from './core/events.js'
import { holdsFocus } from './core/focus.js'
import { isInteractable } from './core/interactable.js'
import { Keyboard } from './core/keyboard.js'
import { type Key, Keys, fromChar, isModifier } from './core/keys.js'
import { scrollIntoView } from './core/scroll.js'

// The numpad digits and function keys are generated into Keys, so their names
// are not in its type.
const NAMED = Keys as unknown as Record<string, Key>

// The WebDriver key code points (U+E000-U+E03D) the keyboard can press. NULL
// is handled separately: it releases every held modifier.
const NULL = '\uE000'
const WEBDRIVER_KEYS: Record<string, Key> = {
  '\uE003': Keys.BACKSPACE,
  '\uE004': Keys.TAB,
  '\uE006': Keys.ENTER,
  // RETURN and ENTER differ on a real keyboard; browsers treat them alike.
  '\uE007': Keys.ENTER,
  '\uE008': Keys.SHIFT,
  '\uE009': Keys.CONTROL,
  '\uE00A': Keys.ALT,
  '\uE00B': Keys.PAUSE,
  '\uE00C': Keys.ESC,
  '\uE00D': Keys.SPACE,
  '\uE00E': Keys.PAGE_UP,
  '\uE00F': Keys.PAGE_DOWN,
  '\uE010': Keys.END,
  '\uE011': Keys.HOME,
  '\uE012': Keys.LEFT,
  '\uE013': Keys.UP,
  '\uE014': Keys.RIGHT,
  '\uE015': Keys.DOWN,
  '\uE016': Keys.INSERT,
  '\uE017': Keys.DELETE,
  '\uE018': Keys.SEMICOLON,
  '\uE019': Keys.EQUALS,
  '\uE01A': NAMED['NUM_ZERO'],
  '\uE01B': NAMED['NUM_ONE'],
  '\uE01C': NAMED['NUM_TWO'],
  '\uE01D': NAMED['NUM_THREE'],
  '\uE01E': NAMED['NUM_FOUR'],
  '\uE01F': NAMED['NUM_FIVE'],
  '\uE020': NAMED['NUM_SIX'],
  '\uE021': NAMED['NUM_SEVEN'],
  '\uE022': NAMED['NUM_EIGHT'],
  '\uE023': NAMED['NUM_NINE'],
  '\uE024': Keys.NUM_MULTIPLY,
  '\uE025': Keys.NUM_PLUS,
  '\uE026': Keys.SEPARATOR,
  '\uE027': Keys.NUM_MINUS,
  '\uE028': Keys.NUM_PERIOD,
  '\uE029': Keys.NUM_DIVISION,
  '\uE031': NAMED['F1'],
  '\uE032': NAMED['F2'],
  '\uE033': NAMED['F3'],
  '\uE034': NAMED['F4'],
  '\uE035': NAMED['F5'],
  '\uE036': NAMED['F6'],
  '\uE037': NAMED['F7'],
  '\uE038': NAMED['F8'],
  '\uE039': NAMED['F9'],
  '\uE03A': NAMED['F10'],
  '\uE03B': NAMED['F11'],
  '\uE03C': NAMED['F12'],
  '\uE03D': Keys.META,
}

const ALIASES: Record<string, Key> = {
  '\n': Keys.ENTER,
  '\t': Keys.TAB,
  '\b': Keys.BACKSPACE,
}

// Controls whose value no key sequence can edit, even from a real keyboard
// driven by script: their UI is a picker. They take a well-formed value
// directly instead, with the events a picker commit produces.
const PICKER_TYPES = new Set(['date', 'datetime-local', 'month', 'time', 'week', 'color'])

// Types `keys` into the element with a virtual keyboard: webdriver.atoms.
// element.type. Each string is split into characters; WebDriver key code
// points press that key, and modifiers stay down until pressed again, NULL,
// or the end of the call (unless `optPersistModifiers`).
//
// Differences from the Closure atom, toward what typing by hand produces:
// - See core/keyboard.ts for the key events and edits themselves.
// - Picker inputs (date, time, colour...) take the whole value with input and
//   change in every engine. Closure did this for date alone, only in
//   Chrome-like WebKit, and fired synthetic touch, focus and blur events.
// - An element hidden from the mouse but already focused can still be typed
//   into, as before; otherwise it must be interactable, and fails with
//   "element not interactable" rather than "invalid element state".
// - An unsupported WebDriver key fails with "invalid argument" instead of a
//   plain Error.
// The third argument (a keyboard to reuse) never crossed the wire and is
// ignored.
function type(element: Element, keys: string[], _optKeyboard?: unknown, optPersistModifiers?: boolean): void {
  if (!holdsFocus(element)) {
    if (!isInteractable(element)) {
      throw botError(ELEMENT_NOT_INTERACTABLE, 'Element is not currently interactable and may not be manipulated')
    }
    scrollIntoView(element)
  }

  const keyboard = new Keyboard()
  keyboard.moveCursor(element)

  if (isElement(element, 'INPUT') && PICKER_TYPES.has((element as HTMLInputElement).type)) {
    if (setPickerValue(element as HTMLInputElement, keys.join(''))) {
      return
    }
  }

  for (const sequence of keys) {
    for (const ch of Array.from(sequence)) {
      if (ch === NULL) {
        keyboard.releaseModifiers()
      } else if ('\uE000' <= ch && ch <= '\uE03D') {
        const key = WEBDRIVER_KEYS[ch]
        if (!key) {
          throw botError(INVALID_ARGUMENT, 'Unsupported WebDriver key: \\u' + ch.charCodeAt(0).toString(16))
        }
        pressWebDriverKey(keyboard, key)
      } else if (ALIASES[ch]) {
        tap(keyboard, ALIASES[ch])
      } else {
        typeCharacter(keyboard, ch)
      }
    }
  }

  if (!optPersistModifiers) {
    keyboard.releaseModifiers()
  }
}

// A modifier toggles; anything else is pressed and released.
function pressWebDriverKey(keyboard: Keyboard, key: Key): void {
  if (!isModifier(key)) {
    tap(keyboard, key)
  } else if (keyboard.isPressed(key)) {
    keyboard.releaseKey(key)
  } else {
    keyboard.pressKey(key)
  }
}

function tap(keyboard: Keyboard, key: Key): void {
  keyboard.pressKey(key)
  keyboard.releaseKey(key)
}

// Shift is held around a character that needs it, unless already held.
function typeCharacter(keyboard: Keyboard, ch: string): void {
  const { key, shift } = fromChar(ch)
  const addShift = shift && !keyboard.isPressed(Keys.SHIFT)
  if (addShift) {
    keyboard.pressKey(Keys.SHIFT)
  }
  tap(keyboard, key)
  if (addShift) {
    keyboard.releaseKey(Keys.SHIFT)
  }
}

// Whether the input accepted `text` as its value. A value the control would
// sanitise away is rejected and left to the keyboard, as before. A colour
// input stores hex digits in lower case, so "#FF0000" is accepted as
// "#ff0000".
function setPickerValue(input: HTMLInputElement, text: string): boolean {
  const previous = input.value
  const expected = input.type === 'color' ? text.toLowerCase() : text
  input.value = text
  if (input.value !== expected) {
    input.value = previous
    return false
  }
  if (previous !== expected) {
    fire(input, EventType.INPUT, { inputType: 'insertReplacementText', data: null })
    fire(input, EventType.CHANGE, undefined)
  }
  return true
}

export default type
