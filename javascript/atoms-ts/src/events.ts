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
 * Functions to do with firing and simulating events.
 */

import { WebDriverError, ErrorCode } from './error';
import * as userAgent from './userAgent';

/**
 * Whether the browser supports the construction of touch events.
 */
export const SUPPORTS_TOUCH_EVENTS = !(userAgent.IS_IE &&
    !userAgent.isEngineVersion(10));

/**
 * Whether the browser supports a native touch api.
 */
const BROKEN_TOUCH_API = (() => {
    if (userAgent.IS_ANDROID) {
        // Native touch api supported starting in version 4.0 (Ice Cream Sandwich).
        return !userAgent.isProductVersion(4);
    }
    return !userAgent.IS_IOS;
})();

/**
 * Whether the browser supports the construction of MSPointer events.
 */
export const SUPPORTS_MSPOINTER_EVENTS =
    userAgent.IS_IE && !!(navigator as any).msPointerEnabled;

/**
 * Arguments to initialize a mouse event.
 */
export interface MouseArgs {
    clientX: number;
    clientY: number;
    button: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    relatedTarget?: Element;
    wheelDelta: number;
}

/**
 * Arguments to initialize a keyboard event.
 */
export interface KeyboardArgs {
    keyCode: number;
    charCode: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    preventDefault: boolean;
}

/**
 * A single touch in a touch event.
 */
export interface Touch {
    identifier: number;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
}

/**
 * Argument to initialize a touch event.
 */
export interface TouchArgs {
    touches: Touch[];
    targetTouches: Touch[];
    changedTouches: Touch[];
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    relatedTarget?: Element;
    scale: number;
    rotation: number;
    clientX?: number;
    clientY?: number;
}

/**
 * Arguments to initialize an MSGesture event.
 */
export interface MSGestureArgs {
    clientX: number;
    clientY: number;
    translationX: number;
    translationY: number;
    scale: number;
    expansion: number;
    rotation: number;
    velocityX: number;
    velocityY: number;
    velocityExpansion: number;
    velocityAngular: number;
    relatedTarget?: Element;
}

/**
 * Arguments to initialize an MSPointer event.
 */
export interface MSPointerArgs {
    clientX: number;
    clientY: number;
    button: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    relatedTarget?: Element;
    width: number;
    height: number;
    pressure: number;
    rotation: number;
    pointerId: number;
    tiltX: number;
    tiltY: number;
    pointerType: number;
    isPrimary: boolean;
}

/**
 * Union type of all event argument types
 */
export type EventArgs = MouseArgs | KeyboardArgs | TouchArgs | MSGestureArgs | MSPointerArgs;

/**
 * Enum representing which mechanism to use for creating touch events.
 */
enum TouchEventStrategy {
    MOUSE_EVENTS = 1,
    INIT_TOUCH_EVENT = 2,
    TOUCH_EVENT_CTOR = 3
}

/**
 * Factory for event objects of a specific type.
 */
class EventFactory {
    protected type: string;
    protected bubbles: boolean;
    protected cancelable: boolean;

    constructor(type: string, bubbles: boolean, cancelable: boolean) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
    }

    /**
     * Creates an event.
     */
    create(target: Element | Window, opt_args?: EventArgs): Event {
        const doc = target instanceof Window ? target.document : (target as Element).ownerDocument!;
        const event = doc.createEvent('HTMLEvents');
        event.initEvent(this.type, this.bubbles, this.cancelable);
        return event;
    }

    /**
     * String representation of the event type.
     */
    toString(): string {
        return this.type;
    }
}

/**
 * Factory for mouse event objects of a specific type.
 */
