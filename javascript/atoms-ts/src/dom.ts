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
 * DOM manipulation and querying routines.
 */

import { WebDriverError } from './error';
import { getAttribute, getProperty, isElement as domCoreIsElement } from './domcore';
import { standardizeColor } from './color';
import * as userAgent from './userAgent';
import * as bot from './bot';

/**
 * Whether Shadow DOM operations are supported by the browser.
 */
export const IS_SHADOW_DOM_ENABLED = typeof ShadowRoot === 'function';

/**
 * List of the focusable form fields, according to
 * http://www.w3.org/TR/html401/interact/scripts.html#adef-onfocus
 */
const FOCUSABLE_FORM_FIELDS = ['a', 'area', 'button', 'input', 'label', 'select', 'textarea'];

/**
 * List of elements that support the "disabled" attribute, as defined by the
 * HTML 4.01 specification.
 * See http://www.w3.org/TR/html401/interact/forms.html#h-17.12.1
 */
const DISABLED_ATTRIBUTE_SUPPORTED = ['button', 'input', 'optgroup', 'option', 'select', 'textarea'];

/**
 * List of input types that create text fields.
 * See http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#attr-input-type
 */
const TEXTUAL_INPUT_TYPES = ['text', 'search', 'tel', 'url', 'email', 'password', 'number'];

/**
 * Elements with one of these effective "display" styles are treated as inline
 * display boxes and have their visible text appended to the current line.
 */
const INLINE_DISPLAY_BOXES = [
    'inline',
    'inline-block',
    'inline-table',
    'none',
    'table-cell',
    'table-column',
    'table-column-group'
];

/**
 * A regular expression to match the CSS transform matrix syntax.
 */
const CSS_TRANSFORM_MATRIX_REGEX = new RegExp(
    'matrix\\(([\\d\\.\\-]+), ([\\d\\.\\-]+), ' +
    '([\\d\\.\\-]+), ([\\d\\.\\-]+), ' +
    '([\\d\\.\\-]+)(?:px)?, ([\\d\\.\\-]+)(?:px)?\\)'
);

/**
 * The kind of overflow area in which an element may be located.
 */
export enum OverflowState {
    NONE = 'none',
    HIDDEN = 'hidden',
    SCROLL = 'scroll'
}

/**
 * Retrieves the active element for a node's owner document.
 */
export function getActiveElement(nodeOrWindow: Node | Window): Element | null {
    let ownerDoc: Document | null | undefined;
    if (nodeOrWindow instanceof Window) {
        ownerDoc = nodeOrWindow.document;
    } else {
        ownerDoc = (nodeOrWindow as any).ownerDocument;
    }

    const active = ownerDoc?.activeElement || null;

    // IE has the habit of returning an empty object from
    // getActiveElement instead of null.
    if (active && typeof (active as any).nodeType === 'undefined') {
        return null;
    }
    return active;
}

/**
 * Returns whether an element is in an interactable state: whether it is shown
 * to the user, ignoring its opacity, and whether it is enabled.
 */
export function isInteractable(element: Element): boolean {
    return isShown(element, true) && isEnabled(element) && !hasPointerEventsDisabled(element);
}

/**
 * Whether element is set by the CSS pointer-events property
 * not to be interactable.
 */
function hasPointerEventsDisabled(element: Element): boolean {
    const isOldFirefox = userAgent.IS_FIREFOX && !userAgent.isEngineVersion('1.9.2');
    if (isOldFirefox) {
        // Don't support pointer events
        return false;
    }
    return getEffectiveStyle(element, 'pointer-events') === 'none';
}

/**
 * Reexport convenience constants and functions from domcore
 */
export { getAttribute, getProperty };
export const isSelectable = domCoreIsSelectable;
export const isSelected = domCoreIsSelected;
export function isElement(elem: any, tagName?: string): elem is Element {
    if (!domCoreIsElement(elem)) {
        return false;
    }
    if (!tagName) {
        return true;
    }
    return (elem as Element).tagName?.toLowerCase() === tagName.toLowerCase();
}

// Stub implementations from domcore (these should be the real ones from domcore)
function domCoreIsSelectable(element: Element): boolean {
    const tagName = element.tagName?.toLowerCase() || '';
    return tagName === 'option' || tagName === 'input';
}

function domCoreIsSelected(element: Element): boolean {
    if (element instanceof HTMLOptionElement) {
        return element.selected;
    }
    if (element instanceof HTMLInputElement) {
        return element.checked;
    }
    return false;
}


