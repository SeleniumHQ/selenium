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

import type { HiddenState } from './hidden.js'
import { computeRole } from './roles.js'

// State shared by one snapshot call. It lives exactly as long as the call:
// the snapshot is a copy taken at one point in time (ADR 18205 §1), and a
// cache that outlived it would hand back stale roles or names after the page
// changed an attribute, because element identity does not change with it.
// Nothing in the DOM can change during the synchronous walk, so memoising
// per-element results within the call is safe.
//
// Roles, hidden states and styles are cached because name computation asks
// for the roles, hidden-ness and display of descendants and of
// aria-labelledby targets that the walk also visits; names are cached
// because several nodes can reference the same element.
export interface SnapshotContext {
  readonly roles: Map<Element, string>
  readonly hidden: Map<Element, HiddenState>
  /** Whether an image map, by name, is rendered through some image that uses it; shared by all its areas. */
  readonly imageMaps: Map<string, HiddenState>
  readonly styles: Map<Element, Map<string, CSSStyleDeclaration | null>>
  readonly names: Map<Element, NameResult>
  readonly descriptions: Map<Element, string>
  /** Text alternative per element as a descendant of something being named (the standard recursive traversal), which every enclosing content-named ancestor repeats. */
  readonly descendantTexts: Map<Element, string>
  /** Name-from-content text per element for the standard traversal. */
  readonly contentTexts: Map<Element, string>
  /** Text alternative per aria-labelledby / aria-describedby target, which many elements can reference. */
  readonly referenceTexts: Map<Element, string>
  /** Generated ::before and ::after text per element, read at most once. */
  readonly generated: Map<Element, [string, string]>
  /** Per tree scope (document or shadow root): whether any of its sheets can define generated content. */
  readonly generatedScopes: Map<Node, boolean>
  /** Elements already placed in the tree; aria-owns re-parenting must not place one twice. */
  readonly placed: Set<Element>
  /** aria-owns targets of each owner in the walked subtree, in attribute order. */
  readonly owned: Map<Element, Element[]>
  /** Every owned element, so it is skipped at its DOM position and placed under its owner. */
  readonly claimed: Set<Element>
}

/** Where a name came from decides whether text below the node is repeated and whether title is free for the description. */
export type NameSource = 'none' | 'reference' | 'label' | 'native' | 'content' | 'title' | 'placeholder'

export interface NameResult {
  readonly text: string
  readonly source: NameSource
}

export function createContext(): SnapshotContext {
  return {
    roles: new Map(),
    hidden: new Map(),
    imageMaps: new Map(),
    styles: new Map(),
    names: new Map(),
    descriptions: new Map(),
    descendantTexts: new Map(),
    contentTexts: new Map(),
    referenceTexts: new Map(),
    generated: new Map(),
    generatedScopes: new Map(),
    placed: new Set(),
    owned: new Map(),
    claimed: new Set(),
  }
}

export function roleOf(element: Element, context: SnapshotContext): string {
  let role = context.roles.get(element)
  if (role === undefined) {
    // The role of a cell depends on its table's, which every cell would
    // otherwise recompute; the lookup goes through this cache.
    role = computeRole(element, (owner) => roleOf(owner, context))
    context.roles.set(element, role)
  }
  return role
}

/**
 * The computed style of an element, or of one of its pseudo-elements when
 * `pseudo` is "::before" or "::after". Null when the element has no view.
 */
export function styleOf(element: Element, context: SnapshotContext, pseudo = ''): CSSStyleDeclaration | null {
  let perPseudo = context.styles.get(element)
  if (!perPseudo) {
    perPseudo = new Map()
    context.styles.set(element, perPseudo)
  }
  let style = perPseudo.get(pseudo)
  if (style === undefined) {
    const view = element.ownerDocument.defaultView
    style = view ? view.getComputedStyle(element, pseudo || null) : null
    perPseudo.set(pseudo, style)
  }
  return style
}
