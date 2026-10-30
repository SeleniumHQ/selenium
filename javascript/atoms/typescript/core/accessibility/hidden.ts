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

// "Hidden" in the accname sense (https://w3c.github.io/accname/#dfn-hidden):
// an element that is not rendered, or that has aria-hidden=true on itself or
// an ancestor. This is deliberately not bot.dom.isShown. WebDriver's
// displayedness also prunes zero-size, transparent and off-screen content,
// which assistive technology does reach; the "visually hidden" CSS pattern
// that screen-reader-only text relies on is built on exactly that difference.
//
// Ancestry follows the flat tree (slots and shadow hosts), because that is
// what gets rendered, not the light DOM.

import { SnapshotContext, styleOf } from './context.js'

const DOCUMENT_NODE = 9
const DOCUMENT_FRAGMENT_NODE = 11

/**
 * What an element does to its own visibility, with no regard to ancestors:
 *   rendered  it has a box
 *   self      its own box is invisible but a descendant may set itself visible
 *             again (visibility is inherited, not a subtree switch)
 *   contents  its own box is rendered but nothing below it is
 *             (content-visibility: hidden, which hidden="until-found" uses)
 *   subtree   neither it nor anything below it is rendered
 */
export type HiddenState = 'rendered' | 'self' | 'contents' | 'subtree'

// The flat-tree parent of a node, or one of two terminals.
const NOT_RENDERED: unique symbol = Symbol('not rendered')
type FlatTreeParent = Element | null | typeof NOT_RENDERED

function isAriaHidden(element: Element): boolean {
  const value = element.getAttribute('aria-hidden')
  return value !== null && value.trim().toLowerCase() === 'true'
}

// The UA stylesheet gives every area display: none; what renders it is the
// image whose usemap points at its map. So an area is as hidden as that image.
// The document-wide image lookup is done once per map name and snapshot, since
// every area of a map shares the answer.
function areaState(area: Element, context: SnapshotContext): HiddenState {
  const map = area.closest('map')
  const name = map ? map.getAttribute('name') : null
  if (!name) {
    return 'subtree'
  }
  const known = context.imageMaps.get(name)
  if (known !== undefined) {
    return known
  }
  let state: HiddenState = 'subtree'
  const images = area.ownerDocument.querySelectorAll('img[usemap]')
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const usemap = (image.getAttribute('usemap') || '').replace(/^#/, '')
    if (usemap === name && hiddenState(image, context) === 'rendered' && !isHiddenByAncestor(image, context)) {
      state = 'rendered'
      break
    }
  }
  context.imageMaps.set(name, state)
  return state
}

export function isClosedDetails(element: Element): boolean {
  return element.localName === 'details' && !element.hasAttribute('open')
}

/**
 * The parent that renders this node: its slot when it is assigned to one, the
 * host when it sits directly in a shadow root, otherwise its DOM parent. Null
 * at the document; NOT_RENDERED for nodes the flat tree leaves out (a child of
 * a shadow host that no slot took, fallback content of a slot that has
 * assigned nodes, anything detached or inside an inert fragment).
 *
 * A closed shadow root cannot be seen from outside: `shadowRoot` and
 * `assignedSlot` are both null for its host's children, so those read as
 * ordinary children of the host and are treated as rendered.
 */
// An HTML slot element; an element merely named slot in another namespace
// has no assigned nodes to ask for.
function isSlot(element: Element): element is HTMLSlotElement {
  return element.localName === 'slot' && 'assignedNodes' in element
}

function flatTreeParent(node: Element): FlatTreeParent {
  const parent = node.parentNode
  if (!parent) {
    return NOT_RENDERED
  }
  if (node.assignedSlot) {
    return node.assignedSlot
  }
  if (parent.nodeType === DOCUMENT_FRAGMENT_NODE) {
    const host = (parent as ShadowRoot).host
    return host ? host : NOT_RENDERED
  }
  if (parent.nodeType === DOCUMENT_NODE) {
    return null
  }
  const parentElement = parent as Element
  if (parentElement.shadowRoot) {
    return NOT_RENDERED
  }
  if (isSlot(parentElement) && parentElement.assignedNodes().length > 0) {
    return NOT_RENDERED
  }
  return parentElement
}

