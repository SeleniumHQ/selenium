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

// WAI-ARIA 1.2 §6.4, global states and properties, including the four the
// spec deprecates as globals but still lists. Their presence stops
// none/presentation from applying (§9.1).
const GLOBAL_ARIA_ATTRIBUTES: ReadonlyArray<string> = [
  'aria-atomic', 'aria-busy', 'aria-controls', 'aria-current', 'aria-describedby',
  'aria-description', 'aria-details', 'aria-disabled', 'aria-dropeffect', 'aria-errormessage',
  'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden', 'aria-invalid',
  'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-live', 'aria-owns',
  'aria-relevant', 'aria-roledescription',
]

// Elements that take focus on their own, when not disabled.
const NATIVELY_FOCUSABLE: ReadonlySet<string> = new Set(['button', 'iframe', 'input', 'select', 'summary', 'textarea'])

// Not a WAI-ARIA role: the token ADR 18205 uses for frame leaves, which the
// bindings replace with the child document's tree.
const FRAME_ELEMENTS: ReadonlySet<string> = new Set(['frame', 'iframe'])

const SECTIONING_CONTENT: ReadonlySet<string> = new Set(['article', 'aside', 'nav', 'section'])
// html-aam: a header or footer is a landmark only outside these elements and
// outside elements with these roles.
const HEADER_FOOTER_SCOPES: ReadonlySet<string> = new Set(['article', 'aside', 'main', 'nav', 'section'])
const HEADER_FOOTER_SCOPE_ROLES: ReadonlySet<string> = new Set(['article', 'complementary', 'main', 'navigation', 'region'])
const LIST_PARENTS: ReadonlySet<string> = new Set(['menu', 'ol', 'ul'])

export function isPresentational(role: string): boolean {
  return role === 'none' || role === 'presentation'
}

/**
 * How the role of another element is found when one element's role depends
 * on it (a cell on its table, an li on its list). The snapshot context
 * passes its cached lookup so the owner is computed once for all of them.
 */
export type RoleLookup = (element: Element) => string

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

// "Focusable" in the §9.1 sense: the element can take focus at all, including
// through a negative tabindex. This is narrower than core/focusable.ts, which
// answers WebDriver's question and counts every anchor and label. The states
// module uses the same notion for what an ancestor's aria-disabled reaches.
export function canTakeFocus(element: Element): boolean {
  const name = element.localName
  if (NATIVELY_FOCUSABLE.has(name)) {
    // A disabled control or a hidden input cannot take focus, whatever its tabindex.
    if (name === 'input' && (element as HTMLInputElement).type === 'hidden') {
      return false
    }
    return !('disabled' in element && (element as HTMLInputElement).disabled)
  }
  const tabindex = element.getAttribute('tabindex')
  if (tabindex !== null && /^\s*[-+]?\d+\s*$/.test(tabindex)) {
    return true
  }
  if (name === 'a' || name === 'area') {
    return element.hasAttribute('href')
  }
  return (element as HTMLElement).isContentEditable === true
}

// html-aam makes some roles depend on whether the element has an accessible
// name (section, form, aside inside sectioning content). Only the author
// sources that can produce one are checked here: aria-label, an
// aria-labelledby that resolves to something with a text alternative, or a
// title. The full name computation is not what those rows ask for.
function hasAuthorName(element: Element): boolean {
  const label = element.getAttribute('aria-label')
  if (label !== null && label.trim() !== '') {
    return true
  }
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy !== null && labelledBy.trim() !== '') {
    const root = element.getRootNode() as Document | ShadowRoot
    for (const id of labelledBy.trim().split(/\s+/)) {
      const target = root.getElementById(id)
      if (target && hasTextAlternative(target)) {
        return true
      }
    }
  }
  const title = element.getAttribute('title')
  return title !== null && title.trim() !== ''
}

// The attributes accname reads for the text alternative of an element inside
// a referenced label when it has no text of its own: an image's alt, a label
// or tooltip, a control's value.
const ALTERNATIVE_ATTRIBUTES = ['aria-label', 'alt', 'title', 'value']

// Whether a referenced label can contribute any text: its own text content,
// or an alternative on it or on an element below it.
function hasTextAlternative(target: Element): boolean {
  if ((target.textContent || '').trim() !== '') {
    return true
  }
  const elements = [target, ...Array.from(target.querySelectorAll('*'))]
  return elements.some((candidate) =>
    ALTERNATIVE_ATTRIBUTES.some((attribute) => (candidate.getAttribute(attribute) || '').trim() !== ''),
  )
}

