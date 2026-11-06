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

const { validate } = require('../../lib/validate')

const SCHEMA = {
  type: 'object',
  properties: {
    ref: { type: 'string' },
    count: { type: 'number' },
    flag: { type: 'boolean' },
    mode: { type: 'string', enum: ['a', 'b'] },
    list: { type: 'array', items: { type: 'object', properties: { v: { type: 'string' } }, required: ['v'] } },
  },
  required: ['ref'],
}

describe('validate', function () {
  it('accepts valid arguments', function () {
    assert.deepStrictEqual(validate(SCHEMA, { ref: 'e1', count: 2, flag: true, mode: 'a', list: [{ v: 'x' }] }), [])
  })

  it('reports missing required arguments', function () {
    assert.deepStrictEqual(validate(SCHEMA, {}), ['arguments.ref is required'])
  })

  it('reports wrong types, enum values and unknown arguments', function () {
    assert.deepStrictEqual(validate(SCHEMA, { ref: 1, count: 'x', mode: 'c', extra: 1 }), [
      'arguments.ref must be a string',
      'arguments.count must be a number',
      'arguments.mode must be one of "a", "b"',
      'arguments.extra is not a known argument',
    ])
  })

  it('checks array items', function () {
    assert.deepStrictEqual(validate(SCHEMA, { ref: 'e1', list: [{ v: 'ok' }, {}] }), [
      'arguments.list[1].v is required',
    ])
  })
})
