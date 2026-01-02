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
 * @fileoverview The file contains an abstraction of a touch screen
 * for simulating atomic touchscreen actions.
 */

import { BotError, ErrorCode } from './error';
import {
  Device,
  Coordinate,
  clearPointerMap,
} from './device';
import {
  isElement,
  isInteractable,
  isSelectable,
  getClientRect,
  getEffectiveStyle,
  getParentElement,
} from './dom';
import { EventType } from './events';
import { IE_DOC_10, WINDOWS_PHONE, IOS } from './userAgent';

// Browser detection
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_CHROME = /Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent);

// MSPointerEvent types for IE10
declare const MSPointerEvent: {
  MSPOINTER_TYPE_TOUCH: number;
};

// ============================================================================
// Touchscreen Class
// ============================================================================

/**
 * A TouchScreen that provides atomic touch actions.
 */
export class Touchscreen extends Device {
  /** @internal */
  clientXY_: Coordinate = { x: 0, y: 0 };
  private clientXY2_: Coordinate = { x: 0, y: 0 };
  /** @internal */
  fireMouseEventsOnRelease_: boolean = true;
  private cancelled_: boolean = false;
  private touchIdentifier_: number = 0;
  private touchIdentifier2_: number = 0;
  private touchCounter_: number = 2;

  constructor() {
    super();
  }

  /**
   * Press the touch screen.
   */
  press(opt_press2?: boolean): void {
    if (this.isPressed()) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Cannot press touchscreen when already pressed.'
      );
    }

    this.touchIdentifier_ = this.touchCounter_++;
    if (opt_press2) {
      this.touchIdentifier2_ = this.touchCounter_++;
    }

    if (IE_DOC_10) {
      this.fireMouseEventsOnRelease_ = true;
      this.firePointerEvents_(fireSinglePressPointer_);
    } else {
      this.fireMouseEventsOnRelease_ = this.fireTouchEvent_(EventType.TOUCHSTART);
    }
  }

  /**
   * Releases an element on a touchscreen.
   */
  release(): void {
    if (!this.isPressed()) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Cannot release touchscreen when not already pressed.'
      );
    }

    if (!IE_DOC_10) {
      this.fireTouchReleaseEvents_();
    } else if (!this.cancelled_) {
      this.firePointerEvents_(fireSingleReleasePointer_);
    }
    clearPointerMap();
    this.touchIdentifier_ = 0;
    this.touchIdentifier2_ = 0;
    this.cancelled_ = false;
  }

  /**
   * Moves finger along the touchscreen.
   */
  move(element: Element, coords: Coordinate, opt_coords2?: Coordinate): void {
    const originalElement = this.getElement();
    if (!this.isPressed() || IE_DOC_10) {
      this.setElement(element);
    }

    const rect = getClientRect(element);
    this.clientXY_.x = coords.x + rect.left;
    this.clientXY_.y = coords.y + rect.top;

    if (opt_coords2 !== undefined) {
      this.clientXY2_.x = opt_coords2.x + rect.left;
      this.clientXY2_.y = opt_coords2.y + rect.top;
    }

    if (this.isPressed()) {
      if (!IE_DOC_10) {
        this.fireMouseEventsOnRelease_ = false;
        this.fireTouchEvent_(EventType.TOUCHMOVE);
      } else if (!this.cancelled_) {
        if (element !== originalElement) {
          this.fireMouseEventsOnRelease_ = false;
        }
        if (hasMsTouchActionsEnabled_(element)) {
          this.firePointerEvents_(fireSingleMovePointer_);
        } else {
          this.fireMSPointerEvent(
            EventType.MSPOINTEROUT,
            coords,
            -1,
            this.touchIdentifier_,
            MSPointerEvent.MSPOINTER_TYPE_TOUCH,
            true
          );
          this.fireMouseEvent(EventType.MOUSEOUT, coords, 0);
          this.fireMSPointerEvent(
            EventType.MSPOINTERCANCEL,
            coords,
            0,
            this.touchIdentifier_,
            MSPointerEvent.MSPOINTER_TYPE_TOUCH,
            true
          );
          this.cancelled_ = true;
          clearPointerMap();
        }
      }
    }
  }

  /**
   * Returns whether the touchscreen is currently pressed.
   */
  isPressed(): boolean {
    return !!this.touchIdentifier_;
  }

  /**
   * A helper function to fire touch events.
   */
  private fireTouchEvent_(type: typeof EventType.TOUCHSTART | typeof EventType.TOUCHMOVE | typeof EventType.TOUCHEND): boolean {
    if (!this.isPressed()) {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Should never fire event when touchscreen is not pressed.'
      );
    }
    let touchIdentifier2: number | undefined;
    let coords2: Coordinate | undefined;
    if (this.touchIdentifier2_) {
      touchIdentifier2 = this.touchIdentifier2_;
      coords2 = this.clientXY2_;
    }
    return this.fireTouchEvent(
      type,
      this.touchIdentifier_,
      this.clientXY_,
      touchIdentifier2,
      coords2
    );
  }

  /**
   * A helper function to fire touch events that occur on a release.
   */
  private fireTouchReleaseEvents_(): void {
    const touchendSuccess = this.fireTouchEvent_(EventType.TOUCHEND);

    const fireMouseEvents =
      this.fireMouseEventsOnRelease_ && (touchendSuccess || !(IOS || IS_CHROME));

    if (fireMouseEvents) {
      this.fireMouseEvent(EventType.MOUSEMOVE, this.clientXY_, 0);
      const performFocus = this.fireMouseEvent(
        EventType.MOUSEDOWN,
        this.clientXY_,
        0
      );
      if (performFocus) {
        this.focusOnElement();
      }
      this.maybeToggleOption();

      const elementInteractableBeforeMouseup = isInteractable(this.getElement());
      this.fireMouseEvent(EventType.MOUSEUP, this.clientXY_, 0);

      if (!(WINDOWS_PHONE && isElement(this.getElement(), 'OPTION'))) {
        this.clickElement(this.clientXY_, 0, elementInteractableBeforeMouseup);
      }
    }
  }

  /**
   * A helper function to fire a sequence of Pointer events.
   */
  private firePointerEvents_(
    fireSinglePointer: (
      ts: Touchscreen,
      element: Element,
      coords: Coordinate,
      id: number,
      isPrimary: boolean
    ) => void
  ): void {
    fireSinglePointer(
      this,
      this.getElement(),
      this.clientXY_,
      this.touchIdentifier_,
      true
    );
    if (this.touchIdentifier2_ && hasMsTouchActionsEnabled_(this.getElement())) {
      fireSinglePointer(
        this,
        this.getElement(),
        this.clientXY2_,
        this.touchIdentifier2_,
        false
      );
    }
  }
}

