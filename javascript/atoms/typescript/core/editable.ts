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

import { getProperty } from './attribute.js'
import { isElement } from './element.js'

// <input> types that present a free-text field.
const TEXTUAL_INPUT_TYPES = ['text', 'search', 'tel', 'url', 'email', 'password', 'number']

// Typeable <input> types that are not free text — each is a distinct control,
// but the user can still put a value into it.
const NON_TEXTUAL_EDITABLE_INPUT_TYPES = ['range', 'date', 'month', 'week', 'time', 'datetime-local', 'color']

function inputType(element: Element): string | null {
  if (!isElement(element, 'INPUT')) {
    return null
  }
  return (element as HTMLInputElement).type.toLowerCase()
}

export function isContentEditable(element: Element): boolean {
  // Non-HTML elements (SVG, MathML) have no contentEditable at all.
  if ((element as HTMLElement).contentEditable === undefined) {
    return false
  }
  return !!(element as HTMLElement).isContentEditable
}

export function isTextual(element: Element): boolean {
  if (isElement(element, 'TEXTAREA')) {
    return true
  }
  const type = inputType(element)
  if (type !== null) {
    return TEXTUAL_INPUT_TYPES.indexOf(type) >= 0
  }
  return isContentEditable(element)
}

export function isFileInput(element: Element): boolean {
  return inputType(element) === 'file'
}

export function isEditable(element: Element): boolean {
  const type = inputType(element)
  const typeable =
    isTextual(element) || isFileInput(element) || (type !== null && NON_TEXTUAL_EDITABLE_INPUT_TYPES.indexOf(type) >= 0)
  return typeable && !getProperty(element, 'readOnly')
}
