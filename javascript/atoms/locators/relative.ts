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
 * @fileoverview Relative locator functions for finding elements by spatial relationships.
 */

import { BotError, ErrorCode } from '../error';
import { getClientRect } from '../dom';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Forward declaration - will be set by locators.ts to avoid circular dependency
let findElementFn:
  | ((target: Record<string, unknown>, root?: Document | Element) => Element | null)
  | null = null;
let findElementsFn:
  | ((target: Record<string, unknown>, root?: Document | Element) => ArrayLike<Element>)
  | null = null;

/**
 * Sets the findElement function reference. Called by locators.ts to avoid circular imports.
 */
export function setFindElement(
  fn: (target: Record<string, unknown>, root?: Document | Element) => Element | null
): void {
  findElementFn = fn;
}

/**
 * Sets the findElements function reference. Called by locators.ts to avoid circular imports.
 */
export function setFindElements(
  fn: (target: Record<string, unknown>, root?: Document | Element) => ArrayLike<Element>
): void {
  findElementsFn = fn;
}

type Filter = (element: Element) => boolean;

type ProximityFn = (expected: Rect, toFind: Rect) => boolean;

type SelectorLike = Element | (() => Element) | Record<string, unknown>;

interface FilterDescriptor {
  kind: string;
  args: unknown[];
}

interface RelativeTarget {
  root: Element | Record<string, unknown>;
  filters: FilterDescriptor[];
}

/**
 * Helper to check if a value is an object (but not null).
 */
function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

/**
 * Helper to check if something looks array-like.
 */
function isArrayLike(value: unknown): value is ArrayLike<unknown> {
  return (
    Array.isArray(value) ||
    (isObject(value) && typeof (value as ArrayLike<unknown>).length === 'number')
  );
}

/**
 * Creates a proximity filter function.
 */
function proximity(selector: SelectorLike, proximityFn: ProximityFn): Filter {
  return function (compareTo: Element): boolean {
    const element = resolve(selector);
    const rect1 = getClientRect(element);
    const rect2 = getClientRect(compareTo);
    return proximityFn(rect1, rect2);
  };
}

/**
 * Relative locator to find elements that are above the expected one.
 */
function above(selector: SelectorLike): Filter {
  return proximity(selector, function (expected, toFind) {
    return toFind.top + toFind.height <= expected.top;
  });
}

/**
 * Relative locator to find elements that are below the expected one.
 */
function below(selector: SelectorLike): Filter {
  return proximity(selector, function (expected, toFind) {
    return toFind.top >= expected.top + expected.height;
  });
}

/**
 * Relative locator to find elements that are to the left of the expected one.
 */
function leftOf(selector: SelectorLike): Filter {
  return proximity(selector, function (expected, toFind) {
    return toFind.left + toFind.width <= expected.left;
  });
}

/**
 * Relative locator to find elements that are to the right of the expected one.
 */
function rightOf(selector: SelectorLike): Filter {
  return proximity(selector, function (expected, toFind) {
    return toFind.left >= expected.left + expected.width;
  });
}

/**
 * Relative locator to find elements that are directly above the expected one.
 */
function straightAbove(selector: SelectorLike): Filter {
  return proximity(selector, function (expected, toFind) {
    return (
      toFind.left < expected.left + expected.width &&
      toFind.left + toFind.width > expected.left &&
      toFind.top + toFind.height <= expected.top
    );
  });
}

/**
 * Relative locator to find elements that are directly below the expected one.
 */
function straightBelow(selector: SelectorLike): Filter {
  return proximity(selector, function (expected, toFind) {
    return (
      toFind.left < expected.left + expected.width &&
      toFind.left + toFind.width > expected.left &&
      toFind.top >= expected.top + expected.height
    );
  });
}

/**
 * Relative locator to find elements that are directly to the left of the expected one.
 */
function straightLeftOf(selector: SelectorLike): Filter {
  return proximity(selector, function (expected, toFind) {
    return (
      toFind.top < expected.top + expected.height &&
      toFind.top + toFind.height > expected.top &&
      toFind.left + toFind.width <= expected.left
    );
  });
}

/**
 * Relative locator to find elements that are directly to the right of the expected one.
 */
function straightRightOf(selector: SelectorLike): Filter {
  return proximity(selector, function (expected, toFind) {
    return (
      toFind.top < expected.top + expected.height &&
      toFind.top + toFind.height > expected.top &&
      toFind.left >= expected.left + expected.width
    );
  });
}

/**
 * Find elements within (by default) 50 pixels of the selected element.
 * An element is not near itself.
 */
function near(selector: SelectorLike, optDistance?: number): Filter {
  let distance: number;
  if (optDistance) {
    distance = optDistance;
  } else if (
    typeof selector === 'object' &&
    typeof (selector as Record<string, unknown>)['distance'] === 'number'
  ) {
    distance = (selector as Record<string, unknown>)['distance'] as number;
  } else {
    distance = 50;
  }

  return function (compareTo: Element): boolean {
    const element = resolve(selector);

    if (element === compareTo) {
      return false;
    }

    const rect1 = getClientRect(element);
    const rect2 = getClientRect(compareTo);

    // Create an expanded rectangle around rect1
    const rect1Bigger: Rect = {
      left: rect1.left - distance,
      top: rect1.top - distance,
      width: rect1.width + distance * 2,
      height: rect1.height + distance * 2,
    };

    // Check if rectangles intersect
    return !(
      rect1Bigger.left > rect2.left + rect2.width ||
      rect1Bigger.left + rect1Bigger.width < rect2.left ||
      rect1Bigger.top > rect2.top + rect2.height ||
      rect1Bigger.top + rect1Bigger.height < rect2.top
    );
  };
}

