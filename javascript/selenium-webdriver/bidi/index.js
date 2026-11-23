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

const { EventEmitter } = require('node:events')
const WebSocket = require('ws')

const RESPONSE_TIMEOUT = 1000 * 30

class Index extends EventEmitter {
  id = 0
  connected = false
  events = []
  browsingContexts = []

  /**
   * Create a new websocket connection
   * @param _webSocketUrl
   */
  constructor(_webSocketUrl) {
    super()
    this.connected = false
    this._closed = false
    this._pending = new Map()
    this._connectWaiters = new Set()
    // removeCallback(id) only receives the subscriptionId — off() needs the event
    // name and the exact handler function too, so this holds what it needs to
    // detach the right listener without the caller having to keep them around.
    this._callbacks = new Map()
    this._ws = new WebSocket(_webSocketUrl)
    this._ws.on('open', () => {
      // The handshake can complete after close()/_failPending() has already
      // marked the connection closed. Don't flip connected back to true and
      // proactively close the now-orphan socket so it does not leak.
      if (this._closed) {
        try {
          this._ws.close()
        } catch {
          /* socket already closing */
        }
        return
      }
      this.connected = true
      for (const { resolve } of this._connectWaiters) {
        resolve()
      }
      this._connectWaiters.clear()
    })
    // Single shared response dispatcher. Avoids attaching a new 'message'
    // listener for every in-flight send(), which previously caused
    // MaxListenersExceededWarning under concurrent BiDi traffic
    // (e.g. network interception during a page navigation).
    this._ws.on('message', (data) => {
      // Frames can arrive after close() has cleared _pending; ignore them
      // rather than re-emitting parse errors or dispatching to nothing.
      if (this._closed) {
        return
      }
      let payload
      try {
        payload = JSON.parse(data.toString())
      } catch (err) {
        // Surface protocol parse failures rather than silently dropping —
        // otherwise callers see misleading send() timeouts.
        this._emitOrWarn(new Error(`Failed to parse BiDi message: ${err.message}`), 'BiDiProtocolWarning')
        return
      }
      // Messages without a numeric id are BiDi events, not command responses.
      // Re-emit them on this EventEmitter by method name (e.g.
      // 'browsingContext.contextCreated') so that generated domain classes can
      // subscribe via bidi.on(methodName, callback) instead of each attaching
      // a new raw ws.on('message', ...) listener.  The existing hand-written
      // modules (logInspector, network, etc.) continue to use their own
      // ws.on('message', ...) listeners unchanged — this emission is purely
      // additive and does not affect those code paths.
      if (payload == null || typeof payload.id !== 'number') {
        if (payload != null && typeof payload.method === 'string') {
          // 'error' is a reserved EventEmitter event — emitting it without a
          // listener throws and crashes the process. Route any peer-supplied
          // method named 'error' through the same guarded path used for JSON
          // parse failures rather than forwarding it directly.
          if (payload.method === 'error') {
            this._emitOrWarn(
              new Error(`BiDi protocol error event: ${JSON.stringify(payload.params)}`),
              'BiDiProtocolWarning',
            )
          } else {
            // A listener can throw synchronously — most notably a typed
            // addCallback() dispatcher's fromWire() rejecting a corrupted
            // payload, which is meant to error rather than warn. Dispatched
            // one listener at a time (not via a single this.emit() call) so a
            // throwing listener doesn't prevent a sibling listener registered
            // for the same event from still receiving this delivery — emit()
            // itself aborts the rest of its iteration once one listener throws.
            // rawListeners(), not listeners(): listeners() unwraps a once()
            // registration to the caller's original function, so invoking it
            // here directly (bypassing emit()) would skip the internal wrapper
            // that removes it after one call — rawListeners() returns that
            // wrapper itself, preserving once()'s self-removal.
            for (const listener of this.rawListeners(payload.method)) {
              try {
                listener(payload.params)
              } catch (err) {
                const wrapped = err instanceof Error ? err : new Error(String(err))
                this._emitOrWarn(wrapped, 'BiDiEventHandlerWarning')
              }
            }
          }
        }
        return
      }
      const entry = this._pending.get(payload.id)
      if (entry === undefined) {
        return
      }
      clearTimeout(entry.timeoutId)
      this._pending.delete(payload.id)
      entry.resolve(payload)
    })
    // Fail any in-flight send() calls promptly when the peer disconnects
    // or the socket errors, instead of waiting for RESPONSE_TIMEOUT.
    this._ws.on('close', () => {
      this._failPending(new Error('BiDi connection closed unexpectedly'))
    })
    this._ws.on('error', (err) => {
      this._failPending(new Error(`BiDi connection error: ${err.message}`))
    })
  }

