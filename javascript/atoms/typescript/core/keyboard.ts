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

import { isContentEditable, isEditable, isFileInput } from './editable.js'
import { isElement } from './element.js'
import { UNKNOWN_ERROR, botError } from './error.js'
import { type EventFactory, EventType, type KeyboardArgs, fire } from './events.js'
import { focusOnElement, getDeepActiveElement } from './focus.js'
import { implicitlySubmit } from './form.js'
import { type Key, Keys, isModifier, keyCodeFor } from './keys.js'

// A virtual keyboard that produces what a real key press produces: keydown,
// keypress for character keys and Enter, beforeinput / textInput / input
// around the edit, and keyup -- each with key, code and the engine's legacy
// codes -- and that performs the edit itself, since an untrusted key event has
// no default action.
//
// Replaces bot.Keyboard. Differences, all toward what a real keyboard does:
// - Events go to whichever element has focus when the key is pressed, so a
//   page that moves focus from a handler (one-time-code fields, auto-advance)
//   keeps receiving the typing where a user's would go. bot.Keyboard always
//   typed into the element it started with.
// - beforeinput is fired, with inputType and data, and cancelling it cancels
//   the edit; so does cancelling textInput.
// - contenteditable is edited. bot.Keyboard appended to an expando `value`
//   there and never changed the DOM.
// - maxlength is respected, and a character outside the BMP is one key.
// - No keypress for Escape, arrows or Meta: Firefox stopped firing those.
// - Caret movement uses the element's own selection direction instead of a
//   tracked position, and there is no serialisable state: none of the atoms
//   that use the keyboard carry one across calls.
export class Keyboard {
  private element: Element | null = null
  private readonly pressed = new Set<Key>()

  isPressed(key: Key): boolean {
    return this.pressed.has(key)
  }

  // Focuses the element, as clicking into it would, and when that moved focus
  // puts the caret at the end of its text.
  moveCursor(element: Element): void {
    this.element = element
    if (focusOnElement(element) && isEditable(element)) {
      caretToEnd(element)
    }
  }

  pressKey(key: Key): void {
    if (isModifier(key) && this.isPressed(key)) {
      throw botError(UNKNOWN_ERROR, 'Cannot press a modifier key that is already pressed.')
    }
    const repeat = this.isPressed(key)
    // A modifier reports itself as held on its own keydown.
    this.pressed.add(key)

    const target = this.target()
    if (!this.fireKey(target, EventType.KEYDOWN, key, repeat)) {
      return
    }
    if ((key.character || key === Keys.ENTER) && !this.fireKey(target, EventType.KEYPRESS, key, repeat)) {
      return
    }
    // A file input's value cannot be set from script; uploads are the
    // driver's job, not the keyboard's.
    if (isEditable(target) && !isFileInput(target)) {
      this.edit(target, key)
    }
    if (key === Keys.ENTER && isElement(target, 'INPUT')) {
      implicitlySubmit(target as HTMLInputElement)
    }
  }

  releaseKey(key: Key): void {
    if (!this.isPressed(key)) {
      throw botError(UNKNOWN_ERROR, 'Cannot release a key that is not pressed. (' + key.key + ')')
    }
    // ...and as released on its own keyup.
    this.pressed.delete(key)
    this.fireKey(this.target(), EventType.KEYUP, key, false)
  }

  releaseModifiers(): void {
    for (const key of [Keys.ALT, Keys.CONTROL, Keys.META, Keys.SHIFT]) {
      if (this.isPressed(key)) {
        this.releaseKey(key)
      }
    }
  }

  // Key events go where focus is, as they do for a real keyboard, falling back
  // to the element being typed into when focus is nowhere in particular.
  private target(): Element {
    const element = this.element as Element
    const active = getDeepActiveElement(element.ownerDocument)
    return active && !isElement(active, 'BODY') ? active : element
  }

  private typed(key: Key): string {
    return (this.isPressed(Keys.SHIFT) ? key.shiftCharacter : key.character) as string
  }

