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

const { getBidiConnection } = require('../lib/bidi_connection')

// Gates Domain's constructor so `new Network(someRandomThing)` fails loudly
// instead of silently producing a broken instance. A Symbol can't be forged
// or guessed, so this is real runtime enforcement, not just a TS annotation —
// only a generated `Class.create(driver)` (and this package's own tests) may
// pass it. It's exported deliberately, not hidden: the point is to stop
// accidental misuse of the normal `new Network(x)` shape, not to defend
// against someone who deliberately imports and passes this.
const DOMAIN_TOKEN = Symbol('Domain internal construction token — obtained only via Class.create(driver)')

/**
 * Describes one subscribable BiDi event, for use with Domain#addCallback().
 * @param {string} method
 * @param {{fromWire(payload: unknown): unknown}} [type] Runtime record/union
 *   class for the event's params, if the schema declares one. When present,
 *   addCallback() parses each delivered payload through it before the
 *   caller's handler runs — inbound wire payloads are validated against
 *   their resolved type; an event's params is such a payload just as much
 *   as a command's result is.
 * @returns {{method: string, type: ({fromWire(payload: unknown): unknown}|undefined)}}
 *   The event descriptor, ready to pass to Domain#addCallback().
 */
function event(method, type) {
  return { method, type }
}

/** Shared base for every generated BiDi domain class. See domain.d.ts for the typed surface. */
class Domain {
  #bidi

  constructor(bidi, token) {
    if (token !== DOMAIN_TOKEN) {
      throw new TypeError(`${new.target.name} must be constructed via ${new.target.name}.create(driver), not \`new\``)
    }
    this.#bidi = bidi
  }

  static async connect(driver) {
    return getBidiConnection(driver)
  }

  async send(method, params) {
    const response = await this.#bidi.send({ method, params })
    if (response?.error !== undefined) {
      throw new Error(`${response.error}: ${response.message}`)
    }
    return response?.result
  }

  /**
   * Subscribes `handler` to a BiDi event. All the actual subscription-lifecycle
   * work — remote subscribe/unsubscribe, per-subscription bookkeeping — lives on
   * the connection itself (see Index#addCallback in bidi/index.js); Domain only
   * adds the one thing the connection can't do on its own: parsing a delivered
   * payload through the descriptor's type before the caller's handler runs.
   * @param {{method: string, type: ({fromWire(payload: unknown): unknown}|undefined)}} descriptor
   *   An event descriptor from event().
   * @param {function(unknown): void} handler Invoked with the event's params
   *   (parsed through descriptor.type first, if one was given) each time it fires.
   * @returns {Promise<{id: string, unsubscribe: function(): Promise<void>}>}
   *   A handle for this subscription — call `unsubscribe()` to stop receiving the event.
   */
  async addCallback(descriptor, handler) {
    const dispatch = descriptor.type === undefined ? handler : (params) => handler(descriptor.type.fromWire(params))
    return this.#bidi.addCallback(descriptor.method, dispatch)
  }
}

module.exports = { Domain, event, DOMAIN_TOKEN }
