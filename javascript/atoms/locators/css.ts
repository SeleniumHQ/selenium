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
 * @fileoverview CSS selector locator functions.
 */

import { BotError, ErrorCode } from '../error';

const NODE_TYPE_ELEMENT = 1;

/**
 * Find an element by using a CSS selector.
 *
 * @param target The selector to search for.
 * @param root The document or element to perform the search under.
 * @return The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
export function single(target: string, root: Document | Element): Element | null {
  if (typeof (root as unknown as Record<string, unknown>)['querySelector'] !== 'function') {
    throw Error('CSS selection is not supported');
  }

  if (!target) {
    throw new BotError(ErrorCode.INVALID_SELECTOR_ERROR,
      'No selector specified');
  }

  target = target.trim();

  let element: Element | null;
  try {
    element = root.querySelector(target);
  } catch (e) {
    throw new BotError(ErrorCode.INVALID_SELECTOR_ERROR,
      'An invalid or illegal selector was specified');
  }

  return element && element.nodeType === NODE_TYPE_ELEMENT ? element : null;
}

/**
 * Find all elements matching a CSS selector.
 *
 * @param target The selector to search for.
 * @param root The document or element to perform the search under.
 * @return All matching elements, or an empty list.
 */
export function many(target: string, root: Document | Element): NodeListOf<Element> {
  if (typeof (root as unknown as Record<string, unknown>)['querySelectorAll'] !== 'function') {
    throw Error('CSS selection is not supported');
  }

  if (!target) {
    throw new BotError(ErrorCode.INVALID_SELECTOR_ERROR,
      'No selector specified');
  }

  target = target.trim();

  try {
    return root.querySelectorAll(target);
  } catch (e) {
    throw new BotError(ErrorCode.INVALID_SELECTOR_ERROR,
      'An invalid or illegal selector was specified');
  }
}
