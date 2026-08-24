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
const { defineRecord, defineAlias, ValidationError } = require('selenium-webdriver/bidi/serialization/record')

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

// network.Intercept aliases a plain string — a name with no fields of its own,
// just a pointer to another type node. A ref to it should validate through
// whatever it points at.
defineAlias('test.record.Intercept', { primitive: 'string' })

const RemoveInterceptParameters = defineRecord('test.record.RemoveInterceptParameters', [
  { name: 'intercept', wire: 'intercept', required: true, type: { ref: 'test.record.Intercept' } },
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

    it('rejects NaN and Infinity outbound', function () {
      for (const bad of [NaN, Infinity, -Infinity]) {
        assert.throws(
          () => new BeforeRequestSentParameters({ context: null, isBlocked: true, timestamp: bad }),
          ValidationError,
        )
      }
    })

    it('rejects NaN and Infinity inbound', function () {
      for (const bad of [NaN, Infinity, -Infinity]) {
        assert.throws(
          () => BeforeRequestSentParameters.fromWire({ context: null, isBlocked: true, timestamp: bad }),
          ValidationError,
        )
      }
    })
  })

  describe('number validation', function () {
    const NumberField = defineRecord('test.record.NumberField', [
      { name: 'value', wire: 'value', required: true, type: { primitive: 'number' } },
    ])

    it('accepts a fractional value, unlike integer', function () {
      const built = new NumberField({ value: 1.5 })
      assert.strictEqual(built.value, 1.5)
    })

    it('rejects NaN and Infinity outbound', function () {
      for (const bad of [NaN, Infinity, -Infinity]) {
        assert.throws(() => new NumberField({ value: bad }), ValidationError)
      }
    })

    it('rejects NaN and Infinity inbound', function () {
      for (const bad of [NaN, Infinity, -Infinity]) {
        assert.throws(() => NumberField.fromWire({ value: bad }), ValidationError)
      }
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

  describe('defineAlias', function () {
    it('accepts, through a record field, a value matching the aliased type', function () {
      const params = new RemoveInterceptParameters({ intercept: 'intercept-1' })
      assert.strictEqual(params.intercept, 'intercept-1')
    })

    it('rejects, through a record field, a value not matching the aliased type', function () {
      assert.throws(() => new RemoveInterceptParameters({ intercept: 42 }), ValidationError)
    })

    it('validates the same way inbound', function () {
      const parsed = RemoveInterceptParameters.fromWire({ intercept: 'intercept-1' })
      assert.strictEqual(parsed.intercept, 'intercept-1')
      assert.throws(() => RemoveInterceptParameters.fromWire({ intercept: 42 }), ValidationError)
    })
  })

  describe('inline type nodes', function () {
    // project_bidi_schema.mjs's enumNode() emits both `primitive` and `enum` on an
    // inline literal choice the normalizer didn't hoist to a named enum.
    const InlineEnumField = defineRecord('test.record.InlineEnumField', [
      {
        name: 'phase',
        wire: 'phase',
        required: true,
        type: { primitive: 'string', enum: ['beforeRequestSent', 'responseStarted'] },
      },
    ])

    it('enforces the closed vocabulary of an inline enum, not just its shared primitive', function () {
      assert.throws(() => new InlineEnumField({ phase: 'notARealPhase' }), ValidationError)
      assert.doesNotThrow(() => new InlineEnumField({ phase: 'beforeRequestSent' }))
    })

    const InlineRecordField = defineRecord('test.record.InlineRecordField', [
      {
        name: 'origin',
        wire: 'origin',
        required: true,
        type: {
          record: [
            { name: 'host', wire: 'host', required: true, type: { primitive: 'string' } },
            { name: 'port', wire: 'port', required: false, type: { primitive: 'integer' } },
          ],
        },
      },
    ])

    it('validates an inline record field the same way a named record is validated', function () {
      const built = new InlineRecordField({ origin: { host: 'example.com', port: 443 } })
      assert.deepStrictEqual(built.origin, { host: 'example.com', port: 443 })
    })

    it('rejects a missing required field inside an inline record', function () {
      assert.throws(() => new InlineRecordField({ origin: { port: 443 } }), ValidationError)
    })

    it('rejects an unknown property inside an inline record outbound', function () {
      assert.throws(() => new InlineRecordField({ origin: { host: 'x', bogus: true } }), ValidationError)
    })

    it('warns (not throws) on an unknown property inside an inline record inbound', async function () {
      const warnings = []
      const onWarning = (w) => warnings.push(w.message)
      process.on('warning', onWarning)
      const parsed = InlineRecordField.fromWire({ origin: { host: 'x', bogus: true } })
      await new Promise((resolve) => setTimeout(resolve, 20))
      process.off('warning', onWarning)
      assert.strictEqual(parsed.origin.bogus, undefined)
      assert.ok(warnings.some((m) => m.includes('bogus')))
    })
  })

  describe('nested ref parsing', function () {
    const InnerRecord = defineRecord('test.record.InnerRecord', [
      { name: 'value', wire: 'value', required: true, type: { primitive: 'string' } },
    ])
    const OuterRecord = defineRecord('test.record.OuterRecord', [
      { name: 'inner', wire: 'inner', required: true, type: { ref: 'test.record.InnerRecord' } },
    ])

    it('assigns the parsed nested record instance inbound, not the raw wire object', function () {
      const parsed = OuterRecord.fromWire({ inner: { value: 'x' } })
      assert.ok(parsed.inner instanceof InnerRecord)
      assert.strictEqual(parsed.inner.value, 'x')
    })

    it('keeps the caller-provided value outbound, not a newly constructed instance', function () {
      const rawInner = { value: 'x' }
      const built = new OuterRecord({ inner: rawInner })
      assert.strictEqual(built.inner, rawInner) // same reference — outbound behavior preserved
      assert.ok(!(built.inner instanceof InnerRecord))
    })

    it('still validates a nested ref outbound even though the raw value is kept', function () {
      assert.throws(() => new OuterRecord({ inner: { value: 42 } }), ValidationError)
    })
  })

  describe('deep immutability', function () {
    it('freezes a validated list so it cannot be mutated after construction', function () {
      const params = new AddInterceptParameters({ phases: ['beforeRequestSent'] })
      assert.ok(Object.isFrozen(params.phases))
      assert.throws(() => params.phases.push('responseStarted'), TypeError)
    })

    it('freezes a validated list parsed inbound too', function () {
      const parsed = AddInterceptParameters.fromWire({ phases: ['beforeRequestSent'] })
      assert.ok(Object.isFrozen(parsed.phases))
    })
  })
})
