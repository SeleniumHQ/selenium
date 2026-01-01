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
 * @fileoverview Defines the core DOM querying library for the atoms, with a
 * minimal set of dependencies.
 */

import { BotError, ErrorCode } from './error';
import { IE_DOC_PRE8, IE_DOC_PRE9 } from './userAgent';

const NODE_TYPE_ELEMENT = 1;

const SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP =
  new RegExp('[;]+' +
    '(?=(?:(?:[^"]*"){2})*[^"]*$)' +
    '(?=(?:(?:[^\']*\'){2})*[^\']*$)' +
    '(?=(?:[^()]*\\([^()]*\\))*[^()]*$)');

/**
 * Standardizes a style attribute value by lowercasing property names and
 * ensuring it ends with a trailing semicolon.
 * Note: Exported with underscore suffix for backward compatibility with tests.
 */
export function standardizeStyleAttribute_(value: string): string {
  const styleArray = value.split(SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS_REGEXP);
  const css: string[] = [];
  styleArray.forEach((pair) => {
    const i = pair.indexOf(':');
    if (i > 0) {
      const keyValue = [pair.slice(0, i), pair.slice(i + 1)];
      if (keyValue.length === 2) {
        css.push(keyValue[0].toLowerCase(), ':', keyValue[1], ';');
      }
    }
  });
  let result = css.join('');
  result = result.charAt(result.length - 1) === ';' ? result : result + ';';
  return result;
}

/**
 * Get the user-specified value of the given attribute of the element, or null
 * if the attribute is not present.
 *
 * For boolean attributes such as "selected" or "checked", this method
 * returns the value of element.getAttribute(attributeName) cast to a String
 * when attribute is present.
 *
 * For the style attribute, it standardizes the value by lower-casing the
 * property names and always including a trailing semicolon.
 */
export function getAttribute(element: Element, attributeName: string): string | null {
  attributeName = attributeName.toLowerCase();

  if (attributeName === 'style') {
    return standardizeStyleAttribute_((element as HTMLElement).style.cssText);
  }

  if (IE_DOC_PRE8 && attributeName === 'value' &&
    isElement(element, 'INPUT')) {
    return (element as HTMLInputElement).value;
  }

  if (IE_DOC_PRE9 && (element as unknown as Record<string, unknown>)[attributeName] === true) {
    return String(element.getAttribute(attributeName));
  }

  const attr = element.getAttributeNode(attributeName);
  return (attr && attr.specified) ? attr.value : null;
}

/**
 * Looks up the given property on the given element.
 */
export function getProperty(element: Element, propertyName: string): unknown {
  if (IE_DOC_PRE8 && propertyName === 'value' &&
    isElement(element, 'OPTION') &&
    getAttribute(element, 'value') === null) {
    return element.textContent || (element as HTMLElement).innerText || '';
  }
  return (element as unknown as Record<string, unknown>)[propertyName];
}

/**
 * Returns whether the given node is an element and, optionally, whether it has
 * the given tag name.
 */
export function isElement(node: Node | null, tagName?: string): node is Element {
  if (tagName && typeof tagName !== 'string') {
    tagName = String(tagName);
  }
  if (node instanceof HTMLFormElement) {
    return !!node && node.nodeType === NODE_TYPE_ELEMENT &&
      (!tagName || 'FORM' === tagName);
  }
  return !!node && node.nodeType === NODE_TYPE_ELEMENT &&
    (!tagName || (node as Element).tagName.toUpperCase() === tagName);
}

/**
 * Returns whether the element can be checked or selected.
 */
export function isSelectable(element: Element): boolean {
  if (isElement(element, 'OPTION')) {
    return true;
  }

  if (isElement(element, 'INPUT')) {
    const type = (element as HTMLInputElement).type.toLowerCase();
    return type === 'checkbox' || type === 'radio';
  }

  return false;
}

/**
 * Returns whether the element is checked or selected.
 */
export function isSelected(element: Element): boolean {
  if (!isSelectable(element)) {
    throw new BotError(ErrorCode.ELEMENT_NOT_SELECTABLE,
      'Element is not selectable');
  }

  let propertyName = 'selected';
  const type = (element as HTMLInputElement).type &&
    (element as HTMLInputElement).type.toLowerCase();
  if (type === 'checkbox' || type === 'radio') {
    propertyName = 'checked';
  }

  return !!getProperty(element, propertyName);
}
