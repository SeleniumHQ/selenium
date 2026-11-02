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

// Elements that support the "disabled" attribute, per HTML 4.01 17.12.1.
// Anything else is unconditionally enabled.
const DISABLED_ATTRIBUTE_SUPPORTED = ['BUTTON', 'INPUT', 'OPTGROUP', 'OPTION', 'SELECT', 'TEXTAREA']

function getPreviousElementSibling(node: Node): Element | null {
  let sibling = node.previousSibling
  while (sibling && sibling.nodeType !== 1 /* ELEMENT_NODE */) {
    sibling = sibling.previousSibling
  }
  return sibling as Element | null
}

// A <fieldset disabled> disables its descendants, except those inside its
// *first* <legend>. Later legends are not exempt.
function isInsideDisabledFieldset(element: Element): boolean {
  let node: Node | null = element
  while (node) {
    const parent = node.parentNode
    if (parent && isElement(parent, 'FIELDSET') && getProperty(parent as Element, 'disabled')) {
      if (!isElement(node, 'LEGEND')) {
        return true
      }
      // Being a legend only exempts us if no legend precedes us.
      let sibling = getPreviousElementSibling(node)
      while (sibling) {
        if (isElement(sibling, 'LEGEND')) {
          return true
        }
        sibling = getPreviousElementSibling(sibling)
      }
    }
    node = parent
  }
  return false
}

export function isEnabled(element: Element): boolean {
  const isSupported = DISABLED_ATTRIBUTE_SUPPORTED.some((tagName) => isElement(element, tagName))
  if (!isSupported) {
    return true
  }

  if (getProperty(element, 'disabled')) {
    return false
  }

  // An OPTION or OPTGROUP can inherit its state from an ancestor SELECT or
  // OPTGROUP. isElement() rejects a null parent, so a detached node simply
  // reports enabled rather than recursing into nothing.
  const parent = element.parentNode
  if ((parent && parent.nodeType === 1 && isElement(element, 'OPTGROUP')) || isElement(element, 'OPTION')) {
    return isEnabled(parent as Element)
  }

  return !isInsideDisabledFieldset(element)
}
