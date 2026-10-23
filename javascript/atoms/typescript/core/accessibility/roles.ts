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

import { isFocusable } from '../focusable.js'

// Role computation: the explicit role attribute with the WAI-ARIA 1.2 fallback
// and conflict rules, then the html-aam implicit mapping. Where html-aam says
// an element has "no corresponding role" this reports `generic`, so the
// pruning rule in ADR 18205 treats it like a div. Two rows deliberately
// diverge from html-aam towards what engines expose, and the roles test page
// pins them: input type=password is a textbox and summary is a button.

// WAI-ARIA 1.2 roles authors may use (abstract roles left out), plus the
// graphics module roles that svg maps to.
const CONCRETE_ROLES: ReadonlySet<string> = new Set([
  'alert', 'alertdialog', 'application', 'article', 'banner', 'blockquote', 'button',
  'caption', 'cell', 'checkbox', 'code', 'columnheader', 'combobox', 'complementary',
  'contentinfo', 'definition', 'deletion', 'dialog', 'directory', 'document', 'emphasis',
  'feed', 'figure', 'form', 'generic', 'grid', 'gridcell', 'group', 'heading', 'img',
  'insertion', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math',
  'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'meter',
  'navigation', 'none', 'note', 'option', 'paragraph', 'presentation', 'progressbar',
  'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search',
  'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'strong', 'subscript',
  'superscript', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'time',
  'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem',
  'graphics-document', 'graphics-object', 'graphics-symbol',
])

// WAI-ARIA 1.2 §6.4, global states and properties. Their presence stops
// none/presentation from applying (§9.1).
const GLOBAL_ARIA_ATTRIBUTES: ReadonlyArray<string> = [
  'aria-atomic', 'aria-busy', 'aria-controls', 'aria-current', 'aria-describedby',
  'aria-description', 'aria-details', 'aria-dropeffect', 'aria-flowto', 'aria-grabbed',
  'aria-hidden', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-live',
  'aria-owns', 'aria-relevant', 'aria-roledescription',
]

const SECTIONING_CONTENT: ReadonlySet<string> = new Set(['article', 'aside', 'nav', 'section'])
const HEADER_FOOTER_SCOPES: ReadonlySet<string> = new Set(['article', 'aside', 'main', 'nav', 'section'])
const LIST_PARENTS: ReadonlySet<string> = new Set(['menu', 'ol', 'ul'])

export function isPresentational(role: string): boolean {
  return role === 'none' || role === 'presentation'
}

/**
 * The first token of the role attribute that names a role authors may use,
 * or null when there is none. Tokens match ASCII case-insensitively, which is
 * what engines do.
 */
export function explicitRole(element: Element): string | null {
  const attribute = element.getAttribute('role')
  if (!attribute) {
    return null
  }
  for (const token of attribute.trim().toLowerCase().split(/\s+/)) {
    if (CONCRETE_ROLES.has(token)) {
      return token
    }
  }
  return null
}

function hasGlobalAriaAttribute(element: Element): boolean {
  return GLOBAL_ARIA_ATTRIBUTES.some((name) => element.hasAttribute(name))
}

// html-aam makes some roles depend on whether the author named the element
// (section, aside inside sectioning content). Only author attributes count
// here; the full name computation is not what those rows ask for.
function hasAuthorName(element: Element): boolean {
  const label = element.getAttribute('aria-label')
  if (label !== null && label.trim() !== '') {
    return true
  }
  const labelledBy = element.getAttribute('aria-labelledby')
  return labelledBy !== null && labelledBy.trim() !== ''
}

function hasAncestor(element: Element, names: ReadonlySet<string>): boolean {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (names.has(parent.localName)) {
      return true
    }
  }
  return false
}

function inputRole(input: HTMLInputElement): string {
  // The IDL property already folds unknown and missing types to "text".
  const type = input.type
  const hasList = input.hasAttribute('list')
  switch (type) {
    case 'button':
    case 'image':
    case 'reset':
    case 'submit':
      return 'button'
    case 'checkbox':
      return 'checkbox'
    case 'radio':
      return 'radio'
    case 'range':
      return 'slider'
    case 'number':
      return 'spinbutton'
    case 'search':
      return hasList ? 'combobox' : 'searchbox'
    case 'email':
    case 'tel':
    case 'text':
    case 'url':
      return hasList ? 'combobox' : 'textbox'
    case 'password':
      // html-aam: no corresponding role. Engines expose a textbox, and
      // dropping password fields from the tree would hide a control users act on.
      return 'textbox'
    default:
      // color, date, datetime-local, file, hidden, month, time, week.
      return 'generic'
  }
}

