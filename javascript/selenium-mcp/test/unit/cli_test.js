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

const { parseCommandLine } = require('../../lib/cli')

describe('cli', function () {
  it('defaults to headless Chrome', function () {
    const config = parseCommandLine([])
    assert.strictEqual(config.browser, 'chrome')
    assert.strictEqual(config.headless, true)
    assert.strictEqual(config.grid, undefined)
    assert.deepStrictEqual(config.allowedOrigins, [])
  })

  it('shows the browser with --headed', function () {
    assert.strictEqual(parseCommandLine(['--headed']).headless, false)
  })

  it('rejects --headless with --headed', function () {
    assert.throws(() => parseCommandLine(['--headless', '--headed']), /cannot both/)
  })

  it('accepts the other browsers and rejects unknown ones', function () {
    assert.strictEqual(parseCommandLine(['--browser', 'Firefox']).browser, 'firefox')
    assert.strictEqual(parseCommandLine(['--browser=edge']).browser, 'edge')
    assert.throws(() => parseCommandLine(['--browser', 'netscape']), /must be one of/)
  })

  it('takes a Grid URL and checks it', function () {
    assert.strictEqual(parseCommandLine(['--grid', 'http://grid:4444']).grid, 'http://grid:4444')
    assert.throws(() => parseCommandLine(['--grid', 'not a url']), /must be a URL/)
  })

  it('splits origin lists on semicolons', function () {
    const config = parseCommandLine(['--allowed-origins', 'https://a.test; *.b.test;', '--blocked-origins', 'c.test'])
    assert.deepStrictEqual(config.allowedOrigins, ['https://a.test', '*.b.test'])
    assert.deepStrictEqual(config.blockedOrigins, ['c.test'])
  })

  it('explains flags that are planned but not supported yet', function () {
    assert.throws(() => parseCommandLine(['--port', '8931']), /HTTP transport/)
    assert.throws(() => parseCommandLine(['--caps=network']), /not supported yet/)
  })

  it('offers browser_evaluate only with --allow-evaluate', function () {
    assert.strictEqual(parseCommandLine([]).allowEvaluate, false)
    assert.strictEqual(parseCommandLine(['--allow-evaluate']).allowEvaluate, true)
  })

  it('keeps file:// blocked unless asked', function () {
    assert.strictEqual(parseCommandLine([]).allowFileAccess, false)
    assert.strictEqual(parseCommandLine(['--allow-unrestricted-file-access']).allowFileAccess, true)
  })

  it('takes a log level in any case and refuses one it does not know', function () {
    assert.strictEqual(parseCommandLine([]).logLevel, 'warning')
    assert.strictEqual(parseCommandLine(['--log-level', 'FINE']).logLevel, 'fine')
    for (const level of ['debug', 'warn', 'verbose']) {
      assert.throws(() => parseCommandLine(['--log-level', level]), /--log-level must be one of/)
    }
  })

  it('rejects unknown flags', function () {
    assert.throws(() => parseCommandLine(['--nope']))
  })
})
