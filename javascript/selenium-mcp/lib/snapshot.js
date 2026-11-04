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

'use strict'

const { error } = require('selenium-webdriver')

const MAX_FRAME_DEPTH = 5

/**
 * Runs inside the page (one frame at a time). Walks the DOM and returns the
 * nodes worth showing an agent, in document order, each with its depth in the
 * output tree and, for nodes that get a ref, the element itself so the server
 * can cache the handle.
 *
 * Refs are assigned here, not on the server, so that the same element keeps
 * the same ref across snapshots of the same document. They live in a WeakMap
 * on the window, which a navigation throws away.
 *
 * The role and accessible-name logic is a deliberately small stopgap: the
 * bindings are gaining a proper accessible-name computation, and this should
 * be replaced by it once it lands.
 *
 * Must stay self-contained: it is serialized with Function#toString.
 *
 * @param {boolean} includeAll include every visible node and text, not just
 *     interactive ones
 * @return {{fresh: boolean, items: !Array<!Object>}}
 */
function collectNodes(includeAll) {
  /* global window, document, Node */
  const MAX_NAME = 100
  const MAX_TEXT = 200
  const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'head', 'meta', 'link', 'title'])
  const INTERACTIVE = new Set([
    'button',
    'checkbox',
    'combobox',
    'link',
    'listbox',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'radio',
    'searchbox',
    'slider',
    'spinbutton',
    'switch',
    'tab',
    'textbox',
    'treeitem',
  ])
  // Shown even in the default snapshot: headings orient the agent, live
  // regions carry the feedback a form gives back, frames hold more content.
  const ALWAYS = new Set(['heading', 'alert', 'alertdialog', 'status', 'dialog', 'iframe'])
  const NAME_FROM_CONTENT = new Set([
    'alert',
    'button',
    'cell',
    'checkbox',
    'columnheader',
    'generic',
    'heading',
    'link',
    'listitem',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'radio',
    'row',
    'rowheader',
    'status',
    'switch',
    'tab',
    'treeitem',
  ])

  let fresh = false
  if (!window.__seleniumMcpRefs) {
    window.__seleniumMcpRefs = new WeakMap()
    window.__seleniumMcpNextRef = 1
    fresh = true
  }
  const refs = window.__seleniumMcpRefs

  function refFor(el) {
    let ref = refs.get(el)
    if (!ref) {
      ref = window.__seleniumMcpNextRef++
      refs.set(el, ref)
    }
    return ref
  }

  function clean(text, max) {
    const s = String(text || '')
      .replace(/\s+/g, ' ')
      .trim()
    return s.length > max ? s.slice(0, max - 1) + '…' : s
  }

  function textOf(el) {
    // jsdom (unit tests) has no innerText; textContent is close enough there.
    return typeof el.innerText === 'string' ? el.innerText : el.textContent
  }

  function style(el) {
    return window.getComputedStyle(el)
  }

  function explicitRole(el) {
    const attr = el.getAttribute('role')
    if (!attr) return undefined
    const role = attr.trim().split(/\s+/)[0].toLowerCase()
    return role === 'none' || role === 'presentation' ? null : role
  }

  function inputRole(el) {
    const type = (el.getAttribute('type') || 'text').toLowerCase()
    switch (type) {
      case 'hidden':
        return null
      case 'button':
      case 'submit':
      case 'reset':
      case 'image':
      case 'file':
        return 'button'
      case 'checkbox':
        return 'checkbox'
      case 'radio':
        return 'radio'
      case 'range':
        return 'slider'
      case 'number':
        return 'spinbutton'
      case 'search':
        return el.hasAttribute('list') ? 'combobox' : 'searchbox'
      default:
        return el.hasAttribute('list') ? 'combobox' : 'textbox'
    }
  }

  function implicitRole(el) {
    const tag = el.localName
    switch (tag) {
      case 'a':
      case 'area':
        return el.hasAttribute('href') ? 'link' : null
      case 'button':
      case 'summary':
        return 'button'
      case 'input':
        return inputRole(el)
      case 'textarea':
        return 'textbox'
      case 'select':
        return el.multiple || el.size > 1 ? 'listbox' : 'combobox'
      case 'option':
        return 'option'
      case 'img':
        return el.getAttribute('alt') === '' ? null : 'img'
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return 'heading'
      case 'iframe':
      case 'frame':
        return 'iframe'
      case 'nav':
        return 'navigation'
      case 'main':
        return 'main'
      case 'aside':
        return 'complementary'
      case 'header':
        return el.closest('article, aside, main, nav, section') ? null : 'banner'
      case 'footer':
        return el.closest('article, aside, main, nav, section') ? null : 'contentinfo'
      case 'form':
        return 'form'
      case 'dialog':
        return 'dialog'
      case 'table':
        return 'table'
      case 'tr':
        return 'row'
      case 'td':
        return 'cell'
      case 'th':
        return 'columnheader'
      case 'ul':
      case 'ol':
      case 'menu':
        return 'list'
      case 'li':
        return 'listitem'
      case 'p':
        return 'paragraph'
      case 'fieldset':
      case 'details':
        return 'group'
      case 'output':
        return 'status'
      case 'progress':
        return 'progressbar'
      case 'hr':
        return 'separator'
      default:
        return null
    }
  }

  function roleOf(el) {
    const explicit = explicitRole(el)
    if (explicit !== undefined) return explicit
    const implicit = implicitRole(el)
    if (implicit) return implicit
    if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') return 'textbox'
    return undefined
  }

  function looksClickable(el) {
    // Many apps build buttons out of divs; a pointer cursor, an onclick
    // attribute or a tabindex are the signals available from inside the page.
    if (el.hasAttribute('onclick')) return true
    const tabindex = el.getAttribute('tabindex')
    if (tabindex !== null && Number(tabindex) >= 0) return true
    if (style(el).cursor !== 'pointer') return false
    const parent = el.parentElement
    return !parent || style(parent).cursor !== 'pointer'
  }

  function nameOf(el, role) {
    const labelledBy = el.getAttribute('aria-labelledby')
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map(textOf)
        .join(' ')
      if (clean(text, MAX_NAME)) return clean(text, MAX_NAME)
    }
    const ariaLabel = clean(el.getAttribute('aria-label'), MAX_NAME)
    if (ariaLabel) return ariaLabel

    const tag = el.localName
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      const type = (el.getAttribute('type') || '').toLowerCase()
      if (['button', 'submit', 'reset'].includes(type)) {
        return clean(el.value, MAX_NAME) || (type === 'submit' ? 'Submit' : type === 'reset' ? 'Reset' : '')
      }
      if (type === 'image') return clean(el.getAttribute('alt'), MAX_NAME) || 'Submit'
      const labels = el.labels ? Array.from(el.labels).map(textOf).join(' ') : ''
      return (
        clean(labels, MAX_NAME) ||
        clean(el.getAttribute('title'), MAX_NAME) ||
        clean(el.getAttribute('placeholder'), MAX_NAME)
      )
    }
    if (tag === 'img' || tag === 'area') return clean(el.getAttribute('alt') || el.getAttribute('title'), MAX_NAME)
    if (tag === 'fieldset') {
      const legend = el.querySelector(':scope > legend')
      if (legend) return clean(textOf(legend), MAX_NAME)
    }
    if (tag === 'table' && el.caption) return clean(textOf(el.caption), MAX_NAME)
    if (tag === 'iframe' || tag === 'frame') return clean(el.getAttribute('title') || el.getAttribute('name'), MAX_NAME)
    if (NAME_FROM_CONTENT.has(role)) {
      const text = clean(textOf(el), MAX_NAME)
      if (text) return text
    }
    return clean(el.getAttribute('title'), MAX_NAME)
  }

  function propsOf(el, role) {
    const props = []
    if (role === 'heading') {
      const level = el.getAttribute('aria-level') || (/^h[1-6]$/.test(el.localName) ? el.localName[1] : '')
      if (level) props.push('level=' + level)
    }
    if (role === 'checkbox' || role === 'radio' || role === 'switch') {
      const checked = 'checked' in el ? el.checked : el.getAttribute('aria-checked') === 'true'
      if (checked) props.push('checked')
    }
    if (role === 'option' && (el.selected || el.getAttribute('aria-selected') === 'true')) props.push('selected')
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') props.push('disabled')
    const expanded = el.getAttribute('aria-expanded')
    if (expanded === 'true') props.push('expanded')
    if (expanded === 'false') props.push('collapsed')
    if (el.required) props.push('required')
    const tag = el.localName
    if ((role === 'textbox' || role === 'searchbox' || role === 'spinbutton' || role === 'slider') && 'value' in el) {
      if ((el.getAttribute('type') || '').toLowerCase() === 'password') {
        if (el.value) props.push('value=<hidden>')
      } else if (el.value) {
        props.push('value=' + JSON.stringify(clean(el.value, MAX_NAME)))
      }
    }
    if (tag === 'select' && !el.multiple && el.selectedIndex >= 0) {
      props.push('value=' + JSON.stringify(clean(textOf(el.options[el.selectedIndex]), MAX_NAME)))
    }
    return props
  }

  const items = []

  function walk(el, depth, insideSelect) {
    if (SKIP_TAGS.has(el.localName)) return
    if (el.hidden || el.getAttribute('aria-hidden') === 'true') return
    const s = insideSelect ? null : style(el)
    if (s && s.display === 'none') return
    const visible = !s || s.visibility !== 'hidden'

    // undefined: no role at all; null: role="none"/"presentation" or hidden.
    let role = visible ? roleOf(el) : null
    let include = false
    if (role) {
      include = INTERACTIVE.has(role) || ALWAYS.has(role) || includeAll
    } else if (role === undefined && !insideSelect && looksClickable(el)) {
      role = 'generic'
      include = true
    }
    if (insideSelect && role !== 'option') include = false

    let childDepth = depth
    if (include) {
      const isFrame = role === 'iframe'
      const name = nameOf(el, role)
      const giveRef = !insideSelect
      items.push({
        depth,
        role,
        name,
        props: propsOf(el, role),
        ref: giveRef ? refFor(el) : null,
        element: giveRef ? el : null,
        frame: isFrame,
      })
      childDepth = depth + 1
      if (isFrame) return
      // Their content is already the accessible name.
      if (NAME_FROM_CONTENT.has(role) && role !== 'generic' && el.localName !== 'select') return
      if (role === 'generic' && !el.querySelector('a, button, input, select, textarea, [role], [tabindex]')) return
    }

    const isSelect = el.localName === 'select'
    for (const child of el.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child, childDepth, insideSelect || isSelect)
      } else if (includeAll && visible && child.nodeType === Node.TEXT_NODE && !insideSelect && !isSelect) {
        const text = clean(child.textContent, MAX_TEXT)
        if (text) items.push({ depth: childDepth, role: 'text', name: text, props: [], ref: null, element: null })
      }
    }
  }

  if (document.body) walk(document.body, 0, false)
  return { fresh, items }
}

