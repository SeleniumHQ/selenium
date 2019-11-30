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
  describe('WebElement', function() {
    let driver;

    before(async function() {
      driver = await env.builder().build();
    });

    after(function() {
      return driver.quit();
    });

    it('getRect()', async function() {
      const html = 
          '<!DOCTYPE html><style>'
              + '*{padding:0; margin:0}'
              + 'div{position: absolute; top: 50px; left: 40px;'
              + 'height: 25px;width:35px;background: green;}'
              + '</style><div>Hello</div>';

      await driver.get(test.Pages.echoPage + `?html=${encodeURIComponent(html)}`);
      const el = await driver.findElement(By.css('div'));
      const rect = await el.getRect();
      assert.deepEqual(rect, {width: 35, height: 25, x: 40, y: 50});
    });
  });
});