// WAI-ARIA 1.2 §9.1: when an element with required owned elements is
// presentational, so are those owned elements.
function ownerIsPresentational(owner: Element | null, lookup: RoleLookup): boolean {
  return owner !== null && isPresentational(lookup(owner))
}

function hasAncestor(element: Element, names: ReadonlySet<string>, roles: ReadonlySet<string> | null = null): boolean {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (names.has(parent.localName)) {
      return true
    }
    if (roles !== null) {
      const role = explicitRole(parent)
      if (role !== null && roles.has(role)) {
        return true
      }
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

function tableCellRole(cell: Element, lookup: RoleLookup): string {
  const table = cell.closest('table')
  if (!table) {
    return 'cell'
  }
  const tableRole = lookup(table)
  if (isPresentational(tableRole)) {
    return 'generic'
  }
  return tableRole === 'grid' || tableRole === 'treegrid' ? 'gridcell' : 'cell'
}

function tableHeaderRole(header: Element, lookup: RoleLookup): string {
  if (ownerIsPresentational(header.closest('table'), lookup)) {
    return 'generic'
  }
  const scope = (header.getAttribute('scope') || '').toLowerCase()
  return scope === 'row' || scope === 'rowgroup' ? 'rowheader' : 'columnheader'
}

function tablePartRole(part: Element, role: string, lookup: RoleLookup): string {
  return ownerIsPresentational(part.closest('table'), lookup) ? 'generic' : role
}

/**
 * The html-aam implicit role of an element, with no regard to its role
 * attribute. `lookup` finds the role of an element this one depends on.
 */
export function implicitRole(element: Element, lookup: RoleLookup = computeRole): string {
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
      return hasAncestor(element, HEADER_FOOTER_SCOPES, HEADER_FOOTER_SCOPE_ROLES) ? 'generic' : 'contentinfo'
    case 'form':
      // html-aam: a landmark only with an accessible name, otherwise no role.
      return hasAuthorName(element) ? 'form' : 'generic'
    case 'frame':
    case 'iframe':
      return 'iframe'
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading'
    case 'header':
      return hasAncestor(element, HEADER_FOOTER_SCOPES, HEADER_FOOTER_SCOPE_ROLES) ? 'generic' : 'banner'
    case 'hr':
      return 'separator'
    case 'html':
      return 'document'
    case 'img':
      if (element.getAttribute('alt') === '' && !hasGlobalAriaAttribute(element) && !canTakeFocus(element)) {
        return 'presentation'
      }
      return 'img'
    case 'input':
      return inputRole(element as HTMLInputElement)
    case 'ins':
      return 'insertion'
    case 'li': {
      const parent = element.parentElement
      if (!parent || !LIST_PARENTS.has(parent.localName) || ownerIsPresentational(parent, lookup)) {
        return 'generic'
      }
      return 'listitem'
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
      return tablePartRole(element, 'rowgroup', lookup)
    case 'td':
      return tableCellRole(element, lookup)
    case 'textarea':
      return 'textbox'
    case 'th':
      return tableHeaderRole(element, lookup)
    case 'time':
      return 'time'
    case 'tr':
      return tablePartRole(element, 'row', lookup)
    default:
      return 'generic'
  }
}

/**
 * The role the snapshot reports for an element: the explicit role when it
 * names a usable role and is not a presentational role on an element that
 * cannot be presentational (WAI-ARIA 1.2 §9.1), otherwise the implicit one.
 * `lookup` finds the role of an element this one depends on; without one,
 * it is computed afresh.
 */
export function computeRole(element: Element, lookup: RoleLookup = computeRole): string {
  if (FRAME_ELEMENTS.has(element.localName)) {
    // The token is how the bindings find the frames whose documents they
    // stitch in, so an explicit role (ARIA in HTML allows application,
    // document, img and the presentational pair) never replaces it; the
    // embedded document is exposed whatever the frame element is called.
    return 'iframe'
  }
  const explicit = explicitRole(element)
  if (explicit === null) {
    return implicitRole(element, lookup)
  }
  if (isPresentational(explicit) && (canTakeFocus(element) || hasGlobalAriaAttribute(element))) {
    return implicitRole(element, lookup)
  }
  return explicit
}
