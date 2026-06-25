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

// Unit tests for the schema projector + validators.
// Mocha test; `describe`/`it` are mocha globals (run via the Bazel mocha target).
// The completeness test is the "compare input to output independent of
// generation" gate — it re-derives expected methods from the raw AST, not the model.
import assert from 'node:assert/strict'
import { projectSchema, checkSchema, checkCompleteness } from './project_bidi_schema.mjs'

const lit = (v) => ({ Type: 'literal', Value: v, Unwrapped: false })
const ref = (v) => ({ Type: 'group', Value: v, Unwrapped: false })
const field = (name, type, occ = { n: 1, m: 1 }) => ({ Name: name, Occurrence: occ, Type: type, Comments: [] })
const group = (name, props) => ({ Type: 'group', Name: name, Properties: props, IsChoiceAddition: false, Comments: [] })
const leaf = (cddlName, method, paramsRef) =>
  group(cddlName, [field('method', [lit(method)]), field('params', [ref(paramsRef)])])

// A tiny but representative AST + model.
const AST = [
  leaf('network.SetCacheBehavior', 'network.setCacheBehavior', 'network.SetCacheBehaviorParameters'),
  group('network.SetCacheBehaviorParameters', [field('cacheBehavior', [lit('default'), lit('bypass')])]),
  group('session.Caps', [field('extra', { Type: 'group', Name: '', Properties: [field('webSocketUrl', ['bool'])] })]),
  group('x.OpenMap', [field('text', ['any'], { n: 0, m: null })]),
]
const MODEL = {
  network: {
    commands: [
      {
        method: 'network.setCacheBehavior',
        name: 'setCacheBehavior',
        params: 'network.SetCacheBehaviorParameters',
        result: null,
      },
    ],
    events: [],
  },
}

describe('projectSchema', () => {
  const schema = projectSchema(AST, MODEL)

  it('emits a clean enum for an inline string-literal union, tagged with its origin', () => {
    assert.deepEqual(schema.types['network.SetCacheBehaviorParametersCacheBehavior'], {
      kind: 'enum',
      values: ['default', 'bypass'],
      synthetic: true,
      owner: 'network.SetCacheBehaviorParameters',
      label: 'CacheBehavior',
    })
    assert.deepEqual(schema.types['network.SetCacheBehaviorParameters'].fields[0].type, {
      ref: 'network.SetCacheBehaviorParametersCacheBehavior',
    })
  })

  it('hoists an inline record so the field is a plain ref (no inline records), tagged with its origin', () => {
    assert.deepEqual(schema.types['session.Caps'].fields[0].type, { ref: 'session.CapsExtra' })
    const extra = schema.types['session.CapsExtra']
    assert.ok(extra, 'inline record was hoisted to a named type')
    assert.equal(extra.synthetic, true)
    assert.equal(extra.owner, 'session.Caps')
    assert.equal(extra.label, 'Extra')
  })

  it('marks `* text => any` extensible instead of emitting a phantom field', () => {
    const open = schema.types['x.OpenMap']
    assert.equal(open.extensible, true)
    assert.equal(open.fields.length, 0)
  })

  it('passes both validators on a well-formed schema', () => {
    assert.deepEqual(checkSchema(schema), [])
    assert.deepEqual(checkCompleteness(AST, schema), [])
  })

  it('recovers command params from the envelope when the model dropped an inline params object', () => {
    // The command declares an inline `params: { count }` (not a named ref); the model
    // builder records params: null, but the normalizer hoists it to x.FooCommandParams
    // and the envelope record points at it — so the command entry must surface it.
    const ast = [
      group('x.FooCommand', [
        field('method', [lit('x.foo')]),
        field('params', { Type: 'group', Name: '', Properties: [field('count', ['uint'])] }),
      ]),
    ]
    const model = { x: { commands: [{ method: 'x.foo', name: 'foo', params: null, result: null }], events: [] } }
    const out = projectSchema(ast, model)
    assert.deepEqual(out.commands[0].params, { ref: 'x.FooCommandParams' })
    assert.deepEqual(checkSchema(out), [])
  })
})

