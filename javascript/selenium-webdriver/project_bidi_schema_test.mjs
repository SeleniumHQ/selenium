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

  it('emits a clean enum for an inline string-literal union', () => {
    assert.deepEqual(schema.types['network.SetCacheBehaviorParametersCacheBehavior'], {
      kind: 'enum',
      values: ['default', 'bypass'],
    })
    assert.deepEqual(schema.types['network.SetCacheBehaviorParameters'].fields[0].type, {
      ref: 'network.SetCacheBehaviorParametersCacheBehavior',
    })
  })

  it('hoists an inline record so the field is a plain ref (no inline records)', () => {
    assert.deepEqual(schema.types['session.Caps'].fields[0].type, { ref: 'session.CapsExtra' })
    assert.ok(schema.types['session.CapsExtra'], 'inline record was hoisted to a named type')
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
  it('projects a multi-member choice group as a union of its refs', () => {
    assert.deepEqual(schema.types['x.Choice'], { kind: 'union', variants: ['x.Item', 'x.Other'] })
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

  it('resolves a union arm that is an inline group wrapping a ref (LocalValue date/regexp arms)', () => {
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
    assert.deepEqual(s.types['x.U'], { kind: 'alias', type: { union: [{ ref: 'x.A' }, { ref: 'x.B' }] } })
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
})
