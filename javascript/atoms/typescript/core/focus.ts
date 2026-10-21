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

import { isElement } from './element.js'
import { isFocusable } from './focusable.js'

// The focused element, looking through open shadow roots: document.activeElement
// stops at the shadow host.
function getDeepActiveElement(doc: Document): Element | null {
  return throughOpenShadowRoots(doc.activeElement)
}

// The focused element as seen from `element`. A closed shadow root hides its
// focused element from the document, but not from a node inside it: when
// focus is within the element's own shadow root, that root's active element
// is the true one, and the document would only report the host.
export function getActiveElementFrom(element: Element): Element | null {
  const root = element.getRootNode() as Node & Partial<DocumentOrShadowRoot>
  if (root !== element.ownerDocument && root.activeElement) {
    return throughOpenShadowRoots(root.activeElement)
  }
  return getDeepActiveElement(element.ownerDocument)
}

function throughOpenShadowRoots(active: Element | null): Element | null {
  while (active && active.shadowRoot && active.shadowRoot.activeElement) {
    active = active.shadowRoot.activeElement
  }
  return active
}

function focusTarget(element: Element): Element {
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (isFocusable(node)) {
      return node
    }
  }
  return element
}

// Focuses the element, or its nearest focusable ancestor, as a click or a
// keyboard interaction would. Returns whether focus moved to it.
//
// focus() already blurs whatever had focus, so the explicit blur is only for
// a target that cannot take focus: a real click on non-focusable content
// still takes focus away from the field that had it. When focus lands
// somewhere else, a focus handler moved it there on purpose, so it is left
// alone. preventScroll because the caller has already scrolled the element
// into view and a second scroll would move it again.
export function focusOnElement(element: Element): boolean {
  const target = focusTarget(element)
  const previous = getActiveElementFrom(target)
  if (previous === target) {
    return false
  }
  if (typeof (target as HTMLElement).focus === 'function') {
    ;(target as HTMLElement).focus({ preventScroll: true })
  }
  const active = getActiveElementFrom(target)
  if (active === target) {
    return true
  }
  if (active !== previous) {
    return false
  }
  if (active && !isElement(active, 'BODY') && typeof (active as HTMLElement).blur === 'function') {
    ;(active as HTMLElement).blur()
  }
  return false
}
