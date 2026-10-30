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

// The shape every binding exposes, from docs/decisions/18205-accessibility-tree-snapshot.md §2.
// Adding an optional field or a `states` key is additive; removing or renaming one is a
// breaking change that needs a new decision record.

export type StateValue = boolean | number | 'mixed'

export interface AccessibilityNode {
  /** WAI-ARIA role token; "text" for text leaves, "iframe" for frame leaves. */
  role: string
  /** Computed accessible name; "" when there is none. */
  name: string
  /** Computed accessible description; "" when there is none. */
  description: string
  /** Current value, present only for textbox, combobox, searchbox and range roles. */
  value?: string
  /** States the role supports or the element sets; {} when there are none. */
  states: Record<string, StateValue>
  /** The backing element; absent for text leaves and synthesized nodes. */
  element?: Element
  /** [] for leaves. */
  children: AccessibilityNode[]
}
