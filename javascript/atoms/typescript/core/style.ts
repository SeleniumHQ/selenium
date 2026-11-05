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

// A single computed-style read. core/shown.ts has its own memoised copy of
// this because it reads hundreds of values per call; callers that want one
// property should use this one rather than paying for a cache they will throw
// away immediately.
//
// The cascaded-style fallback and colour standardisation from the Closure
// bot.dom.getEffectiveStyle belong to the get_effective_style atom, not here.
export function getEffectiveStyle(elem: Element, propertyName: string): string | null {
  const win = elem.ownerDocument.defaultView
  const computed = win ? win.getComputedStyle(elem) : null
  if (!computed) {
    return null
  }
  return computed.getPropertyValue(propertyName) || null
}
