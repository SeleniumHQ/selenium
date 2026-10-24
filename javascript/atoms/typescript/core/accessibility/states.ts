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

import { isEnabled } from '../enabled.js'
import { canTakeFocus } from './roles.js'
import type { StateValue } from './types.js'
import { embeddedValue } from './value.js'

// The `states` map and `value` field of ADR 18205 §2. Which keys appear:
//
//   checked   whenever the role supports it; "mixed" where the role allows it
//   pressed   when the element sets aria-pressed: a button without it is not
//             a toggle button, so reporting pressed=false would mislead
//   expanded  when the element sets aria-expanded, and on a summary from its
//             details' open state
//   selected  always for option, tab and treeitem, where selection is part of
//             the role; for gridcell, row and headers only when the element
//             sets aria-selected, since most grids are not selectable
//   level     always for headings (tag, aria-level, or ARIA's default of 2);
//             elsewhere when the element sets aria-level
//   disabled  true only when disabled, natively or through aria-disabled on
//             the element, or on an ancestor when the element can take focus
//             (WAI-ARIA 1.2: the state reaches focusable descendants)
//   focused   true only on the focused element
//
// For pressed, expanded and the grid parts' selected, "undefined" and an
// empty value mean the attribute is not set: ARIA defines undefined as "not
// a toggle", "not expandable", "not selectable".
//
// Adding a key is additive under the ADR's compatibility rule; the states
// page pins the current set.

const CHECKED_ROLES: ReadonlySet<string> = new Set(['checkbox', 'menuitemcheckbox', 'menuitemradio', 'radio', 'switch'])
const MIXED_ALLOWED: ReadonlySet<string> = new Set(['checkbox', 'menuitemcheckbox'])
const ALWAYS_SELECTED_ROLES: ReadonlySet<string> = new Set(['option', 'tab', 'treeitem'])
const SELECTABLE_ROLES: ReadonlySet<string> = new Set(['columnheader', 'gridcell', 'row', 'rowheader'])
const LEVEL_ROLES: ReadonlySet<string> = new Set(['comment', 'listitem', 'row', 'tablist', 'treeitem'])
const VALUE_ROLES: ReadonlySet<string> = new Set([
  'combobox', 'meter', 'progressbar', 'scrollbar', 'searchbox', 'slider', 'spinbutton', 'textbox',
])
// The elements core/enabled.ts can report as disabled; for anything else it
// answers enabled without looking, so it is not asked.
const DISABLEABLE_ELEMENTS: ReadonlySet<string> = new Set(['button', 'input', 'optgroup', 'option', 'select', 'textarea'])

function token(element: Element, name: string): string | null {
  const value = element.getAttribute(name)
  return value === null ? null : value.trim().toLowerCase()
}

// A token whose "undefined" and empty values count as the attribute being absent.
function optionalToken(element: Element, name: string): string | null {
  const value = token(element, name)
  return value === '' || value === 'undefined' ? null : value
}

function tristate(element: Element, name: string, allowMixed: boolean): StateValue {
  const value = token(element, name)
  if (value === 'true') {
    return true
  }
  if (value === 'mixed' && allowMixed) {
    return 'mixed'
  }
  return false
}

function checked(element: Element, role: string): StateValue {
  if (element.localName === 'input') {
    const input = element as HTMLInputElement
    if (input.type === 'checkbox' || input.type === 'radio') {
      return input.indeterminate && MIXED_ALLOWED.has(role) ? 'mixed' : input.checked
    }
  }
  return tristate(element, 'aria-checked', MIXED_ALLOWED.has(role))
}

function expanded(element: Element): boolean | null {
  const value = optionalToken(element, 'aria-expanded')
  if (value !== null) {
    return value === 'true'
  }
  if (element.localName === 'summary') {
    const details = element.parentElement
    if (details && details.localName === 'details') {
      return details.hasAttribute('open')
    }
  }
  return null
}

