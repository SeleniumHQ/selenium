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

const assert = require('assert');
const path = require('path');

const error = require('../../lib/error');
const firefox = require('../../firefox');
const io = require('../../io');
const {Context} = require('../../firefox');
const {Pages, suite, ignore} = require('../../lib/test');

const WEBEXTENSION_EXTENSION =
    path.join(__dirname, '../../lib/test/data/firefox/webextension.xpi');


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
          assert.equal(userAgent, 'foo;bar');
        }

        it('profile created from scratch', function() {
          return runTest();
        });

        it('profile created from template', function() {
          return io.tmpDir().then(runTest);
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
          assert.equal(text, 'Content injected by webextensions-selenium-example');
        });
      });
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

      it('can get context', async function() {
        assert.equal(await driver.getContext(), Context.CONTENT);
      });

      it('can set context', async function() {
        await driver.setContext(Context.CHROME);
        let ctxt = await driver.getContext();
        assert.equal(ctxt, Context.CHROME);

        await driver.setContext(Context.CONTENT);
        ctxt = await driver.getContext();
        assert.equal(ctxt, Context.CONTENT);
      });

      it('throws on unknown context', function() {
        return driver.setContext("foo").then(assert.fail, function(e) {
          assert(e instanceof error.InvalidArgumentError);
        });
      });
    });

  });
}, {browsers: ['firefox']});
