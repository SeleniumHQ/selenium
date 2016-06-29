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

var path = require('path');

var firefox = require('../../firefox'),
    io = require('../../io'),
    test = require('../../lib/test'),
    assert = require('../../testing/assert'),
    Context = require('../../firefox').Context,
    error = require('../..').error;


var JETPACK_EXTENSION = path.join(__dirname,
    '../../lib/test/data/firefox/jetpack-sample.xpi');
var NORMAL_EXTENSION = path.join(__dirname,
    '../../lib/test/data/firefox/sample.xpi');


test.suite(function(env) {
  describe('firefox', function() {
    describe('Options', function() {
      var driver;

      test.beforeEach(function() {
        driver = null;
      });

      test.afterEach(function() {
        if (driver) {
          driver.quit();
        }
      });

      test.it('can start Firefox with custom preferences', function() {
        var profile = new firefox.Profile();
        profile.setPreference('general.useragent.override', 'foo;bar');

        var options = new firefox.Options().setProfile(profile);

        driver = env.builder().
            setFirefoxOptions(options).
            build();

        driver.get('data:text/html,<html><div>content</div></html>');

        var userAgent = driver.executeScript(
            'return window.navigator.userAgent');
        assert(userAgent).equalTo('foo;bar');
      });

      test.it('can start Firefox with a jetpack extension', function() {
        var profile = new firefox.Profile();
        profile.addExtension(JETPACK_EXTENSION);

        var options = new firefox.Options().setProfile(profile);

        driver = env.builder().
            setFirefoxOptions(options).
            build();

        loadJetpackPage(driver,
            'data:text/html;charset=UTF-8,<html><div>content</div></html>');
        assert(driver.findElement({id: 'jetpack-sample-banner'}).getText())
            .equalTo('Hello, world!');
      });

      test.it('can start Firefox with a normal extension', function() {
        var profile = new firefox.Profile();
        profile.addExtension(NORMAL_EXTENSION);

        var options = new firefox.Options().setProfile(profile);

        driver = env.builder().
            setFirefoxOptions(options).
            build();

        driver.get('data:text/html,<html><div>content</div></html>');
        assert(driver.findElement({id: 'sample-extension-footer'}).getText())
            .equalTo('Goodbye');
      });

      test.it('can start Firefox with multiple extensions', function() {
        var profile = new firefox.Profile();
        profile.addExtension(JETPACK_EXTENSION);
        profile.addExtension(NORMAL_EXTENSION);

        var options = new firefox.Options().setProfile(profile);

        driver = env.builder().
            setFirefoxOptions(options).
            build();

        loadJetpackPage(driver,
            'data:text/html;charset=UTF-8,<html><div>content</div></html>');
        assert(driver.findElement({id: 'jetpack-sample-banner'}).getText())
            .equalTo('Hello, world!');
        assert(driver.findElement({id: 'sample-extension-footer'}).getText())
            .equalTo('Goodbye');
      });

      function loadJetpackPage(driver, url) {
        // On linux the jetpack extension does not always run the first time
        // we load a page. If this happens, just reload the page (a simple
        // refresh doesn't appear to work).
        driver.wait(function() {
          driver.get(url);
          return driver.findElements({id: 'jetpack-sample-banner'})
              .then(found => found.length > 0);
        }, 3000);
      }
    });

    describe('binary management', function() {
      var driver1, driver2;

      test.ignore(env.isRemote).
      it('can start multiple sessions with single binary instance', function() {
        var options = new firefox.Options().setBinary(new firefox.Binary);
        env.builder().setFirefoxOptions(options);
        driver1 = env.builder().build();
        driver2 = env.builder().build();
        // Ok if this doesn't fail.
      });

      test.afterEach(function() {
        if (driver1) {
          driver1.quit();
        }

        if (driver2) {
          driver2.quit();
        }
      });
    });

    describe('context switching', function() {
      var driver;

      test.beforeEach(function() {
        driver = env.builder().build();
      });

      test.afterEach(function() {
        if (driver) {
          driver.quit();
        }
      });

      test.ignore(() => !env.isMarionette).
      it('can get context', function() {
        assert(driver.getContext()).equalTo(Context.CONTENT);
      });

      test.ignore(() => !env.isMarionette).
      it('can set context', function() {
        driver.setContext(Context.CHROME);
        assert(driver.getContext()).equalTo(Context.CHROME);
        driver.setContext(Context.CONTENT);
        assert(driver.getContext()).equalTo(Context.CONTENT);
      });

      test.ignore(() => !env.isMarionette).
      it('throws on unknown context', function() {
        driver.setContext("foo").then(assert.fail, function(e) {
          assert(e).instanceOf(error.InvalidArgumentError);
        });
      });
    });

  });
}, {browsers: ['firefox']});
