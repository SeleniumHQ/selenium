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

/**
 * @fileoverview The file contains an abstraction of a mouse for
 * simulating the mouse actions.
 */

import { BotError, ErrorCode } from './error';
import {
  Device,
  ModifiersState,
  EventEmitter,
  Coordinate,
  MOUSE_MS_POINTER_ID,
  clearPointerMap,
} from './device';
import {
  isElement,
  isInteractable,
  getActiveElement,
  getClientRect,
} from './dom';
import { EventType, EventFactory } from './events';
import {
  GECKO,
  WEBKIT,
  IE,
  isProductVersion,
  IE_DOC_PRE9,
  IE_DOC_9,
  IE_DOC_10,
  WINDOWS_PHONE,
} from './userAgent';
import { getDocument } from './bot';

// Browser detection
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_IE = /MSIE|Trident/.test(userAgent);

// ============================================================================
// Mouse Button Enum
// ============================================================================

/**
 * Enumeration of mouse buttons that can be pressed.
 */
export enum Button {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
}

// ============================================================================
// Mouse State
// ============================================================================

/**
 * Describes the state of the mouse.
 */
export interface MouseState {
  buttonPressed: Button | null;
  elementPressed: Element | null;
  clientXY: { x: number; y: number };
  nextClickIsDoubleClick: boolean;
  hasEverInteracted: boolean;
  element: Element | null;
}

// ============================================================================
// Button Value Mapping
// ============================================================================

/**
 * Index to indicate no button pressed in MOUSE_BUTTON_VALUE_MAP_.
 */
const NO_BUTTON_VALUE_INDEX_ = 3;

/**
 * Maps mouse events to an array of button argument value for each mouse button.
 */
const MOUSE_BUTTON_VALUE_MAP_: Map<EventFactory, (number | null)[]> = (function () {
  const buttonValueMap = new Map<EventFactory, (number | null)[]>();

  if (IE_DOC_PRE9) {
    buttonValueMap.set(EventType.CLICK, [0, 0, 0, null]);
    buttonValueMap.set(EventType.CONTEXTMENU, [null, null, 0, null]);
    buttonValueMap.set(EventType.MOUSEUP, [1, 4, 2, null]);
    buttonValueMap.set(EventType.MOUSEOUT, [0, 0, 0, 0]);
    buttonValueMap.set(EventType.MOUSEMOVE, [1, 4, 2, 0]);
  } else if (WEBKIT || IE_DOC_9) {
    buttonValueMap.set(EventType.CLICK, [0, 1, 2, null]);
    buttonValueMap.set(EventType.CONTEXTMENU, [null, null, 2, null]);
    buttonValueMap.set(EventType.MOUSEUP, [0, 1, 2, null]);
    buttonValueMap.set(EventType.MOUSEOUT, [0, 1, 2, 0]);
    buttonValueMap.set(EventType.MOUSEMOVE, [0, 1, 2, 0]);
  } else {
    buttonValueMap.set(EventType.CLICK, [0, 1, 2, null]);
    buttonValueMap.set(EventType.CONTEXTMENU, [null, null, 2, null]);
    buttonValueMap.set(EventType.MOUSEUP, [0, 1, 2, null]);
    buttonValueMap.set(EventType.MOUSEOUT, [0, 0, 0, 0]);
    buttonValueMap.set(EventType.MOUSEMOVE, [0, 0, 0, 0]);
  }

  if (IE_DOC_10) {
    buttonValueMap.set(
      EventType.MSPOINTERDOWN,
      buttonValueMap.get(EventType.MOUSEUP)!
    );
    buttonValueMap.set(
      EventType.MSPOINTERUP,
      buttonValueMap.get(EventType.MOUSEUP)!
    );
    buttonValueMap.set(EventType.MSPOINTERMOVE, [-1, -1, -1, -1]);
    buttonValueMap.set(
      EventType.MSPOINTEROUT,
      buttonValueMap.get(EventType.MSPOINTERMOVE)!
    );
    buttonValueMap.set(
      EventType.MSPOINTEROVER,
      buttonValueMap.get(EventType.MSPOINTERMOVE)!
    );
  }

  buttonValueMap.set(EventType.DBLCLICK, buttonValueMap.get(EventType.CLICK)!);
  buttonValueMap.set(EventType.MOUSEDOWN, buttonValueMap.get(EventType.MOUSEUP)!);
  buttonValueMap.set(EventType.MOUSEOVER, buttonValueMap.get(EventType.MOUSEOUT)!);

  return buttonValueMap;
})();

/**
 * Maps mouse events to corresponding MSPointer event.
 */
const MOUSE_EVENT_MAP_: Map<EventFactory, EventFactory> = new Map([
  [EventType.MOUSEDOWN, EventType.MSPOINTERDOWN],
  [EventType.MOUSEMOVE, EventType.MSPOINTERMOVE],
  [EventType.MOUSEOUT, EventType.MSPOINTEROUT],
  [EventType.MOUSEOVER, EventType.MSPOINTEROVER],
  [EventType.MOUSEUP, EventType.MSPOINTERUP],
]);