/**
 * Returns whether a node is a focusable element. An element may receive focus
 * if it is a form field, has a non-negative tabindex, or is editable.
 */
export function isFocusable(element: Element): boolean {
    const tagName = element.tagName?.toLowerCase() || '';

    if (FOCUSABLE_FORM_FIELDS.includes(tagName)) {
        return true;
    }

    const tabindex = getAttribute(element, 'tabindex');
    if (tabindex !== null && Number(getProperty(element, 'tabIndex')) >= 0) {
        return true;
    }

    return isEditable(element);
}

/**
 * Determines if an element is enabled. An element is considered enabled if it
 * does not support the "disabled" attribute, or if it is not disabled.
 */
export function isEnabled(el: Element): boolean {
    const tagName = el.tagName?.toLowerCase() || '';
    const isSupported = DISABLED_ATTRIBUTE_SUPPORTED.includes(tagName);

    if (!isSupported) {
        return true;
    }

    if (getProperty(el, 'disabled')) {
        return false;
    }

    // The element is not explicitly disabled, but if it is an OPTION or OPTGROUP,
    // we must test if it inherits its state from a parent.
    if (el.parentNode && el.parentNode.nodeType === 1) { // ELEMENT_NODE
        if (tagName === 'optgroup' || tagName === 'option') {
            return isEnabled(el.parentNode as Element);
        }
    }

    // Is there an ancestor of the current element that is a disabled fieldset
    // and whose child is also an ancestor-or-self of the current element but is
    // not the first legend child of the fieldset. If so then the element is
    // disabled.
    let current: Element | null = el;
    while (current) {
        const parentElem: Element | null = current.parentElement;
        if (parentElem && parentElem.tagName?.toLowerCase() === 'fieldset' && getProperty(parentElem, 'disabled')) {
            if (current.tagName?.toLowerCase() !== 'legend') {
                return false;
            }

            let sibling = current.previousElementSibling;
            while (sibling) {
                if (sibling.tagName?.toLowerCase() === 'legend') {
                    return false;
                }
                sibling = sibling.previousElementSibling;
            }
        }
        current = parentElem;
    }

    return true;
}

/**
 * Returns whether the element accepts user-typed text.
 */
