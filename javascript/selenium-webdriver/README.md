# selenium-webdriver

JavaScript language bindings for [Selenium WebDriver](https://selenium.dev).
Selenium automates browsers for testing and web-based task automation.

Requires Node >= 20.

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

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