class MouseEventFactory extends EventFactory {
    create(target: Element | Window, opt_args?: EventArgs): Event {
        const args = opt_args as MouseArgs;
        const doc = target instanceof Window ? target.document : (target as Element).ownerDocument!;
        const view = target instanceof Window ? target : doc.defaultView!;

        // Only Gecko supports the mouse pixel scroll event
        if (!userAgent.IS_FIREFOX && this.type === 'MozMousePixelScroll') {
            throw new WebDriverError(ErrorCode.UNSUPPORTED_OPERATION,
                'Browser does not support a mouse pixel scroll event.');
        }

        const event = doc.createEvent('MouseEvents');
        let detail = 1;

        // All browsers but Firefox provide the wheelDelta value in the event.
        // Firefox provides the scroll amount in the detail field.
        if (this.type === 'mousewheel' || this.type === 'DOMMouseScroll') {
            if (!userAgent.IS_FIREFOX) {
                (event as any).wheelDelta = args.wheelDelta;
            }
            if (userAgent.IS_FIREFOX) {
                detail = args.wheelDelta / -40;
            }
        }

        // Only Gecko supports a mouse pixel scroll event
        if (userAgent.IS_FIREFOX && this.type === 'MozMousePixelScroll') {
            detail = args.wheelDelta;
        }

        // For screenX and screenY, we set those to clientX and clientY values.
        event.initMouseEvent(this.type, this.bubbles, this.cancelable, view,
            detail, args.clientX, args.clientY,
            args.clientX, args.clientY, args.ctrlKey, args.altKey,
            args.shiftKey, args.metaKey, args.button, args.relatedTarget || null);

        // For IE, define getters for pageX and pageY if needed
        if (userAgent.IS_IE && (event as any).pageX === 0 && (event as any).pageY === 0) {
            try {
                const scrollElem = doc.documentElement;
                const clientElem = doc.documentElement;
                const pageX = args.clientX + scrollElem.scrollLeft - clientElem.clientLeft;
                const pageY = args.clientY + scrollElem.scrollTop - clientElem.clientTop;

                Object.defineProperty(event, 'pageX', {
                    get: () => pageX
                });
                Object.defineProperty(event, 'pageY', {
                    get: () => pageY
                });
            } catch (e) {
                // Ignore if we can't define properties
            }
        }

        return event;
    }
}

/**
 * Factory for keyboard event objects of a specific type.
 */
class KeyboardEventFactory extends EventFactory {
    create(target: Element | Window, opt_args?: EventArgs): Event {
        const args = opt_args as KeyboardArgs;
        const doc = target instanceof Window ? target.document : (target as Element).ownerDocument!;
        const view = target instanceof Window ? target : doc.defaultView!;

        let event: any;

        // Firefox has special handling for keyboard events
        if (userAgent.IS_FIREFOX && !userAgent.isEngineVersion('93')) {
            const keyCode = args.charCode ? 0 : args.keyCode;
            event = doc.createEvent('KeyboardEvent');
            (event as any).initKeyEvent(this.type, this.bubbles, this.cancelable, view,
                args.ctrlKey, args.altKey, args.shiftKey, args.metaKey, keyCode,
                args.charCode);
            // https://bugzilla.mozilla.org/show_bug.cgi?id=501496
            if (this.type === 'keypress' && args.preventDefault) {
                event.preventDefault();
            }
        } else {
            event = doc.createEvent('Events');
            event.initEvent(this.type, this.bubbles, this.cancelable);
            event.altKey = args.altKey;
            event.ctrlKey = args.ctrlKey;
            event.metaKey = args.metaKey;
            event.shiftKey = args.shiftKey;
            if (userAgent.IS_FIREFOX) {
                event.keyCode = args.charCode ? 0 : args.keyCode;
                event.charCode = args.charCode;
            } else {
                event.keyCode = args.charCode || args.keyCode;
                if ((userAgent as any).IS_WEBKIT || userAgent.IS_EDGE) {
                    event.charCode = this.type === 'keypress' ? event.keyCode : 0;
                }
            }
        }

        return event;
    }
}

/**
 * Factory for touch event objects of a specific type.
 */
