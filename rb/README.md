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

## Using a Local Checkout

To try unreleased changes from another project:

1. Install [Bazelisk](https://github.com/bazelbuild/bazelisk) and the other [build requirements](https://github.com/SeleniumHQ/selenium#installing)
2. Navigate to the root of your `selenium` checkout
3. Run `./go rb:local_dev` (`go.bat rb:local_dev` on Windows); rerun it after pulling changes

Point the project's Gemfile at the checkout:

```ruby
gem 'selenium-webdriver', path: '/path/to/selenium/rb'
```

Then require `local_dev` in place of `selenium-webdriver`, so the atoms, CDP code, and Selenium Manager come from what Bazel built:

```ruby
require 'selenium/webdriver/local_dev'
```

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
