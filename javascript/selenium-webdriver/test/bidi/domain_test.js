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
const { EventEmitter } = require('node:events')
const { Domain, event, DOMAIN_TOKEN } = require('selenium-webdriver/bidi/domain')
const { defineRecord } = require('selenium-webdriver/bidi/serialization/record')

const EntryAdded = defineRecord('test.domain.EntryAdded', [
  { name: 'text', wire: 'text', required: true, type: { primitive: 'string' } },
])

// Fake replacing the real BiDi transport (bidi/index.js's Index). Mirrors its
// actual shape — an EventEmitter with subscribe()/unsubscribe() added — rather
// than inventing its own addCallback/removeCallback surface, since Domain talks
// to the connection's real on/off/subscribe/unsubscribe directly.
function fakeBidi() {
  const bidi = new EventEmitter()
  bidi.subscribeCalls = []
  bidi.unsubscribeCalls = []
  bidi.subscribe = async (method) => {
    bidi.subscribeCalls.push(method)
  }
  bidi.unsubscribe = async (method) => {
    bidi.unsubscribeCalls.push(method)
  }
  return bidi
}

describe('Domain addCallback', function () {
  it('parses delivered payloads through the descriptor type before the handler runs', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.entryAdded', EntryAdded)

    const received = []
    await domain.addCallback(descriptor, (params) => received.push(params))

    bidi.emit('test.entryAdded', { text: 'hello' })

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

    bidi.emit('test.untyped', { anything: 'goes' })

    assert.strictEqual(received.length, 1)
    assert.deepStrictEqual(received[0], { anything: 'goes' })
    assert.ok(!(received[0] instanceof EntryAdded))
  })

  // Placeholder behavior: every addCallback() call subscribes remotely, and every
  // unsubscribe() call unsubscribes remotely — no ref-counting across callers yet.
  // See the comment on Domain#addCallback() in domain.js.
  it('calls bidi.subscribe() on every addCallback call', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.entryAdded', EntryAdded)

    await domain.addCallback(descriptor, () => {})
    await domain.addCallback(descriptor, () => {})

    assert.deepStrictEqual(bidi.subscribeCalls, ['test.entryAdded', 'test.entryAdded'])
  })

  it('calls bidi.unsubscribe() on every unsubscribe() call', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.entryAdded', EntryAdded)

    const first = await domain.addCallback(descriptor, () => {})
    const second = await domain.addCallback(descriptor, () => {})

    await first.unsubscribe()
    await second.unsubscribe()

    assert.deepStrictEqual(bidi.unsubscribeCalls, ['test.entryAdded', 'test.entryAdded'])
  })

  it('stops delivering to a handler once its own subscription is unsubscribed', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.untyped')

    const received = []
    const subscription = await domain.addCallback(descriptor, (params) => received.push(params))
    await subscription.unsubscribe()

    bidi.emit('test.untyped', { anything: 'goes' })

    assert.strictEqual(received.length, 0)
  })

  it('does not remove another still-active local listener on the same event', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.untyped')

    const receivedByFirst = []
    const receivedBySecond = []
    const first = await domain.addCallback(descriptor, (params) => receivedByFirst.push(params))
    await domain.addCallback(descriptor, (params) => receivedBySecond.push(params))

    await first.unsubscribe()
    bidi.emit('test.untyped', { anything: 'goes' })

    assert.strictEqual(receivedByFirst.length, 0)
    assert.strictEqual(receivedBySecond.length, 1)
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
