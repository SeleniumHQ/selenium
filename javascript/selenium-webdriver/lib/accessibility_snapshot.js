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

/**
 * @fileoverview Accessibility snapshots computed in the page (ADR 18205).
 *
 * The tree is computed by the `accessibility-snapshot` atom of `@selenium/atoms`,
 * run over WebDriver BiDi in a sandbox realm so page scripts cannot interfere
 * with it. The atom's wire entry hands the tree back as one JSON string beside
 * the element and frame references, so this module holds only what is the
 * binding's: the public node type and its text form, the mapping of references
 * to WebElement, and frame stitching across browsing contexts.
 *
 * The output is *computed* from the DOM following WAI-ARIA, html-aam and
 * accname; it is not the browser's own accessibility tree and can differ from
 * it at the edges.
 */

const path = require('node:path')
const { getBidiConnection } = require('./bidi_connection')
const error = require('./error')
const logging = require('./logging')

const log_ = logging.getLogger(`${logging.Type.DRIVER}.accessibility`)

/** The order the text form writes states in (ADR 18205 §1). */
const STATE_ORDER = ['checked', 'pressed', 'expanded', 'selected', 'level', 'disabled', 'focused']

/** The sandbox realm the atom runs in: page scripts cannot reach its prototypes. */
const SANDBOX = 'selenium'
const SERIALIZATION_OPTIONS = { maxDomDepth: 0 }
const STALE_MESSAGE = 'the snapshot root is no longer attached to a document'

/**
 * One node of an accessibility snapshot.
 */
class AccessibilityNode {
  /**
   * @param {{role: string, name: string, description: (string|undefined),
   *     value: (string|undefined), states: (!Object<string, (boolean|number|string)>|undefined),
   *     element: (?WebElement|undefined), children: (!Array<!AccessibilityNode>|undefined)}} fields
   */
  constructor({ role, name, description = '', value = undefined, states = {}, element = null, children = [] }) {
    /** The WAI-ARIA role token; `"text"` for text leaves and `"iframe"` for frames, under which the frame's own tree is attached. @type {string} */
    this.role = role
    /** The computed accessible name, `""` when there is none. @type {string} */
    this.name = name
    /** The computed accessible description, `""` when there is none. @type {string} */
    this.description = description
    /**
     * The current value for textbox, searchbox, combobox and range roles;
     * `undefined` where the role has none. A password field's value is masked.
     * @type {(string|undefined)}
     */
    this.value = value
    /**
     * `checked`, `pressed`, `expanded`, `selected`, `level`, `disabled` and
     * `focused`, each present only when it applies; new keys may be added in any
     * release, so ignore keys you do not recognise.
     * @type {!Object<string, (boolean|number|string)>}
     */
    this.states = states
    /**
     * The element the node is backed by, usable for further commands, or `null`
     * for text leaves. An element inside a child frame can be used through
     * classic commands only once the driver has switched to that frame.
     * @type {?WebElement}
     */
    this.element = element
    /** The child nodes, `[]` for leaves. @type {!Array<!AccessibilityNode>} */
    this.children = children
  }

  /**
   * Renders the tree as text, one node per line.
   *
   * The line grammar is `- role "name" [state] [state=value]: value`, children
   * indented two spaces, text leaves written as `- text: content`. An empty
   * name is left out, as is an absent or empty value; a `true` state is written
   * bare, a `false` one left out, any other value spelled. A line break or
   * backslash in a value is escaped so a node never spans two lines. The
   * description and element references are not rendered.
   *
   * @return {string} The text form, without a trailing newline.
   */
  toText() {
    return [...lines(this, '')].join('\n')
  }
}

function* lines(node, indent) {
  yield indent + lineFor(node)
  for (const child of node.children) {
    yield* lines(child, indent + '  ')
  }
}

function lineFor(node) {
  if (node.role === 'text') {
    return `- text: ${node.name}`
  }
  let out = `- ${node.role}`
  if (node.name !== '') {
    out += ` ${quote(node.name)}`
  }
  for (const key of STATE_ORDER) {
    if (!(key in node.states)) continue
    const state = node.states[key]
    if (state === true) {
      out += ` [${key}]`
    } else if (state !== false) {
      out += ` [${key}=${state}]`
    }
  }
  if (node.value) {
    out += `: ${oneLine(node.value)}`
  }
  return out
}