  /**
   * Reject any in-flight sends and mark the connection failed. Idempotent so
   * that close() and the underlying 'close'/'error' events do not double-reject.
   * @param {Error} error
   * @private
   */
  _failPending(error) {
    if (this._closed) {
      return
    }
    this._closed = true
    this.connected = false
    for (const { reject, timeoutId } of this._pending.values()) {
      clearTimeout(timeoutId)
      reject(error)
    }
    this._pending.clear()
    // Reject any callers parked in waitForConnection() so close() (or an
    // unexpected disconnect) cannot leave them hanging forever.
    for (const { reject } of this._connectWaiters) {
      reject(error)
    }
    this._connectWaiters.clear()
    // Detach every addCallback() listener too. Once closed, removeCallback()
    // can no longer reach the remote end (send() would just throw), so nothing
    // else will ever detach these listeners. Drop them here instead of leaving
    // them attached to an EventEmitter nothing will ever emit on again.
    for (const { method, handler } of this._callbacks.values()) {
      this.off(method, handler)
    }
    this._callbacks.clear()
  }

  /**
   * Emits `err` as an 'error' event if anything is listening for one,
   * otherwise reports it as a process warning under `warningType` — never
   * emits 'error' with no listener attached, which would itself throw and
   * crash the process. Also guards against the 'error' listener itself
   * throwing, so a broken listener can't cause the exact kind of crash this
   * helper exists to prevent, just one level removed.
   * @param {Error} err
   * @param {string} warningType
   * @private
   */
  _emitOrWarn(err, warningType) {
    if (this.listenerCount('error') === 0) {
      process.emitWarning(err.message, warningType)
      return
    }
    try {
      this.emit('error', err)
    } catch (listenerErr) {
      const wrapped = listenerErr instanceof Error ? listenerErr : new Error(String(listenerErr))
      process.emitWarning(`BiDi 'error' listener threw: ${wrapped.message}`, warningType)
    }
  }

  /**
   * @returns {WebSocket}
   */
  get socket() {
    return this._ws
  }

  /**
   * @returns {boolean|*}
   */
  get isConnected() {
    return this.connected
  }

  /**
   * Get Bidi Status
   * @returns {Promise<*>}
   */
  get status() {
    return this.send({
      method: 'session.status',
      params: {},
    })
  }

  /**
   * Resolve connection
   * @returns {Promise<unknown>}
   */
  async waitForConnection() {
    return new Promise((resolve, reject) => {
      if (this._closed) {
        reject(new Error('BiDi connection is closed'))
        return
      }
      if (this.connected) {
        resolve()
        return
      }
      // Park the waiter in a Set so the constructor's 'open' handler can
      // resolve it and _failPending() can reject it. Avoids attaching socket
      // listeners that close()'s removeAllListeners('close') would strip.
      this._connectWaiters.add({ resolve, reject })
    })
  }