class TouchEventFactory extends EventFactory {
    create(target: Element | Window, opt_args?: EventArgs): Event {
        if (!SUPPORTS_TOUCH_EVENTS) {
            throw new WebDriverError(ErrorCode.UNSUPPORTED_OPERATION,
                'Browser does not support firing touch events.');
        }

        const args = opt_args as TouchArgs;
        const doc = target instanceof Window ? target.document : (target as Element).ownerDocument!;
        const view = target instanceof Window ? target : doc.defaultView!;
        const elem = target instanceof Window ? doc.documentElement : (target as Element);
        // Set clientX/clientY from first touch if not provided
        if (!args.clientX && args.touches?.length > 0) {
            args.clientX = args.touches[0].clientX;
            args.clientY = args.touches[0].clientY;
        }

        // Creates a TouchList using native touch Api
        const createNativeTouchList = (touchListArgs: Touch[]): any => {
            const touches = touchListArgs.map((touchArg) =>
                (doc as any).createTouch(view, elem, touchArg.identifier,
                    touchArg.pageX, touchArg.pageY, touchArg.screenX, touchArg.screenY)
            );
            return (doc as any).createTouchList(...touches);
        };

        // Creates a TouchList using simulated touch Api
        const createGenericTouchList = (touchListArgs: Touch[]): any => {
            const touches = touchListArgs.map((touchArg) => ({
                identifier: touchArg.identifier,
                screenX: touchArg.screenX,
                screenY: touchArg.screenY,
                clientX: touchArg.clientX,
                clientY: touchArg.clientY,
                pageX: touchArg.pageX,
                pageY: touchArg.pageY,
                target: elem
            }));
            (touches as any).item = function (i: number) {
                return touches[i];
            };
            return touches;
        };

        // Creates a TouchList using TouchEvent constructor
        const createTouchEventTouchList = (touchListArgs: Touch[]): any => {
            return touchListArgs.map((touchArg) =>
                new (window as any).Touch({
                    identifier: touchArg.identifier,
                    screenX: touchArg.screenX,
                    screenY: touchArg.screenY,
                    clientX: touchArg.clientX,
                    clientY: touchArg.clientY,
                    pageX: touchArg.pageX,
                    pageY: touchArg.pageY,
                    target: elem
                })
            );
        };

        // Determine which strategy to use
        let strategy: TouchEventStrategy;
        if (BROKEN_TOUCH_API) {
            strategy = TouchEventStrategy.MOUSE_EVENTS;
        } else {
            const TouchEventConstructor = (window as any).TouchEvent;
            if (TouchEventConstructor && (TouchEventConstructor.prototype as any).initTouchEvent) {
                strategy = TouchEventStrategy.INIT_TOUCH_EVENT;
            } else if (TouchEventConstructor && TouchEventConstructor.length > 0) {
                strategy = TouchEventStrategy.TOUCH_EVENT_CTOR;
            } else {
                throw new WebDriverError(
                    ErrorCode.UNSUPPORTED_OPERATION,
                    'Not able to create touch events in this browser');
            }
        }

        // Create touch lists using the selected strategy
        const createTouchList = (strat: TouchEventStrategy, touches: Touch[]): any => {
            switch (strat) {
                case TouchEventStrategy.MOUSE_EVENTS:
                    return createGenericTouchList(touches);
                case TouchEventStrategy.INIT_TOUCH_EVENT:
                    return createNativeTouchList(touches);
                case TouchEventStrategy.TOUCH_EVENT_CTOR:
                    return createTouchEventTouchList(touches);
            }
            return null;
        };

        // As a performance optimization, reuse created touchlists when possible
        const changedTouches = createTouchList(strategy, args.changedTouches);
        const touches = (args.touches === args.changedTouches) ?
            changedTouches : createTouchList(strategy, args.touches);
        const targetTouches = (args.targetTouches === args.changedTouches) ?
            changedTouches : createTouchList(strategy, args.targetTouches);

        let event: any;
        if (strategy === TouchEventStrategy.MOUSE_EVENTS) {
            event = doc.createEvent('MouseEvents');
            event.initMouseEvent(this.type, this.bubbles, this.cancelable, view,
                1, 0, 0, args.clientX || 0, args.clientY || 0,
                args.ctrlKey, args.altKey, args.shiftKey, args.metaKey, 0,
                args.relatedTarget || null);
            event.touches = touches;
            event.targetTouches = targetTouches;
            event.changedTouches = changedTouches;
            event.scale = args.scale;
            event.rotation = args.rotation;
        } else if (strategy === TouchEventStrategy.INIT_TOUCH_EVENT) {
            event = doc.createEvent('TouchEvent');
            // Different browsers have different implementations of initTouchEvent
            if (event.initTouchEvent.length === 0) {
                // Chrome/Android
                event.initTouchEvent(touches, targetTouches, changedTouches,
                    this.type, view, 0, 0, args.clientX || 0,
                    args.clientY || 0, args.ctrlKey, args.altKey, args.shiftKey, args.metaKey);
            } else {
                // iOS
                event.initTouchEvent(this.type, this.bubbles, this.cancelable, view,
                    1, 0, 0, args.clientX || 0,
                    args.clientY || 0, args.ctrlKey, args.altKey, args.shiftKey, args.metaKey,
                    touches, targetTouches, changedTouches, args.scale, args.rotation);
            }
            event.relatedTarget = args.relatedTarget || null;
        } else if (strategy === TouchEventStrategy.TOUCH_EVENT_CTOR) {
            const touchProperties = {
                touches,
                targetTouches,
                changedTouches,
                bubbles: this.bubbles,
                cancelable: this.cancelable,
                ctrlKey: args.ctrlKey,
                shiftKey: args.shiftKey,
                altKey: args.altKey,
                metaKey: args.metaKey
            };
            event = new (window as any).TouchEvent(this.type, touchProperties);
        } else {
            throw new WebDriverError(
                ErrorCode.UNSUPPORTED_OPERATION,
                'Illegal TouchEventStrategy value (this is a bug)');
        }

        return event;
    }
}

