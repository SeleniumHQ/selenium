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
})
