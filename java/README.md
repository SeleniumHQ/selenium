# selenium-java

Java language bindings for [Selenium WebDriver](https://www.selenium.dev).
Selenium automates browsers for testing and web-based task automation.

Requires Java 11+.

## Installation

Replace `4.x.y` with the latest version from [Maven Central](https://central.sonatype.com/artifact/org.seleniumhq.selenium/selenium-java).

### Maven

```xml
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.x.y</version>
</dependency>
```

### Gradle

```groovy
implementation "org.seleniumhq.selenium:selenium-java:4.x.y"
```

## Quick Start

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class Example {
    public static void main(String[] args) {
        WebDriver driver = new ChromeDriver();
        try {
            driver.get("https://www.selenium.dev");
            System.out.println(driver.getTitle());
        } finally {
            driver.quit();
        }
    }
}
```

Selenium Manager automatically handles browser driver installation — no manual driver setup required.

## Documentation

- [Getting Started](https://www.selenium.dev/documentation/webdriver/getting_started/)
- [Java API Docs](https://www.selenium.dev/selenium/docs/api/java/)
- [Selenium Manager](https://www.selenium.dev/documentation/selenium_manager/)
- [Selenium Grid](https://www.selenium.dev/documentation/grid/)

## Support

- [Selenium Chat](https://www.selenium.dev/support/#ChatRoom)
- [GitHub Issues](https://github.com/SeleniumHQ/selenium/issues)

## Contributing

Contributions are welcome via [GitHub](https://github.com/SeleniumHQ/selenium/) pull requests.
See the [source code](https://github.com/SeleniumHQ/selenium/tree/trunk/java) for this binding.

## Links

- [Maven Central](https://central.sonatype.com/artifact/org.seleniumhq.selenium/selenium-java)
- [Documentation](https://www.selenium.dev/documentation/?tab=java)

## License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
