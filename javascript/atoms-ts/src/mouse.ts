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
 * The file contains an abstraction of a mouse for
 * simulating the mouse actions.
 */

import { Device, ModifiersState, EventEmitter, Coordinate, MOUSE_MS_POINTER_ID, clearPointerMap } from './device';
import { WebDriverError, ErrorCode } from './error';
import * as dom from './dom';
import * as events from './events';
import * as userAgent from './userAgent';
import * as bot from './bot';

/**
 * Enumeration of mouse buttons that can be pressed.
 */
export enum Button {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2
}

/**
 * Index to indicate no button pressed
 */
const NO_BUTTON_VALUE_INDEX = 3;

/**
 * Mouse state interface
 */
export interface MouseState {
    buttonPressed: Button | null;
    elementPressed?: Element;
    clientXY: { x: number; y: number };
    nextClickIsDoubleClick: boolean;
    hasEverInteracted: boolean;
    element?: Element;
}

/**
 * Maps mouse events to an array of button argument value for each mouse button.
 */
const MOUSE_BUTTON_VALUE_MAP_: Map<any, (number | null)[]> = buildMouseButtonValueMap();

function buildMouseButtonValueMap(): Map<any, (number | null)[]> {
    const buttonValueMap: Map<any, (number | null)[]> = new Map();

    if (userAgent.IS_IE && userAgent.isEngineVersion(9) === false) {
        // IE < 9
        buttonValueMap.set(events.EventType.CLICK, [0, 0, 0, null]);
        buttonValueMap.set(events.EventType.CONTEXTMENU, [null, null, 0, null]);
        buttonValueMap.set(events.EventType.MOUSEUP, [1, 4, 2, null]);
        buttonValueMap.set(events.EventType.MOUSEOUT, [0, 0, 0, 0]);
        buttonValueMap.set(events.EventType.MOUSEMOVE, [1, 4, 2, 0]);
    } else if (userAgent.IS_WEBKIT || (userAgent.IS_IE && userAgent.isEngineVersion(9))) {
        // WebKit or IE 9+
        buttonValueMap.set(events.EventType.CLICK, [0, 1, 2, null]);
        buttonValueMap.set(events.EventType.CONTEXTMENU, [null, null, 2, null]);
        buttonValueMap.set(events.EventType.MOUSEUP, [0, 1, 2, null]);
        buttonValueMap.set(events.EventType.MOUSEOUT, [0, 1, 2, 0]);
        buttonValueMap.set(events.EventType.MOUSEMOVE, [0, 1, 2, 0]);
    } else {
        // Firefox and others
        buttonValueMap.set(events.EventType.CLICK, [0, 1, 2, null]);
        buttonValueMap.set(events.EventType.CONTEXTMENU, [null, null, 2, null]);
        buttonValueMap.set(events.EventType.MOUSEUP, [0, 1, 2, null]);
        buttonValueMap.set(events.EventType.MOUSEOUT, [0, 0, 0, 0]);
        buttonValueMap.set(events.EventType.MOUSEMOVE, [0, 0, 0, 0]);
    }

    if (userAgent.IS_IE && userAgent.isEngineVersion(10)) {
        const msPointerUp = buttonValueMap.get(events.EventType.MOUSEUP)!;
        buttonValueMap.set(events.EventType.MSPOINTERDOWN, msPointerUp);
        buttonValueMap.set(events.EventType.MSPOINTERUP, msPointerUp);
        buttonValueMap.set(events.EventType.MSPOINTERMOVE, [-1, -1, -1, -1]);
        const msPtrMove = buttonValueMap.get(events.EventType.MSPOINTERMOVE)!;
        buttonValueMap.set(events.EventType.MSPOINTEROUT, msPtrMove);
        buttonValueMap.set(events.EventType.MSPOINTEROVER, msPtrMove);
    }

    const click = buttonValueMap.get(events.EventType.CLICK)!;
    const mouseup = buttonValueMap.get(events.EventType.MOUSEUP)!;
    const mouseout = buttonValueMap.get(events.EventType.MOUSEOUT)!;
    buttonValueMap.set(events.EventType.DBLCLICK, click);
    buttonValueMap.set(events.EventType.MOUSEDOWN, mouseup);
    buttonValueMap.set(events.EventType.MOUSEOVER, mouseout);

    return buttonValueMap;
}

