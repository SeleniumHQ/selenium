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
 * @fileoverview Locator functions for finding elements by class name.
 */

import { BotError, ErrorCode } from '../error';

/**
 * Tests whether the standardized W3C Selectors API are available on an element.
 */
function canUseQuerySelector(root: Document | Element): boolean {
  return (
    typeof root.querySelectorAll === 'function' && typeof root.querySelector === 'function'
  );
}

/**
 * Find an element by its class name.
 *
 * @param target The class name to search for.
 * @param root The document or element to perform the search under.
 * @return The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
export function single(target: string, root: Document | Element): Element | null {
  if (!target) {
    throw new BotError(ErrorCode.INVALID_SELECTOR_ERROR, 'No class name specified');
  }

  target = target.trim();
  if (target.indexOf(' ') !== -1) {
    throw new BotError(ErrorCode.INVALID_SELECTOR_ERROR, 'Compound class names not permitted');
  }

  // Closure will not properly escape class names that contain a '.' when using
  // the native selectors API, so we have to handle this ourselves.
  if (canUseQuerySelector(root)) {
    try {
      return root.querySelector('.' + target.replace(/\./g, '\\.')) || null;
    } catch (e) {
      throw new BotError(
        ErrorCode.INVALID_SELECTOR_ERROR,
        'An invalid or illegal class name was specified'
      );
    }
  }

  const elements = root.getElementsByClassName(target);
  return elements.length ? elements[0] : null;
}

/**
 * Find all elements by class name.
 *
 * @param target The class name to search for.
 * @param root The document or element to perform the search under.
 * @return All matching elements, or an empty list.
 */
export function many(target: string, root: Document | Element): Element[] | NodeListOf<Element> {
  if (!target) {
    throw new BotError(ErrorCode.INVALID_SELECTOR_ERROR, 'No class name specified');
  }

  target = target.trim();
  if (target.indexOf(' ') !== -1) {
    throw new BotError(ErrorCode.INVALID_SELECTOR_ERROR, 'Compound class names not permitted');
  }

  // Closure will not properly escape class names that contain a '.' when using
  // the native selectors API, so we have to handle this ourselves.
  if (canUseQuerySelector(root)) {
    try {
      return root.querySelectorAll('.' + target.replace(/\./g, '\\.'));
    } catch (e) {
      throw new BotError(
        ErrorCode.INVALID_SELECTOR_ERROR,
        'An invalid or illegal class name was specified'
      );
    }
  }

  return Array.from(root.getElementsByClassName(target));
}
