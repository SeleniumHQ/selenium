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

import isShown from './core/shown.js'
import { isElement } from './core/element.js'
import { getEffectiveStyle } from './core/style.js'

// Display values that do not force a newline before and after the element.
// "none" is in this list because display:none elements are skipped entirely
// and should not contribute a line break to the running line.
// "table-cell" and the column-group values are inline for line-break purposes
// even though they lay out in a grid. (dom.js line 1149)
const INLINE_DISPLAY_BOXES: ReadonlyArray<string> = [
  'inline',
  'inline-block',
  'inline-table',
  'none',
  'table-cell',
  'table-column',
  'table-column-group',
]

// Two patterns for text-transform:capitalize, applied in order: the first
// titlecases the first letter of each word; the second titlecases a letter
// that opens a "_"- or "*"-delimited run. Unicode property escapes require the
// ES2015 "u" flag; the catch block supplies Latin-only fallback patterns for
// any engine that does not support them. (dom.js lines 1178-1193)
//
// NOTE: All patterns here use the RegExp constructor rather than literals.
// The fallback patterns use \uXXXX in string form so they survive any source
// file encoding that might convert the escape to a literal character (which
// would then be treated as a line terminator by the TypeScript parser).
const CAPITALIZE_PATTERNS: ReadonlyArray<RegExp> = (function () {
  var letter = '\\p{L}\\u24B6-\\u24E9'
  var wordCharacter = '\'_\\p{M}\\p{N}' + letter
  try {
    return [
      new RegExp('(^|[^' + wordCharacter + '])([' + letter + '])', 'gu'),
      new RegExp(
        '(^|[^' + wordCharacter + '])([_*])([' + letter + '])', 'gu'),
    ]
  } catch (_ignored) {
    // Latin-only fallback for engines without Unicode property escape support.
    var latinLetters = 'A-Za-z\\u00C0-\\u02AF\\u1E00-\\u1EFF\\u24B6-\\u24E9'
    var wordChars = '\'_0-9' + latinLetters + '\\u0300-\\u036F\\u1AB0-\\u1AFF\\u1DC0-\\u1DFF'
    var lowerLetters = 'A-Za-z\\u00C0-\\u02AF\\u1E00-\\u1EFF\\u24D0-\\u24E9'
    return [
      new RegExp('(^|[^' + wordChars + '])([' + latinLetters + '])', 'g'),
      new RegExp('(^|[^' + wordChars + '])([_*])([' + lowerLetters + '])', 'g'),
    ]
  }
})()

// U+2028 (LINE SEPARATOR) and U+2029 (PARAGRAPH SEPARATOR) are treated as
// breaking spaces by the spec and as line terminators by ES2017 and earlier,
// so they cannot appear literally inside a regex literal in TypeScript source.
// Use the RegExp constructor instead. (dom.js lines 1226-1230)
const BREAKING_SPACE_RE = new RegExp('[ \\f\\t\\v\\u2028\\u2029]+', 'g')
const PRE_SPACE_RE = new RegExp('[ \\f\\t\\v\\u2028\\u2029]', 'g')

// Trims all whitespace except NBSP (\xa0) from both ends of a string.
// (dom.js line 999: bot.dom.trimExcludingNonBreakingSpaceCharacters_)
function trimExcludingNbsp(str: string): string {
  return str.replace(/^[^\S\xa0]+|[^\S\xa0]+$/g, '')
}

// goog.string.isEmptyOrWhitespace treats \xa0 as whitespace for this check.
// (referenced at dom.js lines 1079, 1115)
function isEmptyOrWhitespace(str: string): boolean {
  return /^[\s\xa0]*$/.test(str)
}

// Joins the accumulated lines with '\n', trims each line and the overall
// result (excluding NBSP), then converts all remaining NBSP to regular spaces.
// (dom.js line 1010: bot.dom.concatenateCleanedLines_)
function concatenateCleanedLines(lines: string[]): string {
  const trimmedLines = lines.map(trimExcludingNbsp)
  const joined = trimmedLines.join('\n')
  const trimmed = trimExcludingNbsp(joined)
  return trimmed.replace(/\xa0/g, ' ')
}

