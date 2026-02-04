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
 * Utilities for interacting with input elements.
 * Provides functions for keyboard and mouse input simulation.
 */

import * as action from '../../atoms-ts/src/action';
import * as dom from '../../atoms-ts/src/dom';
import * as element from './element';
import { Keyboard, KeyboardState } from '../../atoms-ts/src/keyboard';
import { Mouse, MouseState } from '../../atoms-ts/src/mouse';

/**
 * Sends keyboard input to a particular element.
 *
 * @param elem The element to send input to, or null to use the active element.
 * @param keys The keys to type.
 * @param optState Optional predefined keyboard state.
 * @param optPersistModifiers Whether modifier keys should persist.
 * @returns The keyboard state.
 */
export function sendKeys(
    elem: Element | null,
    keys: string[],
    optState?: KeyboardState,
    optPersistModifiers?: boolean
): KeyboardState {
    let targetElement = elem;
    if (!targetElement) {
        const activeEl = dom.getActiveElement(document);
        if (!activeEl) {
            throw Error('No element to send keys to');
        }
        targetElement = activeEl;
    }

    const keyboard = new Keyboard(optState);
    element.type(targetElement, keys, keyboard, optPersistModifiers);

    return keyboard.getState();
}

/**
 * Clicks on an element.
 *
 * @param elem The element to click.
 * @param optState Optional predefined mouse state.
 * @returns The mouse state.
 */
export function click(elem: Element | null, optState?: MouseState): MouseState {
    const mouse = new Mouse(optState);
    let targetElement: Element | null = elem;
    if (!targetElement) {
        const state = mouse.getState();
        targetElement = state.element || null;
    }
    if (!targetElement) {
        throw Error('No element to click on');
    }

    action.click(targetElement);
    return mouse.getState();
}

/**
 * Moves the mouse to a specific element and/or coordinate location.
 *
 * @param elem The element to move the mouse to.
 * @param xOffset The x coordinate offset.
 * @param yOffset The y coordinate offset.
 * @param optState Optional predefined mouse state.
 * @returns The mouse state.
 */
export function mouseMove(
    elem: Element | null,
    xOffset: number | null,
    yOffset: number | null,
    optState?: MouseState
): MouseState {
    const mouse = new Mouse(optState);
    let target: Element | null = elem;
    if (!target) {
        const state = mouse.getState();
        target = state.element || null;
    }

    if (target) {
        const xOff = xOffset || 0;
        const yOff = yOffset || 0;
        action.scrollIntoView(target, { x: xOff, y: yOff });
        action.moveMouse(target, { x: xOff, y: yOff });
    }

    return mouse.getState();
}

/**
 * Presses the primary mouse button at the current location.
 *
 * @param optState Optional predefined mouse state.
 * @returns The mouse state.
 */
export function mouseButtonDown(optState?: MouseState): MouseState {
    const mouse = new Mouse(optState);
    const target = mouse.getState().element;
    if (target) {
        action.click(target);
    }
    return mouse.getState();
}

/**
 * Releases the primary mouse button at the current location.
 *
 * @param optState Optional predefined mouse state.
 * @returns The mouse state.
 */
export function mouseButtonUp(optState?: MouseState): MouseState {
    const mouse = new Mouse(optState);
    return mouse.getState();
}

/**
 * Double-clicks the primary mouse button at the current location.
 *
 * @param optState Optional predefined mouse state.
 * @returns The mouse state.
 */
export function doubleClick(optState?: MouseState): MouseState {
    const mouse = new Mouse(optState);
    const target = mouse.getState().element;
    if (target) {
        action.doubleClick(target);
    }
    return mouse.getState();
}

/**
 * Right-clicks the mouse button at the current location.
 *
 * @param optState Optional predefined mouse state.
 * @returns The mouse state.
 * @deprecated Use mouseClick instead.
 */
export function rightClick(optState?: MouseState): MouseState {
    const mouse = new Mouse(optState);
    const target = mouse.getState().element;
    if (target) {
        action.rightClick(target);
    }
    return mouse.getState();
}

/**
 * Executes a mousedown/up with the given button at the current mouse location.
 *
 * @param button The button to press (0=left, 1=middle, 2=right).
 * @param optState Optional predefined mouse state.
 * @returns The mouse state.
 */
export function mouseClick(button: number, optState?: MouseState): MouseState {
    const mouse = new Mouse(optState);
    const target = mouse.getState().element;
    if (target) {
        if (button === 2) {
            action.rightClick(target);
        } else {
            action.click(target);
        }
    }
    return mouse.getState();
}
