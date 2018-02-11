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

const io = require('../io');
const remote = require('../remote');
const test = require('../lib/test');
const {Browser, By, until} = require('..');

const Pages = test.Pages;

test.suite(function(env) {
  var LOREM_IPSUM_TEXT = 'lorem ipsum dolor sit amet';
  var FILE_HTML = '<!DOCTYPE html><div>' + LOREM_IPSUM_TEXT + '</div>';

  var fp;
  before(function() {
    return fp = io.tmpFile().then(function(fp) {
      fs.writeFileSync(fp, FILE_HTML);
      return fp;
    });
  })

  var driver;
  before(async function() {
    driver = await env.builder().build();
  });

  after(function() {
    if (driver) {
      return driver.quit();
    }
  });

  test.ignore(env.browsers(Browser.SAFARI)).
  it('can upload files', async function() {
    driver.setFileDetector(new remote.FileDetector);

    await driver.get(Pages.uploadPage);

    var fp = await io.tmpFile().then(function(fp) {
      fs.writeFileSync(fp, FILE_HTML);
      return fp;
    });

    await driver.findElement(By.id('upload')).sendKeys(fp);
    await driver.findElement(By.id('go')).click();

    // Uploading files across a network may take a while, even if they're small.
    var label = await driver.findElement(By.id('upload_label'));
    await driver.wait(until.elementIsNotVisible(label),
        10 * 1000, 'File took longer than 10 seconds to upload!');

    var frame = await driver.findElement(By.id('upload_target'));
    await driver.switchTo().frame(frame);
    assert.equal(
        await driver.findElement(By.css('body')).getText(),
        LOREM_IPSUM_TEXT);
  });
});
