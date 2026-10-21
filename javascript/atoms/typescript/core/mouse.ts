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

import { UNKNOWN_ERROR, botError } from './error.js'
import { type EventFactory, EventType, type PointerArgs, fire } from './events.js'
import { focusOnElement, getActiveElementFrom } from './focus.js'
import { getClientRect } from './geometry.js'
import { isInteractable } from './interactable.js'

// A virtual mouse that produces what a real one does with its primary button,
// in the order Chrome produces for a real click (recorded 2026-10-13):
//
//   move:    pointerout, pointerleave*, pointerover, pointerenter*,
//            mouseout,   mouseleave*,   mouseover,   mouseenter*,
//            pointermove, mousemove
//   press:   pointerdown, mousedown, then focus
//   release: pointerup, mouseup, click
//
// The click itself runs the target's activation behaviour natively -- links
// navigate, checkboxes toggle with input and change, labels forward to their
// control, submit buttons submit -- so none of that is simulated here.
//
// Replaces bot.Mouse for the click atom. Differences, all toward real input:
// - Pointer events and mouseenter/mouseleave are fired; bot.Mouse fired
//   neither. Enter and leave go to every ancestor up to the common one.
// - A cancelled pointerdown suppresses mousedown and mouseup (and so the
//   focus change) but not the click, as Pointer Events specifies.
// - Releasing over a different element clicks the nearest common ancestor,
//   as UI Events specifies; bot.Mouse clicked nothing.
// - Focus and the mousedown-handler-moved-focus check apply in every engine;
//   bot.Mouse only checked in Firefox.
// - Links are not followed by hand. Firefox already follows a dispatched
//   click, so bot.Mouse navigated there twice.
// - Only the primary button; nothing reaches double, middle or right clicks.
// What a pointer event reports in `button` when no button changed: move, over,
// out, enter and leave. The compatibility mouse events report 0 instead, as
// Chrome and Firefox do for real input.
const NO_BUTTON = -1

export class Mouse {
  private element: Element | null = null
  private clientX = 0
  private clientY = 0
  private pressedOn: Element | null = null
  private pointerdownCancelled = false

  // Moves the pointer to `offset` within the element's client rect, or to its
  // centre.
  move(element: Element, offset?: { x: number; y: number }): void {
    // An element interactable when the move starts gets the whole sequence,
    // even if a handler hides it partway through.
    const interactable = isInteractable(element)
    const rect = getClientRect(element)
    this.clientX = rect.left + (offset ? offset.x : rect.width / 2)
    this.clientY = rect.top + (offset ? offset.y : rect.height / 2)

    const from = this.element
    if (element !== from) {
      this.transition(from, element, interactable)
      this.element = element
    }
    this.fire(element, EventType.POINTERMOVE, { button: NO_BUTTON, detail: 0 }, interactable)
    this.fire(element, EventType.MOUSEMOVE, { detail: 0 }, interactable)
  }

  pressButton(): void {
    if (this.pressedOn) {
      throw botError(UNKNOWN_ERROR, 'Cannot press more than one button or an already pressed button.')
    }
    const element = this.current()
    this.pressedOn = element
    const interactable = isInteractable(element)

    this.pointerdownCancelled = !this.fire(element, EventType.POINTERDOWN, { buttons: 1, detail: 0 }, interactable)
    if (this.pointerdownCancelled || !interactable) {
      return
    }
    // Focus is mousedown's default action: cancelling mousedown keeps focus
    // where it was, and so does a handler that moved focus itself.
    const focusedBefore = getActiveElementFrom(element)
    if (this.fire(element, EventType.MOUSEDOWN, { buttons: 1, detail: 1 }, interactable)) {
      if (getActiveElementFrom(element) === focusedBefore) {
        focusOnElement(element)
      }
    }
  }

  releaseButton(): void {
    const pressedOn = this.pressedOn
    if (!pressedOn) {
      throw botError(UNKNOWN_ERROR, 'Cannot release a button when no button is pressed.')
    }
    this.pressedOn = null
    const element = this.current()
    // A mouseup that completes a click is followed by the click even if the
    // mouseup handler made the element non-interactable.
    const interactable = isInteractable(element)

    this.fire(element, EventType.POINTERUP, { buttons: 0, detail: 0 }, interactable)
    if (!this.pointerdownCancelled) {
      this.fire(element, EventType.MOUSEUP, { buttons: 0, detail: 1 }, interactable)
    }
    const clickTarget = commonAncestor(pressedOn, element)
    if (clickTarget) {
      this.fire(clickTarget, EventType.CLICK, { buttons: 0, detail: 1 }, interactable)
    }
  }

  private current(): Element {
    if (!this.element) {
      throw botError(UNKNOWN_ERROR, 'The mouse has not been moved to an element.')
    }
    return this.element
  }

  // out/leave from the old element and over/enter into the new, pointer events
  // first. Enter and leave go to each element whose subtree the pointer
  // entered or left: every ancestor below the common one. The first move
  // treats the pointer as already over the document, so it enters from the
  // body rather than from outside the window.
  private transition(from: Element | null, to: Element, interactable: boolean): void {
    const fromWindowOpen = from && !(from.ownerDocument.defaultView as Window | null)?.closed
    const source = fromWindowOpen ? from : null
    const common = source ? commonAncestor(source, to) : to.ownerDocument.body
    const left = source ? chain(source, common) : []
    const entered = chain(to, common).reverse()

    const pairs: Array<
      [EventFactory<PointerArgs>, EventFactory<PointerArgs>, EventFactory<PointerArgs>, EventFactory<PointerArgs>, number]
    > = [
      [EventType.POINTEROUT, EventType.POINTERLEAVE, EventType.POINTEROVER, EventType.POINTERENTER, NO_BUTTON],
      [EventType.MOUSEOUT, EventType.MOUSELEAVE, EventType.MOUSEOVER, EventType.MOUSEENTER, 0],
    ]
    for (const [out, leave, over, enter, button] of pairs) {
      if (source) {
        this.fire(source, out, { relatedTarget: to, button }, true)
        for (const element of left) {
          this.fire(element, leave, { relatedTarget: to, button }, true)
        }
      }
      this.fire(to, over, { relatedTarget: source, button }, interactable)
      for (const element of entered) {
        this.fire(element, enter, { relatedTarget: source, button }, interactable)
      }
    }
  }

  // Events go only to an element that was interactable at the start of the
  // step; `interactable` carries that decision.
  private fire(
    target: Element,
    type: EventFactory<PointerArgs>,
    args: Partial<PointerArgs>,
    interactable: boolean,
  ): boolean {
    if (!interactable) {
      return false
    }
    return fire(target, type, {
      clientX: this.clientX,
      clientY: this.clientY,
      button: 0,
      buttons: this.pressedOn ? 1 : 0,
      ...args,
    })
  }
}

// The element and its ancestors up to, but not including, `stop`.
function chain(element: Element, stop: Element | null): Element[] {
  const result: Element[] = []
  for (let node: Element | null = element; node && node !== stop; node = parentInComposedTree(node)) {
    result.push(node)
  }
  return result
}

function parentInComposedTree(element: Element): Element | null {
  if (element.parentElement) {
    return element.parentElement
  }
  const root = element.parentNode
  return root instanceof ShadowRoot ? root.host : null
}

function commonAncestor(a: Element, b: Element): Element | null {
  const ancestors = new Set<Element>()
  for (let node: Element | null = a; node; node = parentInComposedTree(node)) {
    ancestors.add(node)
  }
  for (let node: Element | null = b; node; node = parentInComposedTree(node)) {
    if (ancestors.has(node)) {
      return node
    }
  }
  return null
}
