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

const { allTools } = require('../../lib/server')
const { checkOrigin, normalizeUrl } = require('../../lib/tools/navigate')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { framePartOf, parseChecked, parseKey, resolveUploadPaths } = require('../../lib/tools/interact')
const { formatRequest, isStatic } = require('../../lib/tools/bidi')
const { formatResult } = require('../../lib/tools/evaluate')
const { Key, WebElement } = require('selenium-webdriver')

/** Every tool offered by default, named as @playwright/mcp names them. */
const DEFAULT_TOOLS = [
  'browser_snapshot',
  'browser_click',
  'browser_type',
  'browser_fill_form',
  'browser_select_option',
  'browser_press_key',
  'browser_hover',
  'browser_navigate',
  'browser_navigate_back',
  'browser_wait_for',
  'browser_take_screenshot',
  'browser_console_messages',
  'browser_handle_dialog',
  'browser_tabs',
  'browser_close',
  'browser_install',
  'browser_drag',
  'browser_file_upload',
  'browser_resize',
  'browser_network_requests',
]

/** The plan's v1 gate: the default tool list stays at 25 or fewer. */
const MAX_DEFAULT_TOOLS = 25

/** Agents pay for the tool list on every turn; the plan caps it. */
const TOOL_LIST_TOKEN_BUDGET = 4000

const tools = allTools()
const defaultTools = allTools({ allowEvaluate: false })

