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

const assert = require('node:assert')
const net = require('node:net')
const { WebSocketServer } = require('ws')
const BiDi = require('selenium-webdriver/bidi')
const { Domain, event, DOMAIN_TOKEN } = require('selenium-webdriver/bidi/domain')
const { defineRecord } = require('selenium-webdriver/bidi/serialization/record')

// Shared scaffolding for every test server below: owns the WebSocketServer/port/url
// plumbing and per-connection message parsing, so each server only has to supply how
// it replies to a parsed `{id, method, params}` message.
function startWsServer(onMessage) {
  return new Promise((resolve) => {
    const server = new WebSocketServer({ port: 0 }, () => {
      const { port } = server.address()
      resolve({
        server,
        url: `ws://127.0.0.1:${port}`,
        emitEvent(method, params) {
          for (const client of server.clients) {
            client.send(JSON.stringify({ method, params }))
          }
        },
      })
    })
    server.on('connection', (ws) => {
      ws.on('message', (data) => onMessage(JSON.parse(data.toString()), ws))
    })
  })
}

function startEchoServer() {
  return startWsServer(({ id }, ws) => ws.send(JSON.stringify({ id, result: {} })))
}

// Like startEchoServer(), but replies to session.subscribe with a fresh
// subscription id per call.
function startSubscribeServer() {
  let nextSubscriptionId = 0
  return startWsServer(({ id, method }, ws) => {
    if (method === 'session.subscribe') {
      ws.send(JSON.stringify({ id, result: { subscription: `sub-${++nextSubscriptionId}` } }))
    } else {
      ws.send(JSON.stringify({ id, result: {} }))
    }
  })
}

// Replies to session.subscribe by sending the event notification *before* the
// subscribe reply — the exact gap addCallback()'s listen-before-subscribe
// ordering exists to close (a naive subscribe-then-listen implementation would
// miss this event, since nothing is listening yet when it arrives).
function startImmediateEventServer() {
  return startWsServer(({ id, method }, ws) => {
    if (method === 'session.subscribe') {
      ws.send(JSON.stringify({ method: 'log.entryAdded', params: { text: 'immediate' } }))
      ws.send(JSON.stringify({ id, result: { subscription: 'sub-1' } }))
    } else {
      ws.send(JSON.stringify({ id, result: {} }))
    }
  })
}

// Replies to every command, including session.subscribe, with a wire-level
// error response (no `result` field) — for exercising addCallback()'s
// surfacing of a genuine remote rejection.
function startEchoErrorServer() {
  return startWsServer(({ id }, ws) =>
    ws.send(JSON.stringify({ id, error: 'unknown command', message: 'not implemented' })),
  )
}

// Replies to session.subscribe with a *successful* response that nonetheless
// omits the `subscription` id — a malformed-but-not-erroring reply, distinct
// from startEchoErrorServer()'s wire-level error.
function startSubscribeWithoutIdServer() {
  return startWsServer(({ id }, ws) => ws.send(JSON.stringify({ id, result: {} })))
}

// Plain TCP listener that accepts connections but never completes the
// WebSocket upgrade — keeps the client stuck in CONNECTING so we can
// exercise the close()-during-connect path deterministically.
function startStallingServer() {
  return new Promise((resolve) => {
    const server = net.createServer(() => {})
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ server, url: `ws://127.0.0.1:${port}` })
    })
  })
}

