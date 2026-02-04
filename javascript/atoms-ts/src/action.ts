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
 * Atoms for simulating user actions against the DOM.
 * The action namespace is required since these atoms would otherwise form a
 * circular dependency between dom and events.
 */

import * as bot from './bot';
import * as dom from './dom';
import * as events from './events';
import { WebDriverError, ErrorCode } from './error';
import { Device } from './device';
import { Keyboard } from './keyboard';
import { Mouse } from './mouse';
import { Touchscreen } from './touchscreen';
import * as userAgent from './userAgent';

/**
 * Throws an exception if an element is not shown to the user, ignoring its opacity.
 */
function checkShown_(element: Element): void {
    if (!dom.isShown(element, /* ignoreOpacity */ true)) {
        throw new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE,
            'Element is not currently visible and may not be manipulated');
    }
}

/**
 * Throws an exception if the given element cannot be interacted with.
 */
function checkInteractable_(element: Element): void {
    if (!dom.isInteractable(element)) {
        throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
            'Element is not currently interactable and may not be manipulated');
    }
}

/**
 * Clears the given `element` if it is an editable text field.
 */
export function clear(element: Element): void {
    checkInteractable_(element);
    if (!dom.isEditable(element)) {
        throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
            'Element must be user-editable in order to clear it.');
    }

    if ((element as any).value) {
        LegacyDevice_.focusOnElement(element);
        if (userAgent.IS_IE && dom.isInputType(element as HTMLInputElement, 'range')) {
            const input = element as HTMLInputElement;
            const min = input.min ? parseInt(input.min, 10) : 0;
            const max = input.max ? parseInt(input.max, 10) : 100;
            input.value = String((max < min) ? min : min + (max - min) / 2);
        } else {
            (element as any).value = '';
        }
        events.fire(element, events.EventType.CHANGE);
        if (userAgent.IS_IE) {
            events.fire(element, events.EventType.BLUR);
        }
        const body = document.body;
        if (body) {
            LegacyDevice_.focusOnElement(body);
        } else {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Cannot unfocus element after clearing.');
        }
    } else if (element instanceof HTMLInputElement && element.type === 'number') {
        // number input fields that have invalid inputs report their value as empty
        // string with no way to tell if there is a current value or not
        LegacyDevice_.focusOnElement(element);
        element.value = '';
    } else if (dom.isContentEditable(element)) {
        // A single space is required; an empty string won't allow interaction
        // with the element in Firefox.
        LegacyDevice_.focusOnElement(element);
        if (userAgent.IS_FIREFOX) {
            element.textContent = ' ';
        } else {
            element.textContent = '';
        }
        const body = document.body;
        if (body) {
            LegacyDevice_.focusOnElement(body);
        } else {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Cannot unfocus element after clearing.');
        }
    }
}

/**
 * Focuses on the given element if it is not already the active element.
 */
export function focusOnElement(element: Element): void {
    checkInteractable_(element);
    LegacyDevice_.focusOnElement(element);
}

/**
 * Types keys on the given `element` with a virtual keyboard.
 */
export function type(
    element: Element,
    values: string | any | (string | any)[],
    opt_keyboard?: Keyboard,
    opt_persistModifiers?: boolean
): void {
    // If the element has already been brought into focus somehow, typing is
    // always allowed to proceed. Otherwise, we require the element be in an
    // "interactable" state.
    if (element !== dom.getActiveElement(element)) {
        checkInteractable_(element);
        scrollIntoView(element);
    }

    const keyboard = opt_keyboard || new Keyboard();
    keyboard.moveCursor(element);

    function typeValue(value: string | any): void {
        if (typeof value === 'string') {
            value.split('').forEach((ch: string) => {
                const keyShiftPair = (Keyboard as any).Key.fromChar(ch);
                if (keyShiftPair.shift && !(keyboard as any).isPressed((Keyboard as any).Keys.SHIFT)) {
                    keyboard.pressKey((Keyboard as any).Keys.SHIFT);
                }
                keyboard.pressKey(keyShiftPair.key);
                keyboard.releaseKey(keyShiftPair.key);
                if (keyShiftPair.shift && !(keyboard as any).isPressed((Keyboard as any).Keys.SHIFT)) {
                    keyboard.releaseKey((Keyboard as any).Keys.SHIFT);
                }
            });
        } else if ((Keyboard as any).MODIFIERS && (Keyboard as any).MODIFIERS.includes(value)) {
            if ((keyboard as any).isPressed(value)) {
                keyboard.releaseKey(value);
            } else {
                keyboard.pressKey(value);
            }
        } else {
            keyboard.pressKey(value);
            keyboard.releaseKey(value);
        }
    }

    // mobile safari (iPhone / iPad) - one cannot 'type' in a date field
    if ((!(userAgent.IS_SAFARI && !userAgent.IS_MOBILE)) &&
        userAgent.IS_WEBKIT && (element as any).type === 'date') {
        const val = Array.isArray(values) ? values.join('') : values;
        const datePattern = /\d{4}-\d{2}-\d{2}/;
        const match = val.match(datePattern);
        if (match) {
            // The following events get fired on iOS first
            if (userAgent.IS_MOBILE && userAgent.IS_SAFARI) {
                events.fire(element, events.EventType.TOUCHSTART);
                events.fire(element, events.EventType.TOUCHEND);
            }
            events.fire(element, events.EventType.FOCUS);
            (element as any).value = match[0];
            events.fire(element, events.EventType.CHANGE);
            events.fire(element, events.EventType.BLUR);
            return;
        }
    }

    if (Array.isArray(values)) {
        values.forEach(typeValue);
    } else {
        typeValue(values);
    }

    if (!opt_persistModifiers) {
        // Release all the modifier keys.
        if ((keyboard as any).isPressed((Keyboard as any).Keys?.SHIFT)) {
            keyboard.releaseKey((Keyboard as any).Keys.SHIFT);
        }
        if ((keyboard as any).isPressed((Keyboard as any).Keys?.CONTROL)) {
            keyboard.releaseKey((Keyboard as any).Keys.CONTROL);
        }
        if ((keyboard as any).isPressed((Keyboard as any).Keys?.ALT)) {
            keyboard.releaseKey((Keyboard as any).Keys.ALT);
        }
        if ((keyboard as any).isPressed((Keyboard as any).Keys?.META)) {
            keyboard.releaseKey((Keyboard as any).Keys.META);
        }
    }
}

