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
 * The file contains an abstraction of a touch screen
 * for simulating atomic touchscreen actions.
 */

import { Device, Coordinate, clearPointerMap } from './device';
import { WebDriverError, ErrorCode } from './error';
import * as dom from './dom';
import * as events from './events';
import * as userAgent from './userAgent';
import * as bot from './bot';

/**
 * A TouchScreen that provides atomic touch actions. The metaphor
 * for this abstraction is a finger moving above the touchscreen that
 * can press and then release the touchscreen when specified.
 *
 * The touchscreen supports three actions: press, release, and move.
 */
export class Touchscreen extends Device {
    private clientXY_: { x: number; y: number } = { x: 0, y: 0 };
    private clientXY2_: { x: number; y: number } = { x: 0, y: 0 };
    private fireMouseEventsOnRelease_: boolean = true;
    private cancelled_: boolean = false;
    private touchIdentifier_: number = 0;
    private touchIdentifier2_: number = 0;
    private touchCounter_: number = 2;

    /**
     * Press the touch screen. Pressing before moving results in an exception.
     * Pressing while already pressed also results in an exception.
     */
    press(opt_press2?: boolean): void {
        if (this.isPressed()) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Cannot press touchscreen when already pressed.');
        }

        this.touchIdentifier_ = this.touchCounter_++;
        if (opt_press2) {
            this.touchIdentifier2_ = this.touchCounter_++;
        }