// ============================================================================
// Helper functions
// ============================================================================

function getWindow(doc: Document): Window {
  return doc.defaultView || (doc as Document & { parentWindow?: Window }).parentWindow || window;
}

function getOwnerDocument(node: Node): Document {
  return node.ownerDocument || (node as Document);
}

// ============================================================================
// Mouse Class
// ============================================================================

/**
 * A mouse that provides atomic mouse actions.
 */
export class Mouse extends Device {
  private buttonPressed_: Button | null = null;
  private elementPressed_: Element | null = null;
  private clientXY_: Coordinate = { x: 0, y: 0 };
  private nextClickIsDoubleClick_: boolean = false;
  private hasEverInteracted_: boolean = false;

  constructor(
    opt_state?: MouseState,
    opt_modifiersState?: ModifiersState,
    opt_eventEmitter?: EventEmitter
  ) {
    super(opt_modifiersState, opt_eventEmitter);

    if (opt_state) {
      if (typeof opt_state.buttonPressed === 'number') {
        this.buttonPressed_ = opt_state.buttonPressed;
      }

      try {
        if (opt_state.elementPressed && isElement(opt_state.elementPressed)) {
          this.elementPressed_ = opt_state.elementPressed;
        }
      } catch {
        this.buttonPressed_ = null;
      }

      this.clientXY_ = {
        x: opt_state.clientXY.x,
        y: opt_state.clientXY.y,
      };

      this.nextClickIsDoubleClick_ = !!opt_state.nextClickIsDoubleClick;
      this.hasEverInteracted_ = !!opt_state.hasEverInteracted;

      try {
        if (opt_state.element && isElement(opt_state.element)) {
          this.setElement(opt_state.element);
        }
      } catch {
        this.buttonPressed_ = null;
      }
    }
  }

  /**
   * Attempts to fire a mousedown event and then returns whether or not the
   * element should receive focus as a result of the mousedown.
   */
  private fireMousedown_(opt_count?: number): boolean {
    const isFirefox3 = GECKO && !isProductVersion(4);
    const blocksOnMousedown =
      (WEBKIT || isFirefox3) &&
      (isElement(this.getElement(), 'OPTION') ||
        isElement(this.getElement(), 'SELECT'));
    if (blocksOnMousedown) {
      return true;
    }

    let beforeActiveElement: Element | null = null;
    const mousedownCanPreemptFocus = GECKO || IS_IE;
    if (mousedownCanPreemptFocus) {
      beforeActiveElement = getActiveElement(this.getElement());
    }
    const performFocus = this.fireMouseEvent_(
      EventType.MOUSEDOWN,
      null,
      null,
      false,
      opt_count
    );
    if (
      performFocus &&
      mousedownCanPreemptFocus &&
      beforeActiveElement !== getActiveElement(this.getElement())
    ) {
      return false;
    }
    return performFocus;
  }

