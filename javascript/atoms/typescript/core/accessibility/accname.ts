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
import { hiddenState, isCollapsedDetailsContent, isHidden } from './hidden.js'
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

const TEXT_INPUT_TYPES: ReadonlySet<string> = new Set(['email', 'password', 'search', 'tel', 'text', 'url'])

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
  /** Referenced elements already visited, so reference cycles end. */
  readonly visited: Set<Element>
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

// 2B: the text alternatives of the referenced elements, space-joined.
function fromReferences(element: Element, attributeName: string, t: Traversal): string {
  const parts: string[] = []
  for (const target of referencedElements(element, attributeName)) {
    if (t.visited.has(target)) {
      continue
    }
    t.visited.add(target)
    parts.push(
      textAlternative(target, {
        ...t,
        inReference: true,
        recursive: false,
        includeHidden: isHidden(target),
        skip: null,
      }),
    )
  }
  return normalize(parts.join(' '))
}

// Generated content of ::before / ::after. The computed `content` is a list
// of strings and other tokens; only the strings are text, and an alternative
// text after a slash replaces what comes before it.
function pseudoContent(element: Element, pseudo: string, t: Traversal): string {
  const style = styleOf(element, t.context, pseudo)
  if (!style) {
    return ''
  }
  let content = style.content
  if (!content || content === 'none' || content === 'normal') {
    return ''
  }
  const slash = content.indexOf(' / ')
  if (slash !== -1) {
    content = content.slice(slash + 3)
  }
  let text = ''
  const string = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g
  let match: RegExpExecArray | null
  while ((match = string.exec(content)) !== null) {
    text += (match[1] !== undefined ? match[1] : match[2]).replace(/\\(.)/g, '$1')
  }
  return text
}

function isInline(element: Element, t: Traversal): boolean {
  const style = styleOf(element, t.context)
  return !style || INLINE_DISPLAYS.has(style.display)
}

// 2F: the concatenated text alternatives of the children, with generated
// content around them and block-level children set off by spaces.
function fromContent(element: Element, t: Traversal): string {
  let text = pseudoContent(element, '::before', t)
  const ownTextHidden = !t.includeHidden && hiddenState(element) === 'self'
  for (let child = element.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === TEXT_NODE) {
      if (!ownTextHidden) {
        text += child.nodeValue || ''
      }
      continue
    }
    if (child.nodeType !== ELEMENT_NODE) {
      continue
    }
    const childElement = child as Element
    if (childElement === t.skip || isCollapsedDetailsContent(childElement, element)) {
      continue
    }
    if (childElement.localName === 'br') {
      text += ' '
      continue
    }
    if (!t.includeHidden && hiddenState(childElement) === 'subtree') {
      continue
    }
    const childText = textAlternative(childElement, { ...t, recursive: true })
    text += isInline(childElement, t) ? childText : ` ${childText} `
  }
  return text + pseudoContent(element, '::after', t)
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
    parts.push(fromContent(label, { ...t, recursive: true, includeHidden: isHidden(label), skip: element }))
  }
  const text = normalize(parts.join(' '))
  return text !== '' ? text : null
}

function inputNativeName(input: HTMLInputElement, t: Traversal): string | null {
  switch (input.type) {
    case 'button':
    case 'reset':
    case 'submit': {
      const value = attribute(input, 'value')
      if (value !== null) {
        return value
      }
      // The user agent's default button labels (html-aam).
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

function textAlternative(node: Node, t: Traversal): string {
  if (node.nodeType === TEXT_NODE) {
    return node.nodeValue || ''
  }
  if (node.nodeType !== ELEMENT_NODE) {
    return ''
  }
  return computeTextAlternative(node as Element, t).text
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
  // 2D
  const native = nativeName(element, t)
  if (native !== null && normalize(native) !== '') {
    return { text: normalize(native), source: 'native' }
  }
  // 2E
  if (embedded) {
    const value = embeddedValue(element, role)
    if (value !== null) {
      return { text: normalize(value), source: 'native' }
    }
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
  return { context, describing, inReference: false, recursive: false, includeHidden: false, skip: null, visited: new Set() }
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
