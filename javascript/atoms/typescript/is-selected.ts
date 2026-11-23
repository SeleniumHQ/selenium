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

import { isSelectable, isSelectedState } from './core/element.js'

// Ported from webdriver.atoms.element.isSelected, which answers false for an
// element that cannot be selected at all. The lower-level bot.dom.core.isSelected
// threw ELEMENT_NOT_SELECTABLE there instead; this is the shape the bindings
// and Appium consume.
function isSelected(element: Element): boolean {
  if (!isSelectable(element)) {
    return false
  }
  return isSelectedState(element)
}

export default isSelected
