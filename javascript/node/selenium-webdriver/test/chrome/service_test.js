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

const chrome = require('../../chrome');
const test = require('../../lib/test');
const webdriver = require('../..');


test.suite(function(env) {
  describe('chromedriver', function() {
    var service;
    afterEach(function() {
      if (service) {
        return service.kill();
      }
    });

    it('can be started on a custom path', function() {
      service = new chrome.ServiceBuilder()
          .setPath('/foo/bar/baz')
          .build();
      return service.start().then(function(url) {
        assert.ok(url.endsWith('/foo/bar/baz'), 'unexpected url: ' + url);
      });
    });
  });
}, {browsers: ['chrome']});