  /**
   * Presses the given mouse button on the current element.
   */
  pressButton(button: Button, opt_count?: number): void {
    if (this.buttonPressed_ !== null) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Cannot press more than one button or an already pressed button.'
      );
    }
    this.buttonPressed_ = button;
    this.elementPressed_ = this.getElement();

    if (this.fireMousedown_(opt_count)) {
      if (
        IE_DOC_10 &&
        this.buttonPressed_ === Button.LEFT &&
        isElement(this.elementPressed_, 'OPTION')
      ) {
        this.fireMSPointerEvent(
          EventType.MSGOTPOINTERCAPTURE,
          this.clientXY_,
          0,
          MOUSE_MS_POINTER_ID,
          (window as Window & { MSPointerEvent?: { MSPOINTER_TYPE_MOUSE?: number } }).MSPointerEvent?.MSPOINTER_TYPE_MOUSE ?? 4,
          true
        );
      }
      this.focusOnElement();
    }
  }

  /**
   * Releases the pressed mouse button.
   */
  releaseButton(opt_force?: boolean, opt_count?: number): void {
    if (this.buttonPressed_ === null) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Cannot release a button when no button is pressed.'
      );
    }

    this.maybeToggleOption();

    const elementInteractableBeforeMouseup = isInteractable(this.getElement());
    this.fireMouseEvent_(EventType.MOUSEUP, null, null, opt_force, opt_count);

    try {
      if (
        this.buttonPressed_ === Button.LEFT &&
        this.getElement() === this.elementPressed_
      ) {
        if (
          !(WINDOWS_PHONE && isElement(this.elementPressed_, 'OPTION'))
        ) {
          this.clickElement(
            this.clientXY_,
            this.getButtonValue_(EventType.CLICK),
            elementInteractableBeforeMouseup
          );
        }
        this.maybeDoubleClickElement_();
        if (
          IE_DOC_10 &&
          this.buttonPressed_ === Button.LEFT &&
          isElement(this.elementPressed_, 'OPTION')
        ) {
          this.fireMSPointerEvent(
            EventType.MSLOSTPOINTERCAPTURE,
            { x: 0, y: 0 },
            0,
            MOUSE_MS_POINTER_ID,
            (window as Window & { MSPointerEvent?: { MSPOINTER_TYPE_MOUSE?: number } }).MSPointerEvent?.MSPOINTER_TYPE_MOUSE ?? 4,
            false
          );
        }
      } else if (this.buttonPressed_ === Button.RIGHT) {
        this.fireMouseEvent_(EventType.CONTEXTMENU);
      }
    } catch {
      // Ignore errors per original implementation
    }
    clearPointerMap();
    this.buttonPressed_ = null;
    this.elementPressed_ = null;
  }

  /**
   * A helper function to fire mouse double click events.
   */
  private maybeDoubleClickElement_(): void {
    if (this.nextClickIsDoubleClick_) {
      this.fireMouseEvent_(EventType.DBLCLICK);
    }
    this.nextClickIsDoubleClick_ = !this.nextClickIsDoubleClick_;
  }

  /**
   * Given coordinates (x,y) related to an element, move mouse to (x,y) of the element.
   */
  move(element: Element, coords: Coordinate): void {
    const toElemWasInteractable = isInteractable(element);

    const rect = getClientRect(element);
    this.clientXY_.x = coords.x + rect.left;
    this.clientXY_.y = coords.y + rect.top;
    let fromElement: Element | null = this.getElement();

    if (element !== fromElement) {
      try {
        if (getWindow(getOwnerDocument(fromElement)).closed) {
          fromElement = null;
        }
      } catch {
        fromElement = null;
      }

      if (fromElement) {
        const isRoot =
          fromElement === getDocument().documentElement ||
          fromElement === getDocument().body;
        fromElement = !this.hasEverInteracted_ && isRoot ? null : fromElement;
        this.fireMouseEvent_(EventType.MOUSEOUT, element);
      }
      this.setElement(element);

      if (!IS_IE) {
        this.fireMouseEvent_(
          EventType.MOUSEOVER,
          fromElement,
          null,
          toElemWasInteractable
        );
      }
    }

    this.fireMouseEvent_(EventType.MOUSEMOVE, null, null, toElemWasInteractable);

    if (IS_IE && element !== fromElement) {
      this.fireMouseEvent_(
        EventType.MOUSEOVER,
        fromElement,
        null,
        toElemWasInteractable
      );
    }

    this.nextClickIsDoubleClick_ = false;
  }

  /**
   * Scrolls the wheel of the mouse by the given number of ticks.
   */
  scroll(ticks: number): void {
    if (ticks === 0) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Must scroll a non-zero number of ticks.'
      );
    }

    const wheelDelta = ticks > 0 ? -120 : 120;
    const pixelDelta = ticks > 0 ? 57 : -57;

    for (let i = 0; i < Math.abs(ticks); i++) {
      this.fireMouseEvent_(EventType.MOUSEWHEEL, null, wheelDelta);
      if (GECKO) {
        this.fireMouseEvent_(EventType.MOUSEPIXELSCROLL, null, pixelDelta);
      }
    }
  }

  /**
   * A helper function to fire mouse events.
   */
  private fireMouseEvent_(
    type: EventFactory,
    opt_related?: Element | null,
    opt_wheelDelta?: number | null,
    opt_force?: boolean,
    opt_count?: number
  ): boolean {
    this.hasEverInteracted_ = true;
    if (IE_DOC_10) {
      const msPointerEvent = MOUSE_EVENT_MAP_.get(type);
      if (msPointerEvent) {
        if (
          !this.fireMSPointerEvent(
            msPointerEvent,
            this.clientXY_,
            this.getButtonValue_(msPointerEvent),
            MOUSE_MS_POINTER_ID,
            (window as Window & { MSPointerEvent?: { MSPOINTER_TYPE_MOUSE?: number } }).MSPointerEvent?.MSPOINTER_TYPE_MOUSE ?? 4,
            true,
            opt_related ?? undefined,
            opt_force
          )
        ) {
          return false;
        }
      }
    }
    return this.fireMouseEvent(
      type,
      this.clientXY_,
      this.getButtonValue_(type),
      opt_related ?? undefined,
      opt_wheelDelta ?? undefined,
      opt_force,
      undefined,
      opt_count
    );
  }

  /**
   * Given an event type and a mouse button, returns the mouse button value.
   */
  private getButtonValue_(eventType: EventFactory): number {
    const buttonValues = MOUSE_BUTTON_VALUE_MAP_.get(eventType);
    if (!buttonValues) {
      return 0;
    }

    const buttonIndex =
      this.buttonPressed_ === null ? NO_BUTTON_VALUE_INDEX_ : this.buttonPressed_;
    const buttonValue = buttonValues[buttonIndex];
    if (buttonValue === null) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Event does not permit the specified mouse button.'
      );
    }
    return buttonValue;
  }

  /**
   * Serialize the current state of the mouse.
   */
  getState(): MouseState {
    return {
      buttonPressed: this.buttonPressed_,
      elementPressed: this.elementPressed_,
      clientXY: { x: this.clientXY_.x, y: this.clientXY_.y },
      nextClickIsDoubleClick: this.nextClickIsDoubleClick_,
      hasEverInteracted: this.hasEverInteracted_,
      element: this.getElement(),
    };
  }
}
