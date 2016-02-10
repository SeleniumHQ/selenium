## v2.52.0

### Notice

Starting with v2.52.0, each release of selenium-webdriver will support the
latest _minor_ LTS and stable Node releases. All releases between the LTS and
stable release will have best effort support. Further details are available in
the selenium-webdriver package README.

### Change Summary

* Add support for Microsoft's Edge web browser
* Added `webdriver.Builder#buildAsync()`, which returns a promise that will be
    fulfilled with the newly created WebDriver instance once the associated
    browser has been full initialized. This is purely a convenient alternative
    to the existing build() method as the WebDriver class will always defer
    commands until it has a fully created browser.
* Added `firefox.Profile#setHost()` which may be used to set the host that
    the FirefoxDriver's server listens for commands on. The server uses
    "localhost" by default.
* Added `promise.Promise#catch()` for API compatibility with native Promises.
    `promise.Promise#thenCatch()` is not yet deprecated, but it simply
    delegates to `catch`.
* Changed some `io` operations to use native promises.
* Changed `command.Executor#execute()` and `HttpClient#send()` to return
    promises instead of using callback passing.
* Replaced the `Serializable` class with an internal, Symbol-defined method.
* Changed the `Capabilities` class to extend the native `Map` type.
* Changed the `Capabilities.has(key)` to only test if a capability has been set
    (Map semantics). To check whether the value is true, use `get(key)`.
* Deprecated `executors.DeferredExecutor` in favor of
    `lib/command.DeferredExecutor`.
* API documentation is no longer distributed with the npm package, but remains
    available at <http://seleniumhq.github.io/selenium/docs/api/javascript/>
