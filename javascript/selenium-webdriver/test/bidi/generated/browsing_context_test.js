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
const { suite, ignore, Pages } = require('../../../lib/test')
const { Browser, until } = require('selenium-webdriver')

// Generated BrowsingContext domain class produced by generate_bidi.mjs.
const { BrowsingContext } = require('selenium-webdriver/bidi/generated/browsing_context')

suite(
  function (env) {
    let driver
    let browsingContext

    beforeEach(async function () {
      driver = await env.builder().build()
      browsingContext = await BrowsingContext.create(driver)
    })

    afterEach(function () {
      return driver.quit()
    })

    describe('create and close', function () {
      it('can create a new tab', async function () {
        const result = await browsingContext.create({ type: 'tab' })

        assert.ok(result.context, 'context id should be present')
        assert.strictEqual(typeof result.context, 'string')

        await browsingContext.close({ context: result.context })
      })

      it('can create a new window', async function () {
        const result = await browsingContext.create({ type: 'window' })

        assert.ok(result.context)
        assert.strictEqual(typeof result.context, 'string')

        await browsingContext.close({ context: result.context })
      })

      it('can get browsing context tree', async function () {
        const contextId = await driver.getWindowHandle()
        const treeResult = await browsingContext.getTree({ root: contextId })

        assert.ok(Array.isArray(treeResult.contexts))
        assert.strictEqual(treeResult.contexts.length, 1)
        assert.strictEqual(treeResult.contexts[0].context, contextId)
      })

      it('can get tree with max depth', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await browsingContext.getTree({ root: contextId, maxDepth: 1 })

        assert.ok(Array.isArray(result.contexts))
      })
    })

    describe('navigation', function () {
      it('can navigate to a url', async function () {
        const contextId = await driver.getWindowHandle()
        const result = await browsingContext.navigate({
          context: contextId,
          url: Pages.emptyPage,
          wait: 'complete',
        })

        assert.ok(result.url.includes('emptyPage') || result.url.includes('empty'))
      })

      it('can reload a page', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })

        const result = await browsingContext.reload({ context: contextId, wait: 'complete' })

        assert.ok(result.url)
      })

      it('can traverse history back and forward', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })
        await browsingContext.navigate({ context: contextId, url: Pages.logEntryAdded, wait: 'complete' })

        // Navigate back
        await browsingContext.traverseHistory({ context: contextId, delta: -1 })
        await driver.wait(until.urlContains('emptyPage'), 5000)

        const url = await driver.getCurrentUrl()
        assert.ok(url.includes('emptyPage') || url.includes('empty'))

        // Navigate forward
        await browsingContext.traverseHistory({ context: contextId, delta: 1 })
        await driver.wait(until.urlContains('logEntryAdded'), 5000)
      })
    })

    describe('activate', function () {
      it('can activate a browsing context', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.activate({ context: contextId })
      })
    })

    describe('viewport and screenshot', function () {
      it('can set viewport size', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.setViewport({
          context: contextId,
          viewport: { width: 800, height: 600 },
        })
      })

      it('can capture a screenshot', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })

        const result = await browsingContext.captureScreenshot({ context: contextId })

        assert.ok(result.data, 'screenshot data should be present')
        assert.strictEqual(typeof result.data, 'string')
        assert.ok(result.data.length > 0)
      })

      it('can capture screenshot with viewport origin', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })

        const result = await browsingContext.captureScreenshot({
          context: contextId,
          origin: 'viewport',
        })

        assert.ok(result.data)
        assert.ok(result.data.length > 0)
      })
    })

    describe('handleUserPrompt', function () {
      it('can accept an alert', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.alertsPage, wait: 'complete' })

        await driver.findElement({ id: 'alert' }).click()
        await driver.wait(until.alertIsPresent(), 5000)

        // Dismiss the alert using the generated API
        await browsingContext.handleUserPrompt({ context: contextId, accept: true })
      })

      it('can dismiss a confirm dialog', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.alertsPage, wait: 'complete' })

        await driver.findElement({ id: 'confirm' }).click()
        await driver.wait(until.alertIsPresent(), 5000)

        await browsingContext.handleUserPrompt({ context: contextId, accept: false })
      })
    })

    describe('context lifecycle events', function () {
      it('fires contextCreated when a new tab is opened', async function () {
        let createdContext = null

        await browsingContext.onContextCreated((params) => {
          createdContext = params
        })

        const result = await browsingContext.create({ type: 'tab' })

        await driver.wait(() => createdContext !== null, 5000)
        assert.ok(createdContext, 'contextCreated event should have fired')
        assert.ok(createdContext.context)

        await browsingContext.close({ context: result.context })
      })

      it('fires contextDestroyed when a tab is closed', async function () {
        const created = await browsingContext.create({ type: 'tab' })

        let destroyedContext = null
        await browsingContext.onContextDestroyed((params) => {
          if (params.context === created.context) {
            destroyedContext = params
          }
        })

        await browsingContext.close({ context: created.context })

        await driver.wait(() => destroyedContext !== null, 5000)
        assert.ok(destroyedContext, 'contextDestroyed event should have fired')
      })
    })

    describe('navigation events', function () {
      it('fires navigationCommitted on page navigate', async function () {
        const contextId = await driver.getWindowHandle()
        let navEvent = null

        await browsingContext.onNavigationCommitted((params) => {
          if (params.context === contextId) {
            navEvent = params
          }
        })

        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })
        await driver.wait(() => navEvent !== null, 5000)

        assert.ok(navEvent, 'navigationCommitted event should have fired')
        assert.strictEqual(navEvent.context, contextId)
        assert.ok(navEvent.url)
      })

      it('fires fragmentNavigated on hash change', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.emptyPage, wait: 'complete' })

        let fragmentEvent = null
        await browsingContext.onFragmentNavigated((params) => {
          if (params.context === contextId) {
            fragmentEvent = params
          }
        })

        // Trigger a hash navigation
        await driver.executeScript('window.location.hash = "section1"')
        await driver.wait(() => fragmentEvent !== null, 5000)

        assert.ok(fragmentEvent, 'fragmentNavigated event should have fired')
      })
    })

    describe('user prompt events', function () {
      it('fires userPromptOpened when an alert appears', async function () {
        const contextId = await driver.getWindowHandle()
        let promptOpened = null

        await browsingContext.onUserPromptOpened((params) => {
          if (params.context === contextId) {
            promptOpened = params
          }
        })

        await browsingContext.navigate({ context: contextId, url: Pages.alertsPage, wait: 'complete' })
        await driver.findElement({ id: 'alert' }).click()
        await driver.wait(() => promptOpened !== null, 5000)

        assert.ok(promptOpened, 'userPromptOpened should have fired')
        assert.strictEqual(promptOpened.type, 'alert')

        await browsingContext.handleUserPrompt({ context: contextId, accept: true })
      })

      it('fires userPromptClosed when an alert is handled', async function () {
        const contextId = await driver.getWindowHandle()
        let promptClosed = null

        await browsingContext.onUserPromptClosed((params) => {
          if (params.context === contextId) {
            promptClosed = params
          }
        })

        await browsingContext.navigate({ context: contextId, url: Pages.alertsPage, wait: 'complete' })
        await driver.findElement({ id: 'alert' }).click()
        await driver.wait(until.alertIsPresent(), 5000)

        await browsingContext.handleUserPrompt({ context: contextId, accept: true })
        await driver.wait(() => promptClosed !== null, 5000)

        assert.ok(promptClosed, 'userPromptClosed should have fired')
        assert.strictEqual(promptClosed.accepted, true)
      })
    })

    describe('locateNodes', function () {
      it('can locate nodes by css selector', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.logEntryAdded, wait: 'complete' })

        const result = await browsingContext.locateNodes({
          context: contextId,
          locator: { type: 'css', value: 'button' },
        })

        assert.ok(Array.isArray(result.nodes))
        assert.ok(result.nodes.length > 0)
      })

      it('can locate nodes with maxNodeCount', async function () {
        const contextId = await driver.getWindowHandle()
        await browsingContext.navigate({ context: contextId, url: Pages.logEntryAdded, wait: 'complete' })

        const result = await browsingContext.locateNodes({
          context: contextId,
          locator: { type: 'css', value: 'button' },
          maxNodeCount: 1,
        })

        assert.ok(Array.isArray(result.nodes))
        assert.strictEqual(result.nodes.length, 1)
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.FIREFOX] },
)