/**
 * Checks if a value is a DOM Element.
 */
function isDomElement(value: unknown): value is Element {
  return (
    value instanceof Element ||
    (typeof value === 'object' &&
      value !== null &&
      (value as Node).nodeType === 1)
  );
}

/**
 * Resolves a selector to an element.
 */
function resolve(selector: SelectorLike): Element {
  if (isDomElement(selector)) {
    return selector;
  }

  if (typeof selector === 'function') {
    return resolve(selector());
  }

  if (isObject(selector) && findElementFn) {
    const element = findElementFn(selector as Record<string, unknown>);
    if (!element) {
      throw new BotError(
        ErrorCode.NO_SUCH_ELEMENT,
        'No element has been found by ' + JSON.stringify(selector)
      );
    }
    return element;
  }

  throw new BotError(
    ErrorCode.INVALID_ARGUMENT,
    'Selector is of wrong type: ' + JSON.stringify(selector)
  );
}

type StrategyFn = (selector: SelectorLike, ...args: unknown[]) => Filter;

/**
 * Strategy functions for different relative locator types.
 */
const STRATEGIES: Record<string, StrategyFn> = {
  above: above as StrategyFn,
  below: below as StrategyFn,
  left: leftOf as StrategyFn,
  near: near as StrategyFn,
  right: rightOf as StrategyFn,
  straightAbove: straightAbove as StrategyFn,
  straightBelow: straightBelow as StrategyFn,
  straightLeft: straightLeftOf as StrategyFn,
  straightRight: straightRightOf as StrategyFn,
};

/**
 * Resolver functions for extracting anchor elements from filters.
 */
const RESOLVERS: Record<string, (selector: SelectorLike) => Element> = {
  above: resolve,
  below: resolve,
  left: resolve,
  near: resolve,
  right: resolve,
  straightAbove: resolve,
  straightBelow: resolve,
  straightLeft: resolve,
  straightRight: resolve,
};

/**
 * Filters elements based on relative locator criteria.
 */
function filterElements(allElements: ArrayLike<Element>, filters: FilterDescriptor[]): Element[] {
  const toReturn: Element[] = [];

  Array.from(allElements).forEach((element) => {
    if (!element) {
      return;
    }

    const include = Array.from(filters).every((filter) => {
      const name = filter['kind'];
      const strategy = STRATEGIES[name];

      if (!strategy) {
        throw new BotError(ErrorCode.INVALID_ARGUMENT, 'Cannot find filter suitable for ' + name);
      }

      const filterFunc = strategy.apply(null, filter['args'] as [SelectorLike, ...unknown[]]);
      return filterFunc(element);
    });

    if (include) {
      toReturn.push(element);
    }
  });

  // Sort by proximity to the last anchor element
  const finalFilter = filters[filters.length - 1];
  const name = finalFilter ? finalFilter['kind'] : 'unknown';
  const resolver = RESOLVERS[name];
  if (!resolver) {
    return toReturn;
  }

  const lastAnchor = resolver.apply(null, finalFilter['args'] as [SelectorLike]);
  if (!lastAnchor) {
    return toReturn;
  }

  return sortByProximity(lastAnchor, toReturn);
}

/**
 * Sorts elements by proximity to an anchor element.
 */
function sortByProximity(anchor: Element, elements: Element[]): Element[] {
  const anchorRect = getClientRect(anchor);
  const anchorCenter = {
    x: anchorRect.left + Math.max(1, anchorRect.width) / 2,
    y: anchorRect.top + Math.max(1, anchorRect.height) / 2,
  };

  const distance = function (e: Element): number {
    const rect = getClientRect(e);
    const center = {
      x: rect.left + Math.max(1, rect.width) / 2,
      y: rect.top + Math.max(1, rect.height) / 2,
    };

    const x = Math.pow(anchorCenter.x - center.x, 2);
    const y = Math.pow(anchorCenter.y - center.y, 2);

    return Math.sqrt(x + y);
  };

  elements.sort(function (left, right) {
    return distance(left) - distance(right);
  });

  return elements;
}

/**
 * Find an element by using a relative locator.
 *
 * @param target The search criteria.
 * @param _root The document or element to perform the search under (ignored).
 * @return The first matching element, or null if no such element could be found.
 */
export function single(target: RelativeTarget, _root: Document | Element): Element | null {
  const matches = many(target, _root);
  if (matches.length === 0) {
    return null;
  }
  return matches[0];
}

/**
 * Find many elements by using a relative locator.
 *
 * @param target The search criteria.
 * @param root The document or element to perform the search under.
 * @return All matching elements, or an empty list.
 */
export function many(target: RelativeTarget, root: Document | Element): Element[] {
  if (!target.hasOwnProperty('root') || !target.hasOwnProperty('filters')) {
    throw new BotError(
      ErrorCode.INVALID_ARGUMENT,
      'Locator not suitable for relative locators: ' + JSON.stringify(target)
    );
  }

  if (!isArrayLike(target['filters'])) {
    throw new BotError(
      ErrorCode.INVALID_ARGUMENT,
      'Targets should be an array: ' + JSON.stringify(target)
    );
  }

  let elements: Element[];
  if (isDomElement(target['root'])) {
    elements = [target['root'] as Element];
  } else if (findElementsFn) {
    elements = Array.from(findElementsFn(target['root'] as Record<string, unknown>, root));
  } else {
    elements = [];
  }

  if (elements.length === 0) {
    return [];
  }

  const filters = target['filters'];
  return filterElements(elements, filters as FilterDescriptor[]);
}
