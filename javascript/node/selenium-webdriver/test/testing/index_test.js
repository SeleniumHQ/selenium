// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var assert = require('assert');

var test = require('../../testing');

describe('Mocha Integration', function() {

  describe('beforeEach properly binds "this"', function() {
    beforeEach(function() { this.x = 1; });
    test.beforeEach(function() { this.x = 2; });
    it('', function() { assert.equal(this.x, 2); });
  });

  describe('afterEach properly binds "this"', function() {
    it('', function() { this.x = 1; });
    test.afterEach(function() { this.x = 2; });
    afterEach(function() { assert.equal(this.x, 2); });
  });

  describe('it properly binds "this"', function() {
    beforeEach(function() { this.x = 1; });
    test.it('', function() { this.x = 2; });
    afterEach(function() { assert.equal(this.x, 2); });
  });
});
