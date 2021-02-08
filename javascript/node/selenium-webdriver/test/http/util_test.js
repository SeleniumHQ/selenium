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
const http = require('http')

const error = require('../../lib/error')
const util = require('../../http/util')

describe('selenium-webdriver/http/util', function () {
  var server, baseUrl

  var status, value, responseCode

  function startServer(done) {
    if (server) return done()

    server = http.createServer(function (_req, res) {
      var data = JSON.stringify({ status: status, value: value })
      res.writeHead(responseCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data, 'utf8'),
      })
      res.end(data)
    })

    server.listen(0, '127.0.0.1', function (e) {
      if (e) return done(e)

      var addr = server.address()
      baseUrl = 'http://' + addr.address + ':' + addr.port
      done()
    })
  }

  function killServer(done) {
    if (!server) return done()
    server.close(done)
    server = null
  }

  after(killServer)

  beforeEach(function (done) {
    status = 0
    value = 'abc123'
    responseCode = 200
    startServer(done)
  })

  describe('#getStatus', function () {
    it('should return value field on success', function () {
      return util.getStatus(baseUrl).then(function (response) {
        assert.strictEqual('abc123', response)
      })
    })

    it('should fail if response object is not success', function () {
      status = 1
      return util.getStatus(baseUrl).then(
        function () {
          throw Error('expected a failure')
        },
        function (err) {
          assert.ok(err instanceof error.WebDriverError)
          assert.strictEqual(err.code, error.WebDriverError.code)
          assert.strictEqual(err.message, value)
        }
      )
    })

    it('should fail if the server is not listening', function (done) {
      killServer(function (e) {
        if (e) return done(e)

        util.getStatus(baseUrl).then(
          function () {
            done(Error('expected a failure'))
          },
          function () {
            // Expected.
            done()
          }
        )
      })
    })

    it('should fail if HTTP status is not 200', function () {
      status = 1
      responseCode = 404
      return util.getStatus(baseUrl).then(
        function () {
          throw Error('expected a failure')
        },
        function (err) {
          assert.ok(err instanceof error.WebDriverError)
          assert.strictEqual(err.code, error.WebDriverError.code)
          assert.strictEqual(err.message, value)
        }
      )
    })
  })

  describe('#waitForServer', function () {
    it('resolves when server is ready', function () {
      status = 1
      setTimeout(function () {
        status = 0
      }, 50)
      return util.waitForServer(baseUrl, 100)
    })

    it('should fail if server does not become ready', function () {
      status = 1
      return util.waitForServer(baseUrl, 50).then(
        function () {
          throw Error('Expected to time out')
        },
        function () {}
      )
    })

    it('can cancel wait', function () {
      status = 1
      let cancel = new Promise((resolve) => {
        setTimeout((_) => resolve(), 50)
      })
      return util.waitForServer(baseUrl, 200, cancel).then(
        () => {
          throw Error('Did not expect to succeed!')
        },
        (e) => assert.ok(e instanceof util.CancellationError)
      )
    })
  })

  describe('#waitForUrl', function () {
    it('succeeds when URL returns 2xx', function () {
      responseCode = 404
      setTimeout(function () {
        responseCode = 200
      }, 50)

      return util.waitForUrl(baseUrl, 200)
    })

    it('fails if URL always returns 4xx', function () {
      responseCode = 404

      return util.waitForUrl(baseUrl, 50).then(
        () => assert.fail('Expected to time out'),
        () => true
      )
    })

    it('fails if cannot connect to server', function () {
      return new Promise((resolve, reject) => {
        killServer(function (e) {
          if (e) return reject(e)

          util.waitForUrl(baseUrl, 50).then(
            function () {
              reject(Error('Expected to time out'))
            },
            function () {
              resolve()
            }
          )
        })
      })
    })

    it('can cancel wait', function () {
      responseCode = 404
      let cancel = new Promise((resolve) => {
        setTimeout((_) => resolve(), 50)
      })
      return util.waitForUrl(baseUrl, 200, cancel).then(
        () => {
          throw Error('Did not expect to succeed!')
        },
        (e) => assert.ok(e instanceof util.CancellationError)
      )
    })
  })
})
