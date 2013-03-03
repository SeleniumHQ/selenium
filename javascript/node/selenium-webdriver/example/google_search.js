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
    withCapabilities({'browserName': 'chrome'}).
    build();

driver.get('http://www.google.com');
driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
driver.findElement(webdriver.By.name('btnG')).click();
driver.wait(function() {
  return driver.getTitle().then(function(title) {
    return 'webdriver - Google Search' === title;
  });
}, 1000);

driver.quit().addBoth(function() {
  // Don't shutdown the server until all actions are complete.
  server.stop();
});
