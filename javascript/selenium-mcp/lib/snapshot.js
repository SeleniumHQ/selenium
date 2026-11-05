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
const MAX_NAME = 100
const MAX_TEXT = 200

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
// Controls whose content is their name hold nothing else worth listing.
const LEAF_ROLES = new Set([
  'button',
  'checkbox',
  'heading',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'switch',
  'tab',
  'treeitem',
])
// accname gives these no name from their content, but their text is the
// feedback an agent needs, so the snapshot names them from it.
const NAMED_FROM_TEXT = new Set(['alert', 'status'])

/** The order states are written in, as the bindings' text form does. */
const STATE_ORDER = ['checked', 'pressed', 'selected', 'level', 'disabled', 'focused']

function clean(text, max) {
  const s = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

/**
 * The text leaves under `node`, joined, without the text that controls
 * below it already show as their names.
 *
 * @param {!Object} node an AccessibilityNode
 * @return {string}
 */
function textBelow(node) {
  const parts = []
  for (const child of node.children) {
    if (child.role === 'text') parts.push(child.name)
    else if (!LEAF_ROLES.has(child.role) && child.role !== 'iframe') parts.push(textBelow(child))
  }
  return parts.filter(Boolean).join(' ')
}

/**
 * @param {!Object} node an AccessibilityNode
 * @return {!Array<string>} the bracketed properties of the line, without brackets
 */
function propsOf(node) {
  const props = []
  const states = node.states || {}
  for (const key of STATE_ORDER) {
    if (!(key in states)) continue
    if (states[key] === true) props.push(key)
    else if (states[key] !== false) props.push(`${key}=${states[key]}`)
  }
  if (states.expanded === true) props.push('expanded')
  if (states.expanded === false) props.push('collapsed')
  if (node.value) props.push('value=' + JSON.stringify(clean(node.value, MAX_NAME)))
  return props
}

/**
 * Renders one snapshot line.
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
 *
 * Refs are numbered by element id, so the same element keeps its ref across
 * snapshots for as long as the table is not cleared.
 */
class RefTable {
  constructor() {
    this.entries_ = new Map()
    this.numbers_ = new Map()
    this.next_ = new Map()
  }

  clear() {
    this.entries_.clear()
    this.numbers_.clear()
    this.next_.clear()
  }

  /**
   * The ref number of an element within the frame that `prefix` names,
   * handing out the next one the first time the element is seen.
   *
   * @param {string} prefix
   * @param {string} elementId
   * @return {number}
   */
  numberFor(prefix, elementId) {
    const key = `${prefix} ${elementId}`
    let number = this.numbers_.get(key)
    if (number === undefined) {
      number = this.next_.get(prefix) || 1
      this.next_.set(prefix, number + 1)
      this.numbers_.set(key, number)
    }
    return number
  }

  /**
   * Makes `entries` the whole table, so a ref that the latest snapshot no
   * longer shows cannot be acted on.
   *
   * @param {!Map<string, {element: !Object, framePath: !Array<!Object>}>} entries
   */
  replaceWith(entries) {
    this.entries_ = new Map(entries)
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
 * Turns the bindings' accessibility tree into snapshot lines, giving a ref
 * to every element shown.
 *
 * @param {!Object} root the AccessibilityNode of the top-level document
 * @param {!RefTable} table where ref numbers come from
 * @param {{all: (boolean|undefined)}=} options
 * @return {!Promise<{lines: !Array<string>, entries: !Map<string, !Object>}>}
 */
async function renderTree(root, table, options = {}) {
  const includeAll = !!options.all
  const lines = []
  const entries = new Map()

  async function refOf(node, prefix, framePath) {
    const number = table.numberFor(prefix, await node.element.getId())
    const ref = `${prefix}e${number}`
    entries.set(ref, { element: node.element, framePath })
    return { ref, number }
  }

  // textCovered: an ancestor's name already spells out this text.
  async function visit(node, depth, ctx) {
    if (node.role === 'text') {
      if (includeAll && !ctx.textCovered) {
        const text = clean(node.name, MAX_TEXT)
        if (text) lines.push(formatLine({ depth, role: 'text', name: text, props: [] }, null))
      }
      return
    }
    const include = includeAll || INTERACTIVE.has(node.role) || ALWAYS.has(node.role)
    if (!include) {
      for (const child of node.children) await visit(child, depth, ctx)
      return
    }

    let name = clean(node.name, MAX_NAME)
    let textCovered = ctx.textCovered
    if (!name && NAMED_FROM_TEXT.has(node.role)) {
      name = clean(textBelow(node), MAX_NAME)
      if (name) textCovered = true
    }
    // browser_select_option picks a native select's options by their text.
    const giveRef = node.element && !(node.role === 'option' && ctx.parentRole === 'combobox')
    const { ref, number } = giveRef ? await refOf(node, ctx.prefix, ctx.framePath) : {}
    lines.push(formatLine({ depth, role: node.role, name, props: propsOf(node) }, ref || null))

    if (node.role === 'iframe') {
      await visitFrame(node, depth + 1, ctx, number)
      return
    }
    if (LEAF_ROLES.has(node.role)) return
    for (const child of node.children) {
      await visit(child, depth + 1, { ...ctx, textCovered, parentRole: node.role })
    }
  }

  async function visitFrame(node, depth, ctx, number) {
    const indent = '  '.repeat(depth)
    const document = node.children[0]
    if (!document || !node.element) {
      lines.push(indent + '(frame content not available)')
      return
    }
    if (ctx.framePath.length >= MAX_FRAME_DEPTH) {
      lines.push(indent + '(frames nested too deep, not shown)')
      return
    }
    const inner = {
      prefix: framePrefix(ctx.prefix, number),
      framePath: [...ctx.framePath, node.element],
      textCovered: false,
      parentRole: 'document',
    }
    for (const child of document.children) await visit(child, depth, inner)
  }

  const top = { prefix: '', framePath: [], textCovered: false, parentRole: 'document' }
  for (const child of root.children) await visit(child, 0, top)
  return { lines, entries }
}

/**
 * Takes a snapshot of the current page, including its iframes, and records
 * every ref it hands out in `table`.
 *
 * The tree comes from the bindings' getAccessibilitySnapshot(), which
 * computes roles, names and states in a sandbox the page cannot reach.
 *
 * @param {!Object} driver a WebDriver with a BiDi connection
 * @param {!RefTable} table
 * @param {{all: (boolean|undefined)}=} options
 * @return {!Promise<string>} the snapshot text
 */
async function takeSnapshot(driver, table, options = {}) {
  const root = await driver.getAccessibilitySnapshot()
  const { lines, entries } = await renderTree(root, table, options)
  // Swapped in only once complete, so a failed snapshot leaves the previous refs usable.
  table.replaceWith(entries)
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
  RefTable,
  enterFrames,
  formatLine,
  framePrefix,
  renderTree,
  resolveRef,
  takeSnapshot,
}
