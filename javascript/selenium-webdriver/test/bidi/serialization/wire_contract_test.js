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

// One describe block per behavioral guarantee this layer makes about a value
// crossing the wire — how it's represented, what's enforced sending it out, what's
// enforced receiving it back. record_test.js/union_test.js cover the serialization
// primitives more exhaustively; this file exists to walk each guarantee in
// isolation, one realistic fixture at a time, rather than to avoid overlap with them.

const assert = require('node:assert')
const { defineRecord, ValidationError } = require('selenium-webdriver/bidi/serialization/record')
const { defineEnum } = require('selenium-webdriver/bidi/serialization/enum')
const { Domain, DOMAIN_TOKEN } = require('selenium-webdriver/bidi/domain')

defineEnum('test.contract.InterceptPhase', ['beforeRequestSent', 'responseStarted'])

// Mirrors network.BeforeRequestSentParameters' shape closely enough to exercise every
// structural/vocabulary case that must be rejected: a nullable ref, a non-nullable
// primitive, an integer, a list, an enum, and a nullable const.
const RecordFixture = defineRecord('test.contract.Record', [
  { name: 'context', wire: 'context', required: true, type: { ref: 'test.contract.BrowsingContext', nullable: true } },
  { name: 'isBlocking', wire: 'isBlocking', required: true, type: { primitive: 'boolean' } },
  { name: 'timestamp', wire: 'timestamp', required: true, type: { primitive: 'integer' } },
  { name: 'headers', wire: 'headers', required: false, type: { list: { primitive: 'string' } } },
  { name: 'phase', wire: 'phase', required: false, type: { ref: 'test.contract.InterceptPhase' } },
  { name: 'proxyType', wire: 'proxyType', required: false, type: { const: 'autodetect', nullable: true } },
])

const ExtensibleFixture = defineRecord(
  'test.contract.Extensible',
  [{ name: 'acceptInsecureCerts', wire: 'acceptInsecureCerts', required: false, type: { primitive: 'boolean' } }],
  { extensible: true },
)

// Never constructed outbound anywhere in this file — stands in for a received-only
// extensible type (e.g. a result type no command ever takes as params). Undeclared-field
// retention applies to every extensible type, not just ones a caller can also send.
const ReceivedOnlyExtensibleFixture = defineRecord(
  'test.contract.ReceivedOnlyExtensible',
  [{ name: 'realm', wire: 'realm', required: true, type: { primitive: 'string' } }],
  { extensible: true },
)

async function captureWarnings(fn) {
  const warnings = []
  const onWarning = (w) => warnings.push(w.message)
  process.on('warning', onWarning)
  try {
    return { result: await fn(), warnings: await settle(warnings) }
  } finally {
    process.off('warning', onWarning)
  }
}
function settle(warnings) {
  return new Promise((resolve) => setTimeout(() => resolve(warnings), 20))
}

describe('wire contract — representation', function () {
  describe('typed objects, not raw maps', function () {
    it('a record is a real typed instance, not a plain object', function () {
      const parsed = RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1 })
      assert.ok(parsed instanceof RecordFixture)
    })

    it('a non-extensible type has no map for undeclared fields — an extra key is rejected outbound', function () {
      assert.throws(
        () => new RecordFixture({ context: null, isBlocking: true, timestamp: 1, vendorFlag: true }),
        ValidationError,
      )
    })

    it('an extensible type carries undeclared fields directly on the instance', function () {
      const built = new ExtensibleFixture({ acceptInsecureCerts: true, 'vendor:flag': 'x' })
      assert.strictEqual(built['vendor:flag'], 'x')
    })

    it('a key the type declares can never be treated as an extra, even alongside it', function () {
      const built = new ExtensibleFixture({ acceptInsecureCerts: true })
      assert.strictEqual(built.acceptInsecureCerts, true)
      assert.strictEqual(Object.keys(built).includes('acceptInsecureCerts'), true)
    })
  })

  describe("mirror the spec's command and field names", function () {
    // The wire key (what the spec/generator uses verbatim) and the JS-facing property
    // name are deliberately separate slots in a FieldSpec — this is the mechanism that
    // lets the generator mirror the spec's own key precisely, independent of whatever
    // the language-idiomatic property name happens to be (for BiDi/JS these are the same
    // string in practice, since BiDi's wire format is already camelCase).
    const NameMirror = defineRecord('test.contract.NameMirror', [
      { name: 'jsPropertyName', wire: 'specWireKey', required: true, type: { primitive: 'string' } },
    ])

    it('reads from the literal wire key, not the JS property name', function () {
      const parsed = NameMirror.fromWire({ specWireKey: 'hello' })
      assert.strictEqual(parsed.jsPropertyName, 'hello')
      assert.strictEqual(Object.hasOwn(parsed, 'specWireKey'), false)
    })

    it('writes to the literal wire key, not the JS property name, when serialized', function () {
      const built = new NameMirror({ specWireKey: 'hello' })
      assert.strictEqual(JSON.stringify(built), JSON.stringify({ specWireKey: 'hello' }))
      // The instance itself is still JS-facing — only its wire representation changes.
      assert.strictEqual(built.jsPropertyName, 'hello')
    })
  })

  describe("preserve a numeric value's full range and precision", function () {
    it('does not narrow or lose precision at the js-uint/js-int boundary', function () {
      const parsed = RecordFixture.fromWire({
        context: null,
        isBlocking: true,
        timestamp: Number.MAX_SAFE_INTEGER,
      })
      assert.strictEqual(parsed.timestamp, Number.MAX_SAFE_INTEGER)
    })
  })

  describe('hold a value strictly to its declared type', function () {
    it('structural: null in a non-nullable field is invalid', function () {
      assert.throws(() => RecordFixture.fromWire({ context: null, isBlocking: null, timestamp: 1 }), ValidationError)
    })

    it('structural: an incorrect primitive type is invalid', function () {
      assert.throws(() => RecordFixture.fromWire({ context: null, isBlocking: 'yes', timestamp: 1 }), ValidationError)
    })

    it('structural: a fractional value where integer is declared is invalid', function () {
      assert.throws(() => RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1.5 }), ValidationError)
    })

    it('structural: a cardinality mismatch (single value where a list is declared) is invalid', function () {
      assert.throws(
        () => RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1, headers: 'not-a-list' }),
        ValidationError,
      )
    })

    it('vocabulary: an enum value outside its defined set is invalid', function () {
      assert.throws(
        () => RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1, phase: 'notARealPhase' }),
        ValidationError,
      )
    })

    it('vocabulary: a nullable constant set to anything other than its literal or null is invalid', function () {
      assert.throws(
        () => RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1, proxyType: 'manual' }),
        ValidationError,
      )
      // ...but the literal and null are both fine.
      assert.doesNotThrow(() =>
        RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1, proxyType: 'autodetect' }),
      )
      assert.doesNotThrow(() =>
        RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1, proxyType: null }),
      )
    })
  })
})

