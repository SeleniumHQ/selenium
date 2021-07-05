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

const fileServer = require('../lib/test/fileserver')
const test = require('../lib/test')
const until = require('../lib/until')

test.suite(
  function (env) {
    let driver

    before(async function () {
      driver = await env.builder().build()
    })
    after(() => driver.quit())

    it('sends Page.enable command using devtools', async function () {
      const cdpConnection = await driver.createCDPConnection('page')
      cdpConnection.execute('Page.enable', 1, {}, function (_res, err) {
        assert(!err)
      })
    })

    it('sends Network and Page command using devtools', async function () {
      const cdpConnection = await driver.createCDPConnection('page')
      cdpConnection.execute('Network.enable', 1, {}, function (_res, err) {
        assert(!err)
      })

      cdpConnection.execute(
        'Page.navigate',
        1,
        { url: 'chrome://newtab/' },
        function (_res, err) {
          assert(!err)
        }
      )
    })

    describe('JS CDP events', function () {
      it('calls the event listener for console.log', async function () {
        const cdpConnection = await driver.createCDPConnection('page')
        await driver.onLogEvent(cdpConnection, function (event) {
          assert.strictEqual(event['args'][0]['value'], 'here')
        })
        await driver.executeScript('console.log("here")')
      })

      it('calls the event listener for js exceptions', async function () {
        const cdpConnection = await driver.createCDPConnection('page')
        await driver.onLogException(cdpConnection, function (event) {
          assert.strictEqual(
            event['exceptionDetails']['stackTrace']['callFrames'][0][
              'functionName'
            ],
            'onmouseover'
          )
        })
        await driver.get(test.Pages.javascriptPage)
        let element = driver.findElement({ id: 'throwing-mouseover' })
        await element.click()
      })
    })

    describe('JS DOM events', function () {
      it('calls the event listener on dom mutations', async function () {
        const cdpConnection = await driver.createCDPConnection('page')
        await driver.logMutationEvents(cdpConnection, function (event) {
          assert.strictEqual(event['attribute_name'], 'style')
          assert.strictEqual(event['current_value'], '')
          assert.strictEqual(event['old_value'], 'display:none;')
        })

        await driver.get(fileServer.Pages.dynamicPage)

        let element = driver.findElement({ id: 'reveal' })
        await element.click()
        let revealed = driver.findElement({ id: 'revealed' })
        await driver.wait(until.elementIsVisible(revealed), 5000)
      })
    })

    describe('Basic Auth Injection', function () {
      it('denies entry if username and password do not match', async function () {
        const pageCdpConnection = await driver.createCDPConnection('page')

        await driver.register('random', 'random', pageCdpConnection)
        await driver.get(fileServer.Pages.basicAuth)
        let source = await driver.getPageSource()
        assert.ok(
          !source.includes('Access granted!'),
          `The Source is \n ${source}`
        )
      })

      it('grants access if username and password are a match', async function () {
        const pageCdpConnection = await driver.createCDPConnection('page')

        await driver.register('genie', 'bottle', pageCdpConnection)
        await driver.get(fileServer.Pages.basicAuth)
        let source = await driver.getPageSource()
        assert.strictEqual(source.includes('Access granted!'), true)
      })
    })
  },
  { browsers: ['chrome'] }
)
