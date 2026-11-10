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

import { getClientRect } from './core/geometry.js'
import isShown from './core/shown.js'

// goog.math.Rect's serialised form. The Closure atom returned that object and
// bindings read these four keys off the wire, so the shape is part of the
// contract -- deliberately not the six-sided Rect used inside core/geometry.
export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

// The element's bounds in page space, or null when it is not shown.
//
// This is webdriver.atoms.element.getLocation, which was
// goog.style.getBounds behind an isShown guard: page offset from
// goog.style.getPageOffset, size from goog.style.getSize.
//
// Page space rather than client space is the whole point of this atom -- the
// coordinates do not move when the document scrolls. get_top_left_coordinates
// is the client-space counterpart.
//
// The size half follows get_size in measuring the border box via
// getBoundingClientRect, so the two atoms cannot disagree about how big an
// element is. That makes the width and height fractional and transform-aware
// where goog.style.getSize's were integer and transform-ignorant.
function getLocation(element: Element): Bounds | null {
  if (!isShown(element)) {
    return null
  }

  const rect = getClientRect(element)
  const win = element.ownerDocument.defaultView
  const scrollX = win ? win.pageXOffset : 0
  const scrollY = win ? win.pageYOffset : 0

  return {
    left: rect.left + scrollX,
    top: rect.top + scrollY,
    width: rect.width,
    height: rect.height,
  }
}

export default getLocation
