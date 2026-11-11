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

import { Coordinate, Region, getClientRegion } from './core/geometry.js'
import { scrollIntoView } from './core/scroll.js'

// Scrolls the element into the viewport and returns its position in client
// space.
//
// This is webdriver.atoms.element.getLocationInView, and it is the one atom
// outside the inject layer that mutates page state: it scrolls, and the scroll
// position is still changed when it returns. Callers that only want to read a
// position want get_location, which is page-space and moves nothing.
//
// optRegion narrows the target to a sub-region of the element, which is how
// callers scroll a specific point -- a click target, say -- into view rather
// than the element as a whole.
function getTopLeftCoordinates(element: Element, optRegion?: Region): Coordinate {
  scrollIntoView(element, optRegion)
  const region = getClientRegion(element, optRegion)
  return { x: region.left, y: region.top }
}

export default getTopLeftCoordinates
