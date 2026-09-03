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
const { suite, Pages } = require('../../../lib/test')
const { Browser } = require('selenium-webdriver')

const { Script } = require('selenium-webdriver/bidi/generated/script')

suite(
  function (env) {
    let driver
    let script

    beforeEach(async function () {
      driver = await env.builder().build()
      script = await Script.create(driver)
    })

    afterEach(function () {
      return driver.quit()
    })

    describe('evaluate', function () {
      it('can evaluate a simple expression', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.evaluate({
          expression: '1 + 2',
          target: { context: contextId },
          awaitPromise: false,
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.type, 'number')
        assert.strictEqual(result.result.value, 3)
      })

      it('can evaluate a string expression', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.evaluate({
          expression: '"hello" + " " + "world"',
          target: { context: contextId },
          awaitPromise: false,
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.type, 'string')
        assert.strictEqual(result.result.value, 'hello world')
      })

      it('can evaluate a boolean expression', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.evaluate({
          expression: '1 === 1',
          target: { context: contextId },
          awaitPromise: false,
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.type, 'boolean')
        assert.strictEqual(result.result.value, true)
      })

      it('captures exception details on error', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.evaluate({
          expression: 'throw new Error("test error")',
          target: { context: contextId },
          awaitPromise: false,
        })

        assert.strictEqual(result.type, 'exception')
        assert.ok(result.exceptionDetails)
        assert.ok(result.exceptionDetails.text.includes('test error'))
      })

      it('can await a promise', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.evaluate({
          expression: 'Promise.resolve(42)',
          target: { context: contextId },
          awaitPromise: true,
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.value, 42)
      })
    })

    describe('callFunction', function () {
      it('can call a function with no arguments', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.callFunction({
          functionDeclaration: '() => 1 + 2',
          awaitPromise: false,
          target: { context: contextId },
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.value, 3)
      })

      it('can call a function with arguments', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.callFunction({
          functionDeclaration: '(a, b) => a + b',
          awaitPromise: false,
          target: { context: contextId },
          arguments: [
            { type: 'number', value: 10 },
            { type: 'number', value: 5 },
          ],
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.value, 15)
      })

      it('can call a function that returns a string', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.callFunction({
          functionDeclaration: '() => document.title',
          awaitPromise: false,
          target: { context: contextId },
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.type, 'string')
      })

      it('can call a function that returns an array', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.callFunction({
          functionDeclaration: '() => [1, 2, 3]',
          awaitPromise: false,
          target: { context: contextId },
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.type, 'array')
        assert.ok(result.result.value)
      })

      it('can call a function in a sandbox', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.callFunction({
          functionDeclaration: '() => 42',
          awaitPromise: false,
          target: { context: contextId, sandbox: 'testSandbox' },
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.value, 42)
      })

      it('captures exception in callFunction', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.callFunction({
          functionDeclaration: '() => { throw new TypeError("bad input") }',
          awaitPromise: false,
          target: { context: contextId },
        })

        assert.strictEqual(result.type, 'exception')
        assert.ok(result.exceptionDetails)
      })
    })

    describe('getRealms', function () {
      it('can get all realms', async function () {
        const contextId = await driver.getWindowHandle()
        await driver.get(Pages.emptyPage)

        const result = await script.getRealms({ context: contextId })

        assert.ok(Array.isArray(result.realms))
        assert.ok(result.realms.length > 0)

        const windowRealm = result.realms.find((r) => r.type === 'window')
        assert.ok(windowRealm, 'should have a window realm')
        assert.ok(windowRealm.realm, 'realm id should be present')
        assert.strictEqual(windowRealm.context, contextId)
      })

      it('can get realms filtered by type', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await script.getRealms({ context: contextId, type: 'window' })

        assert.ok(Array.isArray(result.realms))
        assert.ok(result.realms.every((r) => r.type === 'window'))
      })

      it('can use a realm target for evaluate', async function () {
        const contextId = await driver.getWindowHandle()
        const realmsResult = await script.getRealms({ context: contextId })
        const realmId = realmsResult.realms[0].realm

        const evalResult = await script.evaluate({
          expression: '2 * 21',
          target: { realm: realmId },
          awaitPromise: false,
        })

        assert.strictEqual(evalResult.type, 'success')
        assert.strictEqual(evalResult.result.value, 42)
      })
    })

    describe('preload scripts', function () {
      it('can add and remove a preload script', async function () {
        const result = await script.addPreloadScript({
          functionDeclaration: '() => { window._testPreloaded = true; }',
        })

        assert.ok(result.script, 'script id should be returned')
        assert.strictEqual(typeof result.script, 'string')

        await script.removePreloadScript({ script: result.script })
      })

      it('preload script runs on new page navigation', async function () {
        const preload = await script.addPreloadScript({
          functionDeclaration: '() => { window._preloadedValue = 99; }',
        })

        await driver.get(Pages.emptyPage)

        const contextId = await driver.getWindowHandle()
        const result = await script.evaluate({
          expression: 'window._preloadedValue',
          target: { context: contextId },
          awaitPromise: false,
        })

        assert.strictEqual(result.type, 'success')
        assert.strictEqual(result.result.value, 99)

        await script.removePreloadScript({ script: preload.script })
      })

      it('preload script scoped to a specific context', async function () {
        const contextId = await driver.getWindowHandle()

        const preload = await script.addPreloadScript({
          functionDeclaration: '() => { window._scopedPreload = "scoped"; }',
          contexts: [contextId],
        })

        assert.ok(preload.script)

        await script.removePreloadScript({ script: preload.script })
      })
    })

    describe('realm events', function () {
      it('fires realmCreated when a new context is opened', async function () {
        let realmCreated = null

        await script.onRealmCreated((params) => {
          if (params.type === 'window') {
            realmCreated = params
          }
        })

        // Opening a new window creates a new realm
        await driver.switchTo().newWindow('tab')
        await driver.wait(() => realmCreated !== null, 5000)

        assert.ok(realmCreated, 'realmCreated event should have fired')
        assert.strictEqual(realmCreated.type, 'window')
        assert.ok(realmCreated.realm)
      })

      it('fires realmDestroyed when a context is closed', async function () {
        const newHandle = await driver
          .switchTo()
          .newWindow('tab')
          .then(() => driver.getWindowHandle())

        let realmDestroyed = null
        await script.onRealmDestroyed((params) => {
          realmDestroyed = params
        })

        await driver.close()
        await driver.wait(() => realmDestroyed !== null, 5000)

        // Switch back to original window
        const handles = await driver.getAllWindowHandles()
        await driver.switchTo().window(handles[0])

        assert.ok(realmDestroyed, 'realmDestroyed event should have fired')
        assert.ok(realmDestroyed.realm)
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.FIREFOX] },
)
