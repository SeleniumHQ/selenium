# selenium-webdriver

Ruby language bindings for [Selenium WebDriver](https://www.selenium.dev).
Selenium automates browsers for testing and web-based task automation.

Supports MRI >= 3.3.

## Installation

```bash
gem install selenium-webdriver
```

## Quick Start

```ruby
require "selenium-webdriver"

driver = Selenium::WebDriver.for :chrome
begin
  driver.get "https://www.selenium.dev"
  puts driver.title
ensure
  driver.quit
end
```

Selenium Manager automatically handles browser driver installation — no manual driver setup required.

## Documentation

- [Getting Started](https://www.selenium.dev/documentation/webdriver/getting_started/)
- [Ruby API Docs](https://www.selenium.dev/selenium/docs/api/rb/index.html)
- [Selenium Manager](https://www.selenium.dev/documentation/selenium_manager/)
- [Selenium Grid](https://www.selenium.dev/documentation/grid/)

## Support

- [Selenium Chat](https://www.selenium.dev/support/#ChatRoom)
- [GitHub Issues](https://github.com/SeleniumHQ/selenium/issues)

## Contributing

Contributions are welcome via [GitHub](https://github.com/SeleniumHQ/selenium/) pull requests.
See the [source code](https://github.com/SeleniumHQ/selenium/tree/trunk/rb) for this binding.

## Links

- [RubyGems](https://rubygems.org/gems/selenium-webdriver)
- [Documentation](https://www.selenium.dev/documentation/?tab=ruby)

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
