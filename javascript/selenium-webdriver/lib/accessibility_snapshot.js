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
 * with it. This module holds the parts that are the binding's: the public node
 * type and its text form, the decoder from the BiDi wire shape, frame
 * stitching, and the mapping of element references to WebElement.
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
/** Where the atom is kept inside the sandbox realm once installed. */
const GLOBAL = '__seleniumAccessibilitySnapshot'
const SERIALIZATION_OPTIONS = { maxDomDepth: 0 }

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
 * Decodes a snapshot from the `script.callFunction` result that carries it.
 *
 * @param {!Object} value The BiDi remote value of the atom's return value: an
 *     `object` whose value is a list of `[key, value]` pairs, with arrays as
 *     `array` and elements as `node` values carrying a `sharedId`.
 * @param {function(string): !WebElement} elementFactory Makes the element for a shared id.
 * @return {!AccessibilityNode} The decoded node, with its subtree.
 */
function nodeFromRemoteValue(value, elementFactory) {
  const fields = objectFields(value)
  const elementValue = fields.get('element')
  const element =
    elementValue && elementValue.type === 'node' && 'sharedId' in elementValue
      ? elementFactory(elementValue.sharedId)
      : null
  const valueField = fields.get('value')
  const states = {}
  for (const [key, state] of objectFields(fields.get('states'))) {
    states[key] = stateValue(state)
  }
  return new AccessibilityNode({
    role: stringValue(fields.get('role')),
    name: stringValue(fields.get('name')),
    description: fields.has('description') ? stringValue(fields.get('description')) : '',
    value: valueField ? stringValue(valueField) : undefined,
    states,
    element,
    children: (fields.get('children')?.value ?? []).map((child) => nodeFromRemoteValue(child, elementFactory)),
  })
}

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

function stateValue(value) {
  switch (value?.type) {
    case 'boolean':
      return Boolean(value.value)
    case 'number':
      return Number(value.value)
    default:
      return String(value?.value)
  }
}

let atomModule = null

/**
 * The atom as a function declaration: the module built by
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

/**
 * Takes snapshots for one driver: installs the atom in the sandbox realm of
 * each document and stitches child frames into the tree.
 */
class AccessibilitySnapshotter {
  /**
   * @param {!WebDriver} driver The driver to snapshot through.
   * @param {function(string): !WebElement} elementFactory Makes the element for a shared id.
   */
  constructor(driver, elementFactory) {
    this.driver_ = driver
    this.elementFactory_ = elementFactory
    this.preloaded_ = false
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
    await this.ensurePreload_()
    const top = await this.driver_.getWindowHandle()
    if (!root) {
      return this.snapshotContext_(top, null)
    }
    // The element may live in any frame of the window; its shared id resolves only
    // in the document that owns it, so each context is tried until one accepts it.
    const rootId = await root.getId()
    for (const context of await this.contexts_(top)) {
      try {
        return await this.snapshotContext_(context, rootId)
      } catch (e) {
        if (!(e instanceof NoSuchNode)) throw e
      }
    }
    throw new error.StaleElementReferenceError('the snapshot root is no longer attached to a document')
  }

  /**
   * Sends one BiDi command over the driver's connection and returns its result.
   * The commands used here return node remote values by the hundred, whose
   * attribute maps the generated domain modules would validate one by one.
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

  async ensurePreload_() {
    // New documents get the atom installed as they load; documents that predate
    // the preload install it on first use, in call_.
    if (this.preloaded_) return
    this.preloaded_ = true
    try {
      await this.send_('script.addPreloadScript', {
        functionDeclaration: `() => { globalThis.${GLOBAL} = (${atomDeclaration()}); }`,
        sandbox: SANDBOX,
      })
    } catch (e) {
      log_.finer(`accessibility snapshot: preload not installed, falling back to on-demand install: ${e}`)
    }
  }

  async snapshotContext_(context, rootId) {
    const args = rootId ? [{ sharedId: rootId }] : []
    let result = await this.call_(context, `(root) => globalThis.${GLOBAL}(root)`, args, false)
    if (result === null) {
      // The realm has no atom yet (a document loaded before the preload, or a
      // remote end without preload support): install it and run in one call.
      result = await this.call_(context, `(root) => (globalThis.${GLOBAL} = (${atomDeclaration()}))(root)`, args, true)
    }
    const node = nodeFromRemoteValue(result, this.elementFactory_)
    await this.stitchFrames_(context, node)
    return node
  }

  /**
   * Runs `declaration` in the sandbox of `context`; null when it threw and a retry may help.
   * @private
   */
  async call_(context, declaration, args, final) {
    let raw
    try {
      raw = await this.send_('script.callFunction', {
        functionDeclaration: declaration,
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
      if (text.includes('detached')) {
        throw new error.StaleElementReferenceError('the snapshot root is no longer attached to a document')
      }
      if (!final) return null
      throw new error.WebDriverError(`accessibility snapshot failed in the page: ${text}`)
    }
    return raw.result
  }

  /** Replaces each `iframe` leaf's children with its document's tree, where reachable. */
  async stitchFrames_(context, node) {
    for (const child of node.children) {
      if (child.role === 'iframe' && child.element) {
        const childContext = await this.frameContext_(context, child.element)
        if (childContext) {
          try {
            child.children = [await this.snapshotContext_(childContext, null)]
          } catch (e) {
            // Mid-navigation or otherwise unreachable: the frame stays a leaf (ADR §1).
            log_.finer(`accessibility snapshot: frame ${childContext} not reachable: ${e}`)
          }
        }
      } else {
        await this.stitchFrames_(context, child)
      }
    }
  }

  /** The browsing context id of a frame element, from its WindowProxy; null when it has none. */
  async frameContext_(context, frame) {
    try {
      const raw = await this.send_('script.callFunction', {
        functionDeclaration: '(frame) => frame.contentWindow',
        awaitPromise: false,
        target: { context, sandbox: SANDBOX },
        arguments: [{ sharedId: await frame.getId() }],
        resultOwnership: 'none',
      })
      if (raw.type !== 'success' || raw.result?.type !== 'window') return null
      return raw.result.value?.context ?? null
    } catch (e) {
      log_.finer(`accessibility snapshot: no browsing context for frame: ${e}`)
      return null
    }
  }

  /** The window's browsing contexts, top-level first, then each frame depth-first. */
  async contexts_(top) {
    const contexts = [top]
    try {
      const tree = await this.send_('browsingContext.getTree', { root: top })
      const stack = [...(tree.contexts ?? [])]
      while (stack.length) {
        const info = stack.shift()
        if (info.context !== top) contexts.push(info.context)
        stack.unshift(...(info.children ?? []))
      }
    } catch (e) {
      log_.finer(`accessibility snapshot: browsing context tree unavailable: ${e}`)
    }
    return contexts
  }
}

module.exports = { AccessibilityNode, AccessibilitySnapshotter, nodeFromRemoteValue }
