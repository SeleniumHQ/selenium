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

import { NameResult, roleOf, SnapshotContext, styleOf } from './context.js'
import { flatTreeChildren, hiddenState, isClosedDetails, isCollapsedDetailsContent, isHidden } from './hidden.js'
import { embeddedValue, isEmbeddedControl } from './value.js'

// Accessible name and description, following the accname 1.2 text
// alternative computation (https://w3c.github.io/accname/#computation-steps)
// with the html-aam rules for native elements. Step numbers in comments refer
// to that algorithm.

const TEXT_NODE = 3
const ELEMENT_NODE = 1

// WAI-ARIA 1.2 roles with "Name From: contents".
const NAME_FROM_CONTENT: ReadonlySet<string> = new Set([
  'button', 'cell', 'checkbox', 'columnheader', 'gridcell', 'heading', 'link', 'menuitem',
  'menuitemcheckbox', 'menuitemradio', 'option', 'radio', 'row', 'rowheader', 'switch', 'tab',
  'tooltip', 'treeitem',
])

// The input types that take a placeholder.
const TEXT_INPUT_TYPES: ReadonlySet<string> = new Set(['email', 'number', 'password', 'search', 'tel', 'text', 'url'])

// Display values whose boxes sit inline with text; everything else is treated
// as block-level when children are joined (2F.iii).
const INLINE_DISPLAYS: ReadonlySet<string> = new Set([
  'inline', 'inline-block', 'inline-flex', 'inline-grid', 'inline-table', 'contents', 'ruby',
  'ruby-base', 'ruby-text', '',
])

interface Traversal {
  readonly context: SnapshotContext
  /** True while computing a description rather than a name. */
  readonly describing: boolean
  /** True inside an aria-labelledby / aria-describedby reference (2B is not applied again). */
  readonly inReference: boolean
  /** True for descendants of the element being named (2F.iii recursion) and for native label traversals. */
  readonly recursive: boolean
  /** True when the traversal root was hidden, so hidden descendants count too (2A). */
  readonly includeHidden: boolean
  /** The labelled control while its own label is traversed; it does not name itself. */
  readonly skip: Element | null
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function attribute(element: Element, name: string): string | null {
  const value = element.getAttribute(name)
  return value !== null && value.trim() !== '' ? value : null
}

function rootNodeOf(element: Element): Document | ShadowRoot {
  return element.getRootNode() as Document | ShadowRoot
}

function referencedElements(element: Element, attributeName: string): Element[] {
  const ids = element.getAttribute(attributeName)
  if (!ids) {
    return []
  }
  const root = rootNodeOf(element)
  const found: Element[] = []
  for (const id of ids.trim().split(/\s+/)) {
    const target = root.getElementById(id)
    if (target) {
      found.push(target)
    }
  }
  return found
}

// 2B: the text alternatives of the referenced elements, space-joined, an id
// listed twice counting once (as Chromium reads it). A target's text
// alternative is the same whoever references it and whether for a name or a
// description (2B is not applied inside a reference and 2C is), so it is
// computed once per snapshot: a header that labels every cell of a column is
// read once, not once per cell. No cycle check is needed beyond
// `inReference`: nothing below a reference follows references again.
function fromReferences(element: Element, attributeName: string, t: Traversal): string {
  const parts: string[] = []
  const listed = new Set<Element>()
  for (const target of referencedElements(element, attributeName)) {
    if (listed.has(target)) {
      continue
    }
    listed.add(target)
    let text = t.context.referenceTexts.get(target)
    if (text === undefined) {
      text = textAlternative(target, {
        ...t,
        inReference: true,
        recursive: false,
        includeHidden: isHidden(target, t.context),
        skip: null,
      })
      t.context.referenceTexts.set(target, text)
    }
    parts.push(text)
  }
  return normalize(parts.join(' '))
}

const GENERATED_CONTENT_SELECTOR = /::?(before|after)\b/i

// Whether one stylesheet has a rule that can set ::before or ::after content,
// looking into grouping rules (@media, @supports, @layer, @container, nested
// rules) and imports. A sheet whose rules cannot be read (cross-origin)
// counts as defining them: a wrong "no" would drop real text, a wrong "yes"
// only costs the reads.
function sheetDefinesGeneratedContent(sheet: CSSStyleSheet): boolean {
  let rules: CSSRuleList
  try {
    rules = sheet.cssRules
  } catch (e) {
    return true
  }
  return rulesDefineGeneratedContent(rules)
}

function rulesDefineGeneratedContent(rules: CSSRuleList): boolean {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i] as CSSRule & { selectorText?: string; cssRules?: CSSRuleList; styleSheet?: CSSStyleSheet | null }
    if (typeof rule.selectorText === 'string' && GENERATED_CONTENT_SELECTOR.test(rule.selectorText)) {
      return true
    }
    if (rule.styleSheet && sheetDefinesGeneratedContent(rule.styleSheet)) {
      return true
    }
    if (rule.cssRules && rulesDefineGeneratedContent(rule.cssRules)) {
      return true
    }
  }
  return false
}

