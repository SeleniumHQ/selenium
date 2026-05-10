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

function startEchoServer() {
  return new Promise((resolve) => {
    const server = new WebSocketServer({ port: 0 }, () => {
      const { port } = server.address()
      resolve({ server, url: `ws://127.0.0.1:${port}` })
    })
    server.on('connection', (ws) => {
      ws.on('message', (data) => {
        const { id } = JSON.parse(data.toString())
        ws.send(JSON.stringify({ id, result: {} }))
      })
    })
  })
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
