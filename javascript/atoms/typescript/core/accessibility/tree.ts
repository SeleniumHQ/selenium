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

import { computeDescription, computeName } from './accname.js'
import { roleOf, SnapshotContext } from './context.js'
import { flatTreeChildren, hiddenState, isClosedDetails, isCollapsedDetailsContent, isHiddenByAncestor } from './hidden.js'
import { isPresentational } from './roles.js'
import { computeStates, computeValue } from './states.js'
import type { AccessibilityNode } from './types.js'

const ELEMENT_NODE = 1
const TEXT_NODE = 3

// WAI-ARIA 1.2 roles with "Children Presentational: True" (plus the graphics
// module's symbol). Their content only contributes to their name, never to
// the tree.
const CHILDREN_PRESENTATIONAL: ReadonlySet<string> = new Set([
  'button', 'checkbox', 'graphics-symbol', 'img', 'menuitemcheckbox', 'menuitemradio', 'meter',
  'option', 'progressbar', 'radio', 'scrollbar', 'separator', 'slider', 'switch', 'tab',
])

// Elements whose DOM children are not rendered content, whatever role they
// end up with: a frame's children are fallback for a browsing context only
// the bindings can reach (the ADR's iframe leaf), a textarea's text child is
// its default value, and media fallback shows only when the media cannot.
const LEAF_ELEMENTS: ReadonlySet<string> = new Set(['audio', 'frame', 'iframe', 'textarea', 'video'])

function textLeaf(text: string): AccessibilityNode {
  // No `element` or `value` key at all rather than undefined, so the
  // serialized shape matches the schema literally.
  return { role: 'text', name: text, description: '', states: {}, children: [] }
}

function elementNode(element: Element, role: string, name: string, context: SnapshotContext): AccessibilityNode {
  const node: AccessibilityNode = {
    role,
    name,
    description: computeDescription(element, context),
    states: computeStates(element, role),
    element,
    children: [],
  }
  const value = computeValue(element, role)
  if (value !== null) {
    node.value = value
  }
  return node
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

// ADR 18205 §2: an element produces a node when its role is not generic,
// none or presentation, or it has a name.
function producesNode(role: string, name: string): boolean {
  return !(role === 'generic' || isPresentational(role)) || name !== ''
}

function isLeaf(element: Element, role: string): boolean {
  return LEAF_ELEMENTS.has(element.localName) || CHILDREN_PRESENTATIONAL.has(role)
}

/**
 * Appends the node(s) for one element to `out`: its own node with its
 * children, or, when it produces no node (pruned role, visibility-hidden),
 * its children in its place so hoisting keeps order.
 *
 * `textHidden` is true while inside an element whose visibility hides its
 * text: visibility is inherited, so the text of such an element and of
 * descendants that do not set themselves visible again is not rendered.
 * `textConsumed` is true below a node whose name was computed from its
 * content: that text already appears as the name and is not repeated as
 * leaves, while the element structure below is still reported.
 */
function visitElement(
  element: Element,
  context: SnapshotContext,
  textHidden: boolean,
  textConsumed: boolean,
  out: AccessibilityNode[],
): void {
  if (context.placed.has(element)) {
    return
  }
  context.placed.add(element)

  const domParent = element.parentElement
  if (domParent && isCollapsedDetailsContent(element, domParent)) {
    return
  }
  const hidden = hiddenState(element)
  if (hidden === 'subtree') {
    return
  }
  if (hidden === 'self') {
    collectChildren(element, context, true, textConsumed, out)
    return
  }

  const role = roleOf(element, context)
  const name = computeName(element, context)
  const descend = hidden !== 'contents' && !isLeaf(element, role)
  if (!producesNode(role, name.text)) {
    // The element is rendered, so its own visibility is visible even under
    // an invisible ancestor: its text shows.
    if (descend) {
      collectChildren(element, context, false, textConsumed, out)
    }
    return
  }
  const node = elementNode(element, role, name.text, context)
  if (descend) {
    collectChildren(element, context, false, textConsumed || name.source === 'content', node.children)
  }
  out.push(node)
}

/**
 * Appends the nodes for `parent`'s children to `out`: its flat-tree children
 * in render order, then the elements it owns through aria-owns. An element
 * some owner in the walked subtree claims is skipped at its DOM position and
 * placed under that owner instead (ADR 18205 §3).
 */
function collectChildren(
  parent: Element,
  context: SnapshotContext,
  textHidden: boolean,
  textConsumed: boolean,
  out: AccessibilityNode[],
): void {
  // Text directly inside a closed details is collapsed content like any
  // element other than its summary.
  const textCollapsed = isClosedDetails(parent)
  const children = flatTreeChildren(parent)
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.nodeType === TEXT_NODE) {
      if (!textHidden && !textConsumed && !textCollapsed) {
        const text = normalizeText(child.nodeValue || '')
        if (text !== '') {
          out.push(textLeaf(text))
        }
      }
      continue
    }
    if (child.nodeType === ELEMENT_NODE && !context.claimed.has(child as Element)) {
      visitElement(child as Element, context, textHidden, textConsumed, out)
    }
  }
  const owned = context.owned.get(parent)
  if (owned) {
    for (const element of owned) {
      visitElement(element, context, textHidden, textConsumed, out)
    }
  }
}

/**
 * Records every aria-owns relation whose owner is in the subtree under
 * `root`, so owned elements can be skipped where they sit and placed under
 * their owner. An element cannot own itself or an ancestor, and an id that
 * resolves to nothing is ignored. Owners inside shadow trees are not found by
 * querySelectorAll; their targets stay at their DOM position.
 */
function recordOwnership(root: Element, context: SnapshotContext): void {
  const owners: Element[] = root.hasAttribute('aria-owns') ? [root] : []
  const descendants = root.querySelectorAll('[aria-owns]')
  for (let i = 0; i < descendants.length; i++) {
    owners.push(descendants[i])
  }
  for (const owner of owners) {
    const scope = owner.getRootNode() as Document | ShadowRoot
    const targets: Element[] = []
    for (const id of (owner.getAttribute('aria-owns') || '').trim().split(/\s+/)) {
      const target = id ? scope.getElementById(id) : null
      if (target && target !== owner && !target.contains(owner) && !context.claimed.has(target)) {
        targets.push(target)
        context.claimed.add(target)
      }
    }
    if (targets.length) {
      context.owned.set(owner, targets)
    }
  }
}

/**
 * The snapshot rooted at `root`. The root always produces a node, whatever
 * its role or hidden state, so a subtree snapshot of a plain div is still
 * deterministic; a root whose subtree is hidden, by itself or by an
 * ancestor, has no children.
 */
export function buildTree(root: Element, context: SnapshotContext): AccessibilityNode {
  recordOwnership(root, context)
  context.placed.add(root)
  const role = roleOf(root, context)
  const name = computeName(root, context)
  const node = elementNode(root, role, name.text, context)
  const hidden = hiddenState(root)
  const descend = hidden !== 'subtree' && hidden !== 'contents' && !isLeaf(root, role) && !isHiddenByAncestor(root)
  if (descend) {
    collectChildren(root, context, hidden === 'self', name.source === 'content', node.children)
  }
  return node
}
