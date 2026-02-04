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
 * The base class for input devices such as the keyboard, mouse, and touchscreen.
 */

import { WebDriverError, ErrorCode } from './error';
import * as dom from './dom';
import * as events from './events';
import * as userAgent from './userAgent';
import * as bot from './bot';

/**
 * Simple coordinate type
 */
export class Coordinate {
    constructor(public x: number, public y: number) { }
}

/**
 * An enum for the various modifier keys (keycode-independent).
 */
export enum Modifier {
    SHIFT = 0x1,
    CONTROL = 0x2,
    ALT = 0x4,
    META = 0x8
}

/**
 * Stores the state of modifier keys
 */
export class ModifiersState {
    private pressedModifiers: number = 0;

    /**
     * Checks whether a specific modifier is pressed
     */
    isPressed(modifier: Modifier): boolean {
        return (this.pressedModifiers & modifier) !== 0;
    }

    /**
     * Sets the state of a given modifier.
     */
    setPressed(modifier: Modifier, isPressed: boolean): void {
        if (isPressed) {
            this.pressedModifiers = this.pressedModifiers | modifier;
        } else {
            this.pressedModifiers = this.pressedModifiers & ~modifier;
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

/**
 * Fires events, a driver can replace it with a custom implementation
 */
export class EventEmitter {
    /**
     * Fires an HTML event given the state of the device.
     */
    fireHtmlEvent(target: Element, type: any): boolean {
        return events.fire(target, type);
    }

    /**
     * Fires a keyboard event given the state of the device and the given arguments.
     */
    fireKeyboardEvent(target: Element, type: any, args: events.KeyboardArgs): boolean {
        return events.fire(target, type, args);
    }

    /**
     * Fires a mouse event given the state of the device and the given arguments.
     */
    fireMouseEvent(target: Element, type: any, args: events.MouseArgs): boolean {
        return events.fire(target, type, args);
    }

    /**
     * Fires a touch event given the state of the device and the given arguments.
     */
    fireTouchEvent(target: Element, type: any, args: events.TouchArgs): boolean {
        return events.fire(target, type, args);
    }

    /**
     * Fires an MSPointer event given the state of the device and the given arguments.
     */
    fireMSPointerEvent(target: Element, type: any, args: events.MSPointerArgs): boolean {
        return events.fire(target, type, args);
    }
}

/**
 * A Device class that provides common functionality for input devices.
 */
export class Device {
    private element: Element;
    private select: Element | null = null;
    protected modifiersState: ModifiersState;
    protected eventEmitter: EventEmitter;

    constructor(opt_modifiersState?: ModifiersState, opt_eventEmitter?: EventEmitter) {
        this.element = bot.getDocument().documentElement;

        // If there is an active element, make that the current element instead.
        const activeElement = dom.getActiveElement(this.element);
        if (activeElement) {
            this.setElement(activeElement);
        }

        this.modifiersState = opt_modifiersState || new ModifiersState();
        this.eventEmitter = opt_eventEmitter || new EventEmitter();
    }

    /**
     * Returns the element with which the device is interacting.
     */
    getElement(): Element {
        return this.element;
    }

    /**
     * Sets the element with which the device is interacting.
     */
    setElement(element: Element): void {
        this.element = element;
        if (element.tagName?.toLowerCase() === 'option') {
            let ancestor: Element | null = element;
            while (ancestor !== null) {
                if (ancestor.tagName?.toLowerCase() === 'select') {
                    this.select = ancestor;
                    return;
                }
                ancestor = ancestor.parentElement;
            }
            this.select = null;
        } else {
            this.select = null;
        }
    }

    /**
     * Fires an HTML event given the state of the device.
     */
    protected fireHtmlEvent(type: any): boolean {
        return this.eventEmitter.fireHtmlEvent(this.element, type);
    }

    /**
     * Fires a keyboard event given the state of the device and the given arguments.
     */
    protected fireKeyboardEvent(type: any, args: events.KeyboardArgs): boolean {
        return this.eventEmitter.fireKeyboardEvent(this.element, type, args);
    }

    /**
     * Fires a mouse event given the state of the device and the given arguments.
     */
    protected fireMouseEvent(
        type: any,
        coord: Coordinate,
        button: number,
        opt_related?: Element,
        opt_wheelDelta?: number,
        opt_force?: boolean,
        opt_pointerId?: number,
        opt_count?: number
    ): boolean {
        if (!opt_force && !dom.isInteractable(this.element)) {
            return false;
        }

        if (opt_related &&
            !(type === events.EventType.MOUSEOVER ||
                type === events.EventType.MOUSEOUT)) {
            throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
                'Event type does not allow related target: ' + type);
        }

        const args: events.MouseArgs = {
            clientX: coord.x,
            clientY: coord.y,
            button,
            altKey: this.modifiersState.isAltPressed(),
            ctrlKey: this.modifiersState.isControlPressed(),
            shiftKey: this.modifiersState.isShiftPressed(),
            metaKey: this.modifiersState.isMetaPressed(),
            wheelDelta: opt_wheelDelta || 0,
            relatedTarget: opt_related
        };

        const pointerId = opt_pointerId || MOUSE_MS_POINTER_ID;
        let target = this.element;

        // On click and mousedown events, captured pointers are ignored and the
        // event always fires on the original element.
        if (type !== events.EventType.CLICK &&
            type !== events.EventType.MOUSEDOWN &&
            pointerId in pointerElementMap) {
            target = pointerElementMap[pointerId];
        } else if (this.select) {
            const optionTarget = this.getTargetOfOptionMouseEvent_(type);
            if (optionTarget) {
                target = optionTarget;
            }
        }

        return target ? this.eventEmitter.fireMouseEvent(target, type, args) : true;
    }

    /**
     * Fires a touch event given the state of the device and the given arguments.
     */
    protected fireTouchEvent(
        type: any,
        id: number,
        coord: Coordinate,
        opt_id2?: number,
        opt_coord2?: Coordinate
    ): boolean {
        const args: events.TouchArgs = {
            touches: [],
            targetTouches: [],
            changedTouches: [],
            altKey: this.modifiersState.isAltPressed(),
            ctrlKey: this.modifiersState.isControlPressed(),
            shiftKey: this.modifiersState.isShiftPressed(),
            metaKey: this.modifiersState.isMetaPressed(),
            scale: 0,
            rotation: 0
        };

        const pageOffset = this.getDocumentScroll();

        const addTouch = (identifier: number, coords: Coordinate) => {
            const touch: events.Touch = {
                identifier,
                screenX: coords.x,
                screenY: coords.y,
                clientX: coords.x,
                clientY: coords.y,
                pageX: coords.x + pageOffset.x,
                pageY: coords.y + pageOffset.y
            };

            args.changedTouches.push(touch);
            if (type === events.EventType.TOUCHSTART || type === events.EventType.TOUCHMOVE) {
                args.touches.push(touch);
                args.targetTouches.push(touch);
            }
        };

        addTouch(id, coord);
        if (opt_id2 !== undefined && opt_coord2) {
            addTouch(opt_id2, opt_coord2);
        }

        return this.eventEmitter.fireTouchEvent(this.element, type, args);
    }

    /**
     * Fires a MSPointer event given the state of the device and the given arguments.
     */
    protected fireMSPointerEvent(
        type: any,
        coord: Coordinate,
        button: number,
        pointerId: number,
        device: number,
        isPrimary: boolean,
        opt_related?: Element,
        opt_force?: boolean
    ): boolean {
        if (!opt_force && !dom.isInteractable(this.element)) {
            return false;
        }

        if (opt_related &&
            !(type === events.EventType.MSPOINTEROVER ||
                type === events.EventType.MSPOINTEROUT)) {
            throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
                'Event type does not allow related target: ' + type);
        }

        const args: events.MSPointerArgs = {
            clientX: coord.x,
            clientY: coord.y,
            button,
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false,
            relatedTarget: opt_related,
            width: 0,
            height: 0,
            pressure: 0,
            rotation: 0,
            pointerId,
            tiltX: 0,
            tiltY: 0,
            pointerType: device,
            isPrimary
        };

        let target = this.select ? this.getTargetOfOptionMouseEvent_(type) : this.element;
        if (!target) {
            target = this.element;
        }
        if (pointerElementMap[pointerId]) {
            target = pointerElementMap[pointerId];
        }

        const owner = this.element.ownerDocument?.defaultView;
        let originalMsSetPointerCapture: any;

        if (owner && type === events.EventType.MSPOINTERDOWN) {
            originalMsSetPointerCapture = (owner as any).Element.prototype.msSetPointerCapture;
            (owner as any).Element.prototype.msSetPointerCapture = function (id: number) {
                pointerElementMap[id] = this;
            };
        }

        const result = target ? this.eventEmitter.fireMSPointerEvent(target, type, args) : true;

        if (originalMsSetPointerCapture) {
            (owner as any).Element.prototype.msSetPointerCapture = originalMsSetPointerCapture;
        }

        return result;
    }

    /**
     * A mouse event fired "on" an option element, doesn't always fire on the
     * option element itself.
     */
    private getTargetOfOptionMouseEvent_(type: any): Element | null {
        if (!this.select) {
            return null;
        }

        // IE either fires the event on the parent select or not at all
        if (userAgent.IS_IE) {
            const typeStr = String(type);
            if (typeStr.includes('mouseover')) {
                return null;
            }
            if (typeStr.includes('contextmenu') || typeStr.includes('mousemove')) {
                return (this.select as HTMLSelectElement).multiple ? this.select : null;
            }
            return this.select;
        }

        // WebKit always fires on the option element of multi-selects
        if ((userAgent as any).IS_WEBKIT) {
            const typeStr = String(type);
            if (typeStr.includes('click') || typeStr.includes('mouseup')) {
                return (this.select as HTMLSelectElement).multiple ? this.element : this.select;
            }
            return (this.select as HTMLSelectElement).multiple ? this.element : null;
        }

        // Firefox fires every event on the option element
        return this.element;
    }

    /**
     * A helper function to fire click events.
     */
    protected clickElement(
        coord: Coordinate,
        button: number,
        opt_force?: boolean,
        opt_pointerId?: number
    ): void {
        if (!opt_force && !dom.isInteractable(this.element)) {
            return;
        }

        let targetLink: Element | null = null;
        let targetButton: Element | null = null;

        if (!ALWAYS_FOLLOWS_LINKS_ON_CLICK) {
            let e: Element | null = this.element;
            while (e !== null) {
                if (e.tagName?.toLowerCase() === 'a') {
                    targetLink = e;
                    break;
                } else if (Device.isFormSubmitElement(e)) {
                    targetButton = e;
                    break;
                }
                e = e.parentElement;
            }
        }

        const isRadioOrCheckbox = !this.select && dom.isSelectable(this.element);
        const wasChecked = isRadioOrCheckbox && dom.isSelected(this.element);

        // When clicking a form submit button in IE, we need to call Element.click() explicitly
        if (userAgent.IS_IE && targetButton) {
            (targetButton as any).click();
            return;
        }

        const performDefault = this.fireMouseEvent(
            events.EventType.CLICK, coord, button, undefined, 0, opt_force, opt_pointerId
        );

        if (!performDefault) {
            return;
        }

        if (targetLink && Device.shouldFollowHref_(targetLink as HTMLAnchorElement)) {
            Device.followHref_(targetLink as HTMLAnchorElement);
        } else if (isRadioOrCheckbox) {
            this.toggleRadioButtonOrCheckbox_(wasChecked);
        }
    }

    /**
     * Focuses on the given element and returns true if it supports being focused
     * and does not already have focus; otherwise, returns false.
     */
    protected focusOnElement(): boolean {
        let elementToFocus: Element | null = this.element;
        let current: Element | null = this.element;

        while (current) {
            if (dom.isElement(current) && dom.isFocusable(current)) {
                elementToFocus = current;
                break;
            }
            current = current.parentElement;
        }

        const activeElement = dom.getActiveElement(elementToFocus);
        if (elementToFocus === activeElement) {
            return false;
        }

        // If there is a currently active element, try to blur it.
        if (activeElement && typeof (activeElement as any).blur === 'function') {
            if (!dom.isElement(activeElement, 'body')) {
                try {
                    (activeElement as any).blur();
                } catch (e) {
                    if (!(userAgent.IS_IE && (e as any).message === 'Unspecified error.')) {
                        throw e;
                    }
                }
            }

            // Sometimes IE6 and IE7 will not fire an onblur event after blur() is called
            if (userAgent.IS_IE && !userAgent.isEngineVersion(8)) {
                const owner = elementToFocus.ownerDocument?.defaultView;
                if (owner) {
                    owner.focus();
                }
            }
        }

        // Try to focus on the element.
        if (typeof (elementToFocus as any).focus === 'function') {
            (elementToFocus as any).focus();
            return true;
        }

        return false;
    }

    /**
     * Toggles the selected state of the current element if it is an option.
     */
    protected maybeToggleOption(): void {
        // If this is not an <option> or not interactable, exit.
        if (!this.select || !dom.isInteractable(this.element)) {
            return;
        }

        const wasSelected = dom.isSelected(this.element);
        const selectElem = this.select as HTMLSelectElement;

        // Cannot toggle off options in single-selects.
        if (wasSelected && !selectElem.multiple) {
            return;
        }

        (this.element as HTMLOptionElement).selected = !wasSelected;

        // Only WebKit fires the change event itself for multi-selects
        const isWebKit = (userAgent as any).IS_WEBKIT;
        const isChrome = userAgent.IS_CHROME;
        const isAndroid = userAgent.IS_ANDROID;

        if (!(isWebKit && selectElem.multiple) ||
            (isChrome && userAgent.isProductVersion(28)) ||
            (isAndroid && userAgent.isProductVersion(4))) {
            events.fire(selectElem, events.EventType.CHANGE);
        }
    }

    /**
     * Toggles the checked state of a radio button or checkbox.
     */
    private toggleRadioButtonOrCheckbox_(wasChecked: boolean): void {
        // Gecko and WebKit toggle the element as a result of a click.
        const isFirefox = userAgent.IS_FIREFOX;
        const isWebKit = (userAgent as any).IS_WEBKIT;

        if (isFirefox || isWebKit) {
            return;
        }

        // Cannot toggle off radio buttons.
        if (wasChecked && (this.element as HTMLInputElement).type.toLowerCase() === 'radio') {
            return;
        }

        (this.element as HTMLInputElement).checked = !wasChecked;
    }

    /**
     * Get the document scroll offset
     */
    private getDocumentScroll(): Coordinate {
        const doc = this.element.ownerDocument;
        if (doc && doc.documentElement) {
            return new Coordinate(doc.documentElement.scrollLeft, doc.documentElement.scrollTop);
        }
        return new Coordinate(0, 0);
    }

    /**
     * Find FORM element that is an ancestor of the passed in element.
     */
    static findAncestorForm(node: Node): Element | null {
        let current: Node | null = node;
        while (current) {
            if (dom.isElement(current as Element) && dom.isElement(current as Element, 'form')) {
                return current as Element;
            }
            current = current.parentNode;
        }
        return null;
    }

    /**
     * Check if an element is a submit element in form.
     */
    static isFormSubmitElement(element: any): boolean {
        const tagName = element.tagName?.toLowerCase();
        if (tagName === 'input') {
            const type = (element as HTMLInputElement).type.toLowerCase();
            return type === 'submit' || type === 'image';
        }

        if (tagName === 'button') {
            const type = (element as HTMLButtonElement).type.toLowerCase();
            return type === 'submit';
        }

        return false;
    }

    /**
     * Indicates whether we should manually follow the href of the element we're clicking.
     */
    private static shouldFollowHref_(element: HTMLAnchorElement): boolean {
        if (ALWAYS_FOLLOWS_LINKS_ON_CLICK || !element.href) {
            return false;
        }

        if (!userAgent.IS_WEBEXTENSION) {
            return true;
        }

        if (element.target || element.href.toLowerCase().includes('javascript')) {
            return false;
        }

        const owner = element.ownerDocument?.defaultView;
        if (!owner) {
            return true;
        }

        const sourceUrl = owner.location.href;
        const destinationUrl = Device.resolveUrl_(owner.location, element.href);
        const sourceBase = sourceUrl.split('#')[0];
        const destBase = destinationUrl.split('#')[0];

        return sourceBase !== destBase;
    }

    /**
     * Explicitly follows the href of an anchor.
     */
    private static followHref_(anchorElement: HTMLAnchorElement): void {
        let targetHref = anchorElement.href;
        const owner = anchorElement.ownerDocument?.defaultView;

        if (!owner) {
            return;
        }

        // IE7 and earlier incorrectly resolve relative hrefs
        if (userAgent.IS_IE && !userAgent.isEngineVersion(8)) {
            targetHref = Device.resolveUrl_(owner.location, targetHref);
        }

        if (anchorElement.target) {
            owner.open(targetHref, anchorElement.target);
        } else {
            owner.location.href = targetHref;
        }
    }

    /**
     * Submits the specified form.
     */
    protected submitForm(form: Element): void {
        if (!dom.isElement(form, 'form')) {
            throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
                'Element is not a form, so could not submit.');
        }

        const formElem = form as HTMLFormElement;
        if (events.fire(formElem, events.EventType.SUBMIT)) {
            // When a form has an element with id or name equal to "submit",
            // it masks the form.submit function. We can avoid this by calling
            // the prototype's submit function.
            if (!(formElem.submit instanceof HTMLElement)) {
                formElem.submit();
            } else if (!userAgent.IS_IE || userAgent.isEngineVersion(8)) {
                HTMLFormElement.prototype.submit.call(formElem);
            } else {
                // For IE < 8, we need to handle masked submit elements
                const idMasks: HTMLElement[] = [];
                const nameMasks: HTMLElement[] = [];

                formElem.querySelectorAll('[id="submit"]').forEach((e) => {
                    idMasks.push(e as HTMLElement);
                    e.removeAttribute('id');
                });
                formElem.querySelectorAll('[name="submit"]').forEach((e) => {
                    nameMasks.push(e as HTMLElement);
                    e.removeAttribute('name');
                });

                const submitFunction = formElem.submit;
                idMasks.forEach((m) => m.setAttribute('id', 'submit'));
                nameMasks.forEach((m) => m.setAttribute('name', 'submit'));
                submitFunction.call(formElem);
            }
        }
    }