// Appends the visible contribution of a text node to the running lines array,
// applying white-space collapsing rules and text-transform.
// (dom.js line 1203: bot.dom.appendVisibleTextLinesFromTextNode_)
function appendTextFromTextNode(
  textNode: Text,
  lines: string[],
  whitespace: string | null,
  textTransform: string | null,
): void {
  // Strip zero-width non-printing characters before regularising spaces, so
  // the zero-width space, which is technically also a space, is not
  // promoted to a regular space. (dom.js 1213)
  // Stripped: U+200B (zero-width space), U+200E (LTR mark), U+200F (RTL mark).
  var text = (textNode.nodeValue || '').replace(/[\u200b\u200e\u200f]/g, '')

  // goog.string.canonicalizeNewlines: normalise \r\n and bare \r to \n.
  // (dom.js 1218)
  text = text.replace(/(\r\n|\r|\n)/g, '\n')

  // white-space: normal and nowrap collapse newlines into spaces.
  if (whitespace === 'normal' || whitespace === 'nowrap') {
    text = text.replace(/\n/g, ' ')
  }

  // white-space: pre and pre-wrap protect internal spacing by converting
  // breaking spaces to NBSP so they survive the later collapsing pass.
  // All other white-space values collapse runs of breaking space to one space.
  // PRE_SPACE_RE and BREAKING_SPACE_RE cover space, \f, \t, \v, U+2028, U+2029
  // (dom.js 1226-1230; constructed as RegExp to avoid literal line terminators)
  if (whitespace === 'pre' || whitespace === 'pre-wrap') {
    text = text.replace(PRE_SPACE_RE, '\xa0')
  } else {
    text = text.replace(BREAKING_SPACE_RE, ' ')
  }

  // text-transform. The capitalize path applies both patterns in sequence:
  // pattern 0 handles word-initial letters, pattern 1 handles letters
  // immediately after a '_' or '*' that opens a run. (dom.js 1232-1247)
  if (textTransform === 'capitalize') {
    text = text.replace(CAPITALIZE_PATTERNS[0], function () {
      return arguments[1] + (arguments[2] as string).toUpperCase()
    })
    text = text.replace(CAPITALIZE_PATTERNS[1], function () {
      return arguments[1] + arguments[2] + (arguments[3] as string).toUpperCase()
    })
  } else if (textTransform === 'uppercase') {
    text = text.toUpperCase()
  } else if (textTransform === 'lowercase') {
    text = text.toLowerCase()
  }

  // Merge into the last accumulated line. If the current line already ends
  // with a space and the new text starts with one, drop the duplicate.
  // (dom.js 1249-1254)
  var currLine = lines.pop() || ''
  if (currLine.endsWith(' ') && text.startsWith(' ')) {
    text = text.substring(1)
  }
  lines.push(currLine + text)
}

// Core element traversal shared by both the flat-DOM and composed-DOM paths.
// isShownFn and childNodeFn are injected so each path plugs in its own
// visibility check and child dispatch. (dom.js lines 1049-1119)
function appendTextFromElementCommon(
  elem: Element,
  lines: string[],
  isShownFn: (e: Element) => boolean,
  childNodeFn: (
    node: Node,
    lines: string[],
    shown: boolean,
    whitespace: string | null,
    textTransform: string | null,
  ) => void,
): void {
  function currLine(): string {
    return lines[lines.length - 1] ?? ''
  }

  // Guarded through a Node-typed alias: isElement returns `node is Element`,
  // so testing elem directly would narrow it to never for the whole of the
  // early-return's else path. isElement rather than a nodeName comparison
  // because it uppercases for XML documents and reads tagName through its
  // descriptor, which a clobbering `name="tagName"` cannot shadow.
  const node: Node = elem
  if (isElement(node, 'BR')) {
    lines.push('')
    return
  }

  const isTD = isElement(elem, 'TD')
  const display = getEffectiveStyle(elem, 'display')
  // <td> sometimes reports a block display value; treat it as inline so it
  // behaves like a table cell for newline purposes. (dom.js 1063)
  const isBlock = !isTD && !INLINE_DISPLAY_BOXES.includes(display || '')

  // Insert a newline before a block element when the current line is non-empty,
  // unless the previous sibling uses display:run-in (which flows into this
  // element). A floated element is never run into. (dom.js 1070-1081)
  // Dropped: styleFloat (IE-only). getPropertyValue('float') is the CSS name.
  const previousElementSibling = elem.previousElementSibling
  const prevDisplay = previousElementSibling
    ? getEffectiveStyle(previousElementSibling, 'display')
    : ''
  const thisFloat = getEffectiveStyle(elem, 'float')
  const runIntoThis = prevDisplay === 'run-in' && thisFloat === 'none'
  if (isBlock && !runIntoThis && !isEmptyOrWhitespace(currLine())) {
    lines.push('')
  }

  // A non-shown element still traverses its children so that a child with an
  // explicit visibility:visible can contribute its text even when the parent
  // has visibility:hidden. Text nodes that are direct children of a non-shown
  // element are silenced via shown=false. (dom.js 1084-1088)
  const shown = isShownFn(elem)

  var whitespace: string | null = null
  var textTransform: string | null = null
  if (shown) {
    whitespace = getEffectiveStyle(elem, 'white-space')
    textTransform = getEffectiveStyle(elem, 'text-transform')
  }

  for (var i = 0; i < elem.childNodes.length; i++) {
    childNodeFn(elem.childNodes[i], lines, shown, whitespace, textTransform)
  }

  const line = currLine()

  // Table cells are separated by a space, not a tab. (dom.js 1107-1110)
  if ((isTD || display === 'table-cell') && line && !line.endsWith(' ')) {
    lines[lines.length - 1] += ' '
  }

  // Insert a newline after a block element when there is content on the
  // current line, unless this element itself uses display:run-in.
  // (dom.js 1114-1117)
  if (isBlock && display !== 'run-in' && !isEmptyOrWhitespace(line)) {
    lines.push('')
  }
}