describe('projectType (list / union / alias defs)', () => {
  const anon = (v) => ({ Name: '', Occurrence: { n: 1, m: 1 }, Type: ref(v), Comments: [] })
  const ast = [
    {
      Type: 'array',
      Name: 'x.Items',
      Values: [{ Name: '', Occurrence: { n: 0, m: null }, Type: [ref('x.Item')], Comments: [] }],
    },
    group('x.Item', [field('a', ['text'])]),
    group('x.Other', [field('b', ['text'])]),
    {
      Type: 'group',
      Name: 'x.Choice',
      Properties: [[anon('x.Item'), anon('x.Other')]],
      IsChoiceAddition: false,
      Comments: [],
    },
    { Type: 'group', Name: 'x.FooEvent', Properties: [anon('x.Item')], IsChoiceAddition: false, Comments: [] },
  ]
  const schema = projectSchema(ast, {})

  it('projects a top-level array def as an alias to a list (keeps the element type)', () => {
    assert.deepEqual(schema.types['x.Items'], { kind: 'alias', type: { list: { ref: 'x.Item' } } })
  })
  it('fails closed (unknown, not null) when an array element type is missing', () => {
    const s = projectSchema([{ Type: 'array', Name: 'x.Bad', Values: [] }], {})
    assert.deepEqual(s.types['x.Bad'], { kind: 'alias', type: { list: { primitive: 'unknown' } } })
    assert.ok(
      checkSchema(s).some((e) => /unknown primitive/.test(e)),
      'a missing element type must trip the unknown-primitive guard',
    )
  })
  it('projects a multi-member choice group as a union with a structural selector', () => {
    assert.deepEqual(schema.types['x.Choice'], {
      kind: 'union',
      variants: ['x.Item', 'x.Other'],
      selector: {
        ordered: [
          { ref: 'x.Item', requires: ['a'] },
          { ref: 'x.Other', requires: ['b'] },
        ],
      },
    })
  })
  it('projects a single-member dispatch choice group as an alias to its ref', () => {
    assert.deepEqual(schema.types['x.FooEvent'], { kind: 'alias', type: { ref: 'x.Item' } })
  })

  it('projects an integer range as integer and a float range as number', () => {
    const s = projectSchema(
      [
        {
          Type: 'variable',
          Name: 'x.U',
          PropertyType: [{ Type: 'range', Value: { Min: { Value: 0 }, Max: { Value: 100 } } }],
        },
        {
          Type: 'variable',
          Name: 'x.F',
          PropertyType: [{ Type: 'range', Value: { Min: { Value: 0.1 }, Max: { Value: 2 } } }],
        },
      ],
      {},
    )
    assert.deepEqual(s.types['x.U'], { kind: 'alias', type: { primitive: 'integer' } })
    assert.deepEqual(s.types['x.F'], { kind: 'alias', type: { primitive: 'number' } })
  })

  it('unwraps a control-operator (.default / .ge) wrapped field type to its inner type', () => {
    const wrapped = {
      Name: 'n',
      Occurrence: { n: 1, m: 1 },
      Type: [{ Type: ref('x.Inner'), Operator: { Type: 'default', Value: lit('a') } }],
      Comments: [],
    }
    const s = projectSchema([group('x.R', [wrapped]), group('x.Inner', [field('z', ['text'])])], {})
    assert.deepEqual(s.types['x.R'].fields[0].type, { ref: 'x.Inner' })
  })

  it('promotes a union whose arms are inline groups wrapping refs (LocalValue date/regexp arms)', () => {
    const inlineArm = {
      Type: 'group',
      Name: '',
      Properties: [{ Name: '', Occurrence: { n: 1, m: 1 }, Type: [ref('x.B')], Comments: [] }],
    }
    const s = projectSchema(
      [
        { Type: 'variable', Name: 'x.U', PropertyType: [ref('x.A'), inlineArm] },
        group('x.A', [field('a', ['text'])]),
        group('x.B', [field('b', ['text'])]),
      ],
      {},
    )
    // The inline-group arm resolves to x.B, so x.U is a first-class union (not an
    // alias-to-union) and both arms are reachable variants.
    assert.deepEqual(s.types['x.U'].kind, 'union')
    assert.deepEqual(s.types['x.U'].variants, ['x.A', 'x.B'])
  })
})

