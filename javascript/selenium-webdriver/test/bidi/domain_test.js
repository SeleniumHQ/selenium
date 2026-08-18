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
const { Domain, event, DOMAIN_TOKEN } = require('selenium-webdriver/bidi/domain')
const { defineRecord } = require('selenium-webdriver/bidi/serialization/record')

const EntryAdded = defineRecord('test.domain.EntryAdded', [
  { name: 'text', wire: 'text', required: true, type: { primitive: 'string' } },
])

// Fake replacing the real BiDi transport — records what addCallback/removeCallback
// receive and lets the test drive delivery directly, without a socket.
function fakeBidi() {
  return {
    registered: undefined,
    async addCallback(method, handler) {
      this.registered = { method, handler }
      return { id: 'sub-1', unsubscribe: async () => {} }
    },
    async removeCallback(subscriptionId) {
      this.removedId = subscriptionId
    },
  }
}

describe('Domain addCallback', function () {
  it('parses delivered payloads through the descriptor type before the handler runs', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.entryAdded', EntryAdded)

    const received = []
    await domain.addCallback(descriptor, (params) => received.push(params))

    bidi.registered.handler({ text: 'hello' })

    assert.strictEqual(received.length, 1)
    assert.ok(received[0] instanceof EntryAdded)
    assert.strictEqual(received[0].text, 'hello')
  })

  it('passes the raw payload through when the descriptor has no type', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.untyped')

    const received = []
    await domain.addCallback(descriptor, (params) => received.push(params))

    bidi.registered.handler({ anything: 'goes' })

    assert.strictEqual(received.length, 1)
    assert.deepStrictEqual(received[0], { anything: 'goes' })
    assert.ok(!(received[0] instanceof EntryAdded))
  })

  it('removeCallback forwards the subscription id to the underlying transport', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)

    await domain.removeCallback('sub-1')

    assert.strictEqual(bidi.removedId, 'sub-1')
  })
})

describe('Domain construction guard', function () {
  it('rejects `new Domain(bidi)` with no token', function () {
    assert.throws(() => new Domain(fakeBidi()), TypeError)
  })

  it('rejects a forged token', function () {
    assert.throws(() => new Domain(fakeBidi(), Symbol('not the real token')), TypeError)
  })

  it('does not expose the wrapped transport as an enumerable/own property', function () {
    const domain = new Domain(fakeBidi(), DOMAIN_TOKEN)
    assert.deepStrictEqual(Object.keys(domain), [])
    assert.strictEqual(JSON.stringify(domain), '{}')
  })
})