// Flat-DOM traversal: no Shadow DOM awareness.
// (dom.js lines 1127-1140: bot.dom.appendVisibleTextLinesFromElement_)
function appendTextFromElement(elem: Element, lines: string[]): void {
  appendTextFromElementCommon(
    elem,
    lines,
    isShown,
    function (node, lines, shown, whitespace, textTransform) {
      if (node.nodeType === Node.TEXT_NODE && shown) {
        appendTextFromTextNode(
          node as Text, lines, whitespace, textTransform)
      } else if (isElement(node)) {
        appendTextFromElement(node as Element, lines)
      }
    },
  )
}

// Whether a node has been distributed (slotted) into a Shadow DOM element to
// be rendered elsewhere. When true the node must not be appended from its
// original position — the slot will append it. (dom.js lines 1437-1448)
// Dropped: getDestinationInsertionPoints (Shadow DOM v0, removed from browsers).
function isNodeDistributedIntoShadowDom(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
    var slottable = node as Node & { assignedSlot?: HTMLSlotElement | null }
    return slottable.assignedSlot != null
  }
  return false
}

// Composed-DOM node dispatch (Shadow DOM v1).
// (dom.js lines 1363-1428: bot.dom.appendVisibleTextLinesFromNodeInComposedDom_)
// Dropped: <CONTENT> element (Shadow DOM v0 only).
// Dropped: <SHADOW> element and olderShadowRoot (Shadow DOM v0 only).
function appendTextFromNodeInComposedDom(
  node: Node,
  lines: string[],
  shown: boolean,
  whitespace: string | null,
  textTransform: string | null,
): void {
  if (node.nodeType === Node.TEXT_NODE && shown) {
    appendTextFromTextNode(node as Text, lines, whitespace, textTransform)
  } else if (isElement(node)) {
    const castElem = node as Element
    if (isElement(node, 'SLOT')) {
      // <slot> distributes its assigned nodes. Walk up to see whether we're
      // inside a ShadowRoot; if not, fall through to treat it as an unknown
      // element. (dom.js 1373-1399 adapted for v1)
      var parentNode: Node = node
      while (parentNode.parentNode) {
        parentNode = parentNode.parentNode
      }
      if (typeof ShadowRoot === 'function' && parentNode instanceof ShadowRoot) {
        const slot = node as HTMLSlotElement
        const assigned = slot.assignedNodes()
        const childrenToTraverse: ArrayLike<Node> =
          assigned.length > 0 ? assigned : slot.childNodes
        for (var i = 0; i < childrenToTraverse.length; i++) {
          appendTextFromNodeInComposedDom(
            childrenToTraverse[i], lines, shown, whitespace, textTransform)
        }
      } else {
        appendTextFromElementInComposedDom(castElem, lines)
      }
    } else {
      appendTextFromElementInComposedDom(castElem, lines)
    }
  }
}

// Composed-DOM element traversal (Shadow DOM v1). Expands shadow roots before
// processing the element's own children so that slotted content is encountered
// in display order. (dom.js lines 1457-1481)
function appendTextFromElementInComposedDom(
  elem: Element,
  lines: string[],
): void {
  if (elem.shadowRoot) {
    const whitespace = getEffectiveStyle(elem, 'white-space')
    const textTransform = getEffectiveStyle(elem, 'text-transform')
    elem.shadowRoot.childNodes.forEach(node =>
      appendTextFromNodeInComposedDom(node, lines, true, whitespace, textTransform))
  }

  appendTextFromElementCommon(
    elem,
    lines,
    isShown,
    function (node, lines, shown, whitespace, textTransform) {
      // Skip nodes that have been slotted elsewhere; they will be appended
      // from their slot position in the composed tree. (dom.js 1472-1479)
      if (!isNodeDistributedIntoShadowDom(node)) {
        appendTextFromNodeInComposedDom(node, lines, shown, whitespace, textTransform)
      }
    },
  )
}

// Returns the visible text of an element, matching bot.dom.getVisibleText and
// webdriver.atoms.element.getText. Uses the composed-DOM path on browsers that
// support ShadowRoot (every browser we support), falling back to the flat-DOM
// path otherwise. (dom.js lines 1026-1035)
function getText(element: Element): string {
  const lines: string[] = []
  if (typeof ShadowRoot === 'function') {
    appendTextFromElementInComposedDom(element, lines)
  } else {
    appendTextFromElement(element, lines)
  }
  return concatenateCleanedLines(lines)
}

export default getText