function selected(element: Element, role: string): boolean | null {
  if (element.localName === 'option' && role === 'option') {
    return (element as HTMLOptionElement).selected
  }
  if (ALWAYS_SELECTED_ROLES.has(role)) {
    return token(element, 'aria-selected') === 'true'
  }
  if (SELECTABLE_ROLES.has(role)) {
    const value = optionalToken(element, 'aria-selected')
    return value === null ? null : value === 'true'
  }
  return null
}

function ariaLevel(element: Element): number | null {
  const value = element.getAttribute('aria-level')
  if (value === null || !/^\s*\d+\s*$/.test(value)) {
    return null
  }
  const level = parseInt(value, 10)
  return level >= 1 ? level : null
}

function level(element: Element, role: string): number | null {
  if (role === 'heading') {
    const explicit = ariaLevel(element)
    if (explicit !== null) {
      return explicit
    }
    const tag = /^h([1-6])$/.exec(element.localName)
    return tag ? Number(tag[1]) : 2
  }
  return LEVEL_ROLES.has(role) ? ariaLevel(element) : null
}

/** Whether the element itself sets aria-disabled=true. */
export function setsAriaDisabled(element: Element): boolean {
  return token(element, 'aria-disabled') === 'true'
}

// The DOM parent, or the host for a shadow root's child: aria-disabled on
// a host reaches into its shadow tree.
function parentOrHost(element: Element): Element | null {
  if (element.parentElement) {
    return element.parentElement
  }
  return (element.getRootNode() as ShadowRoot).host || null
}

/**
 * Whether an ancestor sets aria-disabled. The walk threads that down, so
 * this check is only for a root or an owned element, whose ancestors the
 * walk has not seen.
 */
export function isDisabledByAncestor(element: Element): boolean {
  for (let current = parentOrHost(element); current; current = parentOrHost(current)) {
    if (setsAriaDisabled(current)) {
      return true
    }
  }
  return false
}

// An ancestor's aria-disabled reaches the descendants that can take focus
// (WAI-ARIA 1.2), not the headings and paragraphs between them.
function disabled(element: Element, disabledByAncestor: boolean): boolean {
  if (setsAriaDisabled(element) || (disabledByAncestor && canTakeFocus(element))) {
    return true
  }
  return DISABLEABLE_ELEMENTS.has(element.localName) && !isEnabled(element)
}

// The body is the default active element and is not "focused" in any sense a
// user would recognise. Focus inside a shadow tree is known to that tree's
// root; the document only knows the host, which is not itself focused while
// something it can see inside its shadow root is.
function focused(element: Element): boolean {
  const doc = element.ownerDocument
  if (element === doc.body || element === doc.documentElement) {
    return false
  }
  const root = element.getRootNode() as Document | ShadowRoot
  if (root.activeElement !== element) {
    return false
  }
  return !(element.shadowRoot && element.shadowRoot.activeElement)
}

/**
 * The states map for an element with the given role; {} when there are none.
 * `disabledByAncestor` is whether an ancestor sets aria-disabled, which the
 * walk knows without climbing.
 */
export function computeStates(element: Element, role: string, disabledByAncestor: boolean): Record<string, StateValue> {
  const states: Record<string, StateValue> = {}
  if (CHECKED_ROLES.has(role)) {
    states.checked = checked(element, role)
  }
  if (role === 'button') {
    const pressed = optionalToken(element, 'aria-pressed')
    if (pressed !== null) {
      states.pressed = tristate(element, 'aria-pressed', true)
    }
  }
  const isExpanded = expanded(element)
  if (isExpanded !== null) {
    states.expanded = isExpanded
  }
  const isSelected = selected(element, role)
  if (isSelected !== null) {
    states.selected = isSelected
  }
  const headingLevel = level(element, role)
  if (headingLevel !== null) {
    states.level = headingLevel
  }
  if (disabled(element, disabledByAncestor)) {
    states.disabled = true
  }
  if (focused(element)) {
    states.focused = true
  }
  return states
}

/** The current value for textbox, searchbox, combobox and range roles; null when the field is absent. */
export function computeValue(element: Element, role: string): string | null {
  return VALUE_ROLES.has(role) ? embeddedValue(element, role) : null
}
