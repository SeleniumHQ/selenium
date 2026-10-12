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

import { standardizeColor } from './core/color.js'
import { getParentElement } from './core/element.js'

// goog.string.toCamelCase: 'background-color' -> 'backgroundColor'. Callers
// pass either spelling, so both have to land on the same property.
function toCamelCase(name: string): string {
  return String(name).replace(/-([a-z])/g, function (_all, letter: string) {
    return letter.toUpperCase()
  })
}

// goog.style.getComputedStyle indexed the declaration with the camel-cased
// name and fell back to getPropertyValue, returning '' rather than null when
// there is no view to compute against. The empty string is what makes the
// cascaded fallback below fire.
function getComputedStyleValue(elem: Element, styleName: string): string {
  const view = elem.ownerDocument.defaultView
  if (!view) {
    return ''
  }
  const styles = view.getComputedStyle(elem, null)
  if (!styles) {
    return ''
  }
  return (styles as unknown as Record<string, string>)[styleName] ||
    styles.getPropertyValue(styleName) ||
    ''
}

// bot.dom.getCascadedStyle_. The elem.currentStyle preference the original
// opened with was IE-only and is dropped; every browser we support fell
// through to elem.style anyway.
function getCascadedStyle(elem: Element, styleName: string): string | null {
  const style = (elem as HTMLElement).style
  let value: string | undefined = (style as unknown as Record<string, string>)[styleName]
  if (value === undefined && typeof style.getPropertyValue === 'function') {
    value = style.getPropertyValue(styleName)
  }

  if (value !== 'inherit') {
    return value !== undefined ? value : null
  }

  const parent = getParentElement(elem)
  return parent ? getCascadedStyle(parent, styleName) : null
}

// The effective value of a CSS property, with colours normalised.
//
// This is bot.dom.getEffectiveStyle. It is exported twice -- as
// getEffectiveStyle and as getValueOfCssProperty -- because the bindings do
// not agree on a name (value_of_css_property, css_value, getCssValue,
// GetCssValue) and the implementation's own name is the only neutral one. The
// alias is an export-map entry over this single artifact, never a second
// build target, so the two names cannot drift apart.
function getEffectiveStyle(elem: Element, propertyName: string): string | null {
  let styleName = toCamelCase(propertyName)
  if (styleName === 'float' || styleName === 'cssFloat' || styleName === 'styleFloat') {
    // 'float' is a reserved word, so the CSSOM spells the property cssFloat.
    // The IE-only styleFloat spelling the original also chose between is gone.
    styleName = 'cssFloat'
  }

  const style = getComputedStyleValue(elem, styleName) || getCascadedStyle(elem, styleName)
  if (style === null) {
    return null
  }

  return standardizeColor(styleName, style)
}

export default getEffectiveStyle
