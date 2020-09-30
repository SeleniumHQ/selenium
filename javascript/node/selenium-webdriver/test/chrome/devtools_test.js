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
const Server = require('../../lib/test/httpserver').Server

test.suite(
  function (env) {
    let driver

    before(async function () {
      driver = await env
        .builder()
        .setChromeOptions(new chrome.Options().headless())
        .build()
    })
    after(() => driver.quit())

    it('can send commands to devtools', async function () {
      await driver.get(test.Pages.ajaxyPage)
      assert.equal(await driver.getCurrentUrl(), test.Pages.ajaxyPage)

      await driver.sendDevToolsCommand('Page.navigate', {
        url: test.Pages.echoPage,
      })
      assert.equal(await driver.getCurrentUrl(), test.Pages.echoPage)
    })

    it('can send commands to devtools and get return', async function () {
      await driver.get(test.Pages.ajaxyPage)
      assert.equal(await driver.getCurrentUrl(), test.Pages.ajaxyPage)

      await driver.get(test.Pages.echoPage)
      assert.equal(await driver.getCurrentUrl(), test.Pages.echoPage)

      let history = await driver.sendDevToolsCommandAndGetReturn(
        'Page.getNavigationHistory'
      )
      assert(history)
      assert(history.currentIndex >= 2)
      assert.equal(
        history.entries[history.currentIndex].url,
        test.Pages.echoPage
      )
      assert.equal(
        history.entries[history.currentIndex - 1].url,
        test.Pages.ajaxyPage
      )
    })

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

    describe('Basic Auth Injection', function () {
      const server = new Server(function(req, res) {
        if (req.method == 'GET' && req.url == '/protected') {
          const denyAccess = function () {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="test"' })
            res.end('Access denied')
          }

          const basicAuthRegExp = /^\s*basic\s+([a-z0-9\-\._~\+\/]+)=*\s*$/i
          const auth = req.headers.authorization
          const match = basicAuthRegExp.exec(auth || '')
          if (!match) {
            denyAccess()
            return
          }

          const userNameAndPass = Buffer.from(match[1], 'base64').toString()
          const parts = userNameAndPass.split(':', 2)
          if (parts[0] !== 'genie' && parts[1] !== 'bottle') {
            denyAccess()
            return
          }

          res.writeHead(200, { 'content-type': 'text/plain' })
          res.end('Access granted!')
        }
      })

      server.start()

      it('denies entry if username and password do not match', async function() {
        const pageCdpConnection = await driver.createCDPConnection('page')

        await driver.register('random', 'random', pageCdpConnection)
        await driver.get(server.url() + '/protected')
        let source = await driver.getPageSource()
        assert.equal(source.includes('Access granted!'), false)
      })

      it('grants access if username and password are a match', async function() {
        const pageCdpConnection = await driver.createCDPConnection('page')

        await driver.register('genie', 'bottle', pageCdpConnection)
        await driver.get(server.url() + '/protected')
        let source = await driver.getPageSource()
        assert.equal(source.includes('Access granted!'), true)
        await server.stop()
      })
    })

    describe('setDownloadPath', function () {
      it('can enable downloads in headless mode', async function () {
        const dir = await io.tmpDir()
        await driver.setDownloadPath(dir)

        const url = fileServer.whereIs('/data/firefox/webextension.xpi')
        await driver.get(`data:text/html,<!DOCTYPE html>
  <div><a download="" href="${url}">Go!</a></div>`)

        await driver.findElement({ css: 'a' }).click()

        const downloadPath = path.join(dir, 'webextension.xpi')
        await driver.wait(() => io.exists(downloadPath), 5000)

        const goldenPath = path.join(
          __dirname,
          '../../lib/test/data/firefox/webextension.xpi'
        )
        assert.equal(
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
