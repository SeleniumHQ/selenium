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
 * @fileoverview Fragment entry point for getting element size.
 * This is a fresh TypeScript implementation replacing goog.style.getSize.
 */

/**
 * Returns the size of an element, including padding but not border or margin.
 * This is equivalent to the element's offsetWidth and offsetHeight, but uses
 * getBoundingClientRect for more accurate floating-point values.
 *
 * @param element The element to get the size of.
 * @returns An object with width and height properties.
 */
function getSize(element: Element): { width: number; height: number } {
  // Use getBoundingClientRect for accurate dimensions
  // This includes padding but accounts for CSS transforms
  const rect = element.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
  };
}

(globalThis as unknown as { __fragment__: typeof getSize }).__fragment__ = getSize;
