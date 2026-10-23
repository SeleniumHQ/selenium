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
import { hiddenState, isClosedDetails, isCollapsedDetailsContent, isHiddenByAncestor } from './hidden.js'
import { isPresentational } from './roles.js'
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

function createNode(role: string, name: string, description: string, element?: Element): AccessibilityNode {
  const node: AccessibilityNode = { role, name, description, states: {}, children: [] }
  // Text leaves carry no key at all rather than `element: undefined`, so the
  // serialized shape matches the schema literally.
  if (element) {
    node.element = element
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
 * Appends the nodes for `parent`'s children to `out`, in document order.
 * Children that produce no node (pruned roles, visibility-hidden elements)
 * contribute their own children in their place, so hoisting keeps order.
 *
 * `textHidden` is true while inside an element whose visibility hides its
 * text: visibility is inherited, so the text of such an element and of
 * descendants that do not set themselves visible again is not rendered.
 * `textConsumed` is true below a node whose name was computed from its
 * content: that text already appears as the name and is not repeated as
 * leaves, while the element structure below is still reported.
 *
 * Walks `childNodes` for now; the composed-DOM slice replaces this with the
 * flat tree (shadow roots, slots) and adds aria-owns re-parenting.
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
  for (let child = parent.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === TEXT_NODE) {
      if (!textHidden && !textConsumed && !textCollapsed) {
        const text = normalizeText(child.nodeValue || '')
        if (text !== '') {
          out.push(createNode('text', text, ''))
        }
      }
      continue
    }
    if (child.nodeType !== ELEMENT_NODE) {
      continue
    }
    const element = child as Element
    if (context.placed.has(element)) {
      continue
    }
    context.placed.add(element)

    if (isCollapsedDetailsContent(element, parent)) {
      continue
    }
    const hidden = hiddenState(element)
    if (hidden === 'subtree') {
      continue
    }
    if (hidden === 'self') {
      collectChildren(element, context, true, textConsumed, out)
      continue
    }

    const role = roleOf(element, context)
    const name = computeName(element, context)
    const descend = hidden !== 'contents' && !isLeaf(element, role)
    if (!producesNode(role, name.text)) {
      if (descend) {
        collectChildren(element, context, false, textConsumed, out)
      }
      continue
    }
    const node = createNode(role, name.text, computeDescription(element, context), element)
    if (descend) {
      collectChildren(element, context, false, textConsumed || name.source === 'content', node.children)
    }
    out.push(node)
  }
}

/**
 * The snapshot rooted at `root`. The root always produces a node, whatever
 * its role or hidden state, so a subtree snapshot of a plain div is still
 * deterministic; a root whose subtree is hidden, by itself or by an
 * ancestor, has no children.
 */
export function buildTree(root: Element, context: SnapshotContext): AccessibilityNode {
  context.placed.add(root)
  const role = roleOf(root, context)
  const name = computeName(root, context)
  const node = createNode(role, name.text, computeDescription(root, context), root)
  const hidden = hiddenState(root)
  const descend = hidden !== 'subtree' && hidden !== 'contents' && !isLeaf(root, role) && !isHiddenByAncestor(root)
  if (descend) {
    collectChildren(root, context, hidden === 'self', name.source === 'content', node.children)
  }
  return node
}
