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
const fs = require('fs')
const path = require('path')

const chrome = require('../../chrome')
const error = require('../../lib/error')
const fileServer = require('../../lib/test/fileserver')
const io = require('../../io')
const test = require('../../lib/test')
const until = require('../../lib/until')

test.suite(
  function (env) {
    let driver

    beforeEach(async function () {
      driver = await env
        .builder()
        .setChromeOptions(new chrome.Options().headless())
        .build()
    })
    afterEach(async () => await driver.quit())

    it('can send commands to devtools', async function () {
      await driver.get(test.Pages.ajaxyPage)
      assert.strictEqual(await driver.getCurrentUrl(), test.Pages.ajaxyPage)

      await driver.sendDevToolsCommand('Page.navigate', {
        url: test.Pages.echoPage,
      })
      assert.strictEqual(await driver.getCurrentUrl(), test.Pages.echoPage)
    })

    it('can send commands to devtools and get return', async function () {
      await driver.get(test.Pages.ajaxyPage)
      assert.strictEqual(await driver.getCurrentUrl(), test.Pages.ajaxyPage)

      await driver.get(test.Pages.echoPage)
      assert.strictEqual(await driver.getCurrentUrl(), test.Pages.echoPage)

      let history = await driver.sendAndGetDevToolsCommand(
        'Page.getNavigationHistory'
      )
      assert(history)
      assert(history.currentIndex >= 2)
      assert.strictEqual(
        history.entries[history.currentIndex].url,
        test.Pages.echoPage
      )
      assert.strictEqual(
        history.entries[history.currentIndex - 1].url,
        test.Pages.ajaxyPage
      )
    })

    it('sends Page.enable command using devtools', async function () {
      const cdpConnection = await driver.createCDPConnection('page')
      cdpConnection.execute('Page.enable', {}, function (_res, err) {
        assert(!err)
      })
    })

    it('sends Network and Page command using devtools', async function () {
      const cdpConnection = await driver.createCDPConnection('page')
      cdpConnection.execute('Network.enable', {}, function (_res, err) {
        assert(!err)
      })

      cdpConnection.execute(
        'Page.navigate',
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
        assert.strictEqual(source.includes('Access granted!'), false, source)
      })
    })

    describe('Basic Auth Injection', function () {
      it('grants access if username and password are a match', async function () {
        const pageCdpConnection = await driver.createCDPConnection('page')

        await driver.register('genie', 'bottle', pageCdpConnection)
        await driver.get(fileServer.Pages.basicAuth)
        let source = await driver.getPageSource()
        assert.strictEqual(source.includes('Access granted!'), true)
      })
    })

    describe('setDownloadPath', function () {
      it('can enable downloads in headless mode', async function () {
        const dir = await io.tmpDir()
        await driver.setDownloadPath(dir)

        const url = fileServer.whereIs('/data/chrome/download.bin')
        await driver.get(`data:text/html,<!DOCTYPE html>
  <div><a download="" href="${url}">Go!</a></div>`)

        await driver.findElement({ css: 'a' }).click()

        const downloadPath = path.join(dir, 'download.bin')
        await driver.wait(() => io.exists(downloadPath), 5000)

        const goldenPath = path.join(
          __dirname,
          '../../lib/test/data/chrome/download.bin'
        )
        assert.strictEqual(
          fs.readFileSync(downloadPath, 'binary'),
          fs.readFileSync(goldenPath, 'binary')
        )
      })

      it('throws if path is not a directory', async function () {
        await assertInvalidArgumentError(() => driver.setDownloadPath())
        await assertInvalidArgumentError(() => driver.setDownloadPath(null))
        await assertInvalidArgumentError(() => driver.setDownloadPath(''))
        await assertInvalidArgumentError(() => driver.setDownloadPath(1234))

        const file = await io.tmpFile()
        await assertInvalidArgumentError(() => driver.setDownloadPath(file))

        async function assertInvalidArgumentError(fn) {
          try {
            await fn()
            return Promise.reject(Error('should have failed'))
          } catch (err) {
            if (err instanceof error.InvalidArgumentError) {
              return
            }
            throw err
          }
        }
      })
    })
  },
  { browsers: ['chrome'] }
)
