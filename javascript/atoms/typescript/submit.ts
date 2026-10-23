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

import { NO_SUCH_ELEMENT, botError } from './core/error.js'
import { EventType, fire } from './core/events.js'

// Submits the element's form without simulating a click or a key press: a
// submit event, then, unless it was cancelled, the form's own submit(). That
// skips constraint validation, as bot.action.submit always did; a caller that
// wants validation should click the submit button or press Enter instead.
//
// The method comes from the prototype because a control named or id'd
// "submit" masks form.submit.
function submit(element: Element): void {
  const form = findForm(element)
  if (!form) {
    throw botError(NO_SUCH_ELEMENT, 'Element was not in a form, so could not submit.')
  }
  if (fire(form, EventType.SUBMIT, { submitter: null })) {
    const win = (form.ownerDocument.defaultView || window) as Window & typeof globalThis
    win.HTMLFormElement.prototype.submit.call(form)
  }
}

// A control's form owner honours the form= attribute; anything else falls
// back to the nearest ancestor form. Reading .form off a <form> itself would
// find a control named "form" instead.
function findForm(element: Element): HTMLFormElement | null {
  if (element.tagName.toUpperCase() === 'FORM') {
    return element as HTMLFormElement
  }
  const owner = (element as HTMLInputElement).form
  if (owner) {
    return owner
  }
  return element.closest('form')
}

export default submit
