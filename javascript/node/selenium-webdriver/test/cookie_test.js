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

const assert = require('assert')
const { URL } = require('url')

const { ignore, suite } = require('../lib/test')
const fileserver = require('../lib/test/fileserver')
const { Browser } = require('..')

suite(function (env) {
  let driver

  before(async function () {
    driver = await env.builder().build()
  })

  after(function () {
    return driver.quit()
  })

  describe('Cookie Management;', function () {
    beforeEach(async function () {
      await driver.get(fileserver.Pages.ajaxyPage)
      await driver.manage().deleteAllCookies()
      return assertHasCookies()
    })

    it('can add new cookies', async function () {
      const cookie = createCookieSpec()

      await driver.manage().addCookie(cookie)
      await driver
        .manage()
        .getCookie(cookie.name)
        .then(function (actual) {
          assert.strictEqual(actual.value, cookie.value)
        })
    })

    it('can get all cookies', async function () {
      const cookie1 = createCookieSpec()
      const cookie2 = createCookieSpec()

      await driver.manage().addCookie(cookie1)
      await driver.manage().addCookie(cookie2)

      return assertHasCookies(cookie1, cookie2)
    })

    ignore(env.browsers(Browser.INTERNET_EXPLORER)).it(
      'only returns cookies visible to the current page',
      async function () {
        const cookie1 = createCookieSpec()

        await driver.manage().addCookie(cookie1)

        const pageUrl = fileserver.whereIs('page/1')
        const cookie2 = createCookieSpec({
          path: new URL(pageUrl).pathname,
        })
        await driver.get(pageUrl)
        await driver.manage().addCookie(cookie2)
        await assertHasCookies(cookie1, cookie2)

        await driver.get(fileserver.Pages.ajaxyPage)
        await assertHasCookies(cookie1)

        await driver.get(pageUrl)
        await assertHasCookies(cookie1, cookie2)
      }
    )

    it('can delete all cookies', async function () {
      const cookie1 = createCookieSpec()
      const cookie2 = createCookieSpec()

      await driver.executeScript(
        'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];',
        cookie1.name,
        cookie1.value,
        cookie2.name,
        cookie2.value
      )
      await assertHasCookies(cookie1, cookie2)

      await driver.manage().deleteAllCookies()
      await assertHasCookies()
    })

    it('can delete cookies by name', async function () {
      const cookie1 = createCookieSpec()
      const cookie2 = createCookieSpec()

      await driver.executeScript(
        'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];',
        cookie1.name,
        cookie1.value,
        cookie2.name,
        cookie2.value
      )
      await assertHasCookies(cookie1, cookie2)

      await driver.manage().deleteCookie(cookie1.name)
      await assertHasCookies(cookie2)
    })

    it('should only delete cookie with exact name', async function () {
      const cookie1 = createCookieSpec()
      const cookie2 = createCookieSpec()
      const cookie3 = { name: cookie1.name + 'xx', value: cookie1.value }

      await driver.executeScript(
        'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];' +
          'document.cookie = arguments[4] + "=" + arguments[5];',
        cookie1.name,
        cookie1.value,
        cookie2.name,
        cookie2.value,
        cookie3.name,
        cookie3.value
      )
      await assertHasCookies(cookie1, cookie2, cookie3)

      await driver.manage().deleteCookie(cookie1.name)
      await assertHasCookies(cookie2, cookie3)
    })

    it('can delete cookies set higher in the path', async function () {
      const cookie = createCookieSpec()
      const childUrl = fileserver.whereIs('child/childPage.html')
      const grandchildUrl = fileserver.whereIs(
        'child/grandchild/grandchildPage.html'
      )

      await driver.get(childUrl)
      await driver.manage().addCookie(cookie)
      await assertHasCookies(cookie)

      await driver.get(grandchildUrl)
      await assertHasCookies(cookie)

      await driver.manage().deleteCookie(cookie.name)
      await assertHasCookies()

      await driver.get(childUrl)
      await assertHasCookies()
    })

    ignore(env.browsers(Browser.FIREFOX, Browser.INTERNET_EXPLORER)).it(
      'should retain cookie expiry',
      async function () {
        let expirationDelay = 5 * 1000
        let expiry = new Date(Date.now() + expirationDelay)
        let cookie = createCookieSpec({ expiry })

        await driver.manage().addCookie(cookie)
        await driver
          .manage()
          .getCookie(cookie.name)
          .then(function (actual) {
            assert.strictEqual(actual.value, cookie.value)

            // expiry times should be in seconds since January 1, 1970 UTC
            assert.strictEqual(
              actual.expiry,
              Math.floor(expiry.getTime() / 1000)
            )
          })

        await driver.sleep(expirationDelay)
        await assertHasCookies()
      }
    )

    ignore(
      env.browsers(Browser.FIREFOX, Browser.INTERNET_EXPLORER, Browser.SAFARI)
    ).it('can add same site cookie property to `Strict`', async function () {
      let cookie = createSameSiteCookieSpec('Strict')
      let childUrl = fileserver.whereIs('child/childPage.html')
      await driver.get(childUrl)
      await driver.manage().addCookie(cookie)
      const actual = await driver.manage().getCookie(cookie.name)
      assert.strictEqual(actual.sameSite, 'Strict')
    })

    ignore(
      env.browsers(Browser.FIREFOX, Browser.INTERNET_EXPLORER, Browser.SAFARI)
    ).it('can add same site cookie property to `Lax`', async function () {
      let cookie = createSameSiteCookieSpec('Lax')
      let childUrl = fileserver.whereIs('child/childPage.html')
      await driver.get(childUrl)
      await driver.manage().addCookie(cookie)
      const actualCookie = await driver.manage().getCookie(cookie.name)
      assert.strictEqual(actualCookie.sameSite, 'Lax')
    })

    ignore(env.browsers(Browser.INTERNET_EXPLORER, Browser.SAFARI)).it(
      'can add same site cookie property to `None` when cookie is Secure',
      async function () {
        let cookie = createSameSiteCookieSpec('None', {
          secure: true,
        })
        let childUrl = fileserver.whereIs('child/childPage.html')
        await driver.get(childUrl)
        await driver.manage().addCookie(cookie)
        await assert.doesNotReject(
          async () => await driver.manage().addCookie(cookie)
        )
      }
    )

    ignore(env.browsers(Browser.INTERNET_EXPLORER, Browser.SAFARI)).it(
      'throws an error if same site is set to `None` and the cookie is not Secure',
      async function () {
        let cookie = createSameSiteCookieSpec('None')
        let childUrl = fileserver.whereIs('child/childPage.html')
        await driver.get(childUrl)
        await assert.rejects(
          async () => await driver.manage().addCookie(cookie),
          {
            name: 'InvalidArgumentError',
            message: `Invalid cookie configuration: SameSite=None must be Secure`,
          }
        )
      }
    )

    ignore(env.browsers(Browser.INTERNET_EXPLORER, Browser.SAFARI)).it(
      'throws an error if same site cookie property is invalid',
      async function () {
        let cookie = createSameSiteCookieSpec('Foo')
        let childUrl = fileserver.whereIs('child/childPage.html')
        await driver.get(childUrl)
        await assert.rejects(
          async () => await driver.manage().addCookie(cookie),
          {
            name: 'InvalidArgumentError',
            message: `Invalid sameSite cookie value 'Foo'. It should be one of "Lax", "Strict" or "None"`,
          }
        )
      }
    )
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

  function createSameSiteCookieSpec(sameSiteVal, extraProps) {
    return {
      name: getRandomString(),
      value: getRandomString(),
      sameSite: sameSiteVal,
      ...extraProps,
    }
  }

  function buildCookieMap(cookies) {
    const map = {}
    cookies.forEach(function (cookie) {
      map[cookie.name] = cookie
    })
    return map
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
            JSON.stringify(cookies)
        )

        const map = buildCookieMap(cookies)
        for (let i = 0; i < expected.length; ++i) {
          assert.strictEqual(expected[i].value, map[expected[i].name].value)
        }
      })
  }

  function getRandomString() {
    const x = 1234567890
    return Math.floor(Math.random() * x).toString(36)
  }
})
