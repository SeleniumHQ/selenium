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
 * Core DOM querying and element manipulation library for the Selenium Atoms.
 * Provides a minimal set of dependencies with no reliance on CSS selector libraries.
 */

import { WebDriverError, ErrorCode } from './error';

/**
 * Regex to split style attributes on semicolons, but not when enclosed
 * in parentheses or quotes. Used to properly parse CSS declarations.
 * If the style attribute ends with a semicolon, this will include an empty
 * string at the end of the array.
 */
const SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP = new RegExp(
    '[;]+' +
    '(?=(?:(?:[^"]*"){2})*[^"]*$)' +
    '(?=(?:(?:[^\']*\'){2})*[^\']*$)' +
    '(?=(?:[^()]*\\([^()]*\\))*[^()]*$)'
);

/**
 * Standardize a style attribute value by:
 *   (1) Converting all property names to lowercase
 *   (2) Ensuring it ends with a trailing semicolon
 *
 * @param value The style attribute value
 * @returns The standardized style attribute value
 */
function standardizeStyleAttribute(value: string): string {
    const styleArray = value.split(SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP);
    const css: string[] = [];

    styleArray.forEach((pair) => {
        const colonIndex = pair.indexOf(':');
        if (colonIndex > 0) {
            const key = pair.slice(0, colonIndex);
            const val = pair.slice(colonIndex + 1);
            css.push(key.toLowerCase(), ':', val, ';');
        }
    });

    let result = css.join('');
    // Ensure it ends with a semicolon
    if (result.length > 0 && result.charAt(result.length - 1) !== ';') {
        result += ';';
    }
    return result;
}

/**
 * Gets the user-specified value of the given attribute of an element.
 *
 * For boolean attributes (e.g., "selected", "checked"), returns the value of
 * element.getAttribute() as a string when present. For the style attribute,
 * returns a standardized CSS text with lowercase property names and trailing semicolon.
 *
 * @param element The element to query
 * @param attributeName The name of the attribute to retrieve
 * @returns The attribute value, or null if the attribute is not present
 *
 * @example
 * getAttribute(element, 'class') // 'my-class'
 * getAttribute(element, 'style') // 'color: red; margin: 0;'
 * getAttribute(element, 'data-id') // 'abc123'
 */
export function getAttribute(element: Element, attributeName: string): string | null {
    const lowerAttrName = attributeName.toLowerCase();

    // Standardize style attribute: lowercase property names and ensure trailing semicolon
    if (lowerAttrName === 'style') {
        return standardizeStyleAttribute(
            (element as HTMLElement).style?.cssText ?? ''
        );
    }

    // Use getAttributeNode for robust attribute detection
    // Returns null if attribute is not present or not specified
    const attr = element.getAttributeNode(lowerAttrName);
    return attr?.specified ? attr.value : null;
}

/**
 * Gets a property value from an element.
 *
 * @param element The element to query
 * @param propertyName The name of the property to retrieve
 * @returns The value of the property
 *
 * @example
 * getProperty(element, 'checked') // true
 * getProperty(element, 'value')   // 'input text'
 */
export function getProperty(element: Element, propertyName: string): unknown {
    return (element as unknown as Record<string, unknown>)[propertyName];
}

/**
 * Tests whether a node is an element and optionally has a given tag name.
 *
 * @param node The node to test
 * @param tagName Optional tag name to test (case-insensitive)
 * @returns true if node is an element with the given tag name (or any tag if not specified)
 *
 * @example
 * isElement(document.body, 'BODY')  // true
 * isElement(textNode, 'DIV')        // false
 */
export function isElement(node: Node | null | undefined, tagName?: string): node is Element {
    if (!node || node.nodeType !== 1) { // Node.ELEMENT_NODE = 1
        return false;
    }

    if (!tagName) {
        return true;
    }

    const normalizedTagName = tagName.toUpperCase();
    return (node as Element).tagName?.toUpperCase() === normalizedTagName;
}

/**
 * Tests whether an element can be checked or selected.
 * Returns true for <option> elements, <input type="checkbox">, and <input type="radio">.
 *
 * @param element The element to test
 * @returns true if the element is selectable
 *
 * @example
 * isSelectable(checkboxInput) // true
 * isSelectable(textInput)     // false
 */
export function isSelectable(element: Element): boolean {
    if (isElement(element, 'OPTION')) {
        return true;
    }

    if (isElement(element, 'INPUT')) {
        const type = (element as HTMLInputElement).type?.toLowerCase();
        return type === 'checkbox' || type === 'radio';
    }

    return false;
}

/**
 * Tests whether an element is currently checked or selected.
 *
 * For <option> elements, checks the 'selected' property.
 * For checkboxes and radio buttons, checks the 'checked' property.
 *
 * @param element The element to test
 * @returns true if the element is checked or selected
 * @throws WebDriverError if the element is not selectable
 *
 * @example
 * isSelected(checkboxElement)  // true or false
 * isSelected(optionElement)    // true or false
 */
export function isSelected(element: Element): boolean {
    if (!isSelectable(element)) {
        throw new WebDriverError(
            ErrorCode.ELEMENT_NOT_SELECTABLE,
            'Element is not selectable'
        );
    }

    let propertyName = 'selected';
    const type = (element as HTMLInputElement).type?.toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
        propertyName = 'checked';
    }

    return Boolean(getProperty(element, propertyName));
}
