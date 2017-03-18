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

const {By} = require('..');
const test = require('../lib/test');

test.suite(function(env) {
  describe('rect commands', function() {
    let driver;
    let el;

    test.before(function*() {
      driver = yield env.builder().build();
      yield driver.get(
            'data:text/html,<!DOCTYPE html><style>'
                + '*{padding:0; margin:0}'
                + 'div{position: absolute; top: 50px; left: 50px;'
                + 'height: 50px;width:50px;background: green;}'
                + '</style><div>Hello</div>');
      el = yield driver.findElement(By.css('div'));
    });

    after(function() {
      if (driver) {
        return driver.quit();
      }
    });

    test.it('WebElement.getLocation()', function*() {
      let location = yield el.getLocation();
      assert.equal(location.x, 50);
      assert.equal(location.y, 50);
    });

    test.it('WebElement.getSize()', function*() {
      let size = yield el.getSize();
      assert.equal(size.width, 50);
      assert.equal(size.height, 50);
    });

  });
});
