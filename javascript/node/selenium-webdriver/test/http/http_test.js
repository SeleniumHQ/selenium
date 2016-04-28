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
    http = require('http'),
    sinon = require('sinon'),
    url = require('url');

var error = require('../../error'),
    Executor = require('../../http').Executor,
    HttpClient = require('../../http').HttpClient,
    HttpRequest = require('../../http').Request,
    HttpResponse = require('../../http').Response,
    buildPath = require('../../http').buildPath,
    Capabilities = require('../../lib/capabilities').Capabilities,
    Command = require('../../lib/command').Command,
    CommandName = require('../../lib/command').Name,
    Session = require('../../lib/session').Session,
    Server = require('../../lib/test/httpserver').Server,
    promise = require('../../lib/promise'),
    WebElement = require('../../lib/webdriver').WebElement;

describe('buildPath', function() {
  it('properly replaces path segments with command parameters', function() {
    var parameters = {'sessionId':'foo', 'url':'http://www.google.com'};
    var finalPath = buildPath('/session/:sessionId/url', parameters);
    assert.equal(finalPath, '/session/foo/url');
    assert.deepEqual(parameters,  {'url':'http://www.google.com'});
  });

  it('handles web element references', function() {
    var parameters = {'sessionId':'foo', 'id': WebElement.buildId('bar')};

    var finalPath = buildPath(
        '/session/:sessionId/element/:id/click', parameters);
    assert.equal(finalPath, '/session/foo/element/bar/click');
    assert.deepEqual(parameters, {});
  });

  it('throws if missing a parameter', function() {
    assert.throws(
      () => buildPath('/session/:sessionId', {}),
      function(err) {
        return err instanceof error.InvalidArgumentError
            && 'Missing required parameter: sessionId' === err.message;
      });

    assert.throws(
      () => buildPath('/session/:sessionId/element/:id', {'sessionId': 'foo'}),
      function(err) {
        return err instanceof error.InvalidArgumentError
            && 'Missing required parameter: id' === err.message;
      });
  });

  it('does not match on segments that do not start with a colon', function() {
    assert.equal(buildPath('/session/foo:bar/baz', {}), '/session/foo:bar/baz');
  });
});

