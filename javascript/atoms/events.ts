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
 * @fileoverview Functions to do with firing and simulating events.
 */

import { BotError, ErrorCode } from './error';
import {
  IE,
  GECKO,
  WEBKIT,
  EDGE,
  ANDROID,
  IOS,
  isEngineVersion,
  isProductVersion,
} from './userAgent';
import { getWindow } from './bot';

// ============================================================================
// Type Definitions
// ============================================================================

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
  relatedTarget: Element | null;
  wheelDelta: number;
  count?: number;
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
 * Touch information.
 */
export interface TouchInfo {
  identifier: number;
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
}

/**
 * Arguments to initialize a touch event.
 */
export interface TouchArgs {
  touches: TouchInfo[];
  targetTouches: TouchInfo[];
  changedTouches: TouchInfo[];
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  relatedTarget: Element | null;
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
  relatedTarget: Element | null;
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
  relatedTarget: Element | null;
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
 * Union of all event arguments.
 */
export type EventArgs =
  | MouseArgs
  | KeyboardArgs
  | TouchArgs
  | MSGestureArgs
  | MSPointerArgs;

// ============================================================================
// Browser Capabilities
// ============================================================================

/**
 * Whether the browser supports the construction of touch events.
 */
export const SUPPORTS_TOUCH_EVENTS: boolean = !(IE && !isEngineVersion(10));

/**
 * Whether the browser supports a native touch api.
 */
const BROKEN_TOUCH_API: boolean = (function () {
  if (ANDROID) {
    return !isProductVersion(4);
  }
  return !IOS;
})();

/**
 * Whether the browser supports the construction of MSPointer events.
 */
export const SUPPORTS_MSPOINTER_EVENTS: boolean =
  IE && !!(getWindow().navigator as { msPointerEnabled?: boolean })?.msPointerEnabled;

// ============================================================================
// Event Factory Base Class
// ============================================================================

/**
 * Factory for event objects of a specific type.
 */
export class EventFactory {
  constructor(
    protected type: string,
    protected bubbles: boolean,
    protected cancelable: boolean
  ) {}

  /**
   * Creates an event.
   */
  create(target: Element | Window, _args?: EventArgs): Event {
    const doc =
      'ownerDocument' in target
        ? target.ownerDocument!
        : (target as Window).document;

    const event = doc.createEvent('HTMLEvents');
    event.initEvent(this.type, this.bubbles, this.cancelable);

    return event;
  }