    /**
     * Regular expression for splitting up a URL into components.
     */
    private static readonly URL_REGEXP = new RegExp(
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
    private static resolveUrl_(base: Location, rel: string): string {
        const m = rel.match(Device.URL_REGEXP);
        if (!m) {
            return '';
        }

        const target = {
            protocol: m[1] || '',
            host: m[2] || '',
            pathname: m[3] || '',
            search: m[4] || '',
            hash: m[5] || ''
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

        return target.protocol + '//' + target.host + target.pathname +
            target.search + target.hash;
    }
}

/**
 * Whether links must be manually followed when clicking (because firing click
 * events doesn't follow them).
 */
const ALWAYS_FOLLOWS_LINKS_ON_CLICK = (userAgent as any).IS_WEBKIT;

/**
 * The pointer id used for MSPointer events initiated through a mouse device.
 */
export const MOUSE_MS_POINTER_ID = 1;

/**
 * A map of pointer id to Elements.
 */
const pointerElementMap: Record<number, Element> = {};

/**
 * Gets the element associated with a pointer id.
 */
export function getPointerElement(pointerId: number): Element | null {
    return pointerElementMap[pointerId] || null;
}

/**
 * Clear the pointer map.
 */
export function clearPointerMap(): void {
    Object.keys(pointerElementMap).forEach(key => {
        delete pointerElementMap[parseInt(key)];
    });
}
