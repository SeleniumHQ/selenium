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

// Unit tests for the BiDi AST normalizer transforms.
// Mocha test; `describe`/`it` are mocha globals (run via the Bazel mocha target).
import assert from 'node:assert/strict'
import {
  normalizeAst,
  hoistInlineEnums,
  canonicalizeVariantParams,
  dedupeDefs,
  flattenGroupComposition,
} from './normalize_bidi_ast.mjs'

const lit = (v) => ({ Type: 'literal', Value: v, Unwrapped: false })
const ref = (v) => ({ Type: 'group', Value: v, Unwrapped: false })
const field = (name, type) => ({ Name: name, Occurrence: { n: 1, m: 1 }, Type: type, Comments: [] })
const def = (name, props) => ({ Type: 'group', Name: name, Properties: props, IsChoiceAddition: false, Comments: [] })
const byName = (ast, n) => ast.find((d) => d.Name === n)

describe('hoistInlineEnums', () => {
  it('hoists a multi-literal field to a named enum and rewrites the field to a ref', () => {
    const ast = [def('net.SetCacheBehaviorParameters', [field('cacheBehavior', [lit('default'), lit('bypass')])])]
    const out = hoistInlineEnums(ast)

    const enumName = 'net.SetCacheBehaviorParametersCacheBehavior'
    assert.deepEqual(byName(out, 'net.SetCacheBehaviorParameters').Properties[0].Type, [ref(enumName)])
    const enumDef = byName(out, enumName)
    assert.equal(enumDef.Type, 'variable')
    assert.deepEqual(
      enumDef.PropertyType.map((e) => e.Value),
      ['default', 'bypass'],
    )
  })

  it('keeps hyphenated values verbatim (no case conversion)', () => {
    const ast = [def('x.T', [field('state', [lit('powered-off'), lit('subscribe-to-notifications')])])]
    const enumDef = byName(hoistInlineEnums(ast), 'x.TState')
    assert.deepEqual(
      enumDef.PropertyType.map((e) => e.Value),
      ['powered-off', 'subscribe-to-notifications'],
    )
  })

  it('does NOT hoist a single-literal (discriminator) field', () => {
    const ast = [def('x.T', [field('type', [lit('password')])])]
    const out = hoistInlineEnums(ast)
    assert.equal(out.length, 1) // no synthetic def
    assert.deepEqual(out[0].Properties[0].Type, [lit('password')])
  })

  it('leaves non-literal fields untouched', () => {
    const ast = [def('x.T', [field('request', [ref('x.Request')])])]
    assert.deepEqual(hoistInlineEnums(ast), ast)
  })
})

