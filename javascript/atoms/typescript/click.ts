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

import { ELEMENT_NOT_INTERACTABLE, botError } from './core/error.js'
import { type Coordinate, getClientRect } from './core/geometry.js'
import { Mouse } from './core/mouse.js'
import { scrollIntoView } from './core/scroll.js'
import isShown from './core/shown.js'

// Clicks the element with the primary button: scrolls it into view, moves a
// fresh mouse to `optCoords` (relative to the element's top-left) or its
// centre, presses and releases. See core/mouse.ts for the events produced.
//
// bot.action.click also took a mouse to reuse and a flag forcing mouseup onto
// a non-interactable element. Neither crosses the wire, so they are not kept.
function click(element: Element, optCoords?: Coordinate | null): void {
  if (!isShown(element, /* optIgnoreOpacity= */ true)) {
    throw botError(ELEMENT_NOT_INTERACTABLE, 'Element is not currently visible and may not be manipulated')
  }
  scrollIntoView(element, optCoords || undefined)
  const mouse = new Mouse()
  mouse.move(element, optCoords || interactableCentre(element))
  mouse.pressButton()
  mouse.releaseButton()
}

// An element with no area of its own (an empty inline wrapper, say) is aimed
// at through its offsetParent's size, as bot.action.getInteractableSize did.
function interactableCentre(element: Element): Coordinate {
  let node: Element = element
  for (;;) {
    const rect = getClientRect(node)
    const parent = (node as HTMLElement).offsetParent
    if ((rect.width > 0 && rect.height > 0) || !parent) {
      return { x: rect.width / 2, y: rect.height / 2 }
    }
    node = parent
  }
}

export default click
