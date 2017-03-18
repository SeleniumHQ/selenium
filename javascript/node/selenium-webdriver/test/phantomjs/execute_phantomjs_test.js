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

var assert = require('assert');
var path = require('path');
var test = require('../../lib/test');

test.suite(function(env) {
  var driver;

  test.before(function*() {
    driver = yield env.builder().build();
  });

  test.after(function() {
    return driver.quit();
  });

  var testPageUrl =
      'data:text/html,<html><h1>' + path.basename(__filename) + '</h1></html>';

  test.beforeEach(function() {
    return driver.get(testPageUrl);
  });

  describe('phantomjs.Driver', function() {
    describe('#executePhantomJS()', function() {

      test.it('can execute scripts using PhantomJS API', function*() {
        let url = yield driver.executePhantomJS('return this.url;');
        assert.equal(testPageUrl, decodeURIComponent(url));
      });

      test.it('can execute scripts as functions', function*() {
        let result = yield driver.executePhantomJS(function(a, b) {
          return a + b;
        }, 1, 2);

        assert.equal(3, result);
      });
    });
  });
}, {browsers: ['phantomjs']});
