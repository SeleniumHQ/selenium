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

// Values of embedded controls, as accname step 2E reads them when a control
// sits inside something whose name is being computed. The states slice
// reuses this for the `value` field.

const TEXT_ROLES: ReadonlySet<string> = new Set(['textbox', 'searchbox'])
const SELECTION_ROLES: ReadonlySet<string> = new Set(['combobox', 'listbox'])
const RANGE_ROLES: ReadonlySet<string> = new Set(['meter', 'progressbar', 'scrollbar', 'slider', 'spinbutton'])

export function isEmbeddedControl(role: string): boolean {
  return TEXT_ROLES.has(role) || SELECTION_ROLES.has(role) || RANGE_ROLES.has(role)
}

function selectedOptionsText(select: HTMLSelectElement): string {
  const texts: string[] = []
  for (let i = 0; i < select.options.length; i++) {
    const option = select.options[i]
    if (option.selected) {
      texts.push(option.label || option.text)
    }
  }
  return texts.join(' ')
}

// What the user sees: innerText follows CSS (display: none, visibility) where
// textContent would include hidden descendants.
function renderedText(element: Element): string {
  const text = (element as HTMLElement).innerText
  return typeof text === 'string' ? text : element.textContent || ''
}

// A listbox built from ARIA: its selected options, in document order.
function selectedAriaOptions(listbox: Element): string {
  const selected = listbox.querySelectorAll('[aria-selected="true"]')
  const texts: string[] = []
  for (let i = 0; i < selected.length; i++) {
    texts.push(renderedText(selected[i]))
  }
  return texts.join(' ')
}

/** The current value of an embedded control, or null when the role has none. */
export function embeddedValue(element: Element, role: string): string | null {
  if (RANGE_ROLES.has(role)) {
    const text = element.getAttribute('aria-valuetext')
    if (text !== null && text.trim() !== '') {
      return text.trim()
    }
    const now = element.getAttribute('aria-valuenow')
    if (now !== null) {
      return now.trim()
    }
    return 'value' in element ? String((element as HTMLInputElement).value) : null
  }
  if (TEXT_ROLES.has(role) || SELECTION_ROLES.has(role)) {
    if (element.localName === 'select') {
      return selectedOptionsText(element as HTMLSelectElement)
    }
    if ('value' in element && typeof (element as HTMLInputElement).value === 'string') {
      const value = (element as HTMLInputElement).value
      // A password is masked one bullet per character, as Chromium's
      // accessibility tree exposes it: snapshots end up in logs and reports.
      return element.localName === 'input' && (element as HTMLInputElement).type === 'password'
        ? '\u2022'.repeat(value.length)
        : value
    }
    if (role === 'listbox') {
      return selectedAriaOptions(element)
    }
    return renderedText(element)
  }
  return null
}