const COLLECT_SCRIPT = `return (${collectNodes.toString()})(arguments[0])`

/**
 * Renders one snapshot node as a line of text.
 *
 * @param {{depth: number, role: string, name: string, props: !Array<string>}} item
 * @param {?string} ref
 * @return {string}
 */
function formatLine(item, ref) {
  let line = '  '.repeat(item.depth)
  if (ref) line += `[${ref}] `
  line += item.role
  if (item.name) line += ' ' + JSON.stringify(item.name)
  for (const prop of item.props) line += ` [${prop}]`
  return line
}

/**
 * The server side of refs: maps the ref an agent sees to the element handle
 * and the chain of frames that must be entered to reach it.
 */
class RefTable {
  constructor() {
    this.entries_ = new Map()
  }

  clear() {
    this.entries_.clear()
  }

  /**
   * @param {string} prefix the frame's ref prefix ('' for the top frame)
   */
  clearFrame(prefix) {
    for (const key of this.entries_.keys()) {
      if (key.startsWith(prefix)) this.entries_.delete(key)
    }
  }

  set(ref, entry) {
    this.entries_.set(ref, entry)
  }

  /**
   * @param {string} ref
   * @return {{element: !Object, framePath: !Array<!Object>}}
   * @throws {Error} if the ref is unknown
   */
  get(ref) {
    const entry = this.entries_.get(String(ref).replace(/^\[|\]$/g, ''))
    if (!entry) {
      throw new Error(`Ref ${ref} is not in the current snapshot. Call browser_snapshot to get fresh refs.`)
    }
    return entry
  }

