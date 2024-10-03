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
const { Browser } = require('selenium-webdriver')
const { Pages, suite, ignore } = require('../../lib/test')
const Network = require('selenium-webdriver/bidi/network')
const until = require('selenium-webdriver/lib/until')

suite(
  function (env) {
    let driver
    let network

    beforeEach(async function () {
      driver = await env.builder().build()
      network = await Network(driver)
    })

    afterEach(async function () {
      await network.close()
      await driver.quit()
    })

    describe('Network network', function () {
      it('can listen to event before request is sent', async function () {
        let beforeRequestEvent = null
        await network.beforeRequestSent(function (event) {
          if (event.request.url.includes('empty')) {
            beforeRequestEvent = event
          }
        })

        await driver.get(Pages.emptyPage)

        assert.equal(beforeRequestEvent.request.method, 'GET')
        const url = beforeRequestEvent.request.url
        assert.equal(url, await driver.getCurrentUrl())
      })

      it('can request cookies', async function () {
        let beforeRequestEvent = null
        await network.beforeRequestSent(function (event) {
          beforeRequestEvent = event
        })

        await driver.get(Pages.emptyText)
        await driver.manage().addCookie({
          name: 'north',
          value: 'biryani',
        })
        await driver.navigate().refresh()

        assert.equal(beforeRequestEvent.request.method, 'GET')
        assert.equal(beforeRequestEvent.request.cookies[0].name, 'north')
        assert.equal(beforeRequestEvent.request.cookies[0].value.value, 'biryani')
        const url = beforeRequestEvent.request.url
        assert.equal(url, await driver.getCurrentUrl())

        await driver.manage().addCookie({
          name: 'south',
          value: 'dosa',
        })
        await driver.navigate().refresh()

        assert.equal(beforeRequestEvent.request.cookies[1].name, 'south')
        assert.equal(beforeRequestEvent.request.cookies[1].value.value, 'dosa')
      })

      ignore(env.browsers(Browser.CHROME, Browser.EDGE)).it('can redirect http equiv', async function () {
        let beforeRequestEvent = []
        await network.beforeRequestSent(function (event) {
          beforeRequestEvent.push(event)
        })

        await driver.get(Pages.redirectedHttpEquiv)
        await driver.wait(until.urlContains('redirected.html'), 1000)

        assert.equal(beforeRequestEvent[0].request.method, 'GET')
        assert(beforeRequestEvent[0].request.url.includes('redirected_http_equiv.html'))
        assert.equal(beforeRequestEvent[2].request.method, 'GET')
        assert(beforeRequestEvent[2].request.url.includes('redirected.html'))
      })

      it('can subscribe to response started', async function () {
        let onResponseStarted = []
        await network.responseStarted(function (event) {
          onResponseStarted.push(event)
        })

        await driver.get(Pages.emptyText)

        assert.equal(onResponseStarted[0].request.method, 'GET')
        assert.equal(onResponseStarted[0].request.url, await driver.getCurrentUrl())
        assert.equal(onResponseStarted[0].response.url, await driver.getCurrentUrl())
        assert.equal(onResponseStarted[0].response.fromCache, false)
        assert(onResponseStarted[0].response.mimeType.includes('text/plain'))
        assert.equal(onResponseStarted[0].response.status, 200)
        assert.equal(onResponseStarted[0].response.statusText, 'OK')
      })

      it('test response started mime type', async function () {
        let onResponseStarted = []
        await network.responseStarted(function (event) {
          onResponseStarted.push(event)
        })

        // Checking mime type for 'html' text
        await driver.get(Pages.emptyPage)
        assert.equal(onResponseStarted[0].request.method, 'GET')
        assert.equal(onResponseStarted[0].request.url, await driver.getCurrentUrl())
        assert.equal(onResponseStarted[0].response.url, await driver.getCurrentUrl())
        assert(onResponseStarted[0].response.mimeType.includes('text/html'))

        // Checking mime type for 'plain' text
        onResponseStarted = []
        await driver.get(Pages.emptyText)
        assert.equal(onResponseStarted[0].response.url, await driver.getCurrentUrl())
        assert(onResponseStarted[0].response.mimeType.includes('text/plain'))
      })

      it('can subscribe to response completed', async function () {
        let onResponseCompleted = []
        await network.responseCompleted(function (event) {
          onResponseCompleted.push(event)
        })

        await driver.get(Pages.emptyPage)

        assert.equal(onResponseCompleted[0].request.method, 'GET')
        assert.equal(onResponseCompleted[0].request.url, await driver.getCurrentUrl())
        assert.equal(onResponseCompleted[0].response.url, await driver.getCurrentUrl())
        assert.equal(onResponseCompleted[0].response.fromCache, false)
        assert(onResponseCompleted[0].response.mimeType.includes('text/html'))
        assert.equal(onResponseCompleted[0].response.status, 200)
        assert.equal(onResponseCompleted[0].response.statusText, 'OK')
        assert.equal(onResponseCompleted[0].redirectCount, 0)
      })

      ignore(env.browsers(Browser.CHROME, Browser.EDGE)).it('can listen to auth required event', async function () {
        let authRequiredEvent = null
        await network.authRequired(function (event) {
          authRequiredEvent = event
        })

        await driver.get(Pages.basicAuth)

        const url = authRequiredEvent.request.url
        assert.equal(authRequiredEvent.id, await driver.getWindowHandle())
        assert.equal(authRequiredEvent.request.method, 'GET')
        assert.equal(url.includes('basicAuth'), true)

        assert.equal(authRequiredEvent.response.status, 401)
        assert.equal(authRequiredEvent.response.headers.length > 1, true)
        assert.equal(authRequiredEvent.response.url.includes('basicAuth'), true)
      })

      it('can listen to fetch error event', async function () {
        let fetchErrorEvent = null
        await network.fetchError(function (event) {
          fetchErrorEvent = event
        })

        try {
          await driver.get('https://not_a_valid_url.test/')
          /*eslint no-unused-vars: "off"*/
        } catch (e) {
          // ignore
        }

        const url = fetchErrorEvent.request.url
        assert.equal(fetchErrorEvent.id, await driver.getWindowHandle())
        assert.equal(fetchErrorEvent.request.method, 'GET')
        assert.equal(url.includes('valid_url'), true)
        assert.equal(fetchErrorEvent.request.headers.length > 1, true)
        assert.notEqual(fetchErrorEvent.errorText, null)
      })

      it('test response completed mime type', async function () {
        let onResponseCompleted = []
        await network.responseCompleted(function (event) {
          onResponseCompleted.push(event)
        })

        // Checking mime type for 'html' text
        await driver.get(Pages.emptyPage)
        assert.equal(onResponseCompleted[0].request.method, 'GET')
        assert.equal(onResponseCompleted[0].request.url, await driver.getCurrentUrl())
        assert.equal(onResponseCompleted[0].response.url, await driver.getCurrentUrl())
        assert(onResponseCompleted[0].response.mimeType.includes('text/html'))

        // Checking mime type for 'plain' text
        onResponseCompleted = []
        await driver.get(Pages.emptyText)
        assert.equal(onResponseCompleted[0].response.url, await driver.getCurrentUrl())
        assert(onResponseCompleted[0].response.mimeType.includes('text/plain'))
      })
    })
  },
  { browsers: [Browser.FIREFOX, Browser.CHROME, Browser.EDGE] },
)