/**
 * The nodes rendered as this element's children, in render order: the shadow
 * root's children for a host, the assigned nodes (or the fallback while none
 * are assigned) for a slot, otherwise the DOM children. Nested slots are
 * flattened away, so a slot element never appears in the result.
 *
 * A closed shadow root cannot be seen, so its host's light children are
 * returned as if they rendered; see flatTreeParent.
 */
export function flatTreeChildren(element: Element): ArrayLike<Node> {
  if (isSlot(element)) {
    return element.assignedNodes({ flatten: true })
  }
  if (element.shadowRoot) {
    return element.shadowRoot.childNodes
  }
  return element.childNodes
}

/**
 * Children of a closed details element are not rendered, apart from its first
 * summary. The browser does this through a UA shadow tree that is closed to
 * script, so it has to be known here rather than read from the DOM.
 */
export function isCollapsedDetailsContent(child: Element, parent: Element): boolean {
  if (!isClosedDetails(parent)) {
    return false
  }
  for (let sibling = parent.firstElementChild; sibling; sibling = sibling.nextElementSibling) {
    if (sibling.localName === 'summary') {
      return sibling !== child
    }
  }
  return true
}

/**
 * See HiddenState. Ancestors are not consulted; isHidden does that. Cached
 * per element in the context: the walk, name-from-content and reference
 * resolution all ask about the same elements.
 */
export function hiddenState(element: Element, context: SnapshotContext): HiddenState {
  let state = context.hidden.get(element)
  if (state === undefined) {
    state = computeHiddenState(element, context)
    context.hidden.set(element, state)
  }
  return state
}

function computeHiddenState(element: Element, context: SnapshotContext): HiddenState {
  // Inert content is still painted, but browsers leave it out of the
  // accessibility tree along with everything it contains.
  if (isAriaHidden(element) || element.hasAttribute('inert')) {
    return 'subtree'
  }
  // With scripting enabled a noscript element renders nothing, but Chromium
  // decides that in layout rather than in its UA stylesheet, so its computed
  // display still reads inline. This atom only ever runs as script.
  if (element.localName === 'noscript') {
    return 'subtree'
  }
  if (element.localName === 'area') {
    return areaState(element, context)
  }
  const style = styleOf(element, context)
  // No view (an inert template fragment) and a detached element (empty
  // computed values) are both unrendered.
  if (!style || style.display === '' || style.display === 'none') {
    return 'subtree'
  }
  const visibility = style.visibility
  const invisible = visibility === 'hidden' || visibility === 'collapse'
  const contentsSkipped = style.getPropertyValue('content-visibility') === 'hidden'
  if (invisible && contentsSkipped) {
    return 'subtree'
  }
  if (contentsSkipped) {
    return 'contents'
  }
  if (invisible) {
    return 'self'
  }
  return 'rendered'
}

/** Whether an ancestor in the flat tree hides this element, whatever the element does itself. */
export function isHiddenByAncestor(element: Element, context: SnapshotContext): boolean {
  let child = element
  for (;;) {
    const parent = flatTreeParent(child)
    if (parent === NOT_RENDERED) {
      return true
    }
    if (parent === null) {
      return false
    }
    const state = hiddenState(parent, context)
    if (isCollapsedDetailsContent(child, parent) || state === 'subtree' || state === 'contents') {
      return true
    }
    child = parent
  }
}

/** Whether the element is hidden in the accname sense. */
export function isHidden(element: Element, context: SnapshotContext): boolean {
  const own = hiddenState(element, context)
  if (own === 'self' || own === 'subtree') {
    return true
  }
  // Visibility is inherited, so the element's own computed value above already
  // accounts for ancestors that set it; only subtree-wide hiding is checked
  // on the way up.
  return isHiddenByAncestor(element, context)
}