describe('BiDi connection', function () {
  let server
  let bidi

  beforeEach(async function () {
    const started = await startEchoServer()
    server = started.server
    bidi = new BiDi(started.url)
    await bidi.waitForConnection()
  })

  afterEach(async function () {
    await bidi.close()
    await new Promise((resolve) => server.close(resolve))
  })

  // Regression test: BiDi network interception during a navigation issues many
  // concurrent send() calls, which previously each attached a 'message'
  // listener to the underlying WebSocket and tripped Node's
  // MaxListenersExceededWarning once more than 10 were in flight.
  it('does not emit MaxListenersExceededWarning under concurrent sends', async function () {
    const warnings = []
    const onWarning = (warning) => warnings.push(warning)
    process.on('warning', onWarning)

    try {
      const sends = []
      for (let i = 0; i < 50; i++) {
        sends.push(bidi.send({ method: 'session.status', params: {} }))
      }
      await Promise.all(sends)
    } finally {
      process.off('warning', onWarning)
    }

    const offenders = warnings.filter((w) => w.name === 'MaxListenersExceededWarning')
    assert.deepStrictEqual(offenders, [], `unexpected warnings: ${offenders.map((w) => w.message).join(', ')}`)
  })

  it('uses one shared message listener regardless of in-flight sends', async function () {
    const before = bidi.socket.listenerCount('message')

    const inFlight = []
    for (let i = 0; i < 25; i++) {
      inFlight.push(bidi.send({ method: 'session.status', params: {} }))
    }

    // While requests are in flight the listener count must not grow.
    assert.strictEqual(bidi.socket.listenerCount('message'), before)

    await Promise.all(inFlight)

    // And it stays the same after they resolve.
    assert.strictEqual(bidi.socket.listenerCount('message'), before)
  })

  // Surface parse failures rather than dropping silently — otherwise callers
  // see misleading send() timeouts when a peer sends a malformed frame.
  it('emits an error when the server sends a non-JSON message', async function () {
    const errors = []
    bidi.on('error', (err) => errors.push(err))

    for (const client of server.clients) {
      client.send('not-json')
    }

    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.strictEqual(errors.length, 1, `expected 1 error, got ${errors.length}`)
    assert.match(errors[0].message, /Failed to parse BiDi message/)
  })

  // If the peer disconnects mid-request, callers should fail promptly via the
  // socket's 'close' event instead of waiting for RESPONSE_TIMEOUT.
  it('rejects pending sends when the connection drops unexpectedly', async function () {
    // Stop the server from replying so the send stays pending.
    for (const client of server.clients) {
      client.removeAllListeners('message')
    }
    const inFlight = bidi.send({ method: 'session.status', params: {} })

    for (const client of server.clients) {
      client.terminate()
    }

    await assert.rejects(inFlight, /BiDi connection closed unexpectedly/)
  })

  // Once the connection is closed, subsequent send() calls must fail fast
  // rather than hanging on waitForConnection() awaiting an 'open' event that
  // will never fire.
  it('rejects send() after the connection has been closed', async function () {
    for (const client of server.clients) {
      client.terminate()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))

    await assert.rejects(bidi.send({ method: 'session.status', params: {} }), /BiDi connection is closed/)
  })

  // Race regression: close() must unblock waitForConnection() callers even
  // when the socket is still CONNECTING. Previously close() ran
  // removeAllListeners('close') before the socket actually closed, which
  // could strip the rejection listener that waitForConnection() relied on
  // and leave the wait pending forever.
  it('unblocks waitForConnection() when close() is called during connect', async function () {
    const stalling = await startStallingServer()
    try {
      const stalled = new BiDi(stalling.url)
      const wait = stalled.waitForConnection()

      // Close while the underlying socket is still CONNECTING.
      const close = stalled.close()

      await assert.rejects(wait, /BiDi connection closed/)
      await close
    } finally {
      await new Promise((resolve) => stalling.server.close(resolve))
    }
  })

  // Race regression: if close() runs while the WebSocket is still CONNECTING
  // and the handshake then completes anyway, the 'open' handler must not
  // flip the instance back to connected=true.
  it('does not become connected if open fires after close', async function () {
    const late = await startEchoServer()
    try {
      const racer = new BiDi(late.url)
      // Close immediately, before 'open' fires.
      const close = racer.close()

      // Give the handshake a chance to complete.
      await new Promise((resolve) => setTimeout(resolve, 100))

      assert.strictEqual(racer.isConnected, false, 'connection should remain closed after open race')
      await close
    } finally {
      await new Promise((resolve) => late.server.close(resolve))
    }
  })
})

