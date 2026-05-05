# Selenium Rules for AI Assistants

These rules help AI coding assistants generate correct, idiomatic Selenium code.
They cover the modern Selenium 4 API across all official language bindings.

---

## Core Principles

- **Never use `time.sleep()` / `Thread.sleep()` / `sleep()`.** Use explicit waits.
- **Never hardcode driver paths or versions.** Selenium Manager resolves them automatically.
- **Always call `driver.quit()`** in a `finally` block or equivalent to release browser resources.
- **Prefer CSS selectors over XPath** for readability and speed. Prefer `id` and `name` first.
- **Use Page Object Model (POM)** to separate page structure from test logic.

---

## Installation

| Language   | Command / Config                                                        |
|------------|-------------------------------------------------------------------------|
| Python     | `pip install selenium`                                                  |
| Java       | Maven: `selenium-java` artifact, group `org.seleniumhq.selenium`        |
| JavaScript | `npm install selenium-webdriver`                                        |
| Ruby       | `gem install selenium-webdriver`                                        |
| .NET       | `dotnet add package Selenium.WebDriver`                                 |

Selenium Manager (bundled since Selenium 4.6) automatically downloads the correct browser
driver. **No `webdriver-manager`, `chromedriver-binary`, or manual driver setup is needed.**

---

## Starting a Browser

### Python
```python
from selenium import webdriver

driver = webdriver.Chrome()   # Selenium Manager handles chromedriver automatically
driver.get("https://example.com")
```

### Java
```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

WebDriver driver = new ChromeDriver();  // Selenium Manager handles chromedriver
driver.get("https://example.com");
```

### JavaScript (Node.js)
```javascript
const { Builder } = require('selenium-webdriver');

const driver = await new Builder().forBrowser('chrome').build();
await driver.get('https://example.com');
```

### Ruby
```ruby
require 'selenium-webdriver'

driver = Selenium::WebDriver.for :chrome
driver.navigate.to 'https://example.com'
```

### .NET (C#)
```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

IWebDriver driver = new ChromeDriver();
driver.Navigate().GoToUrl("https://example.com");
```

---

## Always Quit the Driver

### Python
```python
try:
    driver.get("https://example.com")
finally:
    driver.quit()
```

### Java
```java
try {
    driver.get("https://example.com");
} finally {
    driver.quit();
}
```

### JavaScript
```javascript
try {
    await driver.get('https://example.com');
} finally {
    await driver.quit();
}
```

### Ruby
```ruby
begin
    driver.navigate.to 'https://example.com'
ensure
    driver.quit
end
```

### .NET
```csharp
using (IWebDriver driver = new ChromeDriver()) {
    driver.Navigate().GoToUrl("https://example.com");
}
```

---

## Locating Elements

Priority order: `id` > `name` > `css` > `link_text` > `xpath`

### Python
```python
from selenium.webdriver.common.by import By

driver.find_element(By.ID, "username")
driver.find_element(By.CSS_SELECTOR, "input[name='q']")
driver.find_elements(By.CSS_SELECTOR, "ul > li")
```

### Java
```java
import org.openqa.selenium.By;

driver.findElement(By.id("username"));
driver.findElement(By.cssSelector("input[name='q']"));
driver.findElements(By.cssSelector("ul > li"));
```

### JavaScript
```javascript
const { By } = require('selenium-webdriver');

await driver.findElement(By.id('username'));
await driver.findElement(By.css("input[name='q']"));
await driver.findElements(By.css('ul > li'));
```

### Ruby
```ruby
driver.find_element(id: 'username')
driver.find_element(css: "input[name='q']")
driver.find_elements(css: 'ul > li')
```

### .NET
```csharp
driver.FindElement(By.Id("username"));
driver.FindElement(By.CssSelector("input[name='q']"));
driver.FindElements(By.CssSelector("ul > li"));
```

---

## Explicit Waits (REQUIRED — never use sleep)

Wait for a specific condition before interacting with an element.

### Python
```python
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

wait = WebDriverWait(driver, timeout=10)
element = wait.until(EC.element_to_be_clickable((By.ID, "submit")))
element.click()
```

### Java
```java
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement element = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit")));
element.click();
```

### JavaScript
```javascript
const { until } = require('selenium-webdriver');

const element = await driver.wait(until.elementIsVisible(
    driver.findElement(By.id('submit'))
), 10000);
await element.click();
```

### Ruby
```ruby
wait = Selenium::WebDriver::Wait.new(timeout: 10)
element = wait.until { driver.find_element(id: 'submit') }
element.click
```

### .NET
```csharp
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;

var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
var element = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("submit")));
element.Click();
```

---

## Common Expected Conditions

| Condition                       | Python                                | Java                                     |
|---------------------------------|---------------------------------------|------------------------------------------|
| Element visible                 | `visibility_of_element_located`       | `ExpectedConditions.visibilityOf`        |
| Element clickable               | `element_to_be_clickable`             | `ExpectedConditions.elementToBeClickable`|
| Text present in element         | `text_to_be_present_in_element`       | `ExpectedConditions.textToBePresentInElement` |
| Alert present                   | `alert_is_present`                    | `ExpectedConditions.alertIsPresent`      |
| URL contains                    | `url_contains`                        | `ExpectedConditions.urlContains`         |
| Title contains                  | `title_contains`                      | `ExpectedConditions.titleContains`       |
| Element staleness               | `staleness_of`                        | `ExpectedConditions.stalenessOf`         |

