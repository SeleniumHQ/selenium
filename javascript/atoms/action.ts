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
 * @fileoverview Atoms for simulating user actions against the DOM.
 * The bot.action namespace is required since these atoms would otherwise form a
 * circular dependency between bot.dom and bot.events.
 */

import { BotError, ErrorCode } from './error';
import { getDocument } from './bot';
import { Device, findAncestorForm } from './device';
import { Keyboard, Key, Keys, MODIFIERS } from './keyboard';
import { Mouse, Button } from './mouse';
import { Touchscreen } from './touchscreen';
import {
  isShown,
  isInteractable,
  isEditable,
  isElement,
  isContentEditable,
  isInputType,
  getActiveElement,
  getOverflowState,
  getClientRect,
  getClientRegion,
  getParentElement,
  OverflowState,
  Rect,
} from './dom';
import { fire, EventType } from './events';
import { GECKO, IE } from './userAgent';

// Browser detection from userAgent
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_MOBILE = /Mobile/.test(userAgent);
const IS_WEBKIT = /AppleWebKit/.test(userAgent);
const IS_SAFARI = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

// ============================================================================
// Coordinate and Size types
// ============================================================================

/**
 * A 2D coordinate.
 */
export interface Coordinate {
  x: number;
  y: number;
}

/**
 * A 2D size.
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * A 2D vector class with math operations.
 */