describe('unionSelector', () => {
  const recAst = (name, typeConst, extra = []) => ({
    Type: 'group',
    Name: name,
    IsChoiceAddition: false,
    Comments: [],
    Properties: [{ Name: 'type', Occurrence: { n: 1, m: 1 }, Type: [lit(typeConst)], Comments: [] }, ...extra],
  })
  const union = (name, refs) => ({
    Type: 'variable',
    Name: name,
    IsChoiceAddition: false,
    Comments: [],
    PropertyType: refs.map(ref),
  })

  it('discriminates on a constant key, flattening a tagged sub-union and recording an untyped default', () => {
    // x.Value = ( x.Prim / x.Date / x.Reference ); x.Prim is itself type-tagged,
    // x.Reference has no `type` (dispatched structurally) → it is the default.
    const ast = [
      union('x.Value', ['x.Prim', 'x.Date', 'x.Reference']),
      union('x.Prim', ['x.StringValue', 'x.NullValue']),
      recAst('x.StringValue', 'string'),
      { ...recAst('x.NullValue', null), Properties: [field('type', ['null'])] },
      recAst('x.Date', 'date'),
      group('x.Reference', [field('refId', ['text'])]),
    ]
    const s = projectSchema(ast, {})
    const sel = s.types['x.Value'].selector
    assert.equal(sel.by, 'type')
    assert.equal(sel.default, 'x.Reference')
    // A sole bareword `null` field is the quoted string tag "null", not the JSON
    // null type, so NullValue dispatches on the string "null" (not JSON null).
    assert.deepEqual(s.types['x.NullValue'].fields[0].type, { const: 'null' })
    assert.deepEqual(
      new Map(sel.variants.map((v) => [JSON.stringify(v.value), v.ref])),
      new Map([
        ['"string"', 'x.StringValue'],
        ['"null"', 'x.NullValue'],
        ['"date"', 'x.Date'],
      ]),
    )
  })

  it('uses an open base-type arm as the discriminator default (log.Entry shape)', () => {
    const ast = [
      union('x.Entry', ['x.Generic', 'x.Console']),
      group('x.Generic', [field('type', ['text'])]), // open `type` → catch-all
      recAst('x.Console', 'console'),
    ]
    const sel = projectSchema(ast, {}).types['x.Entry'].selector
    assert.equal(sel.by, 'type')
    assert.equal(sel.default, 'x.Generic')
    assert.deepEqual(sel.variants, [{ value: 'console', ref: 'x.Console' }])
  })

  it('falls back to an ordered structural selector when no shared discriminator exists', () => {
    const ast = [
      union('x.Ref', ['x.Shared', 'x.Remote']),
      group('x.Shared', [
        field('sharedId', ['text']),
        { Name: 'handle', Occurrence: { n: 0, m: 1 }, Type: ['text'], Comments: [] },
      ]),
      group('x.Remote', [field('handle', ['text'])]),
    ]
    const sel = projectSchema(ast, {}).types['x.Ref'].selector
    assert.deepEqual(sel, {
      ordered: [
        { ref: 'x.Shared', requires: ['sharedId'] },
        { ref: 'x.Remote', requires: ['handle'] },
      ],
    })
  })

  // The response envelope is a record pairing a `result` union with the request `id`.
  const envelope = (resultRef) => group('x.CommandResponse', [field('id', ['uint']), field('result', [ref(resultRef)])])

  it('marks an undispatchable result-grouping union (reached via `result`) as correlated', () => {
    // CommandResponse.result -> x.ResultData, a union of result records that cannot
    // be told apart from the payload (no required fields): it is dispatched by
    // request id, so it carries no selector.
    const ast = [
      envelope('x.ResultData'),
      union('x.ResultData', ['x.FooResult', 'x.BarResult']),
      group('x.FooResult', []),
      group('x.BarResult', []),
    ]
    assert.deepEqual(projectSchema(ast, {}).types['x.ResultData'].selector, { correlated: true })
  })

  it('keeps a structurally-dispatchable result reached via `result` (not correlated)', () => {
    // Distinguishable result records (each has its own required field) stay
    // payload-dispatched even though they are reached through the envelope.
    const ast = [
      envelope('x.ResultData'),
      union('x.ResultData', ['x.FooResult', 'x.BarResult']),
      group('x.FooResult', [field('foo', ['text'])]),
      group('x.BarResult', [field('bar', ['text'])]),
    ]
    assert.deepEqual(projectSchema(ast, {}).types['x.ResultData'].selector, {
      ordered: [
        { ref: 'x.FooResult', requires: ['foo'] },
        { ref: 'x.BarResult', requires: ['bar'] },
      ],
    })
  })

  it('does not mark a discriminated result reached via `result` as correlated (e.g. EvaluateResult)', () => {
    const ast = [
      envelope('x.EvalResult'),
      union('x.EvalResult', ['x.Success', 'x.Failure']),
      recAst('x.Success', 'success'),
      recAst('x.Failure', 'exception'),
    ]
    const sel = projectSchema(ast, {}).types['x.EvalResult'].selector
    assert.equal(sel.by, 'type') // payload-dispatched, selector preserved
  })

  it('does not correlate a union reached via a non-envelope `result` field (no request id)', () => {
    // A plain payload type has a `result` field but no request `id`, so it is not the
    // response envelope; its union must keep its payload selector, not be correlated.
    const ast = [
      group('x.EvaluateResultSuccess', [field('result', [ref('x.ResultData')]), field('realm', ['text'])]),
      union('x.ResultData', ['x.FooResult', 'x.BarResult']),
      group('x.FooResult', []),
      group('x.BarResult', []),
    ]
    const sel = projectSchema(ast, {}).types['x.ResultData'].selector
    assert.ok(sel.ordered, 'a non-envelope `result` field must not request-correlate its union')
    assert.equal(sel.correlated, undefined)
  })

  it('does not treat a record with an optional id/result as the response envelope', () => {
    // The real envelope has a REQUIRED request id and result; an optional id means
    // this is not the response envelope, so its union must keep its payload selector.
    const optional = { n: 0, m: 1 }
    const ast = [
      group('x.CommandResponse', [field('id', ['uint'], optional), field('result', [ref('x.ResultData')])]),
      union('x.ResultData', ['x.FooResult', 'x.BarResult']),
      group('x.FooResult', []),
      group('x.BarResult', []),
    ]
    const sel = projectSchema(ast, {}).types['x.ResultData'].selector
    assert.equal(sel.correlated, undefined)
    assert.ok(sel.ordered)
  })

  it('resolves an alias variant to its leaf record when building structural requires', () => {
    // x.Alias is a single-ref alias to x.A; its ordered `requires` must reflect
    // x.A's required fields, not be left empty (which would always match).
    const ast = [
      union('x.U', ['x.Alias', 'x.B']),
      { Type: 'variable', Name: 'x.Alias', IsChoiceAddition: false, Comments: [], PropertyType: [ref('x.A')] },
      group('x.A', [field('a', ['text'])]),
      group('x.B', [field('b', ['text'])]),
    ]
    assert.deepEqual(projectSchema(ast, {}).types['x.U'].selector, {
      ordered: [
        { ref: 'x.Alias', requires: ['a'] },
        { ref: 'x.B', requires: ['b'] },
      ],
    })
  })
})

