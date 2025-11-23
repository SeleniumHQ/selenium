Selenium is a set of different software tools each with a different approach to supporting browser automation. These tools are highly flexible, allowing many options for locating and manipulating elements within a browser, and one of its key features is the support for automating multiple browser platforms. This package contains the .NET bindings for the concise and object-based Selenium WebDriver API, which uses native OS-level events to manipulate the browser, bypassing the JavaScript sandbox, and does not require the Selenium Server to automate the browser.

# Usage

```csharp
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium;

using var driver = new ChromeDriver();

driver.Url = "https://www.google.com";
driver.FindElement(By.Name("q")).SendKeys("webdriver" + Keys.Return);
Console.WriteLine(driver.Title);
```

# Contributing
Contributions are accepted either through [GitHub](https://github.com/SeleniumHQ/selenium/) pull requests or patches via the [Selenium issue tracker](https://github.com/SeleniumHQ/selenium/issues).
