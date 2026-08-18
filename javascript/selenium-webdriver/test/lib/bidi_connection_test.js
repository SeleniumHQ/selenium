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
const { getBidiConnection, closeBidiConnection } = require('../../lib/bidi_connection')

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

describe('bidi_connection', function () {
  let server

  afterEach(async function () {
    if (server !== undefined) {
      await new Promise((resolve) => server.close(resolve))
      server = undefined
    }
  })

  it('creates exactly one BiDi connection under concurrent first access', async function () {
    const started = await startEchoServer()
    server = started.server

    let capabilitiesCalls = 0
    const driver = {
      async getCapabilities() {
        capabilitiesCalls++
        // Yield the event loop before resolving, so concurrent callers race.
        await new Promise((resolve) => setTimeout(resolve, 20))
        return { map_: new Map([['webSocketUrl', started.url]]) }
      },
    }

    const [a, b, c] = await Promise.all([
      getBidiConnection(driver),
      getBidiConnection(driver),
      getBidiConnection(driver),
    ])

    assert.strictEqual(capabilitiesCalls, 1, 'getCapabilities() should only be called once')
    assert.strictEqual(a, b)
    assert.strictEqual(b, c)

    await closeBidiConnection(driver)
  })

  it('closeBidiConnection() is a no-op when no connection was ever opened', async function () {
    const driver = {
      async getCapabilities() {
        throw new Error('should not be called')
      },
    }
    await assert.doesNotReject(closeBidiConnection(driver))
  })

  it('closeBidiConnection() does not reject when the original connection attempt failed', async function () {
    const driver = {
      async getCapabilities() {
        throw new Error('driver does not support BiDi')
      },
    }
    await assert.rejects(getBidiConnection(driver), /does not support BiDi/)
    // quit() calls this fire-and-forget (no await/catch at the call site), so
    // it must swallow the earlier failure rather than re-throwing it.
    await assert.doesNotReject(closeBidiConnection(driver))
  })
})
