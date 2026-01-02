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
 * @fileoverview The file contains the base class for input devices such as
 * the keyboard, mouse, and touchscreen.
 */

import { BotError, ErrorCode } from './error';
import {
  isElement,
  isSelectable,
  isSelected,
  isInteractable,
  isFocusable,
  getActiveElement,
  getClientRect,
} from './dom';
import {
  fire,
  EventType,
  EventFactory,
  MouseArgs,
  KeyboardArgs,
  TouchArgs,
  MSPointerArgs,
  TouchInfo,
} from './events';
import {
  IE,
  GECKO,
  WEBKIT,
  isEngineVersion,
  isProductVersion,
  WEBEXTENSION,
} from './userAgent';
import { getDocument } from './bot';

// Browser detection for inline checks
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_IE = /MSIE|Trident/.test(userAgent);
const IS_CHROME = /Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent);
const IS_ANDROID = /Android/.test(userAgent);

// ============================================================================
// Coordinate type
// ============================================================================

/**
 * Simple Coordinate type to replace goog.math.Coordinate
 */
export interface Coordinate {
  x: number;
  y: number;
}

// ============================================================================
// Modifier State
// ============================================================================

/**
 * An enum for the various modifier keys (keycode-independent).
 */
export enum Modifier {
  SHIFT = 0x1,
  CONTROL = 0x2,
  ALT = 0x4,
  META = 0x8,
}

/**
 * Stores the state of modifier keys.
 */
export class ModifiersState {
  private pressedModifiers_ = 0;

  /**
   * Checks whether a specific modifier is pressed.
   */
  isPressed(modifier: Modifier): boolean {
    return (this.pressedModifiers_ & modifier) !== 0;
  }

  /**
   * Sets the state of a given modifier.
   */
  setPressed(modifier: Modifier, isPressed: boolean): void {
    if (isPressed) {
      this.pressedModifiers_ = this.pressedModifiers_ | modifier;
    } else {
      this.pressedModifiers_ = this.pressedModifiers_ & ~modifier;
    }
  }

  /**
   * @return State of the Shift key.
   */
  isShiftPressed(): boolean {
    return this.isPressed(Modifier.SHIFT);
  }

  /**
   * @return State of the Control key.
   */
  isControlPressed(): boolean {
    return this.isPressed(Modifier.CONTROL);
  }

  /**
   * @return State of the Alt key.
   */
  isAltPressed(): boolean {
    return this.isPressed(Modifier.ALT);
  }

  /**
   * @return State of the Meta key.
   */
  isMetaPressed(): boolean {
    return this.isPressed(Modifier.META);
  }
}

// ============================================================================
// Event Emitter
// ============================================================================

/**
 * Fires events. A driver can replace it with a custom implementation.
 */
export class EventEmitter {
  /**
   * Fires an HTML event given the state of the device.
   */
  fireHtmlEvent(target: Element, type: EventFactory): boolean {
    return fire(target, type);
  }

  /**
   * Fires a keyboard event given the state of the device and the given arguments.
   */
  fireKeyboardEvent(
    target: Element,
    type: EventFactory,
    args: KeyboardArgs
  ): boolean {
    return fire(target, type, args);
  }

  /**
   * Fires a mouse event given the state of the device and the given arguments.
   */
  fireMouseEvent(
    target: Element,
    type: EventFactory,
    args: MouseArgs
  ): boolean {
    return fire(target, type, args);
  }

  /**
   * Fires a touch event given the state of the device and the given arguments.
   */
  fireTouchEvent(
    target: Element,
    type: EventFactory,
    args: TouchArgs
  ): boolean {
    return fire(target, type, args);
  }

  /**
   * Fires an MSPointer event given the state of the device and the given arguments.
   */
  fireMSPointerEvent(
    target: Element,
    type: EventFactory,
    args: MSPointerArgs
  ): boolean {
    return fire(target, type, args);
  }
}

// ============================================================================
// Pointer Element Map (static)
// ============================================================================

/**
 * The pointer id used for MSPointer events initiated through a mouse device.
 */
export const MOUSE_MS_POINTER_ID = 1;

/**
 * A map of pointer id to Elements.
 */
let pointerElementMap_: Record<number, Element> = {};

/**
 * Gets the element associated with a pointer id.
 */
