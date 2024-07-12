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
require('../../lib/test/fileserver')
const { suite } = require('../../lib/test')
const { Browser } = require('selenium-webdriver')
const Storage = require('selenium-webdriver/bidi/storage')
const fileserver = require('../../lib/test/fileserver')
const { CookieFilter } = require('selenium-webdriver/bidi/cookieFilter')
const { BytesValue, SameSite } = require('selenium-webdriver/bidi/networkTypes')
const { BrowsingContextPartitionDescriptor } = require('selenium-webdriver/bidi/partitionDescriptor')
const { PartialCookie } = require('selenium-webdriver/bidi/partialCookie')

suite(
  function (env) {
    describe('BiDi Storage', function () {
      let driver

      beforeEach(async function () {
        driver = await env.builder().build()
        await driver.get(fileserver.Pages.ajaxyPage)
        await driver.manage().deleteAllCookies()
        return assertHasCookies()
      })

      afterEach(function () {
        return driver.quit()
      })

      it('can get cookie by name', async function () {
        const cookie = createCookieSpec()

        await driver.manage().addCookie(cookie)

        const cookieFilter = new CookieFilter()
          .name(cookie.name)
          .value(new BytesValue(BytesValue.Type.STRING, cookie.value))

        const storage = await Storage(driver)
        const result = await storage.getCookies(cookieFilter)

        assert.strictEqual(result.cookies[0].value.value, cookie.value)
      })

      xit('can get cookie in default user context', async function () {
        const windowHandle = await driver.getWindowHandle()
        const cookie = createCookieSpec()

        await driver.manage().addCookie(cookie)

        const cookieFilter = new CookieFilter()
          .name(cookie.name)
          .value(new BytesValue(BytesValue.Type.STRING, cookie.value))

        await driver.switchTo().newWindow('window')

        const descriptor = new BrowsingContextPartitionDescriptor(await driver.getWindowHandle())

        const storage = await Storage(driver)
        const resultAfterSwitchingContext = await storage.getCookies(cookieFilter, descriptor)

        assert.strictEqual(resultAfterSwitchingContext.cookies[0].value.value, cookie.value)

        await driver.switchTo().window(windowHandle)

        const descriptorAfterSwitchingBack = new BrowsingContextPartitionDescriptor(await driver.getWindowHandle())

        const result = await storage.getCookies(cookieFilter, descriptorAfterSwitchingBack)

        assert.strictEqual(result.cookies[0].value.value, cookie.value)

        const partitionKey = result.partitionKey

        assert.notEqual(partitionKey.userContext, null)
        assert.notEqual(partitionKey.sourceOrigin, null)
        assert.strictEqual(partitionKey.userContext, 'default')
      })

      it('can add cookie', async function () {
        const cookie = createCookieSpec()

        const storage = await Storage(driver)

        await storage.setCookie(
          new PartialCookie(cookie.name, new BytesValue(BytesValue.Type.STRING, cookie.value), fileserver.whereIs('/')),
        )

        const cookieFilter = new CookieFilter()
          .name(cookie.name)
          .value(new BytesValue(BytesValue.Type.STRING, cookie.value))

        const result = await storage.getCookies(cookieFilter)

        assert.strictEqual(result.cookies[0].value.value, cookie.value)
      })

      it('can add and get cookie with all parameters', async function () {
        const cookie = createCookieSpec()

        const storage = await Storage(driver)

        const now = Date.now()
        const oneHourInMillis = 3600 * 1000
        const expiry = now + oneHourInMillis

        const partitionDescriptor = new BrowsingContextPartitionDescriptor(await driver.getWindowHandle())

        await storage.setCookie(
          new PartialCookie(cookie.name, new BytesValue(BytesValue.Type.STRING, cookie.value), fileserver.whereIs('/'))
            .path('/ajaxy_page.html')
            .size(100)
            .httpOnly(true)
            .secure(false)
            .sameSite(SameSite.LAX)
            .expiry(expiry),
          partitionDescriptor,
        )

        const cookieFilter = new CookieFilter()
          .name(cookie.name)
          .value(new BytesValue(BytesValue.Type.STRING, cookie.value))

        const result = await storage.getCookies(cookieFilter)

        const resultCookie = result.cookies[0]

        assert.strictEqual(resultCookie.name, cookie.name)
        assert.strictEqual(resultCookie.value.value, cookie.value)
        assert.strictEqual(resultCookie.domain.includes('http'), true)
        assert.strictEqual(resultCookie.path, '/ajaxy_page.html')
        assert.strictEqual(resultCookie.size > 0, true)
        assert.strictEqual(resultCookie.httpOnly, true)
        assert.strictEqual(resultCookie.secure, false)
        assert.strictEqual(resultCookie.sameSite, SameSite.LAX)
        assert.notEqual(resultCookie.expires, null)
      })

      it('can get all cookies', async function () {
        const cookie1 = createCookieSpec()
        const cookie2 = createCookieSpec()

        await driver.manage().addCookie(cookie1)
        await driver.manage().addCookie(cookie2)

        const storage = await Storage(driver)
        const result = await storage.getCookies()

        assert.strictEqual(result.cookies[0].value.value, cookie1.value)
        assert.strictEqual(result.cookies[1].value.value, cookie2.value)
      })

      xit('can delete all cookies', async function () {
        const cookie1 = createCookieSpec()
        const cookie2 = createCookieSpec()

        await driver.manage().addCookie(cookie1)
        await driver.manage().addCookie(cookie2)

        const storage = await Storage(driver)

        await storage.deleteCookies(new CookieFilter())

        const result = await storage.getCookies()

        assert.strictEqual(result.cookies.length, 0)
      })

      xit('can delete cookie by name', async function () {
        const cookie1 = createCookieSpec()
        const cookie2 = createCookieSpec()

        const storage = await Storage(driver)

        await driver.manage().addCookie(cookie1)
        await driver.manage().addCookie(cookie2)

        const result1 = await storage.getCookies(new CookieFilter())
        assert.strictEqual(result1.cookies.length, 2)

        await storage.deleteCookies(new CookieFilter().name(cookie1.name))

        const result = await storage.getCookies(new CookieFilter())

        assert.strictEqual(result.cookies.length, 1)
      })

      function createCookieSpec(opt_options) {
        let spec = {
          name: getRandomString(),
          value: getRandomString(),
        }
        if (opt_options) {
          spec = Object.assign(spec, opt_options)
        }
        return spec
      }

      function assertHasCookies(...expected) {
        return driver
          .manage()
          .getCookies()
          .then(function (cookies) {
            assert.strictEqual(
              cookies.length,
              expected.length,
              'Wrong # of cookies.' +
                '\n  Expected: ' +
                JSON.stringify(expected) +
                '\n  Was     : ' +
                JSON.stringify(cookies),
            )

            const map = buildCookieMap(cookies)
            for (let i = 0; i < expected.length; ++i) {
              assert.strictEqual(expected[i].value, map[expected[i].name].value)
            }
          })
      }

      function buildCookieMap(cookies) {
        const map = {}
        cookies.forEach(function (cookie) {
          map[cookie.name] = cookie
        })
        return map
      }

      function getRandomString() {
        const x = 1234567890
        return Math.floor(Math.random() * x).toString(36)
      }
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
