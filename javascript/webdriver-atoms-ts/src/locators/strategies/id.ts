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
 * @fileoverview Locating elements by ID attribute.
 */

/**
 * Find a single element by its ID attribute.
 *
 * @param id The ID value to search for.
 * @param root The document or element to search within.
 * @returns The element with the given ID, or null if not found.
 */
export function single(id: string, root: Document | Element): Element | null {
    if (root.nodeType === Node.DOCUMENT_NODE && typeof (root as Document).getElementById === 'function') {
        return (root as Document).getElementById(id);
    }
    // Fallback to querySelector if getElementById is not available
    return root.querySelector(`#${id.replace(/([\\!"#$%&'()*+,./:;?@\[\]^`{|}~])/g, '\\$1')}`);
}

/**
 * Find all elements by the given ID (should only be one per document).
 *
 * @param id The ID value to search for.
 * @param root The document or element to search within.
 * @returns An array containing the element with the given ID (0 or 1 element).
 */
export function many(id: string, root: Document | Element): Element[] {
    const element = single(id, root);
    return element ? [element] : [];
}