  get size() {
    return this.entries_.size
  }
}

/**
 * Builds the ref prefix for content inside a frame, from the frame element's
 * own ref: the iframe [e7] holds [f7e1], [f7e2]; an iframe [f7e3] inside it
 * holds [f7f3e1].
 *
 * @param {string} parentPrefix
 * @param {number} frameRef
 * @return {string}
 */
function framePrefix(parentPrefix, frameRef) {
  return `${parentPrefix}f${frameRef}`
}

async function enterFrames(driver, framePath) {
  await driver.switchTo().defaultContent()
  for (const frame of framePath) {
    await driver.switchTo().frame(frame)
  }
}

/**
 * Takes a snapshot of the current page, descending into iframes, and records
 * every ref it hands out in `table`.
 *
 * @param {!Object} driver a WebDriver
 * @param {!RefTable} table
 * @param {{all: (boolean|undefined)}=} options
 * @return {!Promise<string>} the snapshot text
 */
async function takeSnapshot(driver, table, options = {}) {
  const lines = []
  const includeAll = !!options.all

  async function visit(framePath, prefix, baseDepth) {
    await enterFrames(driver, framePath)
    const { fresh, items } = await driver.executeScript(COLLECT_SCRIPT, includeAll)
    if (fresh) table.clearFrame(prefix)
    for (const item of items) {
      const depth = baseDepth + item.depth
      const ref = item.ref ? `${prefix}e${item.ref}` : null
      if (ref) table.set(ref, { element: item.element, framePath })
      lines.push(formatLine({ ...item, depth }, ref))
      if (item.frame && item.element) {
        if (framePath.length >= MAX_FRAME_DEPTH) {
          lines.push('  '.repeat(depth + 1) + '(frames nested too deep, not shown)')
          continue
        }
        try {
          await visit([...framePath, item.element], framePrefix(prefix, item.ref), depth + 1)
        } catch (e) {
          if (e instanceof error.UnexpectedAlertOpenError) throw e
          lines.push('  '.repeat(depth + 1) + '(frame content not available)')
        }
        await enterFrames(driver, framePath)
      }
    }
  }

  await visit([], '', 0)
  await driver.switchTo().defaultContent()
  return lines.length ? lines.join('\n') : '(page has no visible content)'
}

/**
 * Looks up a ref and switches the driver into the frame that holds it.
 *
 * @param {!Object} driver
 * @param {!RefTable} table
 * @param {string} ref
 * @return {!Promise<!Object>} the WebElement
 */
async function resolveRef(driver, table, ref) {
  const { element, framePath } = table.get(ref)
  try {
    await enterFrames(driver, framePath)
  } catch (e) {
    if (e instanceof error.StaleElementReferenceError || e instanceof error.NoSuchFrameError) {
      throw new Error(`Ref ${ref} belongs to a frame that has gone. Call browser_snapshot to get fresh refs.`, {
        cause: e,
      })
    }
    throw e
  }
  return element
}

module.exports = {
  COLLECT_SCRIPT,
  RefTable,
  collectNodes,
  enterFrames,
  formatLine,
  framePrefix,
  resolveRef,
  takeSnapshot,
}
