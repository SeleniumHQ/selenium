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
 * @fileoverview DOM manipulation and querying routines.
 */

import {
  isElement,
  isSelectable,
  isSelected,
  getAttribute,
  getProperty,
} from './domcore';
import { standardizeColor } from './color';
import { IE_DOC_PRE9, isEngineVersion } from './userAgent';
import { single as cssSingle } from './locators/css';

// Re-export domcore functions
export { isElement, isSelectable, isSelected, getAttribute, getProperty };

// Node type constants
const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;
const NODE_TYPE_DOCUMENT = 9;
const NODE_TYPE_DOCUMENT_FRAGMENT = 11;

// Browser detection
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_IE = /MSIE|Trident/.test(userAgent);
const IS_GECKO = /Gecko/.test(userAgent) && !/like Gecko/.test(userAgent);

/**
 * Simple Rect class to replace goog.math.Rect
 */
export class Rect {
  constructor(
    public left: number,
    public top: number,
    public width: number,
    public height: number
  ) {}

  toBox(): Box {
    return {
      left: this.left,
      top: this.top,
      right: this.left + this.width,
      bottom: this.top + this.height,
    };
  }
}

/**
 * Box interface
 */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Coordinate interface
 */
export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Overflow state enum
 */
export enum OverflowState {
  NONE = 'none',
  HIDDEN = 'hidden',
  SCROLL = 'scroll',
}

/**
 * Converts a string to camelCase.
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Canonicalizes newlines to \n.
 */
function canonicalizeNewlines(str: string): string {
  return str.replace(/\r\n|\r/g, '\n');
}

/**
 * Gets an ancestor matching the predicate.
 */
