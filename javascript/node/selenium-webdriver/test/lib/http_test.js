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

const assert = require('assert'),
  sinon = require('sinon')

const Capabilities = require('../../lib/capabilities').Capabilities,
  Command = require('../../lib/command').Command,
  CommandName = require('../../lib/command').Name,
  error = require('../../lib/error'),
  http = require('../../lib/http'),
  Session = require('../../lib/session').Session,
  WebElement = require('../../lib/webdriver').WebElement

describe('http', function () {
  describe('buildPath', function () {
    it('properly replaces path segments with command parameters', function () {
      const parameters = { sessionId: 'foo', url: 'http://www.google.com' }
      const finalPath = http.buildPath('/session/:sessionId/url', parameters)
      assert.strictEqual(finalPath, '/session/foo/url')
      assert.deepStrictEqual(parameters, { url: 'http://www.google.com' })
    })

    it('handles web element references', function () {
      const parameters = { sessionId: 'foo', id: WebElement.buildId('bar') }

      const finalPath = http.buildPath(
        '/session/:sessionId/element/:id/click',
        parameters
      )
      assert.strictEqual(finalPath, '/session/foo/element/bar/click')
      assert.deepStrictEqual(parameters, {})
    })

    it('throws if missing a parameter', function () {
      assert.throws(
        () => http.buildPath('/session/:sessionId', {}),
        function (err) {
          return (
            err instanceof error.InvalidArgumentError &&
            'Missing required parameter: sessionId' === err.message
          )
        }
      )

      assert.throws(
        () =>
          http.buildPath('/session/:sessionId/element/:id', {
            sessionId: 'foo',
          }),
        function (err) {
          return (
            err instanceof error.InvalidArgumentError &&
            'Missing required parameter: id' === err.message
          )
        }
      )
    })

    it('does not match on segments that do not start with a colon', function () {
      assert.strictEqual(
        http.buildPath('/session/foo:bar/baz', {}),
        '/session/foo:bar/baz'
      )
    })
  })

  describe('Executor', function () {
    let executor
    let client
    let send

    beforeEach(function setUp() {
      client = new http.Client()
      send = sinon.stub(client, 'send')
      executor = new http.Executor(client)
    })

    describe('command routing', function () {
      it('rejects unrecognized commands', function () {
        return executor
          .execute(new Command('fake-name'))
          .then(assert.fail, (err) => {
            if (
              err instanceof error.UnknownCommandError &&
              'Unrecognized command: fake-name' === err.message
            ) {
              return
            }
            throw err
          })
      })

      it('rejects promise if client fails to send request', function () {
        let error = new Error('boom')
        send.returns(Promise.reject(error))
        return assertFailsToSend(new Command(CommandName.NEW_SESSION)).then(
          function (e) {
            assert.strictEqual(error, e)
            assertSent('POST', '/session', {}, [
              ['Accept', 'application/json; charset=utf-8'],
            ])
          }
        )
      })

      it('can execute commands with no URL parameters', function () {
        const resp = JSON.stringify({ sessionId: 'abc123' })
        send.returns(Promise.resolve(new http.Response(200, {}, resp)))

        let command = new Command(CommandName.NEW_SESSION)
        return assertSendsSuccessfully(command).then(function (_response) {
          assertSent('POST', '/session', {}, [
            ['Accept', 'application/json; charset=utf-8'],
          ])
        })
      })

      it('rejects commands missing URL parameters', async function () {
        let command = new Command(CommandName.FIND_CHILD_ELEMENT)
          .setParameter('sessionId', 's123')
          // Let this be missing: setParameter('id', {'ELEMENT': 'e456'}).
          .setParameter('using', 'id')
          .setParameter('value', 'foo')

        try {
          await executor.execute(command)
          return Promise.reject(Error('should have thrown'))
        } catch (err) {
          assert.strictEqual(err.constructor, error.InvalidArgumentError)
          assert.strictEqual(err.message, 'Missing required parameter: id')
        }
        assert.ok(!send.called)
      })

      it('replaces URL parameters with command parameters', function () {
        const command = new Command(CommandName.GET)
          .setParameter('sessionId', 's123')
          .setParameter('url', 'http://www.google.com')

        send.returns(Promise.resolve(new http.Response(200, {}, '')))

        return assertSendsSuccessfully(command).then(function (_response) {
          assertSent(
            'POST',
            '/session/s123/url',
            { url: 'http://www.google.com' },
            [['Accept', 'application/json; charset=utf-8']]
          )
        })
      })

      describe('uses correct URL', function () {
        beforeEach(() => (executor = new http.Executor(client)))

        describe('in W3C mode', function () {
          test(
            CommandName.MAXIMIZE_WINDOW,
            { sessionId: 's123' },
            true,
            'POST',
            '/session/s123/window/maximize'
          )

          // This is consistent b/w legacy and W3C, just making sure.
          test(
            CommandName.GET,
            { sessionId: 's123', url: 'http://www.example.com' },
            true,
            'POST',
            '/session/s123/url',
            { url: 'http://www.example.com' }
          )
        })

        function test(
          command,
          parameters,
          w3c,
          expectedMethod,
          expectedUrl,
          opt_expectedParams
        ) {
          it(`command=${command}`, function () {
            const resp = JSON.stringify({ sessionId: 'abc123' })
            send.returns(Promise.resolve(new http.Response(200, {}, resp)))

            let cmd = new Command(command).setParameters(parameters)
            executor.w3c = w3c
            return executor.execute(cmd).then(function () {
              assertSent(
                expectedMethod,
                expectedUrl,
                opt_expectedParams || {},
                [['Accept', 'application/json; charset=utf-8']]
              )
            })
          })
        }
      })
    })

    describe('response parsing', function () {
      it('extracts value from JSON response', function () {
        const responseObj = {
          status: error.ErrorCode.SUCCESS,
          value: 'http://www.google.com',
        }

        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(
          Promise.resolve(
            new http.Response(200, {}, JSON.stringify(responseObj))
          )
        )

        return executor.execute(command).then(function (response) {
          assertSent('GET', '/session/s123/url', {}, [
            ['Accept', 'application/json; charset=utf-8'],
          ])
          assert.strictEqual(response, 'http://www.google.com')
        })
      })

      describe('extracts Session from NEW_SESSION response', function () {
        beforeEach(() => (executor = new http.Executor(client)))

        const command = new Command(CommandName.NEW_SESSION)

        describe('fails if server returns invalid response', function () {
          describe('(empty response)', function () {
            test(true)
            test(false)

            function test(w3c) {
              it('w3c === ' + w3c, function () {
                send.returns(Promise.resolve(new http.Response(200, {}, '')))
                executor.w3c = w3c
                return executor.execute(command).then(
                  () => assert.fail('expected to fail'),
                  (e) => {
                    if (!e.message.startsWith('Unable to parse')) {
                      throw e
                    }
                  }
                )
              })
            }
          })

          describe('(no session ID)', function () {
            test(true)
            test(false)

            function test(w3c) {
              it('w3c === ' + w3c, function () {
                let resp = { value: { name: 'Bob' } }
                send.returns(
                  Promise.resolve(
                    new http.Response(200, {}, JSON.stringify(resp))
                  )
                )
                executor.w3c = w3c
                return executor.execute(command).then(
                  () => assert.fail('expected to fail'),
                  (e) => {
                    if (!e.message.startsWith('Unable to parse')) {
                      throw e
                    }
                  }
                )
              })
            }
          })
        })

        it('handles legacy response', function () {
          const rawResponse = {
            sessionId: 's123',
            status: 0,
            value: { name: 'Bob' },
          }

          send.returns(
            Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))
            )
          )

          assert.ok(!executor.w3c)
          return executor.execute(command).then(function (response) {
            assert.ok(response instanceof Session)
            assert.strictEqual(response.getId(), 's123')

            let caps = response.getCapabilities()
            assert.ok(caps instanceof Capabilities)
            assert.strictEqual(caps.get('name'), 'Bob')

            assert.ok(!executor.w3c)
          })
        })

        it('auto-upgrades on W3C response', function () {
          let rawResponse = {
            value: {
              sessionId: 's123',
              value: {
                name: 'Bob',
              },
            },
          }

          send.returns(
            Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))
            )
          )

          assert.ok(!executor.w3c)
          return executor.execute(command).then(function (response) {
            assert.ok(response instanceof Session)
            assert.strictEqual(response.getId(), 's123')

            let caps = response.getCapabilities()
            assert.ok(caps instanceof Capabilities)
            assert.strictEqual(caps.get('name'), 'Bob')

            assert.ok(executor.w3c)
          })
        })

        it('if w3c, does not downgrade on legacy response', function () {
          const rawResponse = { sessionId: 's123', status: 0, value: null }

          send.returns(
            Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))
            )
          )

          executor.w3c = true
          return executor.execute(command).then(function (response) {
            assert.ok(response instanceof Session)
            assert.strictEqual(response.getId(), 's123')
            assert.strictEqual(response.getCapabilities().size, 0)
            assert.ok(executor.w3c, 'should never downgrade')
          })
        })

        it('handles legacy new session failures', function () {
          let rawResponse = {
            status: error.ErrorCode.NO_SUCH_ELEMENT,
            value: { message: 'hi' },
          }

          send.returns(
            Promise.resolve(
              new http.Response(500, {}, JSON.stringify(rawResponse))
            )
          )

          return executor.execute(command).then(
            () => assert.fail('should have failed'),
            (e) => {
              assert.ok(e instanceof error.NoSuchElementError)
              assert.strictEqual(e.message, 'hi')
            }
          )
        })

        it('handles w3c new session failures', function () {
          let rawResponse = {
            value: { error: 'no such element', message: 'oops' },
          }

          send.returns(
            Promise.resolve(
              new http.Response(500, {}, JSON.stringify(rawResponse))
            )
          )

          return executor.execute(command).then(
            () => assert.fail('should have failed'),
            (e) => {
              assert.ok(e instanceof error.NoSuchElementError)
              assert.strictEqual(e.message, 'oops')
            }
          )
        })
      })

      it('handles JSON null', function () {
        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(Promise.resolve(new http.Response(200, {}, 'null')))

        return executor.execute(command).then(function (response) {
          assertSent('GET', '/session/s123/url', {}, [
            ['Accept', 'application/json; charset=utf-8'],
          ])
          assert.strictEqual(response, null)
        })
      })

      describe('falsy values', function () {
        test(0)
        test(false)
        test('')

        function test(value) {
          it(`value=${value}`, function () {
            const command = new Command(
              CommandName.GET_CURRENT_URL
            ).setParameter('sessionId', 's123')

            send.returns(
              Promise.resolve(
                new http.Response(
                  200,
                  {},
                  JSON.stringify({ status: 0, value: value })
                )
              )
            )

            return executor.execute(command).then(function (response) {
              assertSent('GET', '/session/s123/url', {}, [
                ['Accept', 'application/json; charset=utf-8'],
              ])
              assert.strictEqual(response, value)
            })
          })
        }
      })

      it('handles non-object JSON', function () {
        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(Promise.resolve(new http.Response(200, {}, '123')))

        return executor.execute(command).then(function (response) {
          assertSent('GET', '/session/s123/url', {}, [
            ['Accept', 'application/json; charset=utf-8'],
          ])
          assert.strictEqual(response, 123)
        })
      })

      it('returns body text when 2xx but not JSON', function () {
        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(
          Promise.resolve(
            new http.Response(200, {}, 'hello, world\r\ngoodbye, world!')
          )
        )

        return executor.execute(command).then(function (response) {
          assertSent('GET', '/session/s123/url', {}, [
            ['Accept', 'application/json; charset=utf-8'],
          ])
          assert.strictEqual(response, 'hello, world\ngoodbye, world!')
        })
      })

      it('returns body text when 2xx but invalid JSON', function () {
        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(Promise.resolve(new http.Response(200, {}, '[')))

        return executor.execute(command).then(function (response) {
          assertSent('GET', '/session/s123/url', {}, [
            ['Accept', 'application/json; charset=utf-8'],
          ])
          assert.strictEqual(response, '[')
        })
      })

      it('returns null if no body text and 2xx', function () {
        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(Promise.resolve(new http.Response(200, {}, '')))

        return executor.execute(command).then(function (response) {
          assertSent('GET', '/session/s123/url', {}, [
            ['Accept', 'application/json; charset=utf-8'],
          ])
          assert.strictEqual(response, null)
        })
      })

      it('returns normalized body text when 2xx but not JSON', function () {
        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(
          Promise.resolve(new http.Response(200, {}, '\r\n\n\n\r\n'))
        )

        return executor.execute(command).then(function (response) {
          assertSent('GET', '/session/s123/url', {}, [
            ['Accept', 'application/json; charset=utf-8'],
          ])
          assert.strictEqual(response, '\n\n\n\n')
        })
      })

      it('throws UnsupportedOperationError for 404 and body not JSON', function () {
        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(
          Promise.resolve(
            new http.Response(404, {}, 'hello, world\r\ngoodbye, world!')
          )
        )

        return executor
          .execute(command)
          .then(
            () => assert.fail('should have failed'),
            checkError(
              error.UnsupportedOperationError,
              'getCurrentUrl: hello, world\ngoodbye, world!'
            )
          )
      })

      it('throws WebDriverError for generic 4xx when body not JSON', function () {
        const command = new Command(CommandName.GET_CURRENT_URL).setParameter(
          'sessionId',
          's123'
        )

        send.returns(
          Promise.resolve(
            new http.Response(500, {}, 'hello, world\r\ngoodbye, world!')
          )
        )

        return executor
          .execute(command)
          .then(
            () => assert.fail('should have failed'),
            checkError(error.WebDriverError, 'hello, world\ngoodbye, world!')
          )
          .then(function () {
            assertSent('GET', '/session/s123/url', {}, [
              ['Accept', 'application/json; charset=utf-8'],
            ])
          })
      })
    })

    it('canDefineNewCommands', function () {
      executor.defineCommand('greet', 'GET', '/person/:name')

      const command = new Command('greet').setParameter('name', 'Bob')

      send.returns(Promise.resolve(new http.Response(200, {}, '')))

      return assertSendsSuccessfully(command).then(function (_response) {
        assertSent('GET', '/person/Bob', {}, [
          ['Accept', 'application/json; charset=utf-8'],
        ])
      })
    })

    it('canRedefineStandardCommands', function () {
      executor.defineCommand(CommandName.GO_BACK, 'POST', '/custom/back')

      const command = new Command(CommandName.GO_BACK).setParameter('times', 3)

      send.returns(Promise.resolve(new http.Response(200, {}, '')))

      return assertSendsSuccessfully(command).then(function (_response) {
        assertSent('POST', '/custom/back', { times: 3 }, [
          ['Accept', 'application/json; charset=utf-8'],
        ])
      })
    })

    it('accepts promised http clients', function () {
      executor = new http.Executor(Promise.resolve(client))

      const resp = JSON.stringify({ sessionId: 'abc123' })
      send.returns(Promise.resolve(new http.Response(200, {}, resp)))

      let command = new Command(CommandName.NEW_SESSION)
      return executor.execute(command).then((_response) => {
        assertSent('POST', '/session', {}, [
          ['Accept', 'application/json; charset=utf-8'],
        ])
      })
    })

    function entries(map) {
      let entries = []
      for (let e of map.entries()) {
        entries.push(e)
      }
      return entries
    }

    function checkError(type, message) {
      return function (e) {
        if (e instanceof type) {
          assert.strictEqual(e.message, message)
        } else {
          throw e
        }
      }
    }

    function assertSent(method, path, data, headers) {
      assert.ok(
        send.calledWith(
          sinon.match(function (value) {
            assert.strictEqual(value.method, method)
            assert.strictEqual(value.path, path)
            assert.deepStrictEqual(value.data, data)
            assert.deepStrictEqual(entries(value.headers), headers)
            return true
          })
        )
      )
    }

    function assertSendsSuccessfully(command) {
      return executor.execute(command).then(function (response) {
        return response
      })
    }

    function assertFailsToSend(command, _opt_onError) {
      return executor.execute(command).then(
        () => {
          throw Error('should have failed')
        },
        (e) => {
          return e
        }
      )
    }
  })
})
