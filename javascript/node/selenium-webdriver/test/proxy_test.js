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
const proxy = require('../proxy')
const test = require('../lib/test')
const { Browser } = require('..')
const { Server } = require('../lib/test/httpserver')

test.suite(function (env) {
  function writeResponse(res, body, encoding, contentType) {
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(body, encoding),
      'Content-Type': contentType,
    })
    res.end(body)
  }

  function writePacFile(res) {
    writeResponse(
      res,
      [
        'function FindProxyForURL(url, host) {',
        '  if (shExpMatch(url, "' + goodbyeServer.url('*') + '")) {',
        '    return "DIRECT";',
        '  }',
        '  return "PROXY ' + proxyServer.host() + '";',
        '}',
      ].join('\n'),
      'ascii',
      'application/x-javascript-config'
    )
  }

  const proxyServer = new Server(function (req, res) {
    const pathname = new URL(req.url).pathname
    if (pathname === '/proxy.pac') {
      return writePacFile(res)
    }

    writeResponse(
      res,
      [
        '<!DOCTYPE html>',
        '<title>Proxy page</title>',
        '<h3>This is the proxy landing page</h3>',
      ].join(''),
      'utf8',
      'text/html; charset=UTF-8'
    )
  })

  const helloServer = new Server(function (_req, res) {
    writeResponse(
      res,
      [
        '<!DOCTYPE html>',
        '<title>Hello</title>',
        '<h3>Hello, world!</h3>',
      ].join(''),
      'utf8',
      'text/html; charset=UTF-8'
    )
  })

  const goodbyeServer = new Server(function (_req, res) {
    writeResponse(
      res,
      [
        '<!DOCTYPE html>',
        '<title>Goodbye</title>',
        '<h3>Goodbye, world!</h3>',
      ].join(''),
      'utf8',
      'text/html; charset=UTF-8'
    )
  })

  // Cannot pass start directly to mocha's before, as mocha will interpret the optional
  // port parameter as an async callback parameter.
  function mkStartFunc(server) {
    return function () {
      return server.start()
    }
  }

  before(mkStartFunc(proxyServer))
  before(mkStartFunc(helloServer))
  before(mkStartFunc(goodbyeServer))

  after(proxyServer.stop.bind(proxyServer))
  after(helloServer.stop.bind(helloServer))
  after(goodbyeServer.stop.bind(goodbyeServer))

  let driver
  beforeEach(function () {
    driver = null
  })
  afterEach(function () {
    return driver && driver.quit()
  })

  function createDriver(proxy) {
    return (driver = env.builder().setProxy(proxy).build())
  }

  // Proxy support not implemented.
  test
    .ignore(
      env.browsers(
        Browser.CHROME,
        Browser.INTERNET_EXPLORER,
        Browser.SAFARI,
        Browser.FIREFOX
      )
    )
    .describe('manual proxy settings', function () {
      it('can configure HTTP proxy host', async function () {
        await createDriver(
          proxy.manual({
            http: proxyServer.host(),
            bypass: [],
          })
        )

        await driver.get(helloServer.url())
        assert.strictEqual(await driver.getTitle(), 'Proxy page')
        assert.strictEqual(
          await driver.findElement({ tagName: 'h3' }).getText(),
          'This is the proxy landing page'
        )
      })

      it('can bypass proxy for specific hosts', async function () {
        await createDriver(
          proxy.manual({
            http: proxyServer.host(),
            bypass: [helloServer.host()],
          })
        )

        await driver.get(helloServer.url())
        assert.strictEqual(await driver.getTitle(), 'Hello')
        assert.strictEqual(
          await driver.findElement({ tagName: 'h3' }).getText(),
          'Hello, world!'
        )

        // For firefox the no proxy settings appear to match on hostname only.
        let url = goodbyeServer.url().replace(/127\.0\.0\.1/, 'localhost')
        await driver.get(url)
        assert.strictEqual(await driver.getTitle(), 'Proxy page')
        assert.strictEqual(
          await driver.findElement({ tagName: 'h3' }).getText(),
          'This is the proxy landing page'
        )
      })

      // TODO: test ftp and https proxies.
    })

  // PhantomJS does not support PAC file proxy configuration.
  // Safari does not support proxies.
  test
    .ignore(
      env.browsers(
        Browser.INTERNET_EXPLORER,
        Browser.SAFARI,
        Browser.CHROME,
        Browser.FIREFOX
      )
    )
    .describe('pac proxy settings', function () {
      it('can configure proxy through PAC file', async function () {
        await createDriver(proxy.pac(proxyServer.url('/proxy.pac')))

        await driver.get(helloServer.url())
        assert.strictEqual(await driver.getTitle(), 'Proxy page')
        assert.strictEqual(
          await driver.findElement({ tagName: 'h3' }).getText(),
          'This is the proxy landing page'
        )

        await driver.get(goodbyeServer.url())
        assert.strictEqual(await driver.getTitle(), 'Goodbye')
        assert.strictEqual(
          await driver.findElement({ tagName: 'h3' }).getText(),
          'Goodbye, world!'
        )
      })
    })
})
