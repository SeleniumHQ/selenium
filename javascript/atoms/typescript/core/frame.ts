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

import { isElement } from './element.js'
import { NO_SUCH_FRAME, botError } from './error.js'
import { findElements } from './locators.js'

// The window the atom is running in. Closure routed every one of these through
// bot.getWindow() because the inject layer retargets command execution at a
// frame; an atom called directly is already in the frame it is asking about.
function windowOr(optWindow?: Window): Window {
  return optWindow || window
}

export function isFrame(element: Element): boolean {
  return isElement(element, 'FRAME') || isElement(element, 'IFRAME')
}

// goog.dom.getFrameContentWindow. Returning null rather than propagating is
// the contract -- a frame that is detached, or whose document cannot be
// reached, is reported as "no window" rather than as a failure.
export function getFrameContentWindow(frame: HTMLIFrameElement | HTMLFrameElement): Window | null {
  try {
    return frame.contentWindow || (frame.contentDocument ? frame.contentDocument.defaultView : null)
  } catch (_unreachable) {
    return null
  }
}

export function defaultContent(optWindow?: Window): Window | null {
  return windowOr(optWindow).top
}

// Falls back to the body so that a document with nothing focused still answers
// with an element. bot.dom.getActiveElement is the other spelling of this and
// returns null instead; the frame one is what the active_element atom means.
export function activeElement(optWindow?: Window): Element {
  const doc = windowOr(optWindow).document
  return doc.activeElement || doc.body
}

export function getFrameWindow(element: Element): Window | null {
  if (isFrame(element)) {
    return getFrameContentWindow(element as HTMLIFrameElement | HTMLFrameElement)
  }
  throw botError(NO_SUCH_FRAME, "The given element isn't a frame or an iframe.")
}

// Name wins over id, despite the atom being called frame_by_id_or_name.
//
// Both lookups are deliberately shallow: frames[] holds only this window's own
// children and the id search runs over this window's document, so a nested or
// parent frame is not found from here. The Closure tests pin that -- searching
// the top window for a frame nested two levels down returns null.
//
// Inherited hazard: reading `name` off a cross-origin frame throws a
// SecurityError, because Window.name is not on the cross-origin allowlist.
// The Closure original has the same hole; it is not fixed here because that
// would be a behaviour change rather than a port. (frame.js:106)
export function findFrameByNameOrId(nameOrId: string | number, optRoot?: Window): Window | null {
  const domWindow = windowOr(optRoot)

  const numFrames = domWindow.frames.length
  for (let i = 0; i < numFrames; i++) {
    const frame = domWindow.frames[i]
    // frameElement is the <frame>/<iframe> in the parent document, and null
    // across an origin boundary, where the window itself carries the name.
    const frameElement = frame.frameElement || frame
    if ((frameElement as { name?: unknown }).name == nameOrId) {
      // Safari 4 handed back an HTMLFrameElement here instead of a Window, so
      // the original re-resolved it. Every supported browser gives a Window.
      return frame
    }
  }

  // bot.locators.id compared with ==, so a numeric id matched; the id locator
  // here compares strings exactly.
  const elements = findElements({ id: String(nameOrId) }, domWindow.document)
  for (let i = 0; i < elements.length; i++) {
    const frameElement = elements[i]
    if (frameElement && isFrame(frameElement)) {
      return getFrameContentWindow(frameElement as HTMLIFrameElement | HTMLFrameElement)
    }
  }

  return null
}

export function findFrameByIndex(index: number, optRoot?: Window): Window | null {
  return windowOr(optRoot).frames[index] || null
}
