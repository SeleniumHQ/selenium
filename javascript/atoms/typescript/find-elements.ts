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

(function findElements(target: Record<string, unknown>, root?: Document | Element): Element[] {
  type LocatorTarget = Record<string, unknown>
  type Root = Document | Element
  type Rect = { left: number; top: number; width: number; height: number }
  type RelativeFilter = { kind: string; args: unknown[] }

  const INVALID_SELECTOR = 'invalid selector'
  const INVALID_ARGUMENT = 'invalid argument'
  const NO_SUCH_ELEMENT = 'no such element'

  function botError(code: string, message: string): Error {
    const err = new Error(message)
    ;(err as unknown as Record<string, unknown>)['code'] = code
    return err
  }

  function cssEscapeId(s: string): string {
    return s.replace(/[\s'"\\#.:;,!?+<>=~*^$|%&@`{}\-/\[\]()]/g, (c) => '\\' + c)
  }

  function classNameMany(target: string, root: Root): Element[] {
    if (!target) {
      throw botError(INVALID_SELECTOR, 'No class name specified')
    }
    target = target.trim()
    if (target.indexOf(' ') !== -1) {
      throw botError(INVALID_SELECTOR, 'Compound class names not permitted')
    }
    try {
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
    if (!/^\d/.test(target)) {
      try {
        return Array.from(root.querySelectorAll('#' + cssEscapeId(target)))
      } catch (_e) {
        return []
      }
    }
    return Array.from(root.querySelectorAll('*')).filter(el => el.getAttribute('id') === target)
  }

  function getLinkText(el: Element): string {
    const text = (el as HTMLElement).innerText !== undefined ? (el as HTMLElement).innerText : el.textContent || ''
    return text.replace(/^[\s]+|[\s]+$/g, '')
  }

  function linkTextMany(target: string, root: Root, partial: boolean): Element[] {
    return Array.from(root.querySelectorAll('a')).filter(el => {
      const text = getLinkText(el)
      return partial ? text.indexOf(target) !== -1 : text === target
    })
  }

  function nameMany(target: string, root: Root): Element[] {
    return Array.from(root.querySelectorAll('*')).filter(el => el.getAttribute('name') === target)
  }

  function tagNameMany(target: string, root: Root): Element[] {
    if (target === '') {
      throw botError(INVALID_SELECTOR, 'Unable to locate an element with the tagName ""')
    }
    return Array.from(root.getElementsByTagName(target))
  }

  const DEFAULT_NS_RESOLVER = (function () {
    const ns: Record<string, string> = { svg: 'http://www.w3.org/2000/svg' }
    return (prefix: string): string | null => ns[prefix] || null
  })()

  const ORDERED_NODE_SNAPSHOT_TYPE = 7

  function xpathMany(target: string, root: Root): Element[] {
    const doc = (root as Document).documentElement ? (root as Document) : (root as Element).ownerDocument!
    if (!doc.documentElement) {
      return []
    }
    try {
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
      let resolver: XPathNSResolver | ((prefix: string | null) => string | null) =
        (prefix: string | null): string | null => namespaces[prefix || ''] || null

      let result: XPathResult | null = null
      try {
        result = doc.evaluate(target, root, resolver, ORDERED_NODE_SNAPSHOT_TYPE, null)
      } catch (te) {
        if ((te as Error).name === 'TypeError') {
          const fallback = doc.createNSResolver ? doc.createNSResolver(doc.documentElement!) : DEFAULT_NS_RESOLVER
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
      if ((ex as Error & { name?: string }).name === 'NS_ERROR_ILLEGAL_VALUE') {
        return []
      }
      if ((ex as Error & { code?: string }).code === INVALID_SELECTOR) {
        throw ex
      }
      throw botError(
        INVALID_SELECTOR,
        'Unable to locate an element with the xpath expression ' + target + ' because of the following error:\n' + ex,
      )
    }
  }

  function getClientRect(element: Element): Rect {
    const r = element.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
  }

  function resolveAnchor(selector: unknown): Element {
    if (selector instanceof Element) {
      return selector
    }
    if (typeof selector === 'function') {
      return resolveAnchor((selector as () => unknown)())
    }
    if (selector && typeof selector === 'object') {
      const found = findElements(selector as LocatorTarget)
      if (!found.length) {
        throw botError(NO_SUCH_ELEMENT, 'No element has been found by ' + JSON.stringify(selector))
      }
      return found[0]
    }
    throw botError(INVALID_ARGUMENT, 'Selector is of wrong type: ' + JSON.stringify(selector))
  }

  function makeProximityFilter(selector: unknown, test: (anchor: Rect, candidate: Rect) => boolean) {
    return (candidate: Element): boolean => test(getClientRect(resolveAnchor(selector)), getClientRect(candidate))
  }

  const RELATIVE_STRATEGIES: Record<string, (...args: unknown[]) => (el: Element) => boolean> = {
    above: (sel) => makeProximityFilter(sel, (a, c) => c.top + c.height <= a.top),
    below: (sel) => makeProximityFilter(sel, (a, c) => c.top >= a.top + a.height),
    left: (sel) => makeProximityFilter(sel, (a, c) => c.left + c.width <= a.left),
    right: (sel) => makeProximityFilter(sel, (a, c) => c.left >= a.left + a.width),
    near: (sel, distArg) => {
      const distFromSelector = typeof (sel as Record<string, unknown>)['distance'] === 'number'
        ? ((sel as Record<string, unknown>)['distance'] as number)
        : 0
      const distance = typeof distArg === 'number' && distArg > 0 ? distArg : distFromSelector || 50
      return (candidate: Element): boolean => {
        const anchor = resolveAnchor(sel)
        if (anchor === candidate) return false
        const a = getClientRect(anchor)
        const c = getClientRect(candidate)
        const expanded = { left: a.left - distance, top: a.top - distance, width: a.width + distance * 2, height: a.height + distance * 2 }
        return (
          c.left < expanded.left + expanded.width &&
          c.left + c.width > expanded.left &&
          c.top < expanded.top + expanded.height &&
          c.top + c.height > expanded.top
        )
      }
    },
    straightAbove: (sel) =>
      makeProximityFilter(sel, (a, c) => c.left < a.left + a.width && c.left + c.width > a.left && c.top + c.height <= a.top),
    straightBelow: (sel) =>
      makeProximityFilter(sel, (a, c) => c.left < a.left + a.width && c.left + c.width > a.left && c.top >= a.top + a.height),
    straightLeft: (sel) =>
      makeProximityFilter(sel, (a, c) => c.top < a.top + a.height && c.top + c.height > a.top && c.left + c.width <= a.left),
    straightRight: (sel) =>
      makeProximityFilter(sel, (a, c) => c.top < a.top + a.height && c.top + c.height > a.top && c.left >= a.left + a.width),
  }

  function sortByProximity(anchor: Element, elements: Element[]): Element[] {
    const ar = getClientRect(anchor)
    const acx = ar.left + Math.max(1, ar.width) / 2
    const acy = ar.top + Math.max(1, ar.height) / 2
    return elements.slice().sort((a, b) => {
      const ra = getClientRect(a)
      const rb = getClientRect(b)
      const da = Math.sqrt(Math.pow(acx - (ra.left + Math.max(1, ra.width) / 2), 2) + Math.pow(acy - (ra.top + Math.max(1, ra.height) / 2), 2))
      const db = Math.sqrt(Math.pow(acx - (rb.left + Math.max(1, rb.width) / 2), 2) + Math.pow(acy - (rb.top + Math.max(1, rb.height) / 2), 2))
      return da - db
    })
  }

  function relativeMany(target: Record<string, unknown>, root: Root): Element[] {
    if (!Object.prototype.hasOwnProperty.call(target, 'root') || !Object.prototype.hasOwnProperty.call(target, 'filters')) {
      throw botError(INVALID_ARGUMENT, 'Locator not suitable for relative locators: ' + JSON.stringify(target))
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
      elements = findElements(rootTarget as LocatorTarget, root)
    }

    if (!elements.length) {
      return []
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
    const lastAnchor = resolveAnchor(finalFilter.args[0])
    return sortByProximity(lastAnchor, matched)
  }

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
      return relativeMany(value as Record<string, unknown>, actualRoot)
    default:
      throw botError(INVALID_ARGUMENT, 'Unsupported locator strategy: ' + key)
  }
})