export function getPointerElement(pointerId: number): Element | undefined {
  return pointerElementMap_[pointerId];
}

/**
 * Sets the element associated with a pointer id.
 */
export function setPointerElement(pointerId: number, element: Element): void {
  pointerElementMap_[pointerId] = element;
}

/**
 * Clear the pointer map.
 */
export function clearPointerMap(): void {
  pointerElementMap_ = {};
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Regular expression for splitting up a URL into components.
 */
const URL_REGEXP_ = new RegExp(
  '^' +
    '([^:/?#.]+:)?' + // protocol
    '(?://([^/]*))?' + // host
    '([^?#]+)?' + // pathname
    '(\\?[^#]*)?' + // search
    '(#.*)?' + // hash
    '$'
);

/**
 * Resolves a potentially relative URL against a base location.
 */
function resolveUrl_(base: Location, rel: string): string {
  const m = rel.match(URL_REGEXP_);
  if (!m) {
    return '';
  }
  const target = {
    protocol: m[1] || '',
    host: m[2] || '',
    pathname: m[3] || '',
    search: m[4] || '',
    hash: m[5] || '',
  };

  if (!target.protocol) {
    target.protocol = base.protocol;
    if (!target.host) {
      target.host = base.host;
      if (!target.pathname) {
        target.pathname = base.pathname;
        target.search = target.search || base.search;
      } else if (target.pathname.charAt(0) !== '/') {
        const lastSlashIndex = base.pathname.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
          const directory = base.pathname.substr(0, lastSlashIndex + 1);
          target.pathname = directory + target.pathname;
        }
      }
    }
  }

  return (
    target.protocol +
    '//' +
    target.host +
    target.pathname +
    target.search +
    target.hash
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Whether links must be manually followed when clicking (because firing click
 * events doesn't follow them).
 */
const ALWAYS_FOLLOWS_LINKS_ON_CLICK_ = WEBKIT;

/**
 * Gets the window for a document.
 */
function getWindow_(doc: Document): Window {
  return doc.defaultView || (doc as unknown as { parentWindow: Window }).parentWindow;
}

/**
 * Gets the owner document of a node.
 */
function getOwnerDocument_(node: Node): Document {
  return node.ownerDocument || (node as unknown as Document);
}

/**
 * Gets an ancestor matching the predicate.
 */
function getAncestor_(
  node: Node,
  predicate: (n: Node) => boolean,
  includeNode?: boolean
): Node | null {
  let current: Node | null = includeNode ? node : node.parentNode;
  while (current) {
    if (predicate(current)) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

/**
 * Gets the document scroll offset.
 */
function getDocumentScroll_(doc: Document): Coordinate {
  const win = getWindow_(doc);
  const docEl = doc.documentElement;
  const body = doc.body;
  return {
    x:
      win.pageXOffset ??
      (docEl?.scrollLeft ?? 0) ??
      (body?.scrollLeft ?? 0),
    y:
      win.pageYOffset ??
      (docEl?.scrollTop ?? 0) ??
      (body?.scrollTop ?? 0),
  };
}

// ============================================================================
// Device Class
// ============================================================================

/**
 * A Device class that provides common functionality for input devices.
 */
export class Device {
  /**
   * Element being interacted with.
   */
  protected element_: Element;

  /**
   * If the element is an option, this is its parent select element.
   */
  protected select_: HTMLSelectElement | null = null;

  /**
   * State of modifier keys for this device.
   */
  protected modifiersState: ModifiersState;

  /**
   * Event emitter for this device.
   */
  protected eventEmitter: EventEmitter;

  constructor(
    opt_modifiersState?: ModifiersState,
    opt_eventEmitter?: EventEmitter
  ) {
    this.element_ = getDocument().documentElement;
    this.modifiersState = opt_modifiersState || new ModifiersState();
    this.eventEmitter = opt_eventEmitter || new EventEmitter();

    // If there is an active element, make that the current element instead.
    const activeElement = getActiveElement(this.element_);
    if (activeElement) {
      this.setElement(activeElement);
    }
  }

  /**
   * Returns the element with which the device is interacting.
   */
  getElement(): Element {
    return this.element_;
  }

  /**
   * Sets the element with which the device is interacting.
   */
  setElement(element: Element): void {
    this.element_ = element;
    if (isElement(element, 'OPTION')) {
      this.select_ = getAncestor_(
        element,
        (node) => isElement(node, 'SELECT'),
        false
      ) as HTMLSelectElement | null;
    } else {
      this.select_ = null;
    }
  }

  /**
   * Fires an HTML event given the state of the device.
   */
  protected fireHtmlEvent(type: EventFactory): boolean {
    return this.eventEmitter.fireHtmlEvent(this.element_, type);
  }

  /**
   * Fires a keyboard event given the state of the device and the given arguments.
   */
  protected fireKeyboardEvent(type: EventFactory, args: KeyboardArgs): boolean {
    return this.eventEmitter.fireKeyboardEvent(this.element_, type, args);
  }

  /**
   * Fires a mouse event given the state of the device and the given arguments.
   */
  fireMouseEvent(
    type: EventFactory,
    coord: Coordinate,
    button: number,
    opt_related?: Element | null,
    opt_wheelDelta?: number | null,
    opt_force?: boolean,
    opt_pointerId?: number | null,
    opt_count?: number | null
  ): boolean {
    if (!opt_force && !isInteractable(this.element_)) {
      return false;
    }

    if (
      opt_related &&
      !(
        EventType.MOUSEOVER === type ||
        EventType.MOUSEOUT === type
      )
    ) {
      throw new BotError(
        ErrorCode.INVALID_ELEMENT_STATE,
        'Event type does not allow related target: ' + type
      );
    }

    const args: MouseArgs = {
      clientX: coord.x,
      clientY: coord.y,
      button: button,
      altKey: this.modifiersState.isAltPressed(),
      ctrlKey: this.modifiersState.isControlPressed(),
      shiftKey: this.modifiersState.isShiftPressed(),
      metaKey: this.modifiersState.isMetaPressed(),
      wheelDelta: opt_wheelDelta || 0,
      relatedTarget: opt_related || null,
      count: opt_count || 1,
    };

    const pointerId = opt_pointerId ?? MOUSE_MS_POINTER_ID;

    let target: Element | null = this.element_;
    // On click and mousedown events, captured pointers are ignored and the
    // event always fires on the original element.
    if (
      type !== EventType.CLICK &&
      type !== EventType.MOUSEDOWN &&
      pointerId in pointerElementMap_
    ) {
      target = pointerElementMap_[pointerId];
    } else if (this.select_) {
      target = this.getTargetOfOptionMouseEvent_(type);
    }
    return target ? this.eventEmitter.fireMouseEvent(target, type, args) : true;
  }

  /**
   * Fires a touch event given the state of the device and the given arguments.
   */
  protected fireTouchEvent(
    type: EventFactory,
    id: number,
    coord: Coordinate,
    opt_id2?: number,
    opt_coord2?: Coordinate
  ): boolean {
    const pageOffset = getDocumentScroll_(getOwnerDocument_(this.element_));

    const touches: TouchInfo[] = [];
    const targetTouches: TouchInfo[] = [];
    const changedTouches: TouchInfo[] = [];

    function addTouch(identifier: number, coords: Coordinate) {
      const touch: TouchInfo = {
        identifier: identifier,
        screenX: coords.x,
        screenY: coords.y,
        clientX: coords.x,
        clientY: coords.y,
        pageX: coords.x + pageOffset.x,
        pageY: coords.y + pageOffset.y,
      };

      changedTouches.push(touch);
      if (type === EventType.TOUCHSTART || type === EventType.TOUCHMOVE) {
        touches.push(touch);
        targetTouches.push(touch);
      }
    }

    addTouch(id, coord);
    if (opt_id2 !== undefined && opt_coord2) {
      addTouch(opt_id2, opt_coord2);
    }

    const args: TouchArgs = {
      touches: touches,
      targetTouches: targetTouches,
      changedTouches: changedTouches,
      altKey: this.modifiersState.isAltPressed(),
      ctrlKey: this.modifiersState.isControlPressed(),
      shiftKey: this.modifiersState.isShiftPressed(),
      metaKey: this.modifiersState.isMetaPressed(),
      relatedTarget: null,
      scale: 0,
      rotation: 0,
    };

    return this.eventEmitter.fireTouchEvent(this.element_, type, args);
  }

  /**
   * Fires a MSPointer event given the state of the device and the given arguments.
   */
  fireMSPointerEvent(
    type: EventFactory,
    coord: Coordinate,
    button: number,
    pointerId: number,
    device: number,
    isPrimary: boolean,
    opt_related?: Element | null,
    opt_force?: boolean
  ): boolean {
    if (!opt_force && !isInteractable(this.element_)) {
      return false;
    }

    if (
      opt_related &&
      !(
        EventType.MSPOINTEROVER === type ||
        EventType.MSPOINTEROUT === type
      )
    ) {
      throw new BotError(
        ErrorCode.INVALID_ELEMENT_STATE,
        'Event type does not allow related target: ' + type
      );
    }

    const args: MSPointerArgs = {
      clientX: coord.x,
      clientY: coord.y,
      button: button,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
      relatedTarget: opt_related || null,
      width: 0,
      height: 0,
      pressure: 0, // Pressure is only given when a stylus is used.
      rotation: 0,
      pointerId: pointerId,
      tiltX: 0,
      tiltY: 0,
      pointerType: device,
      isPrimary: isPrimary,
    };

    let target: Element | null = this.select_
      ? this.getTargetOfOptionMouseEvent_(type)
      : this.element_;
    if (pointerElementMap_[pointerId]) {
      target = pointerElementMap_[pointerId];
    }

    const owner = getWindow_(getOwnerDocument_(this.element_));
    let originalMsSetPointerCapture: ((id: number) => void) | undefined;
    if (owner && type === EventType.MSPOINTERDOWN) {
      // Overwrite msSetPointerCapture on the Element's prototype
      // because synthetic pointer events cause an access denied exception.
      const elemProto = (owner as Window & { Element: { prototype: HTMLElement } }).Element?.prototype;
      if (elemProto && 'msSetPointerCapture' in elemProto) {
        originalMsSetPointerCapture = (elemProto as unknown as { msSetPointerCapture: (id: number) => void }).msSetPointerCapture;
        (elemProto as unknown as { msSetPointerCapture: (id: number) => void }).msSetPointerCapture = function (this: Element, id: number) {
          pointerElementMap_[id] = this;
        };
      }
    }

    const result = target
      ? this.eventEmitter.fireMSPointerEvent(target, type, args)
      : true;

    if (originalMsSetPointerCapture) {
      const elemProto = (owner as Window & { Element: { prototype: HTMLElement } }).Element?.prototype;
      (elemProto as unknown as { msSetPointerCapture: (id: number) => void }).msSetPointerCapture = originalMsSetPointerCapture;
    }

    return result;
  }

  /**
   * A mouse event fired "on" an option element, doesn't always fire on the
   * option element itself. Sometimes it fires on the parent select element
   * and sometimes not at all, depending on the browser and event type.
   */
  private getTargetOfOptionMouseEvent_(type: EventFactory): Element | null {
    // IE either fires the event on the parent select or not at all.
    if (IS_IE) {
      switch (type) {
        case EventType.MOUSEOVER:
        case EventType.MSPOINTEROVER:
          return null;
        case EventType.CONTEXTMENU:
        case EventType.MOUSEMOVE:
        case EventType.MSPOINTERMOVE:
          return this.select_!.multiple ? this.select_ : null;
        default:
          return this.select_;
      }
    }

    // WebKit always fires on the option element of multi-selects.
    // On single-selects, it either fires on the parent or not at all.
    if (WEBKIT) {
      switch (type) {
        case EventType.CLICK:
        case EventType.MOUSEUP:
          return this.select_!.multiple ? this.element_ : this.select_;
        default:
          return this.select_!.multiple ? this.element_ : null;
      }
    }

    // Firefox fires every event on the option element.
    return this.element_;
  }

  /**
   * A helper function to fire click events. This method is shared between
   * the mouse and touchscreen devices.
   */
  clickElement(
    coord: Coordinate,
    button: number,
    opt_force?: boolean,
    opt_pointerId?: number | null
  ): void {
    if (!opt_force && !isInteractable(this.element_)) {
      return;
    }

    // bot.events.fire(element, 'click') can trigger all onclick events, but may
    // not follow links (FORM.action or A.href).
    let targetLink: Element | null = null;
    let targetButton: Element | null = null;
    if (!ALWAYS_FOLLOWS_LINKS_ON_CLICK_) {
      for (let e: Node | null = this.element_; e; e = e.parentNode) {
        if (isElement(e, 'A')) {
          targetLink = e as Element;
          break;
        } else if (isFormSubmitElement(e)) {
          targetButton = e as Element;
          break;
        }
      }
    }

    // When an element is toggled as the result of a click, the toggling and the
    // change event happens before the click event on some browsers.
    const isRadioOrCheckbox = !this.select_ && isSelectable(this.element_);
    const wasChecked = isRadioOrCheckbox && isSelected(this.element_);

    // In IE, clicking a form submit button needs special handling.
    if (IS_IE && targetButton) {
      (targetButton as HTMLElement).click();
      return;
    }

    const performDefault = this.fireMouseEvent(
      EventType.CLICK,
      coord,
      button,
      null,
      0,
      opt_force,
      opt_pointerId
    );
    if (!performDefault) {
      return;
    }

    if (targetLink && shouldFollowHref_(targetLink as HTMLAnchorElement)) {
      followHref_(targetLink as HTMLAnchorElement);
    } else if (isRadioOrCheckbox) {
      this.toggleRadioButtonOrCheckbox_(wasChecked);
    }
  }

  /**
   * Focuses on the given element and returns true if it supports being focused
   * and does not already have focus; otherwise, returns false.
   */
  focusOnElement(): boolean {
    const elementToFocus = (getAncestor_(
      this.element_,
      (node) => {
        return (
          !!node &&
          isElement(node) &&
          isFocusable(node as Element)
        );
      },
      true /* Return this.element_ if it is focusable. */
    ) || this.element_) as Element;

    const activeElement = getActiveElement(elementToFocus);
    if (elementToFocus === activeElement) {
      return false;
    }

    // If there is a currently active element, try to blur it.
    if (
      activeElement &&
      (typeof (activeElement as HTMLElement).blur === 'function' ||
        // IE reports native functions as being objects.
        (IS_IE &&
          typeof (activeElement as HTMLElement).blur === 'object' &&
          (activeElement as HTMLElement).blur !== null))
    ) {
      if (!isElement(activeElement, 'BODY')) {
        try {
          (activeElement as HTMLElement).blur();
        } catch (e) {
          if (
            !(IS_IE && (e as Error).message === 'Unspecified error.')
          ) {
            throw e;
          }
        }
      }

      // Sometimes IE6 and IE7 will not fire an onblur event after blur()
      // is called, unless window.focus() is called immediately afterward.
      if (IS_IE && !isEngineVersion(8)) {
        getWindow_(getOwnerDocument_(elementToFocus)).focus();
      }
    }

    // Try to focus on the element.
    if (
      typeof (elementToFocus as HTMLElement).focus === 'function' ||
      (IS_IE &&
        typeof (elementToFocus as HTMLElement).focus === 'object' &&
        (elementToFocus as HTMLElement).focus !== null)
    ) {
      ((elementToFocus as HTMLElement).focus as () => void).call(elementToFocus);
      return true;
    }

    return false;
  }

  /**
   * Toggles the selected state of the current element if it is an option.
   */
  maybeToggleOption(): void {
    // If this is not an <option> or not interactable, exit.
    if (!this.select_ || !isInteractable(this.element_)) {
      return;
    }
    const select = this.select_;
    const wasSelected = isSelected(this.element_);
    // Cannot toggle off options in single-selects.
    if (wasSelected && !select.multiple) {
      return;
    }

    (this.element_ as HTMLOptionElement).selected = !wasSelected;
    // Only WebKit fires the change event itself and only for multi-selects,
    // except for Android versions >= 4.0 and Chrome >= 28.
    if (
      !(WEBKIT && select.multiple) ||
      (IS_CHROME && isProductVersion(28)) ||
      (IS_ANDROID && isProductVersion(4))
    ) {
      fire(select, EventType.CHANGE);
    }
  }

  /**
   * Toggles the checked state of a radio button or checkbox.
   */
  private toggleRadioButtonOrCheckbox_(wasChecked: boolean): void {
    // Gecko and WebKit toggle the element as a result of a click.
    if (GECKO || WEBKIT) {
      return;
    }
    // Cannot toggle off radio buttons.
    if (
      wasChecked &&
      (this.element_ as HTMLInputElement).type.toLowerCase() === 'radio'
    ) {
      return;
    }
    (this.element_ as HTMLInputElement).checked = !wasChecked;
  }

  /**
   * Submits the specified form.
   */
  submitForm(form: HTMLFormElement): void {
    if (!isForm_(form)) {
      throw new BotError(
        ErrorCode.INVALID_ELEMENT_STATE,
        'Element is not a form, so could not submit.'
      );
    }
    if (fire(form, EventType.SUBMIT)) {
      // When a form has an element with an id or name exactly equal to "submit"
      // it masks the form.submit function.
      if (!isElement(form.submit as unknown as Node)) {
        form.submit();
      } else if (!IS_IE || isEngineVersion(8)) {
        (
          (form.constructor as { prototype: { submit: () => void } }).prototype
            .submit as () => void
        ).call(form);
      } else {
        // IE < 8 special handling for masked submit function
        const idMasks = findElementsWithAttribute(form, 'id', 'submit');
        const nameMasks = findElementsWithAttribute(form, 'name', 'submit');
        idMasks.forEach((m) => m.removeAttribute('id'));
        nameMasks.forEach((m) => m.removeAttribute('name'));
        const submitFunction = form.submit;
        idMasks.forEach((m) => m.setAttribute('id', 'submit'));
        nameMasks.forEach((m) => m.setAttribute('name', 'submit'));
        (submitFunction as () => void)();
      }
    }
  }
}

// ============================================================================
// Static Helper Functions
// ============================================================================

/**
 * Checks if a node is a FORM element.
 */
function isForm_(node: Node): node is HTMLFormElement {
  return isElement(node, 'FORM');
}

/**
 * Checks if the element is a form submit element.
 */
export function isFormSubmitElement(element: Node): boolean {
  if (isElement(element, 'INPUT')) {
    const type = (element as HTMLInputElement).type.toLowerCase();
    if (type === 'submit' || type === 'image') {
      return true;
    }
  }

  if (isElement(element, 'BUTTON')) {
    const type = (element as HTMLButtonElement).type.toLowerCase();
    if (type === 'submit') {
      return true;
    }
  }
  return false;
}

/**
 * Find FORM element that is an ancestor of the passed in element.
 */
export function findAncestorForm(node: Node): HTMLFormElement | null {
  return getAncestor_(node, isForm_, true) as HTMLFormElement | null;
}

/**
 * Finds elements with a specific attribute value.
 */
function findElementsWithAttribute(
  root: Element,
  attrName: string,
  attrValue: string
): Element[] {
  const result: Element[] = [];
  const all = root.querySelectorAll(`[${attrName}="${attrValue}"]`);
  for (let i = 0; i < all.length; i++) {
    result.push(all[i]);
  }
  return result;
}

/**
 * Indicates whether we should manually follow the href of the element we're clicking.
 */
function shouldFollowHref_(element: HTMLAnchorElement): boolean {
  if (ALWAYS_FOLLOWS_LINKS_ON_CLICK_ || !element.href) {
    return false;
  }

  if (!WEBEXTENSION) {
    return true;
  }

  if (element.target || element.href.toLowerCase().indexOf('javascript') === 0) {
    return false;
  }

  const owner = getWindow_(getOwnerDocument_(element));
  const sourceUrl = owner.location.href;
  const destinationUrl = resolveUrl_(owner.location, element.href);
  const isOnlyHashChange =
    sourceUrl.split('#')[0] === destinationUrl.split('#')[0];

  return !isOnlyHashChange;
}

/**
 * Explicitly follows the href of an anchor.
 */
function followHref_(anchorElement: HTMLAnchorElement): void {
  let targetHref = anchorElement.href;
  const owner = getWindow_(getOwnerDocument_(anchorElement));

  // IE7 and earlier incorrectly resolve a relative href against the top window
  // location instead of the window to which the href is assigned.
  if (IS_IE && !isEngineVersion(8)) {
    targetHref = resolveUrl_(owner.location, targetHref);
  }

  if (anchorElement.target) {
    owner.open(targetHref, anchorElement.target);
  } else {
    owner.location.href = targetHref;
  }
}
