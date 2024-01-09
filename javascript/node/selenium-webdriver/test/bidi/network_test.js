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
const firefox = require('../../firefox')
const { Browser, By, WebElement } = require('../../')
const { Pages, suite } = require('../../lib/test')
const NetworkInspector = require('../../bidi/networkInspector')
const until = require('../../lib/until')

suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env
        .builder()
        .setFirefoxOptions(new firefox.Options().enableBidi())
        .build()
    })

    afterEach(async function () {
      await driver.quit()
    })

    describe('Network Inspector', function () {
      it('can listen to event before request is sent', async function () {
        let beforeRequestEvent = null
        const inspector = await NetworkInspector(driver)
        await inspector.beforeRequestSent(function (event) {
          beforeRequestEvent = event
        })

        await driver.get(Pages.emptyPage)

        assert.equal(beforeRequestEvent.request.method, 'GET')
        const url = beforeRequestEvent.request.url
        assert.equal(url, await driver.getCurrentUrl())
      })

      it('can request cookies', async function () {
        const inspector = await NetworkInspector(driver)
        let beforeRequestEvent = null
        await inspector.beforeRequestSent(function (event) {
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
        assert.equal(
          beforeRequestEvent.request.cookies[0].value.value,
          'biryani'
        )
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

      it('can redirect http equiv', async function () {
        let beforeRequestEvent = []
        const inspector = await NetworkInspector(driver)
        await inspector.beforeRequestSent(function (event) {
          beforeRequestEvent.push(event)
        })

        await driver.get(Pages.redirectedHttpEquiv)
        await driver.wait(until.urlContains('redirected.html'), 1000)

        assert.equal(beforeRequestEvent[0].request.method, 'GET')
        assert(
          beforeRequestEvent[0].request.url.includes(
            'redirected_http_equiv.html'
          )
        )
        assert.equal(beforeRequestEvent[2].request.method, 'GET')
        assert(beforeRequestEvent[2].request.url.includes('redirected.html'))
      })

      it('can subscribe to response started', async function () {
        let onResponseStarted = []
        const inspector = await NetworkInspector(driver)
        await inspector.responseStarted(function (event) {
          onResponseStarted.push(event)
        })

        await driver.get(Pages.emptyText)

        assert.equal(onResponseStarted[0].request.method, 'GET')
        assert.equal(
          onResponseStarted[0].request.url,
          await driver.getCurrentUrl()
        )
        assert.equal(
          onResponseStarted[0].response.url,
          await driver.getCurrentUrl()
        )
        assert.equal(onResponseStarted[0].response.fromCache, false)
        assert(onResponseStarted[0].response.mimeType.includes('text/plain'))
        assert.equal(onResponseStarted[0].response.status, 200)
        assert.equal(onResponseStarted[0].response.statusText, 'OK')
      })

      it('test response started mime type', async function () {
        let onResponseStarted = []
        const inspector = await NetworkInspector(driver)
        await inspector.responseStarted(function (event) {
          onResponseStarted.push(event)
        })

        // Checking mime type for 'html' text
        await driver.get(Pages.emptyPage)
        assert.equal(onResponseStarted[0].request.method, 'GET')
        assert.equal(
          onResponseStarted[0].request.url,
          await driver.getCurrentUrl()
        )
        assert.equal(
          onResponseStarted[0].response.url,
          await driver.getCurrentUrl()
        )
        assert(onResponseStarted[0].response.mimeType.includes('text/html'))

        // Checking mime type for 'plain' text
        onResponseStarted = []
        await driver.get(Pages.emptyText)
        assert.equal(
          onResponseStarted[0].response.url,
          await driver.getCurrentUrl()
        )
        assert(onResponseStarted[0].response.mimeType.includes('text/plain'))
      })

      it('can subscribe to response completed', async function () {
        let onResponseCompleted = []
        const inspector = await NetworkInspector(driver)
        await inspector.responseCompleted(function (event) {
          onResponseCompleted.push(event)
        })

        await driver.get(Pages.emptyPage)

        assert.equal(onResponseCompleted[0].request.method, 'GET')
        assert.equal(
          onResponseCompleted[0].request.url,
          await driver.getCurrentUrl()
        )
        assert.equal(
          onResponseCompleted[0].response.url,
          await driver.getCurrentUrl()
        )
        assert.equal(onResponseCompleted[0].response.fromCache, false)
        assert(onResponseCompleted[0].response.mimeType.includes('text/html'))
        assert.equal(onResponseCompleted[0].response.status, 200)
        assert.equal(onResponseCompleted[0].response.statusText, 'OK')
        assert.equal(onResponseCompleted[0].redirectCount, 0)
      })

      it('test response completed mime type', async function () {
        let onResponseCompleted = []
        const inspector = await NetworkInspector(driver)
        await inspector.responseCompleted(function (event) {
          onResponseCompleted.push(event)
        })

        // Checking mime type for 'html' text
        await driver.get(Pages.emptyPage)
        assert.equal(onResponseCompleted[0].request.method, 'GET')
        assert.equal(
          onResponseCompleted[0].request.url,
          await driver.getCurrentUrl()
        )
        assert.equal(
          onResponseCompleted[0].response.url,
          await driver.getCurrentUrl()
        )
        assert(onResponseCompleted[0].response.mimeType.includes('text/html'))

        // Checking mime type for 'plain' text
        onResponseCompleted = []
        await driver.get(Pages.emptyText)
        assert.equal(
          onResponseCompleted[0].response.url,
          await driver.getCurrentUrl()
        )
        assert(onResponseCompleted[0].response.mimeType.includes('text/plain'))
      })
    })

  },
  { browsers: [Browser.FIREFOX] }
)