/**
 * Submits the form containing the given `element`.
 *
 * @deprecated Click on a submit button or type ENTER in a text box instead.
 */
export function submit(element: Element): void {
    const form = LegacyDevice_.findAncestorForm(element);
    if (!form) {
        throw new WebDriverError(ErrorCode.NO_SUCH_ELEMENT,
            'Element was not in a form, so could not submit.');
    }
    LegacyDevice_.submitForm(element, form);
}

/**
 * Moves the mouse over the given `element` with a virtual mouse.
 */
export function moveMouse(
    element: Element,
    opt_coords?: { x: number; y: number },
    opt_mouse?: Mouse
): void {
    const coords = prepareToInteractWith_(element, opt_coords);
    const mouse = opt_mouse || new Mouse();
    mouse.move(element, coords);
}

/**
 * Clicks on the given `element` with a virtual mouse.
 */
export function click(
    element: Element,
    opt_coords?: { x: number; y: number },
    opt_mouse?: Mouse,
    opt_force?: boolean
): void {
    const coords = prepareToInteractWith_(element, opt_coords);
    const mouse = opt_mouse || new Mouse();
    mouse.move(element, coords);
    mouse.pressButton((Mouse as any).Button.LEFT);
    mouse.releaseButton(opt_force);
}

/**
 * Right-clicks on the given `element` with a virtual mouse.
 */
export function rightClick(
    element: Element,
    opt_coords?: { x: number; y: number },
    opt_mouse?: Mouse
): void {
    const coords = prepareToInteractWith_(element, opt_coords);
    const mouse = opt_mouse || new Mouse();
    mouse.move(element, coords);
    mouse.pressButton((Mouse as any).Button.RIGHT);
    mouse.releaseButton();
}

/**
 * Double-clicks on the given `element` with a virtual mouse.
 */
export function doubleClick(
    element: Element,
    opt_coords?: { x: number; y: number },
    opt_mouse?: Mouse
): void {
    const coords = prepareToInteractWith_(element, opt_coords);
    const mouse = opt_mouse || new Mouse();
    mouse.move(element, coords);
    mouse.pressButton((Mouse as any).Button.LEFT);
    mouse.releaseButton();
    mouse.pressButton((Mouse as any).Button.LEFT);
    mouse.releaseButton();
}

/**
 * Scrolls the mouse wheel on the given `element` with a virtual mouse.
 */
export function scrollMouse(
    element: Element,
    ticks: number,
    opt_coords?: { x: number; y: number },
    opt_mouse?: Mouse
): void {
    const coords = prepareToInteractWith_(element, opt_coords);
    const mouse = opt_mouse || new Mouse();
    mouse.move(element, coords);
    (mouse as any).scroll(ticks);
}

/**
 * Drags the given `element` by (dx, dy) with a virtual mouse.
 */
