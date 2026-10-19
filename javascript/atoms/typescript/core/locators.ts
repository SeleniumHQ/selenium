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

// Shared locator strategy implementations for findElements (many) and
// findElement (single). Both atom entry points import from here so validation
// logic — especially what counts as an invalid selector — stays in one place
// and cannot drift between them.

import { botError, INVALID_ARGUMENT, INVALID_SELECTOR, NO_SUCH_ELEMENT } from './error.js'

type LocatorTarget = Record<string, unknown>
type Root = Document | Element | ShadowRoot
type Rect = { left: number; top: number; width: number; height: number }
type RelativeFilter = { kind: string; args: unknown[] }

// ── shared helpers ─────────────────────────────────────────────────────────────

// Escapes characters with special meaning in CSS selector identifiers so an
// arbitrary string can be embedded in a CSS selector expression.
// locators/id.js:113-116 – cssEscape_ function.
function cssEscapeId(s: string): string {
  return s.replace(/[\s'"\\#.:;,!?+<>=~*^$|%&@`{}\-/\[\]()]/g, (c) => '\\' + c)
}

function hasCssEscape(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
}

// Builds a CSS selector matching an exact id, or returns null when the value
// cannot be expressed as one and the caller must scan attributes instead.
// CSS.escape handles newlines, whitespace and leading digits; without it, the
// legacy escaping cannot handle a leading digit. A NUL can never be matched by
// a selector, because CSS replaces it with U+FFFD.
function idSelector(target: string): string | null {
  if (target.indexOf('\0') !== -1) {
    return null
  }
  if (hasCssEscape()) {
    return '#' + CSS.escape(target)
  }
  return /^\d/.test(target) ? null : '#' + cssEscapeId(target)
}

// Builds a CSS selector matching an exact name attribute, or returns null when
// the caller must scan attributes instead. Without CSS.escape, a line break
// cannot be written inside a quoted CSS string.
function nameSelector(target: string): string | null {
  if (target.indexOf('\0') !== -1) {
    return null
  }
  if (hasCssEscape()) {
    return '[name="' + CSS.escape(target) + '"]'
  }
  if (/[\r\n\f]/.test(target)) {
    return null
  }
  return '[name="' + target.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]'
}

// Runs a selector built by idSelector or nameSelector, falling back to an
// exact attribute comparison when there is no selector or it is rejected.
// locators/name.js:34-41 – Closure compared getAttribute(name) directly.
function attributeMany(selector: string | null, attr: string, target: string, root: Root): Element[] {
  if (selector !== null) {
    try {
      return Array.from(root.querySelectorAll(selector))
    } catch (_e) {
      // Fall through to the attribute scan.
    }
  }
  return Array.from(root.querySelectorAll('*')).filter(el => el.getAttribute(attr) === target)
}

function attributeSingle(selector: string | null, attr: string, target: string, root: Root): Element | null {
  if (selector !== null) {
    try {
      return root.querySelector(selector) ?? null
    } catch (_e) {
      // Fall through to the attribute scan.
    }
  }
  return Array.from(root.querySelectorAll('*')).find(el => el.getAttribute(attr) === target) ?? null
}

// Maps non-breaking spaces to ordinary spaces, as bot.dom.getVisibleText did,
// so a link rendered as "A&nbsp;B" matches "A B".
function normalizeLinkText(s: string): string {
  return s.replace(/\u00a0/g, ' ')
}

// Reads the visible text of a link element, trimming surrounding whitespace.
// locators/link_text.js:51-58 – getVisibleText + trim pattern.
// We use innerText where available (respects CSS visibility) and fall back to
// textContent, matching what bot.dom.getVisibleText does in modern browsers.
function getLinkText(el: Element): string {
  const text = (el as HTMLElement).innerText !== undefined
    ? (el as HTMLElement).innerText
    : el.textContent || ''
  return normalizeLinkText(text).replace(/^[\s]+|[\s]+$/g, '')
}

// ── many (multi-element) implementations ──────────────────────────────────────

function classNameMany(target: string, root: Root): Element[] {
  if (!target) {
    throw botError(INVALID_SELECTOR, 'No class name specified')
  }
  target = target.trim()
  if (target.indexOf(' ') !== -1) {
    throw botError(INVALID_SELECTOR, 'Compound class names not permitted')
  }
  try {
    // Backslash-escape dots so a class name containing a literal dot is not
    // misread as a CSS descendant combinator.
    return Array.from(root.querySelectorAll('.' + target.replace(/\\/g, '\\\\').replace(/\./g, '\\.')))
  } catch (_e) {
    throw botError(INVALID_SELECTOR, 'An invalid or illegal class name was specified')
  }
}

function cssMany(target: string, root: Root): Element[] {
  try {
    return Array.from(root.querySelectorAll(target))
  } catch (_e) {
    throw botError(INVALID_SELECTOR, 'An invalid or illegal CSS selector was specified: ' + target)
  }
}

function idMany(target: string, root: Root): Element[] {
  if (!target) {
    return []
  }
  return attributeMany(idSelector(target), 'id', target, root)
}

function linkTextMany(target: string, root: Root, partial: boolean): Element[] {
  target = normalizeLinkText(target)
  return Array.from(root.querySelectorAll('a')).filter(el => {
    const text = getLinkText(el)
    return partial ? text.indexOf(target) !== -1 : text === target
  })
}

function nameMany(target: string, root: Root): Element[] {
  return attributeMany(nameSelector(target), 'name', target, root)
}

function tagNameMany(target: string, root: Root): Element[] {
  if (target === '') {
    throw botError(INVALID_SELECTOR, 'Unable to locate an element with the tagName ""')
  }
  // ShadowRoot does not implement getElementsByTagName; fall through to the
  // querySelectorAll path in that case.
  if ('getElementsByTagName' in root) {
    return Array.from((root as Document | Element).getElementsByTagName(target))
  }
  const elements = Array.from(root.querySelectorAll('*'))
  if (target === '*') {
    return elements
  }
  // XHTML elements compare against localName using the folded (lowercase) form;
  // non-XHTML (e.g. SVG in a shadow root) compare case-sensitively.
  const html = 'http://www.w3.org/1999/xhtml'
  const folded = target.toLowerCase()
  return elements.filter(el =>
    el.namespaceURI === html ? el.localName === folded : el.localName === target)
}

// Shared XPath namespace resolver constants.
const DEFAULT_NS_RESOLVER = (function () {
  const ns: Record<string, string> = { svg: 'http://www.w3.org/2000/svg' }
  return (prefix: string): string | null => ns[prefix] || null
})()

const ORDERED_NODE_SNAPSHOT_TYPE = 7
// XPathResult.FIRST_ORDERED_NODE_TYPE: asks the engine to stop at the first
// match, which is more efficient than a full snapshot for single-element use.
const FIRST_ORDERED_NODE_TYPE = 9

// Build a namespace-aware resolver for XPath expressions containing a colon.
// When the expression has no colon the expensive DOM scan is skipped entirely.
// locators/xpath.js:99-135 – evaluate_ namespace handling, minus IE6 path.
function buildNsResolver(
  target: string,
  doc: Document,
): ((prefix: string | null) => string | null) | null {
  if (target.indexOf(':') === -1) {
    return null
  }
  const reversedNs: Record<string, string> = {}
  const allNodes = doc.getElementsByTagName('*')
  for (let i = 0; i < allNodes.length; i++) {
    const n = allNodes[i]
    const ns = n.namespaceURI
    if (ns && !reversedNs[ns]) {
      let prefix = n.lookupPrefix(ns)
      if (!prefix) {
        const m = ns.match('.*/(\\w+)/?$')
        prefix = m ? m[1] : 'xhtml'
      }
      reversedNs[ns] = prefix!
    }
  }
  const namespaces: Record<string, string> = {}
  for (const key in reversedNs) {
    namespaces[reversedNs[key]] = key
  }
  return (prefix: string | null): string | null => namespaces[prefix || ''] || null
}

function xpathMany(target: string, root: Root): Element[] {
  const doc = (root as Document).documentElement
    ? (root as Document)
    : root.ownerDocument!
  if (!doc.documentElement) {
    return []
  }
  try {
    const resolver = buildNsResolver(target, doc)
    let result: XPathResult | null = null
    try {
      result = doc.evaluate(target, root, resolver, ORDERED_NODE_SNAPSHOT_TYPE, null)
    } catch (te) {
      if ((te as Error).name === 'TypeError') {
        // Some environments reject a null resolver even when one is not needed;
        // fall back to the document's own NS resolver.
        const fallback = doc.createNSResolver
          ? doc.createNSResolver(doc.documentElement!)
          : DEFAULT_NS_RESOLVER
        result = doc.evaluate(target, root, fallback, ORDERED_NODE_SNAPSHOT_TYPE, null)
      } else {
        throw te
      }
    }

    if (!result) {
      return []
    }

    const results: Element[] = []
    for (let i = 0; i < result.snapshotLength; i++) {
      const node = result.snapshotItem(i)
      if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        throw botError(
          INVALID_SELECTOR,
          'The result of the xpath expression "' + target + '" is: ' + node + '. It should be an element.',
        )
      }
      results.push(node as Element)
    }
    return results
  } catch (ex) {
    // Firefox throws NS_ERROR_ILLEGAL_VALUE while a page is mid-reload;
    // treat it as an empty result rather than an error.
    // locators/xpath.js:155-158 – Gecko-specific reload exception.
    if ((ex as Error & { name?: string }).name === 'NS_ERROR_ILLEGAL_VALUE') {
      return []
    }
    if ((ex as Error & { code?: string }).code === INVALID_SELECTOR) {
      throw ex
    }
    throw botError(
      INVALID_SELECTOR,
      'Unable to locate an element with the xpath expression ' + target +
        ' because of the following error:\n' + ex,
    )
  }
}

