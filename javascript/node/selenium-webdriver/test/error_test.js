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

describe('error', function() {
  let assert = require('assert');
  let error = require('../error');

  describe('decode', function() {
    it('defaults to WebDriverError if type is unrecognized', function() {
      try {
        error.checkResponse({error: 'foo', message: 'hi there'});
        throw Error('Expected to throw!');
      } catch (ex) {
        assert.ok(ex instanceof error.WebDriverError, 'not a webdriver error');
        assert.equal(ex.code, error.WebDriverError.code);
      }
    });

    it('can decode an error', function() {
      try {
        error.checkResponse({error: 'no such window', message: 'oops'});
        throw Error('Expected to throw!');
      } catch (ex) {
        assert.ok(ex instanceof error.NoSuchWindowError);
        assert.equal(ex.code, error.NoSuchWindowError.code);
      }
    });
  });
});