function getAncestor(
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
 * Whether Shadow DOM operations are supported by the browser.
 */
export const IS_SHADOW_DOM_ENABLED: boolean = typeof ShadowRoot === 'function';

/**
 * Retrieves the active element for a node's owner document.
 */
export function getActiveElement(nodeOrWindow: Node | Window): Element | null {
  const doc =
    'ownerDocument' in nodeOrWindow
      ? nodeOrWindow.ownerDocument || document
      : (nodeOrWindow as Window).document;
  const active = doc.activeElement;
  if (IS_IE && active && typeof (active as unknown as Record<string, unknown>).nodeType === 'undefined') {
    return null;
  }
  return active;
}

/**
 * Returns whether an element is in an interactable state.
 */
export function isInteractable(element: Element): boolean {
  return (
    isShown(element, true) &&
    isEnabled(element) &&
    !hasPointerEventsDisabled(element)
  );
}

/**
 * Whether element has pointer-events disabled.
 */
function hasPointerEventsDisabled(element: Element): boolean {
  if (IS_IE || (IS_GECKO && !isEngineVersion('1.9.2'))) {
    return false;
  }
  return getEffectiveStyle(element, 'pointer-events') === 'none';
}

/**
 * Focusable form field tag names.
 */
/**
 * Focusable form field tag names.
 * @private
 */
export const FOCUSABLE_FORM_FIELDS_ = ['A', 'AREA', 'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA'];

/**
 * Returns whether a node is a focusable element.
 */
export function isFocusable(element: Element): boolean {
  const tagMatches = FOCUSABLE_FORM_FIELDS_.some((tag) => isElement(element, tag));
  return (
    tagMatches ||
    (getAttribute(element, 'tabindex') !== null &&
      Number(getProperty(element, 'tabIndex')) >= 0) ||
    isEditable(element)
  );
}

/**
 * Elements that support the "disabled" attribute.
 */
const DISABLED_ATTRIBUTE_SUPPORTED = ['BUTTON', 'INPUT', 'OPTGROUP', 'OPTION', 'SELECT', 'TEXTAREA'];

/**
 * Determines if an element is enabled.
 */
export function isEnabled(el: Element): boolean {
  const isSupported = DISABLED_ATTRIBUTE_SUPPORTED.some((tag) => isElement(el, tag));
  if (!isSupported) {
    return true;
  }

  if (getProperty(el, 'disabled')) {
    return false;
  }

  if (
    el.parentNode &&
    el.parentNode.nodeType === NODE_TYPE_ELEMENT &&
    (isElement(el, 'OPTGROUP') || isElement(el, 'OPTION'))
  ) {
    return isEnabled(el.parentNode as Element);
  }

  return !getAncestor(
    el,
    (e) => {
      const parent = e.parentNode;
      if (
        parent &&
        isElement(parent as Node, 'FIELDSET') &&
        getProperty(parent as Element, 'disabled')
      ) {
        if (!isElement(e as Node, 'LEGEND')) {
          return true;
        }
        let sibling: Element | null = (e as Element).previousElementSibling;
        while (sibling) {
          if (sibling.tagName.toUpperCase() === 'LEGEND') {
            return true;
          }
          sibling = sibling.previousElementSibling;
        }
      }
      return false;
    },
    true
  );
}

/**
 * Input types that create text fields.
 */
const TEXTUAL_INPUT_TYPES = ['text', 'search', 'tel', 'url', 'email', 'password', 'number'];

/**
 * Returns whether the element accepts user-typed text.
 */
export function isTextual(element: Element): boolean {
  if (isElement(element, 'TEXTAREA')) {
    return true;
  }
  if (isElement(element, 'INPUT')) {
    const type = (element as HTMLInputElement).type.toLowerCase();
    return TEXTUAL_INPUT_TYPES.includes(type);
  }
  if (isContentEditable(element)) {
    return true;
  }
  return false;
}

/**
 * Returns whether the element is a file input.
 */
export function isFileInput(element: Element): boolean {
  if (isElement(element, 'INPUT')) {
    return (element as HTMLInputElement).type.toLowerCase() === 'file';
  }
  return false;
}

/**
 * Returns whether the element is an input with specified type.
 */
export function isInputType(element: Element, inputType: string): boolean {
  if (isElement(element, 'INPUT')) {
    return (element as HTMLInputElement).type.toLowerCase() === inputType;
  }
  return false;
}

/**
 * Returns whether the element is contentEditable.
 */
export function isContentEditable(element: Element): boolean {
  const el = element as HTMLElement;
  if (el.contentEditable === undefined) {
    return false;
  }
  if (!IS_IE && el.isContentEditable !== undefined) {
    return el.isContentEditable;
  }
  function legacyIsContentEditable(e: HTMLElement): boolean {
    if (e.contentEditable === 'inherit') {
      const parent = getParentElement(e);
      return parent ? legacyIsContentEditable(parent as HTMLElement) : false;
    }
    return e.contentEditable === 'true';
  }
  return legacyIsContentEditable(el);
}

/**
 * Whether the element may contain text the user can edit.
 */
export function isEditable(element: Element): boolean {
  return (
    (isTextual(element) ||
      isFileInput(element) ||
      isInputType(element, 'range') ||
      isInputType(element, 'date') ||
      isInputType(element, 'month') ||
      isInputType(element, 'week') ||
      isInputType(element, 'time') ||
      isInputType(element, 'datetime-local') ||
      isInputType(element, 'color')) &&
    !getProperty(element, 'readOnly')
  );
}

/**
 * Returns the parent element of the given node, or null.
 */
export function getParentElement(node: Node): Element | null {
  let elem = node.parentNode;
  while (
    elem &&
    elem.nodeType !== NODE_TYPE_ELEMENT &&
    elem.nodeType !== NODE_TYPE_DOCUMENT &&
    elem.nodeType !== NODE_TYPE_DOCUMENT_FRAGMENT
  ) {
    elem = elem.parentNode;
  }
  return isElement(elem as Node) ? (elem as Element) : null;
}

/**
 * Retrieves an explicitly-set, inline style value of an element.
 */
export function getInlineStyle(elem: Element, styleName: string): string {
  return (elem as HTMLElement).style.getPropertyValue(styleName) || '';
}

/**
 * Retrieves the implicitly-set, effective style of an element.
 */
export function getEffectiveStyle(elem: Element, propertyName: string): string | null {
  let styleName = toCamelCase(propertyName);
  if (styleName === 'float' || styleName === 'cssFloat' || styleName === 'styleFloat') {
    styleName = IE_DOC_PRE9 ? 'styleFloat' : 'cssFloat';
  }
  const style =
    window.getComputedStyle(elem).getPropertyValue(propertyName) ||
    getCascadedStyle(elem, styleName);
  if (style === null) {
    return null;
  }
  return standardizeColor(styleName, style);
}

/**
 * Looks up the DOM tree for the first style value not equal to 'inherit'.
 */
function getCascadedStyle(elem: Element, styleName: string): string | null {
  const el = elem as HTMLElement;
  const style = (el as unknown as { currentStyle?: CSSStyleDeclaration }).currentStyle || el.style;
  const value = (style as unknown as Record<string, unknown>)[styleName];
  if (value === undefined && typeof style.getPropertyValue === 'function') {
    const propValue = style.getPropertyValue(styleName);
    if (propValue !== 'inherit') {
      return propValue || null;
    }
  }
  if (value !== 'inherit') {
    return value !== undefined ? String(value) : null;
  }
  const parent = getParentElement(elem);
  return parent ? getCascadedStyle(parent, styleName) : null;
}

/**
 * Core isShown implementation.
 */
function isShownCore(
  elem: Element,
  ignoreOpacity: boolean,
  displayedFn: (e: Element) => boolean
): boolean {
  if (!isElement(elem)) {
    throw new Error('Argument to isShown must be of type Element');
  }

  if (isElement(elem, 'BODY')) {
    return true;
  }

  if (isElement(elem, 'OPTION') || isElement(elem, 'OPTGROUP')) {
    const select = getAncestor(elem, (e) => isElement(e as Node, 'SELECT')) as Element | null;
    return !!select && isShownCore(select, true, displayedFn);
  }

  const imageMap = maybeFindImageMap(elem);
  if (imageMap) {
    return (
      !!imageMap.image &&
      imageMap.rect.width > 0 &&
      imageMap.rect.height > 0 &&
      isShownCore(imageMap.image, ignoreOpacity, displayedFn)
    );
  }

  if (isElement(elem, 'INPUT') && (elem as HTMLInputElement).type.toLowerCase() === 'hidden') {
    return false;
  }

  if (isElement(elem, 'NOSCRIPT')) {
    return false;
  }

  const visibility = getEffectiveStyle(elem, 'visibility');
  if (visibility === 'collapse' || visibility === 'hidden') {
    return false;
  }

  if (!displayedFn(elem)) {
    return false;
  }

  if (!ignoreOpacity && getOpacity(elem) === 0) {
    return false;
  }

  function positiveSize(e: Element): boolean {
    const rect = getClientRect(e);
    if (rect.height > 0 && rect.width > 0) {
      return true;
    }
    if (isElement(e, 'PATH') && (rect.height > 0 || rect.width > 0)) {
      const strokeWidth = getEffectiveStyle(e, 'stroke-width');
      return !!strokeWidth && parseInt(strokeWidth, 10) > 0;
    }
    const vis = getEffectiveStyle(e, 'visibility');
    if (vis === 'collapse' || vis === 'hidden') {
      return false;
    }
    if (!displayedFn(e)) {
      return false;
    }
    return (
      getEffectiveStyle(e, 'overflow') !== 'hidden' &&
      Array.from(e.childNodes).some((n) => {
        if (n.nodeType === NODE_TYPE_TEXT) {
          const text = n.nodeValue || '';
          if (/^[\s]*$/.test(text) && /[\n\r\t]/.test(text)) {
            return false;
          }
          return true;
        }
        return isElement(n) && positiveSize(n as Element);
      })
    );
  }

  if (!positiveSize(elem)) {
    return false;
  }

  function hiddenByOverflow(e: Element): boolean {
    return (
      getOverflowState(e) === OverflowState.HIDDEN &&
      Array.from(e.childNodes).every(
        (n) => !isElement(n) || hiddenByOverflow(n as Element) || !positiveSize(n as Element)
      )
    );
  }

  return !hiddenByOverflow(elem);
}

/**
 * Determines whether an element is what a user would call "shown".
 */
export function isShown(elem: Element, ignoreOpacity?: boolean): boolean {
  function displayed(e: Node): boolean {
    if (isElement(e)) {
      const el = e as Element;
      if (
        getEffectiveStyle(el, 'display') === 'none' ||
        getEffectiveStyle(el, 'content-visibility') === 'hidden'
      ) {
        return false;
      }
    }

    let parent: Node | null = getParentNodeInComposedDom(e);

    if (IS_SHADOW_DOM_ENABLED && parent instanceof ShadowRoot) {
      const host = parent.host as HTMLElement;
      if (host.shadowRoot && host.shadowRoot !== parent) {
        return false;
      }
      parent = host;
    }

    if (
      parent &&
      (parent.nodeType === NODE_TYPE_DOCUMENT || parent.nodeType === NODE_TYPE_DOCUMENT_FRAGMENT)
    ) {
      return true;
    }

    if (
      parent &&
      isElement(parent as Node, 'DETAILS') &&
      !(parent as HTMLDetailsElement).open &&
      !isElement(e as Node, 'SUMMARY')
    ) {
      return false;
    }

    return !!parent && displayed(parent);
  }

  return isShownCore(elem, !!ignoreOpacity, displayed);
}

/**
 * Returns the overflow state of the given element.
 */
export function getOverflowState(elem: Element, optRegion?: Coordinate | Rect): OverflowState {
  const region = getClientRegion(elem, optRegion);
  const ownerDoc = elem.ownerDocument || document;
  const htmlElem = ownerDoc.documentElement;
  const bodyElem = ownerDoc.body;
  const htmlOverflowStyle = getEffectiveStyle(htmlElem, 'overflow');
  let treatAsFixedPosition = false;

  function getOverflowParent(e: Element): Element | null {
    const position = getEffectiveStyle(e, 'position');
    if (position === 'fixed') {
      treatAsFixedPosition = true;
      return e === htmlElem ? null : htmlElem;
    }
    let parent = getParentElement(e);
    while (parent && !canBeOverflowed(parent)) {
      parent = getParentElement(parent);
    }
    return parent;

    function canBeOverflowed(container: Element): boolean {
      if (container === htmlElem) {
        return true;
      }
      const containerDisplay = getEffectiveStyle(container, 'display') || '';
      if (containerDisplay.startsWith('inline') || containerDisplay === 'contents') {
        return false;
      }
      if (position === 'absolute' && getEffectiveStyle(container, 'position') === 'static') {
        return false;
      }
      return true;
    }
  }

  function getOverflowStyles(e: Element): { x: string | null; y: string | null } {
    let overflowElem = e;
    if (htmlOverflowStyle === 'visible') {
      if (e === htmlElem && bodyElem) {
        overflowElem = bodyElem;
      } else if (e === bodyElem) {
        return { x: 'visible', y: 'visible' };
      }
    }
    let overflow = {
      x: getEffectiveStyle(overflowElem, 'overflow-x'),
      y: getEffectiveStyle(overflowElem, 'overflow-y'),
    };
    if (e === htmlElem) {
      overflow = {
        x: overflow.x === 'visible' ? 'auto' : overflow.x,
        y: overflow.y === 'visible' ? 'auto' : overflow.y,
      };
    }
    return overflow;
  }

  function getScroll(e: Element): Coordinate {
    if (e === htmlElem) {
      const win = ownerDoc.defaultView || window;
      return { x: win.pageXOffset || htmlElem.scrollLeft, y: win.pageYOffset || htmlElem.scrollTop };
    }
    return { x: e.scrollLeft, y: e.scrollTop };
  }

  for (
    let container = getOverflowParent(elem);
    container;
    container = getOverflowParent(container)
  ) {
    const containerOverflow = getOverflowStyles(container);
    if (containerOverflow.x === 'visible' && containerOverflow.y === 'visible') {
      continue;
    }

    const containerRect = getClientRect(container);
    if (containerRect.width === 0 || containerRect.height === 0) {
      return OverflowState.HIDDEN;
    }

    const underflowsX = region.right < containerRect.left;
    const underflowsY = region.bottom < containerRect.top;
    if (
      (underflowsX && containerOverflow.x === 'hidden') ||
      (underflowsY && containerOverflow.y === 'hidden')
    ) {
      return OverflowState.HIDDEN;
    }
    if (
      (underflowsX && containerOverflow.x !== 'visible') ||
      (underflowsY && containerOverflow.y !== 'visible')
    ) {
      const containerScroll = getScroll(container);
      const unscrollableX = region.right < containerRect.left - containerScroll.x;
      const unscrollableY = region.bottom < containerRect.top - containerScroll.y;
      if (
        (unscrollableX && containerOverflow.x !== 'visible') ||
        (unscrollableY && containerOverflow.y !== 'visible')
      ) {
        return OverflowState.HIDDEN;
      }
      const containerState = getOverflowState(container);
      return containerState === OverflowState.HIDDEN ? OverflowState.HIDDEN : OverflowState.SCROLL;
    }

    const overflowsX = region.left >= containerRect.left + containerRect.width;
    const overflowsY = region.top >= containerRect.top + containerRect.height;
    if (
      (overflowsX && containerOverflow.x === 'hidden') ||
      (overflowsY && containerOverflow.y === 'hidden')
    ) {
      return OverflowState.HIDDEN;
    }
    if (
      (overflowsX && containerOverflow.x !== 'visible') ||
      (overflowsY && containerOverflow.y !== 'visible')
    ) {
      if (treatAsFixedPosition) {
        const docScroll = getScroll(container);
        if (
          region.left >= htmlElem.scrollWidth - docScroll.x ||
          region.right >= htmlElem.scrollHeight - docScroll.y
        ) {
          return OverflowState.HIDDEN;
        }
      }
      const containerState = getOverflowState(container);
      return containerState === OverflowState.HIDDEN ? OverflowState.HIDDEN : OverflowState.SCROLL;
    }
  }

  return OverflowState.NONE;
}

/**
 * Gets the client rectangle of the DOM element.
 */
export function getClientRect(elem: Element): Rect {
  const imageMap = maybeFindImageMap(elem);
  if (imageMap) {
    return imageMap.rect;
  }
  if (elem.tagName.toUpperCase() === 'HTML') {
    const doc = elem.ownerDocument || document;
    const win = doc.defaultView || window;
    return new Rect(0, 0, win.innerWidth, win.innerHeight);
  }
  let nativeRect: DOMRect;
  try {
    nativeRect = elem.getBoundingClientRect();
  } catch (e) {
    return new Rect(0, 0, 0, 0);
  }

  const rect = new Rect(
    nativeRect.left,
    nativeRect.top,
    nativeRect.right - nativeRect.left,
    nativeRect.bottom - nativeRect.top
  );

  if (IS_IE && elem.ownerDocument?.body) {
    const doc = elem.ownerDocument;
    rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
    rect.top -= doc.documentElement.clientTop + doc.body.clientTop;
  }

  return rect;
}

/**
 * If given a <map> or <area> element, finds the corresponding image and rectangle.
 */
function maybeFindImageMap(elem: Element): { image: Element | null; rect: Rect } | null {
  const tagName = elem.tagName.toUpperCase();
  const isMapElem = tagName === 'MAP';
  if (!isMapElem && tagName !== 'AREA') {
    return null;
  }

  const parentIsMap = elem.parentNode && isElement(elem.parentNode as Node, 'MAP');
  const map = isMapElem ? elem : parentIsMap ? elem.parentNode : null;

  let image: Element | null = null;
  let rect: Rect | null = null;
  if (map && (map as HTMLMapElement).name) {
    const mapDoc = map.ownerDocument || document;
    const locator = '*[usemap="#' + (map as HTMLMapElement).name + '"]';
    image = cssSingle(locator, mapDoc);

    if (image) {
      rect = getClientRect(image);
      if (!isMapElem && (elem as HTMLAreaElement).shape.toLowerCase() !== 'default') {
        const relRect = getAreaRelativeRect(elem as HTMLAreaElement);
        const relX = Math.min(Math.max(relRect.left, 0), rect.width);
        const relY = Math.min(Math.max(relRect.top, 0), rect.height);
        const w = Math.min(relRect.width, rect.width - relX);
        const h = Math.min(relRect.height, rect.height - relY);
        rect = new Rect(relX + rect.left, relY + rect.top, w, h);
      }
    }
  }

  return { image, rect: rect || new Rect(0, 0, 0, 0) };
}

/**
 * Returns the bounding box around an <area> element relative to its enclosing <map>.
 */
function getAreaRelativeRect(area: HTMLAreaElement): Rect {
  const shape = area.shape.toLowerCase();
  const coords = area.coords.split(',').map(Number);
  if (shape === 'rect' && coords.length === 4) {
    const [x, y, x2, y2] = coords;
    return new Rect(x, y, x2 - x, y2 - y);
  }
  if (shape === 'circle' && coords.length === 3) {
    const [cx, cy, r] = coords;
    return new Rect(cx - r, cy - r, 2 * r, 2 * r);
  }
  if (shape === 'poly' && coords.length > 2) {
    let minX = coords[0],
      minY = coords[1],
      maxX = minX,
      maxY = minY;
    for (let i = 2; i + 1 < coords.length; i += 2) {
      minX = Math.min(minX, coords[i]);
      maxX = Math.max(maxX, coords[i]);
      minY = Math.min(minY, coords[i + 1]);
      maxY = Math.max(maxY, coords[i + 1]);
    }
    return new Rect(minX, minY, maxX - minX, maxY - minY);
  }
  return new Rect(0, 0, 0, 0);
}

/**
 * Gets the element's client rectangle as a box.
 */
export function getClientRegion(elem: Element, optRegion?: Coordinate | Rect): Box {
  const region = getClientRect(elem).toBox();

  if (optRegion) {
    // Duck-type check: if it has width and height, treat as Rect (works with goog.math.Rect too)
    const isRectLike =
      'width' in optRegion && 'height' in optRegion && typeof optRegion.width === 'number';
    let rect: Rect;
    if (isRectLike) {
      const r = optRegion as { left?: number; top?: number; x?: number; y?: number; width: number; height: number };
      // Support both our Rect (left/top) and goog.math.Rect (which uses left/top as well)
      const left = r.left !== undefined ? r.left : (r.x !== undefined ? r.x : 0);
      const top = r.top !== undefined ? r.top : (r.y !== undefined ? r.y : 0);
      rect = new Rect(left, top, r.width, r.height);
    } else {
      const coord = optRegion as Coordinate;
      rect = new Rect(coord.x, coord.y, 1, 1);
    }
    region.left = Math.min(Math.max(region.left + rect.left, region.left), region.right);
    region.top = Math.min(Math.max(region.top + rect.top, region.top), region.bottom);
    region.right = Math.min(Math.max(region.left + rect.width, region.left), region.right);
    region.bottom = Math.min(Math.max(region.top + rect.height, region.top), region.bottom);
  }

  return region;
}

/**
 * Trims leading and trailing whitespace, preserving non-breaking spaces.
 */
function trimExcludingNonBreakingSpaceCharacters(str: string): string {
  return str.replace(/^[^\S\xa0]+|[^\S\xa0]+$/g, '');
}

/**
 * Concatenates and cleans visible text lines.
 */
function concatenateCleanedLines(lines: string[]): string {
  const trimmedLines = lines.map(trimExcludingNonBreakingSpaceCharacters);
  const joined = trimmedLines.join('\n');
  const trimmed = trimExcludingNonBreakingSpaceCharacters(joined);
  return trimmed.replace(/\xa0/g, ' ');
}

/**
 * Gets the visible text of an element.
 */
export function getVisibleText(elem: Element): string {
  const lines: string[] = [];
  if (IS_SHADOW_DOM_ENABLED) {
    appendVisibleTextLinesFromElementInComposedDom(elem, lines);
  } else {
    appendVisibleTextLinesFromElement(elem, lines);
  }
  return concatenateCleanedLines(lines);
}

/**
 * Inline display box types.
 */
const INLINE_DISPLAY_BOXES = [
  'inline',
  'inline-block',
  'inline-table',
  'none',
  'table-cell',
  'table-column',
  'table-column-group',
];

/**
 * Common helper for appending visible text lines.
 */
function appendVisibleTextLinesFromElementCommon(
  elem: Element,
  lines: string[],
  isShownFn: (e: Element) => boolean,
  childNodeFn: (
    node: Node,
    lines: string[],
    shown: boolean,
    whitespace: string | null,
    textTransform: string | null
  ) => void
): void {
  function currLine(): string {
    return lines[lines.length - 1] || '';
  }

  const elemTag = elem.tagName.toUpperCase();
  if (elemTag === 'BR') {
    lines.push('');
  } else {
    const isTD = elemTag === 'TD';
    const display = getEffectiveStyle(elem, 'display');
    const isBlock = !isTD && !INLINE_DISPLAY_BOXES.includes(display || '');

    const previousElementSibling = (elem as HTMLElement).previousElementSibling;
    const prevDisplay = previousElementSibling
      ? getEffectiveStyle(previousElementSibling, 'display')
      : '';
    const thisFloat =
      getEffectiveStyle(elem, 'float') ||
      getEffectiveStyle(elem, 'cssFloat') ||
      getEffectiveStyle(elem, 'styleFloat');
    const runIntoThis = prevDisplay === 'run-in' && thisFloat === 'none';

    if (isBlock && !runIntoThis && currLine().trim() !== '') {
      lines.push('');
    }

    const shown = isShownFn(elem);
    let whitespace: string | null = null;
    let textTransform: string | null = null;
    if (shown) {
      whitespace = getEffectiveStyle(elem, 'white-space');
      textTransform = getEffectiveStyle(elem, 'text-transform');
    }

    Array.from(elem.childNodes).forEach((node) => {
      childNodeFn(node, lines, shown, whitespace, textTransform);
    });

    const line = currLine();
    if ((isTD || display === 'table-cell') && line && !line.endsWith(' ')) {
      lines[lines.length - 1] += ' ';
    }

    if (isBlock && display !== 'run-in' && line.trim() !== '') {
      lines.push('');
    }
  }
}

/**
 * Appends visible text lines from an element.
 */
function appendVisibleTextLinesFromElement(elem: Element, lines: string[]): void {
  appendVisibleTextLinesFromElementCommon(
    elem,
    lines,
    isShown,
    (node, lines, shown, whitespace, textTransform) => {
      if (node.nodeType === NODE_TYPE_TEXT && shown) {
        appendVisibleTextLinesFromTextNode(node as Text, lines, whitespace, textTransform);
      } else if (isElement(node)) {
        appendVisibleTextLinesFromElement(node as Element, lines);
      }
    }
  );
}

/**
 * Appends visible text lines from a text node.
 */
function appendVisibleTextLinesFromTextNode(
  textNode: Text,
  lines: string[],
  whitespace: string | null,
  textTransform: string | null
): void {
  let text = (textNode.nodeValue || '').replace(/[\u200b\u200e\u200f]/g, '');
  text = canonicalizeNewlines(text);

  if (whitespace === 'normal' || whitespace === 'nowrap') {
    text = text.replace(/\n/g, ' ');
  }

  if (whitespace === 'pre' || whitespace === 'pre-wrap') {
    text = text.replace(/[ \f\t\v\u2028\u2029]/g, '\xa0');
  } else {
    text = text.replace(/[ \f\t\v\u2028\u2029]+/g, ' ');
  }

  if (textTransform === 'capitalize') {
    const re =
      /(^|[^'_0-9A-Za-z\u00C0-\u02AF\u1E00-\u1EFF\u24B6-\u24E9\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF])([A-Za-z\u00C0-\u02AF\u1E00-\u1EFF\u24B6-\u24E9])/g;
    text = text.replace(re, (_, p1, p2) => p1 + p2.toUpperCase());
    const re2 =
      /(^|[^'_0-9A-Za-z\u00C0-\u02AF\u1E00-\u1EFF\u24B6-\u24E9])([_*])([A-Za-z\u00C0-\u02AF\u1E00-\u1EFF\u24D0-\u24E9])/g;
    text = text.replace(re2, (_, p1, p2, p3) => p1 + p2 + p3.toUpperCase());
  } else if (textTransform === 'uppercase') {
    text = text.toUpperCase();
  } else if (textTransform === 'lowercase') {
    text = text.toLowerCase();
  }

  const currLine = lines.pop() || '';
  if (currLine.endsWith(' ') && text.startsWith(' ')) {
    text = text.substring(1);
  }
  lines.push(currLine + text);
}

/**
 * Gets the opacity of an element.
 */
export function getOpacity(elem: Element): number {
  if (!IE_DOC_PRE9) {
    return getOpacityNonIE(elem);
  }
  if (getEffectiveStyle(elem, 'position') === 'relative') {
    return 1;
  }
  const opacityStyle = getEffectiveStyle(elem, 'filter') || '';
  const groups =
    opacityStyle.match(/^alpha\(opacity=(\d*)\)/) ||
    opacityStyle.match(/^progid:DXImageTransform.Microsoft.Alpha\(Opacity=(\d*)\)/);
  if (groups) {
    return Number(groups[1]) / 100;
  }
  return 1;
}

/**
 * Gets opacity for non-IE browsers.
 */
function getOpacityNonIE(elem: Element): number {
  let elemOpacity = 1;
  const opacityStyle = getEffectiveStyle(elem, 'opacity');
  if (opacityStyle) {
    elemOpacity = Number(opacityStyle);
  }
  const parentElement = getParentElement(elem);
  if (parentElement) {
    elemOpacity = elemOpacity * getOpacityNonIE(parentElement);
  }
  return elemOpacity;
}

/**
 * Returns the display parent element in the composed DOM.
 */
export function getParentNodeInComposedDom(node: Node): Node | null {
  const parent = node.parentNode;

  // Shadow DOM v1: Check if parent is a shadow host (has shadowRoot property)
  // and the node has the assignedSlot API (is slottable)
  if (
    parent &&
    (parent as Element).shadowRoot &&
    (node as HTMLElement).assignedSlot !== undefined
  ) {
    // Can be null on purpose, meaning it has no parent as
    // it hasn't yet been slotted
    const slot = (node as HTMLElement).assignedSlot;
    return slot ? slot.parentNode : null;
  }

  // Shadow DOM V0 (deprecated)
  const nodeWithLegacyAPI = node as unknown as { getDestinationInsertionPoints?: () => NodeList };
  if (nodeWithLegacyAPI.getDestinationInsertionPoints) {
    const destinations = nodeWithLegacyAPI.getDestinationInsertionPoints();
    if (destinations.length > 0) {
      return destinations[destinations.length - 1];
    }
  }

  return parent;
}

/**
 * Determines whether a node has been distributed into a ShadowDOM.
 */
export function isNodeDistributedIntoShadowDom(node: Node): boolean {
  if (node.nodeType === NODE_TYPE_ELEMENT || node.nodeType === NODE_TYPE_TEXT) {
    const el = node as HTMLElement;
    const elWithLegacyAPI = el as unknown as { getDestinationInsertionPoints?: () => NodeList };
    if (el.assignedSlot !== null) {
      return true;
    }
    if (
      elWithLegacyAPI.getDestinationInsertionPoints &&
      elWithLegacyAPI.getDestinationInsertionPoints().length > 0
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Appends visible text lines from an element in composed DOM.
 */
function appendVisibleTextLinesFromElementInComposedDom(elem: Element, lines: string[]): void {
  const el = elem as HTMLElement;
  if (el.shadowRoot) {
    const whitespace = getEffectiveStyle(elem, 'white-space');
    const textTransform = getEffectiveStyle(elem, 'text-transform');
    Array.from(el.shadowRoot.childNodes).forEach((node) => {
      appendVisibleTextLinesFromNodeInComposedDom(node, lines, true, whitespace, textTransform);
    });
  }

  appendVisibleTextLinesFromElementCommon(elem, lines, isShown, (node, lines, shown, ws, tt) => {
    if (!isNodeDistributedIntoShadowDom(node)) {
      appendVisibleTextLinesFromNodeInComposedDom(node, lines, shown, ws, tt);
    }
  });
}

/**
 * Appends visible text lines from a node in composed DOM.
 */
function appendVisibleTextLinesFromNodeInComposedDom(
  node: Node,
  lines: string[],
  shown: boolean,
  whitespace: string | null,
  textTransform: string | null
): void {
  if (node.nodeType === NODE_TYPE_TEXT && shown) {
    appendVisibleTextLinesFromTextNode(node as Text, lines, whitespace, textTransform);
  } else if (node.nodeType === NODE_TYPE_ELEMENT) {
    const castElem = node as Element;
    const nodeTag = castElem.tagName.toUpperCase();

    if (nodeTag === 'CONTENT' || nodeTag === 'SLOT') {
      let pNode: Node | null = node;
      while (pNode?.parentNode) {
        pNode = pNode.parentNode;
      }
      if (pNode instanceof ShadowRoot) {
        const contentElem = node as unknown as {
          getDistributedNodes?: () => NodeList;
          assignedNodes?: () => Node[];
          childNodes: NodeListOf<ChildNode>;
        };
        const shadowChildren =
          nodeTag === 'CONTENT'
            ? contentElem.getDistributedNodes?.() || []
            : contentElem.assignedNodes?.() || [];
        const childrenToTraverse =
          (shadowChildren as NodeList).length > 0 ? shadowChildren : contentElem.childNodes;
        Array.from(childrenToTraverse as NodeListOf<Node>).forEach((child) => {
          appendVisibleTextLinesFromNodeInComposedDom(
            child,
            lines,
            shown,
            whitespace,
            textTransform
          );
        });
      } else {
        appendVisibleTextLinesFromElementInComposedDom(castElem, lines);
      }
    } else if (nodeTag === 'SHADOW') {
      let pNode: Node | null = node;
      while (pNode?.parentNode) {
        pNode = pNode.parentNode;
      }
      if (pNode instanceof ShadowRoot) {
        let olderShadowRoot = (pNode as ShadowRoot & { olderShadowRoot?: ShadowRoot })
          .olderShadowRoot;
        while (olderShadowRoot) {
          Array.from(olderShadowRoot.childNodes).forEach((childNode) => {
            appendVisibleTextLinesFromNodeInComposedDom(
              childNode,
              lines,
              shown,
              whitespace,
              textTransform
            );
          });
          olderShadowRoot = (olderShadowRoot as ShadowRoot & { olderShadowRoot?: ShadowRoot })
            .olderShadowRoot;
        }
      }
    } else {
      appendVisibleTextLinesFromElementInComposedDom(castElem, lines);
    }
  }
}
