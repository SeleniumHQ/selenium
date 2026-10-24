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

// Test-only entry point: the accessibility modules the public atom reaches
// only through the tree walk, exposed so their QUnit pages can drive them
// directly. Not in the ATOMS registry and never published.
import { createContext } from '../core/accessibility/context.js'
import { hiddenState, isCollapsedDetailsContent, isHidden } from '../core/accessibility/hidden.js'
import { encodeWire } from '../core/accessibility/wire.js'
import { toText } from './accessibility-text.js'

// The hidden page asks about one element at a time, so each call gets the
// fresh per-call context a snapshot would have.
export default {
  encodeWire,
  hiddenState: (element: Element) => hiddenState(element, createContext()),
  isCollapsedDetailsContent,
  isHidden: (element: Element) => isHidden(element, createContext()),
  toText,
}
