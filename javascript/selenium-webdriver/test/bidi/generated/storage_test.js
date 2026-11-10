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

const { Storage } = require('selenium-webdriver/bidi/generated/storage')

suite(
  function (env) {
    let driver
    let storage

    beforeEach(async function () {
      driver = await env.builder().build()
      storage = await Storage.create(driver)
      // Navigate to a page so cookie operations have a valid origin
      await driver.get(Pages.ajaxyPage)
      await driver.manage().deleteAllCookies()
    })

    afterEach(function () {
      return driver.quit()
    })

    describe('setCookie and getCookies', function () {
      it('can set and get a cookie by name', async function () {
        const url = await driver.getCurrentUrl()
        const domain = new URL(url).hostname

        await storage.setCookie({
          cookie: {
            name: 'test-cookie',
            value: { type: 'string', value: 'test-value' },
            domain,
          },
        })

        const result = await storage.getCookies({
          filter: { name: 'test-cookie' },
        })

        assert.ok(result.cookies.length >= 1)
        const found = result.cookies.find((c) => c.name === 'test-cookie')
        assert.ok(found)
        assert.strictEqual(found.value.value, 'test-value')
      })

      it('can set a cookie with path and httpOnly', async function () {
        const url = await driver.getCurrentUrl()
        const domain = new URL(url).hostname

        await storage.setCookie({
          cookie: {
            name: 'secure-cookie',
            value: { type: 'string', value: 'secure-val' },
            domain,
            path: '/',
            httpOnly: true,
          },
        })

        const result = await storage.getCookies({
          filter: { name: 'secure-cookie' },
        })

        assert.ok(result.cookies.length >= 1)
        const found = result.cookies.find((c) => c.name === 'secure-cookie')
        assert.ok(found)
        assert.strictEqual(found.httpOnly, true)
      })

      it('getCookies returns partition key', async function () {
        const url = await driver.getCurrentUrl()
        const domain = new URL(url).hostname

        await storage.setCookie({
          cookie: {
            name: 'partition-test',
            value: { type: 'string', value: 'pval' },
            domain,
          },
        })

        const contextId = await driver.getWindowHandle()
        const result = await storage.getCookies({
          filter: { name: 'partition-test' },
          partition: { type: 'context', context: contextId },
        })

        assert.ok(result.partitionKey !== undefined)
        assert.ok(result.cookies.length >= 1)
      })

      it('can filter cookies by domain', async function () {
        const url = await driver.getCurrentUrl()
        const domain = new URL(url).hostname

        await storage.setCookie({
          cookie: {
            name: 'domain-cookie',
            value: { type: 'string', value: 'domain-val' },
            domain,
          },
        })

        const result = await storage.getCookies({
          filter: { domain },
        })

        assert.ok(result.cookies.length >= 1)
      })

      it('getCookies returns empty when no cookies match filter', async function () {
        const result = await storage.getCookies({
          filter: { name: 'nonexistent-cookie-xyz-123' },
        })

        assert.strictEqual(result.cookies.length, 0)
      })
    })

    describe('deleteCookies', function () {
      it('can delete a specific cookie by name', async function () {
        const url = await driver.getCurrentUrl()
        const domain = new URL(url).hostname

        // Add two cookies
        await storage.setCookie({
          cookie: {
            name: 'cookie-to-delete',
            value: { type: 'string', value: 'delete-me' },
            domain,
          },
        })
        await storage.setCookie({
          cookie: {
            name: 'cookie-to-keep',
            value: { type: 'string', value: 'keep-me' },
            domain,
          },
        })

        // Delete one
        const deleteResult = await storage.deleteCookies({
          filter: { name: 'cookie-to-delete' },
        })

        assert.ok(deleteResult.partitionKey !== undefined)

        // Verify it's gone
        const remaining = await storage.getCookies({
          filter: { name: 'cookie-to-delete' },
        })
        assert.strictEqual(remaining.cookies.length, 0)

        // Verify the other is still there
        const kept = await storage.getCookies({
          filter: { name: 'cookie-to-keep' },
        })
        assert.ok(kept.cookies.length >= 1)
      })

      it('can delete all cookies for a domain', async function () {
        const url = await driver.getCurrentUrl()
        const domain = new URL(url).hostname

        await storage.setCookie({
          cookie: {
            name: 'c1',
            value: { type: 'string', value: 'v1' },
            domain,
          },
        })
        await storage.setCookie({
          cookie: {
            name: 'c2',
            value: { type: 'string', value: 'v2' },
            domain,
          },
        })

        await storage.deleteCookies({ filter: { domain } })

        const result = await storage.getCookies({ filter: { domain } })
        assert.strictEqual(result.cookies.length, 0)
      })

      it('deleteCookies with context partition', async function () {
        const url = await driver.getCurrentUrl()
        const domain = new URL(url).hostname
        const contextId = await driver.getWindowHandle()

        await storage.setCookie({
          cookie: {
            name: 'ctx-cookie',
            value: { type: 'string', value: 'ctx-val' },
            domain,
          },
        })

        const result = await storage.deleteCookies({
          filter: { name: 'ctx-cookie' },
          partition: { type: 'context', context: contextId },
        })

        assert.ok(result.partitionKey !== undefined)
      })
    })
  },
  { browsers: [Browser.CHROME, Browser.FIREFOX] },
)
