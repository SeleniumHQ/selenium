# selenium-webdriver

## Installation

Install the latest published version using `npm`:

    npm install selenium-webdriver

In addition to the npm package, you will to download the WebDriver
implementations you wish to utilize. As of 2.34.0, `selenium-webdriver`
natively supports the [ChromeDriver](http://chromedriver.storage.googleapis.com/index.html).
Simply download a copy and make sure it can be found on your `PATH`. The other
drivers (e.g. Firefox, Internet Explorer, and Safari), still require the
[standalone Selenium server](https://code.google.com/p/selenium/downloads/list).

### Running the tests

_(New in 2.34.0)_ To run the tests, you will need to download a copy of the
[ChromeDriver](http://chromedriver.storage.googleapis.com/index.html) and make
sure it can be found on your `PATH`.

    npm test selenium-webdriver

To run the tests against multiple browsers, download the
[Selenium server](https://code.google.com/p/selenium/downloads/list) and
specify its location through the `SELENIUM_SERVER_JAR` environment variable.
You can use the `SELENIUM_BROWSER` environment variable to define a
comma-separated list of browsers you wish to test against. For example:

    export SELENIUM_SERVER_JAR=path/to/selenium-server-standalone-2.33.0.jar
    SELENIUM_BROWSER=chrome,firefox npm test selenium-webdriver

## Usage


    var webdriver = require('selenium-webdriver');

    var driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
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
