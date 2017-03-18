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
    url = require('url');

var test = require('../lib/test'),
    fileserver = require('../lib/test/fileserver'),
    Browser = require('..').Browser,
    Pages = test.Pages;


test.suite(function(env) {
  var driver;

  test.before(function*() {
    driver = yield env.builder().build();
  });

  test.after(function() {
    return driver.quit();
  });

  // Cookie handling is broken.
  test.ignore(env.browsers(Browser.PHANTOM_JS, Browser.SAFARI)).
  describe('Cookie Management;', function() {

    test.beforeEach(function*() {
      yield driver.get(fileserver.Pages.ajaxyPage);
      yield driver.manage().deleteAllCookies();
      return assertHasCookies();
    });

    test.it('can add new cookies', function*() {
      var cookie = createCookieSpec();

      yield driver.manage().addCookie(cookie);
      yield driver.manage().getCookie(cookie.name).then(function(actual) {
        assert.equal(actual.value, cookie.value);
      });
    });

    test.it('can get all cookies', function*() {
      var cookie1 = createCookieSpec();
      var cookie2 = createCookieSpec();

      yield driver.manage().addCookie(cookie1);
      yield driver.manage().addCookie(cookie2);

      return assertHasCookies(cookie1, cookie2);
    });

    test.ignore(env.browsers(Browser.IE)).
    it('only returns cookies visible to the current page', function*() {
      var cookie1 = createCookieSpec();

      yield driver.manage().addCookie(cookie1);

      var pageUrl = fileserver.whereIs('page/1');
      var cookie2 = createCookieSpec({
        path: url.parse(pageUrl).pathname
      });
      yield driver.get(pageUrl);
      yield driver.manage().addCookie(cookie2);
      yield assertHasCookies(cookie1, cookie2);

      yield driver.get(fileserver.Pages.ajaxyPage);
      yield assertHasCookies(cookie1);

      yield driver.get(pageUrl);
      yield assertHasCookies(cookie1, cookie2);
    });

    test.it('can delete all cookies', function*() {
      var cookie1 = createCookieSpec();
      var cookie2 = createCookieSpec();

      yield driver.executeScript(
          'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];',
          cookie1.name, cookie1.value, cookie2.name, cookie2.value);
      yield assertHasCookies(cookie1, cookie2);

      yield driver.manage().deleteAllCookies();
      yield assertHasCookies();
    });

    test.it('can delete cookies by name', function*() {
      var cookie1 = createCookieSpec();
      var cookie2 = createCookieSpec();

      yield driver.executeScript(
          'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];',
          cookie1.name, cookie1.value, cookie2.name, cookie2.value);
      yield assertHasCookies(cookie1, cookie2);

      yield driver.manage().deleteCookie(cookie1.name);
      yield assertHasCookies(cookie2);
    });

    test.it('should only delete cookie with exact name', function*() {
      var cookie1 = createCookieSpec();
      var cookie2 = createCookieSpec();
      var cookie3 = {name: cookie1.name + 'xx', value: cookie1.value};

      yield driver.executeScript(
          'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];' +
          'document.cookie = arguments[4] + "=" + arguments[5];',
          cookie1.name, cookie1.value, cookie2.name, cookie2.value,
          cookie3.name, cookie3.value);
      yield assertHasCookies(cookie1, cookie2, cookie3);

      yield driver.manage().deleteCookie(cookie1.name);
      yield assertHasCookies(cookie2, cookie3);
    });

    test.it('can delete cookies set higher in the path', function*() {
      var cookie = createCookieSpec();
      var childUrl = fileserver.whereIs('child/childPage.html');
      var grandchildUrl = fileserver.whereIs(
          'child/grandchild/grandchildPage.html');

      yield driver.get(childUrl);
      yield driver.manage().addCookie(cookie);
      yield assertHasCookies(cookie);

      yield driver.get(grandchildUrl);
      yield assertHasCookies(cookie);

      yield driver.manage().deleteCookie(cookie.name);
      yield assertHasCookies();

      yield driver.get(childUrl);
      yield assertHasCookies();
    });

    test.ignore(env.browsers(
        Browser.ANDROID,
        Browser.FIREFOX,
        'legacy-' + Browser.FIREFOX,
        Browser.IE)).
    it('should retain cookie expiry', function*() {
      let expirationDelay = 5 * 1000;
      let expiry = new Date(Date.now() + expirationDelay);
      let cookie = createCookieSpec({expiry});

      yield driver.manage().addCookie(cookie);
      yield driver.manage().getCookie(cookie.name).then(function(actual) {
        assert.equal(actual.value, cookie.value);
        // expiry times are exchanged in seconds since January 1, 1970 UTC.
        assert.equal(actual.expiry, Math.floor(expiry.getTime() / 1000));
      });

      yield driver.sleep(expirationDelay);
      yield assertHasCookies();
    });
  });

  function createCookieSpec(opt_options) {
    let spec = {
      name: getRandomString(),
      value: getRandomString()
    };
    if (opt_options) {
      spec = Object.assign(spec, opt_options);
    }
    return spec;
  }

  function buildCookieMap(cookies) {
    var map = {};
    cookies.forEach(function(cookie) {
      map[cookie.name] = cookie;
    });
    return map;
  }

  function assertHasCookies(...expected) {
    return driver.manage().getCookies().then(function(cookies) {
      assert.equal(cookies.length, expected.length,
          'Wrong # of cookies.' +
          '\n  Expected: ' + JSON.stringify(expected) +
          '\n  Was     : ' + JSON.stringify(cookies));

      var map = buildCookieMap(cookies);
      for (var i = 0; i < expected.length; ++i) {
        assert.equal(expected[i].value, map[expected[i].name].value);
      }
    });
  }

  function getRandomString() {
    var x = 1234567890;
    return Math.floor(Math.random() * x).toString(36);
  }
});
