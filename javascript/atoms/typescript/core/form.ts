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

import { EventType, fire } from './events.js'

// <input> types that count against implicit submission (HTML, "implicit
// submission"): with more than one in the form and no submit button, Enter
// does not submit.
const BLOCKS_IMPLICIT_SUBMISSION = [
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'date',
  'month',
  'week',
  'time',
  'datetime-local',
  'number',
]

function isSubmitButton(element: Element): element is HTMLButtonElement | HTMLInputElement {
  const type = (element as HTMLInputElement).type
  if (element.tagName === 'BUTTON') {
    return type === 'submit'
  }
  return element.tagName === 'INPUT' && (type === 'submit' || type === 'image')
}

// Enter in a form field, as HTML defines it: click the form's default button
// (its first submit button), which submits through the button's own
// activation behaviour; with no button, submit only if the field is the one
// field that would block it.
//
// This replaces bot.Keyboard.maybeSubmitForm_, which looked only at <input>s
// (so a <button type=submit> never counted), counted hidden and checkbox
// inputs as fields, and submitted with form.submit() -- skipping both the
// click on the default button and constraint validation, which real Enter
// runs.
export function implicitlySubmit(field: HTMLInputElement): void {
  const form = field.form
  if (!form) {
    return
  }
  const elements = Array.from(form.elements)
  const defaultButton = elements.find(isSubmitButton)
  if (defaultButton) {
    if (!defaultButton.disabled) {
      // A keyboard-initiated click: no position and a click count of 0.
      fire(defaultButton, EventType.CLICK, { clientX: 0, clientY: 0, detail: 0 })
    }
    return
  }
  const blocking = elements.filter(
    (element) => element.tagName === 'INPUT' && BLOCKS_IMPLICIT_SUBMISSION.includes((element as HTMLInputElement).type),
  )
  if (blocking.length <= 1) {
    form.requestSubmit()
  }
}
