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
const { defineEnum } = require('selenium-webdriver/bidi/serialization/enum')
const { defineRecord, ValidationError } = require('selenium-webdriver/bidi/serialization/record')

// Real fixtures from the WebDriver BiDi schema (network.InterceptPhase,
// network.AddInterceptParameters, network.BeforeRequestSentParameters),
// inlined so this test doesn't depend on generating bidi_schema.json.
defineEnum('test.record.InterceptPhase', ['beforeRequestSent', 'responseStarted', 'authRequired'])

const AddInterceptParameters = defineRecord('test.record.AddInterceptParameters', [
  { name: 'phases', wire: 'phases', required: true, type: { list: { ref: 'test.record.InterceptPhase' } } },
  { name: 'urlPatterns', wire: 'urlPatterns', required: false, type: { list: { primitive: 'string' } } },
])

const BeforeRequestSentParameters = defineRecord('test.record.BeforeRequestSentParameters', [
  {
    name: 'context',
    wire: 'context',
    required: true,
    type: { ref: 'browsingContext.BrowsingContext', nullable: true },
  },
  { name: 'isBlocked', wire: 'isBlocked', required: true, type: { primitive: 'boolean' } },
  { name: 'timestamp', wire: 'timestamp', required: true, type: { primitive: 'integer' } },
])

describe('serialization/record', function () {
  describe('outbound (constructor)', function () {
    it('accepts a valid object', function () {
      const params = new AddInterceptParameters({ phases: ['beforeRequestSent'] })
      assert.deepStrictEqual(params.phases, ['beforeRequestSent'])
    })

    it('rejects an undefined enum value', function () {
      assert.throws(() => new AddInterceptParameters({ phases: ['notARealPhase'] }), ValidationError)
    })

    it('lists the valid values in the error message', function () {
      assert.throws(
        () => new AddInterceptParameters({ phases: ['notARealPhase'] }),
        (err) => {
          assert.ok(err.message.includes('beforeRequestSent'), err.message)
          assert.ok(err.message.includes('responseStarted'), err.message)
          assert.ok(err.message.includes('authRequired'), err.message)
          return true
        },
      )
    })

    it('rejects a missing required field', function () {
      assert.throws(() => new AddInterceptParameters({}), ValidationError)
    })

    it('rejects an unknown property on a non-extensible type', function () {
      assert.throws(() => new AddInterceptParameters({ phases: ['beforeRequestSent'], bogus: 'x' }), ValidationError)
    })

    it('produces an immutable instance', function () {
      const params = new AddInterceptParameters({ phases: ['beforeRequestSent'] })
      assert.throws(() => {
        params.phases = []
      })
    })
  })

  describe('inbound (fromWire)', function () {
    let warnings

    beforeEach(function () {
      warnings = []
      process.on('warning', onWarning)
    })

    afterEach(function () {
      process.off('warning', onWarning)
    })

    function onWarning(w) {
      warnings.push(w.message)
    }

    it('accepts an explicit null for a required+nullable field', function () {
      const parsed = BeforeRequestSentParameters.fromWire({ context: null, isBlocked: true, timestamp: 1 })
      assert.strictEqual(parsed.context, null)
    })

    it('throws when a required field is missing', function () {
      assert.throws(() => BeforeRequestSentParameters.fromWire({ context: null, timestamp: 1 }), ValidationError)
    })

    it('throws when a required, non-nullable field is explicitly null (corruption, not absence)', function () {
      assert.throws(
        () => BeforeRequestSentParameters.fromWire({ context: null, isBlocked: null, timestamp: 1 }),
        ValidationError,
      )
    })

    it('warns (not throws) on an undeclared property', async function () {
      BeforeRequestSentParameters.fromWire({ context: null, isBlocked: true, timestamp: 1, vendorAttr: 'x' })
      await new Promise((resolve) => setTimeout(resolve, 20))
      assert.ok(warnings.some((m) => m.includes('vendorAttr')))
    })

    it('rejects a non-object payload', function () {
      assert.throws(() => BeforeRequestSentParameters.fromWire('not an object'), ValidationError)
    })
  })

  describe('integer validation', function () {
    it('accepts a whole number outbound', function () {
      const params = new BeforeRequestSentParameters({ context: null, isBlocked: true, timestamp: 2.0 })
      assert.strictEqual(params.timestamp, 2)
    })

    it('rejects a fractional value outbound', function () {
      assert.throws(
        () => new BeforeRequestSentParameters({ context: null, isBlocked: true, timestamp: 1.5 }),
        ValidationError,
      )
    })

    it('rejects a fractional value inbound', function () {
      assert.throws(
        () => BeforeRequestSentParameters.fromWire({ context: null, isBlocked: true, timestamp: 1.5 }),
        ValidationError,
      )
    })
  })

  describe('extensible types', function () {
    const ExtensibleParams = defineRecord(
      'test.record.ExtensibleParams',
      [{ name: 'proxyType', wire: 'proxyType', required: true, type: { const: 'autodetect' } }],
      { extensible: true },
    )

    it('lets outbound vendor extras reach the wire', function () {
      const params = new ExtensibleParams({ proxyType: 'autodetect', 'vendor:flag': true })
      assert.strictEqual(params['vendor:flag'], true)
    })

    it('retains an inbound undeclared property silently — every extensible type does', async function () {
      const warnings = []
      const onWarning = (w) => warnings.push(w.message)
      process.on('warning', onWarning)
      const parsed = ExtensibleParams.fromWire({ proxyType: 'autodetect', 'vendor:flag': 'x' })
      await new Promise((resolve) => setTimeout(resolve, 20))
      process.off('warning', onWarning)
      assert.strictEqual(parsed['vendor:flag'], 'x')
      assert.ok(warnings.every((m) => !m.includes('vendor:flag')))
    })

    // CWE-1321: a literal "__proto__" key is a real, iterable own property once
    // JSON.parse builds an object from wire text — but assigning through it with
    // `instance[key] = value` invokes Object.prototype's __proto__ accessor and
    // hijacks the instance's actual prototype instead of storing a field.
    it('does not let a "__proto__" wire key hijack the parsed instance inbound', function () {
      const raw = '{"proxyType":"autodetect","__proto__":{"pwned":true}}'
      const parsed = ExtensibleParams.fromWire(JSON.parse(raw))
      assert.strictEqual(Object.getPrototypeOf(parsed), ExtensibleParams.prototype)
      assert.ok(parsed instanceof ExtensibleParams)
      assert.deepStrictEqual(parsed.__proto__, { pwned: true }) // preserved as data, not applied as a prototype
    })

    it('does not let a "__proto__" key hijack the constructed instance outbound', function () {
      const raw = '{"proxyType":"autodetect","__proto__":{"pwned":true}}'
      const built = new ExtensibleParams(JSON.parse(raw))
      assert.strictEqual(Object.getPrototypeOf(built), ExtensibleParams.prototype)
      assert.ok(built instanceof ExtensibleParams)
      assert.deepStrictEqual(built.__proto__, { pwned: true })
    })
  })
})
