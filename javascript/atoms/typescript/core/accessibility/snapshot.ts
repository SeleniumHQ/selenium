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

import { isElement } from '../element.js'
import type { AccessibilityNode } from './types.js'

const DOCUMENT_NODE = 9

function isDocument(node: unknown): node is Document {
  return !!node && typeof node === 'object' && (node as Node).nodeType === DOCUMENT_NODE
}

// A root that is not attached cannot answer "hidden" or "focused" questions, and
// a non-element root has no tree to walk, so both are refused up front rather
// than producing a partial snapshot the caller cannot distinguish from a real one.
function resolveRoot(root: Element | Document | null | undefined): Element {
  if (root === undefined || root === null) {
    return document.documentElement
  }
  if (isDocument(root)) {
    return root.documentElement
  }
  if (!isElement(root)) {
    throw new Error('accessibilitySnapshot: root must be an Element or a Document')
  }
  if (!root.isConnected) {
    throw new Error('accessibilitySnapshot: root is detached from its document')
  }
  return root
}

function createNode(role: string, name: string, element: Element): AccessibilityNode {
  return { role, name, description: '', states: {}, element, children: [] }
}

// html-aam maps the html element to role document and names it from the title.
// The title getter already collapses ASCII whitespace; trimming covers what it
// leaves at the ends.
function documentName(element: Element): string {
  return (element.ownerDocument.title || '').trim()
}

/**
 * Computes an accessibility snapshot of the subtree rooted at `root`, or of the
 * whole document when no root is given.
 *
 * The output is *computed* by script, not read from the browser's own
 * accessibility tree. Frames are reported as `iframe` leaves and never
 * descended into; callers stitch child-document snapshots in themselves.
 *
 * Roles, names, states and children for elements below the document root
 * arrive in later slices; until then every other element is reported as an
 * unnamed generic node so the node shape is already the final one.
 */
function accessibilitySnapshot(root?: Element | Document | null): AccessibilityNode {
  const element = resolveRoot(root)
  if (element === element.ownerDocument.documentElement) {
    return createNode('document', documentName(element), element)
  }
  return createNode('generic', '', element)
}

export default accessibilitySnapshot