function quote(name) {
  return '"' + name.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

function oneLine(value) {
  return value.replace(/\\/g, '\\\\').replace(/\r/g, '\\r').replace(/\n/g, '\\n')
}

/**
 * Builds the node tree from the atom's wire form.
 *
 * @param {!Object} data The parsed JSON of the tree: the node's fields, with
 *     `element` an index into `elements` and, on a frame node, `frame` an index
 *     the binding resolves to the frame's own tree.
 * @param {!Array<!WebElement>} elements The elements the tree references, in the atom's order.
 * @param {function(number): !Promise<!Array<!AccessibilityNode>>} frameChildren The
 *     children of a frame node, from its `frame` index: the frame's document, or
 *     nothing when it cannot be reached.
 * @return {!Promise<!AccessibilityNode>} The node, with its subtree.
 */
async function nodeFromWire(data, elements, frameChildren) {
  const children = []
  if ('frame' in data) {
    children.push(...(await frameChildren(data.frame)))
  } else {
    for (const child of data.children) {
      children.push(await nodeFromWire(child, elements, frameChildren))
    }
  }
  return new AccessibilityNode({
    role: data.role,
    name: data.name,
    description: data.description ?? '',
    value: data.value,
    states: { ...data.states },
    element: data.element === undefined ? null : elements[data.element],
    children,
  })
}

let atomModule = null

/**
 * The atom's wire entry as a function declaration: the module built by
 * lib/atoms/make-atoms-module.js wraps the bundle in a function whose source
 * `String()` returns, which `script.callFunction` can take as is.
 * @return {string}
 */
function atomDeclaration() {
  if (atomModule === null) {
    try {
      atomModule = require('./atoms/accessibility-snapshot.js')
    } catch {
      try {
        atomModule = require(
          path.resolve('../../../bazel-bin/javascript/selenium-webdriver/lib/atoms/accessibility-snapshot.js'),
        )
      } catch (ex) {
        log_.severe(ex)
        throw new Error(
          'Failed to import atoms module accessibility-snapshot.js. If running in dev mode, you need to run' +
            ' `bazel build //javascript/selenium-webdriver/lib/atoms:accessibility_snapshot` from the project' +
            ' root first.',
          { cause: ex },
        )
      }
    }
  }
  return String(atomModule)
}

/** A shared id that the targeted document does not own. */
class NoSuchNode extends Error {}

/** Whether an error says a frame or its document is gone, rather than that a command failed. */
function frameUnreachable(e) {
  const message = String(e?.message ?? e)
  return e instanceof NoSuchNode || message.includes('no such frame') || message.includes('no such node')
}

/** The entries of an `object` remote value by property name. */
function objectFields(value) {
  if (!value || value.type !== 'object') {
    throw new error.WebDriverError(`accessibility snapshot: expected an object remote value, got ${value?.type}`)
  }
  // A property name is written as a plain string, or as a string remote value.
  return new Map((value.value ?? []).map(([key, entry]) => [typeof key === 'string' ? key : stringValue(key), entry]))
}

function stringValue(value) {
  return String(value?.value ?? '')
}

function sharedIdOf(node) {
  if (node?.type !== 'node' || !node.sharedId) {
    throw new error.WebDriverError('accessibility snapshot: expected a node reference in the elements list')
  }
  return node.sharedId
}

/** The browsing context id of a `window` remote value; null for a frame with no reachable context. */
function contextOf(window) {
  return window?.type === 'window' ? (window.value?.context ?? null) : null
}

/**
 * Takes snapshots for one driver: runs the atom in each document and stitches
 * child frames into the tree.
 */
class AccessibilitySnapshotter {
  /**
   * @param {!WebDriver} driver The driver to snapshot through.
   * @param {function(string): !WebElement} elementFactory Makes the element for a shared id.
   */
  constructor(driver, elementFactory) {
    this.driver_ = driver
    this.elementFactory_ = elementFactory
  }

  /**
   * Snapshots the whole page, or the subtree under `root`.
   *
   * @param {?WebElement} root The element whose subtree to snapshot, or null for
   *     the page of the current window's top-level browsing context.
   * @return {!Promise<!AccessibilityNode>} The snapshot, with every reachable
   *     child frame's tree attached under its `iframe` node.
   * @throws {error.UnsupportedOperationError} When the session has no BiDi connection.
   * @throws {error.StaleElementReferenceError} When `root` no longer belongs to a document.
   */
  async snapshot(root) {
    const caps = await this.driver_.getCapabilities()
    if (!caps.get('webSocketUrl')) {
      throw new error.UnsupportedOperationError(
        'getAccessibilitySnapshot() requires a WebDriver BiDi session; enable it with options.enableBidi()' +
          ' before building the driver',
      )
    }
    const top = await this.driver_.getWindowHandle()
    if (!root) {
      const node = await this.snapshotContext_(top, null)
      if (node === null) {
        throw new error.WebDriverError('accessibility snapshot: the script returned nothing')
      }
      return node
    }
    // The element may live in any frame of the window. Chromium resolves its shared
    // id only in the document that owns it; Firefox resolves it in any document of
    // the browsing context group, so the atom checks ownership itself and each
    // context is tried until the owner is found.
    const rootId = await root.getId()
    for (const context of await this.contexts_(top)) {
      let node
      try {
        node = await this.snapshotContext_(context, rootId)
      } catch (e) {
        if (!(e instanceof NoSuchNode)) throw e
        continue
      }
      if (node !== null) return node
    }
    throw new error.StaleElementReferenceError(STALE_MESSAGE)
  }

  /**
   * Sends one BiDi command over the driver's connection and returns its result.
   * The call here returns node remote values by the hundred, whose attribute
   * maps the generated domain modules would validate one by one.
   * @private
   */
  async send_(method, params) {
    const bidi = await getBidiConnection(this.driver_)
    const response = await bidi.send({ method, params })
    if (response.error) {
      throw new Error(`${response.error}: ${response.message}`)
    }
    return response.result
  }

  /**
   * The snapshot of `context`, or null when another document owns the root.
   * @private
   */
  async snapshotContext_(context, rootId) {
    const result = await this.call_(context, rootId ? [{ sharedId: rootId }] : [])
    if (result.type === 'null') return null
    const fields = objectFields(result)
    if (fields.has('error')) {
      // The only error the atom reports as data: the root left its document.
      throw new error.StaleElementReferenceError(STALE_MESSAGE)
    }
    const elements = (fields.get('elements')?.value ?? []).map((node) => this.elementFactory_(sharedIdOf(node)))
    const windows = (fields.get('windows')?.value ?? []).map(contextOf)
    return nodeFromWire(JSON.parse(stringValue(fields.get('json'))), elements, (index) => this.stitch_(windows[index]))
  }

  /**
   * Runs the atom's wire entry in the sandbox of `context` and returns the remote value of its result.
   * @private
   */
  async call_(context, args) {
    let raw
    try {
      raw = await this.send_('script.callFunction', {
        functionDeclaration: `(root) => (${atomDeclaration()})(root)`,
        awaitPromise: false,
        target: { context, sandbox: SANDBOX },
        arguments: args,
        resultOwnership: 'none',
        serializationOptions: SERIALIZATION_OPTIONS,
      })
    } catch (e) {
      // The BiDi "no such node" error: the document of this context does not own
      // the root's shared id, either because the root lives in another frame or
      // because its document is gone.
      if (String(e?.message).includes('no such node')) {
        throw new NoSuchNode(e.message)
      }
      throw e
    }
    if (raw.type === 'exception') {
      const text = String(raw.exceptionDetails?.text ?? raw.exceptionDetails)
      throw new error.WebDriverError(`accessibility snapshot failed in the page: ${text}`)
    }
    return raw.result
  }

  /**
   * The document of a frame as the frame node's one child, or no children when unreachable.
   * @private
   */
  async stitch_(context) {
    if (!context) return []
    try {
      const document = await this.snapshotContext_(context, null)
      return document === null ? [] : [document]
    } catch (e) {
      // Gone between discovery and the call, or mid-navigation: the frame stays
      // a leaf (ADR §1). Anything else is a real failure.
      if (!frameUnreachable(e)) throw e
      log_.finer(`accessibility snapshot: frame ${context} not reachable: ${e}`)
      return []
    }
  }

  /** The window's browsing contexts, top-level first, then each frame depth-first. */
  async contexts_(top) {
    const contexts = [top]
    const tree = await this.send_('browsingContext.getTree', { root: top })
    const stack = [...(tree.contexts ?? [])]
    while (stack.length) {
      const info = stack.shift()
      if (info.context !== top) contexts.push(info.context)
      stack.unshift(...(info.children ?? []))
    }
    return contexts
  }
}

module.exports = { AccessibilityNode, AccessibilitySnapshotter, nodeFromWire }