// ── single (first-match) implementations ──────────────────────────────────────
//
// These are NOT simply "many()[0]". Each strategy has a dedicated single
// implementation because:
//   - xpath.single uses FIRST_ORDERED_NODE_TYPE (9) not ORDERED_NODE_SNAPSHOT_TYPE (7),
//     which lets the XPath engine short-circuit after the first match.
//   - css.single explicitly throws INVALID_SELECTOR for an empty selector
//     (locators/css.js:48-51) rather than catching the querySelectorAll error.
//   - id.single scopes containment via querySelector on the root, faithfully
//     reproducing the Closure getElementById + goog.dom.contains guard
//     (locators/id.js:48-68) without the IE name/id confusion branch (dropped:
//     IE is no longer a supported browser).
//   - relative.single delegates to relativeMany; root is passed through.

function classNameSingle(target: string, root: Root): Element | null {
  if (!target) {
    throw botError(INVALID_SELECTOR, 'No class name specified')
  }
  target = target.trim()
  if (target.indexOf(' ') !== -1) {
    throw botError(INVALID_SELECTOR, 'Compound class names not permitted')
  }
  try {
    // locators/classname.js:62-68 – uses querySelector after dot-escaping.
    return root.querySelector('.' + target.replace(/\\/g, '\\\\').replace(/\./g, '\\.')) ?? null
  } catch (_e) {
    throw botError(INVALID_SELECTOR, 'An invalid or illegal class name was specified')
  }
}