---

## Browser Options & Capabilities

### Run headless (Python example)
```python
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument("--headless=new")
driver = webdriver.Chrome(options=options)
```

### Other common Chrome options
```python
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1920,1080")
options.add_argument("--disable-gpu")
```

### Set implicit wait (use sparingly — prefer explicit waits)
```python
driver.implicitly_wait(5)  # seconds
```

Do **not** mix implicit and explicit waits — this causes unpredictable timeouts.

---

## Page Object Model

Encapsulate page structure in dedicated classes to improve maintainability.

### Python example
```python
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class LoginPage:
    URL = "https://example.com/login"

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(self.URL)
        return self

    def login(self, username, password):
        self.wait.until(EC.element_to_be_clickable((By.ID, "username"))).send_keys(username)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        return self
```

---

## Actions (Mouse & Keyboard)

### Python
```python
from selenium.webdriver.common.action_chains import ActionChains

ActionChains(driver).move_to_element(element).click().perform()
ActionChains(driver).double_click(element).perform()
ActionChains(driver).context_click(element).perform()
ActionChains(driver).drag_and_drop(source, target).perform()
```

### Sending keyboard input
```python
from selenium.webdriver.common.keys import Keys

element.send_keys("Hello World")
element.send_keys(Keys.RETURN)
element.clear()
```

---

## Handling Alerts, Frames, and Windows

### Alerts (Python)
```python
alert = driver.switch_to.alert
alert.accept()   # OK
alert.dismiss()  # Cancel
alert.send_keys("text")
```

### Frames
```python
driver.switch_to.frame("frame-id")
driver.switch_to.default_content()
```

### Multiple Windows/Tabs
```python
main_window = driver.current_window_handle
driver.switch_to.new_window('tab')
driver.switch_to.window(main_window)
driver.close()
driver.switch_to.window(main_window)
```

---

## Taking Screenshots

```python
driver.save_screenshot("screenshot.png")
element.screenshot("element.png")
```

---

## JavaScript Execution

Use sparingly — prefer native Selenium interactions when possible.

```python
result = driver.execute_script("return document.title;")
driver.execute_script("arguments[0].click();", element)
driver.execute_script("arguments[0].scrollIntoView(true);", element)
```

---

## Working with Selects and Dropdowns

### Python
```python
from selenium.webdriver.support.select import Select

select = Select(driver.find_element(By.ID, "dropdown"))
select.select_by_visible_text("Option 1")
select.select_by_value("opt1")
select.select_by_index(0)
options = select.options
```

---

## Selenium Grid

Run tests in parallel across different browsers and machines.

```python
from selenium import webdriver

driver = webdriver.Remote(
    command_executor="http://localhost:4444",
    options=webdriver.ChromeOptions()
)
```

Start a local Grid (requires Java):
```bash
selenium-manager --grid
# Or download and run:
java -jar selenium-server.jar standalone
```

---

## BiDi (WebDriver BiDirectional Protocol)

Selenium 4 supports real-time browser events via BiDi.

### Python: Listen for console logs
```python
from selenium import webdriver
from selenium.webdriver.common.bidi.console import Console

driver = webdriver.Chrome()
with driver.bidi_connection() as conn:
    session = conn.session
    # Use BiDi APIs for log listening, network interception, etc.
```

---

## Selenium Manager CLI

Selenium Manager is also a standalone CLI tool for driver and browser management.

```bash
# Resolve/download chromedriver for the installed Chrome version
selenium-manager --browser chrome

# Download a specific Firefox version
selenium-manager --browser firefox --browser-version 120

# Generate a Selenium skills reference file
selenium-manager --init-skills

# Generate these LLM rules in rules/selenium.md
selenium-manager --init-rules
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `NoSuchElementException` | Element not in DOM yet | Use explicit wait |
| `StaleElementReferenceException` | DOM updated after element was found | Re-locate the element |
| `ElementNotInteractableException` | Element hidden or covered | Scroll into view or wait for visibility |
| `TimeoutException` | Condition never met in wait | Increase timeout or check selector |
| `WebDriverException: chrome not reachable` | Browser crashed or closed | Check browser startup options |
| `SessionNotCreatedException` | Driver/browser version mismatch | Let Selenium Manager resolve the driver |

---

## Anti-Patterns to Avoid

- ❌ `time.sleep(5)` — use `WebDriverWait` instead
- ❌ `driver.find_element(By.XPATH, "/html/body/div[3]/span[2]")` — fragile absolute XPath
- ❌ Hardcoding driver paths like `ChromeDriver("/usr/bin/chromedriver")` — let Selenium Manager handle it
- ❌ Mixing implicit and explicit waits
- ❌ Not calling `driver.quit()` — causes zombie browser processes
- ❌ `driver.get()` inside a loop without proper cleanup
- ❌ Using `execute_script` to click elements that are interactable natively

---

## Resources

- Documentation: https://www.selenium.dev/documentation/
- API Reference: https://www.selenium.dev/selenium/docs/api/
- GitHub: https://github.com/SeleniumHQ/selenium
- Selenium Manager: https://www.selenium.dev/documentation/selenium_manager/
