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
const { WebExtension, MozWebExtension } = require('selenium-webdriver/bidi/generated/webextension')
const { BrowsingContext, MozBrowsingContext } = require('selenium-webdriver/bidi/generated/browsing_context')
const { ValidationError } = require('selenium-webdriver/bidi/serialization/record')
const { Session } = require('selenium-webdriver/bidi/generated/session')

/** A transport that records each command as it would be serialized onto the socket. */
function recordingBidi(result) {
  const frames = []
  return {
    frames,
    send: async (message) => {
      frames.push(JSON.parse(JSON.stringify(message)))
      return { result }
    },
  }
}

describe('Generated vendor (moz) variant of a spec domain', function () {
  const extensionData = { type: 'path', path: '/tmp/ext' }

  it('extends the spec class, which stays free of vendor commands', function () {
    assert.ok(MozWebExtension.prototype instanceof WebExtension)
    assert.strictEqual(WebExtension.prototype.listExtensions, undefined)
  })

  it('leaves the vendor fields off when not given, so the browser applies its own defaults', async function () {
    const bidi = recordingBidi({ extension: 'ext@example.com' })
    await new MozWebExtension(bidi, DOMAIN_TOKEN).install({ extensionData })
    assert.deepStrictEqual(bidi.frames[0].params, { extensionData })
  })

  it('sends vendor fields under their namespaced wire keys', async function () {
    const bidi = recordingBidi({ extension: 'ext@example.com' })
    await new MozWebExtension(bidi, DOMAIN_TOKEN).install({
      extensionData,
      permanent: false,
      allowPrivateBrowsing: true,
    })
    assert.strictEqual(bidi.frames[0].method, 'webExtension.install')
    assert.deepStrictEqual(bidi.frames[0].params, {
      extensionData,
      'moz:permanent': false,
      'moz:allowPrivateBrowsing': true,
    })
  })

  it('serializes a vendor literal-choice field and rejects a value outside it', async function () {
    const bidi = recordingBidi({ contexts: [] })
    const browsingContext = new MozBrowsingContext(bidi, DOMAIN_TOKEN)
    await browsingContext.getTree({ scope: 'chrome' })
    assert.deepStrictEqual(bidi.frames[0].params, { 'moz:scope': 'chrome' })
    await assert.rejects(browsingContext.getTree({ scope: 'tab' }))
  })

  it('rejects a vendor field the vendor variant declares, passed under its wire key', async function () {
    const browsingContext = new MozBrowsingContext(recordingBidi({ contexts: [] }), DOMAIN_TOKEN)
    await assert.rejects(browsingContext.getTree({ scope: 'chrome', 'moz:scope': 'tab' }), ValidationError)
  })

  it('rejects an undeclared field on a vendor variant', async function () {
    await assert.rejects(
      new MozBrowsingContext(recordingBidi({ contexts: [] }), DOMAIN_TOKEN).getTree({ foo: 1 }),
      ValidationError,
    )
  })

  it('adds vendor commands without their namespace in the method name', async function () {
    const bidi = recordingBidi({ extensions: [] })
    await new MozWebExtension(bidi, DOMAIN_TOKEN).listExtensions()
    assert.strictEqual(bidi.frames[0].method, 'webExtension.moz:listExtensions')
  })
})