describe('checkCompleteness (input vs output, generator-independent)', () => {
  it('fails when a command/event present in the AST is missing from the schema', () => {
    const astWithExtra = [
      ...AST,
      leaf('network.DroppedCmd', 'network.droppedCmd', 'network.SetCacheBehaviorParameters'),
    ]
    const schema = projectSchema(AST, MODEL) // model does NOT know about droppedCmd
    const errors = checkCompleteness(astWithExtra, schema)
    assert.deepEqual(errors, ['dropped from schema: network.droppedCmd'])
  })

  it('does not fail for a known-incomplete (allowlisted) drop', () => {
    const astWithKnown = [
      ...AST,
      leaf('bluetooth.X', 'bluetooth.characteristicEventGenerated', 'network.SetCacheBehaviorParameters'),
    ]
    assert.deepEqual(checkCompleteness(astWithKnown, projectSchema(AST, MODEL)), [])
  })

  it('flags an allowlisted method as stale once it is emitted', () => {
    const schema = projectSchema(AST, MODEL)
    schema.events.push({
      domain: 'bluetooth',
      method: 'bluetooth.characteristicEventGenerated',
      name: 'characteristicEventGenerated',
      params: null,
    })
    assert.deepEqual(checkCompleteness(AST, schema), [
      'stale KNOWN_INCOMPLETE entry (now emitted, remove it): bluetooth.characteristicEventGenerated',
    ])
  })
})