// Whether the sheets of one tree scope (the document or a shadow root) can
// define generated content; cached per scope for the call.
function scopeDefinesGeneratedContent(scope: Document | ShadowRoot, t: Traversal): boolean {
  let defines = t.context.generatedScopes.get(scope)
  if (defines === undefined) {
    defines = false
    const sheets = scope.styleSheets
    for (let i = 0; i < sheets.length && !defines; i++) {
      defines = sheetDefinesGeneratedContent(sheets[i])
    }
    const adopted = (scope as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets
    if (adopted) {
      for (let i = 0; i < adopted.length && !defines; i++) {
        defines = sheetDefinesGeneratedContent(adopted[i])
      }
    }
    t.context.generatedScopes.set(scope, defines)
  }
  return defines
}

// The scopes whose sheets can style an element's pseudo-elements: its own
// tree, its shadow root (through :host::before), the tree of the slot it is
// assigned to (through ::slotted()::before), and, for an element with a part
// name, every enclosing tree (through ::part()::before). The UA stylesheet is
// not consulted: its only generated content is the open-quote and
// close-quote keywords on q, which are not strings and are not text the atom
// can read (the names page pins that).
function mayHaveGeneratedContent(element: Element, t: Traversal): boolean {
  if (scopeDefinesGeneratedContent(rootNodeOf(element), t)) {
    return true
  }
  if (element.shadowRoot && scopeDefinesGeneratedContent(element.shadowRoot, t)) {
    return true
  }
  const slot = element.assignedSlot
  if (slot && scopeDefinesGeneratedContent(rootNodeOf(slot), t)) {
    return true
  }
  if (element.hasAttribute('part')) {
    for (let host = (rootNodeOf(element) as ShadowRoot).host; host; host = (rootNodeOf(host) as ShadowRoot).host) {
      if (scopeDefinesGeneratedContent(rootNodeOf(host), t)) {
        return true
      }
    }
  }
  return false
}

// Generated content of ::before and ::after, read once per element and only
// when some sheet in scope can define it: pseudo-element style reads are the
// most expensive kind, and every element in a name-from-content traversal
// would otherwise pay two.
function pseudoContent(element: Element, pseudo: '::before' | '::after', t: Traversal): string {
  let texts = t.context.generated.get(element)
  if (texts === undefined) {
    texts = mayHaveGeneratedContent(element, t)
      ? [readPseudoContent(element, '::before', t), readPseudoContent(element, '::after', t)]
      : ['', '']
    t.context.generated.set(element, texts)
  }
  return pseudo === '::before' ? texts[0] : texts[1]
}

// The index just past the quoted string that opens at `start`.
function endOfString(content: string, start: number): number {
  const quote = content[start]
  let i = start + 1
  while (i < content.length && content[i] !== quote) {
    if (content[i] === '\\' && i + 1 < content.length) {
      i++
    }
    i++
  }
  return i + 1
}

// The index just past the function whose opening parenthesis is at `start`,
// so url("...") and the like, whose quoted arguments are not text, are read
// as one token.
function endOfFunction(content: string, start: number): number {
  let depth = 0
  let i = start
  while (i < content.length) {
    const char = content[i]
    if (char === '"' || char === "'") {
      i = endOfString(content, i)
      continue
    }
    if (char === '(') {
      depth++
    } else if (char === ')' && --depth === 0) {
      return i + 1
    }
    i++
  }
  return i
}

// An attr() token in computed `content`: Chromium resolves it to a string
// before serialising, Firefox keeps the function, so the attribute is read
// from the originating element here. Only the attribute name is read; a
// fallback or type argument is ignored, as the attribute's string value is
// what both engines render.
function readAttrToken(element: Element, token: string): string {
  const match = /^attr\(\s*([^\s,)]+)/.exec(token)
  return match ? element.getAttribute(match[1]) || '' : ''
}

// The computed `content` is a list of strings and other tokens; only the
// strings and attr() references are text, and a bare slash introduces
// alternative text that replaces everything before it. A slash inside a
// quoted string is just a character, and a quoted string inside a function
// (the URL of an image) is not text. A pseudo-element that is not rendered
// has no text at all.
function readPseudoContent(element: Element, pseudo: string, t: Traversal): string {
  const style = styleOf(element, t.context, pseudo)
  if (!style || style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
    return ''
  }
  const content = style.content
  if (!content || content === 'none' || content === 'normal') {
    return ''
  }
  let text = ''
  let i = 0
  while (i < content.length) {
    const char = content[i]
    if (char === '"' || char === "'") {
      const end = endOfString(content, i)
      text += content.slice(i + 1, end - 1).replace(/\\(.)/g, '$1')
      i = end
    } else if (char === '(') {
      const end = endOfFunction(content, i)
      const start = content.lastIndexOf(' ', i) + 1
      text += readAttrToken(element, content.slice(start, end))
      i = end
    } else if (char === '/') {
      text = ''
      i++
    } else {
      i++
    }
  }
  return text
}

function isInline(element: Element, t: Traversal): boolean {
  const style = styleOf(element, t.context)
  return !style || INLINE_DISPLAYS.has(style.display)
}

// 2F: the concatenated text alternatives of the children, with generated
// content around them and block-level children set off by spaces.
//
// Cached per element for the traversal every enclosing content-named
// ancestor repeats (a cell's text is wanted by the row, then by the cell, then
// by a link inside it): no reference being followed, no hidden content
// included, no control skipped, a name rather than a description. The
// `recursive` flag does not change the result, since children are always
// traversed as recursive. Other traversals compute afresh.
function fromContent(element: Element, t: Traversal): string {
  const cacheable = !t.inReference && !t.includeHidden && t.skip === null && !t.describing
  if (!cacheable) {
    return computeContentText(element, t)
  }
  let text = t.context.contentTexts.get(element)
  if (text === undefined) {
    text = computeContentText(element, t)
    t.context.contentTexts.set(element, text)
  }
  return text
}

function computeContentText(element: Element, t: Traversal): string {
  // An invisible element's own text and generated content are not rendered;
  // visibility is inherited, so only descendants that set themselves visible
  // again contribute, through the recursion below.
  const ownTextHidden = !t.includeHidden && hiddenState(element, t.context) === 'self'
  let text = ownTextHidden ? '' : pseudoContent(element, '::before', t)
  const textCollapsed = isClosedDetails(element)
  const children = flatTreeChildren(element)
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.nodeType === TEXT_NODE) {
      if (!ownTextHidden && !textCollapsed) {
        text += child.nodeValue || ''
      }
      continue
    }
    if (child.nodeType !== ELEMENT_NODE) {
      continue
    }
    const childElement = child as Element
    if (childElement === t.skip || isCollapsedDetailsContent(childElement, childElement.parentElement || element)) {
      continue
    }
    if (childElement.localName === 'br') {
      text += ' '
      continue
    }
    const childState = t.includeHidden ? 'rendered' : hiddenState(childElement, t.context)
    if (childState === 'subtree' || childState === 'contents') {
      continue
    }
    // An invisible child has no text alternative of its own (2A); only what
    // is visible below it counts.
    const childText =
      childState === 'self'
        ? fromContent(childElement, { ...t, recursive: true })
        : textAlternative(childElement, { ...t, recursive: true })
    text += isInline(childElement, t) ? childText : ` ${childText} `
  }
  return text + (ownTextHidden ? '' : pseudoContent(element, '::after', t))
}

