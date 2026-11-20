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
const error = require('selenium-webdriver/lib/error')
const { DOMAIN_TOKEN } = require('selenium-webdriver/bidi/domain')
const { BrowsingContext } = require('selenium-webdriver/bidi/generated/browsing_context')

function respondingBidi(response) {
  return { send: async () => response }
}

async function rejection(response) {
  try {
    await new BrowsingContext(respondingBidi(response), DOMAIN_TOKEN).activate({ context: 'ctx-1' })
  } catch (err) {
    return err
  }
  assert.fail('expected the command to reject')
}

describe('Domain error responses', function () {
  it('throws a WebDriverError carrying the error code and message', async function () {
    const err = await rejection({ error: 'no such frame', message: 'Context ctx-1 not found' })

    assert.strictEqual(err.constructor, error.WebDriverError)
    assert.strictEqual(err.message, 'no such frame: Context ctx-1 not found')
  })

  it('throws for an error code outside the spec', async function () {
    const err = await rejection({ error: 'moz:something new', message: 'details' })

    assert.strictEqual(err.constructor, error.WebDriverError)
    assert.strictEqual(err.message, 'moz:something new: details')
  })

  it("preserves the remote end's stacktrace", async function () {
    const err = await rejection({ error: 'no such node', message: 'm', stacktrace: 'at frame 1\nat frame 2' })
    assert.strictEqual(err.remoteStacktrace, 'at frame 1\nat frame 2')
  })

  it('leaves remoteStacktrace empty when the remote end sends none', async function () {
    const err = await rejection({ error: 'no such node', message: 'm' })
    assert.strictEqual(err.remoteStacktrace, '')
  })

  it('returns the result of a success response', async function () {
    const browsingContext = new BrowsingContext(respondingBidi({ result: { contexts: [] } }), DOMAIN_TOKEN)
    const tree = await browsingContext.getTree({})
    assert.deepStrictEqual(tree.contexts, [])
  })
})