export function drag(
    element: Element,
    dx: number,
    dy: number,
    opt_steps?: number,
    opt_coords?: { x: number; y: number },
    opt_mouse?: Mouse
): void {
    const coords = prepareToInteractWith_(element, opt_coords);
    const initRect = dom.getClientRect(element);
    const mouse = opt_mouse || new Mouse();
    mouse.move(element, coords);
    mouse.pressButton((Mouse as any).Button.LEFT);
    const steps = opt_steps !== undefined ? opt_steps : 2;
    if (steps < 1) {
        throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
            'There must be at least one step as part of a drag.');
    }
    for (let i = 1; i <= steps; i++) {
        moveTo(Math.floor(i * dx / steps), Math.floor(i * dy / steps));
    }
    mouse.releaseButton();

    function moveTo(x: number, y: number): void {
        const currRect = dom.getClientRect(element);
        const newPos = {
            x: coords.x + initRect.left + x - currRect.left,
            y: coords.y + initRect.top + y - currRect.top
        };
        mouse.move(element, newPos);
    }
}

/**
 * Taps on the given `element` with a virtual touch screen.
 */
export function tap(
    element: Element,
    opt_coords?: { x: number; y: number },
    opt_touchscreen?: Touchscreen
): void {
    const coords = prepareToInteractWith_(element, opt_coords);
    const touchscreen = opt_touchscreen || new Touchscreen();
    touchscreen.move(element, coords);
    touchscreen.press();
    touchscreen.release();
}

/**
 * Swipes the given `element` by (dx, dy) with a virtual touch screen.
 */
export function swipe(
    element: Element,
    dx: number,
    dy: number,
    opt_steps?: number,
    opt_coords?: { x: number; y: number },
    opt_touchscreen?: Touchscreen
): void {
    const coords = prepareToInteractWith_(element, opt_coords);
    const touchscreen = opt_touchscreen || new Touchscreen();
    const initRect = dom.getClientRect(element);
    touchscreen.move(element, coords);
    touchscreen.press();
    const steps = opt_steps !== undefined ? opt_steps : 2;
    if (steps < 1) {
        throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
            'There must be at least one step as part of a swipe.');
    }
    for (let i = 1; i <= steps; i++) {
        moveTo(Math.floor(i * dx / steps), Math.floor(i * dy / steps));
    }
    touchscreen.release();

    function moveTo(x: number, y: number): void {
        const currRect = dom.getClientRect(element);
        const newPos = {
            x: coords.x + initRect.left + x - currRect.left,
            y: coords.y + initRect.top + y - currRect.top
        };
        touchscreen.move(element, newPos);
    }
}

/**
 * Pinches the given `element` by the given distance with a virtual touch screen.
 */
export function pinch(
    element: Element,
    distance: number,
    opt_coords?: { x: number; y: number },
    opt_touchscreen?: Touchscreen
): void {
    if (distance === 0) {
        throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
            'Cannot pinch by a distance of zero.');
    }
    function startSoThatEndsAtMax(offsetVec: Vec2): void {
        if (distance < 0) {
            const magnitude = offsetVec.magnitude();
            offsetVec.scale(magnitude ? (magnitude + distance) / magnitude : 0);
        }
    }
    const halfDistance = distance / 2;
    function scaleByHalfDistance(offsetVec: Vec2): void {
        const magnitude = offsetVec.magnitude();
        offsetVec.scale(magnitude ? (magnitude - halfDistance) / magnitude : 0);
    }
    multiTouchAction_(element, startSoThatEndsAtMax, scaleByHalfDistance,
        opt_coords, opt_touchscreen);
}

/**
 * Rotates the given `element` by the given angle with a virtual touch screen.
 */
export function rotate(
    element: Element,
    angle: number,
    opt_coords?: { x: number; y: number },
    opt_touchscreen?: Touchscreen
): void {
    if (angle === 0) {
        throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
            'Cannot rotate by an angle of zero.');
    }
    function startHalfwayToMax(offsetVec: Vec2): void {
        offsetVec.scale(0.5);
    }
    const halfRadians = Math.PI * (angle / 180) / 2;
    function rotateByHalfAngle(offsetVec: Vec2): void {
        offsetVec.rotate(halfRadians);
    }
    multiTouchAction_(element, startHalfwayToMax, rotateByHalfAngle,
        opt_coords, opt_touchscreen);
}

/**
 * Simple 2D Vector implementation.
 */
class Vec2 {
    constructor(public x: number, public y: number) { }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    scale(factor: number): void {
        this.x *= factor;
        this.y *= factor;
    }

    rotate(angle: number): void {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
    }