function firstChildNamed(element: Element, localName: string): Element | null {
  for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
    if (child.localName === localName) {
      return child
    }
  }
  return null
}

// html-aam: the labels of a labelable element, each traversed with the
// control itself left out so a wrapping label does not include its value.
function fromLabels(element: Element, t: Traversal): string | null {
  const labels = (element as HTMLInputElement).labels
  if (!labels || labels.length === 0) {
    return null
  }
  const parts: string[] = []
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]
    parts.push(fromContent(label, { ...t, recursive: true, includeHidden: isHidden(label, t.context), skip: element }))
  }
  const text = normalize(parts.join(' '))
  return text !== '' ? text : null
}

function inputNativeName(input: HTMLInputElement, t: Traversal): string | null {
  switch (input.type) {
    case 'button':
    case 'reset':
    case 'submit': {
      // html-aam: label elements, then the value, then the user agent's
      // default button labels.
      const label = fromLabels(input, t)
      if (label !== null) {
        return label
      }
      const value = attribute(input, 'value')
      if (value !== null) {
        return value
      }
      return input.type === 'submit' ? 'Submit' : input.type === 'reset' ? 'Reset' : null
    }
    case 'image':
      return attribute(input, 'alt') || fromLabels(input, t) || attribute(input, 'value')
    default:
      return fromLabels(input, t)
  }
}

