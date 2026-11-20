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
const { errorType } = require('selenium-webdriver/bidi/error')
const { ErrorCode } = require('selenium-webdriver/bidi/generated/common')
const { BrowsingContext } = require('selenium-webdriver/bidi/generated/browsing_context')

function respondingBidi(response) {
  const frames = []
  return {
    frames,
    send: async (message) => {
      frames.push(JSON.parse(JSON.stringify(message)))
      return response
    },
  }
}

function activate(response) {
  return new BrowsingContext(respondingBidi(response), DOMAIN_TOKEN).activate({ context: 'ctx-1' })
}

async function rejection(response) {
  try {
    await activate(response)
  } catch (err) {
    return err
  }
  assert.fail('expected the command to reject')
}

describe('Domain error responses', function () {
  it('throws the classic error type for a code BiDi shares with WebDriver classic', async function () {
    const err = await rejection({ error: 'no such frame', message: 'Context ctx-1 not found' })

    assert.ok(err instanceof error.NoSuchFrameError)
    assert.ok(err instanceof error.WebDriverError)
    assert.ok(err instanceof Error)
    assert.strictEqual(err.code, 'no such frame')
  })

  it('maps "invalid session id" the way classic does', async function () {
    const err = await rejection({ error: 'invalid session id', message: 'gone' })
    assert.ok(err instanceof error.NoSuchSessionError)
  })

  it('maps "unknown error" to the base WebDriverError', async function () {
    const err = await rejection({ error: 'unknown error', message: 'boom' })
    assert.strictEqual(err.constructor, error.WebDriverError)
  })

  it('throws a dedicated WebDriverError subclass for a BiDi-only code', async function () {
    const err = await rejection({ error: 'no such user context', message: 'User context u-1 not found' })

    assert.strictEqual(err.constructor, errorType('no such user context'))
    assert.strictEqual(err.name, 'NoSuchUserContextError')
    assert.ok(err instanceof error.WebDriverError)
    assert.ok(err instanceof Error)
    assert.strictEqual(err.code, 'no such user context')
  })

  it('gives every spec error code a type of its own, except "unknown error"', function () {
    for (const code of Object.values(ErrorCode)) {
      const type = errorType(code)
      assert.ok(type === error.WebDriverError || type.prototype instanceof error.WebDriverError, code)
      if (code !== 'unknown error') {
        assert.notStrictEqual(type, error.WebDriverError, code)
      }
    }
  })

  it('still throws a WebDriverError for a code outside the spec, keeping the code', async function () {
    const err = await rejection({ error: 'moz:something new', message: 'details' })

    assert.strictEqual(err.constructor, error.WebDriverError)
    assert.strictEqual(err.code, 'moz:something new')
    assert.strictEqual(err.message, 'moz:something new: details')
  })

  it('keeps the "code: message" message format callers may already match on', async function () {
    const err = await rejection({ error: 'no such frame', message: 'Context ctx-1 not found' })
    assert.strictEqual(err.message, 'no such frame: Context ctx-1 not found')
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