function tableCellRole(cell: Element): string {
  const table = cell.closest('table')
  const tableRole = table ? explicitRole(table) : null
  return tableRole === 'grid' || tableRole === 'treegrid' ? 'gridcell' : 'cell'
}

function tableHeaderRole(header: Element): string {
  const scope = (header.getAttribute('scope') || '').toLowerCase()
  return scope === 'row' || scope === 'rowgroup' ? 'rowheader' : 'columnheader'
}

/** The html-aam implicit role of an element, with no regard to its role attribute. */
export function implicitRole(element: Element): string {
  switch (element.localName) {
    case 'a':
    case 'area':
      return element.hasAttribute('href') ? 'link' : 'generic'
    case 'address':
    case 'details':
    case 'fieldset':
    case 'hgroup':
    case 'optgroup':
      return 'group'
    case 'article':
      return 'article'
    case 'aside':
      if (!hasAncestor(element, SECTIONING_CONTENT)) {
        return 'complementary'
      }
      return hasAuthorName(element) ? 'complementary' : 'generic'
    case 'blockquote':
      return 'blockquote'
    case 'button':
      return 'button'
    case 'caption':
      return 'caption'
    case 'code':
      return 'code'
    case 'datalist':
      return 'listbox'
    case 'dd':
      return 'definition'
    case 'del':
      return 'deletion'
    case 'dfn':
    case 'dt':
      return 'term'
    case 'dialog':
      return 'dialog'
    case 'em':
      return 'emphasis'
    case 'figure':
      return 'figure'
    case 'footer':
      return hasAncestor(element, HEADER_FOOTER_SCOPES) ? 'generic' : 'contentinfo'
    case 'form':
      return 'form'
    case 'frame':
    case 'iframe':
      // Not a WAI-ARIA role: the token ADR 18205 uses for frame leaves, which the
      // bindings replace with the child document's tree.
      return 'iframe'
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading'
    case 'header':
      return hasAncestor(element, HEADER_FOOTER_SCOPES) ? 'generic' : 'banner'
    case 'hr':
      return 'separator'
    case 'html':
      return 'document'
    case 'img':
      if (element.getAttribute('alt') === '' && !hasGlobalAriaAttribute(element) && !isFocusable(element)) {
        return 'presentation'
      }
      return 'img'
    case 'input':
      return inputRole(element as HTMLInputElement)
    case 'ins':
      return 'insertion'
    case 'li': {
      const parent = element.parentElement
      return parent && LIST_PARENTS.has(parent.localName) ? 'listitem' : 'generic'
    }
    case 'main':
      return 'main'
    case 'math':
      return 'math'
    case 'menu':
    case 'ol':
    case 'ul':
      return 'list'
    case 'meter':
      return 'meter'
    case 'nav':
      return 'navigation'
    case 'option':
      return 'option'
    case 'output':
      return 'status'
    case 'p':
      return 'paragraph'
    case 'progress':
      return 'progressbar'
    case 'search':
      return 'search'
    case 'section':
      return hasAuthorName(element) ? 'region' : 'generic'
    case 'select': {
      const select = element as HTMLSelectElement
      return select.multiple || select.size > 1 ? 'listbox' : 'combobox'
    }
    case 'strong':
      return 'strong'
    case 'sub':
      return 'subscript'
    case 'summary':
      // html-aam: no corresponding role. Engines expose the disclosure control
      // as a button, and that is what users click.
      return 'button'
    case 'sup':
      return 'superscript'
    case 'svg':
      return 'graphics-document'
    case 'table':
      return 'table'
    case 'tbody':
    case 'tfoot':
    case 'thead':
      return 'rowgroup'
    case 'td':
      return tableCellRole(element)
    case 'textarea':
      return 'textbox'
    case 'th':
      return tableHeaderRole(element)
    case 'time':
      return 'time'
    case 'tr':
      return 'row'
    default:
      return 'generic'
  }
}

/**
 * The role the snapshot reports for an element: the explicit role when it
 * names a usable role and is not a presentational role on an element that
 * cannot be presentational (WAI-ARIA 1.2 §9.1), otherwise the implicit one.
 */
export function computeRole(element: Element): string {
  const explicit = explicitRole(element)
  if (explicit === null) {
    return implicitRole(element)
  }
  if (isPresentational(explicit) && (isFocusable(element) || hasGlobalAriaAttribute(element))) {
    return implicitRole(element)
  }
  return explicit
}