export class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Create a Vec2 from a Coordinate.
   */
  static fromCoordinate(coord: Coordinate): Vec2 {
    return new Vec2(coord.x, coord.y);
  }

  /**
   * Returns the sum of two vectors.
   */
  static sum(a: Vec2, b: Vec2): Vec2 {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  /**
   * Returns the difference of two vectors (a - b).
   */
  static difference(a: Vec2, b: Vec2): Vec2 {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  /**
   * Returns the magnitude of the vector.
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Scales the vector in place.
   */
  scale(factor: number): Vec2 {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  /**
   * Rotates the vector in place by the given angle in radians.
   */
  rotate(radians: number): Vec2 {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
    return this;
  }

  /**
   * Subtracts another vector from this one in place.
   */
  subtract(other: Vec2): Vec2 {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }
}

// ============================================================================
// Style utilities (replacing goog.style)
// ============================================================================

/**
 * Gets the size of an element.
 */
function getSize(elem: Element): Size {
  const rect = elem.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Gets the border box of an element.
 */
function getBorderBox(elem: Element): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const style = window.getComputedStyle(elem);
  return {
    top: parseFloat(style.borderTopWidth) || 0,
    right: parseFloat(style.borderRightWidth) || 0,
    bottom: parseFloat(style.borderBottomWidth) || 0,
    left: parseFloat(style.borderLeftWidth) || 0,
  };
}

// ============================================================================
// Private helpers
// ============================================================================

/**
 * Throws an exception if an element is not shown to the user, ignoring its
 * opacity.
 */
function checkShown_(element: Element): void {
  if (!isShown(element, true)) {
    throw new BotError(
      ErrorCode.ELEMENT_NOT_VISIBLE,
      'Element is not currently visible and may not be manipulated'
    );
  }
}

/**
 * Throws an exception if the given element cannot be interacted with.
 */
function checkInteractable_(element: Element): void {
  if (!isInteractable(element)) {
    throw new BotError(
      ErrorCode.INVALID_ELEMENT_STATE,
      'Element is not currently interactable and may not be manipulated'
    );
  }
}

// ============================================================================
// LegacyDevice_ - A singleton Device for static helper methods
// ============================================================================

let legacyDeviceInstance: Device | null = null;

/**
 * Gets the singleton LegacyDevice instance.
 */
function getLegacyDeviceInstance(): Device {
  if (!legacyDeviceInstance) {
    legacyDeviceInstance = new Device();
  }
  return legacyDeviceInstance;
}

/**
 * Focuses on the given element. See Device.focusOnElement.
 */
export function legacyDeviceFocusOnElement(element: Element): boolean {
  const instance = getLegacyDeviceInstance();
  instance.setElement(element);
  return instance.focusOnElement();
}

/**
 * Submit the form for the element. See Device.submitForm.
 */
export function legacyDeviceSubmitForm(
  element: Element,
  form: HTMLFormElement
): void {
  const instance = getLegacyDeviceInstance();
  instance.setElement(element);
  instance.submitForm(form);
}

/**
 * Find FORM element that is an ancestor of the passed in element.
 */
export function legacyDeviceFindAncestorForm(
  element: Element
): HTMLFormElement | null {
  return findAncestorForm(element);
}

// ============================================================================
// Public action functions
// ============================================================================

/**
 * Clears the given element if it is an editable text field.
 */
export function clear(element: Element): void {
  checkInteractable_(element);
  if (!isEditable(element)) {
    throw new BotError(
      ErrorCode.INVALID_ELEMENT_STATE,
      'Element must be user-editable in order to clear it.'
    );
  }

  const inputElement = element as HTMLInputElement;
  if (inputElement.value) {
    legacyDeviceFocusOnElement(element);
    if (IE && isInputType(element, 'range')) {
      const min = inputElement.min ? parseFloat(inputElement.min) : 0;
      const max = inputElement.max ? parseFloat(inputElement.max) : 100;
      inputElement.value = String(max < min ? min : min + (max - min) / 2);
    } else {
      inputElement.value = '';
    }
    fire(element, EventType.CHANGE);
    if (IE) {
      fire(element, EventType.BLUR);
    }
    const body = getDocument().body;
    if (body) {
      legacyDeviceFocusOnElement(body);
    } else {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Cannot unfocus element after clearing.'
      );
    }
  } else if (
    isElement(element, 'INPUT') &&
    element.getAttribute('type')?.toLowerCase() === 'number'
  ) {
    legacyDeviceFocusOnElement(element);
    inputElement.value = '';
  } else if (isContentEditable(element)) {
    legacyDeviceFocusOnElement(element);
    if (GECKO) {
      (element as HTMLElement).textContent = ' ';
    } else {
      (element as HTMLElement).textContent = '';
    }
    const body = getDocument().body;
    if (body) {
      legacyDeviceFocusOnElement(body);
    } else {
      throw new BotError(
        ErrorCode.UNKNOWN_ERROR,
        'Cannot unfocus element after clearing.'
      );
    }
  }
}

/**
 * Focuses on the given element if it is not already the active element.
 */
export function focusOnElement(element: Element): void {
  checkInteractable_(element);
  legacyDeviceFocusOnElement(element);
}

/**
 * Types keys on the given element with a virtual keyboard.
 */
export function type(
  element: Element,
  values: string | Key | (string | Key)[],
  opt_keyboard?: Keyboard,
  opt_persistModifiers?: boolean
): void {
  if (element !== getActiveElement(element)) {
    checkInteractable_(element);
    scrollIntoView(element);
  }

  const keyboard = opt_keyboard || new Keyboard();
  keyboard.moveCursor(element);

  function typeValue(value: string | Key): void {
    if (typeof value === 'string') {
      value.split('').forEach((ch) => {
        const keyShiftPair = Key.fromChar(ch);
        const shiftIsPressed = keyboard.isPressed(Keys.SHIFT);
        if (keyShiftPair.shift && !shiftIsPressed) {
          keyboard.pressKey(Keys.SHIFT);
        }
        keyboard.pressKey(keyShiftPair.key);
        keyboard.releaseKey(keyShiftPair.key);
        if (keyShiftPair.shift && !shiftIsPressed) {
          keyboard.releaseKey(Keys.SHIFT);
        }
      });
    } else if (MODIFIERS.includes(value)) {
      if (keyboard.isPressed(value)) {
        keyboard.releaseKey(value);
      } else {
        keyboard.pressKey(value);
      }
    } else {
      keyboard.pressKey(value);
      keyboard.releaseKey(value);
    }
  }

  const inputElement = element as HTMLInputElement;
  if (
    !(IS_SAFARI && !IS_MOBILE) &&
    IS_WEBKIT &&
    inputElement.type === 'date'
  ) {
    const val = Array.isArray(values) ? values.join('') : String(values);
    const datePattern = /\d{4}-\d{2}-\d{2}/;
    if (val.match(datePattern)) {
      if (IS_MOBILE && IS_SAFARI) {
        fire(element, EventType.TOUCHSTART);
        fire(element, EventType.TOUCHEND);
      }
      fire(element, EventType.FOCUS);
      inputElement.value = val.match(datePattern)![0];
      fire(element, EventType.CHANGE);
      fire(element, EventType.BLUR);
      return;
    }
  }

  if (Array.isArray(values)) {
    values.forEach(typeValue);
  } else {
    typeValue(values);
  }

  if (!opt_persistModifiers) {
    MODIFIERS.forEach((key) => {
      if (keyboard.isPressed(key)) {
        keyboard.releaseKey(key);
      }
    });
  }
}

/**
 * Submits the form containing the given element.
 * @deprecated Click on a submit button or type ENTER in a text box instead.
 */
export function submit(element: Element): void {
  const form = legacyDeviceFindAncestorForm(element);
  if (!form) {
    throw new BotError(
      ErrorCode.NO_SUCH_ELEMENT,
      'Element was not in a form, so could not submit.'
    );
  }
  legacyDeviceSubmitForm(element, form);
}

/**
 * Moves the mouse over the given element with a virtual mouse.
 */
export function moveMouse(
  element: Element,
  opt_coords?: Coordinate,
  opt_mouse?: Mouse
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const mouse = opt_mouse || new Mouse();
  mouse.move(element, coords);
}

/**
 * Clicks on the given element with a virtual mouse.
 */
export function click(
  element: Element,
  opt_coords?: Coordinate,
  opt_mouse?: Mouse,
  opt_force?: boolean
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const mouse = opt_mouse || new Mouse();
  mouse.move(element, coords);
  mouse.pressButton(Button.LEFT);
  mouse.releaseButton(opt_force);
}

/**
 * Right-clicks on the given element with a virtual mouse.
 */
export function rightClick(
  element: Element,
  opt_coords?: Coordinate,
  opt_mouse?: Mouse
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const mouse = opt_mouse || new Mouse();
  mouse.move(element, coords);
  mouse.pressButton(Button.RIGHT);
  mouse.releaseButton();
}

/**
 * Double-clicks on the given element with a virtual mouse.
 */
export function doubleClick(
  element: Element,
  opt_coords?: Coordinate,
  opt_mouse?: Mouse
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const mouse = opt_mouse || new Mouse();
  mouse.move(element, coords);
  mouse.pressButton(Button.LEFT);
  mouse.releaseButton();
  mouse.pressButton(Button.LEFT);
  mouse.releaseButton();
}

/**
 * Double-clicks on the given element with a virtual mouse (variant 2).
 */
export function doubleClick2(
  element: Element,
  opt_coords?: Coordinate,
  opt_mouse?: Mouse
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const mouse = opt_mouse || new Mouse();
  mouse.move(element, coords);
  mouse.pressButton(Button.LEFT, 2);
  mouse.releaseButton(true, 2);
}

/**
 * Scrolls the mouse wheel on the given element with a virtual mouse.
 */
export function scrollMouse(
  element: Element,
  ticks: number,
  opt_coords?: Coordinate,
  opt_mouse?: Mouse
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const mouse = opt_mouse || new Mouse();
  mouse.move(element, coords);
  mouse.scroll(ticks);
}

/**
 * Drags the given element by (dx, dy) with a virtual mouse.
 */
export function drag(
  element: Element,
  dx: number,
  dy: number,
  opt_steps?: number,
  opt_coords?: Coordinate,
  opt_mouse?: Mouse
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const initRect = getClientRect(element);
  const mouse = opt_mouse || new Mouse();
  mouse.move(element, coords);
  mouse.pressButton(Button.LEFT);
  const steps = opt_steps !== undefined ? opt_steps : 2;
  if (steps < 1) {
    throw new BotError(
      ErrorCode.UNKNOWN_ERROR,
      'There must be at least one step as part of a drag.'
    );
  }
  for (let i = 1; i <= steps; i++) {
    moveTo(Math.floor((i * dx) / steps), Math.floor((i * dy) / steps));
  }
  mouse.releaseButton();

  function moveTo(x: number, y: number): void {
    const currRect = getClientRect(element);
    const newPos: Coordinate = {
      x: coords.x + initRect.left + x - currRect.left,
      y: coords.y + initRect.top + y - currRect.top,
    };
    mouse.move(element, newPos);
  }
}

/**
 * Taps on the given element with a virtual touch screen.
 */
export function tap(
  element: Element,
  opt_coords?: Coordinate,
  opt_touchscreen?: Touchscreen
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const touchscreen = opt_touchscreen || new Touchscreen();
  touchscreen.move(element, coords);
  touchscreen.press();
  touchscreen.release();
}

/**
 * Swipes the given element by (dx, dy) with a virtual touch screen.
 */
export function swipe(
  element: Element,
  dx: number,
  dy: number,
  opt_steps?: number,
  opt_coords?: Coordinate,
  opt_touchscreen?: Touchscreen
): void {
  const coords = prepareToInteractWith_(element, opt_coords);
  const touchscreen = opt_touchscreen || new Touchscreen();
  const initRect = getClientRect(element);
  touchscreen.move(element, coords);
  touchscreen.press();
  const steps = opt_steps !== undefined ? opt_steps : 2;
  if (steps < 1) {
    throw new BotError(
      ErrorCode.UNKNOWN_ERROR,
      'There must be at least one step as part of a swipe.'
    );
  }
  for (let i = 1; i <= steps; i++) {
    moveTo(Math.floor((i * dx) / steps), Math.floor((i * dy) / steps));
  }
  touchscreen.release();

  function moveTo(x: number, y: number): void {
    const currRect = getClientRect(element);
    const newPos: Coordinate = {
      x: coords.x + initRect.left + x - currRect.left,
      y: coords.y + initRect.top + y - currRect.top,
    };
    touchscreen.move(element, newPos);
  }
}

/**
 * Pinches the given element by the given distance with a virtual touch screen.
 */
export function pinch(
  element: Element,
  distance: number,
  opt_coords?: Coordinate,
  opt_touchscreen?: Touchscreen
): void {
  if (distance === 0) {
    throw new BotError(
      ErrorCode.UNKNOWN_ERROR,
      'Cannot pinch by a distance of zero.'
    );
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
  multiTouchAction_(
    element,
    startSoThatEndsAtMax,
    scaleByHalfDistance,
    opt_coords,
    opt_touchscreen
  );
}

/**
 * Rotates the given element by the given angle with a virtual touch screen.
 */
export function rotate(
  element: Element,
  angle: number,
  opt_coords?: Coordinate,
  opt_touchscreen?: Touchscreen
): void {
  if (angle === 0) {
    throw new BotError(
      ErrorCode.UNKNOWN_ERROR,
      'Cannot rotate by an angle of zero.'
    );
  }
  function startHalfwayToMax(offsetVec: Vec2): void {
    offsetVec.scale(0.5);
  }
  const halfRadians = (Math.PI * (angle / 180)) / 2;
  function rotateByHalfAngle(offsetVec: Vec2): void {
    offsetVec.rotate(halfRadians);
  }
  multiTouchAction_(
    element,
    startHalfwayToMax,
    rotateByHalfAngle,
    opt_coords,
    opt_touchscreen
  );
}

/**
 * Performs a multi-touch action with two fingers on the given element.
 */
function multiTouchAction_(
  element: Element,
  transformStart: (offsetVec: Vec2) => void,
  transformHalf: (offsetVec: Vec2) => void,
  opt_coords?: Coordinate,
  opt_touchscreen?: Touchscreen
): void {
  const center = prepareToInteractWith_(element, opt_coords);
  const size = getInteractableSize(element);
  const offsetVec = new Vec2(
    Math.min(center.x, size.width - center.x),
    Math.min(center.y, size.height - center.y)
  );

  const touchScreen = opt_touchscreen || new Touchscreen();
  transformStart(offsetVec);
  const start1 = Vec2.sum(center, offsetVec);
  const start2 = Vec2.difference(center, offsetVec);
  touchScreen.move(element, start1, start2);
  touchScreen.press(true);

  const initRect = getClientRect(element);
  transformHalf(offsetVec);
  const mid1 = Vec2.sum(center, offsetVec);
  const mid2 = Vec2.difference(center, offsetVec);
  touchScreen.move(element, mid1, mid2);

  const midRect = getClientRect(element);
  const movedVec = Vec2.difference(
    new Vec2(midRect.left, midRect.top),
    new Vec2(initRect.left, initRect.top)
  );
  transformHalf(offsetVec);
  const end1 = Vec2.sum(center, offsetVec).subtract(movedVec);
  const end2 = Vec2.difference(center, offsetVec).subtract(movedVec);
  touchScreen.move(element, end1, end2);
  touchScreen.release();
}

/**
 * Prepares to interact with the given element.
 */
function prepareToInteractWith_(
  element: Element,
  opt_coords?: Coordinate
): Vec2 {
  checkShown_(element);
  scrollIntoView(element, opt_coords);

  if (opt_coords) {
    return Vec2.fromCoordinate(opt_coords);
  } else {
    const size = getInteractableSize(element);
    return new Vec2(size.width / 2, size.height / 2);
  }
}

/**
 * Returns the interactable size of an element.
 */
export function getInteractableSize(elem: Element): Size {
  const size = getSize(elem);
  const htmlElem = elem as HTMLElement;
  if ((size.width > 0 && size.height > 0) || !htmlElem.offsetParent) {
    return size;
  }
  return getInteractableSize(htmlElem.offsetParent as Element);
}

/**
 * Scrolls the given element into the current viewport.
 */
export function scrollIntoView(
  element: Element,
  opt_region?: Coordinate | Rect
): boolean {
  const overflow = getOverflowState(element, opt_region);
  if (overflow !== OverflowState.SCROLL) {
    return overflow === OverflowState.NONE;
  }

  if (element.scrollIntoView) {
    element.scrollIntoView();
    if (getOverflowState(element, opt_region) === OverflowState.NONE) {
      return true;
    }
  }

  const region = getClientRegion(element, opt_region);
  let container = getParentElement(element);
  while (container) {
    scrollClientRegionIntoContainerView(container);
    container = getParentElement(container);
  }
  return getOverflowState(element, opt_region) === OverflowState.NONE;

  function scrollClientRegionIntoContainerView(container: Element): void {
    const containerRect = getClientRect(container);
    const containerBorder = getBorderBox(container);

    const relX = region.left - containerRect.left - containerBorder.left;
    const relY = region.top - containerRect.top - containerBorder.top;

    const spaceX = container.clientWidth + region.left - region.right;
    const spaceY = container.clientHeight + region.top - region.bottom;

    container.scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    container.scrollTop += Math.min(relY, Math.max(relY - spaceY, 0));
  }
}


