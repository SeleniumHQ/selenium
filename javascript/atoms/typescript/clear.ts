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

import { isContentEditable, isEditable } from './core/editable.js'
import { ELEMENT_NOT_INTERACTABLE, INVALID_ELEMENT_STATE, botError } from './core/error.js'
import { EventType, fire } from './core/events.js'
import { focusOnElement } from './core/focus.js'
import { isInteractable } from './core/interactable.js'

type TextField = HTMLInputElement | HTMLTextAreaElement

// Empties an editable element the way W3C Element Clear does: focus it, empty
// it, then take focus away so the page sees the edit committed.
//
// Differences from bot.action.clear, toward what clearing by hand produces:
// - input fires before change; bot.action.clear fired change alone. Its
//   inputType is what select-all then Backspace reports: neither engine keeps
//   the spec's generic "deleteContent" on a constructed InputEvent.
// - A number field holding unparseable text (value reads as "") is detected
//   by validity.badInput rather than the type attribute, and gets the same
//   events and blur as any other field.
// - contenteditable is emptied outright and fires input. The single space
//   bot.action.clear left behind in Firefox kept the caret alive in Firefox 3.
// - The IE range-input and blur branches are gone.
function clear(element: Element): void {
  if (!isInteractable(element)) {
    throw botError(ELEMENT_NOT_INTERACTABLE, 'Element is not currently interactable and may not be manipulated')
  }
  if (!isEditable(element)) {
    throw botError(INVALID_ELEMENT_STATE, 'Element must be user-editable in order to clear it.')
  }

  if (isContentEditable(element)) {
    if (element.textContent || element.children.length) {
      focusOnElement(element)
      element.textContent = ''
      fire(element, EventType.INPUT, { inputType: 'deleteContentBackward', data: null })
      unfocus(element)
    }
    return
  }

  const field = element as TextField
  const badInput = !!(field as HTMLInputElement).validity?.badInput
  if (field.value || badInput) {
    focusOnElement(field)
    field.value = ''
    fire(field, EventType.INPUT, { inputType: 'deleteContentBackward', data: null })
    fire(field, EventType.CHANGE, undefined)
    unfocus(field)
  }
}

// Focusing the body cannot take focus, so this blurs whatever has it.
function unfocus(element: Element): void {
  focusOnElement(element.ownerDocument.body)
}

export default clear
