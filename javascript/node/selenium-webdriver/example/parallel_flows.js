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

/**
 * @fileoverview An example of starting multiple WebDriver clients that run
 * in parallel in separate control flows.
 *
 * This example will only work when the promise manager is enabled
 * (see <https://github.com/SeleniumHQ/selenium/issues/2969>).
 */

const {Builder, By, Key, promise, until} = require('..');

for (var i = 0; i < 3; i++) {
  (function(n) {
    var flow = new promise.ControlFlow()
        .on('uncaughtException', function(e) {
          console.log('uncaughtException in flow %d: %s', n, e);
        });

    var driver = new Builder().
        forBrowser('firefox').
        setControlFlow(flow).  // Comment out this line to see the difference.
        build();

    // Position and resize window so it's easy to see them running together.
    driver.manage().window().setSize(600, 400);
    driver.manage().window().setPosition(300 * i, 400 * i);

    driver.get('http://www.google.com');
    driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    driver.wait(until.titleIs('webdriver - Google Search'), 1000);

    driver.quit();
  })(i);
}

