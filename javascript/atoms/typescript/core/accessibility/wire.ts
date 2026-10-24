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
import accessibilitySnapshot from './snapshot.js'
import type { AccessibilityNode, StateValue } from './types.js'

/**
 * A node as the language bindings receive it: the same fields as
 * `AccessibilityNode`, with every reference replaced by an index into the
 * arrays that travel beside the JSON text.
 */
export interface WireNode {
  role: string
  name: string
  description: string
  value?: string
  states: Record<string, StateValue>
  /** Index into `WireSnapshot.elements`; absent for text leaves. */
  element?: number
  /** Index into `WireSnapshot.windows`, on a frame node whose frame has a content window. */
  frame?: number
  children: WireNode[]
}

/**
 * The shape the bindings fetch over WebDriver BiDi. The tree travels as one
 * JSON string, so a binding parses it with its own JSON library instead of
 * decoding a nested remote value; the elements and frame windows travel as
 * plain arrays, which BiDi serializes as node references and browsing context
 * ids in one pass.
 */
export interface WireSnapshot {
  json: string
  /** Every element the tree references, in order of first mention. */
  elements: Element[]
  /** The content window of every frame node, in order of first mention. */
  windows: Window[]
}

/** The root is an element of this document that is no longer attached to it. */
export interface WireError {
  error: 'detached'
}

interface Encoded {
  node: WireNode
  elements: Element[]
  windows: Window[]
}

/** Replaces the references in a tree with indices; pure, so it is unit tested without a DOM. */
export function encodeWire(tree: AccessibilityNode): Encoded {
  const elements: Element[] = []
  const windows: Window[] = []

  function encode(node: AccessibilityNode): WireNode {
    const out: WireNode = { role: node.role, name: node.name, description: node.description, states: node.states, children: [] }
    if (node.value !== undefined) {
      out.value = node.value
    }
    if (node.element) {
      out.element = elements.push(node.element) - 1
      const window = node.role === 'iframe' ? (node.element as HTMLIFrameElement).contentWindow : null
      if (window) {
        out.frame = windows.push(window) - 1
      }
    }
    out.children = node.children.map(encode)
    return out
  }

  return { node: encode(tree), elements, windows }
}

/**
 * The snapshot of this document (no `root`), or of the subtree under `root`,
 * in the wire shape. Answers `null` for a root this document does not own,
 * so a binding tries each document until one answers: Firefox hands a shared
 * id of another document's node to the called function as `null`, and may
 * resolve one to the node itself in any document of the browsing context
 * group, which the ownership check catches. Answers `{ error: 'detached' }`
 * for a root no longer in its document, so a binding never has to read an
 * exception's text.
 */
function accessibilitySnapshotWire(root?: Element | null): WireSnapshot | WireError | null {
  if (root === null) {
    return null
  }
  if (root !== undefined) {
    if (!isElement(root)) {
      throw new Error('accessibilitySnapshotWire: root must be an Element')
    }
    if (root.ownerDocument !== document) {
      return null
    }
    if (!root.isConnected) {
      return { error: 'detached' }
    }
  }
  const { node, elements, windows } = encodeWire(accessibilitySnapshot(root))
  return { json: JSON.stringify(node), elements, windows }
}

export default accessibilitySnapshotWire