/**
 * Factory for MSGesture event objects of a specific type.
 */
class MSGestureEventFactory extends EventFactory {
    create(target: Element | Window, opt_args?: EventArgs): Event {
        if (!SUPPORTS_MSPOINTER_EVENTS) {
            throw new WebDriverError(ErrorCode.UNSUPPORTED_OPERATION,
                'Browser does not support MSGesture events.');
        }

        const args = opt_args as MSGestureArgs;
        const doc = target instanceof Window ? target.document : (target as Element).ownerDocument!;
        const view = target instanceof Window ? target : doc.defaultView!;
        const event = doc.createEvent('MSGestureEvent');
        const timestamp = Date.now();

        // See http://msdn.microsoft.com/en-us/library/windows/apps/hh441187.aspx
        (event as any).initGestureEvent(this.type, this.bubbles, this.cancelable, view,
            1, 0, 0,
            args.clientX, args.clientY, 0, 0,
            args.translationX, args.translationY,
            args.scale, args.expansion, args.rotation,
            args.velocityX, args.velocityY, args.velocityExpansion,
            args.velocityAngular, timestamp, args.relatedTarget || null);
        return event;
    }
}

/**
 * Factory for MSPointer event objects of a specific type.
 */
class MSPointerEventFactory extends EventFactory {
    create(target: Element | Window, opt_args?: EventArgs): Event {
        if (!SUPPORTS_MSPOINTER_EVENTS) {
            throw new WebDriverError(ErrorCode.UNSUPPORTED_OPERATION,
                'Browser does not support MSPointer events.');
        }

        const args = opt_args as MSPointerArgs;
        const doc = target instanceof Window ? target.document : (target as Element).ownerDocument!;
        const view = target instanceof Window ? target : doc.defaultView!;
        const event = doc.createEvent('MSPointerEvent');

        // See http://msdn.microsoft.com/en-us/library/ie/hh772109(v=vs.85).aspx
        (event as any).initPointerEvent(this.type, this.bubbles, this.cancelable, view,
            0, 0, 0,
            args.clientX, args.clientY, args.ctrlKey, args.altKey,
            args.shiftKey, args.metaKey, args.button,
            args.relatedTarget || null, 0, 0,
            args.width, args.height, args.pressure, args.rotation,
            args.tiltX, args.tiltY, args.pointerId,
            args.pointerType, 0, args.isPrimary);

        return event;
    }
}

/**
 * The types of events this module supports firing.
 *
 * See http://en.wikipedia.org/wiki/DOM_events and
 * http://www.w3.org/Submission/pointer-events/#pointer-event-types
 */
