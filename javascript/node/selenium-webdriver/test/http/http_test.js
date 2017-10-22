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
    url = require('url');

var HttpClient = require('../../http').HttpClient,
    HttpRequest = require('../../lib/http').Request,
    HttpResponse = require('../../lib/http').Response,
    Server = require('../../lib/test/httpserver').Server;

describe('HttpClient', function() {

  var server = new Server(function(req, res) {
    let parsedUrl = url.parse(req.url);

    if (req.method == 'GET' && req.url == '/echo') {
      res.writeHead(200, req.headers);
      res.end();

    } else if (req.method == 'GET' && req.url == '/redirect') {
      res.writeHead(303, {'Location': server.url('/hello')});
      res.end();

    } else if (req.method == 'GET' && req.url == '/hello') {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.end('hello, world!');

    } else if (req.method == 'GET' && req.url == '/chunked') {
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'transfer-encoding': 'chunked'
      });
      res.write('<!DOCTYPE html>');
      setTimeout(() => res.end('<h1>Hello, world!</h1>'), 20);

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

    } else if (req.method == 'GET'
        && parsedUrl.pathname
        && parsedUrl.pathname.endsWith('/proxy')) {
      let headers = Object.assign({}, req.headers);
      headers['x-proxy-request-uri'] = req.url;
      res.writeHead(200, headers);
      res.end();

    } else if (req.method == 'GET'
        && parsedUrl.pathname
        && parsedUrl.pathname.endsWith('/proxy/redirect')) {
      let path = `/proxy${parsedUrl.search || ''}${parsedUrl.hash || ''}`;
      res.writeHead(303, {'Location': path});
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

  it('handles chunked responses', function() {
    let request = new HttpRequest('GET', '/chunked');

    let client = new HttpClient(server.url());
    return client.send(request).then(response => {
      assert.equal(200, response.status);
      assert.equal(response.body, '<!DOCTYPE html><h1>Hello, world!</h1>');
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

  describe('with proxy', function() {
    it('sends request to proxy with absolute URI', function() {
      var request = new HttpRequest('GET', '/proxy');
      var client = new HttpClient(
          'http://another.server.com', undefined, server.url());
      return client.send(request).then(function(response) {
        assert.equal(200, response.status);
        assert.equal(response.headers.get('host'), 'another.server.com');
        assert.equal(
            response.headers.get('x-proxy-request-uri'),
            'http://another.server.com/proxy');
      });
    });

    it('uses proxy when following redirects', function() {
      var request = new HttpRequest('GET', '/proxy/redirect');
      var client = new HttpClient(
          'http://another.server.com', undefined, server.url());
      return client.send(request).then(function(response) {
        assert.equal(200, response.status);
        assert.equal(response.headers.get('host'), 'another.server.com');
        assert.equal(
            response.headers.get('x-proxy-request-uri'),
            'http://another.server.com/proxy');
      });
    });

    it('includes search and hash in redirect URI', function() {
      var request = new HttpRequest('GET', '/proxy/redirect?foo#bar');
      var client = new HttpClient(
          'http://another.server.com', undefined, server.url());
      return client.send(request).then(function(response) {
        assert.equal(200, response.status);
        assert.equal(response.headers.get('host'), 'another.server.com');
        assert.equal(
            response.headers.get('x-proxy-request-uri'),
            'http://another.server.com/proxy?foo#bar');
      });
    });
  });
});