// ============================================================================
// Static Helper Functions
// ============================================================================

/**
 * A helper function to fire Pointer events related to a press.
 */
function fireSinglePressPointer_(
  ts: Touchscreen,
  element: Element,
  coords: Coordinate,
  id: number,
  isPrimary: boolean
): void {
  ts.fireMouseEvent(EventType.MOUSEMOVE, coords, 0);

  ts.fireMSPointerEvent(
    EventType.MSPOINTEROVER,
    coords,
    0,
    id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH,
    isPrimary
  );
  ts.fireMouseEvent(EventType.MOUSEOVER, coords, 0);

  ts.fireMSPointerEvent(
    EventType.MSPOINTERDOWN,
    coords,
    0,
    id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH,
    isPrimary
  );

  if (ts.fireMouseEvent(EventType.MOUSEDOWN, coords, 0)) {
    if (isSelectable(element)) {
      ts.fireMSPointerEvent(
        EventType.MSGOTPOINTERCAPTURE,
        coords,
        0,
        id,
        MSPointerEvent.MSPOINTER_TYPE_TOUCH,
        isPrimary
      );
    }
    ts.focusOnElement();
  }
}

/**
 * A helper function to fire Pointer events related to a release.
 */
function fireSingleReleasePointer_(
  ts: Touchscreen,
  element: Element,
  coords: Coordinate,
  id: number,
  isPrimary: boolean
): void {
  ts.fireMSPointerEvent(
    EventType.MSPOINTERUP,
    coords,
    0,
    id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH,
    isPrimary
  );

  const elementInteractableBeforeMouseup = isInteractable(ts.getElement());
  ts.fireMouseEvent(EventType.MOUSEUP, coords, 0, undefined, 0, false, id);

  if (ts.fireMouseEventsOnRelease_) {
    ts.maybeToggleOption();
    if (!(WINDOWS_PHONE && isElement(element, 'OPTION'))) {
      ts.clickElement(ts.clientXY_, 0, elementInteractableBeforeMouseup, id);
    }
  }

  if (isSelectable(element)) {
    ts.fireMSPointerEvent(
      EventType.MSLOSTPOINTERCAPTURE,
      { x: 0, y: 0 },
      0,
      id,
      MSPointerEvent.MSPOINTER_TYPE_TOUCH,
      false
    );
  }

  ts.fireMSPointerEvent(
    EventType.MSPOINTEROUT,
    coords,
    -1,
    id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH,
    isPrimary
  );
  ts.fireMouseEvent(EventType.MOUSEOUT, coords, 0, undefined, 0, false, id);
}

/**
 * A helper function to fire Pointer events related to a move.
 */
function fireSingleMovePointer_(
  ts: Touchscreen,
  _element: Element,
  coords: Coordinate,
  id: number,
  isPrimary: boolean
): void {
  ts.fireMSPointerEvent(
    EventType.MSPOINTERMOVE,
    coords,
    -1,
    id,
    MSPointerEvent.MSPOINTER_TYPE_TOUCH,
    isPrimary
  );
  ts.fireMouseEvent(EventType.MOUSEMOVE, coords, 0, undefined, 0, false, id);
}

/**
 * A function that determines whether an element can be manipulated by the user.
 */
function hasMsTouchActionsEnabled_(element: Element): boolean {
  if (!IE_DOC_10) {
    throw new Error('hasMsTouchActionsEnable should only be called from IE 10');
  }

  if (getEffectiveStyle(element, 'ms-touch-action') === 'none') {
    return true;
  } else {
    const parent = getParentElement(element);
    return !!parent && hasMsTouchActionsEnabled_(parent);
  }
}