function cssSingle(target: string, root: Root): Element | null {
  // locators/css.js:48-51 – explicitly rejects an empty selector before
  // reaching querySelector, matching Closure's distinct INVALID_SELECTOR throw.
  if (!target || !target.trim()) {
    throw botError(INVALID_SELECTOR, 'No selector specified')
  }
  try {
    return root.querySelector(target) ?? null
  } catch (_e) {
    throw botError(INVALID_SELECTOR, 'An invalid or illegal CSS selector was specified: ' + target)
  }
}

function idSingle(target: string, root: Root): Element | null {
  if (!target) {
    return null
  }
  // locators/id.js:48-68 – Closure getElementById + containment check.
  // Using querySelector scoped to root achieves the same containment guarantee
  // without needing document.getElementById: only descendants of root are
  // returned, so an element elsewhere in the page is automatically excluded,
  // and root itself is never included (querySelector only looks at descendants).
  // Dropped: the IE name/id confusion branch that needed getAttribute('id')
  // re-validation — IE is no longer supported.
  return attributeSingle(idSelector(target), 'id', target, root)
}

function linkTextSingle(target: string, root: Root, partial: boolean): Element | null {
  // locators/link_text.js:40-61 – single_ iterates anchors and returns first match.
  target = normalizeLinkText(target)
  const anchors = Array.from(root.querySelectorAll('a'))
  const found = anchors.find(el => {
    const text = getLinkText(el)
    return partial ? text.indexOf(target) !== -1 : text === target
  })
  return found ?? null
}

function nameSingle(target: string, root: Root): Element | null {
  // locators/name.js:34-41 – scans elements and returns the first name match.
  return attributeSingle(nameSelector(target), 'name', target, root)
}

