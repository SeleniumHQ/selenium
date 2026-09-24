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

  describe('null primitive validation', function () {
    // project_bidi_schema.mjs's projectRef() emits { primitive: 'null' } for a field
    // whose every alternative was null (e.g. a discriminator-like field typed as bare
    // CDDL `null`) — a real, intentional type, distinct from `nullable` on some other
    // primitive. Only `null` itself is a valid value for it.
    const NullField = defineRecord('test.record.NullField', [
      { name: 'value', wire: 'value', required: true, type: { primitive: 'null' } },
    ])

    it('accepts null outbound and inbound', function () {
      assert.strictEqual(new NullField({ value: null }).value, null)
      assert.strictEqual(NullField.fromWire({ value: null }).value, null)
    })

    it('rejects any non-null value outbound', function () {
      for (const bad of ['x', 42, true, {}]) {
        assert.throws(() => new NullField({ value: bad }), ValidationError)
      }
    })

    it('rejects any non-null value inbound', function () {
      for (const bad of ['x', 42, true, {}]) {
        assert.throws(() => NullField.fromWire({ value: bad }), ValidationError)
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

    it('serializes a "__proto__" extra as data, not as the wire object\'s own prototype', function () {
      const raw = '{"proxyType":"autodetect","__proto__":{"pwned":true}}'
      const built = new ExtensibleParams(JSON.parse(raw))
      const wire = JSON.parse(JSON.stringify(built))
      assert.strictEqual(wire.proxyType, 'autodetect')
      assert.strictEqual(Object.getPrototypeOf(wire), Object.prototype) // real prototype unaffected
      assert.deepStrictEqual(wire.__proto__, { pwned: true }) // preserved as data, not applied as a prototype
    })
  })

  describe('map values', function () {
    const MapField = defineRecord('test.record.MapField', [
      { name: 'headers', wire: 'headers', required: true, type: { map: { primitive: 'string' } } },
    ])

    // CWE-1321: `result[key] = ...` with a wire-controlled key would hijack a plain
    // `{}`'s prototype for a literal "__proto__" key; Object.create(null) has no such trap.
    it('does not let a "__proto__" key hijack a validated map value inbound', function () {
      const raw = '{"headers":{"__proto__":"pwned"}}'
      const parsed = MapField.fromWire(JSON.parse(raw))
      assert.strictEqual(Object.getPrototypeOf(parsed.headers), null)
      assert.strictEqual(Object.getOwnPropertyDescriptor(parsed.headers, '__proto__').value, 'pwned')
    })

    it('does not let a "__proto__" key hijack a validated map value outbound', function () {
      const raw = '{"headers":{"__proto__":"pwned"}}'
      const built = new MapField(JSON.parse(raw))
      assert.strictEqual(Object.getPrototypeOf(built.headers), null)
      assert.strictEqual(Object.getOwnPropertyDescriptor(built.headers, '__proto__').value, 'pwned')
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

    it('assigns the constructed nested record instance outbound too, not the raw object', function () {
      const rawInner = { value: 'x' }
      const built = new OuterRecord({ inner: rawInner })
      assert.ok(built.inner instanceof InnerRecord)
      assert.notStrictEqual(built.inner, rawInner) // a fresh, validated instance — not the caller's own object
      assert.strictEqual(built.inner.value, 'x')
    })

    it('still validates a nested ref outbound', function () {
      assert.throws(() => new OuterRecord({ inner: { value: 42 } }), ValidationError)
    })
  })

  describe('outbound field names vs wire keys', function () {
    // Mirrors a real mismatch in the schema (emulation.MediaFeatures.prefersColorScheme
    // <-> wire key 'prefers-color-scheme') — the JS-facing name a caller actually types,
    // matching the generated TS interface, differs from the spec's own wire key.
    const MediaFeature = defineRecord('test.record.MediaFeature', [
      { name: 'prefersColorScheme', wire: 'prefers-color-scheme', required: true, type: { primitive: 'string' } },
    ])
    const SetMediaFeaturesParameters = defineRecord('test.record.SetMediaFeaturesParameters', [
      { name: 'features', wire: 'features', required: true, type: { ref: 'test.record.MediaFeature' } },
    ])

    it('reads outbound data by JS-facing field name, not the wire key', function () {
      const built = new MediaFeature({ prefersColorScheme: 'dark' })
      assert.strictEqual(built.prefersColorScheme, 'dark')
    })

    it('rejects data keyed by the wire name instead of the JS-facing name outbound', function () {
      assert.throws(() => new MediaFeature({ 'prefers-color-scheme': 'dark' }), ValidationError)
    })

    it('serializes an outbound instance using the declared wire key, not the JS-facing name', function () {
      const built = new MediaFeature({ prefersColorScheme: 'dark' })
      assert.deepStrictEqual(JSON.parse(JSON.stringify(built)), { 'prefers-color-scheme': 'dark' })
    })

    it('cascades wire-key conversion into a nested record outbound too', function () {
      const built = new SetMediaFeaturesParameters({ features: { prefersColorScheme: 'dark' } })
      assert.ok(built.features instanceof MediaFeature)
      assert.deepStrictEqual(JSON.parse(JSON.stringify(built)), { features: { 'prefers-color-scheme': 'dark' } })
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

  describe('named enum values: numeric and boolean', function () {
    // Real schema fixture: emulation.MediaFeaturesGrid — CSS's `grid` media feature
    // is spec'd as the integer 0 or 1, not a string (see enum.d.ts/enum.js/record.d.ts,
    // widened from `T extends string` to `T extends string | number | boolean`).
    defineEnum('test.record.MediaFeaturesGrid', [0, 1])
    const SetMediaFeaturesGridParameters = defineRecord('test.record.SetMediaFeaturesGridParameters', [
      { name: 'grid', wire: 'grid', required: true, type: { ref: 'test.record.MediaFeaturesGrid' } },
    ])

    it('accepts a value in a numeric enum outbound', function () {
      const built = new SetMediaFeaturesGridParameters({ grid: 1 })
      assert.strictEqual(built.grid, 1)
    })

    it('rejects a value outside a numeric enum outbound', function () {
      assert.throws(() => new SetMediaFeaturesGridParameters({ grid: 2 }), ValidationError)
    })

    it('accepts a value in a numeric enum inbound', function () {
      const parsed = SetMediaFeaturesGridParameters.fromWire({ grid: 0 })
      assert.strictEqual(parsed.grid, 0)
    })

    it('rejects a value outside a numeric enum inbound', function () {
      assert.throws(() => SetMediaFeaturesGridParameters.fromWire({ grid: 7 }), ValidationError)
    })

    // No real schema type is boolean-valued today, but project_bidi_schema.mjs's
    // literalPrimitive() explicitly recognizes a boolean-literal choice the same way
    // it recognizes a numeric one — this exercises that the runtime path (Set.has(),
    // Array.includes() — type-agnostic either way) actually holds for booleans too,
    // not just that the .d.ts widening compiles (verified separately, see PR notes).
    defineEnum('test.record.BoolChoice', [true, false])
    const BoolChoiceParameters = defineRecord('test.record.BoolChoiceParameters', [
      { name: 'choice', wire: 'choice', required: true, type: { ref: 'test.record.BoolChoice' } },
    ])

    it('accepts a value in a boolean enum outbound', function () {
      const built = new BoolChoiceParameters({ choice: true })
      assert.strictEqual(built.choice, true)
    })

    it('rejects a non-boolean value against a boolean enum outbound', function () {
      assert.throws(() => new BoolChoiceParameters({ choice: 'true' }), ValidationError)
    })

    it('accepts a value in a boolean enum inbound', function () {
      const parsed = BoolChoiceParameters.fromWire({ choice: false })
      assert.strictEqual(parsed.choice, false)
    })
  })
})
