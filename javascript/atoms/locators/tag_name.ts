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
 * @fileoverview Locator functions for finding elements by tag name.
 */

import { BotError, ErrorCode } from '../error';

/**
 * Find an element by its tag name.
 *
 * @param target The tag name to search for.
 * @param root The document or element to perform the search under.
 * @return The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
export function single(target: string, root: Document | Element): Element | null {
  if (target === '') {
    throw new BotError(
      ErrorCode.INVALID_SELECTOR_ERROR,
      'Unable to locate an element with the tagName ""'
    );
  }
  return root.getElementsByTagName(target)[0] || null;
}

/**
 * Find all elements with a given tag name.
 *
 * @param target The tag name to search for.
 * @param root The document or element to perform the search under.
 * @return All matching elements, or an empty list.
 */
export function many(target: string, root: Document | Element): HTMLCollectionOf<Element> {
  if (target === '') {
    throw new BotError(
      ErrorCode.INVALID_SELECTOR_ERROR,
      'Unable to locate an element with the tagName ""'
    );
  }
  return root.getElementsByTagName(target);
}
