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

import { computeRole } from './roles.js'

// State shared by one snapshot call. It lives exactly as long as the call:
// the snapshot is a copy taken at one point in time (ADR 18205 §1), and a
// cache that outlived it would hand back stale roles or names after the page
// changed an attribute, because element identity does not change with it.
// Nothing in the DOM can change during the synchronous walk, so memoising
// per-element results within the call is safe.
//
// Roles are cached because name computation (a later slice) asks for the
// roles of descendants and of aria-labelledby targets that the walk also
// visits. Computed-style and name caches join here when that slice lands.
export interface SnapshotContext {
  readonly roles: Map<Element, string>
  /** Elements already placed in the tree; aria-owns re-parenting must not place one twice. */
  readonly placed: Set<Element>
}

export function createContext(): SnapshotContext {
  return { roles: new Map(), placed: new Set() }
}

export function roleOf(element: Element, context: SnapshotContext): string {
  let role = context.roles.get(element)
  if (role === undefined) {
    role = computeRole(element)
    context.roles.set(element, role)
  }
  return role
}
