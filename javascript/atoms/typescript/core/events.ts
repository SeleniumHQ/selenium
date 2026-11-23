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

// Builds synthetic DOM events and dispatches them, for the interaction atoms.
//
// bot.events used document.createEvent + initMouseEvent, assigned key fields
// onto plain Events, and fired no pointer, beforeinput or mouseenter/leave
// events at all. This builds every event with its constructor so listeners
// see what real input gives them: key/code on key events, inputType/data on
// input events, buttons and a real click count on mouse events, pointer
// events, and `composed` set wherever the browser sets it -- without which a
// click inside a shadow root never reaches a document listener.
//
// What stays different from real input is unavoidable: isTrusted is false,
// and an untrusted event runs no default action except a click's activation
// behaviour, so the callers insert text and toggle options themselves.
//
// Not ported, with where they were used: touch (touchscreen), MSGesture /
// MSPointer (Internet Explorer), mouse wheel and MozMousePixelScroll
// (scrolling), orientationchange (touchscreen), propertychange (IE).

interface Modifiers {
  altKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
}

export interface MouseArgs extends Modifiers {
  clientX: number
  clientY: number
  button?: number
  // The buttons held *after* this event, as the browser reports them: 1 on
  // mousedown of the primary button, 0 on its mouseup.
  buttons?: number
  // The click count for click, mousedown and mouseup; 0 for the others.
  detail?: number
  relatedTarget?: EventTarget | null
}

export interface PointerArgs extends MouseArgs {
  pointerId?: number
  pointerType?: string
  isPrimary?: boolean
}

export interface KeyboardArgs extends Modifiers {
  key: string
  code: string
  // The legacy numbers are the caller's to choose: they differ by engine on
  // keydown and keyup (Firefox reports 61 for '=', Chrome 187) and are the
  // character code on keypress in both.
  keyCode?: number
  charCode?: number
  location?: number
  repeat?: boolean
}

export interface InputArgs {
  inputType: string
  data?: string | null
}

export interface TextArgs {
  data: string
}

export interface FocusArgs {
  relatedTarget?: EventTarget | null
}

export interface SubmitArgs {
  submitter?: HTMLElement | null
}

type Target = Element | Document | Window

// goog.dom.getOwnerDocument: a document is its own owner.
function ownerDocument(target: Target): Document {
  if ((target as Node).nodeType === Node.DOCUMENT_NODE) {
    return target as Document
  }
  return (target as Element).ownerDocument || (target as Window).document
}

// Constructors come from the target's own window, so a listener in a frame
// that checks `event instanceof MouseEvent` sees its own realm's class.
function realm(target: Target): Window & typeof globalThis {
  return (ownerDocument(target).defaultView || window) as Window & typeof globalThis
}

interface Shape {
  bubbles: boolean
  cancelable: boolean
  composed: boolean
}

type Build<A> = (win: Window & typeof globalThis, type: string, shape: Shape, args: A) => Event

// One factory per event type. toString gives the DOM event name, so a factory
// can key a map or be handed to addEventListener-style code directly.
export class EventFactory<A = unknown> {
  constructor(
    private readonly type: string,
    private readonly shape: Shape,
    private readonly build: Build<A>,
  ) {}

  create(target: Target, args: A): Event {
    return this.build(realm(target), this.type, this.shape, args)
  }

  toString(): string {
    return this.type
  }
}

function modifiers(args: Modifiers): Modifiers {
  return {
    altKey: !!args.altKey,
    ctrlKey: !!args.ctrlKey,
    shiftKey: !!args.shiftKey,
    metaKey: !!args.metaKey,
  }
}

// screenX/Y mirror clientX/Y. Not strictly correct, but pages under test
// depend on relative positions, which this preserves, and the true screen
// offset of the viewport is not knowable from script.
function mouseInit(win: Window, shape: Shape, args: MouseArgs): MouseEventInit {
  return {
    ...shape,
    ...modifiers(args),
    view: win,
    detail: args.detail ?? 0,
    clientX: args.clientX,
    clientY: args.clientY,
    screenX: args.clientX,
    screenY: args.clientY,
    button: args.button ?? 0,
    buttons: args.buttons ?? 0,
    relatedTarget: args.relatedTarget ?? null,
  }
}

const plain: Build<unknown> = (win, type, shape) => new win.Event(type, shape)

const focus: Build<FocusArgs | undefined> = (win, type, shape, args) =>
  new win.FocusEvent(type, { ...shape, view: win, relatedTarget: args?.relatedTarget ?? null })

const mouse: Build<MouseArgs> = (win, type, shape, args) => new win.MouseEvent(type, mouseInit(win, shape, args))

