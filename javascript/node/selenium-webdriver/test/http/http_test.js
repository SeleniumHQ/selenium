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

var assert = require('assert');
var http = require('http');
var sinon = require('sinon');
var url = require('url');

var error = require('../../error');
var Executor = require('../../http').Executor;
var HttpClient = require('../../http').HttpClient;
var HttpRequest = require('../../http').Request;
var HttpResponse = require('../../http').Response;
var buildPath = require('../../http').buildPath;
var Command = require('../../lib/command').Command;
var CommandName = require('../../lib/command').Name;
var Server = require('../../lib/test/httpserver').Server;
var promise = require('../..').promise;

describe('buildPath', function() {
  it('properly replaces path segments with command parameters', function() {
    var parameters = {'sessionId':'foo', 'url':'http://www.google.com'};
    var finalPath = buildPath('/session/:sessionId/url', parameters);
    assert.equal(finalPath, '/session/foo/url');
    assert.deepEqual(parameters,  {'url':'http://www.google.com'});
  });

  it('handles web element references', function() {
    var parameters = {'sessionId':'foo', 'id': {}};
    parameters['id']['ELEMENT'] = 'bar';

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
  let send;

  beforeEach(function setUp() {
    let client = new HttpClient('http://www.example.com');
    send = sinon.stub(client, 'send');
    executor = new Executor(client);
  });

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
    send.returns(Promise.resolve(new HttpResponse(200, {}, '')));

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

  it('returns parsed JSON response', function() {
    var responseObj = {
      'status': error.ErrorCode.SUCCESS,
      'value': 'http://www.google.com'
    };

    var command = new Command(CommandName.GET_CURRENT_URL).
        setParameter('sessionId', 's123');


    send.returns(Promise.resolve(
        new HttpResponse(200, {}, JSON.stringify(responseObj))));

    return assertSendsSuccessfully(command).then(function(response) {
       assertSent('GET', '/session/s123/url', {},
           [['Accept', 'application/json; charset=utf-8']]);
       assert.deepEqual(response, responseObj);
    });
  });

  it('returns success for 2xx with body as value when not json', function() {
    var command = new Command(CommandName.GET_CURRENT_URL).
        setParameter('sessionId', 's123');

    send.returns(Promise.resolve(
        new HttpResponse(200, {}, 'hello, world\r\ngoodbye, world!')));

    return assertSendsSuccessfully(command).then(function(response) {
       assertSent('GET', '/session/s123/url', {},
           [['Accept', 'application/json; charset=utf-8']]);
       assert.deepEqual(response, {
         'status': error.ErrorCode.SUCCESS,
         'value': 'hello, world\ngoodbye, world!'
       });
    });
  });

  it('returns success for 2xx with invalid JSON body', function() {
    var command = new Command(CommandName.GET_CURRENT_URL).
        setParameter('sessionId', 's123');

    send.returns(Promise.resolve(
        new HttpResponse(200, {}, '[')));

    return assertSendsSuccessfully(command).then(function(response) {
       assertSent('GET', '/session/s123/url', {},
           [['Accept', 'application/json; charset=utf-8']]);
       assert.deepEqual(response, {
         'status': error.ErrorCode.SUCCESS,
         'value': '['
       });
    });
  });

  it('returns unknown command for 404 with body as value when not json',
      function() {
        var command = new Command(CommandName.GET_CURRENT_URL).
            setParameter('sessionId', 's123');

        send.returns(Promise.resolve(
            new HttpResponse(404, {}, 'hello, world\r\ngoodbye, world!')));

        return assertSendsSuccessfully(command, function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.deepEqual(response, {
             'status': error.ErrorCode.UNKNOWN_COMMAND,
             'value': 'hello, world\ngoodbye, world!'
           });
      });
     });

  it('returnsUnknownErrorForGenericErrorCodeWithBodyAsValueWhenNotJSON',
      function() {
        var command = new Command(CommandName.GET_CURRENT_URL).
            setParameter('sessionId', 's123');

        send.returns(Promise.resolve(
            new HttpResponse(500, {}, 'hello, world\r\ngoodbye, world!')));

        return assertSendsSuccessfully(command).then(function(response) {
           assertSent('GET', '/session/s123/url', {},
               [['Accept', 'application/json; charset=utf-8']]);
           assert.deepEqual(response, {
             'status': error.ErrorCode.UNKNOWN_ERROR,
             'value': 'hello, world\ngoodbye, world!'
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