  /**
   * Sends a bidi request
   * @param params
   * @returns {Promise<unknown>}
   */
  async send(params) {
    if (this._closed) {
      throw new Error('BiDi connection is closed')
    }
    if (!this.connected) {
      await this.waitForConnection()
    }
    // Defense in depth: even after waitForConnection() resolves, the socket
    // may have transitioned to CLOSING/CLOSED (e.g. caller closed the raw
    // socket). Refuse rather than throwing from inside ws.send().
    if (this._ws.readyState !== WebSocket.OPEN) {
      throw new Error('BiDi connection is not open')
    }

    const id = ++this.id

    this._ws.send(JSON.stringify({ id, ...params }))

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this._pending.delete(id)
        reject(new Error(`Request with id ${id} timed out`))
      }, RESPONSE_TIMEOUT)

      this._pending.set(id, { resolve, reject, timeoutId })
    })
  }

  /**
   * Subscribe to events.
   *
   * Not the correct implementation — this is not tied to a subscription id, so
   * {@link unsubscribe} below cancels by event/context name and can affect a
   * subscription made elsewhere (including via {@link addCallback}) for the
   * same event. Kept as-is only because the existing hand-written bidi/*.js
   * modules already depend on this exact shape; new code should use
   * {@link addCallback} instead, which is properly scoped by subscription id
   * (mirroring Java's BiDi#addListener/removeListener — see BiDi.java). Once
   * those hand-written modules are replaced by generated code built on
   * addCallback/removeCallback, this method (and unsubscribe) can be removed.
   * @param events
   * @param browsingContexts
   * @returns {Promise<void>}
   */
  async subscribe(events, browsingContexts) {
    function toArray(arg) {
      if (arg === undefined) {
        return []
      }

      return Array.isArray(arg) ? [...arg] : [arg]
    }

    const eventsArray = toArray(events)
    const contextsArray = toArray(browsingContexts)

    const params = {
      method: 'session.subscribe',
      params: {},
    }

    if (eventsArray.length && eventsArray.some((event) => typeof event !== 'string')) {
      throw new TypeError('events should be string or string array')
    }

    if (contextsArray.length && contextsArray.some((context) => typeof context !== 'string')) {
      throw new TypeError('browsingContexts should be string or string array')
    }

    if (eventsArray.length) {
      params.params.events = eventsArray
    }

    if (contextsArray.length) {
      params.params.contexts = contextsArray
    }

    this.events.push(...eventsArray)

    await this.send(params)
  }

  /**
   * Unsubscribe to events. See the note on {@link subscribe} above — this
   * cancels by event/context name, not by subscription id, so it can affect a
   * subscription this same connection made elsewhere. New code should call
   * the returned handle's `unsubscribe()` from {@link addCallback} instead.
   * @param events
   * @param browsingContexts
   * @returns {Promise<void>}
   */
  async unsubscribe(events, browsingContexts) {
    const eventsToRemove = typeof events === 'string' ? [events] : events

    // Check if the eventsToRemove are in the subscribed events array
    // Filter out events that are not in this.events before filtering
    const existingEvents = eventsToRemove.filter((event) => this.events.includes(event))

    // Remove the events from the subscribed events array
    this.events = this.events.filter((event) => !existingEvents.includes(event))

    if (typeof browsingContexts === 'string') {
      this.browsingContexts.pop()
    } else if (Array.isArray(browsingContexts)) {
      this.browsingContexts = this.browsingContexts.filter((id) => !browsingContexts.includes(id))
    }

    if (existingEvents.length === 0) {
      return
    }
    const params = {
      method: 'session.unsubscribe',
      params: {
        events: existingEvents,
      },
    }

    if (this.browsingContexts.length > 0) {
      params.params.contexts = this.browsingContexts
    }

    await this.send(params)
  }

  /**
   * Registers `handler` to be called on every delivered `method` event,
   * globally (no context/user-context scoping). This is the correct mechanism
   * — see the note on {@link subscribe}/{@link unsubscribe} above, which is a
   * separate, imprecise, event-name-scoped mechanism kept only for the
   * existing hand-written bidi/*.js modules until they're replaced by
   * generated code built on this method instead.
   *
   * Keyed by the server-assigned `subscription` id from `session.subscribe`'s
   * response, which the spec mints fresh on every call — so multiple
   * independent subscriptions to the same event coexist safely, and the
   * returned handle's `unsubscribe()` never affects another callback
   * registered for the same method. No client-side ref-counting is needed:
   * the protocol's own per-subscription id already gives each caller its own
   * independent, individually-cancellable registration.
   *
   * The local listener is attached before `session.subscribe` is awaited, not
   * after — so an event the browser starts sending as soon as it processes
   * the subscription can't arrive in a gap where nothing is listening yet.
   * If the subscribe call then fails (or returns no usable id), the listener
   * is removed again before the error propagates, so a failed subscription
   * doesn't leak one.
   * @param {string} method
   * @param {function(unknown): void} handler
   * @returns {Promise<{id: string, unsubscribe: function(): Promise<void>}>}
   */
  async addCallback(method, handler) {
    this.on(method, handler)

    try {
      const response = await this.send({
        method: 'session.subscribe',
        params: { events: [method] },
      })
      // send() resolves with the raw reply on any response, including a
      // wire-level error — check for one explicitly and surface it plainly,
      // rather than letting it fall through to the generic "no subscription
      // id" message below (matching how Domain#send() reports the same shape).
      if (response?.error !== undefined) {
        throw new Error(`${response.error}: ${response.message}`)
      }
      const subscriptionId = response?.result?.subscription
      if (typeof subscriptionId !== 'string' || subscriptionId === '') {
        throw new Error(`session.subscribe did not return a valid subscription id: ${JSON.stringify(response)}`)
      }

      this._callbacks.set(subscriptionId, { method, handler })

      return {
        id: subscriptionId,
        unsubscribe: () => this.removeCallback(subscriptionId),
      }
    } catch (err) {
      this.off(method, handler)
      throw err
    }
  }

  /**
   * Removes exactly the callback registered under `subscriptionId` (as
   * returned by {@link addCallback}). A no-op if already removed — including
   * once the connection is closed, since _failPending() has already cleaned
   * up local state at that point (and there is no remote end left to reach:
   * entry is only ever defined here while _closed is still false, since
   * _failPending() clears every entry in the same synchronous call that sets
   * _closed). Never affects any other callback, including another one
   * registered for the same method.
   *
   * Local state is only cleaned up once the remote end has confirmed the
   * subscription is actually gone — not before sending session.unsubscribe,
   * and not on a wire-level error response. Cleaning up first would leave a
   * phantom "removed" subscription if the send failed or was rejected: local
   * delivery would stop while the browser kept sending it, and a retry would
   * silently no-op since this method's own early return above would find no
   * entry left to act on.
   *
   * Concurrent calls for the same subscriptionId share one in-flight removal
   * instead of each sending their own session.unsubscribe — a second, racing
   * call would otherwise find the subscription already gone (removed by the
   * first) and get a wire-level error for what was a perfectly valid call.
   * The in-flight marker is cleared once the attempt settles, either way, so
   * a later retry after a failure starts a fresh attempt rather than reusing
   * a rejected one.
   * @param {string} subscriptionId
   * @returns {Promise<void>}
   */
  async removeCallback(subscriptionId) {
    const entry = this._callbacks.get(subscriptionId)
    if (entry === undefined) {
      return
    }

    if (entry.removing === undefined) {
      entry.removing = (async () => {
        const response = await this.send({
          method: 'session.unsubscribe',
          params: { subscriptions: [subscriptionId] },
        })
        if (response?.error !== undefined) {
          throw new Error(`${response.error}: ${response.message}`)
        }
        this._callbacks.delete(subscriptionId)
        this.off(entry.method, entry.handler)
      })().finally(() => {
        entry.removing = undefined
      })
    }

    return entry.removing
  }

  /**
   * Close ws connection.
   * @returns {Promise<unknown>}
   */
  close() {
    this._failPending(new Error('BiDi connection closed before response was received'))

    const closeWebSocket = (callback) => {
      // don't close if it's already closed
      if (this._ws.readyState === 3) {
        callback()
      } else {
        // don't notify on user-initiated shutdown ('disconnect' event)
        this._ws.removeAllListeners('close')
        this._ws.once('close', () => {
          this._ws.removeAllListeners()
          callback()
        })
        this._ws.close()
      }
    }
    return new Promise((fulfill, _) => {
      closeWebSocket(fulfill)
    })
  }
}

/**
 * API
 * @type {function(*): Promise<Index>}
 */
module.exports = Index