// A vendor extension declares fields on a spec type; it does not open the type to
// fields nobody declared (#18184, ADR 17786 decisions 1, 6 and 9).
describe('Generated spec types a vendor extends', function () {
  const extensionData = { type: 'path', path: '/tmp/ext' }
  const info = {
    children: null,
    clientWindow: 'w1',
    context: 'c1',
    originalOpener: null,
    url: 'about:blank',
    userContext: 'default',
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

  describe('received', function () {
    it('types the vendor fields on the shared type, whichever class received it', async function () {
      const payload = { contexts: [{ ...info, 'moz:name': 'main', 'moz:scope': 'content' }] }
      for (const Cls of [BrowsingContext, MozBrowsingContext]) {
        const { contexts } = await new Cls(recordingBidi(payload), DOMAIN_TOKEN).getTree({})
        assert.strictEqual(contexts[0].mozName, 'main')
        assert.strictEqual(contexts[0].mozScope, 'content')
        assert.strictEqual(contexts[0]['moz:name'], undefined)
      }
    })

    it('leaves the vendor fields absent for a browser that does not send them', async function () {
      const { contexts } = await new BrowsingContext(recordingBidi({ contexts: [info] }), DOMAIN_TOKEN).getTree({})
      assert.strictEqual(Object.hasOwn(contexts[0], 'mozName'), false)
    })

    it('rejects a vendor field outside its declared type', async function () {
      for (const bad of [{ 'moz:scope': 'tab' }, { 'moz:name': 42 }]) {
        await assert.rejects(
          new BrowsingContext(recordingBidi({ contexts: [{ ...info, ...bad }] }), DOMAIN_TOKEN).getTree({}),
          ValidationError,
        )
      }
    })

    it('warns about and drops a field nobody declared', async function () {
      const { result, warnings } = await captureWarnings(() =>
        new BrowsingContext(recordingBidi({ contexts: [{ ...info, foo: 1 }] }), DOMAIN_TOKEN).getTree({}),
      )
      assert.strictEqual(Object.hasOwn(result.contexts[0], 'foo'), false)
      assert.deepStrictEqual(warnings, ['browsingContext.Info: undeclared property "foo"'])
    })

    it('types the vendor fields of an event payload too', function () {
      const parsed = BrowsingContext.CONTEXT_DESTROYED.type.fromWire({ ...info, 'moz:scope': 'chrome' })
      assert.strictEqual(parsed.mozScope, 'chrome')
    })
  })

  describe('sent', function () {
    it('keeps the shared command params spec-only', async function () {
      const browsingContext = new BrowsingContext(recordingBidi({ contexts: [] }), DOMAIN_TOKEN)
      await assert.rejects(browsingContext.getTree({ 'moz:scope': 'chrome' }), ValidationError)
      await assert.rejects(browsingContext.getTree({ scope: 'chrome' }), ValidationError)
      await assert.rejects(browsingContext.getTree({ foo: 1 }), ValidationError)
    })

    it('keeps the shared install params spec-only', async function () {
      const webExtension = new WebExtension(recordingBidi({ extension: 'e' }), DOMAIN_TOKEN)
      await assert.rejects(webExtension.install({ extensionData, 'moz:permanent': true }), ValidationError)
      await assert.rejects(webExtension.install({ extensionData, foo: 1 }), ValidationError)
    })
  })
})

// session.CapabilityRequest and CapabilityResponse are extensible in the spec, so they keep other
// browsers' capabilities as extensions; the vendor's own fields are still declared fields.
describe('Generated spec types a vendor extends that the spec marks extensible', function () {
  const response = {
    acceptInsecureCerts: false,
    browserName: 'firefox',
    browserVersion: '140.0',
    platformName: 'mac',
    setWindowRect: true,
    userAgent: 'ua',
    proxy: { proxyType: 'direct' },
  }

  async function newSession(capabilities, result = { sessionId: 's1', capabilities: response }) {
    const bidi = recordingBidi(result)
    const session = await new Session(bidi, DOMAIN_TOKEN).new({ capabilities })
    return { frames: bidi.frames, session }
  }

  describe('sent', function () {
    it('serializes typed firefoxOptions under the vendor wire key', async function () {
      const mozFirefoxOptions = {
        args: ['-headless'],
        env: { MOZ_LOG: 'all:5' },
        prefs: { 'browser.startup.page': 0, 'dom.disable_open_during_load': false, 'intl.locale': 'en' },
        log: { level: 'trace' },
      }
      const { frames } = await newSession({ alwaysMatch: { mozFirefoxOptions } })
      assert.deepStrictEqual(frames[0].params.capabilities.alwaysMatch, { 'moz:firefoxOptions': mozFirefoxOptions })
    })

    it('rejects firefoxOptions outside their declared types', async function () {
      for (const mozFirefoxOptions of [
        { args: 5 },
        { env: { MOZ_LOG: 1 } },
        { prefs: { 'browser.startup.page': {} } },
        { log: { level: 'loud' } },
        { binaryPath: '/usr/bin/firefox' },
      ]) {
        await assert.rejects(newSession({ alwaysMatch: { mozFirefoxOptions } }), ValidationError)
      }
    })

    it('rejects a declared vendor field passed under its wire key', async function () {
      await assert.rejects(newSession({ alwaysMatch: { 'moz:firefoxOptions': { args: 5 } } }), ValidationError)
    })

    it("still sends another browser's capabilities as extensions", async function () {
      const { frames } = await newSession({ alwaysMatch: { 'goog:chromeOptions': { args: ['--headless'] } } })
      assert.deepStrictEqual(frames[0].params.capabilities.alwaysMatch, {
        'goog:chromeOptions': { args: ['--headless'] },
      })
    })
  })

  describe('received', function () {
    it('types the vendor capabilities', async function () {
      const capabilities = { ...response, 'moz:processID': 4242, 'moz:headless': true, 'moz:profile': '/tmp/p' }
      const { session } = await newSession({}, { sessionId: 's1', capabilities })
      assert.strictEqual(session.capabilities.mozProcessID, 4242)
      assert.strictEqual(session.capabilities.mozHeadless, true)
      assert.strictEqual(session.capabilities.mozProfile, '/tmp/p')
      assert.strictEqual(session.capabilities['moz:processID'], undefined)
    })

    it('rejects a vendor capability outside its declared type', async function () {
      for (const bad of [{ 'moz:processID': -1 }, { 'moz:headless': 'yes' }]) {
        await assert.rejects(
          newSession({}, { sessionId: 's1', capabilities: { ...response, ...bad } }),
          ValidationError,
        )
      }
    })

    it("still keeps another browser's capabilities as extensions", async function () {
      const capabilities = { ...response, 'goog:chromeOptions': { debuggerAddress: 'localhost:9222' } }
      const { session } = await newSession({}, { sessionId: 's1', capabilities })
      assert.deepStrictEqual(session.capabilities['goog:chromeOptions'], { debuggerAddress: 'localhost:9222' })
    })
  })
})
