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
 * Atoms-based implementation of the WebElement interface.
 * Provides element query, state checking, and manipulation functions.
 */

import * as dom from '../../atoms-ts/src/dom';
import * as action from '../../atoms-ts/src/action';
import { Coordinate } from '../../atoms-ts/src/device';
import * as attribute from './attribute';
import { Keyboard } from '../../atoms-ts/src/keyboard';

/**
 * Interface for size dimensions.
 */
export interface Size {
    width: number;
    height: number;
}

/**
 * Interface for element location and size.
 */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Checks whether the element is selected.
 *
 * @param element The element to check.
 * @returns true if the element is selected, false otherwise.
 */
export function isSelected(element: Element): boolean {
    if (!dom.isSelectable(element)) {
        return false;
    }
    return dom.isSelected(element);
}

/**
 * Gets an attribute value from the element.
 *
 * @param element The element to get the attribute from.
 * @param attrName The name of the attribute.
 * @returns The attribute value, or null if not found.
 *
 * @deprecated Use attribute.get() instead.
 */
export function getAttribute(element: Element, attrName: string): string | null {
    return attribute.get(element, attrName);
}

/**
 * Gets the location of the element in page space, if it's displayed.
 *
 * @param element The element to get the location for.
 * @returns The bounding rectangle of the element, or null if not displayed.
 */
export function getLocation(element: Element): Rect | null {
    if (!dom.isShown(element)) {
        return null;
    }

    const rect = element.getBoundingClientRect();
    const docElement = element.ownerDocument!.documentElement;

    return {
        x: rect.left + (window.scrollX || docElement.scrollLeft),
        y: rect.top + (window.scrollY || docElement.scrollTop),
        width: rect.width,
        height: rect.height,
    };
}

/**
 * Scrolls the element into view and returns its position relative to the viewport.
 * If the element is too large to fit in the view, it will be aligned to the top-left.
 *
 * @param elem The element to scroll into view.
 * @param optElemRegion Optional region within the element to scroll into view.
 * @returns The coordinate of the element in client space.
 */
export function getLocationInView(
    elem: Element,
    optElemRegion?: Rect
): Coordinate {
    action.scrollIntoView(elem, optElemRegion);

    const rect = elem.getBoundingClientRect();
    return {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
    };
}

/**
 * Checks if an element is in the HEAD tag.
 *
 * @param element The element to check.
 * @returns true if the element is in the HEAD tag.
 */
export function isInHead(element: Node | null): boolean {
    let current: Node | null = element;
    while (current) {
        if (
            current.nodeType === Node.ELEMENT_NODE &&
            (current as Element).tagName?.toLowerCase() === 'head'
        ) {
            return true;
        }
        try {
            current = current.parentNode;
        } catch (e) {
            // DOM may have disappeared
            return false;
        }
    }
    return false;
}

/**
 * Gets the visible text content of the element.
 *
 * @param element The element to get text from.
 * @returns The visible text, or empty string if no visible text.
 */
export function getText(element: Element): string {
    return dom.getVisibleText(element);
}

/**
 * Types keys on the given element.
 * Converts special characters from the WebDriver JSON wire protocol to keyboard keys.
 *
 * @param element The element to type on.
 * @param keys The keys to type.
 * @param optKeyboard Optional keyboard instance; creates one if not provided.
 * @param optPersistModifiers Whether modifier keys should remain pressed.
 */
