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
const fs = require('fs');
const path = require('path');

const io = require('../../io');
const {Profile, decode, loadUserPrefs} = require('../../firefox/profile');


const WEBEXTENSION_EXTENSION =
    path.join(__dirname, '../../lib/test/data/firefox/webextension.xpi');
const WEBEXTENSION_EXTENSION_ID = 'webextensions-selenium-example@example.com';


describe('Profile', function() {
  describe('setPreference', function() {
    it('allows setting custom properties', function() {
      var profile = new Profile();
      assert.equal(undefined, profile.getPreference('foo'));

      profile.setPreference('foo', 'bar');
      assert.equal('bar', profile.getPreference('foo'));
    });

    it('allows overriding mutable properties', function() {
      var profile = new Profile();

      profile.setPreference('browser.newtab.url', 'http://www.example.com');
      assert.equal('http://www.example.com',
          profile.getPreference('browser.newtab.url'));
    });
  });

  describe('writeToDisk', function() {
    it('copies template directory recursively', function() {
      var templateDir;
      return io.tmpDir().then(function(td) {
        templateDir = td;
        var foo = path.join(templateDir, 'foo');
        fs.writeFileSync(foo, 'Hello, world');

        var bar = path.join(templateDir, 'subfolder/bar');
        fs.mkdirSync(path.dirname(bar));
        fs.writeFileSync(bar, 'Goodbye, world!');

        return new Profile(templateDir).writeToDisk();
      }).then(function(profileDir) {
        assert.notEqual(profileDir, templateDir);

        assert.equal('Hello, world',
            fs.readFileSync(path.join(profileDir, 'foo')));
        assert.equal('Goodbye, world!',
            fs.readFileSync(path.join(profileDir, 'subfolder/bar')));
      });
    });

    it('does not copy lock files', function() {
      return io.tmpDir().then(function(dir) {
        fs.writeFileSync(path.join(dir, 'parent.lock'), 'lock');
        fs.writeFileSync(path.join(dir, 'lock'), 'lock');
        fs.writeFileSync(path.join(dir, '.parentlock'), 'lock');
        return new Profile(dir).writeToDisk();
      }).then(function(dir) {
        assert.ok(fs.existsSync(dir));
        assert.ok(!fs.existsSync(path.join(dir, 'parent.lock')));
        assert.ok(!fs.existsSync(path.join(dir, 'lock')));
        assert.ok(!fs.existsSync(path.join(dir, '.parentlock')));
      });
    });

    describe('user.js', function() {
      it('merges template user.js into preferences', function() {
        return io.tmpDir().then(function(dir) {
          fs.writeFileSync(path.join(dir, 'user.js'), [
            'user_pref("browser.newtab.url", "http://www.example.com")',
            'user_pref("dom.max_script_run_time", 1234)'
          ].join('\n'));

          return new Profile(dir).writeToDisk();
        }).then(function(profile) {
          return loadUserPrefs(path.join(profile, 'user.js'));
        }).then(function(prefs) {
          assert.equal('http://www.example.com', prefs['browser.newtab.url']);
          assert.equal(1234, prefs['dom.max_script_run_time']);
        });
      });
    });

    describe('extensions', function() {
      it('are copied into new profile directory', function() {
        var profile = new Profile();
        profile.addExtension(WEBEXTENSION_EXTENSION);

        return profile.writeToDisk().then(function(dir) {
          dir = path.join(dir, 'extensions');
          assertExists(WEBEXTENSION_EXTENSION_ID + '.xpi');

          function assertExists(file) {
            assert.ok(
                fs.existsSync(path.join(dir, file)),
                `expected ${file} to exist`);
          }
        });
      });
    });
  });
});
