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
 * Utilities for getting and setting element attributes and properties.
 */

import * as dom from '../../atoms-ts/src/dom';

/**
 * Common aliases for property names.
 */
const PROPERTY_ALIASES: Record<string, string> = {
    class: 'className',
    readonly: 'readOnly',
};

/**
 * Boolean properties that return 'true' or null based on presence.
 */
const BOOLEAN_PROPERTIES = new Set([
    'allowfullscreen',
    'allowpaymentrequest',
    'allowusermedia',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'compact',
    'complete',
    'controls',
    'declare',
    'default',
    'defaultchecked',
    'defaultselected',
    'defer',
    'disabled',
    'ended',
    'formnovalidate',
    'hidden',
    'indeterminate',
    'iscontenteditable',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nohref',
    'nomodule',
    'noresize',
    'noshade',
    'novalidate',
    'nowrap',
    'open',
    'paused',
    'playsinline',
    'pubdate',
    'readonly',
    'required',
    'reversed',
    'scoped',
    'seamless',
    'seeking',
    'selected',
    'truespeed',
    'typemustmatch',
    'willvalidate',
]);

/**
 * Gets the value of an attribute or property from an element.
 * For boolean properties, returns 'true' or null (not 'false').
 * For style attributes, returns the CSS text.
 *
 * @param element The element to get the attribute from.
 * @param attrName The name of the attribute to retrieve.
 * @returns The string value, or null if not present/applicable.
 */
export function get(element: Element, attrName: string): string | null {
    const name = attrName.toLowerCase();
    const elem = element as any;

    // Handle style attribute specially
    if (name === 'style') {
        const value = elem.style;
        if (value && typeof value !== 'string') {
            return (value as CSSStyleDeclaration).cssText || null;
        }
        return typeof value === 'string' ? value : null;
    }

    // Handle selected/checked for selectable elements
    if ((name === 'selected' || name === 'checked') && dom.isSelectable(element)) {
        return dom.isSelected(element) ? 'true' : null;
    }

    const tagName = (element as any).tagName?.toLowerCase?.();
    const isLink = tagName === 'a';
    const isImg = tagName === 'img';

    // For links and images, prefer attribute over property for href/src
    if ((isImg && name === 'src') || (isLink && name === 'href')) {
        const attrValue = element.getAttribute(attrName);
        if (attrValue) {
            // Return full URL from property
            const aliasedName = PROPERTY_ALIASES[attrName];
            const propValue = elem[attrName] || (aliasedName ? elem[aliasedName] : undefined);
            return propValue ? String(propValue) : attrValue;
        }
        return null;
    }

    // Handle spellcheck specially (can be true/false/inherit)
    if (name === 'spellcheck') {
        const attrValue = element.getAttribute(attrName);
        if (attrValue !== null) {
            const lower = attrValue.toLowerCase();
            if (lower === 'false') {
                return 'false';
            } else if (lower === 'true') {
                return 'true';
            }
        }
        // Coerce property value to string
        const propValue = elem.spellcheck;
        return propValue !== null && propValue !== undefined ? String(propValue) : null;
    }

    // Handle boolean properties
    const propName = PROPERTY_ALIASES[attrName] || attrName;
    if (BOOLEAN_PROPERTIES.has(name)) {
        const hasAttr = element.hasAttribute(attrName);
        const propValue = elem[propName];
        const isTruthy = hasAttr || propValue;
        return isTruthy ? 'true' : null;
    }

    // Try to get property value first
    let value: any;
    try {
        value = elem[propName];
    } catch (e) {
        // Property access may fail, continue
    }

    // Fall back to attribute if property is null/undefined or is an object
    if (value === null || value === undefined || (typeof value === 'object' && !(value instanceof Boolean))) {
        value = element.getAttribute(attrName);
    }

    // Convert to string
    if (value !== null && value !== undefined) {
        return String(value);
    }

    return null;
}

/**
 * Sets an attribute on the element.
 *
 * @param element The element to set the attribute on.
 * @param attrName The name of the attribute.
 * @param value The value to set.
 */
export function set(element: Element, attrName: string, value: string): void {
    element.setAttribute(attrName, value);
}

/**
 * Removes an attribute from the element.
 *
 * @param element The element to remove the attribute from.
 * @param attrName The name of the attribute to remove.
 */
export function remove(element: Element, attrName: string): void {
    element.removeAttribute(attrName);
}

/**
 * Checks if an element has a given attribute.
 *
 * @param element The element to check.
 * @param attrName The name of the attribute.
 * @returns true if the attribute is present, false otherwise.
 */
export function has(element: Element, attrName: string): boolean {
    return element.hasAttribute(attrName);
}
