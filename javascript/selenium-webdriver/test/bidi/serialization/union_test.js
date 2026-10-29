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
const { defineRecord, ValidationError } = require('selenium-webdriver/bidi/serialization/record')
const { defineUnion } = require('selenium-webdriver/bidi/serialization/union')

// Real fixtures: session.ProxyConfiguration (discriminated by `proxyType`) and
// script.RemoteReference (structural, presence-based — no shared discriminator).
const AutodetectProxyConfiguration = defineRecord(
  'test.union.AutodetectProxyConfiguration',
  [{ name: 'proxyType', wire: 'proxyType', required: true, type: { const: 'autodetect' } }],
  { extensible: true },
)
const ManualProxyConfiguration = defineRecord(
  'test.union.ManualProxyConfiguration',
  [
    { name: 'proxyType', wire: 'proxyType', required: true, type: { const: 'manual' } },
    { name: 'socksProxy', wire: 'socksProxy', required: true, type: { primitive: 'string' } },
  ],
  { extensible: true },
)
const ProxyConfiguration = defineUnion(
  'test.union.ProxyConfiguration',
  {
    by: 'proxyType',
    variants: [
      { value: 'autodetect', ref: 'test.union.AutodetectProxyConfiguration' },
      { value: 'manual', ref: 'test.union.ManualProxyConfiguration' },
    ],
  },
  { objectOnly: true },
)

const SharedReference = defineRecord('test.union.SharedReference', [
  { name: 'sharedId', wire: 'sharedId', required: true, type: { primitive: 'string' } },
])
const RemoteObjectReference = defineRecord('test.union.RemoteObjectReference', [
  { name: 'handle', wire: 'handle', required: true, type: { primitive: 'string' } },
])
const RemoteReference = defineUnion(
  'test.union.RemoteReference',
  {
    ordered: [
      { ref: 'test.union.SharedReference', requires: ['sharedId'] },
      { ref: 'test.union.RemoteObjectReference', requires: ['handle'] },
    ],
  },
  { objectOnly: true },
)

// A discriminated union whose `default` catch-all resolves to another union
// (RemoteReference, structural, above) rather than a record — mirrors
// script.LocalValue's untyped RemoteReference arm.
const NumberValue = defineRecord('test.union.NumberValue', [
  { name: 'type', wire: 'type', required: true, type: { const: 'number' } },
  { name: 'value', wire: 'value', required: true, type: { primitive: 'number' } },
])
const LocalValue = defineUnion(
  'test.union.LocalValue',
  {
    by: 'type',
    variants: [{ value: 'number', ref: 'test.union.NumberValue' }],
    default: 'test.union.RemoteReference',
  },
  { objectOnly: true },
)

describe('serialization/union', function () {
  describe('discriminated (selector.by)', function () {
    it('dispatches outbound to the variant matching the discriminator', function () {
      const manual = ProxyConfiguration.build({ proxyType: 'manual', socksProxy: 'localhost:9' })
      assert.ok(manual instanceof ManualProxyConfiguration)
      assert.strictEqual(manual.socksProxy, 'localhost:9')
    })

    it('rejects an outbound value with an unresolvable discriminator', function () {
      assert.throws(() => ProxyConfiguration.build({ proxyType: 'bogus' }), ValidationError)
    })

    it('dispatches inbound to the variant matching the discriminator', function () {
      const parsed = ProxyConfiguration.fromWire({ proxyType: 'manual', socksProxy: 'localhost:9' })
      assert.ok(parsed instanceof ManualProxyConfiguration)
    })

    it('errors (not warns) on an inbound payload whose discriminator matches no known variant', function () {
      assert.throws(() => ProxyConfiguration.fromWire({ proxyType: 'notARealType' }), ValidationError)
    })

    it('retains extras on an extensible variant silently', async function () {
      const warnings = []
      const onWarning = (w) => warnings.push(w.message)
      process.on('warning', onWarning)
      const parsed = ProxyConfiguration.fromWire({ proxyType: 'autodetect', 'vendor:flag': 'x' })
      await new Promise((resolve) => setTimeout(resolve, 20))
      process.off('warning', onWarning)
      assert.ok(parsed instanceof AutodetectProxyConfiguration)
      assert.strictEqual(parsed['vendor:flag'], 'x')
      assert.ok(warnings.every((m) => !m.includes('vendor:flag')))
    })
  })

  describe('structural (selector.ordered)', function () {
    it('dispatches to the first variant whose required keys are present', function () {
      const shared = RemoteReference.fromWire({ sharedId: 'abc' })
      assert.ok(shared instanceof SharedReference)
    })

    it('dispatches to a later variant when its required keys are present instead', function () {
      const remoteObj = RemoteReference.fromWire({ handle: 'h1' })
      assert.ok(remoteObj instanceof RemoteObjectReference)
    })

    it('errors when no variant matches', function () {
      assert.throws(() => RemoteReference.fromWire({ somethingElse: true }), ValidationError)
    })
  })

  describe('nested union (selector.default resolving to another union, not a record)', function () {
    it('still dispatches a tagged variant to its record normally', function () {
      const built = LocalValue.build({ type: 'number', value: 5 })
      assert.ok(built instanceof NumberValue)
    })

    it('dispatches outbound through the default sub-union instead of throwing', function () {
      const built = LocalValue.build({ sharedId: 'abc' })
      assert.ok(built instanceof SharedReference)
    })

    it('dispatches inbound through the default sub-union instead of throwing', function () {
      const parsed = LocalValue.fromWire({ handle: 'h1' })
      assert.ok(parsed instanceof RemoteObjectReference)
    })
  })
})
