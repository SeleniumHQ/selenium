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

import { isGecko, isMac } from './useragent.js'

// The keys the keyboard knows, each carrying what a real press reports: the
// `key` and `code` values, the legacy keyCode for keydown / keyup, and for
// character keys the character typed without and with shift.
//
// keyCodes match what Chrome and Firefox report for real presses (recorded
// 2026-10-13). They agree except for '=', '-', ';' and Meta, where Firefox has
// its own numbers; `gecko` carries those.

export const LOCATION_STANDARD = 0
export const LOCATION_LEFT = 1
export const LOCATION_RIGHT = 2
export const LOCATION_NUMPAD = 3

export interface Key {
  // The key value for a non-character key ('Enter', 'ArrowLeft').
  readonly key: string
  readonly code: string
  readonly keyCode: number
  readonly gecko?: number
  readonly location: number
  readonly character: string | null
  readonly shiftCharacter: string | null
}

function key(
  keyValue: string,
  code: string,
  keyCode: number,
  options: { gecko?: number; location?: number; character?: string; shiftCharacter?: string } = {},
): Key {
  return {
    key: keyValue,
    code,
    keyCode,
    gecko: options.gecko,
    location: options.location ?? LOCATION_STANDARD,
    character: options.character ?? null,
    shiftCharacter: options.shiftCharacter ?? options.character ?? null,
  }
}

function character(code: string, keyCode: number, ch: string, shifted?: string, gecko?: number): Key {
  return key(ch, code, keyCode, { character: ch, shiftCharacter: shifted, gecko })
}

function numpad(code: string, keyCode: number, ch: string): Key {
  return key(ch, code, keyCode, { character: ch, location: LOCATION_NUMPAD })
}

function letters(): Record<string, Key> {
  const result: Record<string, Key> = {}
  for (let i = 0; i < 26; i++) {
    const upper = String.fromCharCode(65 + i)
    result[upper] = character('Key' + upper, 65 + i, upper.toLowerCase(), upper)
  }
  return result
}

function functionKeys(): Record<string, Key> {
  const result: Record<string, Key> = {}
  for (let i = 1; i <= 12; i++) {
    result['F' + i] = key('F' + i, 'F' + i, 111 + i)
  }
  return result
}

const DIGIT_SHIFTS = ')!@#$%^&*('

function digits(): Record<string, Key> {
  const names = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE']
  const result: Record<string, Key> = {}
  names.forEach((name, i) => {
    result[name] = character('Digit' + i, 48 + i, String(i), DIGIT_SHIFTS[i])
    result['NUM_' + name] = numpad('Numpad' + i, 96 + i, String(i))
  })
  return result
}

