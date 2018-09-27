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

var {Pages, ignore, suite} = require('../lib/test'),
    fileserver = require('../lib/test/fileserver'),
    {Browser} = require('..');


suite(function(env) {
  var driver;

  before(async function() {
    driver = await env.builder().build();
  });

  after(function() {
    return driver.quit();
  });

  describe('Cookie Management;', function() {

    beforeEach(async function() {
      await driver.get(fileserver.Pages.ajaxyPage);
      await driver.manage().deleteAllCookies();
      return assertHasCookies();
    });

    it('can add new cookies', async function() {
      var cookie = createCookieSpec();

      await driver.manage().addCookie(cookie);
      await driver.manage().getCookie(cookie.name).then(function(actual) {
        assert.equal(actual.value, cookie.value);
      });
    });

    it('can get all cookies', async function() {
      var cookie1 = createCookieSpec();
      var cookie2 = createCookieSpec();

      await driver.manage().addCookie(cookie1);
      await driver.manage().addCookie(cookie2);

      return assertHasCookies(cookie1, cookie2);
    });

    ignore(env.browsers(Browser.IE)).
    it('only returns cookies visible to the current page', async function() {
      var cookie1 = createCookieSpec();

      await driver.manage().addCookie(cookie1);

      var pageUrl = fileserver.whereIs('page/1');
      var cookie2 = createCookieSpec({
        path: url.parse(pageUrl).pathname
      });
      await driver.get(pageUrl);
      await driver.manage().addCookie(cookie2);
      await assertHasCookies(cookie1, cookie2);

      await driver.get(fileserver.Pages.ajaxyPage);
      await assertHasCookies(cookie1);

      await driver.get(pageUrl);
      await assertHasCookies(cookie1, cookie2);
    });

    it('can delete all cookies', async function() {
      var cookie1 = createCookieSpec();
      var cookie2 = createCookieSpec();

      await driver.executeScript(
          'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];',
          cookie1.name, cookie1.value, cookie2.name, cookie2.value);
      await assertHasCookies(cookie1, cookie2);

      await driver.manage().deleteAllCookies();
      await assertHasCookies();
    });

    it('can delete cookies by name', async function() {
      var cookie1 = createCookieSpec();
      var cookie2 = createCookieSpec();

      await driver.executeScript(
          'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];',
          cookie1.name, cookie1.value, cookie2.name, cookie2.value);
      await assertHasCookies(cookie1, cookie2);

      await driver.manage().deleteCookie(cookie1.name);
      await assertHasCookies(cookie2);
    });

    it('should only delete cookie with exact name', async function() {
      var cookie1 = createCookieSpec();
      var cookie2 = createCookieSpec();
      var cookie3 = {name: cookie1.name + 'xx', value: cookie1.value};

      await driver.executeScript(
          'document.cookie = arguments[0] + "=" + arguments[1];' +
          'document.cookie = arguments[2] + "=" + arguments[3];' +
          'document.cookie = arguments[4] + "=" + arguments[5];',
          cookie1.name, cookie1.value, cookie2.name, cookie2.value,
          cookie3.name, cookie3.value);
      await assertHasCookies(cookie1, cookie2, cookie3);

      await driver.manage().deleteCookie(cookie1.name);
      await assertHasCookies(cookie2, cookie3);
    });

    it('can delete cookies set higher in the path', async function() {
      var cookie = createCookieSpec();
      var childUrl = fileserver.whereIs('child/childPage.html');
      var grandchildUrl = fileserver.whereIs(
          'child/grandchild/grandchildPage.html');

      await driver.get(childUrl);
      await driver.manage().addCookie(cookie);
      await assertHasCookies(cookie);

      await driver.get(grandchildUrl);
      await assertHasCookies(cookie);

      await driver.manage().deleteCookie(cookie.name);
      await assertHasCookies();

      await driver.get(childUrl);
      await assertHasCookies();
    });

    ignore(env.browsers(
        Browser.FIREFOX,
        Browser.IE)).
    it('should retain cookie expiry', async function() {
      let expirationDelay = 5 * 1000;
      let expiry = new Date(Date.now() + expirationDelay);
      let cookie = createCookieSpec({expiry});

      await driver.manage().addCookie(cookie);
      await driver.manage().getCookie(cookie.name).then(function(actual) {
        assert.equal(actual.value, cookie.value);

        // expiry times should be in seconds since January 1, 1970 UTC
        try {
          assert.equal(actual.expiry, Math.floor(expiry.getTime() / 1000));
          assert.notEqual(
              env.browser.name, Browser.SAFARI,
              'Safari cookie expiry fixed; update test');
        } catch (ex) {
          if (env.browser.name !== Browser.SAFARI
              || !(ex instanceof assert.AssertionError)) {
            throw ex;
          }

          // Safari returns milliseconds (and is off by a few seconds...)
          let diff = Math.abs(actual.expiry - expiry.getTime());
          if (diff > 2000) {
            assert.fail(
                actual.expiry, expiry.getTime(),
                'Expect Safari to return expiry in millis since epoch ± 2s');
          }
        }
      });

      await driver.sleep(expirationDelay);
      await assertHasCookies();
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
