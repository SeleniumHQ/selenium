# selenium-webdriver

Selenium is a browser automation library. Most often used for testing
web-applications, Selenium may be used for any task that requires automating
interaction with the browser.

## Installation

Selenium supports Node `0.12.x` and `4.x`. Users on Node `0.12.x` must run with
the --harmony flag. Selenium may be installed via npm with

    npm install selenium-webdriver

Out of the box, Selenium includes everything you need to work with Firefox. You
will need to download additional components to work with the other major
browsers. The drivers for Chrome, IE, PhantomJS, and Opera are all standalone
executables that should be placed on your
[PATH](http://en.wikipedia.org/wiki/PATH_%28variable%29). The SafariDriver
browser extension should be installed in your browser before using Selenium; we
recommend disabling the extension when using the browser without Selenium or
installing the extension in a profile only used for testing.

| Browser           | Component                          |
| ----------------- | ---------------------------------- |
| Chrome            | [chromedriver(.exe)][chrome]       |
| Internet Explorer | [IEDriverServer.exe][release]      |
| PhantomJS         | [phantomjs(.exe)][phantomjs]       |
| Opera             | [operadriver(.exe)][opera]         |
| Safari            | [SafariDriver.safariextz][release] |

## Usage

The sample below and others are included in the `example` directory. You may
also find the tests for selenium-webdriver informative.

    var webdriver = require('selenium-webdriver'),
        By = require('selenium-webdriver').By,
        until = require('selenium-webdriver').until;

    var driver = new webdriver.Builder()
        .forBrowser('firefox')
        .build();

    driver.get('http://www.google.com/ncr');
    driver.findElement(By.name('q')).sendKeys('webdriver');
    driver.findElement(By.name('btnG')).click();
    driver.wait(until.titleIs('webdriver - Google Search'), 1000);
    driver.quit();

### Using the Builder API

The `Builder` class is your one-stop shop for configuring new WebDriver
instances. Rather than clutter your code with branches for the various browsers,
the builder lets you set all options in one flow. When you call
`Builder#build()`, all options irrelevant to the selected browser are dropped:

    var webdriver = require('selenium-webdriver'),
        chrome = require('selenium-webdriver/chrome'),
        firefox = require('selenium-webdriver/firefox');

    var driver = new webdriver.Builder()
        .forBrowser('firefox')
        .setChromeOptions(/* ... */)
        .setFirefoxOptions(/* ... */)
        .build();

Why would you want to configure options irrelevant to the target browser? The
`Builder`'s API defines your _default_ configuration. You can change the target
browser at runtime through the `SELENIUM_BROWSER` environment variable. For
example, the `example/google_search.js` script is configured to run against
Firefox. You can run the example against other browsers just by changing the
runtime environment

    # cd node_modules/selenium-webdriver
    node example/google_search
    SELENIUM_BROWSER=chrome node example/google_search
    SELENIUM_BROWSER=safari node example/google_search

### The Standalone Selenium Server

The standalone Selenium Server acts as a proxy between your script and the
browser-specific drivers. The server may be used when running locally, but it's
not recommend as it introduces an extra hop for each request and will slow
things down. The server is required, however, to use a browser on a remote host
(most browser drivers, like the IEDriverServer, do not accept remote
connections).

To use the Selenium Server, you will need to install the
[JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html) and
download the latest server from [Selenium][release]. Once downloaded, run the
server with

    java -jar selenium-server-standalone-2.45.0.jar

You may configure your tests to run against a remote server through the Builder
API:

    var driver = new webdriver.Builder()
        .forBrowser('firefox')
        .usingServer('http://localhost:4444/wd/hub')
        .build();

Or change the Builder's configuration at runtime with the `SELENIUM_REMOTE_URL`
environment variable:

    SELENIUM_REMOTE_URL="http://localhost:4444/wd/hub" node script.js

You can experiment with these options using the `example/google_search.js`
script provided with `selenium-webdriver`.

## Documentation

API documentation is included in the `docs` directory and is also available
online from the [Selenium project][api]. Addition resources include

- the #selenium channel on freenode IRC
- the [selenium-users@googlegroups.com][users] list
- [SeleniumHQ](http://www.seleniumhq.org/docs/) documentation

## Contributing

Contributions are accepted either through [GitHub][gh] pull requests or patches
via the [Selenium issue tracker][issues]. You must sign our
[Contributor License Agreement][cla] before your changes will be accepted.

## Issues

Please report any issues using the [Selenium issue tracker][issues]. When using
the issue tracker

- __Do__ include a detailed description of the problem.
- __Do__ include a link to a [gist](http://gist.github.com/) with any
    interesting stack traces/logs (you may also attach these directly to the bug
    report).
- __Do__ include a [reduced test case][reduction]. Reporting "unable to find
    element on the page" is _not_ a valid report - there's nothing for us to
    look into. Expect your bug report to be closed if you do not provide enough
    information for us to investigate.
- __Do not__ use the issue tracker to submit basic help requests. All help
    inquiries should be directed to the [user forum][users] or #selenium IRC
    channel.
- __Do not__ post empty "I see this too" or "Any updates?" comments. These
    provide no additional information and clutter the log.
- __Do not__ report regressions on closed bugs as they are not actively
    monitored for upates (especially bugs that are >6 months old). Please open a
    new issue and reference the original bug in your report.

## License

Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The SFC licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.

[api]: http://seleniumhq.github.io/selenium/docs/api/javascript/
[cla]: http://goo.gl/qC50R
[chrome]: http://chromedriver.storage.googleapis.com/index.html
[gh]: https://github.com/SeleniumHQ/selenium/
[issues]: https://github.com/SeleniumHQ/selenium/issues
[opera]: https://github.com/operasoftware/operachromiumdriver/releases
[phantomjs]: http://phantomjs.org/
[reduction]: http://www.webkit.org/quality/reduction.html
[release]: http://selenium-release.storage.googleapis.com/index.html
[users]: https://groups.google.com/forum/#!forum/selenium-users
