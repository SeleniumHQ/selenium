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

import { getAttribute, getProperty } from './core/attribute.js'
import { isEditable } from './core/editable.js'
import { isElement } from './core/element.js'

// http://www.w3.org/TR/html401/interact/scripts.html#adef-onfocus
const FOCUSABLE_FORM_FIELDS = ['A', 'AREA', 'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA']

// An element can take focus if it is a form field, carries a non-negative
// tabindex, or is editable.
function isFocusable(element: Element): boolean {
  if (FOCUSABLE_FORM_FIELDS.some((tagName) => isElement(element, tagName))) {
    return true
  }
  // The attribute has to be present for tabindex to count — the tabIndex
  // property reports a default for several tags that were never marked up
  // with one.
  if (getAttribute(element, 'tabindex') != null && Number(getProperty(element, 'tabIndex')) >= 0) {
    return true
  }
  return isEditable(element)
}

export default isFocusable
