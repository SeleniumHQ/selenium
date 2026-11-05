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

export interface Size {
  width: number;
  height: number;
}

// The size of an element's border box, as W3C Get Element Rect defines it.
//
// This deliberately does not reproduce goog.style.getSize, which the Closure
// get-size fragment used. That function read offsetWidth/offsetHeight, so it
// was integer-valued and ignored transforms, and for a display:none element it
// temporarily rewrote visibility/position/display, measured, and restored --
// mutating the DOM mid-read to serve a caller that no longer exists. No
// Selenium binding consumes get-size, and Appium's own copy of this atom has
// no such behaviour either.
//
// A hidden element therefore measures 0x0 here. If a force-visible measurement
// is ever needed again it should arrive under its own name rather than be
// folded back into "size".
function getSize(element: Element): Size {
  const rect = getClientRect(element)
  return { width: rect.width, height: rect.height }
}

export default getSize