describe('canonicalizeVariantParams', () => {
  it('converts a record-with-inline-choice into a union of self-contained variant records', () => {
    const ast = [
      def('net.ContinueWithAuthParameters', [
        field('request', [ref('net.Request')]),
        field('', {
          Type: 'group',
          Name: '',
          Properties: [[field('', ref('net.Creds'))], field('', [ref('net.NoCreds')])],
        }),
      ]),
      def('net.Creds', [
        field('action', [lit('provideCredentials')]),
        field('credentials', [ref('net.AuthCredentials')]),
      ]),
      def('net.NoCreds', [field('action', [lit('default')])]),
    ]
    const out = canonicalizeVariantParams(ast)
    const params = byName(out, 'net.ContinueWithAuthParameters')

    assert.equal(params.Type, 'variable')
    assert.equal(params['x-selenium-union'], true)
    assert.equal(params.PropertyType.length, 2)

    // Common field is merged into each variant; discriminator stays inside it.
    const credsVariant = byName(out, params.PropertyType[0].Value)
    assert.deepEqual(
      credsVariant.Properties.map((p) => p.Name),
      ['request', 'action', 'credentials'],
    )
    const noCredsVariant = byName(out, params.PropertyType[1].Value)
    assert.deepEqual(
      noCredsVariant.Properties.map((p) => p.Name),
      ['request', 'action'],
    )
  })

  it('removes merged-from source variant defs once they are unreferenced', () => {
    const ast = [
      def('net.ContinueWithAuthParameters', [
        field('request', [ref('net.Request')]),
        field('', {
          Type: 'group',
          Name: '',
          Properties: [[field('', ref('net.Creds'))], field('', [ref('net.NoCreds')])],
        }),
      ]),
      def('net.Creds', [field('action', [lit('provideCredentials')])]),
      def('net.NoCreds', [field('action', [lit('default')])]),
    ]
    const out = canonicalizeVariantParams(ast)
    assert.equal(byName(out, 'net.Creds'), undefined)
    assert.equal(byName(out, 'net.NoCreds'), undefined)
  })

  it('keeps a source variant def that is still referenced elsewhere', () => {
    const ast = [
      def('net.P', [
        field('', { Type: 'group', Name: '', Properties: [[field('', ref('net.A'))], field('', [ref('net.B')])] }),
      ]),
      def('net.A', [field('x', ['text'])]),
      def('net.B', [field('y', ['text'])]),
      def('net.AlsoUsesA', [field('a', [ref('net.A')])]), // independent reference
    ]
    const out = canonicalizeVariantParams(ast)
    assert.ok(byName(out, 'net.A'), 'net.A is still referenced, must survive')
    assert.equal(byName(out, 'net.B'), undefined, 'net.B is now orphaned, must be dropped')
  })

  it('trims a redundant variant-name prefix that restates the params base', () => {
    const ast = [
      def('browser.DownloadBehavior', [
        field('', {
          Type: 'group',
          Name: '',
          Properties: [
            [field('', ref('browser.DownloadBehaviorAllowed'))],
            field('', [ref('browser.DownloadBehaviorDenied')]),
          ],
        }),
      ]),
      def('browser.DownloadBehaviorAllowed', [field('type', [lit('allowed')])]),
      def('browser.DownloadBehaviorDenied', [field('type', [lit('denied')])]),
    ]
    const out = canonicalizeVariantParams(ast)
    const members = byName(out, 'browser.DownloadBehavior').PropertyType.map((m) => m.Value)
    assert.deepEqual(members, ['browser.DownloadBehavior_Allowed', 'browser.DownloadBehavior_Denied'])

    // Each synthesized arm carries its decomposition so a consumer need not parse the name.
    const allowed = byName(out, 'browser.DownloadBehavior_Allowed')
    assert.equal(allowed['x-selenium-synthetic'], true)
    assert.equal(allowed['x-selenium-owner'], 'browser.DownloadBehavior')
    assert.equal(allowed['x-selenium-label'], 'Allowed')
  })

  it('re-points a synthetic owner from a merged-away source variant to the absorbing record', () => {
    // An enum hoisted out of net.NoCreds; the variant merge then drops net.NoCreds,
    // so the enum's owner must follow into the synthesized variant record.
    const ast = [
      def('net.ContinueWithAuthParameters', [
        field('request', [ref('net.Request')]),
        field('', {
          Type: 'group',
          Name: '',
          Properties: [[field('', ref('net.Creds'))], field('', [ref('net.NoCreds')])],
        }),
      ]),
      def('net.Creds', [field('action', [lit('provideCredentials')])]),
      def('net.NoCreds', [field('action', [lit('default')])]),
      {
        Type: 'variable',
        Name: 'net.NoCredsAction',
        IsChoiceAddition: false,
        PropertyType: [lit('a'), lit('b')],
        Comments: [],
        'x-selenium-synthetic': true,
        'x-selenium-owner': 'net.NoCreds',
        'x-selenium-label': 'Action',
      },
    ]
    const out = canonicalizeVariantParams(ast)
    assert.equal(byName(out, 'net.NoCreds'), undefined, 'source variant was merged away')
    const enumDef = byName(out, 'net.NoCredsAction')
    assert.ok(byName(out, enumDef['x-selenium-owner']), 'owner now resolves to a surviving def')
    assert.equal(enumDef['x-selenium-owner'], 'net.ContinueWithAuthParameters_NoCreds')
  })

  it('leaves an already-canonical top-level union (variable) unchanged', () => {
    const ast = [
      {
        Type: 'variable',
        Name: 'session.UnsubscribeParameters',
        PropertyType: [ref('session.ByAttrs'), ref('session.ById')],
        Comments: [],
      },
    ]
    assert.deepEqual(canonicalizeVariantParams(ast), ast)
  })

  it('labels inline-group variants by their distinguishing field', () => {
    const ast = [
      def('emu.SetGeolocationOverrideParameters', [
        field('', {
          Type: 'group',
          Name: '',
          Properties: [
            [field('', { Type: 'group', Name: '', Properties: [field('coordinates', [ref('emu.Coords')])] })],
            field('', { Type: 'group', Name: '', Properties: [field('error', [ref('emu.Err')])] }),
          ],
        }),
      ]),
    ]
    const out = canonicalizeVariantParams(ast)
    const members = byName(out, 'emu.SetGeolocationOverrideParameters').PropertyType.map((m) => m.Value)
    assert.deepEqual(members, [
      'emu.SetGeolocationOverrideParameters_Coordinates',
      'emu.SetGeolocationOverrideParameters_Error',
    ])
  })

  it('bails cleanly without leaking synthetic defs when a choice branch is unsupported', () => {
    // The second branch carries a bare literal (no group-ref / inline group), so the
    // def cannot be canonicalized. The first branch was already processed, but its
    // staged synthetic def must NOT leak into the output, and the def stays untouched.
    const ast = [
      def('x.P', [
        field('', { Type: 'group', Name: '', Properties: [[field('', ref('x.A'))], field('', [lit('oops')])] }),
      ]),
      def('x.A', [field('a', ['text'])]),
    ]
    const out = canonicalizeVariantParams(ast)
    assert.equal(byName(out, 'x.P').Type, 'group', 'def left untouched (not converted to a union)')
    assert.ok(byName(out, 'x.P').Properties, 'def still carries its original Properties')
    assert.equal(
      out.some((d) => d.Name?.startsWith('x.P_')),
      false,
      'no orphaned synthetic variant def leaked',
    )
    assert.deepEqual(out.map((d) => d.Name).sort(), ['x.A', 'x.P'])
  })
})

