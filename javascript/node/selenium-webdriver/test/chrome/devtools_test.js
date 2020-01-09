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

const chrome = require('../../chrome');
const error = require('../../lib/error');
const fileServer = require('../../lib/test/fileserver');
const io = require('../../io');
const test = require('../../lib/test');
const webdriver = require('../..');

test.suite(function(env) {
  let driver;

  before(async function() {
    driver = await env.builder()
        .setChromeOptions(new chrome.Options().headless())
        .build();
  });
  after(() => driver.quit());

  it('can send commands to devtools', async function() {
    await driver.get(test.Pages.ajaxyPage);
    assert.equal(await driver.getCurrentUrl(), test.Pages.ajaxyPage);

    await driver.sendDevToolsCommand(
        'Page.navigate', {url: test.Pages.echoPage});
    assert.equal(await driver.getCurrentUrl(), test.Pages.echoPage);
  });

  describe('setDownloadPath', function() {
    it('can enable downloads in headless mode', async function() {
      const dir = await io.tmpDir();
      await driver.setDownloadPath(dir);

      const url = fileServer.whereIs('/data/firefox/webextension.xpi');
      await driver.get(`data:text/html,<!DOCTYPE html>
  <div><a download="" href="${url}">Go!</a></div>`);

      await driver.findElement({css: 'a'}).click();

      const downloadPath = path.join(dir, 'webextension.xpi');
      await driver.wait(() => io.exists(downloadPath), 5000);

      const goldenPath =
          path.join(__dirname, '../../lib/test/data/firefox/webextension.xpi');
      assert.equal(
          fs.readFileSync(downloadPath, 'binary'),
          fs.readFileSync(goldenPath, 'binary'));
    });

    it('throws if path is not a directory', async function() {
      await assertInvalidArgumentError(() => driver.setDownloadPath());
      await assertInvalidArgumentError(() => driver.setDownloadPath(null));
      await assertInvalidArgumentError(() => driver.setDownloadPath(''));
      await assertInvalidArgumentError(() => driver.setDownloadPath(1234));

      const file = await io.tmpFile();
      await assertInvalidArgumentError(() => driver.setDownloadPath(file));

      async function assertInvalidArgumentError(fn) {
        try {
          await fn();
          return Promise.reject(Error('should have failed'));
        } catch (err) {
          if (err instanceof error.InvalidArgumentError) {
            return;
          }
          throw err;
        }
      }
    });
  });
}, {browsers: ['chrome']});
