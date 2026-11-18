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
const { DOMAIN_TOKEN } = require('selenium-webdriver/bidi/domain')
const { ValidationError } = require('selenium-webdriver/bidi/serialization/record')
const { Script } = require('selenium-webdriver/bidi/generated/script')

function answering(result) {
  return { send: async () => ({ result }) }
}

/** A callFunction success whose result is one element node carrying `attributes`. */
function nodeResult(attributes) {
  return {
    type: 'success',
    realm: 'realm-1',
    result: {
      type: 'node',
      sharedId: 'shared-1',
      value: { nodeType: 1, childNodeCount: 0, localName: 'div', attributes },
    },
  }
}

async function captureWarnings(fn) {
  const warnings = []
  const onWarning = (w) => warnings.push(w.message)
  process.on('warning', onWarning)
  try {
    const result = await fn()
    await new Promise((resolve) => setTimeout(resolve, 20))
    return { result, warnings }
  } finally {
    process.off('warning', onWarning)
  }
}

function callFunction(result) {
  return new Script(answering(result), DOMAIN_TOKEN).callFunction({
    functionDeclaration: '() => document.body',
    awaitPromise: false,
    target: { context: 'context-1' },
  })
}

// `script.NodeProperties.attributes` is `{* text => text}` in the spec: every key is
// declared by the map's rule, so none is an undeclared field to warn about and drop.
describe('Generated map-valued field (script.NodeProperties.attributes)', function () {
  it('keeps every received entry, without a warning', async function () {
    const { result, warnings } = await captureWarnings(() => callFunction(nodeResult({ id: 'main', class: 'x' })))

    assert.deepStrictEqual({ ...result.result.value.attributes }, { id: 'main', class: 'x' })
    assert.deepStrictEqual(warnings, [])
  })

  it('rejects an entry whose value is not a string', async function () {
    await assert.rejects(callFunction(nodeResult({ id: 1 })), ValidationError)
  })

  it('keeps a "__proto__" key as an entry, not as the prototype', async function () {
    const { result } = await captureWarnings(() => callFunction(nodeResult(JSON.parse('{"__proto__": "x"}'))))

    assert.strictEqual(Object.getOwnPropertyDescriptor(result.result.value.attributes, '__proto__').value, 'x')
  })
})