export function type(
    element: Element,
    keys: string[],
    _keyboard?: Keyboard,
    optPersistModifiers?: boolean
): void {
    const persistModifiers = !!optPersistModifiers;

    interface KeySequence {
        persist: boolean;
        keys: (string | any)[];
    }

    function createSequenceRecord(): KeySequence {
        return { persist: persistModifiers, keys: [] };
    }

    const convertedSequences: KeySequence[] = [];
    let current = createSequenceRecord();
    convertedSequences.push(current);

    const keyMap = getKeyMap();

    keys.forEach((sequence: string) => {
        sequence.split('').forEach((char: string) => {
            if (isWebDriverKey(char)) {
                const webdriverKey = keyMap[char];
                if (webdriverKey === null) {
                    // Release modifier keys
                    convertedSequences.push((current = createSequenceRecord()));
                    if (persistModifiers) {
                        current.persist = false;
                        convertedSequences.push((current = createSequenceRecord()));
                    }
                } else if (webdriverKey !== undefined) {
                    current.keys.push(webdriverKey);
                } else {
                    throw Error(
                        `Unsupported WebDriver key: \\u${char.charCodeAt(0).toString(16)}`
                    );
                }
            } else {
                // Handle common character aliases
                switch (char) {
                    case '\n':
                        current.keys.push('Enter');
                        break;
                    case '\t':
                        current.keys.push('Tab');
                        break;
                    case '\b':
                        current.keys.push('Backspace');
                        break;
                    default:
                        current.keys.push(char);
                        break;
                }
            }
        });
    });

    // Execute sequences using action module
    convertedSequences.forEach((sequence: KeySequence) => {
        action.type(element, sequence.keys as string[]);
    });
}

/**
 * Checks if a character is a WebDriver special key (Unicode range E000-E03D).
 */
function isWebDriverKey(char: string): boolean {
    return '\uE000' <= char && char <= '\uE03D';
}

/**
 * Maps WebDriver key codes to key names.
 */
function getKeyMap(): Record<string, string | null | undefined> {
    return {
        '\uE000': null, // NULL
        '\uE001': 'Cancel', // CANCEL (no direct mapping)
        '\uE002': 'Help', // HELP (no direct mapping)
        '\uE003': 'Backspace', // BACK_SPACE
        '\uE004': 'Tab', // TAB
        '\uE005': 'Clear', // CLEAR (no direct mapping)
        '\uE006': 'Enter', // RETURN
        '\uE007': 'Enter', // ENTER
        '\uE008': 'Shift', // SHIFT
        '\uE009': 'Control', // CONTROL
        '\uE00A': 'Alt', // ALT
        '\uE00B': 'Pause', // PAUSE
        '\uE00C': 'Escape', // ESCAPE
        '\uE00D': ' ', // SPACE
        '\uE00E': 'PageUp', // PAGE_UP
        '\uE00F': 'PageDown', // PAGE_DOWN
        '\uE010': 'End', // END
        '\uE011': 'Home', // HOME
        '\uE012': 'ArrowLeft', // LEFT
        '\uE013': 'ArrowUp', // UP
        '\uE014': 'ArrowRight', // RIGHT
        '\uE015': 'ArrowDown', // DOWN
        '\uE016': 'Insert', // INSERT
        '\uE017': 'Delete', // DELETE
        '\uE018': ';', // SEMICOLON
        '\uE019': '=', // EQUALS
        '\uE01A': '0', // NUMPAD0
        '\uE01B': '1', // NUMPAD1
        '\uE01C': '2', // NUMPAD2
        '\uE01D': '3', // NUMPAD3
        '\uE01E': '4', // NUMPAD4
        '\uE01F': '5', // NUMPAD5
        '\uE020': '6', // NUMPAD6
        '\uE021': '7', // NUMPAD7
        '\uE022': '8', // NUMPAD8
        '\uE023': '9', // NUMPAD9
        '\uE024': '*', // MULTIPLY
        '\uE025': '+', // ADD
        '\uE026': ',', // SEPARATOR
        '\uE027': '-', // SUBTRACT
        '\uE028': '.', // DECIMAL
        '\uE029': '/', // DIVIDE
        '\uE031': 'F1', // F1
        '\uE032': 'F2', // F2
        '\uE033': 'F3', // F3
        '\uE034': 'F4', // F4
        '\uE035': 'F5', // F5
        '\uE036': 'F6', // F6
        '\uE037': 'F7', // F7
        '\uE038': 'F8', // F8
        '\uE039': 'F9', // F9
        '\uE03A': 'F10', // F10
        '\uE03B': 'F11', // F11
        '\uE03C': 'F12', // F12
        '\uE03D': 'Meta', // META
    };
}