// 2D: text alternatives the host language defines.
function nativeName(element: Element, t: Traversal): string | null {
  switch (element.localName) {
    case 'html':
      return (element.ownerDocument.title || '').trim() || null
    case 'input':
      return inputNativeName(element as HTMLInputElement, t)
    case 'button':
    case 'meter':
    case 'output':
    case 'progress':
    case 'select':
    case 'textarea':
      return fromLabels(element, t)
    case 'fieldset': {
      const legend = firstChildNamed(element, 'legend')
      return legend ? normalize(fromContent(legend, { ...t, recursive: true })) || null : null
    }
    case 'figure': {
      const caption = firstChildNamed(element, 'figcaption')
      return caption ? normalize(fromContent(caption, { ...t, recursive: true })) || null : null
    }
    case 'table': {
      const caption = firstChildNamed(element, 'caption')
      return caption ? normalize(fromContent(caption, { ...t, recursive: true })) || null : null
    }
    case 'img':
    case 'area':
      return attribute(element, 'alt')
    case 'optgroup':
      return attribute(element, 'label')
    case 'option':
      return attribute(element, 'label')
    case 'svg': {
      const title = firstChildNamed(element, 'title')
      return title ? normalize(title.textContent || '') || null : null
    }
    default:
      return null
  }
}

function placeholder(element: Element): string | null {
  if (element.localName === 'textarea') {
    return attribute(element, 'placeholder')
  }
  if (element.localName === 'input' && TEXT_INPUT_TYPES.has((element as HTMLInputElement).type)) {
    return attribute(element, 'placeholder')
  }
  return null
}

// The traversal every content-named ancestor repeats for the same descendant:
// a cell is a descendant of its row, a link of its cell. Its result depends
// on nothing but the element, so it is cached per element; the top-level
// result (computeName) differs in steps 2C, 2E and 2F and has its own cache.
function isStandardDescendantTraversal(t: Traversal): boolean {
  return t.recursive && !t.inReference && !t.includeHidden && t.skip === null && !t.describing
}

