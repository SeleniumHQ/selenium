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
 * @fileoverview Locator functions for finding elements by link text.
 */

import { getVisibleText } from '../dom';
import { many as cssMany } from './css';

/**
 * Find an element by using the text value of a link.
 *
 * @param target The link text to search for.
 * @param root The document or element to perform the search under.
 * @param isPartial Whether the link text needs to be matched only partially.
 * @return The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
function singleImpl(
  target: string,
  root: Document | Element,
  isPartial: boolean
): Element | null {
  let elements: ArrayLike<Element>;
  try {
    elements = cssMany('a', root);
  } catch (e) {
    // Old versions of browsers don't support CSS. They won't have XHTML
    // support. Sorry.
    elements = root.getElementsByTagName('a');
  }

  const found = Array.from(elements).find((element) => {
    let text = getVisibleText(element);
    // getVisibleText replaces non-breaking spaces with plain
    // spaces, so if these are present at the beginning or end
    // of the link text, we need to trim the regular spaces off
    // to be spec compliant for matching on link text.
    text = text.replace(/^[\s]+|[\s]+$/g, '');
    return (isPartial && text.indexOf(target) !== -1) || text === target;
  });

  return found || null;
}

/**
 * Find many elements by using the value of the link text.
 *
 * @param target The link text to search for.
 * @param root The document or element to perform the search under.
 * @param isPartial Whether the link text needs to be matched only partially.
 * @return All matching elements, or an empty list.
 */
function manyImpl(target: string, root: Document | Element, isPartial: boolean): Element[] {
  let elements: ArrayLike<Element>;
  try {
    elements = cssMany('a', root);
  } catch (e) {
    // Old versions of browsers don't support CSS. They won't have XHTML
    // support. Sorry.
    elements = root.getElementsByTagName('a');
  }

  return Array.from(elements).filter((element) => {
    let text = getVisibleText(element);
    // getVisibleText replaces non-breaking spaces with plain
    // spaces, so if these are present at the beginning or end
    // of the link text, we need to trim the regular spaces off
    // to be spec compliant for matching on link text.
    text = text.replace(/^[\s]+|[\s]+$/g, '');
    return (isPartial && text.indexOf(target) !== -1) || text === target;
  });
}

/**
 * Find an element by using the text value of a link.
 *
 * @param target The link text to search for.
 * @param root The document or element to perform the search under.
 * @return The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
export function single(target: string, root: Document | Element): Element | null {
  return singleImpl(target, root, false);
}

/**
 * Find many elements by using the value of the link text.
 *
 * @param target The link text to search for.
 * @param root The document or element to perform the search under.
 * @return All matching elements, or an empty list.
 */
export function many(target: string, root: Document | Element): Element[] {
  return manyImpl(target, root, false);
}

// Partial link text locator functions
export const partialLinkText = {
  /**
   * Find an element by using part of the text value of a link.
   *
   * @param target The link text to search for.
   * @param root The document or element to perform the search under.
   * @return The first matching element found in the DOM, or null if no
   *     such element could be found.
   */
  single(target: string, root: Document | Element): Element | null {
    return singleImpl(target, root, true);
  },

  /**
   * Find many elements by using part of the value of the link text.
   *
   * @param target The link text to search for.
   * @param root The document or element to perform the search under.
   * @return All matching elements, or an empty list.
   */
  many(target: string, root: Document | Element): Element[] {
    return manyImpl(target, root, true);
  },
};
