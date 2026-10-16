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

import { ELEMENT_KEY, getElement, getWindow, wrapError, wrapResponse, type Response } from './core/inject.js'
import { findElement } from './core/locators.js'

// webdriver.atoms.inject.locators.findElement: find_element behind the inject
// layer. Takes the strategy and target as two strings and the root and window
// as wire handles, and answers with the JSON {status, value} envelope -- so
// unlike find_element it can be called with values that crossed the wire.
//
// The name is inherited: despite the suffix this is the wrapped atom, and
// find_element is the raw one.
function findElementFragment(
  strategy: string,
  using: string,
  optRoot?: { [ELEMENT_KEY]: string },
  optWindow?: { WINDOW: string },
): string {
  let response: Response
  try {
    const targetWindow = getWindow(optWindow)
    const root = optRoot ? (getElement(optRoot[ELEMENT_KEY], targetWindow.document) as Element) : targetWindow.document
    response = wrapResponse(findElement({ [strategy]: using }, root))
  } catch (ex) {
    response = wrapError(ex)
  }
  return JSON.stringify(response)
}

export default findElementFragment
