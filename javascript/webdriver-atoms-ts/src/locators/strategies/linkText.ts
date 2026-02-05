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
 * @fileoverview Locating links by their text content.
 */

/**
 * Find a single link element by its visible text.
 *
 * @param text The link text to search for (exact match).
 * @param root The document or element to search within.
 * @param isPartial Whether to do a partial match.
 * @returns The first link matching the text, or null if not found.
 */
function findLinkByText(
  text: string,
  root: Document | Element,
  isPartial: boolean = false
): Element | null {
  const links = root.querySelectorAll('a');
  for (const link of links) {
    const linkText = getTextContent(link);
    if (isPartial ? linkText.includes(text) : linkText === text) {
      return link;
    }
  }
  return null;
}

/**
 * Find all link elements by their visible text.
 *
 * @param text The link text to search for.
 * @param root The document or element to search within.
 * @param isPartial Whether to do a partial match.
 * @returns An array of all links matching the text.
 */
function findLinksByText(
  text: string,
  root: Document | Element,
  isPartial: boolean = false
): Element[] {
  const links = root.querySelectorAll('a');
  const results: Element[] = [];
  for (const link of links) {
    const linkText = getTextContent(link);
    if (isPartial ? linkText.includes(text) : linkText === text) {
      results.push(link);
    }
  }
  return results;
}

/**
 * Get the visible text content of an element.
 *
 * @param element The element to get text from.
 * @returns The visible text content.
 * @private
 */
function getTextContent(element: Element): string {
  const text: string[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue?.trim();
      if (value) {
        text.push(value);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      // Skip script and style elements
      if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          if (child) {
            walk(child);
          }
        }
      }
    }
  };

  walk(element);
  return text.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Find a single link by exact text match.
 *
 * @param text The exact link text to search for.
 * @param root The document or element to search within.
 * @returns The first link with the exact text, or null if not found.
 */
export function single(text: string, root: Document | Element): Element | null {
  return findLinkByText(text, root, false);
}

/**
 * Find all links by exact text match.
 *
 * @param text The exact link text to search for.
 * @param root The document or element to search within.
 * @returns An array of all links with the exact text.
 */
export function many(text: string, root: Document | Element): Element[] {
  return findLinksByText(text, root, false);
}

/**
 * Find a single link by partial text match.
 *
 * @param text The partial link text to search for.
 * @param root The document or element to search within.
 * @returns The first link containing the text, or null if not found.
 */
export function singlePartial(text: string, root: Document | Element): Element | null {
  return findLinkByText(text, root, true);
}

/**
 * Find all links by partial text match.
 *
 * @param text The partial link text to search for.
 * @param root The document or element to search within.
 * @returns An array of all links containing the text.
 */
export function manyPartial(text: string, root: Document | Element): Element[] {
  return findLinksByText(text, root, true);
}