export function isTextual(element: Element): boolean {
    const tagName = element.tagName?.toLowerCase() || '';

    if (tagName === 'textarea') {
        return true;
    }

    if (tagName === 'input') {
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
    if (element.tagName?.toLowerCase() === 'input') {
        const type = (element as HTMLInputElement).type.toLowerCase();
        return type === 'file';
    }
    return false;
}

/**
 * Returns whether the element is an input with specified type.
 */
export function isInputType(element: Element, inputType: string): boolean {
    if (element.tagName?.toLowerCase() === 'input') {
        const type = (element as HTMLInputElement).type.toLowerCase();
        return type === inputType;
    }
    return false;
}

/**
 * Returns whether the element is contentEditable.
 */
export function isContentEditable(element: Element): boolean {
    // Check if browser supports contentEditable.
    if ((element as any).contentEditable === undefined) {
        return false;
    }

    // Checking the element's isContentEditable property is preferred
    if ((element as any).isContentEditable !== undefined) {
        return (element as any).isContentEditable;
    }

    // For browsers where contentEditable is supported but isContentEditable is not,
    // traverse up the ancestors:
    function legacyIsContentEditable(e: Element): boolean {
        const contentEditable = (e as any).contentEditable;
        if (contentEditable === 'inherit') {
            const parent = getParentElement(e);
            return parent ? legacyIsContentEditable(parent) : false;
        } else {
            return contentEditable === 'true';
        }
    }
    return legacyIsContentEditable(element);
}

/**
 * Whether the element may contain text the user can edit.
 */
export function isEditable(element: Element): boolean {
    const isTextualElem = isTextual(element) ||
        isFileInput(element) ||
        isInputType(element, 'range') ||
        isInputType(element, 'date') ||
        isInputType(element, 'month') ||
        isInputType(element, 'week') ||
        isInputType(element, 'time') ||
        isInputType(element, 'datetime-local') ||
        isInputType(element, 'color');

    return isTextualElem && !getProperty(element, 'readOnly');
}

/**
 * Returns the parent element of the given node, or null.
 */
export function getParentElement(node: Node): Element | null {
    let elem: Node | null = node.parentNode;

    while (elem && elem.nodeType !== 1 && elem.nodeType !== 9 && elem.nodeType !== 11) { // ELEMENT, DOCUMENT, DOCUMENT_FRAGMENT
        elem = elem.parentNode;
    }
    return isElement(elem as Element) ? (elem as Element) : null;
}

/**
 * Retrieves an explicitly-set, inline style value of an element.
 */
export function getInlineStyle(elem: Element, styleName: string): string {
    return (elem as any).style[toCamelCase(styleName)] || '';
}

/**
 * Convert CSS property name (selector-case) to camelCase
 */
function toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Retrieves the implicitly-set, effective style of an element, or null if it is
 * unknown.
 */
export function getEffectiveStyle(elem: Element, propertyName: string): string | null {
    let styleName = toCamelCase(propertyName);

    if (styleName === 'float' || styleName === 'cssFloat' || styleName === 'styleFloat') {
        styleName = 'cssFloat';
    }

    const style = getComputedStyle(elem, styleName) || getCascadedStyle(elem, styleName);
    if (style === null) {
        return null;
    }
    return standardizeColor(styleName, style);
}

/**
 * Get the computed style property value
 */
function getComputedStyle(elem: Element, styleName: string): string | null {
    const computed = window.getComputedStyle(elem);
    const value = computed.getPropertyValue(toCamelCaseToDashCase(styleName)) ||
        (computed as any)[styleName];
    return value || null;
}

/**
 * Convert camelCase to dash-case for CSS properties
 */
function toCamelCaseToDashCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Looks up the DOM tree for the first style value not equal to 'inherit'
 */
function getCascadedStyle(elem: Element, styleName: string): string | null {
    const style = (elem as any).currentStyle || (elem as any).style;
    let value = style[styleName];

    if (value === undefined && typeof style.getPropertyValue === 'function') {
        value = style.getPropertyValue(styleName);
    }

    if (value !== 'inherit') {
        return value !== undefined ? value : null;
    }

    const parent = getParentElement(elem);
    return parent ? getCascadedStyle(parent, styleName) : null;
}

/**
 * Helper for isShown that checks visibility of a subtree
 */
function isShown_(elem: Element, ignoreOpacity: boolean, displayedFn: (e: Node) => boolean): boolean {
    if (!isElement(elem)) {
        throw new Error('Argument to isShown must be of type Element');
    }

    // By convention, BODY element is always shown
    if (elem.tagName?.toLowerCase() === 'body') {
        return true;
    }

    // Option or optgroup is shown iff enclosing select is shown
    if (elem.tagName?.toLowerCase() === 'option' || elem.tagName?.toLowerCase() === 'optgroup') {
        let ancestor: Element | null = elem;
        while (ancestor) {
            if (ancestor.tagName?.toLowerCase() === 'select') {
                return isShown_(ancestor, true, displayedFn);
            }
            ancestor = ancestor.parentElement;
        }
        return false;
    }

    // Image map elements are shown if image that uses it is shown
    const imageMap = maybeFindImageMap_(elem);
    if (imageMap) {
        return !!imageMap.image &&
            imageMap.rect.width > 0 && imageMap.rect.height > 0 &&
            isShown_(imageMap.image, ignoreOpacity, displayedFn);
    }

    // Any hidden input is not shown
    if (elem.tagName?.toLowerCase() === 'input' && (elem as HTMLInputElement).type.toLowerCase() === 'hidden') {
        return false;
    }

    // Any NOSCRIPT element is not shown
    if (elem.tagName?.toLowerCase() === 'noscript') {
        return false;
    }

    // Any element with hidden/collapsed visibility is not shown
    const visibility = getEffectiveStyle(elem, 'visibility');
    if (visibility === 'collapse' || visibility === 'hidden') {
        return false;
    }

    if (!displayedFn(elem)) {
        return false;
    }

    // Any transparent element is not shown
    if (!ignoreOpacity && getOpacity(elem) === 0) {
        return false;
    }

    // Any element without positive size dimensions is not shown
    function positiveSize(e: Element): boolean {
        const rect = getClientRect(e);
        if (rect.width > 0 && rect.height > 0) {
            return true;
        }

        // A vertical or horizontal SVG Path element will report zero width or
        // height but is "shown" if it has a positive stroke-width
        if (e.tagName?.toLowerCase() === 'path' && (rect.height > 0 || rect.width > 0)) {
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

        return getEffectiveStyle(e, 'overflow') !== 'hidden' &&
            Array.from(e.childNodes).some((n) => {
                if (n.nodeType === 3) { // TEXT_NODE
                    const text = (n as Text).nodeValue || '';
                    // Ignore text nodes that are purely structural whitespace
                    if (/^[\s]*$/.test(text) && /[\n\r\t]/.test(text)) {
                        return false;
                    }
                    return true;
                }
                return isElement(n as Element) && positiveSize(n as Element);
            });
    }

    if (!positiveSize(elem)) {
        return false;
    }

    // Elements that are hidden by overflow are not shown
    function hiddenByOverflow(e: Element): boolean {
        return getOverflowState(e) === OverflowState.HIDDEN &&
            Array.from(e.childNodes).every((n) => {
                return !isElement(n as Element) || hiddenByOverflow(n as Element) || !positiveSize(n as Element);
            });
    }

    return !hiddenByOverflow(elem);
}

/**
 * Determines whether an element is what a user would call "shown".
 */
export function isShown(elem: Element, opt_ignoreOpacity?: boolean): boolean {
    function displayed(e: Node): boolean {
        if (isElement(e as Element)) {
            const elem = e as Element;
            if (getEffectiveStyle(elem, 'display') === 'none' ||
                getEffectiveStyle(elem, 'content-visibility') === 'hidden') {
                return false;
            }
        }

        const parent = getParentNodeInComposedDom(e);

        if (IS_SHADOW_DOM_ENABLED && parent instanceof ShadowRoot) {
            if ((parent.host as any).shadowRoot && (parent.host as any).shadowRoot !== parent) {
                // There is a younger shadow root, which will take precedence
                return false;
            } else {
                return displayed(parent.host);
            }
        }

        if (parent && (parent.nodeType === 9 || parent.nodeType === 11)) { // DOCUMENT, DOCUMENT_FRAGMENT
            return true;
        }

        // Child of DETAILS element is not shown unless the DETAILS element is open
        if (parent && isElement(parent as Element) &&
            (parent as Element).tagName?.toLowerCase() === 'details' &&
            !(parent as any).open && !isElement(e as Element, 'summary')) {
            return false;
        }

        return !!parent && displayed(parent);
    }

    return isShown_(elem, !!opt_ignoreOpacity, displayed);
}

/**
 * Returns the overflow state of the given element.
 */
export function getOverflowState(elem: Element, opt_region?: Coordinate | Rect): OverflowState {
    const region = getClientRegion(elem, opt_region);
    const ownerDoc = elem.ownerDocument!;
    const htmlElem = ownerDoc.documentElement;
    const bodyElem = ownerDoc.body;
    const htmlOverflowStyle = getEffectiveStyle(htmlElem, 'overflow');
    let treatAsFixedPosition = false;

    function getOverflowParent(e: Element): Element | null {
        const position = getEffectiveStyle(e, 'position');
        if (position === 'fixed') {
            treatAsFixedPosition = true;
            return e === htmlElem ? null : htmlElem;
        } else {
            let parent = getParentElement(e);
            while (parent && !canBeOverflowed(parent)) {
                parent = getParentElement(parent);
            }
            return parent;
        }

        function canBeOverflowed(container: Element): boolean {
            if (container === htmlElem) {
                return true;
            }
            const containerDisplay = getEffectiveStyle(container, 'display') || '';
            if (containerDisplay.startsWith('inline') || containerDisplay === 'contents') {
                return false;
            }
            const currentPosition = getEffectiveStyle(e, 'position');
            if (currentPosition === 'absolute' && getEffectiveStyle(container, 'position') === 'static') {
                return false;
            }
            return true;
        }
    }

    function getOverflowStyles(e: Element): { x: string; y: string } {
        let overflowElem = e;
        if (htmlOverflowStyle === 'visible') {
            if (e === htmlElem && bodyElem) {
                overflowElem = bodyElem;
            } else if (e === bodyElem) {
                return { x: 'visible', y: 'visible' };
            }
        }
        const overflow = {
            x: getEffectiveStyle(overflowElem, 'overflow-x') || 'visible',
            y: getEffectiveStyle(overflowElem, 'overflow-y') || 'visible'
        };
        if (e === htmlElem) {
            overflow.x = overflow.x === 'visible' ? 'auto' : overflow.x;
            overflow.y = overflow.y === 'visible' ? 'auto' : overflow.y;
        }
        return overflow;
    }

    function getScroll(e: Element): Coordinate {
        if (e === htmlElem) {
            const doc = e.ownerDocument!;
            return new Coordinate(doc.documentElement.scrollLeft, doc.documentElement.scrollTop);
        } else {
            return new Coordinate(e.scrollLeft, e.scrollTop);
        }
    }

    let container = getOverflowParent(elem);
    while (container) {
        const containerOverflow = getOverflowStyles(container);

        if (containerOverflow.x === 'visible' && containerOverflow.y === 'visible') {
            container = getOverflowParent(container);
            continue;
        }

        const containerRect = getClientRect(container);

        if (containerRect.width === 0 || containerRect.height === 0) {
            return OverflowState.HIDDEN;
        }

        const underflowsX = region.right < containerRect.left;
        const underflowsY = region.bottom < containerRect.top;
        if ((underflowsX && containerOverflow.x === 'hidden') ||
            (underflowsY && containerOverflow.y === 'hidden')) {
            return OverflowState.HIDDEN;
        } else if ((underflowsX && containerOverflow.x !== 'visible') ||
            (underflowsY && containerOverflow.y !== 'visible')) {
            const containerScroll = getScroll(container);
            const unscrollableX = region.right < containerRect.left - containerScroll.x;
            const unscrollableY = region.bottom < containerRect.top - containerScroll.y;
            if ((unscrollableX && containerOverflow.x !== 'visible') ||
                (unscrollableY && containerOverflow.y !== 'visible')) {
                return OverflowState.HIDDEN;
            }
            const containerState = getOverflowState(container);
            return containerState === OverflowState.HIDDEN ? OverflowState.HIDDEN : OverflowState.SCROLL;
        }

        const overflowsX = region.left >= containerRect.left + containerRect.width;
        const overflowsY = region.top >= containerRect.top + containerRect.height;
        if ((overflowsX && containerOverflow.x === 'hidden') ||
            (overflowsY && containerOverflow.y === 'hidden')) {
            return OverflowState.HIDDEN;
        } else if ((overflowsX && containerOverflow.x !== 'visible') ||
            (overflowsY && containerOverflow.y !== 'visible')) {
            if (treatAsFixedPosition) {
                const docScroll = getScroll(container);
                if ((region.left >= htmlElem.scrollWidth - docScroll.x) ||
                    (region.right >= htmlElem.scrollHeight - docScroll.y)) {
                    return OverflowState.HIDDEN;
                }
            }
            const containerState = getOverflowState(container);
            return containerState === OverflowState.HIDDEN ? OverflowState.HIDDEN : OverflowState.SCROLL;
        }

        container = getOverflowParent(container);
    }

    return OverflowState.NONE;
}

/**
 * Simple rectangle type for client positioning
 */
interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

/**
 * Simple coordinate type
 */
class Coordinate {
    constructor(public x: number, public y: number) { }
}

/**
 * Gets the client rectangle of the DOM element.
 */
export function getClientRect(elem: Element): Rect {
    const imageMap = maybeFindImageMap_(elem);
    if (imageMap) {
        return imageMap.rect;
    } else if (elem.tagName?.toLowerCase() === 'html') {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        return { left: 0, top: 0, right: viewportWidth, bottom: viewportHeight, width: viewportWidth, height: viewportHeight };
    } else {
        let nativeRect: DOMRect;
        try {
            nativeRect = elem.getBoundingClientRect();
        } catch (e) {
            return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
        }

        let rect: Rect = {
            left: nativeRect.left,
            top: nativeRect.top,
            right: nativeRect.right,
            bottom: nativeRect.bottom,
            width: nativeRect.right - nativeRect.left,
            height: nativeRect.bottom - nativeRect.top
        };

        // Adjust for IE border
        const doc = elem.ownerDocument!;
        if (doc.body) {
            rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
            rect.top -= doc.documentElement.clientTop + doc.body.clientTop;
        }

        return rect;
    }
}

/**
 * If given a <map> or <area> element, finds the corresponding image and client
 * rectangle of the element; otherwise returns null.
 */
function maybeFindImageMap_(elem: Element): { image: Element | null; rect: Rect } | null {
    const isMap = elem.tagName?.toLowerCase() === 'map';
    if (!isMap && elem.tagName?.toLowerCase() !== 'area') {
        return null;
    }

    let map: Element | null = isMap ? elem :
        (elem.parentElement?.tagName?.toLowerCase() === 'map' ? elem.parentElement : null);

    let image: Element | null = null;
    let rect: Rect | null = null;

    if (map && (map as any).name) {
        // TODO: Implement using CSS selector when bot.locators.css is available
        // For now, we'll use querySelectorAll as a simple alternative
        const mapName = (map as any).name;
        const selector = `*[usemap="#${mapName}"]`;
        image = elem.ownerDocument?.querySelector(selector) || null;

        if (image) {
            rect = getClientRect(image);
            if (!isMap && (elem as any).shape?.toLowerCase() !== 'default') {
                const relRect = getAreaRelativeRect_(elem);
                const relX = Math.min(Math.max(relRect.left, 0), rect.width);
                const relY = Math.min(Math.max(relRect.top, 0), rect.height);
                const w = Math.min(relRect.width, rect.width - relX);
                const h = Math.min(relRect.height, rect.height - relY);
                rect = { left: relX + rect.left, top: relY + rect.top, right: relX + rect.left + w, bottom: relY + rect.top + h, width: w, height: h };
            }
        }
    }

    return { image, rect: rect || { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 } };
}

/**
 * Returns the bounding box around an <area> element relative to its enclosing <map>.
 */
function getAreaRelativeRect_(area: Element): Rect {
    const shape = (area as any).shape?.toLowerCase() || '';
    const coordsStr = (area as any).coords || '';
    const coords = coordsStr.split(',').map(Number);

    if (shape === 'rect' && coords.length === 4) {
        const x = coords[0];
        const y = coords[1];
        return { left: x, top: y, right: coords[2], bottom: coords[3], width: coords[2] - x, height: coords[3] - y };
    } else if (shape === 'circle' && coords.length === 3) {
        const centerX = coords[0];
        const centerY = coords[1];
        const radius = coords[2];
        return {
            left: centerX - radius,
            top: centerY - radius,
            right: centerX + radius,
            bottom: centerY + radius,
            width: 2 * radius,
            height: 2 * radius
        };
    } else if (shape === 'poly' && coords.length > 2) {
        let minX = coords[0];
        let minY = coords[1];
        let maxX = minX;
        let maxY = minY;
        for (let i = 2; i + 1 < coords.length; i += 2) {
            minX = Math.min(minX, coords[i]);
            maxX = Math.max(maxX, coords[i]);
            minY = Math.min(minY, coords[i + 1]);
            maxY = Math.max(maxY, coords[i + 1]);
        }
        return { left: minX, top: minY, right: maxX, bottom: maxY, width: maxX - minX, height: maxY - minY };
    }

    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
}

/**
 * Gets the element's client rectangle as a box, optionally clipped to the
 * given coordinate or rectangle relative to the client's position.
 */
export function getClientRegion(elem: Element, opt_region?: Coordinate | Rect): Rect {
    const rect = getClientRect(elem);
    const region = { ...rect };

    if (opt_region) {
        let r: { x: number; y: number; width: number; height: number };
        if (opt_region instanceof Coordinate) {
            r = { x: opt_region.x, y: opt_region.y, width: 1, height: 1 };
        } else {
            r = { x: opt_region.left, y: opt_region.top, width: opt_region.width, height: opt_region.height };
        }

        region.left = Math.max(Math.min(region.left + r.x, region.right), region.left);
        region.top = Math.max(Math.min(region.top + r.y, region.bottom), region.top);
        region.right = Math.max(Math.min(region.left + r.width, region.right), region.left);
        region.bottom = Math.max(Math.min(region.top + r.height, region.bottom), region.top);
        region.width = region.right - region.left;
        region.height = region.bottom - region.top;
    }

    return region;
}

/**
 * Trims leading and trailing whitespace from strings, leaving non-breaking
 * space characters in place.
 */
function trimExcludingNonBreakingSpaceCharacters(str: string): string {
    return str.replace(/^[^\S\xa0]+|[^\S\xa0]+$/g, '');
}

/**
 * Helper function for getVisibleText
 */
function concatenateCleanedLines(lines: string[]): string {
    const trimmed = lines.map(trimExcludingNonBreakingSpaceCharacters);
    const joined = trimmed.join('\n');
    const finalTrimmed = trimExcludingNonBreakingSpaceCharacters(joined);
    return finalTrimmed.replace(/\xa0/g, ' ');
}

/**
 * Gets the visible text of an element
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
 * Helper function used by appendVisibleTextLinesFromElement and
 * appendVisibleTextLinesFromElementInComposedDom
 */
function appendVisibleTextLinesFromElementCommon(
    elem: Element,
    lines: string[],
    isShownFn: (e: Element) => boolean,
    childNodeFn: (n: Node, lines: string[], shown: boolean, whitespace: string | null, textTransform: string | null) => void
): void {
    function currLine(): string {
        return lines[lines.length - 1] || '';
    }

    if (elem.tagName?.toLowerCase() === 'br') {
        lines.push('');
    } else {
        const isTD = elem.tagName?.toLowerCase() === 'td';
        const display = getEffectiveStyle(elem, 'display') || '';
        const isBlock = !isTD && !INLINE_DISPLAY_BOXES.includes(display);

        const previousElementSibling = elem.previousElementSibling;
        const prevDisplay = previousElementSibling ? getEffectiveStyle(previousElementSibling, 'display') || '' : '';
        const thisFloat = getEffectiveStyle(elem, 'float') || getEffectiveStyle(elem, 'cssFloat') || getEffectiveStyle(elem, 'styleFloat') || '';
        const runIntoThis = prevDisplay === 'run-in' && thisFloat === 'none';

        if (isBlock && !runIntoThis && currLine().trim().length > 0) {
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

        if (isBlock && display !== 'run-in' && line.trim().length > 0) {
            lines.push('');
        }
    }
}

/**
 * Append visible text lines from element (non-composed DOM)
 */
function appendVisibleTextLinesFromElement(elem: Element, lines: string[]): void {
    appendVisibleTextLinesFromElementCommon(
        elem,
        lines,
        isShown,
        (node, lines, shown, whitespace, textTransform) => {
            if (node.nodeType === 3 && shown) { // TEXT_NODE
                appendVisibleTextLinesFromTextNode(node as Text, lines, whitespace, textTransform);
            } else if (node.nodeType === 1) { // ELEMENT_NODE
                appendVisibleTextLinesFromElement(node as Element, lines);
            }
        }
    );
}

/**
 * Append visible text lines from text node
 */
function appendVisibleTextLinesFromTextNode(
    textNode: Text,
    lines: string[],
    whitespace: string | null,
    textTransform: string | null
): void {
    let text = textNode.nodeValue || '';

    // Remove zero-width characters
    text = text.replace(/[\u200b\u200e\u200f]/g, '');

    // Canonicalize newlines
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    if (whitespace === 'normal' || whitespace === 'nowrap') {
        text = text.replace(/\n/g, ' ');
    }

    if (whitespace === 'pre' || whitespace === 'pre-wrap') {
        text = text.replace(/[ \f\t\v\u2028\u2029]/g, '\xa0');
    } else {
        text = text.replace(/[ \f\t\v\u2028\u2029]+/g, ' ');
    }

    if (textTransform === 'capitalize') {
        const re1 = /(^|[^'_0-9A-Za-z\u00C0-\u02AF\u1E00-\u1EFF\u24B6-\u24E9\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF])([A-Za-z\u00C0-\u02AF\u1E00-\u1EFF\u24B6-\u24E9])/g;
        text = text.replace(re1, (match, p1, p2) => p1 + p2.toUpperCase());

        const re2 = /(^|[^'_0-9A-Za-z\u00C0-\u02AF\u1E00-\u1EFF\u24B6-\u24E9])([_*])([A-Za-z\u00C0-\u02AF\u1E00-\u1EFF\u24D0-\u24E9])/g;
        text = text.replace(re2, (match, p1, p2, p3) => p1 + p2 + p3.toUpperCase());
    } else if (textTransform === 'uppercase') {
        text = text.toUpperCase();
    } else if (textTransform === 'lowercase') {
        text = text.toLowerCase();
    }

    const currLine = lines.pop() || '';
    const newText = currLine.endsWith(' ') && text.startsWith(' ') ? text.substring(1) : text;
    lines.push(currLine + newText);
}

/**
 * Gets the opacity of an element
 */
export function getOpacity(elem: Element): number {
    // Modern browsers use opacity style
    const opacityStyle = getEffectiveStyle(elem, 'opacity');
    if (opacityStyle) {
        let elemOpacity = Number(opacityStyle);

        // Apply parent opacity
        const parentElement = getParentElement(elem);
        if (parentElement) {
            elemOpacity = elemOpacity * getOpacity(parentElement);
        }
        return elemOpacity;
    }

    return 1; // Opaque by default
}

/**
 * Returns the parent node in the composed DOM (considering Shadow DOM)
 */
export function getParentNodeInComposedDom(node: Node): Node | null {
    let parent: Node | null = node.parentNode;

    // Shadow DOM v1
    if (parent && (parent as any).shadowRoot && (node as any).assignedSlot !== undefined) {
        return (node as any).assignedSlot ? (node as any).assignedSlot.parentNode : null;
    }

    // Shadow DOM V0 (deprecated)
    if ((node as any).getDestinationInsertionPoints) {
        const destinations = (node as any).getDestinationInsertionPoints();
        if (destinations.length > 0) {
            return destinations[destinations.length - 1];
        }
    }

    return parent;
}

/**
 * Append visible text lines from node in composed DOM
 */
function appendVisibleTextLinesFromNodeInComposedDom(
    node: Node,
    lines: string[],
    shown: boolean,
    whitespace: string | null,
    textTransform: string | null
): void {
    if (node.nodeType === 3 && shown) { // TEXT_NODE
        appendVisibleTextLinesFromTextNode(node as Text, lines, whitespace, textTransform);
    } else if (node.nodeType === 1) { // ELEMENT_NODE
        const castElem = node as Element;

        if (castElem.tagName?.toLowerCase() === 'content' || castElem.tagName?.toLowerCase() === 'slot') {
            let parentNode: Node = node;
            while (parentNode.parentNode) {
                parentNode = parentNode.parentNode;
            }

            if (parentNode instanceof ShadowRoot) {
                const contentElem = node as any;
                let shadowChildren: Node[];
                if (castElem.tagName?.toLowerCase() === 'content') {
                    const distributed = contentElem.getDistributedNodes?.();
                    shadowChildren = distributed ? Array.from(distributed as any) : [];
                } else {
                    const assigned = contentElem.assignedNodes?.();
                    shadowChildren = assigned ? Array.from(assigned as any) : [];
                }

                const childrenToTraverse = shadowChildren.length > 0 ? shadowChildren : Array.from(contentElem.childNodes);
                childrenToTraverse.forEach((n: any) => {
                    appendVisibleTextLinesFromNodeInComposedDom(n as Node, lines, shown, whitespace, textTransform);
                });
            } else {
                appendVisibleTextLinesFromElementInComposedDom(castElem, lines);
            }
        } else if (castElem.tagName?.toLowerCase() === 'shadow') {
            let parentNode: Node = node;
            while (parentNode.parentNode) {
                parentNode = parentNode.parentNode;
            }

            if (parentNode instanceof ShadowRoot) {
                const thisShadowRoot = parentNode as ShadowRoot;
                let olderShadowRoot = (thisShadowRoot as any).olderShadowRoot;
                while (olderShadowRoot) {
                    Array.from(olderShadowRoot.childNodes).forEach((childNode: any) => {
                        appendVisibleTextLinesFromNodeInComposedDom(childNode as Node, lines, shown, whitespace, textTransform);
                    });
                    olderShadowRoot = (olderShadowRoot as any).olderShadowRoot;
                }
            }
        } else {
            appendVisibleTextLinesFromElementInComposedDom(castElem, lines);
        }
    }
}

/**
 * Determines whether a given node has been distributed into a ShadowDOM element
 */
export function isNodeDistributedIntoShadowDom(node: Node): boolean {
    const elemOrText = (node as any);
    return ((node as any).assignedSlot !== null ||
        ((elemOrText as any).getDestinationInsertionPoints &&
            (elemOrText as any).getDestinationInsertionPoints().length > 0));
}

/**
 * Append visible text lines from element in composed DOM
 */
function appendVisibleTextLinesFromElementInComposedDom(elem: Element, lines: string[]): void {
    if ((elem as any).shadowRoot) {
        const whitespace = getEffectiveStyle(elem, 'white-space');
        const textTransform = getEffectiveStyle(elem, 'text-transform');

        Array.from((elem as any).shadowRoot.childNodes).forEach((node: any) => {
            appendVisibleTextLinesFromNodeInComposedDom(node as Node, lines, true, whitespace, textTransform);
        });
    }

    appendVisibleTextLinesFromElementCommon(
        elem,
        lines,
        isShown,
        (node, lines, shown, whitespace, textTransform) => {
            if (!isNodeDistributedIntoShadowDom(node)) {
                appendVisibleTextLinesFromNodeInComposedDom(node, lines, shown, whitespace, textTransform);
            }
        }
    );
}
