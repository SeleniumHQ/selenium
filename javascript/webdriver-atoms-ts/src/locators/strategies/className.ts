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
 * @fileoverview Locating elements by class name.
 */

/**
 * Find a single element by class name.
 *
 * @param className The class name to search for (single class, no spaces).
 * @param root The document or element to search within.
 * @returns The first element with the given class, or null if not found.
 */
export function single(className: string, root: Document | Element): Element | null {
    return root.querySelector(`.${className.replace(/\./, '\\.')}`);
}

/**
 * Find all elements by class name.
 *
 * @param className The class name to search for (single class, no spaces).
 * @param root The document or element to search within.
 * @returns An array of all elements with the given class.
 */
export function many(className: string, root: Document | Element): Element[] {
    return Array.from(root.querySelectorAll(`.${className.replace(/\./, '\\.')}`));
}
