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

/**
 * @fileoverview An example WebDriver script.
 * Usage: node selenium-webdriver/example/google_search.js selenium_jar
 * where selenium_jar is the path to the standalone Selenium server jar to use.
 */

var fs = require('fs');

var webdriver = require('..'),
    remote = require('../remote');


if (process.argv.length !== 3) {
  console.log('Usage: node ' + __filename + ' selenium_server_jar');
  process.exit(1);
}

var jar = process.argv[2];
if (!fs.existsSync(jar)) {
  throw Error('The specified jar does not exist: ' + jar);
}

var server = new remote.SeleniumServer({jar: jar});
server.start();

var driver = new webdriver.Builder().
    usingServer(server.address()).
    withCapabilities({'browserName': 'firefox'}).
    build();

driver.get('http://www.google.com');
driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
driver.findElement(webdriver.By.name('btnG')).click();
driver.wait(function() {
  return driver.getTitle().then(function(title) {
    return 'webdriver - Google Search' === title;
  });
}, 1000);

driver.quit();
server.stop();
