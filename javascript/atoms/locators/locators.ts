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
 * @fileoverview Element locator functions.
 */

import { BotError, ErrorCode } from '../error';
import * as className from './classname';
import * as css from './css';
import * as id from './id';
import * as linkText from './link_text';
import { partialLinkText } from './link_text';
import * as name from './name';
import * as relative from './relative';
import * as tagName from './tag_name';
import * as xpath from './xpath';

/**
 * Locator strategy interface.
 */
export interface Strategy {
  single: (target: unknown, root: Document | Element) => Element | null;
  many: (target: unknown, root: Document | Element) => ArrayLike<Element>;
}

/**
 * Known element location strategies. The returned objects have two
 * methods on them, "single" and "many", for locating a single element
 * or multiple elements, respectively.
 */
const STRATEGIES: Record<string, Strategy> = {
  className: className as Strategy,
  'class name': className as Strategy,

  css: css as Strategy,
  'css selector': css as Strategy,

  relative: relative as unknown as Strategy,

  id: id as Strategy,

  linkText: linkText as Strategy,
  'link text': linkText as Strategy,

  name: name as Strategy,

  partialLinkText: partialLinkText as Strategy,
  'partial link text': partialLinkText as Strategy,

  tagName: tagName as Strategy,
  'tag name': tagName as Strategy,

  xpath: xpath as Strategy,
};

/**
 * Add or override an existing strategy for locating elements.
 *
 * @param strategyName The name of the strategy.
 * @param strategy The strategy to use.
 */
export function add(strategyName: string, strategy: Strategy): void {
  STRATEGIES[strategyName] = strategy;
}

/**
 * Returns one key from the object map that is not present in the
 * Object.prototype, if any exists.
 *
 * @param target The object to pick a key from.
 * @return The key or null if the object is empty.
 */
export function getOnlyKey(target: Record<string, unknown>): string | null {
  for (const k in target) {
    if (Object.prototype.hasOwnProperty.call(target, k)) {
      return k;
    }
  }
  return null;
}

/**
 * Gets the current document.
 */
function getDocument(): Document {
  return document;
}

/**
 * Find the first element in the DOM matching the target. The target
 * object should have a single key, the name of which determines the
 * locator strategy and the value of which gives the value to be
 * searched for. For example {id: 'foo'} indicates that the first
 * element on the DOM with the ID 'foo' should be returned.
 *
 * @param target The selector to search for.
 * @param optRoot The node from which to start the search. If not specified,
 *     will use `document` as the root.
 * @return The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
export function findElement(
  target: Record<string, unknown>,
  optRoot?: Document | Element
): Element | null {
  const key = getOnlyKey(target);

  if (key) {
    const strategy = STRATEGIES[key];
    if (strategy && typeof strategy.single === 'function') {
      const root = optRoot || getDocument();
      return strategy.single(target[key] as string | object, root);
    }
  }
  throw new BotError(ErrorCode.INVALID_ARGUMENT, 'Unsupported locator strategy: ' + key);
}

/**
 * Find all elements in the DOM matching the target. The target object
 * should have a single key, the name of which determines the locator
 * strategy and the value of which gives the value to be searched
 * for. For example {name: 'foo'} indicates that all elements with the
 * 'name' attribute equal to 'foo' should be returned.
 *
 * @param target The selector to search for.
 * @param optRoot The node from which to start the search. If not specified,
 *     will use `document` as the root.
 * @return All matching elements found in the DOM.
 */
export function findElements(
  target: Record<string, unknown>,
  optRoot?: Document | Element
): ArrayLike<Element> {
  const key = getOnlyKey(target);

  if (key) {
    const strategy = STRATEGIES[key];
    if (strategy && typeof strategy.many === 'function') {
      const root = optRoot || getDocument();
      return strategy.many(target[key] as string | object, root);
    }
  }
  throw new BotError(ErrorCode.INVALID_ARGUMENT, 'Unsupported locator strategy: ' + key);
}

// Wire up the relative locator with find functions to avoid circular dependency
relative.setFindElement(findElement);
relative.setFindElements(findElements);

// Re-export individual locator modules for direct access
export { className, css, id, linkText, name, partialLinkText, relative, tagName, xpath };