export const EventType = {
    BLUR: new EventFactory('blur', false, false),
    CHANGE: new EventFactory('change', true, false),
    FOCUS: new EventFactory('focus', false, false),
    FOCUSIN: new EventFactory('focusin', true, false),
    FOCUSOUT: new EventFactory('focusout', true, false),
    INPUT: new EventFactory('input', true, false),
    ORIENTATIONCHANGE: new EventFactory('orientationchange', false, false),
    PROPERTYCHANGE: new EventFactory('propertychange', false, false),
    SELECT: new EventFactory('select', true, false),
    SUBMIT: new EventFactory('submit', true, true),
    TEXTINPUT: new EventFactory('textInput', true, true),

    // Mouse events
    CLICK: new MouseEventFactory('click', true, true),
    CONTEXTMENU: new MouseEventFactory('contextmenu', true, true),
    DBLCLICK: new MouseEventFactory('dblclick', true, true),
    MOUSEDOWN: new MouseEventFactory('mousedown', true, true),
    MOUSEMOVE: new MouseEventFactory('mousemove', true, false),
    MOUSEOUT: new MouseEventFactory('mouseout', true, true),
    MOUSEOVER: new MouseEventFactory('mouseover', true, true),
    MOUSEUP: new MouseEventFactory('mouseup', true, true),
    MOUSEWHEEL: new MouseEventFactory(
        userAgent.IS_FIREFOX ? 'DOMMouseScroll' : 'mousewheel', true, true),
    MOUSEPIXELSCROLL: new MouseEventFactory('MozMousePixelScroll', true, true),

    // Keyboard events
    KEYDOWN: new KeyboardEventFactory('keydown', true, true),
    KEYPRESS: new KeyboardEventFactory('keypress', true, true),
    KEYUP: new KeyboardEventFactory('keyup', true, true),

    // Touch events
    TOUCHEND: new TouchEventFactory('touchend', true, true),
    TOUCHMOVE: new TouchEventFactory('touchmove', true, true),
    TOUCHSTART: new TouchEventFactory('touchstart', true, true),

    // MSGesture events
    MSGESTURECHANGE: new MSGestureEventFactory('MSGestureChange', true, true),
    MSGESTUREEND: new MSGestureEventFactory('MSGestureEnd', true, true),
    MSGESTUREHOLD: new MSGestureEventFactory('MSGestureHold', true, true),
    MSGESTURESTART: new MSGestureEventFactory('MSGestureStart', true, true),
    MSGESTURETAP: new MSGestureEventFactory('MSGestureTap', true, true),
    MSINERTIASTART: new MSGestureEventFactory('MSInertiaStart', true, true),

    // MSPointer events
    MSGOTPOINTERCAPTURE: new MSPointerEventFactory('MSGotPointerCapture', true, false),
    MSLOSTPOINTERCAPTURE: new MSPointerEventFactory('MSLostPointerCapture', true, false),
    MSPOINTERCANCEL: new MSPointerEventFactory('MSPointerCancel', true, true),
    MSPOINTERDOWN: new MSPointerEventFactory('MSPointerDown', true, true),
    MSPOINTERMOVE: new MSPointerEventFactory('MSPointerMove', true, true),
    MSPOINTEROVER: new MSPointerEventFactory('MSPointerOver', true, true),
    MSPOINTEROUT: new MSPointerEventFactory('MSPointerOut', true, true),
    MSPOINTERUP: new MSPointerEventFactory('MSPointerUp', true, true)
};

/**
 * Fire a named event on a particular element.
 */
export function fire(
    target: Element | Window,
    type: EventFactory,
    opt_args?: EventArgs
): boolean {
    const event = type.create(target, opt_args);

    // Ensure the event's isTrusted property is set to false
    if (!('isTrusted' in event)) {
        (event as any).isTrusted = false;
    }
    return target.dispatchEvent(event);
}

/**
 * Returns whether the event was synthetically created by the atoms;
 * if false, was created by the browser in response to a live user action.
 */
export function isSynthetic(event: Event | any): boolean {
    const e = event.getBrowserEvent ? event.getBrowserEvent() : event;
    return 'isTrusted' in e ? !(e as any).isTrusted : false;
}