describe('tools', function () {
  it('are exactly the default set unless more are asked for', function () {
    assert.deepStrictEqual(defaultTools.map((t) => t.name).sort(), [...DEFAULT_TOOLS].sort())
    assert.ok(defaultTools.length <= MAX_DEFAULT_TOOLS, `${defaultTools.length} default tools`)
  })

  it('offer browser_evaluate only with --allow-evaluate', function () {
    const names = allTools({ allowEvaluate: true }).map((t) => t.name)
    assert.ok(names.includes('browser_evaluate'))
    assert.ok(!defaultTools.some((t) => t.name === 'browser_evaluate'))
  })

  it('stay well inside the token budget', function () {
    const listed = JSON.stringify(
      tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
    )
    // Roughly 4 characters per token for English and JSON; 3 to stay conservative.
    const tokens = Math.ceil(listed.length / 3)
    assert.ok(tokens < TOOL_LIST_TOKEN_BUDGET, `tool list is about ${tokens} tokens`)
  })

  it('have object schemas whose required arguments exist', function () {
    for (const tool of tools) {
      assert.strictEqual(tool.inputSchema.type, 'object', tool.name)
      for (const key of tool.inputSchema.required || []) {
        assert.ok(tool.inputSchema.properties[key], `${tool.name} requires undeclared ${key}`)
      }
      assert.ok(tool.description.length <= 200, `${tool.name} description is long`)
    }
  })

  describe('framePartOf', function () {
    it('separates the frame part of a ref from the element', function () {
      assert.strictEqual(framePartOf('e12'), '')
      assert.strictEqual(framePartOf('f5e1'), 'f5')
      assert.strictEqual(framePartOf('[f5f2e3]'), 'f5f2')
    })
  })

  describe('resolveUploadPaths', function () {
    let root
    let outside

    before(function () {
      root = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-upload-'))
      fs.writeFileSync(path.join(root, 'a.txt'), 'a')
      fs.mkdirSync(path.join(root, 'dir'))
      outside = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-outside-'))
      fs.writeFileSync(path.join(outside, 'secret.txt'), 's')
      fs.symlinkSync(path.join(outside, 'secret.txt'), path.join(root, 'link.txt'))
    })

    after(function () {
      fs.rmSync(root, { recursive: true, force: true })
      fs.rmSync(outside, { recursive: true, force: true })
    })

    it('resolves paths relative to the working directory', function () {
      assert.deepStrictEqual(resolveUploadPaths(['a.txt'], {}, root), [fs.realpathSync(path.join(root, 'a.txt'))])
    })

    it('refuses files outside the working directory, symlinks included', function () {
      const secret = path.join(outside, 'secret.txt')
      assert.throws(() => resolveUploadPaths([secret], {}, root), /outside the working directory/)
      assert.throws(() => resolveUploadPaths(['link.txt'], {}, root), /outside the working directory/)
      assert.deepStrictEqual(resolveUploadPaths([secret], { allowFileAccess: true }, root), [fs.realpathSync(secret)])
    })

    it('refuses missing files, directories and an empty list', function () {
      assert.throws(() => resolveUploadPaths(['nope.txt'], {}, root), /No such file/)
      assert.throws(() => resolveUploadPaths(['dir'], {}, root), /Not a file/)
      assert.throws(() => resolveUploadPaths([], {}, root), /at least one/)
    })
  })

  describe('network requests', function () {
    it('formats requests the way @playwright/mcp does', function () {
      assert.strictEqual(
        formatRequest({ method: 'GET', url: 'https://a.test/', status: 200, statusText: 'OK' }),
        '[GET] https://a.test/ => [200] OK',
      )
      assert.strictEqual(
        formatRequest({ method: 'POST', url: 'https://a.test/x' }),
        '[POST] https://a.test/x => pending',
      )
      assert.strictEqual(
        formatRequest({ method: 'GET', url: 'https://a.test/y', error: 'net::ERR_FAILED' }),
        '[GET] https://a.test/y => failed: net::ERR_FAILED',
      )
    })

    it('treats images, fonts, scripts and stylesheets as static', function () {
      assert.ok(isStatic({ destination: 'image' }))
      assert.ok(isStatic({ destination: '', mimeType: 'text/css; charset=utf-8' }))
      assert.ok(isStatic({ destination: '', mimeType: 'application/javascript' }))
      assert.ok(!isStatic({ destination: '', mimeType: 'application/json' }))
      assert.ok(!isStatic({ destination: 'document', mimeType: 'text/html' }))
    })
  })

  describe('evaluate results', function () {
    it('are JSON, with elements and undefined spelled out', function () {
      assert.strictEqual(formatResult(undefined), 'undefined')
      assert.strictEqual(formatResult(3), '3')
      assert.strictEqual(formatResult({ a: undefined }), '{\n  "a": "<undefined>"\n}')
      assert.strictEqual(formatResult([new WebElement(null, 'id')]), '[\n  "<element>"\n]')
    })

    it('are cut when very long', function () {
      assert.match(formatResult('x'.repeat(30000)), /more characters cut/)
    })
  })

  describe('normalizeUrl', function () {
    it('adds a scheme to bare hosts', function () {
      assert.strictEqual(normalizeUrl('example.com'), 'https://example.com')
      assert.strictEqual(normalizeUrl('localhost:3000/x'), 'http://localhost:3000/x')
      assert.strictEqual(normalizeUrl('http://example.com'), 'http://example.com')
      assert.strictEqual(normalizeUrl('about:blank'), 'about:blank')
      assert.strictEqual(normalizeUrl('example.com:8080/x'), 'https://example.com:8080/x')
      assert.strictEqual(normalizeUrl('data:text/html,hi'), 'data:text/html,hi')
    })
  })

  describe('checkOrigin', function () {
    const config = (allowed = [], blocked = []) => ({ allowedOrigins: allowed, blockedOrigins: blocked })

    it('allows everything by default', function () {
      checkOrigin('https://example.com/a', config())
    })

    it('enforces the allow list by origin or host', function () {
      checkOrigin('https://a.test/x', config(['https://a.test']))
      checkOrigin('https://deep.b.test/x', config(['*.b.test']))
      assert.throws(() => checkOrigin('http://a.test/x', config(['https://a.test'])), /not in --allowed-origins/)
      assert.throws(() => checkOrigin('https://c.test', config(['a.test'])), /not in --allowed-origins/)
    })

    it('lets the block list win', function () {
      assert.throws(() => checkOrigin('https://a.test', config(['a.test'], ['a.test'])), /blocked/)
    })

    it('always allows about:blank', function () {
      checkOrigin('about:blank', config(['a.test']))
    })

    it('matches hosts case-insensitively', function () {
      assert.throws(() => checkOrigin('https://a.test', config([], ['A.TEST'])), /blocked/)
      assert.throws(() => checkOrigin('https://x.a.test', config([], ['*.A.Test'])), /blocked/)
    })

    it('ignores the DNS root dot on either side', function () {
      assert.throws(() => checkOrigin('https://example.com./', config([], ['example.com'])), /blocked/)
      assert.throws(() => checkOrigin('https://x.example.com./', config([], ['*.example.com'])), /blocked/)
      assert.throws(() => checkOrigin('https://example.com:8080/', config([], ['example.com.:8080'])), /blocked/)
      checkOrigin('https://example.com./', config(['example.com']))
    })

    it('blocks file:// unless allowed', function () {
      assert.throws(() => checkOrigin('file:///etc/passwd', config()), /--allow-unrestricted-file-access/)
      checkOrigin('file:///tmp/page.html', { ...config(), allowFileAccess: true })
    })

    it('allows data: only without an allow list', function () {
      checkOrigin('data:text/html,hi', config())
      assert.throws(() => checkOrigin('data:text/html,hi', config(['a.test'])), /data: URLs are not allowed/)
    })

    it('refuses other schemes', function () {
      assert.throws(() => checkOrigin('javascript:alert(1)', config()), /not supported/)
      assert.throws(() => checkOrigin('chrome://settings', config()), /not supported/)
    })
  })

  describe('parseKey', function () {
    it('maps key names and characters', function () {
      assert.deepStrictEqual(parseKey('Enter'), { modifiers: [], key: Key.ENTER })
      assert.deepStrictEqual(parseKey('a'), { modifiers: [], key: 'a' })
      assert.deepStrictEqual(parseKey('+'), { modifiers: [], key: '+' })
    })

    it('takes an emoji as one character', function () {
      assert.deepStrictEqual(parseKey('😀'), { modifiers: [], key: '😀' })
    })

    it('parses chords', function () {
      assert.deepStrictEqual(parseKey('Control+Shift+ArrowLeft'), {
        modifiers: [Key.CONTROL, Key.SHIFT],
        key: Key.ARROW_LEFT,
      })
    })

    it('rejects unknown names', function () {
      assert.throws(() => parseKey('Hyper'), /Unknown key/)
    })
  })

  describe('parseChecked', function () {
    it('takes true or false, ignoring case and spaces', function () {
      assert.strictEqual(parseChecked({ name: 'Agree', value: 'True' }), true)
      assert.strictEqual(parseChecked({ name: 'Agree', value: ' false ' }), false)
    })

    it('refuses anything else instead of unchecking', function () {
      assert.throws(() => parseChecked({ name: 'Agree', value: 'treu' }), /Agree: use "true" or "false"/)
      assert.throws(() => parseChecked({ name: 'Agree', value: 'yes' }), /not "yes"/)
    })
  })
})