        if (userAgent.IS_IE && userAgent.isEngineVersion(10)) {
            this.fireMouseEventsOnRelease_ = true;
            this.firePointerEvents_(this.fireSinglePressPointer_);
        } else {
            this.fireMouseEventsOnRelease_ = this.fireTouchEvent_(
                events.EventType.TOUCHSTART);
        }
    }

    /**
     * Releases an element on a touchscreen. Releasing an element that is not
     * pressed results in an exception.
     */
    release(): void {
        if (!this.isPressed()) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Cannot release touchscreen when not already pressed.');
        }

        if (!userAgent.IS_IE || !userAgent.isEngineVersion(10)) {
            this.fireTouchReleaseEvents_();
        } else if (!this.cancelled_) {
            this.firePointerEvents_(this.fireSingleReleasePointer_);
        }
        clearPointerMap();
        this.touchIdentifier_ = 0;
        this.touchIdentifier2_ = 0;
        this.cancelled_ = false;
    }

    /**
     * Moves finger along the touchscreen.
     */
    move(element: Element, coords: { x: number; y: number }, opt_coords2?: { x: number; y: number }): void {
        // The target element for touch actions is the original element. Hence, the
        // element is set only when the touchscreen is not currently being pressed.
        // The exception is IE10 which fire events on the moved to element.
        const originalElement = this.getElement();
        if (!this.isPressed() || (userAgent.IS_IE && userAgent.isEngineVersion(10))) {
            this.setElement(element);
        }

        const rect = dom.getClientRect(element);
        this.clientXY_.x = coords.x + rect.left;
        this.clientXY_.y = coords.y + rect.top;

        if (opt_coords2 !== undefined) {
            this.clientXY2_.x = opt_coords2.x + rect.left;
            this.clientXY2_.y = opt_coords2.y + rect.top;
        }

        if (this.isPressed()) {
            if (!userAgent.IS_IE || !userAgent.isEngineVersion(10)) {
                this.fireMouseEventsOnRelease_ = false;
                this.fireTouchEvent_(events.EventType.TOUCHMOVE);
            } else if (!this.cancelled_) {
                if (element !== originalElement) {
                    this.fireMouseEventsOnRelease_ = false;
                }
                if (this.hasMsTouchActionsEnabled_(element)) {
                    this.firePointerEvents_(this.fireSingleMovePointer_);
                } else {
                    const msPointerType = (window as any).MSPointerEvent?.MSPOINTER_TYPE_TOUCH || 2;
                    this.fireMSPointerEvent(events.EventType.MSPOINTEROUT, new Coordinate(coords.x, coords.y), -1,
                        this.touchIdentifier_, msPointerType, true);
                    this.fireMouseEvent(events.EventType.MOUSEOUT, new Coordinate(coords.x, coords.y), 0);
                    this.fireMSPointerEvent(events.EventType.MSPOINTERCANCEL, new Coordinate(coords.x, coords.y), 0,
                        this.touchIdentifier_, msPointerType, true);
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
    private fireTouchEvent_(type: any): boolean {
        if (!this.isPressed()) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Should never fire event when touchscreen is not pressed.');
        }
        let touchIdentifier2: number | undefined;
        let coords2: { x: number; y: number } | undefined;
        if (this.touchIdentifier2_) {
            touchIdentifier2 = this.touchIdentifier2_;
            coords2 = this.clientXY2_;
        }
        return this.fireTouchEvent(type, this.touchIdentifier_, new Coordinate(this.clientXY_.x, this.clientXY_.y),
            touchIdentifier2, coords2);
    }

    /**
     * A helper function to fire touch events that occur on a release.
     */
    private fireTouchReleaseEvents_(): void {
        const touchendSuccess = this.fireTouchEvent_(events.EventType.TOUCHEND);

        // In general, TouchScreen.Release will fire the legacy mouse events:
        // mousemove, mousedown, mouseup, and click after the touch events have been
        // fired. The click button should be zero and only one mousemove should fire.
        // Under the following cases, mouse events should not be fired:
        // 1. Movement has occurred since press.
        // 2. Any event handler for touchstart has called preventDefault().
        // 3. Any event handler for touchend has called preventDefault(), and browser
        // is Mobile Safari or Chrome.
        const isIOSOrChrome = userAgent.IS_IOS || userAgent.IS_CHROME;
        const fireMouseEvents =
            this.fireMouseEventsOnRelease_ &&
            (touchendSuccess || !isIOSOrChrome);

        if (fireMouseEvents) {
            this.fireMouseEvent(events.EventType.MOUSEMOVE, new Coordinate(this.clientXY_.x, this.clientXY_.y), 0);
            const performFocus = this.fireMouseEvent(events.EventType.MOUSEDOWN,
                new Coordinate(this.clientXY_.x, this.clientXY_.y), 0);
            // Element gets focus after the mousedown event only if the mousedown was
            // not cancelled.
            if (performFocus) {
                this.focusOnElement();
            }
            this.maybeToggleOption();

            // If a mouseup event is dispatched to an interactable event, and that
            // mouseup would complete a click, then the click event must be dispatched
            // even if the element becomes non-interactable after the mouseup.
            const elementInteractableBeforeMouseup =
                dom.isInteractable(this.getElement());
            this.fireMouseEvent(events.EventType.MOUSEUP, new Coordinate(this.clientXY_.x, this.clientXY_.y), 0);

            // Special click logic to follow links and to perform form actions.
            this.clickElement(new Coordinate(this.clientXY_.x, this.clientXY_.y),
          /* button */ 0,
          /* opt_force */ elementInteractableBeforeMouseup);
        }
    }

    /**
     * A helper function to fire a sequence of Pointer events.
     */
    private firePointerEvents_(fireSinglePointer: (this: Touchscreen, element: Element, coords: Coordinate, id: number, isPrimary: boolean) => void): void {
        fireSinglePointer.call(this, this.getElement(), new Coordinate(this.clientXY_.x, this.clientXY_.y),
            this.touchIdentifier_, true);
        if (this.touchIdentifier2_ &&
            this.hasMsTouchActionsEnabled_(this.getElement())) {
            fireSinglePointer.call(this, this.getElement(),
                new Coordinate(this.clientXY2_.x, this.clientXY2_.y), this.touchIdentifier2_, false);
        }
    }

    /**
     * A helper method to fire Pointer events related to a press.
     */
    private fireSinglePressPointer_(element: Element, coords: Coordinate, id: number, isPrimary: boolean): void {
        // Fire a mousemove event.
        this.fireMouseEvent(events.EventType.MOUSEMOVE, coords, 0);

        // Fire a MSPointerOver and mouseover events.
        const msPointerType = (window as any).MSPointerEvent?.MSPOINTER_TYPE_TOUCH || 2;
        this.fireMSPointerEvent(events.EventType.MSPOINTEROVER, coords, 0, id,
            msPointerType, isPrimary);
        this.fireMouseEvent(events.EventType.MOUSEOVER, coords, 0);

        // Fire a MSPointerDown and mousedown events.
        this.fireMSPointerEvent(events.EventType.MSPOINTERDOWN, coords, 0, id,
            msPointerType, isPrimary);

        // Element gets focus after the mousedown event.
        if (this.fireMouseEvent(events.EventType.MOUSEDOWN, coords, 0)) {
            // For selectable elements, IE 10 fires a MSGotPointerCapture event.
            if (dom.isSelectable(element)) {
                this.fireMSPointerEvent(events.EventType.MSGOTPOINTERCAPTURE, coords, 0,
                    id, msPointerType, isPrimary);
            }
            this.focusOnElement();
        }
    }

    /**
     * A helper method to fire Pointer events related to a release.
     */
    private fireSingleReleasePointer_(element: Element, coords: Coordinate, id: number, isPrimary: boolean): void {
        // Fire a MSPointerUp and mouseup events.
        const msPointerType = (window as any).MSPointerEvent?.MSPOINTER_TYPE_TOUCH || 2;
        this.fireMSPointerEvent(events.EventType.MSPOINTERUP, coords, 0, id,
            msPointerType, isPrimary);

        // If a mouseup event is dispatched to an interactable event, and that mouseup
        // would complete a click, then the click event must be dispatched even if the
        // element becomes non-interactable after the mouseup.
        const elementInteractableBeforeMouseup =
            dom.isInteractable(this.getElement());
        this.fireMouseEvent(events.EventType.MOUSEUP, coords, 0, undefined, 0, false,
            id);

        // Fire a click.
        if (this.fireMouseEventsOnRelease_) {
            this.maybeToggleOption();
            this.clickElement(new Coordinate(this.clientXY_.x, this.clientXY_.y),
          /* button */ 0,
          /* opt_force */ elementInteractableBeforeMouseup,
                    id);
        }

        if (dom.isSelectable(element)) {
            // For selectable elements, IE 10 fires a MSLostPointerCapture event.
            this.fireMSPointerEvent(events.EventType.MSLOSTPOINTERCAPTURE,
                new Coordinate(0, 0), 0, id,
                msPointerType, false);
        }

        // Fire a MSPointerOut and mouseout events.
        this.fireMSPointerEvent(events.EventType.MSPOINTEROUT, coords, -1, id,
            msPointerType, isPrimary);
        this.fireMouseEvent(events.EventType.MOUSEOUT, coords, 0, undefined, 0, false,
            id);
    }

    /**
     * A helper method to fire Pointer events related to a move.
     */
    private fireSingleMovePointer_(element: Element, coords: Coordinate, id: number, isPrimary: boolean): void {
        // Fire a MSPointerMove and mousemove events.
        const msPointerType = (window as any).MSPointerEvent?.MSPOINTER_TYPE_TOUCH || 2;
        this.fireMSPointerEvent(events.EventType.MSPOINTERMOVE, coords, -1, id,
            msPointerType, isPrimary);
        this.fireMouseEvent(events.EventType.MOUSEMOVE, coords, 0, undefined, 0, false,
            id);
    }

    /**
     * A method that determines whether an element can be manipulated by the user.
     * The msTouchAction style is queried and an element can be manipulated if the
     * style value is none. If an element cannot be manipulated, then move gestures
     * will result in a cancellation and multi-touch events will be prevented. Tap
     * gestures will still be allowed. If not on IE 10, the function returns true.
     */
    private hasMsTouchActionsEnabled_(element: Element): boolean {
        if (!userAgent.IS_IE || !userAgent.isEngineVersion(10)) {
            return true;
        }

        // Although this particular element may have a style indicating that it cannot
        // receive javascript events, its parent may indicate otherwise.
        if (dom.getEffectiveStyle(element, 'ms-touch-action') === 'none') {
            return true;
        } else {
            const parent = dom.getParentElement(element);
            return !!parent && this.hasMsTouchActionsEnabled_(parent);
        }
    }
}
