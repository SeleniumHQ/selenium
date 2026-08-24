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
// to the connection's real on/off/listenerCount/subscribe/unsubscribe directly.
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

// Same shape as fakeBidi(), but subscribe()/unsubscribe() stay pending until the
// test explicitly resolves them — widens the race window addCallback()/unsubscribe()
// must handle correctly (an event arriving mid-subscribe, two callers racing to
// subscribe/unsubscribe the same method) instead of hoping a real await happens to
// interleave the wrong way.
function controllableFakeBidi() {
  const bidi = new EventEmitter()
  bidi.subscribeCalls = []
  bidi.unsubscribeCalls = []
  const pendingSubscribes = []
  const pendingUnsubscribes = []
  bidi.subscribe = (method) => {
    bidi.subscribeCalls.push(method)
    return new Promise((resolve, reject) => pendingSubscribes.push({ resolve, reject }))
  }
  bidi.unsubscribe = (method) => {
    bidi.unsubscribeCalls.push(method)
    return new Promise((resolve, reject) => pendingUnsubscribes.push({ resolve, reject }))
  }
  bidi.resolveNextSubscribe = () => pendingSubscribes.shift().resolve()
  bidi.rejectNextSubscribe = (err) => pendingSubscribes.shift().reject(err)
  bidi.resolveNextUnsubscribe = () => pendingUnsubscribes.shift().resolve()
  return bidi
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

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

  it('subscribes remotely on the first listener, and not again for a second one', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.entryAdded', EntryAdded)

    await domain.addCallback(descriptor, () => {})
    await domain.addCallback(descriptor, () => {})

    assert.deepStrictEqual(bidi.subscribeCalls, ['test.entryAdded'])
  })

  it('unsubscribes remotely only once the last local listener is gone', async function () {
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.entryAdded', EntryAdded)

    const first = await domain.addCallback(descriptor, () => {})
    const second = await domain.addCallback(descriptor, () => {})

    await first.unsubscribe()
    assert.deepStrictEqual(bidi.unsubscribeCalls, [])

    await second.unsubscribe()
    assert.deepStrictEqual(bidi.unsubscribeCalls, ['test.entryAdded'])
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

  it('does not disturb another still-active listener on the same event', async function () {
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

  it('prunes its internal per-method subscription queue entry once idle', async function () {
    // queueSubscriptionChange()'s per-method Map has no other seam to observe from
    // outside the module, so temporarily watch Map.prototype.delete rather than
    // exporting a test-only hook into the shipped module.
    const bidi = fakeBidi()
    const domain = new Domain(bidi, DOMAIN_TOKEN)
    const descriptor = event('test.untyped')

    const originalDelete = Map.prototype.delete
    const deletedKeys = []
    Map.prototype.delete = function (key) {
      deletedKeys.push(key)
      return originalDelete.call(this, key)
    }
    try {
      const subscription = await domain.addCallback(descriptor, () => {})
      await subscription.unsubscribe()
      await tick() // let the queued promise's own .finally() pruning run
    } finally {
      Map.prototype.delete = originalDelete
    }

    assert.ok(deletedKeys.includes('test.untyped'))
  })

  describe('concurrency', function () {
    it('does not miss an event that arrives while subscribe() is still pending', async function () {
      const bidi = controllableFakeBidi()
      const domain = new Domain(bidi, DOMAIN_TOKEN)
      const descriptor = event('test.untyped')
      const received = []

      const addP = domain.addCallback(descriptor, (params) => received.push(params))
      await tick() // let addCallback reach its (still-pending) subscribe() call
      assert.strictEqual(bidi.subscribeCalls.length, 1)

      bidi.emit('test.untyped', { anything: 'goes' }) // must already be listening, not just subscribing
      bidi.resolveNextSubscribe()
      await addP

      assert.strictEqual(received.length, 1)
    })

    it('removes the listener if subscribe() rejects, instead of leaking it', async function () {
      const bidi = controllableFakeBidi()
      const domain = new Domain(bidi, DOMAIN_TOKEN)
      const descriptor = event('test.untyped')

      const addP = domain.addCallback(descriptor, () => {})
      await tick()
      bidi.rejectNextSubscribe(new Error('boom'))

      await assert.rejects(addP, /boom/)
      assert.strictEqual(bidi.listenerCount('test.untyped'), 0)
    })

    it('serializes concurrent addCallback calls for the same event so only one subscribe is sent', async function () {
      const bidi = controllableFakeBidi()
      const domain = new Domain(bidi, DOMAIN_TOKEN)
      const descriptor = event('test.untyped')

      const first = domain.addCallback(descriptor, () => {})
      const second = domain.addCallback(descriptor, () => {})
      await tick()

      // The second call must not have started (and raced its own listenerCount
      // check) before the first's subscribe() — still pending — resolves.
      assert.strictEqual(bidi.subscribeCalls.length, 1)
      assert.strictEqual(bidi.listenerCount('test.untyped'), 1)

      bidi.resolveNextSubscribe()
      await first
      await second

      assert.strictEqual(bidi.subscribeCalls.length, 1)
      assert.strictEqual(bidi.listenerCount('test.untyped'), 2)
    })

    it('serializes an unsubscribe against a concurrent addCallback for the same event', async function () {
      const bidi = controllableFakeBidi()
      const domain = new Domain(bidi, DOMAIN_TOKEN)
      const descriptor = event('test.untyped')

      const first = domain.addCallback(descriptor, () => {})
      await tick()
      bidi.resolveNextSubscribe()
      const subscription = await first
      bidi.subscribeCalls.length = 0 // only the part under test matters from here

      // Start unsubscribing the only listener, then — before that finishes — start
      // a second addCallback for the same event. Unserialized, the second caller
      // could attach and see itself as remotely subscribed while the in-flight
      // unsubscribe() is still telling the browser to stop sending the event,
      // leaving it un-subscribed remotely despite a live local listener.
      const unsubP = subscription.unsubscribe()
      const secondP = domain.addCallback(descriptor, () => {})
      await tick()

      assert.strictEqual(bidi.unsubscribeCalls.length, 1) // unsubscribe() is in flight...
      assert.strictEqual(bidi.subscribeCalls.length, 0) // ...and the second caller hasn't jumped ahead of it

      bidi.resolveNextUnsubscribe()
      await unsubP
      await tick()
      bidi.resolveNextSubscribe()
      await secondP

      assert.strictEqual(bidi.unsubscribeCalls.length, 1)
      assert.strictEqual(bidi.subscribeCalls.length, 1) // re-subscribed only after unsubscribe() had finished
      assert.strictEqual(bidi.listenerCount('test.untyped'), 1)
    })
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
