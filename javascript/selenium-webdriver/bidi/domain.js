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

// Serializes subscribe()/unsubscribe() transitions per (connection, method), so
// concurrent addCallback()/unsubscribe() calls touching the same event — from any
// Domain instance sharing that connection, not just one — can't interleave into an
// inconsistent remote subscription state (e.g. a listener left attached locally
// after a same-method unsubscribe-in-flight elsewhere wins the race and tells the
// browser to stop sending it). Keyed by the connection object itself via a WeakMap,
// not any one Domain instance — module-level, not Domain state, so Domain itself
// stays a plain, stateless wrapper around `send()` plus this queuing.
const subscriptionQueues = new WeakMap()

function queueSubscriptionChange(bidi, method, change) {
  let methods = subscriptionQueues.get(bidi)
  if (methods === undefined) {
    methods = new Map()
    subscriptionQueues.set(bidi, methods)
  }
  const previous = methods.get(method) ?? Promise.resolve()
  const next = previous.then(change, change) // run `change` next regardless of a prior failure
  methods.set(
    method,
    next.catch(() => {}),
  ) // ...but don't let that failure jam the queue for later callers
  return next
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
   * Subscribes `handler` to a BiDi event. Two distinct things happen: remote
   * subscription (telling the browser to start sending this event at all,
   * via the underlying connection's `subscribe()`) and local listening
   * (attaching `handler` to the connection so it runs when the event
   * arrives) — a descriptor's event only ever reaches `handler` once both
   * are in place. Remote subscription/unsubscription is ref-counted against
   * the connection's own listener count — shared truth across every Domain
   * instance on the same connection — so a second caller subscribing to the
   * same event doesn't re-subscribe remotely, and unsubscribing doesn't cut
   * off another caller still listening for it. The listener is attached
   * before `subscribe()` is awaited (not after), so an event the browser
   * starts sending as soon as it processes the subscription can't arrive in
   * a gap where nothing is listening yet; and every subscribe/unsubscribe
   * transition for this event, from any caller, is serialized (see
   * queueSubscriptionChange()) so concurrent callers can't interleave into
   * an inconsistent remote state.
   * @param {{method: string, type: ({fromWire(payload: unknown): unknown}|undefined)}} descriptor
   *   An event descriptor from event().
   * @param {function(unknown): void} handler Invoked with the event's params
   *   (parsed through descriptor.type first, if one was given) each time it fires.
   * @returns {Promise<{unsubscribe: function(): Promise<void>}>}
   *   A handle for this subscription — call `unsubscribe()` to stop receiving the event.
   */
  async addCallback(descriptor, handler) {
    const dispatch = descriptor.type === undefined ? handler : (params) => handler(descriptor.type.fromWire(params))
    await queueSubscriptionChange(this.#bidi, descriptor.method, async () => {
      this.#bidi.on(descriptor.method, dispatch)
      if (this.#bidi.listenerCount(descriptor.method) === 1) {
        try {
          await this.#bidi.subscribe(descriptor.method)
        } catch (err) {
          this.#bidi.off(descriptor.method, dispatch) // don't leak a listener for a subscription that never took
          throw err
        }
      }
    })
    return {
      unsubscribe: () =>
        queueSubscriptionChange(this.#bidi, descriptor.method, async () => {
          this.#bidi.off(descriptor.method, dispatch)
          if (this.#bidi.listenerCount(descriptor.method) === 0) {
            await this.#bidi.unsubscribe(descriptor.method)
          }
        }),
    }
  }
}

module.exports = { Domain, event, DOMAIN_TOKEN }