describe('wire contract — outbound', function () {
  describe('reject an invalid or missing value', function () {
    it('rejects a missing required field', function () {
      assert.throws(() => new RecordFixture({ context: null, timestamp: 1 }), ValidationError)
    })

    it('rejects an invalid value the same way inbound does', function () {
      assert.throws(() => new RecordFixture({ context: null, isBlocking: true, timestamp: 1.5 }), ValidationError)
    })
  })

  describe('send an extra field only on an extensible type', function () {
    it('a non-extensible type cannot represent an extra field outbound', function () {
      assert.throws(
        () => new RecordFixture({ context: null, isBlocking: true, timestamp: 1, vendorFlag: true }),
        ValidationError,
      )
    })

    it('an extensible type serializes the extra field', function () {
      const built = new ExtensibleFixture({ 'vendor:flag': true })
      assert.strictEqual(built['vendor:flag'], true)
    })
  })
})

describe('wire contract — inbound', function () {
  describe('reject an invalid value', function () {
    it('a present-but-invalid value always errors, never falls back to a placeholder', function () {
      assert.throws(
        () => RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1, headers: 'nope' }),
        ValidationError,
      )
    })
  })

  describe('a missing required field', function () {
    it('rejects a missing required field, same as a present-but-invalid one', function () {
      assert.throws(() => RecordFixture.fromWire({ context: null, timestamp: 1 }), ValidationError)
    })
  })

  describe('tolerate an undeclared field', function () {
    it('an extensible type retains it silently — no warning on the preserved path', async function () {
      const { result: parsed, warnings } = await captureWarnings(() =>
        ExtensibleFixture.fromWire({ 'vendor:flag': 'x' }),
      )
      assert.strictEqual(parsed['vendor:flag'], 'x')
      assert.ok(warnings.every((m) => !m.includes('vendor:flag')))
    })

    it('a non-extensible type drops it and warns — the warning belongs to the drop', async function () {
      const { result: parsed, warnings } = await captureWarnings(() =>
        RecordFixture.fromWire({ context: null, isBlocking: true, timestamp: 1, vendorFlag: 'x' }),
      )
      assert.strictEqual(parsed.vendorFlag, undefined)
      assert.ok(warnings.some((m) => m.includes('vendorFlag')))
    })

    // Previously a known gap: the generator only retained extras on an extensible type
    // that was also "re-sendable" (reachable from a command's params) — an unnecessarily
    // narrow criterion. Closed once project_bidi_schema.mjs (#17864) stopped computing
    // that heuristic and started deriving clean inbound/outbound reachability instead —
    // retention now follows `extensible` alone, with no narrower criterion, for every
    // type including one never sent as a command's params.
    it('a received-only extensible type retains it too — no narrower criterion than "extensible"', async function () {
      const { result: parsed, warnings } = await captureWarnings(() =>
        ReceivedOnlyExtensibleFixture.fromWire({ realm: 'realm-1', 'vendor:flag': 'x' }),
      )
      assert.strictEqual(parsed['vendor:flag'], 'x')
      assert.ok(warnings.every((m) => !m.includes('vendor:flag')))
    })
  })

  describe('preserve received values faithfully', function () {
    it('does not truncate, round, or re-case a value', async function () {
      const { result: parsed } = await captureWarnings(() =>
        RecordFixture.fromWire({
          context: null,
          isBlocking: true,
          timestamp: 1732000000123,
          headers: ['X-Custom-Header', 'Another-One'],
        }),
      )
      assert.strictEqual(parsed.timestamp, 1732000000123)
      assert.deepStrictEqual(parsed.headers, ['X-Custom-Header', 'Another-One'])
    })
  })
})

describe('wire contract — error responses are processed before payload validation', function () {
  it('surfaces the remote error without ever reaching payload validation', async function () {
    const fakeBidi = { send: async () => ({ error: 'unknown command', message: 'not implemented' }) }
    const domain = new Domain(fakeBidi, DOMAIN_TOKEN)
    await assert.rejects(domain.send('network.addIntercept', {}), /unknown command: not implemented/)
  })
})