describe('Executor', function() {
  let executor;
  let client;
  let send;

  beforeEach(function setUp() {
    client = new HttpClient('http://www.example.com');
    send = sinon.stub(client, 'send');
    executor = new Executor(client);
  });

  describe('command routing', function() {
    it('rejects unrecognized commands', function() {
      assert.throws(
          () => executor.execute(new Command('fake-name')),
          function (err) {
            return err instanceof error.UnknownCommandError
                && 'Unrecognized command: fake-name' === err.message;
          });
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
      send.returns(Promise.resolve(new HttpResponse(200, {}, resp)));

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

      send.returns(Promise.resolve(new HttpResponse(200, {}, '')));

      return assertSendsSuccessfully(command).then(function(response) {
         assertSent(
             'POST', '/session/s123/url', {'url': 'http://www.google.com'},
             [['Accept', 'application/json; charset=utf-8']]);
      });
    });

    describe('uses correct URL', function() {
      beforeEach(() => executor = new Executor(client));

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
          send.returns(Promise.resolve(new HttpResponse(200, {}, resp)));

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
          new HttpResponse(200, {}, JSON.stringify(responseObj))));

      return executor.execute(command).then(function(response) {
         assertSent('GET', '/session/s123/url', {},
             [['Accept', 'application/json; charset=utf-8']]);
         assert.strictEqual(response, 'http://www.google.com');
      });
    });

    describe('extracts Session from NEW_SESSION response', function() {
      beforeEach(() => executor = new Executor(client));

      const command = new Command(CommandName.NEW_SESSION);

      describe('fails if server returns invalid response', function() {
        describe('(empty response)', function() {
          test(true);
          test(false);

          function test(w3c) {
            it('w3c === ' + w3c, function() {
              send.returns(Promise.resolve(new HttpResponse(200, {}, '')));
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
                  new HttpResponse(200, {}, JSON.stringify(resp))));
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
            new HttpResponse(200, {}, JSON.stringify(rawResponse))));

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
            new HttpResponse(200, {}, JSON.stringify(rawResponse))));

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
            new HttpResponse(200, {}, JSON.stringify(rawResponse))));

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
        executor = new Executor(client);
        command = new Command(CommandName.DESCRIBE_SESSION)
            .setParameter('sessionId', 'foo');
      });

      describe('fails if server returns invalid response', function() {
        describe('(empty response)', function() {
          test(true);
          test(false);

          function test(w3c) {
            it('w3c === ' + w3c, function() {
              send.returns(Promise.resolve(new HttpResponse(200, {}, '')));
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
                  new HttpResponse(200, {}, JSON.stringify(resp))));
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
            new HttpResponse(200, {}, JSON.stringify(rawResponse))));

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
            new HttpResponse(200, {}, JSON.stringify(rawResponse))));

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
            new HttpResponse(200, {}, JSON.stringify(rawResponse))));

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

      send.returns(Promise.resolve(new HttpResponse(200, {}, 'null')));

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
              new HttpResponse(200, {},
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

      send.returns(Promise.resolve(new HttpResponse(200, {}, '123')));

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
          new HttpResponse(200, {}, 'hello, world\r\ngoodbye, world!')));

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
          new HttpResponse(200, {}, '[')));

      return executor.execute(command).then(function(response) {
         assertSent('GET', '/session/s123/url', {},
             [['Accept', 'application/json; charset=utf-8']]);
         assert.strictEqual(response, '[');
      });
    });

    it('returns null if no body text and 2xx', function() {
      var command = new Command(CommandName.GET_CURRENT_URL)
          .setParameter('sessionId', 's123');

      send.returns(Promise.resolve(new HttpResponse(200, {}, '')));

      return executor.execute(command).then(function(response) {
         assertSent('GET', '/session/s123/url', {},
             [['Accept', 'application/json; charset=utf-8']]);
         assert.strictEqual(response, null);
      });
    });

    it('returns normalized body text when 2xx but not JSON', function() {
      var command = new Command(CommandName.GET_CURRENT_URL)
          .setParameter('sessionId', 's123');

      send.returns(Promise.resolve(new HttpResponse(200, {}, '\r\n\n\n\r\n')));

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
              new HttpResponse(404, {}, 'hello, world\r\ngoodbye, world!')));

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
              new HttpResponse(500, {}, 'hello, world\r\ngoodbye, world!')));

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

    send.returns(Promise.resolve(new HttpResponse(200, {}, '')));

    return assertSendsSuccessfully(command).then(function(response) {
       assertSent('GET', '/person/Bob', {},
           [['Accept', 'application/json; charset=utf-8']]);
    });
  });

  it('canRedefineStandardCommands', function() {
    executor.defineCommand(CommandName.GO_BACK, 'POST', '/custom/back');

    var command = new Command(CommandName.GO_BACK).
        setParameter('times', 3);

    send.returns(Promise.resolve(new HttpResponse(200, {}, '')));

    return assertSendsSuccessfully(command).then(function(response) {
       assertSent('POST', '/custom/back', {'times': 3},
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

describe('HttpClient', function() {
  this.timeout(4 * 1000);

  var server = new Server(function(req, res) {
    if (req.method == 'GET' && req.url == '/echo') {
      res.writeHead(200, req.headers);
      res.end();

    } else if (req.method == 'GET' && req.url == '/redirect') {
      res.writeHead(303, {'Location': server.url('/hello')});
      res.end();

    } else if (req.method == 'GET' && req.url == '/hello') {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.end('hello, world!');

    } else if (req.method == 'GET' && req.url == '/badredirect') {
      res.writeHead(303, {});
      res.end();

    } else if (req.method == 'GET' && req.url == '/protected') {
      var denyAccess = function() {
        res.writeHead(401, {'WWW-Authenticate': 'Basic realm="test"'});
        res.end('Access denied');
      };

      var basicAuthRegExp = /^\s*basic\s+([a-z0-9\-\._~\+\/]+)=*\s*$/i
      var auth = req.headers.authorization;
      var match = basicAuthRegExp.exec(auth || '');
      if (!match) {
        denyAccess();
        return;
      }

      var userNameAndPass = new Buffer(match[1], 'base64').toString();
      var parts = userNameAndPass.split(':', 2);
      if (parts[0] !== 'genie' && parts[1] !== 'bottle') {
        denyAccess();
        return;
      }

      res.writeHead(200, {'content-type': 'text/plain'});
      res.end('Access granted!');

    } else if (req.method == 'GET' && req.url == '/proxy') {
      res.writeHead(200, req.headers);
      res.end();

    } else if (req.method == 'GET' && req.url == '/proxy/redirect') {
      res.writeHead(303, {'Location': '/proxy'});
      res.end();

    } else {
      res.writeHead(404, {});
      res.end();
    }
  });

  before(function() {
    return server.start();
  });

  after(function() {
    return server.stop();
  });

  it('can send a basic HTTP request', function() {
    var request = new HttpRequest('GET', '/echo');
    request.headers.set('Foo', 'Bar');

    var agent = new http.Agent();
    agent.maxSockets = 1;  // Only making 1 request.

    var client = new HttpClient(server.url(), agent);
    return client.send(request).then(function(response) {
      assert.equal(200, response.status);
      assert.equal(response.headers.get('content-length'), '0');
      assert.equal(response.headers.get('connection'), 'keep-alive');
      assert.equal(response.headers.get('host'), server.host());

      assert.equal(request.headers.get('Foo'), 'Bar');
      assert.equal(
          request.headers.get('Accept'), 'application/json; charset=utf-8');
    });
  });

  it('can use basic auth', function() {
    var parsed = url.parse(server.url());
    parsed.auth = 'genie:bottle';

    var client = new HttpClient(url.format(parsed));
    var request = new HttpRequest('GET', '/protected');
    return client.send(request).then(function(response) {
      assert.equal(200, response.status);
      assert.equal(response.headers.get('content-type'), 'text/plain');
      assert.equal(response.body, 'Access granted!');
    });
  });

  it('fails requests missing required basic auth', function() {
    var client = new HttpClient(server.url());
    var request = new HttpRequest('GET', '/protected');
    return client.send(request).then(function(response) {
      assert.equal(401, response.status);
      assert.equal(response.body, 'Access denied');
    });
  });

  it('automatically follows redirects', function() {
    var request = new HttpRequest('GET', '/redirect');
    var client = new HttpClient(server.url());
    return client.send(request).then(function(response) {
      assert.equal(200, response.status);
      assert.equal(response.headers.get('content-type'), 'text/plain');
      assert.equal(response.body, 'hello, world!');
    });
  });

  it('handles malformed redirect responses', function() {
    var request = new HttpRequest('GET', '/badredirect');
    var client = new HttpClient(server.url());
    return client.send(request).then(assert.fail, function(err) {
      assert.ok(/Failed to parse "Location"/.test(err.message),
          'Not the expected error: ' + err.message);
    });
  });

  it('proxies requests through the webdriver proxy', function() {
    var request = new HttpRequest('GET', '/proxy');
    var client = new HttpClient(
        'http://another.server.com', undefined, server.url());
    return client.send(request).then(function(response) {
       assert.equal(200, response.status);
       assert.equal(response.headers.get('host'), 'another.server.com');
    });
  });

  it('proxies requests through the webdriver proxy on redirect', function() {
    var request = new HttpRequest('GET', '/proxy/redirect');
    var client = new HttpClient(
        'http://another.server.com', undefined, server.url());
    return client.send(request).then(function(response) {
      assert.equal(200, response.status);
      assert.equal(response.headers.get('host'), 'another.server.com');
    });
  });
});
