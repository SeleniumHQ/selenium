// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

use crate::Logger;
use anyhow::Error;
use std::fs;
use std::path::Path;

pub const SKILLS_CONTENT: &str = r#"# Selenium Skills & Best Practices

This guide provides a comprehensive overview of how to write effective Selenium tests in various languages and lists industry-standard best practices.

## Language Setup & Examples

### Java
- **Dependencies (Maven)**:
  ```xml
  <dependency>
      <groupId>org.seleniumhq.selenium</groupId>
      <artifactId>selenium-java</artifactId>
      <version>4.x.x</version>
  </dependency>
  ```
- **Example**:
  ```java
  import org.openqa.selenium.WebDriver;
  import org.openqa.selenium.chrome.ChromeDriver;
  import org.openqa.selenium.chrome.ChromeOptions;

  public class SeleniumTest {
      public static void main(String[] args) {
          ChromeOptions options = new ChromeOptions();
          WebDriver driver = new ChromeDriver(options);
          try {
              driver.get("https://www.selenium.dev/");
              System.out.println("Title: " + driver.getTitle());
          } finally {
              driver.quit();
          }
      }
  }
  ```

### JavaScript (Node.js)
- **Installation**: `npm install selenium-webdriver`
- **Example**:
  ```javascript
  const {Builder} = require('selenium-webdriver');

  (async function example() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
      await driver.get('https://www.selenium.dev/');
      console.log('Title:', await driver.getTitle());
    } finally {
      await driver.quit();
    }
  })();
  ```

### Python
- **Installation**: `pip install selenium`
- **Example**:
  ```python
  from selenium import webdriver
  from selenium.webdriver.chrome.options import Options

  options = Options()
  driver = webdriver.Chrome(options=options)
  try:
      driver.get("https://www.selenium.dev/")
      print("Title:", driver.title)
  finally:
      driver.quit()
  ```

### .NET (C#)
- **NuGet**: `dotnet add package Selenium.WebDriver`
- **Example**:
  ```csharp
  using OpenQA.Selenium;
  using OpenQA.Selenium.Chrome;

  using (IWebDriver driver = new ChromeDriver()) {
      driver.Navigate().GoToUrl("https://www.selenium.dev/");
      Console.WriteLine("Title: " + driver.Title);
  }
  ```

### Ruby
- **Gem**: `gem install selenium-webdriver`
- **Example**:
  ```ruby
  require 'selenium-webdriver'

  driver = Selenium::WebDriver.for :chrome
  begin
    driver.navigate.to "https://www.selenium.dev/"
    puts "Title: #{driver.title}"
  ensure
    driver.quit
  end
  ```

## Best Practices

### 1. Don't use `Thread.sleep()`
Static sleeps make tests slow and flaky. Instead, use **Explicit Waits** (`WebDriverWait`) to wait for specific conditions (e.g., element visibility, title contains).

### 2. Page Object Model (POM)
Organize your tests by grouping elements and actions of each page into separate classes. This makes tests more readable and easier to maintain when the UI changes.

### 3. Test Independence
Each test should be able to run on its own, regardless of the order in which they are executed. Avoid relying on the side effects of previous tests. Use `setup` and `teardown` methods to manage state.

### 4. Efficient Selectors
- Prefer `ID` and `Name` when available.
- Use `CSS Selectors` for complex queries.
- Avoid `XPath` unless absolutely necessary (e.g., navigating to parent or sibling nodes) as it's generally slower and more fragile.

### 5. Always Quit
Always call `driver.quit()` to ensure browser processes are cleaned up, even if a test fails. Use language-specific constructs like `try-finally` or `using` blocks.

### 6. Use Selenium Manager
You're already using it! Selenium Manager (this tool) automatically downloads and configures the correct drivers and browsers for you, so you don't have to manage binaries manually.
"#;

pub fn write_skills_file(path: &Path, log: &Logger) -> Result<(), Error> {
    log.debug(format!("Creating skills file at: {}", path.display()));
    fs::write(path, SKILLS_CONTENT)?;
    Ok(())
}