/**
 * Maps mouse events to corresponding MSPointer event.
 */
const MOUSE_EVENT_MAP_: Map<any, any> = new Map([
    [events.EventType.MOUSEDOWN, events.EventType.MSPOINTERDOWN],
    [events.EventType.MOUSEMOVE, events.EventType.MSPOINTERMOVE],
    [events.EventType.MOUSEOUT, events.EventType.MSPOINTEROUT],
    [events.EventType.MOUSEOVER, events.EventType.MSPOINTEROVER],
    [events.EventType.MOUSEUP, events.EventType.MSPOINTERUP]
]);

/**
 * A mouse that provides atomic mouse actions. This mouse currently only
 * supports having one button pressed at a time.
 */
export class Mouse extends Device {
    private buttonPressed_: Button | null = null;
    private elementPressed_: Element | null = null;
    private clientXY_: { x: number; y: number } = { x: 0, y: 0 };
    private nextClickIsDoubleClick_: boolean = false;
    private hasEverInteracted_: boolean = false;

    constructor(opt_state?: MouseState, opt_modifiersState?: ModifiersState, opt_eventEmitter?: EventEmitter) {
        super(opt_modifiersState, opt_eventEmitter);

        if (opt_state) {
            if (typeof opt_state.buttonPressed === 'number') {
                this.buttonPressed_ = opt_state.buttonPressed;
            }

            try {
                if (opt_state.elementPressed && dom.isElement(opt_state.elementPressed)) {
                    this.elementPressed_ = opt_state.elementPressed;
                }
            } catch (ignored) {
                this.buttonPressed_ = null;
            }

            this.clientXY_ = {
                x: opt_state.clientXY.x,
                y: opt_state.clientXY.y
            };

            this.nextClickIsDoubleClick_ = !!opt_state.nextClickIsDoubleClick;
            this.hasEverInteracted_ = !!opt_state.hasEverInteracted;

            try {
                if (opt_state.element && dom.isElement(opt_state.element)) {
                    this.setElement(opt_state.element);
                }
            } catch (ignored) {
                this.buttonPressed_ = null;
            }
        }
    }

    /**
     * Attempts to fire a mousedown event and then returns whether or not the
     * element should receive focus as a result of the mousedown.
     */
    private fireMousedown_(opt_count?: number): boolean {
        // On some browsers, a mouse down event on an OPTION or SELECT element cause
        // the SELECT to open, blocking further JS execution. This is undesirable,
        // and so needs to be detected. We always focus in this case.
        const isFirefox3 = userAgent.IS_FIREFOX && !userAgent.isProductVersion(4);
        const blocksOnMousedown = (userAgent.IS_WEBKIT || isFirefox3) &&
            (this.getElement().tagName?.toLowerCase() === 'option' ||
                this.getElement().tagName?.toLowerCase() === 'select');
        if (blocksOnMousedown) {
            return true;
        }

        // On some browsers, if the mousedown event handler makes a focus() call to
        // change the active element, this preempts the focus that would happen by
        // default on the mousedown, so we should not explicitly focus in this case.
        let beforeActiveElement: Element | null = null;
        const mousedownCanPreemptFocus = userAgent.IS_FIREFOX || userAgent.IS_IE;
        if (mousedownCanPreemptFocus) {
            beforeActiveElement = dom.getActiveElement(this.getElement());
        }

        const performFocus = this.fireMouseEvent_(events.EventType.MOUSEDOWN, null, null, false, opt_count);
        if (performFocus && mousedownCanPreemptFocus &&
            beforeActiveElement !== dom.getActiveElement(this.getElement())) {
            return false;
        }
        return performFocus;
    }

    /**
     * Press a mouse button on an element that the mouse is interacting with.
     */
    pressButton(button: Button, opt_count?: number): void {
        if (this.buttonPressed_ !== null) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Cannot press more than one button or an already pressed button.');
        }
        this.buttonPressed_ = button;
        this.elementPressed_ = this.getElement();