function tagNameSingle(target: string, root: Root): Element | null {
  if (target === '') {
    throw botError(INVALID_SELECTOR, 'Unable to locate an element with the tagName ""')
  }
  // locators/tag_name.js:32-38 – getElementsByTagName()[0] || null.
  // ShadowRoot lacks getElementsByTagName; use the same querySelectorAll +
  // localName fallback that tagNameMany uses.
  if ('getElementsByTagName' in root) {
    return (root as Document | Element).getElementsByTagName(target)[0] ?? null
  }
  const elements = Array.from(root.querySelectorAll('*'))
  if (target === '*') {
    return elements[0] ?? null
  }
  const html = 'http://www.w3.org/1999/xhtml'
  const folded = target.toLowerCase()
  const found = elements.find(el =>
    el.namespaceURI === html ? el.localName === folded : el.localName === target)
  return found ?? null
}

function xpathSingle(target: string, root: Root): Element | null {
  const doc = (root as Document).documentElement
    ? (root as Document)
    : root.ownerDocument!
  if (!doc.documentElement) {
    return null
  }
  try {
    const resolver = buildNsResolver(target, doc)
    let result: XPathResult | null = null
    // locators/xpath.js:187-211 – single uses FIRST_ORDERED_NODE_TYPE (9) so the
    // XPath engine short-circuits after the first match. The many variant uses
    // ORDERED_NODE_SNAPSHOT_TYPE (7); these are genuinely different XPath result
    // types and are not interchangeable.
    try {
      result = doc.evaluate(target, root, resolver, FIRST_ORDERED_NODE_TYPE, null)
    } catch (te) {
      if ((te as Error).name === 'TypeError') {
        const fallback = doc.createNSResolver
          ? doc.createNSResolver(doc.documentElement!)
          : DEFAULT_NS_RESOLVER
        result = doc.evaluate(target, root, fallback, FIRST_ORDERED_NODE_TYPE, null)
      } else {
        throw te
      }
    }

    if (!result) return null
    const node = result.singleNodeValue
    if (node === null) return null
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      throw botError(
        INVALID_SELECTOR,
        'The result of the xpath expression "' + target + '" is: ' + node + '. It should be an element.',
      )
    }
    return node as Element
  } catch (ex) {
    if ((ex as Error & { name?: string }).name === 'NS_ERROR_ILLEGAL_VALUE') {
      return null
    }
    if ((ex as Error & { code?: string }).code === INVALID_SELECTOR) {
      throw ex
    }
    throw botError(
      INVALID_SELECTOR,
      'Unable to locate an element with the xpath expression ' + target +
        ' because of the following error:\n' + ex,
    )
  }
}

// ── relative locator internals ─────────────────────────────────────────────────

