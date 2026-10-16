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

// Raw attribute and property access, ported from bot.dom.core (domcore.js).
//
// This is *not* the WebDriver getAttribute algorithm — that one consults
// properties, boolean-attribute tables and aliases, and lives in
// get-attribute.ts. This returns what the author actually wrote in the markup.
//
// The IE-only branches in the Closure original (IE_DOC_PRE8's <input value>,
// IE_DOC_PRE9's boolean attributes, the <option value> text fallback) are
// dropped, matching every other TypeScript atom in this directory.

// Splits on semicolons that are not inside quotes or parens, so a value like
// `background: url(a;b)` or `content: ";"` survives intact. If the attribute
// ends in a semicolon the split yields a trailing empty entry, which the
// caller skips.
const SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS = new RegExp(
  '[;]+' +
    '(?=(?:(?:[^"]*"){2})*[^"]*$)' +
    "(?=(?:(?:[^']*'){2})*[^']*$)" +
    '(?=(?:[^()]*\\([^()]*\\))*[^()]*$)',
)

// Lower-cases property names and guarantees a trailing semicolon, so the same
// style attribute reads identically no matter how the browser serialised it.
function standardizeStyleAttribute(value: string): string {
  const declarations: string[] = []
  for (const pair of value.split(SPLIT_STYLE_ATTRIBUTE_ON_SEMICOLONS)) {
    const separator = pair.indexOf(':')
    if (separator > 0) {
      declarations.push(pair.slice(0, separator).toLowerCase(), ':', pair.slice(separator + 1), ';')
    }
  }
  const css = declarations.join('')
  return css.charAt(css.length - 1) === ';' ? css : css + ';'
}

export function getAttribute(element: Element, attributeName: string): string | null {
  const name = attributeName.toLowerCase()

  if (name === 'style') {
    return standardizeStyleAttribute((element as HTMLElement).style.cssText)
  }

  // `specified` distinguishes an attribute the author wrote from one the
  // browser defaulted in.
  const attr = element.getAttributeNode(name)
  return attr && attr.specified ? attr.value : null
}

export function getProperty(element: Element, propertyName: string): unknown {
  return (element as unknown as Record<string, unknown>)[propertyName]
}
