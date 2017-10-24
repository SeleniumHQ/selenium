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
    {Pages, suite, ignore} = require('../../lib/test'),
    assert = require('../../testing/assert'),
    Context = require('../../firefox').Context,
    error = require('../..').error;

var {consume} = require('../../lib/promise');


var JETPACK_EXTENSION = path.join(__dirname,
    '../../lib/test/data/firefox/jetpack-sample.xpi');
var NORMAL_EXTENSION = path.join(__dirname,
    '../../lib/test/data/firefox/sample.xpi');
var WEBEXTENSION_EXTENSION = path.join(__dirname,
  '../../lib/test/data/firefox/webextension.xpi');


suite(function(env) {
  describe('firefox', function() {
    describe('Options', function() {
      let driver;

      beforeEach(function() {
        driver = null;
      });

      afterEach(function() {
        if (driver) {
          return driver.quit();
        }
      });

      /**
       * @param {...string} extensions the extensions to install.
       * @return {!firefox.Profile} a new profile.
       */
      function profileWithExtensions(...extensions) {
        let profile = new firefox.Profile();
        profile.setPreference('xpinstall.signatures.required', false);
        extensions.forEach(ext => profile.addExtension(ext));
        return profile;
      }

      /**
       * Runs a test that requires Firefox Developer Edition. The test will be
       * skipped if dev cannot be found on the current system.
       */
      function runWithFirefoxDev(options, testFn) {
        return firefox.Channel.AURORA.locate().then(async (exe) => {
          options.setBinary(exe);
          driver = await env.builder()
              .setFirefoxOptions(options)
              .build();
          return testFn();
        }, err => {
          console.warn(
              'Skipping test: could not find Firefox Dev Edition: ' + err);
        });
      }

      describe('can start Firefox with custom preferences', function() {
        async function runTest(opt_dir) {
          let profile = new firefox.Profile(opt_dir);
          profile.setPreference('general.useragent.override', 'foo;bar');

          let options = new firefox.Options().setProfile(profile);

          driver = env.builder().
              setFirefoxOptions(options).
              build();

          await driver.get('data:text/html,<html><div>content</div></html>');

          var userAgent = await driver.executeScript(
              'return window.navigator.userAgent');
          assert(userAgent).equalTo('foo;bar');
        }

        it('profile created from scratch', function() {
          return runTest();
        });

        it('profile created from template', function() {
          return io.tmpDir().then(runTest);
        });
      });

      it('can start Firefox with a jetpack extension', function() {
        let profile = profileWithExtensions(JETPACK_EXTENSION);
        let options = new firefox.Options().setProfile(profile);

        return runWithFirefoxDev(options, async function() {
          await loadJetpackPage(driver,
              'data:text/html;charset=UTF-8,<html><div>content</div></html>');

          let text =
              await driver.findElement({id: 'jetpack-sample-banner'}).getText();
          assert(text).equalTo('Hello, world!');
        });
      });

      it('can start Firefox with a normal extension', function() {
        let profile = profileWithExtensions(NORMAL_EXTENSION);
        let options = new firefox.Options().setProfile(profile);

        return runWithFirefoxDev(options, async function() {
          await driver.get('data:text/html,<html><div>content</div></html>');

          let footer =
              await driver.findElement({id: 'sample-extension-footer'});
          let text = await footer.getText();
          assert(text).equalTo('Goodbye');
        });
      });

      it('can start Firefox with a webextension extension', function() {
        let profile = profileWithExtensions(WEBEXTENSION_EXTENSION);
        let options = new firefox.Options().setProfile(profile);

        return runWithFirefoxDev(options, async function() {
          await driver.get(Pages.echoPage);

          let footer =
              await driver.findElement({id: 'webextensions-selenium-example'});
          let text = await footer.getText();
          assert(text).equalTo('Content injected by webextensions-selenium-example');
        });
      });

      it('can start Firefox with multiple extensions', function() {
        let profile =
            profileWithExtensions(JETPACK_EXTENSION, NORMAL_EXTENSION);
        let options = new firefox.Options().setProfile(profile);

        return runWithFirefoxDev(options, async function() {
          await loadJetpackPage(driver,
              'data:text/html;charset=UTF-8,<html><div>content</div></html>');

          let banner =
              await driver.findElement({id: 'jetpack-sample-banner'}).getText();
          assert(banner).equalTo('Hello, world!');

          let footer =
              await driver.findElement({id: 'sample-extension-footer'})
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

    describe('context switching', function() {
      var driver;

      beforeEach(async function() {
        driver = await env.builder().build();
      });

      afterEach(function() {
        if (driver) {
          return driver.quit();
        }
      });

      it('can get context', function() {
        return assert(driver.getContext()).equalTo(Context.CONTENT);
      });

      it('can set context', async function() {
        await driver.setContext(Context.CHROME);
        let ctxt = await driver.getContext();
        assert(ctxt).equalTo(Context.CHROME);

        await driver.setContext(Context.CONTENT);
        ctxt = await driver.getContext();
        assert(ctxt).equalTo(Context.CONTENT);
      });

      it('throws on unknown context', function() {
        return driver.setContext("foo").then(assert.fail, function(e) {
          assert(e).instanceOf(error.InvalidArgumentError);
        });
      });
    });

  });
}, {browsers: ['firefox']});
