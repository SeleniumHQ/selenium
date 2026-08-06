# selenium-webdriver

JavaScript language bindings for [Selenium WebDriver](https://www.selenium.dev).
Selenium automates browsers for testing and web-based task automation.

Requires Node.js >= 22.

## Installation

```bash
npm install selenium-webdriver
```

## Quick Start

```javascript
const { Builder, Browser } = require('selenium-webdriver')

;(async function example() {
  let driver = await new Builder().forBrowser(Browser.CHROME).build()
  try {
    await driver.get('https://www.selenium.dev')
    console.log(await driver.getTitle())
  } finally {
    await driver.quit()
  }
})()
```

Selenium Manager automatically handles browser driver installation — no manual driver setup required.

## Configuring the Builder

The `Builder` sets default options for all browsers in a single chain; options
for non-selected browsers are dropped at `build()` time. The target browser can
be swapped at runtime via the `SELENIUM_BROWSER` environment variable.

```javascript
const { Builder, Browser } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')

let driver = new Builder()
  .forBrowser(Browser.FIREFOX)
  .setChromeOptions(new chrome.Options())
  .setFirefoxOptions(new firefox.Options())
  .build()
```

## Running Against a Remote Server

To run scripts against a [Selenium Grid](https://www.selenium.dev/documentation/grid/)
or standalone server, point the Builder at the server URL, or set
`SELENIUM_REMOTE_URL`:

```javascript
let driver = new Builder().forBrowser(Browser.CHROME).usingServer('http://localhost:4444').build()
```

```bash
SELENIUM_REMOTE_URL="http://localhost:4444" node script.js
```

## Node Support Policy

`selenium-webdriver` supports the Node.js versions under active upstream
support. Each is supported until its
[end-of-life](https://github.com/nodejs/release#release-schedule) date; after
that it is unsupported.

| Node.js | Support ends |
| :------ | :----------- |
| 22      | 2027-04-30   |
| 24      | 2028-04-30   |
| 26      | 2029-04-30   |

CI tests the earliest and latest supported versions available in
[rules_nodejs](https://github.com/bazel-contrib/rules_nodejs); issues and pull
requests are welcome for any supported version.

## Documentation

- [Getting Started](https://www.selenium.dev/documentation/webdriver/getting_started/)
- [JavaScript API Docs](https://www.selenium.dev/selenium/docs/api/javascript/)
- [Selenium Manager](https://www.selenium.dev/documentation/selenium_manager/)
- [Selenium Grid](https://www.selenium.dev/documentation/grid/)

## Support

- [Selenium Chat](https://www.selenium.dev/support/#ChatRoom)
- [GitHub Issues](https://github.com/SeleniumHQ/selenium/issues)

## Contributing

Contributions are welcome via [GitHub](https://github.com/SeleniumHQ/selenium/) pull requests.
See the [source code](https://github.com/SeleniumHQ/selenium/tree/trunk/javascript/selenium-webdriver) for this binding.

## Links

- [npm](https://www.npmjs.com/package/selenium-webdriver)
- [Documentation](https://www.selenium.dev/documentation/?tab=javascript)

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