describe('checkSchema (referential integrity)', () => {
  it('catches an unresolved ref nested inside a record field', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        'x.T': { kind: 'record', fields: [{ name: 'a', wire: 'a', required: true, type: { ref: 'x.Missing' } }] },
      },
    }
    assert.deepEqual(checkSchema(schema), ['x.T.a: unresolved type x.Missing'])
  })

  it('catches an unresolved ref inside an alias', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: { 'x.A': { kind: 'alias', type: { ref: 'x.Missing' } } },
    }
    assert.deepEqual(checkSchema(schema), ['x.A: unresolved type x.Missing'])
  })

  it('catches an unresolved ref inside a record map', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: { 'x.T': { kind: 'record', fields: [], map: { ref: 'x.Missing' } } },
    }
    assert.deepEqual(checkSchema(schema), ['x.T.*: unresolved type x.Missing'])
  })

  it('flags a field that projected to an unknown primitive (unhandled CDDL type)', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        'x.T': { kind: 'record', fields: [{ name: 'a', wire: 'a', required: true, type: { primitive: 'unknown' } }] },
      },
    }
    assert.deepEqual(checkSchema(schema), ['x.T.a: projected to an unknown primitive (unhandled CDDL type)'])
  })

  it('flags a synthetic type whose owner does not resolve', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        'x.E': { kind: 'enum', values: ['a', 'b'], synthetic: true, owner: 'x.Gone', label: 'E' },
      },
    }
    assert.deepEqual(checkSchema(schema), ['x.E: synthetic owner x.Gone does not resolve'])
  })

  it('flags an empty inline record in a union arm (dropped type reference)', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        'x.U': { kind: 'alias', type: { union: [{ ref: 'x.A' }, { record: [] }] } },
        'x.A': { kind: 'record', fields: [] }, // a legitimately-empty top-level record is NOT flagged
      },
    }
    assert.deepEqual(checkSchema(schema), ['x.U: projected an empty inline record (dropped type reference)'])
  })

  it('rejects a structural selector whose arm shadows a later arm (subset requires)', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        'x.U': {
          kind: 'union',
          variants: ['x.A', 'x.B'],
          selector: {
            ordered: [
              { ref: 'x.A', requires: ['data'] },
              { ref: 'x.B', requires: ['data', 'more'] },
            ],
          },
        },
        'x.A': { kind: 'record', fields: [] },
        'x.B': { kind: 'record', fields: [] },
      },
    }
    assert.deepEqual(checkSchema(schema), ['x.U: structural selector arm x.A shadows x.B (requires is a subset)'])
  })

  it('rejects a structural selector arm with no required fields to dispatch on', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        'x.U': {
          kind: 'union',
          variants: ['x.A', 'x.B'],
          selector: {
            ordered: [
              { ref: 'x.A', requires: [] },
              { ref: 'x.B', requires: ['b'] },
            ],
          },
        },
        'x.A': { kind: 'record', fields: [] },
        'x.B': { kind: 'record', fields: [] },
      },
    }
    assert.deepEqual(checkSchema(schema), ['x.U: structural selector arm x.A has no required fields to dispatch on'])
  })

  it('accepts a correlated selector (resolved by request id, not the payload)', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        'x.ResultData': { kind: 'union', variants: ['x.A'], selector: { correlated: true } },
        'x.A': { kind: 'record', fields: [] },
      },
    }
    assert.deepEqual(checkSchema(schema), [])
  })

  it('exempts the envelope `result` position but flags any other correlated reference', () => {
    const make = (fieldName, withId = true) => ({
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        Envelope: {
          kind: 'record',
          fields: [
            ...(withId ? [{ name: 'id', wire: 'id', required: true, type: { primitive: 'integer' } }] : []),
            { name: fieldName, wire: fieldName, required: true, type: { ref: 'x.ResultData' } },
          ],
        },
        'x.ResultData': { kind: 'union', variants: ['x.A'], selector: { correlated: true } },
        'x.A': { kind: 'record', fields: [] },
      },
    })
    assert.deepEqual(checkSchema(make('result')), []) // the envelope's correlation point — allowed
    assert.deepEqual(checkSchema(make('payload')), [
      'Envelope.payload: correlated union x.ResultData is reachable as a value (needs a payload selector)',
    ])
    // A `result` field on a record that is NOT the envelope (no request id) gets no
    // free pass — otherwise a too-broad envelope match could ship silently.
    assert.deepEqual(checkSchema(make('result', false)), [
      'Envelope.result: correlated union x.ResultData is reachable as a value (needs a payload selector)',
    ])
  })

  it('flags a correlated union used as a variant of a non-correlated union', () => {
    const schema = {
      schemaVersion: 1,
      commands: [],
      events: [],
      types: {
        'x.Value': {
          kind: 'union',
          variants: ['x.ResultData'],
          selector: { ordered: [{ ref: 'x.ResultData', requires: ['k'] }] },
        },
        'x.ResultData': { kind: 'union', variants: ['x.A'], selector: { correlated: true } },
        'x.A': { kind: 'record', fields: [{ name: 'k', wire: 'k', required: true, type: { primitive: 'string' } }] },
      },
    }
    assert.deepEqual(checkSchema(schema), [
      'x.Value: correlated union x.ResultData is reachable as a value (needs a payload selector)',
    ])
  })

  it('flags a command that emits null params while its envelope requires them', () => {
    const schema = {
      schemaVersion: 1,
      commands: [{ domain: 'x', method: 'x.foo', name: 'foo', params: null, result: null }],
      events: [],
      types: {
        'x.FooCommand': {
          kind: 'record',
          fields: [
            { name: 'method', wire: 'method', required: true, type: { const: 'x.foo' } },
            { name: 'params', wire: 'params', required: true, type: { ref: 'x.FooParams' } },
          ],
        },
        'x.FooParams': { kind: 'record', fields: [] },
      },
    }
    assert.deepEqual(checkSchema(schema), ['x.foo: params null does not match required envelope params x.FooParams'])
  })
})
