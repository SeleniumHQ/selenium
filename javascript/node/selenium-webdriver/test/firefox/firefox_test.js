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
          return driver.quit();
        }
      });

      /**
       * Runs a test that requires Firefox Developer Edition. The test will be
       * skipped if dev cannot be found on the current system.
       */
      function runWithFirefoxDev(options, testFn) {
        let binary = new firefox.Binary();
        binary.useDevEdition();
        return binary.locate().then(exe => {
          options.setBinary(exe);
          driver = env.builder()
              .setFirefoxOptions(options)
              .build();
          return driver.call(testFn);
        }, err => {
          console.warn(
              'Skipping test: could not find Firefox Dev Edition: ' + err);
        });
      }

      test.it('can start Firefox with custom preferences', function*() {
        var profile = new firefox.Profile();
        profile.setPreference('general.useragent.override', 'foo;bar');

        var options = new firefox.Options().setProfile(profile);

        driver = env.builder().
            setFirefoxOptions(options).
            build();

        yield driver.get('data:text/html,<html><div>content</div></html>');

        var userAgent = yield driver.executeScript(
            'return window.navigator.userAgent');
        assert(userAgent).equalTo('foo;bar');
      });

      test.it('can start Firefox with a jetpack extension', function() {
        let profile = new firefox.Profile();
        profile.addExtension(JETPACK_EXTENSION);

        let options = new firefox.Options().setProfile(profile);

        return runWithFirefoxDev(options, function*() {
          yield loadJetpackPage(driver,
              'data:text/html;charset=UTF-8,<html><div>content</div></html>');

          let text =
              yield driver.findElement({id: 'jetpack-sample-banner'}).getText();
          assert(text).equalTo('Hello, world!');
        });
      });

      test.it('can start Firefox with a normal extension', function() {
        let profile = new firefox.Profile();
        profile.addExtension(NORMAL_EXTENSION);

        let options = new firefox.Options().setProfile(profile);

        return runWithFirefoxDev(options, function*() {
          yield driver.get('data:text/html,<html><div>content</div></html>');

          let footer =
              yield driver.findElement({id: 'sample-extension-footer'});
          let text = yield footer.getText();
          assert(text).equalTo('Goodbye');
        });
      });

      test.it('can start Firefox with multiple extensions', function() {
        let profile = new firefox.Profile();
        profile.addExtension(JETPACK_EXTENSION);
        profile.addExtension(NORMAL_EXTENSION);

        let options = new firefox.Options().setProfile(profile);

        return runWithFirefoxDev(options, function*() {
          yield loadJetpackPage(driver,
              'data:text/html;charset=UTF-8,<html><div>content</div></html>');

          let banner =
              yield driver.findElement({id: 'jetpack-sample-banner'}).getText();
          assert(banner).equalTo('Hello, world!');

          let footer =
              yield driver.findElement({id: 'sample-extension-footer'})
                  .getText();
          assert(footer).equalTo('Goodbye');
        });
      });

      function loadJetpackPage(driver, url) {
        // On linux the jetpack extension does not always run the first time
        // we load a page. If this happens, just reload the page (a simple
        // refresh doesn't appear to work).
        return driver.wait(function() {
          driver.get(url);
          return driver.findElements({id: 'jetpack-sample-banner'})
              .then(found => found.length > 0);
        }, 3000);
      }
    });

    describe('binary management', function() {
      var driver1, driver2;

      test.ignore(env.isRemote).
      it('can start multiple sessions with single binary instance', function*() {
        var options = new firefox.Options().setBinary(new firefox.Binary);
        env.builder().setFirefoxOptions(options);
        driver1 = yield env.builder().build();
        driver2 = yield env.builder().build();
        // Ok if this doesn't fail.
      });

      test.afterEach(function*() {
        if (driver1) {
          yield driver1.quit();
        }

        if (driver2) {
          yield driver2.quit();
        }
      });
    });

    describe('context switching', function() {
      var driver;

      test.beforeEach(function*() {
        driver = yield env.builder().build();
      });

      test.afterEach(function() {
        if (driver) {
          return driver.quit();
        }
      });

      test.ignore(() => !env.isMarionette).
      it('can get context', function() {
        return assert(driver.getContext()).equalTo(Context.CONTENT);
      });

      test.ignore(() => !env.isMarionette).
      it('can set context', function*() {
        yield driver.setContext(Context.CHROME);
        let ctxt = yield driver.getContext();
        assert(ctxt).equalTo(Context.CHROME);

        yield driver.setContext(Context.CONTENT);
        ctxt = yield driver.getContext();
        assert(ctxt).equalTo(Context.CONTENT);
      });

      test.ignore(() => !env.isMarionette).
      it('throws on unknown context', function() {
        return driver.setContext("foo").then(assert.fail, function(e) {
          assert(e).instanceOf(error.InvalidArgumentError);
        });
      });
    });

  });
}, {browsers: ['firefox']});