function getClientRect(element: Element): Rect {
  const r = element.getBoundingClientRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

// Resolves a selector argument inside a relative locator filter to a single
// Element. outerRoot is the root passed to findElements / findElement by the
// caller; anchors are searched inside it first, then in the full document.
// locators/relative.js:263-286 – resolve_.
function resolveAnchor(selector: unknown, outerRoot: Root | undefined): Element {
  if (selector instanceof Element) {
    return selector
  }
  if (typeof selector === 'function') {
    return resolveAnchor((selector as () => unknown)(), outerRoot)
  }
  if (selector && typeof selector === 'object') {
    // Prefer an anchor inside outerRoot before falling back to the document.
    // Closure searched the document first; searching the root first is
    // deliberate, because a document search cannot reach into a shadow root.
    // When a locator matches anchors both inside and outside the root, the
    // inner one wins (pinned in find_elements_typescript_test.html).
    let found = outerRoot ? findElements(selector as LocatorTarget, outerRoot) : []
    if (!found.length) {
      found = findElements(selector as LocatorTarget)
    }
    if (!found.length) {
      throw botError(NO_SUCH_ELEMENT, 'No element has been found by ' + JSON.stringify(selector))
    }
    return found[0]
  }
  throw botError(INVALID_ARGUMENT, 'Selector is of wrong type: ' + JSON.stringify(selector))
}

function makeProximityFilter(
  selector: unknown,
  outerRoot: Root | undefined,
  test: (anchor: Rect, candidate: Rect) => boolean,
): (candidate: Element) => boolean {
  return (candidate) => test(getClientRect(resolveAnchor(selector, outerRoot)), getClientRect(candidate))
}

function sortByProximity(anchor: Element, elements: Element[]): Element[] {
  const ar = getClientRect(anchor)
  const acx = ar.left + Math.max(1, ar.width) / 2
  const acy = ar.top + Math.max(1, ar.height) / 2
  return elements.slice().sort((a, b) => {
    const ra = getClientRect(a)
    const rb = getClientRect(b)
    const da = Math.sqrt(
      Math.pow(acx - (ra.left + Math.max(1, ra.width) / 2), 2) +
        Math.pow(acy - (ra.top + Math.max(1, ra.height) / 2), 2),
    )
    const db = Math.sqrt(
      Math.pow(acx - (rb.left + Math.max(1, rb.width) / 2), 2) +
        Math.pow(acy - (rb.top + Math.max(1, rb.height) / 2), 2),
    )
    return da - db
  })
}

// relativeMany is used by both findElements and findElement. The root argument
// is ignored for the spatial filters themselves (they operate on page layout),
// but is passed when searching for the "root" element pool.
// locators/relative.js:434-459 – many; locators/relative.js:418-424 – single.
//
// outerRoot is the root originally supplied to findElements/findElement;
// it threads into resolveAnchor so that shadow-root anchors can be found.
function relativeMany(
  target: Record<string, unknown>,
  actualRoot: Root,
  outerRoot: Root | undefined,
): Element[] {
  if (
    !Object.prototype.hasOwnProperty.call(target, 'root') ||
    !Object.prototype.hasOwnProperty.call(target, 'filters')
  ) {
    throw botError(
      INVALID_ARGUMENT,
      'Locator not suitable for relative locators: ' + JSON.stringify(target),
    )
  }
  const filters = target['filters']
  if (!Array.isArray(filters)) {
    throw botError(INVALID_ARGUMENT, 'Targets should be an array: ' + JSON.stringify(target))
  }

  let elements: Element[]
  const rootTarget = target['root']
  if (rootTarget instanceof Element) {
    elements = [rootTarget]
  } else {
    elements = findElements(rootTarget as LocatorTarget, actualRoot)
  }

  if (!elements.length) {
    return []
  }

  // Build the strategy map here so outerRoot is captured in the closures.
  const RELATIVE_STRATEGIES: Record<string, (...args: unknown[]) => (el: Element) => boolean> = {
    above: (sel) =>
      makeProximityFilter(sel, outerRoot, (a, c) => c.top + c.height <= a.top),
    below: (sel) =>
      makeProximityFilter(sel, outerRoot, (a, c) => c.top >= a.top + a.height),
    left: (sel) =>
      makeProximityFilter(sel, outerRoot, (a, c) => c.left + c.width <= a.left),
    right: (sel) =>
      makeProximityFilter(sel, outerRoot, (a, c) => c.left >= a.left + a.width),
    near: (sel, distArg) => {
      const distFromSelector =
        typeof (sel as Record<string, unknown>)['distance'] === 'number'
          ? ((sel as Record<string, unknown>)['distance'] as number)
          : 0
      const distance =
        typeof distArg === 'number' && distArg > 0 ? distArg : distFromSelector || 50
      return (candidate: Element): boolean => {
        const anchor = resolveAnchor(sel, outerRoot)
        if (anchor === candidate) return false
        const a = getClientRect(anchor)
        const c = getClientRect(candidate)
        const expanded = {
          left: a.left - distance,
          top: a.top - distance,
          width: a.width + distance * 2,
          height: a.height + distance * 2,
        }
        return (
          c.left < expanded.left + expanded.width &&
          c.left + c.width > expanded.left &&
          c.top < expanded.top + expanded.height &&
          c.top + c.height > expanded.top
        )
      }
    },
    straightAbove: (sel) =>
      makeProximityFilter(
        sel,
        outerRoot,
        (a, c) => c.left < a.left + a.width && c.left + c.width > a.left && c.top + c.height <= a.top,
      ),
    straightBelow: (sel) =>
      makeProximityFilter(
        sel,
        outerRoot,
        (a, c) => c.left < a.left + a.width && c.left + c.width > a.left && c.top >= a.top + a.height,
      ),
    straightLeft: (sel) =>
      makeProximityFilter(
        sel,
        outerRoot,
        (a, c) => c.top < a.top + a.height && c.top + c.height > a.top && c.left + c.width <= a.left,
      ),
    straightRight: (sel) =>
      makeProximityFilter(
        sel,
        outerRoot,
        (a, c) => c.top < a.top + a.height && c.top + c.height > a.top && c.left >= a.left + a.width,
      ),
  }

  const matched = elements.filter(el => {
    if (!el) return false
    return (filters as RelativeFilter[]).every(filter => {
      const strategy = RELATIVE_STRATEGIES[filter.kind]
      if (!strategy) {
        throw botError(INVALID_ARGUMENT, 'Cannot find filter suitable for ' + filter.kind)
      }
      return strategy(...filter.args)(el)
    })
  })

  const finalFilter = filters[filters.length - 1] as RelativeFilter | undefined
  if (!finalFilter || !RELATIVE_STRATEGIES[finalFilter.kind]) {
    return matched
  }
  const lastAnchor = resolveAnchor(finalFilter.args[0], outerRoot)
  return sortByProximity(lastAnchor, matched)
}

// ── exported functions ─────────────────────────────────────────────────────────

// Finds all elements matching the given locator target, optionally scoped to a
// root. Returns an empty array when nothing matches. Throws for unsupported
// strategies. Ported from bot.locators.findElements (locators/locators.js:152).
export function findElements(target: LocatorTarget, root?: Root): Element[] {
  const actualRoot: Root = root || document
  const keys = Object.keys(target).filter(k => Object.prototype.hasOwnProperty.call(target, k))
  if (!keys.length) {
    throw botError(INVALID_ARGUMENT, 'Unsupported locator strategy: (empty)')
  }
  const key = keys[0]
  const value = target[key]

  switch (key) {
    case 'className':
    case 'class name':
      return classNameMany(value as string, actualRoot)
    case 'css':
    case 'css selector':
      return cssMany(value as string, actualRoot)
    case 'id':
      return idMany(value as string, actualRoot)
    case 'linkText':
    case 'link text':
      return linkTextMany(value as string, actualRoot, false)
    case 'partialLinkText':
    case 'partial link text':
      return linkTextMany(value as string, actualRoot, true)
    case 'name':
      return nameMany(value as string, actualRoot)
    case 'tagName':
    case 'tag name':
      return tagNameMany(value as string, actualRoot)
    case 'xpath':
      return xpathMany(value as string, actualRoot)
    case 'relative':
      return relativeMany(value as Record<string, unknown>, actualRoot, root)
    default:
      throw botError(INVALID_ARGUMENT, 'Unsupported locator strategy: ' + key)
  }
}

// Finds the first element matching the given locator target, optionally scoped
// to a root. Returns null when nothing matches — it does NOT throw for a
// no-match. Throws ONLY for an unsupported or invalid strategy key.
// Ported from bot.locators.findElement (locators/locators.js:124).
//
// This must NOT be implemented as findElements(...)[0]; each strategy has its
// own single-element implementation (most importantly, xpathSingle uses
// FIRST_ORDERED_NODE_TYPE which is more efficient and semantically distinct
// from the snapshot type used by xpathMany).
export function findElement(target: LocatorTarget, root?: Root): Element | null {
  const actualRoot: Root = root || document
  const keys = Object.keys(target).filter(k => Object.prototype.hasOwnProperty.call(target, k))
  if (!keys.length) {
    throw botError(INVALID_ARGUMENT, 'Unsupported locator strategy: (empty)')
  }
  const key = keys[0]
  const value = target[key]

  switch (key) {
    case 'className':
    case 'class name':
      return classNameSingle(value as string, actualRoot)
    case 'css':
    case 'css selector':
      return cssSingle(value as string, actualRoot)
    case 'id':
      return idSingle(value as string, actualRoot)
    case 'linkText':
    case 'link text':
      return linkTextSingle(value as string, actualRoot, false)
    case 'partialLinkText':
    case 'partial link text':
      return linkTextSingle(value as string, actualRoot, true)
    case 'name':
      return nameSingle(value as string, actualRoot)
    case 'tagName':
    case 'tag name':
      return tagNameSingle(value as string, actualRoot)
    case 'xpath':
      return xpathSingle(value as string, actualRoot)
    case 'relative':
      // locators/relative.js:418-424 – relative.single delegates to many,
      // returns first result or null. root passes through so anchor resolution
      // can find shadow-root elements.
      return relativeMany(value as Record<string, unknown>, actualRoot, root)[0] ?? null
    default:
      throw botError(INVALID_ARGUMENT, 'Unsupported locator strategy: ' + key)
  }
}
