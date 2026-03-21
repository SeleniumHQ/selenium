# Selenium.WebDriver

.NET language bindings for [Selenium WebDriver](https://selenium.dev).
Selenium automates browsers for testing and web-based task automation.

## Installation

```bash
dotnet add package Selenium.WebDriver
```

## Quick Start

```csharp
using OpenQA.Selenium.Chrome;

await using var driver = new ChromeDriver();
driver.Url = "https://www.selenium.dev";
Console.WriteLine(driver.Title);
```

Selenium Manager automatically handles browser driver installation — no manual driver setup required.

## Documentation

- [Getting Started](https://www.selenium.dev/documentation/webdriver/getting_started/)
- [.NET API Docs](https://www.selenium.dev/selenium/docs/api/dotnet/)
- [Selenium Manager](https://www.selenium.dev/documentation/selenium_manager/)
- [Selenium Grid](https://www.selenium.dev/documentation/grid/)

## Support

- [Selenium Chat](https://www.selenium.dev/support/#ChatRoom)
- [GitHub Issues](https://github.com/SeleniumHQ/selenium/issues)

## Contributing

Contributions are welcome via [GitHub](https://github.com/SeleniumHQ/selenium/) pull requests.
See the [source code](https://github.com/SeleniumHQ/selenium/tree/trunk/dotnet) for this binding.

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