        const performFocus = this.fireMousedown_(opt_count);
        if (performFocus) {
            if (userAgent.IS_IE && userAgent.isEngineVersion(10) &&
                this.buttonPressed_ === Button.LEFT &&
                this.elementPressed_.tagName?.toLowerCase() === 'option') {
                const msPointerType = (window as any).MSPointerEvent?.MSPOINTER_TYPE_MOUSE || 2;
                this.fireMSPointerEvent(events.EventType.MSGOTPOINTERCAPTURE,
                    new Coordinate(this.clientXY_.x, this.clientXY_.y), 0, MOUSE_MS_POINTER_ID,
                    msPointerType, true);
            }
            this.focusOnElement();
        }
    }

    /**
     * Releases the pressed mouse button. Throws exception if no button pressed.
     */
    releaseButton(opt_force?: boolean, opt_count?: number): void {
        if (this.buttonPressed_ === null) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Cannot release a button when no button is pressed.');
        }

        this.maybeToggleOption();

        // If a mouseup event is dispatched to an interactable event, and that mouseup
        // would complete a click, then the click event must be dispatched even if the
        // element becomes non-interactable after the mouseup.
        const elementInteractableBeforeMouseup = dom.isInteractable(this.getElement());
        this.fireMouseEvent_(events.EventType.MOUSEUP, null, null, opt_force, opt_count);

        try {
            // Middle button can also trigger click.
            if (this.buttonPressed_ === Button.LEFT &&
                this.getElement() === this.elementPressed_) {
                this.clickElement(new Coordinate(this.clientXY_.x, this.clientXY_.y),
                    this.getButtonValue_(events.EventType.CLICK),
            /* opt_force */ elementInteractableBeforeMouseup);
                this.maybeDoubleClickElement_();
                if (userAgent.IS_IE && userAgent.isEngineVersion(10) &&
                    this.buttonPressed_ === Button.LEFT &&
                    this.elementPressed_.tagName?.toLowerCase() === 'option') {
                    const msPointerType = (window as any).MSPointerEvent?.MSPOINTER_TYPE_MOUSE || 2;
                    this.fireMSPointerEvent(events.EventType.MSLOSTPOINTERCAPTURE,
                        new Coordinate(0, 0), 0, MOUSE_MS_POINTER_ID,
                        msPointerType, false);
                }
            } else if (this.buttonPressed_ === Button.RIGHT) {
                this.fireMouseEvent_(events.EventType.CONTEXTMENU);
            }
        } catch (ignored) {
        }
        clearPointerMap();
        this.buttonPressed_ = null;
        this.elementPressed_ = null;
    }

    /**
     * A helper function to fire mouse double click events.
     */
    private maybeDoubleClickElement_(): void {
        // Trigger an additional double click event if it is the second click.
        if (this.nextClickIsDoubleClick_) {
            this.fireMouseEvent_(events.EventType.DBLCLICK);
        }
        this.nextClickIsDoubleClick_ = !this.nextClickIsDoubleClick_;
    }

    /**
     * Given a coordinates (x,y) related to an element, move mouse to (x,y) of the
     * element. The top-left point of the element is (0,0).
     */
    move(element: Element, coords: { x: number; y: number }): void {
        // If the element is interactable at the start of the move, it receives the
        // full event sequence, even if hidden by an element mid sequence.
        const toElemWasInteractable = dom.isInteractable(element);

        const rect = dom.getClientRect(element);
        this.clientXY_.x = coords.x + rect.left;
        this.clientXY_.y = coords.y + rect.top;
        let fromElement: Element | undefined = this.getElement();

        if (element !== fromElement) {
            // If the window of fromElement is closed, set fromElement to null as a flag
            // to skip the mouseout event and so relatedTarget of the mouseover is null.
            try {
                const doc = fromElement?.ownerDocument;
                if (doc && doc.defaultView && (doc.defaultView as any).closed) {
                    fromElement = undefined;
                }
            } catch (ignore) {
                // Sometimes accessing a window that no longer exists causes an error.
                fromElement = undefined;
            }

            if (fromElement) {
                // For the first mouse interaction on a page, if the mouse was over the
                // browser window, the browser will pass null as the relatedTarget for the
                // mouseover event. For subsequent interactions, it will pass the
                // last-focused element. Unfortunately, we don't have anywhere to keep the
                // state of which elements have been focused across Mouse instances, so we
                // treat every Mouse initially positioned over the documentElement or body
                // as if it's on a new page. Accordingly, for complex actions (e.g.
                // drag-and-drop), a single Mouse instance should be used for the whole
                // action, to ensure the correct relatedTargets are fired for any events.
                const doc = bot.getDocument();
                const isRoot = fromElement === doc.documentElement ||
                    fromElement === doc.body;
                fromElement = (!this.hasEverInteracted_ && isRoot) ? undefined : fromElement;
                this.fireMouseEvent_(events.EventType.MOUSEOUT, element);
            }
            this.setElement(element);

            // All browsers except IE fire the mouseover before the mousemove.
            if (!userAgent.IS_IE) {
                this.fireMouseEvent_(events.EventType.MOUSEOVER, fromElement, null,
                    toElemWasInteractable);
            }
        }

        this.fireMouseEvent_(events.EventType.MOUSEMOVE, null, null,
            toElemWasInteractable);

        // IE fires the mouseover event after the mousemove.
        if (userAgent.IS_IE && element !== fromElement) {
            this.fireMouseEvent_(events.EventType.MOUSEOVER, fromElement, null,
                toElemWasInteractable);
        }

        this.nextClickIsDoubleClick_ = false;
    }

    /**
     * Scrolls the wheel of the mouse by the given number of ticks, where a positive
     * number indicates a downward scroll and a negative is upward scroll.
     */
    scroll(ticks: number): void {
        if (ticks === 0) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Must scroll a non-zero number of ticks.');
        }

        // The wheelDelta value for a single up-tick of the mouse wheel is 120, and
        // a single down-tick is -120. The deltas in pixels (which is only relevant
        // for Firefox) appears to be -57 and 57, respectively.
        const wheelDelta = ticks > 0 ? -120 : 120;
        const pixelDelta = ticks > 0 ? 57 : -57;

        // Browsers fire a separate event (or pair of events in Gecko) for each tick.
        for (let i = 0; i < Math.abs(ticks); i++) {
            this.fireMouseEvent_(events.EventType.MOUSEWHEEL, null, wheelDelta);
            if (userAgent.IS_FIREFOX) {
                this.fireMouseEvent_(events.EventType.MOUSEPIXELSCROLL, null,
                    pixelDelta);
            }
        }
    }

    /**
     * A helper function to fire mouse events.
     */
    private fireMouseEvent_(type: any, opt_related?: Element | null,
        opt_wheelDelta?: number | null, opt_force?: boolean, opt_count?: number): boolean {
        this.hasEverInteracted_ = true;
        if (userAgent.IS_IE && userAgent.isEngineVersion(10)) {
            const msPointerEvent = MOUSE_EVENT_MAP_.get(type);
            if (msPointerEvent) {
                // The pointerId for mouse events is always 1 and the mouse event is never
                // fired if the MSPointer event fails.
                const msPointerType = (window as any).MSPointerEvent?.MSPOINTER_TYPE_MOUSE || 2;
                if (!this.fireMSPointerEvent(msPointerEvent, new Coordinate(this.clientXY_.x, this.clientXY_.y),
                    this.getButtonValue_(msPointerEvent), MOUSE_MS_POINTER_ID,
                    msPointerType, /* isPrimary */ true,
                    opt_related || undefined, opt_force)) {
                    return false;
                }
            }
        }
        return this.fireMouseEvent(type, new Coordinate(this.clientXY_.x, this.clientXY_.y),
            this.getButtonValue_(type), opt_related || undefined, opt_wheelDelta || undefined, opt_force, undefined, opt_count);
    }

    /**
     * Given an event type and a mouse button, sets the mouse button value used
     * for that event on the current browser.
     */
    private getButtonValue_(eventType: any): number {
        if (!MOUSE_BUTTON_VALUE_MAP_.has(eventType)) {
            return 0;
        }

        const buttonIndex = this.buttonPressed_ === null ?
            NO_BUTTON_VALUE_INDEX : this.buttonPressed_;
        const buttonValue = MOUSE_BUTTON_VALUE_MAP_.get(eventType)![buttonIndex];
        if (buttonValue === null) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Event does not permit the specified mouse button.');
        }
        return buttonValue;
    }

    /**
     * Serialize the current state of the mouse.
     */
    getState(): MouseState {
        return {
            buttonPressed: this.buttonPressed_,
            elementPressed: this.elementPressed_ || undefined,
            clientXY: { x: this.clientXY_.x, y: this.clientXY_.y },
            nextClickIsDoubleClick: this.nextClickIsDoubleClick_,
            hasEverInteracted: this.hasEverInteracted_,
            element: this.getElement()
        };
    }
}