* Rewrote the `error` module to export an Error subtype for each type of error
    defined in the [W3C WebDriver spec](https://w3c.github.io/webdriver/webdriver-spec.html#handling-errors).
* Changed the `http.Request` and `http.Response` classes to store headers in
    maps instead of object literals.
* Updated `ws` dependency to version `1.0.1`.
* Removed fluent predicates "is" and "not" from the experimental
    `testing/assert` module.
* Wait conditions that locate an element, or that wait on an element's state,
    will return a WebElementPromise.
* Lots of internal clean-up to break selenium-webdriver's long standing
    dependency on Google's Closure library.

### Changes for W3C WebDriver Spec Compliance

* Updated the `By` locators that are not in the W3C spec to delegated to using
    CSS selectors: `By.className`, `By.id`, `By.name`, and `By.tagName`.


## v2.49-51

* _Releases skipped to stay in sync with the rest of the Selenium project_


## v2.48.2

* Added `WebElement#takeScreenshot()`.
* More adjustments to promise callback tracking.

## v2.48.1

* FIXED: Adjusted how the control flow tracks promise callbacks to avoid a
    potential deadlock.

## v2.48.0

* Node v0.12.x users must run with --harmony. _This is the last release that
    will support v0.12.x_
* FIXED: (Promise/A+ compliance) When a promise is rejected with a thenable,
    the promise adopts the thenable as its rejection reason instead of waiting
    for it to settle. The previous (incorrect) behavior was hidden by bugs in
    the `promises-aplus-tests` compliance test suite that were fixed in version
    `2.1.1`.
* FIXED: the `webdriver.promise.ControlFlow` now has a consistent execution
    order for tasks/callbacks scheduled in different turns of the JS event loop.
    Refer to the `webdriver.promise` documentation for more details.
* FIXED: do not drop user auth from the WebDriver server URL.
* FIXED: a single `firefox.Binary` instance may be used to configure and
    launch multiple FirefoxDriver sessions.

      var binary = new firefox.Binary();
      var options = new firefox.Options().setBinary(binary);
      var builder = new Builder().setFirefoxOptions(options);

      var driver1 = builder.build();
      var driver2 = builder.build();

* FIXED: zip files created for transfer to a remote WebDriver server are no
    longer compressed. If the zip contained a file that was already compressed,
    the server would return an "invalid code lengths set" error.
* FIXED: Surfaced the `loopback` option to `remote/SeleniumServer`. When set,
    the server will be accessed using the current host's loopback address.

## v2.47.0

### Notice

This is the last release for `selenium-webdriver` that will support ES5.
Subsequent releases will depend on ES6 features that are enabled by
[default](https://nodejs.org/en/docs/es6/) in Node v4.0.0. Node v0.12.x will
continue to be supported, but will require setting the `--harmony` flag.

### Change Summary

* Add support for [Node v4.0.0](https://nodejs.org/en/blog/release/v4.0.0/)
    * Updated `ws` dependency from `0.7.1` to `0.8.0`
* Bumped the minimum supported version of Node from `0.10.x` to `0.12.x`. This
    is in accordance with the Node support policy established in `v2.45.0`.

## v2.46.1

* Fixed internal module loading on Windows.
* Fixed error message format on timeouts for `until.elementLocated()`
    and `until.elementsLocated()`.

## v2.46.0

* Exposed a new logging API via the `webdriver.logging` module. For usage, see
    `example/logging.js`.
* Added support for using a proxy server for WebDriver commands.
    See `Builder#usingWebDriverProxy()` for more info.
* Removed deprecated functions:
    * Capabilities#toJSON()
    * UnhandledAlertError#getAlert()
    * chrome.createDriver()
    * phantomjs.createDriver()
    * promise.ControlFlow#annotateError()
    * promise.ControlFlow#await()
    * promise.ControlFlow#clearHistory()
    * promise.ControlFlow#getHistory()
* Removed deprecated enum values: `ErrorCode.NO_MODAL_DIALOG_OPEN` and
    `ErrorCode.MODAL_DIALOG_OPENED`. Use `ErrorCode.NO_SUCH_ALERT` and
    `ErrorCode.UNEXPECTED_ALERT_OPEN`, respectively.
* FIXED: The `promise.ControlFlow` will maintain state for promise chains
    generated in a loop.
* FIXED: Correct serialize target elements used in an action sequence.
* FIXED: `promise.ControlFlow#wait()` now has consistent semantics for an
    omitted or 0-timeout: it will wait indefinitely.
* FIXED: `remote.DriverService#start()` will now fail if the child process dies
    while waiting for the server to start accepting requests. Previously, start
    would continue to poll the server address until the timeout expired.
* FIXED: Skip launching Firefox with the `-silent` flag to preheat the profile.
    Starting with Firefox 38, this would cause the browser to crash. This step,
    which was first introduced for Selenium's java client back with Firefox 2,
    no longer appears to be required.
* FIXED: 8564: `firefox.Driver#quit()` will wait for the Firefox process to
    terminate before deleting the temporary webdriver profile. This eliminates a
    race condition where Firefox would write profile data during shutdown,
    causing the `rm -rf` operation on the profile directory to fail.

## v2.45.1

* FIXED: 8548: Task callbacks are once again dropped if the task was cancelled
    due to a previously uncaught error within the frame.
* FIXED: 8496: Extended the `chrome.Options` API to cover all configuration
    options (e.g. mobile emulation and performance logging) documented on the
    ChromeDriver [project site](https://sites.google.com/a/chromium.org/chromedriver/capabilities).

## v2.45.0

### Important Policy Change

Starting with the 2.45.0 release, selenium-webdriver will support the last
two stable minor releases for Node. For 2.45.0, this means Selenium will
support Node 0.10.x and 0.12.x. Support for the intermediate, un-stable release
(0.11.x) is "best-effort". This policy will be re-evaluated once Node has a
major version release (i.e. 1.0.0).

### Change Summary

* Added native browser support for Internet Explorer, Opera 26+, and Safari
* With the release of [Node 0.12.0](http://blog.nodejs.org/2015/02/06/node-v0-12-0-stable/)
    (finally!), the minimum supported version of Node is now `0.10.x`.
* The `promise` module is now [Promises/A+](https://promisesaplus.com/)
    compliant. The biggest compliance change is that promise callbacks are now
    invoked in a future turn of the JS event loop. For example:

        var promise = require('selenium-webdriver').promise;
        console.log('start');
        promise.fulfilled().then(function() {
          console.log('middle');
        });
        console.log('end');

        // Output in selenium-webdriver@2.44.0
        // start
        // middle
        // end
        //
        // Output in selenium-webdriver@2.45.0
        // start
        // end
        // middle

    The `promise.ControlFlow` class has been updated to track the asynchronous
    breaks required by Promises/A+, so there are no changes to task execution
    order.
* Updated how errors are annotated on failures. When a task fails, the
    stacktrace from when that task was scheduled is appended to the rejection
    reason with a `From: ` prefix (if it is an Error object). For example:

        var driver = new webdriver.Builder().forBrowser('chrome').build();
        driver.get('http://www.google.com/ncr');
        driver.call(function() {
          driver.wait(function() {
            return driver.isElementPresent(webdriver.By.id('not-there'));
          }, 2000, 'element not found');
        });

    This code will fail an error like:

        Error: element not found
        Wait timed out after 2002ms
            at <stack trace>
        From: Task: element not found
            at <stack trace>
        From: Task: WebDriver.call(function)
            at <stack trace>

* Changed the format of strings returned by `promise.ControlFlow#getSchedule`.
    This function now accepts a boolean to control whether the returned string
    should include the stacktraces for when each task was scheduled.
* Deprecating `promise.ControlFlow#getHistory`,
    `promise.ControlFlow#clearHistory`, and `promise.ControlFlow#annotateError`.
    These functions were all intended for internal use and are no longer
    necessary, so they have been made no-ops.
* `WebDriver.wait()` may now be used to wait for a promise to resolve, with
    an optional timeout. Refer to the API documentation for more information.
* Added support for copying files to a remote Selenium via `sendKeys` to test
    file uploads. Refer to the API documentation for more information. Sample
    usage included in `test/upload_test.js`
* Expanded the interactions API to include touch actions.
    See `WebDriver.touchActions()`.
* FIXED: 8380: `firefox.Driver` will delete its temporary profile on `quit`.
* FIXED: 8306: Stack overflow in promise callbacks eliminated.
* FIXED: 8221: Added support for defining custom command mappings. Includes
    support for PhantomJS's `executePhantomJS` (requires PhantomJS 1.9.7 or
    GhostDriver 1.1.0).
* FIXED: 8128: When the FirefoxDriver marshals an object to the page for
    `executeScript`, it defines additional properties (required by the driver's
    implementation). These properties will no longer be enumerable and should
    be omitted (i.e. they won't show up in JSON.stringify output).
* FIXED: 8094: The control flow will no longer deadlock when a task returns
    a promise that depends on the completion of sub-tasks.

## v2.44.0

* Added the `until` module, which defines common explicit wait conditions.
    Sample usage:

        var firefox = require('selenium-webdriver/firefox'),
            until = require('selenium-webdriver/until');

        var driver = new firefox.Driver();
        driver.get('http://www.google.com/ncr');
        driver.wait(until.titleIs('Google Search'), 1000);

* FIXED: 8000: `Builder.forBrowser()` now accepts an empty string since some
    WebDriver implementations ignore the value. A value must still be specified,
    however, since it is a required field in WebDriver's wire protocol.
* FIXED: 7994: The `stacktrace` module will not modify stack traces if the
    initial parse fails (e.g. the user defined `Error.prepareStackTrace`)
* FIXED: 5855: Added a module (`until`) that defines several common conditions
    for use with explicit waits. See updated examples for usage.

## v2.43.5

* FIXED: 7905: `Builder.usingServer(url)` once again returns `this` for
    chaining.

## v2.43.2-4

* No changes; version bumps while attempting to work around an issue with
    publishing to npm (a version string may only be used once).

## v2.43.1

* Fixed an issue with flakiness when setting up the Firefox profile that could
    prevent the driver from initializing properly.

## v2.43.0

* Added native support for Firefox - the Java Selenium server is no longer
    required.
* Added support for generator functions to `ControlFlow#execute` and
    `ControlFlow#wait`. For more information, see documentation on
    `webdriver.promise.consume`. Requires harmony support (run with
    `node --harmony-generators` in `v0.11.x`).
* Various improvements to the `Builder` API. Notably, the `build()` function
    will no longer default to attempting to use a server at
    `http://localhost:4444/wd/hub` if it cannot start a browser directly -
    you must specify the WebDriver server with `usingServer(url)`. You can
    also set the target browser and WebDriver server through a pair of
    environment variables. See the documentation on the `Builder` constructor
    for more information.
* For consistency with the other language bindings, added browser specific
    classes that can be used to start a browser without the builder.

        var webdriver = require('selenium-webdriver')
            chrome = require('selenium-webdriver/chrome');

        // The following are equivalent.
        var driver1 = new webdriver.Builder().forBrowser('chrome').build();
        var driver2 = new chrome.Driver();

* Promise A+ compliance: a promise may no longer resolve to itself.
* For consistency with other language bindings, deprecated
    `UnhandledAlertError#getAlert` and added `#getAlertText`.
    `getAlert` will be removed in `2.45.0`.
* FIXED: 7641: Deprecated `ErrorCode.NO_MODAL_DIALOG_OPEN` and
    `ErrorCode.MODAL_DIALOG_OPENED` in favor of the new
    `ErrorCode.NO_SUCH_ALERT` and `ErrorCode.UNEXPECTED_ALERT_OPEN`,
    respectively.
* FIXED: 7563: Mocha integration no longer disables timeouts. Default Mocha
    timeouts apply (2000 ms) and may be changed using `this.timeout(ms)`.
* FIXED: 7470: Make it easier to create WebDriver instances in custom flows for
    parallel execution.

## v2.42.1

* FIXED: 7465: Fixed `net.getLoopbackAddress` on Windows
* FIXED: 7277: Support `done` callback in Mocha's BDD interface
* FIXED: 7156: `Promise#thenFinally` should not suppress original error

## v2.42.0

* Removed deprecated functions `Promise#addCallback()`,
    `Promise#addCallbacks()`, `Promise#addErrback()`, and `Promise#addBoth()`.
* Fail with a more descriptive error if the server returns a malformed redirect
* FIXED: 7300: Connect to ChromeDriver using the loopback address since
    ChromeDriver 2.10.267517 binds to localhost by default.
* FIXED: 7339: Preserve wrapped test function's string representation for
    Mocha's BDD interface.

## v2.41.0

* FIXED: 7138: export logging API from webdriver module.
* FIXED: 7105: beforeEach/it/afterEach properly bind `this` for Mocha tests.

## v2.40.0

* API documentation is now included in the docs directory.
* Added utility functions for working with an array of promises:
    `promise.all`, `promise.map`, and `promise.filter`
* Introduced `Promise#thenCatch()` and `Promise#thenFinally()`.
* Deprecated `Promise#addCallback()`, `Promise#addCallbacks()`,
    `Promise#addErrback()`, and `Promise#addBoth()`.
* Removed deprecated function `webdriver.WebDriver#getCapability`.
* FIXED: 6826: Added support for custom locators.

## v2.39.0

* Version bump to stay in sync with the Selenium project.

## v2.38.1

* FIXED: 6686: Changed `webdriver.promise.Deferred#cancel()` to silently no-op
    if the deferred has already been resolved.

## v2.38.0

* When a promise is rejected, always annotate the stacktrace with the parent
    flow state so users can identify the source of an error.
* Updated tests to reflect features not working correctly in the SafariDriver
    (cookie management and proxy support; see issues 5051, 5212, and 5503)
* FIXED: 6284: For mouse moves, correctly omit the x/y offsets if not
    specified as a function argument (instead of passing (0,0)).
* FIXED: 6471: Updated documentation on `webdriver.WebElement#getAttribute`
* FIXED: 6612: On Unix, use the default IANA ephemeral port range if unable to
    retrieve the current system's port range.
* FIXED: 6617: Avoid triggering the node debugger when initializing the
    stacktrace module.
* FIXED: 6627: Safely rebuild chrome.Options from a partial JSON spec.

## v2.37.0

* FIXED: 6346: The remote.SeleniumServer class now accepts JVM arguments using
    the `jvmArgs` option.

## v2.36.0

* _Release skipped to stay in sync with main Selenium project._

## v2.35.2

* FIXED: 6200: Pass arguments to the Selenium server instead of to the JVM.

## v2.35.1

* FIXED: 6090: Changed example scripts to use chromedriver.

## v2.35.0

* Version bump to stay in sync with the Selenium project.

## v2.34.1

* FIXED: 6079: The parent process should not wait for spawn driver service
    processes (chromedriver, phantomjs, etc.)

## v2.34.0

* Added the `selenium-webdriver/testing/assert` module. This module
    simplifies writing assertions against promised values (see
    example in module documentation).
* Added the `webdriver.Capabilities` class.
* Added native support for the ChromeDriver. When using the `Builder`,
    requesting chrome without specifying a remote server URL will default to
    the native ChromeDriver implementation.  The
    [ChromeDriver server](https://code.google.com/p/chromedriver/downloads/list)
    must be downloaded separately.

        // Will start ChromeDriver locally.
        var driver = new webdriver.Builder().
            withCapabilities(webdriver.Capabilities.chrome()).
            build();

        // Will start ChromeDriver using the remote server.
        var driver = new webdriver.Builder().
            withCapabilities(webdriver.Capabilities.chrome()).
            usingServer('http://server:1234/wd/hub').
            build();

* Added support for configuring proxies through the builder. For examples, see
    `selenium-webdriver/test/proxy_test`.
* Added native support for PhantomJS.
* Changed signature of `SeleniumServer` to `SeleniumServer(jar, options)`.
* Tests are now included in the npm published package. See `README.md` for
    execution instructions
* Removed the deprecated `webdriver.Deferred#resolve` and
    `webdriver.promise.resolved` functions.
* Removed the ability to connect to an existing session from the Builder. This
    feature is intended for use with the browser-based client.

## v2.33.0

* Added support for WebDriver's logging API
* FIXED: 5511: Added webdriver.manage().timeouts().pageLoadTimeout(ms)

## v2.32.1

* FIXED: 5541: Added missing return statement for windows in
    `portprober.findFreePort()`

## v2.32.0

* Added the `selenium-webdriver/testing` package, which provides a basic
    framework for writing tests using Mocha. See
    `selenium-webdriver/example/google_search_test.js` for usage.
* For Promises/A+ compatibility, backing out the change in 2.30.0 that ensured
    rejections were always Error objects. Rejection reasons are now left as is.
* Removed deprecated functions originally scheduled for removal in 2.31.0
    * promise.Application.getInstance()
    * promise.ControlFlow#schedule()
    * promise.ControlFlow#scheduleTimeout()
    * promise.ControlFlow#scheduleWait()
* Renamed some functions for consistency with Promises/A+ terminology. The
    original functions have been deprecated and will be removed in 2.34.0:
    * promise.resolved() -> promise.fulfilled()
    * promise.Deferred#resolve() -> promise.Deferred#fulfill()
* FIXED: remote.SeleniumServer#stop now shuts down within the active control
    flow, allowing scripts to finish. Use #kill to shutdown immediately.
* FIXED: 5321: cookie deletion commands

## v2.31.0

* Added an example script.
* Added a class for controlling the standalone Selenium server (server
available separately)
* Added a portprober for finding free ports
* FIXED: WebElements now belong to the same flow as their parent driver.

## v2.30.0

* Ensures promise rejections are always Error values.
* Version bump to keep in sync with the Selenium project.

## v2.29.1

* Fixed a bug that could lead to an infinite loop.
* Added a README.md

## v2.29.0

* Initial release for npm:

        npm install selenium-webdriver
