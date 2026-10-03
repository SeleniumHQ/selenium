package org.openqa.selenium.chrome;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.zip.ZipFile;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.Select;

class ChromeRecordingTest {

  @Test
public void canRecordTraceSession() throws Exception {
    String traceDirEnv = System.getenv("SELENIUM_TRACE_DIR");
    Path traceDir = traceDirEnv != null ? Paths.get(traceDirEnv) : Files.createTempDirectory("selenium-traces-");
    Files.createDirectories(traceDir);

    String testName = "canRecordTraceSession";
    String timestamp = Instant.now().toString().replace(":", "-").replace("T", "_").split("\\.")[0];
    Path tracePath = traceDir.resolve(testName + "_" + timestamp + ".zip");
    Files.deleteIfExists(tracePath);

    ChromeOptions options = new ChromeOptions();
    options.setRecord(tracePath.toAbsolutePath().toString());
    options.addArguments("--headless");

    ChromeDriver driver = new ChromeDriver(options);

    try {
      // 1. Navigate to Web form and fill it
      driver.get("https://bonigarcia.dev/selenium-webdriver-java/web-form.html");
      assertThat(driver.getCurrentUrl()).contains("web-form");
      driver.findElement(By.id("my-text-id")).sendKeys("Selenium 5");
      driver.findElement(By.name("my-password")).sendKeys("secret");
      driver.findElement(By.name("my-textarea")).sendKeys("Trace recording demo");
      new Select(driver.findElement(By.name("my-select"))).selectByVisibleText("Three");
      driver.executeScript(
          "arguments[0].click();", driver.findElement(By.id("my-check-1")));

      // 2. Navigate to login form
      driver.get("https://bonigarcia.dev/selenium-webdriver-java/login-form.html");
      assertThat(driver.getCurrentUrl()).contains("login-form");
      driver.findElement(By.id("username")).sendKeys("user");
      driver.findElement(By.id("password")).sendKeys("pass");
      driver.findElement(By.tagName("button")).click();

      // 3. Navigate to console logs page
      driver.get("https://bonigarcia.dev/selenium-webdriver-java/console-logs.html");
      assertThat(driver.getCurrentUrl()).contains("console-logs");

    } finally {
      driver.quit();
    }

    System.out.println("Trace saved to: " + tracePath.toAbsolutePath());

    assertThat(tracePath).exists();
    assertThat(tracePath.toFile().length()).isGreaterThan(0);
    try (ZipFile zf = new ZipFile(tracePath.toFile())) {
      assertThat(zf.getEntry("trace.trace")).isNotNull();
      assertThat(zf.getEntry("trace.network")).isNotNull();
    }
  }
}