function textAlternative(node: Node, t: Traversal): string {
  if (node.nodeType === TEXT_NODE) {
    return node.nodeValue || ''
  }
  if (node.nodeType !== ELEMENT_NODE) {
    return ''
  }
  const element = node as Element
  if (!isStandardDescendantTraversal(t)) {
    return computeTextAlternative(element, t).text
  }
  let text = t.context.descendantTexts.get(element)
  if (text === undefined) {
    text = computeTextAlternative(element, t).text
    t.context.descendantTexts.set(element, text)
  }
  return text
}

// The computation for one element, also used for the element being named.
function computeTextAlternative(element: Element, t: Traversal): NameResult {
  const role = roleOf(element, t.context)
  const embedded = (t.recursive || t.inReference) && isEmbeddedControl(role)

  // 2B
  if (!t.inReference) {
    const referenced = fromReferences(element, t.describing ? 'aria-describedby' : 'aria-labelledby', t)
    if (referenced !== '') {
      return { text: referenced, source: 'reference' }
    }
  }
  // 2C. The element being described does not take aria-label; a referenced
  // element does, because its text alternative is what is being read.
  if (!t.describing || t.inReference) {
    const label = attribute(element, 'aria-label')
    if (label !== null && !embedded) {
      return { text: normalize(label), source: 'label' }
    }
  }
  // 2E, ahead of 2D: a control reached while naming something else
  // contributes its value, not its own label. That is what the user sees in
  // the enclosing label, and it is also what stops two labels that wrap each
  // other's control from recursing without end.
  if (embedded) {
    const value = embeddedValue(element, role)
    if (value !== null) {
      return { text: normalize(value), source: 'native' }
    }
  }
  // 2D. A present alt attribute is the final answer for an image, even when
  // empty (html-aam): a decorative image does not pick up its title.
  if ((element.localName === 'img' || element.localName === 'area') && element.hasAttribute('alt')) {
    return { text: normalize(element.getAttribute('alt') || ''), source: 'native' }
  }
  const native = nativeName(element, t)
  if (native !== null && normalize(native) !== '') {
    return { text: normalize(native), source: 'native' }
  }
  // 2F, 2H
  if (NAME_FROM_CONTENT.has(role) || t.recursive || t.inReference) {
    const content = normalize(fromContent(element, t))
    if (content !== '') {
      return { text: content, source: 'content' }
    }
  }
  // 2I
  const title = attribute(element, 'title')
  if (title !== null) {
    return { text: normalize(title), source: 'title' }
  }
  const hint = placeholder(element)
  if (hint !== null) {
    return { text: normalize(hint), source: 'placeholder' }
  }
  return { text: '', source: 'none' }
}

function traversal(context: SnapshotContext, describing: boolean): Traversal {
  return { context, describing, inReference: false, recursive: false, includeHidden: false, skip: null }
}

/** The accessible name of an element and where it came from. */
export function computeName(element: Element, context: SnapshotContext): NameResult {
  let result = context.names.get(element)
  if (result === undefined) {
    result = computeTextAlternative(element, traversal(context, false))
    context.names.set(element, result)
  }
  return result
}

/** The accessible description: aria-describedby, aria-description, then title when the name did not use it. */
export function computeDescription(element: Element, context: SnapshotContext): string {
  let description = context.descriptions.get(element)
  if (description === undefined) {
    description = fromReferences(element, 'aria-describedby', traversal(context, true))
    if (description === '') {
      const inline = attribute(element, 'aria-description')
      if (inline !== null) {
        description = normalize(inline)
      } else {
        const title = attribute(element, 'title')
        description = title !== null && computeName(element, context).source !== 'title' ? normalize(title) : ''
      }
    }
    context.descriptions.set(element, description)
  }
  return description
}
