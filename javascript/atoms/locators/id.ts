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
 * @fileoverview Locator functions for finding elements by ID.
 */

import { getAttribute } from '../domcore';

/**
 * Tests whether the standardized W3C Selectors API are available on an
 * element and the target locator meets CSS requirements.
 */
function canUseQuerySelector(root: Document | Element, target: string): boolean {
  return (
    typeof root.querySelectorAll === 'function' &&
    typeof root.querySelector === 'function' &&
    !/^\d.*/.test(target)
  );
}

/**
 * Given a string, escapes all the characters that have special meaning in CSS.
 * https://mathiasbynens.be/notes/css-escapes
 *
 * An ID can contain anything but spaces, but we also escape whitespace because
 * some webpages use spaces, and getElementById allows spaces in every browser.
 * http://www.w3.org/TR/html5/dom.html#the-id-attribute
 */
function cssEscape(s: string): string {
  return s.replace(/([\s'"\\#.:;,!?+<>=~*^$|%&@`{}\-\/\[\]\(\)])/g, '\\$1');
}

/**
 * Find an element by using the value of the ID attribute.
 *
 * @param target The id to search for.
 * @param root The document or element to perform the search under.
 * @return The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
export function single(target: string, root: Document | Element): Element | null {
  const doc = root.ownerDocument || (root as Document);
  const e = doc.getElementById(target);

  if (!e) {
    return null;
  }

  // On IE getting by ID returns the first match by id _or_ name.
  if (getAttribute(e, 'id') === target && root !== e && root.contains(e)) {
    return e;
  }

  const elements = root.getElementsByTagName('*');
  const found = Array.from(elements).find((element) => {
    return getAttribute(element, 'id') === target && root !== element && root.contains(element);
  });

  return found || null;
}

/**
 * Find many elements by using the value of the ID attribute.
 *
 * @param target The id to search for.
 * @param root The document or element to perform the search under.
 * @return All matching elements, or an empty list.
 */
export function many(target: string, root: Document | Element): Element[] {
  if (!target) {
    return [];
  }

  if (canUseQuerySelector(root, target)) {
    try {
      return Array.from(root.querySelectorAll('#' + cssEscape(target)));
    } catch (e) {
      return [];
    }
  }

  const elements = root.getElementsByTagName('*');
  return Array.from(elements).filter((e) => {
    return getAttribute(e, 'id') === target;
  });
}