    static sum(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    static difference(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }

    subtract(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    static fromCoordinate(coord: { x: number; y: number }): Vec2 {
        return new Vec2(coord.x, coord.y);
    }
}

/**
 * Performs a multi-touch action with two fingers on the given element.
 */
function multiTouchAction_(
    element: Element,
    transformStart: (vec: Vec2) => void,
    transformHalf: (vec: Vec2) => void,
    opt_coords?: { x: number; y: number },
    opt_touchscreen?: Touchscreen
): void {
    const center = prepareToInteractWith_(element, opt_coords);
    const size = getInteractableSize(element);
    const offsetVec = new Vec2(
        Math.min(center.x, size.width - center.x),
        Math.min(center.y, size.height - center.y));

    const touchScreen = opt_touchscreen || new Touchscreen();
    transformStart(offsetVec);
    const start1 = Vec2.sum(center, offsetVec);
    const start2 = Vec2.difference(center, offsetVec);
    touchScreen.move(element, start1, start2);
    touchScreen.press(/* Two Finger Press */ true);

    const initRect = dom.getClientRect(element);
    transformHalf(offsetVec);
    const mid1 = Vec2.sum(center, offsetVec);
    const mid2 = Vec2.difference(center, offsetVec);
    touchScreen.move(element, mid1, mid2);

    const midRect = dom.getClientRect(element);
    const movedVec = Vec2.difference(
        new Vec2(midRect.left, midRect.top),
        new Vec2(initRect.left, initRect.top));
    transformHalf(offsetVec);
    const end1 = Vec2.sum(center, offsetVec).subtract(movedVec);
    const end2 = Vec2.difference(center, offsetVec).subtract(movedVec);
    touchScreen.move(element, end1, end2);
    touchScreen.release();
}

/**
 * Prepares to interact with the given `element`.
 */
function prepareToInteractWith_(
    element: Element,
    opt_coords?: { x: number; y: number }
): Vec2 {
    checkShown_(element);
    scrollIntoView(element, opt_coords);

    if (opt_coords) {
        return new Vec2(opt_coords.x, opt_coords.y);
    } else {
        const size = getInteractableSize(element);
        return new Vec2(size.width / 2, size.height / 2);
    }
}

/**
 * Returns the interactable size of an element.
 */
function getInteractableSize(elem: Element): { width: number; height: number } {
    const style = window.getComputedStyle(elem);
    const width = parseFloat(style.width) || 0;
    const height = parseFloat(style.height) || 0;

    if ((width > 0 && height > 0) || !(elem as HTMLElement).offsetParent) {
        return { width, height };
    }
    return getInteractableSize((elem as HTMLElement).offsetParent!);
}

/**
 * A Device that allows access to protected members of the Device superclass.
 */
class LegacyDevice extends Device {
    private static instance_: LegacyDevice;

    static getInstance(): LegacyDevice {
        if (!LegacyDevice.instance_) {
            LegacyDevice.instance_ = new LegacyDevice();
        }
        return LegacyDevice.instance_;
    }

    static focusOnElement(element: Element): boolean {
        const instance = LegacyDevice.getInstance();
        instance.setElement(element);
        return instance.focusOnElement();
    }

    static submitForm(element: Element, form: HTMLFormElement): void {
        const instance = LegacyDevice.getInstance();
        instance.setElement(element);
        instance.submitForm(form);
    }

    static findAncestorForm(element: Element): HTMLFormElement | null {
        return (Device.findAncestorForm(element) as any as HTMLFormElement | null);
    }
}

const LegacyDevice_ = LegacyDevice;

/**
 * Scrolls the given `element` into the current viewport.
 */
export function scrollIntoView(
    element: Element,
    opt_region?: { x: number; y: number } | any
): boolean {
    // If the element is already in view, return true; if hidden, return false.
    const overflow = dom.getOverflowState(element, opt_region);
    if (overflow !== dom.OverflowState.SCROLL) {
        return overflow === dom.OverflowState.NONE;
    }

    // Some elements may not have a scrollIntoView function.
    if ((element as any).scrollIntoView) {
        (element as any).scrollIntoView();
        if (dom.OverflowState.NONE === dom.getOverflowState(element, opt_region)) {
            return true;
        }
    }

    // Scroll manually if needed.
    const region = dom.getClientRegion(element, opt_region);
    for (let container = dom.getParentElement(element);
        container;
        container = dom.getParentElement(container)) {
        scrollClientRegionIntoContainerView(container);
    }
    return dom.OverflowState.NONE === dom.getOverflowState(element, opt_region);

    function scrollClientRegionIntoContainerView(container: Element): void {
        const containerRect = dom.getClientRect(container);
        const style = window.getComputedStyle(container);
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        const borderTop = parseFloat(style.borderTopWidth) || 0;

        // Relative position of the region to the container's content box.
        const relX = region.left - containerRect.left - borderLeft;
        const relY = region.top - containerRect.top - borderTop;

        // How much the region can move in the container.
        const spaceX = (container as HTMLElement).clientWidth + region.left - region.right;
        const spaceY = (container as HTMLElement).clientHeight + region.top - region.bottom;

        // Scroll the element into view of the container.
        (container as HTMLElement).scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
        (container as HTMLElement).scrollTop += Math.min(relY, Math.max(relY - spaceY, 0));
    }
}