  private fireKey(target: Element, type: EventFactory<KeyboardArgs>, key: Key, repeat: boolean): boolean {
    const win = target.ownerDocument.defaultView || window
    let keyValue = key.key
    let keyCode = keyCodeFor(key, win)
    let charCode = 0
    if (key.character) {
      keyValue = this.typed(key)
    }
    // keypress carries the typed character's code on both fields, in Chrome
    // and in Firefox (which used to put it on charCode alone).
    if (type === EventType.KEYPRESS) {
      keyCode = charCode = key.character ? (keyValue.codePointAt(0) as number) : key.keyCode
    }
    return fire(target, type, {
      key: keyValue,
      code: key.code,
      keyCode,
      charCode,
      location: key.location,
      repeat,
      altKey: this.isPressed(Keys.ALT),
      ctrlKey: this.isPressed(Keys.CONTROL),
      metaKey: this.isPressed(Keys.META) || this.isPressed(Keys.META_RIGHT),
      shiftKey: this.isPressed(Keys.SHIFT),
    })
  }

  private edit(target: Element, key: Key): void {
    const shift = this.isPressed(Keys.SHIFT)
    if (isContentEditable(target)) {
      editContent(target, key, key.character ? this.typed(key) : null, shift)
      return
    }
    const field = target as HTMLInputElement | HTMLTextAreaElement
    if (key.character) {
      insertText(field, this.typed(key), 'insertText')
    } else if (key === Keys.ENTER) {
      if (isElement(field, 'TEXTAREA')) {
        insertText(field, '\n', 'insertLineBreak')
      } else {
        // A single-line field takes no line break, but still announces one.
        fire(field, EventType.BEFOREINPUT, { inputType: 'insertLineBreak', data: null })
      }
    } else if (key === Keys.BACKSPACE || key === Keys.DELETE) {
      deleteText(field, key === Keys.DELETE)
    } else if (key === Keys.LEFT || key === Keys.RIGHT || key === Keys.HOME || key === Keys.END) {
      moveCaret(field, key, shift)
    }
  }
}

type TextField = HTMLInputElement | HTMLTextAreaElement

// email, number and the date-like types have a value but no selection API
// (selectionStart is null). Edits there go at the end, which is where the
// caret is after moveCursor.
function supportsSelection(field: TextField): boolean {
  try {
    return typeof field.selectionStart === 'number'
  } catch (_unsupported) {
    return false
  }
}

function caretToEnd(element: Element): void {
  if (isContentEditable(element)) {
    const selection = element.ownerDocument.getSelection()
    if (selection) {
      selection.selectAllChildren(element)
      selection.collapseToEnd()
    }
    return
  }
  const field = element as TextField
  if (supportsSelection(field)) {
    field.setSelectionRange(field.value.length, field.value.length)
  }
}

function selectionOf(field: TextField): [number, number] {
  if (supportsSelection(field)) {
    return [field.selectionStart as number, field.selectionEnd as number]
  }
  return [field.value.length, field.value.length]
}

function replaceRange(field: TextField, text: string, start: number, end: number): void {
  if (supportsSelection(field)) {
    field.setRangeText(text, start, end, 'end')
  } else {
    field.value = field.value.slice(0, start) + text + field.value.slice(end)
  }
}

// beforeinput, textInput, the edit, input -- the order both engines use.
// setRangeText fires no input event of its own, so it is fired here.
function insertText(field: TextField, text: string, inputType: string): void {
  const data = inputType === 'insertText' ? text : null
  if (!fire(field, EventType.BEFOREINPUT, { inputType, data })) {
    return
  }
  if (inputType === 'insertText' && !fire(field, EventType.TEXTINPUT, { data: text })) {
    return
  }
  const [start, end] = selectionOf(field)
  if (field.maxLength >= 0 && field.value.length - (end - start) + text.length > field.maxLength) {
    return
  }
  replaceRange(field, text, start, end)
  fire(field, EventType.INPUT, { inputType, data })
}

// One character, or a whole surrogate pair, before or after a collapsed
// caret; the selection when there is one. Nothing to delete means no events,
// as with a real Backspace at the start of a field.
function deleteText(field: TextField, forward: boolean): void {
  let [start, end] = selectionOf(field)
  const value = field.value
  if (start === end) {
    if (forward) {
      if (end >= value.length) {
        return
      }
      end += isSurrogatePairAt(value, end) ? 2 : 1
    } else {
      if (start <= 0) {
        return
      }
      start -= isSurrogatePairAt(value, start - 2) ? 2 : 1
    }
  }
  const inputType = forward ? 'deleteContentForward' : 'deleteContentBackward'
  if (!fire(field, EventType.BEFOREINPUT, { inputType, data: null })) {
    return
  }
  replaceRange(field, '', start, end)
  fire(field, EventType.INPUT, { inputType, data: null })
}