// A mouse's pointer: id 1, primary, 1x1, and the spec's 0.5 pressure while a
// button is held.
const pointer: Build<PointerArgs> = (win, type, shape, args) =>
  new win.PointerEvent(type, {
    ...mouseInit(win, shape, args),
    pointerId: args.pointerId ?? 1,
    pointerType: args.pointerType ?? 'mouse',
    isPrimary: args.isPrimary ?? true,
    width: 1,
    height: 1,
    pressure: args.buttons ? 0.5 : 0,
  })

// keyCode, charCode and which are the legacy members of KeyboardEventInit;
// Chrome and Firefox both honour them.
const keyboard: Build<KeyboardArgs> = (win, type, shape, args) =>
  new win.KeyboardEvent(type, {
    ...shape,
    ...modifiers(args),
    view: win,
    key: args.key,
    code: args.code,
    location: args.location ?? 0,
    repeat: !!args.repeat,
    keyCode: args.keyCode ?? 0,
    charCode: args.charCode ?? 0,
    which: args.keyCode || args.charCode || 0,
  } as KeyboardEventInit)

const input: Build<InputArgs> = (win, type, shape, args) =>
  new win.InputEvent(type, { ...shape, view: win, inputType: args.inputType, data: args.data ?? null })

// textInput is the legacy TextEvent, which has no constructor. Chrome, Firefox
// and Safari all still fire it between beforeinput and input, and some
// editors still listen for it.
const text: Build<TextArgs> = (win, type, shape, args) => {
  const event = win.document.createEvent('TextEvent') as Event & {
    initTextEvent(type: string, bubbles: boolean, cancelable: boolean, view: Window, data: string): void
  }
  event.initTextEvent(type, shape.bubbles, shape.cancelable, win, args.data)
  return event
}

const submit: Build<SubmitArgs | undefined> = (win, type, shape, args) =>
  new win.SubmitEvent(type, { ...shape, submitter: args?.submitter ?? null })

// Bubbles / cancelable / composed as UI Events, Pointer Events, Input Events
// and HTML define them for the real event.
function shape(bubbles: boolean, cancelable: boolean, composed: boolean): Shape {
  return { bubbles, cancelable, composed }
}

const ui = shape(true, true, true)

export const EventType = {
  CHANGE: new EventFactory('change', shape(true, false, false), plain),
  SELECT: new EventFactory('select', shape(true, false, false), plain),
  SUBMIT: new EventFactory('submit', shape(true, true, false), submit),

  BLUR: new EventFactory('blur', shape(false, false, true), focus),
  FOCUS: new EventFactory('focus', shape(false, false, true), focus),
  FOCUSIN: new EventFactory('focusin', shape(true, false, true), focus),
  FOCUSOUT: new EventFactory('focusout', shape(true, false, true), focus),

  BEFOREINPUT: new EventFactory('beforeinput', ui, input),
  INPUT: new EventFactory('input', shape(true, false, true), input),
  TEXTINPUT: new EventFactory('textInput', shape(true, true, false), text),

  KEYDOWN: new EventFactory('keydown', ui, keyboard),
  KEYPRESS: new EventFactory('keypress', ui, keyboard),
  KEYUP: new EventFactory('keyup', ui, keyboard),

  CLICK: new EventFactory('click', ui, mouse),
  CONTEXTMENU: new EventFactory('contextmenu', ui, mouse),
  DBLCLICK: new EventFactory('dblclick', ui, mouse),
  MOUSEDOWN: new EventFactory('mousedown', ui, mouse),
  MOUSEMOVE: new EventFactory('mousemove', ui, mouse),
  MOUSEOUT: new EventFactory('mouseout', ui, mouse),
  MOUSEOVER: new EventFactory('mouseover', ui, mouse),
  MOUSEUP: new EventFactory('mouseup', ui, mouse),
  MOUSEENTER: new EventFactory('mouseenter', shape(false, false, false), mouse),
  MOUSELEAVE: new EventFactory('mouseleave', shape(false, false, false), mouse),

  POINTERDOWN: new EventFactory('pointerdown', ui, pointer),
  POINTERMOVE: new EventFactory('pointermove', ui, pointer),
  POINTEROUT: new EventFactory('pointerout', ui, pointer),
  POINTEROVER: new EventFactory('pointerover', ui, pointer),
  POINTERUP: new EventFactory('pointerup', ui, pointer),
  POINTERENTER: new EventFactory('pointerenter', shape(false, false, false), pointer),
  POINTERLEAVE: new EventFactory('pointerleave', shape(false, false, false), pointer),
}

// Whether the event went through uncancelled.
export function fire<A>(target: Target, type: EventFactory<A>, args: A): boolean {
  return target.dispatchEvent(type.create(target, args))
}

// Dispatched events carry isTrusted: false, which is how a page tells them
// from real input.
export function isSynthetic(event: Event): boolean {
  return !event.isTrusted
}
