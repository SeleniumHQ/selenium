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
    crypto = require('crypto'),
    fs = require('fs'),
    path = require('path');

var extension = require('../../firefox/extension'),
    io = require('../../io'),
    zip = require('../../io/zip'),
    it = require('../../testing').it;


var JETPACK_EXTENSION = path.join(__dirname,
    '../../lib/test/data/firefox/jetpack-sample.xpi');
var NORMAL_EXTENSION = path.join(__dirname,
  '../../lib/test/data/firefox/sample.xpi');
var WEBEXTENSION_EXTENSION = path.join(__dirname,
  '../../lib/test/data/firefox/webextension.xpi');

var JETPACK_EXTENSION_ID = 'jid1-EaXX7k0wwiZR7w@jetpack';
var NORMAL_EXTENSION_ID = 'sample@seleniumhq.org';
var WEBEXTENSION_EXTENSION_ID = 'webextensions-selenium-example@example.com';


describe('extension', function() {
  it('can install a jetpack xpi file', function() {
    return io.tmpDir().then(function(dir) {
      return extension.install(JETPACK_EXTENSION, dir).then(function(id) {
        assert.equal(JETPACK_EXTENSION_ID, id);
        var file = path.join(dir, id + '.xpi');
        assert.ok(fs.existsSync(file), 'no such file: ' + file);
        assert.ok(!fs.statSync(file).isDirectory());

        var copiedSha1 = crypto.createHash('sha1')
            .update(fs.readFileSync(file))
            .digest('hex');

        var goldenSha1 = crypto.createHash('sha1')
            .update(fs.readFileSync(JETPACK_EXTENSION))
            .digest('hex');

        assert.equal(copiedSha1, goldenSha1);
      });
    });
  });

  it('can install a normal xpi file', function() {
    return io.tmpDir().then(function(dir) {
      return extension.install(NORMAL_EXTENSION, dir).then(function(id) {
        assert.equal(NORMAL_EXTENSION_ID, id);

        var file = path.join(dir, NORMAL_EXTENSION_ID);
        assert.ok(fs.statSync(file).isDirectory());

        assert.ok(fs.existsSync(path.join(file, 'chrome.manifest')));
        assert.ok(fs.existsSync(path.join(file, 'content/overlay.xul')));
        assert.ok(fs.existsSync(path.join(file, 'content/overlay.js')));
        assert.ok(fs.existsSync(path.join(file, 'install.rdf')));
      });
    });
  });

  it('can install a webextension xpi file', function() {
    return io.tmpDir().then(function(dir) {
      return extension.install(WEBEXTENSION_EXTENSION, dir).then(function(id) {
        assert.equal(WEBEXTENSION_EXTENSION_ID, id);
        var file = path.join(dir, id + '.xpi');
        assert.ok(fs.existsSync(file), 'no such file: ' + file);
        assert.ok(!fs.statSync(file).isDirectory());

        var copiedSha1 = crypto.createHash('sha1')
          .update(fs.readFileSync(file))
          .digest('hex');

        var goldenSha1 = crypto.createHash('sha1')
          .update(fs.readFileSync(WEBEXTENSION_EXTENSION))
          .digest('hex');

        assert.equal(copiedSha1, goldenSha1);
      });
    });
  });

  it('can install an extension from a directory', function() {
    return io.tmpDir().then(function(srcDir) {
      return zip.unzip(NORMAL_EXTENSION, srcDir)
          .then(() => io.tmpDir())
          .then(dstDir => {
            return extension.install(srcDir, dstDir).then(function(id) {
              assert.equal(NORMAL_EXTENSION_ID, id);

              var dir = path.join(dstDir, NORMAL_EXTENSION_ID);

              assert.ok(fs.existsSync(path.join(dir, 'chrome.manifest')));
              assert.ok(fs.existsSync(path.join(dir, 'content/overlay.xul')));
              assert.ok(fs.existsSync(path.join(dir, 'content/overlay.js')));
              assert.ok(fs.existsSync(path.join(dir, 'install.rdf')));
            });
          });
    });
  });
});