export const Keys = {
  BACKSPACE: key('Backspace', 'Backspace', 8),
  TAB: key('Tab', 'Tab', 9),
  ENTER: key('Enter', 'Enter', 13),
  SHIFT: key('Shift', 'ShiftLeft', 16, { location: LOCATION_LEFT }),
  CONTROL: key('Control', 'ControlLeft', 17, { location: LOCATION_LEFT }),
  ALT: key('Alt', 'AltLeft', 18, { location: LOCATION_LEFT }),
  PAUSE: key('Pause', 'Pause', 19),
  CAPS_LOCK: key('CapsLock', 'CapsLock', 20),
  ESC: key('Escape', 'Escape', 27),
  SPACE: character('Space', 32, ' '),
  PAGE_UP: key('PageUp', 'PageUp', 33),
  PAGE_DOWN: key('PageDown', 'PageDown', 34),
  END: key('End', 'End', 35),
  HOME: key('Home', 'Home', 36),
  LEFT: key('ArrowLeft', 'ArrowLeft', 37),
  UP: key('ArrowUp', 'ArrowUp', 38),
  RIGHT: key('ArrowRight', 'ArrowRight', 39),
  DOWN: key('ArrowDown', 'ArrowDown', 40),
  PRINT_SCREEN: key('PrintScreen', 'PrintScreen', 44),
  INSERT: key('Insert', 'Insert', 45),
  DELETE: key('Delete', 'Delete', 46),

  ...digits(),
  ...letters(),

  // Firefox on macOS reports 224 for both Meta keys; every other combination
  // reports the Windows-style 91 / 92. Firefox on Linux is not verified.
  META: key('Meta', 'MetaLeft', 91, { gecko: 91, location: LOCATION_LEFT }),
  META_RIGHT: key('Meta', 'MetaRight', 92, { gecko: 92, location: LOCATION_RIGHT }),
  CONTEXT_MENU: key('ContextMenu', 'ContextMenu', 93),

  NUM_MULTIPLY: numpad('NumpadMultiply', 106, '*'),
  NUM_PLUS: numpad('NumpadAdd', 107, '+'),
  NUM_MINUS: numpad('NumpadSubtract', 109, '-'),
  NUM_PERIOD: numpad('NumpadDecimal', 110, '.'),
  NUM_DIVISION: numpad('NumpadDivide', 111, '/'),
  NUM_LOCK: key('NumLock', 'NumLock', 144, { location: LOCATION_NUMPAD }),
  SEPARATOR: numpad('NumpadComma', 108, ','),

  ...functionKeys(),

  EQUALS: character('Equal', 187, '=', '+', 61),
  HYPHEN: character('Minus', 189, '-', '_', 173),
  COMMA: character('Comma', 188, ',', '<'),
  PERIOD: character('Period', 190, '.', '>'),
  SLASH: character('Slash', 191, '/', '?'),
  BACKTICK: character('Backquote', 192, '`', '~'),
  OPEN_BRACKET: character('BracketLeft', 219, '[', '{'),
  BACKSLASH: character('Backslash', 220, '\\', '|'),
  CLOSE_BRACKET: character('BracketRight', 221, ']', '}'),
  SEMICOLON: character('Semicolon', 186, ';', ':', 59),
  APOSTROPHE: character('Quote', 222, "'", '"'),
}

export const MODIFIERS: readonly Key[] = [Keys.ALT, Keys.CONTROL, Keys.META, Keys.SHIFT]

export function isModifier(k: Key): boolean {
  return MODIFIERS.includes(k)
}

// The keyCode a keydown or keyup for this key reports in the given window's
// engine.
export function keyCodeFor(k: Key, win: Window): number {
  if (!isGecko(win)) {
    if (k === Keys.META_RIGHT && isMac(win)) {
      return 93
    }
    return k.keyCode
  }
  if ((k === Keys.META || k === Keys.META_RIGHT) && isMac(win)) {
    return 224
  }
  return k.gecko ?? k.keyCode
}

// Character to (key, needs shift). Numpad keys never win: a typed '1' is the
// digit row's 1, as on a real keyboard without a numpad.
const CHAR_TO_KEY = new Map<string, { key: Key; shift: boolean }>()
for (const k of Object.values(Keys) as Key[]) {
  if (!k.character || k.location === LOCATION_NUMPAD) {
    continue
  }
  if (!CHAR_TO_KEY.has(k.character)) {
    CHAR_TO_KEY.set(k.character, { key: k, shift: false })
  }
  if (k.shiftCharacter && k.shiftCharacter !== k.character) {
    CHAR_TO_KEY.set(k.shiftCharacter, { key: k, shift: true })
  }
}

// A key that types `ch`, a single code point. For characters not on a US
// layout there is no true keyCode to report; the upper-case code point is
// sometimes right and at least positive, which is what bot.Keyboard did.
export function fromChar(ch: string): { key: Key; shift: boolean } {
  if (Array.from(ch).length !== 1) {
    throw new Error('Argument not a single character: ' + ch)
  }
  const known = CHAR_TO_KEY.get(ch)
  if (known) {
    return known
  }
  const upper = ch.toUpperCase()
  const lower = ch.toLowerCase()
  const k = key(ch, '', upper.codePointAt(0) as number, { character: lower, shiftCharacter: upper })
  return { key: k, shift: ch !== lower }
}
