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
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const extension = require('../../firefox/extension');
const io = require('../../io');
const zip = require('../../io/zip');


const WEBEXTENSION_EXTENSION =
    path.join(__dirname, '../../lib/test/data/firefox/webextension.xpi');
const WEBEXTENSION_EXTENSION_ID = 'webextensions-selenium-example@example.com';


describe('extension', function() {
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
});