  /**
   * Returns the event type string.
   */
  toString(): string {
    return this.type;
  }
}

// ============================================================================
// Mouse Event Factory
// ============================================================================

/**
 * Factory for mouse event objects of a specific type.
 */
export class MouseEventFactory extends EventFactory {
  override create(target: Element | Window, opt_args?: EventArgs): Event {
    const args = opt_args as MouseArgs;
    const doc =
      'ownerDocument' in target
        ? target.ownerDocument!
        : (target as Window).document;

    const view = 'defaultView' in doc ? doc.defaultView : window;
    const event = doc.createEvent('MouseEvents') as MouseEvent;
    let detail = args.count || 1;

    if (this.type === 'mousewheel' || this.type === 'DOMMouseScroll') {
      if (!GECKO) {
        (event as MouseEvent & { wheelDelta?: number }).wheelDelta =
          args.wheelDelta;
      }
      if (GECKO) {
        detail = args.wheelDelta / -40;
      }
    }

    if (GECKO && this.type === 'MozMousePixelScroll') {
      detail = args.wheelDelta;
    }

    event.initMouseEvent(
      this.type,
      this.bubbles,
      this.cancelable,
      view!,
      detail,
      args.clientX,
      args.clientY,
      args.clientX,
      args.clientY,
      args.ctrlKey,
      args.altKey,
      args.shiftKey,
      args.metaKey,
      args.button,
      args.relatedTarget
    );

    if (
      IE &&
      event.pageX === 0 &&
      event.pageY === 0 &&
      Object.defineProperty
    ) {
      const scrollElem = doc.documentElement || doc.body;
      const clientElem = doc.documentElement || doc.body;
      const pageX =
        args.clientX + scrollElem.scrollLeft - (clientElem.clientLeft || 0);
      const pageY =
        args.clientY + scrollElem.scrollTop - (clientElem.clientTop || 0);

      Object.defineProperty(event, 'pageX', {
        get: function () {
          return pageX;
        },
      });
      Object.defineProperty(event, 'pageY', {
        get: function () {
          return pageY;
        },
      });
    }

    return event;
  }
}

// ============================================================================
// Keyboard Event Factory
// ============================================================================

interface KeyboardEventWithInit extends KeyboardEvent {
  initKeyEvent?(
    type: string,
    bubbles: boolean,
    cancelable: boolean,
    view: Window | null,
    ctrlKey: boolean,
    altKey: boolean,
    shiftKey: boolean,
    metaKey: boolean,
    keyCode: number,
    charCode: number
  ): void;
}

/**
 * Factory for keyboard event objects of a specific type.
 */
export class KeyboardEventFactory extends EventFactory {
  override create(target: Element | Window, opt_args?: EventArgs): Event {
    const args = opt_args as KeyboardArgs;
    const doc =
      'ownerDocument' in target
        ? target.ownerDocument!
        : (target as Window).document;

    let event: Event & {
      altKey?: boolean;
      ctrlKey?: boolean;
      metaKey?: boolean;
      shiftKey?: boolean;
      keyCode?: number;
      charCode?: number;
    };

    if (GECKO && !isEngineVersion(93)) {
      const view = 'defaultView' in doc ? doc.defaultView : window;
      const keyCode = args.charCode ? 0 : args.keyCode;
      event = doc.createEvent('KeyboardEvent') as KeyboardEventWithInit;
      (event as KeyboardEventWithInit).initKeyEvent?.(
        this.type,
        this.bubbles,
        this.cancelable,
        view,
        args.ctrlKey,
        args.altKey,
        args.shiftKey,
        args.metaKey,
        keyCode,
        args.charCode
      );
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
      if (GECKO) {
        event.keyCode = args.charCode ? 0 : args.keyCode;
        event.charCode = args.charCode;
      } else {
        event.keyCode = args.charCode || args.keyCode;
        if (WEBKIT || EDGE) {
          event.charCode = this.type === 'keypress' ? event.keyCode : 0;
        }
      }
    }

    return event;
  }
}

// ============================================================================
// Touch Event Factory
// ============================================================================

const enum TouchEventStrategy {
  MOUSE_EVENTS = 1,
  INIT_TOUCH_EVENT = 2,
  TOUCH_EVENT_CTOR = 3,
}

interface TouchEventWithInit extends TouchEvent {
  initTouchEvent?(...args: unknown[]): void;
}

/**
 * Factory for touch event objects of a specific type.
 */
export class TouchEventFactory extends EventFactory {
  override create(target: Element | Window, opt_args?: EventArgs): Event {
    if (!SUPPORTS_TOUCH_EVENTS) {
      throw new BotError(
        ErrorCode.UNSUPPORTED_OPERATION,
        'Browser does not support firing touch events.'
      );
    }

    const args = opt_args as TouchArgs;
    const doc =
      'ownerDocument' in target
        ? target.ownerDocument!
        : (target as Window).document;
    const view = 'defaultView' in doc ? doc.defaultView : window;

    const createNativeTouchList = (
      touchListArgs: TouchInfo[]
    ): TouchList | null => {
      const createTouch = (doc as Document & {
        createTouch?: (
          view: Window | null,
          target: EventTarget,
          identifier: number,
          pageX: number,
          pageY: number,
          screenX: number,
          screenY: number
        ) => Touch;
      }).createTouch;
      const createTouchList = (doc as Document & {
        createTouchList?: (...touches: Touch[]) => TouchList;
      }).createTouchList;

      if (!createTouch || !createTouchList) return null;

      const touches = touchListArgs.map((touchArg) =>
        createTouch.call(
          doc,
          view,
          target,
          touchArg.identifier,
          touchArg.pageX,
          touchArg.pageY,
          touchArg.screenX,
          touchArg.screenY
        )
      );

      return createTouchList.apply(doc, touches);
    };

    const createGenericTouchList = (
      touchListArgs: TouchInfo[]
    ): TouchInfo[] & { item: (i: number) => TouchInfo } => {
      const result: TouchInfo[] & { item: (i: number) => TouchInfo } = [] as unknown as TouchInfo[] & { item: (i: number) => TouchInfo };
      touchListArgs.forEach((touchArg) => {
        result.push({
          identifier: touchArg.identifier,
          screenX: touchArg.screenX,
          screenY: touchArg.screenY,
          clientX: touchArg.clientX,
          clientY: touchArg.clientY,
          pageX: touchArg.pageX,
          pageY: touchArg.pageY,
        });
      });
      result.item = function (i: number) {
        return result[i];
      };
      return result;
    };

    const createTouchEventTouchList = (
      touchListArgs: TouchInfo[]
    ): Touch[] => {
      return touchListArgs.map(
        (touchArg) =>
          new Touch({
            identifier: touchArg.identifier,
            target: target as EventTarget,
            screenX: touchArg.screenX,
            screenY: touchArg.screenY,
            clientX: touchArg.clientX,
            clientY: touchArg.clientY,
            pageX: touchArg.pageX,
            pageY: touchArg.pageY,
          })
      );
    };

    const createTouchList = (
      touchStrategy: TouchEventStrategy,
      touches: TouchInfo[]
    ): TouchList | Touch[] | (TouchInfo[] & { item: (i: number) => TouchInfo }) | null => {
      switch (touchStrategy) {
        case TouchEventStrategy.MOUSE_EVENTS:
          return createGenericTouchList(touches);
        case TouchEventStrategy.INIT_TOUCH_EVENT:
          return createNativeTouchList(touches);
        case TouchEventStrategy.TOUCH_EVENT_CTOR:
          return createTouchEventTouchList(touches);
      }
      return null;
    };

    let strategy: TouchEventStrategy;
    if (BROKEN_TOUCH_API) {
      strategy = TouchEventStrategy.MOUSE_EVENTS;
    } else {
      const TouchEventProto = (window as unknown as { TouchEvent?: { prototype?: { initTouchEvent?: unknown }; length?: number } }).TouchEvent;
      if (TouchEventProto?.prototype?.initTouchEvent) {
        strategy = TouchEventStrategy.INIT_TOUCH_EVENT;
      } else if (TouchEventProto && (TouchEventProto.length ?? 0) > 0) {
        strategy = TouchEventStrategy.TOUCH_EVENT_CTOR;
      } else {
        throw new BotError(
          ErrorCode.UNSUPPORTED_OPERATION,
          'Not able to create touch events in this browser'
        );
      }
    }

    const changedTouches = createTouchList(strategy, args.changedTouches);
    const touches =
      args.touches === args.changedTouches
        ? changedTouches
        : createTouchList(strategy, args.touches);
    const targetTouches =
      args.targetTouches === args.changedTouches
        ? changedTouches
        : createTouchList(strategy, args.targetTouches);

    let event: Event & {
      touches?: unknown;
      targetTouches?: unknown;
      changedTouches?: unknown;
      scale?: number;
      rotation?: number;
      relatedTarget?: Element | null;
    };

    if (strategy === TouchEventStrategy.MOUSE_EVENTS) {
      const mouseEvent = doc.createEvent('MouseEvents');
      mouseEvent.initMouseEvent(
        this.type,
        this.bubbles,
        this.cancelable,
        view!,
        1,
        0,
        0,
        args.clientX || 0,
        args.clientY || 0,
        args.ctrlKey,
        args.altKey,
        args.shiftKey,
        args.metaKey,
        0,
        args.relatedTarget
      );
      event = mouseEvent as unknown as Event & {
        touches?: unknown;
        targetTouches?: unknown;
        changedTouches?: unknown;
        scale?: number;
        rotation?: number;
        relatedTarget?: Element | null;
      };
      event.touches = touches;
      event.targetTouches = targetTouches;
      event.changedTouches = changedTouches;
      event.scale = args.scale;
      event.rotation = args.rotation;
    } else if (strategy === TouchEventStrategy.INIT_TOUCH_EVENT) {
      event = doc.createEvent('TouchEvent') as TouchEventWithInit;
      const initFn = (event as TouchEventWithInit).initTouchEvent;
      if (initFn && initFn.length === 0) {
        initFn.call(
          event,
          touches,
          targetTouches,
          changedTouches,
          this.type,
          view,
          0,
          0,
          args.clientX || 0,
          args.clientY || 0,
          args.ctrlKey,
          args.altKey,
          args.shiftKey,
          args.metaKey
        );
      } else if (initFn) {
        initFn.call(
          event,
          this.type,
          this.bubbles,
          this.cancelable,
          view,
          1,
          0,
          0,
          args.clientX || 0,
          args.clientY || 0,
          args.ctrlKey,
          args.altKey,
          args.shiftKey,
          args.metaKey,
          touches,
          targetTouches,
          changedTouches,
          args.scale,
          args.rotation
        );
      }
      event.relatedTarget = args.relatedTarget;
    } else if (strategy === TouchEventStrategy.TOUCH_EVENT_CTOR) {
      const touchProperties: TouchEventInit = {
        touches: touches as Touch[],
        targetTouches: targetTouches as Touch[],
        changedTouches: changedTouches as Touch[],
        bubbles: this.bubbles,
        cancelable: this.cancelable,
        ctrlKey: args.ctrlKey,
        shiftKey: args.shiftKey,
        altKey: args.altKey,
        metaKey: args.metaKey,
      };
      event = new TouchEvent(this.type, touchProperties);
    } else {
      throw new BotError(
        ErrorCode.UNSUPPORTED_OPERATION,
        'Illegal TouchEventStrategy value (this is a bug)'
      );
    }

    return event;
  }
}

// ============================================================================
// MSGesture Event Factory
// ============================================================================

interface MSGestureEvent extends Event {
  initGestureEvent(
    type: string,
    bubbles: boolean,
    cancelable: boolean,
    view: Window | null,
    detail: number,
    screenX: number,
    screenY: number,
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number,
    translationX: number,
    translationY: number,
    scale: number,
    expansion: number,
    rotation: number,
    velocityX: number,
    velocityY: number,
    velocityExpansion: number,
    velocityAngular: number,
    timestamp: number,
    relatedTarget: Element | null
  ): void;
}

/**
 * Factory for MSGesture event objects of a specific type.
 */
export class MSGestureEventFactory extends EventFactory {
  override create(target: Element | Window, opt_args?: EventArgs): Event {
    if (!SUPPORTS_MSPOINTER_EVENTS) {
      throw new BotError(
        ErrorCode.UNSUPPORTED_OPERATION,
        'Browser does not support MSGesture events.'
      );
    }

    const args = opt_args as MSGestureArgs;
    const doc =
      'ownerDocument' in target
        ? target.ownerDocument!
        : (target as Window).document;
    const view = 'defaultView' in doc ? doc.defaultView : window;
    const event = doc.createEvent('MSGestureEvent') as MSGestureEvent;
    const timestamp = new Date().getTime();

    event.initGestureEvent(
      this.type,
      this.bubbles,
      this.cancelable,
      view,
      1,
      0,
      0,
      args.clientX,
      args.clientY,
      0,
      0,
      args.translationX,
      args.translationY,
      args.scale,
      args.expansion,
      args.rotation,
      args.velocityX,
      args.velocityY,
      args.velocityExpansion,
      args.velocityAngular,
      timestamp,
      args.relatedTarget
    );

    return event;
  }
}

// ============================================================================
// MSPointer Event Factory
// ============================================================================

interface MSPointerEvent extends Event {
  initPointerEvent(
    type: string,
    bubbles: boolean,
    cancelable: boolean,
    view: Window | null,
    detail: number,
    screenX: number,
    screenY: number,
    clientX: number,
    clientY: number,
    ctrlKey: boolean,
    altKey: boolean,
    shiftKey: boolean,
    metaKey: boolean,
    button: number,
    relatedTarget: Element | null,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    pressure: number,
    rotation: number,
    tiltX: number,
    tiltY: number,
    pointerId: number,
    pointerType: number,
    hwTimestamp: number,
    isPrimary: boolean
  ): void;
}

/**
 * Factory for MSPointer event objects of a specific type.
 */
export class MSPointerEventFactory extends EventFactory {
  override create(target: Element | Window, opt_args?: EventArgs): Event {
    if (!SUPPORTS_MSPOINTER_EVENTS) {
      throw new BotError(
        ErrorCode.UNSUPPORTED_OPERATION,
        'Browser does not support MSPointer events.'
      );
    }

    const args = opt_args as MSPointerArgs;
    const doc =
      'ownerDocument' in target
        ? target.ownerDocument!
        : (target as Window).document;
    const view = 'defaultView' in doc ? doc.defaultView : window;
    const event = doc.createEvent('MSPointerEvent') as MSPointerEvent;

    event.initPointerEvent(
      this.type,
      this.bubbles,
      this.cancelable,
      view,
      0,
      0,
      0,
      args.clientX,
      args.clientY,
      args.ctrlKey,
      args.altKey,
      args.shiftKey,
      args.metaKey,
      args.button,
      args.relatedTarget,
      0,
      0,
      args.width,
      args.height,
      args.pressure,
      args.rotation,
      args.tiltX,
      args.tiltY,
      args.pointerId,
      args.pointerType,
      0,
      args.isPrimary
    );

    return event;
  }
}

// ============================================================================
// Event Type Registry
// ============================================================================

/**
 * The types of events this module supports firing.
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

  // Mouse events.
  CLICK: new MouseEventFactory('click', true, true),
  CONTEXTMENU: new MouseEventFactory('contextmenu', true, true),
  DBLCLICK: new MouseEventFactory('dblclick', true, true),
  MOUSEDOWN: new MouseEventFactory('mousedown', true, true),
  MOUSEMOVE: new MouseEventFactory('mousemove', true, false),
  MOUSEOUT: new MouseEventFactory('mouseout', true, true),
  MOUSEOVER: new MouseEventFactory('mouseover', true, true),
  MOUSEUP: new MouseEventFactory('mouseup', true, true),
  MOUSEWHEEL: new MouseEventFactory(
    GECKO ? 'DOMMouseScroll' : 'mousewheel',
    true,
    true
  ),
  MOUSEPIXELSCROLL: new MouseEventFactory('MozMousePixelScroll', true, true),

  // Keyboard events.
  KEYDOWN: new KeyboardEventFactory('keydown', true, true),
  KEYPRESS: new KeyboardEventFactory('keypress', true, true),
  KEYUP: new KeyboardEventFactory('keyup', true, true),

  // Touch events.
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
  MSGOTPOINTERCAPTURE: new MSPointerEventFactory(
    'MSGotPointerCapture',
    true,
    false
  ),
  MSLOSTPOINTERCAPTURE: new MSPointerEventFactory(
    'MSLostPointerCapture',
    true,
    false
  ),
  MSPOINTERCANCEL: new MSPointerEventFactory('MSPointerCancel', true, true),
  MSPOINTERDOWN: new MSPointerEventFactory('MSPointerDown', true, true),
  MSPOINTERMOVE: new MSPointerEventFactory('MSPointerMove', true, true),
  MSPOINTEROVER: new MSPointerEventFactory('MSPointerOver', true, true),
  MSPOINTEROUT: new MSPointerEventFactory('MSPointerOut', true, true),
  MSPOINTERUP: new MSPointerEventFactory('MSPointerUp', true, true),
} as const;

// ============================================================================
// Event Firing Functions
// ============================================================================

/**
 * Fire a named event on a particular element.
 */
export function fire(
  target: Element | Window,
  type: EventFactory,
  args?: EventArgs
): boolean {
  const event = type.create(target, args);

  if (!('isTrusted' in event)) {
    (event as Event & { isTrusted?: boolean }).isTrusted = false;
  }
  return target.dispatchEvent(event);
}

/**
 * Returns whether the event was synthetically created by the atoms;
 * if false, was created by the browser in response to a live user action.
 */
export function isSynthetic(
  event: Event | { getBrowserEvent?: () => Event }
): boolean {
  const e =
    'getBrowserEvent' in event && event.getBrowserEvent
      ? event.getBrowserEvent()
      : event;
  return 'isTrusted' in e ? !(e as Event & { isTrusted?: boolean }).isTrusted : false;
}
