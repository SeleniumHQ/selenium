# selenium-webdriver

    var webdriver = require('selenium-webdriver');

    var driver = new webdriver.Builder().
        withCapabilities({'browserName': 'firefox'}).
        build();

    driver.get('http://www.google.com');
    driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
    driver.findElement(webdriver.By.name('btnG')).click();
    driver.wait(function() {
      return driver.getTitle().then(function(title) {
        return title === 'webdriver - Google Search';
      });
    }, 1000);

    driver.quit();

## Documentation

Full documentation is available on the [Selenium project wiki](http://code.google.com/p/selenium/wiki/WebDriverJs "User guide").

## Issues

Please report any issues using the [Selenium issue tracker](https://code.google.com/p/selenium/issues/list).

## License

[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0 "Apache 2")