describe('BiDi addCallback', function () {
  let subscribeServer
  let bidi

  beforeEach(async function () {
    subscribeServer = await startSubscribeServer()
    bidi = new BiDi(subscribeServer.url)
    await bidi.waitForConnection()
  })

  afterEach(async function () {
    await bidi.close()
    await new Promise((resolve) => subscribeServer.server.close(resolve))
  })

  it('resolves with the server-assigned subscription id', async function () {
    const subscription = await bidi.addCallback('log.entryAdded', () => {})
    assert.strictEqual(subscription.id, 'sub-1')
  })

  it('invokes the handler when a matching event is delivered', async function () {
    const received = []
    await bidi.addCallback('log.entryAdded', (params) => received.push(params))

    subscribeServer.emitEvent('log.entryAdded', { text: 'hello' })
    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.deepStrictEqual(received, [{ text: 'hello' }])
  })

  // A handler that throws synchronously (e.g. a typed addCallback() dispatcher
  // whose fromWire() rejects a corrupted payload) must not crash the process —
  // emit() does not catch listener exceptions on its own, so this has to be
  // guarded explicitly at the dispatch site.
  it('does not crash when a handler throws synchronously', async function () {
    const errors = []
    bidi.on('error', (err) => errors.push(err))
    await bidi.addCallback('log.entryAdded', () => {
      throw new Error('handler blew up')
    })

    subscribeServer.emitEvent('log.entryAdded', { text: 'hello' })
    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.strictEqual(errors.length, 1)
    assert.match(errors[0].message, /handler blew up/)
  })

  // A throwing listener must not prevent a sibling listener registered for the
  // same event from still receiving that same delivery — emit() itself aborts
  // its iteration once one listener throws, so dispatch has to isolate them.
  it('still delivers to a second listener when the first one throws', async function () {
    const receivedBySecond = []
    await bidi.addCallback('log.entryAdded', () => {
      throw new Error('first listener blew up')
    })
    await bidi.addCallback('log.entryAdded', (params) => receivedBySecond.push(params))

    subscribeServer.emitEvent('log.entryAdded', { text: 'hello' })
    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.deepStrictEqual(receivedBySecond, [{ text: 'hello' }])
  })

  // _emitOrWarn()'s whole point is to never let a bad 'error' listener crash the
  // process either — otherwise the crash this design guards against just moves
  // one level: from a throwing event handler to a throwing 'error' handler.
  it("does not crash when a registered 'error' listener itself throws", async function () {
    const warnings = []
    const onWarning = (w) => warnings.push(w)
    process.on('warning', onWarning)
    bidi.on('error', () => {
      throw new Error('error listener blew up')
    })
    await bidi.addCallback('log.entryAdded', () => {
      throw new Error('handler blew up')
    })

    try {
      subscribeServer.emitEvent('log.entryAdded', { text: 'hello' })
      await new Promise((resolve) => setTimeout(resolve, 50))
    } finally {
      process.off('warning', onWarning)
    }

    assert.ok(warnings.some((w) => w.message.includes("BiDi 'error' listener threw")))
  })

  // The core case this design exists for: two independent subscriptions to the
  // same event, each individually removable via the server-assigned id, with
  // no risk of one unsubscribe() clobbering the other's registration.
  it('unsubscribing one of two subscriptions to the same event leaves the other active', async function () {
    const receivedA = []
    const receivedB = []
    const subA = await bidi.addCallback('log.entryAdded', (params) => receivedA.push(params))
    const subB = await bidi.addCallback('log.entryAdded', (params) => receivedB.push(params))

    assert.notStrictEqual(subA.id, subB.id)

    await subA.unsubscribe()
    subscribeServer.emitEvent('log.entryAdded', { text: 'after unsubscribe' })
    await new Promise((resolve) => setTimeout(resolve, 50))

    assert.deepStrictEqual(receivedA, [])
    assert.deepStrictEqual(receivedB, [{ text: 'after unsubscribe' }])
  })

  it('unsubscribe() is a no-op the second time it is called', async function () {
    const subscription = await bidi.addCallback('log.entryAdded', () => {})
    await subscription.unsubscribe()
    await assert.doesNotReject(subscription.unsubscribe())
  })

  it("removeCallback() is available directly, matching addCallback's own unsubscribe()", async function () {
    const subscription = await bidi.addCallback('log.entryAdded', () => {})
    await assert.doesNotReject(bidi.removeCallback(subscription.id))
  })

  // Local cleanup (detaching the listener) already happened when the connection
  // closed — see _failPending() — so unsubscribe() afterward must not try to
  // reach a remote end that's gone and reject with 'BiDi connection is closed'.
  it('unsubscribe() is a no-op once the connection is already closed', async function () {
    const subscription = await bidi.addCallback('log.entryAdded', () => {})
    await bidi.close()
    await assert.doesNotReject(subscription.unsubscribe())
  })

  it('surfaces the actual remote error when session.subscribe is rejected', async function () {
    const errorServer = await startEchoErrorServer()
    const errorBidi = new BiDi(errorServer.url)
    try {
      await errorBidi.waitForConnection()
      await assert.rejects(
        errorBidi.addCallback('log.entryAdded', () => {}),
        /unknown command: not implemented/,
      )
    } finally {
      await errorBidi.close()
      await new Promise((resolve) => errorServer.server.close(resolve))
    }
  })

  it('rejects when session.subscribe succeeds but returns no subscription id', async function () {
    const noIdServer = await startSubscribeWithoutIdServer()
    const noIdBidi = new BiDi(noIdServer.url)
    try {
      await noIdBidi.waitForConnection()
      await assert.rejects(
        noIdBidi.addCallback('log.entryAdded', () => {}),
        /did not return a valid subscription id/,
      )
    } finally {
      await noIdBidi.close()
      await new Promise((resolve) => noIdServer.server.close(resolve))
    }
  })

  // Ordering regression: addCallback() attaches the local listener before
  // awaiting session.subscribe's reply, not after — so an event the server
  // sends the instant it processes the subscription (before its own reply
  // even reaches the client) still arrives at a listener that's already there.
  it('does not miss an event the server sends before the subscribe reply arrives', async function () {
    const immediate = await startImmediateEventServer()
    const immediateBidi = new BiDi(immediate.url)
    try {
      await immediateBidi.waitForConnection()
      const received = []
      await immediateBidi.addCallback('log.entryAdded', (params) => received.push(params))

      assert.deepStrictEqual(received, [{ text: 'immediate' }])
    } finally {
      await immediateBidi.close()
      await new Promise((resolve) => immediate.server.close(resolve))
    }
  })

  // End-to-end with a real Domain wrapping a real connection: a typed event
  // descriptor's fromWire() rejecting a corrupted payload must not crash the
  // process, must not reach the caller's handler, and must be reported —
  // exercises the exact path Index's per-listener try/catch exists to guard.
  it('does not crash, and does not invoke the handler, when a typed dispatcher rejects an invalid payload', async function () {
    const LogEntry = defineRecord('test.index.LogEntry', [
      { name: 'text', wire: 'text', required: true, type: { primitive: 'string' } },
    ])
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('log.entryAdded', LogEntry)

    const received = []
    const warnings = []
    const onWarning = (w) => warnings.push(w)
    process.on('warning', onWarning)

    try {
      await domain.addCallback(descriptor, (params) => received.push(params))

      // Missing the required 'text' field — LogEntry.fromWire() rejects this.
      subscribeServer.emitEvent('log.entryAdded', { notText: 'oops' })
      await new Promise((resolve) => setTimeout(resolve, 50))
    } finally {
      process.off('warning', onWarning)
    }

    assert.strictEqual(received.length, 0)
    assert.ok(warnings.some((w) => w.name === 'BiDiEventHandlerWarning'))
  })
})