function isSurrogatePairAt(value: string, index: number): boolean {
  if (index < 0 || index + 1 >= value.length) {
    return false
  }
  const high = value.charCodeAt(index)
  const low = value.charCodeAt(index + 1)
  return high >= 0xd800 && high <= 0xdbff && low >= 0xdc00 && low <= 0xdfff
}

// Arrow, Home and End, with shift extending from the selection's anchor the
// way a real field does. The anchor is whichever end the selection direction
// says is not moving. Up and Down are not handled: they move by line, which a
// field's selection API cannot express.
function moveCaret(field: TextField, key: Key, shift: boolean): void {
  if (!supportsSelection(field)) {
    return
  }
  const [start, end] = selectionOf(field)
  const length = field.value.length
  const backward = field.selectionDirection === 'backward'
  const anchor = backward ? end : start
  const focus = backward ? start : end

  if (!shift) {
    let caret: number
    if (key === Keys.HOME) {
      caret = 0
    } else if (key === Keys.END) {
      caret = length
    } else if (start !== end) {
      caret = key === Keys.LEFT ? start : end
    } else {
      caret = key === Keys.LEFT ? Math.max(start - 1, 0) : Math.min(end + 1, length)
    }
    field.setSelectionRange(caret, caret, 'none')
    return
  }

  let moved: number
  if (key === Keys.HOME) {
    moved = 0
  } else if (key === Keys.END) {
    moved = length
  } else if (key === Keys.LEFT) {
    moved = Math.max(focus - 1, 0)
  } else {
    moved = Math.min(focus + 1, length)
  }
  // A selection with no prior extent is anchored at the caret.
  const fixed = start === end ? start : anchor
  field.setSelectionRange(Math.min(fixed, moved), Math.max(fixed, moved), moved < fixed ? 'backward' : 'forward')
}

// contenteditable edits go through execCommand: it is deprecated, but it is
// the one way a script can edit rich content that keeps the browser's undo
// stack, normalises the markup the way typing would, and fires a trusted
// input event with the right inputType. It does not fire beforeinput, so
// that is fired first and honoured here.
function editContent(target: Element, key: Key, typed: string | null, shift: boolean): void {
  const doc = target.ownerDocument
  const selection = doc.getSelection()
  if (selection && !(selection.anchorNode && target.contains(selection.anchorNode))) {
    selection.selectAllChildren(target)
    selection.collapseToEnd()
  }

  if (typed !== null) {
    if (!fire(target, EventType.BEFOREINPUT, { inputType: 'insertText', data: typed })) {
      return
    }
    if (!fire(target, EventType.TEXTINPUT, { data: typed })) {
      return
    }
    doc.execCommand('insertText', false, typed)
    return
  }

  const commands: Array<[Key, string, string]> = [
    [Keys.ENTER, 'insertParagraph', 'insertParagraph'],
    [Keys.BACKSPACE, 'deleteContentBackward', 'delete'],
    [Keys.DELETE, 'deleteContentForward', 'forwardDelete'],
  ]
  const command = commands.find(([k]) => k === key)
  if (command) {
    if (fire(target, EventType.BEFOREINPUT, { inputType: command[1], data: null })) {
      doc.execCommand(command[2], false)
    }
    return
  }

  // Selection.modify is non-standard but present in every supported engine;
  // it is the only API that moves a caret by character or line boundary.
  const modify = selection && (selection as Selection & { modify?: Function }).modify
  if (!modify) {
    return
  }
  const alter = shift ? 'extend' : 'move'
  if (key === Keys.LEFT || key === Keys.RIGHT) {
    modify.call(selection, alter, key === Keys.LEFT ? 'backward' : 'forward', 'character')
  } else if (key === Keys.HOME || key === Keys.END) {
    modify.call(selection, alter, key === Keys.HOME ? 'backward' : 'forward', 'lineboundary')
  }
}