describe('flattenGroupComposition', () => {
  const spread = (ref) => ({ Name: '', Occurrence: { n: 1, m: 1 }, Type: [ref], Comments: [] })
  const wildcard = { Name: 'text', Occurrence: { n: 0, m: null }, Type: ['any'], Comments: [] }

  it('inlines a spread-in base record so all composed fields are present', () => {
    const ast = [
      def('net.AuthRequiredParameters', [spread(ref('net.BaseParameters')), field('response', [ref('net.Response')])]),
      def('net.BaseParameters', [field('request', [ref('net.Request')]), field('isBlocked', ['bool'])]),
    ]
    const out = flattenGroupComposition(ast)
    assert.deepEqual(
      byName(out, 'net.AuthRequiredParameters').Properties.map((p) => p.Name),
      ['request', 'isBlocked', 'response'],
    )
  })

  it('inlines the Extensible wildcard (so the projector can mark it extensible)', () => {
    const ast = [def('x.Open', [field('a', ['text']), spread(ref('Extensible'))]), def('Extensible', [wildcard])]
    const open = byName(flattenGroupComposition(ast), 'x.Open')
    assert.ok(open.Properties.some((p) => p.Name === 'text' && p.Occurrence.m === null))
  })

  it('does not flatten the dispatch hierarchy (names ending Command/Event)', () => {
    const ast = [
      def('NetworkCommand', [spread(ref('net.AddIntercept'))]),
      def('net.AddIntercept', [field('method', [lit('network.addIntercept')])]),
    ]
    const out = flattenGroupComposition(ast)
    assert.equal(byName(out, 'NetworkCommand').Properties[0].Name, '') // spread left untouched
  })
})

describe('dedupeDefs', () => {
  it('keeps the first occurrence of a duplicated def name', () => {
    const ast = [def('x.T', [field('a', ['text'])]), def('x.T', [field('b', ['text'])])]
    const out = dedupeDefs(ast)
    assert.equal(out.length, 1)
    assert.equal(out[0].Properties[0].Name, 'a')
  })
})

describe('normalizeAst', () => {
  it('does not mutate its input', () => {
    const ast = [def('x.SetCacheBehaviorParameters', [field('cacheBehavior', [lit('default'), lit('bypass')])])]
    const snapshot = structuredClone(ast)
    normalizeAst(ast)
    assert.deepEqual(ast, snapshot)
  })
})
