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

'use strict';

var assert = require('assert'),
    sinon = require('sinon');

var Capabilities = require('../../lib/capabilities').Capabilities,
    Command = require('../../lib/command').Command,
    CommandName = require('../../lib/command').Name,
    error = require('../../lib/error'),
    http = require('../../lib/http'),
    Session = require('../../lib/session').Session,
    promise = require('../../lib/promise'),
    WebElement = require('../../lib/webdriver').WebElement;

describe('http', function() {
  describe('buildPath', function() {
    it('properly replaces path segments with command parameters', function() {
      var parameters = {'sessionId':'foo', 'url':'http://www.google.com'};
      var finalPath = http.buildPath('/session/:sessionId/url', parameters);
      assert.equal(finalPath, '/session/foo/url');
      assert.deepEqual(parameters,  {'url':'http://www.google.com'});
    });

    it('handles web element references', function() {
      var parameters = {'sessionId':'foo', 'id': WebElement.buildId('bar')};

      var finalPath = http.buildPath(
          '/session/:sessionId/element/:id/click', parameters);
      assert.equal(finalPath, '/session/foo/element/bar/click');
      assert.deepEqual(parameters, {});
    });

    it('throws if missing a parameter', function() {
      assert.throws(
        () => http.buildPath('/session/:sessionId', {}),
        function(err) {
          return err instanceof error.InvalidArgumentError
              && 'Missing required parameter: sessionId' === err.message;
        });

      assert.throws(
        () => http.buildPath(
            '/session/:sessionId/element/:id', {'sessionId': 'foo'}),
        function(err) {
          return err instanceof error.InvalidArgumentError
              && 'Missing required parameter: id' === err.message;
        });
    });

    it('does not match on segments that do not start with a colon', function() {
      assert.equal(
          http.buildPath('/session/foo:bar/baz', {}),
          '/session/foo:bar/baz');
    });
  });

  describe('Executor', function() {
    let executor;
    let client;
    let send;

    beforeEach(function setUp() {
      client = new http.Client;
      send = sinon.stub(client, 'send');
      executor = new http.Executor(client);
    });

    describe('command routing', function() {
      it('rejects unrecognized commands', function() {
        return executor.execute(new Command('fake-name'))
            .then(assert.fail, err => {
              if (err instanceof error.UnknownCommandError
                  && 'Unrecognized command: fake-name' === err.message) {
                return;
              }
              throw err;
            })
      });

      it('rejects promise if client fails to send request', function() {
        let error = new Error('boom');
        send.returns(Promise.reject(error));
        return assertFailsToSend(new Command(CommandName.NEW_SESSION))
            .then(function(e) {
               assert.strictEqual(error, e);
               assertSent(
                   'POST', '/session', {},
                   [['Accept', 'application/json; charset=utf-8']]);
            });
      });

      it('can execute commands with no URL parameters', function() {
        var resp = JSON.stringify({sessionId: 'abc123'});
        send.returns(Promise.resolve(new http.Response(200, {}, resp)));

        let command = new Command(CommandName.NEW_SESSION);
        return assertSendsSuccessfully(command).then(function(response) {
           assertSent(
               'POST', '/session', {},
               [['Accept', 'application/json; charset=utf-8']]);
        });
      });

      it('rejects commands missing URL parameters', function() {
        let command =
            new Command(CommandName.FIND_CHILD_ELEMENT).
                setParameter('sessionId', 's123').
                // Let this be missing: setParameter('id', {'ELEMENT': 'e456'}).
                setParameter('using', 'id').
                setParameter('value', 'foo');

        assert.throws(
            () => executor.execute(command),
            function(err) {
              return err instanceof error.InvalidArgumentError
                  && 'Missing required parameter: id' === err.message;
            });
        assert.ok(!send.called);
      });

      it('replaces URL parameters with command parameters', function() {
        var command = new Command(CommandName.GET).
            setParameter('sessionId', 's123').
            setParameter('url', 'http://www.google.com');

        send.returns(Promise.resolve(new http.Response(200, {}, '')));

        return assertSendsSuccessfully(command).then(function(response) {
           assertSent(
               'POST', '/session/s123/url', {'url': 'http://www.google.com'},
               [['Accept', 'application/json; charset=utf-8']]);
        });
      });

      describe('uses correct URL', function() {
        beforeEach(() => executor = new http.Executor(client));

        describe('in legacy mode', function() {
          test(CommandName.GET_WINDOW_SIZE, {sessionId:'s123'}, false,
               'GET', '/session/s123/window/current/size');

          test(CommandName.SET_WINDOW_SIZE,
               {sessionId:'s123', width: 1, height: 1}, false,
               'POST', '/session/s123/window/current/size',
               {width: 1, height: 1});

          test(CommandName.MAXIMIZE_WINDOW, {sessionId:'s123'}, false,
               'POST', '/session/s123/window/current/maximize');

          // This is consistent b/w legacy and W3C, just making sure.
          test(CommandName.GET,
               {sessionId:'s123', url: 'http://www.example.com'}, false,
               'POST', '/session/s123/url', {url: 'http://www.example.com'});
        });

        describe('in W3C mode', function() {
          test(CommandName.GET_WINDOW_SIZE,
               {sessionId:'s123'}, true,
               'GET', '/session/s123/window/size');

          test(CommandName.SET_WINDOW_SIZE,
               {sessionId:'s123', width: 1, height: 1}, true,
               'POST', '/session/s123/window/size', {width: 1, height: 1});

          test(CommandName.MAXIMIZE_WINDOW, {sessionId:'s123'}, true,
               'POST', '/session/s123/window/maximize');

          // This is consistent b/w legacy and W3C, just making sure.
          test(CommandName.GET,
               {sessionId:'s123', url: 'http://www.example.com'}, true,
               'POST', '/session/s123/url', {url: 'http://www.example.com'});
        });

        function test(command, parameters, w3c,
            expectedMethod, expectedUrl, opt_expectedParams) {
          it(`command=${command}`, function() {
            var resp = JSON.stringify({sessionId: 'abc123'});
            send.returns(Promise.resolve(new http.Response(200, {}, resp)));

            let cmd = new Command(command).setParameters(parameters);
            executor.w3c = w3c;
            return executor.execute(cmd).then(function() {
               assertSent(
                   expectedMethod, expectedUrl, opt_expectedParams || {},
                   [['Accept', 'application/json; charset=utf-8']]);
            });
          });
        }
      });
    });

    describe('response parsing', function() {
      it('extracts value from JSON response', function() {
        var responseObj = {
          'status': error.ErrorCode.SUCCESS,
          'value': 'http://www.google.com'
        };

        var command = new Command(CommandName.GET_CURRENT_URL)
            .setParameter('sessionId', 's123');

        send.returns(Promise.resolve(
            new http.Response(200, {}, JSON.stringify(responseObj))));

        return executor.execute(command).then(function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.strictEqual(response, 'http://www.google.com');
        });
      });

      describe('extracts Session from NEW_SESSION response', function() {
        beforeEach(() => executor = new http.Executor(client));

        const command = new Command(CommandName.NEW_SESSION);

        describe('fails if server returns invalid response', function() {
          describe('(empty response)', function() {
            test(true);
            test(false);

            function test(w3c) {
              it('w3c === ' + w3c, function() {
                send.returns(Promise.resolve(new http.Response(200, {}, '')));
                executor.w3c = w3c;
                return executor.execute(command).then(
                    () => assert.fail('expected to fail'),
                    (e) => {
                      if (!e.message.startsWith('Unable to parse')) {
                        throw e;
                      }
                    });
              });
            }
          });

          describe('(no session ID)', function() {
            test(true);
            test(false);

            function test(w3c) {
              it('w3c === ' + w3c, function() {
                let resp = {value:{name: 'Bob'}};
                send.returns(Promise.resolve(
                    new http.Response(200, {}, JSON.stringify(resp))));
                executor.w3c = w3c;
                return executor.execute(command).then(
                    () => assert.fail('expected to fail'),
                    (e) => {
                      if (!e.message.startsWith('Unable to parse')) {
                        throw e;
                      }
                    });
              });
            }
          });
        });

        it('handles legacy response', function() {
          var rawResponse = {sessionId: 's123', status: 0, value: {name: 'Bob'}};

          send.returns(Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))));

          assert.ok(!executor.w3c);
          return executor.execute(command).then(function(response) {
            assert.ok(response instanceof Session);
            assert.equal(response.getId(), 's123');

            let caps = response.getCapabilities();
            assert.ok(caps instanceof Capabilities);
            assert.equal(caps.get('name'), 'Bob');

            assert.ok(!executor.w3c);
          });
        });

        it('auto-upgrades on W3C response', function() {
          var rawResponse = {sessionId: 's123', value: {name: 'Bob'}};

          send.returns(Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))));

          assert.ok(!executor.w3c);
          return executor.execute(command).then(function(response) {
            assert.ok(response instanceof Session);
            assert.equal(response.getId(), 's123');

            let caps = response.getCapabilities();
            assert.ok(caps instanceof Capabilities);
            assert.equal(caps.get('name'), 'Bob');

            assert.ok(executor.w3c);
          });
        });

        it('if w3c, does not downgrade on legacy response', function() {
          var rawResponse = {sessionId: 's123', status: 0, value: null};

          send.returns(Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))));

          executor.w3c = true;
          return executor.execute(command).then(function(response) {
            assert.ok(response instanceof Session);
            assert.equal(response.getId(), 's123');
            assert.equal(response.getCapabilities().size, 0);
            assert.ok(executor.w3c, 'should never downgrade');
          });
        });
      });

      describe('extracts Session from DESCRIBE_SESSION response', function() {
        let command;

        beforeEach(function() {
          executor = new http.Executor(client);
          command = new Command(CommandName.DESCRIBE_SESSION)
              .setParameter('sessionId', 'foo');
        });

        describe('fails if server returns invalid response', function() {
          describe('(empty response)', function() {
            test(true);
            test(false);

            function test(w3c) {
              it('w3c === ' + w3c, function() {
                send.returns(Promise.resolve(new http.Response(200, {}, '')));
                executor.w3c = w3c;
                return executor.execute(command).then(
                    () => assert.fail('expected to fail'),
                    (e) => {
                      if (!e.message.startsWith('Unable to parse')) {
                        throw e;
                      }
                    });
              });
            }
          });

          describe('(no session ID)', function() {
            test(true);
            test(false);

            function test(w3c) {
              it('w3c === ' + w3c, function() {
                let resp = {value:{name: 'Bob'}};
                send.returns(Promise.resolve(
                    new http.Response(200, {}, JSON.stringify(resp))));
                executor.w3c = w3c;
                return executor.execute(command).then(
                    () => assert.fail('expected to fail'),
                    (e) => {
                      if (!e.message.startsWith('Unable to parse')) {
                        throw e;
                      }
                    });
              });
            }
          });
        });

        it('handles legacy response', function() {
          var rawResponse = {sessionId: 's123', status: 0, value: {name: 'Bob'}};

          send.returns(Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))));

          assert.ok(!executor.w3c);
          return executor.execute(command).then(function(response) {
            assert.ok(response instanceof Session);
            assert.equal(response.getId(), 's123');

            let caps = response.getCapabilities();
            assert.ok(caps instanceof Capabilities);
            assert.equal(caps.get('name'), 'Bob');

            assert.ok(!executor.w3c);
          });
        });

        it('does not auto-upgrade on W3C response', function() {
          var rawResponse = {sessionId: 's123', value: {name: 'Bob'}};

          send.returns(Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))));

          assert.ok(!executor.w3c);
          return executor.execute(command).then(function(response) {
            assert.ok(response instanceof Session);
            assert.equal(response.getId(), 's123');

            let caps = response.getCapabilities();
            assert.ok(caps instanceof Capabilities);
            assert.equal(caps.get('name'), 'Bob');

            assert.ok(!executor.w3c);
          });
        });

        it('if w3c, does not downgrade on legacy response', function() {
          var rawResponse = {sessionId: 's123', status: 0, value: null};

          send.returns(Promise.resolve(
              new http.Response(200, {}, JSON.stringify(rawResponse))));

          executor.w3c = true;
          return executor.execute(command).then(function(response) {
            assert.ok(response instanceof Session);
            assert.equal(response.getId(), 's123');
            assert.equal(response.getCapabilities().size, 0);
            assert.ok(executor.w3c, 'should never downgrade');
          });
        });
      });

      it('handles JSON null', function() {
        var command = new Command(CommandName.GET_CURRENT_URL)
            .setParameter('sessionId', 's123');

        send.returns(Promise.resolve(new http.Response(200, {}, 'null')));

        return executor.execute(command).then(function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.strictEqual(response, null);
        });
      });

      describe('falsy values', function() {
        test(0);
        test(false);
        test('');

        function test(value) {
          it(`value=${value}`, function() {
            var command = new Command(CommandName.GET_CURRENT_URL)
                .setParameter('sessionId', 's123');

            send.returns(Promise.resolve(
                new http.Response(200, {},
                    JSON.stringify({status: 0, value: value}))));

            return executor.execute(command).then(function(response) {
               assertSent('GET', '/session/s123/url', {},
                   [['Accept', 'application/json; charset=utf-8']]);
               assert.strictEqual(response, value);
            });
          });
        }
      });

      it('handles non-object JSON', function() {
        var command = new Command(CommandName.GET_CURRENT_URL)
            .setParameter('sessionId', 's123');

        send.returns(Promise.resolve(new http.Response(200, {}, '123')));

        return executor.execute(command).then(function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.strictEqual(response, 123);
        });
      });

      it('returns body text when 2xx but not JSON', function() {
        var command = new Command(CommandName.GET_CURRENT_URL)
            .setParameter('sessionId', 's123');

        send.returns(Promise.resolve(
            new http.Response(200, {}, 'hello, world\r\ngoodbye, world!')));

        return executor.execute(command).then(function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.strictEqual(response, 'hello, world\ngoodbye, world!');
        });
      });

      it('returns body text when 2xx but invalid JSON', function() {
        var command = new Command(CommandName.GET_CURRENT_URL)
            .setParameter('sessionId', 's123');

        send.returns(Promise.resolve(
            new http.Response(200, {}, '[')));

        return executor.execute(command).then(function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.strictEqual(response, '[');
        });
      });

      it('returns null if no body text and 2xx', function() {
        var command = new Command(CommandName.GET_CURRENT_URL)
            .setParameter('sessionId', 's123');

        send.returns(Promise.resolve(new http.Response(200, {}, '')));

        return executor.execute(command).then(function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.strictEqual(response, null);
        });
      });

      it('returns normalized body text when 2xx but not JSON', function() {
        var command = new Command(CommandName.GET_CURRENT_URL)
            .setParameter('sessionId', 's123');

        send.returns(Promise.resolve(new http.Response(200, {}, '\r\n\n\n\r\n')));

        return executor.execute(command).then(function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.strictEqual(response, '\n\n\n\n');
        });
      });

      it('throws UnsupportedOperationError for 404 and body not JSON',
          function() {
            var command = new Command(CommandName.GET_CURRENT_URL)
                .setParameter('sessionId', 's123');

            send.returns(Promise.resolve(
                new http.Response(404, {}, 'hello, world\r\ngoodbye, world!')));

            return executor.execute(command)
                .then(
                    () => assert.fail('should have failed'),
                    checkError(
                        error.UnsupportedOperationError,
                        'hello, world\ngoodbye, world!'));
          });

      it('throws WebDriverError for generic 4xx when body not JSON',
          function() {
            var command = new Command(CommandName.GET_CURRENT_URL)
                .setParameter('sessionId', 's123');

            send.returns(Promise.resolve(
                new http.Response(500, {}, 'hello, world\r\ngoodbye, world!')));

            return executor.execute(command)
                .then(
                    () => assert.fail('should have failed'),
                    checkError(
                        error.WebDriverError,
                        'hello, world\ngoodbye, world!'))
                .then(function() {
                   assertSent('GET', '/session/s123/url', {},
                       [['Accept', 'application/json; charset=utf-8']]);
                });
          });
    });

    it('canDefineNewCommands', function() {
      executor.defineCommand('greet', 'GET', '/person/:name');

      var command = new Command('greet').
          setParameter('name', 'Bob');

      send.returns(Promise.resolve(new http.Response(200, {}, '')));

      return assertSendsSuccessfully(command).then(function(response) {
         assertSent('GET', '/person/Bob', {},
             [['Accept', 'application/json; charset=utf-8']]);
      });
    });

    it('canRedefineStandardCommands', function() {
      executor.defineCommand(CommandName.GO_BACK, 'POST', '/custom/back');

      var command = new Command(CommandName.GO_BACK).
          setParameter('times', 3);

      send.returns(Promise.resolve(new http.Response(200, {}, '')));

      return assertSendsSuccessfully(command).then(function(response) {
         assertSent('POST', '/custom/back', {'times': 3},
             [['Accept', 'application/json; charset=utf-8']]);
      });
    });

    it('accepts promised http clients', function() {
      executor = new http.Executor(Promise.resolve(client));

      var resp = JSON.stringify({sessionId: 'abc123'});
      send.returns(Promise.resolve(new http.Response(200, {}, resp)));

      let command = new Command(CommandName.NEW_SESSION);
      return executor.execute(command).then(response => {
         assertSent(
             'POST', '/session', {},
             [['Accept', 'application/json; charset=utf-8']]);
      });
    });

    function entries(map) {
      let entries = [];
      for (let e of map.entries()) {
        entries.push(e);
      }
      return entries;
    }

    function checkError(type, message) {
      return function(e) {
        if (e instanceof type) {
          assert.strictEqual(e.message, message);
        } else {
          throw e;
        }
      };
    }

    function assertSent(method, path, data, headers) {
      assert.ok(send.calledWith(sinon.match(function(value) {
        assert.equal(value.method, method);
        assert.equal(value.path, path);
        assert.deepEqual(value.data, data);
        assert.deepEqual(entries(value.headers), headers);
        return true;
      })));
    }

    function assertSendsSuccessfully(command) {
      return executor.execute(command).then(function(response) {
        return response;
      });
    }

    function assertFailsToSend(command, opt_onError) {
      return executor.execute(command).then(
          () => {throw Error('should have failed')},
          (e) => {return e});
    }
  });
});
