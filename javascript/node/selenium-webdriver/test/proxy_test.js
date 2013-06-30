// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var http = require('http'),
    url = require('url');

var promise = require('..').promise,
    proxy = require('../proxy'),
    assertThat = require('../testing/asserts').assertThat,
    equals = require('../testing/asserts').equals,
    test = require('../lib/test'),
    Server = require('../lib/test/httpserver').Server,
    Pages = test.Pages;


test.suite(function(env) {
  env.autoCreateDriver = false;

  function writeResponse(res, body, encoding, contentType) {
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(body, encoding),
      'Content-Type': contentType
    });
    res.end(body);
  }

  function writePacFile(res) {
    writeResponse(res, [
      'function FindProxyForURL(url, host) {',
      '  if (shExpMatch(url, "' + goodbyeServer.url('*') + '")) {',
      '    return "DIRECT";',
      '  }',
      '  return "PROXY ' + proxyServer.host() + '";',
      '}',
    ].join('\n'), 'ascii', 'application/x-javascript-config');
  }

  var proxyServer = new Server(function(req, res) {
    var pathname = url.parse(req.url).pathname;
    if (pathname === '/proxy.pac') {
      return writePacFile(res);
    }

    writeResponse(res, [
      '<!DOCTYPE html>',
      '<title>Proxy page</title>',
      '<h3>This is the proxy landing page</h3>'
    ].join(''), 'utf8', 'text/html; charset=UTF-8');
  });

  var helloServer = new Server(function(req, res) {
    writeResponse(res, [
      '<!DOCTYPE html>',
      '<title>Hello</title>',
      '<h3>Hello, world!</h3>'
    ].join(''), 'utf8', 'text/html; charset=UTF-8');
  });

  var goodbyeServer = new Server(function(req, res) {
    writeResponse(res, [
      '<!DOCTYPE html>',
      '<title>Goodbye</title>',
      '<h3>Goodbye, world!</h3>'
    ].join(''), 'utf8', 'text/html; charset=UTF-8');
  });

  test.before(proxyServer.start.bind(proxyServer));
  test.before(helloServer.start.bind(helloServer));
  test.before(goodbyeServer.start.bind(helloServer));

  test.after(proxyServer.stop.bind(proxyServer));
  test.after(helloServer.stop.bind(helloServer));
  test.after(goodbyeServer.stop.bind(goodbyeServer));

  test.afterEach(env.dispose.bind(env));

  describe('manual proxy settings', function() {
    test.it('can configure HTTP proxy host', function() {
      var driver = env.builder().
          setProxy(proxy.manual({
            http: proxyServer.host()
          })).
          build();

      driver.get(helloServer.url());
      assertThat(driver.getTitle(), equals('Proxy page'));
      assertThat(
          driver.findElement({tagName: 'h3'}).getText(),
          equals('This is the proxy landing page'));
    });

    test.it('can bypass proxy for specific hosts', function() {
      var driver = env.builder().
          setProxy(proxy.manual({
            http: proxyServer.host(),
            bypass: helloServer.host()
          })).
          build();

      driver.get(helloServer.url());
      assertThat(driver.getTitle(), equals('Hello'));
      assertThat(
          driver.findElement({tagName: 'h3'}).getText(),
          equals('Hello, world!'));

      driver.get(goodbyeServer.url());
      assertThat(driver.getTitle(), equals('Proxy page'));
      assertThat(
          driver.findElement({tagName: 'h3'}).getText(),
          equals('This is the proxy landing page'));
    });

    // TODO: test ftp and https proxies.
  });

  describe('pac proxy settings', function() {
    test.it('can configure proxy through PAC file', function() {
      var driver = env.builder().
          setProxy(proxy.pac(proxyServer.url('/proxy.pac'))).
          build();

      driver.get(helloServer.url());
      assertThat(driver.getTitle(), equals('Proxy page'));
      assertThat(
          driver.findElement({tagName: 'h3'}).getText(),
          equals('This is the proxy landing page'));

      driver.get(goodbyeServer.url());
      assertThat(driver.getTitle(), equals('Goodbye'));
      assertThat(
          driver.findElement({tagName: 'h3'}).getText(),
          equals('Goodbye, world!'));
    });
  });

  // TODO: figure out how to test direct and system proxy settings.
});
